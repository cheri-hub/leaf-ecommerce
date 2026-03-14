using EcommerceApi.Data;
using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Jobs;

public sealed class ReleaseExpiredReservationsJob(
    AppDbContext db,
    ILogger<ReleaseExpiredReservationsJob> logger)
{
    /// <summary>
    /// Libera estoque de pedidos pendentes há mais de 30 minutos.
    /// Executado periodicamente pelo Hangfire.
    /// </summary>
    public async Task ExecuteAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-30);

        var expiredOrders = await db.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Pending && o.CreatedAt < cutoff)
            .ToListAsync(ct);

        if (expiredOrders.Count == 0) return;

        foreach (var order in expiredOrders)
        {
            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            foreach (var item in order.Items)
            {
                var product = await db.Products.FindAsync([item.ProductId], ct);
                if (product is not null)
                {
                    product.Stock += item.Quantity;
                    product.UpdatedAt = DateTime.UtcNow;
                }
            }

            logger.LogInformation("Pedido {OrderId} cancelado por expiração, estoque liberado", order.Id);
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("{Count} pedidos expirados processados", expiredOrders.Count);
    }
}
