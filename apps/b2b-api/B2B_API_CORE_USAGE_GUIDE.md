# B2B API Core - Complete Usage Guide

## 📦 Package Overview

**Package:** `@proxify/b2b-api-core`  
**Location:** `/packages/b2b-api-core/`  
**Purpose:** Shared type-safe API layer for B2B services

### What's Included

✅ **35 API Endpoints** across 6 domains  
✅ **Type-safe contracts** using ts-rest  
✅ **Zod DTOs** for runtime validation  
✅ **HTTP Client** with domain routers  
✅ **React Query** integration support

---

## 🎯 Two Usage Patterns

### Pattern 1: Client-Side (Frontend/TypeScript Apps)

**Use Case:** Making API calls from frontend, mobile apps, or Node.js scripts

**What to Import:**
```typescript
import { B2BAPIClient, b2bQueryKeys } from '@proxify/b2b-api-core';
```

**Example:**
```typescript
import axios from 'axios';
import { B2BAPIClient } from '@proxify/b2b-api-core';

// Initialize client
const api = new B2BAPIClient(axios.create(), {
  apiUrl: 'http://localhost:3001/api/v1'
});

// Use domain routers
const client = await api.client.getClientByProductId('prod_123');
const balance = await api.client.getClientBalance(client.id);
const vault = await api.vault.getOrCreateVault({
  clientId: client.id,
  tokenSymbol: 'USDC',
  tokenAddress: '0x...',
  chainId: 1
});
```

---

### Pattern 2: Server-Side (Backend Implementation)

**Use Case:** Implementing API endpoints in Express/ts-rest server

**What to Import:**
```typescript
import { b2bContract } from '@proxify/b2b-api-core';
import { initServer } from '@ts-rest/express';
```

**Example:** (This is what b2b-api-new does)
```typescript
const s = initServer();

const clientRouter = s.router(b2bContract.client, {
  getById: async ({ params }) => {
    const client = await clientService.getClientByProductId(params.id);
    return { status: 200, body: client };
  },
  // ... implement all 8 client endpoints
});
```

---

## 🏗️ Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    @proxify/b2b-api-core                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📁 dto/           ← Zod validation schemas (30+ DTOs)       │
│  📁 contracts/     ← ts-rest API definitions (35 endpoints)  │
│  📁 client/        ← HTTP client implementation              │
│  📄 query-keys.ts  ← React Query integration                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Used by
                              ▼
        ┌─────────────────────────────────────┐
        │                                     │
        │  Frontend Apps         Backend API  │
        │  ─────────────        ─────────────  │
        │  • whitelabel-web     • b2b-api-new │
        │  • mobile apps        • REST server │
        │  • admin portal                     │
        │                                     │
        │  Uses: B2BAPIClient   Uses: Contracts│
        │        query-keys            DTOs   │
        │                                     │
        └─────────────────────────────────────┘
```

---

## 📊 Domain Coverage (35 Endpoints)

### 1. Client Domain (8 endpoints) ✅

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/clients` | Create client |
| GET | `/clients/:id` | Get by ID |
| GET | `/clients/product/:productId` | Get by product ID |
| GET | `/clients/:id/balance` | Get balance |
| POST | `/clients/:id/balance/add` | Add funds |
| POST | `/clients/:id/balance/reserve` | Reserve funds |
| POST | `/clients/:id/balance/release` | Release funds |
| POST | `/clients/:id/balance/deduct` | Deduct funds |

**Client Usage:**
```typescript
// ✅ All methods available in B2BAPIClient
await api.client.createClient({ ... });
await api.client.getClientById(id);
await api.client.getClientByProductId(productId);
await api.client.getClientBalance(id);
await api.client.addFunds(id, { amount, source });
await api.client.reserveFunds(id, { amount, purpose });
await api.client.releaseReservedFunds(id, { amount });
await api.client.deductReservedFunds(id, { amount });
```

**Server Usage:**
```typescript
// ✅ Router implementation in b2b-api-new/src/router/client.router.ts
s.router(b2bContract.client, {
  create: async ({ body }) => { ... },
  getById: async ({ params }) => { ... },
  // ... etc
});
```

---

