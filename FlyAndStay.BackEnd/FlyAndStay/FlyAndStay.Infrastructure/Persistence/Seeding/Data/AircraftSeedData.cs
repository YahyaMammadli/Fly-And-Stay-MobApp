using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class AircraftSeedData
{
    public static List<AircraftModel> Create() =>
    [
        Model("boeing-737-800", "Boeing 737-800", "Boeing", 162, 5436, 842),
        Model("boeing-737-max-8", "Boeing 737 MAX 8", "Boeing", 172, 6570, 839),
        Model("airbus-a320neo", "Airbus A320neo", "Airbus", 180, 6500, 828),
        Model("airbus-a321neo", "Airbus A321neo", "Airbus", 206, 7400, 828),
        Model("embraer-190", "Embraer 190", "Embraer", 100, 4500, 823),
        Model("boeing-787-8", "Boeing 787-8 Dreamliner", "Boeing", 242, 13530, 903),
        Model("airbus-a330-300", "Airbus A330-300", "Airbus", 290, 11750, 871),
        Model("airbus-a350-900", "Airbus A350-900", "Airbus", 325, 15000, 903),
        Model("boeing-777-300er", "Boeing 777-300ER", "Boeing", 396, 13650, 905),
        Model("airbus-a380-800", "Airbus A380-800", "Airbus", 489, 15200, 900)
    ];

    private static AircraftModel Model(string slug, string name, string manufacturer, int seats, int range, int speed) => new()
    {
        Slug = slug,
        Name = name,
        Manufacturer = manufacturer,
        Seats = seats,
        RangeKm = range,
        CruiseSpeedKmh = speed
    };
}
