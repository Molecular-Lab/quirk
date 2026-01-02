############################
# STEP 0: Setup base image
############################
FROM node:22-alpine AS base

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.18.3 --activate

############################
# STEP 1: Prune the monorepo
############################
FROM base AS pruner
WORKDIR /app

# Install turbo globally
RUN pnpm add -g turbo

# Copy workspace configuration first
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY package.json ./package.json
COPY turbo.json ./turbo.json

# Copy entire monorepo
COPY . .

# Prune the monorepo to get only b2b-api dependencies
RUN turbo prune --scope=@quirk/b2b-api-service --docker

############################
# STEP 2: Build the application
############################
FROM base AS builder
WORKDIR /app

# Install sqlc for type generation
RUN apk add --no-cache curl && \
    curl -L https://github.com/sqlc-dev/sqlc/releases/download/v1.27.0/sqlc_1.27.0_linux_amd64.tar.gz -o sqlc.tar.gz && \
    tar -xzf sqlc.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/sqlc && \
    rm sqlc.tar.gz && \
    sqlc version

# Install dependencies from pruned lockfile
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

# Copy pruned workspace configuration
COPY --from=pruner /app/out/json/ .

# Copy workspace config (needed for monorepo)
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the pruned source code
COPY --from=pruner /app/out/full/ .

# Copy database files and sqlc config (needed for type generation)
COPY database ./database
COPY sqlc.yaml ./sqlc.yaml

# Generate SQLC types
RUN sqlc generate

# Build the application
RUN pnpm turbo run build --filter=@quirk/b2b-api-service...

# Don't prune - keep all dependencies for monorepo to work correctly
# The pnpm prune command doesn't work well with workspace dependencies

############################
# STEP 3: Production image
############################
FROM node:22-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy root package files for workspace resolution
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/b2b-api/package.json ./apps/b2b-api/package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/b2b-api/dist ./apps/b2b-api/dist

# Copy all node_modules (root + app-specific if exists)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/b2b-api/node_modules ./apps/b2b-api/node_modules 2>/dev/null || true

# Copy workspace packages
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/b2b-api/dist/server.js"]