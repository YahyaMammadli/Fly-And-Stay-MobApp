using FlyAndStay.Application.Dtos.Notifications;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class NotificationMappings
{
    public static NotificationDto ToDto(this Notification notification) => new(
        notification.Id,
        notification.Type.ToString(),
        notification.Title,
        notification.Body,
        notification.BookingId,
        DateTime.SpecifyKind(notification.CreatedAt, DateTimeKind.Utc),
        notification.IsRead);
}
