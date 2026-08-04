// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using System.Net;
using System.Text;
using Microsoft.Extensions.Options;
using MelloClean.Server.Auth;
using MelloClean.Server.Configuration;

namespace MelloClean.Server.Tests;

public sealed class AppwriteGatewayTests
{
    [Fact]
    public async Task AccountCreationSendsProjectAndExpectedPayloadWithoutServerCredentials()
    {
        var handler = new RecordingHandler(HttpStatusCode.Created, "{}");
        var gateway = CreateGateway(handler, "account-key");

        await gateway.CreateAccountAsync("user@example.com", "password", "Test User", TestContext.Current.CancellationToken);

        Assert.Equal(HttpMethod.Post, handler.Request!.Method);
        Assert.Equal("https://appwrite.example/v1/account", handler.Request.RequestUri!.ToString());
        Assert.Equal("project-1", Header(handler, "X-Appwrite-Project"));
        Assert.Null(Header(handler, "X-Appwrite-Key"));
        Assert.Null(Header(handler, "X-Appwrite-Session"));
        Assert.Contains("\"userId\":\"unique()\"", handler.Body);
        Assert.Contains("\"email\":\"user@example.com\"", handler.Body);
    }

    [Fact]
    public async Task SessionOperationsSendOnlyProjectAndSessionHeaders()
    {
        var handler = new RecordingHandler(HttpStatusCode.OK,
            "{\"$id\":\"user-1\",\"email\":\"user@example.com\",\"emailVerification\":true}");
        var gateway = CreateGateway(handler, "account-key");

        var account = await gateway.GetAccountAsync("session-secret", TestContext.Current.CancellationToken);

        Assert.Equal("user-1", account.Id);
        Assert.Equal("session-secret", Header(handler, "X-Appwrite-Session"));
        Assert.Null(Header(handler, "X-Appwrite-Key"));
    }

    [Fact]
    public async Task SessionResponseUsesServerKeyAndExtractsSecretAndIsoExpiry()
    {
        var handler = new RecordingHandler(HttpStatusCode.Created,
            "{\"secret\":\"session-secret\",\"expire\":\"2030-01-02T03:04:05.000+00:00\"}");
        var session = await CreateGateway(handler, "session-key").CreateSessionAsync(
            "user@example.com", "password", TestContext.Current.CancellationToken);

        Assert.Equal("session-secret", session.Secret);
        Assert.Equal(2030, session.ExpiresAt?.Year);
        Assert.Equal("session-key", Header(handler, "X-Appwrite-Key"));
        Assert.Contains("\"password\":\"password\"", handler.Body);
    }

    [Theory]
    [InlineData(HttpStatusCode.Conflict, UpstreamFailureKind.Conflict)]
    [InlineData(HttpStatusCode.ServiceUnavailable, UpstreamFailureKind.Unavailable)]
    public async Task MapsUpstreamFailures(HttpStatusCode status, UpstreamFailureKind expected)
    {
        var exception = await Assert.ThrowsAsync<AppwriteException>(() =>
            CreateGateway(new RecordingHandler(status, "{}")).CreateAccountAsync(
                "a@b.com", "password", "A B", TestContext.Current.CancellationToken));
        Assert.Equal(expected, exception.Kind);
    }

    private static AppwriteGateway CreateGateway(HttpMessageHandler handler, string? key = null) =>
        new(new HttpClient(handler), Options.Create(new AppwriteOptions
        {
            Endpoint = "https://appwrite.example/v1",
            ProjectId = "project-1",
            ServerApiKey = key
        }));

    private static string? Header(RecordingHandler handler, string name) =>
        handler.Request!.Headers.TryGetValues(name, out var values) ? values.Single() : null;

    private sealed class RecordingHandler(HttpStatusCode status, string responseBody) : HttpMessageHandler
    {
        public HttpRequestMessage? Request { get; private set; }
        public string Body { get; private set; } = "";

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Request = request;
            Body = request.Content is null ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
            return new(status) { Content = new StringContent(responseBody, Encoding.UTF8, "application/json") };
        }
    }
}
