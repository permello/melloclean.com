## 1. Compose network definitions

- [x] 1.1 Add top-level `networks:` block to `docker-compose.yml` with `public-net` and `app-net` (no `internal: true` on either)

## 2. Attach prod-profile services

- [x] 2.1 Add `networks: [public-net]` to `client`
- [x] 2.2 Add `networks: [app-net]` to `dashboard`
- [x] 2.3 Add `networks: [app-net]` to `server`
- [x] 2.4 Add `networks: [public-net, app-net]` to `nginx-prod`

## 3. Attach dev-profile services

- [x] 3.1 Add `networks: [public-net]` to `client-dev`
- [x] 3.2 Add `networks: [app-net]` to `dashboard-dev`
- [x] 3.3 Add `networks: [app-net]` to `server-dev`
- [x] 3.4 Add `networks: [public-net, app-net]` to `nginx-dev`

## 4. Verification

- [x] 4.1 Start the `dev` profile; confirm `www.127.0.0.1.nip.io` and `app.127.0.0.1.nip.io` (including `/api/`) still respond correctly through nginx
- [x] 4.2 From inside `client-dev`, confirm `server-dev` and `dashboard-dev` do not resolve/connect (e.g. `docker compose exec client-dev wget -qO- http://server-dev:5000/api/health` fails)
- [x] 4.3 From inside `dashboard-dev`, confirm `server-dev` still resolves/connects over `app-net`
- [x] 4.4 Confirm `server-dev` still has outbound connectivity to Appwrite (e.g. reaches the configured `APPWRITE_ENDPOINT`)
- [x] 4.5 Repeat 4.1-4.4 against the `prod` profile (`docker compose --profile prod up`)
