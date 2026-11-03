namespace FlyAndStay.Application.Dtos.Admin;

public record AdminUserDto(Guid Id, string Name, string Email, string Role, DateTime CreatedAt, int BookingsCount);
