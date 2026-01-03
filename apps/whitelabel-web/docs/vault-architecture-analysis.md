# Vault Architecture Analysis & Privy Wallet Strategy

## 1. What is a Client Vault?

### Purpose
A **Client Vault** is a **custodial account** that aggregates all deposits from the platform owner (B2B client). Think of it as the "master wallet" that holds:
- 💰 **Idle balance**: Funds waiting to be deployed to DeFi
- 📈 **Earning balance**: Funds actively staked in DeFi protocols (AAVE, Compound, Morpho)
- 🎁 **Cumulative yield**: Total yield earned across all protocols

### Architecture: 2-Tier System

```
┌─────────────────────────────────────────────────────────────┐
│                    B2B PLATFORM OWNER                        │
│                   (e.g., "GrabPay")                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ owns
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT_VAULTS                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Vault #1: Base + USDC + Sandbox                        │ │
│  │  - custodial_wallet_address: 0xABC...                  │ │
│  │  - privy_wallet_id: NULL (uses ViemClientManager)      │ │
│  │  - idle_balance: 1000 USDC                             │ │
│  │  - earning_balance: 5000 USDC (staked in protocols)    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Vault #2: Base + USDC + Production                     │ │
│  │  - custodial_wallet_address: 0xDEF...                  │ │
│  │  - privy_wallet_id: "did:privy:xxx" ✅ NEEDED          │ │
│  │  - idle_balance: 50000 USDC                            │ │
│  │  - earning_balance: 200000 USDC (real DeFi)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  (Can have vaults for different chains/tokens/environments) │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ aggregates
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   END_USER_VAULTS                            │
│  (Individual user balances tracked via shares)               │
│                                                              │
│  User 1: 100 shares → owns % of client vault               │
│  User 2: 250 shares → owns % of client vault               │
│  User 3: 150 shares → owns % of client vault               │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. One Vault Per (Client + Chain + Token + Environment)**
```typescript
// Example: GrabPay can have multiple vaults
{
  client_id: "grab-pay-uuid",
  chain: "8453",                    // Base
  token_address: "0x833589...",     // USDC
  environment: "production"          // ← KEY DIFFERENTIATOR
}

{
  client_id: "grab-pay-uuid",
  chain: "8453",                    // Base
  token_address: "0x833589...",     // USDC
  environment: "sandbox"             // ← DIFFERENT VAULT
}
```

**2. Share-Based Accounting**
- Each end-user gets **shares** in the vault
- Shares represent ownership % of the total vault balance
- When yield accrues, the **growth index** increases
- User balance = (shares × current_index) / 1e18

**3. Growth Index (Time-Weighted Yield)**
- Starts at `1.0e18` (1.0 scaled by 1e18 for precision)
- Grows when yield is earned: `new_index = old_index × (1 + yield / staked)`
- Allows fair yield distribution even when users deposit at different times

---

## 2. Does Whitelabel-Web Use This Vault System?

### ✅ YES - Extensively Used

The whitelabel-web app is the **B2B platform owner's dashboard**. It manages CLIENT vaults, not end-user vaults.

**Files That Use Vaults:**

1. **`useClientWalletBalance.ts`** (lines 37-40)
   - Fetches vault balance via `/client/:productId/wallet-balances`
   - Shows `totalIdleBalance`, `totalEarningBalance`, `totalCumulativeYield`

2. **`YieldDashboard.tsx`**
   - Main dashboard for viewing vault balance
   - Shows idle vs earning balance breakdown
   - Displays APY and yield metrics

3. **`EarnDepositModal.tsx`**
   - Deposits funds INTO the client vault
   - Calls `/defi-protocol/execute-deposit` ← **USES PRIVY WALLET ID**
   - Allocates funds to AAVE/Compound/Morpho

4. **`WithdrawalExecutionModal.tsx`**
   - Withdraws funds FROM the client vault
   - Calls `/defi-protocol/execute-withdrawal` ← **USES PRIVY WALLET ID**

5. **`useDefiExecution.ts`**
   - React hook wrapping DeFi deposit/withdrawal
   - Handles transaction state and query invalidation

### What Whitelabel-Web Does:

```
┌─────────────────────────────────────────────────────────────┐
│             WHITELABEL-WEB (B2B Dashboard)                   │
│                                                              │
│  1. Platform owner logs in (e.g., "GrabPay admin")         │
│  2. Views their CLIENT vault balance                        │
│  3. Clicks "Deposit Funds" → Deposits to vault             │
│  4. Clicks "Withdraw Funds" → Withdraws from vault         │
│  5. Views yield earned, APY, protocol allocations          │
│                                                              │
│  🚫 Does NOT manage individual end-users                    │
│  🚫 Does NOT see individual user balances                   │
│  ✅ Manages the AGGREGATED platform vault                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Sandbox vs Production: Privy Wallet Strategy

