namespace FlyAndStay.Application.Settings;

public sealed class PasswordResetSettings
{
    public const string SectionName = "PasswordReset";

    public int CodeLifetimeMinutes { get; set; } = 10;
    public int MaxAttempts { get; set; } = 5;
    public int ResendCooldownSeconds { get; set; } = 60;
}
