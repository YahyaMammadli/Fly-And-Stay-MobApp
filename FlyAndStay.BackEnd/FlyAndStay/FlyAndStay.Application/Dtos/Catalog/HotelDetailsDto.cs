namespace FlyAndStay.Application.Dtos.Catalog;

public record HotelDetailsDto(
    int Id,
    string Slug,
    string Name,
    string City,
    string District,
    string Address,
    decimal DistanceToCenterKm,
    int Stars,
    decimal Rating,
    int ReviewCount,
    string Description,
    string? ImageUrl,
    string CoverColor,
    AmenityDto[] Amenities,
    RoomDto[] Rooms);
