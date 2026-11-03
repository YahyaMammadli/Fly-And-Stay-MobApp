using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Admin;
using FlyAndStay.Application.Mapping;

namespace FlyAndStay.Application.Services;

public sealed class AdminService(IUserRepository users, IBookingRepository bookings) : IAdminService
{
    private const int RecentBookingsLimit = 200;

    public async Task<List<AdminUserDto>> GetUsersAsync(CancellationToken ct) =>
        (await users.GetAllWithBookingCountAsync(ct))
            .Select(s => new AdminUserDto(s.User.Id, s.User.Name, s.User.Email, s.User.Role.ToString(), s.User.CreatedAt, s.BookingsCount))
            .ToList();

    public async Task<List<AdminBookingDto>> GetBookingsAsync(CancellationToken ct) =>
        (await bookings.GetRecentDetailedAsync(RecentBookingsLimit, ct))
            .Select(b => new AdminBookingDto(b.ToDto(), b.User.Email))
            .ToList();
}
