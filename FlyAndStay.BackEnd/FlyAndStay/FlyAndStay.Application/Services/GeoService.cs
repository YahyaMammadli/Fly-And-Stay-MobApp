using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Application.Mapping;

namespace FlyAndStay.Application.Services;

public sealed class GeoService(IAirportRepository airports, IFlightRepository flights, TimeProvider clock) : IGeoService
{
    private const string HomeAirport = "GYD";

    public async Task<List<AirportDto>> GetAirportsAsync(CancellationToken ct) =>
        (await airports.GetAllAsync(ct)).Select(a => a.ToDto()).ToList();

    public async Task<List<DestinationDto>> GetDestinationsAsync(string? fromCode, CancellationToken ct)
    {
        var all = await airports.GetAllAsync(ct);
        var origin = all.FirstOrDefault(a => string.Equals(a.Code, fromCode?.Trim(), StringComparison.OrdinalIgnoreCase))?.Code ?? HomeAirport;

        var now = clock.GetLocalNow().DateTime;
        var prices = await flights.GetMinPricesFromAsync(origin, now, ct);

        return all
            .Where(a => a.Code != origin)
            .Select(a => new DestinationDto(
                a.City,
                a.Code,
                a.Name,
                a.Country,
                prices.Where(p => p.AirportCode == a.Code).Select(p => (decimal?)p.MinPrice).FirstOrDefault(),
                a.CoverColor,
                a.Icon,
                a.Latitude,
                a.Longitude))
            .OrderBy(d => d.FromPrice ?? decimal.MaxValue)
            .ToList();
    }
}
