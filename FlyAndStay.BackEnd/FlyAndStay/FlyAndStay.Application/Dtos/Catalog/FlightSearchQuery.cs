namespace FlyAndStay.Application.Dtos.Catalog;

public class FlightSearchQuery
{
    public string? From { get; set; }
    public string? To { get; set; }
    public string? Date { get; set; }
    public string? Airlines { get; set; }
    public string? Stops { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Times { get; set; }
    public bool? Baggage { get; set; }
    public string? Aircraft { get; set; }
    public string? Sort { get; set; }
}
