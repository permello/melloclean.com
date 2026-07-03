## 1. Server: mount routes under /api

- [x] 1.1 In `apps/server/src/app.ts`, create an Express router and mount it at `/api` (`app.use('/api', router)`)
- [x] 1.2 Move the existing `/health` route onto the router so it's served at `/api/health`; remove the bare root `/health` route
- [x] 1.3 Verify `curl http://localhost:5000/api/health` returns the health response and `curl http://localhost:5000/health` does not

## 2. Dev nginx: collapse api. into app.

- [x] 2.1 In `nginx/nginx.dev.conf`, add an `/api/` location to the `app.127.0.0.1.nip.io` server block, proxying to `http://server-dev:5000` with no trailing path after the port (so the `/api` prefix is forwarded unmodified)
- [x] 2.2 Remove the `api.127.0.0.1.nip.io` server block entirely
- [x] 2.3 With the `dev` profile running, verify `app.127.0.0.1.nip.io/` still serves the dashboard, `app.127.0.0.1.nip.io/api/health` reaches the server, and `api.127.0.0.1.nip.io` matches no server block

## 3. Prod nginx: collapse api. into app.

- [x] 3.1 In `nginx/nginx.prod.conf`, add an `/api/` location to the `app.127.0.0.1.nip.io` server block, proxying to `http://server:5000` (matching the existing prod upstream reference) with no trailing path after the port
- [x] 3.2 Remove the `api.127.0.0.1.nip.io` server block entirely
- [x] 3.3 With the `prod` profile running, verify `app.127.0.0.1.nip.io/` still serves the dashboard, `app.127.0.0.1.nip.io/api/health` reaches the server, and `api.127.0.0.1.nip.io` matches no server block

## 4. Confirm www. is untouched

- [x] 4.1 Confirm the `www.127.0.0.1.nip.io` server block in both configs is unchanged and has no `/api/` location
