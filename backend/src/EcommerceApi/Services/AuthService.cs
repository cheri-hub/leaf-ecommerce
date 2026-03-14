using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace EcommerceApi.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    IConfiguration config,
    ILogger<AuthService> logger)
{
    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return Result<AuthResponse>.Failure("E-mail já cadastrado");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            TaxId = request.TaxId,
            CreatedAt = DateTime.UtcNow,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return Result<AuthResponse>.Failure(errors);
        }

        await userManager.AddToRoleAsync(user, "Customer");
        logger.LogInformation("Usuário {UserId} registrado: {Email}", user.Id, user.Email);

        var authResponse = await GenerateAuthResponseAsync(user);
        return Result<AuthResponse>.Success(authResponse);
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result<AuthResponse>.Failure("Credenciais inválidas");

        var validPassword = await userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
            return Result<AuthResponse>.Failure("Credenciais inválidas");

        logger.LogInformation("Usuário {UserId} autenticado", user.Id);

        var authResponse = await GenerateAuthResponseAsync(user);
        return Result<AuthResponse>.Success(authResponse);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(ApplicationUser user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(24);
        var token = await GenerateJwtTokenAsync(user, expiresAt);

        return new AuthResponse(
            token,
            expiresAt,
            new UserResponse(user.Id, user.FullName, user.Email!, user.Phone, user.TaxId));
    }

    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user, DateTime expiresAt)
    {
        var roles = await userManager.GetRolesAsync(user);

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Secret"]
                ?? throw new InvalidOperationException("Jwt:Secret not configured")));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
