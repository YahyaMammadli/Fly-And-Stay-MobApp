namespace FlyAndStay.Application.Abstractions.Services;

public interface IFlightReminderService
{
    Task<int> SendDueRemindersAsync(CancellationToken ct);
}
