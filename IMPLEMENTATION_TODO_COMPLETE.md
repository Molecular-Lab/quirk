# 🎯 Complete Implementation Plan - Index Vault System
**Reference for Next Implementation Agent**

> Generated: 2025-11-24  
> Source: INDEX_VAULT_SYSTEM.md  
> Focus: USDC first, extensible to USDT/PYUSD

---

## 🎬 Quick Start for Implementation Agent

**Your mission**: Complete the Index Vault system with multi-org support

**What's Done** ✅:
1. Login & Privy account creation
2. Client registration with privyWalletAddress
3. Strategy configuration contract/router/service (just completed!)

**What You Need to Do** 🔧:
1. Auto-create client vault on registration (FLOW 2A)
2. Fix field mismatches in user creation (FLOW 3)
3. Implement mock deposits with index calculations (FLOW 4)
4. Implement mock withdrawals with share burning (FLOW 5)

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Multi-Organization Single Wallet Architecture              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Privy User (did:privy:xxx)                                 │
│  └─ Custodial Wallet: 0x3F450b...FE5                        │
│      │                                                        │
│      ├─ GrabPay Organization (prod_grabpay_123)             │
│      │  └─ client_vault (USDC on Base)                      │
│      │     ├─ driver_001: 1000 shares                       │
│      │     └─ driver_002: 500 shares                        │
│      │                                                        │
│      ├─ GrabFood Organization (prod_grabfood_456)           │
│      │  └─ client_vault (USDC on Base)                      │
│      │     ├─ driver_001: 2000 shares  (same wallet!)       │
│      │     └─ driver_003: 800 shares                        │
│      │                                                        │
│      └─ GrabMart Organization (prod_grabmart_789)           │
│         └─ client_vault (USDC on Base)                      │
│            └─ driver_001: 500 shares  (same wallet!)        │
│                                                               │
│  ✅ Same wallet, isolated balances per organization         │
│  ✅ Isolation via client_id in client_vaults                │
│  ✅ Isolation via client_id in end_user_vaults              │
└─────────────────────────────────────────────────────────────┘
```

**Key Safety**: 
- Vaults are isolated by `client_id` (organization)
- Same wallet can have different balances in different orgs
- Frontend must show active organization clearly

---

## 📋 Implementation Tasks

### 🔧 TASK 1: Auto-Create Client Vault (HIGH PRIORITY)

**File**: `apps/b2b-api/src/service/client.service.ts`

**Current Code** (line ~50):
```typescript
async createClient(data: CreateClientInternalDto) {
  const client = await this.clientUseCase.createClient(data);
  return client;
}
```

**Add After Client Creation**:
```typescript
async createClient(data: CreateClientInternalDto) {
  // Create client organization
  const client = await this.clientUseCase.createClient(data);
  
  // ✨ NEW: Auto-create default USDC vault on Base
  const defaultVault = await this.clientUseCase.getOrCreateVault({
    clientId: client.id,
    chain: "base",  // Base chain (lower fees)
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    tokenSymbol: "USDC",
  });
  
  return {
    ...client,
    defaultVaultId: defaultVault.id,  // Return vault ID to frontend
  };
}
```

**Add to UseCase** (`packages/core/usecase/b2b-client.usecase.ts`):
```typescript
async getOrCreateVault(params: {
  clientId: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
}): Promise<ClientVault> {
  // Check if vault already exists
  let vault = await this.vaultRepository.getByClientAndToken(
    params.clientId,
    params.chain,
    params.tokenAddress
  );
  
  if (!vault) {
    // Create new vault with index = 1.0
    vault = await this.vaultRepository.create({
      clientId: params.clientId,
      chain: params.chain,
      tokenAddress: params.tokenAddress,
      tokenSymbol: params.tokenSymbol,
      totalShares: "0",
      currentIndex: "1000000000000000000", // 1.0e18 (starting index)
      pendingDepositBalance: "0",
      totalStakedBalance: "0",
      cumulativeYield: "0",
    });
  }
  
  return vault;
}
```

**Repository Methods Already Exist** ✅:
- `vaultRepository.getByClientAndToken()` - implemented
- `vaultRepository.create()` - implemented

**Testing**:
```bash
# Register client
POST /api/v1/clients
{
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "MANAGED",
  "privyOrganizationId": "did:privy:...",
  "privyWalletAddress": "0x...",
  "privyEmail": "user@example.com"
}

