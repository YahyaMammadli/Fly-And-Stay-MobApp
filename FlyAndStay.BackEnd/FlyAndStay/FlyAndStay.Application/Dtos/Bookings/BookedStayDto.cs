namespace FlyAndStay.Application.Dtos.Bookings;

public record BookedStayDto(
    string HotelSlug,
    string HotelName,
    string City,
    string RoomName,
    string CheckIn,
    string CheckOut,
    int Nights,
    decimal PricePerNight,
    string CoverColor,
    string Address,
    double Latitude,
    double Longitude);
