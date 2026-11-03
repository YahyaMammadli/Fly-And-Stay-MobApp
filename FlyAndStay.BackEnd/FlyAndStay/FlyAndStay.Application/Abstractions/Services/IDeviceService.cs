using FlyAndStay.Application.Dtos.Notifications;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IDeviceService
{
    Task RegisterAsync(Guid userId, RegisterDeviceRequest request, CancellationToken ct);
    Task UnregisterAsync(Guid userId, string token, CancellationToken ct);
    Task SendTestAsync(Guid userId, CancellationToken ct);
}
