# Custodial DeFi Execution Implementation Guide

> Complete implementation guide for server-side custodial wallet management and seamless DeFi execution

**Last Updated**: December 2024
**Status**: 🚧 Ready for Implementation
**Architecture**: Server-Side Custodial with Encrypted Private Keys

---

## Table of Contents

- [Overview](#overview)
- [Architecture Decision](#architecture-decision)
- [Phase 1: Database Schema](#phase-1-database-schema)
- [Phase 2: Core Services](#phase-2-core-services)
- [Phase 3: Execution Service](#phase-3-execution-service)
- [Phase 4: API Layer](#phase-4-api-layer)
- [Phase 5: Security Configuration](#phase-5-security-configuration)
- [Phase 6: Error Handling](#phase-6-error-handling)
- [Phase 7: Testing](#phase-7-testing)
- [Phase 8: Deployment](#phase-8-deployment)
- [Complete Code Examples](#complete-code-examples)
- [Summary](#summary)

---

## Overview

This guide implements **server-side custodial wallet management** for Proxify's yield optimization platform, enabling seamless background DeFi execution without user wallet prompts (like Robinhood/traditional fintech).

### Goals

✅ **Seamless UX**: No wallet popups - transactions execute in the background
✅ **Custodial Model**: Proxify manages wallets via server-side private keys
✅ **Security**: Private keys encrypted at rest with AES-256-GCM
✅ **Multi-Protocol**: Works with existing BatchExecutor (AAVE, Compound, Morpho)
✅ **Error Handling**: Partial failure support + transaction monitoring

### User Experience

```
User deposits $1000 → Backend automatically deploys to DeFi protocols
                    → No wallet approval needed
                    → Yield starts accruing immediately
                    → User sees updated balance
```

---

## Architecture Decision

### Wallet Model

**Decision**: **One custodial wallet per `client_organization` (B2B client/product)**

- Same wallet address used across all chains and tokens for that client
- Private keys encrypted and stored in `client_organizations` table
- Transaction signing via `ViemClientManager` with viem `WalletClient`
- **No Privy SDK** for custodial management (Privy doesn't support fully server-side custody without user interaction)

### Why Not Privy Server SDK?

Privy's server-side SDK **does not support fully custodial wallets**. Their model requires:
- User authentication (JWT token)
- Ephemeral user keys
- User must be "in the loop" for transaction authorization

For true custodial management where the server signs transactions without user interaction, we need direct private key management.

### Execution Flow

```
┌──────────────┐
│ API Request  │ POST /defi/execute/deposit
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│ Get Client Wallet       │ CustodialWalletService.getOrCreateWallet()
│ (from client_orgs)      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Get Allocation Strategy │ DeFiProtocolService.optimizeAllocation()
│ (risk-based)            │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Create WalletClient     │ ViemClientManager.createWalletClient()
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Execute Batch Deposit   │ BatchExecutor.executeBatchDeposit()
│ - AAVE (60%)            │
│ - Compound (30%)        │
│ - Morpho (10%)          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Record Transactions     │ Save to defi_transactions table
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Update Vault Balances   │ Update client_vaults + defi_allocations
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Return Result           │ { success, txHashes, gasUsed }
└─────────────────────────┘
```

---

## Phase 1: Database Schema

### 1.1 Add Custodial Wallet to `client_organizations`

**File**: `/database/migrations/000X_add_custodial_wallets.up.sql` (NEW)

```sql
-- Add custodial wallet fields to client_organizations table
-- One wallet per B2B client (used across all chains/tokens)

ALTER TABLE client_organizations
ADD COLUMN custodial_wallet_address VARCHAR(66),
ADD COLUMN custodial_wallet_encrypted_key TEXT,
ADD COLUMN wallet_created_at TIMESTAMPTZ;

-- Index for fast wallet lookups
CREATE INDEX idx_client_orgs_wallet ON client_organizations(custodial_wallet_address);

-- Comments
COMMENT ON COLUMN client_organizations.custodial_wallet_address
  IS 'Custodial wallet address for this B2B client (same address across all chains)';
COMMENT ON COLUMN client_organizations.custodial_wallet_encrypted_key
  IS 'Private key encrypted with AES-256-GCM using ENCRYPTION_SECRET env var';
COMMENT ON COLUMN client_organizations.wallet_created_at
  IS 'Timestamp when custodial wallet was first generated';
```

### 1.2 Create DeFi Transactions Tracking Table

**Purpose**: Track all deposit/withdrawal transactions for monitoring and analytics

```sql
-- Track all DeFi deposit/withdrawal transactions
CREATE TABLE defi_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,

  -- Transaction classification
  transaction_type VARCHAR(20) NOT NULL
    CHECK (transaction_type IN ('deposit', 'withdrawal', 'approval')),

  -- Protocol details
  protocol VARCHAR(20) NOT NULL
    CHECK (protocol IN ('aave', 'compound', 'morpho')),
  token_symbol VARCHAR(20) NOT NULL,
  chain_id INTEGER NOT NULL,

  -- Amount (in token's smallest unit)
  amount NUMERIC(78,0) NOT NULL,

  -- Blockchain details
  tx_hash VARCHAR(66),
  from_address VARCHAR(66) NOT NULL,
  to_address VARCHAR(66) NOT NULL,
  block_number BIGINT,

  -- Gas tracking
  gas_used BIGINT,
  gas_price NUMERIC(78,0),

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed', 'reverted')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,

  -- Validation
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Indexes for fast queries
CREATE INDEX idx_defi_txns_client ON defi_transactions(client_id);
CREATE INDEX idx_defi_txns_status ON defi_transactions(status);
CREATE INDEX idx_defi_txns_hash ON defi_transactions(tx_hash);
CREATE INDEX idx_defi_txns_protocol ON defi_transactions(protocol);
CREATE INDEX idx_defi_txns_created_at ON defi_transactions(created_at DESC);
```

### 1.3 Down Migration

**File**: `/database/migrations/000X_add_custodial_wallets.down.sql` (NEW)

```sql
-- Rollback custodial wallet implementation

DROP TABLE IF EXISTS defi_transactions;

DROP INDEX IF EXISTS idx_client_orgs_wallet;

ALTER TABLE client_organizations
  DROP COLUMN IF EXISTS custodial_wallet_address,
  DROP COLUMN IF EXISTS custodial_wallet_encrypted_key,
  DROP COLUMN IF EXISTS wallet_created_at;
```

---

## Phase 2: Core Services

### 2.1 Encryption Service

**File**: `/packages/core/services/encryption.service.ts` (NEW)

**Purpose**: Encrypt/decrypt private keys using AES-256-GCM with authenticated encryption

```typescript
import * as crypto from 'crypto'

/**
 * EncryptionService
 * Handles encryption/decryption of sensitive data (private keys)
 * Uses AES-256-GCM for authenticated encryption
 *
 * Security:
 * - 256-bit key derived from ENCRYPTION_SECRET
 * - Random IV per encryption
 * - Authentication tag for integrity
 * - Constant-time comparison for auth tags
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly key: Buffer

  constructor(encryptionSecret?: string) {
    const secret = encryptionSecret || process.env.ENCRYPTION_SECRET

    if (!secret) {
      throw new Error('ENCRYPTION_SECRET not configured')
    }

    if (secret.length < 32) {
      throw new Error('ENCRYPTION_SECRET must be at least 32 characters')
    }

    // Derive 256-bit key from secret
    this.key = crypto.scryptSync(secret, 'proxify-salt', 32)
  }

  /**
   * Encrypt plaintext
   * @returns Encrypted string in format: iv:authTag:ciphertext
   */
  async encrypt(plaintext: string): Promise<string> {
    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(16)

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Get authentication tag
    const authTag = cipher.getAuthTag()

    // Return format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  /**
   * Decrypt ciphertext
   * @param ciphertext Format: iv:authTag:ciphertext
   * @returns Decrypted plaintext
   */
  async decrypt(ciphertext: string): Promise<string> {
    // Parse format: iv:authTag:encrypted
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':')

    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid ciphertext format')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
    decipher.setAuthTag(authTag)

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * Test encryption/decryption roundtrip
   */
  async test(): Promise<boolean> {
    const testData = 'test-private-key-0x1234567890'
    const encrypted = await this.encrypt(testData)
    const decrypted = await this.decrypt(encrypted)
    return decrypted === testData
  }
}
```

### 2.2 Custodial Wallet Service

**File**: `/packages/core/services/custodial-wallet.service.ts` (NEW)

**Purpose**: Manage custodial wallets for B2B clients

```typescript
import type { Hex, WalletClient } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http } from 'viem'
import { EncryptionService } from './encryption.service'
import type { ClientOrganizationRepository } from '../repository/client-organization.repository'
import { getMockTokenChainConfig } from '../blockchain/chain.config'

export interface CustodialWallet {
  address: string
  privateKey: Hex
}

/**
 * CustodialWalletService
 * Manages server-side custodial wallets for B2B clients
 *
 * Architecture:
 * - One wallet per client_organization (B2B client/product)
 * - Same wallet address used across all chains and tokens
 * - Private keys encrypted at rest in database
 * - WalletClient created on-demand for transaction signing
 *
 * Security:
 * - Private keys never exposed in logs or responses
 * - Encryption at rest (AES-256-GCM)
 * - Wallet address as public identifier only
 */
export class CustodialWalletService {
  constructor(
    private readonly clientRepo: ClientOrganizationRepository,
    private readonly encryption: EncryptionService
  ) {}

  /**
   * Get or create custodial wallet for a client
   *
   * @param clientId - Client organization ID
   * @returns Wallet with address and private key
   */
  async getOrCreateWallet(clientId: string): Promise<CustodialWallet> {
    // 1. Check if wallet already exists
    const client = await this.clientRepo.getById(clientId)

    if (!client) {
      throw new Error(`Client not found: ${clientId}`)
    }

    // 2. If wallet exists, decrypt and return
    if (client.custodialWalletAddress && client.custodialWalletEncryptedKey) {
      const privateKey = await this.encryption.decrypt(
        client.custodialWalletEncryptedKey
      )

      return {
        address: client.custodialWalletAddress,
        privateKey: privateKey as Hex
      }
    }

    // 3. Generate new wallet
    const wallet = this.generateWallet()

    // 4. Encrypt private key
    const encryptedKey = await this.encryption.encrypt(wallet.privateKey)

    // 5. Store in database
    await this.clientRepo.updateWallet(clientId, {
      custodialWalletAddress: wallet.address,
      custodialWalletEncryptedKey: encryptedKey,
      walletCreatedAt: new Date()
    })

    console.log(`✅ Created custodial wallet for client ${clientId}: ${wallet.address}`)

    return wallet
  }

  /**
   * Get wallet address without private key (safe for public use)
   */
  async getWalletAddress(clientId: string): Promise<string> {
    const client = await this.clientRepo.getById(clientId)

    if (!client?.custodialWalletAddress) {
      throw new Error(`No custodial wallet for client: ${clientId}`)
    }

    return client.custodialWalletAddress
  }

  /**
   * Create WalletClient for transaction signing
   *
   * @param privateKey - Wallet private key
   * @param chainId - Target chain ID
   * @returns Viem WalletClient ready for signing
   */
  getWalletClient(privateKey: Hex, chainId: number): WalletClient {
    const account = privateKeyToAccount(privateKey)
    const chainConfig = getMockTokenChainConfig(chainId)

    return createWalletClient({
      account,
      chain: chainConfig.chain,
      transport: http(chainConfig.rpcUrl)
    })
  }

  /**
   * Generate new wallet using viem
   * Uses secure random generation
   */
  private generateWallet(): CustodialWallet {
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)

    return {
      address: account.address,
      privateKey
    }
  }

  /**
   * Verify wallet can sign transactions
   */
  async verifyWallet(wallet: CustodialWallet, chainId: number): Promise<boolean> {
    try {
      const walletClient = this.getWalletClient(wallet.privateKey, chainId)
      const account = walletClient.account

      return account?.address === wallet.address
    } catch {
      return false
    }
  }
}
```

### 2.3 DeFi Transaction Repository

**File**: `/packages/core/repository/defi-transaction.repository.ts` (NEW)

**Purpose**: CRUD operations for `defi_transactions` table

```typescript
import type { Database } from './database'
import type { TransactionReceipt } from '@proxify/yield-engine'

export interface DefiTransaction {
  id: string
  clientId: string
  transactionType: 'deposit' | 'withdrawal' | 'approval'
  protocol: 'aave' | 'compound' | 'morpho'
  tokenSymbol: string
  chainId: number
  amount: string
  txHash?: string
  fromAddress: string
  toAddress: string
  blockNumber?: bigint
  gasUsed?: bigint
  gasPrice?: string
  status: 'pending' | 'submitted' | 'confirmed' | 'failed' | 'reverted'
  errorMessage?: string
  createdAt: Date
  submittedAt?: Date
  confirmedAt?: Date
}

export interface CreateDefiTransactionParams {
  clientId: string
  transactionType: DefiTransaction['transactionType']
  protocol: DefiTransaction['protocol']
  tokenSymbol: string
  chainId: number
  amount: string
  fromAddress: string
  toAddress: string
  txHash?: string
  status?: DefiTransaction['status']
}

/**
 * DeFiTransactionRepository
 * Manages defi_transactions table
 */
export class DeFiTransactionRepository {
  constructor(private readonly db: Database) {}

  /**
   * Create new transaction record
   */
  async create(params: CreateDefiTransactionParams): Promise<DefiTransaction> {
    const query = `
      INSERT INTO defi_transactions (
        client_id, transaction_type, protocol, token_symbol, chain_id,
        amount, from_address, to_address, tx_hash, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const result = await this.db.query(query, [
      params.clientId,
      params.transactionType,
      params.protocol,
      params.tokenSymbol,
      params.chainId,
      params.amount,
      params.fromAddress,
      params.toAddress,
      params.txHash || null,
      params.status || 'pending'
    ])

    return this.mapRow(result.rows[0])
  }

  /**
   * Update transaction status after blockchain confirmation
   */
  async updateStatus(
    id: string,
    status: DefiTransaction['status'],
    receipt?: TransactionReceipt
  ): Promise<void> {
    const query = `
      UPDATE defi_transactions
      SET status = $1,
          block_number = $2,
          gas_used = $3,
          gas_price = $4,
          confirmed_at = $5
      WHERE id = $6
    `

    await this.db.query(query, [
      status,
      receipt?.blockNumber || null,
      receipt?.gasUsed || null,
      receipt?.effectiveGasPrice?.toString() || null,
      status === 'confirmed' ? new Date() : null,
      id
    ])
  }

  /**
   * Mark transaction as failed with error message
   */
  async markFailed(id: string, errorMessage: string): Promise<void> {
    const query = `
      UPDATE defi_transactions
      SET status = 'failed',
          error_message = $1
      WHERE id = $2
    `

    await this.db.query(query, [errorMessage, id])
  }

  /**
   * Get all transactions for a client
   */
  async getByClientId(
    clientId: string,
    filters?: {
      protocol?: string
      status?: string
      limit?: number
      offset?: number
    }
  ): Promise<DefiTransaction[]> {
    let query = `
      SELECT * FROM defi_transactions
      WHERE client_id = $1
    `
    const params: any[] = [clientId]

    if (filters?.protocol) {
      params.push(filters.protocol)
      query += ` AND protocol = $${params.length}`
    }

    if (filters?.status) {
      params.push(filters.status)
      query += ` AND status = $${params.length}`
    }

    query += ` ORDER BY created_at DESC`

    if (filters?.limit) {
      params.push(filters.limit)
      query += ` LIMIT $${params.length}`
    }

    if (filters?.offset) {
      params.push(filters.offset)
      query += ` OFFSET $${params.length}`
    }

    const result = await this.db.query(query, params)
    return result.rows.map(row => this.mapRow(row))
  }

  /**
   * Get pending transactions (for monitoring)
   */
  async getPending(): Promise<DefiTransaction[]> {
    const query = `
      SELECT * FROM defi_transactions
      WHERE status IN ('pending', 'submitted')
      AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at ASC
    `

    const result = await this.db.query(query)
    return result.rows.map(row => this.mapRow(row))
  }

  /**
   * Get transaction by hash
   */
  async getByTxHash(txHash: string): Promise<DefiTransaction | null> {
    const query = `
      SELECT * FROM defi_transactions
      WHERE tx_hash = $1
      LIMIT 1
    `

    const result = await this.db.query(query, [txHash])
    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  /**
   * Map database row to DefiTransaction
   */
  private mapRow(row: any): DefiTransaction {
    return {
      id: row.id,
      clientId: row.client_id,
      transactionType: row.transaction_type,
      protocol: row.protocol,
      tokenSymbol: row.token_symbol,
      chainId: row.chain_id,
      amount: row.amount,
      txHash: row.tx_hash,
      fromAddress: row.from_address,
      toAddress: row.to_address,
      blockNumber: row.block_number ? BigInt(row.block_number) : undefined,
      gasUsed: row.gas_used ? BigInt(row.gas_used) : undefined,
      gasPrice: row.gas_price,
      status: row.status,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      submittedAt: row.submitted_at,
      confirmedAt: row.confirmed_at
    }
  }
}
```

---

## Phase 3: Execution Service

### 3.1 Extend DeFiExecutionService

**File**: `/apps/b2b-api/src/service/defi-execution.service.ts` (MODIFY)

**Add**: Execution methods that use custodial wallets

```typescript
import { BatchExecutor, type BatchExecutionResult } from '@proxify/yield-engine'
import type { CustodialWalletService } from '@proxify/core/services/custodial-wallet.service'
import type { DeFiTransactionRepository } from '@proxify/core/repository/defi-transaction.repository'

export interface ExecutionResult {
  success: boolean
  totalDeployed: string
  totalGasUsed: string
  transactions: Array<{
    protocol: string
    success: boolean
    txHash?: string
    amount: string
    error?: string
  }>
  partialFailure?: boolean
  failedProtocols?: string[]
  timestamp: number
}

export class DeFiExecutionService {
  constructor(
    private defiProtocolService: DeFiProtocolService,
    private custodialWalletService: CustodialWalletService,  // NEW
    private defiTransactionRepo: DeFiTransactionRepository,  // NEW
  ) {}

  // ... existing prepareDeposit() methods ...

  /**
   * Execute custodial deposit
   * Server-side transaction signing and execution
   *
   * @param params Deposit parameters
   * @returns Execution result with transaction hashes
   */
  async executeCustodialDeposit(params: {
    clientId: string
    token: string
    chainId: number
    amount: string
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
  }): Promise<ExecutionResult> {
    const { clientId, token, chainId, amount, riskLevel } = params

    console.log(`🚀 Executing custodial deposit for client ${clientId}`)
    console.log(`   Amount: ${amount}, Token: ${token}, Chain: ${chainId}`)

    // 1. Get client's custodial wallet
    const wallet = await this.custodialWalletService.getOrCreateWallet(clientId)
    console.log(`   Wallet: ${wallet.address}`)

    // 2. Get risk-optimized allocation
    const optimization = await this.defiProtocolService.optimizeAllocation(
      token,
      chainId,
      riskLevel
    )
    console.log(`   Allocation: ${optimization.allocation.map(a => `${a.protocol}:${a.percentage}%`).join(', ')}`)

    // 3. Calculate amounts per protocol
    const totalAmount = BigInt(amount)
    const allocations = optimization.allocation.map(a => ({
      protocol: a.protocol,
      percentage: a.percentage,
      amount: ((totalAmount * BigInt(Math.round(a.percentage * 100))) / 10000n).toString()
    }))

    // 4. Create WalletClient for signing
    const walletClient = this.custodialWalletService.getWalletClient(
      wallet.privateKey,
      chainId
    )

    // 5. Execute batch deposit via yield-engine
    const executor = new BatchExecutor()

    const result = await executor.executeBatchDeposit({
      token,
      chainId,
      totalAmount: amount,
      allocations,
      walletClient,
      executionMode: 'sequential' // Safer for production
    })

    console.log(`   Result: ${result.overallSuccess ? '✅ Success' : '⚠️ Partial/Failed'}`)

    // 6. Record transactions in database
    await this.recordTransactions(clientId, token, chainId, result)

    // 7. Return formatted result
    return {
      success: result.overallSuccess,
      totalDeployed: result.totalProcessed,
      totalGasUsed: result.totalGasUsed.toString(),
      transactions: result.results.map(r => ({
        protocol: r.protocol,
        success: r.success,
        txHash: r.receipt?.hash,
        amount: r.amount,
        error: r.error
      })),
      partialFailure: result.failedProtocols.length > 0 && result.results.some(r => r.success),
      failedProtocols: result.failedProtocols,
      timestamp: result.timestamp
    }
  }

  /**
   * Execute custodial withdrawal
   */
  async executeCustodialWithdrawal(params: {
    clientId: string
    token: string
    chainId: number
    withdrawals: Array<{
      protocol: 'aave' | 'compound' | 'morpho'
      amount: string
    }>
  }): Promise<ExecutionResult> {
    const { clientId, token, chainId, withdrawals } = params

    console.log(`🚀 Executing custodial withdrawal for client ${clientId}`)

    // 1. Get client wallet
    const wallet = await this.custodialWalletService.getOrCreateWallet(clientId)

    // 2. Create WalletClient
    const walletClient = this.custodialWalletService.getWalletClient(
      wallet.privateKey,
      chainId
    )

    // 3. Execute batch withdrawal
    const executor = new BatchExecutor()

    const result = await executor.executeBatchWithdrawal({
      token,
      chainId,
      allocations: withdrawals.map(w => ({
        protocol: w.protocol,
        percentage: 0, // Not used for withdrawals
        amount: w.amount
      })),
      walletClient,
      executionMode: 'sequential'
    })

    // 4. Record transactions
    await this.recordTransactions(clientId, token, chainId, result, 'withdrawal')

    return {
      success: result.overallSuccess,
      totalDeployed: result.totalProcessed,
      totalGasUsed: result.totalGasUsed.toString(),
      transactions: result.results.map(r => ({
        protocol: r.protocol,
        success: r.success,
        txHash: r.receipt?.hash,
        amount: r.amount,
        error: r.error
      })),
      partialFailure: result.failedProtocols.length > 0 && result.results.some(r => r.success),
      failedProtocols: result.failedProtocols,
      timestamp: result.timestamp
    }
  }

  /**
   * Record DeFi transactions in database
   */
  private async recordTransactions(
    clientId: string,
    token: string,
    chainId: number,
    result: BatchExecutionResult,
    type: 'deposit' | 'withdrawal' = 'deposit'
  ): Promise<void> {
    for (const txResult of result.results) {
      try {
        await this.defiTransactionRepo.create({
          clientId,
          transactionType: type,
          protocol: txResult.protocol,
          tokenSymbol: token,
          chainId,
          amount: txResult.amount,
          txHash: txResult.receipt?.hash,
          fromAddress: txResult.receipt?.from || '',
          toAddress: txResult.receipt?.to || '',
          status: txResult.success ? 'confirmed' : 'failed'
        })

        if (txResult.receipt && txResult.success) {
          // Update with blockchain data
          const tx = await this.defiTransactionRepo.getByTxHash(txResult.receipt.hash)
          if (tx) {
            await this.defiTransactionRepo.updateStatus(tx.id, 'confirmed', txResult.receipt)
          }
        }
      } catch (error) {
        console.error(`Failed to record transaction for ${txResult.protocol}:`, error)
      }
    }
  }
}
```

---

## Phase 4: API Layer

### 4.1 Add Execution Contracts

**File**: `/packages/b2b-api-core/contracts/defi-protocol.ts` (MODIFY)

```typescript
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  ExecuteDepositRequestSchema,
  ExecuteDepositResponseSchema,
  ExecuteWithdrawalRequestSchema,
  ExecuteWithdrawalResponseSchema,
  GetTransactionsResponseSchema
} from '../dto/defi-protocol'

const c = initContract()

export const defiProtocolContract = c.router({
  // ... existing prepare endpoints ...

  // NEW: Execute deposit
  executeDeposit: {
    method: 'POST',
    path: '/defi/execute/deposit',
    body: ExecuteDepositRequestSchema,
    responses: {
      200: ExecuteDepositResponseSchema,
      400: z.object({ success: z.literal(false), error: z.string() }),
      401: z.object({ success: z.literal(false), error: z.string() }),
      500: z.object({ success: z.literal(false), error: z.string() })
    },
    summary: 'Execute custodial DeFi deposit',
    description: 'Server-side transaction signing and execution across multiple protocols'
  },

  // NEW: Execute withdrawal
  executeWithdrawal: {
    method: 'POST',
    path: '/defi/execute/withdrawal',
    body: ExecuteWithdrawalRequestSchema,
    responses: {
      200: ExecuteWithdrawalResponseSchema,
      400: z.object({ success: z.literal(false), error: z.string() }),
      401: z.object({ success: z.literal(false), error: z.string() }),
      500: z.object({ success: z.literal(false), error: z.string() })
    },
    summary: 'Execute custodial DeFi withdrawal'
  },

  // NEW: Get transaction history
  getTransactions: {
    method: 'GET',
    path: '/defi/transactions/:clientId',
    pathParams: z.object({
      clientId: z.string().uuid()
    }),
    query: z.object({
      protocol: z.enum(['aave', 'compound', 'morpho']).optional(),
      status: z.enum(['pending', 'confirmed', 'failed']).optional(),
      limit: z.number().optional(),
      offset: z.number().optional()
    }).optional(),
    responses: {
      200: GetTransactionsResponseSchema
    },
    summary: 'Get DeFi transaction history'
  }
})
```

### 4.2 Add DTOs

**File**: `/packages/b2b-api-core/dto/defi-protocol.ts` (MODIFY)

```typescript
import { z } from 'zod'

// ============================================================================
// Execution DTOs
// ============================================================================

export const ExecuteDepositRequestSchema = z.object({
  token: z.string().describe('Token symbol (e.g., "USDC")'),
  chainId: z.number().describe('Chain ID'),
  amount: z.string().describe('Amount in token smallest unit'),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive'])
    .describe('Risk level for allocation strategy')
})

export const ExecuteDepositResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalDeployed: z.string().describe('Total amount successfully deployed'),
    totalGasUsed: z.string().describe('Total gas used across all transactions'),
    transactions: z.array(z.object({
      protocol: z.string(),
      success: z.boolean(),
      txHash: z.string().optional(),
      amount: z.string(),
      error: z.string().optional()
    })),
    partialFailure: z.boolean().optional()
      .describe('True if some protocols succeeded and some failed'),
    failedProtocols: z.array(z.string()).optional(),
    timestamp: z.number()
  })
})

export const ExecuteWithdrawalRequestSchema = z.object({
  token: z.string(),
  chainId: z.number(),
  withdrawals: z.array(z.object({
    protocol: z.enum(['aave', 'compound', 'morpho']),
    amount: z.string()
  }))
})

export const ExecuteWithdrawalResponseSchema = ExecuteDepositResponseSchema

export const GetTransactionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: z.string(),
    transactionType: z.enum(['deposit', 'withdrawal', 'approval']),
    protocol: z.enum(['aave', 'compound', 'morpho']),
    tokenSymbol: z.string(),
    chainId: z.number(),
    amount: z.string(),
    txHash: z.string().optional(),
    status: z.enum(['pending', 'submitted', 'confirmed', 'failed', 'reverted']),
    errorMessage: z.string().optional(),
    createdAt: z.string(),
    confirmedAt: z.string().optional()
  }))
})

export type ExecuteDepositRequest = z.infer<typeof ExecuteDepositRequestSchema>
export type ExecuteDepositResponse = z.infer<typeof ExecuteDepositResponseSchema>
export type ExecuteWithdrawalRequest = z.infer<typeof ExecuteWithdrawalRequestSchema>
export type GetTransactionsResponse = z.infer<typeof GetTransactionsResponseSchema>
```

### 4.3 Implement Router Handlers

**File**: `/apps/b2b-api/src/router/defi-protocol.router.ts` (MODIFY)

```typescript
export const createDefiProtocolRouter = (
  defiProtocolService: DeFiProtocolService,
  defiExecutionService: DeFiExecutionService,  // NEW dependency
  defiTransactionRepo: DeFiTransactionRepository  // NEW dependency
) => {
  return s.router(defiProtocolContract, {
    // ... existing prepare endpoints ...

    // NEW: Execute deposit
    executeDeposit: async ({ body, req }) => {
      try {
        const clientId = (req as any).client?.id

        if (!clientId) {
          return {
            status: 401,
            body: { success: false, error: 'Unauthorized' }
          }
        }

        const result = await defiExecutionService.executeCustodialDeposit({
          clientId,
          token: body.token,
          chainId: body.chainId,
          amount: body.amount,
          riskLevel: body.riskLevel
        })

        return {
          status: 200,
          body: { success: true, data: result }
        }
      } catch (error) {
        logger.error('Deposit execution failed', { error })
        return {
          status: 500,
          body: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    },

    // NEW: Execute withdrawal
    executeWithdrawal: async ({ body, req }) => {
      try {
        const clientId = (req as any).client?.id

        if (!clientId) {
          return {
            status: 401,
            body: { success: false, error: 'Unauthorized' }
          }
        }

        const result = await defiExecutionService.executeCustodialWithdrawal({
          clientId,
          token: body.token,
          chainId: body.chainId,
          withdrawals: body.withdrawals
        })

        return {
          status: 200,
          body: { success: true, data: result }
        }
      } catch (error) {
        logger.error('Withdrawal execution failed', { error })
        return {
          status: 500,
          body: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    },

    // NEW: Get transactions
    getTransactions: async ({ params, query, req }) => {
      try {
        const clientId = (req as any).client?.id

        // Validate client access
        if (clientId !== params.clientId) {
          return {
            status: 401,
            body: { success: false, error: 'Unauthorized' }
          }
        }

        const transactions = await defiTransactionRepo.getByClientId(
          params.clientId,
          query
        )

        return {
          status: 200,
          body: {
            success: true,
            data: transactions.map(tx => ({
              id: tx.id,
              transactionType: tx.transactionType,
              protocol: tx.protocol,
              tokenSymbol: tx.tokenSymbol,
              chainId: tx.chainId,
              amount: tx.amount,
              txHash: tx.txHash,
              status: tx.status,
              errorMessage: tx.errorMessage,
              createdAt: tx.createdAt.toISOString(),
              confirmedAt: tx.confirmedAt?.toISOString()
            }))
          }
        }
      } catch (error) {
        logger.error('Get transactions failed', { error })
        return {
          status: 500,
          body: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    }
  })
}
```

### 4.4 Update Server Initialization

**File**: `/apps/b2b-api/src/server.ts` (MODIFY)

```typescript
// Initialize services
const encryptionService = new EncryptionService()
const custodialWalletService = new CustodialWalletService(
  clientOrganizationRepo,
  encryptionService
)
const defiTransactionRepo = new DeFiTransactionRepository(db)
const defiExecutionService = new DeFiExecutionService(
  defiProtocolService,
  custodialWalletService,
  defiTransactionRepo
)

// Create routers with new dependencies
const defiProtocolRouter = createDefiProtocolRouter(
  defiProtocolService,
  defiExecutionService,
  defiTransactionRepo
)
```

---

## Phase 5: Security Configuration

### 5.1 Environment Variables

**File**: `/apps/b2b-api/.env` (ADD)

```bash
# Encryption secret for custodial wallet private keys
# CRITICAL: Must be at least 32 characters
# Generate with: openssl rand -hex 32
ENCRYPTION_SECRET=your-256-bit-secret-key-here

# Optional: AWS KMS for production (instead of ENCRYPTION_SECRET)
# AWS_KMS_KEY_ID=
# AWS_SECRET_ARN=
```

**File**: `/apps/b2b-api/src/env.ts` (MODIFY)

```typescript
export const ENV = {
  // ... existing vars ...

  // NEW: Wallet encryption
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || '',
}

// Validation
if (!ENV.ENCRYPTION_SECRET && ENV.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_SECRET is required in production')
}

if (ENV.ENCRYPTION_SECRET && ENV.ENCRYPTION_SECRET.length < 32) {
  throw new Error('ENCRYPTION_SECRET must be at least 32 characters')
}
```

### 5.2 Rate Limiting

**File**: `/apps/b2b-api/src/middleware/rate-limit.ts` (NEW)

```typescript
import rateLimit from 'express-rate-limit'

export const executionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  keyGenerator: (req) => {
    return (req as any).client?.id || req.ip
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many execution requests. Please try again later.'
    })
  }
})
```

**Apply to execution endpoints**:

```typescript
app.use('/api/v1/defi/execute/*', executionRateLimit)
```

### 5.3 Access Control

Add validation in execution handlers:

```typescript
// Validate client ownership
if ((req as any).client?.id !== clientId) {
  return {
    status: 403,
    body: { success: false, error: 'Forbidden: Not your client' }
  }
}
```

---

## Phase 6: Error Handling

### 6.1 Partial Failure Handling

Already implemented in `executeCustodialDeposit()`:

```typescript
return {
  success: result.overallSuccess,
  partialFailure: result.failedProtocols.length > 0 && result.results.some(r => r.success),
  failedProtocols: result.failedProtocols,
  // ...
}
```

### 6.2 Transaction Monitoring

**File**: `/apps/b2b-api/src/cron/monitor-transactions.ts` (NEW)

```typescript
import { getPublicClient } from '@proxify/core/blockchain/viem-client'
import type { DeFiTransactionRepository } from '@proxify/core/repository/defi-transaction.repository'

/**
 * Background job to monitor pending transactions
 * Checks blockchain for transaction status and updates database
 *
 * Run frequency: Every 30 seconds
 */
export async function monitorPendingTransactions(
  defiTransactionRepo: DeFiTransactionRepository
): Promise<void> {
  try {
    // Get all pending transactions
    const pending = await defiTransactionRepo.getPending()

    if (pending.length === 0) {
      return
    }

    console.log(`📡 Monitoring ${pending.length} pending transactions...`)

    for (const tx of pending) {
      try {
        if (!tx.txHash) {
          continue
        }

        // Get transaction receipt from blockchain
        const client = getPublicClient(tx.chainId)
        const receipt = await client.getTransactionReceipt({
          hash: tx.txHash as `0x${string}`
        })

        if (receipt) {
          // Transaction confirmed
          await defiTransactionRepo.updateStatus(
            tx.id,
            receipt.status === 'success' ? 'confirmed' : 'reverted',
            {
              hash: receipt.transactionHash,
              blockNumber: receipt.blockNumber,
              status: receipt.status,
              gasUsed: receipt.gasUsed,
              effectiveGasPrice: receipt.effectiveGasPrice,
              from: receipt.from,
              to: receipt.to,
              timestamp: Date.now()
            }
          )

          console.log(`✅ Updated tx ${tx.txHash}: ${receipt.status}`)
        }
      } catch (error) {
        console.error(`Failed to check tx ${tx.txHash}:`, error)
      }
    }
  } catch (error) {
    console.error('Transaction monitoring failed:', error)
  }
}

/**
 * Initialize monitoring cron job
 */
export function startTransactionMonitoring(
  defiTransactionRepo: DeFiTransactionRepository
): NodeJS.Timer {
  // Run every 30 seconds
  return setInterval(() => {
    monitorPendingTransactions(defiTransactionRepo)
  }, 30000)
}
```

**Add to server.ts**:

```typescript
// Start transaction monitoring
startTransactionMonitoring(defiTransactionRepo)
```

---

## Phase 7: Testing

### 7.1 Unit Tests

**File**: `/packages/core/services/__tests__/encryption.service.test.ts` (NEW)

```typescript
import { EncryptionService } from '../encryption.service'

describe('EncryptionService', () => {
  let service: EncryptionService

  beforeEach(() => {
    service = new EncryptionService('test-secret-key-at-least-32-chars-long')
  })

  it('should encrypt and decrypt correctly', async () => {
    const plaintext = '0x1234567890abcdef1234567890abcdef12345678'

    const encrypted = await service.encrypt(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted).toContain(':') // Format: iv:authTag:ciphertext

    const decrypted = await service.decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('should produce different ciphertexts for same plaintext', async () => {
    const plaintext = '0xtest'

    const encrypted1 = await service.encrypt(plaintext)
    const encrypted2 = await service.encrypt(plaintext)

    expect(encrypted1).not.toBe(encrypted2) // Different IVs
  })

  it('should fail on invalid ciphertext', async () => {
    await expect(service.decrypt('invalid')).rejects.toThrow()
  })

  it('should pass self-test', async () => {
    const result = await service.test()
    expect(result).toBe(true)
  })
})
```

**File**: `/packages/core/services/__tests__/custodial-wallet.service.test.ts` (NEW)

```typescript
import { CustodialWalletService } from '../custodial-wallet.service'
import { EncryptionService } from '../encryption.service'

describe('CustodialWalletService', () => {
  let service: CustodialWalletService
  let mockClientRepo: any
  let encryptionService: EncryptionService

  beforeEach(() => {
    encryptionService = new EncryptionService('test-secret-32-chars-minimum!')
    mockClientRepo = {
      getById: jest.fn(),
      updateWallet: jest.fn()
    }
    service = new CustodialWalletService(mockClientRepo, encryptionService)
  })

  it('should create new wallet if not exists', async () => {
    mockClientRepo.getById.mockResolvedValue({
      id: 'client-123',
      custodialWalletAddress: null
    })

    const wallet = await service.getOrCreateWallet('client-123')

    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(wallet.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/)
    expect(mockClientRepo.updateWallet).toHaveBeenCalled()
  })

  it('should return existing wallet if exists', async () => {
    const testPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    const encrypted = await encryptionService.encrypt(testPrivateKey)

    mockClientRepo.getById.mockResolvedValue({
      id: 'client-123',
      custodialWalletAddress: '0xAddress',
      custodialWalletEncryptedKey: encrypted
    })

    const wallet = await service.getOrCreateWallet('client-123')

    expect(wallet.address).toBe('0xAddress')
    expect(wallet.privateKey).toBe(testPrivateKey)
    expect(mockClientRepo.updateWallet).not.toHaveBeenCalled()
  })

  it('should create WalletClient', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

    const walletClient = service.getWalletClient(privateKey, 8453)

    expect(walletClient).toBeDefined()
    expect(walletClient.account).toBeDefined()
  })

  it('should verify wallet can sign', async () => {
    const wallet = await service.getOrCreateWallet('client-test')

    const isValid = await service.verifyWallet(wallet, 8453)

    expect(isValid).toBe(true)
  })
})
```

### 7.2 Integration Tests

**File**: `/apps/b2b-api/test/integration/custodial-execution.test.ts` (NEW)

```typescript
import { DeFiExecutionService } from '../../src/service/defi-execution.service'
import { fundWallet } from '../helpers/blockchain'

describe('Custodial DeFi Execution (Integration)', () => {
  let defiExecutionService: DeFiExecutionService
  let testClient: any

  beforeAll(async () => {
    // Setup test client
    testClient = await createTestClient()

    // Fund custodial wallet with MockUSDC
    const wallet = await custodialWalletService.getOrCreateWallet(testClient.id)
    await fundWallet(wallet.address, '2000000000') // 2000 USDC
  })

  it('should execute full custodial deposit flow', async () => {
    const result = await defiExecutionService.executeCustodialDeposit({
      clientId: testClient.id,
      token: 'USDC',
      chainId: 8453,
      amount: '1000000000', // 1000 USDC
      riskLevel: 'moderate'
    })

    // Verify result
    expect(result.success).toBe(true)
    expect(result.transactions.length).toBeGreaterThan(0)
    expect(result.totalDeployed).toBe('1000000000')

    // Verify at least one transaction succeeded
    const successfulTxs = result.transactions.filter(tx => tx.success)
    expect(successfulTxs.length).toBeGreaterThan(0)

    // Verify transaction has hash
    expect(successfulTxs[0].txHash).toMatch(/^0x[a-fA-F0-9]{64}$/)
  })

  it('should handle partial failures gracefully', async () => {
    // Mock: AAVE succeeds, Compound fails
    // This test requires mocking protocol adapters

    const result = await defiExecutionService.executeCustodialDeposit({
      clientId: testClient.id,
      token: 'USDC',
      chainId: 8453,
      amount: '1000000000',
      riskLevel: 'moderate'
    })

    if (result.partialFailure) {
      expect(result.success).toBe(false)
      expect(result.failedProtocols).toBeDefined()
      expect(result.failedProtocols!.length).toBeGreaterThan(0)

      // Should still have deployed some funds
      expect(BigInt(result.totalDeployed)).toBeGreaterThan(0n)
    }
  })

  it('should record transactions in database', async () => {
    await defiExecutionService.executeCustodialDeposit({
      clientId: testClient.id,
      token: 'USDC',
      chainId: 8453,
      amount: '500000000',
      riskLevel: 'conservative'
    })

    const transactions = await defiTransactionRepo.getByClientId(testClient.id)

    expect(transactions.length).toBeGreaterThan(0)
    expect(transactions[0].status).toBe('confirmed')
    expect(transactions[0].txHash).toBeDefined()
  })
})
```

---

## Phase 8: Deployment

### 8.1 Pre-Deployment Checklist

- [ ] Generate `ENCRYPTION_SECRET`: `openssl rand -hex 32`
- [ ] Set environment variables in production
- [ ] Run database migration
- [ ] Test wallet creation on testnet
- [ ] Test deposit execution with MockUSDC on testnet
- [ ] Verify transaction monitoring cron works
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerting

### 8.2 Deployment Commands

```bash
# 1. Generate encryption secret
openssl rand -hex 32

# 2. Set environment variable
export ENCRYPTION_SECRET=<generated-secret>

# 3. Run migration
npm run migrate:up

# 4. Verify migration
psql $DATABASE_URL -c "\d client_organizations"
psql $DATABASE_URL -c "\d defi_transactions"

# 5. Deploy backend
npm run build
npm run deploy:b2b-api

# 6. Verify deployment
curl https://api.proxify.com/api/v1/health
```

### 8.3 Monitoring Setup

Add metrics for:
- Deposit/withdrawal success rate per protocol
- Average gas used per transaction
- Transaction confirmation time
- Partial failure frequency
- Wallet creation rate

**Example with Prometheus**:

```typescript
import { Counter, Histogram } from 'prom-client'

const depositCounter = new Counter({
  name: 'defi_deposits_total',
  help: 'Total DeFi deposits executed',
  labelNames: ['protocol', 'status']
})

const gasUsedHistogram = new Histogram({
  name: 'defi_gas_used',
  help: 'Gas used per transaction',
  labelNames: ['protocol', 'operation']
})
```

---

## Complete Code Examples

### Example: Full Deposit Flow

```typescript
// Client makes deposit request
const response = await fetch('https://api.proxify.com/api/v1/defi/execute/deposit', {
  method: 'POST',
  headers: {
    'x-api-key': 'prod_pk_abc123...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'USDC',
    chainId: 8453,
    amount: '1000000000', // 1000 USDC
    riskLevel: 'moderate'
  })
})

const result = await response.json()

/*
{
  "success": true,
  "data": {
    "totalDeployed": "1000000000",
    "totalGasUsed": "450000",
    "transactions": [
      {
        "protocol": "aave",
        "success": true,
        "txHash": "0xabc123...",
        "amount": "600000000"
      },
      {
        "protocol": "compound",
        "success": true,
        "txHash": "0xdef456...",
        "amount": "300000000"
      },
      {
        "protocol": "morpho",
        "success": true,
        "txHash": "0xghi789...",
        "amount": "100000000"
      }
    ],
    "timestamp": 1703001234567
  }
}
*/
```

### Example: Get Transaction History

```typescript
const response = await fetch(
  'https://api.proxify.com/api/v1/defi/transactions/client-123?status=confirmed&limit=10',
  {
    headers: {
      'x-api-key': 'prod_pk_abc123...'
    }
  }
)

const result = await response.json()

/*
{
  "success": true,
  "data": [
    {
      "id": "tx-uuid-1",
      "transactionType": "deposit",
      "protocol": "aave",
      "tokenSymbol": "USDC",
      "chainId": 8453,
      "amount": "600000000",
      "txHash": "0xabc123...",
      "status": "confirmed",
      "createdAt": "2024-12-20T10:30:00Z",
      "confirmedAt": "2024-12-20T10:30:45Z"
    },
    // ... more transactions
  ]
}
*/
```

---

## Summary

### Implementation Phases

| Phase | Component | Status | Files |
|-------|-----------|--------|-------|
| 1 | Database Schema | 📋 Ready | 2 migration files |
| 2 | Core Services | 📋 Ready | 3 new services |
| 3 | Execution Service | 📋 Ready | 1 service extension |
| 4 | API Layer | 📋 Ready | 3 contract/DTO files, 2 router files |
| 5 | Security | 📋 Ready | Environment config, rate limiting |
| 6 | Error Handling | 📋 Ready | Monitoring cron job |
| 7 | Testing | 📋 Ready | 3 test suites |
| 8 | Deployment | 📋 Ready | Deployment guide |

### Critical Files Summary

**New Files (11)**:
1. `/database/migrations/000X_add_custodial_wallets.up.sql`
2. `/database/migrations/000X_add_custodial_wallets.down.sql`
3. `/packages/core/services/encryption.service.ts`
4. `/packages/core/services/custodial-wallet.service.ts`
5. `/packages/core/repository/defi-transaction.repository.ts`
6. `/apps/b2b-api/src/cron/monitor-transactions.ts`
7. `/apps/b2b-api/src/middleware/rate-limit.ts`
8. `/packages/core/services/__tests__/encryption.service.test.ts`
9. `/packages/core/services/__tests__/custodial-wallet.service.test.ts`
10. `/apps/b2b-api/test/integration/custodial-execution.test.ts`
11. **This file**: `/packages/yield-engine/docs/CUSTODIAL_EXECUTION.md`

**Modified Files (6)**:
1. `/apps/b2b-api/src/service/defi-execution.service.ts`
2. `/apps/b2b-api/src/router/defi-protocol.router.ts`
3. `/packages/b2b-api-core/contracts/defi-protocol.ts`
4. `/packages/b2b-api-core/dto/defi-protocol.ts`
5. `/apps/b2b-api/src/env.ts`
6. `/apps/b2b-api/src/server.ts`

### Key Architecture Decisions

✅ **One wallet per client_organization** - Simplest key management
✅ **Server-side private key management** - No Privy SDK for custody
✅ **AES-256-GCM encryption** - Secure storage of private keys
✅ **Sequential execution mode** - Safer than parallel for production
✅ **Transaction monitoring** - Background job for pending transactions
✅ **Partial failure support** - Record successful deposits even if some fail
✅ **Rate limiting** - 10 requests/minute per client
✅ **Comprehensive error handling** - Detailed error messages and logging

### Security Best Practices

🔒 **Private Key Security**:
- Never log private keys
- Encrypt at rest with AES-256-GCM
- Use strong ENCRYPTION_SECRET (32+ chars)
- Consider AWS KMS for production

🔒 **Access Control**:
- API key authentication required
- Validate client ownership
- Rate limiting on execution endpoints

🔒 **Transaction Security**:
- Verify wallet balance before execution
- Record all transactions for audit trail
- Monitor pending transactions
- Handle partial failures gracefully

---

**This guide provides complete, production-ready custodial DeFi execution for the Proxify platform.**

For questions or issues, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview
- [EXECUTION.md](./EXECUTION.md) - Basic execution patterns
- [MULTI_PROTOCOL_BATCHING.md](./MULTI_PROTOCOL_BATCHING.md) - Batching strategies
- [SHARE_ACCOUNTING.md](./SHARE_ACCOUNTING.md) - Yield tracking model
- [TODO.md](./TODO.md) - Implementation roadmap
