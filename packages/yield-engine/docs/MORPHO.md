# Morpho Protocol Implementation Guide

> Comprehensive documentation for the Morpho protocol adapter in @quirk/yield-engine

## Table of Contents

- [Introduction](#introduction)
- [Architecture Overview](#architecture-overview)
- [V1 vs V2 Vault Differences](#v1-vs-v2-vault-differences)
- [Implementation Details](#implementation-details)
- [GraphQL API Integration](#graphql-api-integration)
- [Usage Examples](#usage-examples)
- [Important Gotchas](#important-gotchas)
- [Testing & Verification](#testing--verification)
- [References](#references)

---

## Introduction

### What is Morpho?

Morpho is a next-generation lending protocol that optimizes lending positions by matching peer-to-peer when possible, and falling back to underlying lending pools (like AAVE or Compound) when no matches are found. This creates an efficient hybrid model that delivers better rates than traditional lending protocols.

**MetaMorpho** is Morpho's vault system that automates capital allocation across multiple Morpho Blue markets, providing:
- Automated yield optimization
- Risk-adjusted returns
- Professional vault management
- ERC-4626 compliance

### Purpose in yield-engine

The Morpho adapter (`MorphoAdapter`) provides:
- ✅ Real-time supply APY data from MetaMorpho vaults
- ✅ Support for both V1 and V2 vault APIs
- ✅ User position tracking via vault shares (ERC-4626)
- ✅ Vault metrics (TVL, APY, utilization)
- ✅ Protocol-wide health monitoring
- ✅ Access to $148M+ in prime vault opportunities

### Supported Chains & Tokens

| Chain | Chain ID | Supported Tokens | Vault Version | Status |
|-------|----------|------------------|---------------|--------|
| **Ethereum** | 1 | USDC | V1 (Gauntlet USDC Prime) | ✅ Live |
| **Ethereum** | 1 | USDT | V2 (Re7 USDT) | ✅ Live |
| **Base** | 8453 | USDC | V2 (Re7 USDC) | ✅ Live |

**Notable Vaults**:
- **Gauntlet USDC Prime** (V1): $148M+ TVL, 3-4% APY
- **Re7 USDT** (V2): High-quality institutional grade vault
- **Re7 USDC** (V2, Base): 7%+ APY on Base chain

---

## Architecture Overview

### MetaMorpho Vault System

Morpho uses **MetaMorpho vaults** (ERC-4626 compliant) that automatically allocate capital across multiple Morpho Blue markets:

```
┌─────────────────────────────────────────┐
│   MetaMorpho Vault Architecture         │
├─────────────────────────────────────────┤
│                                         │
│  MetaMorpho Vault (ERC-4626)           │
│  ├─ Users deposit USDC                 │
│  ├─ Receive vault shares                │
│  └─ Vault allocates to markets:        │
│     ├─ Morpho Blue Market #1 (60%)     │
│     ├─ Morpho Blue Market #2 (30%)     │
│     └─ Morpho Blue Market #3 (10%)     │
│                                         │
│  Shares auto-appreciate via:            │
│  - Lending interest from markets        │
│  - Automated rebalancing                │
│  - Risk-adjusted allocation             │
└─────────────────────────────────────────┘
```

**Key Components**:
1. **Morpho Blue**: Core lending protocol (singleton at `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`)
2. **MetaMorpho Vaults**: ERC-4626 vaults that manage allocations
3. **Curators**: Entities that manage vault strategies (e.g., Gauntlet, Re7 Labs)

### ERC-4626 Vault Mechanics

MetaMorpho vaults follow the ERC-4626 standard:

```typescript
// Deposit flow
User deposits USDC → Vault mints shares
shares = assets * totalSupply / totalAssets

// Withdrawal flow
User burns shares → Receives USDC back
assets = shares * totalAssets / totalSupply

// Interest accrual
totalAssets increases over time
→ Share value appreciates automatically
→ convertToAssets(shares) returns more USDC
```

**No Rebasing**: Unlike Compound V3, vault shares are static. Interest accrues via increasing `totalAssets`, making shares worth more over time.

### Morpho Blue Markets

Each Morpho Blue market is defined by unique parameters:

```typescript
interface MorphoMarketParams {
  loanToken: string        // Asset being lent (e.g., USDC)
  collateralToken: string  // Collateral asset (e.g., WETH)
  oracle: string           // Price oracle address
  irm: string             // Interest rate model
  lltv: bigint            // Liquidation LTV (in WAD)
}
```

Markets are identified by hash of these parameters (`keccak256(params)`).

---

## V1 vs V2 Vault Differences

Morpho has two coexisting vault API versions with different capabilities and data availability.

### API Comparison

| Feature | V1 Vaults | V2 Vaults |
|---------|-----------|-----------|
| **GraphQL Query** | `vaultByAddress(address)` | `vaultV2ByAddress(address, chainId)` |
| **Chain ID** | Not required | Required parameter |
| **APY Field** | `state.netApy` | `avgNetApy` |
| **Market Allocation** | Allocates to Morpho Markets V1 | Uses adapters for flexibility |
| **Notable Vaults** | Gauntlet USDC Prime ($148M) | Re7 vaults, Steakhouse |
| **TVL** | Higher (established vaults) | Growing (newer vaults) |

### Example Vaults

**V1 Vaults (Legacy, but high TVL)**:
- **Gauntlet USDC Prime** (Ethereum)
  - Address: `0xdd0f28e19C1780eb6396170735D45153D261490d`
  - TVL: $148M+
  - APY: 3-4%
  - Focus: Conservative, institutional-grade

**V2 Vaults (Modern architecture)**:
- **Re7 USDT** (Ethereum)
  - Address: `0x1CE2354074C717a266aDADCD5e34104f233Da446`
  - APY: 3-4%
  - Focus: Risk-optimized USDT yields

- **Re7 USDC** (Base)
  - Address: `0x618495ccC4e751178C4914b1E939C0fe0FB07b9b`
  - TVL: $1.2M+
  - APY: 7%+
  - Focus: High yield on Base L2

### Why Support Both?

**V1 vaults offer**:
- Access to mature, high-TVL opportunities
- Proven track record
- Lower risk profiles

**V2 vaults offer**:
- More flexibility in allocations
- Newer, potentially higher yields
- Better chain support

**Our adapter automatically routes** to the correct API based on the `version` field in vault configuration.

---

## Implementation Details

### File Structure

```
src/protocols/morpho/
├── morpho.adapter.ts      # Main adapter with V1/V2 routing
├── morpho.constants.ts    # Vault configurations
├── morpho.types.ts        # TypeScript types
├── morpho.abi.ts          # MetaMorpho vault ABI
└── morpho.test.ts         # Comprehensive tests
```

### Core Type Definitions

```typescript
// Vault version type
export type VaultVersion = 'v1' | 'v2'

// Vault configuration
export interface MorphoMarketConfig {
  version: VaultVersion              // API version to use
  chainId: number
  vaultAddress: string               // ERC-4626 vault address
  vaultId?: string                   // Only for V1 (address-chainId)
  vaultName: string                  // Human-readable name
  baseToken: string                  // Token symbol (USDC, USDT)
  baseTokenAddress: string           // Token contract address
  baseTokenDecimals: number          // Usually 6 for stablecoins
}
```

### Vault Configuration

Located in `morpho.constants.ts`:

```typescript
export const MORPHO_VAULTS: Record<number, Record<string, MorphoMarketConfig>> = {
  // Ethereum Mainnet
  1: {
    USDC: {
      version: 'v1',
      chainId: 1,
      vaultAddress: '0xdd0f28e19C1780eb6396170735D45153D261490d',
      vaultId: '0xdd0f28e19c1780eb6396170735d45153d261490d-1',
      vaultName: 'Gauntlet USDC Prime',
      baseToken: 'USDC',
      baseTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      baseTokenDecimals: 6,
    },
    USDT: {
      version: 'v2',
      chainId: 1,
      vaultAddress: '0x1CE2354074C717a266aDADCD5e34104f233Da446',
      vaultName: 'Re7 USDT',
      baseToken: 'USDT',
      baseTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      baseTokenDecimals: 6,
    },
  },
  // Base
  8453: {
    USDC: {
      version: 'v2',
      chainId: 8453,
      vaultAddress: '0x618495ccC4e751178C4914b1E939C0fe0FB07b9b',
      vaultName: 'Re7 USDC',
      baseToken: 'USDC',
      baseTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      baseTokenDecimals: 6,
    },
  },
}
```

### Adapter Architecture

The `MorphoAdapter` class implements the `IProtocolAdapter` interface:

```typescript
export class MorphoAdapter implements IProtocolAdapter {
  // Standard methods
  getProtocolName(): Protocol
  async getSupplyAPY(token: string, chainId: number): Promise<string>
  async getUserPosition(...): Promise<ProtocolPosition | null>
  async getMetrics(token: string, chainId: number): Promise<YieldOpportunity>
  async getProtocolMetrics(chainId: number): Promise<ProtocolMetrics>
  async supportsToken(token: string, chainId: number): Promise<boolean>

  // Private helpers
  private async fetchAPYFromAPI(vaultAddress, chainId): Promise<string>
  private async fetchAPYFromAPI_V1(vaultAddress): Promise<string>
  private async fetchAPYFromAPI_V2(vaultAddress, chainId): Promise<string>
}
```

### Version Routing Logic

The adapter automatically detects vault version and routes to the correct API:

```typescript
private async fetchAPYFromAPI(
  vaultAddress: string,
  chainId: number,
): Promise<string> {
  // Find vault config by address
  const supportedTokens = getSupportedTokens(chainId)
  let config: any
  for (const token of supportedTokens) {
    const tokenConfig = getTokenInfo(token, chainId)
    if (tokenConfig?.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()) {
      config = tokenConfig
      break
    }
  }

  if (!config) {
    throw new Error(`Vault config not found for address: ${vaultAddress}`)
  }

  // Route to correct API version
  if (config.version === 'v1') {
    return this.fetchAPYFromAPI_V1(vaultAddress)
  } else {
    return this.fetchAPYFromAPI_V2(vaultAddress, chainId)
  }
}
```

### User Position Tracking

Positions are tracked via ERC-4626 vault shares:

```typescript
async getUserPosition(
  walletAddress: string,
  token: string,
  chainId: number,
): Promise<ProtocolPosition | null> {
  // 1. Get vault configuration
  const vaultConfig = getTokenInfo(token, chainId)

  // 2. Read user's vault shares
  const shares = await client.readContract({
    address: vaultAddress,
    abi: METAMORPHO_VAULT_ABI,
    functionName: 'balanceOf',
    args: [walletAddress],
  })

  if (shares === 0n) return null

  // 3. Convert shares to underlying assets
  const assets = await client.readContract({
    address: vaultAddress,
    abi: METAMORPHO_VAULT_ABI,
    functionName: 'convertToAssets',
    args: [shares],
  })

  // 4. Format and return position
  return {
    protocol: 'morpho',
    token: vaultConfig.baseToken,
    amount: assets.toString(),
    amountFormatted: formatAmount(assets, decimals),
    valueUSD: amountFormatted, // 1:1 for stablecoins
    apy: await this.getSupplyAPY(token, chainId),
  }
}
```

**Key Functions**:
- `balanceOf(address)`: Returns vault shares owned
- `convertToAssets(shares)`: Converts shares to underlying tokens
- Shares are static, but worth more over time as `totalAssets` increases

---

## GraphQL API Integration

### API Endpoint

All Morpho data is fetched from the official GraphQL API:

```
https://api.morpho.org/graphql
```

### V1 Vault Query

For V1 vaults (e.g., Gauntlet USDC Prime):

```graphql
query {
  vaultByAddress(address: "0xdd0f28e19C1780eb6396170735D45153D261490d") {
    state {
      netApy
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "vaultByAddress": {
      "state": {
        "netApy": 0.0395  // 3.95% APY
      }
    }
  }
}
```

**Implementation**:
```typescript
private async fetchAPYFromAPI_V1(vaultAddress: string): Promise<string> {
  const query = `query {
    vaultByAddress(address: "${vaultAddress}") {
      state { netApy }
    }
  }`

  const response = await fetch('https://api.morpho.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const json = await response.json()

  if (json.errors) {
    throw new Error(`Morpho API error: ${json.errors[0].message}`)
  }

  if (!json.data?.vaultByAddress?.state) {
    throw new Error(`V1 Vault not found: ${vaultAddress}`)
  }

  // Convert decimal to percentage (0.0395 → "3.95")
  const apyPercent = (json.data.vaultByAddress.state.netApy * 100).toFixed(2)
  return apyPercent
}
```

### V2 Vault Query

For V2 vaults (e.g., Re7 USDT):

```graphql
query {
  vaultV2ByAddress(
    address: "0x1CE2354074C717a266aDADCD5e34104f233Da446"
    chainId: 1
  ) {
    avgNetApy
  }
}
```

**Response**:
```json
{
  "data": {
    "vaultV2ByAddress": {
      "avgNetApy": 0.0366  // 3.66% APY
    }
  }
}
```

**Implementation**:
```typescript
private async fetchAPYFromAPI_V2(
  vaultAddress: string,
  chainId: number,
): Promise<string> {
  const query = `query {
    vaultV2ByAddress(address: "${vaultAddress}", chainId: ${chainId}) {
      avgNetApy
    }
  }`

  const response = await fetch('https://api.morpho.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const json = await response.json()

  if (json.errors) {
    throw new Error(`Morpho API error: ${json.errors[0].message}`)
  }

  if (!json.data?.vaultV2ByAddress) {
    throw new Error(`V2 Vault not found: ${vaultAddress} on chain ${chainId}`)
  }

  // Convert decimal to percentage (0.0366 → "3.66")
  const apyPercent = (json.data.vaultV2ByAddress.avgNetApy * 100).toFixed(2)
  return apyPercent
}
```

### Key Differences

| Aspect | V1 API | V2 API |
|--------|--------|--------|
| **Query Name** | `vaultByAddress` | `vaultV2ByAddress` |
| **Parameters** | `address` only | `address` + `chainId` |
| **APY Path** | `state.netApy` | `avgNetApy` |
| **Chain Support** | Ethereum only | Multi-chain |

### Error Handling

Common errors and how we handle them:

```typescript
// Error: Unknown argument "id" on field "Query.vaultByAddress"
// Fix: Use "address" parameter, not "id"
❌ vaultByAddress(id: "${vaultId}")
✅ vaultByAddress(address: "${vaultAddress}")

// Error: No results matching given parameters
// Fix: Vault might not exist in that API version
// Check if vault is V1 or V2, or try different vault
```

### Caching Strategy

All GraphQL responses are cached for 5 minutes:

```typescript
const cacheKey = generateCacheKey('morpho', 'supplyAPY', token, chainId)
const cached = globalCache.get<string>(cacheKey)
if (cached) {
  return cached
}

// Fetch from API...
globalCache.set(cacheKey, apy, MORPHO_CACHE_TTL) // 5 minutes
```

---

## Usage Examples

### Basic APY Fetching

```typescript
import { MorphoAdapter } from '@quirk/yield-engine'

// Initialize adapter
const morpho = new MorphoAdapter(1) // Ethereum

// Get USDC APY (from V1 Gauntlet vault)
const usdcApy = await morpho.getSupplyAPY('USDC', 1)
console.log(`Morpho USDC APY: ${usdcApy}%`) // e.g., "3.95%"

// Get USDT APY (from V2 Re7 vault)
const usdtApy = await morpho.getSupplyAPY('USDT', 1)
console.log(`Morpho USDT APY: ${usdtApy}%`) // e.g., "3.66%"

// Base chain USDC (V2)
const baseMorpho = new MorphoAdapter(8453)
const baseApy = await baseMorpho.getSupplyAPY('USDC', 8453)
console.log(`Base USDC APY: ${baseApy}%`) // e.g., "7.02%"
```

### User Position Tracking

```typescript
const morpho = new MorphoAdapter(1)
const userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

// Get user's USDC position
const position = await morpho.getUserPosition(userAddress, 'USDC', 1)

if (position) {
  console.log({
    protocol: position.protocol,        // 'morpho'
    token: position.token,              // 'USDC'
    amountFormatted: position.amountFormatted, // '1000.00'
    valueUSD: position.valueUSD,        // '1000.00'
    apy: position.apy,                  // '3.95'
  })
} else {
  console.log('No position found')
}
```

### Vault Metrics

```typescript
const morpho = new MorphoAdapter(1)

// Get detailed vault metrics
const metrics = await morpho.getMetrics('USDC', 1)

console.log({
  protocol: metrics.protocol,          // 'morpho'
  token: metrics.token,                // 'USDC'
  supplyAPY: metrics.supplyAPY,        // '3.95'
  tvl: metrics.tvl,                    // '148674842.22'
  liquidity: metrics.liquidity,        // '148674842.22'
  utilization: metrics.utilization,    // '0.00'
  metadata: {
    vaultAddress: metrics.metadata.vaultAddress,
    vaultName: metrics.metadata.vaultName,  // 'Gauntlet USDC Prime'
    totalAssets: metrics.metadata.totalAssets,
  }
})
```

### Protocol-Wide Metrics

```typescript
const morpho = new MorphoAdapter(1)

// Get overall protocol health for Ethereum
const protocolMetrics = await morpho.getProtocolMetrics(1)

console.log({
  protocol: protocolMetrics.protocol,           // 'morpho'
  chainId: protocolMetrics.chainId,             // 1
  tvlUSD: protocolMetrics.tvlUSD,               // '148674842.33'
  availableLiquidityUSD: protocolMetrics.availableLiquidityUSD,
  avgSupplyAPY: protocolMetrics.avgSupplyAPY,   // '3.81'
  isHealthy: protocolMetrics.isHealthy,         // true
})
```

### Multi-Chain Support

```typescript
// Compare yields across chains
const ethMorpho = new MorphoAdapter(1)
const baseMorpho = new MorphoAdapter(8453)

const [ethApy, baseApy] = await Promise.all([
  ethMorpho.getSupplyAPY('USDC', 1),
  baseMorpho.getSupplyAPY('USDC', 8453),
])

console.log(`Ethereum USDC: ${ethApy}%`)  // "3.95%"
console.log(`Base USDC: ${baseApy}%`)      // "7.02%"
// Base typically has higher yields due to L2 efficiency
```

### Token Support Checking

```typescript
const morpho = new MorphoAdapter(1)

// Check if token is supported
const supportsUSDC = await morpho.supportsToken('USDC', 1)  // true
const supportsDAI = await morpho.supportsToken('DAI', 1)    // false

// Get all supported tokens for a chain
import { getSupportedTokens } from '@quirk/yield-engine'
const tokens = getSupportedTokens(1)
console.log(tokens) // ['USDC', 'USDT']
```

---

## Important Gotchas

### 1. V1 vs V2 Vault Selection

**Problem**: Not all vaults are available in both APIs.

**Example**:
```typescript
// ❌ This vault might not exist in V1 API on Base
const baseConfig = {
  version: 'v1',
  vaultAddress: '0x...',
  chainId: 8453,
}

// ✅ Check API docs or test queries first
const baseConfig = {
  version: 'v2',  // V2 has better Base support
  vaultAddress: '0x618495ccC4e751178C4914b1E939C0fe0FB07b9b',
  chainId: 8453,
}
```

**Solution**: Always verify vault existence in the GraphQL playground before adding to config.

### 2. GraphQL Query Parameter Names

**Problem**: V1 uses `address`, not `id`.

```typescript
// ❌ Wrong - will get "Unknown argument 'id'" error
query { vaultByAddress(id: "${vaultId}") { state { netApy } } }

// ✅ Correct
query { vaultByAddress(address: "${vaultAddress}") { state { netApy } } }
```

### 3. Vault ID vs Vault Address

**Problem**: V1 vaults have both `vaultId` and `vaultAddress`.

```typescript
// V1 vault config
{
  vaultAddress: '0xdd0f28e19C1780eb6396170735D45153D261490d',
  vaultId: '0xdd0f28e19c1780eb6396170735d45153d261490d-1',
}

// ✅ GraphQL query uses vaultAddress, not vaultId
query { vaultByAddress(address: "${vaultAddress}") ... }
```

**Note**: `vaultId` is for internal tracking only, not for API queries.

### 4. APY Decimal Conversion

**Problem**: API returns decimal values (0.0395), not percentages.

```typescript
// API returns: 0.0395
// Must convert to percentage string

// ❌ Wrong
const apy = json.data.vaultByAddress.state.netApy  // "0.0395"

// ✅ Correct
const apy = (json.data.vaultByAddress.state.netApy * 100).toFixed(2)  // "3.95"
```

### 5. ERC-4626 Share Accounting

**Problem**: Shares don't rebase like Compound V3.

```typescript
// ❌ Wrong - shares don't auto-increase
const balance = await client.readContract({
  functionName: 'balanceOf',
  args: [user],
})
// This returns SHARES, not underlying assets

// ✅ Correct - convert shares to assets
const shares = await client.readContract({
  functionName: 'balanceOf',
  args: [user],
})
const assets = await client.readContract({
  functionName: 'convertToAssets',
  args: [shares],
})
```

**Remember**: Always call `convertToAssets()` to get the actual USDC/USDT value.

### 6. Chain-Specific Vaults

**Problem**: Vaults are chain-specific and non-transferable.

```typescript
// ❌ Wrong - can't use Ethereum vault address on Base
const morpho = new MorphoAdapter(8453)
await morpho.getSupplyAPY('USDC', 8453)
// Will fail if using Ethereum vault address

// ✅ Correct - each chain has its own vaults
MORPHO_VAULTS = {
  1: { USDC: { vaultAddress: '0xdd0f...' } },      // Ethereum
  8453: { USDC: { vaultAddress: '0x6184...' } },   // Base
}
```

### 7. MetaMorpho vs Morpho Blue

**Important Distinction**:
- **Morpho Blue**: Core lending protocol (markets)
- **MetaMorpho**: Vault layer on top (what we integrate)

```typescript
// We integrate with MetaMorpho VAULTS, not Morpho Blue markets directly
// MetaMorpho vaults handle the complexity of market allocation

// ❌ Don't try to read Morpho Blue markets directly
// ✅ Use MetaMorpho vault functions (balanceOf, totalAssets, etc.)
```

### 8. Supply-Only Vaults

**Problem**: MetaMorpho vaults are supply-only (no borrowing).

```typescript
// ✅ Available
await morpho.getSupplyAPY('USDC', 1)    // Works
await morpho.getUserPosition(...)        // Works

// ❌ Not available
await morpho.getBorrowAPY('USDC', 1)    // Not implemented
// MetaMorpho vaults don't support borrowing

// In getMetrics():
borrowAPY: '0.00',  // Always 0 for MetaMorpho
```

### 9. Utilization Metrics

**Problem**: Vault-level utilization isn't directly available.

```typescript
// Utilization would require querying all underlying Morpho Blue markets
// Not exposed via MetaMorpho vault interface

// Current implementation:
utilization: '0.00',  // Placeholder
// Real utilization would need Morpho Blue market queries
```

### 10. API Rate Limits

**Best Practice**: Always use caching to avoid rate limits.

```typescript
// ✅ Our implementation caches for 5 minutes
const MORPHO_CACHE_TTL = 5 * 60 * 1000

// This prevents excessive API calls
globalCache.set(cacheKey, apy, MORPHO_CACHE_TTL)
```

---

## Testing & Verification

### Running Tests

```bash
# Run all Morpho tests
pnpm test morpho

# Run tests once (no watch mode)
pnpm test morpho --run

# Run specific test
pnpm test morpho -t "should fetch real supply APY"
```

### Test Coverage

The test suite covers:

**✅ Constants & Configuration** (7 tests):
- Vault address retrieval for USDC (V1)
- Vault address retrieval for USDT (V2)
- Vault address retrieval for Base USDC (V2)
- Unsupported chain handling
- Vault config retrieval
- Token support checking
- Supported tokens listing

**✅ Adapter Functionality** (12 tests):
- Adapter instantiation
- Unsupported chain rejection
- Token support checking
- Real APY fetching from Ethereum (V1)
- User position fetching
- Vault metrics (V1 USDC)
- Vault metrics (V2 USDT)
- Protocol-wide metrics
- Base chain support (V2)
- APY precision verification

### Integration Test Examples

```typescript
// Test V1 vault APY
it('should fetch real supply APY from Ethereum', async () => {
  const adapter = new MorphoAdapter(1)
  const apy = await adapter.getSupplyAPY('USDC', 1)

  const apyNumber = parseFloat(apy)
  expect(apyNumber).toBeGreaterThanOrEqual(0)
  expect(apyNumber).toBeLessThan(100)

  console.log(`✅ Morpho USDC Supply APY: ${apy}%`)
}, 10000)

// Test V2 vault metrics
it('should fetch USDT metrics (v2)', async () => {
  const adapter = new MorphoAdapter(1)
  const metrics = await adapter.getMetrics('USDT', 1)

  expect(metrics.protocol).toBe('morpho')
  expect(metrics.token).toBe('USDT')
  expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
  expect(metrics.metadata?.vaultName).toBe('Re7 USDT')

  console.log(`✅ Morpho USDT Metrics (V2):`)
  console.log(`   Vault: ${metrics.metadata?.vaultName}`)
  console.log(`   Supply APY: ${metrics.supplyAPY}%`)
}, 15000)
```

### Manual Testing with GraphQL Playground

Visit: https://api.morpho.org/graphql

**Test V1 Query**:
```graphql
query {
  vaultByAddress(address: "0xdd0f28e19C1780eb6396170735D45153D261490d") {
    address
    name
    symbol
    state {
      netApy
      totalAssets
      totalSupply
    }
  }
}
```

**Test V2 Query**:
```graphql
query {
  vaultV2ByAddress(
    address: "0x1CE2354074C717a266aDADCD5e34104f233Da446"
    chainId: 1
  ) {
    address
    name
    symbol
    avgNetApy
  }
}
```

### Common Test Failures

**Timeout Errors**:
```
Error: Test timed out in 30000ms
```
- Usually caused by slow RPC or API responses
- Increase timeout or improve network connection

**APY Returns 0.00%**:
```
stderr: Cannot calculate APY from vault data, returning 0.00
```
- Vault might not have allocation data
- Check if vault is active and has deposits
- Verify API response structure

**Vault Not Found**:
```
V1 Vault not found: 0x...
```
- Vault might not exist in that API version
- Switch to correct version (v1 vs v2)
- Verify vault address is correct

### Performance Benchmarks

Expected response times:

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| `getSupplyAPY()` | < 2s | GraphQL API call |
| `getUserPosition()` | < 5s | 2 RPC calls (balanceOf, convertToAssets) |
| `getMetrics()` | < 5s | API + 1 RPC call |
| `getProtocolMetrics()` | < 15s | Multiple vault queries in parallel |

**Note**: First call is slower (no cache), subsequent calls within 5min are instant.

---

## References

### Official Documentation

- **Morpho Docs**: https://docs.morpho.org/
- **Build Guide**: https://docs.morpho.org/build/earn/tutorials/get-data
- **GraphQL API**: https://api.morpho.org/graphql
- **LLM Context**: https://docs.morpho.org/llms-full.txt

### Smart Contracts

- **Morpho Blue (Singleton)**: `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`
- **Gauntlet USDC Prime (V1)**: `0xdd0f28e19C1780eb6396170735D45153D261490d`
- **Re7 USDT (V2, Eth)**: `0x1CE2354074C717a266aDADCD5e34104f233Da446`
- **Re7 USDC (V2, Base)**: `0x618495ccC4e751178C4914b1E939C0fe0FB07b9b`

### Standards

- **ERC-4626**: Tokenized Vault Standard
  - https://eips.ethereum.org/EIPS/eip-4626
  - Defines: `totalAssets()`, `convertToAssets()`, `convertToShares()`

### Key Resources

- **Morpho GitHub**: https://github.com/morpho-org
- **Vault UI**: https://app.morpho.org/vaults
- **Analytics**: https://defillama.com/protocol/morpho

### Community

- **Discord**: https://discord.gg/morpho
- **Twitter**: https://twitter.com/MorphoLabs

---

## Summary

### Key Takeaways

1. **Dual API Support**: We support both V1 and V2 vaults for maximum yield opportunities
2. **ERC-4626 Standard**: All vaults follow the tokenized vault standard
3. **GraphQL Integration**: Fast, efficient data fetching via official API
4. **Automatic Routing**: Adapter automatically detects and routes to correct API version
5. **High TVL Access**: Access to $148M+ Gauntlet USDC Prime and other institutional vaults

### Architecture Highlights

```typescript
MorphoAdapter
├─ V1 API Support (Ethereum only)
│  └─ vaultByAddress(address) → state.netApy
├─ V2 API Support (Multi-chain)
│  └─ vaultV2ByAddress(address, chainId) → avgNetApy
├─ ERC-4626 Integration
│  ├─ balanceOf() → vault shares
│  └─ convertToAssets() → underlying tokens
└─ Caching Layer (5min TTL)
```

### Next Steps

**For Adding New Vaults**:
1. Find vault on https://app.morpho.org/vaults
2. Test GraphQL query in playground
3. Determine if V1 or V2
4. Add to `MORPHO_VAULTS` in constants
5. Add test case

**For Multi-Protocol Optimization**:
- Morpho adapter is ready for Phase 5 (Aggregator)
- Can compare Morpho yields with AAVE and Compound
- Optimization engine can route to highest yield

### Performance Summary

| Metric | Value |
|--------|-------|
| **Total Vaults** | 3 (2 Ethereum, 1 Base) |
| **Total TVL** | $148M+ |
| **APY Range** | 3-7% |
| **Test Coverage** | 19 tests |
| **Cache TTL** | 5 minutes |
| **API Response** | < 2 seconds |

---

**Last Updated**: Phase 4 Complete (November 2024)
**Maintainer**: @quirk/yield-engine team
**Status**: ✅ Production Ready
