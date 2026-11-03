using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;
using FlyAndStay.Application.Settings;
using FlyAndStay.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace FlyAndStay.Infrastructure.Security;

public sealed class JwtTokenService(IOptions<JwtSettings> options, TimeProvider clock) : ITokenService
{
    private readonly JwtSettings settings = options.Value;

    public AccessToken CreateAccessToken(User user)
    {
        var expires = clock.GetUtcNow().UtcDateTime.AddMinutes(settings.AccessTokenMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key));

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("sub", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("name", user.Name),
                new Claim("role", user.Role.ToString())
            }),
            Issuer = settings.Issuer,
            Audience = settings.Audience,
            Expires = expires,
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        };

        return new AccessToken(new JsonWebTokenHandler().CreateToken(descriptor), expires);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public string HashRefreshToken(string refreshToken) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken)));
}
