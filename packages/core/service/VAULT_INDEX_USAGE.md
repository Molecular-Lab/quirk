# Vault Index Service - Usage Guide

## Overview

This document shows how to set up and use the new vault index calculation system with injected DeFi protocol clients.

## Architecture

```
DeFi Protocol Clients (You inject viem/ethers getters)
           ↓
ProtocolClientRegistry (Manages all clients)
           ↓
VaultIndexService (Core calculation logic)
           ↓
Database (Tracks wrapped tokens & index)
```

## Setup (One-time initialization)

### Step 1: Create Protocol Client Getters

You need to provide functions that return contract instances. Here's how:

```typescript
// apps/b2b-api/src/blockchain/contracts.ts

import { createPublicClient, http, getContract } from 'viem';
import { baseSepolia } from 'viem/chains';

// Setup viem client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLIA_RPC_URL),
});

// AAVE aToken ABI (minimal - add what you need)
const AAVE_TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'convertToAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Compound cToken ABI
const COMPOUND_TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'exchangeRateStored',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Contract addresses (Base Sepolia)
const CONTRACTS = {
  AAVE_USDC: '0x...' as const, // aUSDC address
  COMPOUND_USDC: '0x...' as const, // cUSDC address
  MORPHO_VAULT: '0x...' as const, // Morpho vault address
};

// Getter functions (these are what you'll inject)
export function getATokenContract(address: string) {
  return getContract({
    address: address as `0x${string}`,
    abi: AAVE_TOKEN_ABI,
    client: publicClient,
  });
}

export function getCTokenContract(address: string) {
  return getContract({
    address: address as `0x${string}`,
    abi: COMPOUND_TOKEN_ABI,
    client: publicClient,
  });
}

export function getMorphoVaultContract(address: string) {
  return getContract({
    address: address as `0x${string}`,
    abi: AAVE_TOKEN_ABI, // Morpho uses similar interface
    client: publicClient,
  });
}
```

### Step 2: Initialize Protocol Registry

```typescript
// apps/b2b-api/src/services/protocol-registry.ts

import {
  ProtocolClientRegistry,
  AaveProtocolClient,
  CompoundProtocolClient,
  MorphoProtocolClient,
} from '@proxify/core/service/defi-protocol.interface';
import {
  getATokenContract,
  getCTokenContract,
  getMorphoVaultContract,
} from '../blockchain/contracts';

// Create and configure the registry
export const protocolRegistry = new ProtocolClientRegistry();

// Register AAVE client
protocolRegistry.register(
  new AaveProtocolClient((address) => getATokenContract(address))
);

// Register Compound client
protocolRegistry.register(
  new CompoundProtocolClient((address) => getCTokenContract(address))
);

// Register Morpho client
protocolRegistry.register(
  new MorphoProtocolClient((address) => getMorphoVaultContract(address))
);

console.log('[ProtocolRegistry] Initialized with protocols:',
  protocolRegistry.getAll().map(c => c.protocolName)
);
```

### Step 3: Create Service Instance

```typescript
// apps/b2b-api/src/services/vault-index-service.ts

import { VaultIndexService } from '@proxify/core/service/vault-index.service';
import { VaultRepository } from '@proxify/core/repository/postgres/vault.repository';
import { WrappedTokenRepository } from '@proxify/core/repository/postgres/wrapped-token.repository';
import { protocolRegistry } from './protocol-registry';
import { db } from '../database'; // Your database instance

// Create repositories
const vaultRepository = new VaultRepository(db);
const wrappedTokenRepository = new WrappedTokenRepository(db);

// Create service with injected dependencies
export const vaultIndexService = new VaultIndexService(
  vaultRepository,
  wrappedTokenRepository,
  protocolRegistry
);

console.log('[VaultIndexService] Initialized');
```

## Usage Examples

### 1. Daily Cron Job (Update All Vaults)

