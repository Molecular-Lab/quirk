# Vercel Frontend Deployment Guide

This guide walks you through deploying the **whitelabel-web** React frontend to Vercel.

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub repository connected to Vercel
- Fly.io API deployed and running (from Fly.io setup)
- Privy App ID ready

---

## Step 1: Connect GitHub Repository

### 1.1 Login to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**

### 1.2 Import Git Repository
1. Select **"Import Git Repository"**
2. Choose your proxify repository
3. Click **"Import"**

---

## Step 2: Configure Build Settings

### 2.1 Project Settings

Vercel will auto-detect the monorepo. Configure these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` (project root) |
| **Build Command** | `pnpm turbo build --filter=@proxify/whitelabel-web` |
| **Output Directory** | `apps/whitelabel-web/dist` |
| **Install Command** | `pnpm install --frozen-lockfile` |

**Note**: The `vercel.json` in the root already configures these, so Vercel should auto-detect them.

### 2.2 Verify Configuration

The `vercel.json` includes:
- ✅ Build command for TurboRepo
- ✅ API proxy to Fly.io (`/api/*` → Fly.io API)
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Vite framework detection

---

## Step 3: Set Environment Variables

### 3.1 Navigate to Environment Variables
1. In Vercel project dashboard
2. Go to **Settings** → **Environment Variables**

### 3.2 Add Required Variables

Add these environment variables for **Production**:

```bash
VITE_API_URL=https://proxify-b2b-api.fly.dev
VITE_APP_URL=https://your-app.vercel.app  # Update after first deploy
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

**How to add:**
1. Click **"Add New"**
2. Enter **Key**: `VITE_API_URL`
3. Enter **Value**: `https://proxify-b2b-api.fly.dev`
4. Select **Environment**: `Production`
5. Click **"Save"**

Repeat for each variable.

### 3.3 Optional Environment Variables

```bash
# Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_MIXPANEL_TOKEN=your_mixpanel_token

# Monitoring
VITE_SENTRY_DSN=https://your_sentry_dsn

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_MAINTENANCE_MODE=false
```

### 3.4 Environment Variables for Other Environments

For **Preview** and **Development** environments, you can set different values:

- **Preview**: Staging API URL, test Privy app
- **Development**: Local API (http://localhost:8080)

---

## Step 4: Deploy

### 4.1 Initial Deployment

After configuring settings and environment variables:

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Run `pnpm install`
   - Run `pnpm turbo build --filter=@proxify/whitelabel-web`
   - Deploy to global CDN

### 4.2 Monitor Deployment

Watch the build logs in real-time:
- ✅ Installing dependencies
- ✅ Building packages (@quirk/core, @quirk/b2b-client, etc.)
- ✅ Building whitelabel-web
- ✅ Uploading to CDN
- ✅ Deployment complete

### 4.3 Get Deployment URL

After deployment completes:
- Production URL: `https://your-project.vercel.app`
- Or custom domain: `https://yourdomain.com`

---

## Step 5: Update API URL

### 5.1 Update CORS in Fly.io

Add your Vercel URL to Fly.io API CORS whitelist:

```bash
flyctl secrets set \
  CORS_ORIGINS="https://your-project.vercel.app,https://yourdomain.com" \
  --app proxify-b2b-api
```

### 5.2 Update Privy Settings

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Select your app
3. Go to **Settings** → **Allowed Origins**
4. Add: `https://your-project.vercel.app`
5. Save changes

---

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `app.proxify.io`
4. Click **"Add"**

### 6.2 Update DNS Records

Vercel will show DNS records to add:

**For root domain (proxify.io):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (app.proxify.io):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### 6.3 Wait for Verification

- DNS propagation: 5-60 minutes
- SSL certificate: Automatic (Let's Encrypt)

### 6.4 Update Environment Variables

After custom domain is active:

```bash
VITE_APP_URL=https://app.proxify.io
```

Redeploy to apply changes.

---

## Step 7: Verify Deployment

### 7.1 Test Frontend

Visit your Vercel URL:
```
https://your-project.vercel.app
```

Check:
- ✅ Page loads correctly
- ✅ No console errors
- ✅ Privy login works
- ✅ API calls succeed (check Network tab)

### 7.2 Test API Connection

Open browser DevTools → Network:

1. Make an API call (e.g., login, fetch user)
2. Verify request goes to: `https://proxify-b2b-api.fly.dev/api/v1/...`
3. Check response status: `200 OK`

### 7.3 Test Features

- ✅ User login (Privy)
- ✅ Dashboard loads
- ✅ Create/view users
- ✅ Deposits/withdrawals
- ✅ DeFi protocol data

---

## Step 8: Automatic Deployments

### 8.1 Git Integration

Vercel automatically deploys when you push to git:

- **Production branch** (main/master): Auto-deploys to production
- **Other branches**: Creates preview deployments

### 8.2 Preview Deployments

Every pull request gets a unique preview URL:
- `https://proxify-git-feature-branch.vercel.app`
- Share with team for review
- Automatic cleanup after merge

### 8.3 Deployment Workflow

```bash
# Make changes locally
git checkout -b feature/new-ui
# ... make changes ...

# Push to GitHub
git push origin feature/new-ui

# Vercel creates preview deployment automatically
# URL: https://proxify-git-feature-new-ui.vercel.app

# Merge to main
# Vercel deploys to production automatically
```

---

## Troubleshooting

### ❌ Build Failed

**Problem**: Vercel build fails

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify `vercel.json` configuration
3. Test build locally: `pnpm turbo build --filter=@proxify/whitelabel-web`
4. Ensure all dependencies in `package.json`
5. Check PNPM version matches (corepack enable)

### ❌ Environment Variables Not Working

**Problem**: `VITE_API_URL` is undefined

**Solutions**:
1. Verify variables start with `VITE_` (required for Vite)
2. Check variables are set for **Production** environment
3. Redeploy after adding variables
4. Check browser console: `console.log(import.meta.env.VITE_API_URL)`

### ❌ API Calls Failing (CORS)

**Problem**: CORS errors in console

**Solutions**:
1. Add Vercel URL to Fly.io CORS whitelist:
   ```bash
   flyctl secrets set \
     CORS_ORIGINS="https://your-app.vercel.app" \
     --app proxify-b2b-api
   ```
2. Check Fly.io API logs: `flyctl logs --app proxify-b2b-api`
3. Verify API is running: `https://proxify-b2b-api.fly.dev/health`

### ❌ Privy Login Not Working

**Problem**: Privy authentication fails

**Solutions**:
1. Check `VITE_PRIVY_APP_ID` is correct
2. Add Vercel URL to Privy allowed origins:
   - Go to Privy Dashboard → Settings → Allowed Origins
   - Add `https://your-app.vercel.app`
3. Verify Privy credentials in Fly.io API

### ❌ Slow Build Times

**Problem**: Build takes >5 minutes

**Solutions**:
1. Vercel caches dependencies - first build is slow, subsequent builds are fast
2. Optimize TurboRepo cache: `pnpm turbo build --filter=@proxify/whitelabel-web --force`
3. Consider Vercel Pro plan for faster builds

---

## Performance Optimization

### 9.1 Enable Vercel Analytics (Optional)

1. Go to **Analytics** tab
2. Click **"Enable Analytics"**
3. View real user metrics:
   - Core Web Vitals
   - Page load times
   - Geographic distribution

### 9.2 Enable Vercel Speed Insights (Optional)

```bash
pnpm add @vercel/speed-insights
```

In `apps/whitelabel-web/src/main.tsx`:
```typescript
import { SpeedInsights } from "@vercel/speed-insights/react"

// Add to your app
<SpeedInsights />
```

### 9.3 Optimize Bundle Size

Check bundle size:
1. Vercel dashboard → **Deployments** → Select deployment
2. View **Build Metrics** → **Bundle Size**

Optimize:
- Use code splitting (React.lazy)
- Remove unused dependencies
- Enable tree-shaking

---

## Useful Commands

### Vercel CLI

Install:
```bash
npm i -g vercel
```

Commands:
```bash
# Login
vercel login

# Deploy from local (testing)
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View environment variables
vercel env ls

# Add environment variable
vercel env add VITE_API_URL

# Pull environment variables to local
vercel env pull .env.local

# View logs
vercel logs

# Remove deployment
vercel remove <deployment-url>
```

---

## Cost Estimation

Vercel pricing (as of 2024):

| Plan | Price | Features |
|------|-------|----------|
| **Hobby** | $0/month | 100 GB bandwidth, 100 GB-hrs compute, unlimited projects |
| **Pro** | $20/month per user | 1 TB bandwidth, faster builds, analytics, password protection |
| **Enterprise** | Custom | Unlimited, dedicated support, SLA |

**For a demo/prototype, the Hobby (free) plan is sufficient!**

---

## Security Best Practices

### ✅ DO:
- ✅ Use HTTPS only (Vercel auto-enables)
- ✅ Set security headers (already in `vercel.json`)
- ✅ Use environment variables for secrets
- ✅ Enable password protection for preview deployments (Pro plan)
- ✅ Review deployment previews before merging

### ❌ DON'T:
- ❌ Commit `.env` files to git
- ❌ Expose API keys in frontend code
- ❌ Disable CORS without reason
- ❌ Use HTTP for production traffic

---

## Next Steps

Now that Vercel is deployed:

1. ✅ **Frontend Live** - React app running on Vercel
2. ➡️ **Next**: Set up monitoring (Sentry, analytics)
3. ➡️ **Then**: Configure custom domain
4. ➡️ **Finally**: Enable CI/CD for automated deployments

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Vercel Status**: https://www.vercel-status.com

---

**🎉 Congrats! Your frontend is live on Vercel.**
