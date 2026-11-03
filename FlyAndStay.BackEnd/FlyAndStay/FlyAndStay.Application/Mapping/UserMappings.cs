using FlyAndStay.Application.Dtos.Users;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class UserMappings
{
    public static UserDto ToDto(this User user) =>
        new(user.Id, user.Name, user.Email, user.Role.ToString(), user.HasPhoto, user.PhotoVersion);
}
