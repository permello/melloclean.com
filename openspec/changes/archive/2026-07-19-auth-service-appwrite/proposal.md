## Why

Express routes currently have no way to validate an Appwrite session or enforce team-based access — every route would otherwise need to talk to the `node-appwrite` SDK directly. Issue #74 (Express Authentication) needs team-gated routes now; #77 defines the `AuthService` interface and Appwrite-backed implementation that `requireAuth`/`requireTeam` middleware build on, so Appwrite specifics stay isolated behind one seam.

## What Changes

- Add `AuthService` interface at `apps/server/src/services/AuthService.ts` with exactly two methods: `validateSession(token: string): Promise<{ id, email, emailVerification, teams: string[] }>` and `logout(token: string): Promise<void>`. **No `getUserTeams`** — it was cut from the original issue scope; teams are returned as part of `validateSession`.
- Add `apps/server/src/config/appwrite.ts` exporting a `SessionClientFactory` (`buildSessionClients`): given a token, builds a **fresh** `node-appwrite` `Client` (`.setSession(token)`) and returns `{ account, teams }`. A fresh client per call is required, not a style preference — `Client.setSession()` mutates a shared `headers` object in place, so a single long-lived client reused across concurrent requests could leak one request's token onto another's in-flight call. Reads `APPWRITE_ENDPOINT`/`APPWRITE_PROJECT_ID` from environment variables (already present in `.env.example`, along with `APPWRITE_API_KEY`).
- Implement `AppwriteAuthService`, whose constructor accepts an injected `SessionClientFactory` rather than building its own client internally:
  - `validateSession(token)` obtains `{ account, teams }` from the injected factory and calls only `account.get()` (identity) and `teams.list()` (team membership across `CLIENT`/`WORKER`/`ADMIN` Teams). It never reads or writes the Appwrite Database `users` collection.
  - `logout(token)` obtains `{ account }` from the same factory and calls `account.deleteSession('current')`. No API key is used — ending a session only requires the token that authenticates it.
- Add `apps/server/src/services/authServiceInstance.ts` exporting the **one** `authService` singleton (`new AppwriteAuthService(buildSessionClients)`), typed as `AuthService`. This is the only place `AppwriteAuthService` is ever constructed in production code.
- Add `apps/server/src/middleware/requireAuth.ts`: imports `{ authService }` directly (matching the existing `config.ts` singleton-import convention, not a constructor/factory argument), reads the session token from the request cookie, calls `validateSession`, attaches the resulting `{ id, email, emailVerification, teams }` to `req.user`, and returns 401 on a missing or invalid token.
- Add `apps/server/src/middleware/requireTeam.ts`: `requireTeam(team)` composes `requireAuth` internally (routes never chain both manually), then does a synchronous `req.user.teams.includes(team)` check and returns 403 on mismatch. No second Appwrite call.
- Add `vitest` to `apps/server` (no test runner exists there today, matching the `packages/ui` convention already in the monorepo) and write unit tests, TDD-style, for `AppwriteAuthService` (via a fake `SessionClientFactory`, no SDK mocking needed) and for `requireAuth`/`requireTeam` (via `vi.mock('../services/authServiceInstance')`).

**BREAKING (against the original issue body, not against any shipped code)**: `getUserTeams(userId)` and `logout(sessionId)` as originally specified are gone — `logout` now takes the session `token`, and team lookup is folded into `validateSession`. Nothing in the repo implements the old signatures yet, so this is a scope correction, not a runtime break.

**Explicitly out of scope, tracked elsewhere:**
- Admin-initiated revocation of *another* user's session (API-key-scoped Appwrite Users API) — tracked in #126; different code path since there's no token to present.
- Server-side `POST /api/signup` (moving account creation + Team membership assignment into Express so every session-holding user is guaranteed a team) — a real architecture decision surfaced in #77's discussion, but not one of #77's original deliverables and not yet filed as its own issue. Flagging here so it isn't lost, but no route is added by this change.
- Dropping `role` from `userSchema` in `packages/shared/types/authSchema.ts` — tracked against the `shared-zod-auth-schemas` change, not here.
- Re-scoping `GET /api/auth/me` to reflect `account.get()`-derived identity only — belongs on #74.

## Capabilities

### New Capabilities
- `auth-service`: The `AuthService` interface, its Appwrite-backed implementation, and the `requireAuth`/`requireTeam` Express middleware built on it.

### Modified Capabilities
(none — `server-middleware-chain` covers the pre-route helmet/cors/body-parsing/cookie-parser chain and is unaffected; `requireAuth`/`requireTeam` are route guards that run per-route, not part of that global chain)

## Impact

- `apps/server/src/services/AuthService.ts` — new interface.
- `apps/server/src/config/appwrite.ts` — new `SessionClientFactory` implementation (`buildSessionClients`); builds a fresh `node-appwrite` `Client` per call.
- `apps/server/src/services/AppwriteAuthService.ts` — new implementation, constructor-injected with a `SessionClientFactory`.
- `apps/server/src/services/authServiceInstance.ts` — new singleton instantiation site (`authService`); the only `new AppwriteAuthService(...)` call in production code.
- `apps/server/src/middleware/requireAuth.ts` — new middleware; imports the `authService` singleton directly.
- `apps/server/src/middleware/requireTeam.ts` — new middleware; imports the `authService` singleton directly.
- `apps/server/package.json` — adds `vitest` as a devDependency and a `"test": "vitest run"` script (no test runner exists in `apps/server` today).
- `apps/server/vitest.config.ts` — new.
- `.env.example` — no change needed; `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, and `APPWRITE_API_KEY` already exist there.
- No existing runtime code is touched; there are no current consumers of an `AuthService` to migrate.
