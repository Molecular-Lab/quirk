# Oracle Index Update Strategy - Gas Optimization

## Problem Statement

Updating tier indices before every stake operation costs ~66,000 gas per update (~$8-10 at current gas prices). If deposits happen frequently, this becomes expensive.

## Solution: Smart Update Heuristic

Update index ONLY when it's financially justified or accuracy-critical.

---

## Implementation

### TypeScript Oracle Code

```typescript
interface UpdateDecision {
  shouldUpdate: boolean;
  reason: string;
  estimatedError: number;
  gasCost: number;
}

interface TierState {
  tierId: bytes32;
  token: address;
  currentStaked: bigint;
  lastUpdateTimestamp: number;
  currentIndex: bigint;
  historicalAPY: number;
}

/**
 * Decide whether to update tier index before staking
 * @param tierState Current tier state from database
 * @param newDepositAmount Amount to be staked
 * @returns Decision with reasoning
 */
async function shouldUpdateIndexBeforeStaking(
  tierState: TierState,
  newDepositAmount: bigint
): Promise<UpdateDecision> {
  const now = Math.floor(Date.now() / 1000);
  const timeSinceUpdate = now - tierState.lastUpdateTimestamp;
  const daysElapsed = timeSinceUpdate / 86400;
  
  // Configuration thresholds
  const VOLUME_THRESHOLD = 0.10;        // 10% of current stake
  const TIME_THRESHOLD = 86400;          // 24 hours
  const ERROR_THRESHOLD = 100;           // $100 in dollar value
  const MIN_DEPOSIT_TO_CARE = 1000;     // $1,000 minimum to even check
  
  const depositValue = Number(newDepositAmount) / 1e6; // Assume 6 decimals
  const stakedValue = Number(tierState.currentStaked) / 1e6;
  const depositRatio = depositValue / stakedValue;
  
  // Gas cost estimation (at 50 gwei)
  const UPDATE_GAS_COST = 66000;
  const GAS_PRICE_GWEI = 50;
  const ETH_PRICE_USD = 2500;
  const gasCostUSD = (UPDATE_GAS_COST * GAS_PRICE_GWEI * 1e-9 * ETH_PRICE_USD);
  
  // ============================================================
  // HEURISTIC 1: Ignore tiny deposits
  // ============================================================
  if (depositValue < MIN_DEPOSIT_TO_CARE) {
    return {
      shouldUpdate: false,
      reason: `Deposit too small ($${depositValue.toFixed(2)} < $${MIN_DEPOSIT_TO_CARE})`,
      estimatedError: 0,
      gasCost: gasCostUSD
    };
  }
  
  // ============================================================
  // HEURISTIC 2: Large deposit relative to existing stakes
  // ============================================================
  if (depositRatio > VOLUME_THRESHOLD) {
    const estimatedError = depositValue * (tierState.historicalAPY * daysElapsed / 365);
    return {
      shouldUpdate: true,
      reason: `Large deposit: ${(depositRatio * 100).toFixed(1)}% of current stake (>${VOLUME_THRESHOLD * 100}%)`,
      estimatedError,
      gasCost: gasCostUSD
    };
  }
  
  // ============================================================
  // HEURISTIC 3: Stale index (long time since last update)
  // ============================================================
  if (timeSinceUpdate > TIME_THRESHOLD) {
    const estimatedGrowth = tierState.historicalAPY * daysElapsed / 365;
    const estimatedError = depositValue * estimatedGrowth;
    
    return {
      shouldUpdate: true,
      reason: `Stale index: ${(timeSinceUpdate / 3600).toFixed(1)}h since last update (>${TIME_THRESHOLD / 3600}h)`,
      estimatedError,
      gasCost: gasCostUSD
    };
  }
  
  // ============================================================
  // HEURISTIC 4: Potential error exceeds threshold
  // ============================================================
  const estimatedGrowthRate = tierState.historicalAPY * daysElapsed / 365;
  const potentialError = depositValue * estimatedGrowthRate;
  
  if (potentialError > ERROR_THRESHOLD) {
    return {
      shouldUpdate: true,
      reason: `High potential error: $${potentialError.toFixed(2)} (>${ERROR_THRESHOLD})`,
      estimatedError: potentialError,
      gasCost: gasCostUSD
    };
  }
  
  // ============================================================
  // HEURISTIC 5: Cost-benefit analysis
  // ============================================================
  // If gas cost is much higher than potential error, skip update
  if (gasCostUSD > potentialError * 10) {
    return {
      shouldUpdate: false,
      reason: `Gas cost ($${gasCostUSD.toFixed(2)}) >> potential error ($${potentialError.toFixed(2)})`,
      estimatedError: potentialError,
      gasCost: gasCostUSD
    };
  }
  
  // Default: skip update (small deposit, recent index, low error)
  return {
    shouldUpdate: false,
    reason: `No update needed: deposit=${(depositRatio * 100).toFixed(2)}%, age=${(timeSinceUpdate / 3600).toFixed(1)}h, error=$${potentialError.toFixed(2)}`,
    estimatedError: potentialError,
    gasCost: gasCostUSD
  };
}

/**
 * Oracle's main staking workflow with smart update logic
 */
async function executeStakingWithSmartUpdate(
  token: address,
  tierId: bytes32,
  protocol: address,
  newDepositAmount: bigint
): Promise<void> {
  // Get current tier state
  const tierState = await getTierState(tierId, token);
  
  // Decide whether to update
  const decision = await shouldUpdateIndexBeforeStaking(tierState, newDepositAmount);
  
  console.log(`\n=== STAKING DECISION ===`);
  console.log(`Tier: ${tierId}`);
  console.log(`New deposit: $${(Number(newDepositAmount) / 1e6).toFixed(2)}`);
  console.log(`Currently staked: $${(Number(tierState.currentStaked) / 1e6).toFixed(2)}`);
  console.log(`Should update: ${decision.shouldUpdate}`);
  console.log(`Reason: ${decision.reason}`);
  console.log(`Estimated error: $${decision.estimatedError.toFixed(2)}`);
  console.log(`Gas cost: $${decision.gasCost.toFixed(2)}`);
  
  // Execute based on decision
  if (decision.shouldUpdate) {
    console.log(`\n📊 Updating index before staking...`);
    
    // Step 1: Read protocol balance
    const currentBalance = await readProtocolBalance(protocol, token);
    
    // Step 2: Calculate growth
    const growthRate = Number(currentBalance) / Number(tierState.currentStaked);
    const newIndex = BigInt(Math.floor(Number(tierState.currentIndex) * growthRate));
    
    // Step 3: Update index on-chain
    await proxifyController.updateTierIndex(token, tierId, newIndex);
    console.log(`✅ Index updated: ${formatIndex(tierState.currentIndex)} → ${formatIndex(newIndex)}`);
    
    // Step 4: Update oracle database
    await updateOracleDatabase(tierId, token, {
      currentIndex: newIndex,
      lastUpdateTimestamp: Math.floor(Date.now() / 1000)
    });
  } else {
    console.log(`\n⏭️  Skipping index update (gas optimization)`);
  }
  
  // Step 5: Stake new funds
  console.log(`\n💰 Staking $${(Number(newDepositAmount) / 1e6).toFixed(2)} to ${protocol}...`);
  await proxifyController.executeTransfer(
    token,
    protocol,
    newDepositAmount,
    tierId,
    getTierName(tierId)
  );
  
  // Step 6: Update oracle records
  await updateOracleDatabase(tierId, token, {
    currentStaked: tierState.currentStaked + newDepositAmount,
    lastBalance: await readProtocolBalance(protocol, token)
  });
  
  console.log(`✅ Staking complete\n`);
}

/**
 * Helper: Get tier state from oracle database + blockchain
 */
async function getTierState(tierId: bytes32, token: address): Promise<TierState> {
  const dbState = oracleDB.getTierStake(tierId, token);
  const indexData = await proxify.getTierIndexWithTimestamp(token, tierId);
  
  return {
    tierId,
    token,
    currentStaked: dbState.stakedAmount,
    lastUpdateTimestamp: Number(indexData.updatedAt),
    currentIndex: indexData.index,
    historicalAPY: getHistoricalAPY(tierId) // From monitoring
  };
}

/**
 * Helper: Format index for display
 */
function formatIndex(index: bigint): string {
  return (Number(index) / 1e18).toFixed(6);
}
```

