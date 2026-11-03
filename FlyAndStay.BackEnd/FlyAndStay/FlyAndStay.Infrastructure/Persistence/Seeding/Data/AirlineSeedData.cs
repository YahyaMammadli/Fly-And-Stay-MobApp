using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class AirlineSeedData
{
    public static List<Airline> Create() =>
    [
        new Airline { Slug = "turkish-airlines", Code = "TK", Name = "Turkish Airlines", Color = "#D7263D", FreeCancellationHours = 24 },
        new Airline { Slug = "azerbaijan-airlines", Code = "J2", Name = "Azerbaijan Airlines", Color = "#3FB6D3", FreeCancellationHours = 24 },
        new Airline { Slug = "pegasus-airlines", Code = "PC", Name = "Pegasus Airlines", Color = "#F5B301", IsLowCost = true },
        new Airline { Slug = "emirates", Code = "EK", Name = "Emirates", Color = "#8E1B2F", FreeCancellationHours = 24 },
        new Airline { Slug = "flydubai", Code = "FZ", Name = "flydubai", Color = "#F26B21", IsLowCost = true },
        new Airline { Slug = "british-airways", Code = "BA", Name = "British Airways", Color = "#1E3A8A", FreeCancellationHours = 24 }
    ];
}
