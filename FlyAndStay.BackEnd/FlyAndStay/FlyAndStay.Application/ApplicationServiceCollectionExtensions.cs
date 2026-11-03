using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FlyAndStay.Application;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IGeoService, GeoService>();
        services.AddScoped<IAirlineService, AirlineService>();
        services.AddScoped<IFlightService, FlightService>();
        services.AddScoped<IHotelService, HotelService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<INotificationDispatcher, NotificationDispatcher>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IDeviceService, DeviceService>();
        services.AddScoped<IFlightReminderService, FlightReminderService>();
        return services;
    }
}
