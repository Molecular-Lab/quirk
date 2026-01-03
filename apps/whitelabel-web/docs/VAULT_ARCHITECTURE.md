# Vault Architecture - B2B Whitelabel Platform

## Overview

The **Client Vault** system is the core of our B2B custodial platform. It provides:
- 🏦 **Custodial wallet management** for platform owners
- 📊 **Share-based accounting** for fair yield distribution
- 🔐 **Privy server wallets** for production DeFi execution
- 🧪 **Sandbox mode** for testing with mock USDC

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                  B2B PLATFORM OWNER                           │
│                    (e.g., GrabPay)                            │
│                                                               │
│  • Manages aggregate platform balance                        │
│  • Deposits/withdraws funds                                  │
│  • Views yield performance                                   │
│  • Configures DeFi strategy allocation                       │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  │ owns
                  ▼
┌───────────────────────────────────────────────────────────────┐
│                    CLIENT_VAULTS                              │
│  (One vault per: client + chain + token + environment)       │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Sandbox Vault: Base + USDC + Sandbox                    │ │
│  │  • environment: "sandbox"                                │ │
│  │  • custodial_wallet_address: 0xABC... (Sepolia)         │ │
│  │  • privy_wallet_id: NULL ✅                              │ │
│  │  • Signer: ViemClientManager (local private key)        │ │
│  │  • Token: Mock USDC (testnet)                           │ │
│  │  • idle_balance: 1,000 USDC                             │ │
│  │  • earning_balance: 5,000 USDC (simulated)              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Production Vault: Base + USDC + Production              │ │
│  │  • environment: "production"                             │ │
│  │  • custodial_wallet_address: 0xDEF... (Base)            │ │
│  │  • privy_wallet_id: "did:privy:xxx" ✅ REQUIRED         │ │
│  │  • Signer: PrivyWalletService (Privy API)               │ │
│  │  • Token: Real USDC (mainnet)                           │ │
│  │  • idle_balance: 50,000 USDC                            │ │
│  │  • earning_balance: 200,000 USDC (real DeFi)            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Share-Based Accounting:                                     │
│  • total_shares: Sum of all user shares                     │
│  • current_index: Growth index (starts at 1.0e18)           │
│  • When yield accrues: index grows, all shares appreciate   │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  │ allocates to
                  ▼
┌───────────────────────────────────────────────────────────────┐
│                   END_USER_VAULTS                             │
│  (Individual user balances via share ownership)              │
│                                                               │
│  User 1: 100 shares → owns 20% of vault                     │
│  User 2: 250 shares → owns 50% of vault                     │
│  User 3: 150 shares → owns 30% of vault                     │
│                                                               │
│  User Balance = (shares × current_index) / 1e18              │
└───────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### client_vaults Table

```sql
CREATE TABLE client_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id),

  -- Chain & Token
  chain VARCHAR(50) NOT NULL,              -- e.g., "8453" (Base)
  token_address VARCHAR(66) NOT NULL,      -- e.g., USDC address
  token_symbol VARCHAR(20) NOT NULL,       -- e.g., "USDC"

  -- Share-Based Accounting
  total_shares NUMERIC(78,0) DEFAULT 0,    -- Sum of all user shares
  current_index NUMERIC(78,0) DEFAULT 1000000000000000000, -- 1.0e18

  -- Balances
  pending_deposit_balance NUMERIC(40,18) DEFAULT 0,  -- Waiting to stake
  total_staked_balance NUMERIC(40,18) DEFAULT 0,     -- Earning in DeFi
  cumulative_yield NUMERIC(40,18) DEFAULT 0,         -- Total yield earned

  -- DeFi Strategy
  strategies JSONB DEFAULT '[]'::jsonb,    -- Protocol allocations

  -- Environment & Wallet
  environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  custodial_wallet_address VARCHAR(66),    -- Ethereum address
  privy_wallet_id VARCHAR(50),             -- ✅ NEW: Privy wallet ID for production

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(client_id, chain, token_address, environment)
);

CREATE INDEX idx_client_vaults_privy_wallet_id
  ON client_vaults(privy_wallet_id)
  WHERE privy_wallet_id IS NOT NULL;
```

---

## Sandbox vs Production

### Sandbox Environment

**Purpose**: Testing without real money

| Feature | Value |
|---------|-------|
| Network | Ethereum Sepolia (testnet) |
| Token | Mock USDC (mintable) |
| Wallet | ViemClientManager (local private key) |
| `privy_wallet_id` | `NULL` ✅ |
| DeFi Protocols | Simulated (not real) |
| Use Case | Development, testing, demos |

**Transaction Flow (Sandbox)**:
```typescript
// defi-execution.service.ts
if (environment === 'sandbox') {
  // Use local wallet with private key
  const walletClient = ViemClientManager.getWalletClient(chainId)

  for (const tx of transactions) {
    const receipt = await adapter.executeDeposit(
      token,
      chainId,
      amount,
      walletClient  // ← Local signing
    )
    transactionHashes.push(receipt.hash)
  }
}
```

