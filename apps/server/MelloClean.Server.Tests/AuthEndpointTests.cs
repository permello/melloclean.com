// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MelloClean.Server.Auth;

namespace MelloClean.Server.Tests;

public sealed class AuthEndpointTests
{
    [Fact]
    public async Task HealthExistsOnlyUnderApi()
    {
        await using var factory = new ServerFactory();
        using var client = factory.CreateClient();

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/health", TestContext.Current.CancellationToken)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/health", TestContext.Current.CancellationToken)).StatusCode);
    }

    [Fact]
    public async Task DevelopmentLoginSetsStrictHttpOnlyCookieWithoutExposingSecret()
    {
        await using var factory = new ServerFactory("Development");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("user@example.com", "password"), TestContext.Current.CancellationToken);
        var cookie = response.Headers.GetValues("Set-Cookie").Single();
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("session=session-secret", cookie);
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("path=/", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("secure", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("session-secret", body);
        Assert.Contains("\"emailVerified\":true", body);
    }

    [Fact]
    public async Task ProductionLoginSetsSecureCookie()
    {
        await using var factory = new ServerFactory("Production");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("user@example.com", "password"), TestContext.Current.CancellationToken);
        Assert.Contains("secure", response.Headers.GetValues("Set-Cookie").Single(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SignupValidatesInputAndMapsConflict()
    {
        await using var factory = new ServerFactory();
        using var client = factory.CreateClient();
        var invalid = await client.PostAsJsonAsync("/api/auth/signup",
            new SignupRequest("A", "B", "invalid", "short", "different"), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);

        factory.Auth.SignupFailure = new(UpstreamFailureKind.Conflict, "details that must not leak");
        var conflict = await client.PostAsJsonAsync("/api/auth/signup",
            new SignupRequest("A", "B", "a@b.com", "password", "password"), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);
        Assert.DoesNotContain("details that must not leak",
            await conflict.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task InvalidCredentialsAreGeneric()
    {
        await using var factory = new ServerFactory();
        factory.Auth.LoginFailure = new(UpstreamFailureKind.InvalidCredentials, "upstream account not found");
        using var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("user@example.com", "password"), TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain("account not found", body);
    }

    [Fact]
    public async Task AuthenticationAndTeamPolicyReturn401And403()
    {
        await using var factory = new ServerFactory();
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken)).StatusCode);

        using var teamRequest = new HttpRequestMessage(HttpMethod.Get, "/api/auth/admin-check");
        teamRequest.Headers.Add("Cookie", "session=session-secret");
        Assert.Equal(HttpStatusCode.Forbidden,
            (await client.SendAsync(teamRequest, TestContext.Current.CancellationToken)).StatusCode);
    }

    [Fact]
    public async Task CorsAllowsOnlyConfiguredExactOrigin()
    {
        await using var factory = new ServerFactory();
        using var client = factory.CreateClient();
        using var allowed = new HttpRequestMessage(HttpMethod.Options, "/api/auth/login");
        allowed.Headers.Add("Origin", "https://dashboard.example");
        allowed.Headers.Add("Access-Control-Request-Method", "POST");
        var allowedResponse = await client.SendAsync(allowed, TestContext.Current.CancellationToken);
        Assert.Equal("https://dashboard.example", allowedResponse.Headers.GetValues("Access-Control-Allow-Origin").Single());
        Assert.Equal("true", allowedResponse.Headers.GetValues("Access-Control-Allow-Credentials").Single());

        using var denied = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        denied.Headers.Add("Origin", "https://attacker.example");
        Assert.Equal(HttpStatusCode.Forbidden,
            (await client.SendAsync(denied, TestContext.Current.CancellationToken)).StatusCode);
    }

    [Fact]
    public async Task LogoutIsAlways204AndExpiresCookie()
    {
        await using var factory = new ServerFactory();
        factory.Auth.LogoutFailure = new(UpstreamFailureKind.Unavailable, "offline");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        request.Headers.Add("Cookie", "session=session-secret");
        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Contains("session=", response.Headers.GetValues("Set-Cookie").Single());
    }

    private sealed class ServerFactory(string environment = "Development") : WebApplicationFactory<Program>
    {
        public FakeAuthService Auth { get; } = new();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment(environment);
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Appwrite:Endpoint"] = "https://appwrite.example/v1",
                    ["Appwrite:ProjectId"] = "project-1",
                    ["Server:CorsOrigins:0"] = "https://dashboard.example"
                }));
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IAuthService>();
                services.AddSingleton<IAuthService>(Auth);
            });
        }
    }

    private sealed class FakeAuthService : IAuthService
    {
        private static readonly AuthenticatedIdentity Identity = new("user-1", "user@example.com", true, ["CLIENT"]);
        public AppwriteException? SignupFailure { get; set; }
        public AppwriteException? LoginFailure { get; set; }
        public AppwriteException? LogoutFailure { get; set; }

        public Task<(SessionResult Session, AuthenticatedIdentity Identity)> SignupAsync(SignupRequest request, CancellationToken cancellationToken) =>
            SignupFailure is null ? Success() : Task.FromException<(SessionResult, AuthenticatedIdentity)>(SignupFailure);
        public Task<(SessionResult Session, AuthenticatedIdentity Identity)> LoginAsync(LoginRequest request, CancellationToken cancellationToken) =>
            LoginFailure is null ? Success() : Task.FromException<(SessionResult, AuthenticatedIdentity)>(LoginFailure);
        public Task<AuthenticatedIdentity> ValidateSessionAsync(string secret, CancellationToken cancellationToken) => Task.FromResult(Identity);
        public Task LogoutAsync(string secret, CancellationToken cancellationToken) =>
            LogoutFailure is null ? Task.CompletedTask : Task.FromException(LogoutFailure);
        private static Task<(SessionResult, AuthenticatedIdentity)> Success() =>
            Task.FromResult<(SessionResult, AuthenticatedIdentity)>((new("session-secret", DateTimeOffset.UtcNow.AddHours(1)), Identity));
    }
}
