# server-middleware-chain Specification

## Purpose
TBD - defines the security and parsing middleware chain (helmet, cors, JSON body parsing, cookie-parser) applied to every incoming request before route handlers run, including the environment-driven CORS origin allowlist and its fail-closed default.

## Requirements

### Requirement: Security and parsing middleware chain
The server SHALL apply security headers, CORS evaluation, JSON request parsing, cookie authentication,
and authorization before protected endpoint handlers execute.

#### Scenario: Processing is applied to requests
- **WHEN** an HTTP request reaches the server
- **THEN** security headers and CORS policy are applied and any required JSON, cookie authentication, and authorization processing completes before the endpoint runs

### Requirement: CORS origin allowlist is environment-driven
The server SHALL read its permitted CORS origins from the `CORS_ORIGINS` environment variable, a comma-separated list of full origins (including scheme), and configure `cors` to allow only those origins with `credentials: true`.

#### Scenario: Request from an allowlisted origin
- **WHEN** a browser sends a credentialed request whose `Origin` header exactly matches an entry in `CORS_ORIGINS`
- **THEN** the server responds with CORS headers permitting that origin and credentials

#### Scenario: Request from a non-allowlisted origin
- **WHEN** a browser sends a request whose `Origin` header does not exactly match any entry in `CORS_ORIGINS`
- **THEN** the server's response does not grant that origin CORS access, and the browser blocks the page from reading the response

### Requirement: CORS_ORIGINS defaults to fail-closed
When `CORS_ORIGINS` is unset or empty, the server SHALL configure an empty origin allowlist rather than allowing all origins or reflecting the request's `Origin` header.

#### Scenario: CORS_ORIGINS not configured
- **WHEN** the server starts without a `CORS_ORIGINS` environment variable set (or set to an empty string)
- **THEN** no cross-origin request is granted CORS access, regardless of its `Origin` header

### Requirement: Parsed cookies available to route handlers
The server SHALL parse incoming cookies before authentication and endpoint execution so the
application session cookie is available to authentication processing.

#### Scenario: Request with a cookie header
- **WHEN** a request includes a `session` cookie
- **THEN** the cookie value is available to authentication processing before the endpoint executes
