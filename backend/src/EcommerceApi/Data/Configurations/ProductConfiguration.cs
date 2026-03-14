using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EcommerceApi.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(300).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(300).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Description).HasMaxLength(5000);
        builder.Property(p => p.PriceInCents).IsRequired();
        builder.Property(p => p.Stock).IsRequired();

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
