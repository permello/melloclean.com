## Why

Auth request/response shapes are currently hand-written TypeScript interfaces in `packages/shared/types/api.ts`, several of which are stale leftovers from a pre-Express (Flask) architecture and have zero consumers anywhere in the repo. Issue #74 (Express Authentication) requires a single source of truth for the `User` shape, login input, and signup input, shared between the Express server and the frontends via Zod. This change (tracking issue #76) narrows that work to exactly what #77/#78 need today, instead of rebuilding every old interface.

## What Changes

- Add `zod` as a dependency of `packages/shared`.
- **BREAKING**: Delete `packages/shared/types/api.ts` outright (confirmed zero importers repo-wide) and replace it with `packages/shared/types/authSchema.ts`.
- Add `userSchema` (+ inferred `User` type), rebuilt from issue #74's current user-shape table — not copied from the old, now-outdated `User` interface, which is missing `appwrite_id`, `tos_accepted_at`, and `tos_first_booking_at`.
- Add `loginSchema` (+ inferred `LoginRequest` type): `email`, `password` (min 8) — matches the current hand-rolled login validation exactly.
- Add `signupSchema` (+ inferred `SignupRequest` type): `firstName`, `lastName`, `email`, `password` (min 8), `confirmPassword` (cross-validated via `.refine()`). Deliberately excludes service-address fields (street/city/state/zip) — address isn't part of the Appwrite user account and is deferred to a separate future issue.
- **BREAKING**: Drop `ApiResponse<T>`, `ApiActionResponse`, `AuthResponse`, `PaginatedResponse<T>`, `ApiError`, and `ApiValidationError` with no replacement. None have a real consumer under the Appwrite-direct-from-browser architecture (login/signup never go through Express), and building a generic response/error envelope now would be speculative. Where an error shape is genuinely needed (`GET /api/auth/me`, `POST /api/auth/logout`), issue #78 already specifies a plain literal `{ error: { code, message } }` with no shared schema behind it.
- Fix stale "Flask API" doc comments in the replaced file to describe the current Express + Appwrite architecture.
- Delete `apps/client/util/validation.ts` — an orphaned, unimported duplicate of `apps/client/app/core/util/validation.ts`, discovered dead during this work. Unrelated cleanup, bundled in because it was found here.

Explicitly out of scope for this change: wiring these schemas into any Express route, any frontend form, or `AuthService`. This change only adds the schemas — nothing consumes them yet. `packages/ui/util/validation.ts` and `apps/client/app/core/util/validation.ts` remain untouched; both stay in place until issue #79 migrates the real auth UI to `apps/dashboard`.

## Capabilities

### New Capabilities
- `shared-auth-schemas`: Zod schemas and inferred TypeScript types for the auth `User` shape, login request, and signup request, exported from `@permello/shared/types/authSchema`.

### Modified Capabilities
(none — no existing `openspec/specs/` capability covers this file)

## Impact

- `packages/shared/package.json` — new `zod` dependency.
- `packages/shared/types/api.ts` — deleted.
- `packages/shared/types/authSchema.ts` — new file, becomes the sole export surface for auth types.
- `apps/client/util/validation.ts` — deleted (dead code, unrelated orphan found during this work).
- No consumers exist yet, so no other app/package code changes or runtime behavior changes as a result of this change.
- GitHub issues #74 and #78 have already been updated to reference `authSchema.ts`; issue #76 itself should be updated to match this proposal's scope as a follow-up.
