// Copyright (c) 2025-present Eduardo Turcios. Licensed under the MIT License.
using System.ComponentModel.DataAnnotations;

namespace MelloClean.Server.Configuration;

public sealed class ServerOptions
{
    public const string SectionName = "Server";

    [Range(1, 65535)] public int Port { get; init; } = 5000;
    public string[] CorsOrigins { get; init; } = [];
}

public sealed class AppwriteOptions
{
    public const string SectionName = "Appwrite";

    [Required, Url] public required string Endpoint { get; init; }
    [Required] public required string ProjectId { get; init; }
    public string? ServerApiKey { get; init; }
}
