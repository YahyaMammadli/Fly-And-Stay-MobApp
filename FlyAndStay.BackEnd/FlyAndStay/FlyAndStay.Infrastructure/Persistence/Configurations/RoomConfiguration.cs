using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Beds).HasMaxLength(80);
        builder.Property(x => x.PricePerNight).HasPrecision(10, 2);
        builder.HasOne(x => x.Hotel).WithMany(h => h.Rooms).HasForeignKey(x => x.HotelId).OnDelete(DeleteBehavior.Cascade);
    }
}
