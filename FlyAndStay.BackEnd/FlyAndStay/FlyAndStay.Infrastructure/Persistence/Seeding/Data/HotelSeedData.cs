using FlyAndStay.Infrastructure.Persistence.Seeding.Models;

namespace FlyAndStay.Infrastructure.Persistence.Seeding.Data;

public static class HotelSeedData
{
    public static IReadOnlyList<HotelSeed> All { get; } =
    [
        new("ramada-plaza-istanbul", "Ramada Plaza Istanbul", "Istanbul", "Taksim", 2.5m, 4, 4.5m, 1234, 85, "#2F6FB5", ["wifi", "pool", "gym", "restaurant"]),
        new("the-marmara-taksim", "The Marmara Taksim", "Istanbul", "Taksim", 2.5m, 5, 4.7m, 562, 112, "#8A5FBF", ["wifi", "pool", "gym", "restaurant", "spa"]),
        new("cvk-park-bosphorus", "CVK Park Bosphorus Hotel", "Istanbul", "Beyoğlu", 3.0m, 5, 4.6m, 1087, 165, "#2A9D8F", ["wifi", "pool", "spa", "restaurant", "parking", "shuttle"]),
        new("galata-boutique", "Galata Boutique", "Istanbul", "Galata", 1.2m, 3, 4.6m, 410, 95, "#C9855B", ["wifi", "breakfast"]),
        new("bosphorus-palace", "Bosphorus Palace", "Istanbul", "Beşiktaş", 4.1m, 5, 4.8m, 892, 120, "#1D4E89", ["wifi", "pool", "spa", "restaurant", "gym", "breakfast"]),
        new("marina-tower", "Marina Tower", "Dubai", "Dubai Marina", 14.0m, 5, 4.7m, 760, 210, "#5B8DC9", ["wifi", "pool", "gym", "restaurant", "spa", "parking"]),
        new("downtown-suites-dubai", "Downtown Suites", "Dubai", "Downtown", 0.8m, 4, 4.5m, 530, 150, "#3D7EA6", ["wifi", "pool", "gym", "restaurant", "shuttle"]),
        new("creek-inn-dubai", "Creek Inn", "Dubai", "Deira", 5.5m, 3, 4.1m, 320, 70, "#D08C60", ["wifi", "breakfast", "parking"]),
        new("central-park-suites", "Central Park Suites", "New York", "Midtown", 1.0m, 4, 4.5m, 980, 260, "#7C6BC9", ["wifi", "gym", "restaurant", "breakfast"]),
        new("times-square-inn", "Times Square Inn", "New York", "Times Square", 0.4m, 3, 4.0m, 1500, 180, "#B5546B", ["wifi", "breakfast"]),
        new("brooklyn-bridge-hotel", "Brooklyn Bridge Hotel", "New York", "Brooklyn", 4.5m, 4, 4.4m, 640, 190, "#4C6EA8", ["wifi", "gym", "restaurant", "parking"]),
        new("westminster-grand", "Westminster Grand", "London", "Westminster", 0.9m, 5, 4.6m, 720, 240, "#C95B7C", ["wifi", "spa", "restaurant", "gym", "pool"]),
        new("soho-boutique", "Soho Boutique", "London", "Soho", 0.6m, 4, 4.3m, 460, 175, "#9B5DE5", ["wifi", "breakfast", "restaurant"]),
        new("kensington-lodge", "Kensington Lodge", "London", "Kensington", 3.2m, 3, 4.2m, 380, 120, "#6C8E5B", ["wifi", "breakfast", "parking"]),
        new("flame-view-baku", "Flame View Hotel", "Baku", "Old City", 0.7m, 5, 4.7m, 610, 140, "#E4572E", ["wifi", "pool", "spa", "restaurant", "gym", "shuttle"]),
        new("caspian-central-baku", "Caspian Central", "Baku", "Nasimi", 1.5m, 4, 4.4m, 350, 95, "#1F8A70", ["wifi", "restaurant", "breakfast", "parking"]),
        new("boulevard-inn-baku", "Boulevard Inn", "Baku", "Seaside Boulevard", 1.1m, 3, 4.1m, 210, 60, "#3FB6D3", ["wifi", "breakfast"])
    ];
}
