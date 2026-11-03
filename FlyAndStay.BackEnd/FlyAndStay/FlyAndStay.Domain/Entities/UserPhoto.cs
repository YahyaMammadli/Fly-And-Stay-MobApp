namespace FlyAndStay.Domain.Entities;

public class UserPhoto
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public byte[] Data { get; set; } = [];
    public string ContentType { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
