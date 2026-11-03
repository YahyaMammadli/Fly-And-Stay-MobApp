using FlyAndStay.Application.Dtos.Notifications;

namespace FlyAndStay.Application.Abstractions.Services;

public interface INotificationService
{
    Task<List<NotificationDto>> GetAsync(Guid userId, CancellationToken ct);
    Task<UnreadCountResponse> GetUnreadCountAsync(Guid userId, CancellationToken ct);
    Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct);
    Task MarkAllReadAsync(Guid userId, CancellationToken ct);
}
