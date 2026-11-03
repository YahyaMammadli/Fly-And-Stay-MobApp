using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace FlyAndStay.Infrastructure.Mail;

public sealed class SmtpEmailSender(IOptions<SmtpSettings> options) : IEmailSender
{
    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.Host))
            throw new InvalidOperationException("SMTP is not configured. Set Smtp:Host, Smtp:User and Smtp:Password.");

        var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
        mime.To.Add(MailboxAddress.Parse(message.To));
        mime.Subject = message.Subject;
        mime.Body = new BodyBuilder { HtmlBody = message.HtmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        var security = settings.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;
        await client.ConnectAsync(settings.Host, settings.Port, security, ct);
        if (!string.IsNullOrEmpty(settings.User))
            await client.AuthenticateAsync(settings.User, settings.Password, ct);
        await client.SendAsync(mime, ct);
        await client.DisconnectAsync(true, ct);
    }
}
