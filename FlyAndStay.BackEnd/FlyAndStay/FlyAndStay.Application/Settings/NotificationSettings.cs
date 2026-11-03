namespace FlyAndStay.Application.Settings;

public sealed class NotificationSettings
{
    public const string SectionName = "Notifications";

    public int FlightReminderHours { get; set; } = 24;
}
