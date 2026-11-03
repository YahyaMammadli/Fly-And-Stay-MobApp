namespace FlyAndStay.Infrastructure.Persistence.Seeding;

public sealed class DatabaseSeeder(
    ReferenceDataSeeder referenceData,
    FlightSeeder flights,
    AdminSeeder admin)
{
    public async Task SeedAsync(CancellationToken ct)
    {
        await referenceData.SeedAsync(ct);
        await flights.SeedAsync(ct);
        await admin.SeedAsync(ct);
    }
}