### 2. Vault Domain (7 endpoints) ✅

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/vaults` | Create or get vault |
| GET | `/vaults/:id` | Get by ID |
| GET | `/vaults/client/:clientId` | List by client |
| GET | `/vaults/token/:clientId/:tokenSymbol/:chainId` | Get by token |
| POST | `/vaults/:id/index/update` | Update index with yield |
| GET | `/vaults/ready-for-staking` | Get ready to stake |
| POST | `/vaults/:id/mark-staked` | Mark as staked |

**Client Usage:**
```typescript
await api.vault.getOrCreateVault({ clientId, tokenSymbol, tokenAddress, chainId });
await api.vault.getVaultById(id);
await api.vault.listClientVaults(clientId);
await api.vault.getVaultByToken(clientId, tokenSymbol, chainId);
await api.vault.updateIndexWithYield(id, { newIndex, yieldAmount });
await api.vault.getVaultsReadyForStaking();
await api.vault.markFundsAsStaked(id, { amount });
```

**Server Usage:**
```typescript
// ⚠️ Currently stub in b2b-api-new (returns 501)
// TODO: Implement vault router with VaultService
```

---

### 3. User Domain (5 endpoints) ✅

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/users` | Create or get user |
| GET | `/users/:id` | Get by ID |
| GET | `/users/client/:clientId/user/:clientUserId` | Get by client user ID |
| GET | `/users/client/:clientId` | List by client |
| GET | `/users/:userId/portfolio` | Get portfolio |

**Client Usage:**
```typescript
await api.user.getOrCreateUser({ clientId, clientUserId, email, walletAddress });
await api.user.getUserById(id);
await api.user.getUserByClientUserId(clientId, clientUserId);
await api.user.listClientUsers(clientId, { limit, offset });
await api.user.getUserPortfolio(userId);
```

**Server Usage:**
```typescript
// ⚠️ Currently stub in b2b-api-new (returns 501)
// TODO: Implement user router with UserService
```

---

### 4. Deposit Domain (7 endpoints) ✅

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/deposits` | Create deposit |
| GET | `/deposits/:id` | Get by ID |
| POST | `/deposits/:id/complete` | Complete deposit |
| POST | `/deposits/:id/fail` | Fail deposit |
| GET | `/deposits/client/:clientId` | List by client |
| GET | `/deposits/user/:userId` | List by user |
| GET | `/deposits/stats/:clientId` | Get stats |

**Client Usage:**
```typescript
await api.deposit.createDeposit({ clientId, userId, vaultId, amount });
await api.deposit.getDepositById(id);
await api.deposit.completeDeposit(id, { transactionHash, blockNumber });
await api.deposit.failDeposit(id, { reason });
await api.deposit.listClientDeposits(clientId, { limit, offset, status });
await api.deposit.listUserDeposits(userId, { limit, offset });
await api.deposit.getDepositStats(clientId, { vaultId });
```

**Server Usage:**
```typescript
// ⚠️ Currently stub in b2b-api-new (returns 501)
// TODO: Implement deposit router with DepositService
```

---

### 5. Withdrawal Domain (7 endpoints) ✅

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/withdrawals` | Request withdrawal |
| GET | `/withdrawals/:id` | Get by ID |
| POST | `/withdrawals/:id/complete` | Complete withdrawal |
| POST | `/withdrawals/:id/fail` | Fail withdrawal |
| GET | `/withdrawals/client/:clientId` | List by client |
| GET | `/withdrawals/user/:userId` | List by user |
| GET | `/withdrawals/stats/:clientId` | Get stats |

**Client Usage:**
```typescript
await api.withdrawal.createWithdrawal({ clientId, userId, vaultId, amount });
await api.withdrawal.getWithdrawalById(id);
await api.withdrawal.completeWithdrawal(id, { transactionHash, blockNumber });
await api.withdrawal.failWithdrawal(id, { reason });
await api.withdrawal.listClientWithdrawals(clientId, { limit, offset, status });
await api.withdrawal.listUserWithdrawals(userId, { limit, offset });
await api.withdrawal.getWithdrawalStats(clientId, { vaultId });
```

**Server Usage:**
```typescript
// ⚠️ Currently stub in b2b-api-new (returns 501)
// TODO: Implement withdrawal router with WithdrawalService
```

---

