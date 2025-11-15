# Proxify Contracts Integration Plan

**Date:** 2025-10-30
**Status:** Ready for Implementation
**Contracts:** Proxify, ProxifyClientRegistry, ProxifyController

---

## 📋 Overview

This document outlines the step-by-step plan to integrate the new Proxify contracts (renamed from LAAC V2) into the existing service infrastructure.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Smart Contracts (Solidity)                         │
│ ✅ Proxify.sol                                               │
│ ✅ ProxifyClientRegistry.sol                                 │
│ ✅ ProxifyController.sol                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: ABIs (@proxify/core/abis/)                         │
│ 🔄 laac.ts → proxify.ts                                      │
│ 🔄 laac_client.ts → proxify-client-registry.ts              │
│ 🔄 laac_controller.ts → proxify-controller.ts               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Entities & Adapters (@proxify/core/entity/)        │
│ 🔄 Update types for multi-tier support                       │
│ 🔄 Add RiskTier types                                        │
│ 🔄 Add BatchWithdrawal types                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Repositories (@proxify/core/repository/)           │
│ 🔄 Add tier-specific methods                                │
│ 🔄 Add batch withdrawal support                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Services (@proxify/contract-executor/services/)    │
│ 🔄 Expose new Proxify functionality                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: API Routers & Controllers                          │
│ 🔄 Add REST endpoints for new features                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 1: Update ABIs (Layer 2)

### Files to Create/Update:

#### 1.1 Create `packages/core/abis/proxify.ts`

**Source:** Compile `/apps/proxify-contract/contracts/Proxify.sol`
**Methods to Export:**

```typescript
// Deposit Functions
deposit(clientId, userId, token, amount, from)
depositFrom(clientId, userId, token, amount)

// Withdrawal Functions
batchWithdraw(executions[])
withdraw(clientId, userId, token, tierIds[], tierReductions[], to)

// Tier Index Management
updateTierIndex(token, tierId, newIndex)
batchUpdateTierIndices(token, tierIds[], newIndices[])
initializeTier(token, tierId)

// Admin Functions
setController(controller)
setClientRegistry(registry)
addSupportedToken(token)
removeSupportedToken(token)
updateStaked(token, amount, isStaking)
updateMaxBatchSize(newMax)
updateMaxGasFeePerUser(newMax)
updateMaxIndexGrowth(newMax)

// View Functions - Account Information
getAccount(clientId, userId, tierId, token) → Account
getUserActiveTiers(clientId, userId, token) → bytes32[]
getTotalValue(clientId, userId, token) → uint256
getTierValue(clientId, userId, tierId, token) → uint256
getAccruedYield(clientId, userId, token) → uint256
getUserAccountSummary(clientId, userId, token) → (totalBalance, totalValue, accruedYield, activeTierCount)

// View Functions - Tier Indices
getTierIndex(token, tierId) → uint256
getTierIndexWithTimestamp(token, tierId) → (index, updatedAt)
isTierInitialized(token, tierId) → bool

// View Functions - Global State
getTotalDeposits(token) → uint256
getTotalStaked(token) → uint256
isSupportedToken(token) → bool
getContractBalance(token) → uint256
getStakeableBalance(token) → uint256

// View Functions - Fee Vaults
getOperationFeeBalance(token) → uint256
getProtocolRevenueBalance(token) → uint256
getClientRevenueBalance(clientId, token) → uint256
getTotalClientRevenues(token) → uint256

// Fee Claiming Functions
claimOperationFee(token, to, amount)
claimProtocolRevenue(token, to, amount)
claimClientRevenue(clientId, token, to, amount)
```

#### 1.2 Create `packages/core/abis/proxify-client-registry.ts`

**Source:** Compile `/apps/proxify-contract/contracts/ProxifyClientRegistry.sol`
**Methods to Export:**

```typescript
// Client Management
registerClient(clientId, clientAddress, name, feeBps, serviceFeeBps, clientFeeBps)
activateClient(clientId)
deactivateClient(clientId)
updateClientAddress(clientId, newAddress)
updateClientFees(clientId, feeBps, serviceFeeBps, clientFeeBps)

// Risk Tier Management
setClientRiskTiers(clientId, riskTiers[])
addClientRiskTier(clientId, tier)
updateTierAllocation(clientId, tierId, newAllocationBps)
setTierActive(clientId, tierId, isActive)

// View Functions
isClientActive(clientId) → bool
isClientRegistered(clientId) → bool
getClientInfo(clientId) → ClientInfo
getClientAddress(clientId) → address
getClientRiskTiers(clientId) → RiskTier[]
getClientRiskTier(clientId, tierId) → RiskTier
hasTier(clientId, tierId) → bool
validateTierAllocations(tiers[]) → bool

// Access Control
DEFAULT_ADMIN_ROLE() → bytes32
ORACLE_ROLE() → bytes32
hasRole(role, account) → bool
getRoleAdmin(role) → bytes32
```

#### 1.3 Create `packages/core/abis/proxify-controller.ts`

**Source:** Compile `/apps/proxify-contract/contracts/ProxifyController.sol`
**Methods to Export:**

