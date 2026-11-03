using FlyAndStay.Domain.Enums;

namespace FlyAndStay.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Reference { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int? FlightId { get; set; }
    public Flight? Flight { get; set; }
    public int? RoomId { get; set; }
    public Room? Room { get; set; }

    public DateOnly? CheckIn { get; set; }
    public DateOnly? CheckOut { get; set; }
    public int Passengers { get; set; } = 1;
    public int Guests { get; set; } = 1;

    public decimal FlightTotal { get; set; }
    public decimal HotelTotal { get; set; }
    public decimal Total { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime CreatedAt { get; set; }
    public DateTime? ReminderSentAt { get; set; }

    public bool IsCancelled => Status == BookingStatus.Cancelled;
}
