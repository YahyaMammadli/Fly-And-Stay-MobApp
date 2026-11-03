namespace FlyAndStay.Domain.Entities;

public class Airline
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#1A66E8";
    public bool IsLowCost { get; set; }
    public int FreeCancellationHours { get; set; }

    public List<FleetEntry> Fleet { get; set; } = [];
}
