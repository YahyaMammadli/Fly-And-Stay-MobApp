using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Notifications;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;

namespace FlyAndStay.Application.Services;

public sealed class DeviceService(
    IDeviceTokenRepository deviceTokens,
    INotificationDispatcher dispatcher,
    IUnitOfWork unitOfWork,
    TimeProvider clock) : IDeviceService
{
    private static readonly string[] ValidPrefixes = ["ExponentPushToken[", "ExpoPushToken["];

    public async Task RegisterAsync(Guid userId, RegisterDeviceRequest request, CancellationToken ct)
    {
        var token = request.Token.Trim();
        if (!ValidPrefixes.Any(prefix => token.StartsWith(prefix, StringComparison.Ordinal)))
            throw new BadRequestException("This is not a valid Expo push token.");

        var now = clock.GetUtcNow().UtcDateTime;
        var existing = await deviceTokens.GetByTokenAsync(token, ct);

        if (existing is null)
        {
            await deviceTokens.AddAsync(new DeviceToken
            {
                UserId = userId,
                Token = token,
                Platform = request.Platform.Trim(),
                CreatedAt = now,
                LastUsedAt = now
            }, ct);
        }
        else
        {
            existing.UserId = userId;
            existing.Platform = request.Platform.Trim();
            existing.LastUsedAt = now;
        }

        await unitOfWork.SaveChangesAsync(ct);
    }

    public async Task UnregisterAsync(Guid userId, string token, CancellationToken ct)
    {
        var existing = await deviceTokens.GetByTokenAsync(token.Trim(), ct);
        if (existing is null || existing.UserId != userId) return;

        deviceTokens.Remove(existing);
        await unitOfWork.SaveChangesAsync(ct);
    }

    public Task SendTestAsync(Guid userId, CancellationToken ct) =>
        dispatcher.SendAsync(
            userId,
            NotificationType.Info,
            "Notifications are on",
            "This is a test notification from Fly&Stay.",
            null,
            ct);
}
