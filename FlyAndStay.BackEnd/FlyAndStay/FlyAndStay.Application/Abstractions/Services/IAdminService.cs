using FlyAndStay.Application.Dtos.Admin;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IAdminService
{
    Task<List<AdminUserDto>> GetUsersAsync(CancellationToken ct);
    Task<List<AdminBookingDto>> GetBookingsAsync(CancellationToken ct);
}
