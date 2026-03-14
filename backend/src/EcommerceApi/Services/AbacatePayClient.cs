using System.Text.Json;
using EcommerceApi.Models.AbacatePay;

namespace EcommerceApi.Services;

public sealed class AbacatePayClient(HttpClient http, ILogger<AbacatePayClient> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerOptions.Web)
    {
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public async Task<AbacatePayResponse<T>> PostAsync<T>(
        string endpoint, object request, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync(endpoint, request, JsonOptions, ct);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("AbacatePay POST {Endpoint} retornou {StatusCode}: {Body}",
                endpoint, (int)response.StatusCode, errorBody);
            throw new HttpRequestException(
                $"AbacatePay API error {(int)response.StatusCode}: {errorBody}");
        }

        return await response.Content.ReadFromJsonAsync<AbacatePayResponse<T>>(JsonOptions, ct)
            ?? throw new InvalidOperationException("Null response from AbacatePay");
    }

    public async Task<AbacatePayResponse<T>> GetAsync<T>(
        string endpoint, CancellationToken ct = default)
    {
        var response = await http.GetAsync(endpoint, ct);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("AbacatePay GET {Endpoint} retornou {StatusCode}: {Body}",
                endpoint, (int)response.StatusCode, errorBody);
            throw new HttpRequestException(
                $"AbacatePay API error {(int)response.StatusCode}: {errorBody}");
        }

        return await response.Content.ReadFromJsonAsync<AbacatePayResponse<T>>(JsonOptions, ct)
            ?? throw new InvalidOperationException("Null response from AbacatePay");
    }
}
