## Why

The server should become the single browser-facing boundary for Appwrite authentication while the
repository replaces its thin Express implementation with a supported .NET LTS service. This gives
the backend a durable platform for future API work without changing Appwrite as the identity and
authorization provider.

## What Changes

- **BREAKING** Replace the Node.js/Express server workspace with an ASP.NET Core service targeting
  .NET 10 LTS.
- Preserve `GET /api/health` and the server's `/api` base path and port 5000 behavior.
- Add server-mediated signup, login, logout, and current-user endpoints so browsers no longer call
  Appwrite directly.
- Store the Appwrite session secret in a server-managed secure, HTTP-only, `SameSite=Strict`
  cookie.
- Resolve authenticated identity and authorization from Appwrite Account and Teams APIs; Appwrite
  team membership remains the sole authorization authority.
- Replace Express middleware behavior with equivalent ASP.NET Core security headers, JSON parsing,
  CORS, cookie authentication, and team-based authorization policies.
- Replace server Vitest tests with .NET tests while preserving root monorepo build, test, typecheck,
  and development workflows through Turbo/npm orchestration.
- Replace the server's Node container stages and development service with .NET SDK/runtime images,
  while preserving nginx routing and Compose service topology.
- Align shared browser auth contracts with the new server-mediated auth API and remove the database
  profile/role shape from the authentication identity contract.

## Capabilities

### New Capabilities

- `auth-api`: Defines the browser-to-server signup, login, logout, and current-user HTTP contract,
  including session-cookie behavior.
- `dotnet-server-workspace`: Defines how the .NET server participates in monorepo-wide development,
  build, test, and type-check workflows.

### Modified Capabilities

- `auth-service`: Replace Express- and Node-Appwrite-specific service requirements with a .NET
  abstraction that uses Appwrite Account and Teams operations and supports session creation.
- `server-middleware-chain`: Preserve security, JSON, CORS, and cookie behavior using ASP.NET Core
  middleware and authentication/authorization policies.
- `shared-auth-schemas`: Align client-side request and response schemas with server-mediated auth
  endpoints and a team-based authenticated-user representation.
- `deployment-topology`: Build and run the server as a .NET service while retaining its Compose
  names, port, networks, external Appwrite configuration, and hot reload behavior.

## Impact

- `apps/server` changes from a TypeScript npm workspace to an ASP.NET Core project with a .NET test
  project.
- Root npm/Turbo orchestration needs an integration mechanism for `dotnet` commands.
- The root `Dockerfile` and `docker-compose.yml` gain .NET server build, runtime, and development
  behavior; nginx continues forwarding `/api/*` to port 5000.
- `packages/shared` auth schemas and the dashboard's auth calls must use the new HTTP contracts.
- Appwrite configuration, accounts, sessions, and teams remain external dependencies and sources of
  truth. No Appwrite data migration is required.