---

## Configuration Tuning

### Conservative (High Accuracy, Higher Gas)
```typescript
const VOLUME_THRESHOLD = 0.05;    // 5% of stake
const TIME_THRESHOLD = 43200;      // 12 hours
const ERROR_THRESHOLD = 50;        // $50
```

### Balanced (Recommended)
```typescript
const VOLUME_THRESHOLD = 0.10;    // 10% of stake
const TIME_THRESHOLD = 86400;      // 24 hours
const ERROR_THRESHOLD = 100;       // $100
```

### Aggressive (Lower Gas, Slightly Lower Accuracy)
```typescript
const VOLUME_THRESHOLD = 0.25;    // 25% of stake
const TIME_THRESHOLD = 172800;     // 48 hours
const ERROR_THRESHOLD = 500;       // $500
```

---

## Example Scenarios

### Scenario 1: Tiny Deposit
```
Current stake: $25,200
New deposit: $50
Time since update: 6 hours

Decision: SKIP UPDATE
Reason: Deposit too small ($50 < $1,000)
Gas saved: $8
Error: ~$0 (negligible)
```

### Scenario 2: Small Regular Deposit
```
Current stake: $25,200
New deposit: $500
Time since update: 6 hours
APY: 4%

Calculation:
  - Deposit ratio: 500/25,200 = 1.98% (< 10% threshold)
  - Time: 6h (< 24h threshold)
  - Estimated growth: 4% × 6/24 / 365 = 0.0027%
  - Potential error: $500 × 0.0027% = $0.014 (< $100 threshold)

Decision: SKIP UPDATE
Reason: No update needed: deposit=1.98%, age=6.0h, error=$0.01
Gas saved: $8
Error: $0.01
```

