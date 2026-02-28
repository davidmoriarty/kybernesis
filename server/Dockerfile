# server/Dockerfile
FROM oven/bun:1.3.9 AS deps
WORKDIR /app

# Copy root manifests first
COPY package.json bun.lock turbo.json tsconfig.json ./

# Copy workspace manifests (so bun can resolve workspaces)
COPY server/package.json ./server/package.json
COPY shared/package.json ./shared/package.json
COPY client/package.json ./client/package.json

# If tsconfigs are referenced during tooling, copy them too
COPY server/tsconfig.json ./server/tsconfig.json
COPY shared/tsconfig.json ./shared/tsconfig.json

# Install at repo root for workspaces
RUN bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:1.3.9 AS build
WORKDIR /app

# Reuse deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/turbo.json ./turbo.json
COPY --from=deps /app/tsconfig.json ./tsconfig.json

# Copy source
COPY server ./server
COPY shared ./shared

# Build shared + server
RUN bunx turbo build --filter=shared --filter=server

FROM oven/bun:1.3.9 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Runtime needs deps + built output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/src/generated ./server/src/generated

# Run from the server workspace so bun reads server/package.json
WORKDIR /app/server

EXPOSE 3000
CMD ["bun", "run", "start"]