```typescript
// Oracle Functions
executeTransfer(token, protocol, amount, tierId, tierName)
confirmUnstake(token, amount)

// Tier Index Management
updateTierIndex(token, tierId, newIndex)
batchUpdateTierIndices(token, tierIds[], newIndices[])
initializeTier(token, tierId)
batchInitializeTiers(token, tierIds[])

// Batch Withdrawal
batchWithdraw(executions[]) → batchId

// Fee Management
claimOperationFee(token, to, amount)
claimProtocolRevenue(token, to, amount)
claimClientRevenue(clientId, token, to, amount)

// Protocol & Tier Management
assignProtocolToTier(tierId, protocol)
removeProtocolFromTier(tierId, protocol)
addWhitelistedProtocol(protocol)
removeWhitelistedProtocol(protocol)

// Token Management
addSupportedToken(token)
removeSupportedToken(token)

// Configurable Limits
updateMaxBatchSize(newMax)
updateMaxGasFeePerUser(newMax)
updateMaxIndexGrowth(newMax)

// Emergency Functions
emergencyPause()
unpause()

// View Functions
getTierProtocols(tierId) → address[]
isProtocolWhitelisted(protocol) → bool
isTokenSupported(token) → bool
isPaused() → bool
getOperationFeeBalance(token) → uint256
getProtocolRevenueBalance(token) → uint256
getClientRevenueBalance(clientId, token) → uint256
```

#### 1.4 Update `packages/core/abis/index.ts`

```typescript
export * from './proxify'
export * from './proxify-client-registry'
export * from './proxify-controller'
```

---

## 🎯 Phase 2: Update Entities & Types (Layer 3)

### Files to Create/Update:

#### 2.1 Create `packages/core/entity/risk-tier.entity.ts`

```typescript
import { z } from 'zod'
import type { Address } from 'viem'

// Risk Tier Schema
export const RiskTierSchema = z.object({
  tierId: z.string().regex(/^0x[a-fA-F0-9]{64}$/), // bytes32
  name: z.string().min(1).max(100),
  allocationBps: z.number().int().min(0).max(10000),
  isActive: z.boolean()
})

export type RiskTier = z.infer<typeof RiskTierSchema>

// Validate tiers sum to 100%
export const validateTierAllocations = (tiers: RiskTier[]): boolean => {
  const total = tiers.reduce((sum, tier) => sum + tier.allocationBps, 0)
  return total === 10000
}

// Tier allocation result
export interface TierAllocationResult {
  tierId: string
  amount: bigint
  percentage: number
}

// Calculate tier split for a deposit amount
export const calculateTierSplit = (
  amount: bigint,
  tiers: RiskTier[]
): TierAllocationResult[] => {
  return tiers
    .filter(tier => tier.isActive)
    .map(tier => ({
      tierId: tier.tierId,
      amount: (amount * BigInt(tier.allocationBps)) / 10000n,
      percentage: tier.allocationBps / 100
    }))
}
```

#### 2.2 Create `packages/core/entity/batch-withdrawal.entity.ts`

```typescript
import { z } from 'zod'
import type { Address } from 'viem'

// Withdrawal Execution Schema
export const WithdrawalExecutionSchema = z.object({
  clientId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  userId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  token: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tierIds: z.array(z.string().regex(/^0x[a-fA-F0-9]{64}$/)),
  tierReductions: z.array(z.string()), // bigint as string
  grossAmount: z.string(), // bigint as string
  serviceFee: z.string(),
  gasFeeShare: z.string(),
  netAmount: z.string()
})

export type WithdrawalExecution = z.infer<typeof WithdrawalExecutionSchema>

// Batch withdrawal result
export interface BatchWithdrawalResult {
  batchId: bigint
  executionCount: number
  totalServiceFees: bigint
  totalGasFees: bigint
  totalNetAmount: bigint
  transactionHash: Address
}
```

#### 2.3 Update `packages/core/entity/account.entity.ts`

**Add tier-specific account info:**

```typescript
// Add to existing file:

// Account per tier
export interface TierAccount {
  balance: bigint
  entryIndex: bigint
  depositedAt: bigint
}

// Account with tier breakdown
export interface TierAccountSummary {
  tierId: string
  tierName: string
  balance: bigint
  entryIndex: bigint
  currentIndex: bigint
  currentValue: bigint
  accruedYield: bigint
  depositedAt: bigint
}

// Multi-tier account summary
export interface MultiTierAccountSummary {
  clientId: string
  userId: string
  token: Address
  activeTiers: TierAccountSummary[]
  totalBalance: bigint
  totalValue: bigint
  totalYield: bigint
  activeTierCount: number
}
```

#### 2.4 Update `packages/core/entity/client-registry.entity.ts`

**Add clientFeeBps field and risk tier support:**

```typescript
// Update ClientInfo
export interface ClientInfo {
  name: string
  clientAddress: Address
  isActive: boolean
  registeredAt: bigint
  feeBps: number // deprecated
  serviceFeeBps: number
  clientFeeBps: number // NEW: client's share of service fee
}

// Update registration params
export interface ClientRegistrationParams {
  clientId: string
  clientAddress: Address
  name: string
  feeBps: number // deprecated, kept for compatibility
  serviceFeeBps: number
  clientFeeBps: number // NEW
}

// Add risk tier management params
export interface SetClientRiskTiersParams {
  clientId: string
  riskTiers: RiskTier[]
  senderAddress?: Address
}

export interface UpdateTierAllocationParams {
  clientId: string
  tierId: string
  newAllocationBps: number
  senderAddress?: Address
}

export interface SetTierActiveParams {
  clientId: string
  tierId: string
  isActive: boolean
  senderAddress?: Address
}
```

#### 2.5 Create `packages/core/entity/tier-index.entity.ts`

