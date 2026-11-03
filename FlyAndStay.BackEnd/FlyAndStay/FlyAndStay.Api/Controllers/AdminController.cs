using FlyAndStay.Api.Constants;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Authorize(Policy = PolicyNames.AdminOnly)]
[Route("api/admin")]
public class AdminController(IAdminService admin) : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> Users(CancellationToken ct) =>
        Ok(await admin.GetUsersAsync(ct));

    [HttpGet("bookings")]
    public async Task<ActionResult<List<AdminBookingDto>>> Bookings(CancellationToken ct) =>
        Ok(await admin.GetBookingsAsync(ct));
}
