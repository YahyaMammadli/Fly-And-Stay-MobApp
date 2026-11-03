using FlyAndStay.Application.Dtos.Bookings;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Dtos.Admin;

public record AdminBookingDto(BookingDto Booking, string UserEmail);
