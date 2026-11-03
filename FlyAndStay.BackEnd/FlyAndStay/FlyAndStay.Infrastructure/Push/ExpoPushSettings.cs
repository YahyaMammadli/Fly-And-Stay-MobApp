using FlyAndStay.Application.Models;

namespace FlyAndStay.Infrastructure.Push;

public sealed class ExpoPushSettings
{
    public const string SectionName = "ExpoPush";

    public bool Enabled { get; set; } = true;
    public string SendUrl { get; set; } = "https://exp.host/--/api/v2/push/send";
    public string AccessToken { get; set; } = string.Empty;
}
