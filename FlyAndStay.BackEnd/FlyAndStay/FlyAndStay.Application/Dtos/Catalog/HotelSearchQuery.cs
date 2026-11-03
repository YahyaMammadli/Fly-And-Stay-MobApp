namespace FlyAndStay.Application.Dtos.Catalog;

public class HotelSearchQuery
{
    public string? City { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public decimal? MinRating { get; set; }
    public string? Stars { get; set; }
    public string? Amenities { get; set; }
    public decimal? MaxDistance { get; set; }
    public int? Guests { get; set; }
    public string? Sort { get; set; }
}
