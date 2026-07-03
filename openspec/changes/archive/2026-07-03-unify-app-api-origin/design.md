## Context

Today, `nginx/nginx.dev.conf` and `nginx/nginx.prod.conf` each define three independent `server{}` blocks, one per nip.io subdomain: `www.` → client, `app.` → dashboard, `api.` → server. This was a deliberate topology decision (see `openspec/specs/deployment-topology/spec.md`), but neither the dashboard nor the client has any API-calling code yet, and the server has no CORS middleware, no cookie/session/JWT logic, and no `/api` route prefix — just a bare `/health` at root. The three-subdomain split is greenfield, not a production pattern with existing traffic to migrate.

Docker networking is not the constraint here: `dashboard-dev`/`server-dev` (and their prod equivalents) already share the default Compose network and can already reach each other by service name. The actual gap is browser **origin** — `app.` and `api.` are two different origins, which would eventually force CORS and cross-origin cookie handling into existence before any real feature needs it.

## Goals / Non-Goals

**Goals:**
- Serve the dashboard and the API from a single origin: `app.127.0.0.1.nip.io/` (dashboard) and `app.127.0.0.1.nip.io/api/` (server).
- Remove the `api.` subdomain and its nginx `server{}` block entirely.
- Keep the server in control of its own `/api` prefix, so nginx does no path rewriting.
- Apply the same shape to both `nginx.dev.conf` and `nginx.prod.conf`.

**Non-Goals:**
- No CORS middleware, cookie/session config, or dashboard API-client code — nothing calls the API cross-origin today, and same-origin removes the need for CORS between dashboard and server entirely.
- No changes to `docker-compose.yml` or `Dockerfile` — container networking already works.
- No changes to the `www.` subdomain/client app — it never calls the API, so it gets no `/api/` location.
- No handling for a bare `/api` (no trailing slash) — every real API route has a path segment after `/api/` (e.g. `/api/health`), so no redirect rule is needed.

## Decisions

### The server owns the `/api` prefix; nginx does not rewrite it

Two ways to join the paths were considered:
- **A — nginx strips the prefix**: `location /api/ { proxy_pass http://server-dev:5000/; }` (trailing slash on `proxy_pass`). Server keeps routes unprefixed (`/health`); nginx maps `/api/health` → `/health`.
- **B — the server owns the prefix** (chosen): `location /api/ { proxy_pass http://server-dev:5000; }` (no path after `host:port`). Express mounts everything under `/api` (`app.use('/api', router)`); nginx forwards the URI unmodified, so `/api/health` stays `/api/health` all the way to Express.

B was chosen so the server's route tree is self-describing regardless of how (or whether) it sits behind a reverse proxy — useful if the server ever needs to generate its own links, serve an OpenAPI spec, or be hit directly in a context without nginx in front of it. The trade-off is entirely mechanical and easy to get backwards: `proxy_pass` with a trailing path strips the matched location prefix; `proxy_pass` with no trailing path forwards the URI unchanged. This design deliberately uses the no-trailing-path form.

### `api.` subdomain is removed, not kept as an alias

Considered keeping `api.127.0.0.1.nip.io` as a second route to the same upstream (e.g., for webhooks or third-party integrations that shouldn't share the dashboard's origin). Rejected for now: nothing in the codebase depends on it, and it can be re-added later as a single extra `server{}` block pointing at the same upstream if a real need shows up. Keeping unused surface area adds nothing today.

### No bare-`/api` redirect

`location /api/` (trailing slash) does not match a bare `/api` request — nginx would fall through to `location /` and silently serve the dashboard's HTML instead of 404ing or reaching the server. This is normally worth guarding against with `location = /api { return 301 /api/; }`, but every real route in this codebase has a segment after `/api/` (there is no root API endpoint), so the redirect would be dead code. Revisit if a bare `/api` endpoint is ever added.

## Risks / Trade-offs

- **[Risk]** A future dashboard client-side route named `/api...` (e.g. a page at `/api-docs`) would collide with nginx's `/api/` prefix match at the routing layer, not the app layer, producing a confusing "wrong app handled this" bug. → **Mitigation**: none automated; keep `/api` reserved as a namespace the dashboard's router never defines routes under. Worth a code comment near the dashboard's router root if this becomes non-obvious later.
- **[Risk]** If the server ever needs to serve routes it does *not* want prefixed (e.g. a raw health/liveness probe hit by infrastructure tooling directly, bypassing nginx) mounting everything under `/api` means that probe is also under `/api`. → **Mitigation**: not a concern today since `/health` is browser/nginx-facing only; if an infra-level probe is needed later it can be added outside the `/api` router as a deliberate exception.

## Migration Plan

No data migration. Rollout is a config swap:
1. Update `apps/server/src/app.ts` to mount routes under `/api` (`/health` → `/api/health`).
2. Update `nginx/nginx.dev.conf`: add `/api/` location to the `app.` block, remove the `api.` block.
3. Update `nginx/nginx.prod.conf`: same change, using prod upstream names (`dashboard`, `server`).
4. Restart the relevant Compose profile; verify `app.127.0.0.1.nip.io/api/health` responds and `api.127.0.0.1.nip.io` no longer resolves to anything (connection refused / default nginx behavior, no server block matches).

Rollback is reverting the three touched files — no state to unwind.

## Open Questions

- None outstanding; all decisions above were confirmed during exploration.
