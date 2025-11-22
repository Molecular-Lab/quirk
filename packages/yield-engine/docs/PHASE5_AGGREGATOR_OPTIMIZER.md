# Phase 5: Aggregator & Optimizer Implementation Guide

> Multi-protocol yield aggregation and optimization for @proxify/yield-engine

## Table of Contents

- [Introduction](#introduction)
- [Architecture Overview](#architecture-overview)
- [YieldAggregator](#yieldaggregator)
- [YieldOptimizer](#yieldoptimizer)
- [Optimization Strategies](#optimization-strategies)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Best Practices](#best-practices)

---

## Introduction

### What is Phase 5?

Phase 5 completes the yield-engine package by adding multi-protocol aggregation and optimization capabilities on top of the existing protocol adapters:

- **Phase 1-4**: Individual protocol adapters (AAVE, Compound, Morpho)
- **Phase 5**: Aggregation layer that combines all protocols + Optimization engine

### Key Features

- **YieldAggregator**: Fetches and combines yields from all protocols in parallel
- **YieldOptimizer**: Analyzes positions and recommends optimal allocations
- **Three Optimization Strategies**:
  - Highest Yield: Maximum APY focus
  - Risk-Adjusted: TVL and trust-weighted optimization
  - Gas-Aware: Considers transaction costs in recommendations

### Files Created

```
src/aggregator/
├── aggregator.types.ts      # Type definitions
├── yield-aggregator.ts      # Main aggregator class
└── aggregator.test.ts       # Test suite

src/optimizer/
├── optimizer.types.ts       # Type definitions
├── yield-optimizer.ts       # Main optimizer class
├── optimizer.test.ts        # Test suite
└── strategies/
    ├── index.ts             # Strategy exports
    ├── highest-yield.ts     # Highest APY strategy
    ├── risk-adjusted.ts     # Risk-weighted strategy
    └── gas-aware.ts         # Gas cost aware strategy

src/index.ts                 # Updated exports
```

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      YieldOptimizer                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  YieldAggregator                     │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐         │    │
│  │  │   AAVE    │ │ Compound  │ │  Morpho   │         │    │
│  │  │  Adapter  │ │  Adapter  │ │  Adapter  │         │    │
│  │  └───────────┘ └───────────┘ └───────────┘         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Optimization Strategies                 │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐      │    │
│  │  │  Highest   │ │   Risk     │ │    Gas     │      │    │
│  │  │   Yield    │ │  Adjusted  │ │   Aware    │      │    │
│  │  └────────────┘ └────────────┘ └────────────┘      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Request**: User asks for optimization of their USDC position
2. **Aggregation**: YieldAggregator fetches opportunities from all protocols in parallel
3. **Strategy Selection**: Optimizer applies the selected strategy to rank opportunities
4. **Analysis**: Compares current position against best opportunities
5. **Recommendation**: Returns action (hold/rebalance) with detailed analysis

---

## YieldAggregator

### Purpose

The `YieldAggregator` class fetches and combines yield data from all supported protocols (AAVE, Compound, Morpho) in parallel, providing a unified view of available opportunities.

### Key Methods

```typescript
class YieldAggregator {
  // Fetch all opportunities for a token across all protocols
  fetchAllOpportunities(token: string, chainId: number, filter?: OpportunityFilter): Promise<AggregatedOpportunities>

  // Get the single best opportunity
  getBestOpportunity(token: string, chainId: number): Promise<YieldOpportunity | null>

  // Fetch opportunities for multiple tokens
  fetchOpportunitiesForTokens(tokens: string[], chainId: number): Promise<YieldOpportunity[]>

  // Get user's positions across all protocols
  getAllPositions(walletAddress: string, chainId: number, tokens?: string[]): Promise<AggregatedPositions>

  // Get combined metrics for all protocols
  getAggregatedMetrics(chainId: number): Promise<AggregatedMetrics>

  // Compare two protocols for a token
  compareProtocols(token: string, chainId: number, protocol1: Protocol, protocol2: Protocol): Promise<ComparisonResult>
}
```

### Configuration

```typescript
const aggregator = new YieldAggregator({
  // Include only specific protocols
  protocols: ['aave', 'compound'], // Default: all three

  // Exclude specific protocols
  excludeProtocols: ['morpho'],

  // Minimum TVL filter
  minTVL: '100000000', // $100M

  // Cache TTL (default: 2 minutes)
  cacheTTL: 2 * 60 * 1000,

  // Include unhealthy protocols
  includeUnhealthy: false,
})
```

### Return Types

#### AggregatedOpportunities

```typescript
interface AggregatedOpportunities {
  opportunities: YieldOpportunity[]  // All opportunities, sorted by APY
  best: YieldOpportunity | null      // Highest APY
  worst: YieldOpportunity | null     // Lowest APY
  apySpread: string                  // Difference between best and worst
  successfulProtocols: number        // Count of protocols that returned data
  failedProtocols: number            // Count of failed protocol calls
  errors: { protocol: Protocol; error: string }[]
  timestamp: number
}
```

#### AggregatedPositions

```typescript
interface AggregatedPositions {
  positions: ProtocolPosition[]      // All positions across protocols
  totalValueUSD: string              // Sum of all position values
  weightedAvgAPY: string             // Value-weighted average APY
  bestPosition: ProtocolPosition | null
  totalYieldEarned: string
  protocolCount: number              // Unique protocols with positions
  timestamp: number
}
```

---

## YieldOptimizer

### Purpose

The `YieldOptimizer` analyzes user positions and provides actionable recommendations for yield optimization, considering factors like APY improvement, risk profiles, and gas costs.

### Key Methods

```typescript
class YieldOptimizer {
  // Main optimization method
  optimizePosition(
    walletAddress: string,
    token: string,
    chainId: number,
    riskProfile?: Partial<RiskProfile>,
    strategyName?: OptimizationStrategy
  ): Promise<ExtendedOptimizationResult>

  // Get detailed rebalance recommendation with gas analysis
  getRebalanceRecommendation(
    currentPosition: ProtocolPosition,
    token: string,
    chainId: number,
    rebalanceConfig?: Partial<RebalanceConfig>,
    gasPriceGwei?: number,
    ethPriceUSD?: number
  ): Promise<ExtendedOptimizationResult>

  // Simple boolean check for rebalancing
  isRebalanceWorthIt(
    currentAPY: string,
    newAPY: string,
    positionValueUSD: string,
    estimatedGasCostUSD: string,
    config?: Partial<RebalanceConfig>
  ): boolean

  // Estimate break-even period
  estimateBreakEvenDays(
    apyDelta: string,
    positionValueUSD: string,
    gasCostUSD: string
  ): number

  // Compare position against opportunities
  comparePosition(
    currentPosition: ProtocolPosition,
    token: string,
    chainId: number
  ): Promise<PositionComparison | null>

  // Get available strategies
  getAvailableStrategies(): OptimizationStrategy[]
}
```

### Configuration

```typescript
const optimizer = new YieldOptimizer({
  // Default strategy
  defaultStrategy: 'highest-yield', // or 'risk-adjusted', 'gas-aware'

  // Default risk profile
  defaultRiskProfile: {
    level: 'moderate', // 'conservative' | 'moderate' | 'aggressive'
    maxSlippage: 0.5,
    minProtocolTVL: '100000000',
  },

  // Default rebalance configuration
  defaultRebalanceConfig: {
    minApyDelta: 1.0,      // Minimum 1% APY improvement required
    minGainThreshold: '10', // Minimum $10 net gain required
    maxGasCostUSD: '50',    // Maximum acceptable gas cost
    cooldownHours: 24,      // Minimum hours between rebalances
    enabled: true,
  },

  // Cache TTL
  cacheTTL: 2 * 60 * 1000,
})
```

### Return Types

#### ExtendedOptimizationResult

```typescript
interface ExtendedOptimizationResult extends OptimizationResult {
  action: 'hold' | 'rebalance'
  currentProtocol?: string
  currentAPY?: string
  recommendedProtocol?: string
  recommendedAPY?: string
  apyDelta: string                    // APY improvement
  estimatedMonthlyGain: string
  estimatedAnnualGain: string
  estimatedGasCost?: string           // Gas cost (gas-aware strategy)
  netGainAfterGas?: string
  reason: string                      // Human-readable explanation
  timestamp: number

  // Extended fields
  strategy: OptimizationStrategy      // Strategy used
  rankedOpportunities: YieldOpportunity[]
  confidence: number                  // 0-100 confidence score
  warnings: string[]                  // Risk warnings
  breakEvenDays?: number              // Days until gas is recovered
}
```

---

## Optimization Strategies

### 1. Highest Yield Strategy

**Purpose**: Maximizes APY without additional risk weighting.

**Best For**: Users who want maximum returns and trust all supported protocols equally.

```typescript
import { HighestYieldStrategy } from '@proxify/yield-engine'

const strategy = new HighestYieldStrategy()
const ranked = strategy.rankOpportunities(opportunities, riskProfile)
// ranked[0] is the highest APY opportunity
```

**Behavior**:
- Ranks purely by APY (descending)
- Applies basic filters from risk profile (excluded protocols, min TVL)
- Recommends rebalance when APY delta exceeds threshold

### 2. Risk-Adjusted Strategy

**Purpose**: Balances yield with risk factors like TVL and protocol trust.

**Best For**: Users who want solid returns while considering safety.

```typescript
import { RiskAdjustedStrategy } from '@proxify/yield-engine'

const strategy = new RiskAdjustedStrategy()
const ranked = strategy.rankOpportunities(opportunities, {
  level: 'conservative', // Uses stricter TVL filters
})
```

**Behavior**:
- Calculates weighted score: APY + TVL + Protocol Trust
- Conservative: Heavy TVL weight, $200M min TVL, filters >15% APY
- Moderate: Balanced weights, $50M min TVL
- Aggressive: Heavy APY weight, $10M min TVL

**Protocol Trust Scores**:
| Protocol | Trust Score |
|----------|-------------|
| AAVE     | 95          |
| Compound | 90          |
| Morpho   | 85          |

### 3. Gas-Aware Strategy

**Purpose**: Considers transaction costs when recommending rebalancing.

**Best For**: Smaller positions where gas costs are significant.

```typescript
import { GasAwareStrategy } from '@proxify/yield-engine'

const strategy = new GasAwareStrategy()

// Estimate gas cost
const gasEstimate = strategy.estimateGasCost('compound', 'aave', 30, 3000)
// { gasUnits: 465000, gasCostUSD: "41.85", ... }

// Calculate break-even
const breakEvenDays = strategy.calculateBreakEvenDays(1.5, 10000, 40)
// ~97 days
```

**Behavior**:
- Estimates gas for withdraw + approve + deposit
- Calculates break-even period
- Only recommends if:
  - Gas cost < maxGasCostUSD
  - Break-even < 90 days
  - 30-day net gain > minGainThreshold

**Gas Estimates by Protocol**:
| Protocol | Withdraw | Deposit |
|----------|----------|---------|
| AAVE     | 200,000  | 250,000 |
| Compound | 150,000  | 200,000 |
| Morpho   | 180,000  | 220,000 |

---

## Usage Examples

### Basic Aggregation

```typescript
import { YieldAggregator } from '@proxify/yield-engine'

const aggregator = new YieldAggregator()

// Get all USDC opportunities on Ethereum
const result = await aggregator.fetchAllOpportunities('USDC', 1)

console.log(`Best APY: ${result.best?.supplyAPY}% on ${result.best?.protocol}`)
console.log(`APY Spread: ${result.apySpread}%`)

// Output:
// Best APY: 6.50% on morpho
// APY Spread: 1.70%
```

### Position Optimization

```typescript
import { YieldOptimizer } from '@proxify/yield-engine'

const optimizer = new YieldOptimizer()

// Optimize user's USDC position
const result = await optimizer.optimizePosition(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'USDC',
  1,
  { level: 'moderate' }
)

if (result.action === 'rebalance') {
  console.log(`Move to ${result.recommendedProtocol}`)
  console.log(`APY improvement: +${result.apyDelta}%`)
  console.log(`Estimated annual gain: $${result.estimatedAnnualGain}`)
}
```

### Gas-Aware Decision

```typescript
import { YieldOptimizer } from '@proxify/yield-engine'

const optimizer = new YieldOptimizer({
  defaultStrategy: 'gas-aware',
})

// Check if rebalancing is worth it
const isWorth = optimizer.isRebalanceWorthIt(
  '4.00',   // current APY
  '6.00',   // new APY
  '50000',  // $50k position
  '30',     // $30 estimated gas
)

if (isWorth) {
  const breakEven = optimizer.estimateBreakEvenDays('2.00', '50000', '30')
  console.log(`Break-even in ${breakEven} days`)
}
```

### Multi-Token Comparison

```typescript
import { YieldAggregator } from '@proxify/yield-engine'

const aggregator = new YieldAggregator()

// Compare USDC and USDT opportunities
const opportunities = await aggregator.fetchOpportunitiesForTokens(
  ['USDC', 'USDT'],
  1
)

// Already sorted by APY
console.log(`Top opportunity: ${opportunities[0].token} on ${opportunities[0].protocol}`)
```

### Protocol Comparison

```typescript
import { YieldAggregator } from '@proxify/yield-engine'

const aggregator = new YieldAggregator()

const comparison = await aggregator.compareProtocols('USDC', 1, 'aave', 'compound')

console.log(`Winner: ${comparison.winner}`)
console.log(`APY Difference: ${comparison.apyDifference}%`)
```

---

## API Reference

### Types

```typescript
// Strategy names
type OptimizationStrategy = 'highest-yield' | 'risk-adjusted' | 'gas-aware'

// Risk levels
type RiskLevel = 'conservative' | 'moderate' | 'aggressive'

// Protocols
type Protocol = 'aave' | 'compound' | 'morpho'

// Chains
type ChainId = 1 | 137 | 8453 | 42161 // Ethereum, Polygon, Base, Arbitrum
```

### Risk Profile

```typescript
interface RiskProfile {
  level: 'conservative' | 'moderate' | 'aggressive'
  maxSlippage: number              // Default: 0.5 (0.5%)
  preferredProtocols?: Protocol[]  // Only consider these
  excludedProtocols?: Protocol[]   // Never consider these
  minProtocolTVL: string           // Default: '100000000' ($100M)
  rebalanceConfig?: RebalanceConfig
}
```

### Rebalance Config

```typescript
interface RebalanceConfig {
  minApyDelta: number      // Minimum APY improvement (default: 1.0)
  minGainThreshold: string // Minimum net gain USD (default: '10')
  maxGasCostUSD: string    // Maximum gas cost (default: '50')
  cooldownHours: number    // Hours between rebalances (default: 24)
  enabled: boolean         // Enable/disable rebalancing (default: true)
}
```

### Strategy Interface

```typescript
interface IOptimizationStrategy {
  readonly name: OptimizationStrategy

  rankOpportunities(
    opportunities: YieldOpportunity[],
    riskProfile: RiskProfile
  ): YieldOpportunity[]

  shouldRebalance(input: OptimizationInput): boolean

  calculateConfidence(
    input: OptimizationInput,
    recommendedOpportunity: YieldOpportunity
  ): number
}
```

---

## Testing

### Running Tests

```bash
# Run all yield-engine tests
pnpm test

# Run specific test files
pnpm test aggregator
pnpm test optimizer

# Run with verbose output
pnpm test --reporter=verbose
```

### Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| YieldAggregator | 12 | ✅ |
| YieldOptimizer | 10 | ✅ |
| HighestYieldStrategy | 7 | ✅ |
| RiskAdjustedStrategy | 4 | ✅ |
| GasAwareStrategy | 6 | ✅ |

### Integration Tests

Integration tests make real network calls and may timeout. Run with:

```bash
pnpm test aggregator.integration --run
```

#### Slowest Tests Analysis

Based on live test runs (27 total tests, ~100 seconds total):

| Test | Time | Root Cause |
|------|------|------------|
| `gas-aware strategy` | 61.5s | **Cache cleared** + fetches from all 3 protocols. After clearing cache, all data must be refetched from scratch. |
| `multi-chain USDC APY` | 10s | **4 chains × 3 protocols** = 12 network calls minimum. Each chain has its own RPC endpoint. |
| `USDC opportunities on Base` | 8.2s | **Base chain + Morpho GraphQL** can be slower. Morpho's subgraph on Base may have higher latency. |
| `risk-adjusted strategy` | 4.7s | **Cache cleared** before test to ensure fresh strategy results. |
| `complete yield report` | 4.2s | Multiple aggregator calls: USDC opps + USDT opps + metrics + optimization. |
| `Morpho USDT APY (V2)` | 2.4s | **GraphQL API latency**. Morpho uses subgraph queries which can be slower than direct RPC. |

#### Performance Bottlenecks

1. **Morpho GraphQL API** (~800ms-2.5s per call)
   - Uses The Graph subgraph for vault data
   - Higher latency than direct RPC calls
   - Fetches vault allocations, APYs, and market data

2. **Multi-Chain Calls** (sequential or parallel)
   - Each chain requires separate RPC connections
   - Different chains have varying RPC speeds
   - Base and Arbitrum often slower than Ethereum mainnet

3. **Cache Clearing** (forces refetch)
   - When cache is cleared between tests, all protocol data must be refetched
   - Each protocol adapter makes 1-3 RPC/API calls
   - Total: 9+ network calls for 3 protocols

4. **AAVE Math Utils** (~300-500ms)
   - Uses @aave/math-utils for APY calculations
   - Requires fetching reserve data + formatting

#### Why Certain Tests Are Fast

| Test | Time | Reason |
|------|------|--------|
| `highest-yield strategy` | 426ms | Uses cached data from previous tests |
| `get best USDC opportunity` | ~300ms | Cached aggregator result |
| `AAVE USDC APY` | 357ms | Single protocol, direct RPC |
| `Compound Base APY` | 511ms | Single protocol, direct RPC |

#### Recommendations

1. **Don't clear cache unnecessarily** - Tests using cached data are 10-100x faster
2. **Use longer timeouts for multi-chain tests** - Set to 120s for 4+ chain tests
3. **Run integration tests separately** - `pnpm test aggregator.integration --run`
4. **Consider mocking for unit tests** - Use mocked data for strategy testing

Expected behavior:
- First call (cold cache): 1-5 seconds per protocol
- Cached calls: < 10ms
- Multi-chain queries: 8-15 seconds

---

## Best Practices

### 1. Use Appropriate Strategy

| Use Case | Recommended Strategy |
|----------|---------------------|
| Large positions ($100k+) | highest-yield |
| Risk-conscious users | risk-adjusted (conservative) |
| Small positions (<$10k) | gas-aware |
| DeFi natives | highest-yield (aggressive) |
| New users | risk-adjusted (moderate) |

### 2. Configure Appropriate Thresholds

```typescript
// For small positions, increase minApyDelta
const optimizer = new YieldOptimizer({
  defaultRebalanceConfig: {
    minApyDelta: 2.0, // Require 2% improvement for small positions
  },
})

// For large positions, can be more aggressive
const optimizer = new YieldOptimizer({
  defaultRebalanceConfig: {
    minApyDelta: 0.5, // Accept 0.5% improvement for large positions
  },
})
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await optimizer.optimizePosition(wallet, 'USDC', 1)
} catch (error) {
  if (error.name === 'ProtocolError') {
    // One protocol failed, others may still work
    console.log(`Protocol ${error.protocol} failed: ${error.message}`)
  }
}
```

### 4. Cache Considerations

- Aggregator cache TTL: 2 minutes (configurable)
- Individual protocol cache: 5 minutes
- Clear cache when you need fresh data:

```typescript
aggregator.clearCache()
optimizer.clearCache()
```

### 5. Gas Price Awareness

```typescript
// Fetch current gas price before optimization
const gasPrice = await getGasPrice(1) // From utils/rpc.ts

const result = await optimizer.getRebalanceRecommendation(
  position,
  'USDC',
  1,
  undefined,
  gasPrice, // Use current gas price
  3000,     // Current ETH price
)
```

---

## Summary

### Phase 5 Accomplishments

1. ✅ **YieldAggregator**: Parallel fetching from all protocols with error handling
2. ✅ **YieldOptimizer**: Position analysis and recommendation engine
3. ✅ **Three Strategies**: Highest-yield, risk-adjusted, gas-aware
4. ✅ **Gas Analysis**: Break-even calculations and cost estimation
5. ✅ **Risk Profiles**: Conservative, moderate, aggressive settings
6. ✅ **Caching**: 2-minute TTL for aggregated data
7. ✅ **Comprehensive Tests**: Unit and integration tests

### Performance Metrics

| Operation | Expected Time |
|-----------|---------------|
| fetchAllOpportunities | 1-3 seconds |
| getBestOpportunity | 1-3 seconds |
| optimizePosition | 2-5 seconds |
| Cached calls | < 10ms |

### Next Steps (Phase 6)

- REST API endpoints for yield-engine
- MCP server for AI agent integration
- Real-time yield monitoring
- Transaction builder for rebalancing

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Status**: ✅ Phase 5 Complete
