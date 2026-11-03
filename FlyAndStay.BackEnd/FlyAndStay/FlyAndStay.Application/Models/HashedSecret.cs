namespace FlyAndStay.Application.Models;

public sealed record HashedSecret(byte[] Hash, byte[] Salt, int Iterations);
