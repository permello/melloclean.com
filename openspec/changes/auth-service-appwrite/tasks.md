## 1. AuthService interface

- [ ] 1.1 Create `apps/server/src/services/AuthService.ts` exporting the `AuthService` interface with exactly `validateSession(token: string): Promise<{ id: string, email: string, emailVerification: boolean, teams: string[] }>` and `logout(token: string): Promise<void>` — no `getUserTeams`

## 2. AppwriteAuthService implementation

- [ ] 2.1 Create `apps/server/src/services/AppwriteAuthService.ts` implementing `AuthService`, reading `APPWRITE_ENDPOINT`/`APPWRITE_PROJECT_ID` (and accepting `APPWRITE_API_KEY` for forward compatibility, unused for now) from `config`
- [ ] 2.2 Implement `validateSession(token)`: build a session-scoped `node-appwrite` client via `client.setSession(token)`, call `account.get()` and `teams.list()`, and map the result to `{ id, email, emailVerification, teams }` (`teams` from the returned Teams' names/IDs matching `CLIENT`/`WORKER`/`ADMIN`)
- [ ] 2.3 Implement `logout(token)`: build a session-scoped client via `client.setSession(token)` and call `account.deleteSession('current')` — no API key involved
- [ ] 2.4 Confirm no other file in `apps/server` imports `node-appwrite` directly (only `AppwriteAuthService.ts` does)

## 3. requireAuth middleware

- [ ] 3.1 Create `apps/server/src/middleware/requireAuth.ts` reading the session token from the request cookie
- [ ] 3.2 Call `AuthService.validateSession(token)`; on success attach the resolved object to `req.user` and call `next()`
- [ ] 3.3 On missing cookie or a rejected `validateSession` call, respond 401 and do not call `next()`

## 4. requireTeam middleware

- [ ] 4.1 Create `apps/server/src/middleware/requireTeam.ts` exporting `requireTeam(team: string)` that returns an Express middleware
- [ ] 4.2 Have the returned middleware invoke `requireAuth` internally (not assume it already ran), then synchronously check `req.user.teams.includes(team)`
- [ ] 4.3 On team mismatch, respond 403 and do not call `next()`; on match, call `next()`

## 5. Wiring

- [ ] 5.1 Instantiate `AppwriteAuthService` in `apps/server/src/app.ts` (or a small composition point it delegates to) and make it available to `requireAuth`/`requireTeam`
- [ ] 5.2 Verify `.env.example` already documents `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` (no edit expected — confirm only)

## 6. Verification

- [ ] 6.1 Run `npm run typecheck` across all packages
- [ ] 6.2 Manually or via a quick script exercise: missing cookie → 401, invalid token → 401, valid token without required team on a `requireTeam`-guarded route → 403, valid token with required team → handler runs
- [ ] 6.3 Grep `apps/server/src` for `node-appwrite` imports outside `AppwriteAuthService.ts` and confirm none exist
