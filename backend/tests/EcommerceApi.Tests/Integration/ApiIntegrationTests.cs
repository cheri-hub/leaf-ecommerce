using System.Net;
using System.Net.Http.Json;
using EcommerceApi.Data;
using Hangfire;
using Hangfire.InMemory;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EcommerceApi.Tests.Integration;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove all EF Core and Npgsql registrations to avoid dual provider conflict
            var descriptorsToRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType == typeof(AppDbContext) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericTypeDefinition().FullName?.Contains("EntityFrameworkCore") == true) ||
                    d.ServiceType.FullName?.Contains("Npgsql") == true ||
                    d.ImplementationType?.FullName?.Contains("Npgsql") == true)
                .ToList();
            foreach (var d in descriptorsToRemove)
                services.Remove(d);

            // Add in-memory database
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}"));

            // Override Hangfire to use in-memory storage
            services.AddHangfire(config => config.UseInMemoryStorage());
        });
    }
}

public class HealthCheckTests(TestWebApplicationFactory factory)
    : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task Health_Endpoint_Returns_Ok()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class OpenApiTests(TestWebApplicationFactory factory)
    : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task OpenApi_Endpoint_Returns_Ok()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("openapi", content);
    }
}

public class AuthEndpointTests(TestWebApplicationFactory factory)
    : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task Login_With_Invalid_Body_Returns_ValidationError()
    {
        var client = factory.CreateClient();
        var request = new { Email = "", Password = "" };

        var response = await client.PostAsJsonAsync("/api/auth/login", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_Without_Auth_Returns_Unauthorized()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
