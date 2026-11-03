using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class PasswordResetCodeRepository(ApplicationDbContext db) : IPasswordResetCodeRepository
{
    public async Task AddAsync(PasswordResetCode code, CancellationToken ct)
    {
        await db.PasswordResetCodes.AddAsync(code, ct);
    }

    public Task<List<PasswordResetCode>> GetUnusedByUserAsync(Guid userId, CancellationToken ct) =>
        db.PasswordResetCodes.Where(c => c.UserId == userId && !c.Used).ToListAsync(ct);

    public Task<PasswordResetCode?> GetLatestUsableAsync(Guid userId, DateTime now, CancellationToken ct) =>
        db.PasswordResetCodes
            .Where(c => c.UserId == userId && !c.Used && c.ExpiresAt > now)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(ct);

    public Task<bool> AnyCreatedAfterAsync(Guid userId, DateTime since, CancellationToken ct) =>
        db.PasswordResetCodes.AnyAsync(c => c.UserId == userId && c.CreatedAt > since, ct);
}
