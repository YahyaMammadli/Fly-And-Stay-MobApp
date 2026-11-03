namespace FlyAndStay.Infrastructure.Persistence.Seeding.Models;

public sealed record FlightRouteSeed(string From, string To, int BasePrice, IReadOnlyList<FlightSlot> Slots);
