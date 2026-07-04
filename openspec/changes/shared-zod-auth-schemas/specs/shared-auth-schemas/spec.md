## ADDED Requirements

### Requirement: Auth schema export location
All auth-related Zod schemas and their inferred TypeScript types SHALL be exported from `@permello/shared/types/authSchema`. No auth type definitions SHALL exist outside this module.

#### Scenario: Importing auth types
- **WHEN** a consumer imports `userSchema`, `loginSchema`, or `signupSchema` from `@permello/shared/types/authSchema`
- **THEN** the import resolves to a Zod schema with a corresponding inferred TypeScript type available (`User`, `LoginRequest`, `SignupRequest`)

### Requirement: User schema shape
`userSchema` SHALL validate exactly the fields returned by `GET /api/auth/me`: `id` (string), `appwrite_id` (string), `email` (string), `first_name` (string), `last_name` (string), `role` (`'CLIENT' | 'WORKER' | 'ADMIN'`), `email_verified` (boolean), `created_at` (string), `tos_accepted_at` (string, nullable), `tos_first_booking_at` (string, nullable).

#### Scenario: Valid user document parses successfully
- **WHEN** a document containing all required fields with correct types is parsed against `userSchema`
- **THEN** parsing succeeds and returns a value typed as `User`

#### Scenario: Missing required field is rejected
- **WHEN** a document is parsed against `userSchema` without `appwrite_id`
- **THEN** parsing fails

#### Scenario: Invalid role value is rejected
- **WHEN** a document is parsed against `userSchema` with `role` set to a value other than `CLIENT`, `WORKER`, or `ADMIN`
- **THEN** parsing fails

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
