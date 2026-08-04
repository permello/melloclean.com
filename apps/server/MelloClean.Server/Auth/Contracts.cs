// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
namespace MelloClean.Server.Auth;

public sealed record AuthenticatedIdentity(string Id, string Email, bool EmailVerified, string[] Teams);
public sealed record SessionResult(string Secret, DateTimeOffset? ExpiresAt);
public sealed record AccountResult(string Id, string Email, bool EmailVerified);
public sealed record SignupRequest(string FirstName, string LastName, string Email, string Password, string ConfirmPassword);
public sealed record LoginRequest(string Email, string Password);

public enum UpstreamFailureKind { InvalidCredentials, InvalidSession, Conflict, Unavailable, Unexpected }

public sealed class AppwriteException(UpstreamFailureKind kind, string message) : Exception(message)
{
    public UpstreamFailureKind Kind { get; } = kind;
}

public interface IAppwriteGateway
{
    Task CreateAccountAsync(string email, string password, string name, CancellationToken cancellationToken);
    Task<SessionResult> CreateSessionAsync(string email, string password, CancellationToken cancellationToken);
    Task<AccountResult> GetAccountAsync(string secret, CancellationToken cancellationToken);
    Task<string[]> GetTeamsAsync(string secret, CancellationToken cancellationToken);
    Task DeleteCurrentSessionAsync(string secret, CancellationToken cancellationToken);
}

public interface IAuthService
{
    Task<(SessionResult Session, AuthenticatedIdentity Identity)> SignupAsync(SignupRequest request, CancellationToken cancellationToken);
    Task<(SessionResult Session, AuthenticatedIdentity Identity)> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthenticatedIdentity> ValidateSessionAsync(string secret, CancellationToken cancellationToken);
    Task LogoutAsync(string secret, CancellationToken cancellationToken);
}
