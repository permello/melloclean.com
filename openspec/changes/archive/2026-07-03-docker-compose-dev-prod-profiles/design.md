## Context

The root `Dockerfile` already defines the build-time half of this: a shared `development` stage (CMD `npm run dev`, i.e. `turbo run dev` across all three apps) and three independent production stages (`client-production`, `dashboard-production`, `server-production`) built via `turbo prune @permello/<app> --docker`. `nginx/nginx.dev.conf` already exists and proxies `www/app/api.127.0.0.1.nip.io` to `client:3000` / `dashboard:3001` / `server:5000`. `docker-compose.yml` is currently empty — it previously described an older `db` / `backend` / `frontend` topology that predates the turborepo restructure and is not being resurrected.

This design covers only the Compose/orchestration layer: which services exist, how `profiles` select between them, and how nginx routes to each. It does not change the Dockerfile's stages or the apps' code. It also does not cover Appwrite itself — Appwrite runs outside this repo entirely (Appwrite Cloud for dev, a self-hosted instance on a separate VPS for prod), and this design only covers how `server`/`server-dev` are configured with env vars to reach it.

## Goals / Non-Goals

**Goals:**
- One `docker-compose.yml` that can bring up a full dev topology or a full prod topology via `docker compose --profile dev|prod up`.
- Dev topology structurally mirrors prod: three separate app containers, not one shared container running all three apps' dev servers.
- `server`/`server-dev` are configured to reach Appwrite as an external HTTP dependency via env vars, without any Appwrite container existing in this compose file.
- Dev containers support hot reload without rebuilding the image.

**Non-Goals:**
- TLS/certificate handling for real production domains — `nginx-prod` establishes routing only; certs are a separate future change.
- Changing the Dockerfile's stages, build args, or per-app build logic.
- CI/CD wiring (e.g. which profile a deploy pipeline invokes) — out of scope for this change.
- Production secrets management — `.env` / `.env.example` usage stays as-is (now also carrying Appwrite credentials).
- Provisioning, deploying, or managing the self-hosted Appwrite VPS, or its TLS — out of scope; this design only covers how `server` is configured with an endpoint/credentials to reach it, wherever it lives.

## Decisions

**Compose `profiles` over env-var target-swapping.** Two viable mechanisms were considered: (a) one set of service names with `build.target` swapped via an environment variable, or (b) `profiles` gating two full sets of service definitions. (a) was rejected because a single service name can only carry one `command:`/`volumes:` shape at a time, and dev needs a fundamentally different runtime shape (bind mounts, filtered turbo command, three scoped containers) than prod (immutable image, baked CMD) — trying to parameterize both through one service definition would need almost as many conditionals as just writing two service blocks. `profiles` is also the idiomatic Compose feature for exactly this "pick a subset of services" use case.

**Three scoped dev containers, not one shared dev container.** The `development` stage's default `CMD` (`npm run dev`) runs all three apps' dev servers together. Naively reusing that CMD in three separate containers (`client-dev`, `dashboard-dev`, `server-dev`) would mean each container runs all three dev servers internally — wasteful and not actually mirroring prod's per-app isolation. Each dev service overrides `command:` to scope turbo to one workspace, e.g.:
```yaml
client-dev:
  build: { context: ., target: development }
  command: npx turbo run dev --filter=@permello/client
```
This keeps the same image/target for all three dev services (only `command:` differs), while still giving three independently-restartable containers matching prod's shape.

**Separate service names per profile (`client-dev` vs `client`), not shared names.** A Compose file cannot define the same service key twice, so mirroring prod's names in dev is not possible without a suffix. `-dev` suffix was chosen for clarity in `docker compose ps` output and logs. This is called out as an open naming question in the proposal since it hasn't been fully settled.

**Appwrite is never a container in this compose file.** Self-hosting Appwrite's official stack (~15 containers: api, realtime, workers, mariadb, redis, influxdb...) was considered and rejected for local dev: Appwrite's own docs recommend 4GB RAM as a minimum, which doesn't leave enough headroom alongside the three dev app containers, Docker/WSL2 overhead, and normal desktop use on an 8GB dev machine. Instead: dev points `server-dev` at Appwrite Cloud (managed SaaS, zero local footprint); prod points `server` at a self-hosted Appwrite instance running on a separate VPS, entirely outside this repo's compose topology. Both are consumed purely as external HTTP dependencies.

