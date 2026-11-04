namespace FlyAndStay.Domain.Entities;

public class Hotel
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal DistanceToCenterKm { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int Stars { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string CoverColor { get; set; } = "#1A66E8";

    public List<Room> Rooms { get; set; } = [];
    public List<Amenity> Amenities { get; set; } = [];
}
