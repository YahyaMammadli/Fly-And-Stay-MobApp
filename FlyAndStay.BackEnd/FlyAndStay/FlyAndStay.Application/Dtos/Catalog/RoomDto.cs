namespace FlyAndStay.Application.Dtos.Catalog;

public record RoomDto(int Id, string Type, string Name, int MaxGuests, string Beds, decimal PricePerNight);
