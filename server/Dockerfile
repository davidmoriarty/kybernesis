# server/Dockerfile
FROM oven/bun:1.4.0 AS deps
WORKDIR /app

# Copy root manifests first
COPY package.json bun.lock turbo.json tsconfig.json ./

# Copy workspace manifests (so bun can resolve workspaces)
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/schemas/package.json ./packages/schemas/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# If tsconfigs are referenced during tooling, copy them too
COPY server/tsconfig.json ./server/tsconfig.json
COPY client/tsconfig.json ./client/tsconfig.json
COPY packages/auth/tsconfig.json ./packages/auth/tsconfig.json
COPY packages/db/tsconfig.json ./packages/db/tsconfig.json
COPY packages/schemas/tsconfig.json ./packages/schemas/tsconfig.json
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json

# Install at repo root for workspaces
RUN bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:1.4.0 AS build
WORKDIR /app

# Reuse deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/packages/auth/node_modules ./packages/auth/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/schemas/node_modules ./packages/schemas/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/turbo.json ./turbo.json
COPY --from=deps /app/tsconfig.json ./tsconfig.json

# Copy source
COPY server ./server
COPY packages ./packages

# Build shared + server
RUN bunx turbo build --filter=auth --filter=db --filter=schemas --filter=shared --filter=server

FROM oven/bun:1.4.0 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Runtime needs deps + built output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/packages/auth/node_modules ./packages/auth/node_modules
COPY --from=build /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=build /app/packages/schemas/node_modules ./packages/schemas/node_modules
COPY --from=build /app/packages/shared/node_modules ./packages/shared/node_modules

COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/packages/auth/dist ./packages/auth/dist
COPY --from=build /app/packages/auth/package.json ./packages/auth/package.json
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/package.json ./packages/db/package.json
COPY --from=build /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=build /app/packages/schemas/package.json ./packages/schemas/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/auth/src ./packages/auth/src
COPY --from=build /app/packages/db/src ./packages/db/src
COPY --from=build /app/packages/schemas/src ./packages/schemas/src
COPY --from=build /app/packages/shared/src ./packages/shared/src

# Run from the server workspace so bun reads server/package.json
WORKDIR /app/server

EXPOSE 3000
CMD ["bun", "run", "start"]
