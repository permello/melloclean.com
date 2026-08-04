// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
namespace MelloClean.Server.Auth;

public sealed class AuthService(IAppwriteGateway gateway) : IAuthService
{
    public async Task<(SessionResult, AuthenticatedIdentity)> SignupAsync(SignupRequest request, CancellationToken cancellationToken)
    {
        await gateway.CreateAccountAsync(request.Email, request.Password,
            $"{request.FirstName.Trim()} {request.LastName.Trim()}", cancellationToken);
        return await LoginAsync(new(request.Email, request.Password), cancellationToken);
    }

    public async Task<(SessionResult, AuthenticatedIdentity)> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var session = await gateway.CreateSessionAsync(request.Email, request.Password, cancellationToken);
        return (session, await ValidateSessionAsync(session.Secret, cancellationToken));
    }

    public async Task<AuthenticatedIdentity> ValidateSessionAsync(string secret, CancellationToken cancellationToken)
    {
        var accountTask = gateway.GetAccountAsync(secret, cancellationToken);
        var teamsTask = gateway.GetTeamsAsync(secret, cancellationToken);
        await Task.WhenAll(accountTask, teamsTask);
        var account = await accountTask;
        return new(account.Id, account.Email, account.EmailVerified, await teamsTask);
    }

    public async Task LogoutAsync(string secret, CancellationToken cancellationToken)
    {
        try { await gateway.DeleteCurrentSessionAsync(secret, cancellationToken); }
        catch (AppwriteException exception) when (exception.Kind == UpstreamFailureKind.InvalidSession) { }
    }
}