```typescript
import type { Address } from 'viem'

// Tier index info
export interface TierIndexInfo {
  token: Address
  tierId: string
  index: bigint
  updatedAt: bigint
}

// Batch tier index update
export interface BatchTierIndexUpdate {
  token: Address
  updates: Array<{
    tierId: string
    oldIndex: bigint
    newIndex: bigint
  }>
  timestamp: bigint
}
```

#### 2.6 Update `packages/core/entity/index.ts`

```typescript
export * from './risk-tier.entity'
export * from './batch-withdrawal.entity'
export * from './tier-index.entity'
// ... existing exports
```

---

## 🎯 Phase 3: Update Adapter Interfaces (Layer 3)

### Files to Update:

#### 3.1 Create `packages/core/entity/adapter/proxify.entity.ts`

**Define the adapter interface for Proxify contract:**

```typescript
import type { Address } from 'viem'
import type {
  TierAccount,
  TierAccountSummary,
  MultiTierAccountSummary,
  WithdrawalExecution,
  TierIndexInfo,
  RiskTier
} from '../'

export interface ProxifyVaultClientAdapter {
  // Read operations
  controller(): Promise<Address>
  clientRegistry(): Promise<Address>

  // Account operations (per tier)
  getAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<TierAccount>
  getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]>
  getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint>
  getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint>
  getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint>
  getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<{
    totalBalance: bigint
    totalValue: bigint
    accruedYield: bigint
    activeTierCount: number
  }>

  // Tier indices
  getTierIndex(token: Address, tierId: string): Promise<bigint>
  getTierIndexWithTimestamp(token: Address, tierId: string): Promise<TierIndexInfo>
  isTierInitialized(token: Address, tierId: string): Promise<boolean>

  // Global state
  getTotalDeposits(token: Address): Promise<bigint>
  getTotalStaked(token: Address): Promise<bigint>
  isSupportedToken(token: Address): Promise<boolean>
  getContractBalance(token: Address): Promise<bigint>
  getStakeableBalance(token: Address): Promise<bigint>

  // Fee vaults
  getOperationFeeBalance(token: Address): Promise<bigint>
  getProtocolRevenueBalance(token: Address): Promise<bigint>
  getClientRevenueBalance(clientId: string, token: Address): Promise<bigint>
  getTotalClientRevenues(token: Address): Promise<bigint>

  // Write operations
  write: {
    deposit(clientId: string, userId: string, token: Address, amount: bigint, from: Address, senderAddress?: Address): Promise<Address>
    depositFrom(clientId: string, userId: string, token: Address, amount: bigint, senderAddress?: Address): Promise<Address>
    batchWithdraw(executions: WithdrawalExecution[], senderAddress?: Address): Promise<Address>
    withdraw(clientId: string, userId: string, token: Address, tierIds: string[], tierReductions: bigint[], to: Address, senderAddress?: Address): Promise<Address>

    // Admin operations
    updateTierIndex(token: Address, tierId: string, newIndex: bigint, senderAddress?: Address): Promise<Address>
    batchUpdateTierIndices(token: Address, tierIds: string[], newIndices: bigint[], senderAddress?: Address): Promise<Address>
    initializeTier(token: Address, tierId: string, senderAddress?: Address): Promise<Address>

    claimOperationFee(token: Address, to: Address, amount: bigint, senderAddress?: Address): Promise<Address>
    claimProtocolRevenue(token: Address, to: Address, amount: bigint, senderAddress?: Address): Promise<Address>
    claimClientRevenue(clientId: string, token: Address, to: Address, amount: bigint, senderAddress?: Address): Promise<Address>
  }
}
```

#### 3.2 Update `packages/core/entity/adapter/client-registry.entity.ts`

**Add risk tier methods:**

```typescript
// Add to existing interface:

export interface ProxifyClientRegistryClientAdapter {
  // ... existing methods ...

  // Risk tier management (NEW)
  read: {
    // ... existing read methods ...
    getClientRiskTiers(clientId: string): Promise<RiskTier[]>
    getClientRiskTier(clientId: string, tierId: string): Promise<RiskTier>
    hasTier(clientId: string, tierId: string): Promise<boolean>
    validateTierAllocations(tiers: RiskTier[]): Promise<boolean>
  }

  write: {
    // Update registerClient signature
    registerClient(clientId: string, clientAddress: Address, name: string, feeBps: number, serviceFeeBps: number, clientFeeBps: number, senderAddress?: Address): Promise<Address>

    // Update updateClientFees signature
    updateClientFees(clientId: string, feeBps: number, serviceFeeBps: number, clientFeeBps: number, senderAddress?: Address): Promise<Address>

    // Risk tier management (NEW)
    setClientRiskTiers(clientId: string, riskTiers: RiskTier[], senderAddress?: Address): Promise<Address>
    addClientRiskTier(clientId: string, tier: RiskTier, senderAddress?: Address): Promise<Address>
    updateTierAllocation(clientId: string, tierId: string, newAllocationBps: number, senderAddress?: Address): Promise<Address>
    setTierActive(clientId: string, tierId: string, isActive: boolean, senderAddress?: Address): Promise<Address>

    // ... existing write methods ...
  }
}
```

#### 3.3 Create `packages/core/entity/adapter/proxify-controller.entity.ts`

