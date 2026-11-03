using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class DeviceTokenRepository(ApplicationDbContext db) : IDeviceTokenRepository
{
    public Task<DeviceToken?> GetByTokenAsync(string token, CancellationToken ct) =>
        db.DeviceTokens.FirstOrDefaultAsync(t => t.Token == token, ct);

    public Task<List<DeviceToken>> GetByUserAsync(Guid userId, CancellationToken ct) =>
        db.DeviceTokens.Where(t => t.UserId == userId).ToListAsync(ct);

    public async Task AddAsync(DeviceToken deviceToken, CancellationToken ct)
    {
        await db.DeviceTokens.AddAsync(deviceToken, ct);
    }

    public void Remove(DeviceToken deviceToken) => db.DeviceTokens.Remove(deviceToken);

    public void RemoveRange(IEnumerable<DeviceToken> deviceTokens) => db.DeviceTokens.RemoveRange(deviceTokens);
}