# Expected response (NEW field):
{
  "id": "uuid...",
  "productId": "prod_...",
  "defaultVaultId": "vault-uuid...",  # ← This is new!
  ...
}

# Verify in database:
SELECT * FROM client_vaults WHERE client_id = '<client_id>';
# Should have 1 row:
# - chain: "base"
# - token_address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
# - token_symbol: "USDC"
# - current_index: "1000000000000000000"
# - total_shares: "0"
```

**Reference**: `INDEX_VAULT_SYSTEM.md` lines 383-424

---

### 🔧 TASK 2: Fix User Creation Field Mismatch

**Problem**: Frontend and backend have different field names

**File to Change**: `apps/whitelabel-web/src/api/b2bClient.ts` line 107

**Current (WRONG)**:
```typescript
async createUser(data: { user_id: string; user_type: string }) {
  const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/users`, data)
  return response.data
}
```

**Fix To**:
```typescript
async createUser(data: {
  clientId: string;        // Product ID from active org
  clientUserId: string;    // Client's internal user ID
  email?: string;
  walletAddress?: string;
}) {
  const response = await this.axios.post<unknown>(
    `${this.baseURL}/api/v1/users`,
    data
  )
  return response.data
}
```

**Update APITestingPage.tsx** (line ~619):
```typescript
case "user-create":
  // ✨ Use correct field names
  data = await b2bApiClient.createUser({
    clientId: activeProductId!,  // From UserStore active organization
    clientUserId: params.user_id,  // Rename user_id → clientUserId
    email: user?.email?.address,
    walletAddress: privyWalletAddress ?? undefined,
  })
  break
```

**Backend Already Expects This** ✅:
- `apps/b2b-api/src/router/user.router.ts:17`
- Contract: `packages/b2b-api-core/contracts/user.ts:14`

**Testing**:
```bash
# Create user for GrabPay
POST /api/v1/users
{
  "clientId": "grabpay-prod-id",
  "clientUserId": "driver_12345",
  "email": "driver@example.com",
  "walletAddress": "0x3F450b..."
}

# Should return:
{
  "id": "user-uuid...",
  "clientId": "grabpay-prod-id",
  "clientUserId": "driver_12345",
  "isActive": true,
  ...
}
```

**Reference**: `INDEX_VAULT_SYSTEM.md` lines 536-585

---

### 🔧 TASK 3: Implement Mock Deposit with Index Calculation

**Problem**: Frontend/backend field mismatch + need index math

**Contract Update** (`packages/b2b-api-core/contracts/deposit.ts`):
```typescript
const CreateDepositSchema = z.object({
  clientId: z.string(),       // Product ID
  clientUserId: z.string(),   // Client's user ID (not UUID)
  amount: z.string(),         // USDC amount
  chain: z.string(),          // "base" | "ethereum" | "polygon"
  tokenSymbol: z.string(),    // "USDC" | "USDT"
  paymentMethod: z.enum(["mock_mint", "promptpay", "bank_transfer"]),
});
```

**Router Implementation** (`apps/b2b-api/src/router/deposit.router.ts`):
```typescript
create: async ({ body }) => {
  try {
    // 1. Get client by productId
    const client = await clientService.getByProductId(body.clientId);
    if (!client) {
      return { status: 400, body: { error: "Invalid clientId" } };
    }
    
    // 2. Get or create end_user
    const endUser = await userService.getOrCreateUser({
      clientId: client.id,
      userId: body.clientUserId,
      userType: "individual",
    });
    
    // 3. Get or create client_vault
    const vault = await vaultService.getOrCreateVault({
      clientId: client.id,
      chain: body.chain,
      tokenSymbol: body.tokenSymbol,
    });
    
    // 4. Generate mock transaction hash
    const txHash = body.paymentMethod === "mock_mint"
      ? `0xmock${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      : undefined;
    
    // 5. Create deposit record
    const deposit = await depositService.createDeposit({
      clientId: client.id,
      userId: endUser.id,
      vaultId: vault.id,
      depositType: "external",
      amount: body.amount,
      transactionHash: txHash,
    });
    
    // 6. AUTO-COMPLETE for mock deposits
    if (body.paymentMethod === "mock_mint") {
      await depositService.completeDeposit({
        depositId: deposit.id,
        vaultId: vault.id,
        amount: body.amount,
        transactionHash: txHash!,
      });
    }
    
    return { status: 201, body: deposit };
  } catch (error) {
    logger.error("Failed to create deposit", { error, body });
    return { status: 400, body: { error: "Failed to create deposit" } };
  }
}
```

**Complete Deposit with Index Math** (`apps/b2b-api/src/service/deposit.service.ts`):
```typescript
async completeDeposit(params: {
  depositId: string;
  vaultId: string;
  amount: string;
  transactionHash: string;
}): Promise<void> {
  // BEGIN TRANSACTION (use pg transaction or repository method)
  
  // 1. Lock client_vault for update
  const vault = await this.vaultRepository.getByIdForUpdate(params.vaultId);
  
  // 2. Calculate shares to mint
  // Formula: shares = amount * 1e18 / current_index
  const depositAmount = BigInt(Math.floor(parseFloat(params.amount) * 1e18));
  const currentIndex = BigInt(vault.currentIndex);
  const sharesToMint = (depositAmount * BigInt(1e18)) / currentIndex;
  
  // 3. Get deposit to find userId
  const deposit = await this.depositRepository.getById(params.depositId);
  
  // 4. Get or create end_user_vault
  const userVault = await this.userVaultRepository.getOrCreate({
    endUserId: deposit.userId,
    clientId: vault.clientId,
    chain: vault.chain,
    tokenAddress: vault.tokenAddress,
    tokenSymbol: vault.tokenSymbol,
  });
  
  // 5. Calculate new weighted entry index
  // Formula: (old_shares * old_index + new_shares * current_index) / total_shares
  const oldShares = BigInt(userVault.shares);
  const oldWeightedIndex = BigInt(userVault.weightedEntryIndex);
  const totalShares = oldShares + sharesToMint;
  
  const newWeightedIndex = oldShares === BigInt(0)
    ? currentIndex  // First deposit - use current index
    : ((oldShares * oldWeightedIndex) + (sharesToMint * currentIndex)) / totalShares;
  
  // 6. Update end_user_vault
  await this.userVaultRepository.update({
    id: userVault.id,
    shares: totalShares.toString(),
    weightedEntryIndex: newWeightedIndex.toString(),
    totalDeposited: (
      parseFloat(userVault.totalDeposited) + parseFloat(params.amount)
    ).toString(),
  });
  
  // 7. Update client_vault
  await this.vaultRepository.update({
    id: vault.id,
    totalShares: (BigInt(vault.totalShares) + sharesToMint).toString(),
    pendingDepositBalance: (
      parseFloat(vault.pendingDepositBalance) + parseFloat(params.amount)
    ).toString(),
  });
  
  // 8. Mark deposit completed
  await this.depositRepository.markCompleted(params.depositId, params.transactionHash);
  
  // COMMIT TRANSACTION
}
```

**Testing**:
```bash
# Mock deposit 1000 USDC
POST /api/v1/deposits
{
  "clientId": "grabpay-prod-id",
  "clientUserId": "driver_12345",
  "amount": "1000",
  "chain": "base",
  "tokenSymbol": "USDC",
  "paymentMethod": "mock_mint"
}

