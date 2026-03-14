using EcommerceApi.Data;
using EcommerceApi.Models.AbacatePay;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace EcommerceApi.Tests.Unit.Services;

public class OrderServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly OrderService _service;
    private readonly AbacatePayClient _abacatePayClient;
    private readonly IBackgroundJobClient _backgroundJobs;

    public OrderServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);

        var httpClient = new HttpClient { BaseAddress = new Uri("https://api.abacatepay.com") };
        var abacatePayLogger = Substitute.For<ILogger<AbacatePayClient>>();
        _abacatePayClient = new AbacatePayClient(httpClient, abacatePayLogger);

        var config = Substitute.For<IConfiguration>();
        config["App:FrontendUrl"].Returns("http://localhost:3003");

        _backgroundJobs = Substitute.For<IBackgroundJobClient>();
        var logger = Substitute.For<ILogger<OrderService>>();

        _service = new OrderService(_db, _abacatePayClient, config, _backgroundJobs, logger);
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    private async Task<(Category Category, Product Product)> SeedProductAsync(int stock = 50)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(), Name = "Cat", Slug = "cat",
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        var product = new Product
        {
            Id = Guid.NewGuid(), Name = "Produto", Slug = "produto",
            PriceInCents = 5000, Stock = stock, CategoryId = category.Id,
            IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        };
        _db.Categories.Add(category);
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return (category, product);
    }

    [Fact]
    public async Task ConfirmPaymentAsync_Should_Update_Order_Status()
    {
        var (_, product) = await SeedProductAsync();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Pending,
            TotalInCents = 10000,
            CustomerName = "João",
            CustomerEmail = "joao@email.com",
            AbacatePayBillingId = "bill_123",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var webhookData = new WebhookData { Id = "bill_123", Amount = 10000, Status = "PAID" };

        var result = await _service.ConfirmPaymentAsync(webhookData, CancellationToken.None);

        Assert.True(result);
        var updated = await _db.Orders.FindAsync(order.Id);
        Assert.Equal(OrderStatus.Paid, updated!.Status);
        Assert.NotNull(updated.PaidAt);
    }

    [Fact]
    public async Task ConfirmPaymentAsync_Should_Be_Idempotent()
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Paid,
            TotalInCents = 5000,
            CustomerName = "Maria",
            CustomerEmail = "maria@email.com",
            AbacatePayBillingId = "bill_456",
            PaidAt = DateTime.UtcNow.AddMinutes(-5),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var webhookData = new WebhookData { Id = "bill_456" };

        var result = await _service.ConfirmPaymentAsync(webhookData, CancellationToken.None);

        Assert.True(result);
    }

    [Fact]
    public async Task ConfirmPaymentAsync_Should_Return_False_When_Order_Not_Found()
    {
        var webhookData = new WebhookData { Id = "bill_nonexistent" };

        var result = await _service.ConfirmPaymentAsync(webhookData, CancellationToken.None);

        Assert.False(result);
    }

    [Fact]
    public async Task ProcessRefundAsync_Should_Restore_Stock()
    {
        var (_, product) = await SeedProductAsync(stock: 10);
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Paid,
            TotalInCents = 10000,
            CustomerName = "João",
            CustomerEmail = "joao@email.com",
            AbacatePayBillingId = "bill_789",
            PaidAt = DateTime.UtcNow.AddHours(-1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items = [new OrderItem
            {
                Id = Guid.NewGuid(), ProductId = product.Id,
                ProductName = "Produto", Quantity = 3, UnitPriceInCents = 5000,
            }],
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var webhookData = new WebhookData { Id = "bill_789" };

        var result = await _service.ProcessRefundAsync(webhookData, CancellationToken.None);

        Assert.True(result);
        var updatedOrder = await _db.Orders.FindAsync(order.Id);
        Assert.Equal(OrderStatus.Refunded, updatedOrder!.Status);
        var updatedProduct = await _db.Products.FindAsync(product.Id);
        Assert.Equal(13, updatedProduct!.Stock); // 10 + 3
    }

    [Fact]
    public async Task MarkAsFailedAsync_Should_Release_Stock()
    {
        var (_, product) = await SeedProductAsync(stock: 5);
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Pending,
            TotalInCents = 5000,
            CustomerName = "Pedro",
            CustomerEmail = "pedro@email.com",
            AbacatePayBillingId = "bill_fail",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items = [new OrderItem
            {
                Id = Guid.NewGuid(), ProductId = product.Id,
                ProductName = "Produto", Quantity = 2, UnitPriceInCents = 5000,
            }],
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var webhookData = new WebhookData { Id = "bill_fail" };

        var result = await _service.MarkAsFailedAsync(webhookData, CancellationToken.None);

        Assert.True(result);
        var updatedProduct = await _db.Products.FindAsync(product.Id);
        Assert.Equal(7, updatedProduct!.Stock); // 5 + 2
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Order_With_Items()
    {
        var (_, product) = await SeedProductAsync();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Paid,
            TotalInCents = 15000,
            CustomerName = "Ana",
            CustomerEmail = "ana@email.com",
            PaidAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items = [new OrderItem
            {
                Id = Guid.NewGuid(), ProductId = product.Id,
                ProductName = "Produto", Quantity = 3, UnitPriceInCents = 5000,
            }],
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var result = await _service.GetByIdAsync(order.Id, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(order.Id, result!.Id);
        Assert.Single(result.Items);
        Assert.Equal("Produto", result.Items[0].ProductName);
    }

    [Fact]
    public async Task GetAllAsync_Should_Filter_By_Status()
    {
        _db.Orders.AddRange(
            new Order
            {
                Id = Guid.NewGuid(), Status = OrderStatus.Paid,
                TotalInCents = 1000, CustomerName = "A", CustomerEmail = "a@a.com",
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
            },
            new Order
            {
                Id = Guid.NewGuid(), Status = OrderStatus.Pending,
                TotalInCents = 2000, CustomerName = "B", CustomerEmail = "b@b.com",
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var result = await _service.GetAllAsync(1, 20, null, OrderStatus.Paid, CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Single(result.Items);
        Assert.Equal("Paid", result.Items[0].Status);
    }
}
