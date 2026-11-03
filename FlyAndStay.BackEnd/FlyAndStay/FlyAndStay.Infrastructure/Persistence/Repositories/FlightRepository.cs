using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class FlightRepository(ApplicationDbContext db) : IFlightRepository
{
    private IQueryable<Flight> WithRelations() =>
        db.Flights.AsNoTracking()
            .Include(f => f.Airline)
            .Include(f => f.Aircraft)
            .Include(f => f.From)
            .Include(f => f.To);

    public async Task<List<Flight>> SearchAsync(FlightFilter filter, CancellationToken ct)
    {
        var fromCode = filter.FromCode;
        var toCode = filter.ToCode;
        var dayStart = filter.DayStart;
        var dayEnd = filter.DayEnd;

        IQueryable<Flight> query = WithRelations().Where(f =>
            f.FromCode == fromCode && f.ToCode == toCode && f.DepartureTime >= dayStart && f.DepartureTime < dayEnd);

        if (filter.DepartAfter is { } departAfter)
            query = query.Where(f => f.DepartureTime > departAfter);

        if (filter.AirlineSlugs.Count > 0)
        {
            var slugs = filter.AirlineSlugs.ToList();
            query = query.Where(f => slugs.Contains(f.Airline.Slug));
        }

        query = filter.Stops switch
        {
            StopsFilter.DirectOnly => query.Where(f => f.Stops == 0),
            StopsFilter.WithStops => query.Where(f => f.Stops > 0),
            _ => query
        };

        if (filter.MinPrice is { } minPrice)
            query = query.Where(f => f.Price >= minPrice);

        if (filter.MaxPrice is { } maxPrice)
            query = query.Where(f => f.Price <= maxPrice);

        if (filter.CheckedBagOnly)
            query = query.Where(f => f.CheckedBagIncluded);

        if (!string.IsNullOrEmpty(filter.AircraftSlug))
        {
            var aircraftSlug = filter.AircraftSlug;
            query = query.Where(f => f.Aircraft.Slug == aircraftSlug);
        }

        query = filter.Sort switch
        {
            FlightSort.PriceDescending => query.OrderByDescending(f => f.Price).ThenBy(f => f.DepartureTime),
            FlightSort.Departure => query.OrderBy(f => f.DepartureTime),
            FlightSort.Duration => query.OrderBy(f => f.DurationMinutes).ThenBy(f => f.Price),
            _ => query.OrderBy(f => f.Price).ThenBy(f => f.DepartureTime)
        };

        var flights = await query.Take(filter.Take).ToListAsync(ct);

        if (filter.DepartureWindows.Count == 0)
            return flights;

        return flights
            .Where(f => filter.DepartureWindows.Any(w => f.DepartureTime.Hour >= w.StartHour && f.DepartureTime.Hour < w.EndHour))
            .ToList();
    }

    public Task<Flight?> GetByIdAsync(int id, CancellationToken ct) =>
        WithRelations().FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task<List<DailyPrice>> GetDailyMinPricesAsync(
        string fromCode, string toCode, DateTime start, DateTime end, CancellationToken ct)
    {
        var rows = await db.Flights.AsNoTracking()
            .Where(f => f.FromCode == fromCode && f.ToCode == toCode && f.DepartureTime >= start && f.DepartureTime < end)
            .GroupBy(f => f.DepartureTime.Date)
            .Select(g => new { Day = g.Key, Min = g.Min(f => f.Price) })
            .ToListAsync(ct);

        return rows.Select(r => new DailyPrice(r.Day, r.Min)).ToList();
    }

    public async Task<List<DestinationPrice>> GetMinPricesFromAsync(string fromCode, DateTime after, CancellationToken ct)
    {
        var rows = await db.Flights.AsNoTracking()
            .Where(f => f.FromCode == fromCode && f.DepartureTime > after)
            .GroupBy(f => f.ToCode)
            .Select(g => new { Code = g.Key, Min = g.Min(f => f.Price) })
            .ToListAsync(ct);

        return rows.Select(r => new DestinationPrice(r.Code, r.Min)).ToList();
    }

    public async Task<List<AircraftFlightCount>> GetUpcomingCountsByAircraftAsync(int airlineId, DateTime after, CancellationToken ct)
    {
        var rows = await db.Flights.AsNoTracking()
            .Where(f => f.AirlineId == airlineId && f.DepartureTime > after)
            .GroupBy(f => f.AircraftModelId)
            .Select(g => new { ModelId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return rows.Select(r => new AircraftFlightCount(r.ModelId, r.Count)).ToList();
    }
}