# Verify shares minted:
SELECT 
  shares,
  weighted_entry_index,
  total_deposited
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
WHERE eu.client_id = '<client-id>' 
  AND eu.user_id = 'driver_12345';

# Expected (if index = 1.0e18):
# shares: 1000000000000000000000 (1000e18)
# weighted_entry_index: 1000000000000000000 (1.0e18)
# total_deposited: 1000.000000000000000000
```

**Reference**: `INDEX_VAULT_SYSTEM.md` lines 631-799 (complete deposit flow)

---

### 🔧 TASK 4: Implement Mock Withdrawal with Share Burning

**Contract Update** (`packages/b2b-api-core/contracts/withdrawal.ts`):
```typescript
const CreateWithdrawalSchema = z.object({
  clientId: z.string(),
  clientUserId: z.string(),
  amount: z.string(),  // USDC amount to withdraw
  chain: z.string(),
  tokenSymbol: z.string(),
  destinationMethod: z.enum(["mock_fiat", "bank_transfer", "promptpay"]),
  destinationDetails: z.string().optional(),
});
```

**Router Implementation** (`apps/b2b-api/src/router/withdrawal.router.ts`):
```typescript
create: async ({ body }) => {
  try {
    // 1. Get client
    const client = await clientService.getByProductId(body.clientId);
    
    // 2. Get user
    const endUser = await userService.getByClientUserId({
      clientId: client.id,
      clientUserId: body.clientUserId,
    });
    
    // 3. Get user's vault
    const userVault = await userVaultService.getByUser({
      endUserId: endUser.id,
      chain: body.chain,
      tokenSymbol: body.tokenSymbol,
    });
    
    // 4. Get client vault for index
    const vault = await vaultService.getByClientAndToken({
      clientId: client.id,
      chain: body.chain,
      tokenSymbol: body.tokenSymbol,
    });
    
    // 5. Calculate effective balance
    // Formula: effective_balance = shares * current_index / 1e18
    const shares = BigInt(userVault.shares);
    const currentIndex = BigInt(vault.currentIndex);
    const effectiveBalance = (shares * currentIndex) / BigInt(1e18);
    
    const withdrawAmount = BigInt(Math.floor(parseFloat(body.amount) * 1e18));
    
    // 6. Check sufficient balance
    if (withdrawAmount > effectiveBalance) {
      return {
        status: 400,
        body: { error: "Insufficient balance" },
      };
    }
    
    // 7. Calculate shares to burn
    // Formula: shares_to_burn = withdrawal_amount * user_shares / effective_balance
    const sharesToBurn = withdrawAmount >= effectiveBalance
      ? shares  // Withdraw everything
      : (withdrawAmount * shares) / effectiveBalance;
    
    // 8. Create withdrawal record
    const withdrawal = await withdrawalService.createWithdrawal({
      clientId: client.id,
      userId: endUser.id,
      vaultId: vault.id,
      sharesToBurn: sharesToBurn.toString(),
      estimatedAmount: body.amount,
      destinationMethod: body.destinationMethod,
    });
    
    // 9. AUTO-COMPLETE for mock withdrawals
    if (body.destinationMethod === "mock_fiat") {
      await withdrawalService.completeWithdrawal({
        withdrawalId: withdrawal.id,
        actualAmount: body.amount,
      });
    }
    
    return { status: 201, body: withdrawal };
  } catch (error) {
    logger.error("Failed to create withdrawal", { error });
    return { status: 400, body: { error: "Failed to create withdrawal" } };
  }
}
```

**Complete Withdrawal** (`apps/b2b-api/src/service/withdrawal.service.ts`):
```typescript
async completeWithdrawal(params: {
  withdrawalId: string;
  actualAmount: string;
}): Promise<void> {
  // BEGIN TRANSACTION
  
  const withdrawal = await this.withdrawalRepository.getById(params.withdrawalId);
  
  // 1. Lock user vault
  const userVault = await this.userVaultRepository.getByIdForUpdate(
    withdrawal.endUserVaultId
  );
  
  // 2. Lock client vault
  const vault = await this.vaultRepository.getByIdForUpdate(withdrawal.vaultId);
  
  // 3. Burn shares from user vault
  const sharesToBurn = BigInt(withdrawal.sharesToBurn);
  const remainingShares = BigInt(userVault.shares) - sharesToBurn;
  
  await this.userVaultRepository.update({
    id: userVault.id,
    shares: remainingShares.toString(),
    totalWithdrawn: (
      parseFloat(userVault.totalWithdrawn) + parseFloat(params.actualAmount)
    ).toString(),
  });
  
  // 4. Burn shares from client vault
  await this.vaultRepository.update({
    id: vault.id,
    totalShares: (BigInt(vault.totalShares) - sharesToBurn).toString(),
    totalStakedBalance: (
      parseFloat(vault.totalStakedBalance) - parseFloat(params.actualAmount)
    ).toString(),
  });
  
  // 5. Mark withdrawal completed
  await this.withdrawalRepository.markCompleted(
    params.withdrawalId,
    params.actualAmount
  );
  
  // COMMIT TRANSACTION
}
```

**Testing**:
```bash
# Withdraw 500 USDC
POST /api/v1/withdrawals
{
  "clientId": "grabpay-prod-id",
  "clientUserId": "driver_12345",
  "amount": "500",
  "chain": "base",
  "tokenSymbol": "USDC",
  "destinationMethod": "mock_fiat"
}

