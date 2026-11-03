using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Application.Exceptions;

namespace FlyAndStay.Application.Services;

public sealed class AirlineService(IAirlineRepository airlines, IFlightRepository flights, TimeProvider clock) : IAirlineService
{
    public async Task<List<AirlineBrandDto>> GetAirlinesAsync(CancellationToken ct) =>
        (await airlines.GetAllWithFleetAsync(ct))
            .Select(a => new AirlineBrandDto(a.Slug, a.Code, a.Name, a.Color, a.Fleet.Sum(f => f.Count), a.Fleet.Count))
            .ToList();

    public async Task<List<AircraftModelDto>> GetAircraftAsync(string airlineSlug, CancellationToken ct)
    {
        var airline = await airlines.GetBySlugWithFleetAsync(airlineSlug, ct)
            ?? throw new NotFoundException("Airline not found.");

        var now = clock.GetLocalNow().DateTime;
        var upcoming = await flights.GetUpcomingCountsByAircraftAsync(airline.Id, now, ct);

        return airline.Fleet
            .OrderByDescending(f => f.Count)
            .Select(f => new AircraftModelDto(
                f.AircraftModel.Slug,
                f.AircraftModel.Name,
                f.AircraftModel.Manufacturer,
                f.AircraftModel.Seats,
                f.AircraftModel.RangeKm,
                f.AircraftModel.CruiseSpeedKmh,
                f.Count,
                upcoming.Where(u => u.AircraftModelId == f.AircraftModelId).Select(u => u.Count).FirstOrDefault()))
            .ToList();
    }
}
