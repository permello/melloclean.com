# shared-auth-schemas Specification

## Purpose
TBD - defines the shared Zod schemas and inferred TypeScript types used to validate authentication-related data (user records, login requests, and signup requests) across the codebase.

## Requirements

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

### Requirement: Login request schema
`loginSchema` SHALL require `email` in valid email format and `password` with a minimum length of 8 characters.

#### Scenario: Valid login credentials
- **WHEN** `{ email: "user@example.com", password: "longenough" }` is parsed against `loginSchema`
- **THEN** parsing succeeds and returns a value typed as `LoginRequest`

#### Scenario: Invalid email format is rejected
- **WHEN** `{ email: "not-an-email", password: "longenough" }` is parsed against `loginSchema`
- **THEN** parsing fails

#### Scenario: Password shorter than 8 characters is rejected
- **WHEN** `{ email: "user@example.com", password: "short" }` is parsed against `loginSchema`
- **THEN** parsing fails

### Requirement: Signup request schema
`signupSchema` SHALL require `firstName`, `lastName`, `email` (valid email format), `password` (minimum length 8), and `confirmPassword`, where `confirmPassword` MUST equal `password`. `signupSchema` SHALL NOT include any service-address fields.

#### Scenario: Valid signup data
- **WHEN** `{ firstName: "Jane", lastName: "Doe", email: "jane@example.com", password: "longenough", confirmPassword: "longenough" }` is parsed against `signupSchema`
- **THEN** parsing succeeds and returns a value typed as `SignupRequest`

#### Scenario: Mismatched confirmPassword is rejected
- **WHEN** `signupSchema` is parsed with `password: "longenough"` and `confirmPassword: "different"`
- **THEN** parsing fails

#### Scenario: Signup data with only account fields succeeds without address
- **WHEN** valid signup data containing no street, city, state, or zip fields is parsed against `signupSchema`
- **THEN** parsing succeeds, demonstrating address is not part of this schema's shape
