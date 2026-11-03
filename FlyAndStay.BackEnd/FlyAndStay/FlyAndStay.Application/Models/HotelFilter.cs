namespace FlyAndStay.Application.Models;

public sealed class HotelFilter
{
    public string? City { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public decimal? MinRating { get; init; }
    public decimal? MaxDistance { get; init; }
    public int? Guests { get; init; }
    public IReadOnlyList<int> Stars { get; init; } = [];
    public IReadOnlyList<string> AmenityCodes { get; init; } = [];
    public HotelSort Sort { get; init; } = HotelSort.Popular;
    public int Take { get; init; } = 60;
}
