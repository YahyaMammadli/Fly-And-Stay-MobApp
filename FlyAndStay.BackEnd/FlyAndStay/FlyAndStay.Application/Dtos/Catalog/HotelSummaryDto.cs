namespace FlyAndStay.Application.Dtos.Catalog;

public record HotelSummaryDto(
    int Id,
    string Slug,
    string Name,
    string City,
    string District,
    decimal DistanceToCenterKm,
    int Stars,
    decimal Rating,
    int ReviewCount,
    decimal PricePerNight,
    string? ImageUrl,
    string CoverColor,
    string[] Amenities);
