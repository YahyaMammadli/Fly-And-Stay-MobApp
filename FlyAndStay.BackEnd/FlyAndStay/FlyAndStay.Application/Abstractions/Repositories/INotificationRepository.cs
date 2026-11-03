using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface INotificationRepository
{
    Task AddAsync(Notification notification, CancellationToken ct);
    Task<List<Notification>> GetByUserAsync(Guid userId, int take, CancellationToken ct);
    Task<List<Notification>> GetUnreadByUserAsync(Guid userId, CancellationToken ct);
    Task<Notification?> GetOwnedAsync(Guid id, Guid userId, CancellationToken ct);
    Task<int> CountUnreadAsync(Guid userId, CancellationToken ct);
}
