using System.Text.Json.Serialization;

namespace FlyAndStay.Infrastructure.Push;

public sealed class ExpoPushTicketDetails
{
    [JsonPropertyName("error")] public string? Error { get; set; }
}