# Verify shares burned:
SELECT shares, total_withdrawn 
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
WHERE eu.client_id = '<client-id>' 
  AND eu.user_id = 'driver_12345';

# If user had 1000 shares and withdrew 500 USDC (at index 1.0):
# - shares should be ~500e18 (50% burned)
# - total_withdrawn should be 500.0
```

**Reference**: `INDEX_VAULT_SYSTEM.md` lines 356-375 (share burn formula)

---

## 📁 Key Files Reference

### Backend Core Layer
- `packages/core/usecase/b2b-client.usecase.ts` - Business logic
- `packages/core/repository/postgres/vault.repository.ts` - Vault operations
- `packages/core/repository/postgres/user-vault.repository.ts` - User vault ops
- `packages/core/repository/postgres/deposit.repository.ts` - Deposit tracking
- `packages/core/repository/postgres/withdrawal.repository.ts` - Withdrawal tracking

### Backend API Layer
- `apps/b2b-api/src/service/client.service.ts` - Client management
- `apps/b2b-api/src/router/client.router.ts` - Client endpoints
- `apps/b2b-api/src/router/user.router.ts` - User endpoints
- `apps/b2b-api/src/router/deposit.router.ts` - Deposit endpoints
- `apps/b2b-api/src/router/withdrawal.router.ts` - Withdrawal endpoints

### Contracts & DTOs
- `packages/b2b-api-core/contracts/client.ts` - Client contract
- `packages/b2b-api-core/contracts/user.ts` - User contract
- `packages/b2b-api-core/contracts/deposit.ts` - Deposit contract
- `packages/b2b-api-core/contracts/withdrawal.ts` - Withdrawal contract
- `packages/b2b-api-core/dto/` - All DTOs

### Frontend
- `apps/whitelabel-web/src/api/b2bClient.ts` - API client (needs fixes)
- `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx` - Test UI
- `apps/whitelabel-web/src/store/userStore.ts` - State management

### Database
- `database/queries/client.sql` - Client queries
- `database/queries/vault.sql` - Vault queries
- `database/queries/deposit.sql` - Deposit queries
- `database/queries/withdrawal.sql` - Withdrawal queries

---

## 🔄 Build & Test Workflow

```bash
# 1. Rebuild packages in order
pnpm build --filter=@proxify/core
pnpm build --filter=@proxify/b2b-api-core
pnpm build --filter=@proxify/b2b-api-service