```typescript
import type { Address } from 'viem'
import type { WithdrawalExecution } from '../'

export interface ProxifyControllerClientAdapter {
  read: {
    // Protocol & tier management
    getTierProtocols(tierId: string): Promise<Address[]>
    isProtocolWhitelisted(protocol: Address): Promise<boolean>
    isTokenSupported(token: Address): Promise<boolean>
    isPaused(): Promise<boolean>

    // Fee balances
    getOperationFeeBalance(token: Address): Promise<bigint>
    getProtocolRevenueBalance(token: Address): Promise<bigint>
    getClientRevenueBalance(clientId: string, token: Address): Promise<bigint>

    // Access control
    ORACLE_ROLE(): Promise<string>
    GUARDIAN_ROLE(): Promise<string>
    DEFAULT_ADMIN_ROLE(): Promise<string>
    hasRole(role: string, account: Address): Promise<boolean>
  }

  write: {
    // Oracle operations
    executeTransfer(token: Address, protocol: Address, amount: bigint, tierId: string, tierName: string, senderAddress?: Address): Promise<Address>
    confirmUnstake(token: Address, amount: bigint, senderAddress?: Address): Promise<Address>

    // Tier index management
    updateTierIndex(token: Address, tierId: string, newIndex: bigint, senderAddress?: Address): Promise<Address>
    batchUpdateTierIndices(token: Address, tierIds: string[], newIndices: bigint[], senderAddress?: Address): Promise<Address>
    initializeTier(token: Address, tierId: string, senderAddress?: Address): Promise<Address>
    batchInitializeTiers(token: Address, tierIds: string[], senderAddress?: Address): Promise<Address>

    // Batch withdrawal
    batchWithdraw(executions: WithdrawalExecution[], senderAddress?: Address): Promise<{ txHash: Address; batchId: bigint }>

    // Fee management
    claimOperationFee(token: Address, to: Address, amount: bigint, senderAddress?: Address): Promise<Address>
    claimProtocolRevenue(token: Address, to: Address, amount: bigint, senderAddress?: Address): Promise<Address>
    claimClientRevenue(clientId: string, token: Address, to: Address, amount: bigint, senderAddress?: Address): Promise<Address>

    // Protocol management
    assignProtocolToTier(tierId: string, protocol: Address, senderAddress?: Address): Promise<Address>
    removeProtocolFromTier(tierId: string, protocol: Address, senderAddress?: Address): Promise<Address>
    addWhitelistedProtocol(protocol: Address, senderAddress?: Address): Promise<Address>
    removeWhitelistedProtocol(protocol: Address, senderAddress?: Address): Promise<Address>

    // Token management
    addSupportedToken(token: Address, senderAddress?: Address): Promise<Address>
    removeSupportedToken(token: Address, senderAddress?: Address): Promise<Address>

    // Limit management
    updateMaxBatchSize(newMax: number, senderAddress?: Address): Promise<Address>
    updateMaxGasFeePerUser(newMax: bigint, senderAddress?: Address): Promise<Address>
    updateMaxIndexGrowth(newMax: number, senderAddress?: Address): Promise<Address>

    // Emergency
    emergencyPause(senderAddress?: Address): Promise<Address>
    unpause(senderAddress?: Address): Promise<Address>
  }
}
```

---

## 🎯 Phase 4: Update Repositories (Layer 4)

### Files to Update:

#### 4.1 Update `packages/core/repository/laac.repository.ts` → `proxify.repository.ts`

**Rename class and add tier-specific methods:**

```typescript
import type { Address } from 'viem'
import type {
  ProxifyVaultClientAdapter,
  TierAccount,
  TierAccountSummary,
  MultiTierAccountSummary,
  TierIndexInfo,
  WithdrawalExecution,
  SafeClientAdapter,
  SafeInfo,
} from '../entity'

export class ProxifyRepository {
  constructor(
    private readonly vaultClient: ProxifyVaultClientAdapter,
    private readonly safeClient?: SafeClientAdapter,
  ) {}

  // Contract addresses
  async getController(): Promise<Address> {
    return this.vaultClient.controller()
  }

  async getClientRegistry(): Promise<Address> {
    return this.vaultClient.clientRegistry()
  }

  // Token support
  async isSupportedToken(token: Address): Promise<boolean> {
    return this.vaultClient.isSupportedToken(token)
  }

  // Account operations - PER TIER
  async getTierAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<TierAccount> {
    return this.vaultClient.getAccount(clientId, userId, tierId, token)
  }

  async getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]> {
    return this.vaultClient.getUserActiveTiers(clientId, userId, token)
  }

  async getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint> {
    return this.vaultClient.getTotalValue(clientId, userId, token)
  }

  async getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint> {
    return this.vaultClient.getTierValue(clientId, userId, tierId, token)
  }

  async getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint> {
    return this.vaultClient.getAccruedYield(clientId, userId, token)
  }

  async getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<MultiTierAccountSummary> {
    const [summary, activeTierIds] = await Promise.all([
      this.vaultClient.getUserAccountSummary(clientId, userId, token),
      this.vaultClient.getUserActiveTiers(clientId, userId, token)
    ])

    // Get detailed info for each tier
    const tierDetails = await Promise.all(
      activeTierIds.map(async (tierId) => {
        const [account, tierValue, currentIndex] = await Promise.all([
          this.vaultClient.getAccount(clientId, userId, tierId, token),
          this.vaultClient.getTierValue(clientId, userId, tierId, token),
          this.vaultClient.getTierIndex(token, tierId)
        ])

        const accruedYield = tierValue > account.balance ? tierValue - account.balance : 0n

        return {
          tierId,
          tierName: '', // Fetch from ClientRegistry if needed
          balance: account.balance,
          entryIndex: account.entryIndex,
          currentIndex,
          currentValue: tierValue,
          accruedYield,
          depositedAt: account.depositedAt
        } as TierAccountSummary
      })
    )

    return {
      clientId,
      userId,
      token,
      activeTiers: tierDetails,
      totalBalance: summary.totalBalance,
      totalValue: summary.totalValue,
      totalYield: summary.accruedYield,
      activeTierCount: summary.activeTierCount
    }
  }

  // Tier index operations
  async getTierIndex(token: Address, tierId: string): Promise<bigint> {
    return this.vaultClient.getTierIndex(token, tierId)
  }

  async getTierIndexWithTimestamp(token: Address, tierId: string): Promise<TierIndexInfo> {
    return this.vaultClient.getTierIndexWithTimestamp(token, tierId)
  }

  async isTierInitialized(token: Address, tierId: string): Promise<boolean> {
    return this.vaultClient.isTierInitialized(token, tierId)
  }

  // Global state
  async getTotalDeposits(token: Address): Promise<bigint> {
    return this.vaultClient.getTotalDeposits(token)
  }

  async getTotalStaked(token: Address): Promise<bigint> {
    return this.vaultClient.getTotalStaked(token)
  }

  async getContractBalance(token: Address): Promise<bigint> {
    return this.vaultClient.getContractBalance(token)
  }

  async getStakeableBalance(token: Address): Promise<bigint> {
    return this.vaultClient.getStakeableBalance(token)
  }

  // Fee vaults
  async getOperationFeeBalance(token: Address): Promise<bigint> {
    return this.vaultClient.getOperationFeeBalance(token)
  }

  async getProtocolRevenueBalance(token: Address): Promise<bigint> {
    return this.vaultClient.getProtocolRevenueBalance(token)
  }

  async getClientRevenueBalance(clientId: string, token: Address): Promise<bigint> {
    return this.vaultClient.getClientRevenueBalance(clientId, token)
  }

  async getTotalClientRevenues(token: Address): Promise<bigint> {
    return this.vaultClient.getTotalClientRevenues(token)
  }

  // Safe operations
  async getSafeInfo(safeAddress: Address): Promise<SafeInfo> {
    const safeClient = this.requireSafeClient()
    return safeClient.getInfo(safeAddress)
  }

  private requireSafeClient(): SafeClientAdapter {
    if (!this.safeClient) {
      throw new Error("Safe client not configured")
    }
    return this.safeClient
  }
}
```

