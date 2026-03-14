using EcommerceApi.Models.AbacatePay;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;

namespace EcommerceApi.Endpoints;

public static class CouponEndpoints
{
    public static void MapCouponEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/coupons").WithTags("Coupons");

        group.MapGet("/validate", ValidateCoupon);
    }

    private static async Task<IResult> ValidateCoupon(
        string code,
        AbacatePayClient client,
        ILogger<AbacatePayClient> logger,
        CancellationToken ct)
    {
        var trimmedCode = code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(trimmedCode))
            return Results.BadRequest(new ErrorResponse("Código do cupom é obrigatório."));

        try
        {
            var result = await client.GetAsync<List<AbacatePayCouponResponse>>("/v1/coupon/list", ct);

            if (result.Error is not null)
                return Results.BadRequest(new ErrorResponse(result.Error));

            var coupon = result.Data?.FirstOrDefault(c =>
                string.Equals(c.Id, trimmedCode, StringComparison.OrdinalIgnoreCase));

            if (coupon is null || !string.Equals(coupon.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase))
                return Results.NotFound(new ErrorResponse("Cupom não encontrado ou inativo."));

            return Results.Ok(new CouponValidationResponse(
                coupon.Id,
                coupon.DiscountKind,
                coupon.Discount));
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao validar cupom no AbacatePay");
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }
}
