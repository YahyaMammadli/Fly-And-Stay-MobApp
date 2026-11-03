using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class NotificationRepository(ApplicationDbContext db) : INotificationRepository
{
    public async Task AddAsync(Notification notification, CancellationToken ct)
    {
        await db.Notifications.AddAsync(notification, ct);
    }

    public Task<List<Notification>> GetByUserAsync(Guid userId, int take, CancellationToken ct) =>
        db.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

    public Task<List<Notification>> GetUnreadByUserAsync(Guid userId, CancellationToken ct) =>
        db.Notifications.Where(n => n.UserId == userId && n.ReadAt == null).ToListAsync(ct);

    public Task<Notification?> GetOwnedAsync(Guid id, Guid userId, CancellationToken ct) =>
        db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, ct);

    public Task<int> CountUnreadAsync(Guid userId, CancellationToken ct) =>
        db.Notifications.CountAsync(n => n.UserId == userId && n.ReadAt == null, ct);
}
