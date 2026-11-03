using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IBookingRepository
{
    Task AddAsync(Booking booking, CancellationToken ct);
    Task<bool> ReferenceExistsAsync(string reference, CancellationToken ct);
    Task<Booking?> GetOwnedAsync(Guid id, Guid userId, CancellationToken ct);
    Task<Booking?> GetDetailedAsync(Guid id, CancellationToken ct);
    Task<Booking?> GetDetailedOwnedAsync(Guid id, Guid userId, CancellationToken ct);
    Task<List<Booking>> GetDetailedByUserAsync(Guid userId, CancellationToken ct);
    Task<List<Booking>> GetRecentDetailedAsync(int take, CancellationToken ct);
    Task<List<Booking>> GetDueForReminderAsync(DateTime from, DateTime to, CancellationToken ct);
}
