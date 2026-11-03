using FlyAndStay.Domain.Enums;

namespace FlyAndStay.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;
    public RoomType Type { get; set; } = RoomType.Standard;
    public string Name { get; set; } = string.Empty;
    public int MaxGuests { get; set; }
    public string Beds { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
}
