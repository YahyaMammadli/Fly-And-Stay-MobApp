using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Route("api/hotels")]
public class HotelsController(IHotelService hotels) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<HotelSummaryDto>>> Search([FromQuery] HotelSearchQuery query, CancellationToken ct) =>
        Ok(await hotels.SearchAsync(query, ct));

    [HttpGet("amenities")]
    public async Task<ActionResult<List<AmenityDto>>> Amenities(CancellationToken ct) =>
        Ok(await hotels.GetAmenitiesAsync(ct));

    [HttpGet("{slug}")]
    public async Task<ActionResult<HotelDetailsDto>> Get(string slug, CancellationToken ct) =>
        Ok(await hotels.GetAsync(slug, ct));
}
