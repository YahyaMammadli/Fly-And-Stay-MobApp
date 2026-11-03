namespace FlyAndStay.Application.Dtos.Users;

public record UserDto(Guid Id, string Name, string Email, string Role, bool HasPhoto, int PhotoVersion);
