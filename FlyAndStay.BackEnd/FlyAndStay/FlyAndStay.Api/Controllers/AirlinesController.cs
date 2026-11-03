using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Route("api/airlines")]
public class AirlinesController(IAirlineService airlines) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AirlineBrandDto>>> List(CancellationToken ct) =>
        Ok(await airlines.GetAirlinesAsync(ct));

    [HttpGet("{slug}/aircraft")]
    public async Task<ActionResult<List<AircraftModelDto>>> Aircraft(string slug, CancellationToken ct) =>
        Ok(await airlines.GetAircraftAsync(slug, ct));
}
