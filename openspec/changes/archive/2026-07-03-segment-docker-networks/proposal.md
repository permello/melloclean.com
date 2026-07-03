## Why

Today `docker-compose.yml` defines no `networks:` block, so every service — `client`, `dashboard`, `server`, and both nginx variants, across both the `dev` and `prod` profiles — shares Docker Compose's single implicit default network. Nginx's subdomain routing (`www.` → client, `app.` → dashboard + `/api/` → server) creates the appearance of a trust boundary between the public marketing site and the app/API, but that boundary is purely a browser-facing routing rule. At the container network layer, `client` can already resolve and reach `server:5000` or `dashboard:3001` directly — nothing enforces the separation nginx implies.

This matters because the boundary already exists conceptually: the archived `unify-app-api-origin` change put `dashboard` and `server` on one browser origin specifically because they're meant to be coupled, while `client` was explicitly scoped out because it never calls the API. Segmenting the Docker network now — while the compose file is still small and no service depends on cross-boundary reachability — makes the container topology enforce the same boundary already drawn in nginx, at negligible cost. Waiting until real inter-service calls exist would make this a riskier retrofit instead of a clean default.

## What Changes

- `docker-compose.yml` gains two user-defined networks: `public-net` and `app-net`.
- `client` / `client-dev` attach only to `public-net`.
- `dashboard` / `dashboard-dev` and `server` / `server-dev` attach only to `app-net`.
- `nginx-prod` / `nginx-dev` attach to both networks (the only dual-homed services), since nginx is the sole component that must reach all three app services.
- Neither network is marked `internal: true` — `server`/`server-dev` still need outbound HTTPS to reach Appwrite Cloud/the self-hosted Appwrite VPS, per the existing `deployment-topology` spec's external-Appwrite requirement.
- No changes to `nginx/nginx.dev.conf`, `nginx/nginx.prod.conf`, or the `Dockerfile` — nginx already reaches all three services by Compose service name; it only needs network membership added, not new routing.

## Capabilities

### Modified Capabilities
- `deployment-topology`: adds a requirement that the Compose topology SHALL segment app services into a `public-net` (client only) and an `app-net` (dashboard, server), with nginx as the only service attached to both, in both the `dev` and `prod` profiles.

## Impact

- Affected files: `docker-compose.yml` only.
- Not affected: `nginx/nginx.dev.conf`, `nginx/nginx.prod.conf`, `Dockerfile`, application source in `apps/*`.
- Behavioral effect: `client`/`client-dev` lose the ability to resolve or reach `dashboard`/`server` (and their `-dev` equivalents) directly over the Docker network; all cross-boundary traffic must go through nginx, matching how a real client already has to reach these services.
