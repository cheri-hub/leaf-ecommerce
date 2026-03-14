using EcommerceApi.Models.AbacatePay;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;

namespace EcommerceApi.Endpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin").WithTags("Admin").RequireAuthorization("Admin");

        // AbacatePay - Cobranças
        group.MapGet("/billings", ListBillings);

        // AbacatePay - Clientes
        group.MapGet("/customers", ListCustomers);

        // AbacatePay - Cupons
        group.MapPost("/coupons", CreateCoupon);
        group.MapGet("/coupons", ListCoupons);

        // AbacatePay - Loja
        group.MapGet("/store", GetStore);

        // Dashboard
        group.MapGet("/dashboard", GetDashboard);
    }

    private static async Task<IResult> ListBillings(
        AbacatePayClient client, ILogger<AbacatePayClient> logger, CancellationToken ct)
    {
        try
        {
            var result = await client.GetAsync<List<BillingResponse>>("/v1/billing/list", ct);
            return result.Error is not null
                ? Results.BadRequest(new ErrorResponse(result.Error))
                : Results.Ok(result.Data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao listar cobranças no AbacatePay");
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }

    private static async Task<IResult> ListCustomers(
        AbacatePayClient client, ILogger<AbacatePayClient> logger, CancellationToken ct)
    {
        try
        {
            var result = await client.GetAsync<List<CustomerResponse>>("/v1/customer/list", ct);
            return result.Error is not null
                ? Results.BadRequest(new ErrorResponse(result.Error))
                : Results.Ok(result.Data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao listar clientes no AbacatePay");
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }

    private static async Task<IResult> CreateCoupon(
        CreateAbacatePayCouponRequest request,
        AbacatePayClient client,
        ILogger<AbacatePayClient> logger,
        CancellationToken ct)
    {
        try
        {
            var result = await client.PostAsync<AbacatePayCouponResponse>("/v1/coupon/create", request, ct);
            return result.Error is not null
                ? Results.BadRequest(new ErrorResponse(result.Error))
                : Results.Ok(result.Data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao criar cupom no AbacatePay");
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }

    private static async Task<IResult> ListCoupons(
        AbacatePayClient client, ILogger<AbacatePayClient> logger, CancellationToken ct)
    {
        try
        {
            var result = await client.GetAsync<List<AbacatePayCouponResponse>>("/v1/coupon/list", ct);
            return result.Error is not null
                ? Results.BadRequest(new ErrorResponse(result.Error))
                : Results.Ok(result.Data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao listar cupons no AbacatePay");
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }

    private static async Task<IResult> GetStore(
        AbacatePayClient client, ILogger<AbacatePayClient> logger, CancellationToken ct)
    {
        try
        {
            var result = await client.GetAsync<StoreResponse>("/v1/store/get", ct);
            return result.Error is not null
                ? Results.BadRequest(new ErrorResponse(result.Error))
                : Results.Ok(result.Data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao obter dados da loja no AbacatePay");
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }

    private static async Task<IResult> GetDashboard(
        Data.AppDbContext db, CancellationToken ct)
    {
        var totalProducts = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .CountAsync(db.Products, ct);
        var totalOrders = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .CountAsync(db.Orders, ct);
        var paidOrders = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .CountAsync(db.Orders.Where(o => o.Status == Models.Domain.OrderStatus.Paid), ct);
        var totalRevenue = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .SumAsync(db.Orders.Where(o => o.Status == Models.Domain.OrderStatus.Paid),
                o => o.TotalInCents, ct);

        return Results.Ok(new
        {
            totalProducts,
            totalOrders,
            paidOrders,
            totalRevenueCents = totalRevenue,
        });
    }
}
