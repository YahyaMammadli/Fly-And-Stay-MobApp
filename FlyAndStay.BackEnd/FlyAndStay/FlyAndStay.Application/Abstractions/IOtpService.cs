using FlyAndStay.Application.Models;

namespace FlyAndStay.Application.Abstractions;

public interface IOtpService
{
    string GenerateCode();
    HashedSecret Hash(string code);
    bool Verify(string code, byte[] salt, byte[] expectedHash);
}
