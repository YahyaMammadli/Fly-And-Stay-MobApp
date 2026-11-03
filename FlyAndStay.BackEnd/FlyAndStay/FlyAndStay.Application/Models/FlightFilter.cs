namespace FlyAndStay.Application.Models;

public sealed class FlightFilter
{
    public string FromCode { get; init; } = string.Empty;
    public string ToCode { get; init; } = string.Empty;
    public DateTime DayStart { get; init; }
    public DateTime DayEnd { get; init; }
    public DateTime? DepartAfter { get; init; }
    public IReadOnlyList<string> AirlineSlugs { get; init; } = [];
    public StopsFilter Stops { get; init; } = StopsFilter.Any;
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public IReadOnlyList<DepartureWindow> DepartureWindows { get; init; } = [];
    public bool CheckedBagOnly { get; init; }
    public string? AircraftSlug { get; init; }
    public FlightSort Sort { get; init; } = FlightSort.PriceAscending;
    public int Take { get; init; } = 200;
}
