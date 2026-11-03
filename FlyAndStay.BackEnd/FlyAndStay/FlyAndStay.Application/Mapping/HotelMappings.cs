using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class HotelMappings
{
    public static AmenityDto ToDto(this Amenity amenity) =>
        new(amenity.Code, amenity.Name, amenity.Icon);

    public static HotelSummaryDto ToSummary(this Hotel hotel) => new(
        hotel.Id,
        hotel.Slug,
        hotel.Name,
        hotel.City,
        hotel.District,
        hotel.DistanceToCenterKm,
        hotel.Stars,
        hotel.Rating,
        hotel.ReviewCount,
        hotel.Rooms.Count == 0 ? 0 : hotel.Rooms.Min(r => r.PricePerNight),
        hotel.ImageUrl,
        hotel.CoverColor,
        hotel.Amenities.Select(a => a.Code).ToArray());

    public static HotelDetailsDto ToDetails(this Hotel hotel) => new(
        hotel.Id,
        hotel.Slug,
        hotel.Name,
        hotel.City,
        hotel.District,
        hotel.Address,
        hotel.DistanceToCenterKm,
        hotel.Stars,
        hotel.Rating,
        hotel.ReviewCount,
        hotel.Description,
        hotel.ImageUrl,
        hotel.CoverColor,
        hotel.Amenities.OrderBy(a => a.Id).Select(a => a.ToDto()).ToArray(),
        hotel.Rooms.OrderBy(r => r.PricePerNight).Select(r => r.ToDto()).ToArray());
}
