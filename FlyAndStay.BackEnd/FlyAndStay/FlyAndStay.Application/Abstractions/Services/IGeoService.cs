using FlyAndStay.Application.Dtos.Catalog;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IGeoService
{
    Task<List<AirportDto>> GetAirportsAsync(CancellationToken ct);
    Task<List<DestinationDto>> GetDestinationsAsync(string? fromCode, CancellationToken ct);
}
