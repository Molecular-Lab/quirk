# Yield Engine + Vault Index Integration Guide

## Overview

This guide shows how to integrate the existing **@proxify/yield-engine** package with the new **Vault Index Service** for accurate, real-time yield tracking.

## Architecture Integration

```
┌──────────────────────────────────────────────────────────┐
│ @proxify/yield-engine (EXISTING)                         │
│ ─────────────────────────────────────────────────────    │
│ • AaveAdapter                                            │
│ • CompoundAdapter                                        │
│ • MorphoAdapter                                          │
│                                                          │
│ Methods:                                                 │
│ • getSupplyAPY(token, chainId)                          │
│ • getUserPosition(wallet, token, chainId)               │
│ • getMetrics(token, chainId)                            │
└──────────────────────────────────────────────────────────┘
                            ↓
                            ↓ (Use for fetching wrapped balances)
                            ↓
┌──────────────────────────────────────────────────────────┐
│ VaultIndexService (NEW)                                  │
│ ─────────────────────────────────────────────────────    │
│ • syncWrappedTokenBalances()                             │
│ • updateVaultIndex()                                     │
│ • calculateUserValue()                                   │
│ • handleWithdrawal()                                     │
└──────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌──────────────────────────────────────────────────────────┐
│ Database (client_vaults, client_wrapped_tokens)          │
└──────────────────────────────────────────────────────────┘
```

## Adapter Integration

### Using Yield Engine Adapters for Balance Fetching

Instead of creating new protocol clients, we can use the existing yield-engine adapters:

```typescript
// packages/core/service/yield-engine-protocol-client.ts

import { AaveAdapter, CompoundAdapter, MorphoAdapter } from '@proxify/yield-engine';
import type { IDeFiProtocolClient, WrappedTokenBalance, ProtocolName } from './defi-protocol.interface';

/**
 * Wrapper for AAVE yield-engine adapter
 * Adapts it to our IDeFiProtocolClient interface
 */
export class YieldEngineAaveClient implements IDeFiProtocolClient {
  readonly protocolName: ProtocolName = 'AAVE';
  private adapter: AaveAdapter;

  constructor(chainId: number) {
    this.adapter = new AaveAdapter(chainId);
  }

  async getWrappedBalance(
    custodialWallet: string,
    tokenAddress: string
  ): Promise<WrappedTokenBalance> {
    // Use yield-engine to get user position
    const position = await this.adapter.getUserPosition(
      custodialWallet,
      'USDC', // TODO: Map address to symbol
      8453 // Base chain
    );

    if (!position) {
      return {
        protocol: 'AAVE',
        wrappedTokenAddress: '0x...', // Get from adapter
        wrappedTokenSymbol: 'aUSDC',
        wrappedBalance: '0',
        exchangeRate: '1000000000000000000', // 1.0
        realValue: '0',
        decimals: 6,
      };
    }

    // Position already has the real value calculated!
    return {
      protocol: 'AAVE',
      wrappedTokenAddress: '0x...', // Need to expose from adapter
      wrappedTokenSymbol: 'aUSDC',
      wrappedBalance: position.amount, // Raw aToken balance
      exchangeRate: '1000000000000000000', // Calculate from position
      realValue: position.valueUSD, // Already calculated!
      decimals: 6,
    };
  }

  async getExchangeRate(wrappedTokenAddress: string): Promise<string> {
    // Yield-engine calculates this internally
    // We can extract it from getMetrics
    const metrics = await this.adapter.getMetrics('USDC', 8453);
    // TODO: Calculate exchange rate from metrics
    return '1000000000000000000';
  }

  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string {
    // Reuse existing calculation from yield-engine
    // Or use our own Decimal.js implementation
    return '0';
  }
}

/**
 * Wrapper for Compound yield-engine adapter
 */
export class YieldEngineCompoundClient implements IDeFiProtocolClient {
  readonly protocolName: ProtocolName = 'COMPOUND';
  private adapter: CompoundAdapter;

  constructor(chainId: number) {
    this.adapter = new CompoundAdapter(chainId);
  }

  async getWrappedBalance(
    custodialWallet: string,
    tokenAddress: string
  ): Promise<WrappedTokenBalance> {
    const position = await this.adapter.getUserPosition(
      custodialWallet,
      'USDC',
      8453
    );

    if (!position) {
      return {
        protocol: 'COMPOUND',
        wrappedTokenAddress: '0x...',
        wrappedTokenSymbol: 'cUSDC',
        wrappedBalance: '0',
        exchangeRate: '1000000000000000000',
        realValue: '0',
        decimals: 8,
      };
    }

    return {
      protocol: 'COMPOUND',
      wrappedTokenAddress: '0x...',
      wrappedTokenSymbol: 'cUSDC',
      wrappedBalance: position.amount,
      exchangeRate: '1000000000000000000',
      realValue: position.valueUSD,
      decimals: 8,
    };
  }

  async getExchangeRate(wrappedTokenAddress: string): Promise<string> {
    return '1000000000000000000';
  }

  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string {
    return '0';
  }
}

/**
 * Wrapper for Morpho yield-engine adapter
 */
export class YieldEngineMorphoClient implements IDeFiProtocolClient {
  readonly protocolName: ProtocolName = 'MORPHO';
  private adapter: MorphoAdapter;

  constructor(chainId: number) {
    this.adapter = new MorphoAdapter(chainId);
  }

  async getWrappedBalance(
    custodialWallet: string,
    tokenAddress: string
  ): Promise<WrappedTokenBalance> {
    const position = await this.adapter.getUserPosition(
      custodialWallet,
      'USDC',
      8453
    );

    if (!position) {
      return {
        protocol: 'MORPHO',
        wrappedTokenAddress: '0x...',
        wrappedTokenSymbol: 'mUSDC',
        wrappedBalance: '0',
        exchangeRate: '1000000000000000000',
        realValue: '0',
        decimals: 18,
      };
    }

    return {
      protocol: 'MORPHO',
      wrappedTokenAddress: '0x...',
      wrappedTokenSymbol: 'mUSDC',
      wrappedBalance: position.amount,
      exchangeRate: '1000000000000000000',
      realValue: position.valueUSD,
      decimals: 18,
    };
  }

  async getExchangeRate(wrappedTokenAddress: string): Promise<string> {
    return '1000000000000000000';
  }

  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string {
    return '0';
  }
}
```

