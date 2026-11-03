using FlyAndStay.Application.Dtos.Catalog;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IHotelService
{
    Task<List<HotelSummaryDto>> SearchAsync(HotelSearchQuery query, CancellationToken ct);
    Task<HotelDetailsDto> GetAsync(string slug, CancellationToken ct);
    Task<List<AmenityDto>> GetAmenitiesAsync(CancellationToken ct);
}
