using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Application.Models;

namespace FlyAndStay.Application.Mapping;

public static class HotelFilterMappings
{
    public static HotelFilter ToFilter(this HotelSearchQuery query) => new()
    {
        City = string.IsNullOrWhiteSpace(query.City) ? null : query.City.Trim(),
        MinPrice = query.MinPrice,
        MaxPrice = query.MaxPrice,
        MinRating = query.MinRating,
        MaxDistance = query.MaxDistance,
        Guests = query.Guests,
        Stars = QueryParser.SplitList(query.Stars)
            .Select(s => int.TryParse(s, out var number) ? number : 0)
            .Where(number => number > 0)
            .ToList(),
        AmenityCodes = QueryParser.SplitList(query.Amenities),
        Sort = query.Sort switch
        {
            "price_asc" => HotelSort.PriceAscending,
            "price_desc" => HotelSort.PriceDescending,
            "rating" => HotelSort.Rating,
            "distance" => HotelSort.Distance,
            _ => HotelSort.Popular
        }
    };
}
