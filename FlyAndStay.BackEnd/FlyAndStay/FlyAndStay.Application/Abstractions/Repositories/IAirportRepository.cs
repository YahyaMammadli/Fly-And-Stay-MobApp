using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IAirportRepository
{
    Task<List<Airport>> GetAllAsync(CancellationToken ct);
}