```typescript
// apps/b2b-api/src/cron/daily-index-update.ts

import { vaultIndexService } from '../services/vault-index-service';
import { VaultRepository } from '@proxify/core/repository/postgres/vault.repository';
import { db } from '../database';

/**
 * Runs daily at midnight UTC
 */
export async function runDailyIndexUpdate() {
  console.log('[Cron] ===== Starting Daily Index Update =====');

  const vaultRepo = new VaultRepository(db);

  // Get all active vaults
  const activeVaults = await vaultRepo.listActiveVaultsForIndexUpdate();

  console.log(`[Cron] Found ${activeVaults.length} active vaults to update`);

  const results = [];
  const errors = [];

  for (const vault of activeVaults) {
    try {
      // Run full daily update for each vault
      const result = await vaultIndexService.runDailyUpdate(vault.id);

      results.push({
        vaultId: vault.id,
        clientId: vault.clientId,
        oldIndex: result.oldIndex,
        newIndex: result.newIndex,
        yieldGenerated: result.yieldGenerated,
        growthRate: result.dailyGrowthRate,
      });

      console.log(`[Cron] ✓ Updated vault ${vault.id}:`, {
        chain: vault.chain,
        token: vault.tokenSymbol,
        yield: `$${result.yieldGenerated}`,
        growth: `${result.dailyGrowthRate.toFixed(4)}%`,
      });
    } catch (error) {
      console.error(`[Cron] ✗ Failed to update vault ${vault.id}:`, error);
      errors.push({ vaultId: vault.id, error });
    }
  }

  console.log('[Cron] ===== Daily Index Update Complete =====');
  console.log(`[Cron] Success: ${results.length}/${activeVaults.length} vaults`);

  if (errors.length > 0) {
    console.error(`[Cron] Errors: ${errors.length} vaults failed`);
  }

  return { results, errors };
}

// Schedule with node-cron or your preferred scheduler
import cron from 'node-cron';

// Run daily at 00:00 UTC
cron.schedule('0 0 * * *', async () => {
  await runDailyIndexUpdate();
});
```

### 2. Manual Index Update (API Endpoint)

```typescript
// apps/b2b-api/src/router/vault.router.ts

import { Router } from 'express';
import { vaultIndexService } from '../services/vault-index-service';

const router = Router();

/**
 * POST /api/vaults/:vaultId/sync
 * Manually trigger wrapped token sync and index update
 */
router.post('/vaults/:vaultId/sync', async (req, res) => {
  try {
    const { vaultId } = req.params;

    // Run full daily update
    const result = await vaultIndexService.runDailyUpdate(vaultId);

    res.json({
      success: true,
      data: {
        vaultId: result.vaultId,
        oldIndex: result.oldIndex,
        newIndex: result.newIndex,
        previousValue: result.previousValue,
        currentValue: result.currentValue,
        yieldGenerated: result.yieldGenerated,
        dailyGrowthRate: result.dailyGrowthRate,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error('[API] Failed to sync vault:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/vaults/:vaultId/value
 * Get current vault value from wrapped tokens
 */
router.get('/vaults/:vaultId/value', async (req, res) => {
  try {
    const { vaultId } = req.params;

    // First sync latest balances
    await vaultIndexService.syncWrappedTokenBalances(vaultId);

    // Then get total value
    const totalValue = await vaultIndexService.getCurrentVaultValue(vaultId);

    res.json({
      success: true,
      data: {
        vaultId,
        totalValue,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[API] Failed to get vault value:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

### 3. Deposit Flow (Update Entry Index)

```typescript
// packages/core/usecase/b2b/deposit.usecase.ts

import { vaultIndexService } from '../../services/vault-index-service';

export class B2BDepositUseCase {
  async executeDeposit(params: {
    endUserId: string;
    clientId: string;
    amount: string;
  }) {
    // ... existing deposit logic ...

    // Get current vault index
    const vault = await this.vaultRepository.getClientVault(
      params.clientId,
      'base-sepolia',
      USDC_ADDRESS
    );

    const currentIndex = vault.currentIndex;

    // Check if user has existing vault
    const userVault = await this.vaultRepository.getEndUserVaultByClient(
      params.endUserId,
      params.clientId
    );

    if (!userVault) {
      // First deposit - create vault with entry index
      await this.vaultRepository.createEndUserVault({
        endUserId: params.endUserId,
        clientId: params.clientId,
        totalDeposited: params.amount,
        weightedEntryIndex: currentIndex, // Lock in current index
      });
    } else {
      // Additional deposit - calculate weighted entry index
      const newWeightedIndex = vaultIndexService.calculateWeightedEntryIndex({
        previousDeposited: userVault.totalDeposited,
        previousEntryIndex: userVault.weightedEntryIndex,
        newDeposit: params.amount,
        currentIndex: currentIndex,
      });

      await this.vaultRepository.updateEndUserVaultDeposit(
        userVault.id,
        params.amount,
        newWeightedIndex
      );
    }

    // Update client vault total staked
    await this.vaultRepository.addPendingDepositToVault(
      vault.id,
      params.amount,
      '0' // shares calculation if needed
    );
  }
}
```

### 4. Withdrawal Flow (Calculate User Value & Update Vault)

```typescript
// packages/core/usecase/b2b/withdrawal.usecase.ts

