using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class FlightConfiguration : IEntityTypeConfiguration<Flight>
{
    public void Configure(EntityTypeBuilder<Flight> builder)
    {
        builder.Property(x => x.FlightNumber).HasMaxLength(8).IsRequired();
        builder.Property(x => x.FromCode).HasMaxLength(3).IsFixedLength();
        builder.Property(x => x.ToCode).HasMaxLength(3).IsFixedLength();
        builder.Property(x => x.Via).HasMaxLength(3);
        builder.Property(x => x.Price).HasPrecision(10, 2);
        builder.Ignore(x => x.ArrivalTime);
        builder.HasOne(x => x.Airline).WithMany().HasForeignKey(x => x.AirlineId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Aircraft).WithMany().HasForeignKey(x => x.AircraftModelId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.From).WithMany().HasForeignKey(x => x.FromCode).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.To).WithMany().HasForeignKey(x => x.ToCode).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.FromCode, x.ToCode, x.DepartureTime });
    }
}
