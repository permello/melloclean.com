## MODIFIED Requirements

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
