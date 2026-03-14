namespace EcommerceApi.Models.Domain;

public class ProductImage
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
}
