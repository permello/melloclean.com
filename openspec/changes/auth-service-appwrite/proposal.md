## Why

Express routes currently have no way to validate an Appwrite session or enforce team-based access — every route would otherwise need to talk to the `node-appwrite` SDK directly. Issue #74 (Express Authentication) needs team-gated routes now; #77 defines the `AuthService` interface and Appwrite-backed implementation that `requireAuth`/`requireTeam` middleware build on, so Appwrite specifics stay isolated behind one seam.

## What Changes

- Add `AuthService` interface at `apps/server/src/services/AuthService.ts` with exactly two methods: `validateSession(token: string): Promise<{ id, email, emailVerification, teams: string[] }>` and `logout(token: string): Promise<void>`. **No `getUserTeams`** — it was cut from the original issue scope; teams are returned as part of `validateSession`.
- Implement `AppwriteAuthService`:
  - `validateSession(token)` builds a session-scoped `node-appwrite` client (`client.setSession(token)`) and calls only `account.get()` (identity) and `teams.list()` (team membership across `CLIENT`/`WORKER`/`ADMIN` Teams). It never reads or writes the Appwrite Database `users` collection.
  - `logout(token)` builds a session-scoped client with the same token and calls `account.deleteSession('current')`. No API key is used — ending a session only requires the token that authenticates it.
  - Reads `APPWRITE_ENDPOINT` and `APPWRITE_PROJECT_ID` from environment variables (already present in `.env.example` from an earlier commit, along with `APPWRITE_API_KEY`). Neither `AuthService` method in this change actually needs the API key (both are session-scoped, not API-key-scoped).
- Add `apps/server/src/middleware/requireAuth.ts`: reads the session token from the request cookie, calls `validateSession`, attaches the resulting `{ id, email, emailVerification, teams }` to `req.user`, and returns 401 on a missing or invalid token.
- Add `apps/server/src/middleware/requireTeam.ts`: `requireTeam(team)` composes `requireAuth` internally (routes never chain both manually), then does a synchronous `req.user.teams.includes(team)` check and returns 403 on mismatch. No second Appwrite call.
- Register `AppwriteAuthService` as the active implementation at app startup in `apps/server/src/app.ts`.

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
- `apps/server/src/services/AppwriteAuthService.ts` — new implementation.
- `apps/server/src/middleware/requireAuth.ts` — new middleware.
- `apps/server/src/middleware/requireTeam.ts` — new middleware.
- `apps/server/src/app.ts` — registers `AppwriteAuthService` at startup.
- `.env.example` — no change needed; `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, and `APPWRITE_API_KEY` already exist there.
- No existing runtime code is touched; there are no current consumers of an `AuthService` to migrate.
