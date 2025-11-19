# API Coverage Analysis - INDEX_VAULT_SYSTEM.md Requirements

> **Analysis of what endpoints are implemented in b2b-api-core and b2b-api-new vs requirements in INDEX_VAULT_SYSTEM.md**

**Date**: November 19, 2025  
**Status**: 🟡 Partial Coverage - Core flows covered, missing some endpoints

---

## Executive Summary

### Coverage Status
- ✅ **Client Management**: Fully covered (create, getById, getByProductId, balance, stats, fund operations)
- ✅ **Vault Management**: Fully covered (getOrCreate, getById, listByClient, getByToken, index updates, staking)
- ✅ **User Management**: Fully covered (getOrCreate, getById, getByClientUserId, listByClient, portfolio)
- ✅ **Deposit Flow**: Fully covered (create, getById, complete, fail, list, stats)
- ✅ **Withdrawal Flow**: Fully covered (create, getById, complete, fail, list, stats)
- ✅ **User-Vault Balances**: Fully covered (getBalance, listVaultUsers)

### Implementation Status
- ✅ **b2b-api-core**: All contracts and DTOs implemented (100%)
- ⚠️ **b2b-api-new**: Only Client GET endpoints implemented (~10%)
  - ✅ 4 Client GET endpoints working
  - ❌ 5 Client POST endpoints stubbed (501)
  - ❌ All other domain routers stubbed (501)

---

## Detailed Endpoint Mapping

### 1. Client Management APIs

| INDEX_VAULT_SYSTEM.md Required | b2b-api-core Contract | b2b-api-new Router | Status |
|--------------------------------|----------------------|-------------------|---------|
| `POST /api/v1/clients/register` | ✅ `POST /clients` (create) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/clients/:id` | ✅ `GET /clients/:id` (getById) | ✅ **IMPLEMENTED** | ✅ Working |
| `GET /api/v1/clients/product/:productId` | ✅ `GET /clients/product/:productId` | ✅ **IMPLEMENTED** | ✅ Working |
| `GET /api/v1/clients/:id/balance` | ✅ `GET /clients/:id/balance` | ✅ **IMPLEMENTED** | ✅ Working |
| `GET /api/v1/clients/:id/stats` | ✅ Implicit in ClientBalanceDto | ✅ **IMPLEMENTED** | ✅ Working |
| `POST /api/v1/clients/:id/balance/add` | ✅ `POST /clients/:id/balance/add` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/clients/:id/balance/reserve` | ✅ `POST /clients/:id/balance/reserve` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/clients/:id/balance/release` | ✅ `POST /clients/:id/balance/release` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/clients/:id/balance/deduct` | ✅ `POST /clients/:id/balance/deduct` | ⚠️ Stubbed (501) | Missing implementation |

**Coverage**: 4/9 endpoints implemented (44%)

---

### 2. Vault Management APIs

