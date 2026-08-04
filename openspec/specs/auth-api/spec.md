# auth-api Specification

## Purpose

Defines the browser-facing authentication API that keeps Appwrite credentials and session handling
behind the application server while exposing stable account and identity operations.

## Requirements

### Requirement: Account signup creates an authenticated session
The server SHALL expose `POST /api/auth/signup` accepting `firstName`, `lastName`, `email`,
`password`, and `confirmPassword`. It SHALL reject invalid input, create the Appwrite account, create
an Appwrite session, set the application session cookie, and return the authenticated identity.

#### Scenario: Successful signup
- **WHEN** a browser submits valid signup data for an email not already registered
- **THEN** the server creates the Appwrite account and session, sets the session cookie, and responds with HTTP 201 and the authenticated identity

#### Scenario: Invalid signup input
- **WHEN** signup data has an invalid email, a password shorter than eight characters, or mismatched password confirmation
- **THEN** the server responds with HTTP 400 and does not create an account

#### Scenario: Existing account conflict
- **WHEN** signup is requested for an email already registered with Appwrite
- **THEN** the server responds with HTTP 409 and does not expose Appwrite implementation details

### Requirement: Login exchanges credentials for an application session
The server SHALL expose `POST /api/auth/login` accepting an email and password, authenticate those
credentials with Appwrite, set the application session cookie, and return the authenticated identity.

#### Scenario: Successful login
- **WHEN** a browser submits valid credentials
- **THEN** the server responds with HTTP 200, sets the session cookie, and returns the authenticated identity

#### Scenario: Invalid login
- **WHEN** Appwrite rejects the supplied credentials
- **THEN** the server responds with HTTP 401 without revealing whether the email or password was incorrect

### Requirement: Current-user endpoint resolves Appwrite identity and teams
The server SHALL expose `GET /api/auth/me` and return `id`, `email`, `emailVerified`, and `teams` for
the active Appwrite session. Team names returned by Appwrite SHALL be the authorization roles exposed
by this endpoint.

#### Scenario: Authenticated identity lookup
- **WHEN** a request has a valid application session cookie
- **THEN** the server responds with HTTP 200 and the account identity and current Appwrite team names

#### Scenario: Unauthenticated identity lookup
- **WHEN** the session cookie is missing, invalid, or expired
- **THEN** the server responds with HTTP 401

### Requirement: Logout terminates the upstream and local session
The server SHALL expose `POST /api/auth/logout`, terminate the current Appwrite session when one is
present, expire the application session cookie, and produce an idempotent successful response.

#### Scenario: Logout with an active session
- **WHEN** a browser posts to logout with a valid session cookie
- **THEN** the server deletes the current Appwrite session, expires the cookie, and responds with HTTP 204

#### Scenario: Logout without an active session
- **WHEN** a browser posts to logout without a valid active session
- **THEN** the server expires any application session cookie and responds with HTTP 204

### Requirement: Session cookie is server controlled
The application session cookie SHALL be named `session`, use `HttpOnly`, use `SameSite=Strict`, use
`Path=/`, and use `Secure` outside local development. Authentication responses SHALL NOT include the
Appwrite session secret in their JSON bodies.

#### Scenario: Browser receives a production session
- **WHEN** signup or login succeeds outside local development
- **THEN** the response sets a `session` cookie with `HttpOnly`, `Secure`, `SameSite=Strict`, and `Path=/` attributes and omits the secret from the body

#### Scenario: Browser receives a local-development session
- **WHEN** signup or login succeeds in local development
- **THEN** the response sets a `session` cookie with `HttpOnly`, `SameSite=Strict`, and `Path=/` attributes, may omit `Secure` for local HTTP, and omits the secret from the body
