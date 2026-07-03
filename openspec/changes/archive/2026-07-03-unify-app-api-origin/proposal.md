## Why

The dashboard and server currently sit on separate nginx subdomains (`app.` and `api.`), which are separate browser origins. Neither app has any API-calling code, CORS middleware, or cookie/session logic yet — so today this costs nothing, but the moment dashboard code starts calling the server, the cross-origin boundary forces CORS and cross-origin cookie handling to exist before a single real feature is built. Collapsing both onto one origin (`app.127.0.0.1.nip.io`, with the API under `/api/`) removes that requirement entirely for the dashboard↔server relationship.

## What Changes

- nginx dev/prod configs: the `app.` subdomain's `server{}` block gains an `/api/` location proxying to the server upstream (`server-dev:5000` / `server:5000`), alongside its existing `/` location for the dashboard.
- nginx dev/prod configs: the `api.` subdomain's `server{}` block is removed entirely. **BREAKING**: anything hitting `api.127.0.0.1.nip.io` directly must move to `app.127.0.0.1.nip.io/api/` (no existing code does this today — the break is against manual/external use, not in-repo callers).
- `proxy_pass` for the `/api/` location has no trailing path after `host:port`, so nginx forwards the full, unmodified request URI (including the `/api` prefix) to the server — the server owns the prefix, nginx does not rewrite it.
- `apps/server/src/app.ts`: all routes are mounted under a `/api` prefix (e.g. `app.use('/api', router)`); the existing bare `/health` endpoint moves to `/api/health`.
- `www.` subdomain (client app) is unchanged — no `/api/` location is added there. The client never calls the API.
- No `docker-compose.yml` or `Dockerfile` changes — `server-dev`/`dashboard-dev` (and their prod equivalents) are already reachable from each other over the default Compose network. This change only affects the browser-facing origin/routing, not container networking.

## Capabilities

### New Capabilities
- `api-base-path`: the server SHALL mount all its routes under a `/api` path prefix, so nginx can proxy `/api/*` through to it without rewriting the path.

### Modified Capabilities
- `deployment-topology`: the "Nginx subdomain routing per profile" requirement changes — the `app.` subdomain now routes both `/` (dashboard) and `/api/` (server); the `api.` subdomain and its routing scenario are removed.

## Impact

- Affected files: `nginx/nginx.dev.conf`, `nginx/nginx.prod.conf`, `apps/server/src/app.ts`
- Affected specs: `openspec/specs/deployment-topology/spec.md` (modified), new `openspec/specs/api-base-path/spec.md`
- Not affected: `docker-compose.yml`, `Dockerfile`, `apps/client`, `apps/dashboard`
- No CORS middleware, cookie/session config, or dashboard API-client code is being added as part of this change — that work stays out of scope until the dashboard actually needs to call the server.
