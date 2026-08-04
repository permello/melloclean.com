## Context

See `proposal.md` for motivation. The current server is a small Express application with one mounted
health route plus unmounted Appwrite authentication and team-authorization services. Nginx forwards
`/api/*` without rewriting to port 5000. The repository uses npm workspaces and Turbo as its unified
command surface, while Compose provides separate development and production containers.

The browser currently has shared Zod request schemas and an intended auth API contract, but its user
schema describes an Appwrite Database profile that the server never loads. This change establishes
the server as the only browser-facing Appwrite boundary and treats Appwrite Account and Teams as the
authentication and authorization sources of truth.

## Goals / Non-Goals

**Goals:**

- Make the replacement atomic enough that nginx continues to see the same service, port, and base
  path.
- Keep Appwrite protocol details behind a testable service boundary.
- Make session handling safe for a browser-facing BFF.
- Preserve a single root command surface for JavaScript and .NET work.
- Verify observable parity and new auth behavior with endpoint-level tests.

**Non-Goals:**

- Introduce a local user database or synchronize Appwrite profiles.
- Replace Appwrite teams with application-owned roles.
- Add authentication methods beyond email/password.
- Generate C# types from Zod or TypeScript types in this change.
- Run the old and new servers concurrently in production.

## Decisions

### Target ASP.NET Core on .NET 10 LTS

The server will use an ASP.NET Core minimal API targeting `net10.0`. Minimal APIs fit the small route
surface while retaining built-in dependency injection, configuration, authentication, authorization,
and test hosting. A controller-based layout was considered, but adds ceremony without a current need
for large controller groups.

The server project and its test project will live under `apps/server`, with production code organized
by authentication, authorization, configuration, and endpoint concerns. Tests will use xUnit and the
ASP.NET Core in-memory test host for endpoint behavior, plus focused service tests with a fake
Appwrite gateway.

### Call Appwrite through an isolated HTTP gateway

An `IAppwriteGateway` implemented with a configured `HttpClient` will encapsulate the Appwrite REST
protocol. `IAuthService` will implement application operations in terms of that gateway. This avoids
making the architecture depend on the feature coverage or release cadence of a third-party .NET SDK
and makes upstream requests straightforward to fake in tests.

The gateway will be configured from validated options containing the endpoint and project id. It
will perform account creation and email/password session creation using browser-equivalent Account
API operations. Session-scoped calls will present the Appwrite session secret only to Account and
Teams operations. An API key will not participate in ordinary session validation, logout, or team
resolution. Server-side email/password session creation requires a secret-backed key with the narrow
`sessions.write` scope so Appwrite returns the session secret. Public account creation remains an
unauthenticated Account API operation.

Direct Appwrite calls from endpoint handlers are prohibited. This preserves the existing service
seam without copying its Node-specific client-factory and singleton mechanics.

### Keep the Appwrite session secret in a BFF cookie

After signup or login, the server will extract the new Appwrite session secret from the upstream
session response and store it in a cookie named `session`. The JSON response will contain only the
resolved authenticated identity. Subsequent requests will read that cookie server-side and use it
for Appwrite Account and Teams calls.

The cookie will be `HttpOnly`, `SameSite=Strict`, `Path=/`, and `Secure` outside local development. Its
expiry will not outlive the upstream Appwrite session. Logout will attempt to delete the current
upstream session and will always expire the local cookie, making logout idempotent even when the
upstream session has already expired.

The strict SameSite policy and the environment-driven exact-origin CORS allowlist form the initial
CSRF boundary. State-changing endpoints will reject disallowed browser origins before processing.
This intentionally requires the dashboard and API to remain same-site; a separate synchronizer token
and a less restrictive SameSite policy were considered but are not needed for the initial deployment.
They can be introduced together if a future cross-site browser flow becomes a requirement.

### Resolve teams on every authenticated identity operation

Session validation will request the Appwrite account and team list concurrently and map team names
to claims. Authorization policies will require those team claims. There will be no database user
lookup and no singular application role.

This preserves immediate team-membership revocation at the cost of two Appwrite calls per protected
request. Caching was considered but rejected initially because the current traffic and endpoint
surface are small and stale authorization would weaken revocation semantics.

