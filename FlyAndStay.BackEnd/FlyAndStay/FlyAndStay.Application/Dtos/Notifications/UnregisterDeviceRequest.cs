using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Dtos.Notifications;

public class UnregisterDeviceRequest
{
    [Required, StringLength(200)] public string Token { get; set; } = string.Empty;
}
