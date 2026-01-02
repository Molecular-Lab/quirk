# Proxify Deployment Overview

Complete guide to deploying the Proxify platform across Railway, Fly.io, and Vercel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐       ┌──────────┐       ┌──────────┐        │
│  │          │       │          │       │          │        │
│  │ Railway  │──────▶│  Fly.io  │◀──────│  Vercel  │        │
│  │          │       │          │       │          │        │
│  └──────────┘       └──────────┘       └──────────┘        │
│       │                  │                    │              │
│       │                  │                    │              │
│  PostgreSQL         Node.js/Python        React/Vite       │
│  (Database)         (3 Services)          (Frontend)       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Stack

| Component | Service | Technology | Purpose |
|-----------|---------|------------|---------|
| **Database** | Railway | PostgreSQL 15 | Data persistence |
| **API Server** | Fly.io | Node.js + Express | Main REST API |
| **AI Agent** | Fly.io | Python + FastAPI | AI-powered DeFi optimization |
| **MCP Server** | Fly.io | Node.js | Model Context Protocol server |
| **Frontend** | Vercel | React + Vite | User interface |

---

## Deployment Order

Follow this order to ensure dependencies are met:

### Phase 1: Database (Railway)
**Time**: ~10 minutes

1. Create PostgreSQL database on Railway
2. Copy DATABASE_URL
3. Run migrations with `./scripts/railway-migrate.sh`

✅ **Checkpoint**: Database has 6 tables (privy_accounts, client_organizations, etc.)

**Guide**: [docs/RAILWAY_SETUP.md](./RAILWAY_SETUP.md)

---

### Phase 2: Backend Services (Fly.io)
**Time**: ~30 minutes

Deploy in this order (dependencies):

#### 2.1 MCP Server
```bash
cd apps/mcp
flyctl launch --config fly.toml --no-deploy
flyctl deploy --app proxify-mcp
```

✅ **Checkpoint**: `https://proxify-mcp.fly.dev/health` returns 200

#### 2.2 AI Agent
```bash
cd apps/agent
flyctl launch --config fly.toml --no-deploy
flyctl secrets set OPENAI_API_KEY="sk-..." --app proxify-agent
flyctl deploy --app proxify-agent
```

✅ **Checkpoint**: `https://proxify-agent.fly.dev/health` returns 200

#### 2.3 B2B API
```bash
cd apps/b2b-api
flyctl launch --config fly.toml --no-deploy
flyctl secrets set DATABASE_URL="..." PRIVY_APP_ID="..." --app proxify-b2b-api
flyctl deploy --app proxify-b2b-api
```

✅ **Checkpoint**: `https://proxify-b2b-api.fly.dev/health` returns `{"status":"ok","database":{"connected":true}}`

**Guide**: [docs/FLY_SETUP.md](./FLY_SETUP.md)

---

### Phase 3: Frontend (Vercel)
**Time**: ~15 minutes

1. Connect GitHub repository to Vercel
2. Configure environment variables:
   - `VITE_API_URL=https://proxify-b2b-api.fly.dev`
   - `VITE_PRIVY_APP_ID=your_privy_app_id`
3. Deploy

✅ **Checkpoint**: `https://your-app.vercel.app` loads successfully

**Guide**: [docs/VERCEL_SETUP.md](./VERCEL_SETUP.md)

---

## Environment Variables

### Required Secrets

Generate these first (see [ENV_SECRETS.md](./ENV_SECRETS.md)):