### Use explicit auth endpoint contracts

Endpoint mapping will retain the `/api` group and add `/api/auth/signup`, `/login`, `/logout`, and
`/me`. Validation failures map to 400, account conflicts to 409, rejected credentials or sessions to
401, failed team policies to 403, and unexpected upstream failures to a sanitized 502 or 500 response
with server-side logging.

Successful signup returns 201; login and current-user return 200; logout returns 204. Signup creates
both the account and initial session and maps `firstName` plus `lastName` into the Appwrite account
name while keeping the API's separate fields for browser form compatibility.

### Keep a thin npm workspace adapter for Turbo

`apps/server/package.json` will remain as an orchestration adapter, not a Node runtime package. Its
scripts will delegate `dev`, `build`, `test`, `typecheck`, and lint/format validation to `dotnet`.
This lets existing root Turbo commands continue to include the server without adding a second root
orchestrator or making developers remember a separate monorepo workflow.

The adapter will not carry Express, TypeScript, Node Appwrite, or Vitest dependencies. Direct .NET
commands remain documented and supported. Turbo outputs will include .NET build artifacts, and the
server test task will depend on the appropriate build/restore behavior.

### Replace only the server stages in container infrastructure

The root Dockerfile will retain Node stages for client and dashboard. Server development/build stages
will use the .NET 10 SDK, and the production stage will use the matching ASP.NET runtime image with a
non-root user. The existing `server` and `server-dev` Compose service names, port 5000, `app-net`
attachment, and nginx upstreams remain unchanged.

The development server will run `dotnet watch` against the bind-mounted server source. The container
configuration will isolate build artifacts so host and container outputs do not interfere.

### Keep TypeScript browser contracts manually aligned in this change

`packages/shared/types/authSchema.ts` remains the browser contract source. Its authenticated-user
schema will become `{ id, email, emailVerified, teams }`; login and signup request schemas remain the
input contracts. C# request/response records will mirror their JSON names explicitly, and integration
tests will assert response shapes.

Schema generation was considered but deferred: introducing an OpenAPI-to-TypeScript or
TypeScript-to-C# pipeline would expand this migration significantly. OpenAPI generation can be added
later once the API surface warrants it.

## Risks / Trade-offs

- **Appwrite session response details differ across deployments or versions** → Verify session-secret
  extraction against the configured Appwrite instance with an integration spike before completing
  endpoint implementation; keep all protocol handling inside the gateway.
- **Two upstream calls per authenticated request add latency** → Run Account and Teams calls
  concurrently, instrument latency, and add short-lived caching only if measurements justify it.
- **A thin package adapter looks unusual in a .NET project** → Document its orchestration-only role
  and keep all runtime dependencies in the .NET project.
- **Manually duplicated TypeScript and C# contracts can drift** → Cover endpoint JSON with integration
  tests and validate responses with shared schemas in browser-package tests.
- **An atomic runtime replacement has a larger rollback unit** → Preserve the old Express version in
  version control and keep nginx/service interfaces unchanged so rollback is an image/version revert.
- **Local HTTP cannot use Secure cookies** → Disable only the Secure attribute in the explicit local
  development environment; retain HttpOnly and `SameSite=Strict` behavior.
- **Strict SameSite cookies are not sent from cross-site browser contexts** → Keep the dashboard and
  API same-site and treat any future cross-site deployment as an explicit authentication-design
  change.

## Migration Plan

1. Add the .NET solution, server/test projects, configuration validation, Appwrite gateway seam, and
   orchestration adapter while preserving the current external server contract.
2. Implement and test health, authentication, cookie, CORS, and team-policy behavior against fakes;
   perform a focused integration check against a non-production Appwrite project.
3. Update shared auth schemas and browser calls to use the new endpoints.
4. Replace server Docker stages and the development Compose command, then verify dev hot reload and
   production container health through nginx.
5. Remove Express source and Node-only dependencies after root build, test, typecheck, and container
   checks pass.
6. Deploy the new server image without changing nginx routing. Roll back by deploying the previous
   server image if authentication or upstream integration checks fail.
