# Build Verification & Testing Guide

This document helps you verify that the Docker build process works correctly before deploying to production.

---

## ✅ Critical Fixes Applied

### Issue 1: SQLC Binary Missing ✓ FIXED
**Problem**: Dockerfile was calling `pnpm db:generate` which runs `sqlc generate`, but sqlc wasn't installed.

**Solution**: Added sqlc installation in both Dockerfiles:
```dockerfile
RUN apk add --no-cache curl && \
    curl -L https://github.com/sqlc-dev/sqlc/releases/download/v1.27.0/sqlc_1.27.0_linux_amd64.tar.gz -o sqlc.tar.gz && \
    tar -xzf sqlc.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/sqlc && \
    rm sqlc.tar.gz && \
    sqlc version
```

### Issue 2: Missing pnpm-workspace.yaml ✓ FIXED
**Problem**: Monorepo workspace config wasn't copied after turbo prune.

**Solution**: Added explicit copy:
```dockerfile
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
```

### Issue 3: Environment Variables for Vite Build ✓ FIXED
**Problem**: Vite needs env vars at build time for `import.meta.env`.

**Solution**: Added ARG/ENV to whitelabel-web Dockerfile:
```dockerfile
ARG VITE_API_URL
ARG VITE_PRIVY_APP_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PRIVY_APP_ID=${VITE_PRIVY_APP_ID}
```

---

## 🧪 Pre-Deployment Testing

### Test 1: Local Build Test

Test the build locally before pushing to registry:

```bash
# Set environment variables
export DOCKER_USERNAME=yourname
export VERSION=test

# Build b2b-api
docker build \
  -f apps/b2b-api/Dockerfile \
  -t ${DOCKER_USERNAME}/proxify-b2b-api:${VERSION} \
  .

# Build whitelabel-web
docker build \
  -f apps/whitelabel-web/Dockerfile \
  --build-arg VITE_API_URL=http://localhost:8080 \
  --build-arg VITE_PRIVY_APP_ID=test-privy-id \
  -t ${DOCKER_USERNAME}/proxify-whitelabel-web:${VERSION} \
  .
```

**Expected Output**:
- ✅ SQLC version prints (e.g., `v1.27.0`)
- ✅ PNPM installs dependencies successfully
- ✅ SQLC generates types successfully
- ✅ TypeScript compiles without errors
- ✅ Turbo builds complete successfully
- ✅ Images are created (~250MB for API, ~75MB for web)

**Common Errors to Watch For**:
- ❌ `sqlc: command not found` → FIXED in updated Dockerfile
- ❌ `ENOENT: no such file or directory, open 'pnpm-workspace.yaml'` → FIXED
- ❌ `Cannot find package '@proxify/sqlcgen'` → Check SQLC generated successfully

---

### Test 2: Run Containers Locally

Test that the built images actually run:

```bash
# Create test environment file
cat > .env.test << EOF
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/proxify
REDIS_URL=redis://:redis@redis:6379
PRIVY_APP_ID=test-app-id
PRIVY_APP_SECRET=test-secret
ALCHEMY_API_KEY=test-key
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=debug
EOF

# Start just the databases first
docker-compose -f docker-compose.production.yml up -d postgres redis

# Wait for databases to be ready
sleep 10

# Run migrations
docker-compose --profile migrate run --rm migrate

# Start the applications
docker-compose -f docker-compose.production.yml up -d b2b-api whitelabel-web

# Watch logs
docker-compose logs -f b2b-api whitelabel-web
```

**What to Check**:
1. ✅ API starts without errors
2. ✅ API health endpoint responds: `curl http://localhost:8080/health`
3. ✅ Web frontend serves correctly: `curl http://localhost:3000`
4. ✅ No database connection errors in logs
5. ✅ No missing module errors

---

### Test 3: Health Check Verification

```bash
# Run comprehensive health checks
./scripts/health-check.sh --verbose
```

**Expected Results**:
```
[✓] Docker is running
[✓] All containers are running
[✓] PostgreSQL is accepting connections
[✓] Redis is responding to PING
[✓] B2B API health endpoint is responding (HTTP 200)
[✓] Whitelabel Web health endpoint is responding (HTTP 200)
[✓] API endpoints are accessible

✅ All health checks passed! (7/7)
```

---

### Test 4: API Endpoint Testing

Test actual API functionality:

```bash
# Test public endpoint (DeFi protocols)
curl http://localhost:8080/api/v1/defi/protocols | jq .

# Test health endpoint
curl http://localhost:8080/health | jq .

# Expected responses should be valid JSON
```

---

### Test 5: Frontend Loading

```bash
# Test that the frontend serves correctly
curl -I http://localhost:3000

# Expected: HTTP 200 OK

# Test that API proxy works
curl -I http://localhost:3000/api/v1/health

# Expected: HTTP 200 OK (proxied to backend)
```

