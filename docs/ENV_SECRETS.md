# Environment Secrets & Variables Guide

Complete guide to generating and managing all environment variables for Proxify deployment.

---

## Quick Reference

| Secret Type | Generation Method | Used By |
|-------------|-------------------|---------|
| JWT_SECRET | `openssl rand -base64 32` | Fly.io API |
| SESSION_SECRET | `openssl rand -base64 32` | Fly.io API |
| ENCRYPTION_KEY | `openssl rand -base64 32` | Fly.io API |
| PRIVY_APP_ID | Privy Dashboard | Fly.io API, Vercel |
| PRIVY_APP_SECRET | Privy Dashboard | Fly.io API |
| ALCHEMY_API_KEY | Alchemy Dashboard | Fly.io API |
| OPENAI_API_KEY | OpenAI Platform | Fly.io Agent |
| DATABASE_URL | Railway Dashboard | Fly.io API |
| Wallet Private Key | Wallet export | Fly.io API |

---

## 1. Generate Random Secrets

### 1.1 JWT Secret

Used for signing JSON Web Tokens.

```bash
openssl rand -base64 32
```

**Output example:**
```
xK8mN2pQ5rS7tU9vW1xY3zA4bC6dE8fG0hI2jK4lM6nO
```

**Copy and save as `JWT_SECRET`**

---

### 1.2 Session Secret

Used for encrypting session data.

```bash
openssl rand -base64 32
```

**Copy and save as `SESSION_SECRET`**

---

### 1.3 Encryption Key

Used for encrypting sensitive data at rest.

```bash
openssl rand -base64 32
```

**Copy and save as `ENCRYPTION_KEY`**

---

## 2. Privy Authentication (Required)

Privy provides wallet-based authentication.

### 2.1 Create Privy App

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Sign up / Log in
3. Click **"Create New App"**
4. Name: `Proxify Production` (or your app name)
5. Click **"Create"**

### 2.2 Get App Credentials

1. In Privy dashboard, go to **"Settings"**
2. Copy **App ID**: `clxxxx...` (starts with `cl`)
3. Copy **App Secret**: `xxxxx...` (long alphanumeric string)

**Save as:**
- `PRIVY_APP_ID=clxxxx...`
- `PRIVY_APP_SECRET=xxxxx...`

### 2.3 Configure Allowed Origins

1. In Privy dashboard → **Settings** → **Allowed Origins**
2. Add your Vercel URL: `https://your-app.vercel.app`
3. Add custom domain (if any): `https://app.proxify.io`
4. Click **"Save"**

**Security Note:** Only add trusted domains. Privy will block auth requests from other origins.

---

## 3. Alchemy RPC (Required for Blockchain)

Alchemy provides Ethereum/blockchain RPC endpoints.

### 3.1 Create Alchemy Account

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
2. Sign up / Log in

### 3.2 Create App

1. Click **"Create App"**
2. Name: `Proxify`
3. Chain: **Ethereum**
4. Network: **Mainnet** (for production) or **Sepolia** (for testing)
5. Click **"Create App"**

### 3.3 Get API Key

1. Click on your app
2. Click **"View Key"**
3. Copy **API Key**

**Save as:**
```
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

**RPC URLs will be:**
```
ALCHEMY_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

---

## 4. Wallet Private Keys (Required for Token Operations)

### 4.1 Sandbox Oracle (Testing)

For **Sepolia testnet** (minting test tokens):

**Option 1: Create New Wallet**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Export from MetaMask**
1. Open MetaMask
2. Click account menu → **Account Details**
3. Click **"Show Private Key"**
4. Enter password
5. Copy private key

