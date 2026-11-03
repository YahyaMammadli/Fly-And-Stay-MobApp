using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Dtos.Auth;

public class ForgotPasswordRequest
{
    [Required, EmailAddress, StringLength(254)] public string Email { get; set; } = string.Empty;
}
