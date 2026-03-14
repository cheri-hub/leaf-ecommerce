using System.Security.Cryptography;
using System.Text;
using EcommerceApi.Models.AbacatePay;
using EcommerceApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;

namespace EcommerceApi.Endpoints;

public static class WebhookEndpoints
{
    public static void MapWebhookEndpoints(this WebApplication app)
    {
        app.MapPost("/api/webhooks/abacatepay", HandleAbacatePayWebhook)
            .WithTags("Webhooks")
            .AllowAnonymous()
            .RequireRateLimiting("webhook");
    }

    private static async Task<IResult> HandleAbacatePayWebhook(
        [FromQuery] string? webhookSecret,
        [FromBody] WebhookPayload payload,
        IConfiguration config,
        IHostEnvironment env,
        OrderService orderService,
        IDistributedCache cache,
        ILogger<WebhookPayload> logger,
        CancellationToken ct)
    {
        var expectedSecret = config["AbacatePay:WebhookSecret"] ?? "";

        if (expectedSecret is not "" and not "whsec_REPLACE_ME" &&
            !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(webhookSecret ?? ""),
                Encoding.UTF8.GetBytes(expectedSecret)))
        {
            logger.LogWarning("Webhook recebido com secret inválido");
            return Results.Unauthorized();
        }

        if (payload.DevMode && !env.IsDevelopment())
        {
            logger.LogInformation("Webhook devMode recebido em produção, ignorando");
            return Results.Ok();
        }

        logger.LogInformation("Webhook recebido: {Event} para billing {BillingId}",
            payload.Event, payload.Data.Id);

        // Deduplication via Redis
        var cacheKey = $"webhook:{payload.Event}:{payload.Data.Id}";
        var existing = await cache.GetStringAsync(cacheKey, ct);
        if (existing is not null)
        {
            logger.LogInformation("Webhook duplicado ignorado: {Event} para billing {BillingId}",
                payload.Event, payload.Data.Id);
            return Results.Ok();
        }

        await cache.SetStringAsync(cacheKey, "1", new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
        }, ct);

        var handled = payload.Event switch
        {
            "billing.paid" => await orderService.ConfirmPaymentAsync(payload.Data, ct),
            "billing.refunded" => await orderService.ProcessRefundAsync(payload.Data, ct),
            "billing.failed" => await orderService.MarkAsFailedAsync(payload.Data, ct),
            _ => true
        };

        return Results.Ok();
    }
}
