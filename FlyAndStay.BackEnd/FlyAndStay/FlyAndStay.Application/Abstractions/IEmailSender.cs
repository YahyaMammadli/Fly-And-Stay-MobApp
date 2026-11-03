using FlyAndStay.Application.Models;

namespace FlyAndStay.Application.Abstractions;

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken ct = default);
}
