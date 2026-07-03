# deployment-topology Specification

## Purpose
TBD - defines the Compose-based deployment topology for dev and prod profiles, including per-app containers, external Appwrite backend configuration, dev hot reload, and nginx subdomain routing for each profile.

## Requirements

### Requirement: Profile-selected Compose topology
The system SHALL provide a single `docker-compose.yml` defining both a `dev` and a `prod` Compose profile, with the `dev` profile exposed to developers via root `package.json` scripts `dev:start` and `dev:stop`, such that running `npm run dev:start` brings up only the development topology and `npm run dev:stop` tears it down. The `prod` profile SHALL be started via a direct `docker compose --profile prod up` invocation, with no `package.json` script wrapping it.

#### Scenario: Starting the dev profile
- **WHEN** an operator runs `npm run dev:start`
- **THEN** the `client-dev`, `dashboard-dev`, `server-dev`, and `nginx-dev` services start, and no `prod`-only service starts

#### Scenario: Stopping the dev profile
- **WHEN** an operator runs `npm run dev:stop`
- **THEN** the dev profile's services and volumes are stopped and removed

#### Scenario: Starting the prod profile
- **WHEN** an operator runs `docker compose --profile prod up`
- **THEN** the `client`, `dashboard`, `server`, and `nginx-prod` services start, and no `dev`-only service starts

### Requirement: Dev topology mirrors prod topology
The dev profile SHALL run three independently-scoped app containers (one per app), matching the prod profile's per-app container shape, rather than a single container running all three apps' dev servers together.

#### Scenario: Each dev container runs only its own app
- **WHEN** the `dev` profile is running
- **THEN** `client-dev` runs only the client app's dev server, `dashboard-dev` runs only the dashboard app's dev server, and `server-dev` runs only the server app's dev server

### Requirement: External Appwrite backend configuration
`server`/`server-dev` SHALL be configured with `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, and `APPWRITE_API_KEY` env vars to reach Appwrite as an external HTTP dependency, and no Appwrite container SHALL exist in either profile.

#### Scenario: Dev profile reaches Appwrite Cloud
- **WHEN** the `dev` profile is started with a `.env` containing Appwrite Cloud values
- **THEN** `server-dev` is configured to reach Appwrite Cloud via those env vars, and no Appwrite container is started as part of the `dev` profile

#### Scenario: Prod profile reaches the self-hosted Appwrite VPS
- **WHEN** the `prod` profile is started with a `.env` containing the self-hosted VPS's values
- **THEN** `server` is configured to reach the self-hosted Appwrite instance via those env vars, and no Appwrite container is started as part of the `prod` profile

### Requirement: Dev containers support hot reload
Dev-profile app containers SHALL reflect source code changes made on the host without requiring an image rebuild.

#### Scenario: Editing source code while dev profile is running
- **WHEN** a developer edits a file under `apps/` or `packages/` while the `dev` profile is running
- **THEN** the corresponding dev container's dev server picks up the change and reflects it, without a `docker compose build` step

### Requirement: Nginx subdomain routing per profile
Each profile SHALL have its own nginx service and configuration file, routing nip.io-style subdomains to that profile's app services by their profile-specific service names. The `app.` subdomain SHALL route both the dashboard's root path and the `/api/` path prefix to their respective services; no separate `api.` subdomain SHALL exist.

#### Scenario: Dev nginx routes www and app to dev services
- **WHEN** the `dev` profile is running and a request is made to `www.127.0.0.1.nip.io` or `app.127.0.0.1.nip.io`
- **THEN** `nginx-dev` proxies `www.127.0.0.1.nip.io` to `client-dev`, proxies `app.127.0.0.1.nip.io/` to `dashboard-dev`, and proxies `app.127.0.0.1.nip.io/api/` to `server-dev` with the `/api` prefix preserved unmodified in the forwarded request

#### Scenario: Prod nginx routes www and app to prod services
- **WHEN** the `prod` profile is running and a request is made to the equivalent subdomains
- **THEN** `nginx-prod` proxies `www.127.0.0.1.nip.io` to `client`, proxies `app.127.0.0.1.nip.io/` to `dashboard`, and proxies `app.127.0.0.1.nip.io/api/` to `server` with the `/api` prefix preserved unmodified in the forwarded request

#### Scenario: api. subdomain no longer routes anywhere
- **WHEN** a request is made to `api.127.0.0.1.nip.io` in either profile
- **THEN** no nginx `server{}` block matches it

### Requirement: Compose network segmentation
The system SHALL define two Docker Compose networks, `public-net` and `app-net`, such that `client`/`client-dev` attach only to `public-net`; `dashboard`/`dashboard-dev` and `server`/`server-dev` attach only to `app-net`; and `nginx-prod`/`nginx-dev` attach to both networks. No service other than the nginx services SHALL be attached to more than one network, and no service SHALL rely on Compose's implicit default network. Neither network SHALL be marked `internal: true`.

#### Scenario: Client cannot reach dashboard or server directly
- **WHEN** the `dev` or `prod` profile is running
- **THEN** `client`/`client-dev` cannot resolve or open a connection to `dashboard`/`dashboard-dev` or `server`/`server-dev` (or vice versa) over the Docker network

#### Scenario: Dashboard and server can reach each other
- **WHEN** the `dev` or `prod` profile is running
- **THEN** `dashboard`/`dashboard-dev` and `server`/`server-dev` can resolve and reach each other over `app-net`

#### Scenario: Nginx reaches all three app services
- **WHEN** the `dev` or `prod` profile is running
- **THEN** `nginx-dev`/`nginx-prod` can resolve and reach `client(-dev)`, `dashboard(-dev)`, and `server(-dev)` over the network(s) each is attached to

#### Scenario: Server retains outbound Appwrite connectivity
- **WHEN** the `dev` or `prod` profile is running
- **THEN** `server`/`server-dev`, attached only to `app-net`, can still make outbound HTTPS connections to Appwrite Cloud or the self-hosted Appwrite VPS
