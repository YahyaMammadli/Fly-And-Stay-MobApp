using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdWithHotelAsync(int id, CancellationToken ct);
}
