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

    public async Task<List<DestinationDto>> GetDestinationsAsync(CancellationToken ct)
    {
        var now = clock.GetLocalNow().DateTime;
        var prices = await flights.GetMinPricesFromAsync(HomeAirport, now, ct);

        return (await airports.GetAllAsync(ct))
            .Where(a => a.Code != HomeAirport)
            .Select(a => new DestinationDto(
                a.City,
                a.Code,
                a.Name,
                a.Country,
                prices.Where(p => p.AirportCode == a.Code).Select(p => (decimal?)p.MinPrice).FirstOrDefault(),
                a.CoverColor,
                a.Icon))
            .OrderBy(d => d.FromPrice ?? decimal.MaxValue)
            .ToList();
    }
}
