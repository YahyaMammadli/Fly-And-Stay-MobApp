using System.Text.Json.Serialization;

namespace FlyAndStay.Infrastructure.Push;

public sealed class ExpoPushResponse
{
    [JsonPropertyName("data")] public List<ExpoPushTicket> Data { get; set; } = [];
}
