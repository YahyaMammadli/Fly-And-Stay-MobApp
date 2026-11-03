using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.Property(x => x.Reference).HasMaxLength(12).IsRequired();
        builder.HasIndex(x => x.Reference).IsUnique();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.FlightTotal).HasPrecision(10, 2);
        builder.Property(x => x.HotelTotal).HasPrecision(10, 2);
        builder.Property(x => x.Total).HasPrecision(10, 2);
        builder.Ignore(x => x.IsCancelled);
        builder.HasOne(x => x.User).WithMany(u => u.Bookings).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Flight).WithMany().HasForeignKey(x => x.FlightId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => x.UserId);
    }
}
