using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class AirportMappings
{
    public static AirportDto ToDto(this Airport airport) =>
        new(airport.Code, airport.City, airport.Country, airport.Name, airport.Latitude, airport.Longitude);
}
