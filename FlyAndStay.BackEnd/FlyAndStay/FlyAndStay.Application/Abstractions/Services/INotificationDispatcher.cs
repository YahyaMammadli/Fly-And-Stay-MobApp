using FlyAndStay.Domain.Enums;

namespace FlyAndStay.Application.Abstractions.Services;

public interface INotificationDispatcher
{
    Task SendAsync(Guid userId, NotificationType type, string title, string body, Guid? bookingId, CancellationToken ct);
}
