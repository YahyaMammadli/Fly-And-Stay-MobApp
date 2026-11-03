using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence;

public sealed class UnitOfWork(ApplicationDbContext db) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        try
        {
            return await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("The change conflicts with existing data.");
        }
    }
}