```bash
# JWT & Session secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### Service-Specific Variables

| Service | Required Variables | Optional Variables |
|---------|-------------------|--------------------|
| **Railway** | DATABASE_URL (auto-generated) | - |
| **Fly.io API** | DATABASE_URL, PRIVY_APP_ID, PRIVY_APP_SECRET, ALCHEMY_API_KEY, JWT_SECRET, SESSION_SECRET, ENCRYPTION_KEY, SANDBOX_ORACLE_PRIVATE_KEY | OPENAI_API_KEY, SENTRY_DSN, SMTP_PASSWORD |
| **Fly.io Agent** | OPENAI_API_KEY, MCP_SERVER_URL | LANGCHAIN_API_KEY |
| **Fly.io MCP** | - | - |
| **Vercel** | VITE_API_URL, VITE_PRIVY_APP_ID | VITE_GOOGLE_ANALYTICS_ID, VITE_SENTRY_DSN |

**Full templates:**
- [.env.fly-api.example](./.env.fly-api.example)
- [.env.fly-agent.example](./.env.fly-agent.example)
- [.env.fly-mcp.example](./.env.fly-mcp.example)
- [.env.vercel.example](./.env.vercel.example)

---

## Service Communication

### Internal Network (Fly.io)

Services communicate via Fly.io's private `.internal` network:

```
┌──────────────┐
│   B2B API    │
└──────────────┘
       │
       │ (if needed)
       ▼
┌──────────────┐       ┌──────────────┐
│  AI Agent    │──────▶│  MCP Server  │
└──────────────┘       └──────────────┘
  http://proxify-mcp.internal:3000
```

### External Network

```
                    HTTPS
┌────────┐    ─────────────────▶   ┌──────────┐
│ Vercel │    ◀─────────────────   │  Fly.io  │
└────────┘                          └──────────┘
                                          │
                                          │ SSL
                                          ▼
                                    ┌──────────┐
                                    │ Railway  │
                                    └──────────┘
```

**HTTPS everywhere** - All external communication is encrypted.

---

## Health Checks

### After Deployment

Run these checks to verify everything works:

```bash
# 1. Database
curl https://proxify-b2b-api.fly.dev/health
# Expected: {"status":"ok","database":{"connected":true}}

# 2. MCP Server
curl https://proxify-mcp.fly.dev/health
# Expected: 200 OK

# 3. AI Agent
curl https://proxify-agent.fly.dev/health
# Expected: 200 OK

# 4. Frontend
curl https://your-app.vercel.app
# Expected: HTML response

# 5. API Endpoint (Public)
curl https://proxify-b2b-api.fly.dev/api/v1/defi/protocols
# Expected: {"aave":{...},"compound":{...}}
```

---

## Monitoring

### Logs

```bash
# Railway (Database)
# View in Railway dashboard → PostgreSQL → Logs

# Fly.io (All services)
flyctl logs --app proxify-b2b-api
flyctl logs --app proxify-agent
flyctl logs --app proxify-mcp

# Vercel (Frontend)
# View in Vercel dashboard → Deployments → Logs
```

### Metrics

**Railway:**
- CPU, Memory, Connections
- View in Railway dashboard → PostgreSQL → Metrics

**Fly.io:**
```bash
flyctl dashboard metrics --app proxify-b2b-api
```

**Vercel:**
- Page load times, Core Web Vitals
- View in Vercel dashboard → Analytics

---

## Cost Breakdown

### Monthly Estimate (Demo/Prototype)

| Service | Resource | Free Tier | Estimated Cost |
|---------|----------|-----------|----------------|
| **Railway** | PostgreSQL | $5 credit | $5-10/month |
| **Fly.io** | 3 VMs (shared-cpu-1x) | 3 free VMs | $0-6/month |
| **Vercel** | Static hosting + serverless | 100GB bandwidth | $0/month |
| **Total** | | | **$5-16/month** |

### Production Estimate

| Service | Resource | Estimated Cost |
|---------|----------|----------------|
| **Railway** | PostgreSQL (Pro) | $20-50/month |
| **Fly.io** | 3-6 VMs (scaled) | $20-60/month |
| **Vercel** | Pro plan | $20/month |
| **Total** | | **$60-130/month** |

**Actual costs depend on**:
- Traffic volume
- Database size
- Number of AI agent calls
- Auto-scaling configuration

---

## Scaling Strategy

### Horizontal Scaling (More Instances)

```bash
# Scale API to 3 instances
flyctl scale count 3 --app proxify-b2b-api

