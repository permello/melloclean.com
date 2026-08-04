// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace MelloClean.Server.Auth;

public sealed class SessionAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IAuthService authService) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "AppwriteSession";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Cookies.TryGetValue("session", out var secret) || string.IsNullOrWhiteSpace(secret))
            return AuthenticateResult.NoResult();
        try
        {
            var identity = await authService.ValidateSessionAsync(secret, Context.RequestAborted);
            var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, identity.Id), new(ClaimTypes.Email, identity.Email) };
            claims.AddRange(identity.Teams.Select(team => new Claim(ClaimTypes.Role, team)));
            Context.Items[nameof(AuthenticatedIdentity)] = identity;
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName));
            return AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName));
        }
        catch (AppwriteException exception) when (exception.Kind == UpstreamFailureKind.InvalidSession)
        {
            return AuthenticateResult.Fail("Invalid session.");
        }
    }
}
