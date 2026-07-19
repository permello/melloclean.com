## Context

Issue #77 originally specified `AuthService.validateSession(token)`, `getUserTeams(userId)`, and `logout(sessionId)`, with `requireTeam` calling `getUserTeams` as a second Appwrite lookup. Two decisions posted on the issue since then changed this shape before any code was written:

1. `logout` only ever has a session token available (from the request cookie) — never a distinct Appwrite session `$id` — so it must take `token`, not `sessionId`.
2. `validateSession` should be the only per-request Appwrite call: it returns identity *and* team membership together, so `getUserTeams` and its extra round-trip are removed entirely. `requireTeam` becomes a synchronous check composed on top of `requireAuth`.

This design documents the resulting interface and how `AppwriteAuthService` implements it using session-scoped vs. API-key-scoped `node-appwrite` clients.

## Goals / Non-Goals

**Goals:**
- One `AuthService` interface with exactly two methods, both taking the raw session token.
- `requireAuth` makes exactly one Appwrite round-trip per request (via `validateSession`); `requireTeam` makes zero additional Appwrite calls.
- All `node-appwrite` SDK usage contained inside `AppwriteAuthService` — routes and middleware never import `node-appwrite` directly.
- `AuthService` has zero dependency on the Appwrite Database `users` collection.

**Non-Goals:**
- Admin-initiated revocation of another user's session (needs an API-key-scoped `Users` client, not a session-scoped one) — #126.
- Any Express route handlers (`/api/auth/me`, `/api/auth/logout`, a future `/api/signup`) — this change only adds the service and middleware layer other issues wire routes onto.
- Persisting or syncing any user data to a database on login — `validateSession` is read-only against Appwrite's `Account` and `Teams` APIs.

## Decisions

**`AuthService` interface is exactly `validateSession(token)` and `logout(token)` — no `getUserTeams`.**
Folding teams into `validateSession`'s return value means `requireAuth` already has everything `requireTeam` needs on `req.user` by the time a route handler (or `requireTeam`) runs. Alternative considered: keep `getUserTeams` as a separate method so team checks could be done lazily, only on team-gated routes — rejected because it doubles Appwrite calls on every team-gated request for no caching benefit, and it reintroduces a state where `requireTeam` could theoretically run without `requireAuth` having populated `req.user` first.

**`requireTeam(team)` composes `requireAuth` internally rather than being chained after it in route definitions.**
```
requireTeam(team):
  (req, res, next) =>
    requireAuth(req, res, () => {
      if (!req.user.teams.includes(team)) return res.sendStatus(403)
      next()
    })
```
This makes `requireTeam('ADMIN')` alone sufficient on a route — there's no way to forget `requireAuth` and accidentally leave a team check running against an unauthenticated `req.user`. Alternative considered: two independent middlewares chained by the route (`requireAuth, requireTeam('ADMIN')`) — rejected because it relies on route authors getting the order right every time, and `requireTeam` without `requireAuth` first has no `req.user` to check.

**Both `validateSession` and `logout` use a session-scoped client (`client.setSession(token)`), not an API-key-scoped one.**
Both operations act *as the calling user* — reading their own identity/Teams, or ending their own session — so presenting their token is sufficient and correct. Using the API-key-scoped client for these would mean authenticating as the server rather than the user, which is both unnecessary and the wrong trust boundary. `logout` calls `account.deleteSession('current')`, which resolves to whichever session the presented token authenticates — no separate session ID lookup needed.

