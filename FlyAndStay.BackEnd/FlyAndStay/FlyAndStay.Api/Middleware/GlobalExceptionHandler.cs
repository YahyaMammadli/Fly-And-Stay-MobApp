using FlyAndStay.Application.Dtos.Shared;
using FlyAndStay.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace FlyAndStay.Api.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, message) = exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, e.Message),
            BadRequestException e => (StatusCodes.Status400BadRequest, e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, e.Message),
            UnauthorizedAppException e => (StatusCodes.Status401Unauthorized, e.Message),
            ForbiddenException e => (StatusCodes.Status403Forbidden, e.Message),
            _ => (StatusCodes.Status500InternalServerError, "Something went wrong on the server.")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception on {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(new MessageResponse(message), cancellationToken);
        return true;
    }
}
