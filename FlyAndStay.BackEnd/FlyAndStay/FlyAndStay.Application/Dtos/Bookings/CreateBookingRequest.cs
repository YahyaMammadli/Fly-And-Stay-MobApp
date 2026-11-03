using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Dtos.Bookings;

public class CreateBookingRequest
{
    public int? FlightId { get; set; }
    public int? RoomId { get; set; }
    public DateOnly? CheckIn { get; set; }
    public DateOnly? CheckOut { get; set; }
    [Range(1, 9)] public int Passengers { get; set; } = 1;
    [Range(1, 9)] public int Guests { get; set; } = 1;
}