# 2. Start backend
cd apps/b2b-api && pnpm dev

# 3. Test flows (use API Testing Page in frontend)
# Flow 1: Login ✅ (already working)
# Flow 2A: Register client → Verify defaultVaultId returned
# Flow 2B: Configure strategies ✅ (just completed)
# Flow 3: Create user → Verify correct fields
# Flow 4: Mock deposit → Verify shares minted
# Flow 5: Mock withdrawal → Verify shares burned

# 4. Database verification
docker exec -it proxify-postgres psql -U proxify_user -d proxify_dev

# Check vaults created
SELECT * FROM client_vaults WHERE client_id = '<client-id>';

# Check user vaults
SELECT euv.*, eu.user_id 
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
WHERE eu.client_id = '<client-id>';

# Verify total shares consistency
SELECT 
  cv.client_id,
  cv.total_shares as vault_total,
  SUM(euv.shares) as user_total
FROM client_vaults cv
LEFT JOIN end_user_vaults euv ON cv.id = euv.client_id
GROUP BY cv.id;
```

---

## 🚨 Critical Multi-Org Safety Checks

**Before deploying**, verify:

1. **Vault Isolation**:
   ```sql
   -- Different clients should have separate vaults
   SELECT client_id, COUNT(*) 
   FROM client_vaults 
   GROUP BY client_id;
   ```

2. **User Isolation**:
   ```sql
   -- Same clientUserId can exist in multiple orgs
   SELECT eu.user_id, co.company_name, euv.shares
   FROM end_user_vaults euv
   JOIN end_users eu ON euv.end_user_id = eu.id
   JOIN client_organizations co ON euv.client_id = co.id
   WHERE eu.user_id = 'driver_12345';
   -- Should show different balances per org
   ```

3. **Total Shares Match**:
   ```sql
   -- Vault total_shares must equal sum of user shares
   SELECT 
     cv.id,
     cv.total_shares::numeric as vault_total,
     COALESCE(SUM(euv.shares::numeric), 0) as user_total,
     cv.total_shares::numeric - COALESCE(SUM(euv.shares::numeric), 0) as diff
   FROM client_vaults cv
   LEFT JOIN end_user_vaults euv ON cv.client_id = euv.client_id
   GROUP BY cv.id, cv.total_shares;
   -- diff should be 0
   ```

---

## 📚 Index Math Quick Reference

```typescript
// Mint shares on deposit
shares_to_mint = (deposit_amount * 1e18) / current_index

