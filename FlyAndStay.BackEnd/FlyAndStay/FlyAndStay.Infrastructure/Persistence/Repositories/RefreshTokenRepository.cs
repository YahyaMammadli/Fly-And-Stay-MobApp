using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class RefreshTokenRepository(ApplicationDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct) =>
        db.RefreshTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

    public async Task AddAsync(RefreshToken token, CancellationToken ct)
    {
        await db.RefreshTokens.AddAsync(token, ct);
    }

    public Task<List<RefreshToken>> GetActiveByUserAsync(Guid userId, CancellationToken ct) =>
        db.RefreshTokens.Where(t => t.UserId == userId && t.RevokedAt == null).ToListAsync(ct);

    public Task<List<RefreshToken>> GetExpiredByUserAsync(Guid userId, DateTime now, CancellationToken ct) =>
        db.RefreshTokens.Where(t => t.UserId == userId && t.ExpiresAt < now).ToListAsync(ct);

    public void RemoveRange(IEnumerable<RefreshToken> tokens) => db.RefreshTokens.RemoveRange(tokens);
}
