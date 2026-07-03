## Context

`apps/server` currently runs `express()` with only `express.json()` applied, and a health route that returns a plain-text string. The epic (#74) requires the server to accept credentialed cross-origin requests from `apps/client` and same-origin requests (via nginx) from `apps/dashboard`, and #77 (AuthService) will read a session token from a request cookie — so `cookie-parser` needs to be in place before that work starts. All environment configuration for the monorepo currently lives in a single root `.env`/`.env.example` (there is no per-app env file precedent to follow).

## Goals / Non-Goals

**Goals:**
- Define the exact middleware chain and its ordering.
- Define the `CORS_ORIGINS` env var contract (format, parsing, default behavior).
- Establish the `/api/health` JSON response contract before anything depends on it.

**Non-Goals:**
- Implementing `AuthService`, `requireAuth`, or `requireRole` (#77).
- Cookie signing / `COOKIE_SECRET` (cookie-parser is used unsigned here; Appwrite session tokens are opaque and validated server-side by #77, not by cookie-parser).
- Custom `helmet` CSP or any HTML-serving concerns — the server is a pure JSON API.
- Any Docker/`docker-compose.yml` change (already delivered by prior changes).

## Decisions

**Middleware order: `helmet` → `cors` → `express.json` (existing) → `cookie-parser`.**
Security headers apply first regardless of outcome. CORS runs before body parsing so preflight `OPTIONS` requests short-circuit without invoking JSON parsing. Cookie parsing is last since nothing before it needs cookie values.
*Alternative considered*: placing `cookie-parser` before `cors` — rejected, there's no dependency between them, and grouping "request-shaping" middleware (security → cross-origin policy → body → cookies) is easier to reason about.

**`CORS_ORIGINS` is a comma-separated list of full origins (including scheme), parsed in `config.ts` via `.split(',').map(s => s.trim()).filter(Boolean)`, passed directly as the `cors` package's `origin` array with `credentials: true`.**
*Alternative considered*: regex/wildcard matching for `*.127.0.0.1.nip.io` — rejected as unnecessary; there are exactly two known dev origins today, and prod will need exact origins anyway, so an explicit allowlist keeps both environments consistent.

**Fail-closed default: if `CORS_ORIGINS` is unset or empty, the allowlist is empty — no origin is permitted.**
*Alternative considered*: falling back to `*` or reflecting the request `Origin` — rejected as an insecure default; forcing explicit configuration in every environment is safer than silently permissive behavior.

**`helmet` runs with its default configuration.**
No custom CSP. The server serves JSON only, so helmet's default header set (X-Content-Type-Options, HSTS in prod, etc.) is sufficient; a CSP only matters once/if the server serves HTML or inline scripts, which is out of scope.

**`cookie-parser` runs unsigned (no secret argument).**
Session cookies here are Appwrite's opaque session tokens, validated server-side via the Appwrite SDK in #77 — cookie-parser's job in this task is only to make `req.cookies` available. Signing can be added later by #77 if a `COOKIE_SECRET` becomes necessary.

**`GET /api/health` responds with `res.json({ status: 'ok' })` instead of `res.send('ok!')`.**
Matches the `api-base-path` spec's health scenario precisely and gives later tasks (frontend smoke tests, deploy health checks) a stable JSON contract before anything is built against the old string response.

**`apps/server/package.json` gets a `typecheck` script (`tsc --noEmit`).**
Without it, Turbo's root `npm run typecheck` silently skips the server package rather than failing, so the "typecheck passes across all packages" acceptance criterion currently verifies nothing for `apps/server`. `--noEmit` avoids colliding with the `build` script's own `tsc` output step.

**Every workspace package defining a `typecheck` script is elevated from convention to an explicit spec requirement (`workspace-typecheck-convention`).**
Turbo's `typecheck` task has no way to fail a package for *not defining* the script — it just skips it, so a future new package (or a typo'd script name) silently drops out of `npm run typecheck` with no error. Making this an explicit, checkable requirement means it's no longer implicit tribal knowledge. `apps/client`, `apps/dashboard`, `packages/shared`, `packages/ui` already comply; `apps/server` is the only gap, closed by this change.
*Alternative considered*: leave it as an unwritten convention — rejected, since that's exactly the state that let `apps/server` drift out of `npm run typecheck` coverage in the first place.

## Risks / Trade-offs

- **[Risk]** Fail-closed CORS means a forgotten `CORS_ORIGINS` in any environment (e.g., prod deploy secrets) silently blocks all cross-origin traffic rather than erroring loudly → **Mitigation**: document `CORS_ORIGINS` prominently next to the existing `APPWRITE_*` vars in `.env.example` with example values.
- **[Risk]** Exact-string origin matching means a scheme/host/trailing-slash mismatch fails CORS with an opaque browser-side error → **Mitigation**: `.env.example` shows the exact expected format (full origin, no trailing slash) as a comment.
- **[Risk]** Changing `/api/health`'s response body is a breaking shape change → **Mitigation**: no consumer exists yet (this task is explicitly upstream of #77/#78/#79), so it's safe to change now.

## Open Questions

- Should `CORS_ORIGINS` support wildcard/pattern entries for future preview-deployment subdomains, or stay a flat exact-match list indefinitely? Deferred until prod domain strategy is decided.
- Should a `COOKIE_SECRET` be introduced now for signed cookies, or deferred until #77 actually sets/reads a session cookie? Deferred to #77, per this proposal's scope.
