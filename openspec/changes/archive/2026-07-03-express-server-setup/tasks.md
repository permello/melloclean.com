## 1. Dependencies

- [x] 1.1 Add `helmet`, `cors`, `cookie-parser` to `apps/server/package.json` dependencies
- [x] 1.2 Add `@types/cors`, `@types/cookie-parser` to `apps/server/package.json` devDependencies
- [x] 1.3 Install dependencies (`npm install`)

## 2. Config

- [x] 2.1 In `apps/server/src/config/config.ts`, read `CORS_ORIGINS` from env, split on `,`, trim each entry, filter empties, default to `[]` when unset
- [x] 2.2 Expose the parsed origin list on the exported `Config` object (e.g. `corsOrigins: string[]`)

## 3. Middleware chain

- [x] 3.1 In `apps/server/src/app.ts`, import and apply `helmet()` as the first middleware
- [x] 3.2 Apply `cors({ origin: config.corsOrigins, credentials: true })` after `helmet`
- [x] 3.3 Keep `express.json()` after `cors` (already present)
- [x] 3.4 Apply `cookieParser()` after `express.json()`
- [x] 3.5 Confirm `apps/server/src/middleware/` stays singular — no rename needed

## 4. Health check

- [x] 4.1 Change the `/api/health` handler in `apps/server/src/app.ts` to `res.json({ status: 'ok' })`

## 5. Env example

- [x] 5.1 Add `PORT` to root `.env.example` with a dev default (`5000`)
- [x] 5.2 Add `CORS_ORIGINS` to root `.env.example` with a commented example covering `http://www.127.0.0.1.nip.io,http://app.127.0.0.1.nip.io`

## 6. Tooling

- [x] 6.1 Add `"typecheck": "tsc --noEmit"` to `apps/server/package.json` scripts
- [x] 6.2 Confirm `apps/client`, `apps/dashboard`, `packages/shared`, `packages/ui` each already define a `typecheck` script in `package.json` (no edits expected — this documents compliance with `workspace-typecheck-convention`)

## 7. Verification

- [x] 7.1 `npm run dev --filter=@permello/server` starts without errors
- [x] 7.2 `curl -i http://localhost:<PORT>/api/health` returns HTTP 200 and JSON body `{"status":"ok"}`
- [x] 7.3 Request with an allowlisted `Origin` header receives CORS headers permitting it; request with a non-allowlisted `Origin` does not
- [x] 7.4 Request with a `Cookie` header results in `req.cookies` being populated (verify via a temporary log or the health route)
- [x] 7.5 `npm run typecheck` at the repo root exercises and passes `apps/server`
- [x] 7.6 `openspec validate express-server-setup --strict` passes
