using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Dtos.Notifications;

public class RegisterDeviceRequest
{
    [Required, StringLength(200)] public string Token { get; set; } = string.Empty;
    [StringLength(20)] public string Platform { get; set; } = string.Empty;
}