| INDEX_VAULT_SYSTEM.md Required | b2b-api-core Contract | b2b-api-new Router | Status |
|--------------------------------|----------------------|-------------------|---------|
| `POST /api/v1/clients/{id}/strategies` (creates vault) | ✅ `POST /vaults` (getOrCreate) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/vaults/:id` | ✅ `GET /vaults/:id` (getById) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/vaults/client/:clientId` | ✅ `GET /vaults/client/:clientId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/vaults/token/:clientId/:tokenSymbol/:chainId` | ✅ `GET /vaults/token/:clientId/:tokenSymbol/:chainId` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/vaults/:id/index/update` | ✅ `POST /vaults/:id/index/update` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/vaults/ready-for-staking` | ✅ `GET /vaults/ready-for-staking` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/vaults/:id/mark-staked` | ✅ `POST /vaults/:id/mark-staked` | ⚠️ Stubbed (501) | Missing implementation |

**Coverage**: 0/7 endpoints implemented (0%) - All contracts exist, just need router implementation

---

### 3. User Management APIs

| INDEX_VAULT_SYSTEM.md Required | b2b-api-core Contract | b2b-api-new Router | Status |
|--------------------------------|----------------------|-------------------|---------|
| `POST /api/v1/users` | ✅ `POST /users` (getOrCreate) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/users/:id` | ✅ `GET /users/:id` (getById) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/users/client/:clientId/user/:clientUserId` | ✅ `GET /users/client/:clientId/user/:clientUserId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/users/client/:clientId` | ✅ `GET /users/client/:clientId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/users/:userId/portfolio` | ✅ `GET /users/:userId/portfolio` | ⚠️ Stubbed (501) | Missing implementation |

**Coverage**: 0/5 endpoints implemented (0%) - All contracts exist, just need router implementation

---

### 4. Deposit Flow APIs

| INDEX_VAULT_SYSTEM.md Required | b2b-api-core Contract | b2b-api-new Router | Status |
|--------------------------------|----------------------|-------------------|---------|
| `POST /api/v1/deposits` | ✅ `POST /deposits` (create) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/deposits/:id` | ✅ `GET /deposits/:id` (getById) | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/deposits/:id/complete` | ✅ `POST /deposits/:id/complete` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/deposits/:id/fail` | ✅ `POST /deposits/:id/fail` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/deposits/client/:clientId` | ✅ `GET /deposits/client/:clientId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/deposits/user/:userId` | ✅ `GET /deposits/user/:userId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/deposits/stats/:clientId` | ✅ `GET /deposits/stats/:clientId` | ⚠️ Stubbed (501) | Missing implementation |

**Coverage**: 0/7 endpoints implemented (0%) - All contracts exist, just need router implementation

---

### 5. Withdrawal Flow APIs

| INDEX_VAULT_SYSTEM.md Required | b2b-api-core Contract | b2b-api-new Router | Status |
|--------------------------------|----------------------|-------------------|---------|
| `POST /api/v1/withdrawals` | ✅ `POST /withdrawals` (create) | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/withdrawals/:id` | ✅ `GET /withdrawals/:id` (getById) | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/withdrawals/:id/complete` | ✅ `POST /withdrawals/:id/complete` | ⚠️ Stubbed (501) | Missing implementation |
| `POST /api/v1/withdrawals/:id/fail` | ✅ `POST /withdrawals/:id/fail` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/withdrawals/client/:clientId` | ✅ `GET /withdrawals/client/:clientId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/withdrawals/user/:userId` | ✅ `GET /withdrawals/user/:userId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/withdrawals/stats/:clientId` | ✅ `GET /withdrawals/stats/:clientId` | ⚠️ Stubbed (501) | Missing implementation |

**Coverage**: 0/7 endpoints implemented (0%) - All contracts exist, just need router implementation

---

### 6. User-Vault Balance APIs

| INDEX_VAULT_SYSTEM.md Required | b2b-api-core Contract | b2b-api-new Router | Status |
|--------------------------------|----------------------|-------------------|---------|
| `GET /api/v1/balances/:userId/vault/:vaultId` | ✅ `GET /balances/:userId/vault/:vaultId` | ⚠️ Stubbed (501) | Missing implementation |
| `GET /api/v1/balances/vault/:vaultId/users` | ✅ `GET /balances/vault/:vaultId/users` | ⚠️ Stubbed (501) | Missing implementation |

**Coverage**: 0/2 endpoints implemented (0%) - All contracts exist, just need router implementation

---

## Core Business Flows Coverage

### FLOW 1: Client Registration ✅
**Status**: Contract exists, router stubbed

**Required endpoints**:
- ✅ `POST /clients` - Contract defined in `b2b-api-core`
- ⚠️ Router implementation - Stubbed in `b2b-api-new`

**What's needed**:
- Implement `createClient` router handler
- Add DTO mapper: API DTO → Internal DTO (generate productId, apiKeyHash, etc.)

---

### FLOW 2: Client Configures Strategies ✅
**Status**: Contract exists, router stubbed

