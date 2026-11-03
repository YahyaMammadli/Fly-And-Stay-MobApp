using FlyAndStay.Api.Middleware;
using FlyAndStay.Application.Dtos.Shared;
using Microsoft.AspNetCore.Mvc;

namespace FlyAndStay.Api.Extensions;

public static class ApiServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        services.AddJwtAuthentication(configuration);
        services.AddAuthRateLimiting();
        services.AddAppCors(configuration, environment);

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var message = context.ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m)) ?? "The request is not valid.";
                    return new BadRequestObjectResult(new MessageResponse(message));
                };
            });

        return services;
    }
}
