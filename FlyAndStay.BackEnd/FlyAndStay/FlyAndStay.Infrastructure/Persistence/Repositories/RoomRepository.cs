using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class RoomRepository(ApplicationDbContext db) : IRoomRepository
{
    public Task<Room?> GetByIdWithHotelAsync(int id, CancellationToken ct) =>
        db.Rooms.AsNoTracking().Include(r => r.Hotel).FirstOrDefaultAsync(r => r.Id == id, ct);
}
