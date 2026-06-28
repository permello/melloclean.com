# syntax=docker/dockerfile:1.4

# base
FROM node:24-alpine AS base
WORKDIR /monorepo

# dependencies
FROM base AS dependencies
COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# client builder
FROM dependencies AS client-builder
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/
RUN npm run build --workspace=apps/client

# dashboard builder
FROM dependencies AS dashboard-builder
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/dashboard/ ./apps/dashboard/
RUN npm run build --workspace=apps/dashboard

# server builder
FROM dependencies AS server-builder
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/
RUN npm run build --workspace=apps/server

# client production
FROM node:24-alpine AS client-production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=client-builder /monorepo/apps/client/build ./build
COPY --from=client-builder /monorepo/node_modules ./node_modules
RUN chown -R app:app /app
USER app
EXPOSE 3000
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]

# dashboard production
FROM node:24-alpine AS dashboard-production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=dashboard-builder /monorepo/apps/dashboard/build ./build
COPY --from=dashboard-builder /monorepo/node_modules ./node_modules
RUN chown -R app:app /app
USER app
EXPOSE 3001
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]

# server production
FROM node:24-alpine AS server-production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=server-builder /monorepo/apps/server/build ./build
COPY --from=server-builder /monorepo/node_modules ./node_modules
RUN chown -R app:app /app
USER app
EXPOSE 5000
CMD ["node", "build/src/server.js"]
