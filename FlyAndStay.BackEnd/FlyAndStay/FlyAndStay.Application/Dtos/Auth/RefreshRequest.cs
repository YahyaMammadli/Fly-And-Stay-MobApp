using System.ComponentModel.DataAnnotations;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Dtos.Auth;

public class RefreshRequest
{
    [Required, StringLength(200)] public string RefreshToken { get; set; } = string.Empty;
}
