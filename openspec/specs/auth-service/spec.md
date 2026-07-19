# auth-service

## Purpose

Provide a single, Appwrite-agnostic seam (`AuthService`) that Express routes and middleware use to validate a session and resolve its identity and team memberships, and to end a session on logout — so that Appwrite SDK specifics (`node-appwrite`, session-scoped clients) stay isolated behind `AppwriteAuthService` and `config/appwrite.ts` rather than leaking into route handlers. `requireAuth` and `requireTeam` Express middleware are built on top of this interface to provide authentication and team-gated authorization for routes.

## Requirements

### Requirement: AuthService interface shape
`AuthService` SHALL expose exactly two methods: `validateSession(token: string): Promise<{ id: string, email: string, emailVerification: boolean, teams: string[] }>` and `logout(token: string): Promise<void>`. It SHALL NOT expose a separate method for retrieving a user's teams.

#### Scenario: Interface has no separate team-lookup method
- **WHEN** the `AuthService` interface is inspected
- **THEN** it declares only `validateSession` and `logout`, with team information returned as part of `validateSession`'s resolved value

### Requirement: AppwriteAuthService receives its session client via an injected factory
`AppwriteAuthService`'s constructor SHALL accept a `SessionClientFactory` (`(token: string) => { account: Account; teams: Teams }`) rather than constructing a `node-appwrite` `Client` from environment variables internally. Each call to `validateSession` or `logout` SHALL obtain a freshly built `Account`/`Teams` pair from that factory; it SHALL NOT reuse or cache a client across calls.

#### Scenario: Fresh client per call
- **WHEN** `validateSession` or `logout` is called
- **THEN** the injected `SessionClientFactory` is invoked to obtain that call's `account`/`teams`, and no `Client` instance is shared with any other call

### Requirement: AppwriteAuthService is instantiated exactly once
The application SHALL construct `AppwriteAuthService` exactly once, in `apps/server/src/services/authServiceInstance.ts`, exported as the `authService` singleton typed as `AuthService`. No other production module SHALL call `new AppwriteAuthService(...)`.

#### Scenario: Middleware and future routes share one instance
- **WHEN** `requireAuth.ts`, `requireTeam.ts`, or any future route module imports `authService` from `services/authServiceInstance.ts`
- **THEN** they receive the same singleton instance, and none of them construct their own `AppwriteAuthService`

### Requirement: validateSession never accesses the database
`AppwriteAuthService.validateSession` SHALL derive its result using only `node-appwrite` Account and Teams calls against a session-scoped client (obtained via the injected `SessionClientFactory`) presenting the given token (`account.get()` and `teams.list()`). It SHALL NOT read from or write to the Appwrite Database `users` collection.

#### Scenario: Valid token resolves identity and teams
- **WHEN** `validateSession(token)` is called with a token for an active session belonging to a user who is a member of the `CLIENT` and `WORKER` Teams
- **THEN** the returned promise resolves with `{ id, email, emailVerification, teams: ["CLIENT", "WORKER"] }`, sourced only from `account.get()` and `teams.list()`

#### Scenario: Invalid or expired token is rejected
- **WHEN** `validateSession(token)` is called with a token that does not authenticate an active Appwrite session
- **THEN** the returned promise rejects, and no partial user object is produced

### Requirement: logout ends the session identified by the given token
`AppwriteAuthService.logout` SHALL accept the session token itself (not a separate session identifier), obtain a session-scoped client (via the injected `SessionClientFactory`) presenting that token, and call `account.deleteSession('current')`. It SHALL NOT require or use an API key.

#### Scenario: Logging out with a valid token
- **WHEN** `logout(token)` is called with a token for an active session
- **THEN** that session is ended via `account.deleteSession('current')` on a client scoped to that token, and a subsequent `validateSession` call with the same token rejects

### Requirement: requireAuth middleware
`requireAuth` SHALL read the session token from the request cookie, call `AuthService.validateSession` with it, and on success attach the resolved `{ id, email, emailVerification, teams }` to `req.user` before calling `next()`. On a missing cookie or a rejected `validateSession` call, it SHALL respond with HTTP 401 and SHALL NOT call `next()`.

#### Scenario: Missing session cookie
- **WHEN** a request reaches `requireAuth` with no session token cookie present
- **THEN** the response status is 401 and the route handler does not run

#### Scenario: Invalid session token
- **WHEN** a request reaches `requireAuth` with a session token cookie that `validateSession` rejects
- **THEN** the response status is 401 and the route handler does not run

#### Scenario: Valid session token
- **WHEN** a request reaches `requireAuth` with a session token cookie that `validateSession` resolves successfully
- **THEN** `req.user` is set to the resolved identity-and-teams object and the next middleware/handler runs

### Requirement: requireTeam middleware composes requireAuth
`requireTeam(team)` SHALL internally invoke `requireAuth` rather than assuming it has already run, then perform a synchronous `req.user.teams.includes(team)` check. It SHALL NOT call `AuthService` a second time. On a team mismatch it SHALL respond with HTTP 403 and SHALL NOT call `next()`.

#### Scenario: Route uses requireTeam alone
- **WHEN** a route is defined with only `requireTeam('ADMIN')` and no separate `requireAuth` in its middleware chain
- **THEN** an unauthenticated request still receives 401 (via `requireTeam`'s internal `requireAuth` call), not an unhandled error

#### Scenario: Authenticated user without the required team
- **WHEN** `requireTeam('ADMIN')` runs for a request whose `req.user.teams` (as populated by the internal `requireAuth` call) does not include `"ADMIN"`
- **THEN** the response status is 403 and the route handler does not run

#### Scenario: Authenticated user with the required team
- **WHEN** `requireTeam('ADMIN')` runs for a request whose `req.user.teams` includes `"ADMIN"`
- **THEN** the next middleware/handler runs

### Requirement: All Appwrite SDK usage is contained within AppwriteAuthService and its session client factory
No module outside `AppwriteAuthService` and `config/appwrite.ts` (the `SessionClientFactory` implementation) SHALL import `node-appwrite` directly.

#### Scenario: Middleware and routes have no direct Appwrite dependency
- **WHEN** `requireAuth.ts`, `requireTeam.ts`, or any Express route file is inspected for imports
- **THEN** none of them import from `node-appwrite`; all Appwrite access happens through the `authService` singleton
