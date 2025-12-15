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

# Copy entire monorepo
COPY . .

# Prune the monorepo to get only whitelabel-web dependencies
RUN turbo prune --scope=@proxify/whitelabel-web --docker

############################
# STEP 2: Build the application
############################
FROM base AS builder
WORKDIR /app

# Install sqlc for type generation (frontend uses generated types)
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

# Generate SQLC types (frontend uses these via @proxify/sqlcgen)
RUN sqlc generate

# Build the application with environment variables
ARG VITE_API_URL
ARG VITE_PRIVY_APP_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PRIVY_APP_ID=${VITE_PRIVY_APP_ID}

RUN pnpm turbo run build --filter=@proxify/whitelabel-web...

############################
# STEP 3: Production image (nginx)
############################
FROM nginx:alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx configuration
COPY apps/whitelabel-web/nginx.conf /etc/nginx/nginx.conf

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from builder
COPY --from=builder /app/apps/whitelabel-web/dist /usr/share/nginx/html

# Create non-root user for nginx (optional, nginx runs as nginx user by default)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]