**Required endpoints**:
- ✅ `POST /vaults` (getOrCreate) - Contract defined
- ⚠️ Router implementation - Stubbed

**What's needed**:
- Implement `getOrCreateVault` router handler
- Strategy configuration likely handled in vault creation DTO

---

### FLOW 3: End-User Account Creation ✅
**Status**: Contract exists, router stubbed

**Required endpoints**:
- ✅ `POST /users` (getOrCreate) - Contract defined
- ⚠️ Router implementation - Stubbed

**What's needed**:
- Implement `getOrCreateUser` router handler
- User vault creation happens on first deposit (already in use cases)

---

### FLOW 4: Deposit via On-Ramp ✅
**Status**: All contracts exist, routers stubbed

**Required endpoints**:
- ✅ `POST /deposits` (create) - Contract defined
- ✅ `POST /deposits/:id/complete` - Contract defined
- ✅ `POST /deposits/:id/fail` - Contract defined
- ⚠️ All router implementations - Stubbed

**What's needed**:
- Implement deposit router handlers
- Complete flow already exists in use cases

---

### FLOW 5: Index Update with Yield ✅
**Status**: Contract exists, router stubbed

**Required endpoints**:
- ✅ `POST /vaults/:id/index/update` - Contract defined
- ⚠️ Router implementation - Stubbed

**What's needed**:
- Implement `updateIndexWithYield` router handler
- Math formulas already in use cases

---

### FLOW 6: User Withdrawal Request ✅
**Status**: All contracts exist, routers stubbed

**Required endpoints**:
- ✅ `POST /withdrawals` (create) - Contract defined
- ✅ `POST /withdrawals/:id/complete` - Contract defined
- ✅ `POST /withdrawals/:id/fail` - Contract defined
- ⚠️ All router implementations - Stubbed

**What's needed**:
- Implement withdrawal router handlers
- Complete flow already exists in use cases

---

## What's Actually Missing?

### ❌ Missing in b2b-api-core (Contracts/DTOs)
**NONE** - All contracts and DTOs are fully implemented! 🎉

### ❌ Missing in b2b-api-new (Router Implementations)

**Total endpoints**: 37
**Implemented**: 4 (10.8%)
**Stubbed**: 33 (89.2%)

**Breakdown by domain**:
1. ✅ **Client GET endpoints** (4/9): getById, getByProductId, getBalance, getStats
2. ❌ **Client POST endpoints** (0/5): create, addFunds, reserveFunds, releaseReservedFunds, deductReservedFunds
3. ❌ **Vault endpoints** (0/7): All stubbed
4. ❌ **User endpoints** (0/5): All stubbed
5. ❌ **Deposit endpoints** (0/7): All stubbed
6. ❌ **Withdrawal endpoints** (0/7): All stubbed
7. ❌ **User-Vault endpoints** (0/2): All stubbed

---

## Why Only GET Endpoints Are Implemented?

From the `client.router.ts` comments:

```typescript
// TODO: Implement remaining endpoints (create, addFunds, etc.)
// These require mapping from API DTOs to internal DTOs
```

### The DTO Mapping Challenge

**API DTOs** (from `b2b-api-core`) are simplified for external consumers:
```typescript
CreateClientDto {
  companyName: string
  businessType: string
  description?: string
  websiteUrl?: string
  walletType: "MANAGED" | "USER_OWNED"
  privyOrganizationId: string
  isSandbox?: boolean
}
```

**Internal DTOs** (from `@proxify/core`) require additional generated fields:
```typescript
CreateClientRequest {
  productId: string           // ← GENERATED (needs crypto.randomUUID())
  companyName: string
  businessType: string
  apiKeyHash: string          // ← GENERATED (hash of API key)
  apiKeyPrefix: string        // ← GENERATED ("pk_live_" prefix)
  privyWalletAddress: string  // ← FROM PRIVY (need to call Privy SDK)
  privyOrganizationId: string
  ...
}
```

### What's Needed: DTO Mapper Layer

