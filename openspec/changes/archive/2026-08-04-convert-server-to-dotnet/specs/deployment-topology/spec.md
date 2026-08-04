## ADDED Requirements

### Requirement: Server containers use the supported .NET LTS runtime
The production server container SHALL run the ASP.NET Core service on .NET 10 LTS, and the development
server container SHALL provide the matching .NET SDK and source-watch workflow. Both SHALL continue to
listen on port 5000 under their existing Compose service names and networks.

#### Scenario: Production server starts
- **WHEN** the production Compose profile starts the `server` service
- **THEN** the ASP.NET Core server runs on port 5000 using the .NET 10 runtime and remains reachable from nginx over `app-net`

#### Scenario: Development server reloads
- **WHEN** the development profile is running and a C# server source file changes
- **THEN** the `server-dev` service rebuilds or reloads the ASP.NET Core process without an image rebuild

## MODIFIED Requirements

### Requirement: External Appwrite backend configuration
`server` and `server-dev` SHALL receive the Appwrite endpoint and project identifier required to call
Appwrite as an external HTTP dependency, plus any server credential required by the selected account
creation flow. No Appwrite container SHALL exist in either profile.

#### Scenario: Dev profile reaches Appwrite Cloud
- **WHEN** the dev profile starts with valid Appwrite configuration
- **THEN** `server-dev` can perform account, session, and team operations against Appwrite Cloud and no Appwrite container starts

#### Scenario: Prod profile reaches the self-hosted Appwrite VPS
- **WHEN** the prod profile starts with valid Appwrite configuration
- **THEN** `server` can perform account, session, and team operations against the self-hosted Appwrite instance and no Appwrite container starts