**Same env var names for both profiles, resolved by whichever `.env` is active.** `APPWRITE_ENDPOINT` / `APPWRITE_PROJECT_ID` / `APPWRITE_API_KEY` are not environment-suffixed (no `_DEV`/`_PROD` split) — this matches the existing flat `.env`/`.env.example` pattern already used for `POSTGRES_*`. A developer's local `.env` holds Appwrite Cloud values; the prod host's `.env` holds the self-hosted VPS's values. The trade-off: only one set of values can be active at a time (see Risks).

**Two nginx services, two conf files.** `nginx-dev` mounts `nginx/nginx.dev.conf` (updated to point at `-dev`-suffixed upstreams); `nginx-prod` mounts a new `nginx/nginx.prod.conf` (points at the unsuffixed prod service names). Both listen on port 80 but are never running simultaneously since only one profile is active at a time. Keeping them as separate files (rather than one parameterized template) matches the reality that dev and prod nginx configs tend to diverge further over time anyway (TLS, security headers, caching) — better to let them fork cleanly now than build indirection for a hypothetical shared template.

**Hot reload via bind mount + anonymous `node_modules` volume.** Each dev-profile service mounts the monorepo root (`.:/monorepo`) so source edits are reflected live, plus an anonymous volume over `/monorepo/node_modules` so the container's own installed `node_modules` (including any platform-specific native deps installed at image build time) isn't shadowed by the host's. The monorepo root is mounted (not just the individual app directory) because `turbo --filter` still needs to resolve `packages/shared` and `packages/ui` as workspace dependencies.

## Risks / Trade-offs

[Three dev containers each rebuild/reinstall independently, increasing dev `docker compose up` cold-start time vs. one shared container] → Acceptable trade-off for parity with prod's isolation model; Docker layer caching on the shared base/`npm ci` layers keeps warm-start cost low.

[Two nginx conf files can drift out of sync over time (e.g. a route added to dev but forgotten in prod)] → Accepted for now since dev/prod nginx configs are expected to diverge further anyway (TLS in prod); revisit if drift becomes a recurring bug source.

[`-dev` service-name suffix is a naming convention chosen somewhat arbitrarily] → Flagged as an open question in the proposal; cheap to rename later since it's isolated to `docker-compose.yml` and `nginx.dev.conf`.

[No TLS story yet for `nginx-prod`] → Explicitly a non-goal here; real production deployment will need a follow-up change before this topology is internet-facing.

[Dev (Appwrite Cloud) and prod (self-hosted Appwrite on a VPS) are two different Appwrite instances/versions] → Behavior can drift between environments (version differences, Cloud-specific quotas/limits) in a way that pure-Docker services didn't have; accepted since VPS provisioning and cloud/self-hosted parity are out of scope for this change.

[Local `--profile prod up` smoke testing needs the VPS's Appwrite values in `.env`, not Cloud's] → Since env var names aren't environment-suffixed, a developer switching from dev to a local prod smoke-test needs to manually swap `.env` values; accepted as a minor manual step rather than adding suffixed variables.

## Migration Plan

1. Write `docker-compose.yml` from scratch (no existing working file to migrate from — previous version is already deleted and structurally obsolete).
2. Update `nginx/nginx.dev.conf` upstream hostnames.
3. Add `nginx/nginx.prod.conf`.
4. Update `.env.example`: remove `POSTGRES_*`, add `APPWRITE_ENDPOINT` / `APPWRITE_PROJECT_ID` / `APPWRITE_API_KEY`.
5. Validate `dev` profile locally: `docker compose --profile dev up`, confirm all three nip.io subdomains reach their app with live-reload working, and `server-dev` can reach Appwrite Cloud using the configured credentials.
6. Validate `prod` profile locally: `docker compose --profile prod up` (with `.env` pointed at the VPS), confirm all three subdomains reach the built production apps and `server` can reach the self-hosted Appwrite instance.
7. Update `package.json`'s `dev:dock` script (and add a `prod:dock` equivalent) to pass the correct `--profile` flag.

No rollback concerns beyond reverting the file changes — no persisted data migration involved (there is no database service or volume in this topology).

## Open Questions

- Final naming convention for dev-profile services (`-dev` suffix vs. alternative).
- Whether/when a follow-up change adds TLS + real-domain routing to `nginx-prod`.
- Whether `prod` profile is meant to be run locally only (as a pre-deploy smoke test) or is the literal topology used in a real deployment target — affects how much further hardening (health checks, restart policies) belongs in this change vs. later.
