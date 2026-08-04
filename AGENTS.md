# Repository Guidelines

## Project Structure & Module Organization

This repository is an npm-workspaces monorepo orchestrated by Turborepo. Applications live in `apps/`: `client` is the public React Router site, `dashboard` is the authenticated interface, and `server` is the Express API/BFF. Reusable React components belong in `packages/ui`; shared schemas, configuration, CSS, and types belong in `packages/shared`. Keep static files in each app's `public/` directory. Infrastructure is defined by `Dockerfile`, `docker-compose.yml`, and `nginx/`. Product specifications and archived change records live under `openspec/`.

## Build, Test, and Development Commands

- `npm install` installs all workspace dependencies (use the npm version declared in `package.json`).
- `npm run dev` starts every workspace development task through Turbo.
- `npm run build` creates production builds for all applications and packages.
- `npm run typecheck` runs TypeScript checks across the workspace.
- `npm test` runs configured Vitest suites.
- `npm run lint` runs available workspace lint tasks; the server uses ESLint.
- `npm run pretty` formats JavaScript, TypeScript, and JSON with Prettier.
- `npm run dev:start` / `npm run dev:stop` start or tear down the Docker development profile.

Target one workspace when iterating, for example `npm test --workspace @permello/ui` or `npm run dev --workspace @permello/client`.

## Coding Style & Naming Conventions

Write TypeScript and functional React components. Prettier enforces single quotes, JSX single quotes, a 100-column width, and Tailwind class sorting. Follow the existing two-space indentation. Use kebab-case filenames (`password-input.tsx`), PascalCase for components and classes, and camelCase for functions and variables. Export public package APIs from the nearest `index.ts`/`index.tsx`. New source files should retain the repository's MIT license header; run `npm run copyright` to check/update headers.

## Testing Guidelines

Vitest is used for server and UI tests; UI tests use Testing Library and jsdom. Colocate tests with implementation files and name them `*.test.ts` or `*.test.tsx`. Test observable behavior and middleware/service edge cases. Run `npm test` and `npm run typecheck` before submitting. No numeric coverage threshold is configured, so add focused regression tests for changed behavior.

## Commit & Pull Request Guidelines

Recent history favors short, imperative subjects, sometimes with Conventional Commit prefixes such as `feat:` or `chore:`. Keep each commit scoped and describe the outcome, for example `feat: add team authorization middleware`. Pull requests should include a concise summary, testing performed, linked issue or specification, and screenshots for visible UI changes. Call out configuration, API, or deployment impacts explicitly; never commit secrets—copy `.env.example` and supply local values instead.
