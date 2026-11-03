namespace FlyAndStay.Infrastructure.Persistence.Seeding;

public sealed class SeedSettings
{
    public const string SectionName = "Seed";

    public string AdminName { get; set; } = "Administrator";
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
}
