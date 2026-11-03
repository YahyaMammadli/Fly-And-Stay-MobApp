using FlyAndStay.Api.Extensions;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController(INotificationService notifications) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> List(CancellationToken ct) =>
        Ok(await notifications.GetAsync(User.GetUserId(), ct));

    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountResponse>> UnreadCount(CancellationToken ct) =>
        Ok(await notifications.GetUnreadCountAsync(User.GetUserId(), ct));

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await notifications.MarkReadAsync(User.GetUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await notifications.MarkAllReadAsync(User.GetUserId(), ct);
        return NoContent();
    }
}
