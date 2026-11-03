namespace FlyAndStay.Application.Dtos.Notifications;

public record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Body,
    Guid? BookingId,
    DateTime CreatedAt,
    bool IsRead);
