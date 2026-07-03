## 1. Nginx configs

- [ ] 1.1 Update `nginx/nginx.dev.conf` proxy_pass targets from `client`/`dashboard`/`server` to `client-dev`/`dashboard-dev`/`server-dev`
- [ ] 1.2 Create `nginx/nginx.prod.conf` mirroring `nginx.dev.conf`'s subdomain routing, pointing at `client`/`dashboard`/`server` and the apps' production ports

## 2. Compose file — shared/db

- [ ] 2.1 Create `docker-compose.yml` with a `db` service (postgres, no `profiles:` key), using `POSTGRES_*` vars from `.env`/`.env.example`
- [ ] 2.2 Add a named volume for Postgres data persistence

## 3. Compose file — prod profile

- [ ] 3.1 Add `client`, `dashboard`, `server` services under `profiles: ["prod"]`, each building the root `Dockerfile` with the matching `*-production` target
- [ ] 3.2 Add `nginx-prod` service under `profiles: ["prod"]`, mounting `nginx/nginx.prod.conf`, depending on `client`/`dashboard`/`server`, exposing port 80

## 4. Compose file — dev profile

- [ ] 4.1 Add `client-dev`, `dashboard-dev`, `server-dev` services under `profiles: ["dev"]`, each building the root `Dockerfile` with the `development` target
- [ ] 4.2 Override each dev service's `command:` to scope `turbo run dev` to its own workspace (e.g. `--filter=@permello/client`)
- [ ] 4.3 Add bind mount of the monorepo root plus an anonymous volume over `node_modules` to each dev service for hot reload without shadowing installed deps
- [ ] 4.4 Add `nginx-dev` service under `profiles: ["dev"]`, mounting `nginx/nginx.dev.conf`, depending on `client-dev`/`dashboard-dev`/`server-dev`, exposing port 80

## 5. Scripts

- [ ] 5.1 Update `package.json`'s `dev:dock` script to pass `--profile dev`
- [ ] 5.2 Add a `prod:dock` script passing `--profile prod`

## 6. Validation

- [ ] 6.1 Run `docker compose --profile dev up`; confirm `www/app/api.127.0.0.1.nip.io` reach client/dashboard/server and edits hot-reload
- [ ] 6.2 Run `docker compose --profile prod up`; confirm the same subdomains reach the built production apps
- [ ] 6.3 Confirm `db` starts and persists data across a container recreate, under either profile
