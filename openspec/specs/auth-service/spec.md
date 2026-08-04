# auth-service

## Purpose

Provide a single, Appwrite-agnostic seam (`AuthService`) that Express routes and middleware use to validate a session and resolve its identity and team memberships, and to end a session on logout — so that Appwrite SDK specifics (`node-appwrite`, session-scoped clients) stay isolated behind `AppwriteAuthService` and `config/appwrite.ts` rather than leaking into route handlers. `requireAuth` and `requireTeam` Express middleware are built on top of this interface to provide authentication and team-gated authorization for routes.

## Requirements

### Requirement: AuthService interface shape
The authentication service SHALL expose operations to create an account and session, create a session
from credentials, validate a session token into `{ id, email, emailVerified, teams }`, and terminate a
session. Team information SHALL be resolved as part of session validation rather than through a
separate route-level lookup.

#### Scenario: Session validation includes teams
- **WHEN** the authentication service validates an active session
- **THEN** it returns the account identity and current Appwrite team names in one authenticated identity result

### Requirement: validateSession never accesses the database
Session validation SHALL derive its result only from Appwrite Account and Teams operations executed
for the presented session. It SHALL NOT read from or write to an Appwrite Database user collection.

#### Scenario: Valid token resolves identity and teams
- **WHEN** session validation receives an active token for a member of the `CLIENT` and `WORKER` teams
- **THEN** it returns the account id, email, verification state, and teams `["CLIENT", "WORKER"]`

#### Scenario: Invalid or expired token is rejected
- **WHEN** session validation receives a token that does not authenticate an active Appwrite session
- **THEN** validation fails and no partial identity is returned

### Requirement: logout ends the session identified by the given token
Logout SHALL terminate the current Appwrite session represented by the supplied application session
token and SHALL NOT require a browser to supply an Appwrite session identifier.

#### Scenario: Logging out with a valid token
- **WHEN** logout is called for an active session
- **THEN** that Appwrite session is ended and subsequent validation of the token fails

### Requirement: requireAuth middleware
Authentication processing SHALL read the `session` request cookie, validate it, and make the resolved
identity and teams available to the endpoint. A missing, invalid, or expired cookie SHALL produce HTTP
401 and prevent the protected endpoint from executing.

#### Scenario: Missing session cookie
- **WHEN** a protected endpoint receives no `session` cookie
- **THEN** the response status is 401 and the endpoint does not run

#### Scenario: Invalid session token
- **WHEN** a protected endpoint receives a `session` cookie that cannot be validated
- **THEN** the response status is 401 and the endpoint does not run

#### Scenario: Valid session token
- **WHEN** a protected endpoint receives a valid `session` cookie
- **THEN** the resolved identity and teams are available and the endpoint runs

### Requirement: requireTeam middleware composes requireAuth
Team authorization SHALL require an authenticated session and then determine access solely by whether
the resolved Appwrite team names contain the required team. It SHALL return HTTP 401 for an
unauthenticated request and HTTP 403 for an authenticated user missing the team.

#### Scenario: Team policy receives unauthenticated request
- **WHEN** a team-protected endpoint receives no valid session
- **THEN** it responds with HTTP 401

#### Scenario: Authenticated user without the required team
- **WHEN** an authenticated user accesses an `ADMIN`-protected endpoint without the `ADMIN` Appwrite team
- **THEN** the endpoint responds with HTTP 403

#### Scenario: Authenticated user with the required team
- **WHEN** an authenticated user accesses an `ADMIN`-protected endpoint with the `ADMIN` Appwrite team
- **THEN** authorization succeeds and the endpoint runs
