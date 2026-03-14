namespace EcommerceApi.Models.Domain;

public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Preço em centavos (int). R$ 150,00 = 15000.</summary>
    public int PriceInCents { get; set; }

    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}
