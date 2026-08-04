## 1. Establish the .NET Workspace

- [x] 1.1 Create the .NET 10 solution, ASP.NET Core server project, and xUnit integration test project under `apps/server` with repository license headers and nullable analysis enabled.
- [x] 1.2 Convert `apps/server/package.json` into an orchestration-only workspace adapter whose dev, build, test, typecheck, and lint/format scripts invoke the matching .NET commands.
- [x] 1.3 Update Turbo task outputs and dependencies so root build, test, typecheck, and development commands include the .NET server and propagate its failures.
- [x] 1.4 Add validated server configuration for port 5000, environment, CORS origins, Appwrite endpoint, Appwrite project id, and any optional account-creation credential.

## 2. Verify and Implement the Appwrite Boundary

- [x] 2.1 Run a focused non-production Appwrite integration spike to verify email/password account creation, session-secret extraction, session-scoped Account and Teams requests, and current-session deletion through the REST API.
- [x] 2.2 Define the Appwrite gateway and authentication service contracts, authenticated identity model, and typed upstream failure categories without exposing Appwrite response types to endpoints.
- [x] 2.3 Implement the configured HTTP Appwrite gateway for account creation, email/password session creation, account lookup, team listing, and current-session deletion.
- [x] 2.4 Implement the authentication service so signup/login produce a session plus `{ id, email, emailVerified, teams }`, validation resolves account and teams concurrently, and logout ends the presented session.
- [x] 2.5 Add unit tests covering gateway request headers and payloads, upstream error mapping, identity/team mapping, invalid sessions, and idempotent logout behavior.

## 3. Build the ASP.NET Core HTTP Pipeline

- [x] 3.1 Configure minimal API routing under `/api`, security headers, exact-origin credentialed CORS with a fail-closed default, JSON validation, exception handling, authentication, and authorization in the required order.
- [x] 3.2 Implement cookie authentication using the `session` cookie with `HttpOnly`, `SameSite=Strict`, `Path=/`, and environment-appropriate `Secure`, then map Appwrite team names to authorization claims and reusable team policies.
- [x] 3.3 Implement `GET /api/health` with the existing status code and JSON response and verify `/health` does not expose the health route.
- [x] 3.4 Implement `POST /api/auth/signup` with request validation, account-conflict handling, initial session creation, production-safe cookie issuance, and the authenticated identity response.
- [x] 3.5 Implement `POST /api/auth/login` with generic credential failures, production-safe cookie issuance, and the authenticated identity response.
- [x] 3.6 Implement protected `GET /api/auth/me` using the resolved Appwrite account and team identity.
- [x] 3.7 Implement idempotent `POST /api/auth/logout` so it attempts upstream termination, always expires the local cookie, and returns HTTP 204.
- [x] 3.8 Add endpoint integration tests for success and error contracts, explicit `SameSite=Strict`, `HttpOnly`, `Path=/`, environment-specific `Secure` cookie attributes, secret omission, CORS behavior, 401 authentication challenges, and 403 team-policy failures.

## 4. Align Browser Contracts and Calls

- [x] 4.1 Replace the shared authentication user schema with the exact `{ id, email, emailVerified, teams }` response contract while retaining and testing login and signup request validation.
- [x] 4.2 Update dashboard signup, login, logout, and current-user interactions to call the `/api/auth/*` endpoints with credentials enabled and remove direct browser-to-Appwrite authentication calls.
- [x] 4.3 Add browser-package tests that validate representative server responses against the shared Zod schemas and cover failed authentication responses.

## 5. Convert Container and Development Infrastructure

- [x] 5.1 Replace the root Dockerfile's Node server builder and production stages with .NET 10 SDK and ASP.NET runtime stages that restore, publish, and run as a non-root user on port 5000.
- [x] 5.2 Add a .NET development image/target and update `server-dev` to run `dotnet watch` with bind-mounted source and isolated build artifacts.
- [x] 5.3 Preserve the `server` and `server-dev` Compose names, `app-net` membership, Appwrite environment settings, port behavior, and nginx `/api/` forwarding without path rewriting.
- [x] 5.4 Verify development hot reload, production image startup, `/api/health` through nginx, and outbound Appwrite connectivity in their respective Compose profiles.

## 6. Remove Express and Validate the Cutover

- [x] 6.1 Remove the Express TypeScript source, Vitest server tests/configuration, compiled Node output, and Node-only dependencies after equivalent .NET coverage exists.
- [x] 6.2 Update repository documentation, environment examples, copyright checks, ignore rules, and developer commands for the .NET server and optional Appwrite credential.
- [x] 6.3 Run root build, test, typecheck, lint/format, and copyright checks and resolve any cross-workspace failures.
- [x] 6.4 Exercise signup, login, current-user, team authorization, logout, and health flows against a non-production Appwrite project through nginx and record the rollback-ready server image/version.
  - Verified rollback image: `mellocleancom-server@sha256:4938eba8c486bd03ae6b212769451983fe2656c21a90e2154d25b756d440e203`.
