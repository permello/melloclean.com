## ADDED Requirements

### Requirement: Every workspace package defines a typecheck script
Every package under `apps/*` and `packages/*` SHALL define a `typecheck` script in its `package.json`, so the root `npm run typecheck` (Turbo) exercises it rather than silently skipping it.

#### Scenario: Workspace package has a typecheck script
- **WHEN** a package exists under `apps/*` or `packages/*`
- **THEN** its `package.json` defines a `typecheck` script

#### Scenario: Root typecheck run covers every package
- **WHEN** `npm run typecheck` runs at the repo root
- **THEN** every package under `apps/*` and `packages/*` has its typecheck script invoked, and none are silently skipped by Turbo
