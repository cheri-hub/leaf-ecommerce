using EcommerceApi.Data;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace EcommerceApi.Tests.Unit.Services;

public class ProductServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);
        var logger = Substitute.For<ILogger<ProductService>>();
        _service = new ProductService(_db, logger);
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    private async Task<Category> SeedCategoryAsync()
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Roupas",
            Slug = "roupas",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return category;
    }

    [Fact]
    public async Task CreateAsync_Should_Create_Product()
    {
        var category = await SeedCategoryAsync();
        var request = new CreateProductRequest(
            "Camiseta Leaf", "Camiseta verde", 5990, 50, category.Id, null);

        var result = await _service.CreateAsync(request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Camiseta Leaf", result.Value!.Name);
        Assert.Equal(5990, result.Value.PriceInCents);
        Assert.Equal(50, result.Value.Stock);
        Assert.Equal("camiseta-leaf", result.Value.Slug);
    }

    [Fact]
    public async Task CreateAsync_Should_Fail_When_Category_Not_Found()
    {
        var request = new CreateProductRequest(
            "Produto", null, 1000, 10, Guid.NewGuid(), null);

        var result = await _service.CreateAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Categoria", result.Error!);
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Product()
    {
        var category = await SeedCategoryAsync();
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Produto Teste",
            Slug = "produto-teste",
            PriceInCents = 1000,
            Stock = 10,
            CategoryId = category.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var result = await _service.GetByIdAsync(product.Id, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(product.Id, result!.Id);
        Assert.Equal("Produto Teste", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Null_When_Not_Found()
    {
        var result = await _service.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetBySlugAsync_Should_Return_Product()
    {
        var category = await SeedCategoryAsync();
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Produto Slug",
            Slug = "produto-slug",
            PriceInCents = 2000,
            Stock = 5,
            CategoryId = category.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var result = await _service.GetBySlugAsync("produto-slug", CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("produto-slug", result!.Slug);
    }

    [Fact]
    public async Task UpdateAsync_Should_Update_Product()
    {
        var category = await SeedCategoryAsync();
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Original",
            Slug = "original",
            PriceInCents = 1000,
            Stock = 10,
            CategoryId = category.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var request = new UpdateProductRequest(
            "Atualizado", null, 2000, null, null, null);

        var result = await _service.UpdateAsync(product.Id, request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Atualizado", result.Value!.Name);
        Assert.Equal(2000, result.Value.PriceInCents);
    }

    [Fact]
    public async Task UpdateAsync_Should_Fail_When_Not_Found()
    {
        var request = new UpdateProductRequest("Novo", null, null, null, null, null);

        var result = await _service.UpdateAsync(Guid.NewGuid(), request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Produto", result.Error!);
    }

    [Fact]
    public async Task DeleteAsync_Should_Remove_Product()
    {
        var category = await SeedCategoryAsync();
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Para Deletar",
            Slug = "para-deletar",
            PriceInCents = 500,
            Stock = 1,
            CategoryId = category.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var deleted = await _service.DeleteAsync(product.Id, CancellationToken.None);

        Assert.True(deleted.IsSuccess);
        Assert.Null(await _db.Products.FindAsync(product.Id));
    }

    [Fact]
    public async Task DeleteAsync_Should_Return_False_When_Not_Found()
    {
        var deleted = await _service.DeleteAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.False(deleted.IsSuccess);
    }

    [Fact]
    public async Task GetAllAsync_Should_Paginate()
    {
        var category = await SeedCategoryAsync();
        for (int i = 0; i < 25; i++)
        {
            _db.Products.Add(new Product
            {
                Id = Guid.NewGuid(),
                Name = $"Produto {i}",
                Slug = $"produto-{i}",
                PriceInCents = 1000 + i,
                Stock = 10,
                CategoryId = category.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-i),
                UpdatedAt = DateTime.UtcNow,
            });
        }
        await _db.SaveChangesAsync();

        var result = await _service.GetAllAsync(1, 10, null, null, null, true, CancellationToken.None);

        Assert.Equal(25, result.TotalCount);
        Assert.Equal(10, result.Items.Count);
        Assert.Equal(1, result.Page);
    }

    [Fact]
    public async Task GetAllAsync_Should_Filter_By_Category()
    {
        var cat1 = await SeedCategoryAsync();
        var cat2 = new Category
        {
            Id = Guid.NewGuid(), Name = "Calçados", Slug = "calcados",
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _db.Categories.Add(cat2);

        _db.Products.Add(new Product
        {
            Id = Guid.NewGuid(), Name = "P1", Slug = "p1", PriceInCents = 1000,
            Stock = 10, CategoryId = cat1.Id, IsActive = true,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        });
        _db.Products.Add(new Product
        {
            Id = Guid.NewGuid(), Name = "P2", Slug = "p2", PriceInCents = 2000,
            Stock = 5, CategoryId = cat2.Id, IsActive = true,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();

        var result = await _service.GetAllAsync(1, 20, null, cat1.Id, null, true, CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Single(result.Items);
    }

    [Fact]
    public async Task CreateAsync_Should_Create_Product_With_Images()
    {
        var category = await SeedCategoryAsync();
        var images = new List<CreateProductImageRequest>
        {
            new("https://example.com/img1.jpg", "Imagem 1", 0),
            new("https://example.com/img2.jpg", "Imagem 2", 1),
        };
        var request = new CreateProductRequest(
            "Com Imagens", null, 3000, 20, category.Id, images);

        var result = await _service.CreateAsync(request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value!.Images.Count);
    }
}
