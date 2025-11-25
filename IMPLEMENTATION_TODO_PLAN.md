# Implementation TODO Plan - Index Vault System

> **Complete implementation plan for Proxify's custodial vault system with multi-asset support**

## 📋 High-Level Flow

```
1. Login → Create Privy Account (privy_accounts table)
   ↓
2. Client Organization Registration → Create Client Vault (client_vaults table)
   - Support multiple assets: USDC, USDT, PYUSD
   - One organization can have multiple vaults (one per asset)
   ↓
3. Configure Vault Strategies (vault_strategies table)
   - DeFi allocation: lending, LP, staking
   - Percentages must sum to 100%
   ↓
4. End-User Registration (end_users table)
   - Each client can have multiple end-users
   - Each end-user gets embedded wallet via Privy
   ↓
5. End-User Deposit (end_user_vaults table)
   - Mock USDC mint to client vault
   - Create shares using index calculation
   - Track in end_user_vaults
   ↓
6. End-User Withdrawal (withdrawals table)
   - Burn shares
   - Calculate effective balance
   - Mock off-ramp to fiat
```

## ⚠️ Critical Architecture Decisions

### Issue: One Privy Account → Multiple Organizations → One Custodial Wallet

**Problem**:
- One privy account (one owner/email) can create multiple product organizations
- Each organization should have separate vaults for different assets
- BUT all use the same Privy embedded wallet address

**Solution**:
```
privy_accounts (identity)
    ├─ privyOrganizationId (did:privy:xxx)
    ├─ privyWalletAddress (0x123... - SHARED across all orgs)
    └─ walletType (MANAGED)

client_organizations (business entities)
    ├─ Product A (prod_grabpay_xxx)
    │   ├─ client_vaults[0]: ethereum/USDC
    │   ├─ client_vaults[1]: ethereum/USDT
    │   └─ client_vaults[2]: base/USDC
    └─ Product B (prod_grabfood_xxx)
        ├─ client_vaults[0]: ethereum/USDC
        └─ client_vaults[1]: ethereum/PYUSD

end_user_vaults (individual user positions)
    ├─ Product A → User 1 → ethereum/USDC vault
    ├─ Product A → User 2 → ethereum/USDC vault
    └─ Product B → User 1 → ethereum/USDC vault
```

**Key Point**:
- Vaults are isolated by `client_id + chain + token_address`
- Even though same Privy wallet holds funds, accounting is separate per vault
- This enables one person to manage multiple business units

---

## 🎯 Phase 1: Fix Current Implementation

### ✅ COMPLETED (This Session)
- [x] Fix LoginPage to save Privy account to database
- [x] Fix UserStore to not overwrite credentials
- [x] Fix client registration to use privy_accounts table
- [x] Add configureStrategies endpoint contract

### 🔧 PENDING FIXES (Priority Order)

#### 1. Fix SQLC Generation Issues
**Files to Fix**:
- `database/queries/vault_strategies.sql` - Remove `is_active` column references
- `database/queries/defi.sql` - Remove duplicate vault_strategies queries
- `packages/core/repository/postgres/vault.repository.ts` - Update method signatures

**Steps**:
```bash
# 1. Remove duplicates from defi.sql (lines 82-140)
# 2. Fix vault_strategies.sql (remove is_active)
# 3. Regenerate SQLC
sqlc generate

# 4. Rebuild packages
pnpm build --filter @proxify/core
pnpm build --filter @proxify/b2b-api-core
pnpm build --filter b2b-api
```

#### 2. Update Vault Repository
**File**: `packages/core/repository/postgres/vault.repository.ts`

**Remove `isActive` parameter**:
```typescript
// Line 223 - Remove isActive parameter
async upsertVaultStrategy(
  clientVaultId: string,
  category: string,
  targetPercent: number,
  // REMOVE: isActive: boolean <- Remove this
) {
  return await upsertVaultStrategy(this.sql, {
    clientVaultId,
    category,
    targetPercent: String(targetPercent),
    // REMOVE: isActive <- Remove this
  });
}
```