#### 4.2 Update `packages/core/repository/laac-client-registry.repository.ts` → `proxify-client-registry.repository.ts`

**Add risk tier management methods:**

```typescript
// Add to existing class:

export class ProxifyClientRegistryRepository<TChainId = string> {
  // ... existing methods ...

  // Update registerClient to include clientFeeBps
  async registerClient(chainId: TChainId, params: ClientRegistrationParams): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      await client.write.registerClient(
        params.clientId,
        params.clientAddress,
        params.name,
        params.feeBps,
        params.serviceFeeBps,
        params.clientFeeBps, // NEW
        params.senderAddress
      )
      return { success: true, message: "Client registered successfully" }
    } catch (error) {
      return this.toFailure("Failed to register client", error)
    }
  }

  // Update updateClientFees to include clientFeeBps
  async updateClientFees(
    chainId: TChainId,
    params: { clientId: string; feeBps: number; serviceFeeBps: number; clientFeeBps: number; senderAddress?: Address }
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      await client.write.updateClientFees(
        params.clientId,
        params.feeBps,
        params.serviceFeeBps,
        params.clientFeeBps, // NEW
        params.senderAddress
      )
      return { success: true, message: "Client fees updated successfully" }
    } catch (error) {
      return this.toFailure("Failed to update client fees", error)
    }
  }

  // NEW: Risk tier management methods
  async setClientRiskTiers(
    chainId: TChainId,
    params: SetClientRiskTiersParams
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      await client.write.setClientRiskTiers(params.clientId, params.riskTiers, params.senderAddress)
      return { success: true, message: `Risk tiers set successfully for client` }
    } catch (error) {
      return this.toFailure("Failed to set risk tiers", error)
    }
  }

  async addClientRiskTier(
    chainId: TChainId,
    params: { clientId: string; tier: RiskTier; senderAddress?: Address }
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      await client.write.addClientRiskTier(params.clientId, params.tier, params.senderAddress)
      return { success: true, message: "Risk tier added successfully" }
    } catch (error) {
      return this.toFailure("Failed to add risk tier", error)
    }
  }

  async updateTierAllocation(
    chainId: TChainId,
    params: UpdateTierAllocationParams
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      await client.write.updateTierAllocation(
        params.clientId,
        params.tierId,
        params.newAllocationBps,
        params.senderAddress
      )
      return { success: true, message: "Tier allocation updated successfully" }
    } catch (error) {
      return this.toFailure("Failed to update tier allocation", error)
    }
  }

  async setTierActive(
    chainId: TChainId,
    params: SetTierActiveParams
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      await client.write.setTierActive(params.clientId, params.tierId, params.isActive, params.senderAddress)
      return { success: true, message: `Tier ${params.isActive ? 'activated' : 'deactivated'} successfully` }
    } catch (error) {
      return this.toFailure(`Failed to ${params.isActive ? 'activate' : 'deactivate'} tier`, error)
    }
  }

  // NEW: Risk tier read methods
  async getClientRiskTiers(chainId: TChainId, clientId: string): Promise<RiskTier[]> {
    const client = this.getClient(chainId)
    return client.read.getClientRiskTiers(clientId)
  }

  async getClientRiskTier(chainId: TChainId, clientId: string, tierId: string): Promise<RiskTier> {
    const client = this.getClient(chainId)
    return client.read.getClientRiskTier(clientId, tierId)
  }

  async hasTier(chainId: TChainId, clientId: string, tierId: string): Promise<boolean> {
    const client = this.getClient(chainId)
    return client.read.hasTier(clientId, tierId)
  }

  async validateTierAllocations(chainId: TChainId, tiers: RiskTier[]): Promise<boolean> {
    const client = this.getClient(chainId)
    return client.read.validateTierAllocations(tiers)
  }
}
```

