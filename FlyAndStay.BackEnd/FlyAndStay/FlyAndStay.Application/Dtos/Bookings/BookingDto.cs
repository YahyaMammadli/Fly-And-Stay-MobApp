using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Dtos.Bookings;

public record BookingDto(
    Guid Id,
    string Reference,
    string Status,
    DateTime CreatedAt,
    int Passengers,
    int Guests,
    FlightDto? Flight,
    BookedStayDto? Stay,
    decimal FlightTotal,
    decimal HotelTotal,
    decimal Total,
    string StartDate,
    string EndDate);
