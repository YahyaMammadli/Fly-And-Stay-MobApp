using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Notifications;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Application.Mapping;

namespace FlyAndStay.Application.Services;

public sealed class NotificationService(
    INotificationRepository notifications,
    IUnitOfWork unitOfWork,
    TimeProvider clock) : INotificationService
{
    private const int HistoryLimit = 50;

    public async Task<List<NotificationDto>> GetAsync(Guid userId, CancellationToken ct) =>
        (await notifications.GetByUserAsync(userId, HistoryLimit, ct)).Select(n => n.ToDto()).ToList();

    public async Task<UnreadCountResponse> GetUnreadCountAsync(Guid userId, CancellationToken ct) =>
        new(await notifications.CountUnreadAsync(userId, ct));

    public async Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct)
    {
        var notification = await notifications.GetOwnedAsync(notificationId, userId, ct)
            ?? throw new NotFoundException("Notification not found.");

        if (notification.IsRead) return;

        notification.ReadAt = clock.GetUtcNow().UtcDateTime;
        await unitOfWork.SaveChangesAsync(ct);
    }

    public async Task MarkAllReadAsync(Guid userId, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        foreach (var notification in await notifications.GetUnreadByUserAsync(userId, ct))
            notification.ReadAt = now;

        await unitOfWork.SaveChangesAsync(ct);
    }
}
