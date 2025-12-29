# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package files from monorepo
COPY apps/mcp/package.json ./apps/mcp/package.json
COPY packages/yield-engine/package.json ./packages/yield-engine/package.json
COPY packages/tsconfig ./packages/tsconfig

# Install pnpm and dependencies
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile --filter @quirk/mcp...

# Copy source code for both packages
COPY apps/mcp/src ./apps/mcp/src
COPY apps/mcp/tsconfig.json apps/mcp/tsup.config.ts ./apps/mcp/
COPY packages/yield-engine/src ./packages/yield-engine/src
COPY packages/yield-engine/tsconfig.json packages/yield-engine/tsup.config.ts ./packages/yield-engine/

# Build both packages
WORKDIR /app/packages/yield-engine
RUN pnpm build

WORKDIR /app/apps/mcp
RUN pnpm build

# ==========================================
# Stage 2: Production Stage
# ==========================================
FROM node:24-alpine AS production

ARG VERSION
ENV VERSION=${VERSION:-latest}
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appuser || true && \
    adduser -S -u 1001 -G appuser appuser 2>/dev/null || adduser -S -G appuser appuser

WORKDIR /app

# Enable pnpm
RUN corepack enable && \
    corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package files
COPY apps/mcp/package.json ./apps/mcp/package.json
COPY packages/yield-engine/package.json ./packages/yield-engine/package.json
COPY packages/tsconfig ./packages/tsconfig

# Install production dependencies for mcp package
RUN pnpm install --prod --frozen-lockfile --filter @quirk/mcp...

# Copy built files from builder
COPY --from=builder --chown=appuser:appuser /app/apps/mcp/dist ./apps/mcp/dist
COPY --from=builder --chown=appuser:appuser /app/packages/yield-engine/dist ./packages/yield-engine/dist

# Switch to non-root user
USER appuser

EXPOSE 3000

# Start the server from the correct location
CMD ["node", "apps/mcp/dist/index.js"]