---

## 🔍 Build Troubleshooting

### Problem: SQLC Generation Fails

**Symptoms**:
```
Error: failed to generate: plugin crashed: exit status 2
```

**Solution**:
1. Check `sqlc.yaml` syntax is valid
2. Verify database migrations in `database/migrations/` are valid SQL
3. Check queries in `database/queries/` match SQLC syntax

**Test locally**:
```bash
sqlc generate
```

---

### Problem: TypeScript Compilation Errors

**Symptoms**:
```
error TS2307: Cannot find module '@proxify/core'
```

**Solution**:
1. Ensure `pnpm-workspace.yaml` is copied correctly
2. Check that SQLC ran before TypeScript compilation
3. Verify workspace dependencies in package.json

**Debug in container**:
```bash
# Temporarily modify Dockerfile to debug
RUN ls -la packages/
RUN ls -la packages/sqlcgen/src/gen/
RUN cat packages/core/package.json
```

---

### Problem: Turbo Prune Issues

**Symptoms**:
```
Error: Could not find a workspace for: b2b-api
```

**Solution**:
1. Check `turbo.json` has correct task definitions
2. Verify `apps/b2b-api/package.json` has correct name
3. Ensure `turbo prune --scope=b2b-api` matches package name exactly

**Test locally**:
```bash
pnpm turbo prune --scope=b2b-api --docker
ls -la out/
```

---

### Problem: PNPM Install Fails

**Symptoms**:
```
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
```

**Solution**:
```bash
# Regenerate lockfile locally
pnpm install
git add pnpm-lock.yaml
git commit -m "Update pnpm lockfile"
```

---

### Problem: Out of Memory During Build

**Symptoms**:
```
Error: Command failed with exit code 137
```

**Solution**:
1. Increase Docker Desktop memory limit (Preferences → Resources → Memory)
2. Or build with memory limit:
```bash
docker build --memory=4g -f apps/b2b-api/Dockerfile .
```

---

## 📊 Build Performance Benchmarks

**Expected Build Times** (first build, no cache):

| Stage | b2b-api | whitelabel-web |
|-------|---------|----------------|
| SQLC Install | ~10s | ~10s |
| Pruning | ~5s | ~5s |
| Dependencies | ~120s | ~90s |
| SQLC Generate | ~2s | ~2s |
| TypeScript Build | ~30s | ~45s |
| **Total** | **~3-4 min** | **~2-3 min** |

**Cached Builds** (no code changes):
- **b2b-api**: ~30 seconds
- **whitelabel-web**: ~20 seconds

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] Local build test passes
- [ ] Containers run without errors
- [ ] Health checks all pass
- [ ] API endpoints respond correctly
- [ ] Frontend loads and serves static files
- [ ] Database migrations run successfully
- [ ] No TypeScript compilation errors
- [ ] No missing dependencies errors
- [ ] Image sizes are reasonable (<500MB total)
- [ ] Environment variables are configured
- [ ] CORS origins are set correctly
- [ ] API keys/secrets are configured

---

## 🚀 Production Build Command

Once all tests pass, build for production:

```bash
# Build with production tag
DOCKER_USERNAME=yourname ./scripts/docker-build.sh v1.0.0

# Push to registry
DOCKER_USERNAME=yourname ./scripts/docker-push.sh v1.0.0

# Deploy
DOCKER_USERNAME=yourname VERSION=v1.0.0 ./scripts/deploy.sh production
```

---

## 📝 Build Logs Analysis

### Successful Build Indicators:

Look for these in build logs:

```
✓ Pruning completed
✓ sqlc version: v1.27.0
✓ pnpm install: packages installed
✓ sqlc generate: generated X files
✓ TypeScript: compiled successfully
✓ Turbo: build completed
✓ Image built: sha256:abc123...
```

### Error Indicators:

Watch for these issues:

```
✗ sqlc: command not found
✗ ENOENT: no such file or directory
✗ Cannot find module
✗ TS2307: Cannot find module
✗ Error: spawn sqlc ENOENT
✗ exit code 1, 2, 137 (OOM)
```

---

## 🔄 Continuous Integration

Add this to your CI/CD pipeline:

```yaml
# .github/workflows/build-test.yml
name: Build & Test

on: [push, pull_request]

jobs:
  test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Test Docker Build
        run: |
          docker build -f apps/b2b-api/Dockerfile .
          docker build -f apps/whitelabel-web/Dockerfile \
            --build-arg VITE_API_URL=http://localhost:8080 \
            --build-arg VITE_PRIVY_APP_ID=test \
            .

      - name: Test Startup
        run: |
          docker-compose -f docker-compose.production.yml up -d
          sleep 30
          ./scripts/health-check.sh
```

---

**Last Updated**: December 2024
