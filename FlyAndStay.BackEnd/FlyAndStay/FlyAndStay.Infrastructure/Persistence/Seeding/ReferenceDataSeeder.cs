using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;
using FlyAndStay.Infrastructure.Persistence.Seeding.Data;
using FlyAndStay.Infrastructure.Persistence.Seeding.Models;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Seeding;

public sealed class ReferenceDataSeeder(ApplicationDbContext db)
{
    public async Task SeedAsync(CancellationToken ct)
    {
        if (await db.Airports.AnyAsync(ct))
        {
            await SyncCoordinatesAsync(ct);
            return;
        }

        var airlines = AirlineSeedData.Create();
        var aircraft = AircraftSeedData.Create();
        var amenities = AmenitySeedData.Create();

        db.Airports.AddRange(AirportSeedData.Create());
        db.Airlines.AddRange(airlines);
        db.AircraftModels.AddRange(aircraft);
        db.Amenities.AddRange(amenities);

        db.FleetEntries.AddRange(FleetSeedData.All.Select(f => new FleetEntry
        {
            Airline = airlines.First(a => a.Slug == f.AirlineSlug),
            AircraftModel = aircraft.First(m => m.Slug == f.AircraftSlug),
            Count = f.Count
        }));

        db.Hotels.AddRange(HotelSeedData.All.Select(seed => CreateHotel(seed, amenities)));

        await db.SaveChangesAsync(ct);
    }

    /// <summary>Databases seeded before coordinates existed get them filled in from the seed data.</summary>
    private async Task SyncCoordinatesAsync(CancellationToken ct)
    {
        var airportSeeds = AirportSeedData.Create().ToDictionary(a => a.Code);
        foreach (var airport in await db.Airports.ToListAsync(ct))
        {
            if (airportSeeds.TryGetValue(airport.Code.Trim(), out var seed))
            {
                airport.Latitude = seed.Latitude;
                airport.Longitude = seed.Longitude;
            }
        }

        var hotelSeeds = HotelSeedData.All.ToDictionary(h => h.Slug);
        foreach (var hotel in await db.Hotels.ToListAsync(ct))
        {
            if (hotelSeeds.TryGetValue(hotel.Slug, out var seed))
            {
                hotel.Latitude = seed.Latitude;
                hotel.Longitude = seed.Longitude;
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private static Hotel CreateHotel(HotelSeed seed, IReadOnlyList<Amenity> amenities)
    {
        var price = (decimal)seed.Price;
        var hotelAmenities = seed.Amenities.Select(code => amenities.First(a => a.Code == code)).ToList();
        var amenityNames = hotelAmenities.Select(a => a.Name.ToLowerInvariant());

        return new Hotel
        {
            Slug = seed.Slug,
            Name = seed.Name,
            City = seed.City,
            District = seed.District,
            Address = $"{seed.District}, {seed.City}",
            DistanceToCenterKm = seed.Distance,
            Latitude = seed.Latitude,
            Longitude = seed.Longitude,
            Stars = seed.Stars,
            Rating = seed.Rating,
            ReviewCount = seed.Reviews,
            CoverColor = seed.Color,
            Description =
                $"{seed.Name} is a {seed.Stars}-star hotel in {seed.District}, {seed.City}, {seed.Distance} km from the city center. " +
                $"Guests can enjoy: {string.Join(", ", amenityNames)}.",
            Amenities = hotelAmenities,
            Rooms =
            [
                new Room { Type = RoomType.Standard, Name = "Standard Room", MaxGuests = 2, Beds = "1 king bed or 2 twin beds", PricePerNight = price },
                new Room { Type = RoomType.Standard, Name = "Standard Family Room", MaxGuests = 3, Beds = "1 king bed + 1 single bed", PricePerNight = Math.Round(price * 1.15m, 0) },
                new Room { Type = RoomType.Deluxe, Name = "Deluxe Room", MaxGuests = 2, Beds = "1 king bed", PricePerNight = Math.Round(price * 1.32m, 0) },
                new Room { Type = RoomType.Suite, Name = "Executive Suite", MaxGuests = 4, Beds = "1 king bed + sofa bed", PricePerNight = Math.Round(price * 2.2m, 0) }
            ]
        };
    }
}