## Unified Service Setup

### Initialize with Yield Engine Adapters

```typescript
// apps/b2b-api/src/services/vault-index-setup.ts

import { ProtocolClientRegistry } from '@proxify/core/service/defi-protocol.interface';
import { VaultIndexService } from '@proxify/core/service/vault-index.service';
import {
  YieldEngineAaveClient,
  YieldEngineCompoundClient,
  YieldEngineMorphoClient,
} from '@proxify/core/service/yield-engine-protocol-client';

// Setup protocol registry with yield-engine adapters
export const protocolRegistry = new ProtocolClientRegistry();

protocolRegistry.register(new YieldEngineAaveClient(8453)); // Base chain
protocolRegistry.register(new YieldEngineCompoundClient(8453));
protocolRegistry.register(new YieldEngineMorphoClient(8453));

// Create vault index service
export const vaultIndexService = new VaultIndexService(
  vaultRepository,
  wrappedTokenRepository,
  protocolRegistry
);
```

## Daily Cron Job (Unified Approach)

```typescript
// apps/b2b-api/src/cron/daily-vault-update.ts

import { vaultIndexService } from '../services/vault-index-setup';

export async function runDailyVaultUpdate() {
  console.log('[Cron] Starting daily vault update...');

  const vaults = await vaultRepository.listActiveVaults();

  for (const vault of vaults) {
    try {
      // Uses yield-engine adapters under the hood
      const result = await vaultIndexService.runDailyUpdate(vault.id);

      console.log(`[Cron] ✓ Vault ${vault.id}:`, {
        oldIndex: result.oldIndex,
        newIndex: result.newIndex,
        yieldGenerated: result.yieldGenerated,
        dailyGrowthRate: result.dailyGrowthRate,
      });
    } catch (error) {
      console.error(`[Cron] ✗ Failed vault ${vault.id}:`, error);
    }
  }
}
```

## DeFi Observer Integration

### Use Same Adapters for Dashboard

