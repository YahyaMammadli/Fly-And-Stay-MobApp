using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Users;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Application.Mapping;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Services;

public sealed class UserService(
    IUserRepository users,
    IUserPhotoRepository photos,
    IUnitOfWork unitOfWork,
    TimeProvider clock) : IUserService
{
    public async Task<UserDto> GetAsync(Guid userId, CancellationToken ct) =>
        (await FindUserAsync(userId, ct)).ToDto();

    public async Task<UserDto> UpdateNameAsync(Guid userId, string name, CancellationToken ct)
    {
        var user = await FindUserAsync(userId, ct);
        user.Name = name.Trim();
        await unitOfWork.SaveChangesAsync(ct);
        return user.ToDto();
    }

    public async Task<UserDto> UploadPhotoAsync(Guid userId, byte[] data, CancellationToken ct)
    {
        if (data.Length == 0)
            throw new BadRequestException("No file was uploaded.");
        if (data.Length > PhotoLimits.MaxBytes)
            throw new BadRequestException("The photo is too large (max 2 MB).");

        var contentType = ImageTypeDetector.Detect(data)
            ?? throw new BadRequestException("Only JPEG, PNG or WebP images are allowed.");

        var user = await FindUserAsync(userId, ct);
        var now = clock.GetUtcNow().UtcDateTime;
        var photo = await photos.GetByUserIdAsync(userId, ct);

        if (photo is null)
        {
            await photos.AddAsync(new UserPhoto
            {
                UserId = userId,
                Data = data,
                ContentType = contentType,
                UpdatedAt = now
            }, ct);
        }
        else
        {
            photo.Data = data;
            photo.ContentType = contentType;
            photo.UpdatedAt = now;
        }

        user.HasPhoto = true;
        user.PhotoVersion++;
        await unitOfWork.SaveChangesAsync(ct);
        return user.ToDto();
    }

    public async Task<PhotoResult> GetPhotoAsync(Guid userId, CancellationToken ct)
    {
        var photo = await photos.GetByUserIdAsync(userId, ct)
            ?? throw new NotFoundException("No photo.");
        return new PhotoResult(photo.Data, photo.ContentType);
    }

    public async Task<UserDto> DeletePhotoAsync(Guid userId, CancellationToken ct)
    {
        var user = await FindUserAsync(userId, ct);
        var photo = await photos.GetByUserIdAsync(userId, ct);

        if (photo is not null)
            photos.Remove(photo);

        user.HasPhoto = false;
        user.PhotoVersion++;
        await unitOfWork.SaveChangesAsync(ct);
        return user.ToDto();
    }

    private async Task<User> FindUserAsync(Guid userId, CancellationToken ct) =>
        await users.GetByIdAsync(userId, ct)
        ?? throw new UnauthorizedAppException("The account no longer exists.");
}
