using EcommerceApi.Data;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Services;

public sealed class CategoryService(AppDbContext db, ILogger<CategoryService> logger)
{
    public async Task<List<CategoryResponse>> GetAllAsync(bool? activeOnly, CancellationToken ct)
    {
        var query = db.Categories.AsQueryable();

        if (activeOnly is true)
            query = query.Where(c => c.IsActive);

        return await query
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.Name, c.Slug, c.Description, c.IsActive, c.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<CategoryResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await db.Categories
            .Where(c => c.Id == id)
            .Select(c => new CategoryResponse(c.Id, c.Name, c.Slug, c.Description, c.IsActive, c.CreatedAt))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<Result<CategoryResponse>> CreateAsync(CreateCategoryRequest request, CancellationToken ct)
    {
        var slug = SlugHelper.GenerateSlug(request.Name);
        var slugExists = await db.Categories.AnyAsync(c => c.Slug == slug, ct);
        if (slugExists)
            return Result<CategoryResponse>.Failure("Já existe uma categoria com esse nome");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Categoria {CategoryId} criada: {CategoryName}", category.Id, category.Name);
        return Result<CategoryResponse>.Success(
            new CategoryResponse(category.Id, category.Name, category.Slug, category.Description, category.IsActive, category.CreatedAt));
    }

    public async Task<Result<CategoryResponse>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await db.Categories.FindAsync([id], ct);
        if (category is null)
            return Result<CategoryResponse>.Failure("Categoria não encontrada");

        if (request.Name is not null)
        {
            category.Name = request.Name;
            category.Slug = SlugHelper.GenerateSlug(request.Name);
        }

        if (request.Description is not null) category.Description = request.Description;
        if (request.IsActive.HasValue) category.IsActive = request.IsActive.Value;

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Categoria {CategoryId} atualizada", id);

        return Result<CategoryResponse>.Success(
            new CategoryResponse(category.Id, category.Name, category.Slug, category.Description, category.IsActive, category.CreatedAt));
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var hasProducts = await db.Products.AnyAsync(p => p.CategoryId == id, ct);
        if (hasProducts)
            return false;

        var category = await db.Categories.FindAsync([id], ct);
        if (category is null) return false;

        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Categoria {CategoryId} removida", id);
        return true;
    }
}
