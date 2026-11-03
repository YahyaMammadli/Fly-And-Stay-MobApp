using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IAirlineRepository
{
    Task<List<Airline>> GetAllWithFleetAsync(CancellationToken ct);
    Task<Airline?> GetBySlugWithFleetAsync(string slug, CancellationToken ct);
}
