using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class AmenityRepository(ApplicationDbContext db) : IAmenityRepository
{
    public Task<List<Amenity>> GetAllAsync(CancellationToken ct) =>
        db.Amenities.AsNoTracking().OrderBy(a => a.Id).ToListAsync(ct);
}