# Auto-scaling configured in fly.toml:
# - API: 1-2 instances (can handle traffic spikes)
# - Agent: 1 instance (AI processing, no need for multiple)
# - MCP: 1 instance (lightweight, stateless)
```

### Vertical Scaling (More Resources)

```bash
# Upgrade to 512MB RAM
flyctl scale vm shared-cpu-1x --memory 512 --app proxify-b2b-api

# Database (Railway)
# Upgrade in Railway dashboard → PostgreSQL → Settings → Plan
```

### Load Balancing

- **Fly.io**: Automatic load balancing across instances
- **Vercel**: Global CDN with automatic edge caching
- **Railway**: Single database instance (can add read replicas)

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Database connection failed** | Verify DATABASE_URL includes `?sslmode=require` |
| **CORS errors** | Add Vercel URL to Fly.io CORS_ORIGINS secret |
| **Build failed on Vercel** | Check build logs, verify `vercel.json` config |
| **Fly.io deployment stuck** | Run `flyctl deploy --no-cache` |
| **Environment variable not found** | Verify variables start with `VITE_` for frontend |
| **Services can't communicate** | Use `.internal` domain for Fly.io private network |

### Getting Help

1. Check service-specific guides (Railway, Fly.io, Vercel)
2. View logs for error messages
3. Test health endpoints
4. Verify environment variables are set correctly

---

## Rollback Strategy

### Fly.io
```bash
# List deployments
flyctl releases --app proxify-b2b-api

# Rollback to previous version
flyctl releases rollback --app proxify-b2b-api
```

### Vercel
```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find stable deployment
# 3. Click "..." → "Promote to Production"
```

### Railway (Database)
```bash
# Restore from backup
# In Railway dashboard → PostgreSQL → Data → Backups → Restore
```

---

## CI/CD Pipeline

### Automatic Deployments

**Vercel:**
- ✅ Auto-deploys on push to `main`
- ✅ Preview deployments for PRs

**Fly.io:**
- Manual deployment: `flyctl deploy`
- Or set up GitHub Actions (see `.github/workflows/`)

**Railway:**
- Database migrations: Run manually via script

### Recommended Workflow

```bash
# 1. Develop locally
git checkout -b feature/new-ui

# 2. Push to GitHub
git push origin feature/new-ui

# 3. Vercel creates preview deployment
# URL: https://proxify-git-feature-new-ui.vercel.app

# 4. Review and merge PR
# Vercel auto-deploys to production

# 5. Deploy backend if needed
flyctl deploy --app proxify-b2b-api
```

---

## Security Checklist

- [x] HTTPS enabled (all services)
- [x] Environment variables in secrets (not code)
- [x] Database uses SSL (`?sslmode=require`)
- [x] CORS configured (only allow trusted origins)
- [x] API keys rotated regularly
- [x] Privy authentication configured
- [x] Security headers set (X-Frame-Options, CSP)
- [x] Logs monitored for errors
- [ ] Set up Sentry for error tracking
- [ ] Enable 2FA on all platforms
- [ ] Regular database backups

---

## Next Steps

After successful deployment:

1. ✅ **Test all features** - User creation, deposits, withdrawals
2. ➡️ **Set up monitoring** - Sentry, analytics, uptime checks
3. ➡️ **Configure custom domain** - `app.proxify.io`
4. ➡️ **Enable auto-scaling** - Based on traffic patterns
5. ➡️ **Set up CI/CD** - Automate deployments
6. ➡️ **Load testing** - Verify performance under load

---

## Support Resources

- **Railway**: https://docs.railway.app
- **Fly.io**: https://fly.io/docs
- **Vercel**: https://vercel.com/docs
- **Project Guides**:
  - [Railway Setup](./RAILWAY_SETUP.md)
  - [Fly.io Setup](./FLY_SETUP.md)
  - [Vercel Setup](./VERCEL_SETUP.md)
  - [Environment Secrets](./ENV_SECRETS.md)

---

**🎉 Congratulations! Your Proxify platform is fully deployed across Railway, Fly.io, and Vercel.**
