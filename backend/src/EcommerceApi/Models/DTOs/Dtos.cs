namespace EcommerceApi.Models.DTOs;

// === Product ===

public record ProductResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int PriceInCents,
    int Stock,
    bool IsActive,
    Guid CategoryId,
    string CategoryName,
    List<ProductImageResponse> Images,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ProductImageResponse(
    Guid Id,
    string Url,
    string? AltText,
    int DisplayOrder);

public record CreateProductRequest(
    string Name,
    string? Description,
    int PriceInCents,
    int Stock,
    Guid CategoryId,
    List<CreateProductImageRequest>? Images);

public record CreateProductImageRequest(
    string Url,
    string? AltText,
    int DisplayOrder);

public record UpdateProductRequest(
    string? Name,
    string? Description,
    int? PriceInCents,
    int? Stock,
    bool? IsActive,
    Guid? CategoryId);

// === Coupon ===

public record CouponValidationResponse(
    string Code,
    string DiscountKind,
    int Discount);

// === Category ===

public record CategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    bool IsActive,
    DateTime CreatedAt);

public record CreateCategoryRequest(
    string Name,
    string? Description);

public record UpdateCategoryRequest(
    string? Name,
    string? Description,
    bool? IsActive);

// === Order ===

public record CreateOrderRequest(
    List<CreateOrderItemRequest> Items,
    CustomerDataRequest Customer,
    string? CouponCode = null);

public record CreateOrderItemRequest(
    Guid ProductId,
    int Quantity);

public record CustomerDataRequest(
    string Name,
    string Email,
    string? Phone,
    string? TaxId);

public record CreateOrderResponse(
    Guid OrderId,
    string? CheckoutUrl);

public record OrderResponse(
    Guid Id,
    string Status,
    int TotalInCents,
    string CustomerName,
    string CustomerEmail,
    DateTime CreatedAt,
    DateTime? PaidAt,
    List<OrderItemResponse> Items);

public record OrderItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    int UnitPriceInCents);

// === Auth ===

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? Phone,
    string? TaxId);

public record LoginRequest(
    string Email,
    string Password);

public record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    UserResponse User);

public record UserResponse(
    string Id,
    string FullName,
    string Email,
    string? Phone,
    string? TaxId = null,
    List<string>? Roles = null);

public record UpdateProfileRequest(
    string FullName,
    string? Email,
    string? Phone);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public record ForgotPasswordRequest(
    string Email);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword);

// === Shared ===

public record PaginatedResponse<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize);

public record ErrorResponse(string Message);