**Save as:**
```
SANDBOX_ORACLE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

**⚠️ IMPORTANT:**
- Never share this private key
- Never commit to git
- Fund this wallet with test ETH (get from [Sepolia Faucet](https://sepoliafaucet.com))
- This wallet needs to own the mock USDC contract for minting

---

### 4.2 Mainnet Oracle (Production)

For **Ethereum mainnet** (real token operations):

**Create a dedicated production wallet** (separate from personal funds):

1. Use hardware wallet (Ledger, Trezor) **recommended**
2. Or create new MetaMask wallet
3. Export private key (same process as above)

**Save as:**
```
MAINNET_ORACLE_PRIVATE_KEY=0xYOUR_MAINNET_PRIVATE_KEY
```

**⚠️ CRITICAL SECURITY:**
- Use a hot wallet only for automated operations
- Keep minimal funds (only what's needed for gas)
- Monitor transactions regularly
- Consider using Privy embedded wallets instead (more secure)

---

## 5. OpenAI API (Optional - AI Features)

Required for AI agent functionality.

### 5.1 Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up / Log in
3. Go to **API Keys** → **Create New Secret Key**
4. Copy the key (starts with `sk-`)

**Save as:**
```
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Pricing:**
- GPT-4 Turbo: ~$0.01-0.03 per request
- Set usage limits in OpenAI dashboard

---

## 6. Optional: LangSmith (AI Monitoring)

Monitor AI agent calls and performance.

### 6.1 Create LangSmith Account