### Scenario 3: Large Deposit
```
Current stake: $25,200
New deposit: $5,000,000
Time since update: 6 hours
APY: 4%

Calculation:
  - Deposit ratio: 5,000,000/25,200 = 19,841% (>> 10% threshold)

Decision: UPDATE FIRST ✅
Reason: Large deposit: 19841.3% of current stake (>10%)
Gas cost: $8
Error prevented: ~$550 (if 6h growth was 2 basis points)
```

### Scenario 4: Stale Index
```
Current stake: $25,200
New deposit: $1,000
Time since update: 36 hours
APY: 4%

Calculation:
  - Deposit ratio: 1,000/25,200 = 3.97% (< 10% threshold)
  - Time: 36h (> 24h threshold)

Decision: UPDATE FIRST ✅
Reason: Stale index: 36.0h since last update (>24h)
Gas cost: $8
Error prevented: ~$4.50
```

---

## Gas Savings Analysis

### Before Optimization (Update Every Time)
```
Daily stats:
  - 100 deposits per day
  - 100 index updates
  - Gas cost: 100 × 66,000 × 50 gwei = 0.33 ETH = $825/day
  - Monthly cost: ~$24,750
```

### After Optimization (Smart Updates)
```
Daily stats:
  - 100 deposits per day
  - ~5 index updates (only large deposits + daily staleness)
  - Gas cost: 5 × 66,000 × 50 gwei = 0.0165 ETH = $41/day
  - Monthly cost: ~$1,230

Savings: $23,520/month (95% reduction!)
Max error per user: <$1 on average
```

---

## Monitoring & Alerts

