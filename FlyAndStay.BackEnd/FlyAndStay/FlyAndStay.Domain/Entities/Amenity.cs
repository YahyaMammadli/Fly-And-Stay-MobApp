namespace FlyAndStay.Domain.Entities;

public class Amenity
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "checkmark";

    public List<Hotel> Hotels { get; set; } = [];
}