### Production Environment

**Purpose**: Real DeFi operations with real money

| Feature | Value |
|---------|-------|
| Network | Base Mainnet |
| Token | Real USDC |
| Wallet | PrivyWalletService (Privy API) |
| `privy_wallet_id` | `"did:privy:xxx"` ✅ REQUIRED |
| DeFi Protocols | AAVE, Compound, Morpho (real) |
| Use Case | Live customer funds |

**Transaction Flow (Production)**:
```typescript
// defi-execution.service.ts
else {
  // Use Privy server wallet
  if (!privyWalletId) {
    throw new Error('Privy wallet ID required for production')
  }

  for (const tx of transactions) {
    const result = await privyWalletService.sendTransaction({
      walletId: privyWalletId,  // ← Privy signs remotely
      chainId,
      to: tx.to,
      data: tx.data,
      value: tx.value
    })
    transactionHashes.push(result.hash)
  }
}
```

---

## Share-Based Accounting

### How It Works

**1. Initial State**
```
Vault Index: 1.0e18 (scaled by 1e18 for precision)
Total Shares: 0
Total Balance: 0 USDC
```

**2. User A Deposits 1000 USDC**
```
Shares Issued: (1000 USDC × 1e18) / 1.0e18 = 1000 shares
Total Shares: 1000
Total Balance: 1000 USDC
Vault Index: 1.0e18 (unchanged)
```

**3. User B Deposits 2000 USDC**
```
Shares Issued: (2000 USDC × 1e18) / 1.0e18 = 2000 shares
Total Shares: 3000
Total Balance: 3000 USDC
Vault Index: 1.0e18 (unchanged)
```

**4. Vault Earns 300 USDC Yield**
```
New Index = old_index × (1 + yield / staked)
          = 1.0e18 × (1 + 300 / 3000)
          = 1.0e18 × 1.1
          = 1.1e18

Vault Index: 1.1e18 ✅
Total Shares: 3000 (unchanged)
Total Balance: 3300 USDC
```

**5. User Balances After Yield**
```
User A: (1000 shares × 1.1e18) / 1e18 = 1100 USDC ✅ (+100)
User B: (2000 shares × 1.1e18) / 1e18 = 2200 USDC ✅ (+200)
Total:  3300 USDC ✅
```

### Key Formulas

```typescript
// Calculate shares to issue on deposit
const shares = (amount × 1e18) / current_index

// Calculate current balance from shares
const balance = (shares × current_index) / 1e18

// Calculate new index after yield
const new_index = old_index × (1 + yield / total_staked)

// Calculate yield earned by user
const yield = ((shares × new_index) / 1e18) - original_deposit
```

---

## Privy Wallet Integration

### Auto-Creation (New Vaults)

When creating a **production vault**, a Privy server wallet is automatically created:

```typescript
// packages/core/usecase/b2b/vault.usecase.ts

async getOrCreateVault(request, environment) {
  // Check if vault exists
  const existing = await this.vaultRepository.getClientVault(...)
  if (existing) return existing

  // For production, create Privy wallet
  let privyWalletId = null
  let walletAddress = null

  if (environment === 'production') {
    const { walletId, address } = await this.privyWalletService.createServerWallet()
    privyWalletId = walletId
    walletAddress = address
    console.log(`✅ Created Privy wallet: ${walletId}`)
  }

  // Create vault with wallet ID
  return await this.vaultRepository.createClientVault({
    ...request,
    environment,
    custodialWalletAddress: walletAddress,
    privyWalletId,  // Set for production, null for sandbox
  })
}
```

### Backfill (Existing Vaults)

For existing production vaults without Privy wallets:

```bash
# Run backfill script
pnpm tsx scripts/backfill-privy-wallets.ts
```

This script:
1. Finds production vaults where `privy_wallet_id IS NULL`
2. Creates Privy server wallet for each
3. Updates vault with `privy_wallet_id` and `custodial_wallet_address`
4. Provides summary report

---

## Whitelabel-Web Integration

### Components That Use Vaults

**1. YieldDashboard.tsx**
- Displays vault balance (idle + earning)
- Shows APY and yield metrics
- Main dashboard for platform owners

**2. EarnDepositModal.tsx**
- Deposits funds into vault
- Calls `/defi-protocol/execute-deposit`
- Uses `privy_wallet_id` for production signing

**3. WithdrawalExecutionModal.tsx**
- Withdraws funds from vault
- Calls `/defi-protocol/execute-withdrawal`
- Uses `privy_wallet_id` for production signing

**4. useClientWalletBalance.ts**
- React hook to fetch vault balance
- Queries `/client/:productId/wallet-balances`
- Returns `totalIdleBalance`, `totalEarningBalance`, etc.

### Data Flow

