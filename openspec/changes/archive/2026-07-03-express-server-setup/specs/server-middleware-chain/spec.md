## ADDED Requirements

### Requirement: Security and parsing middleware chain
The server SHALL apply `helmet`, `cors`, JSON body parsing, and `cookie-parser` middleware to every incoming request, in that order, before any route handler executes.

#### Scenario: Middleware applied to all requests
- **WHEN** any HTTP request reaches the server
- **THEN** the response carries `helmet`'s default security headers, the request has been evaluated against the CORS policy, its JSON body (if any) has been parsed, and its cookies (if any) have been parsed onto `req.cookies`, all before a route handler runs

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
The server SHALL parse incoming `Cookie` headers via `cookie-parser` before any route handler executes, making cookie values available on `req.cookies`.

#### Scenario: Request with a cookie header
- **WHEN** a request includes a `Cookie` header
- **THEN** `req.cookies` is populated with the parsed cookie key/value pairs before the request reaches a route handler
