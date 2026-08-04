// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using MelloClean.Server.Auth;

namespace MelloClean.Server.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task ValidationMapsAccountAndTeams()
    {
        var service = new AuthService(new FakeGateway());
        var identity = await service.ValidateSessionAsync("secret", TestContext.Current.CancellationToken);
        Assert.Equal(new[] { "CLIENT", "WORKER" }, identity.Teams);
        Assert.Equal("user-1", identity.Id);
    }

    [Fact]
    public async Task LogoutIgnoresAnAlreadyInvalidSession() =>
        await new AuthService(new FakeGateway { DeleteFails = true }).LogoutAsync(
            "expired", TestContext.Current.CancellationToken);

    private sealed class FakeGateway : IAppwriteGateway
    {
        public bool DeleteFails { get; init; }
        public Task CreateAccountAsync(string email, string password, string name, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<SessionResult> CreateSessionAsync(string email, string password, CancellationToken cancellationToken) => Task.FromResult(new SessionResult("secret", null));
        public Task<AccountResult> GetAccountAsync(string secret, CancellationToken cancellationToken) => Task.FromResult(new AccountResult("user-1", "user@example.com", true));
        public Task<string[]> GetTeamsAsync(string secret, CancellationToken cancellationToken) => Task.FromResult(new[] { "CLIENT", "WORKER" });
        public Task DeleteCurrentSessionAsync(string secret, CancellationToken cancellationToken) => DeleteFails ? Task.FromException(new AppwriteException(UpstreamFailureKind.InvalidSession, "expired")) : Task.CompletedTask;
    }
}
