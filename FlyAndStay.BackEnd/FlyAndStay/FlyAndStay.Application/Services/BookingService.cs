using System.Security.Cryptography;
using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Bookings;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Application.Mapping;
using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;

namespace FlyAndStay.Application.Services;

public sealed class BookingService(
    IBookingRepository bookings,
    IFlightRepository flights,
    IRoomRepository rooms,
    IUnitOfWork unitOfWork,
    INotificationDispatcher notifier,
    TimeProvider clock) : IBookingService
{
    private const int MaxNights = 30;

    public async Task<BookingDto> CreateAsync(Guid userId, CreateBookingRequest request, CancellationToken ct)
    {
        if (request.FlightId is null && request.RoomId is null)
            throw new BadRequestException("Choose a flight, a hotel or both.");

        var localNow = clock.GetLocalNow().DateTime;
        var today = DateOnly.FromDateTime(localNow);

        Flight? flight = null;
        decimal flightTotal = 0;
        if (request.FlightId is int flightId)
        {
            flight = await flights.GetByIdAsync(flightId, ct)
                ?? throw new NotFoundException("Flight not found.");

            if (flight.DepartureTime <= localNow)
                throw new BadRequestException("This flight has already departed.");

            flightTotal = flight.Price * request.Passengers;
        }

        Room? room = null;
        decimal hotelTotal = 0;
        if (request.RoomId is int roomId)
        {
            room = await rooms.GetByIdWithHotelAsync(roomId, ct)
                ?? throw new NotFoundException("Room not found.");

            if (request.CheckIn is null || request.CheckOut is null)
                throw new BadRequestException("Check-in and check-out dates are required.");
            if (request.CheckIn.Value < today)
                throw new BadRequestException("Check-in cannot be in the past.");

            var nights = request.CheckOut.Value.DayNumber - request.CheckIn.Value.DayNumber;
            if (nights < 1 || nights > MaxNights)
                throw new BadRequestException($"A stay must be between 1 and {MaxNights} nights.");
            if (request.Guests > room.MaxGuests)
                throw new BadRequestException($"This room fits up to {room.MaxGuests} guests.");

            hotelTotal = room.PricePerNight * nights;
        }

        var booking = new Booking
        {
            Reference = await GenerateReferenceAsync(ct),
            UserId = userId,
            FlightId = flight?.Id,
            RoomId = room?.Id,
            CheckIn = room is null ? null : request.CheckIn,
            CheckOut = room is null ? null : request.CheckOut,
            Passengers = flight is null ? 1 : request.Passengers,
            Guests = room is null ? 1 : request.Guests,
            FlightTotal = flightTotal,
            HotelTotal = hotelTotal,
            Total = flightTotal + hotelTotal,
            Status = BookingStatus.Confirmed,
            CreatedAt = clock.GetUtcNow().UtcDateTime
        };

        await bookings.AddAsync(booking, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var saved = await bookings.GetDetailedAsync(booking.Id, ct)
            ?? throw new NotFoundException("Booking not found.");

        await notifier.SendAsync(
            userId,
            NotificationType.BookingConfirmed,
            "Booking confirmed",
            $"Reference {saved.Reference}, total ${saved.Total:0.##}",
            saved.Id,
            ct);

        return saved.ToDto();
    }

    public async Task<List<BookingDto>> GetMineAsync(Guid userId, CancellationToken ct) =>
        (await bookings.GetDetailedByUserAsync(userId, ct)).Select(b => b.ToDto()).ToList();

    public async Task<BookingDto> GetAsync(Guid userId, Guid bookingId, CancellationToken ct)
    {
        var booking = await bookings.GetDetailedOwnedAsync(bookingId, userId, ct)
            ?? throw new NotFoundException("Booking not found.");
        return booking.ToDto();
    }

    public async Task<BookingDto> CancelAsync(Guid userId, Guid bookingId, CancellationToken ct)
    {
        var booking = await bookings.GetOwnedAsync(bookingId, userId, ct)
            ?? throw new NotFoundException("Booking not found.");

        if (booking.IsCancelled)
            throw new BadRequestException("This booking is already cancelled.");

        booking.Status = BookingStatus.Cancelled;
        await unitOfWork.SaveChangesAsync(ct);

        await notifier.SendAsync(
            userId,
            NotificationType.BookingCancelled,
            "Booking cancelled",
            $"Booking {booking.Reference} was cancelled.",
            booking.Id,
            ct);

        return await GetAsync(userId, bookingId, ct);
    }

    private async Task<string> GenerateReferenceAsync(CancellationToken ct)
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var reference = "FX" + RandomNumberGenerator.GetInt32(0, 10_000_000).ToString("D7");
            if (!await bookings.ReferenceExistsAsync(reference, ct))
                return reference;
        }

        throw new ConflictException("Could not create a booking reference. Please try again.");
    }
}
