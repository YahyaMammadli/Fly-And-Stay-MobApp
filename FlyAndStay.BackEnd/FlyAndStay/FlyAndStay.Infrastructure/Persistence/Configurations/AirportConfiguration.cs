using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class AirportConfiguration : IEntityTypeConfiguration<Airport>
{
    public void Configure(EntityTypeBuilder<Airport> builder)
    {
        builder.HasKey(x => x.Code);
        builder.Property(x => x.Code).HasMaxLength(3).IsFixedLength();
        builder.Property(x => x.City).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Country).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.CoverColor).HasMaxLength(9);
        builder.Property(x => x.Icon).HasMaxLength(40);
    }
}
