using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IFlightRepository
{
    Task<List<Flight>> SearchAsync(FlightFilter filter, CancellationToken ct);
    Task<Flight?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<DailyPrice>> GetDailyMinPricesAsync(string fromCode, string toCode, DateTime start, DateTime end, CancellationToken ct);
    Task<List<DestinationPrice>> GetMinPricesFromAsync(string fromCode, DateTime after, CancellationToken ct);
    Task<List<AircraftFlightCount>> GetUpcomingCountsByAircraftAsync(int airlineId, DateTime after, CancellationToken ct);
}
