using Microsoft.AspNetCore.Identity;

namespace EcommerceApi.Models.Domain;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = [];
}
