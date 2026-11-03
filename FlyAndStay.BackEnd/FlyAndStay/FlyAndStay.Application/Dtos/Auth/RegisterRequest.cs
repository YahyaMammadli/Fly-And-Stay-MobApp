using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Dtos.Auth;

public class RegisterRequest
{
    [Required, StringLength(60, MinimumLength = 1)] public string Name { get; set; } = string.Empty;
    [Required, EmailAddress, StringLength(254)] public string Email { get; set; } = string.Empty;
    [Required, StringLength(128, MinimumLength = 8)] public string Password { get; set; } = string.Empty;
}
