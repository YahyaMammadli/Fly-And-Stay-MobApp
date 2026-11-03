using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class HotelRepository(ApplicationDbContext db) : IHotelRepository
{
    public async Task<List<Hotel>> SearchAsync(HotelFilter filter, CancellationToken ct)
    {
        IQueryable<Hotel> query = db.Hotels.AsNoTracking();

        if (filter.City is not null)
        {
            var city = filter.City;
            query = query.Where(h => h.City == city);
        }

        if (filter.MinPrice is { } minPrice)
            query = query.Where(h => h.Rooms.Min(r => r.PricePerNight) >= minPrice);

        if (filter.MaxPrice is { } maxPrice)
            query = query.Where(h => h.Rooms.Min(r => r.PricePerNight) <= maxPrice);

        if (filter.MinRating is { } minRating)
            query = query.Where(h => h.Rating >= minRating);

        if (filter.MaxDistance is { } maxDistance)
            query = query.Where(h => h.DistanceToCenterKm <= maxDistance);

        if (filter.Guests is { } guests)
            query = query.Where(h => h.Rooms.Any(r => r.MaxGuests >= guests));

        if (filter.Stars.Count > 0)
        {
            var stars = filter.Stars.ToList();
            query = query.Where(h => stars.Contains(h.Stars));
        }

        foreach (var code in filter.AmenityCodes)
        {
            var amenityCode = code;
            query = query.Where(h => h.Amenities.Any(a => a.Code == amenityCode));
        }

        query = filter.Sort switch
        {
            HotelSort.PriceAscending => query.OrderBy(h => h.Rooms.Min(r => r.PricePerNight)),
            HotelSort.PriceDescending => query.OrderByDescending(h => h.Rooms.Min(r => r.PricePerNight)),
            HotelSort.Rating => query.OrderByDescending(h => h.Rating).ThenByDescending(h => h.ReviewCount),
            HotelSort.Distance => query.OrderBy(h => h.DistanceToCenterKm),
            _ => query.OrderByDescending(h => h.ReviewCount)
        };

        return await query
            .Include(h => h.Rooms)
            .Include(h => h.Amenities)
            .Take(filter.Take)
            .ToListAsync(ct);
    }

    public Task<Hotel?> GetBySlugAsync(string slug, CancellationToken ct) =>
        db.Hotels.AsNoTracking()
            .Include(h => h.Rooms)
            .Include(h => h.Amenities)
            .FirstOrDefaultAsync(h => h.Slug == slug, ct);
}
