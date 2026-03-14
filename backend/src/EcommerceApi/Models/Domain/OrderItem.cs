namespace EcommerceApi.Models.Domain;

public class OrderItem
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Nome do produto no momento da compra (snapshot).</summary>
    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    /// <summary>Preço unitário em centavos no momento da compra.</summary>
    public int UnitPriceInCents { get; set; }
}
