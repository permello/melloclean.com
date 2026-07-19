## Context

`packages/shared/types/api.ts` currently holds hand-written interfaces (`User`, `ApiResponse<T>`, `ApiActionResponse`, `AuthResponse`, `PaginatedResponse<T>`, `ApiError`, `ApiValidationError`) written for a pre-Express (Flask) backend. Under the current Appwrite-based architecture (#74), login and signup happen directly between the browser and the Appwrite SDK — Express never sees those requests. The only Express auth endpoints are `GET /api/auth/me` and `POST /api/auth/logout` (#77, #78). Grepping the repo confirms zero files import from `@permello/shared/types/api` today, so this file can be replaced wholesale with no consumer migration.

## Goals / Non-Goals

**Goals:**
- Give `userSchema`, `loginSchema`, and `signupSchema` a single, correct home at `packages/shared/types/authSchema.ts`, built from the current architecture (#74's user-shape table), not the stale Flask-era interfaces.
- Remove type definitions that no longer describe anything real in this codebase.

**Non-Goals:**
- Wiring these schemas into Express routes, `AuthService`, or any frontend form — that's #77/#78/#79.
- Defining a generic API response/error envelope — no current endpoint needs one; #78 already settled on a plain literal error shape with no backing schema.
- Touching `packages/ui/util/validation.ts` or `apps/client/app/core/util/validation.ts` — both remain live until #79.
- Handling signup service-address fields — deferred to a future change.

## Decisions

**Delete `api.ts` outright rather than deprecate it.**
Confirmed via repo-wide grep: nothing imports from `@permello/shared/types/api`. Deprecating (keeping both files, marking one `@deprecated`) would add ceremony with no one to warn. Straight deletion is simpler and there's no migration risk.

**Rebuild `userSchema` from #74's table, not from the old `User` interface.**
The old interface is missing `appwrite_id`, `tos_accepted_at`, and `tos_first_booking_at`. Copying it forward as a Zod schema would silently ship an incomplete type. Alternative considered: convert the old interface as-is and add missing fields as a follow-up — rejected because it produces a schema that's wrong for the one consumer (#78) that will use it first.

**`loginSchema`/`signupSchema` use camelCase; `userSchema` uses snake_case.**
`userSchema` mirrors the Appwrite Database document shape (snake_case), while the request schemas mirror form/JS state (camelCase). This is deliberate layering — the request schema describes what a form collects, the response schema describes what the database stores — not accidental drift between "the same data."

**`confirmPassword` lives in `signupSchema`, cross-checked via Zod `.refine()`, and must be stripped before calling Appwrite.**
This replaces the old hand-rolled `validators.confirmPassword(value, data)` check. `.refine()` is Zod's native mechanism for cross-field validation, so no custom validator code is needed. Because Appwrite's `account.create()` call has no `confirmPassword` parameter, whichever issue wires up the real signup call (likely #79) must destructure it out before calling Appwrite. Documented here so that constraint isn't lost.

**`signupSchema` excludes service-address fields.**
The current signup wizard collects street/city/state/zip in the same form as account details, but address is absent from #74's `User` shape entirely — it isn't part of the Appwrite account. Bundling it into `signupSchema` would make the schema describe more than an "auth" concern. Address validation is deferred to a separate, not-yet-filed issue.

**Drop `ApiResponse`, `ApiActionResponse`, `AuthResponse`, `PaginatedResponse`, `ApiError`, `ApiValidationError` with no Zod replacement.**
All six described response shapes for endpoints or envelopes that don't exist under the Appwrite-direct architecture. `apiResponseSchema`/`apiErrorSchema` were in #76's original scope but were cut for being speculative — there is no second consumer to generalize for yet. Alternative considered: build a generic `apiResponseSchema<T>` factory now so it's ready when needed — rejected as premature; #78 already shows the error shape can just be a plain literal until a real second consumer forces the generalization.

## Risks / Trade-offs

- **[Risk]** Deleting six types is a breaking change to the module's public surface → **Mitigation**: zero current consumers (verified), so nothing breaks; GitHub issues #74 and #78 already updated to reference the new path, #76 to follow.
- **[Risk]** No generic error/response envelope means the next Express endpoint that needs one will have to define its own shape from scratch → **Mitigation**: acceptable now; revisit generalization only when a second real consumer exists, per the project's stated preference against speculative abstraction.
- **[Risk]** camelCase (request) vs snake_case (response) split could read as inconsistent to a future contributor → **Mitigation**: call out the reasoning in the file's header doc comment.
- **[Risk]** Excluding address from `signupSchema` leaves the current signup wizard's address stage without a forward-looking schema → **Mitigation**: explicitly out of scope here; needs its own follow-up issue (see Open Questions).

## Migration Plan

No consumer migration required (confirmed zero importers of the old path). Steps:
1. Add `zod` to `packages/shared/package.json`.
2. Create `packages/shared/types/authSchema.ts` with `userSchema`, `loginSchema`, `signupSchema` and inferred types.
3. Delete `packages/shared/types/api.ts`.
4. Update `packages/shared/package.json` exports (`./types/api` → `./types/authSchema`).
5. Delete the orphaned `apps/client/util/validation.ts` (unrelated dead code, bundled into this change).
6. Update GitHub issue #76 to reflect this narrowed scope (follow-up, not part of this change's file edits).

Rollback: revert the commit — since nothing consumes the new file yet, rollback has no downstream impact.

## Open Questions

- Should service-address validation get its own tracked GitHub issue now, or wait until the signup flow is actually rebuilt in #79?
- Does issue #76 on GitHub get edited to match this proposal now, or after implementation lands?
