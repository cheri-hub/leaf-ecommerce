using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using FluentValidation;

namespace EcommerceApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
        group.MapGet("/slug/{slug}", GetBySlug);
        group.MapPost("/", Create).RequireAuthorization("Admin");
        group.MapPut("/{id:guid}", Update).RequireAuthorization("Admin");
        group.MapDelete("/{id:guid}", Delete).RequireAuthorization("Admin");
    }

    private static async Task<IResult> GetAll(
        ProductService service,
        CancellationToken ct,
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid? categoryId = null,
        string? categorySlug = null,
        bool? activeOnly = true)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 100) pageSize = 20;

        var result = await service.GetAllAsync(page, pageSize, search, categoryId, categorySlug, activeOnly, ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetById(
        Guid id, ProductService service, CancellationToken ct)
    {
        var product = await service.GetByIdAsync(id, ct);
        return product is not null ? Results.Ok(product) : Results.NotFound();
    }

    private static async Task<IResult> GetBySlug(
        string slug, ProductService service, CancellationToken ct)
    {
        var product = await service.GetBySlugAsync(slug, ct);
        return product is not null ? Results.Ok(product) : Results.NotFound();
    }

    private static async Task<IResult> Create(
        CreateProductRequest request,
        ProductService service,
        IValidator<CreateProductRequest> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var result = await service.CreateAsync(request, ct);
        return result.IsSuccess
            ? Results.Created($"/api/products/{result.Value!.Id}", result.Value)
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdateProductRequest request,
        ProductService service,
        IValidator<UpdateProductRequest> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var result = await service.UpdateAsync(id, request, ct);
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }

    private static async Task<IResult> Delete(
        Guid id, ProductService service, CancellationToken ct)
    {
        var result = await service.DeleteAsync(id, ct);
        return result.IsSuccess
            ? Results.NoContent()
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }
}
