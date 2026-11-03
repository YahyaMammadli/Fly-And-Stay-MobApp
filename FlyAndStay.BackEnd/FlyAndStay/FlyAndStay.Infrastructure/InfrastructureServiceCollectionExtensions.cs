using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Settings;
using FlyAndStay.Infrastructure.Background;
using FlyAndStay.Infrastructure.Mail;
using FlyAndStay.Infrastructure.Persistence;
using FlyAndStay.Infrastructure.Persistence.Repositories;
using FlyAndStay.Infrastructure.Persistence.Seeding;
using FlyAndStay.Infrastructure.Push;
using FlyAndStay.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlyAndStay.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        bool isDevelopment)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<PasswordResetSettings>(configuration.GetSection(PasswordResetSettings.SectionName));
        services.Configure<SmtpSettings>(configuration.GetSection(SmtpSettings.SectionName));
        services.Configure<SeedSettings>(configuration.GetSection(SeedSettings.SectionName));
        services.Configure<NotificationSettings>(configuration.GetSection(NotificationSettings.SectionName));
        services.Configure<ExpoPushSettings>(configuration.GetSection(ExpoPushSettings.SectionName));

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Default"), sql => sql
                .EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null)
                .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserPhotoRepository, UserPhotoRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IPasswordResetCodeRepository, PasswordResetCodeRepository>();
        services.AddScoped<IAirportRepository, AirportRepository>();
        services.AddScoped<IAirlineRepository, AirlineRepository>();
        services.AddScoped<IFlightRepository, FlightRepository>();
        services.AddScoped<IAmenityRepository, AmenityRepository>();
        services.AddScoped<IHotelRepository, HotelRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IDeviceTokenRepository, DeviceTokenRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<IOtpService, OtpService>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        var smtpConfigured = !string.IsNullOrWhiteSpace(configuration[$"{SmtpSettings.SectionName}:Host"]);
        if (smtpConfigured || !isDevelopment)
            services.AddSingleton<IEmailSender, SmtpEmailSender>();
        else
            services.AddSingleton<IEmailSender, LogEmailSender>();

        if (configuration.GetValue($"{ExpoPushSettings.SectionName}:Enabled", true))
            services.AddHttpClient<IPushSender, ExpoPushSender>(client => client.Timeout = TimeSpan.FromSeconds(15));
        else
            services.AddSingleton<IPushSender, LogPushSender>();

        services.AddHostedService<FlightReminderWorker>();

        services.AddScoped<ReferenceDataSeeder>();
        services.AddScoped<FlightSeeder>();
        services.AddScoped<AdminSeeder>();
        services.AddScoped<DatabaseSeeder>();

        return services;
    }
}
