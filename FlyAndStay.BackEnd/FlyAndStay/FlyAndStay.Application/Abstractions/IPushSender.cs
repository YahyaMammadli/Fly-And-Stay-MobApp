using FlyAndStay.Application.Models;

namespace FlyAndStay.Application.Abstractions;

public interface IPushSender
{
    Task<List<PushDeliveryResult>> SendAsync(IReadOnlyList<PushMessage> messages, CancellationToken ct);
}
