namespace FlyAndStay.Application.Models;

public sealed record PushMessage(string To, string Title, string Body, IReadOnlyDictionary<string, string> Data);
