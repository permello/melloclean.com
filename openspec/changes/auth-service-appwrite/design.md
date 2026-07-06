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

## Risks / Trade-offs

- **[Risk]** `validateSession` makes two Appwrite calls (`account.get()` + `teams.list()`) on every authenticated request, with no caching → **Mitigation**: acceptable for now; this is still fewer calls than the original design (which added a third for `getUserTeams`). Revisit only if latency becomes a measured problem.
- **[Risk]** Because `logout` only invalidates the session belonging to the presented token, a user cannot be logged out by anyone who doesn't hold that token → **Mitigation**: intentional; that's exactly the gap #126 fills with the API-key-scoped Users API for admin-initiated revocation.
- **[Risk]** `APPWRITE_API_KEY` is threaded through configuration and `AppwriteAuthService`'s constructor without any current caller → **Mitigation**: low cost; it's an env var and constructor parameter, not dead logic, and #126 will need it in the same service or a natural sibling.

## Migration Plan

No existing code implements `AuthService` today, so there is no migration of callers. Steps:
1. Add `AuthService` interface and `AppwriteAuthService` implementation.
2. Add `requireAuth` and `requireTeam` middleware.
3. Register `AppwriteAuthService` at startup in `app.ts`.
4. Add the three Appwrite env vars to `.env.example`.

Rollback: revert the commit — nothing currently depends on this service, so rollback has no downstream impact.

## Open Questions

- Should `AppwriteAuthService`'s constructor accept a pre-built `node-appwrite` `Client`, or build its own from env vars internally? (Affects testability — a passed-in client is easier to mock.) Left to implementation; either satisfies this design.
- Where does the future API-key-scoped work (#126, possible server-side signup) live — on `AuthService` itself, or a separate `AdminAuthService`? Issue #77's own comments leave this open; not decided by this change.