1. Go to [LangSmith](https://smith.langchain.com)
2. Sign up with GitHub
3. Create project: `proxify-production`

### 6.2 Get API Key

1. Click profile → **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Copy key

**Save as:**
```
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=proxify-production
LANGCHAIN_TRACING_V2=true
```

---

## 7. Optional: Sentry (Error Monitoring)

Track errors and performance issues.

### 7.1 Create Sentry Project

1. Go to [Sentry.io](https://sentry.io)
2. Sign up / Log in
3. Create organization: `Your Company`
4. Create project: `Proxify API`
5. Choose platform: **Node.js**

### 7.2 Get DSN

1. Go to **Settings** → **Projects** → **Proxify API**
2. Go to **Client Keys (DSN)**
3. Copy DSN

**Save as:**
```
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
```

---

## 8. Optional: SendGrid (Email)

Send transactional emails (password resets, notifications).

### 8.1 Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com)
2. Sign up / Log in
3. Go to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Name: `Proxify Production`
6. Permissions: **Full Access** or **Mail Send** only
7. Copy API key

**Save as:**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_api_key
SMTP_FROM_EMAIL=noreply@proxify.io
SMTP_FROM_NAME=Proxify
```

---

## 9. Set Secrets in Fly.io

### 9.1 B2B API (Required Secrets)

```bash
flyctl secrets set \
  DATABASE_URL="postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require" \
  PRIVY_APP_ID="clxxxx..." \
  PRIVY_APP_SECRET="xxxxx..." \
  ALCHEMY_API_KEY="your_alchemy_key" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  SESSION_SECRET="$(openssl rand -base64 32)" \
  ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  SANDBOX_ORACLE_PRIVATE_KEY="0xYOUR_WALLET_PRIVATE_KEY" \
  --app proxify-b2b-api
```

### 9.2 B2B API (Optional Secrets)

```bash
flyctl secrets set \
  OPENAI_API_KEY="sk-..." \
  LANGCHAIN_API_KEY="your_langsmith_key" \
  SENTRY_DSN="https://..." \
  SMTP_PASSWORD="SG...." \
  --app proxify-b2b-api
```

### 9.3 AI Agent

```bash
flyctl secrets set \
  OPENAI_API_KEY="sk-..." \
  MCP_SERVER_URL="http://proxify-mcp.internal:3000" \
  --app proxify-agent
```

### 9.4 View Secrets

```bash
# List all secrets (values are hidden)
flyctl secrets list --app proxify-b2b-api

# Remove a secret
flyctl secrets unset SECRET_NAME --app proxify-b2b-api
```

---

## 10. Set Environment Variables in Vercel

### 10.1 Via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

```
VITE_API_URL=https://proxify-b2b-api.fly.dev
VITE_PRIVY_APP_ID=clxxxx...
```

5. Select **Production** environment
6. Click **"Save"**

### 10.2 Via CLI

```bash
vercel env add VITE_API_URL
# Enter value: https://proxify-b2b-api.fly.dev
# Select environment: Production

vercel env add VITE_PRIVY_APP_ID
# Enter value: clxxxx...
# Select environment: Production
```

---

## 11. Secrets Checklist

### Before Deployment

- [ ] Generated JWT_SECRET
- [ ] Generated SESSION_SECRET
- [ ] Generated ENCRYPTION_KEY
- [ ] Created Privy app and copied credentials
- [ ] Created Alchemy app and copied API key
- [ ] Exported wallet private key for Sepolia
- [ ] (Optional) Created OpenAI API key
- [ ] (Optional) Set up Sentry error tracking
- [ ] (Optional) Set up SendGrid email

### After Setting Secrets

- [ ] Verified all secrets in Fly.io: `flyctl secrets list`
- [ ] Verified all env vars in Vercel dashboard
- [ ] Tested DATABASE_URL connection
- [ ] Tested Privy authentication
- [ ] Tested blockchain RPC connection

---

## 12. Security Best Practices

### ✅ DO:
- ✅ Use `openssl rand` for generating random secrets
- ✅ Store secrets in platform secret managers (not .env files)
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate secrets periodically (every 90 days)
- ✅ Use hardware wallets for mainnet operations
- ✅ Set up 2FA on all platforms (Privy, Alchemy, Fly.io, etc.)
- ✅ Monitor usage of API keys (OpenAI, Alchemy)
- ✅ Keep minimal funds in hot wallets

### ❌ DON'T:
- ❌ Commit secrets to git
- ❌ Share secrets in Slack/Discord
- ❌ Use the same secret for multiple environments
- ❌ Store production wallet keys in cloud services
- ❌ Disable SSL for database connections
- ❌ Use weak or predictable secrets
- ❌ Leave API keys unrestricted (set IP allowlists if possible)

---

## 13. Secrets Storage Template

Save secrets securely in a password manager (1Password, LastPass, BitWarden):

```
=== Proxify Production Secrets ===

=== Railway ===
DATABASE_URL: postgresql://postgres:xxxxx@containers-us-west-XXX.railway.app:5432/railway?sslmode=require

=== Fly.io API ===
JWT_SECRET: xxxxxxxxxxxxxxxxxxxxxxxxxxx
SESSION_SECRET: xxxxxxxxxxxxxxxxxxxxxxxxxxx
ENCRYPTION_KEY: xxxxxxxxxxxxxxxxxxxxxxxxxxx
SANDBOX_ORACLE_PRIVATE_KEY: 0xxxxxxxxxxxxxxxxxxxxxxxxxxx

=== Privy ===
PRIVY_APP_ID: clxxxxxxxxxxxxxxxxxxxxx
PRIVY_APP_SECRET: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

=== Alchemy ===
ALCHEMY_API_KEY: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

=== OpenAI ===
OPENAI_API_KEY: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

=== Sentry ===
SENTRY_DSN: https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx

=== SendGrid ===
SMTP_PASSWORD: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 14. Rotating Secrets

### When to Rotate

- Every 90 days (recommended)
- After team member leaves
- If secret is compromised
- Before major releases

### How to Rotate

```bash
# Generate new secret
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Set in Fly.io
flyctl secrets set JWT_SECRET="$NEW_JWT_SECRET" --app proxify-b2b-api

# App will restart automatically with new secret

# Update in password manager
```

---

## Support

- **Privy**: https://docs.privy.io
- **Alchemy**: https://docs.alchemy.com
- **OpenAI**: https://platform.openai.com/docs
- **Fly.io Secrets**: https://fly.io/docs/reference/secrets
- **Vercel Env Vars**: https://vercel.com/docs/concepts/projects/environment-variables

---

**🔒 Keep your secrets safe! Never commit them to version control.**
