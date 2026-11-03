using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class HotelConfiguration : IEntityTypeConfiguration<Hotel>
{
    public void Configure(EntityTypeBuilder<Hotel> builder)
    {
        builder.Property(x => x.Slug).HasMaxLength(80).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.City).HasMaxLength(80).IsRequired();
        builder.HasIndex(x => x.City);
        builder.Property(x => x.District).HasMaxLength(80);
        builder.Property(x => x.Address).HasMaxLength(200);
        builder.Property(x => x.DistanceToCenterKm).HasPrecision(4, 1);
        builder.Property(x => x.Rating).HasPrecision(2, 1);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.ImageUrl).HasMaxLength(500);
        builder.Property(x => x.CoverColor).HasMaxLength(9);
        builder.HasMany(x => x.Amenities).WithMany(a => a.Hotels).UsingEntity(j => j.ToTable("HotelAmenities"));
    }
}
