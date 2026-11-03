using FlyAndStay.Application.Abstractions.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FlyAndStay.Infrastructure.Background;

public sealed class FlightReminderWorker(IServiceScopeFactory scopes, ILogger<FlightReminderWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                var reminders = scope.ServiceProvider.GetRequiredService<IFlightReminderService>();
                var sent = await reminders.SendDueRemindersAsync(stoppingToken);

                if (sent > 0)
                    logger.LogInformation("Sent {Count} flight reminders", sent);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Flight reminder run failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
