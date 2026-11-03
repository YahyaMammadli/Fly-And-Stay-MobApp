using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class AirportRepository(ApplicationDbContext db) : IAirportRepository
{
    public Task<List<Airport>> GetAllAsync(CancellationToken ct) =>
        db.Airports.AsNoTracking().OrderBy(a => a.City).ToListAsync(ct);
}
