using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;
using Microsoft.Extensions.Logging;

namespace FlyAndStay.Infrastructure.Mail;

public sealed class LogEmailSender(ILogger<LogEmailSender> logger) : IEmailSender
{
    public Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        logger.LogWarning("SMTP is not configured. E-mail to {To} | {Subject}\n{Body}", message.To, message.Subject, message.HtmlBody);
        return Task.CompletedTask;
    }
}
