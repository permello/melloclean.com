# syntax=docker/dockerfile:1.4

# base
FROM node:24-alpine AS base
WORKDIR /monorepo

# development
FROM base AS development

COPY package.json package-lock.json ./
COPY apps/client/package.json apps/client/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm ci

EXPOSE 3000 3001 5000
CMD ["npm", "run", "dev"]

# pruner — single COPY . ., three turbo prune outputs
FROM base AS pruner
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @permello/client    --docker --out-dir out/client
RUN turbo prune @permello/dashboard --docker --out-dir out/dashboard
RUN turbo prune @permello/server    --docker --out-dir out/server

# client builder
FROM base AS client-builder
COPY --from=pruner /monorepo/out/client/json/ .
COPY --from=pruner /monorepo/out/client/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY --from=pruner /monorepo/out/client/full/ .
COPY --from=pruner /monorepo/tsconfig.base.json ./tsconfig.base.json
RUN npm run build --workspace=apps/client
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# dashboard builder
FROM base AS dashboard-builder
COPY --from=pruner /monorepo/out/dashboard/json/ .
COPY --from=pruner /monorepo/out/dashboard/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY --from=pruner /monorepo/out/dashboard/full/ .
COPY --from=pruner /monorepo/tsconfig.base.json ./tsconfig.base.json
RUN npm run build --workspace=apps/dashboard
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# server builder
FROM base AS server-builder
COPY --from=pruner /monorepo/out/server/json/ .
COPY --from=pruner /monorepo/out/server/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY --from=pruner /monorepo/out/server/full/ .
COPY --from=pruner /monorepo/tsconfig.base.json ./tsconfig.base.json
RUN npm run build --workspace=apps/server
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# client production
FROM node:24-alpine AS client-production
WORKDIR /app

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=client-builder --chown=app:app /monorepo/apps/client/build ./build
COPY --from=client-builder --chown=app:app /monorepo/node_modules ./node_modules

EXPOSE 3000
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]

# dashboard production
FROM node:24-alpine AS dashboard-production
WORKDIR /app
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
COPY --from=dashboard-builder --chown=app:app /monorepo/apps/dashboard/build ./build
COPY --from=dashboard-builder --chown=app:app /monorepo/node_modules ./node_modules

EXPOSE 3001
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]

# server production
FROM node:24-alpine AS server-production
WORKDIR /app
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=server-builder --chown=app:app /monorepo/apps/server/build ./build
COPY --from=server-builder --chown=app:app /monorepo/node_modules ./node_modules


EXPOSE 5000
CMD ["node", "build/src/server.js"]
