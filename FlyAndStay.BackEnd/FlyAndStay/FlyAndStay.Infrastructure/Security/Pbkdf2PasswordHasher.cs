using System.Security.Cryptography;
using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;

namespace FlyAndStay.Infrastructure.Security;

public sealed class Pbkdf2PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int DefaultIterations = 600_000;

    private static readonly byte[] DummySalt = RandomNumberGenerator.GetBytes(SaltSize);
    private static readonly byte[] DummyHash = RandomNumberGenerator.GetBytes(HashSize);

    public HashedSecret Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, DefaultIterations, HashAlgorithmName.SHA256, HashSize);
        return new HashedSecret(hash, salt, DefaultIterations);
    }

    public bool Verify(string password, byte[] salt, byte[] expectedHash, int iterations)
    {
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedHash.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expectedHash);
    }

    public void BurnTime(string password) => Verify(password, DummySalt, DummyHash, DefaultIterations);
}
