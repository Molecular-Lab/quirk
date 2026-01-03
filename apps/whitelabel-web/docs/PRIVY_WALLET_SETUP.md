# Privy Wallet Setup Guide

## Quick Start

This guide shows how to set up Privy server wallets for production DeFi execution.

---

## Prerequisites

✅ Privy account created at [dashboard.privy.io](https://dashboard.privy.io)
✅ `PRIVY_APP_ID` and `PRIVY_APP_SECRET` from Privy dashboard
✅ Database migration `000006_add_privy_wallet_id` applied
✅ `.env` file configured

---

## Step 1: Configure Environment Variables

Add to your `.env` file:

```bash
# Privy Server Wallet Credentials
PRIVY_APP_ID=your_app_id_here
PRIVY_APP_SECRET=your_app_secret_here
# PRIVY_AUTHORIZATION_KEY_ID=optional_auth_key  # Optional
```

**How to get credentials:**
1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Select your app
3. Navigate to Settings → API Keys
4. Copy App ID and App Secret

---

## Step 2: Verify Migration Applied

Check if the `privy_wallet_id` column exists:

```sql
-- Connect to your database and run:
\d client_vaults

-- You should see:
-- privy_wallet_id | character varying(50) | | |
```

If the column doesn't exist, run:

```bash
# Apply migration
pnpm db:migrate
# or whatever your migration command is
```

---

## Step 3: Backfill Existing Production Vaults

If you have existing production vaults without Privy wallets:

```bash
# Run backfill script
pnpm tsx scripts/backfill-privy-wallets.ts
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════════════╗
║   Backfill Privy Wallets for Production Vaults               ║
╚═══════════════════════════════════════════════════════════════╝

ℹ️  Database connection initialized
ℹ️  Database connection verified ✅
ℹ️  PrivyWalletService initialized ✅

🔍 Searching for production vaults without Privy wallet IDs...

Found 2 production vault(s) needing Privy wallets:

  • Vault abc-123-def
    Token: USDC on chain 8453
    Current address: 0x1234...

[1/2] Processing vault abc-123-def
  Token: USDC on chain 8453
ℹ️    Creating Privy server wallet...
ℹ️    ✅ Wallet created!
       Wallet ID: did:privy:1234567890abcdef
       Address: 0xABCD1234...
ℹ️    Updating vault in database...
ℹ️    ✅ Vault updated successfully!

╔═══════════════════════════════════════════════════════════════╗
║                        SUMMARY                                ║
╚═══════════════════════════════════════════════════════════════╝

ℹ️  Total vaults processed: 2
ℹ️  ✅ Success: 2

✅ Backfill complete!
```

---

## Step 4: Verify Setup

### 4.1 Check Database

```sql
SELECT
  environment,
  COUNT(*) as total_vaults,
  COUNT(privy_wallet_id) as with_wallet,
  COUNT(*) - COUNT(privy_wallet_id) as without_wallet
FROM client_vaults
GROUP BY environment;
```

**Expected result:**
| environment | total_vaults | with_wallet | without_wallet |
|-------------|--------------|-------------|----------------|
| sandbox     | 1            | 0           | 1              |
| production  | 2            | 2           | 0              |

✅ All production vaults should have wallets
✅ Sandbox vaults should NOT have wallets (uses local keys)

### 4.2 Start Backend

```bash
pnpm --filter @proxify/b2b-api dev
```

**Look for this log:**
```
✅ PrivyWalletService initialized for production DeFi execution
```

If you see this instead:
```
ℹ️ PrivyWalletService not configured (production execution disabled)
   Set PRIVY_APP_ID and PRIVY_APP_SECRET in .env to enable
```
→ Go back to Step 1 and check your `.env` file

---

## Step 5: Test Production Deposit

### 5.1 Via Whitelabel Dashboard

1. Open whitelabel-web: `http://localhost:3000`
2. Switch to **Production** environment (toggle in header)
3. Go to **Yield Dashboard**
4. Click **"Deposit Funds"**
5. Enter amount (e.g., 100 USDC)
6. Select protocols (AAVE/Compound/Morpho)
7. Click **"Execute Deposit"**

### 5.2 Watch Backend Logs

You should see:
```
ℹ️  [DeFiExecution] Production deposit executed
    protocol: 'aave'
    hash: '0x1234...'
```

✅ If transaction succeeds → Privy wallet is working!
❌ If you see "Privy wallet not configured" → Check Step 1

---

## Step 6: Future Vault Creation

**Good news:** New production vaults automatically get Privy wallets!

When you create a production vault, the system will:
1. Call `privyWalletService.createServerWallet()`
2. Store `walletId` in `client_vaults.privy_wallet_id`
3. Store `address` in `client_vaults.custodial_wallet_address`
4. Log: `✅ Created Privy wallet for production vault`

**No manual setup needed!** 🎉

---

## Troubleshooting

### Error: "PrivyWalletService not configured"

**Symptoms:**
- Can't create production vaults
- Deposits fail with "not configured" error

**Solution:**
1. Check `.env` has `PRIVY_APP_ID` and `PRIVY_APP_SECRET`
2. Restart backend server
3. Verify logs show "PrivyWalletService initialized"

### Error: "Privy wallet not configured for production"

**Symptoms:**
- Vault exists but deposits fail
- Database has `privy_wallet_id = NULL` for production vault

**Solution:**
```bash
# Run backfill script
pnpm tsx scripts/backfill-privy-wallets.ts
```

### Error: Network error during deposit

**Symptoms:**
- Transaction fails with generic network error
- Logs show connection issues

**Possible causes:**
1. **Wrong wallet ID**: Make sure you ran backfill script
2. **Privy API down**: Check [status.privy.io](https://status.privy.io)
3. **RPC issues**: Check Base RPC endpoint in `.env`

**Solution:**
```sql
-- Verify wallet ID exists
SELECT id, privy_wallet_id, custodial_wallet_address
FROM client_vaults
WHERE environment = 'production';

-- If privy_wallet_id is NULL, run backfill
```

---

## Architecture Overview

### Sandbox (Testing)
```
┌─────────────────────────────────────────┐
│ Sandbox Vault                           │
│  • environment: "sandbox"               │
│  • privy_wallet_id: NULL                │
│  • Signer: ViemClientManager (local)    │
│  • Network: Sepolia testnet             │
│  • Token: Mock USDC                     │
└─────────────────────────────────────────┘
```

### Production (Real Money)
```
┌─────────────────────────────────────────┐
│ Production Vault                        │
│  • environment: "production"            │
│  • privy_wallet_id: "did:privy:xxx"     │
│  • Signer: PrivyWalletService (remote)  │
│  • Network: Base mainnet                │
│  • Token: Real USDC                     │
└─────────────────────────────────────────┘
```

**Key Difference:**
- Sandbox: Local signing (private key in `.env`)
- Production: Remote signing (Privy API with wallet ID)

---

## Security Best Practices

### ✅ DO:
- Store `PRIVY_APP_SECRET` in `.env` (never commit!)
- Use environment variables for all secrets
- Rotate Privy credentials periodically
- Monitor Privy wallet transactions in dashboard

### ❌ DON'T:
- Commit `.env` file to git
- Share Privy credentials in Slack/email
- Use same credentials for dev/prod
- Delete Privy wallets (funds will be lost!)

---

## Monitoring

### Check Wallet Balance

```typescript
// Get vault wallet address
const vault = await vaultService.getVaultByToken(
  clientId,
  "8453",
  usdcAddress,
  "production"
)

console.log("Wallet address:", vault.custodialWalletAddress)
console.log("Privy wallet ID:", vault.privyWalletId)
```

Then check balance on [BaseScan](https://basescan.org):
```
https://basescan.org/address/{custodial_wallet_address}
```

### Privy Dashboard

Monitor all transactions in Privy dashboard:
1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Select your app
3. Navigate to Wallets → Server Wallets
4. View transaction history

---

## Next Steps

1. ✅ Verify setup with steps above
2. ✅ Test deposits in production
3. ✅ Monitor first few transactions
4. ✅ Set up alerts for failed transactions
5. ✅ Document any custom configurations

---

## Support

- **Privy Docs**: [docs.privy.io](https://docs.privy.io)
- **Privy Support**: support@privy.io
- **Architecture Guide**: `apps/whitelabel-web/docs/VAULT_ARCHITECTURE.md`
- **Backfill Script**: `scripts/backfill-privy-wallets.ts`

---

## Changelog

- **2025-01-03**: Initial setup guide created
- **2025-01-03**: Added auto-creation for new vaults
- **2025-01-03**: Added backfill script for existing vaults
