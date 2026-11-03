using FlyAndStay.Domain.Enums;

namespace FlyAndStay.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public byte[] PasswordHash { get; set; } = [];
    public byte[] PasswordSalt { get; set; } = [];
    public int PasswordIterations { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool HasPhoto { get; set; }
    public int PhotoVersion { get; set; }
    public DateTime CreatedAt { get; set; }

    public UserPhoto? Photo { get; set; }
    public List<Booking> Bookings { get; set; } = [];
    public List<RefreshToken> RefreshTokens { get; set; } = [];
}
