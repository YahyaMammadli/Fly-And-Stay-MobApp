using FlyAndStay.Application.Abstractions;
using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlyAndStay.Infrastructure.Persistence.Seeding;

public sealed class AdminSeeder(
    ApplicationDbContext db,
    IPasswordHasher hasher,
    IOptions<SeedSettings> options,
    TimeProvider clock)
{
    public async Task SeedAsync(CancellationToken ct)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.AdminEmail) || string.IsNullOrWhiteSpace(settings.AdminPassword))
            return;

        var email = settings.AdminEmail.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            return;

        var hashed = hasher.Hash(settings.AdminPassword);

        db.Users.Add(new User
        {
            Name = settings.AdminName,
            Email = email,
            Role = UserRole.Admin,
            PasswordHash = hashed.Hash,
            PasswordSalt = hashed.Salt,
            PasswordIterations = hashed.Iterations,
            CreatedAt = clock.GetUtcNow().UtcDateTime
        });

        await db.SaveChangesAsync(ct);
    }
}
