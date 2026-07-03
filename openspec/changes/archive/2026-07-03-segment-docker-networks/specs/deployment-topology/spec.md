## ADDED Requirements

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
