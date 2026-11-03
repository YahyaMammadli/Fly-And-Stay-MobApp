using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class FlightMappings
{
    public static FlightDto ToDto(this Flight flight)
    {
        var fare = Math.Round(flight.Price * 0.82m, 0, MidpointRounding.AwayFromZero);
        var taxes = flight.Price - fare;

        return new FlightDto(
            flight.Id,
            flight.FlightNumber,
            flight.Airline.ToDto(),
            flight.From.ToDto(),
            flight.To.ToDto(),
            flight.DepartureTime.ToLocalIso(),
            flight.ArrivalTime.ToLocalIso(),
            flight.DurationMinutes,
            flight.Stops,
            flight.Via,
            flight.Aircraft.Name,
            flight.Aircraft.Slug,
            flight.CheckedBagIncluded ? "1 carry-on + 1 checked bag" : "1 carry-on only",
            flight.CheckedBagIncluded,
            flight.MealIncluded,
            flight.FreeCancellationHours > 0 ? $"Free within {flight.FreeCancellationHours}h" : "Non-refundable",
            fare,
            taxes,
            flight.Price);
    }
}