#### 3. Update Client UseCase
**File**: `packages/core/usecase/b2b/client.usecase.ts`

**Line 47-51**: Remove `isActive` parameter from upsertVaultStrategy call:
```typescript
await this.vaultRepository.upsertVaultStrategy(
  vault.id,
  strategy.category,
  strategy.target,
  // REMOVE: true <- Remove this fourth parameter
);
```

---

## 🎯 Phase 2: Client Vault Creation After Registration

### Current Behavior
❌ Client registration only creates `client_organizations` record
❌ No `client_vaults` created automatically
❌ Frontend has no way to select asset type during registration

### Required Behavior
✅ After client registration, create default USDC vault
✅ Frontend should allow selecting asset: USDC, USDT, PYUSD
✅ Support creating multiple vaults per client (different assets)

### Implementation Plan

#### Step 1: Update Client Registration DTO
**File**: `packages/b2b-api-core/dto/client.ts`

Add optional vault configuration:
```typescript
export const CreateClientDto = z.object({
  // ... existing fields ...

  // NEW: Initial vault configuration
  initialVault: z.object({
    chain: z.string().default("ethereum"),
    tokenSymbol: z.enum(["USDC", "USDT", "PYUSD"]).default("USDC"),
    tokenAddress: z.string(), // Must match tokenSymbol
  }).optional(),
});
```

Token addresses reference:
```typescript
const TOKEN_ADDRESSES = {
  ethereum: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    PYUSD: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
  },
  base: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  },
};
```

#### Step 2: Update Client UseCase
**File**: `packages/core/usecase/b2b/client.usecase.ts`

**After line 100** (after client creation), add:
```typescript
// Step 3: Create default vault if specified
if (request.initialVault) {
  const vault = await this.vaultRepository.createClientVault({
    clientId: client.id,
    chain: request.initialVault.chain,
    tokenAddress: request.initialVault.tokenAddress,
    tokenSymbol: request.initialVault.tokenSymbol,
    currentIndex: '1000000000000000000', // 1.0e18
    totalShares: '0',
    pendingDepositBalance: '0',
    totalStakedBalance: '0',
    cumulativeYield: '0',
  });

  console.log('[Client UseCase] Default vault created:', vault.id);
}
```

#### Step 3: Update Frontend - Registration Form
**File**: `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`

Add asset selection to client registration form (around line 60-100):
```typescript
{
  name: "initialVaultAsset",
  type: "select",
  required: false,
  description: "Initial vault asset (default: USDC)",
  default: "USDC",
  options: ["USDC", "USDT", "PYUSD"],
},
```

Update registration handler (around line 576):
```typescript
data = await b2bApiClient.registerClient({
  // ... existing fields ...

  // NEW: Add initial vault configuration
  initialVault: params.initialVaultAsset ? {
    chain: "ethereum",
    tokenSymbol: params.initialVaultAsset,
    tokenAddress: TOKEN_ADDRESSES.ethereum[params.initialVaultAsset],
  } : undefined,
});
```

---

## 🎯 Phase 3: Multi-Vault Management UI

### New Feature: Vault Creation After Registration

Users should be able to add more vaults (USDT, PYUSD) after initial registration.

#### Frontend Component
**New File**: `apps/whitelabel-web/src/feature/dashboard/VaultManagement.tsx`

