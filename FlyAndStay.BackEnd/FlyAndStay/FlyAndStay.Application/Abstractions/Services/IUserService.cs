using FlyAndStay.Application.Dtos.Users;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IUserService
{
    Task<UserDto> GetAsync(Guid userId, CancellationToken ct);
    Task<UserDto> UpdateNameAsync(Guid userId, string name, CancellationToken ct);
    Task<UserDto> UploadPhotoAsync(Guid userId, byte[] data, CancellationToken ct);
    Task<PhotoResult> GetPhotoAsync(Guid userId, CancellationToken ct);
    Task<UserDto> DeletePhotoAsync(Guid userId, CancellationToken ct);
}