#### 4.3 Create `packages/core/repository/proxify-controller.repository.ts`

**New repository for controller operations:**

```typescript
import type { Address } from 'viem'
import type {
  ProxifyControllerClientAdapter,
  WithdrawalExecution,
  BatchWithdrawalResult,
  ClientRegistryRepositoryResult
} from '../entity'

export interface ProxifyControllerRepositoryDependencies<TChainId = string> {
  getControllerClient(chainId: TChainId): ProxifyControllerClientAdapter
}

export class ProxifyControllerRepository<TChainId = string> {
  constructor(private readonly deps: ProxifyControllerRepositoryDependencies<TChainId>) {}

  private getClient(chainId: TChainId): ProxifyControllerClientAdapter {
    return this.deps.getControllerClient(chainId)
  }

  // Oracle operations
  async executeTransfer(
    chainId: TChainId,
    token: Address,
    protocol: Address,
    amount: bigint,
    tierId: string,
    tierName: string,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.executeTransfer(token, protocol, amount, tierId, tierName, senderAddress)
      return { success: true, message: `Transferred ${amount} to ${protocol}`, data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to execute transfer", error)
    }
  }

  async confirmUnstake(
    chainId: TChainId,
    token: Address,
    amount: bigint,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.confirmUnstake(token, amount, senderAddress)
      return { success: true, message: `Unstake confirmed: ${amount}`, data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to confirm unstake", error)
    }
  }

  // Tier index management
  async updateTierIndex(
    chainId: TChainId,
    token: Address,
    tierId: string,
    newIndex: bigint,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.updateTierIndex(token, tierId, newIndex, senderAddress)
      return { success: true, message: "Tier index updated", data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to update tier index", error)
    }
  }

  async batchUpdateTierIndices(
    chainId: TChainId,
    token: Address,
    tierIds: string[],
    newIndices: bigint[],
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.batchUpdateTierIndices(token, tierIds, newIndices, senderAddress)
      return { success: true, message: `Updated ${tierIds.length} tier indices`, data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to batch update tier indices", error)
    }
  }

  async initializeTier(
    chainId: TChainId,
    token: Address,
    tierId: string,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.initializeTier(token, tierId, senderAddress)
      return { success: true, message: "Tier initialized", data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to initialize tier", error)
    }
  }

  async batchInitializeTiers(
    chainId: TChainId,
    token: Address,
    tierIds: string[],
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.batchInitializeTiers(token, tierIds, senderAddress)
      return { success: true, message: `Initialized ${tierIds.length} tiers`, data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to batch initialize tiers", error)
    }
  }

  // Batch withdrawal
  async batchWithdraw(
    chainId: TChainId,
    executions: WithdrawalExecution[],
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const { txHash, batchId } = await client.write.batchWithdraw(executions, senderAddress)

      // Calculate totals
      const totalNetAmount = executions.reduce((sum, exec) => sum + BigInt(exec.netAmount), 0n)
      const totalServiceFees = executions.reduce((sum, exec) => sum + BigInt(exec.serviceFee), 0n)
      const totalGasFees = executions.reduce((sum, exec) => sum + BigInt(exec.gasFeeShare), 0n)

      const result: BatchWithdrawalResult = {
        batchId,
        executionCount: executions.length,
        totalServiceFees,
        totalGasFees,
        totalNetAmount,
        transactionHash: txHash
      }

      return { success: true, message: `Batch withdrawal completed: ${executions.length} users`, data: result }
    } catch (error) {
      return this.toFailure("Failed to execute batch withdrawal", error)
    }
  }

  // Protocol management
  async assignProtocolToTier(
    chainId: TChainId,
    tierId: string,
    protocol: Address,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.assignProtocolToTier(tierId, protocol, senderAddress)
      return { success: true, message: "Protocol assigned to tier", data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to assign protocol to tier", error)
    }
  }

  async addWhitelistedProtocol(
    chainId: TChainId,
    protocol: Address,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.addWhitelistedProtocol(protocol, senderAddress)
      return { success: true, message: "Protocol whitelisted", data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to whitelist protocol", error)
    }
  }

  // Token management
  async addSupportedToken(
    chainId: TChainId,
    token: Address,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    const client = this.getClient(chainId)
    try {
      const txHash = await client.write.addSupportedToken(token, senderAddress)
      return { success: true, message: "Token added", data: { txHash } }
    } catch (error) {
      return this.toFailure("Failed to add token", error)
    }
  }

  // View operations
  async getTierProtocols(chainId: TChainId, tierId: string): Promise<Address[]> {
    const client = this.getClient(chainId)
    return client.read.getTierProtocols(tierId)
  }

  async isProtocolWhitelisted(chainId: TChainId, protocol: Address): Promise<boolean> {
    const client = this.getClient(chainId)
    return client.read.isProtocolWhitelisted(protocol)
  }

  async isTokenSupported(chainId: TChainId, token: Address): Promise<boolean> {
    const client = this.getClient(chainId)
    return client.read.isTokenSupported(token)
  }

  async isPaused(chainId: TChainId): Promise<boolean> {
    const client = this.getClient(chainId)
    return client.read.isPaused()
  }

  private toFailure(message: string, error: unknown): ClientRegistryRepositoryResult {
    return {
      success: false,
      message,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
```

