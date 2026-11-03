using FlyAndStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlyAndStay.Infrastructure.Persistence.Configurations;

public class UserPhotoConfiguration : IEntityTypeConfiguration<UserPhoto>
{
    public void Configure(EntityTypeBuilder<UserPhoto> builder)
    {
        builder.HasKey(x => x.UserId);
        builder.Property(x => x.ContentType).HasMaxLength(50).IsRequired();
        builder.HasOne(x => x.User).WithOne(u => u.Photo).HasForeignKey<UserPhoto>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
