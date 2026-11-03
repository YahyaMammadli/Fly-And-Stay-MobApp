using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Route("api")]
public class GeoController(IGeoService geo) : ControllerBase
{
    [HttpGet("airports")]
    public async Task<ActionResult<List<AirportDto>>> Airports(CancellationToken ct) =>
        Ok(await geo.GetAirportsAsync(ct));

    [HttpGet("destinations")]
    public async Task<ActionResult<List<DestinationDto>>> Destinations(CancellationToken ct) =>
        Ok(await geo.GetDestinationsAsync(ct));
}
