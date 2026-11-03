using FlyAndStay.Domain.Entities;
using FlyAndStay.Infrastructure.Persistence.Seeding.Data;
using FlyAndStay.Infrastructure.Persistence.Seeding.Models;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Seeding;

public sealed class FlightSeeder(ApplicationDbContext db, TimeProvider clock)
{
    private const int DaysAhead = 90;
    private const int RefillWhenBelowDays = 45;
    private const int BatchSize = 1500;
    private const int LongHaulMinutes = 600;
    private const int NarrowBodyMaxSeats = 210;

    public async Task SeedAsync(CancellationToken ct)
    {
        var today = clock.GetLocalNow().DateTime.Date;
        var last = await db.Flights.MaxAsync(f => (DateTime?)f.DepartureTime, ct);
        var lastDay = last?.Date ?? today.AddDays(-1);
        if (lastDay >= today.AddDays(RefillWhenBelowDays)) return;

        var startDay = lastDay < today ? today : lastDay.AddDays(1);
        var endDay = today.AddDays(DaysAhead);

        var airlines = await db.Airlines.AsNoTracking()
            .Include(a => a.Fleet).ThenInclude(f => f.AircraftModel)
            .ToDictionaryAsync(a => a.Code, ct);

        var routes = FlightRouteSeedData.All;
        var buffer = new List<Flight>();

        for (var day = startDay; day <= endDay; day = day.AddDays(1))
        {
            var daysOut = (day - today).Days;
            var leadFactor = 1 + Math.Max(0, 14 - daysOut) * 0.012;
            var weekendFactor = day.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday or DayOfWeek.Sunday ? 1.06 : 1.0;

            for (var routeIndex = 0; routeIndex < routes.Count; routeIndex++)
            {
                var route = routes[routeIndex];
                for (var slotIndex = 0; slotIndex < route.Slots.Count; slotIndex++)
                {
                    var random = new Random((day.Year * 1000 + day.DayOfYear) * 31 + routeIndex * 7 + slotIndex);
                    buffer.Add(CreateFlight(route, route.Slots[slotIndex], slotIndex, day, airlines, random, leadFactor * weekendFactor));
                }
            }

            if (buffer.Count >= BatchSize)
                await FlushAsync(buffer, ct);
        }

        if (buffer.Count > 0)
            await FlushAsync(buffer, ct);
    }

    private static Flight CreateFlight(
        FlightRouteSeed route,
        FlightSlot slot,
        int slotIndex,
        DateTime day,
        IReadOnlyDictionary<string, Airline> airlines,
        Random random,
        double demandFactor)
    {
        var airline = airlines[slot.AirlineCode];
        var isLongHaul = slot.Minutes > LongHaulMinutes;

        var models = airline.Fleet.Select(f => f.AircraftModel).OrderBy(m => m.Id).ToList();
        var pool = models.Where(m => isLongHaul ? m.Seats > NarrowBodyMaxSeats : m.Seats <= NarrowBodyMaxSeats).ToList();
        if (pool.Count == 0) pool = models;
        var model = pool[(day.DayOfYear + slotIndex) % pool.Count];

        var departure = DateTime.SpecifyKind(day.Date.Add(TimeOnly.Parse(slot.Time).ToTimeSpan()), DateTimeKind.Unspecified);
        var noise = 0.96 + random.NextDouble() * 0.08;
        var price = Math.Round((decimal)(route.BasePrice * slot.Factor * demandFactor * noise), 0);

        return new Flight
        {
            FlightNumber = airline.Code + (100 + random.Next(0, 900)),
            AirlineId = airline.Id,
            AircraftModelId = model.Id,
            FromCode = route.From,
            ToCode = route.To,
            DepartureTime = departure,
            DurationMinutes = slot.Minutes,
            Stops = slot.Via is null ? 0 : 1,
            Via = slot.Via,
            Price = price,
            CheckedBagIncluded = !airline.IsLowCost,
            MealIncluded = !airline.IsLowCost,
            FreeCancellationHours = airline.FreeCancellationHours
        };
    }

    private async Task FlushAsync(List<Flight> buffer, CancellationToken ct)
    {
        db.Flights.AddRange(buffer);
        await db.SaveChangesAsync(ct);
        db.ChangeTracker.Clear();
        buffer.Clear();
    }
}
