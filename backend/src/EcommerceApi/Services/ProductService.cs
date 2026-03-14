using EcommerceApi.Data;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Services;

public sealed class ProductService(AppDbContext db, ILogger<ProductService> logger)
{
    public async Task<PaginatedResponse<ProductResponse>> GetAllAsync(
        int page, int pageSize, string? search, Guid? categoryId, string? categorySlug, bool? activeOnly, CancellationToken ct)
    {
        var query = db.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .AsQueryable();

        if (activeOnly is true)
            query = query.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        else if (!string.IsNullOrWhiteSpace(categorySlug))
            query = query.Where(p => p.Category.Slug == categorySlug);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{search}%") || (p.Description != null && EF.Functions.ILike(p.Description, $"%{search}%")));

        var totalCount = await query.CountAsync(ct);

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToResponse(p))
            .ToListAsync(ct);

        return new PaginatedResponse<ProductResponse>(products, totalCount, page, pageSize);
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        return product is null ? null : MapToResponse(product);
    }

    public async Task<ProductResponse?> GetBySlugAsync(string slug, CancellationToken ct)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Slug == slug, ct);

        return product is null ? null : MapToResponse(product);
    }

    public async Task<Result<ProductResponse>> CreateAsync(CreateProductRequest request, CancellationToken ct)
    {
        var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (!categoryExists)
            return Result<ProductResponse>.Failure("Categoria não encontrada");

        var slug = SlugHelper.GenerateSlug(request.Name);
        var slugExists = await db.Products.AnyAsync(p => p.Slug == slug, ct);
        if (slugExists)
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            PriceInCents = request.PriceInCents,
            Stock = request.Stock,
            CategoryId = request.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        if (request.Images is { Count: > 0 })
        {
            foreach (var img in request.Images)
            {
                product.Images.Add(new ProductImage
                {
                    Id = Guid.NewGuid(),
                    Url = img.Url,
                    AltText = img.AltText,
                    DisplayOrder = img.DisplayOrder,
                });
            }
        }

        db.Products.Add(product);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Produto {ProductId} criado: {ProductName}", product.Id, product.Name);

        var created = await GetByIdAsync(product.Id, ct);
        return Result<ProductResponse>.Success(created!);
    }

    public async Task<Result<ProductResponse>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null)
            return Result<ProductResponse>.Failure("Produto não encontrado");

        if (request.Name is not null)
        {
            product.Name = request.Name;
            product.Slug = SlugHelper.GenerateSlug(request.Name);
        }

        if (request.Description is not null) product.Description = request.Description;
        if (request.PriceInCents.HasValue) product.PriceInCents = request.PriceInCents.Value;
        if (request.Stock.HasValue) product.Stock = request.Stock.Value;
        if (request.IsActive.HasValue) product.IsActive = request.IsActive.Value;
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId.Value, ct);
            if (!categoryExists)
                return Result<ProductResponse>.Failure("Categoria não encontrada");
            product.CategoryId = request.CategoryId.Value;
        }

        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Produto {ProductId} atualizado", product.Id);
        return Result<ProductResponse>.Success(MapToResponse(product));
    }

    public async Task<Result<bool>> DeleteAsync(Guid id, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([id], ct);
        if (product is null) return Result<bool>.Failure("Produto não encontrado");

        var hasOrders = await db.OrderItems.AnyAsync(oi => oi.ProductId == id, ct);
        if (hasOrders)
            return Result<bool>.Failure("Produto possui pedidos vinculados. Desative-o em vez de excluir.");

        db.Products.Remove(product);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Produto {ProductId} removido", id);
        return Result<bool>.Success(true);
    }

    private static ProductResponse MapToResponse(Product p) => new(
        p.Id,
        p.Name,
        p.Slug,
        p.Description,
        p.PriceInCents,
        p.Stock,
        p.IsActive,
        p.CategoryId,
        p.Category?.Name ?? string.Empty,
        p.Images.Select(i => new ProductImageResponse(i.Id, i.Url, i.AltText, i.DisplayOrder)).ToList(),
        p.CreatedAt,
        p.UpdatedAt);
}
