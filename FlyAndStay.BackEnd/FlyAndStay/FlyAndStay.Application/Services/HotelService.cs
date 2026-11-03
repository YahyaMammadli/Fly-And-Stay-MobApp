using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Dtos.Catalog;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Application.Mapping;

namespace FlyAndStay.Application.Services;

public sealed class HotelService(IHotelRepository hotels, IAmenityRepository amenities) : IHotelService
{
    public async Task<List<HotelSummaryDto>> SearchAsync(HotelSearchQuery query, CancellationToken ct) =>
        (await hotels.SearchAsync(query.ToFilter(), ct)).Select(h => h.ToSummary()).ToList();

    public async Task<HotelDetailsDto> GetAsync(string slug, CancellationToken ct)
    {
        var hotel = await hotels.GetBySlugAsync(slug, ct)
            ?? throw new NotFoundException("Hotel not found.");
        return hotel.ToDetails();
    }

    public async Task<List<AmenityDto>> GetAmenitiesAsync(CancellationToken ct) =>
        (await amenities.GetAllAsync(ct)).Select(a => a.ToDto()).ToList();
}