```typescript
export function VaultManagement() {
  const { activeProductId } = useUserStore();
  const [vaults, setVaults] = useState([]);

  // Load existing vaults
  useEffect(() => {
    loadVaults();
  }, [activeProductId]);

  const loadVaults = async () => {
    const data = await b2bApiClient.listClientVaults(activeProductId);
    setVaults(data);
  };

  const createVault = async (asset: 'USDC' | 'USDT' | 'PYUSD') => {
    await b2bApiClient.createVault({
      clientId: activeProductId, // Will look up by productId
      chain: 'ethereum',
      tokenSymbol: asset,
      tokenAddress: TOKEN_ADDRESSES.ethereum[asset],
    });
    await loadVaults();
  };

  return (
    <div>
      <h2>Your Vaults</h2>
      {vaults.map(vault => (
        <VaultCard key={vault.id} vault={vault} />
      ))}
      <button onClick={() => createVault('USDT')}>Add USDT Vault</button>
      <button onClick={() => createVault('PYUSD')}>Add PYUSD Vault</button>
    </div>
  );
}
```

#### Backend Endpoint
**File**: `packages/b2b-api-core/contracts/vault.ts`

Already exists! Just use the existing endpoint:
- `POST /api/v1/vaults` (getOrCreate)

---

## 🎯 Phase 4: End-User Registration & Management

### Database Flow
```
Client creates end-user
    ↓
POST /api/v1/users
    ↓
Insert into end_users table
    ↓
Create embedded wallet via Privy (or use existing)
    ↓
Return user_id
```

### Implementation

#### Step 1: Fix End-User DTO Mismatch
**Current Issue**: Frontend sends `user_id` but backend expects `clientUserId`

**File**: `packages/b2b-api-core/dto/user.ts`

Align with frontend:
```typescript
export const CreateUserDto = z.object({
  user_id: z.string(), // Client's internal user ID
  user_type: z.enum(["custodial", "non-custodial"]),
  email: z.string().email().optional(),
  wallet_address: z.string().optional(), // For non-custodial users
});
```

#### Step 2: Update User UseCase
**File**: `packages/core/usecase/b2b/user.usecase.ts`

**Check current implementation** - May need to update to handle `user_id` field

#### Step 3: Frontend - Test End-User Creation
**File**: `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`

Already has the UI (FLOW 3), just needs backend fix.

---

## 🎯 Phase 5: Mock USDC Deposit Flow

### Flow Overview
```
1. End-user initiates deposit: 100 USDC
   ↓
2. Mock: Mint 100 USDC to client vault's embedded wallet
   ↓
3. Calculate shares: shares = depositAmount * 1e18 / currentIndex
   ↓
4. Create end_user_vault record with shares
   ↓
5. Update client_vault:
   - total_shares += newShares
   - pending_deposit_balance += depositAmount
   ↓
6. Return deposit confirmation
```

### Index Calculation Example
```typescript
// Initial deposit: 100 USDC at index = 1.0e18
shares = 100 * 1e18 / 1e18 = 100 shares

// Later deposit: 50 USDC at index = 1.05e18 (after 5% yield)
shares = 50 * 1e18 / 1.05e18 = 47.619 shares

// Effective balance for first deposit:
balance = 100 shares * 1.05e18 / 1e18 = 105 USDC (earned 5 USDC yield!)
```

### Implementation

#### Step 1: Mock USDC Mint Helper
**New File**: `packages/core/usecase/b2b/mock-mint.usecase.ts`

```typescript
export class MockMintUseCase {
  /**
   * Mock mint USDC to client vault's embedded wallet
   * In production, this would be replaced with actual on-ramp integration
   */
  async mockMintUSDC(
    walletAddress: string,
    amount: string,
    tokenAddress: string
  ): Promise<{ txHash: string; success: boolean }> {
    console.log(`[MOCK] Minting ${amount} USDC to ${walletAddress}`);

    // Simulate blockchain transaction
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;

    // In real implementation:
    // 1. Call on-ramp provider (MoonPay/Transak)
    // 2. Wait for confirmation
    // 3. Return actual tx hash

    return {
      txHash: mockTxHash,
      success: true,
    };
  }
}
```

#### Step 2: Update Deposit UseCase
**File**: `packages/core/usecase/b2b/deposit.usecase.ts`

**Check current implementation** around deposit flow