// Calculate weighted entry index (DCA)
new_weighted_index = (old_shares * old_index + new_shares * current_index) / total_shares

// Calculate effective balance
effective_balance = (shares * current_index) / 1e18

// Calculate user yield
yield_earned = effective_balance - (shares * weighted_entry_index / 1e18)

// Burn shares on withdrawal
shares_to_burn = (withdrawal_amount * user_shares) / effective_balance

// Update index with yield
new_index = old_index + (old_index * yield_earned) / total_staked
```

Full formulas: `INDEX_VAULT_SYSTEM.md` lines 243-375

---

## ✅ Success Checklist

- [ ] TASK 1: Client registration returns `defaultVaultId`
- [ ] TASK 1: client_vaults table has USDC vault with index = 1.0e18
- [ ] TASK 2: User creation uses `clientId` + `clientUserId`
- [ ] TASK 2: Same clientUserId can exist in multiple orgs
- [ ] TASK 3: Mock deposit mints shares correctly
- [ ] TASK 3: Weighted entry index calculated properly
- [ ] TASK 3: client_vaults.total_shares matches sum of user shares
- [ ] TASK 4: Mock withdrawal burns shares proportionally
- [ ] TASK 4: Remaining balance calculation is accurate
- [ ] ALL: Multi-org isolation verified
- [ ] ALL: Database consistency checks pass

---

## 🎯 Priority Order

1. **HIGHEST**: TASK 1 (auto-create vault) - blocking strategy config
2. **HIGH**: TASK 2 (fix user fields) - needed for deposits
3. **MEDIUM**: TASK 3 (deposits) - core functionality
4. **MEDIUM**: TASK 4 (withdrawals) - core functionality

Good luck! 🚀

---

**Questions?** Reference `INDEX_VAULT_SYSTEM.md` for:
- Complete database schema (lines 1-242)
- Index formulas (lines 243-375)
- Full flow diagrams (lines 383-1100)
- Database invariants (lines 1495-1550)
