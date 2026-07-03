## Context

The root `Dockerfile` already defines the build-time half of this: a shared `development` stage (CMD `npm run dev`, i.e. `turbo run dev` across all three apps) and three independent production stages (`client-production`, `dashboard-production`, `server-production`) built via `turbo prune @permello/<app> --docker`. `nginx/nginx.dev.conf` already exists and proxies `www/app/api.127.0.0.1.nip.io` to `client:3000` / `dashboard:3001` / `server:5000`. `docker-compose.yml` is currently empty — it previously described an older `db` / `backend` / `frontend` topology that predates the turborepo restructure and is not being resurrected.

This design covers only the Compose/orchestration layer: which services exist, how `profiles` select between them, and how nginx routes to each. It does not change the Dockerfile's stages or the apps' code.

## Goals / Non-Goals

**Goals:**
- One `docker-compose.yml` that can bring up a full dev topology or a full prod topology via `docker compose --profile dev|prod up`.
- Dev topology structurally mirrors prod: three separate app containers, not one shared container running all three apps' dev servers.
- `db` is shared infrastructure, always available regardless of which profile is selected.
- Dev containers support hot reload without rebuilding the image.

**Non-Goals:**
- TLS/certificate handling for real production domains — `nginx-prod` establishes routing only; certs are a separate future change.
- Changing the Dockerfile's stages, build args, or per-app build logic.
- CI/CD wiring (e.g. which profile a deploy pipeline invokes) — out of scope for this change.
- Production secrets management — `.env` / `.env.example` usage stays as-is.

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

**`db` has no `profiles:` key.** Compose starts services with no `profiles` entry regardless of which `--profile` flag is passed. Since Postgres access is needed identically in dev and prod-local-testing, giving it no profile restriction avoids duplicating a `db` service per profile.

**Two nginx services, two conf files.** `nginx-dev` mounts `nginx/nginx.dev.conf` (updated to point at `-dev`-suffixed upstreams); `nginx-prod` mounts a new `nginx/nginx.prod.conf` (points at the unsuffixed prod service names). Both listen on port 80 but are never running simultaneously since only one profile is active at a time. Keeping them as separate files (rather than one parameterized template) matches the reality that dev and prod nginx configs tend to diverge further over time anyway (TLS, security headers, caching) — better to let them fork cleanly now than build indirection for a hypothetical shared template.

**Hot reload via bind mount + anonymous `node_modules` volume.** Each dev-profile service mounts the monorepo root (`.:/monorepo`) so source edits are reflected live, plus an anonymous volume over `/monorepo/node_modules` so the container's own installed `node_modules` (including any platform-specific native deps installed at image build time) isn't shadowed by the host's. The monorepo root is mounted (not just the individual app directory) because `turbo --filter` still needs to resolve `packages/shared` and `packages/ui` as workspace dependencies.

## Risks / Trade-offs

[Three dev containers each rebuild/reinstall independently, increasing dev `docker compose up` cold-start time vs. one shared container] → Acceptable trade-off for parity with prod's isolation model; Docker layer caching on the shared base/`npm ci` layers keeps warm-start cost low.

[Two nginx conf files can drift out of sync over time (e.g. a route added to dev but forgotten in prod)] → Accepted for now since dev/prod nginx configs are expected to diverge further anyway (TLS in prod); revisit if drift becomes a recurring bug source.

[`-dev` service-name suffix is a naming convention chosen somewhat arbitrarily] → Flagged as an open question in the proposal; cheap to rename later since it's isolated to `docker-compose.yml` and `nginx.dev.conf`.

[No TLS story yet for `nginx-prod`] → Explicitly a non-goal here; real production deployment will need a follow-up change before this topology is internet-facing.

## Migration Plan

1. Write `docker-compose.yml` from scratch (no existing working file to migrate from — previous version is already deleted and structurally obsolete).
2. Update `nginx/nginx.dev.conf` upstream hostnames.
3. Add `nginx/nginx.prod.conf`.
4. Validate `dev` profile locally: `docker compose --profile dev up`, confirm all three nip.io subdomains reach their app with live-reload working.
5. Validate `prod` profile locally: `docker compose --profile prod up`, confirm all three subdomains reach the built production apps.
6. Update `package.json`'s `dev:dock` script (and add a `prod:dock` equivalent) to pass the correct `--profile` flag.

No rollback concerns beyond reverting the file changes — no persisted data migration involved (the `db` named volume is new, not a migration of existing data).

## Open Questions

- Final naming convention for dev-profile services (`-dev` suffix vs. alternative).
- Whether/when a follow-up change adds TLS + real-domain routing to `nginx-prod`.
- Whether `prod` profile is meant to be run locally only (as a pre-deploy smoke test) or is the literal topology used in a real deployment target — affects how much further hardening (health checks, restart policies) belongs in this change vs. later.
