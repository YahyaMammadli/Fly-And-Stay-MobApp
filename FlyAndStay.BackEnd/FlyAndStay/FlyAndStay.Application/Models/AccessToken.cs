namespace FlyAndStay.Application.Models;

public sealed record AccessToken(string Value, DateTime ExpiresAt);
