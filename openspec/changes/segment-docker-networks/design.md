## Context

`docker-compose.yml` currently declares no top-level `networks:` key, so Compose attaches every service — `client(-dev)`, `dashboard(-dev)`, `server(-dev)`, `nginx-prod`, `nginx-dev` — to a single implicit default bridge network. Nginx's subdomain routing (`www.` → client, `app.` → dashboard + `/api/` → server, per `openspec/specs/deployment-topology/spec.md`) implies a trust boundary between the public marketing site and the app/API, but that boundary only governs browser-facing traffic; it does nothing to restrict container-to-container reachability.

No application code today calls across this boundary (confirmed: `apps/dashboard` and `apps/client` have no `fetch`/`axios`/API-client code yet; `apps/server` has no CORS middleware). This is the same greenfield situation the archived `unify-app-api-origin` change addressed for browser origins — the boundary is being drawn ahead of real traffic, while it's cheap.

## Goals / Non-Goals

**Goals:**
- Enforce, at the Docker network layer, that `client`/`client-dev` cannot reach `dashboard`/`server` (or their `-dev` equivalents) directly.
- Keep `dashboard`/`server` (and `-dev` equivalents) able to reach each other, since they are declared same-origin/coupled by the existing `unify-app-api-origin` change.
- Apply the same shape to both the `dev` and `prod` profiles, consistent with the existing `deployment-topology` spec's "dev mirrors prod" requirement.
- Preserve `server`/`server-dev`'s outbound connectivity to Appwrite Cloud / the self-hosted Appwrite VPS.

**Non-Goals:**
- No change to nginx routing behavior or config files — nginx already reaches all three services by Compose DNS name; only its network membership changes.
- No change to which ports are published to the host (only `nginx-prod`/`nginx-dev` publish `80:80` today; that is unaffected).
- No application-level network hardening (CORS, auth, rate limiting) — this change is Docker network topology only.
- No use of Docker's `internal: true` network flag — see Decisions below.

## Decisions

### Two networks: `public-net` and `app-net`, not three or one-per-service

Considered: a network per service (maximum isolation, but `dashboard` and `server` are declared same-origin/coupled by `unify-app-api-origin`, so isolating them from each other would be undone the moment either needs to add real inter-service calls, and buys no security benefit today since they're meant to trust each other). Considered: leaving one flat network and relying only on nginx routing (the status quo — rejected because it's exactly the gap this change closes). Two networks was chosen because it mirrors the exact boundary already drawn at the browser-origin layer: client is untrusted/public, dashboard+server are one coupled unit.

### Nginx is the only dual-homed service

`nginx-prod`/`nginx-dev` attach to both `public-net` and `app-net`, since routing browser requests to all three services is nginx's whole job. Every other service attaches to exactly one network. This keeps the blast-radius property intact: nginx is already the trusted front door in this architecture (it terminates the host's published port 80), so widening its own network membership doesn't create a new privileged path — it already had one.

### Neither network is marked `internal: true`

Docker's `internal: true` flag removes a network's outbound route to the internet entirely — it's a stronger, orthogonal restriction from inter-container isolation. `server`/`server-dev` need outbound HTTPS to Appwrite Cloud (dev) or the self-hosted Appwrite VPS (prod), per the existing `deployment-topology` spec's "External Appwrite backend configuration" requirement. Marking `app-net` internal would silently break that. Plain user-defined bridge networks already provide the inter-container isolation this change is after (containers on different bridge networks cannot resolve each other's names or reach each other's ports by default), without touching egress.

### Every service gets an explicit `networks:` key

If any service in a Compose file with custom top-level `networks:` omits its own `networks:` key, Compose still attaches it to an implicit `default` network alongside the named ones — silently reopening the same flat-network gap this change closes. Every service (`client`, `client-dev`, `dashboard`, `dashboard-dev`, `server`, `server-dev`, `nginx-prod`, `nginx-dev`) must declare its `networks:` list explicitly.

## Risks / Trade-offs

- **[Risk]** A future feature requires `client` to call `server` or `dashboard` directly (container-to-container, bypassing nginx) — e.g., a server-side integration. → **Mitigation**: None automated; if this need arises, it should go through nginx like any other client (matching how a real external client would reach these services), or be a deliberate, documented exception to add `client` to `app-net`. Not expected given `client`'s current scope (public marketing site with no API-calling code).
- **[Risk]** Developers running `docker compose` commands without `--profile` may be confused if dev/prod services can't reach each other across networks in ad hoc debugging. → **Mitigation**: This was never a supported cross-profile pattern (profiles are meant to be run independently); no behavior actually regresses here since dev and prod services never had a reason to talk to each other.
- **[Trade-off]** Two extra network declarations and a `networks:` line on every service adds minor verbosity to `docker-compose.yml`. → Accepted: the file stays well under a size where this is a readability problem, and the explicit structure documents the trust boundary directly in the compose file rather than leaving it implicit.

## Migration Plan

No data migration; this is a compose-file-only config change.
1. Add top-level `networks: { public-net: {}, app-net: {} }` to `docker-compose.yml`.
2. Add `networks: [public-net]` to `client` and `client-dev`.
3. Add `networks: [app-net]` to `dashboard`, `dashboard-dev`, `server`, `server-dev`.
4. Add `networks: [public-net, app-net]` to `nginx-prod` and `nginx-dev`.
5. Restart the relevant profile (`docker compose --profile dev up` or `--profile prod up`) and verify:
   - `www.127.0.0.1.nip.io` and `app.127.0.0.1.nip.io` (with `/api/`) still resolve correctly through nginx.
   - `docker compose exec client ping server` (or equivalent) fails to resolve, confirming isolation.
   - `server`/`server-dev` can still reach Appwrite (e.g., a `/api/health` call that touches Appwrite, if one exists, or basic outbound connectivity from within the container).

Rollback is reverting `docker-compose.yml` — no state to unwind.

## Open Questions

- None outstanding — all decisions above were confirmed during exploration.
