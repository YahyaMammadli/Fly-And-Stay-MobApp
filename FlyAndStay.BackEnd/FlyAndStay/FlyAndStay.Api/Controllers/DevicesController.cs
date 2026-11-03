using FlyAndStay.Api.Extensions;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/devices")]
public class DevicesController(IDeviceService devices) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Register(RegisterDeviceRequest request, CancellationToken ct)
    {
        await devices.RegisterAsync(User.GetUserId(), request, ct);
        return NoContent();
    }

    [HttpPost("unregister")]
    public async Task<IActionResult> Unregister(UnregisterDeviceRequest request, CancellationToken ct)
    {
        await devices.UnregisterAsync(User.GetUserId(), request.Token, ct);
        return NoContent();
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTest(CancellationToken ct)
    {
        await devices.SendTestAsync(User.GetUserId(), ct);
        return NoContent();
    }
}
