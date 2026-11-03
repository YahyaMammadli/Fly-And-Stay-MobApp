namespace FlyAndStay.Infrastructure.Persistence.Seeding.Models;

public sealed record FlightSlot(string AirlineCode, string Time, int Minutes, double Factor, string? Via = null);
