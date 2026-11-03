using FlyAndStay.Application.Models;

namespace FlyAndStay.Application.Abstractions;

public interface IPasswordHasher
{
    HashedSecret Hash(string password);
    bool Verify(string password, byte[] salt, byte[] expectedHash, int iterations);
    void BurnTime(string password);
}
