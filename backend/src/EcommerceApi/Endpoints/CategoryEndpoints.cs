using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using FluentValidation;

namespace EcommerceApi.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/categories").WithTags("Categories");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create).RequireAuthorization("Admin");
        group.MapPut("/{id:guid}", Update).RequireAuthorization("Admin");
        group.MapDelete("/{id:guid}", Delete).RequireAuthorization("Admin");
    }

    private static async Task<IResult> GetAll(
        CategoryService service, CancellationToken ct, bool? activeOnly = true)
    {
        var categories = await service.GetAllAsync(activeOnly, ct);
        return Results.Ok(categories);
    }

    private static async Task<IResult> GetById(
        Guid id, CategoryService service, CancellationToken ct)
    {
        var category = await service.GetByIdAsync(id, ct);
        return category is not null ? Results.Ok(category) : Results.NotFound();
    }

    private static async Task<IResult> Create(
        CreateCategoryRequest request,
        CategoryService service,
        IValidator<CreateCategoryRequest> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var result = await service.CreateAsync(request, ct);
        return result.IsSuccess
            ? Results.Created($"/api/categories/{result.Value!.Id}", result.Value)
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdateCategoryRequest request,
        CategoryService service,
        CancellationToken ct)
    {
        var result = await service.UpdateAsync(id, request, ct);
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.BadRequest(new ErrorResponse(result.Error!));
    }

    private static async Task<IResult> Delete(
        Guid id, CategoryService service, CancellationToken ct)
    {
        var deleted = await service.DeleteAsync(id, ct);
        return deleted ? Results.NoContent() : Results.BadRequest(new ErrorResponse("Categoria possui produtos associados ou não foi encontrada"));
    }
}
