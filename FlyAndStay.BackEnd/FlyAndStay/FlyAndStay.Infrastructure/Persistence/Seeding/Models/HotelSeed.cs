namespace FlyAndStay.Infrastructure.Persistence.Seeding.Models;

public sealed record HotelSeed(
    string Slug,
    string Name,
    string City,
    string District,
    decimal Distance,
    int Stars,
    decimal Rating,
    int Reviews,
    int Price,
    string Color,
    string[] Amenities);
