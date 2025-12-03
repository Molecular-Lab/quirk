# DeFi Protocol Metrics & Health Analysis Guide

> **Complete reference for analyzing DeFi lending & borrowing protocols**

## Table of Contents

1. [Core Metrics Overview](#core-metrics-overview)
2. [Protocol Health Indicators](#protocol-health-indicators)
3. [Contract Data to Fetch](#contract-data-to-fetch)
4. [AAVE V3 Metrics](#aave-v3-metrics)
5. [Compound V3 Metrics](#compound-v3-metrics)
6. [Morpho Metrics](#morpho-metrics)
7. [Risk Analysis Framework](#risk-analysis-framework)
8. [Implementation Examples](#implementation-examples)

---

## Core Metrics Overview

### 🎯 Critical Metrics (Must Have)

```
┌─────────────────────────────────────────────────────────┐
│ Supply Side (Lenders)                                   │
├─────────────────────────────────────────────────────────┤
│ • Supply APY               → How much lenders earn      │
│ • Total Supplied           → Total deposits             │
│ • Available Liquidity      → Can withdraw immediately   │
│ • Utilization Rate         → % of funds being borrowed  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Borrow Side (Borrowers)                                 │
├─────────────────────────────────────────────────────────┤
│ • Borrow APY               → Interest rate for borrowers│
│ • Total Borrowed           → Total debt                 │
│ • Borrow Cap               → Maximum borrow limit       │
│ • Collateral Factor        → Loan-to-value ratio        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Risk Metrics                                            │
├─────────────────────────────────────────────────────────┤
│ • Liquidation Threshold    → When positions get liquidated│
│ • Health Factor            → Individual position safety │
│ • Bad Debt                 → Unrecoverable losses       │
│ • Oracle Price             → Asset price from oracle    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Protocol Health                                         │
├─────────────────────────────────────────────────────────┤
│ • TVL (Total Value Locked) → Total protocol size        │
│ • Reserve Factor           → Protocol revenue           │
│ • Treasury Balance         → Emergency funds            │
│ • Active Users             → User count                 │
└─────────────────────────────────────────────────────────┘
```

---

## Protocol Health Indicators

### 🟢 Healthy Protocol Signs

```yaml
Utilization Rate: 60-80%
  - Why: Good balance between lender returns and available liquidity
  - 🔴 Too Low (<40%): Lenders earn less
  - 🔴 Too High (>90%): Risk of bank run (can't withdraw)

Supply APY: 3-8%
  - Why: Attractive for lenders, sustainable
  - 🔴 Too Low: Lenders leave
  - 🔴 Too High (>15%): Unsustainable, risky

Borrow APY: 5-12%
  - Why: Premium over supply APY, covers risk
  - 🔴 Spike >50%: Liquidity crisis

Liquidity: >20% of TVL
  - Why: Users can withdraw anytime
  - 🔴 <10%: Withdrawal queue risk

Bad Debt: <0.1% of TVL
  - Why: Liquidations working properly
  - 🔴 >1%: Protocol losing money

Reserve Factor: 10-20%
  - Why: Protocol generates sustainable revenue
  - 🔴 Too High: Lenders get less yield
```

### 🔴 Warning Signs

```
⚠️  Critical Alerts:
├── Utilization >95%          → Liquidity crisis
├── Supply APY >15%           → Unsustainable
├── Borrow APY >50%           → Emergency mode
├── Bad Debt >1% TVL          → Insolvency risk
├── Liquidity <5% TVL         → Bank run risk
├── Oracle Price Deviation >5%→ Manipulation risk
└── Large Withdrawals (>10% TVL/day) → Panic
```

---

## Contract Data to Fetch

### 📊 Data Categories

```typescript
interface ProtocolMetrics {
  // === SUPPLY METRICS ===
  supply: {
    totalSupplied: string;        // Total deposits
    supplyAPY: string;            // Annual percentage yield
    supplyAPR: string;            // Base rate (no compounding)
    rewardsAPR: string;           // Incentive rewards APY
    availableLiquidity: string;   // Can withdraw now
    supplyIndex: string;          // Growth index (compound interest)
    supplyCap: string;            // Maximum supply allowed
  };

  // === BORROW METRICS ===
  borrow: {
    totalBorrowed: string;        // Total debt
    borrowAPY: string;            // Borrow interest rate
    borrowAPR: string;            // Base borrow rate
    borrowCap: string;            // Maximum borrow allowed
    borrowIndex: string;          // Debt growth index
  };

  // === UTILIZATION ===
  utilization: {
    rate: string;                 // Current utilization %
    optimal: string;              // Target utilization
    current: string;              // totalBorrowed / totalSupplied
  };

  // === RISK PARAMETERS ===
  risk: {
    ltv: string;                  // Loan-to-value (e.g., 75%)
    liquidationThreshold: string; // Liquidation trigger (e.g., 80%)
    liquidationBonus: string;     // Liquidator profit (e.g., 5%)
    reserveFactor: string;        // Protocol revenue cut
    collateralFactor: string;     // Borrowing power
  };

  // === ORACLE & PRICING ===
  pricing: {
    oraclePrice: string;          // Asset price in USD
    oracleSource: string;         // Oracle address/type
    priceDecimals: number;        // Price precision
    lastUpdate: Date;             // Oracle update time
  };

  // === PROTOCOL HEALTH ===
  health: {
    tvl: string;                  // Total value locked
    badDebt: string;              // Unrecoverable debt
    treasuryBalance: string;      // Reserve funds
    insuranceFund: string;        // Safety module
    pauseStatus: boolean;         // Is protocol paused?
  };

  // === REWARDS & INCENTIVES ===
  rewards: {
    supplyRewardsPerSecond: string;
    borrowRewardsPerSecond: string;
    rewardTokenAddress: string;
    rewardTokenPrice: string;
  };

  // === TIME-SERIES DATA ===
  historical: {
    supplyAPYHistory: Array<{ timestamp: Date; value: string }>;
    borrowAPYHistory: Array<{ timestamp: Date; value: string }>;
    utilizationHistory: Array<{ timestamp: Date; value: string }>;
    tvlHistory: Array<{ timestamp: Date; value: string }>;
  };
}
```

---

## AAVE V3 Metrics

### 🔵 AAVE Contract Calls

```typescript
// === AAVE V3 Pool Contract ===
const POOL_ABI = [
  // Get reserve data (ALL-IN-ONE call)
  {
    name: 'getReserveData',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [{
      components: [
        { name: 'configuration', type: 'uint256' },
        { name: 'liquidityIndex', type: 'uint128' },        // ⭐ Supply index
        { name: 'currentLiquidityRate', type: 'uint128' },  // ⭐ Supply APY
        { name: 'variableBorrowIndex', type: 'uint128' },   // ⭐ Borrow index
        { name: 'currentVariableBorrowRate', type: 'uint128' }, // ⭐ Borrow APY
        { name: 'currentStableBorrowRate', type: 'uint128' },
        { name: 'lastUpdateTimestamp', type: 'uint40' },
        { name: 'id', type: 'uint16' },
        { name: 'aTokenAddress', type: 'address' },         // ⭐ Wrapped token
        { name: 'stableDebtTokenAddress', type: 'address' },
        { name: 'variableDebtTokenAddress', type: 'address' },
        { name: 'interestRateStrategyAddress', type: 'address' },
        { name: 'accruedToTreasury', type: 'uint128' },
        { name: 'unbacked', type: 'uint128' },
        { name: 'isolationModeTotalDebt', type: 'uint128' }
      ]
    }]
  },

  // Get configuration (caps, factors, etc.)
  {
    name: 'getConfiguration',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [{
      components: [
        // Packed bitmap with:
        // - LTV
        // - Liquidation threshold
        // - Liquidation bonus
        // - Decimals
        // - Reserve active
        // - Reserve frozen
        // - Borrowing enabled
        // - Supply cap
        // - Borrow cap
      ]
    }]
  }
];

// === aToken Contract (Wrapped Token) ===
const ATOKEN_ABI = [
  {
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ User's aToken balance
  },
  {
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Total supplied
  },
  {
    name: 'scaledBalanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]  // Underlying shares
  },
  {
    name: 'UNDERLYING_ASSET_ADDRESS',
    outputs: [{ name: '', type: 'address' }]  // Original token
  }
];

// === Oracle Contract ===
const ORACLE_ABI = [
  {
    name: 'getAssetPrice',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Price in USD (8 decimals)
  }
];
```

### 📊 AAVE Data Fetching Example

```typescript
import { formatUnits } from 'viem';

async function fetchAAVEMetrics(usdcAddress: string) {
  // 1. Get reserve data
  const reserveData = await poolContract.read.getReserveData([usdcAddress]);

  // 2. Calculate APYs (Ray format = 1e27)
  const RAY = 1e27;
  const SECONDS_PER_YEAR = 31536000;

  const liquidityRate = Number(reserveData.currentLiquidityRate) / RAY;
  const supplyAPY = (Math.pow(1 + liquidityRate / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1) * 100;

  const borrowRate = Number(reserveData.currentVariableBorrowRate) / RAY;
  const borrowAPY = (Math.pow(1 + borrowRate / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1) * 100;

  // 3. Get aToken balance (total supplied)
  const aTokenAddress = reserveData.aTokenAddress;
  const totalSupplied = await aTokenContract.read.totalSupply();

  // 4. Get available liquidity (can withdraw)
  const availableLiquidity = await usdcContract.read.balanceOf([aTokenAddress]);

  // 5. Calculate utilization
  const totalBorrowed = totalSupplied - availableLiquidity;
  const utilization = (totalBorrowed / totalSupplied) * 100;

  // 6. Get oracle price
  const price = await oracleContract.read.getAssetPrice([usdcAddress]);

  // 7. Decode configuration bitmap
  const config = await poolContract.read.getConfiguration([usdcAddress]);
  const ltv = extractLTV(config); // Extract from bitmap
  const liquidationThreshold = extractLiquidationThreshold(config);
  const supplyCap = extractSupplyCap(config);
  const borrowCap = extractBorrowCap(config);

  return {
    protocol: 'AAVE',
    supplyAPY: supplyAPY.toFixed(2),
    borrowAPY: borrowAPY.toFixed(2),
    totalSupplied: formatUnits(totalSupplied, 6),
    availableLiquidity: formatUnits(availableLiquidity, 6),
    utilization: utilization.toFixed(2),
    tvl: formatUnits(totalSupplied, 6),
    price: formatUnits(price, 8),
    ltv,
    liquidationThreshold,
    supplyCap,
    borrowCap,
  };
}
```

---

## Compound V3 Metrics

### 🟣 Compound V3 Contract Calls

```typescript
// === Compound V3 Comet Contract ===
const COMET_ABI = [
  // Get supply rate
  {
    name: 'getSupplyRate',
    inputs: [{ name: 'utilization', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint64' }]  // ⭐ Supply APR
  },

  // Get borrow rate
  {
    name: 'getBorrowRate',
    inputs: [{ name: 'utilization', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint64' }]  // ⭐ Borrow APR
  },

  // Get utilization
  {
    name: 'getUtilization',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Current utilization
  },

  // Get user balance (auto-compounds)
  {
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ User balance
  },

  // Get total supply
  {
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Total supplied
  },

  // Get total borrow
  {
    name: 'totalBorrow',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Total borrowed
  },

  // Get asset info
  {
    name: 'getAssetInfo',
    inputs: [{ name: 'i', type: 'uint8' }],
    outputs: [{
      components: [
        { name: 'offset', type: 'uint8' },
        { name: 'asset', type: 'address' },
        { name: 'priceFeed', type: 'address' },      // ⭐ Oracle
        { name: 'scale', type: 'uint64' },
        { name: 'borrowCollateralFactor', type: 'uint64' }, // ⭐ LTV
        { name: 'liquidateCollateralFactor', type: 'uint64' }, // ⭐ Liq threshold
        { name: 'liquidationFactor', type: 'uint64' },
        { name: 'supplyCap', type: 'uint128' }       // ⭐ Supply cap
      ]
    }]
  },

  // Get price from oracle
  {
    name: 'getPrice',
    inputs: [{ name: 'priceFeed', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Price
  }
];
```

### 📊 Compound Data Fetching Example

```typescript
async function fetchCompoundMetrics() {
  // 1. Get utilization
  const utilization = await cometContract.read.getUtilization();
  const utilizationRate = Number(utilization) / 1e18;

  // 2. Get supply/borrow rates
  const supplyRate = await cometContract.read.getSupplyRate([utilization]);
  const borrowRate = await cometContract.read.getBorrowRate([utilization]);

  // Compound uses per-second rates with 1e18 precision
  const SECONDS_PER_YEAR = 31536000;
  const supplyAPR = (Number(supplyRate) / 1e18) * SECONDS_PER_YEAR * 100;
  const borrowAPR = (Number(borrowRate) / 1e18) * SECONDS_PER_YEAR * 100;

  // 3. Get total supply/borrow
  const totalSupply = await cometContract.read.totalSupply();
  const totalBorrow = await cometContract.read.totalBorrow();

  // 4. Get asset info (for USDC = asset 0)
  const assetInfo = await cometContract.read.getAssetInfo([0]);

  // 5. Get price
  const price = await cometContract.read.getPrice([assetInfo.priceFeed]);

  // 6. Calculate TVL
  const tvl = formatUnits(totalSupply, 6);
  const availableLiquidity = totalSupply - totalBorrow;

  return {
    protocol: 'Compound',
    supplyAPY: supplyAPR.toFixed(2),
    borrowAPY: borrowAPR.toFixed(2),
    totalSupplied: formatUnits(totalSupply, 6),
    totalBorrowed: formatUnits(totalBorrow, 6),
    availableLiquidity: formatUnits(availableLiquidity, 6),
    utilization: (utilizationRate * 100).toFixed(2),
    tvl,
    price: formatUnits(price, 8),
    collateralFactor: Number(assetInfo.borrowCollateralFactor) / 1e18,
    liquidationThreshold: Number(assetInfo.liquidateCollateralFactor) / 1e18,
    supplyCap: formatUnits(assetInfo.supplyCap, 6),
  };
}
```

---

## Morpho Metrics

### 🔷 Morpho MetaMorpho Vault Calls

```typescript
// === MetaMorpho Vault (ERC-4626) ===
const METAMORPHO_ABI = [
  // Get total assets (TVL)
  {
    name: 'totalAssets',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Total value
  },

  // Get total shares
  {
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Total shares
  },

  // Get user shares
  {
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ User shares
  },

  // Convert shares to assets
  {
    name: 'convertToAssets',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Asset value
  },

  // Get vault APY (if exposed)
  {
    name: 'getCurrentAPY',
    outputs: [{ name: '', type: 'uint256' }]  // ⭐ Current APY
  },

  // Get withdrawal queue
  {
    name: 'withdrawQueue',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32' }]  // Market IDs
  },

  // Get market allocation
  {
    name: 'config',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [{
      components: [
        { name: 'cap', type: 'uint184' },        // ⭐ Market cap
        { name: 'enabled', type: 'bool' },
        { name: 'removableAt', type: 'uint64' }
      ]
    }]
  }
];

// === Morpho Blue Contract ===
const MORPHO_BLUE_ABI = [
  // Get market params
  {
    name: 'market',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [{
      components: [
        { name: 'totalSupplyAssets', type: 'uint128' },  // ⭐ Total supplied
        { name: 'totalSupplyShares', type: 'uint128' },
        { name: 'totalBorrowAssets', type: 'uint128' },  // ⭐ Total borrowed
        { name: 'totalBorrowShares', type: 'uint128' },
        { name: 'lastUpdate', type: 'uint128' },
        { name: 'fee', type: 'uint128' }                 // ⭐ Protocol fee
      ]
    }]
  },

  // Get user position
  {
    name: 'position',
    inputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{
      components: [
        { name: 'supplyShares', type: 'uint256' },
        { name: 'borrowShares', type: 'uint128' },
        { name: 'collateral', type: 'uint128' }
      ]
    }]
  }
];
```

### 📊 Morpho Data Fetching Example

```typescript
async function fetchMorphoMetrics(vaultAddress: string) {
  // 1. Get total assets (TVL)
  const totalAssets = await vaultContract.read.totalAssets();

  // 2. Get total shares
  const totalShares = await vaultContract.read.totalSupply();

  // 3. Calculate share price (exchange rate)
  const sharePrice = totalAssets / totalShares;

  // 4. Get APY (if exposed, otherwise calculate from markets)
  let totalAPY = 0;
  const queueLength = await vaultContract.read.withdrawQueueLength();

  for (let i = 0; i < queueLength; i++) {
    const marketId = await vaultContract.read.withdrawQueue([i]);
    const marketData = await morphoBlueContract.read.market([marketId]);
    const marketConfig = await vaultContract.read.config([marketId]);

    // Calculate market utilization
    const utilization = marketData.totalBorrowAssets / marketData.totalSupplyAssets;

    // Calculate market APY (simplified)
    const marketAPY = calculateMorphoAPY(utilization, marketData.fee);

    // Weight by allocation
    const allocation = marketConfig.cap / totalAssets;
    totalAPY += marketAPY * allocation;
  }

  return {
    protocol: 'Morpho',
    supplyAPY: totalAPY.toFixed(2),
    tvl: formatUnits(totalAssets, 6),
    totalShares: formatUnits(totalShares, 18),
    sharePrice: sharePrice.toFixed(6),
    marketsCount: queueLength,
  };
}
```

---

## Risk Analysis Framework

### 🛡️ Risk Scoring System

```typescript
interface RiskScore {
  overall: number;        // 0-100 (100 = safest)
  factors: {
    liquidity: number;    // Liquidity risk
    utilization: number;  // Utilization risk
    badDebt: number;      // Default risk
    oracle: number;       // Oracle risk
    smart_contract: number; // Code risk
  };
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

function calculateRiskScore(metrics: ProtocolMetrics): RiskScore {
  const scores = {
    // Liquidity risk (0-25 points)
    liquidity: calculateLiquidityScore(metrics.supply.availableLiquidity, metrics.health.tvl),

    // Utilization risk (0-25 points)
    utilization: calculateUtilizationScore(metrics.utilization.rate),

    // Bad debt risk (0-20 points)
    badDebt: calculateBadDebtScore(metrics.health.badDebt, metrics.health.tvl),

    // Oracle risk (0-15 points)
    oracle: calculateOracleScore(metrics.pricing.lastUpdate),

    // Smart contract risk (0-15 points)
    smart_contract: calculateContractScore(metrics.protocol),
  };

  const overall = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    overall,
    factors: scores,
    level:
      overall >= 80 ? 'LOW' :
      overall >= 60 ? 'MEDIUM' :
      overall >= 40 ? 'HIGH' : 'CRITICAL',
  };
}

function calculateLiquidityScore(liquidity: string, tvl: string): number {
  const ratio = parseFloat(liquidity) / parseFloat(tvl);

  if (ratio >= 0.30) return 25;  // Excellent
  if (ratio >= 0.20) return 20;  // Good
  if (ratio >= 0.10) return 10;  // Warning
  return 0;                       // Critical
}

function calculateUtilizationScore(rate: string): number {
  const util = parseFloat(rate);

  if (util <= 80 && util >= 60) return 25;  // Optimal
  if (util <= 85 && util >= 50) return 20;  // Good
  if (util <= 90) return 10;                 // Warning
  return 0;                                   // Critical
}
```

---

## Implementation Examples

### Complete Protocol Health Check

```typescript
// packages/core/service/protocol-health.service.ts

export class ProtocolHealthService {
  async analyzeProtocol(
    protocol: 'aave' | 'compound' | 'morpho',
    token: string,
    chainId: number
  ) {
    // 1. Fetch all metrics
    const metrics = await this.fetchProtocolMetrics(protocol, token, chainId);

    // 2. Calculate risk score
    const riskScore = this.calculateRiskScore(metrics);

    // 3. Generate alerts
    const alerts = this.generateAlerts(metrics);

    // 4. Historical comparison
    const trend = await this.analyzeTrend(protocol, token, chainId);

    return {
      protocol,
      token,
      chainId,
      metrics,
      riskScore,
      alerts,
      trend,
      timestamp: new Date(),
      recommendation: this.generateRecommendation(metrics, riskScore),
    };
  }

  private generateAlerts(metrics: ProtocolMetrics): Alert[] {
    const alerts: Alert[] = [];

    // Utilization alerts
    const util = parseFloat(metrics.utilization.rate);
    if (util > 95) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'UTILIZATION',
        message: `Utilization at ${util.toFixed(1)}% - Liquidity crisis risk`,
        action: 'Consider withdrawing or avoid deposits',
      });
    } else if (util > 90) {
      alerts.push({
        severity: 'WARNING',
        type: 'UTILIZATION',
        message: `Utilization at ${util.toFixed(1)}% - Monitor closely`,
        action: 'Prepare for potential withdrawal delays',
      });
    }

    // APY alerts
    const supplyAPY = parseFloat(metrics.supply.supplyAPY);
    if (supplyAPY > 15) {
      alerts.push({
        severity: 'WARNING',
        type: 'APY',
        message: `Supply APY at ${supplyAPY.toFixed(1)}% - Unsustainably high`,
        action: 'Verify protocol health before depositing',
      });
    }

    // Liquidity alerts
    const liquidityRatio = parseFloat(metrics.supply.availableLiquidity) / parseFloat(metrics.health.tvl);
    if (liquidityRatio < 0.10) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'LIQUIDITY',
        message: `Only ${(liquidityRatio * 100).toFixed(1)}% liquidity available`,
        action: 'Withdraw immediately if possible',
      });
    }

    // Bad debt alerts
    const badDebtRatio = parseFloat(metrics.health.badDebt) / parseFloat(metrics.health.tvl);
    if (badDebtRatio > 0.01) {
      alerts.push({
        severity: 'HIGH',
        type: 'BAD_DEBT',
        message: `Bad debt at ${(badDebtRatio * 100).toFixed(2)}% of TVL`,
        action: 'Protocol may be insolvent',
      });
    }

    return alerts;
  }

  private generateRecommendation(
    metrics: ProtocolMetrics,
    riskScore: RiskScore
  ): string {
    if (riskScore.overall >= 80) {
      return `✅ SAFE - ${metrics.protocol} is healthy. Good for deposits.`;
    }

    if (riskScore.overall >= 60) {
      return `⚠️ CAUTION - ${metrics.protocol} has some risk factors. Monitor closely.`;
    }

    if (riskScore.overall >= 40) {
      return `🔴 RISKY - ${metrics.protocol} shows concerning metrics. Avoid new deposits.`;
    }

    return `🚨 CRITICAL - ${metrics.protocol} is in distress. Withdraw if possible.`;
  }
}
```

---

## Summary: What to Fetch from Contracts

### Essential Data (Priority 1)

```yaml
✅ Supply APY:              How much lenders earn
✅ Borrow APY:              Cost of borrowing
✅ Total Supplied:          Protocol size
✅ Available Liquidity:     Can users withdraw?
✅ Utilization Rate:        % of funds borrowed
✅ TVL:                     Total value locked
✅ Oracle Price:            Asset price feed
```

### Important Data (Priority 2)

```yaml
⭐ LTV (Loan-to-Value):     Max borrow ratio
⭐ Liquidation Threshold:   When liquidation happens
⭐ Supply/Borrow Caps:      Protocol limits
⭐ Reserve Factor:          Protocol revenue
⭐ Bad Debt:                Unrecoverable losses
⭐ Last Update Time:        Data freshness
```

### Advanced Data (Priority 3)

```yaml
📊 Supply/Borrow Index:     Compound interest tracking
📊 Reward APY:              Incentive tokens
📊 Historical APY:          30d/90d averages
📊 User Count:              Active addresses
📊 Treasury Balance:        Emergency reserves
📊 Insurance Fund:          Safety module
```

---

**Next Steps:**
1. Use this guide to fetch data from AAVE/Compound/Morpho
2. Calculate risk scores for each protocol
3. Display in DeFi Observer Dashboard
4. Feed data to AI chatbot for analysis

**Status:** Complete Reference Guide
**Use For:** Protocol health monitoring, risk analysis, DeFi Observer Dashboard
