using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EcommerceApi.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.Property(c => c.Description).HasMaxLength(1000);
    }
}
