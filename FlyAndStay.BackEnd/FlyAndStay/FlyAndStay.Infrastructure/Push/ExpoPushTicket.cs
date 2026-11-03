using System.Text.Json.Serialization;

namespace FlyAndStay.Infrastructure.Push;

public sealed class ExpoPushTicket
{
    [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("message")] public string? Message { get; set; }
    [JsonPropertyName("details")] public ExpoPushTicketDetails? Details { get; set; }
}
