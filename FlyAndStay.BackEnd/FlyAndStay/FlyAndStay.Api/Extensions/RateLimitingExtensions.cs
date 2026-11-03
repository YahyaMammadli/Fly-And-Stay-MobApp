using System.Threading.RateLimiting;
using FlyAndStay.Api.Constants;
using Microsoft.AspNetCore.RateLimiting;

namespace FlyAndStay.Api.Extensions;

public static class RateLimitingExtensions
{
    private const int RequestsPerMinute = 20;

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(PolicyNames.AuthRateLimit, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = RequestsPerMinute,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });

        return services;
    }
}
