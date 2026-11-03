using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IUserPhotoRepository
{
    Task<UserPhoto?> GetByUserIdAsync(Guid userId, CancellationToken ct);
    Task AddAsync(UserPhoto photo, CancellationToken ct);
    void Remove(UserPhoto photo);
}
