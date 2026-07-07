## 0. Test infrastructure

- [x] 0.1 Add `vitest` as a devDependency in `apps/server/package.json` and add a `"test": "vitest run"` script (no test runner exists in `apps/server` today)
- [x] 0.2 Create `apps/server/vitest.config.ts` (Node environment, `globals: true`)

## 1. AuthService interface

- [x] 1.1 Create `apps/server/src/services/AuthService.ts` exporting the `AuthService` interface with exactly `validateSession(token: string): Promise<{ id: string, email: string, emailVerification: boolean, teams: string[] }>` and `logout(token: string): Promise<void>` — no `getUserTeams`

## 2. Session client factory

- [x] 2.1 Create `apps/server/src/config/appwrite.ts` exporting the `SessionClientFactory` type (`(token: string) => { account: Account; teams: Teams }`) and `buildSessionClients: SessionClientFactory`, reading `APPWRITE_ENDPOINT`/`APPWRITE_PROJECT_ID` from `config`, building a **fresh** `node-appwrite` `Client` per call (`.setSession(token)`), and returning `{ account: new Account(client), teams: new Teams(client) }`

## 3. AppwriteAuthService implementation (TDD)

- [x] 3.1 Write `apps/server/src/services/AppwriteAuthService.test.ts` against a fake `SessionClientFactory` (plain objects with `vi.fn()` stubs, no `vi.mock()` of `node-appwrite`), covering: `validateSession` resolves `{ id, email, emailVerification, teams }` from fake `account.get()` + `teams.list()`; `validateSession` rejects when the fake factory's calls reject; `logout` calls `account.deleteSession('current')`
- [x] 3.2 Manual checkpoint: review the failing test file before implementing
- [x] 3.3 Implement `apps/server/src/services/AppwriteAuthService.ts` implementing `AuthService`, with a constructor accepting a `SessionClientFactory`, until 3.1's tests pass
- [x] 3.4 Confirm no file other than `AppwriteAuthService.ts` and `config/appwrite.ts` imports `node-appwrite` directly

## 4. authService singleton

- [x] 4.1 Create `apps/server/src/services/authServiceInstance.ts` exporting `authService: AuthService = new AppwriteAuthService(buildSessionClients)` — the only `new AppwriteAuthService(...)` call in production code

## 5. requireAuth middleware (TDD)

- [x] 5.1 Write `apps/server/src/middleware/requireAuth.test.ts` using `vi.mock('../services/authServiceInstance', () => ({ authService: { validateSession: vi.fn(), logout: vi.fn() } }))`, covering: missing cookie → 401, `next()` not called; `validateSession` rejects → 401, `next()` not called; `validateSession` resolves → `req.user` set and `next()` called
- [x] 5.2 Manual checkpoint: review the failing test file before implementing
- [x] 5.3 Implement `apps/server/src/middleware/requireAuth.ts`, importing `{ authService }` directly (not as a parameter), until 5.1's tests pass

## 6. requireTeam middleware (TDD)

- [x] 6.1 Write `apps/server/src/middleware/requireTeam.test.ts` using the same `authService` mock, covering: no separate `requireAuth` in the route chain still yields 401 (via `requireTeam`'s internal call); authenticated user missing the required team → 403; authenticated user with the required team → `next()` called
- [x] 6.2 Manual checkpoint: review the failing test file before implementing
- [x] 6.3 Implement `apps/server/src/middleware/requireTeam.ts` exporting `requireTeam(team: string)`, composing `requireAuth` internally, until 6.1's tests pass

## 7. Wiring

- [x] 7.1 Confirm `apps/server/src/app.ts` does not instantiate `AppwriteAuthService` itself — `services/authServiceInstance.ts` is the only construction site
- [x] 7.2 Verify `.env.example` already documents `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` (no edit expected — confirm only)

## 8. Verification

- [x] 8.1 Run `npm run typecheck` across all packages
- [x] 8.2 Run `npm test` (vitest) in `apps/server` — all tests green
- [x] 8.3 Grep `apps/server/src` for `node-appwrite` imports outside `AppwriteAuthService.ts` and `config/appwrite.ts`, confirm none exist
