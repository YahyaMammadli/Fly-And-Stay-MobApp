using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Application.Mapping;

namespace FlyAndStay.Application.Services;

public sealed class FlightService(IFlightRepository flights, TimeProvider clock) : IFlightService
{
    public async Task<List<FlightDto>> SearchAsync(FlightSearchQuery query, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(query.From) || string.IsNullOrWhiteSpace(query.To))
            throw new BadRequestException("From and To are required.");
        if (!QueryParser.TryParseDate(query.Date, out var day))
            throw new BadRequestException("Date must look like 2026-11-06.");

        var filter = query.ToFilter(day, clock.GetLocalNow().DateTime);
        var found = await flights.SearchAsync(filter, ct);
        return found.Select(f => f.ToDto()).ToList();
    }

    public async Task<List<CalendarDayDto>> GetCalendarAsync(string fromCode, string toCode, string start, int days, CancellationToken ct)
    {
        if (!QueryParser.TryParseDate(start, out var startDay))
            throw new BadRequestException("Start must look like 2026-11-06.");

        days = Math.Clamp(days, 1, 14);
        var rangeStart = startDay.Date;

        var prices = await flights.GetDailyMinPricesAsync(
            fromCode.Trim().ToUpperInvariant(),
            toCode.Trim().ToUpperInvariant(),
            rangeStart,
            rangeStart.AddDays(days),
            ct);

        return Enumerable.Range(0, days)
            .Select(offset =>
            {
                var date = rangeStart.AddDays(offset);
                var min = prices.Where(p => p.Date == date).Select(p => (decimal?)p.MinPrice).FirstOrDefault();
                return new CalendarDayDto(date.ToIso(), min);
            })
            .ToList();
    }

    public async Task<FlightDto> GetAsync(int id, CancellationToken ct)
    {
        var flight = await flights.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Flight not found.");
        return flight.ToDto();
    }
}
