using System.Security.Claims;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using FluentValidation;

namespace EcommerceApi.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders");

        group.MapPost("/", Create);
        group.MapGet("/{id:guid}", GetById);
        group.MapGet("/", GetAll).RequireAuthorization();
        group.MapPost("/{id:guid}/sync-payment", SyncPayment).RequireAuthorization("Admin");
    }

    private static async Task<IResult> Create(
        CreateOrderRequest request,
        OrderService service,
        IValidator<CreateOrderRequest> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

        var result = await service.CreateAsync(request, userId, ct);
        return result.IsSuccess
            ? Results.Created($"/api/orders/{result.Value!.OrderId}", result.Value)
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }

    private static async Task<IResult> GetById(
        Guid id, OrderService service, CancellationToken ct)
    {
        var order = await service.GetByIdAsync(id, ct);
        return order is not null ? Results.Ok(order) : Results.NotFound();
    }

    private static async Task<IResult> GetAll(
        OrderService service,
        HttpContext httpContext,
        CancellationToken ct,
        int page = 1,
        int pageSize = 20,
        string? status = null)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 100) pageSize = 20;

        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = httpContext.User.IsInRole("Admin");

        OrderStatus? statusFilter = status is not null && Enum.TryParse<OrderStatus>(status, true, out var s)
            ? s : null;

        var result = await service.GetAllAsync(
            page, pageSize, isAdmin ? null : userId, statusFilter, ct);

        return Results.Ok(result);
    }

    private static async Task<IResult> SyncPayment(
        Guid id, OrderService service, CancellationToken ct)
    {
        var result = await service.SyncPaymentStatusAsync(id, ct);
        return result.IsSuccess
            ? Results.Ok(new { message = result.Value })
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }
}
