using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Bookings;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class BookingMappings
{
    public static BookingDto ToDto(this Booking booking)
    {
        BookedStayDto? stay = null;
        if (booking.Room is not null && booking.CheckIn is not null && booking.CheckOut is not null)
        {
            var nights = booking.CheckOut.Value.DayNumber - booking.CheckIn.Value.DayNumber;
            stay = new BookedStayDto(
                booking.Room.Hotel.Slug,
                booking.Room.Hotel.Name,
                booking.Room.Hotel.City,
                booking.Room.Name,
                booking.CheckIn.Value.ToIso(),
                booking.CheckOut.Value.ToIso(),
                nights,
                booking.Room.PricePerNight,
                booking.Room.Hotel.CoverColor,
                booking.Room.Hotel.Address,
                booking.Room.Hotel.Latitude,
                booking.Room.Hotel.Longitude);
        }

        var flight = booking.Flight?.ToDto();
        var start = flight is not null ? flight.DepartAt[..10] : booking.CheckIn!.Value.ToIso();
        var end = stay is not null ? stay.CheckOut : flight!.ArriveAt[..10];

        return new BookingDto(
            booking.Id,
            booking.Reference,
            booking.Status.ToString(),
            booking.CreatedAt,
            booking.Passengers,
            booking.Guests,
            flight,
            stay,
            booking.FlightTotal,
            booking.HotelTotal,
            booking.Total,
            start,
            end);
    }
}