Create `src/mapper/` directory with mappers like:

```typescript
// src/mapper/client.mapper.ts
export class ClientMapper {
  async mapCreateClientDto(
    dto: CreateClientDto,
    privyClient: PrivyClient
  ): Promise<CreateClientRequest> {
    const productId = crypto.randomUUID()
    const apiKey = generateApiKey()
    const wallet = await privyClient.getOrganizationWallet(dto.privyOrganizationId)
    
    return {
      productId,
      companyName: dto.companyName,
      businessType: dto.businessType,
      apiKeyHash: hashApiKey(apiKey),
      apiKeyPrefix: apiKey.substring(0, 10),
      privyWalletAddress: wallet.address,
      privyOrganizationId: dto.privyOrganizationId,
      // ... map remaining fields
    }
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Current) ✅
- [x] Create b2b-api-core package with all contracts and DTOs
- [x] Create b2b-api-new architecture
- [x] Implement 4 Client GET endpoints
- [x] Setup server infrastructure with DI pattern
- [x] Fix all TypeScript compilation errors

### Phase 2: DTO Mapping Layer ⚠️ NEXT
- [ ] Create `src/mapper/` directory
- [ ] Implement `ClientMapper.ts`
- [ ] Implement `VaultMapper.ts`
- [ ] Implement `UserMapper.ts`
- [ ] Implement `DepositMapper.ts`
- [ ] Implement `WithdrawalMapper.ts`

### Phase 3: Client Router Completion
- [ ] Implement `create` endpoint with mapper
- [ ] Implement `addFunds` endpoint
- [ ] Implement `reserveFunds` endpoint
- [ ] Implement `releaseReservedFunds` endpoint
- [ ] Implement `deductReservedFunds` endpoint

### Phase 4: Vault Router Implementation
- [ ] Create `src/router/vault.router.ts`
- [ ] Implement all 7 vault endpoints
- [ ] Test vault creation and index updates

### Phase 5: User Router Implementation
- [ ] Create `src/router/user.router.ts`
- [ ] Implement all 5 user endpoints
- [ ] Test user creation and portfolio queries

### Phase 6: Deposit Router Implementation
- [ ] Create `src/router/deposit.router.ts`
- [ ] Implement all 7 deposit endpoints
- [ ] Test complete deposit flow

### Phase 7: Withdrawal Router Implementation
- [ ] Create `src/router/withdrawal.router.ts`
- [ ] Implement all 7 withdrawal endpoints
- [ ] Test complete withdrawal flow

### Phase 8: User-Vault Router Implementation
- [ ] Create `src/router/user-vault.router.ts`
- [ ] Implement 2 user-vault endpoints
- [ ] Test balance queries

### Phase 9: Integration Testing
- [ ] Test complete FLOW 1: Client Registration
- [ ] Test complete FLOW 2: Strategy Configuration
- [ ] Test complete FLOW 3: User Account Creation
- [ ] Test complete FLOW 4: Deposit via On-Ramp
- [ ] Test complete FLOW 5: Index Update with Yield
- [ ] Test complete FLOW 6: User Withdrawal Request

---

## Conclusion

### ✅ Good News
- **b2b-api-core is 100% complete** - All contracts, DTOs, and client SDK ready
- **Architecture is solid** - Cleverse pattern properly implemented
- **Foundation is working** - 4 GET endpoints proven to work
- **Database layer exists** - All SQLC queries and use cases implemented

### ⚠️ What's Needed
- **DTO Mapper Layer** - Transform API DTOs → Internal DTOs
- **Router Implementations** - 33 endpoints stubbed, need implementation
- **Testing** - End-to-end flow testing

### 📊 Coverage Summary
- **Contracts**: 37/37 (100%) ✅
- **Router Implementations**: 4/37 (10.8%) ⚠️
- **Core Business Logic**: 100% (in use cases) ✅
- **Database Layer**: 100% (SQLC queries) ✅

**The system is architecturally complete - just needs router implementation!** 🚀
