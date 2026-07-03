## Why

`docker-compose.yml` was emptied out when the repo moved from a 2-service (frontend/backend) layout to the current turborepo structure (`apps/client`, `apps/dashboard`, `apps/server`) and no longer reflects how the app should actually be run. The root `Dockerfile` already has multi-stage targets for both a shared `development` stage and per-app production stages (`client-production`, `dashboard-production`, `server-production`), and an `nginx/nginx.dev.conf` already routes nip.io subdomains to the three apps — but nothing wires these together into a runnable topology, and there's no equivalent for production. We want one `docker-compose.yml`, using Compose `profiles`, that can bring up either a dev topology or a prod topology, with both topologies structurally mirroring each other (three app containers + nginx + db) so dev behavior is representative of production.

## What Changes

- Add a single `docker-compose.yml` with two profiles, `dev` and `prod`, selected via `docker compose --profile <name> up`.
- **BREAKING**: Replace the previous (already-deleted) `docker-compose.yml` service shape (`db`, `backend`, `frontend`) — that topology no longer matches the app and will not come back in this form.
- `prod` profile: three services (`client`, `dashboard`, `server`) built from the Dockerfile's existing `client-production` / `dashboard-production` / `server-production` targets, plus an `nginx-prod` service.
- `dev` profile: three services (`client-dev`, `dashboard-dev`, `server-dev`) built from the Dockerfile's existing `development` target, each with a `command:` override that scopes `turbo run dev` to just that app (e.g. `--filter=@permello/client`) instead of running all three apps in every container, plus monorepo bind mounts (with `node_modules` excluded from the mount) for hot reload, plus an `nginx-dev` service.
- `db` (Postgres): shared between both profiles (no profile restriction so it always starts), using a named volume for data persistence, carrying forward the `POSTGRES_*` variables already defined in `.env.example`.
- Update `nginx/nginx.dev.conf` proxy targets from `client`/`dashboard`/`server` to `client-dev`/`dashboard-dev`/`server-dev` to match the new dev service names.
- Add `nginx/nginx.prod.conf`, structurally mirroring `nginx.dev.conf`'s subdomain routing but pointing at the prod service names (`client`/`dashboard`/`server`). TLS/certificate handling for real production domains is explicitly out of scope — this proposal only establishes routing, not certs.

## Capabilities

### New Capabilities
- `deployment-topology`: Defines how the app's containers (client, dashboard, server, nginx, db) are composed and networked for local development and for production, including which Dockerfile build targets and nginx configs apply to each.

### Modified Capabilities
(none — no existing specs cover this yet)

## Impact

- `docker-compose.yml` (rewritten from empty)
- `nginx/nginx.dev.conf` (proxy target hostnames updated)
- `nginx/nginx.prod.conf` (new file)
- No application code changes; root `Dockerfile` targets are consumed as-is, not modified
- Developer workflow: `npm run dev:dock` (or equivalent) will need to pass `--profile dev`; a symmetrical prod invocation becomes available for the first time
