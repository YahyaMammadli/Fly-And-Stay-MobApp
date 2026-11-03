using System.Text.Json.Serialization;

namespace FlyAndStay.Infrastructure.Push;

public sealed class ExpoPushMessage
{
    [JsonPropertyName("to")] public string To { get; set; } = string.Empty;
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("body")] public string Body { get; set; } = string.Empty;
    [JsonPropertyName("data")] public IReadOnlyDictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
    [JsonPropertyName("sound")] public string Sound { get; set; } = "default";
    [JsonPropertyName("channelId")] public string ChannelId { get; set; } = "default";
    [JsonPropertyName("priority")] public string Priority { get; set; } = "high";
}
