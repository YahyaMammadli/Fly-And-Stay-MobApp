using FlyAndStay.Application.Dtos.Users;
using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Dtos.Auth;

public record AuthResponse(string AccessToken, string RefreshToken, DateTime AccessTokenExpiresAt, UserDto User);
