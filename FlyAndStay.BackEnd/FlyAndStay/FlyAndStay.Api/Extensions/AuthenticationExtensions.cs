using System.Text;
using FlyAndStay.Api.Constants;
using FlyAndStay.Application.Settings;
using FlyAndStay.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace FlyAndStay.Api.Extensions;

public static class AuthenticationExtensions
{
    private const int MinimumKeyLength = 32;

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwt = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();

        if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < MinimumKeyLength)
            throw new InvalidOperationException(
                $"Jwt:Key is missing or shorter than {MinimumKeyLength} characters. " +
                "Set it with: dotnet user-secrets set \"Jwt:Key\" \"<long random string>\"");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = "name",
                    RoleClaimType = "role"
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(PolicyNames.AdminOnly, policy => policy
                .RequireAuthenticatedUser()
                .RequireRole(UserRole.Admin.ToString()));

        return services;
    }
}
