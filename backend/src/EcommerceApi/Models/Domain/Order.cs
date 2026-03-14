namespace EcommerceApi.Models.Domain;

public enum OrderStatus
{
    Pending,
    Paid,
    Failed,
    Refunded,
    Cancelled
}

public class Order
{
    public Guid Id { get; set; }
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    /// <summary>Total do pedido em centavos.</summary>
    public int TotalInCents { get; set; }

    // AbacatePay
    public string? AbacatePayBillingId { get; set; }
    public string? AbacatePayBillingUrl { get; set; }

    // Dados do cliente (snapshot no momento do pedido)
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerTaxId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = [];
}
