using FlyAndStay.Application.Dtos.Catalog;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IFlightService
{
    Task<List<FlightDto>> SearchAsync(FlightSearchQuery query, CancellationToken ct);
    Task<List<CalendarDayDto>> GetCalendarAsync(string fromCode, string toCode, string start, int days, CancellationToken ct);
    Task<FlightDto> GetAsync(int id, CancellationToken ct);
}
