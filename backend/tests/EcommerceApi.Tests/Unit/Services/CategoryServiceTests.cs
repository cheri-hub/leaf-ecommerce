using EcommerceApi.Data;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace EcommerceApi.Tests.Unit.Services;

public class CategoryServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);
        var logger = Substitute.For<ILogger<CategoryService>>();
        _service = new CategoryService(_db, logger);
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task CreateAsync_Should_Create_Category()
    {
        var request = new CreateCategoryRequest("Eletrônicos", "Produtos eletrônicos");

        var result = await _service.CreateAsync(request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Eletrônicos", result.Value!.Name);
        Assert.Equal("eletronicos", result.Value.Slug);
    }

    [Fact]
    public async Task CreateAsync_Should_Fail_When_Slug_Already_Exists()
    {
        _db.Categories.Add(new Category
        {
            Id = Guid.NewGuid(), Name = "Roupas", Slug = "roupas",
            IsActive = true, CreatedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();

        var request = new CreateCategoryRequest("Roupas", null);

        var result = await _service.CreateAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Já existe", result.Error!);
    }

    [Fact]
    public async Task GetAllAsync_Should_Return_Active_Categories()
    {
        _db.Categories.AddRange(
            new Category
            {
                Id = Guid.NewGuid(), Name = "Ativa", Slug = "ativa",
                IsActive = true, CreatedAt = DateTime.UtcNow,
            },
            new Category
            {
                Id = Guid.NewGuid(), Name = "Inativa", Slug = "inativa",
                IsActive = false, CreatedAt = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var result = await _service.GetAllAsync(true, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Ativa", result[0].Name);
    }

    [Fact]
    public async Task GetAllAsync_Should_Return_All_When_ActiveOnly_False()
    {
        _db.Categories.AddRange(
            new Category
            {
                Id = Guid.NewGuid(), Name = "A", Slug = "a",
                IsActive = true, CreatedAt = DateTime.UtcNow,
            },
            new Category
            {
                Id = Guid.NewGuid(), Name = "B", Slug = "b",
                IsActive = false, CreatedAt = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var result = await _service.GetAllAsync(false, CancellationToken.None);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task UpdateAsync_Should_Update_Category()
    {
        var category = new Category
        {
            Id = Guid.NewGuid(), Name = "Original", Slug = "original",
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        var request = new UpdateCategoryRequest("Atualizada", "Nova descrição", null);
        var result = await _service.UpdateAsync(category.Id, request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Atualizada", result.Value!.Name);
    }

    [Fact]
    public async Task UpdateAsync_Should_Fail_When_Not_Found()
    {
        var request = new UpdateCategoryRequest("Teste", null, null);
        var result = await _service.UpdateAsync(Guid.NewGuid(), request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Categoria", result.Error!);
    }

    [Fact]
    public async Task DeleteAsync_Should_Remove_Category()
    {
        var category = new Category
        {
            Id = Guid.NewGuid(), Name = "Para Deletar", Slug = "para-deletar",
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        var deleted = await _service.DeleteAsync(category.Id, CancellationToken.None);

        Assert.True(deleted);
    }

    [Fact]
    public async Task DeleteAsync_Should_Fail_When_Has_Products()
    {
        var category = new Category
        {
            Id = Guid.NewGuid(), Name = "Com Produtos", Slug = "com-produtos",
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _db.Categories.Add(category);
        _db.Products.Add(new Product
        {
            Id = Guid.NewGuid(), Name = "P1", Slug = "p1", PriceInCents = 1000,
            Stock = 1, CategoryId = category.Id, IsActive = true,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();

        var deleted = await _service.DeleteAsync(category.Id, CancellationToken.None);

        Assert.False(deleted);
    }
}