### 6. User-Vault Balance Domain (2 endpoints) ✅

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/balances/:userId/vault/:vaultId` | Get user balance in vault |
| GET | `/balances/vault/:vaultId/users` | List vault users |

**Client Usage:**
```typescript
await api.userVault.getUserBalance(userId, vaultId);
await api.userVault.listVaultUsers(vaultId, { limit, offset });
```

**Server Usage:**
```typescript
// ⚠️ Currently stub in b2b-api-new (returns 501)
// TODO: Implement userVault router with UserVaultService
```

---

## 🚀 INDEX_VAULT_SYSTEM.md Requirements Coverage

### ✅ Core Deposit Flow (Covered 100%)

| Step | API Endpoint | Status |
|------|-------------|--------|
| 1. Get/Create Vault | `POST /vaults` | ✅ Available |
| 2. Get/Create User | `POST /users` | ✅ Available |
| 3. Create Deposit | `POST /deposits` | ✅ Available |
| 4. Complete Deposit | `POST /deposits/:id/complete` | ✅ Available |

**Usage Example:**
```typescript
// Step 1: Get or create vault
const vault = await api.vault.getOrCreateVault({
  clientId: 'client_123',
  tokenSymbol: 'USDC',
  tokenAddress: '0x...',
  chainId: 1,
  contractAddress: '0x...'
});

// Step 2: Get or create user
const user = await api.user.getOrCreateUser({
  clientId: 'client_123',
  clientUserId: 'user_456',
  email: 'user@example.com'
});

// Step 3: Create deposit
const deposit = await api.deposit.createDeposit({
  clientId: 'client_123',
  userId: user.id,
  vaultId: vault.id,
  amount: '1000.00'
});

// Step 4: Complete deposit (after blockchain confirmation)
await api.deposit.completeDeposit(deposit.id, {
  transactionHash: '0x...',
  blockNumber: 12345678
});
```

---

### ✅ Core Withdrawal Flow (Covered 100%)

| Step | API Endpoint | Status |
|------|-------------|--------|
| 1. Get User Balance | `GET /balances/:userId/vault/:vaultId` | ✅ Available |
| 2. Request Withdrawal | `POST /withdrawals` | ✅ Available |
| 3. Complete Withdrawal | `POST /withdrawals/:id/complete` | ✅ Available |

**Usage Example:**
```typescript
// Step 1: Check balance
const balance = await api.userVault.getUserBalance(userId, vaultId);
console.log(`Available: ${balance.effectiveBalance}`);

// Step 2: Request withdrawal
const withdrawal = await api.withdrawal.createWithdrawal({
  clientId: 'client_123',
  userId: userId,
  vaultId: vaultId,
  amount: '500.00'
});

// Step 3: Complete withdrawal (after blockchain execution)
await api.withdrawal.completeWithdrawal(withdrawal.id, {
  transactionHash: '0x...',
  blockNumber: 12345679
});
```

---

### ✅ Index Management (Covered 100%)

| Operation | API Endpoint | Status |
|-----------|-------------|--------|
| Update Index with Yield | `POST /vaults/:id/index/update` | ✅ Available |
| Get Vaults Ready for Staking | `GET /vaults/ready-for-staking` | ✅ Available |
| Mark Funds as Staked | `POST /vaults/:id/mark-staked` | ✅ Available |

**Usage Example:**
```typescript
// Get vaults with pending balance
const vaults = await api.vault.getVaultsReadyForStaking();

for (const vault of vaults) {
  // Stake the pending balance (blockchain operation)
  const tx = await stakeOnChain(vault.pendingBalance);
  
  // Mark as staked
  await api.vault.markFundsAsStaked(vault.id, {
    amount: vault.pendingBalance
  });
}

// Update index after yield accrual
await api.vault.updateIndexWithYield(vaultId, {
  newIndex: '1050000000000000000', // 1.05 * 1e18
  yieldAmount: '50.00'
});
```

---

### ✅ Portfolio & Analytics (Covered 100%)

| Feature | API Endpoint | Status |
|---------|-------------|--------|
| User Portfolio | `GET /users/:userId/portfolio` | ✅ Available |
| Deposit Stats | `GET /deposits/stats/:clientId` | ✅ Available |
| Withdrawal Stats | `GET /withdrawals/stats/:clientId` | ✅ Available |
| Vault Users | `GET /balances/vault/:vaultId/users` | ✅ Available |

**Usage Example:**
```typescript
// Get user's complete portfolio
const portfolio = await api.user.getUserPortfolio(userId);
console.log(`Total Balance: ${portfolio.totalBalance}`);
console.log(`Total Yield: ${portfolio.totalYieldEarned}`);
portfolio.vaults.forEach(vault => {
  console.log(`${vault.tokenSymbol}: ${vault.balance} (Yield: ${vault.yieldEarned})`);
});

