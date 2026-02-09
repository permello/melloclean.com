# Melloclean.com

Cleaning company landing page built with React Router 7 (SSR mode).

## Quick Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production server
npm run typecheck  # Run TypeScript type checking
npm run pretty     # Run prettier to format all files
npm copyright      # Add copyright statement to top of all files
```

## Tech Stack

- **React 19** - UI library
- **React Router 7** - SSR framework (Vite-based)
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Vite 7** - Build tool
- **React Aria** - Accessible component primitives
- **Framer Motion** - Animations
- **CVA** - Component variant management

## Color Palette

| Role           | Color     | Classes                        | Hex                       |
| -------------- | --------- | ------------------------------ | ------------------------- |
| Primary        | Emerald   | `emerald-500`, `emerald-600`   | #10b981, #059669          |
| Secondary      | Teal      | `teal-500`, `teal-600`         | #14b8a6, #0d9488          |
| Accent         | Warm Gold | `amber-500`                    | #F59E0B                   |
| Text (heading) | Slate     | `slate-900`                    | #0f172a                   |
| Text (body)    | Slate     | `slate-600`                    | #475569                   |
| Background     | Neutral   | `slate-50`, `gray-50`, `white` | #f8fafc, #f9fafb, #ffffff |
| Destructive    | Red       | `red-500`, `red-600`           | #ef4444, #dc2626          |

## Path Alias

`~/*` maps to `frontend/*`

Example: `import { cn } from '~/core/util/cn'`

## Project Structure

```
frontend/
├── components/ui/   # Reusable UI components (Button, Input, Modal, Wizard, etc.)
├── core/            # Config, theme, and utilities (cn, validation, mergeRef)
├── pages/           # Route pages (landing, auth, 404)
├── root.tsx         # App shell with ToastProvider
└── routes.ts        # React Router route definitions
```

See directory-specific docs below for full trees and conventions.

## Configuration Files

| File                      | Purpose                 |
| ------------------------- | ----------------------- |
| `package.json`            | Dependencies and scripts |
| `vite.config.ts`          | Vite build configuration |
| `react-router.config.ts`  | React Router SSR config  |

## Documentation

| File | Description |
| ---- | ----------- |
| [architectural_patterns.md](.claude/docs/architectural_patterns.md) | Code patterns with file:line refs (CVA, polymorphic, React Aria, Framer Motion, validation, server actions, etc.) |
| [components-directory.md](.claude/docs/components-directory.md) | `components/ui/` tree, CVA file structure, type composition, form field layout |
| [core-directory.md](.claude/docs/core-directory.md) | `core/` tree, config singleton, theme, cn(), mergeRef, validation utilities |
| [pages-directory.md](.claude/docs/pages-directory.md) | `pages/` tree and route page conventions |
| [ui-components.md](.claude/docs/ui-components.md) | Component prop tables and usage examples |
| [wizard-patterns.md](.claude/docs/wizard-patterns.md) | Wizard form four-layer pattern and templates |
| [tsdoc-conventions.md](.claude/docs/tsdoc-conventions.md) | TSDoc commenting rules and templates |
