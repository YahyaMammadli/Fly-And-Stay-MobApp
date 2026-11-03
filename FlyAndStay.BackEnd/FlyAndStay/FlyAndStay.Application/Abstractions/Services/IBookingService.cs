using FlyAndStay.Application.Dtos.Bookings;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IBookingService
{
    Task<BookingDto> CreateAsync(Guid userId, CreateBookingRequest request, CancellationToken ct);
    Task<List<BookingDto>> GetMineAsync(Guid userId, CancellationToken ct);
    Task<BookingDto> GetAsync(Guid userId, Guid bookingId, CancellationToken ct);
    Task<BookingDto> CancelAsync(Guid userId, Guid bookingId, CancellationToken ct);
}
