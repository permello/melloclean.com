## MODIFIED Requirements

### Requirement: Auth schema export location
All browser-facing authentication request and response schemas and their inferred TypeScript types
SHALL be exported from `@permello/shared/types/authSchema`. The C# server SHALL expose equivalent JSON
contracts but SHALL NOT import TypeScript definitions at runtime.

#### Scenario: Importing auth types
- **WHEN** a browser application imports authenticated-user, login, or signup schemas from `@permello/shared/types/authSchema`
- **THEN** the import resolves to a Zod schema with a corresponding inferred TypeScript type

### Requirement: User schema shape
The authenticated-user schema SHALL validate exactly `id` (string), `email` (valid email string),
`emailVerified` (boolean), and `teams` (array of strings), matching `GET /api/auth/me` and successful
signup and login responses. It SHALL NOT represent an Appwrite Database profile document or expose a
singular role as authorization truth.

#### Scenario: Valid authenticated identity parses successfully
- **WHEN** an object containing valid `id`, `email`, `emailVerified`, and `teams` fields is parsed
- **THEN** parsing succeeds and returns the authenticated-user type

#### Scenario: Missing teams are rejected
- **WHEN** an authenticated identity response has no `teams` field
- **THEN** parsing fails

#### Scenario: Database profile fields are not part of authentication identity
- **WHEN** a consumer inspects the authenticated-user schema
- **THEN** it does not require `appwrite_id`, profile names, timestamps, terms fields, or a singular `role`

