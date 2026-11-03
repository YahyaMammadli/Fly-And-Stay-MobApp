namespace FlyAndStay.Domain.Entities;

public class Flight
{
    public int Id { get; set; }
    public string FlightNumber { get; set; } = string.Empty;

    public int AirlineId { get; set; }
    public Airline Airline { get; set; } = null!;
    public int AircraftModelId { get; set; }
    public AircraftModel Aircraft { get; set; } = null!;

    public string FromCode { get; set; } = string.Empty;
    public Airport From { get; set; } = null!;
    public string ToCode { get; set; } = string.Empty;
    public Airport To { get; set; } = null!;

    public DateTime DepartureTime { get; set; }
    public int DurationMinutes { get; set; }
    public int Stops { get; set; }
    public string? Via { get; set; }

    public decimal Price { get; set; }
    public bool CheckedBagIncluded { get; set; }
    public bool MealIncluded { get; set; }
    public int FreeCancellationHours { get; set; }

    public DateTime ArrivalTime => DepartureTime.AddMinutes(DurationMinutes);
}
