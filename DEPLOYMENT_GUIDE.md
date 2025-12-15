# Proxify Deployment Guide

Complete guide for deploying Proxify B2B2C Earn-as-a-Service Platform to production.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Option 1: Deploy Frontend to Vercel](#option-1-deploy-frontend-to-vercel)
4. [Option 2A: Deploy Backend to Docker Hub](#option-2a-deploy-backend-to-docker-hub)
5. [Option 2B: Deploy Backend to Railway](#option-2b-deploy-backend-to-railway)
6. [Database Setup](#database-setup)
7. [Environment Variables](#environment-variables)
8. [Health Checks](#health-checks)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**Architecture:**
```
┌─────────────────────┐
│  Vercel (Frontend)  │  ← whitelabel-web (React + Vite)
└─────────┬───────────┘
          │
          ├──→ API calls
          │
┌─────────▼───────────┐
│  Railway/DockerHub  │  ← b2b-api (TypeScript + Express)
│   (Backend API)     │
└─────────┬───────────┘
          │
          ├──→ PostgreSQL (Railway/Neon)
          └──→ Redis (Railway/Upstash)
```

---

## Prerequisites

- [x] Git repository with all code pushed
- [x] Docker installed (for Docker Hub deployment)
- [x] Railway CLI installed: `npm install -g railway` (for Railway deployment)
- [x] Vercel CLI installed: `npm install -g vercel` (for Vercel deployment)
- [x] Docker Hub account (for Docker Hub deployment)
- [x] Railway account (for Railway deployment)
- [x] Vercel account

---

## Option 1: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

In your `apps/whitelabel-web` directory, ensure you have `vercel.json`:

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install",
  "devCommand": "pnpm run dev"
}
```

### Step 4: Deploy to Vercel

```bash
cd apps/whitelabel-web
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Link to existing project**: No (first time) or Yes (subsequent deploys)
- **Project name**: `proxify-whitelabel-web` (or your choice)
- **Directory**: `./` (current directory)

### Step 5: Set Environment Variables in Vercel Dashboard

Go to your Vercel project settings → Environment Variables:

**Required Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-api.railway.app` | Your backend API URL |
| `VITE_PRIVY_APP_ID` | `your-privy-app-id` | Privy authentication app ID |

### Step 6: Deploy to Production

```bash
vercel --prod
```

Your frontend will be live at: `https://proxify-whitelabel-web.vercel.app`

---

## Option 2A: Deploy Backend to Docker Hub

### Step 1: Build Docker Image

```bash
cd /path/to/proxify

# Build the image
docker build -f apps/b2b-api/Dockerfile -t your-dockerhub-username/proxify-b2b-api:latest .
```

### Step 2: Test Locally (Optional)

```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e REDIS_URL="redis://default:password@host:6379" \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -e DEPLOYER_PRIVATE_KEY="0x..." \
  your-dockerhub-username/proxify-b2b-api:latest
```

### Step 3: Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push your-dockerhub-username/proxify-b2b-api:latest
```

### Step 4: Deploy to Your Server

**Option A: Deploy to VPS (e.g., DigitalOcean, AWS EC2)**

```bash
# SSH into your server
ssh user@your-server-ip

# Pull the image
docker pull your-dockerhub-username/proxify-b2b-api:latest

# Run the container
docker run -d \
  --name proxify-api \
  -p 8080:8080 \
  --restart unless-stopped \
  -e DATABASE_URL="$DATABASE_URL" \
  -e REDIS_URL="$REDIS_URL" \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -e DEPLOYER_PRIVATE_KEY="$DEPLOYER_PRIVATE_KEY" \
  -e PRIVY_APP_ID="$PRIVY_APP_ID" \
  -e PRIVY_APP_SECRET="$PRIVY_APP_SECRET" \
  your-dockerhub-username/proxify-b2b-api:latest
```

**Option B: Deploy with Docker Compose**

Create `docker-compose.production.yml` on your server:

```yaml
version: '3.8'

services:
  api:
    image: your-dockerhub-username/proxify-b2b-api:latest
    container_name: proxify-api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      PORT: 8080
      NODE_ENV: production
      DEPLOYER_PRIVATE_KEY: ${DEPLOYER_PRIVATE_KEY}
      PRIVY_APP_ID: ${PRIVY_APP_ID}
      PRIVY_APP_SECRET: ${PRIVY_APP_SECRET}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    container_name: proxify-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: proxify-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

Deploy:

```bash
docker-compose -f docker-compose.production.yml up -d
```

---

## Option 2B: Deploy Backend to Railway

Railway is recommended for quick MVP deployment with managed PostgreSQL and Redis.

### Step 1: Install Railway CLI

```bash
npm install -g railway
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Initialize Project

```bash
cd /path/to/proxify
railway init
```

Select:
- **Create new project**: Yes
- **Project name**: `proxify-b2b-api`

### Step 4: Add PostgreSQL Database

```bash
railway add --database postgresql
```

This will automatically create a PostgreSQL instance and set the `DATABASE_URL` environment variable.

### Step 5: Add Redis

```bash
railway add --database redis
```

This will automatically create a Redis instance and set the `REDIS_URL` environment variable.

### Step 6: Set Environment Variables

```bash
# Set required environment variables
railway variables set NODE_ENV=production
railway variables set PORT=8080
railway variables set DEPLOYER_PRIVATE_KEY="0x..."
railway variables set PRIVY_APP_ID="your-privy-app-id"
railway variables set PRIVY_APP_SECRET="your-privy-app-secret"
```

### Step 7: Create Railway Configuration

Create `railway.toml` in project root:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/b2b-api/Dockerfile"

[deploy]
startCommand = "node apps/b2b-api/dist/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Step 8: Deploy to Railway

```bash
railway up
```

Your API will be live at: `https://proxify-b2b-api.up.railway.app`

### Step 9: Run Database Migrations

```bash
# Connect to your Railway project
railway link

# Run migrations
railway run pnpm db:migrate
```

### Step 10: Monitor Deployment

```bash
# View logs
railway logs

# Check service status
railway status
```

---

## Database Setup

### Option A: Use Railway PostgreSQL (Recommended for MVP)

Railway automatically provisions and manages PostgreSQL for you. The `DATABASE_URL` is set automatically.

### Option B: Use Neon (Serverless Postgres)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Set as `DATABASE_URL` environment variable

### Option C: Self-hosted PostgreSQL

See Docker Compose example in Option 2A above.

### Run Migrations

```bash
# If using Railway
railway run pnpm db:migrate

# If using Docker Hub / self-hosted
docker exec -it proxify-api pnpm db:migrate

# Or manually via migrate CLI
migrate -path database/migrations -database "$DATABASE_URL" up
```

---

## Environment Variables

### Backend (b2b-api)

**Required:**

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"
REDIS_URL="redis://default:password@host:6379"

# Server
PORT=8080
NODE_ENV=production

# Blockchain
DEPLOYER_PRIVATE_KEY="0x..."  # Private key for blockchain transactions

# Authentication
PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-app-secret"

# CORS (Optional - defaults to allowing all)
CORS_ORIGINS="https://your-frontend.vercel.app,https://yourdomain.com"
```

**Optional:**

```bash
# Logging
LOG_LEVEL="info"  # debug, info, warn, error

# Rate Limiting
RATE_LIMIT_MAX=100  # requests per window
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
```

### Frontend (whitelabel-web)

**Required:**

```bash
VITE_API_URL="https://your-api.railway.app"
VITE_PRIVY_APP_ID="your-privy-app-id"
```

---

## Health Checks

### Backend Health Endpoints

```bash
# Basic health check
curl https://your-api.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}

# Database health check
curl https://your-api.railway.app/health/db

# Expected response:
{
  "status": "ok",
  "database": "connected"
}
```

### Frontend Health Check

```bash
# Check if frontend is responding
curl https://proxify-whitelabel-web.vercel.app

# Should return HTML
```

---

## Troubleshooting

### Issue: Docker build fails with "SQLC not found"

**Solution:** Ensure SQLC is installed in the Dockerfile (already fixed):

```dockerfile
RUN apk add --no-cache curl && \
    curl -L https://github.com/sqlc-dev/sqlc/releases/download/v1.27.0/sqlc_1.27.0_linux_amd64.tar.gz -o sqlc.tar.gz && \
    tar -xzf sqlc.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/sqlc && \
    rm sqlc.tar.gz
```

### Issue: "pnpm prune" fails in Docker

**Solution:** Set CI=true environment variable (already fixed):

```dockerfile
ENV CI=true
RUN pnpm prune --prod
```

### Issue: TypeScript compilation errors

**Solution:** All fixed in this session. If you encounter new errors:

1. Check `tsconfig.json` excludes test files
2. Ensure `downlevelIteration: true` for Map/Set iteration
3. Verify all imports use correct paths

### Issue: Database connection fails

**Solutions:**

1. **Check DATABASE_URL format:**
   ```
   postgresql://user:password@host:5432/dbname
   ```

2. **Verify network access:**
   - Railway: Database is automatically accessible
   - Docker Hub: Ensure firewall allows connections
   - Neon: Check IP whitelist

3. **Test connection:**
   ```bash
   psql "$DATABASE_URL"
   ```

### Issue: Frontend can't connect to API

**Solutions:**

1. **Check VITE_API_URL:**
   - Must be set at build time
   - Must include https://
   - Example: `https://proxify-b2b-api.up.railway.app`

2. **Check CORS:**
   - Ensure backend allows frontend origin
   - Set `CORS_ORIGINS` if restricted

3. **Check API is running:**
   ```bash
   curl https://your-api.railway.app/health
   ```

### Issue: Blockchain transactions fail

**Solutions:**

1. **Check DEPLOYER_PRIVATE_KEY:**
   - Must start with `0x`
   - Must have sufficient gas

2. **Check RPC endpoints:**
   - Verify network is accessible
   - Check ViemClientManager initialization

---

## Deployment Checklist

### Pre-deployment

- [ ] All environment variables configured
- [ ] Database migrations tested locally
- [ ] Docker builds successfully
- [ ] All TypeScript compilation errors fixed
- [ ] `.env` files not committed to git

### Post-deployment

- [ ] Health checks passing
- [ ] Database migrations run successfully
- [ ] Frontend connects to API
- [ ] Authentication working (Privy)
- [ ] Blockchain transactions working
- [ ] Logs are accessible and monitored

---

## Next Steps

1. **Set up monitoring:** Use Railway logs, Vercel analytics, or external tools like Sentry
2. **Set up CI/CD:** Automate deployments with GitHub Actions
3. **Configure custom domain:** Add your own domain to Vercel and Railway
4. **Set up backups:** Configure database backups on Railway or Neon
5. **Security review:** Review API keys, CORS settings, rate limiting

---

## Support

For issues with deployment:
1. Check logs: `railway logs` or Vercel logs
2. Review this guide
3. Check environment variables
4. Test locally with Docker

**Production URLs:**
- Frontend: https://proxify-whitelabel-web.vercel.app
- Backend API: https://proxify-b2b-api.up.railway.app
- API Health: https://proxify-b2b-api.up.railway.app/health
