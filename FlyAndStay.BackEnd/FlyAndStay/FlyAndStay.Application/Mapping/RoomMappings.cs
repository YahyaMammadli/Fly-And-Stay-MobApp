using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Mapping;

public static class RoomMappings
{
    public static RoomDto ToDto(this Room room) =>
        new(room.Id, room.Type.ToString(), room.Name, room.MaxGuests, room.Beds, room.PricePerNight);
}
