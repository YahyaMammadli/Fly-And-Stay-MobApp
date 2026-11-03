using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class BookingRepository(ApplicationDbContext db) : IBookingRepository
{
    private IQueryable<Booking> WithDetails() =>
        db.Bookings.AsNoTracking()
            .Include(b => b.Flight).ThenInclude(f => f!.Airline)
            .Include(b => b.Flight).ThenInclude(f => f!.Aircraft)
            .Include(b => b.Flight).ThenInclude(f => f!.From)
            .Include(b => b.Flight).ThenInclude(f => f!.To)
            .Include(b => b.Room).ThenInclude(r => r!.Hotel);

    public async Task AddAsync(Booking booking, CancellationToken ct)
    {
        await db.Bookings.AddAsync(booking, ct);
    }

    public Task<bool> ReferenceExistsAsync(string reference, CancellationToken ct) =>
        db.Bookings.AnyAsync(b => b.Reference == reference, ct);

    public Task<Booking?> GetOwnedAsync(Guid id, Guid userId, CancellationToken ct) =>
        db.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId, ct);

    public Task<Booking?> GetDetailedAsync(Guid id, CancellationToken ct) =>
        WithDetails().FirstOrDefaultAsync(b => b.Id == id, ct);

    public Task<Booking?> GetDetailedOwnedAsync(Guid id, Guid userId, CancellationToken ct) =>
        WithDetails().FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId, ct);

    public Task<List<Booking>> GetDetailedByUserAsync(Guid userId, CancellationToken ct) =>
        WithDetails().Where(b => b.UserId == userId).OrderByDescending(b => b.CreatedAt).ToListAsync(ct);

    public Task<List<Booking>> GetRecentDetailedAsync(int take, CancellationToken ct) =>
        WithDetails().Include(b => b.User).OrderByDescending(b => b.CreatedAt).Take(take).ToListAsync(ct);

    public Task<List<Booking>> GetDueForReminderAsync(DateTime from, DateTime to, CancellationToken ct) =>
        db.Bookings
            .Include(b => b.Flight).ThenInclude(f => f!.From)
            .Include(b => b.Flight).ThenInclude(f => f!.To)
            .Where(b => b.Status == BookingStatus.Confirmed
                && b.ReminderSentAt == null
                && b.Flight != null
                && b.Flight.DepartureTime > from
                && b.Flight.DepartureTime <= to)
            .ToListAsync(ct);
}
