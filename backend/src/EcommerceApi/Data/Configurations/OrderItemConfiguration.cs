using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EcommerceApi.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.ProductName).HasMaxLength(300).IsRequired();
        builder.Property(i => i.Quantity).IsRequired();
        builder.Property(i => i.UnitPriceInCents).IsRequired();

        builder.HasOne(i => i.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
