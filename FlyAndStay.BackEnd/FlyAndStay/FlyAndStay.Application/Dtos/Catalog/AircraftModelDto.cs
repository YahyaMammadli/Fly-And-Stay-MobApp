namespace FlyAndStay.Application.Dtos.Catalog;

public record AircraftModelDto(string Slug, string Name, string Manufacturer, int Seats, int RangeKm, int CruiseSpeedKmh, int FleetCount, int UpcomingFlights);
