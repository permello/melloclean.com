## MODIFIED Requirements

### Requirement: Security and parsing middleware chain
The server SHALL apply security headers, CORS evaluation, JSON request parsing, cookie authentication,
and authorization before protected endpoint handlers execute.

#### Scenario: Processing is applied to requests
- **WHEN** an HTTP request reaches the server
- **THEN** security headers and CORS policy are applied and any required JSON, cookie authentication, and authorization processing completes before the endpoint runs

### Requirement: Parsed cookies available to route handlers
The server SHALL parse incoming cookies before authentication and endpoint execution so the
application session cookie is available to authentication processing.

#### Scenario: Request with a cookie header
- **WHEN** a request includes a `session` cookie
- **THEN** the cookie value is available to authentication processing before the endpoint executes

