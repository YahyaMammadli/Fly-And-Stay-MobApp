using FlyAndStay.Application.Dtos.Catalog;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IAirlineService
{
    Task<List<AirlineBrandDto>> GetAirlinesAsync(CancellationToken ct);
    Task<List<AircraftModelDto>> GetAircraftAsync(string airlineSlug, CancellationToken ct);
}