#### 4.4 Update `packages/core/repository/index.ts`

```typescript
export * from './proxify.repository'
export * from './proxify-client-registry.repository'
export * from './proxify-controller.repository'
```

---

## 🎯 Phase 5: Update Services (Layer 5)

### Files to Update:

#### 5.1 Update `apps/contract-executor/src/services/laac.service.ts` → `proxify.service.ts`

```typescript
import type {
  ProxifyRepository,
  SafeClientAdapter,
  TierAccount,
  MultiTierAccountSummary,
  TierIndexInfo,
} from '@proxify/core'
import type { Address } from 'viem'

export interface ProxifyServiceDependencies {
  proxifyRepository: ProxifyRepository
  safeClient?: SafeClientAdapter
}

export class ProxifyService {
  constructor(private readonly deps: ProxifyServiceDependencies) {}

  // Contract addresses
  async getController(): Promise<Address> {
    return this.deps.proxifyRepository.getController()
  }

  async getClientRegistry(): Promise<Address> {
    return this.deps.proxifyRepository.getClientRegistry()
  }

  // Token support
  async isSupportedToken(token: Address): Promise<boolean> {
    return this.deps.proxifyRepository.isSupportedToken(token)
  }

  // Account operations - PER TIER
  async getTierAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<TierAccount> {
    return this.deps.proxifyRepository.getTierAccount(clientId, userId, tierId, token)
  }

  async getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]> {
    return this.deps.proxifyRepository.getUserActiveTiers(clientId, userId, token)
  }

  async getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getTotalValue(clientId, userId, token)
  }

  async getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getTierValue(clientId, userId, tierId, token)
  }

  async getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getAccruedYield(clientId, userId, token)
  }

  async getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<MultiTierAccountSummary> {
    return this.deps.proxifyRepository.getUserAccountSummary(clientId, userId, token)
  }

  // Tier index operations
  async getTierIndex(token: Address, tierId: string): Promise<bigint> {
    return this.deps.proxifyRepository.getTierIndex(token, tierId)
  }

  async getTierIndexWithTimestamp(token: Address, tierId: string): Promise<TierIndexInfo> {
    return this.deps.proxifyRepository.getTierIndexWithTimestamp(token, tierId)
  }

  async isTierInitialized(token: Address, tierId: string): Promise<boolean> {
    return this.deps.proxifyRepository.isTierInitialized(token, tierId)
  }

  // Global state
  async getTotalDeposits(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getTotalDeposits(token)
  }

  async getTotalStaked(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getTotalStaked(token)
  }

  async getContractBalance(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getContractBalance(token)
  }

  async getStakeableBalance(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getStakeableBalance(token)
  }

  // Fee vaults
  async getOperationFeeBalance(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getOperationFeeBalance(token)
  }

  async getProtocolRevenueBalance(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getProtocolRevenueBalance(token)
  }

  async getClientRevenueBalance(clientId: string, token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getClientRevenueBalance(clientId, token)
  }

  async getTotalClientRevenues(token: Address): Promise<bigint> {
    return this.deps.proxifyRepository.getTotalClientRevenues(token)
  }

  // Safe operations
  async getSafeInfo(safeAddress: Address) {
    return this.deps.proxifyRepository.getSafeInfo(safeAddress)
  }
}
```

#### 5.2 Update `apps/contract-executor/src/services/client-registry.service.ts`

**Add risk tier methods:**

```typescript
// Add to existing class:

// Risk tier management
async setClientRiskTiers(
  chainId: string,
  params: SetClientRiskTiersParams
): Promise<ClientRegistryRepositoryResult> {
  return this.deps.clientRegistryRepository.setClientRiskTiers(chainId, params)
}

async getClientRiskTiers(chainId: string, clientId: string): Promise<RiskTier[]> {
  return this.deps.clientRegistryRepository.getClientRiskTiers(chainId, clientId)
}

async getClientRiskTier(chainId: string, clientId: string, tierId: string): Promise<RiskTier> {
  return this.deps.clientRegistryRepository.getClientRiskTier(chainId, clientId, tierId)
}

async updateTierAllocation(
  chainId: string,
  params: UpdateTierAllocationParams
): Promise<ClientRegistryRepositoryResult> {
  return this.deps.clientRegistryRepository.updateTierAllocation(chainId, params)
}

async setTierActive(
  chainId: string,
  params: SetTierActiveParams
): Promise<ClientRegistryRepositoryResult> {
  return this.deps.clientRegistryRepository.setTierActive(chainId, params)
}

async validateTierAllocations(chainId: string, tiers: RiskTier[]): Promise<boolean> {
  return this.deps.clientRegistryRepository.validateTierAllocations(chainId, tiers)
}
```

#### 5.3 Create `apps/contract-executor/src/services/proxify-controller.service.ts`

**New service for controller operations:**