### 🎯 Your Analysis is CORRECT

**Privy server wallets should ONLY be created for PRODUCTION vaults.**

### Why?

#### **Sandbox Environment** (Mock USDC on Sepolia)
- Uses **ViemClientManager** with local private key
- Mock USDC contract (not real money)
- Deposits/withdrawals are simulated
- **NO PRIVY WALLET NEEDED** ✅

```typescript
// defi-execution.service.ts (lines 418-435)
if (environment === 'sandbox') {
  // Use ViemClientManager for sandbox (mock USDC)
  const walletClient = ViemClientManager.getWalletClient(chainId.toString())

  for (const tx of prepared.transactions) {
    const adapter = this.getAdapter(tx.protocol, chainId)
    const receipt = await adapter.executeDeposit(
      token,
      chainId,
      tx.amount,
      walletClient  // ← Local wallet, not Privy
    )
    transactionHashes.push(receipt.hash)
  }
}
```

#### **Production Environment** (Real USDC on Base)
- Uses **PrivyWalletService** for custodial signing
- Real USDC contract (real money)
- Actual DeFi protocol interactions
- **PRIVY WALLET REQUIRED** ✅

```typescript
// defi-execution.service.ts (lines 436-459)
else {
  // Use PrivyWalletService for production
  if (!this.privyWalletService) {
    throw new Error('PrivyWalletService not configured for production')
  }
  if (!privyWalletId) {
    throw new Error('Privy wallet ID required for production execution')
  }

  for (const tx of prepared.transactions) {
    const result = await this.privyWalletService.sendTransaction({
      walletId: privyWalletId,  // ← NEEDS PRIVY WALLET ID
      chainId,
      to: tx.transaction.to,
      data: tx.transaction.data,
      value: tx.transaction.value?.toString() || '0x0',
    })
    transactionHashes.push(result.hash)
  }
}
```

### Strategy:

| Vault Type | Environment | Privy Wallet ID | Signer |
|------------|-------------|-----------------|--------|
| Sandbox vault | `sandbox` | `NULL` ✅ | ViemClientManager (local private key) |
| Production vault | `production` | `"did:privy:xxx"` ✅ | PrivyWalletService (Privy API) |

---

## 4. Implementation Plan: Create Privy Wallets for Production Vaults

### Option A: Create Wallets During Vault Creation (Recommended)

Update the vault creation logic to automatically create Privy wallets for production vaults:

**File**: `packages/core/usecase/b2b/vault.usecase.ts`

```typescript
async getOrCreateVault(
  request: CreateVaultRequest,
  environment: "sandbox" | "production" = "sandbox",
  custodialWalletAddress?: string
): Promise<GetClientVaultByTokenRow> {
  // Check if vault exists
  const existing = await this.vaultRepository.getClientVault(
    request.clientId,
    request.chain,
    request.tokenAddress,
    environment
  )

  if (existing) {
    return existing
  }

  // ✅ NEW: Create Privy wallet for production vaults
  let privyWalletId: string | null = null
  let walletAddress: string | null = custodialWalletAddress || null

  if (environment === 'production') {
    // Create Privy server wallet
    const privyWallet = await this.privyWalletService.createServerWallet()
    privyWalletId = privyWallet.walletId
    walletAddress = privyWallet.address

    console.log(`✅ Created Privy wallet for production vault: ${privyWalletId}`)
  }

  // Create new vault with Privy wallet ID
  const vault = await this.vaultRepository.createClientVault({
    clientId: request.clientId,
    chain: request.chain,
    tokenAddress: request.tokenAddress,
    tokenSymbol: request.tokenSymbol,
    totalShares: "0",
    currentIndex: "1000000000000000000",
    pendingDepositBalance: "0",
    totalStakedBalance: "0",
    cumulativeYield: "0",
    environment,
    custodialWalletAddress: walletAddress,
    privyWalletId,  // ✅ Set wallet ID for production, null for sandbox
  })

  return vault
}
```

