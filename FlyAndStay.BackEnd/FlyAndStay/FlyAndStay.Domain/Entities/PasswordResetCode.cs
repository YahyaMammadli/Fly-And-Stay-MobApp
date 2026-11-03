namespace FlyAndStay.Domain.Entities;

public class PasswordResetCode
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public byte[] CodeHash { get; set; } = [];
    public byte[] CodeSalt { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; }
    public bool Used { get; set; }
}
