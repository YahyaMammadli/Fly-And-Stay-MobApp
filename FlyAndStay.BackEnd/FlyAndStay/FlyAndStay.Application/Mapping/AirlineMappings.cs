using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class AirlineMappings
{
    public static AirlineDto ToDto(this Airline airline) =>
        new(airline.Slug, airline.Code, airline.Name, airline.Color);
}