Add mock mint before processing deposit:
```typescript
async createDeposit(request: CreateDepositRequest) {
  // 1. Get client and vault info
  const client = await this.clientRepository.getById(request.clientId);
  const vault = await this.vaultRepository.getClientVault(
    request.clientId,
    request.chain,
    request.tokenAddress
  );

  // 2. Mock mint USDC to client's embedded wallet
  const mintResult = await this.mockMintUseCase.mockMintUSDC(
    client.privyWalletAddress,
    request.amount,
    request.tokenAddress
  );

  // 3. Calculate shares
  const shares = this.calculateShares(
    request.amount,
    vault.currentIndex
  );

  // 4. Create or update end_user_vault
  // ... existing logic
}
```

#### Step 3: Frontend - Mock Deposit UI
**File**: `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`

FLOW 4 already exists, may need field alignment with backend.

---

## 🎯 Phase 6: Mock Withdrawal & Off-Ramp

### Flow Overview
```
1. End-user requests withdrawal: 50 USDC
   ↓
2. Calculate shares to burn: burnShares = amount * 1e18 / currentIndex
   ↓
3. Check if user has enough shares
   ↓
4. Create withdrawal record (status: pending)
   ↓
5. Update end_user_vault:
   - shares -= burnShares
   - total_withdrawn += amount
   ↓
6. Mock: Burn USDC from vault, send fiat to user
   ↓
7. Update withdrawal status: completed
```

### Implementation

#### Mock Off-Ramp Helper
**New File**: `packages/core/usecase/b2b/mock-offramp.usecase.ts`

```typescript
export class MockOffRampUseCase {
  /**
   * Mock off-ramp: Convert USDC to fiat
   * In production, integrate with off-ramp provider
   */
  async mockWithdrawToFiat(
    amount: string,
    userBankAccount: string
  ): Promise<{ txId: string; fiatAmount: string; currency: string }> {
    console.log(`[MOCK] Withdrawing ${amount} USDC to ${userBankAccount}`);

    // Simulate fiat conversion (1 USDC = 1 USD)
    const fiatAmount = amount;
    const mockTxId = `offramp_${Math.random().toString(16).slice(2)}`;

    return {
      txId: mockTxId,
      fiatAmount,
      currency: 'USD',
    };
  }
}
```

#### Update Withdrawal UseCase
**File**: `packages/core/usecase/b2b/withdrawal.usecase.ts`

Add mock off-ramp after processing withdrawal.

---

## 📁 Reference Files for Implementation

### Database Schema
- `database/migrations/000002_normalize_privy_accounts.up.sql` - Privy accounts table
- `database/migrations/000003_vault_system.up.sql` - Complete vault system schema
- `INDEX_VAULT_SYSTEM.md` - Complete technical documentation with all flows

### SQLC Queries (Data Layer)
- `database/queries/client.sql` - Client organization queries
- `database/queries/vault.sql` - Client vault queries (NEEDS: createClientVault)
- `database/queries/vault_strategies.sql` - Strategy configuration queries (FIX NEEDED)
- `database/queries/end_user.sql` - End-user queries
- `database/queries/deposit.sql` - Deposit queries
- `database/queries/withdrawal.sql` - Withdrawal queries

### Repositories (Data Access Layer)
- `packages/core/repository/postgres/client.repository.ts` - Client CRUD
- `packages/core/repository/postgres/vault.repository.ts` - Vault operations (FIX NEEDED)
- `packages/core/repository/privy-account.repository.ts` - Privy identity management
- `packages/core/repository/postgres/end_user.repository.ts` - End-user management
- `packages/core/repository/postgres/deposit.repository.ts` - Deposit tracking
- `packages/core/repository/postgres/withdrawal.repository.ts` - Withdrawal tracking

