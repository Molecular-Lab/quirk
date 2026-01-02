# Railway PostgreSQL Setup Guide

This guide walks you through setting up PostgreSQL database on Railway for the Proxify project.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- Payment method added (free tier available)
- Git repository connected to Railway (optional, for auto-deploys)

---

## Step 1: Create PostgreSQL Database

### 1.1 Create New Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"**

![Railway New Project](https://railway.app/new)

### 1.2 Configure Database

Railway will automatically create a PostgreSQL 15 database with:
- ✅ Automatic backups
- ✅ SSL enabled
- ✅ Connection pooling
- ✅ Metrics and monitoring

**No additional configuration needed!**

---

## Step 2: Get Connection String

### 2.1 Copy DATABASE_URL

1. Click on your PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value

It will look like:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway
```

### 2.2 Save for Later

You'll need this `DATABASE_URL` for:
- ✅ Running migrations (next step)
- ✅ Fly.io b2b-api deployment
- ✅ Local testing

**🔒 Keep this secret! It contains your database password.**

---

## Step 3: Run Migrations

### 3.1 From Your Local Machine

Open terminal in the project root:

```bash
# Set the DATABASE_URL from Railway
export DATABASE_URL="postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway"

# Run the migration script
./scripts/railway-migrate.sh
```

### 3.2 Expected Output

```
[Railway Migration] Starting database migration...
✓ DATABASE_URL is set
✓ Found migrations directory
→ Downloading golang-migrate v4.16.2...
✓ golang-migrate downloaded
→ Found 6 migration files
→ Running migrations...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Migrations completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current migration version:
6
```

### 3.3 Verify Tables Created

In Railway dashboard:
1. Click your PostgreSQL service
2. Go to **"Data"** tab
3. You should see these tables:
   - `privy_accounts`
   - `client_organizations`
   - `end_user_accounts`
   - `client_vaults`
   - `end_user_vaults`
   - `offramp_transactions`
   - `schema_migrations`

---

## Step 4: Configure Railway Dashboard (Optional)

### 4.1 Enable Public Networking (if needed)

By default, Railway databases are accessible from anywhere. If you want to restrict access:

1. Go to **"Settings"** tab
2. Under **"Networking"**
3. Configure **"Private Networking Only"** (requires Railway's private network)

**For now, keep public networking enabled** so Fly.io can connect.

### 4.2 Set Up Automatic Backups

Railway automatically backs up your database:
- **Free tier**: 7-day retention
- **Pro tier**: 30-day retention

View backups:
1. Click PostgreSQL service
2. Go to **"Data"** tab
3. Click **"Backups"**

---

## Step 5: Environment Variables for Other Services

You'll need to set `DATABASE_URL` in:

### For Fly.io (b2b-api, agent, mcp)

```bash
# Set secret in Fly.io
flyctl secrets set DATABASE_URL="postgresql://..." --app proxify-b2b-api
flyctl secrets set DATABASE_URL="postgresql://..." --app proxify-agent
flyctl secrets set DATABASE_URL="postgresql://..." --app proxify-mcp
```

### For Local Development

Create `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway"
```

---

## Troubleshooting

### ❌ Connection Refused

**Problem**: Cannot connect to database

**Solutions**:
1. Check if DATABASE_URL is correct (copy from Railway dashboard)
2. Verify SSL mode: Railway requires `?sslmode=require`
3. Check firewall/network restrictions

### ❌ Migration Failed

**Problem**: Migration script fails

**Solutions**:
1. Ensure you're in project root directory
2. Check `database/migrations/` exists
3. Verify DATABASE_URL has write permissions
4. Check Railway database is running (green status in dashboard)

### ❌ SSL Required Error

**Problem**: `SSL connection required`

**Solution**: Add `?sslmode=require` to DATABASE_URL:
```
postgresql://postgres:PASSWORD@host:5432/railway?sslmode=require
```

### ❌ Too Many Connections

**Problem**: `too many clients already`

**Solutions**:
1. Railway has connection limits based on plan
2. Close unused connections in services
3. Upgrade Railway plan for more connections

---

## Database Maintenance

### Viewing Logs

1. Click PostgreSQL service
2. Go to **"Deployments"** tab
3. Click latest deployment
4. View logs

### Running SQL Queries

Railway provides a built-in SQL editor:
1. Click PostgreSQL service
2. Go to **"Data"** tab
3. Click **"Query"**
4. Run SQL commands

Example:
```sql
SELECT * FROM client_organizations;
SELECT COUNT(*) FROM end_user_accounts;
```

### Monitoring Performance

1. Click PostgreSQL service
2. Go to **"Metrics"** tab
3. View:
   - CPU usage
   - Memory usage
   - Connections
   - Query performance

---

## Security Best Practices

### ✅ DO:
- ✅ Use environment variables for DATABASE_URL
- ✅ Enable SSL (`sslmode=require`)
- ✅ Rotate passwords periodically
- ✅ Use Railway's private networking when possible
- ✅ Monitor connection count

### ❌ DON'T:
- ❌ Commit DATABASE_URL to git
- ❌ Share DATABASE_URL publicly
- ❌ Use same database for development and production
- ❌ Disable SSL in production

---

## Next Steps

Now that your database is set up:

1. ✅ **Database Ready** - Railway PostgreSQL running with migrations
2. ➡️ **Next**: Deploy b2b-api to Fly.io (see `docs/FLY_SETUP.md`)
3. ➡️ **Then**: Deploy frontend to Vercel (see `docs/VERCEL_SETUP.md`)

---

## Cost Estimation

Railway pricing (as of 2024):

| Plan | Price | Database Resources | Backups |
|------|-------|-------------------|---------|
| **Free Trial** | $0 (with $5 credit) | 512MB RAM, shared CPU | 7 days |
| **Hobby** | $5/month (pay-as-you-go) | 8GB RAM, shared CPU | 7 days |
| **Pro** | Variable usage-based | Unlimited | 30 days |

For a demo/prototype, the free trial or $5-10/month hobby plan is sufficient.

---

## Support

- **Railway Docs**: https://docs.railway.app/databases/postgresql
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

**🎉 Congrats! Your database is ready for deployment.**
