using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class AirlineRepository(ApplicationDbContext db) : IAirlineRepository
{
    private IQueryable<Airline> WithFleet() =>
        db.Airlines.AsNoTracking().Include(a => a.Fleet).ThenInclude(f => f.AircraftModel);

    public Task<List<Airline>> GetAllWithFleetAsync(CancellationToken ct) =>
        WithFleet().OrderBy(a => a.Name).ToListAsync(ct);

    public Task<Airline?> GetBySlugWithFleetAsync(string slug, CancellationToken ct) =>
        WithFleet().FirstOrDefaultAsync(a => a.Slug == slug, ct);
}