### UseCases (Business Logic Layer)
- `packages/core/usecase/b2b/client.usecase.ts` - Client registration & management
- `packages/core/usecase/b2b/vault.usecase.ts` - Vault operations & strategy config
- `packages/core/usecase/b2b/user.usecase.ts` - End-user management
- `packages/core/usecase/b2b/deposit.usecase.ts` - Deposit processing
- `packages/core/usecase/b2b/withdrawal.usecase.ts` - Withdrawal processing

### Services (API Service Layer)
- `apps/b2b-api/src/service/client.service.ts` - Client HTTP service
- `apps/b2b-api/src/service/vault.service.ts` - Vault HTTP service
- `apps/b2b-api/src/service/user.service.ts` - User HTTP service
- `apps/b2b-api/src/service/deposit.service.ts` - Deposit HTTP service
- `apps/b2b-api/src/service/withdrawal.service.ts` - Withdrawal HTTP service

### Routers (API Endpoints)
- `apps/b2b-api/src/router/client.router.ts` - Client endpoints (HAS configureStrategies)
- `apps/b2b-api/src/router/vault.router.ts` - Vault endpoints
- `apps/b2b-api/src/router/user.router.ts` - User endpoints
- `apps/b2b-api/src/router/deposit.router.ts` - Deposit endpoints
- `apps/b2b-api/src/router/withdrawal.router.ts` - Withdrawal endpoints
- `apps/b2b-api/src/router/privy-account.router.ts` - Privy account endpoints

### API Contracts (Type-Safe API Definitions)
- `packages/b2b-api-core/contracts/client.ts` - Client API contract (HAS configureStrategies)
- `packages/b2b-api-core/contracts/vault.ts` - Vault API contract
- `packages/b2b-api-core/contracts/user.ts` - User API contract
- `packages/b2b-api-core/contracts/deposit.ts` - Deposit API contract
- `packages/b2b-api-core/contracts/withdrawal.ts` - Withdrawal API contract
- `packages/b2b-api-core/contracts/privy-account.ts` - Privy account API contract

### DTOs (Data Transfer Objects - Validation Schemas)
- `packages/b2b-api-core/dto/client.ts` - Client validation schemas
- `packages/b2b-api-core/dto/vault.ts` - Vault validation schemas
- `packages/b2b-api-core/dto/user.ts` - User validation schemas
- `packages/b2b-api-core/dto/deposit.ts` - Deposit validation schemas
- `packages/b2b-api-core/dto/withdrawal.ts` - Withdrawal validation schemas

### Frontend (React + TypeScript)
- `apps/whitelabel-web/src/feature/auth/LoginPage.tsx` - Privy authentication & account creation
- `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx` - Complete API testing dashboard
- `apps/whitelabel-web/src/store/userStore.ts` - Global user state management
- `apps/whitelabel-web/src/api/b2bClient.ts` - API client methods
- `apps/whitelabel-web/src/hooks/privy/usePrivyAccount.ts` - Privy account React hooks

### Configuration
- `sqlc.yaml` - SQLC code generation config
- `database/migrations/*.sql` - All database migrations
- `.env` - Environment variables (Privy App ID, API URLs)

---

## 🔍 Testing Checklist

### Phase 1: Authentication & Registration
- [ ] Login with email creates privy_accounts record
- [ ] UserStore loads data from database
- [ ] Client registration creates client_organizations record
- [ ] Default USDC vault created after registration
- [ ] Multiple organizations per Privy account work correctly

### Phase 2: Vault Management
- [ ] Can view all vaults for an organization
- [ ] Can add USDT vault to existing organization
- [ ] Can add PYUSD vault to existing organization
- [ ] Vaults isolated by client_id + chain + token_address

### Phase 3: Strategy Configuration
- [ ] Can configure strategies (lending, LP, staking)
- [ ] Strategies sum to 100% validation works
- [ ] Strategies saved to vault_strategies table
- [ ] Can update strategies for existing vault

### Phase 4: End-User Management
- [ ] Can create end-user for a client
- [ ] End-user has embedded wallet via Privy
- [ ] Multiple end-users per client work

