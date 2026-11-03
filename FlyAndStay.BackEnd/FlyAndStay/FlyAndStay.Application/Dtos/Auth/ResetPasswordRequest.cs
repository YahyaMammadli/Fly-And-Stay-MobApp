using System.ComponentModel.DataAnnotations;
using FlyAndStay.Application.Validation;

namespace FlyAndStay.Application.Dtos.Auth;

public class ResetPasswordRequest
{
    [Required, EmailAddress, StringLength(254)] public string Email { get; set; } = string.Empty;
    [Required, StringLength(6, MinimumLength = 6)] public string Code { get; set; } = string.Empty;
    [Required, StringLength(128), StrongPassword] public string NewPassword { get; set; } = string.Empty;
}