```typescript
import type {
  ProxifyControllerRepository,
  WithdrawalExecution,
  BatchWithdrawalResult,
  ClientRegistryRepositoryResult
} from '@proxify/core'
import type { Address } from 'viem'

export interface ProxifyControllerServiceDependencies {
  controllerRepository: ProxifyControllerRepository<string>
}

export class ProxifyControllerService {
  constructor(private readonly deps: ProxifyControllerServiceDependencies) {}

  // Oracle operations
  async executeTransfer(
    chainId: string,
    token: Address,
    protocol: Address,
    amount: bigint,
    tierId: string,
    tierName: string,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.executeTransfer(chainId, token, protocol, amount, tierId, tierName, senderAddress)
  }

  async confirmUnstake(
    chainId: string,
    token: Address,
    amount: bigint,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.confirmUnstake(chainId, token, amount, senderAddress)
  }

  // Tier index management
  async updateTierIndex(
    chainId: string,
    token: Address,
    tierId: string,
    newIndex: bigint,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.updateTierIndex(chainId, token, tierId, newIndex, senderAddress)
  }

  async batchUpdateTierIndices(
    chainId: string,
    token: Address,
    tierIds: string[],
    newIndices: bigint[],
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.batchUpdateTierIndices(chainId, token, tierIds, newIndices, senderAddress)
  }

  async initializeTier(
    chainId: string,
    token: Address,
    tierId: string,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.initializeTier(chainId, token, tierId, senderAddress)
  }

  async batchInitializeTiers(
    chainId: string,
    token: Address,
    tierIds: string[],
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.batchInitializeTiers(chainId, token, tierIds, senderAddress)
  }

  // Batch withdrawal
  async batchWithdraw(
    chainId: string,
    executions: WithdrawalExecution[],
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.batchWithdraw(chainId, executions, senderAddress)
  }

  // Protocol management
  async assignProtocolToTier(
    chainId: string,
    tierId: string,
    protocol: Address,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.assignProtocolToTier(chainId, tierId, protocol, senderAddress)
  }

  async addWhitelistedProtocol(
    chainId: string,
    protocol: Address,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.addWhitelistedProtocol(chainId, protocol, senderAddress)
  }

  // Token management
  async addSupportedToken(
    chainId: string,
    token: Address,
    senderAddress?: Address
  ): Promise<ClientRegistryRepositoryResult> {
    return this.deps.controllerRepository.addSupportedToken(chainId, token, senderAddress)
  }

  // View operations
  async getTierProtocols(chainId: string, tierId: string): Promise<Address[]> {
    return this.deps.controllerRepository.getTierProtocols(chainId, tierId)
  }

  async isProtocolWhitelisted(chainId: string, protocol: Address): Promise<boolean> {
    return this.deps.controllerRepository.isProtocolWhitelisted(chainId, protocol)
  }

  async isTokenSupported(chainId: string, token: Address): Promise<boolean> {
    return this.deps.controllerRepository.isTokenSupported(chainId, token)
  }

  async isPaused(chainId: string): Promise<boolean> {
    return this.deps.controllerRepository.isPaused(chainId)
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: ABIs
- [ ] Deploy Proxify contracts and generate ABIs
- [ ] Create `packages/core/abis/proxify.ts`
- [ ] Create `packages/core/abis/proxify-client-registry.ts`
- [ ] Create `packages/core/abis/proxify-controller.ts`
- [ ] Update `packages/core/abis/index.ts`

### Phase 2: Entities
- [ ] Create `packages/core/entity/risk-tier.entity.ts`
- [ ] Create `packages/core/entity/batch-withdrawal.entity.ts`
- [ ] Create `packages/core/entity/tier-index.entity.ts`
- [ ] Update `packages/core/entity/account.entity.ts`
- [ ] Update `packages/core/entity/client-registry.entity.ts`
- [ ] Update `packages/core/entity/index.ts`

### Phase 3: Adapters
- [ ] Create `packages/core/entity/adapter/proxify.entity.ts`
- [ ] Update `packages/core/entity/adapter/client-registry.entity.ts`
- [ ] Create `packages/core/entity/adapter/proxify-controller.entity.ts`
- [ ] Update `packages/core/entity/adapter/index.ts`

### Phase 4: Repositories
- [ ] Rename `laac.repository.ts` → `proxify.repository.ts` and update
- [ ] Rename `laac-client-registry.repository.ts` → `proxify-client-registry.repository.ts` and update
- [ ] Create `proxify-controller.repository.ts`
- [ ] Update `packages/core/repository/index.ts`

### Phase 5: Services
- [ ] Rename `laac.service.ts` → `proxify.service.ts` and update
- [ ] Update `client-registry.service.ts`
- [ ] Create `proxify-controller.service.ts`
- [ ] Update `apps/contract-executor/src/services/index.ts`

### Phase 6: Controllers & Routers
- [ ] Update `laac.controller.ts` → `proxify.controller.ts`
- [ ] Update `client-registry.controller.ts`
- [ ] Create `proxify-controller.controller.ts`
- [ ] Update routers accordingly
- [ ] Update `apps/contract-executor/src/app.ts`

### Phase 7: Testing
- [ ] Test client registration with risk tiers
- [ ] Test tier initialization
- [ ] Test multi-tier deposits
- [ ] Test tier index updates
- [ ] Test batch withdrawals
- [ ] Test protocol management
- [ ] Integration tests with deployed contracts

---

## 🚀 Next Steps

1. **Deploy Proxify contracts** to testnet
2. **Extract ABIs** from compiled contracts
3. **Start with Phase 1** (ABIs) and work through each phase sequentially
4. **Update DI container** (`apps/contract-executor/src/di/`) to inject new dependencies
5. **Add REST endpoints** for new functionality
6. **Document API changes** for frontend integration

---

**Ready to proceed with implementation!**
