using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IDeviceTokenRepository
{
    Task<DeviceToken?> GetByTokenAsync(string token, CancellationToken ct);
    Task<List<DeviceToken>> GetByUserAsync(Guid userId, CancellationToken ct);
    Task AddAsync(DeviceToken deviceToken, CancellationToken ct);
    void Remove(DeviceToken deviceToken);
    void RemoveRange(IEnumerable<DeviceToken> deviceTokens);
}
