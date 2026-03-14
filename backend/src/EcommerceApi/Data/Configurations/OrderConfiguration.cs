using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EcommerceApi.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(o => o.TotalInCents).IsRequired();
        builder.Property(o => o.CustomerName).HasMaxLength(300).IsRequired();
        builder.Property(o => o.CustomerEmail).HasMaxLength(300).IsRequired();
        builder.Property(o => o.CustomerPhone).HasMaxLength(30);
        builder.Property(o => o.CustomerTaxId).HasMaxLength(20);
        builder.Property(o => o.AbacatePayBillingId).HasMaxLength(200);
        builder.Property(o => o.AbacatePayBillingUrl).HasMaxLength(2048);

        builder.HasIndex(o => o.AbacatePayBillingId);
        builder.HasIndex(o => o.Status);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
