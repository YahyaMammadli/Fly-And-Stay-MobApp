using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IAmenityRepository
{
    Task<List<Amenity>> GetAllAsync(CancellationToken ct);
}
