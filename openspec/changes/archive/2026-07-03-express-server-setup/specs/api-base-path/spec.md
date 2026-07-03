## MODIFIED Requirements

### Requirement: Server mounts all routes under /api
The server SHALL mount all of its HTTP routes under a `/api` path prefix, so that a reverse proxy can forward requests under `/api/*` to the server without rewriting the path.

#### Scenario: Health check is served under /api
- **WHEN** a request is made to `/api/health` on the server
- **THEN** the server responds with HTTP 200 and a JSON body `{ "status": "ok" }`

#### Scenario: Bare root is not a route
- **WHEN** a request is made to `/health` (without the `/api` prefix) directly on the server
- **THEN** the server does not serve its health check response there
