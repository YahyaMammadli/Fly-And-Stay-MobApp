namespace FlyAndStay.Domain.Entities;

public class AircraftModel
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public int Seats { get; set; }
    public int RangeKm { get; set; }
    public int CruiseSpeedKmh { get; set; }
}
