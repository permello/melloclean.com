// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.Options;
using MelloClean.Server.Auth;
using MelloClean.Server.Configuration;

var builder = WebApplication.CreateBuilder(args);
var serverApiKey = Environment.GetEnvironmentVariable("APPWRITE_SESSION_API_KEY");
if (string.IsNullOrWhiteSpace(serverApiKey))
    serverApiKey = Environment.GetEnvironmentVariable("APPWRITE_ACCOUNT_CREATION_API_KEY");
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["Server:Port"] = Environment.GetEnvironmentVariable("PORT"),
    ["Appwrite:Endpoint"] = Environment.GetEnvironmentVariable("APPWRITE_ENDPOINT"),
    ["Appwrite:ProjectId"] = Environment.GetEnvironmentVariable("APPWRITE_PROJECT_ID"),
    ["Appwrite:ServerApiKey"] = serverApiKey
}.Where(pair => !string.IsNullOrWhiteSpace(pair.Value))!);
var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (corsOrigins is not null) builder.Configuration.AddInMemoryCollection(corsOrigins.Select((origin, index) => new KeyValuePair<string, string?>($"Server:CorsOrigins:{index}", origin)));
builder.WebHost.UseUrls($"http://0.0.0.0:{builder.Configuration.GetValue("Server:Port", 5000)}");
builder.Services.AddOptions<ServerOptions>().Bind(builder.Configuration.GetSection(ServerOptions.SectionName)).ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<AppwriteOptions>().Bind(builder.Configuration.GetSection(AppwriteOptions.SectionName)).ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddHttpClient<IAppwriteGateway, AppwriteGateway>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddAuthentication(SessionAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, SessionAuthenticationHandler>(SessionAuthenticationHandler.SchemeName, null);
builder.Services.AddAuthorization(options =>
{
    foreach (var team in new[] { "CLIENT", "WORKER", "ADMIN" }) options.AddPolicy(team, policy => policy.RequireRole(team));
});
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    var origins = builder.Configuration.GetSection("Server:CorsOrigins").Get<string[]>() ?? [];
    if (origins.Length > 0) policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
}));
builder.Services.AddProblemDetails();

var app = builder.Build();
app.UseExceptionHandler(handler => handler.Run(async context =>
{
    var error = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    context.Response.StatusCode = error is AppwriteException { Kind: UpstreamFailureKind.Unavailable } ? 502 : 500;
    await Results.Problem(statusCode: context.Response.StatusCode, title: "The request could not be completed.").ExecuteAsync(context);
}));
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers.Origin.ToString();
    if (!string.IsNullOrWhiteSpace(origin))
    {
        var allowedOrigins = context.RequestServices.GetRequiredService<IOptions<ServerOptions>>().Value.CorsOrigins;
        if (!allowedOrigins.Contains(origin, StringComparer.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }
    }
    await next();
});
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

var api = app.MapGroup("/api");
api.MapGet("/health", () => Results.Ok(new { status = "ok" }));
var auth = api.MapGroup("/auth");
auth.MapPost("/signup", async (SignupRequest request, IAuthService service, HttpContext context) =>
{
    if (!IsValid(request, out var errors)) return Results.ValidationProblem(errors);
    try
    {
        var result = await service.SignupAsync(request, context.RequestAborted);
        SetSessionCookie(context, result.Session);
        return Results.Created("/api/auth/me", result.Identity);
    }
    catch (AppwriteException exception) when (exception.Kind == UpstreamFailureKind.Conflict)
    { return Results.Conflict(new { error = "An account with that email already exists." }); }
});
auth.MapPost("/login", async (LoginRequest request, IAuthService service, HttpContext context) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@') || request.Password.Length < 8)
        return Results.BadRequest(new { error = "Invalid request." });
    try
    {
        var result = await service.LoginAsync(request, context.RequestAborted);
        SetSessionCookie(context, result.Session);
        return Results.Ok(result.Identity);
    }
    catch (AppwriteException exception) when (exception.Kind == UpstreamFailureKind.InvalidCredentials)
    { return Results.Json(new { error = "Invalid email or password." }, statusCode: 401); }
});
auth.MapGet("/me", (HttpContext context) => Results.Ok(context.Items[nameof(AuthenticatedIdentity)])).RequireAuthorization();
api.MapGet("/auth/admin-check", () => Results.NoContent()).RequireAuthorization("ADMIN");
auth.MapPost("/logout", async (IAuthService service, HttpContext context) =>
{
    if (context.Request.Cookies.TryGetValue("session", out var secret))
        try { await service.LogoutAsync(secret, context.RequestAborted); } catch (AppwriteException) { }
    context.Response.Cookies.Delete("session", CookieOptions(context));
    return Results.NoContent();
});
app.Run();

static bool IsValid(SignupRequest request, out Dictionary<string, string[]> errors)
{
    errors = [];
    if (string.IsNullOrWhiteSpace(request.FirstName)) errors["firstName"] = ["First name is required."];
    if (string.IsNullOrWhiteSpace(request.LastName)) errors["lastName"] = ["Last name is required."];
    if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@')) errors["email"] = ["Email is invalid."];
    if (request.Password.Length < 8) errors["password"] = ["Password must be at least 8 characters."];
    if (request.Password != request.ConfirmPassword) errors["confirmPassword"] = ["Passwords do not match."];
    return errors.Count == 0;
}

static CookieOptions CookieOptions(HttpContext context, DateTimeOffset? expires = null) => new()
{
    HttpOnly = true,
    SameSite = SameSiteMode.Strict,
    Path = "/",
    Secure = !context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment(),
    Expires = expires
};
static void SetSessionCookie(HttpContext context, SessionResult session) =>
    context.Response.Cookies.Append("session", session.Secret, CookieOptions(context, session.ExpiresAt));

public partial class Program { }
