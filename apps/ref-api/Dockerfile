############################
# STEP 0 setup the base image
############################
FROM node:22-slim AS base

# Install package-manager
# it's faster to resolve or fetch dependencies than yarn or npm
# Read more: https://pnpm.io/benchmarks
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
RUN corepack prepare pnpm@9.14.2 --activate
RUN corepack install -g pnpm@9.14.4

############################
# STEP 1 prepare the build
############################
FROM base AS builder
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=api --docker 

############################
# STEP 2 build distribution files
############################
FROM base AS installer
WORKDIR /app

## Download dependencies from lockfile
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

# Install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --offline

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm run build --filter=api

# Prune dev dependencies
RUN pnpm prune --prod

############################
# STEP 3 build a final image
############################
FROM base AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

COPY --from=installer /app ./

EXPOSE 8000

CMD ["pnpm", "--filter=api", "run", "start"]