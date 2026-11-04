namespace FlyAndStay.Domain.Entities;

public class Airport
{
    public string Code { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CoverColor { get; set; } = "#1A66E8";
    public string Icon { get; set; } = "airplane";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
