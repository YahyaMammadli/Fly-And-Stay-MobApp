using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class AirportSeedData
{
    public static List<Airport> Create() =>
    [
        new Airport { Code = "GYD", City = "Baku", Country = "Azerbaijan", Name = "Heydar Aliyev Intl", CoverColor = "#1F8A70", Icon = "sunny", Latitude = 40.4675, Longitude = 50.0467 },
        new Airport { Code = "IST", City = "Istanbul", Country = "Türkiye", Name = "Istanbul Airport", CoverColor = "#C9855B", Icon = "boat", Latitude = 41.2753, Longitude = 28.7519 },
        new Airport { Code = "DXB", City = "Dubai", Country = "UAE", Name = "Dubai Intl", CoverColor = "#5B8DC9", Icon = "business", Latitude = 25.2532, Longitude = 55.3657 },
        new Airport { Code = "JFK", City = "New York", Country = "USA", Name = "John F. Kennedy Intl", CoverColor = "#7C6BC9", Icon = "partly-sunny", Latitude = 40.6413, Longitude = -73.7781 },
        new Airport { Code = "LHR", City = "London", Country = "United Kingdom", Name = "Heathrow", CoverColor = "#C95B7C", Icon = "rainy", Latitude = 51.47, Longitude = -0.4543 }
    ];
}
