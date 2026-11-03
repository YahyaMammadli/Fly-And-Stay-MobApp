using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace FlyAndStay.Application.Services;

public sealed class NotificationDispatcher(
    INotificationRepository notifications,
    IDeviceTokenRepository deviceTokens,
    IPushSender pushSender,
    IUnitOfWork unitOfWork,
    TimeProvider clock,
    ILogger<NotificationDispatcher> logger) : INotificationDispatcher
{
    public async Task SendAsync(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        Guid? bookingId,
        CancellationToken ct)
    {
        try
        {
            await notifications.AddAsync(new Notification
            {
                UserId = userId,
                Type = type,
                Title = title,
                Body = body,
                BookingId = bookingId,
                CreatedAt = clock.GetUtcNow().UtcDateTime
            }, ct);
            await unitOfWork.SaveChangesAsync(ct);

            await PushAsync(userId, type, title, body, bookingId, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Could not deliver the {Type} notification to user {UserId}", type, userId);
        }
    }

    private async Task PushAsync(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        Guid? bookingId,
        CancellationToken ct)
    {
        var tokens = await deviceTokens.GetByUserAsync(userId, ct);
        if (tokens.Count == 0) return;

        var data = new Dictionary<string, string>
        {
            ["type"] = type.ToString(),
            ["url"] = ResolveRoute(type)
        };
        if (bookingId is { } id) data["bookingId"] = id.ToString();

        var messages = tokens.Select(t => new PushMessage(t.Token, title, body, data)).ToList();
        var results = await pushSender.SendAsync(messages, ct);

        var invalid = results.Where(r => r.DeviceNotRegistered).Select(r => r.To).ToHashSet();
        if (invalid.Count == 0) return;

        deviceTokens.RemoveRange(tokens.Where(t => invalid.Contains(t.Token)));
        await unitOfWork.SaveChangesAsync(ct);
    }

    private static string ResolveRoute(NotificationType type) => type switch
    {
        NotificationType.BookingConfirmed => "/trips",
        NotificationType.BookingCancelled => "/trips",
        NotificationType.FlightReminder => "/trips",
        _ => "/notifications"
    };
}