// Get client deposit statistics
const stats = await api.deposit.getDepositStats(clientId, { vaultId });
console.log(`Total Deposits: ${stats.totalDeposits}`);
console.log(`Total Amount: ${stats.totalAmount}`);
```

---

## 📝 Current Implementation Status in b2b-api-new

### ✅ Implemented (3/8 Client Endpoints)

1. ✅ `GET /api/v1/clients/:id` - Get by ID
2. ✅ `GET /api/v1/clients/product/:productId` - Get by product ID
3. ✅ `GET /api/v1/clients/:id/balance` - Get balance

### ⚠️ Stubbed (32/35 Total Endpoints)

All other endpoints return `501 Not Implemented`:
- ❌ 5 Client POST endpoints (create, addFunds, reserve, release, deduct)
- ❌ 7 Vault endpoints (all)
- ❌ 5 User endpoints (all)
- ❌ 7 Deposit endpoints (all)
- ❌ 7 Withdrawal endpoints (all)
- ❌ 2 User-Vault endpoints (all)

---

## 🎯 Next Steps to Complete Implementation

### Priority 1: Implement Remaining Client Endpoints (5 endpoints)

**Files to Modify:**
- `apps/b2b-api-new/src/router/client.router.ts`
- `apps/b2b-api-new/src/service/client.service.ts`

**Tasks:**
1. Create DTO mapper layer (API DTOs → Internal DTOs)
2. Implement `create` endpoint
3. Implement balance operations (addFunds, reserveFunds, release, deduct)

### Priority 2: Implement Core Vault Router (7 endpoints)

**Files to Create:**
- `apps/b2b-api-new/src/service/vault.service.ts`
- `apps/b2b-api-new/src/router/vault.router.ts`

**Tasks:**
1. Create VaultService wrapping B2BVaultUseCase
2. Implement all 7 vault endpoints
3. Handle index calculations and updates

### Priority 3: Implement User, Deposit, Withdrawal Routers

**Files to Create:**
- `apps/b2b-api-new/src/service/user.service.ts`
- `apps/b2b-api-new/src/router/user.router.ts`
- `apps/b2b-api-new/src/service/deposit.service.ts`
- `apps/b2b-api-new/src/router/deposit.router.ts`
- `apps/b2b-api-new/src/service/withdrawal.service.ts`
- `apps/b2b-api-new/src/router/withdrawal.router.ts`
- `apps/b2b-api-new/src/service/user-vault.service.ts`
- `apps/b2b-api-new/src/router/user-vault.router.ts`

---

## 💡 Summary

### ✅ What b2b-api-core Provides

1. **Complete Type Safety**: All 35 endpoints fully typed
2. **Runtime Validation**: Zod schemas validate all requests/responses
3. **Two Usage Patterns**:
   - **Client-side**: `B2BAPIClient` for making API calls
   - **Server-side**: `b2bContract` for implementing endpoints
4. **100% Coverage**: All INDEX_VAULT_SYSTEM.md requirements covered

### ⚠️ What b2b-api-new Needs

1. **DTO Mapper Layer**: Convert API DTOs → Internal DTOs
2. **Service Layer Implementation**: Wrap all UseCases
3. **Router Implementation**: Implement 32 stubbed endpoints
4. **Testing**: Verify all flows work end-to-end

### 🎯 Final Goal

Transform b2b-api-new from **3/35 endpoints (8.6%)** to **35/35 endpoints (100%)** implemented!

---

## 📚 Related Documentation

- [`INDEX_VAULT_SYSTEM.md`](../../../INDEX_VAULT_SYSTEM.md) - Complete vault system documentation
- [`API_COVERAGE_ANALYSIS.md`](./API_COVERAGE_ANALYSIS.md) - Detailed endpoint coverage analysis
- [`packages/b2b-api-core/PACKAGE_SUMMARY.md`](../../../packages/b2b-api-core/PACKAGE_SUMMARY.md) - b2b-api-core package details
- [`ARCHITECTURE_SUMMARY.md`](./ARCHITECTURE_SUMMARY.md) - b2b-api-new architecture summary
