using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class AmenitySeedData
{
    public static List<Amenity> Create() =>
    [
        new Amenity { Code = "wifi", Name = "Free WiFi", Icon = "wifi" },
        new Amenity { Code = "pool", Name = "Pool", Icon = "water" },
        new Amenity { Code = "gym", Name = "Gym", Icon = "barbell" },
        new Amenity { Code = "restaurant", Name = "Restaurant", Icon = "restaurant" },
        new Amenity { Code = "parking", Name = "Parking", Icon = "car" },
        new Amenity { Code = "spa", Name = "Spa", Icon = "flower" },
        new Amenity { Code = "breakfast", Name = "Breakfast", Icon = "cafe" },
        new Amenity { Code = "shuttle", Name = "Airport shuttle", Icon = "bus" }
    ];
}
