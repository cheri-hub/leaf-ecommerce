using EcommerceApi.Data;
using EcommerceApi.Jobs;
using EcommerceApi.Models.AbacatePay;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Services;

public sealed class OrderService(
    AppDbContext db,
    AbacatePayClient abacatePay,
    IConfiguration config,
    IBackgroundJobClient backgroundJobs,
    ILogger<OrderService> logger)
{
    public async Task<Result<CreateOrderResponse>> CreateAsync(
        CreateOrderRequest request, string? userId, CancellationToken ct)
    {
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(ct);

        if (products.Count != productIds.Count)
            return Result<CreateOrderResponse>.Failure("Um ou mais produtos não encontrados ou inativos");

        // Validar estoque
        foreach (var item in request.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);
            if (product.Stock < item.Quantity)
                return Result<CreateOrderResponse>.Failure($"Estoque insuficiente para '{product.Name}'. Disponível: {product.Stock}");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        // Criar pedido
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = OrderStatus.Pending,
            CustomerName = request.Customer.Name,
            CustomerEmail = request.Customer.Email,
            CustomerPhone = request.Customer.Phone,
            CustomerTaxId = request.Customer.TaxId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var billingProducts = new List<BillingProduct>();
        var totalCents = 0;

        foreach (var item in request.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);

            order.Items.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPriceInCents = product.PriceInCents,
            });

            billingProducts.Add(new BillingProduct
            {
                Name = product.Name,
                Description = product.Description,
                Quantity = item.Quantity,
                Price = product.PriceInCents,
                ExternalId = product.Id.ToString(),
            });

            totalCents += product.PriceInCents * item.Quantity;

            // Reservar estoque
            product.Stock -= item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        order.TotalInCents = totalCents;

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Pedido {OrderId} criado, total {TotalCents} centavos", order.Id, totalCents);

        // Criar cobrança na AbacatePay
        var frontendUrl = config["App:FrontendUrl"] ?? "http://localhost:3003";
        var customerTaxId = new string((request.Customer.TaxId ?? "").Where(char.IsDigit).ToArray());
        logger.LogInformation("Enviando cobrança para AbacatePay - Pedido {OrderId}, TaxId: {TaxId}",
            order.Id, customerTaxId);
        var billingRequest = new CreateBillingRequest
        {
            Frequency = "ONE_TIME",
            Methods = ["PIX"],
            Products = billingProducts,
            ReturnUrl = $"{frontendUrl}/orders/{order.Id}",
            CompletionUrl = $"{frontendUrl}/orders/{order.Id}/confirmation",
            Customer = new BillingCustomer
            {
                Name = request.Customer.Name,
                Email = request.Customer.Email,
                Cellphone = request.Customer.Phone ?? "",
                TaxId = customerTaxId,
            },
            ExternalId = order.Id.ToString(),
            AllowCoupons = !string.IsNullOrWhiteSpace(request.CouponCode),
            Coupons = string.IsNullOrWhiteSpace(request.CouponCode)
                ? null
                : [request.CouponCode.Trim().ToUpperInvariant()],
        };

        try
        {
            var billingResponse = await abacatePay.PostAsync<BillingResponse>(
                "/v1/billing/create", billingRequest, ct);

            if (billingResponse.Data is not null)
            {
                order.AbacatePayBillingId = billingResponse.Data.Id;
                order.AbacatePayBillingUrl = billingResponse.Data.Url;
                await db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                logger.LogInformation("Cobrança {BillingId} criada para pedido {OrderId}",
                    billingResponse.Data.Id, order.Id);

                return Result<CreateOrderResponse>.Success(
                    new CreateOrderResponse(order.Id, billingResponse.Data.Url));
            }

            logger.LogWarning("AbacatePay retornou erro para pedido {OrderId}: {Error}",
                order.Id, billingResponse.Error);
            await transaction.RollbackAsync(ct);
            return Result<CreateOrderResponse>.Failure(
                "Erro ao processar pagamento. Tente novamente.");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao criar cobrança no AbacatePay para pedido {OrderId}", order.Id);
            await transaction.RollbackAsync(ct);
            return Result<CreateOrderResponse>.Failure(
                "Erro ao se comunicar com o serviço de pagamento. Tente novamente.");
        }
    }

    public async Task<OrderResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await db.Orders
            .Include(o => o.Items)
            .Where(o => o.Id == id)
            .Select(o => new OrderResponse(
                o.Id,
                o.Status.ToString(),
                o.TotalInCents,
                o.CustomerName,
                o.CustomerEmail,
                o.CreatedAt,
                o.PaidAt,
                o.Items.Select(i => new OrderItemResponse(
                    i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPriceInCents
                )).ToList()
            ))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<PaginatedResponse<OrderResponse>> GetAllAsync(
        int page, int pageSize, string? userId, OrderStatus? status, CancellationToken ct)
    {
        var query = db.Orders.Include(o => o.Items).AsQueryable();

        if (userId is not null)
            query = query.Where(o => o.UserId == userId);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        var totalCount = await query.CountAsync(ct);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderResponse(
                o.Id,
                o.Status.ToString(),
                o.TotalInCents,
                o.CustomerName,
                o.CustomerEmail,
                o.CreatedAt,
                o.PaidAt,
                o.Items.Select(i => new OrderItemResponse(
                    i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPriceInCents
                )).ToList()
            ))
            .ToListAsync(ct);

        return new PaginatedResponse<OrderResponse>(orders, totalCount, page, pageSize);
    }

    public async Task<bool> ConfirmPaymentAsync(WebhookData data, CancellationToken ct)
    {
        var order = await db.Orders.FirstOrDefaultAsync(
            o => o.AbacatePayBillingId == data.Id, ct);

        if (order is null)
        {
            logger.LogWarning("Webhook billing.paid recebido para billing {BillingId} sem pedido correspondente", data.Id);
            return false;
        }

        // Idempotência
        if (order.Status == OrderStatus.Paid)
        {
            logger.LogInformation("Webhook billing.paid duplicado para pedido {OrderId}, ignorando", order.Id);
            return true;
        }

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        backgroundJobs.Enqueue<SendEmailJob>(job =>
            job.ExecuteAsync(
                order.CustomerEmail,
                "Pedido confirmado",
                $"Seu pedido #{order.Id} foi confirmado com sucesso!",
                CancellationToken.None));

        logger.LogInformation("Pedido {OrderId} confirmado via webhook", order.Id);
        return true;
    }

    public async Task<bool> ProcessRefundAsync(WebhookData data, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.AbacatePayBillingId == data.Id, ct);

        if (order is null)
        {
            logger.LogWarning("Webhook billing.refunded recebido para billing {BillingId} sem pedido correspondente", data.Id);
            return false;
        }

        if (order.Status == OrderStatus.Refunded)
        {
            logger.LogInformation("Webhook billing.refunded duplicado para pedido {OrderId}, ignorando", order.Id);
            return true;
        }

        order.Status = OrderStatus.Refunded;
        order.UpdatedAt = DateTime.UtcNow;

        // Devolver estoque
        foreach (var item in order.Items)
        {
            var product = await db.Products.FindAsync([item.ProductId], ct);
            if (product is not null)
            {
                product.Stock += item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Pedido {OrderId} reembolsado, estoque devolvido", order.Id);
        return true;
    }

    public async Task<bool> MarkAsFailedAsync(WebhookData data, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.AbacatePayBillingId == data.Id, ct);

        if (order is null) return false;

        if (order.Status is OrderStatus.Failed or OrderStatus.Cancelled)
            return true;

        order.Status = OrderStatus.Failed;
        order.UpdatedAt = DateTime.UtcNow;

        // Liberar estoque reservado
        foreach (var item in order.Items)
        {
            var product = await db.Products.FindAsync([item.ProductId], ct);
            if (product is not null)
            {
                product.Stock += item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Pedido {OrderId} marcado como falho, estoque liberado", order.Id);
        return true;
    }

    public async Task<Result<string>> SyncPaymentStatusAsync(Guid orderId, CancellationToken ct)
    {
        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order is null)
            return Result<string>.Failure("Pedido não encontrado");

        if (string.IsNullOrEmpty(order.AbacatePayBillingId))
            return Result<string>.Failure("Pedido sem cobrança vinculada");

        if (order.Status == OrderStatus.Paid)
            return Result<string>.Success("Pedido já está pago");

        try
        {
            var billings = await abacatePay.GetAsync<List<BillingResponse>>(
                "/v1/billing/list", ct);

            var billing = billings.Data?.FirstOrDefault(b => b.Id == order.AbacatePayBillingId);
            if (billing is null)
                return Result<string>.Failure("Cobrança não encontrada no AbacatePay");

            logger.LogInformation("Status da cobrança {BillingId}: {Status}",
                billing.Id, billing.Status);

            if (billing.Status is "PAID" or "COMPLETED")
            {
                order.Status = OrderStatus.Paid;
                order.PaidAt = DateTime.UtcNow;
                order.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync(ct);
                return Result<string>.Success("Pagamento confirmado");
            }

            return Result<string>.Success($"Status atual: {billing.Status}");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Falha ao consultar AbacatePay para pedido {OrderId}", orderId);
            return Result<string>.Failure("Erro ao consultar AbacatePay");
        }
    }
}
