using FlyAndStay.Infrastructure.Persistence.Seeding.Models;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class FleetSeedData
{
    public static IReadOnlyList<FleetSeed> All { get; } =
    [
        new("turkish-airlines", "boeing-737-800", 60),
        new("turkish-airlines", "airbus-a321neo", 50),
        new("turkish-airlines", "airbus-a330-300", 30),
        new("turkish-airlines", "boeing-777-300er", 10),
        new("turkish-airlines", "airbus-a350-900", 10),
        new("azerbaijan-airlines", "airbus-a320neo", 6),
        new("azerbaijan-airlines", "boeing-787-8", 5),
        new("azerbaijan-airlines", "embraer-190", 8),
        new("pegasus-airlines", "boeing-737-800", 20),
        new("pegasus-airlines", "airbus-a320neo", 40),
        new("pegasus-airlines", "airbus-a321neo", 20),
        new("emirates", "airbus-a380-800", 116),
        new("emirates", "boeing-777-300er", 130),
        new("emirates", "airbus-a350-900", 12),
        new("flydubai", "boeing-737-800", 50),
        new("flydubai", "boeing-737-max-8", 30),
        new("british-airways", "airbus-a320neo", 30),
        new("british-airways", "boeing-787-8", 12),
        new("british-airways", "boeing-777-300er", 12)
    ];
}
