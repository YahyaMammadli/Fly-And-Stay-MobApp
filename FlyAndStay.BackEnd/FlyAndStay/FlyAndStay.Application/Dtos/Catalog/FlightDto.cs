using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Dtos.Catalog;

public record FlightDto(
    int Id,
    string FlightNumber,
    AirlineDto Airline,
    AirportDto From,
    AirportDto To,
    string DepartAt,
    string ArriveAt,
    int DurationMinutes,
    int Stops,
    string? Via,
    string Aircraft,
    string AircraftSlug,
    string Baggage,
    bool CheckedBagIncluded,
    bool MealIncluded,
    string Cancellation,
    decimal Fare,
    decimal Taxes,
    decimal Price);
