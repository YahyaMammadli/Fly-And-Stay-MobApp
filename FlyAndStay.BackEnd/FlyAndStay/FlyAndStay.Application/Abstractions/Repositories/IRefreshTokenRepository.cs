using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct);
    Task AddAsync(RefreshToken token, CancellationToken ct);
    Task<List<RefreshToken>> GetActiveByUserAsync(Guid userId, CancellationToken ct);
    Task<List<RefreshToken>> GetExpiredByUserAsync(Guid userId, DateTime now, CancellationToken ct);
    void RemoveRange(IEnumerable<RefreshToken> tokens);
}
