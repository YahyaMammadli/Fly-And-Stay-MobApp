using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions;

public interface ITokenService
{
    AccessToken CreateAccessToken(User user);
    string GenerateRefreshToken();
    string HashRefreshToken(string refreshToken);
}
