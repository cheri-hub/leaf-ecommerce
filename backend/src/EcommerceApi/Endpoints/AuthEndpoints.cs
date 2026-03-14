using System.Security.Claims;
using EcommerceApi.Models.Domain;
using EcommerceApi.Models.DTOs;
using EcommerceApi.Services;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace EcommerceApi.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", Register).RequireRateLimiting("auth");
        group.MapPost("/login", Login).RequireRateLimiting("auth");
        group.MapPost("/logout", Logout).RequireAuthorization();
        group.MapGet("/me", GetMe).RequireAuthorization();
        group.MapPut("/profile", UpdateProfile).RequireAuthorization();
        group.MapPut("/password", ChangePassword).RequireAuthorization();
        group.MapPost("/forgot-password", ForgotPassword).RequireRateLimiting("auth");
        group.MapPost("/reset-password", ResetPassword).RequireRateLimiting("auth");
    }

    private static async Task<IResult> Register(
        RegisterRequest request,
        AuthService service,
        IValidator<RegisterRequest> validator,
        HttpContext httpContext,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var result = await service.RegisterAsync(request, ct);
        if (!result.IsSuccess)
            return Results.BadRequest(new ErrorResponse(result.Error!));

        SetAuthCookie(httpContext, result.Value!, env);
        return Results.Ok(result.Value);
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        AuthService service,
        IValidator<LoginRequest> validator,
        HttpContext httpContext,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var result = await service.LoginAsync(request, ct);
        if (!result.IsSuccess)
            return Results.Json(new ErrorResponse(result.Error!), statusCode: 401);

        SetAuthCookie(httpContext, result.Value!, env);
        return Results.Ok(result.Value);
    }

    private static IResult Logout(HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete("access_token", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Path = "/",
        });
        return Results.Ok();
    }

    private static async Task<IResult> GetMe(
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        CancellationToken ct)
    {
        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Results.NotFound();

        var roles = await userManager.GetRolesAsync(user);
        return Results.Ok(new UserResponse(user.Id, user.FullName, user.Email!, user.Phone, user.TaxId, roles.ToList()));
    }

    private static async Task<IResult> UpdateProfile(
        UpdateProfileRequest request,
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        IValidator<UpdateProfileRequest> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Results.NotFound();

        user.FullName = request.FullName;
        user.Phone = request.Phone;

        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var emailToken = await userManager.GenerateChangeEmailTokenAsync(user, request.Email);
            var emailResult = await userManager.ChangeEmailAsync(user, request.Email, emailToken);
            if (!emailResult.Succeeded)
                return Results.BadRequest(new ErrorResponse(
                    string.Join("; ", emailResult.Errors.Select(e => e.Description))));
            await userManager.SetUserNameAsync(user, request.Email);
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Results.BadRequest(new ErrorResponse(
                string.Join("; ", result.Errors.Select(e => e.Description))));

        var roles = await userManager.GetRolesAsync(user);
        return Results.Ok(new UserResponse(user.Id, user.FullName, user.Email!, user.Phone, user.TaxId, roles.ToList()));
    }

    private static async Task<IResult> ChangePassword(
        ChangePasswordRequest request,
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        IValidator<ChangePasswordRequest> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Results.NotFound();

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            return Results.BadRequest(new ErrorResponse(
                string.Join("; ", result.Errors.Select(e => e.Description))));

        return Results.Ok(new { message = "Senha alterada com sucesso" });
    }

    private static async Task<IResult> ForgotPassword(
        ForgotPasswordRequest request,
        UserManager<ApplicationUser> userManager,
        IValidator<ForgotPasswordRequest> validator,
        ILogger<AuthService> logger,
        IConfiguration config,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is not null)
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var frontendUrl = config["App:FrontendUrl"] ?? "http://localhost:3003";
            var resetUrl = $"{frontendUrl}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(token)}";

            // TODO: Send email via Hangfire job
            logger.LogInformation("Password reset requested for {Email}. Reset URL: {ResetUrl}", user.Email, resetUrl);
        }

        // Always return OK to prevent email enumeration
        return Results.Ok(new { message = "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha." });
    }

    private static async Task<IResult> ResetPassword(
        ResetPasswordRequest request,
        UserManager<ApplicationUser> userManager,
        IValidator<ResetPasswordRequest> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Results.BadRequest(new ErrorResponse("Não foi possível redefinir a senha. Verifique os dados e tente novamente."));

        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return Results.BadRequest(new ErrorResponse(
                string.Join("; ", result.Errors.Select(e => e.Description))));

        return Results.Ok(new { message = "Senha redefinida com sucesso!" });
    }

    private static void SetAuthCookie(HttpContext httpContext, AuthResponse auth, IWebHostEnvironment env)
    {
        httpContext.Response.Cookies.Append("access_token", auth.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !env.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = auth.ExpiresAt,
            Path = "/",
        });
    }
}