### Metrics to Track
```typescript
interface OracleMetrics {
  updateDecisions: {
    total: number;
    updated: number;
    skipped: number;
    skipRate: number;  // skipped / total
  };
  gasUsage: {
    totalGasUsed: bigint;
    gasSaved: bigint;
    savingsRate: number;  // saved / (saved + used)
  };
  accuracy: {
    avgError: number;           // Average $ error per user
    maxError: number;           // Largest $ error encountered
    errorsAboveThreshold: number; // Times error > threshold
  };
  timing: {
    avgIndexAge: number;        // Average time since last update
    maxIndexAge: number;        // Longest time without update
    staleIndexWarnings: number; // Times > 48h
  };
}
```

### Alert Conditions
```typescript
// Alert: Too many skipped updates
if (metrics.updateDecisions.skipRate > 0.98) {
  alert("Warning: 98% of updates skipped - thresholds may be too aggressive");
}

// Alert: High error rate
if (metrics.accuracy.errorsAboveThreshold > 10) {
  alert("Warning: Multiple high-error events - consider tightening thresholds");
}

// Alert: Stale indices
if (metrics.timing.maxIndexAge > 172800) {
  alert("Critical: Index not updated for 48+ hours - force update needed");
}
```

---

## Database Schema

### Oracle Tracking Table
```sql
CREATE TABLE tier_update_decisions (
  id SERIAL PRIMARY KEY,
  tier_id BYTES32 NOT NULL,
  token_address ADDRESS NOT NULL,
  new_deposit_amount NUMERIC(78, 0) NOT NULL,
  current_staked NUMERIC(78, 0) NOT NULL,
  time_since_update INT NOT NULL,
  should_update BOOLEAN NOT NULL,
  decision_reason TEXT NOT NULL,
  estimated_error NUMERIC(18, 6) NOT NULL,
  gas_cost NUMERIC(18, 6) NOT NULL,
  decided_at TIMESTAMP NOT NULL,
  tx_hash BYTES32,  -- If update was performed
  INDEX idx_tier_token (tier_id, token_address),
  INDEX idx_decided_at (decided_at)
);
```

---

## Best Practices

1. **Start Conservative**: Begin with lower thresholds, monitor for 1-2 weeks, then adjust
2. **Per-Tier Configuration**: High-risk tiers may need tighter thresholds
3. **Dynamic Gas Price**: Adjust thresholds based on network conditions
4. **Emergency Override**: Allow manual force-update for critical situations
5. **Regular Monitoring**: Review metrics weekly to optimize thresholds

---

## Emergency Force Update

For critical situations (e.g., major yield event, long downtime recovery):

```typescript
/**
 * Force update ALL tier indices regardless of heuristics
 */
async function forceUpdateAllIndices(
  token: address,
  tierIds: bytes32[],
  reason: string
): Promise<void> {
  console.log(`\n🚨 FORCE UPDATE: ${reason}`);
  
  for (const tierId of tierIds) {
    const tierState = await getTierState(tierId, token);
    const protocol = getTierProtocol(tierId);
    const currentBalance = await readProtocolBalance(protocol, token);
    const growthRate = Number(currentBalance) / Number(tierState.currentStaked);
    const newIndex = BigInt(Math.floor(Number(tierState.currentIndex) * growthRate));
    
    await proxifyController.updateTierIndex(token, tierId, newIndex);
    console.log(`✅ ${tierId}: ${formatIndex(tierState.currentIndex)} → ${formatIndex(newIndex)}`);
  }
  
  console.log(`\n✅ Force update complete\n`);
}
```

---

## Summary

**Golden Rule:** Update index when it's financially justified or accuracy-critical.

**Key Thresholds (Recommended):**
- Volume: 10% of current stake
- Time: 24 hours since last update
- Error: $100 potential dollar error

**Expected Results:**
- 95% gas savings
- <$1 average error per user
- Maintains accuracy for large deposits
- Prevents stale indices

**Gas Cost:** ~$40/day instead of ~$825/day for typical protocol
