using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Application.Models;

namespace FlyAndStay.Application.Mapping;

public static class FlightFilterMappings
{
    public static FlightFilter ToFilter(this FlightSearchQuery query, DateTime day, DateTime now)
    {
        var dayStart = day.Date;

        var windows = QueryParser.SplitList(query.Times)
            .Select(ToWindow)
            .OfType<DepartureWindow>()
            .ToList();

        return new FlightFilter
        {
            FromCode = query.From!.Trim().ToUpperInvariant(),
            ToCode = query.To!.Trim().ToUpperInvariant(),
            DayStart = dayStart,
            DayEnd = dayStart.AddDays(1),
            DepartAfter = dayStart == now.Date ? now : null,
            AirlineSlugs = QueryParser.SplitList(query.Airlines),
            Stops = query.Stops switch
            {
                "direct" => StopsFilter.DirectOnly,
                "1stop" => StopsFilter.WithStops,
                _ => StopsFilter.Any
            },
            MinPrice = query.MinPrice,
            MaxPrice = query.MaxPrice,
            DepartureWindows = windows,
            CheckedBagOnly = query.Baggage == true,
            AircraftSlug = string.IsNullOrWhiteSpace(query.Aircraft) ? null : query.Aircraft.Trim(),
            Sort = query.Sort switch
            {
                "price_desc" => FlightSort.PriceDescending,
                "departure" => FlightSort.Departure,
                "duration" => FlightSort.Duration,
                _ => FlightSort.PriceAscending
            }
        };
    }

    private static DepartureWindow? ToWindow(string name) => name switch
    {
        "night" => new DepartureWindow(0, 5),
        "morning" => new DepartureWindow(5, 12),
        "afternoon" => new DepartureWindow(12, 18),
        "evening" => new DepartureWindow(18, 24),
        _ => null
    };
}
