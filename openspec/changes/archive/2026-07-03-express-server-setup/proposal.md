## Why

`apps/server` is scaffolded (Express app, health route, config loader) but is missing the security/parsing middleware chain and env-driven CORS configuration that issue #75 calls for. The health check also doesn't match its documented contract. This is the foundation task blocking #77 (AuthService + middleware, which reads session cookies), #78 (auth routes), and #79 (frontend integration) — none of them can safely land until the middleware chain and CORS allowlist exist.

## What Changes

- Add `helmet`, `cors`, and `cookie-parser` as `apps/server` dependencies and wire them into `src/app.ts` in order: `helmet` → `cors` → `express.json` (existing) → `cookie-parser`.
- Make the CORS origin allowlist env-driven: read a new comma-separated `CORS_ORIGINS` env var in `src/config/config.ts`, parse it into a string array, and pass it to `cors({ origin: allowlist, credentials: true })`.
- Add `PORT` and `CORS_ORIGINS` to the root `.env.example` (single root file — no per-app `.env.example`), with dev-appropriate defaults covering `www.127.0.0.1.nip.io` and `app.127.0.0.1.nip.io`.
- **BREAKING** (internal contract only, not yet consumed by any client): change `GET /api/health` to respond with JSON `{ status: 'ok' }` instead of the plain-text string `'ok!'`.
- Add a `typecheck` script to `apps/server/package.json` so the root `npm run typecheck` actually exercises the server package instead of Turbo silently skipping it.
- Establish a repo-wide convention that every workspace package defines a `typecheck` script — `apps/server` was the only package missing one; `apps/client`, `apps/dashboard`, `packages/shared`, `packages/ui` already comply.
- Confirm `apps/server/src/middleware/` (singular) as the canonical directory name — no rename; issue #77's reference to `middlewares` was a typo, not a mandate.

## Capabilities

### New Capabilities
- `server-middleware-chain`: The Express server's security and parsing middleware chain (`helmet`, `cors` with an env-driven origin allowlist, `cookie-parser`) required to safely accept credentialed cross-origin requests from the frontend apps.
- `workspace-typecheck-convention`: Every package under `apps/*` and `packages/*` must define a `typecheck` script, so the root `npm run typecheck` exercises the whole workspace instead of Turbo silently skipping packages that lack the script.

### Modified Capabilities
- `api-base-path`: The `GET /api/health` scenario's response body contract changes from an unspecified/plain-text response to JSON `{ status: 'ok' }`.

## Impact

- **Code**: `apps/server/package.json`, `apps/server/src/app.ts`, `apps/server/src/config/config.ts`, root `.env.example`. No changes needed to `apps/client`, `apps/dashboard`, `packages/shared`, `packages/ui` — they already have `typecheck` scripts and are verified, not modified.
- **Dependencies**: adds `helmet`, `cors`, `cookie-parser` (+ `@types/cors`, `@types/cookie-parser`) to `apps/server`.
- **Out of scope**: Docker/`docker-compose.yml` changes (already delivered by the `docker-compose-dev-prod-profiles` and `segment-docker-networks` changes), `AuthService`/`requireAuth`/`requireRole` (#77), shared Zod schemas (#76), auth routes (#78).
- **Unblocks**: #77, #78, #79.
