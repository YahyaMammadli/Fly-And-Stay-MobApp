using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Route("api/flights")]
public class FlightsController(IFlightService flights) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<List<FlightDto>>> Search([FromQuery] FlightSearchQuery query, CancellationToken ct) =>
        Ok(await flights.SearchAsync(query, ct));

    [HttpGet("calendar")]
    public async Task<ActionResult<List<CalendarDayDto>>> Calendar(
        [FromQuery(Name = "from")] string fromCode,
        [FromQuery(Name = "to")] string toCode,
        string start,
        int days = 7,
        CancellationToken ct = default) =>
        Ok(await flights.GetCalendarAsync(fromCode, toCode, start, days, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FlightDto>> Get(int id, CancellationToken ct) =>
        Ok(await flights.GetAsync(id, ct));
}
