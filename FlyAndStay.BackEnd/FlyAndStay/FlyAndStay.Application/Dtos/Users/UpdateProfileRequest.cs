using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Dtos.Users;

public class UpdateProfileRequest
{
    [Required, StringLength(60, MinimumLength = 1)] public string Name { get; set; } = string.Empty;
}
