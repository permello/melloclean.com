// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using MelloClean.Server.Configuration;

namespace MelloClean.Server.Auth;

public sealed class AppwriteGateway(HttpClient client, IOptions<AppwriteOptions> options) : IAppwriteGateway
{
    private readonly AppwriteOptions _options = options.Value;

    public async Task CreateAccountAsync(string email, string password, string name, CancellationToken cancellationToken) =>
        await SendAsync(HttpMethod.Post, "account", new { userId = "unique()", email, password, name }, null,
            cancellationToken);

    public async Task<SessionResult> CreateSessionAsync(string email, string password, CancellationToken cancellationToken)
    {
        using var response = await SendAsync(HttpMethod.Post, "account/sessions/email", new { email, password }, null,
            cancellationToken);
        var session = await ReadAsync<SessionDocument>(response, cancellationToken);
        if (string.IsNullOrWhiteSpace(session.Secret))
            throw new AppwriteException(UpstreamFailureKind.Unexpected, "Appwrite did not return a session secret.");
        return new(session.Secret, DateTimeOffset.TryParse(session.Expire, out var expiresAt) ? expiresAt : null);
    }

    public async Task<AccountResult> GetAccountAsync(string secret, CancellationToken cancellationToken)
    {
        using var response = await SendAsync(HttpMethod.Get, "account", null, secret, cancellationToken);
        var account = await ReadAsync<AccountDocument>(response, cancellationToken);
        return new(account.Id, account.Email, account.EmailVerification);
    }

    public async Task<string[]> GetTeamsAsync(string secret, CancellationToken cancellationToken)
    {
        using var response = await SendAsync(HttpMethod.Get, "teams", null, secret, cancellationToken);
        var teams = await ReadAsync<TeamListDocument>(response, cancellationToken);
        return teams.Teams.Select(team => team.Name).ToArray();
    }

    public async Task DeleteCurrentSessionAsync(string secret, CancellationToken cancellationToken)
    {
        using var response = await SendAsync(HttpMethod.Delete, "account/sessions/current", null, secret, cancellationToken);
    }

    private async Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, object? body, string? session,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(method, new Uri(new Uri(_options.Endpoint.TrimEnd('/') + "/"), path));
        request.Headers.Add("X-Appwrite-Project", _options.ProjectId);
        if (session is not null) request.Headers.Add("X-Appwrite-Session", session);
        if (method == HttpMethod.Post && path == "account/sessions/email" && _options.ServerApiKey is not null)
            request.Headers.Add("X-Appwrite-Key", _options.ServerApiKey);
        if (body is not null) request.Content = JsonContent.Create(body);

        var response = await client.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode) return response;
        var kind = response.StatusCode switch
        {
            HttpStatusCode.Conflict => UpstreamFailureKind.Conflict,
            HttpStatusCode.Unauthorized when path.Contains("sessions/email") => UpstreamFailureKind.InvalidCredentials,
            HttpStatusCode.Unauthorized => UpstreamFailureKind.InvalidSession,
            >= HttpStatusCode.InternalServerError => UpstreamFailureKind.Unavailable,
            _ => UpstreamFailureKind.Unexpected
        };
        response.Dispose();
        throw new AppwriteException(kind, $"Appwrite request failed with status {(int)response.StatusCode}.");
    }

    private static async Task<T> ReadAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken) =>
        await response.Content.ReadFromJsonAsync<T>(cancellationToken) ?? throw new JsonException("Empty Appwrite response.");

    private sealed record SessionDocument(string Secret, string? Expire);
    private sealed record AccountDocument([property: System.Text.Json.Serialization.JsonPropertyName("$id")] string Id,
        string Email, bool EmailVerification);
    private sealed record TeamDocument(string Name);
    private sealed record TeamListDocument(TeamDocument[] Teams);
}