### Option B: Backfill Existing Production Vaults (One-Time Script)

**File**: `scripts/create-privy-wallets-for-production.ts`

```typescript
import { privyWalletService } from '../apps/b2b-api/src/services'
import { db } from '../packages/core/db'

async function backfillPrivyWallets() {
  console.log('🔍 Finding production vaults without Privy wallet IDs...')

  const vaults = await db.query(`
    SELECT id, client_id, chain, token_symbol, environment
    FROM client_vaults
    WHERE environment = 'production'
      AND privy_wallet_id IS NULL
  `)

  console.log(`Found ${vaults.length} production vaults needing wallets\n`)

  for (const vault of vaults) {
    console.log(`Creating wallet for vault: ${vault.id} (${vault.token_symbol} on chain ${vault.chain})`)

    try {
      // Create Privy server wallet
      const { walletId, address } = await privyWalletService.createServerWallet()

      // Update vault with wallet ID
      await db.query(`
        UPDATE client_vaults
        SET privy_wallet_id = $1,
            custodial_wallet_address = $2,
            updated_at = now()
        WHERE id = $3
      `, [walletId, address, vault.id])

      console.log(`  ✅ Created wallet ${walletId}`)
      console.log(`  📍 Address: ${address}\n`)
    } catch (error) {
      console.error(`  ❌ Failed to create wallet for vault ${vault.id}:`, error)
    }
  }

  console.log('✅ Backfill complete!')
}

backfillPrivyWallets()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
```

---

## 5. Current State After Migration

You mentioned you've already run the migration. Let me verify what exists:

```sql
-- Check current vaults
SELECT
  id,
  chain,
  token_symbol,
  environment,
  custodial_wallet_address,
  privy_wallet_id,
  idle_balance,
  earning_balance
FROM client_vaults
ORDER BY environment, created_at DESC;
```

**Expected Results:**
| environment | custodial_wallet_address | privy_wallet_id | Status |
|-------------|-------------------------|-----------------|--------|
| `sandbox` | `0xABC...` | `NULL` ✅ | OK - uses local wallet |
| `production` | `0xDEF...` or `NULL` | `NULL` ❌ | NEEDS Privy wallet |

---

## 6. Summary & Recommendation

### ✅ Your Understanding is Correct:

1. **Vaults** = Client-level custodial accounts for B2B platform owners
2. **Whitelabel-web** = B2B dashboard that EXTENSIVELY uses vaults
3. **Privy wallets** = ONLY needed for production (sandbox uses mock USDC with local keys)

### 🎯 Recommended Next Steps:

**Step 1**: Check current vaults
```sql
SELECT environment, privy_wallet_id, count(*)
FROM client_vaults
GROUP BY environment, privy_wallet_id;
```

**Step 2**: Choose creation strategy
- **If vaults don't exist yet**: Use Option A (create during vault creation)
- **If vaults already exist**: Use Option B (backfill script)

**Step 3**: Test the flow
1. Create a production vault (or use existing)
2. Verify Privy wallet was created
3. Test deposit → Verify transaction succeeds
4. Test withdrawal → Verify transaction succeeds

### Questions for You:

1. **Do you already have production vaults?** (Check with the SQL query above)
2. **Which approach do you prefer?**
   - Option A: Update vault creation logic (future-proof)
   - Option B: Run one-time backfill script (quick fix)
3. **Do you have Privy credentials configured?** (`PRIVY_APP_ID`, `PRIVY_APP_SECRET` in `.env`)

Let me know and I can help implement the solution!
