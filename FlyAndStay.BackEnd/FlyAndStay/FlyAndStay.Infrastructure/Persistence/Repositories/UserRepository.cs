using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct) =>
        db.Users.AnyAsync(u => u.Email == email, ct);

    public async Task AddAsync(User user, CancellationToken ct)
    {
        await db.Users.AddAsync(user, ct);
    }

    public async Task<List<UserBookingSummary>> GetAllWithBookingCountAsync(CancellationToken ct)
    {
        var rows = await db.Users.AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { User = u, Count = u.Bookings.Count })
            .ToListAsync(ct);

        return rows.Select(r => new UserBookingSummary(r.User, r.Count)).ToList();
    }
}