```typescript
// packages/core/service/defi-observer.service.ts

import { AaveAdapter, CompoundAdapter, MorphoAdapter } from '@proxify/yield-engine';

export class DeFiObserverService {
  private aave: AaveAdapter;
  private compound: CompoundAdapter;
  private morpho: MorphoAdapter;

  constructor(chainId: number = 8453) {
    this.aave = new AaveAdapter(chainId);
    this.compound = new CompoundAdapter(chainId);
    this.morpho = new MorphoAdapter(chainId);
  }

  /**
   * Fetch real-time protocol data for Observer Dashboard
   */
  async fetchProtocolStats(token: string = 'USDC') {
    const [aaveAPY, compoundAPY, morphoAPY] = await Promise.all([
      this.aave.getSupplyAPY(token, 8453),
      this.compound.getSupplyAPY(token, 8453),
      this.morpho.getSupplyAPY(token, 8453),
    ]);

    const [aaveMetrics, compoundMetrics, morphoMetrics] = await Promise.all([
      this.aave.getMetrics(token, 8453),
      this.compound.getMetrics(token, 8453),
      this.morpho.getMetrics(token, 8453),
    ]);

    return {
      protocols: [
        {
          name: 'AAVE',
          apy: aaveAPY,
          tvl: aaveMetrics.tvl,
          liquidity: aaveMetrics.liquidity,
          status: 'healthy',
        },
        {
          name: 'Compound',
          apy: compoundAPY,
          tvl: compoundMetrics.tvl,
          status: 'healthy',
        },
        {
          name: 'Morpho',
          apy: morphoAPY,
          tvl: morphoMetrics.tvl,
          metadata: morphoMetrics.metadata,
          status: 'healthy',
        },
      ],
      bestAPY: Math.max(
        parseFloat(aaveAPY),
        parseFloat(compoundAPY),
        parseFloat(morphoAPY)
      ),
      timestamp: new Date(),
    };
  }

  /**
   * Get user's positions across all protocols
   */
  async fetchUserPositions(walletAddress: string, token: string = 'USDC') {
    const [aavePosition, compoundPosition, morphoPosition] = await Promise.all([
      this.aave.getUserPosition(walletAddress, token, 8453),
      this.compound.getUserPosition(walletAddress, token, 8453),
      this.morpho.getUserPosition(walletAddress, token, 8453),
    ]);

    return {
      totalValue: [aavePosition, compoundPosition, morphoPosition]
        .filter(p => p !== null)
        .reduce((sum, p) => sum + parseFloat(p!.valueUSD), 0),
      positions: [
        aavePosition && { ...aavePosition, protocol: 'AAVE' },
        compoundPosition && { ...compoundPosition, protocol: 'Compound' },
        morphoPosition && { ...morphoPosition, protocol: 'Morpho' },
      ].filter(Boolean),
    };
  }
}
```

## Benefits of This Integration

### ✅ Advantages

1. **Reuse Existing Code**: Yield-engine already has working AAVE/Compound/Morpho logic
2. **Consistent Data**: Same adapters for both vault tracking and observer dashboard
3. **Maintained ABIs**: Yield-engine keeps protocol ABIs up-to-date
4. **Built-in Caching**: 5-minute TTL already implemented
5. **Error Handling**: Production-grade error handling already there
6. **Type Safety**: Full TypeScript support with Zod validation

### ⚠️ Considerations

1. **Adapter Exposure**: May need to expose more internals from yield-engine (e.g., wrapped token addresses)
2. **Chain Support**: Yield-engine supports multiple chains, ensure consistency
3. **Token Mapping**: Need to map token addresses → symbols consistently

## Implementation Priority

### Phase 1: Use Yield Engine for Observer Dashboard (Easiest)
```typescript
// Just use AaveAdapter, CompoundAdapter, MorphoAdapter directly
const observer = new DeFiObserverService(8453);
const stats = await observer.fetchProtocolStats('USDC');
```

### Phase 2: Integrate with Vault Index Service
```typescript
// Wrap adapters to match IDeFiProtocolClient interface
const registry = new ProtocolClientRegistry();
registry.register(new YieldEngineAaveClient(8453));
// ... use in VaultIndexService
```

### Phase 3: Create DeFi Observer UI
```typescript
// Build React components using observer service
<DeFiObserverPage />
```

## Recommended Approach

**START WITH OBSERVER DASHBOARD FIRST:**

1. Use yield-engine adapters directly (no wrapper needed initially)
2. Build DeFi Observer UI to display protocol stats
3. Add AI chatbot integration
4. Later, integrate with VaultIndexService for client vault tracking

This gives you **immediate value** (the Observer Dashboard) while keeping vault integration as a separate, future enhancement.

---

**Status:** Integration strategy defined
**Next Steps:** Implement DeFi Observer Dashboard using yield-engine