### Phase 5: Deposits
- [ ] Mock USDC mint works
- [ ] Shares calculated correctly
- [ ] end_user_vaults record created
- [ ] client_vaults totals updated correctly
- [ ] Second deposit calculates weighted average index

### Phase 6: Withdrawals
- [ ] Can request withdrawal
- [ ] Shares burned correctly
- [ ] Effective balance calculated correctly
- [ ] Mock off-ramp completes
- [ ] Vault balances updated correctly

---

## 🚨 Critical Issues to Address

### 1. SQLC Generation Failures
**Priority**: URGENT
**Blockers**: Can't build packages until fixed
**Files**:
- `database/queries/vault_strategies.sql`
- `database/queries/defi.sql`
- `packages/core/repository/postgres/vault.repository.ts`

### 2. Field Name Mismatches
**Priority**: HIGH
**Issue**: Frontend/Backend use different field names
**Examples**:
- Frontend: `user_id` → Backend: `clientUserId`
- Frontend: `token_address` → Backend: `tokenAddress`

### 3. Missing Vault Creation
**Priority**: HIGH
**Issue**: No vault created after client registration
**Solution**: Add vault creation in client.usecase.ts

### 4. One Wallet Multiple Organizations
**Priority**: MEDIUM
**Issue**: Need clear separation of funds
**Solution**: Vault-level accounting ensures isolation

---

## 📝 Development Workflow

```bash
# 1. Fix SQLC issues
vim database/queries/vault_strategies.sql  # Remove is_active
vim database/queries/defi.sql              # Remove duplicates
vim packages/core/repository/postgres/vault.repository.ts  # Remove isActive param
sqlc generate

# 2. Rebuild packages
pnpm build --filter @proxify/core
pnpm build --filter @proxify/b2b-api-core
pnpm build --filter b2b-api

# 3. Restart services
pnpm dev --filter b2b-api     # Terminal 1
pnpm dev --filter whitelabel-web  # Terminal 2

# 4. Test flows
# - Open http://localhost:5173
# - Login with email
# - Register client organization
# - Configure strategies
# - Create end-user
# - Test deposit
# - Test withdrawal
```

---

## 🎓 Key Concepts to Understand

### Index-Based Accounting
```typescript
// User deposits 100 USDC when index = 1.0
shares = 100 * 1e18 / 1.0e18 = 100 shares
entryIndex = 1.0e18

// Vault earns 10% yield, index grows to 1.1
currentIndex = 1.1e18

// User's effective balance:
balance = 100 shares * 1.1e18 / 1e18 = 110 USDC

// Yield earned: 110 - 100 = 10 USDC (10%)
```

### Multi-Asset Support
```typescript
// Same client, different vaults
client_vaults:
  - client_id: uuid1, chain: ethereum, token: USDC
  - client_id: uuid1, chain: ethereum, token: USDT
  - client_id: uuid1, chain: base, token: USDC

// Each vault has independent:
// - current_index
// - total_shares
// - pending_deposit_balance
// - vault_strategies
```

### Shared Wallet, Separate Accounting
```typescript
// One Privy wallet holds all funds
privyWalletAddress: 0x123...

// But accounting is separate per vault
vault1 (USDC): 10,000 USDC, 10 users
vault2 (USDT): 5,000 USDT, 3 users
vault3 (PYUSD): 2,000 PYUSD, 1 user

// Same wallet, different balances tracked off-chain
```

---

## ✅ Success Criteria

- [ ] User can login and create multiple organizations
- [ ] Each organization can have vaults for USDC, USDT, PYUSD
- [ ] Strategies configurable per vault
- [ ] End-users can deposit and see correct balance
- [ ] End-users can withdraw and receive fiat
- [ ] Index grows correctly with mock yield
- [ ] All flows work end-to-end with mock data

---

**Last Updated**: 2025-11-24
**Status**: Implementation Plan Ready
**Next Step**: Fix SQLC generation issues, then implement vault creation after client registration
