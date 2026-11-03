using FlyAndStay.Api.Extensions;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Bookings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/bookings")]
public class BookingsController(IBookingService bookings) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BookingDto>>> Mine(CancellationToken ct) =>
        Ok(await bookings.GetMineAsync(User.GetUserId(), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookingDto>> Get(Guid id, CancellationToken ct) =>
        Ok(await bookings.GetAsync(User.GetUserId(), id, ct));

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingRequest request, CancellationToken ct)
    {
        var booking = await bookings.CreateAsync(User.GetUserId(), request, ct);
        return StatusCode(StatusCodes.Status201Created, booking);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<BookingDto>> Cancel(Guid id, CancellationToken ct) =>
        Ok(await bookings.CancelAsync(User.GetUserId(), id, ct));
}
