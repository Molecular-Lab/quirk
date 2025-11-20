# @proxify/yield-engine

A comprehensive yield optimization engine for DeFi protocols (AAVE, Compound, Morpho).

## Features

- 🔄 **Multi-Protocol Support**: AAVE V3, Compound V3, Morpho
- 📊 **Yield Aggregation**: Fetch and compare yields across all protocols
- 🧠 **Smart Optimization**: Automatic rebalancing recommendations
- ⚡ **High Performance**: Built-in caching and retry logic
- 🔒 **Type Safe**: Full TypeScript support with Zod validation
- 🌐 **Multi-Chain**: Ethereum, Polygon, Base, Arbitrum

## Installation

```bash
pnpm add @proxify/yield-engine
```

## Quick Start

### Using AAVE Adapter (Phase 2 Complete)

```typescript
import { AaveAdapter } from '@proxify/yield-engine'

// Initialize AAVE adapter for Ethereum
const aave = new AaveAdapter(1) // Chain ID 1 = Ethereum

// Get current USDC supply APY
const apy = await aave.getSupplyAPY('USDC', 1)
console.log(`AAVE USDC APY: ${apy}%`) // e.g., "5.25%"

// Get user's position
const position = await aave.getUserPosition(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'USDC',
  1
)
console.log(position)
// {
//   protocol: 'aave',
//   token: 'USDC',
//   amount: '1000000000', // wei
//   amountFormatted: '1000.00',
//   valueUSD: '1000.00',
//   apy: '5.25'
// }

// Get detailed metrics for USDC market
const metrics = await aave.getMetrics('USDC', 1)
console.log(metrics)
// {
//   protocol: 'aave',
//   token: 'USDC',
//   supplyAPY: '5.25',
//   borrowAPY: '7.50',
//   tvl: '1500000000', // Total value locked
//   liquidity: '1200000000' // Available to withdraw
// }

// Get overall protocol health
const protocolMetrics = await aave.getProtocolMetrics(1)
console.log(protocolMetrics)
// {
//   protocol: 'aave',
//   chainId: 1,
//   tvlUSD: '5000000000',
//   avgSupplyAPY: '4.85',
//   isHealthy: true
// }
```

### Using Compound Adapter (Phase 3 Complete)

```typescript
import { CompoundAdapter } from '@proxify/yield-engine'

// Initialize Compound adapter for Ethereum
const compound = new CompoundAdapter(1)

// Get current USDC supply APY
const apy = await compound.getSupplyAPY('USDC', 1)
console.log(`Compound USDC APY: ${apy}%`)

// Get user's position
const position = await compound.getUserPosition(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'USDC',
  1
)

// Get market metrics
const metrics = await compound.getMetrics('USDC', 1)
```

### Using Morpho Adapter (Phase 4 Complete)

```typescript
import { MorphoAdapter } from '@proxify/yield-engine'

// Initialize Morpho adapter for Ethereum
const morpho = new MorphoAdapter(1)

// Get current USDC supply APY from MetaMorpho vaults
const apy = await morpho.getSupplyAPY('USDC', 1)
console.log(`Morpho USDC APY: ${apy}%`)

// Get user's position in Morpho vaults
const position = await morpho.getUserPosition(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'USDC',
  1
)

// Get vault metrics (including TVL and utilization)
const metrics = await morpho.getMetrics('USDC', 1)
console.log(metrics)
// {
//   protocol: 'morpho',
//   token: 'USDC',
//   supplyAPY: '6.50',
//   tvl: '500000000',
//   utilization: '75.5%',
//   metadata: {
//     vaultName: 'Steakhouse USDC',
//     vaultAddress: '0xBEEF...',
//     marketCount: 3
//   }
// }
```

### Multi-Protocol Aggregation (Phase 5 - Coming Soon)

```typescript
import { YieldAggregator, YieldOptimizer } from '@proxify/yield-engine'

// Initialize aggregator
const aggregator = new YieldAggregator()

// Fetch all opportunities for USDC on Ethereum
const opportunities = await aggregator.fetchAllOpportunities('USDC', 1)

console.log(opportunities)
// [
//   { protocol: 'morpho', supplyAPY: '6.8' },
//   { protocol: 'aave', supplyAPY: '5.2' },
//   { protocol: 'compound', supplyAPY: '4.9' }
// ]
```

## Architecture

```
packages/yield-engine/
├── src/
│   ├── protocols/          # Protocol-specific adapters
│   │   ├── aave/          # AAVE V3 integration
│   │   ├── compound/      # Compound V3 integration
│   │   └── morpho/        # Morpho integration
│   ├── aggregator/        # Multi-protocol aggregation
│   ├── optimizer/         # Optimization logic
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Utility functions
└── tests/                 # Integration tests
```

## Development Status

### ✅ Phase 1: Foundation (Complete)
- ✅ Package structure
- ✅ Shared types and interfaces
- ✅ Utility functions (formatting, RPC, caching)

### ✅ Phase 2: AAVE V3 Integration (Complete)
- ✅ AAVE adapter with full IProtocolAdapter implementation
- ✅ Support for USDC and USDT
- ✅ Multi-chain support (Ethereum, Polygon, Base, Arbitrum)
- ✅ APY calculation using @aave/math-utils
- ✅ User position tracking via aTokens
- ✅ Protocol metrics and health monitoring
- ✅ Built-in caching (5-minute TTL)
- ✅ Comprehensive unit tests

### ✅ Phase 3: Compound V3 Integration (Complete)
- ✅ Compound V3 (Comet) adapter with full IProtocolAdapter implementation
- ✅ Support for USDC, USDT, and bridged variants (USDbC, USDC.e)
- ✅ Multi-chain support (Ethereum, Polygon, Base, Arbitrum)
- ✅ APY calculation with compound interest formula (1e18 precision)
- ✅ Rebasing token balance tracking
- ✅ Protocol metrics and market monitoring
- ✅ Built-in caching (5-minute TTL)
- ✅ Comprehensive unit and integration tests

### ✅ Phase 4: Morpho Integration (Complete)
- ✅ Morpho adapter with full IProtocolAdapter implementation
- ✅ MetaMorpho vault integration (ERC-4626 compliant)
- ✅ Support for USDC and USDT
- ✅ Multi-chain support (Ethereum, Base)
- ✅ Morpho Blue SDK integration
- ✅ User position tracking via vault shares
- ✅ Protocol metrics and vault monitoring
- ✅ Built-in caching (5-minute TTL)
- ✅ Comprehensive unit and integration tests

### 📋 Phase 5: Aggregator & Optimizer (Planned)
- [ ] Yield aggregator (combines all protocols)
- [ ] Optimization engine
- [ ] Rebalancing logic

### 📋 Phase 6: API & MCP Integration (Planned)
- [ ] REST API endpoints
- [ ] MCP server for AI agents

## Contributing

This is part of the Proxify monorepo. See main README for contribution guidelines.

## License

MIT
