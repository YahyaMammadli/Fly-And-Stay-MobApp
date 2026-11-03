using System.Globalization;
using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Settings;
using FlyAndStay.Domain.Enums;
using Microsoft.Extensions.Options;

namespace FlyAndStay.Application.Services;

public sealed class FlightReminderService(
    IBookingRepository bookings,
    INotificationDispatcher dispatcher,
    IUnitOfWork unitOfWork,
    IOptions<NotificationSettings> options,
    TimeProvider clock) : IFlightReminderService
{
    public async Task<int> SendDueRemindersAsync(CancellationToken ct)
    {
        var now = clock.GetLocalNow().DateTime;
        var until = now.AddHours(options.Value.FlightReminderHours);

        var due = await bookings.GetDueForReminderAsync(now, until, ct);

        foreach (var booking in due)
        {
            var flight = booking.Flight!;

            booking.ReminderSentAt = clock.GetUtcNow().UtcDateTime;
            await unitOfWork.SaveChangesAsync(ct);

            var time = flight.DepartureTime.ToString("HH:mm", CultureInfo.InvariantCulture);
            var date = flight.DepartureTime.ToString("MMM d", CultureInfo.InvariantCulture);

            await dispatcher.SendAsync(
                booking.UserId,
                NotificationType.FlightReminder,
                $"Flight {flight.FlightNumber} departs soon",
                $"{flight.From.City} to {flight.To.City}, {date} at {time}",
                booking.Id,
                ct);
        }

        return due.Count;
    }
}
