using FlyAndStay.Infrastructure.Persistence.Seeding.Models;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class FlightRouteSeedData
{
    public static IReadOnlyList<FlightRouteSeed> All { get; } =
    [
        new("GYD", "IST", 120, [new("TK", "08:35", 155, 1.00), new("J2", "12:20", 160, 1.125), new("PC", "16:45", 155, 1.18), new("TK", "20:10", 155, 1.23)]),
        new("IST", "GYD", 118, [new("TK", "07:15", 165, 1.00), new("PC", "13:30", 170, 1.10), new("J2", "18:45", 165, 1.20), new("TK", "22:00", 165, 1.25)]),
        new("GYD", "DXB", 350, [new("EK", "03:10", 215, 1.10), new("FZ", "09:05", 210, 0.90), new("J2", "14:20", 215, 1.00), new("EK", "21:40", 215, 1.15)]),
        new("DXB", "GYD", 340, [new("FZ", "05:30", 215, 0.90), new("EK", "10:15", 215, 1.10), new("J2", "16:00", 215, 1.00), new("EK", "23:20", 215, 1.15)]),
        new("GYD", "JFK", 620, [new("TK", "04:30", 850, 1.00, "IST"), new("EK", "09:10", 900, 1.12, "DXB"), new("BA", "15:40", 940, 1.20, "LHR")]),
        new("JFK", "GYD", 640, [new("BA", "19:10", 950, 1.20, "LHR"), new("TK", "21:30", 880, 1.00, "IST"), new("EK", "23:55", 930, 1.12, "DXB")]),
        new("GYD", "LHR", 380, [new("BA", "06:40", 330, 1.20), new("J2", "10:30", 335, 1.00), new("TK", "13:15", 420, 0.90, "IST"), new("BA", "20:05", 330, 1.25)]),
        new("LHR", "GYD", 370, [new("J2", "09:30", 325, 1.00), new("BA", "14:50", 320, 1.20), new("TK", "18:00", 410, 0.90, "IST")])
    ];
}