```
User clicks "Deposit Funds" in whitelabel-web
  ↓
EarnDepositModal opens
  ↓
Calls POST /defi-protocol/execute-deposit
  ↓
Backend (defi-protocol.router.ts):
  1. Gets client from productId
  2. Fetches vault using client_id + chain + token + environment
  3. Extracts vault.privyWalletId
  4. Validates wallet ID exists (for production)
  ↓
DeFiExecutionService:
  1. Prepares deposit transactions
  2. Signs with Privy wallet (production) or local key (sandbox)
  3. Executes transactions on-chain
  ↓
Transaction succeeds
  ↓
Frontend refreshes balance
```

---

## Environment Variables

### Required for Production

```bash
# .env
DATABASE_URL=postgresql://...

# Privy Server Wallet Credentials
PRIVY_APP_ID=your_app_id
PRIVY_APP_SECRET=your_app_secret
PRIVY_AUTHORIZATION_KEY_ID=optional_auth_key_id  # Optional

# Sandbox Oracle (for mock USDC minting)
SANDBOX_ORACLE_PRIVATE_KEY=0x...
```

### Verification

Check if Privy is configured:
```bash
# Should see: "✅ PrivyWalletService initialized for production DeFi execution"
pnpm --filter @proxify/b2b-api dev
```

---

## Testing Checklist

### Sandbox Testing
- [ ] Create sandbox vault → Verify `privy_wallet_id` is `NULL`
- [ ] Deposit to sandbox vault → Verify transaction succeeds
- [ ] Withdraw from sandbox vault → Verify transaction succeeds
- [ ] Check logs → Should use ViemClientManager (local signing)

### Production Testing
- [ ] Create production vault → Verify Privy wallet auto-created
- [ ] Verify `privy_wallet_id` is set in database
- [ ] Deposit to production vault → Verify transaction succeeds
- [ ] Withdraw from production vault → Verify transaction succeeds
- [ ] Check logs → Should use PrivyWalletService (Privy API)

### Error Cases
- [ ] Try deposit without wallet ID → Should return clear error
- [ ] Try creating production vault without Privy credentials → Should fail gracefully
- [ ] Verify error messages are user-friendly

---

## Troubleshooting

### "PrivyWalletService not configured"

**Cause**: `PRIVY_APP_ID` or `PRIVY_APP_SECRET` not set in `.env`

**Fix**:
```bash
# Add to .env
PRIVY_APP_ID=your_app_id
PRIVY_APP_SECRET=your_app_secret

# Restart server
pnpm --filter @proxify/b2b-api dev
```

### "Privy wallet not configured for production"

**Cause**: Vault exists but `privy_wallet_id` is `NULL`

**Fix**:
```bash
# Run backfill script
pnpm tsx scripts/backfill-privy-wallets.ts
```

### "Network error" on deposit

**Cause**: Passing organization ID as wallet ID (old bug - now fixed!)

**Fix**: Already fixed in latest code. Vault now fetches real `privy_wallet_id`.

---

## Database Queries

### Check vault status
```sql
SELECT
  environment,
  COUNT(*) as total_vaults,
  COUNT(privy_wallet_id) as with_wallet,
  COUNT(*) - COUNT(privy_wallet_id) as without_wallet
FROM client_vaults
GROUP BY environment;
```

### Find vaults needing wallets
```sql
SELECT id, chain, token_symbol, environment, custodial_wallet_address
FROM client_vaults
WHERE environment = 'production' AND privy_wallet_id IS NULL;
```

### View vault details
```sql
SELECT
  id,
  token_symbol,
  environment,
  total_shares,
  current_index,
  pending_deposit_balance,
  total_staked_balance,
  cumulative_yield,
  privy_wallet_id,
  custodial_wallet_address
FROM client_vaults
WHERE environment = 'production';
```

---

## Next Steps

1. **Run backfill** (if you have existing production vaults):
   ```bash
   pnpm tsx scripts/backfill-privy-wallets.ts
   ```

2. **Test deposit flow** in production:
   - Go to YieldDashboard
   - Click "Deposit Funds"
   - Select amount and protocols
   - Verify transaction succeeds

3. **Monitor logs** for Privy wallet creation:
   ```bash
   pnpm --filter @proxify/b2b-api dev
   # Watch for: "✅ Created Privy wallet for production vault"
   ```

4. **Verify in database**:
   ```sql
   SELECT environment, privy_wallet_id, custodial_wallet_address
   FROM client_vaults
   WHERE environment = 'production';
   ```

---

## Architecture Benefits

✅ **Security**: Private keys never leave Privy's infrastructure
✅ **Scalability**: One vault per environment (sandbox/production)
✅ **Fair Yield**: Share-based accounting ensures proportional distribution
✅ **Flexibility**: Easy to switch between sandbox and production
✅ **Auditable**: All transactions logged with wallet IDs

---

## References

- [Privy Server Wallets Documentation](https://docs.privy.io/guide/server-wallets)
- [Share-Based Accounting Utilities](/packages/core/utils/vault-accounting.utils.ts)
- [DeFi Execution Service](/apps/b2b-api/src/service/defi-execution.service.ts)
- [Vault UseCase](/packages/core/usecase/b2b/vault.usecase.ts)
