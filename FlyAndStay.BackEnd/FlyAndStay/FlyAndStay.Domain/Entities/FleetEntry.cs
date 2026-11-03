namespace FlyAndStay.Domain.Entities;

public class FleetEntry
{
    public int AirlineId { get; set; }
    public Airline Airline { get; set; } = null!;
    public int AircraftModelId { get; set; }
    public AircraftModel AircraftModel { get; set; } = null!;
    public int Count { get; set; }
}
