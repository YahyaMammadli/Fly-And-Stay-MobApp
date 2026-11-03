using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlyAndStay.Infrastructure.Persistence.Repositories;

public sealed class UserPhotoRepository(ApplicationDbContext db) : IUserPhotoRepository
{
    public Task<UserPhoto?> GetByUserIdAsync(Guid userId, CancellationToken ct) =>
        db.UserPhotos.FirstOrDefaultAsync(p => p.UserId == userId, ct);

    public async Task AddAsync(UserPhoto photo, CancellationToken ct)
    {
        await db.UserPhotos.AddAsync(photo, ct);
    }

    public void Remove(UserPhoto photo) => db.UserPhotos.Remove(photo);
}
