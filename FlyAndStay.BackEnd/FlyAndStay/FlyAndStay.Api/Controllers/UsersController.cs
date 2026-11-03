using FlyAndStay.Api.Extensions;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Users;
using FlyAndStay.Application.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users/me")]
public class UsersController(IUserService users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct) =>
        Ok(await users.GetAsync(User.GetUserId(), ct));

    [HttpPut]
    public async Task<ActionResult<UserDto>> Update(UpdateProfileRequest request, CancellationToken ct) =>
        Ok(await users.UpdateNameAsync(User.GetUserId(), request.Name, ct));

    [HttpPut("photo")]
    [RequestSizeLimit(3 * 1024 * 1024)]
    public async Task<ActionResult<UserDto>> UploadPhoto(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            throw new BadRequestException("No file was uploaded.");
        if (file.Length > PhotoLimits.MaxBytes)
            throw new BadRequestException("The photo is too large (max 2 MB).");

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, ct);
        return Ok(await users.UploadPhotoAsync(User.GetUserId(), stream.ToArray(), ct));
    }

    [HttpGet("photo")]
    public async Task<IActionResult> GetPhoto(CancellationToken ct)
    {
        var photo = await users.GetPhotoAsync(User.GetUserId(), ct);
        Response.Headers.CacheControl = "private, max-age=86400";
        return File(photo.Data, photo.ContentType);
    }

    [HttpDelete("photo")]
    public async Task<ActionResult<UserDto>> DeletePhoto(CancellationToken ct) =>
        Ok(await users.DeletePhotoAsync(User.GetUserId(), ct));
}