**`AppwriteAuthService`'s constructor accepts `APPWRITE_API_KEY`, even though no method in this change uses it.**
The env var already exists in `.env.example` from earlier setup work. Accepting it now (unused) gives forward compatibility with API-key-scoped operations (e.g. #126's admin session revocation, or a future server-side signup) that will likely live alongside these two methods on the same service or a sibling one.

**`validateSession` never touches the Appwrite Database `users` collection.**
It is built from exactly two calls against the session-scoped client: `account.get()` (identity) and `teams.list()` (team membership, returned as `teams: string[]` since a user can belong to multiple Teams). There is no "sync user on first login" concern because nothing is written anywhere. This also means `req.user` reflects Appwrite Account/Teams state directly, not a possibly-stale database copy.

**A failed or expired token causes `validateSession` to reject; `requireAuth` catches and returns 401.**
Both `account.get()` and `teams.list()` throw on an invalid/expired session when called against a session-scoped client presenting that token. `requireAuth` treats any rejection from `validateSession` (missing cookie, expired token, revoked session) uniformly as a 401 — it does not distinguish error causes in the response.

**`AppwriteAuthService`'s constructor accepts an injected `SessionClientFactory`, not a pre-built `Client`.**
```
type SessionClientFactory = (token: string) => { account: Account; teams: Teams };
```
Each call to `validateSession`/`logout` obtains its `Account`/`Teams` pair from this factory rather than the service building a `node-appwrite` `Client` internally. This resolves the design's original open question in favor of injection — and not just for testability. Reading `node_modules/node-appwrite/dist/client.js` confirms `Client.setSession()` mutates a shared `headers` object in place rather than returning a new instance. A single long-lived `Client` shared across concurrent requests would let one request's `setSession(token)` call overwrite another's mid-flight, since the header mutation and the async HTTP call it feeds land on different ticks of the event loop — a real cross-user identity risk in a multi-request Express server, not a theoretical one. The factory signature `(token) => { account, teams }` makes "build fresh, never reuse" the only shape possible, rather than an unenforced convention. The real implementation, `buildSessionClients`, lives in `apps/server/src/config/appwrite.ts`, built once from global config (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`) but constructing a new `Client` on every invocation. Alternative considered: building the `Client` internally from env vars (the original shape) — rejected once the shared-mutable-state risk above was found, since it would otherwise rely on every future maintainer remembering never to cache that internal client.

**`AppwriteAuthService` itself is a singleton, constructed exactly once in `apps/server/src/services/authServiceInstance.ts`.**
```
export const authService: AuthService = new AppwriteAuthService(buildSessionClients);
```
No other production module calls `new AppwriteAuthService(...)`. It's exported typed as the `AuthService` interface, not the concrete class, so every consumer — `requireAuth`, `requireTeam`, and any future route — only ever sees the two-method interface, keeping Appwrite specifics behind the seam even at the singleton boundary. This is a genuine singleton, not just a naming convention: Node's module cache guarantees `services/authServiceInstance.ts`'s top-level code runs exactly once regardless of how many files import it, so every `import { authService } from '../services/authServiceInstance'` resolves to the same object reference.

**`requireAuth`/`requireTeam` import the `authService` singleton directly rather than receiving it as a constructor/factory argument.**
This matches the existing convention already used for `config.ts` (`app.ts` does `import config from './config/config'`), rather than introducing a new DI pattern at the middleware layer. Alternative considered: middleware factories taking `AuthService` as a parameter (`requireAuth(authService)`), mirroring `AppwriteAuthService`'s own constructor injection — rejected in favor of consistency with the rest of the codebase's singleton-import style. The trade-off: middleware tests need `vi.mock('../services/authServiceInstance', ...)` to substitute a fake, rather than passing a fake directly — but since the mocked module is a small local file exporting a plain object (not a third-party SDK class), this is a much lighter form of module mocking than internal client-building inside `AppwriteAuthService` would have required.

## Testing Strategy

Test runner: **vitest**, matching the existing `packages/ui` convention. `apps/server` has no test runner today — this change adds one (`vitest.config.ts`, `vitest` devDependency, `"test": "vitest run"` script).

Per unit:
- **`AppwriteAuthService`**: unit tests instantiate `new AppwriteAuthService(fakeFactory)` directly, where `fakeFactory` returns plain objects with `vi.fn()` stubs for `account.get`, `account.deleteSession`, and `teams.list`. No `vi.mock()` of `node-appwrite` anywhere — the injected-factory design means the class itself never imports the SDK's `Account`/`Teams` classes in a way tests need to intercept.
- **`requireAuth` / `requireTeam`**: tests use `vi.mock('../services/authServiceInstance', () => ({ authService: { validateSession: vi.fn(), logout: vi.fn() } }))`, since these middleware import the singleton directly (see Decisions above) rather than taking it as a parameter.
- **Routes**: out of scope for this change (tracked under #74) — no route-level or `supertest` tests belong here.

Workflow is TDD: for each unit, the failing test is written and manually reviewed before the corresponding implementation task begins. `tasks.md` reflects this ordering.

## Risks / Trade-offs

- **[Risk]** `validateSession` makes two Appwrite calls (`account.get()` + `teams.list()`) on every authenticated request, with no caching → **Mitigation**: acceptable for now; this is still fewer calls than the original design (which added a third for `getUserTeams`). Revisit only if latency becomes a measured problem.
- **[Risk]** Because `logout` only invalidates the session belonging to the presented token, a user cannot be logged out by anyone who doesn't hold that token → **Mitigation**: intentional; that's exactly the gap #126 fills with the API-key-scoped Users API for admin-initiated revocation.
- **[Risk]** `APPWRITE_API_KEY` is threaded through configuration and `AppwriteAuthService`'s constructor without any current caller → **Mitigation**: low cost; it's an env var and constructor parameter, not dead logic, and #126 will need it in the same service or a natural sibling.

## Migration Plan

No existing code implements `AuthService` today, so there is no migration of callers. Steps:
1. Add `AuthService` interface.
2. Add `config/appwrite.ts` (`buildSessionClients` factory) and `AppwriteAuthService` implementation (constructor-injected with that factory).
3. Add `services/authServiceInstance.ts`, the sole `new AppwriteAuthService(buildSessionClients)` instantiation, exported as the `authService` singleton.
4. Add `requireAuth` and `requireTeam` middleware, importing `{ authService }` directly.
5. Add the three Appwrite env vars to `.env.example` (already present).

Rollback: revert the commit — nothing currently depends on this service, so rollback has no downstream impact.

## Open Questions

- Where does the future API-key-scoped work (#126, possible server-side signup) live — on `AuthService` itself, or a separate `AdminAuthService`? Issue #77's own comments leave this open; not decided by this change.
