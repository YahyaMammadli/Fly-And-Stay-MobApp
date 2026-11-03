using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;
using Microsoft.Extensions.Logging;

namespace FlyAndStay.Infrastructure.Push;

public sealed class LogPushSender(ILogger<LogPushSender> logger) : IPushSender
{
    public Task<List<PushDeliveryResult>> SendAsync(IReadOnlyList<PushMessage> messages, CancellationToken ct)
    {
        foreach (var message in messages)
            logger.LogWarning("Push disabled. Would send to {To}: {Title} - {Body}", message.To, message.Title, message.Body);

        return Task.FromResult(messages.Select(m => new PushDeliveryResult(m.To, false, false)).ToList());
    }
}
