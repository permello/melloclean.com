## 1. Nginx configs

- [x] 1.1 Update `nginx/nginx.dev.conf` proxy_pass targets from `client`/`dashboard`/`server` to `client-dev`/`dashboard-dev`/`server-dev`
- [x] 1.2 Create `nginx/nginx.prod.conf` mirroring `nginx.dev.conf`'s subdomain routing, pointing at `client`/`dashboard`/`server` and the apps' production ports

## 2. Compose file — prod profile

- [x] 2.1 Create `docker-compose.yml`
- [x] 2.2 Add `client`, `dashboard`, `server` services under `profiles: ["prod"]`, each building the root `Dockerfile` with the matching `*-production` target
- [x] 2.3 Add `nginx-prod` service under `profiles: ["prod"]`, mounting `nginx/nginx.prod.conf`, depending on `client`/`dashboard`/`server`, exposing port 80

## 3. Compose file — dev profile

- [x] 3.1 Add `client-dev`, `dashboard-dev`, `server-dev` services under `profiles: ["dev"]`, each building the root `Dockerfile` with the `development` target
- [x] 3.2 Override each dev service's `command:` to scope `turbo run dev` to its own workspace (e.g. `--filter=@permello/client`)
- [x] 3.3 Add bind mount of the monorepo root plus an anonymous volume over `node_modules` to each dev service for hot reload without shadowing installed deps
- [x] 3.4 Add `nginx-dev` service under `profiles: ["dev"]`, mounting `nginx/nginx.dev.conf`, depending on `client-dev`/`dashboard-dev`/`server-dev`, exposing port 80

## 4. Appwrite configuration (external dependency)

- [x] 4.1 Add `node-appwrite` SDK as a dependency of `apps/server`
- [x] 4.2 Update `.env.example`: remove `POSTGRES_*`, add `APPWRITE_ENDPOINT` / `APPWRITE_PROJECT_ID` / `APPWRITE_API_KEY` with comments clarifying dev should use Appwrite Cloud values and prod should use the self-hosted VPS's values
- [x] 4.3 Wire `APPWRITE_ENDPOINT` / `APPWRITE_PROJECT_ID` / `APPWRITE_API_KEY` into `server-dev`'s `environment:` block, sourced from `.env`
- [x] 4.4 Wire the same three vars into `server`'s (prod) `environment:` block, sourced from `.env`

## 5. Scripts

- [x] 5.1 Update `package.json`'s `dev:dock` script to pass `--profile dev`
- [x] 5.2 Add a `prod:dock` script passing `--profile prod`

## 6. Validation

- [x] 6.1 Run `docker compose --profile dev up`; confirm `www/app/api.127.0.0.1.nip.io` reach client/dashboard/server and edits hot-reload
- [ ] 6.2 Confirm `server-dev` can authenticate against Appwrite Cloud using the configured `.env` credentials
- [x] 6.3 Run `docker compose --profile prod up` (with `.env` pointed at the VPS); confirm the same subdomains reach the built production apps
- [ ] 6.4 Confirm `server` can authenticate against the self-hosted Appwrite VPS using the configured `.env` credentials
