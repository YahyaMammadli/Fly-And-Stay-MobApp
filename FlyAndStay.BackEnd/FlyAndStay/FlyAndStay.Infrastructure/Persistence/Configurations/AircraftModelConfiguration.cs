using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class AircraftModelConfiguration : IEntityTypeConfiguration<AircraftModel>
{
    public void Configure(EntityTypeBuilder<AircraftModel> builder)
    {
        builder.Property(x => x.Slug).HasMaxLength(60).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.Property(x => x.Name).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Manufacturer).HasMaxLength(60).IsRequired();
    }
}
