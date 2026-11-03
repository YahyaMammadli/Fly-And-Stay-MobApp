namespace FlyAndStay.Api.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddAppCors(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        services.AddCors(options => options.AddDefaultPolicy(policy =>
        {
            var origins = configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];

            if (environment.IsDevelopment() || origins.Length == 0)
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            else
                policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
        }));

        return services;
    }
}
