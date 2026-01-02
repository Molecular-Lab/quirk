# Fly.io Deployment Guide

This guide walks you through deploying **3 services** to Fly.io:
1. **proxify-b2b-api** - Main API server (Node.js)
2. **proxify-agent** - AI Agent (Python)
3. **proxify-mcp** - MCP Server (Node.js)

##

Prerequisites

- Fly.io account (sign up at [fly.io](https://fly.io))
- flyctl CLI installed
- Railway DATABASE_URL ready (from Railway setup)
- Git repository with all code

---

## Step 0: Install Fly.io CLI

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows (PowerShell)
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Verify Installation
```bash
flyctl version
```

### Login to Fly.io
```bash
flyctl auth login
```

---

## Step 1: Deploy B2B API Service

### 1.1 Navigate to API Directory
```bash
cd apps/b2b-api
```

### 1.2 Create Fly.io App
```bash
flyctl launch --config fly.toml --no-deploy
```

**When prompted:**
- ✅ Use existing fly.toml? **Yes**
- ✅ Copy configuration? **Yes**
- ✅ Choose app name: **proxify-b2b-api** (or your custom name)
- ✅ Choose region: **sjc** (San Jose) or your preferred region
- ❌ Set up PostgreSQL? **No** (we're using Railway)
- ❌ Set up Redis? **No** (not needed for demo)
- ❌ Deploy now? **No** (we need to set secrets first)

### 1.3 Set Environment Secrets

Generate secrets (run these in project root):
```bash
# Generate JWT and session secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

echo "Generated secrets (save these!):"
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
```

Set secrets in Fly.io:
```bash
flyctl secrets set \
  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require" \
  PRIVY_APP_ID="your_privy_app_id_from_dashboard" \
  PRIVY_APP_SECRET="your_privy_app_secret" \
  ALCHEMY_API_KEY="your_alchemy_api_key" \
  JWT_SECRET="$JWT_SECRET" \
  SESSION_SECRET="$SESSION_SECRET" \
  ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  SANDBOX_ORACLE_PRIVATE_KEY="0xYOUR_WALLET_PRIVATE_KEY" \
  --app proxify-b2b-api
```

**Optional secrets (AI features):**
```bash
flyctl secrets set \
  OPENAI_API_KEY="sk-your_openai_key" \
  LANGCHAIN_API_KEY="your_langsmith_key" \
  SENTRY_DSN="your_sentry_dsn" \
  --app proxify-b2b-api
```

### 1.4 Deploy
```bash
flyctl deploy --app proxify-b2b-api
```

### 1.5 Verify Deployment
```bash
# Check status
flyctl status --app proxify-b2b-api

# View logs
flyctl logs --app proxify-b2b-api

# Test health endpoint
curl https://proxify-b2b-api.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "B2B API (NEW Architecture)",
  "timestamp": "2024-01-02T...",
  "database": { "connected": true }
}
```

---

## Step 2: Deploy MCP Server

### 2.1 Navigate to MCP Directory
```bash
cd ../../apps/mcp  # From project root
```

### 2.2 Create Fly.io App
```bash
flyctl launch --config fly.toml --no-deploy
```

**When prompted:**
- ✅ Use existing fly.toml? **Yes**
- ✅ Choose app name: **proxify-mcp**
- ✅ Choose region: **sjc** (same as API for low latency)
- ❌ Deploy now? **No**

### 2.3 Set Environment Secrets (if any)
```bash
# MCP server is mostly configuration-free
# Add secrets if needed in the future
```

### 2.4 Deploy
```bash
flyctl deploy --app proxify-mcp
```

### 2.5 Verify Deployment
```bash
flyctl status --app proxify-mcp
flyctl logs --app proxify-mcp

# Test health (if available)
curl https://proxify-mcp.fly.dev/health
```

---

## Step 3: Deploy AI Agent (Python)

### 3.1 Navigate to Agent Directory
```bash
cd ../../apps/agent  # From project root
```

### 3.2 Create Fly.io App
```bash
flyctl launch --config fly.toml --no-deploy
```

**When prompted:**
- ✅ Use existing fly.toml? **Yes**
- ✅ Choose app name: **proxify-agent**
- ✅ Choose region: **sjc** (same region as MCP)
- ❌ Deploy now? **No**

### 3.3 Set Environment Secrets
```bash
flyctl secrets set \
  OPENAI_API_KEY="sk-your_openai_api_key" \
  MCP_SERVER_URL="http://proxify-mcp.internal:3000" \
  --app proxify-agent
```

**Optional:**
```bash
flyctl secrets set \
  LANGCHAIN_API_KEY="your_langsmith_key" \
  LANGCHAIN_PROJECT="proxify-production" \
  --app proxify-agent
```

### 3.4 Deploy
```bash
flyctl deploy --app proxify-agent
```

### 3.5 Verify Deployment
```bash
flyctl status --app proxify-agent
flyctl logs --app proxify-agent

# Test health endpoint
curl https://proxify-agent.fly.dev/health
```

---

## Step 4: Connect Services Together

### 4.1 Fly.io Internal Networking

Fly.io automatically creates a private network for your apps. Services can communicate using:

```
<app-name>.internal:port
```

**Already configured in fly.toml:**
- ✅ Agent → MCP: `http://proxify-mcp.internal:3000`
- ✅ API → Agent (if needed): `http://proxify-agent.internal:8000`

### 4.2 Update API with Agent URL (if needed)
```bash
flyctl secrets set \
  AGENT_API_URL="http://proxify-agent.internal:8000" \
  --app proxify-b2b-api
```

### 4.3 Restart Services (if configuration changed)
```bash
flyctl apps restart proxify-b2b-api
flyctl apps restart proxify-agent
```

---

## Step 5: Verify All Services

### 5.1 Check All Apps
```bash
flyctl apps list
```

You should see:
- ✅ proxify-b2b-api
- ✅ proxify-mcp
- ✅ proxify-agent

### 5.2 Test API Endpoints
```bash
# Health check
curl https://proxify-b2b-api.fly.dev/health

# DeFi protocols (public endpoint)
curl https://proxify-b2b-api.fly.dev/api/v1/defi/protocols

# Test with API key (after creating a client)
curl -H "x-api-key: pk_YOUR_API_KEY" \
  https://proxify-b2b-api.fly.dev/api/v1/users
```

### 5.3 Monitor Logs
```bash
# Watch all services in separate terminals
flyctl logs --app proxify-b2b-api
flyctl logs --app proxify-mcp
flyctl logs --app proxify-agent
```

---

## Step 6: Scaling & Resources

### 6.1 Scale Up/Down
```bash
# Scale API to 2 instances
flyctl scale count 2 --app proxify-b2b-api

# Scale down to 1
flyctl scale count 1 --app proxify-b2b-api
```

### 6.2 Increase Memory (if needed)
```bash
# Upgrade to 512MB
flyctl scale vm shared-cpu-1x --memory 512 --app proxify-b2b-api
```

### 6.3 Auto-scaling (Configured in fly.toml)
- **API**: 1-2 instances (can handle traffic spikes)
- **Agent**: 1 instance (AI processing, no need for multiple)
- **MCP**: 1 instance (lightweight, stateless)

---

## Troubleshooting

### ❌ Build Failed

**Problem**: Docker build fails

**Solutions**:
1. Check Dockerfile syntax
2. Verify monorepo dependencies are copied
3. Clear build cache: `flyctl deploy --no-cache`
4. Check logs: `flyctl logs --app <app-name>`

### ❌ Health Check Failing

**Problem**: App deployed but health check fails

**Solutions**:
1. Verify health endpoint exists: `GET /health`
2. Check app is listening on `0.0.0.0:PORT`
3. View logs: `flyctl logs --app <app-name>`
4. SSH into machine: `flyctl ssh console --app <app-name>`

### ❌ Database Connection Error

**Problem**: Cannot connect to Railway database

**Solutions**:
1. Verify DATABASE_URL is correct (copy from Railway)
2. Ensure SSL mode: `?sslmode=require`
3. Check Railway database is running
4. Test connection: `flyctl ssh console --app proxify-b2b-api`
   ```bash
   apt-get update && apt-get install -y postgresql-client
   psql "$DATABASE_URL"
   ```

### ❌ Services Can't Communicate

**Problem**: Agent can't reach MCP

**Solutions**:
1. Use `.internal` domain: `proxify-mcp.internal:3000`
2. Ensure both apps in same region
3. Check Fly.io private network: `flyctl ips list --app <app-name>`
4. View MCP logs: `flyctl logs --app proxify-mcp`

### ❌ Out of Memory

**Problem**: App crashes with OOM

**Solutions**:
1. Increase VM memory: `flyctl scale vm --memory 512`
2. Optimize code (reduce memory usage)
3. Check for memory leaks in logs

---

## Useful Commands

```bash
# View all apps
flyctl apps list

# View app details
flyctl status --app <app-name>

# View logs (real-time)
flyctl logs --app <app-name>

# List secrets
flyctl secrets list --app <app-name>

# Set a secret
flyctl secrets set KEY=VALUE --app <app-name>

# Remove a secret
flyctl secrets unset KEY --app <app-name>

# SSH into running machine
flyctl ssh console --app <app-name>

# Restart app
flyctl apps restart <app-name>

# Destroy app (careful!)
flyctl apps destroy <app-name>

# View metrics
flyctl dashboard metrics --app <app-name>

# View pricing
flyctl pricing
```

---

## Cost Estimation

Fly.io pricing (as of 2024):

| Resource | Free Tier | Cost (Pay-as-you-go) |
|----------|-----------|----------------------|
| **Shared CPU** | 3 VMs with 256MB RAM | $0.0000008/sec ($2/month per VM) |
| **Bandwidth** | 100GB/month | $0.02/GB after free tier |
| **Persistent Volume** | 3GB total | $0.15/GB/month |
| **IPv4** | First 1 free per app | $2/month per additional IP |

**Estimated monthly cost for 3 apps:**
- B2B API: ~$2-5/month (shared-cpu-1x, 256MB)
- Agent: ~$2-5/month (shared-cpu-1x, 512MB)
- MCP: ~$2/month (shared-cpu-1x, 256MB)

**Total: $6-12/month** for demo/prototype

Free tier is sufficient for development/testing!

---

## Security Best Practices

### ✅ DO:
- ✅ Use `flyctl secrets` for sensitive data
- ✅ Enable HTTPS (automatic with Fly.io)
- ✅ Use `.internal` network for service-to-service communication
- ✅ Set up Sentry for error monitoring
- ✅ Review logs regularly

### ❌ DON'T:
- ❌ Commit secrets to git
- ❌ Use HTTP for production traffic
- ❌ Expose internal services publicly
- ❌ Use same secrets for dev/staging/prod

---

## Next Steps

Now that Fly.io services are deployed:

1. ✅ **Backend Services Ready** - API, Agent, MCP running on Fly.io
2. ➡️ **Next**: Deploy frontend to Vercel (see `docs/VERCEL_SETUP.md`)
3. ➡️ **Then**: Set up monitoring and alerts

---

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Fly.io Status**: https://status.fly.io

---

**🎉 Congrats! Your backend services are live on Fly.io.**
