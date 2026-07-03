## ADDED Requirements

### Requirement: Profile-selected Compose topology
The system SHALL provide a single `docker-compose.yml` defining both a `dev` and a `prod` Compose profile, such that running `docker compose --profile dev up` brings up only the development topology and `docker compose --profile prod up` brings up only the production topology.

#### Scenario: Starting the dev profile
- **WHEN** an operator runs `docker compose --profile dev up`
- **THEN** the `client-dev`, `dashboard-dev`, `server-dev`, `nginx-dev`, and `db` services start, and no `prod`-only service starts

#### Scenario: Starting the prod profile
- **WHEN** an operator runs `docker compose --profile prod up`
- **THEN** the `client`, `dashboard`, `server`, `nginx-prod`, and `db` services start, and no `dev`-only service starts

### Requirement: Dev topology mirrors prod topology
The dev profile SHALL run three independently-scoped app containers (one per app), matching the prod profile's per-app container shape, rather than a single container running all three apps' dev servers together.

#### Scenario: Each dev container runs only its own app
- **WHEN** the `dev` profile is running
- **THEN** `client-dev` runs only the client app's dev server, `dashboard-dev` runs only the dashboard app's dev server, and `server-dev` runs only the server app's dev server

### Requirement: Shared database across profiles
The `db` service SHALL be available identically regardless of which profile is selected, and SHALL persist data via a named volume.

#### Scenario: Database available under either profile
- **WHEN** either the `dev` or `prod` profile is started
- **THEN** the `db` service starts and is reachable by the app containers in that profile

#### Scenario: Database data survives container recreation
- **WHEN** the `db` service's container is removed and recreated
- **THEN** previously written data is still present, because it is stored in a named volume rather than the container's writable layer

### Requirement: Dev containers support hot reload
Dev-profile app containers SHALL reflect source code changes made on the host without requiring an image rebuild.

#### Scenario: Editing source code while dev profile is running
- **WHEN** a developer edits a file under `apps/` or `packages/` while the `dev` profile is running
- **THEN** the corresponding dev container's dev server picks up the change and reflects it, without a `docker compose build` step

### Requirement: Nginx subdomain routing per profile
Each profile SHALL have its own nginx service and configuration file, routing nip.io-style subdomains to that profile's app services by their profile-specific service names.

#### Scenario: Dev nginx routes to dev services
- **WHEN** the `dev` profile is running and a request is made to `www.127.0.0.1.nip.io`, `app.127.0.0.1.nip.io`, or `api.127.0.0.1.nip.io`
- **THEN** `nginx-dev` proxies the request to `client-dev`, `dashboard-dev`, or `server-dev` respectively

#### Scenario: Prod nginx routes to prod services
- **WHEN** the `prod` profile is running and a request is made to the equivalent subdomains
- **THEN** `nginx-prod` proxies the request to `client`, `dashboard`, or `server` respectively
