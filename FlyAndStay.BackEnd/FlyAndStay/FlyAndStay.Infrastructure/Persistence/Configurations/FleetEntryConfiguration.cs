using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class FleetEntryConfiguration : IEntityTypeConfiguration<FleetEntry>
{
    public void Configure(EntityTypeBuilder<FleetEntry> builder)
    {
        builder.HasKey(x => new { x.AirlineId, x.AircraftModelId });
        builder.HasOne(x => x.Airline).WithMany(a => a.Fleet).HasForeignKey(x => x.AirlineId);
        builder.HasOne(x => x.AircraftModel).WithMany().HasForeignKey(x => x.AircraftModelId);
    }
}