import { vaultIndexService } from '../../services/vault-index-service';

export class B2BWithdrawalUseCase {
  async executeWithdrawal(params: {
    endUserId: string;
    clientId: string;
    amount: string;
  }) {
    // Get user's vault
    const userVault = await this.vaultRepository.getEndUserVaultByClient(
      params.endUserId,
      params.clientId
    );

    if (!userVault) {
      throw new Error('User vault not found');
    }

    // Get client vault current index
    const clientVault = await this.vaultRepository.getClientVault(
      params.clientId,
      'base-sepolia',
      USDC_ADDRESS
    );

    // Calculate user's current value
    const currentValue = vaultIndexService.calculateUserValue({
      totalDeposited: userVault.totalDeposited,
      entryIndex: userVault.weightedEntryIndex,
      currentIndex: clientVault.currentIndex,
    });

    console.log('[Withdrawal] User value:', {
      deposited: userVault.totalDeposited,
      entryIndex: userVault.weightedEntryIndex,
      currentIndex: clientVault.currentIndex,
      currentValue,
    });

    // Check if user has enough balance
    const currentValueDecimal = new Decimal(currentValue);
    const withdrawalDecimal = new Decimal(params.amount);

    if (withdrawalDecimal.greaterThan(currentValueDecimal)) {
      throw new Error(`Insufficient balance. Available: ${currentValue}, Requested: ${params.amount}`);
    }

    // Update user vault
    await this.vaultRepository.updateEndUserVaultWithdrawal(
      userVault.id,
      params.amount
    );

    // Update client vault total staked
    await vaultIndexService.handleWithdrawal(clientVault.id, params.amount);

    // Execute actual withdrawal from DeFi protocols
    // ... withdrawal logic ...
  }
}
```

## Testing

### Test Protocol Clients

```typescript
// test/vault-index.test.ts

import { describe, it, expect } from 'vitest';
import { AaveProtocolClient } from '@proxify/core/service/defi-protocol.interface';

describe('AaveProtocolClient', () => {
  it('should fetch wrapped balance correctly', async () => {
    const mockGetContract = (address: string) => ({
      address,
      balanceOf: async (wallet: string) => BigInt('605000000000'), // 605k aUSDC
      convertToAssets: async (shares: bigint) => BigInt('1008333000000000000'), // 1.008333
    });

    const client = new AaveProtocolClient(mockGetContract);

    const result = await client.getWrappedBalance(
      '0xABC...123',
      '0xUSDC...'
    );

    expect(result.protocol).toBe('AAVE');
    expect(result.wrappedBalance).toBe('605000000000');
    expect(result.exchangeRate).toBe('1008333000000000000');
    expect(parseFloat(result.realValue)).toBeCloseTo(610041.47, 2);
  });
});
```

## Migration Checklist

- [ ] Create `client_wrapped_tokens` table (see QuirkVaultVisualizationFlow.md)
- [ ] Add SQLC queries to `vault.sql`
- [ ] Run `sqlc generate` to generate TypeScript types
- [ ] Set up viem contracts in `apps/b2b-api/src/blockchain/contracts.ts`
- [ ] Initialize `ProtocolClientRegistry` with your contract getters
- [ ] Create `VaultIndexService` instance with injected dependencies
- [ ] Set up daily cron job for index updates
- [ ] Update deposit flow to use entry index
- [ ] Update withdrawal flow to use calculated user value
- [ ] Test with mock contracts first
- [ ] Deploy to testnet and verify wrapped token balances

## Next Steps

1. **You handle:** Creating viem contract getters with proper ABIs
2. **You handle:** Injecting contract getters into protocol clients
3. **System handles:** Fetching balances, calculating values, updating indexes
4. **System handles:** Entry index tracking, withdrawal calculations, APY metrics

The system is now **fully flexible** - you just need to provide the contract getters, and it will handle all the calculation logic!
