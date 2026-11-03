using FlyAndStay.Application.Models;
using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IHotelRepository
{
    Task<List<Hotel>> SearchAsync(HotelFilter filter, CancellationToken ct);
    Task<Hotel?> GetBySlugAsync(string slug, CancellationToken ct);
}
