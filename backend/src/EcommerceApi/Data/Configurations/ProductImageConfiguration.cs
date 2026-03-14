using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EcommerceApi.Data.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Url).HasMaxLength(2048).IsRequired();
        builder.Property(i => i.AltText).HasMaxLength(500);
    }
}
