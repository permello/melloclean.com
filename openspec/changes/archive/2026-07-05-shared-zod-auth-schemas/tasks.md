## 1. Dependencies

- [x] 1.1 Add `zod` to `packages/shared/package.json`

## 2. New schema module

- [x] 2.1 Create `packages/shared/types/authSchema.ts` with a header doc comment describing the Express + Appwrite architecture (no Flask references)
- [x] 2.2 Define `userSchema` (+ inferred `User` type) with fields: `id`, `appwrite_id`, `email`, `first_name`, `last_name`, `role` (enum `CLIENT`/`WORKER`/`ADMIN`), `email_verified`, `created_at`, `tos_accepted_at` (nullable), `tos_first_booking_at` (nullable)
- [x] 2.3 Define `loginSchema` (+ inferred `LoginRequest` type) with `email` (valid email) and `password` (min 8)
- [x] 2.4 Define `signupSchema` (+ inferred `SignupRequest` type) with `firstName`, `lastName`, `email` (valid email), `password` (min 8), `confirmPassword`, using `.refine()` to require `confirmPassword === password`
- [x] 2.5 Confirm `signupSchema` has no address-related fields

## 3. Remove old module

- [x] 3.1 Delete `packages/shared/types/api.ts`
- [x] 3.2 Update `packages/shared/package.json` exports: `./types/api` → `./types/authSchema`

## 4. Unrelated dead-code cleanup

- [x] 4.1 Delete `apps/client/util/validation.ts` (confirm zero importers before deleting)

## 5. Verification

- [x] 5.1 Run `npm run typecheck` across all packages
- [x] 5.2 Grep repo-wide for any remaining reference to `@permello/shared/types/api` or `types/api.ts` and confirm none remain

## 6. Follow-ups (not part of this change)

- [ ] 6.1 Update GitHub issue #76 body to match this proposal's scope
- [x] 6.2 Decide whether service-address validation gets its own tracked issue (decided: wait until signup flow rebuild in #79)
