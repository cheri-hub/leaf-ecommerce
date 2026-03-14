using System.Text.Json.Serialization;

namespace EcommerceApi.Models.AbacatePay;

// === Response wrapper ===

public record AbacatePayResponse<T>
{
    public T? Data { get; init; }
    public string? Error { get; init; }
}

// === Billing ===

public record CreateBillingRequest
{
    public string Frequency { get; init; } = "ONE_TIME";
    public List<string> Methods { get; init; } = ["PIX"];
    public List<BillingProduct> Products { get; init; } = [];
    public string ReturnUrl { get; init; } = string.Empty;
    public string CompletionUrl { get; init; } = string.Empty;
    public string? CustomerId { get; init; }
    public BillingCustomer? Customer { get; init; }
    public string? ExternalId { get; init; }
    public bool AllowCoupons { get; init; }
    public List<string>? Coupons { get; init; }
    public object? Metadata { get; init; }
}

public record BillingProduct
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int Quantity { get; init; }
    public int Price { get; init; }
    public string? ExternalId { get; init; }
}

public record BillingCustomer
{
    public string Name { get; init; } = string.Empty;
    public string Cellphone { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TaxId { get; init; } = string.Empty;
}

public record BillingResponse
{
    public string Id { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;
    public int Amount { get; init; }
    public string Status { get; init; } = string.Empty;
    public List<string> Methods { get; init; } = [];
}

// === Customer ===

public record CreateCustomerRequest
{
    public string Name { get; init; } = string.Empty;
    public string Cellphone { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TaxId { get; init; } = string.Empty;
}

public record CustomerResponse
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}

// === Webhook ===

public record WebhookPayload
{
    [JsonPropertyName("event")]
    public string Event { get; init; } = string.Empty;

    [JsonPropertyName("devMode")]
    public bool DevMode { get; init; }

    [JsonPropertyName("data")]
    public WebhookData Data { get; init; } = new();
}

public record WebhookData
{
    [JsonPropertyName("id")]
    public string Id { get; init; } = string.Empty;

    [JsonPropertyName("externalId")]
    public string? ExternalId { get; init; }

    [JsonPropertyName("amount")]
    public int Amount { get; init; }

    [JsonPropertyName("paidAmount")]
    public int PaidAmount { get; init; }

    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;

    [JsonPropertyName("customer")]
    public WebhookCustomer? Customer { get; init; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; init; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; init; }
}

public record WebhookCustomer
{
    [JsonPropertyName("id")]
    public string Id { get; init; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; init; } = string.Empty;
}

// === PIX QR Code ===

public record CreatePixQrCodeRequest
{
    public int Amount { get; init; }
    public int? ExpiresIn { get; init; }
    public string? Description { get; init; }
    public BillingCustomer? Customer { get; init; }
    public object? Metadata { get; init; }
}

public record PixQrCodeResponse
{
    public string Id { get; init; } = string.Empty;
    public string BrCode { get; init; } = string.Empty;
    public string BrCodeBase64 { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime? ExpiresAt { get; init; }
}

// === Coupon ===

public record CreateAbacatePayCouponRequest
{
    public string Code { get; init; } = string.Empty;
    public string Notes { get; init; } = string.Empty;
    public string DiscountKind { get; init; } = string.Empty;
    public int Discount { get; init; }
    public int MaxRedeems { get; init; } = -1;
    public object? Metadata { get; init; }
}

public record AbacatePayCouponResponse
{
    public string Id { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string DiscountKind { get; init; } = string.Empty;
    public int Discount { get; init; }
    public string Status { get; init; } = string.Empty;
}

// === Store ===

public record StoreResponse
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Balance { get; init; }
}
