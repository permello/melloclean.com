# Melloclean.com

Cleaning company landing page built with React Router 7 (SSR mode).

## Tech Stack

- **React 19** - UI library
- **React Router 7** - SSR framework (Vite-based)
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Vite 7** - Build tool
- **React Aria** - Accessible component primitives
- **Framer Motion** - Animations

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Type Checking

```bash
npm run typecheck
```

## Building for Production

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Project Structure

```
frontend/
├── components/     # Reusable UI components
│   └── ui/         # Base components (button, heading, text)
├── core/           # Shared utilities and configuration
│   ├── config/     # App configuration (company info)
│   └── util/       # Utilities (cn, mergeRef)
├── pages/          # Page components and layouts
│   └── landing/    # Landing page with section layouts
├── root.tsx        # App root component
└── routes.ts       # Route definitions
```

## Path Alias

`~/*` maps to `frontend/*`

```tsx
import { cn } from '~/core/util/cn'
```

## Deployment

### Docker

```bash
docker build -t melloclean .
docker run -p 3000:3000 melloclean
```

### Manual

Deploy the output of `npm run build`:

```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```
