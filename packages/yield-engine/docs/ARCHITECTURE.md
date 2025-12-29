# Quirk Yield Engine - Architecture Documentation

> Complete architecture guide for the Quirk yield optimization and execution engine

**Last Updated**: December 29, 2024
**Status**: ✅ Phase 1 Complete | ⚠️ Execution Layer Pending
**Version**: 2.0 (Write Methods Implemented)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Protocol Adapters](#protocol-adapters)
- [Execution Layer](#execution-layer)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Performance & Caching](#performance--caching)

---

## Overview

The Quirk Yield Engine is a **multi-protocol DeFi orchestration layer** that enables:

- ✅ Real-time yield opportunity analysis across AAVE, Compound, and Morpho
- ✅ Multi-protocol deposit/withdrawal execution
- ✅ Gas-aware optimization strategies
- ✅ Share-based vault accounting
- ✅ Cross-chain yield comparison

### Design Philosophy

1. **Protocol Abstraction**: Unified interface for all DeFi protocols
2. **Hybrid Execution**: Support both transaction preparation and direct execution
3. **Gas Awareness**: Factor gas costs into every optimization decision
4. **Type Safety**: Zod schemas and TypeScript for compile-time safety
5. **Backward Compatibility**: Read methods remain unchanged

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  React Components + TanStack Query + Type-Safe API Client  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP (ts-rest)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                     Backend API Layer                       │
│  DeFiExecutionService + DeFiProtocolService + Auth          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Import
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Yield Engine Package                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              IProtocolAdapter Interface              │  │
│  └──────┬──────────────┬──────────────┬─────────────────┘  │
│         │              │              │                     │
│    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐                │
│    │  AAVE   │   │Compound │   │ Morpho  │                │
│    │ Adapter │   │ Adapter │   │ Adapter │                │
│    └────┬────┘   └────┬────┘   └────┬────┘                │
│         │              │              │                     │
│         └──────────────┴──────────────┘                     │
│                        │                                    │
│              ┌─────────▼──────────┐                         │
│              │  BatchExecutor     │                         │
│              │  (Multi-Protocol)  │                         │
│              └─────────┬──────────┘                         │
│                        │                                    │
│              ┌─────────▼──────────┐                         │
│              │  YieldOptimizer    │                         │
│              │  (Strategies)      │                         │
│              └────────────────────┘                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Viem (RPC)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  Blockchain Layer                           │
│  Ethereum • Polygon • Base • Arbitrum                       │
│  AAVE V3 • Compound V3 • Morpho Blue                        │
└─────────────────────────────────────────────────────────────┘
```

### Package Structure

```
@quirk/yield-engine/
├── src/
│   ├── types/
│   │   └── common.types.ts          # Core interfaces (IProtocolAdapter, etc.)
│   │
│   ├── protocols/                   # Protocol-specific adapters
│   │   ├── aave/
│   │   │   ├── aave.adapter.ts     # AAVE V3 read + write methods
│   │   │   ├── aave.abi.ts         # Contract ABIs
│   │   │   ├── aave.constants.ts   # Addresses & config
│   │   │   ├── aave.types.ts       # Type definitions
│   │   │   └── aave.test.ts        # Unit tests
│   │   │
│   │   ├── compound/               # Compound V3 (Comet)
│   │   │   ├── compound.adapter.ts
│   │   │   ├── compound.abi.ts
│   │   │   ├── compound.constants.ts
│   │   │   ├── compound.types.ts
│   │   │   └── compound.test.ts
│   │   │
│   │   └── morpho/                 # Morpho Blue vaults
│   │       ├── morpho.adapter.ts
│   │       ├── morpho.abi.ts
│   │       ├── morpho.constants.ts
│   │       ├── morpho.types.ts
│   │       ├── morpho.graphql.ts
│   │       └── morpho.test.ts
│   │
│   ├── executor/                   # 🚧 NEW: Multi-protocol execution
│   │   ├── batch-executor.ts      # Execute across multiple protocols
│   │   ├── index.ts               # Exports
│   │   └── batch-executor.test.ts # Integration tests
│   │
│   ├── aggregator/
│   │   ├── yield-aggregator.ts    # Cross-protocol comparison
│   │   └── aggregator.types.ts
│   │
│   ├── optimizer/
│   │   ├── yield-optimizer.ts     # Single-chain optimization
│   │   ├── multi-chain-optimizer.ts
│   │   ├── optimizer.types.ts
│   │   └── strategies/            # Optimization strategies
│   │       ├── highest-yield.ts   # Maximize APY
│   │       ├── risk-adjusted.ts   # Balance yield + safety
│   │       ├── gas-aware.ts       # Net APY after gas
│   │       └── index.ts
│   │
│   └── utils/
│       ├── rpc.ts                 # RPC client management + gas estimation
│       ├── formatting.ts          # Number/currency formatting
│       └── cache.ts               # In-memory caching (5min TTL)
│
├── docs/
│   ├── AAVE_RESEARCH.md          # AAVE V3 integration guide
│   ├── COMPOUND_V3.md            # Compound integration guide
│   ├── MORPHO.md                 # Morpho integration guide
│   ├── ARCHITECTURE.md           # This file
│   ├── EXECUTION.md              # Deposit/withdrawal guide
│   ├── SHARE_ACCOUNTING.md       # Yield tracking model
│   └── MULTI_PROTOCOL_BATCHING.md # Batching guide
│
└── index.ts                      # Public exports
```

---

## Core Components

### 1. IProtocolAdapter Interface

**Location**: `src/types/common.types.ts`

The `IProtocolAdapter` interface defines the contract that all protocol adapters must implement.

```typescript
export interface IProtocolAdapter {
  // ==========================================
  // READ METHODS (Existing - Production Ready)
  // ==========================================

  /**
   * Get protocol identifier
   */
  getProtocolName(): Protocol // 'aave' | 'compound' | 'morpho'

  /**
   * Get current supply APY for a token
   * @returns APY as percentage string (e.g., "5.25" = 5.25%)
   */
  getSupplyAPY(token: string, chainId: number): Promise<string>

  /**
   * Get user's position in this protocol
   * @returns Position with amount, value, APY, or null if no position
   */
  getUserPosition(
    walletAddress: string,
    token: string,
    chainId: number
  ): Promise<ProtocolPosition | null>

  /**
   * Get detailed metrics for a token market
   * @returns Yield opportunity with TVL, liquidity, utilization
   */
  getMetrics(token: string, chainId: number): Promise<YieldOpportunity>

  /**
   * Get overall protocol health and metrics
   * @returns Protocol-wide statistics
   */
  getProtocolMetrics(chainId: number): Promise<ProtocolMetrics>

  /**
   * Check if protocol supports a token on a chain
   */
  supportsToken(token: string, chainId: number): Promise<boolean>

  // ==========================================
  // WRITE METHODS (🚧 In Development)
  // ==========================================

  /**
   * Prepare deposit transaction (returns unsigned transaction data)
   * This method does NOT execute - it prepares data for external execution
   *
   * @param token - Token symbol (e.g., "USDC")
   * @param chainId - Chain ID
   * @param amount - Amount in token's smallest unit (e.g., "1000000" for 1 USDC)
   * @param fromAddress - User wallet address
   * @returns Transaction data ready for signing
   *
   * @example
   * const tx = await adapter.prepareDeposit('USDC', 8453, '1000000000', wallet)
   * // Returns: { to, data, value, chainId }
   * // Send to Privy or external wallet for signing
   */
  prepareDeposit(
    token: string,
    chainId: number,
    amount: string,
    fromAddress: string
  ): Promise<TransactionRequest>

  /**
   * Prepare withdrawal transaction
   */
  prepareWithdrawal(
    token: string,
    chainId: number,
    amount: string,
    toAddress: string
  ): Promise<TransactionRequest>

  /**
   * Prepare ERC-20 approval transaction
   * Required before deposits for most protocols
   */
  prepareApproval(
    token: string,
    chainId: number,
    spender: string,
    amount: string,
    fromAddress: string
  ): Promise<TransactionRequest>

  /**
   * Execute deposit transaction (direct execution with wallet client)
   * This method DOES execute - use when you have a wallet signer
   *
   * @param token - Token symbol
   * @param chainId - Chain ID
   * @param amount - Amount to deposit
   * @param walletClient - Viem WalletClient with account
   * @returns Transaction receipt with gas tracking
   *
   * @example
   * const walletClient = createWalletClient({ account, transport })
   * const receipt = await adapter.executeDeposit('USDC', 8453, '1000000000', walletClient)
   * // Returns: { hash, blockNumber, gasUsed, status }
   */
  executeDeposit(
    token: string,
    chainId: number,
    amount: string,
    walletClient: WalletClient
  ): Promise<TransactionReceipt>

  /**
   * Execute withdrawal transaction
   */
  executeWithdrawal(
    token: string,
    chainId: number,
    amount: string,
    walletClient: WalletClient
  ): Promise<TransactionReceipt>

  /**
   * Estimate gas for deposit operation
   * @returns Gas estimate in units (not wei)
   */
  estimateDepositGas(
    token: string,
    chainId: number,
    amount: string,
    fromAddress: string
  ): Promise<bigint>

  /**
   * Estimate gas for withdrawal operation
   */
  estimateWithdrawalGas(
    token: string,
    chainId: number,
    amount: string,
    fromAddress: string
  ): Promise<bigint>
}
```

### 2. Type Definitions

```typescript
/**
 * Transaction request ready for signing
 * Can be sent to Privy wallet, MetaMask, or any wallet provider
 */
export interface TransactionRequest {
  to: string              // Contract address
  data: string            // Encoded function call
  value?: string          // ETH value (usually "0" for ERC-20)
  gasLimit?: string       // Optional gas limit
  chainId: number         // Target chain
}

/**
 * Transaction execution result
 * Returned after successful on-chain execution
 */
export interface TransactionReceipt {
  hash: string                    // Transaction hash
  blockNumber: bigint             // Block number
  status: 'success' | 'reverted'  // Transaction status
  gasUsed: bigint                 // Actual gas consumed
  effectiveGasPrice: bigint       // Price paid per gas unit
  from: string                    // Sender address
  to?: string                     // Recipient address
  timestamp: number               // Execution timestamp
}

/**
 * Approval check result
 * Determines if ERC-20 approval is needed before deposit
 */
export interface ApprovalStatus {
  isApproved: boolean      // Whether current allowance is sufficient
  currentAllowance: string // Current approved amount
  requiredAmount: string   // Required amount for operation
  needsApproval: boolean   // Convenience flag (inverse of isApproved)
  spenderAddress: string   // Protocol contract address
}

/**
 * Yield opportunity data
 */
export interface YieldOpportunity {
  protocol: Protocol
  token: string
  tokenAddress: string
  chainId: number
  supplyAPY: string        // "5.25" = 5.25%
  borrowAPY?: string
  tvl: string              // Total value locked (USD)
  liquidity: string        // Available liquidity (USD)
  utilization?: string     // "75.5" = 75.5%
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * User position in a protocol
 */
export interface ProtocolPosition {
  protocol: Protocol
  token: string
  tokenAddress: string
  chainId: number
  amount: string           // Amount in wei/smallest unit
  amountFormatted: string  // "1000.50" USDC
  valueUSD: string         // USD value
  apy: string             // Current APY
  earnedYield?: string    // Total yield earned
  depositedAt?: number    // Timestamp
}
```

---

## Protocol Adapters

### AAVE V3 Adapter

**Documentation**: See [AAVE_RESEARCH.md](./AAVE_RESEARCH.md)

**Key Characteristics**:
- Receipt tokens (aTokens) that auto-appreciate
- Ray format rates (1e27 precision)
- Pool contract for all operations
- Supports 4 chains

**Code Example** (Implementation in Progress):

```typescript
// src/protocols/aave/aave.adapter.ts

export class AaveAdapter implements IProtocolAdapter {
  getProtocolName(): Protocol {
    return 'aave'
  }

  // ===== READ METHODS (Production Ready) =====

  async getSupplyAPY(token: string, chainId: number): Promise<string> {
    const reserveData = await this.getReserveData(token, chainId)
    const apy = this.calculateSupplyAPY(reserveData.currentLiquidityRate)
    return apy
  }

  // ===== WRITE METHODS (In Development) =====

  /**
   * Prepare AAVE deposit transaction
   * Calls: Pool.supply(asset, amount, onBehalfOf, referralCode)
   */
  async prepareDeposit(
    token: string,
    chainId: number,
    amount: string,
    fromAddress: string
  ): Promise<TransactionRequest> {
    const tokenAddress = getTokenAddress(token, chainId)
    const poolAddress = getPoolAddress(chainId)

    // Encode Pool.supply() call
    const data = encodeFunctionData({
      abi: AAVE_POOL_ABI,
      functionName: 'supply',
      args: [
        tokenAddress as `0x${string}`,
        BigInt(amount),
        fromAddress as `0x${string}`,
        0 // referralCode
      ]
    })

    return {
      to: poolAddress,
      data,
      value: '0',
      chainId,
    }
  }

  /**
   * Execute deposit with automatic approval handling
   */
  async executeDeposit(
    token: string,
    chainId: number,
    amount: string,
    walletClient: WalletClient
  ): Promise<TransactionReceipt> {
    const poolAddress = getPoolAddress(chainId)

    // 1. Check if approval is needed
    const approvalStatus = await this.checkApproval(
      token,
      chainId,
      walletClient.account.address,
      poolAddress,
      amount
    )

    // 2. Execute approval if needed
    if (approvalStatus.needsApproval) {
      const approvalTx = await this.prepareApproval(
        token,
        chainId,
        poolAddress,
        amount,
        walletClient.account.address
      )

      const approvalHash = await walletClient.sendTransaction(approvalTx)
      await this.waitForTransaction(chainId, approvalHash)
    }

    // 3. Execute deposit
    const depositTx = await this.prepareDeposit(
      token,
      chainId,
      amount,
      walletClient.account.address
    )

    const hash = await walletClient.sendTransaction(depositTx)

    // 4. Wait for confirmation
    const client = getPublicClient(chainId)
    const receipt = await client.waitForTransactionReceipt({ hash })

    // 5. Verify deposit succeeded
    await this.verifyDeposit(token, chainId, walletClient.account.address, amount)

    return {
      hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 'success' ? 'success' : 'reverted',
      gasUsed: receipt.gasUsed,
      effectiveGasPrice: receipt.effectiveGasPrice,
      from: receipt.from,
      to: receipt.to,
      timestamp: Date.now(),
    }
  }

  /**
   * Check current ERC-20 approval status
   */
  private async checkApproval(
    token: string,
    chainId: number,
    owner: string,
    spender: string,
    requiredAmount: string
  ): Promise<ApprovalStatus> {
    const tokenAddress = getTokenAddress(token, chainId)
    const client = getPublicClient(chainId)

    const allowance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner as `0x${string}`, spender as `0x${string}`]
    })

    const required = BigInt(requiredAmount)
    const needsApproval = allowance < required

    return {
      isApproved: !needsApproval,
      currentAllowance: allowance.toString(),
      requiredAmount,
      needsApproval,
      spenderAddress: spender,
    }
  }

  /**
   * Verify deposit succeeded by checking aToken balance
   */
  private async verifyDeposit(
    token: string,
    chainId: number,
    userAddress: string,
    expectedIncrease: string
  ): Promise<void> {
    const reserveData = await this.getReserveData(token, chainId)
    const client = getPublicClient(chainId)

    const balance = await client.readContract({
      address: reserveData.aTokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`]
    })

    if (balance === 0n) {
      throw new ProtocolError('aave', 'Deposit verification failed: aToken balance is zero')
    }
  }

  /**
   * Estimate gas for deposit
   */
  async estimateDepositGas(
    token: string,
    chainId: number,
    amount: string,
    fromAddress: string
  ): Promise<bigint> {
    const tx = await this.prepareDeposit(token, chainId, amount, fromAddress)
    const client = getPublicClient(chainId)

    return await client.estimateGas({
      to: tx.to as `0x${string}`,
      data: tx.data as `0x${string}`,
      account: fromAddress as `0x${string}`,
    })
  }
}
```

### Compound V3 Adapter

**Documentation**: See [COMPOUND_V3.md](./COMPOUND_V3.md)

**Key Characteristics**:
- Rebasing balances (no receipt token)
- 1e18 precision (NOT Ray)
- Single-asset markets (one Comet per token)
- Supports 4 chains

**Implementation Pattern**: Similar to AAVE but calls `Comet.supply()` and `Comet.withdraw()`

### Morpho Adapter

**Documentation**: See [MORPHO.md](./MORPHO.md)

**Key Characteristics**:
- ERC-4626 vault tokens
- GraphQL API for APY data
- V1 and V2 vault support
- MetaMorpho vault layer

**Implementation Pattern**: Uses `MetaMorphoVault.deposit()` and `MetaMorphoVault.redeem()`

---

## Execution Layer

### BatchExecutor

**Purpose**: Execute deposits/withdrawals across multiple protocols in a single operation

**Location**: `src/executor/batch-executor.ts` (In Development)

```typescript
/**
 * Multi-Protocol Batch Executor
 * Splits a deposit across multiple protocols and executes in sequence or parallel
 */
export class BatchExecutor {
  private adapters: Map<Protocol, IProtocolAdapter>

  constructor(chainId: number) {
    this.adapters = new Map([
      ['aave', new AaveAdapter(chainId)],
      ['compound', new CompoundAdapter(chainId)],
      ['morpho', new MorphoAdapter(chainId)],
    ])
  }

  /**
   * Execute deposits across multiple protocols
   *
   * @example
   * const executor = new BatchExecutor(8453)
   *
   * const result = await executor.executeBatchDeposit({
   *   token: 'USDC',
   *   chainId: 8453,
   *   totalAmount: '1000000000', // 1000 USDC
   *   allocations: [
   *     { protocol: 'aave', percentage: 60, amount: '600000000' },
   *     { protocol: 'compound', percentage: 40, amount: '400000000' },
   *   ],
   *   walletClient,
   *   executionMode: 'sequential',
   * })
   */
  async executeBatchDeposit(
    request: BatchDepositRequest
  ): Promise<BatchExecutionResult> {
    const results: ProtocolExecutionResult[] = []
    let totalDeployed = 0n
    let totalGasUsed = 0n

    // Validate allocations sum to 100%
    const totalPercentage = request.allocations.reduce(
      (sum, a) => sum + a.percentage,
      0
    )

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(`Allocations must sum to 100%, got ${totalPercentage}%`)
    }

    // Execute based on mode
    if (request.executionMode === 'sequential') {
      // Sequential: Execute one by one (safer, easier to debug)
      for (const allocation of request.allocations) {
        const result = await this.executeProtocolDeposit(
          allocation,
          request.token,
          request.chainId,
          request.walletClient
        )

        results.push(result)

        if (result.success) {
          totalDeployed += BigInt(result.amount!)
          totalGasUsed += result.gasUsed!
        }
      }
    } else {
      // Parallel: Execute all at once (faster, but harder to debug)
      const promises = request.allocations.map(allocation =>
        this.executeProtocolDeposit(
          allocation,
          request.token,
          request.chainId,
          request.walletClient
        )
      )

      const settled = await Promise.allSettled(promises)

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
          if (result.value.success) {
            totalDeployed += BigInt(result.value.amount!)
            totalGasUsed += result.value.gasUsed!
          }
        } else {
          results.push({
            protocol: 'unknown' as Protocol,
            success: false,
            error: result.reason?.message || 'Unknown error'
          })
        }
      }
    }

    const successCount = results.filter(r => r.success).length
    const partialFailure = successCount > 0 && successCount < results.length

    return {
      success: successCount === results.length,
      totalDeployed: totalDeployed.toString(),
      totalGasUsed,
      results,
      partialFailure,
      timestamp: Date.now(),
    }
  }

  /**
   * Execute deposit for a single protocol
   */
  private async executeProtocolDeposit(
    allocation: ProtocolAllocation,
    token: string,
    chainId: number,
    walletClient: WalletClient
  ): Promise<ProtocolExecutionResult> {
    const adapter = this.adapters.get(allocation.protocol)

    if (!adapter) {
      return {
        protocol: allocation.protocol,
        success: false,
        error: `Adapter not found for ${allocation.protocol}`,
      }
    }

    try {
      const receipt = await adapter.executeDeposit(
        token,
        chainId,
        allocation.amount,
        walletClient
      )

      return {
        protocol: allocation.protocol,
        success: true,
        txHash: receipt.hash,
        amount: allocation.amount,
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
      }
    } catch (error) {
      return {
        protocol: allocation.protocol,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Estimate total gas for batch operation
   */
  async estimateBatchGas(
    request: Omit<BatchDepositRequest, 'walletClient'>
  ): Promise<{ totalGas: bigint; perProtocol: Map<Protocol, bigint> }> {
    const estimates = new Map<Protocol, bigint>()
    let totalGas = 0n

    for (const allocation of request.allocations) {
      const adapter = this.adapters.get(allocation.protocol)

      if (adapter) {
        const gas = await adapter.estimateDepositGas(
          request.token,
          request.chainId,
          allocation.amount,
          '0x0000000000000000000000000000000000000000' // placeholder
        )

        estimates.set(allocation.protocol, gas)
        totalGas += gas
      }
    }

    return { totalGas, perProtocol: estimates }
  }
}
```

**Types**:

```typescript
export interface ProtocolAllocation {
  protocol: 'aave' | 'compound' | 'morpho'
  percentage: number  // 0-100
  amount: string      // In token's smallest unit
}

export interface BatchDepositRequest {
  token: string
  chainId: number
  totalAmount: string
  allocations: ProtocolAllocation[]
  walletClient: WalletClient
  executionMode: 'sequential' | 'parallel'
}

export interface BatchExecutionResult {
  success: boolean
  totalDeployed: string
  totalGasUsed: bigint
  results: ProtocolExecutionResult[]
  partialFailure: boolean  // Some succeeded, some failed
  timestamp: number
}

export interface ProtocolExecutionResult {
  protocol: Protocol
  success: boolean
  txHash?: string
  amount?: string
  error?: string
  gasUsed?: bigint
  blockNumber?: bigint
}
```

---

## Data Flow

### Deposit Execution Flow

```
┌──────────────┐
│   Frontend   │
│     User     │
└──────┬───────┘
       │ 1. Initiates deposit: $1000 USDC
       │    Allocations: 60% AAVE, 40% Compound
       │
       ▼
┌──────────────────┐
│  React Hook      │
│ useDepositExec() │
└──────┬───────────┘
       │ 2. POST /defi/execute/deposit
       │
       ▼
┌─────────────────────────┐
│  Backend API            │
│  DeFiExecutionService   │
└──────┬──────────────────┘
       │ 3. Validate vault & get Privy wallet
       │
       ▼
┌─────────────────────────┐
│  Yield Engine           │
│  BatchExecutor          │
└──────┬──────────────────┘
       │ 4. Calculate amounts:
       │    AAVE: $600, Compound: $400
       │
       ├──────────┬─────────────┐
       │          │             │
       ▼          ▼             ▼
  ┌────────┐ ┌──────────┐ ┌─────────┐
  │  AAVE  │ │ Compound │ │ Morpho  │
  │Adapter │ │ Adapter  │ │ Adapter │
  └───┬────┘ └────┬─────┘ └────┬────┘
      │           │            │
      │ 5. Check approval      │
      │ 6. Execute approval    │
      │ 7. Execute deposit     │
      │ 8. Verify balance      │
      │           │            │
      ▼           ▼            ▼
  ┌──────────────────────────────┐
  │      Blockchain              │
  │  AAVE Pool • Comet • Morpho  │
  └────────────┬─────────────────┘
               │ 9. Tx confirmed
               │
               ▼
  ┌──────────────────────────────┐
  │  Database Update             │
  ├──────────────────────────────┤
  │ client_vaults:               │
  │   total_staked += 1000       │
  │ defi_allocations:            │
  │   AAVE: +600                 │
  │   Compound: +400             │
  │ defi_transactions:           │
  │   2 rows (tx hashes + gas)   │
  └────────────┬─────────────────┘
               │ 10. Return result
               │
               ▼
  ┌──────────────────────────────┐
  │  Frontend Update             │
  │  - Show success              │
  │  - Display tx hashes         │
  │  - Update vault balance      │
  └──────────────────────────────┘
```

---

## Security Model

### Private Key Management

**Privy MPC Wallet Integration**:
- All transaction signing via Privy's infrastructure
- Application code NEVER handles private keys
- Use `ViemClientManager.getWalletClient()` for signing
- Privy Controls API for offline/server-side transactions

```typescript
// Backend: Get wallet client for signing
import { ViemClientManager } from '@quirk/core/blockchain/viem-client'

// Initialize with Privy-managed key
ViemClientManager.init(privyManagedPrivateKey)

// Get wallet client for specific chain
const walletClient = ViemClientManager.getWalletClient(8453) // Base

// Execute transaction
const hash = await walletClient.sendTransaction(tx)
```

### Transaction Validation

**Before Execution**:
```typescript
// 1. Validate allocation percentages
const total = allocations.reduce((sum, a) => sum + a.percentage, 0)
if (Math.abs(total - 100) > 0.01) {
  throw new Error('Allocations must sum to 100%')
}

// 2. Check user balance
const balance = await token.balanceOf(userAddress)
if (balance < amount) {
  throw new Error('Insufficient balance')
}

// 3. Check gas price
const gasPrice = await client.getGasPrice()
if (gasPrice > MAX_GAS_PRICE) {
  throw new Error('Gas price too high, retry later')
}
```

**After Execution**:
```typescript
// 1. Verify transaction succeeded
if (receipt.status === 'reverted') {
  throw new Error('Transaction reverted')
}

// 2. Verify balance increased
const newBalance = await getProtocolBalance(user)
const expectedBalance = oldBalance + depositAmount

if (newBalance < expectedBalance) {
  throw new Error('Balance verification failed')
}
```

### Gas Safety Limits

```typescript
const GAS_LIMITS = {
  MAX_GAS_PRICE_GWEI: 100,        // Reject if gas > 100 gwei
  MAX_TOTAL_COST_USD: 50,         // Reject if cost > $50
  GAS_BUFFER_PERCENTAGE: 20,      // Add 20% to estimates
}

// Apply limits
const gasPriceGwei = Number(gasPrice) / 1e9
if (gasPriceGwei > GAS_LIMITS.MAX_GAS_PRICE_GWEI) {
  throw new Error(`Gas price too high: ${gasPriceGwei} gwei`)
}
```

---

## Performance & Caching

### Caching Strategy

**Cache Implementation**: In-memory with TTL

```typescript
// src/utils/cache.ts

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    })
  }
}

export const globalCache = new MemoryCache()
```

**Cache Usage**:

```typescript
// Cache key generation
const cacheKey = generateCacheKey('aave', 'supplyAPY', 'USDC', 8453)
// Result: "aave:supplyAPY:USDC:8453"

// Check cache
const cached = globalCache.get<string>(cacheKey)
if (cached) return cached

// Fetch from blockchain
const apy = await fetchAPY(...)

// Cache for 5 minutes
globalCache.set(cacheKey, apy, 5 * 60 * 1000)
```

**Cache TTLs**:
- APY data: 5 minutes
- Protocol metrics: 5 minutes
- User positions: 1 minute (more volatile)
- Gas prices: 30 seconds

### RPC Client Management

**Singleton Pattern**: Reuse clients across requests

```typescript
// src/utils/rpc.ts

const clientCache = new Map<number, PublicClient>()

export function getPublicClient(chainId: number): PublicClient {
  let client = clientCache.get(chainId)

  if (!client) {
    const chainConfig = getChainConfig(chainId)

    client = createPublicClient({
      chain: chainConfig,
      transport: http(getRpcUrl(chainId)),
    })

    clientCache.set(chainId, client)
  }

  return client
}
```

### Retry Logic

**Exponential Backoff**: Handle transient RPC errors

```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on user errors
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
```

---

## Summary

### Production-Ready Features

✅ Protocol adapters (AAVE, Compound, Morpho)
✅ Read methods (APY, positions, metrics)
✅ Multi-chain support (4 chains)
✅ Optimization strategies (3 strategies)
✅ Caching layer
✅ Type safety with Zod
✅ Comprehensive documentation

### In Development

🚧 Write methods (deposit, withdrawal)
🚧 Multi-protocol batch executor
🚧 Transaction preparation & execution
🚧 Gas estimation & tracking
🚧 Backend integration layer

### Next Steps

1. Implement write methods in all adapters
2. Build and test BatchExecutor
3. Create backend execution service
4. Add frontend components
5. Deploy to testnet
6. Security audit
7. Production rollout

---

**For detailed implementation guides, see**:
- [EXECUTION.md](./EXECUTION.md) - How to execute deposits/withdrawals
- [SHARE_ACCOUNTING.md](./SHARE_ACCOUNTING.md) - Yield tracking model
- [MULTI_PROTOCOL_BATCHING.md](./MULTI_PROTOCOL_BATCHING.md) - Batch execution patterns
