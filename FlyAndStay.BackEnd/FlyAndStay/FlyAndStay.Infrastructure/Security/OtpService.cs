using System.Security.Cryptography;
using System.Text;
using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;

namespace FlyAndStay.Infrastructure.Security;

public sealed class OtpService : IOtpService
{
    public string GenerateCode() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    public HashedSecret Hash(string code)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        using var hmac = new HMACSHA256(salt);
        return new HashedSecret(hmac.ComputeHash(Encoding.UTF8.GetBytes(code)), salt, 0);
    }

    public bool Verify(string code, byte[] salt, byte[] expectedHash)
    {
        using var hmac = new HMACSHA256(salt);
        var actual = hmac.ComputeHash(Encoding.UTF8.GetBytes(code));
        return CryptographicOperations.FixedTimeEquals(actual, expectedHash);
    }
}
