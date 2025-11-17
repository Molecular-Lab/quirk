# Oracle Operation Strategy

## Overview

The oracle operates on a **hybrid trigger system**: scheduled updates PLUS event-driven actions based on buffer threshold.

## Core Principles

1. **Default Schedule:** Weekly index updates and staking operations
2. **Buffer Monitoring:** Continuous monitoring triggers immediate action
3. **Efficiency:** Only update index when staking (combine operations)
4. **Gas Optimization:** Avoid unnecessary transactions

---

## Trigger System

### Trigger 1: Buffer Threshold (Event-Driven)

**Rule:** If buffer exceeds threshold → immediately stake + update index

```typescript
// Oracle monitors buffer continuously (every block or every minute)
const BUFFER_THRESHOLD = 10_000e6;  // $10,000 USDC

async function monitorBuffer() {
    const buffer = await USDC.balanceOf(laac.address);

    if (buffer > BUFFER_THRESHOLD) {
        console.log(`Buffer ${buffer} > ${BUFFER_THRESHOLD}, triggering stake`);
        await stakeAndUpdateIndex();
    }
}

// Run every 60 seconds
setInterval(monitorBuffer, 60_000);
```

**Why this is smart:**
- ✅ Capital efficient (funds earning yield ASAP)
- ✅ Reduces gaming window (index updates more frequently)
- ✅ Responsive to user activity (stake when deposits arrive)
- ✅ Gas efficient (only when needed)

### Trigger 2: Weekly Schedule (Time-Based Fallback)

**Rule:** Every Monday 00:00 UTC → update index (even if no staking)

```typescript
// Fallback: Update index weekly even if no deposits
cron.schedule('0 0 * * 1', async () => {
    console.log('Weekly scheduled index update');
    await updateIndexOnly();
});
```

**Why this is needed:**
- ✅ Ensures yield is reflected even during slow periods
- ✅ Regular updates maintain user trust
- ✅ Prevents index from getting too stale

---

## Combined Operation: Stake + Update Index

When buffer threshold is hit, oracle performs BOTH operations atomically:

```typescript
async function stakeAndUpdateIndex() {
    // STEP 1: Calculate current yield BEFORE staking new funds
    const yieldData = await calculateYield();

    console.log('Yield calculation:', {
        totalPrincipal: yieldData.totalPrincipal,
        totalCurrent: yieldData.totalCurrent,
        yieldEarned: yieldData.yieldEarned,
        growthFactor: yieldData.growthFactor
    });

    // STEP 2: Update vault index to reflect earned yield
    if (yieldData.growthFactor > 1.00001) {  // Only if >0.001% yield
        const oldIndex = await laac.vaultIndex(USDC);
        const newIndex = oldIndex * yieldData.growthFactor / 1e18;

        await controller.updateVaultIndex(USDC, newIndex);
        console.log(`Index updated: ${oldIndex} → ${newIndex}`);
    }

    // STEP 3: Lock in yield (update principal snapshots)
    await lockInYield();

    // STEP 4: Calculate how much to stake from buffer
    const buffer = await USDC.balanceOf(laac.address);
    const minBuffer = await calculateMinBuffer();  // e.g., 20% of totalDeposits
    const availableToStake = buffer - minBuffer;

    if (availableToStake <= 0) {
        console.log('No funds available to stake after minimum buffer');
        return;
    }

    // STEP 5: Decide allocation across protocols
    const allocation = await calculateOptimalAllocation(availableToStake);

    // STEP 6: Execute staking transactions
    for (const [protocol, amount] of Object.entries(allocation)) {
        if (amount > 0) {
            await stakeToProtocol(protocol, amount);
            console.log(`Staked ${amount} to ${protocol}`);
        }
    }

    console.log('Stake + index update complete');
}
```

---

## Detailed Flow Examples

### Example 1: Buffer Threshold Triggered

```
Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monday 00:00 (Weekly schedule):
- Buffer: 5,000 USDC (below threshold)
- Oracle updates index: 1.000 → 1.001
- No staking (buffer too small)

Tuesday 14:35 (User deposits):
- User deposits 20,000 USDC
- Buffer: 25,000 USDC (above 10k threshold! ⚠️)

Tuesday 14:36 (Oracle reacts):
- Oracle detects buffer > 10,000
- Step 1: Calculate yield from existing stakes
  - Aave balance: 800,200 (was 800,000)
  - Yield: 200 USDC
  - Growth: 800,200 / 800,000 = 1.00025
- Step 2: Update index: 1.001 × 1.00025 = 1.00125
- Step 3: Lock in yield (principal = 800,200)
- Step 4: Calculate stakeable amount
  - Buffer: 25,000
  - Min buffer (20% of deposits): 5,000
  - Available: 20,000
- Step 5: Stake to Aave: 20,000 USDC
- Step 6: Update principal: 820,200

Result:
✅ Funds earning yield within minutes (not waiting until Monday)
✅ Index updated twice in one week (more accurate)
✅ Gaming window reduced (unpredictable update times)
```

### Example 2: Quiet Week (No Threshold Hit)

```
Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monday 00:00:
- Buffer: 8,000 USDC (below threshold)
- Staked: 800,000 USDC → earning yield

Tuesday-Sunday:
- Small deposits: +1,000 USDC
- Small withdrawals: -2,000 USDC
- Buffer fluctuates: 7,000-9,000 (never hits 10k)
- Oracle monitors but takes no action

Next Monday 00:00 (Weekly trigger):
- Buffer: 7,500 USDC (still below threshold)
- Staked balance: 804,000 (earned 4,000 yield)
- Oracle calculates yield:
  - Growth: 804,000 / 800,000 = 1.005
- Oracle updates index: 1.000 → 1.005
- No staking (buffer still small)

Result:
✅ Index still updated weekly (yield reflected)
✅ No unnecessary staking transactions (save gas)
✅ Buffer maintained for withdrawals
```

### Example 3: Multiple Threshold Hits

```
Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monday 00:00:
- Buffer: 5,000 USDC
- Index: 1.000

Tuesday 10:00:
- Large deposit: +50,000 USDC
- Buffer: 55,000 USDC (threshold hit!)
- Oracle stakes 45,000 → updates index to 1.0001

Wednesday 15:00:
- Another large deposit: +30,000 USDC
- Buffer: 40,000 USDC (threshold hit again!)
- Oracle stakes 30,000 → updates index to 1.0003

Friday 09:00:
- More deposits: +15,000 USDC
- Buffer: 25,000 USDC (threshold hit!)
- Oracle stakes 15,000 → updates index to 1.0005

Result:
✅ Index updated 3× in one week (very fresh)
✅ All deposits staked within hours (capital efficient)
✅ Gaming nearly impossible (updates are unpredictable)
```

---

## Buffer Threshold Configuration

### Choosing the Right Threshold

```
Too low (e.g., $1,000):
❌ Too many transactions (waste gas)
❌ Oracle constantly staking tiny amounts
❌ High gas costs eat into yield

Too high (e.g., $100,000):
❌ Large amounts sitting idle (0% yield)
❌ Capital inefficient
❌ Misses the point of event-driven approach

Recommended: $10,000 - $50,000
✅ Good balance of efficiency vs responsiveness
✅ ~2-5 stakes per week for typical platform
✅ Gas costs < 1% of yield on staked amount
```

### Dynamic Threshold (Advanced)

```typescript
// Adjust threshold based on TVL
function calculateBufferThreshold() {
    const totalDeposits = await laac.totalDeposits(USDC);

    if (totalDeposits < 1_000_000) {
        return 10_000;   // $10k for small TVL
    } else if (totalDeposits < 10_000_000) {
        return 50_000;   // $50k for medium TVL
    } else {
        return 100_000;  // $100k for large TVL
    }
}

// More sophisticated: percentage-based
function calculateDynamicThreshold() {
    const totalDeposits = await laac.totalDeposits(USDC);
    const minBuffer = totalDeposits * 0.20;  // 20% min buffer

    // Trigger when buffer is 2% above minimum
    return minBuffer + (totalDeposits * 0.02);
}
```

---

## Minimum Buffer Calculation

Oracle must maintain minimum buffer for withdrawals:

```typescript
async function calculateMinBuffer() {
    const totalDeposits = await laac.totalDeposits(USDC);

    // Keep 20% liquid for withdrawals
    const minBuffer = totalDeposits * 0.20;

    return minBuffer;
}

async function getStakeableAmount() {
    const buffer = await USDC.balanceOf(laac.address);
    const minBuffer = await calculateMinBuffer();

    const stakeable = buffer - minBuffer;

    return stakeable > 0 ? stakeable : 0;
}
```

**Example:**
```
Total deposits: 1,000,000 USDC
Min buffer (20%): 200,000 USDC
Current buffer: 250,000 USDC
Stakeable: 50,000 USDC ✅

Current buffer: 180,000 USDC
Stakeable: 0 (buffer too low) ⚠️
```

---

## Optimal Allocation Strategy

When staking new funds, oracle decides allocation:

```typescript
async function calculateOptimalAllocation(amount: bigint) {
    // STEP 1: Get current APYs from protocols
    const apys = {
        aave: await getAaveAPY(),        // e.g., 4.2%
        compound: await getCompoundAPY(), // e.g., 3.8%
        curve: await getCurveAPY()        // e.g., 5.1%
    };

    // STEP 2: Get current allocations
    const positions = await db.getPositions('USDC');
    const totalStaked = positions.reduce((sum, p) => sum + p.principalStaked, 0n);

    const currentAllocation = {
        aave: positions.find(p => p.protocol === 'Aave')?.principalStaked || 0n,
        compound: positions.find(p => p.protocol === 'Compound')?.principalStaked || 0n,
        curve: positions.find(p => p.protocol === 'Curve')?.principalStaked || 0n
    };

    // STEP 3: Calculate target allocation (risk-adjusted)
    const targetAllocation = {
        aave: 0.40,     // 40% (highest TVL, most trusted)
        compound: 0.30, // 30% (good track record)
        curve: 0.30     // 30% (highest yield but higher risk)
    };

    // STEP 4: Rebalance toward target
    const newAllocations = {};

    for (const protocol of ['aave', 'compound', 'curve']) {
        const currentRatio = Number(currentAllocation[protocol]) / Number(totalStaked);
        const targetRatio = targetAllocation[protocol];
        const diff = targetRatio - currentRatio;

        // Allocate new funds to protocols that are under-allocated
        if (diff > 0) {
            newAllocations[protocol] = BigInt(Math.floor(Number(amount) * diff));
        } else {
            newAllocations[protocol] = 0n;
        }
    }

    return newAllocations;
}
```

**Example:**
```
Current state:
- Total staked: 800,000 USDC
- Aave: 400,000 (50%)
- Compound: 200,000 (25%)
- Curve: 200,000 (25%)

Target allocation:
- Aave: 40%
- Compound: 30%
- Curve: 30%

New deposit: 100,000 USDC

Rebalancing calculation:
- Aave is over-allocated (50% > 40%) → 0 USDC
- Compound is under-allocated (25% < 30%) → 50,000 USDC
- Curve is under-allocated (25% < 30%) → 50,000 USDC

After staking:
- Total: 900,000 USDC
- Aave: 400,000 (44.4%)
- Compound: 250,000 (27.8%)
- Curve: 250,000 (27.8%)

Closer to target! ✅
```

---

## Oracle Service Architecture

```typescript
// Main oracle service
class OracleService {
    private bufferMonitor: BufferMonitor;
    private yieldCalculator: YieldCalculator;
    private allocationManager: AllocationManager;

    async start() {
        // Start buffer monitoring (continuous)
        this.bufferMonitor.start(async () => {
            await this.handleBufferThreshold();
        });

        // Schedule weekly index updates (fallback)
        cron.schedule('0 0 * * 1', async () => {
            await this.handleWeeklyUpdate();
        });
    }

    async handleBufferThreshold() {
        console.log('Buffer threshold triggered');
        await this.stakeAndUpdateIndex();
    }

    async handleWeeklyUpdate() {
        console.log('Weekly scheduled update');

        // Only update index, don't force staking
        const { growthFactor } = await this.yieldCalculator.calculate();

        if (growthFactor > 1.00001) {
            await this.updateIndexOnly();
        } else {
            console.log('No significant yield, skipping update');
        }
    }
}
```

---

## Gas Cost Analysis

### Event-Driven Approach

```
Scenario: $10M TVL, moderate activity

Weekly scheduled update:
- 1× index update = ~$1/week = $52/year

Buffer-triggered stakes (assume 3× per week):
- 3× (stake + index update) = ~$6/week = $312/year

Total: ~$364/year

Revenue at $10M TVL:
- 50 bps = $50,000/year

Gas as % of revenue: 0.73% ✅
```

### Comparison to Fixed Schedule

```
Fixed schedule (weekly stake + update):
- 1× per week × 52 weeks = $52/year
- But: Funds idle for up to 7 days earning 0%
- Opportunity cost: Significant!

Event-driven (stake when buffer > threshold):
- Higher gas: ~$364/year
- But: Funds earning yield within hours
- Opportunity gain: Much higher!

Example:
- Average idle period: 3.5 days (fixed) vs 1 hour (event-driven)
- Idle amount: $50,000 average
- Lost yield: $50k × 4% × (3.5/365) = $19/week = $988/year
- Extra gas cost: $312/year
- Net benefit: $676/year ✅
```

---

## Monitoring & Alerts

Oracle should emit metrics for monitoring:

```typescript
// Prometheus metrics
metrics.bufferSize.set(bufferAmount);
metrics.stakedAmount.set(totalStaked);
metrics.vaultIndex.set(currentIndex);
metrics.lastIndexUpdate.set(Date.now());

// Alerts
if (bufferAmount < minBuffer) {
    alert('CRITICAL: Buffer below minimum! May fail withdrawals!');
}

if (Date.now() - lastIndexUpdate > 8 * 24 * 60 * 60 * 1000) {
    alert('WARNING: Index not updated in 8 days!');
}

if (actualYield < expectedYield * 0.5) {
    alert('WARNING: Yield significantly below expected!');
}
```

---

## Summary

### Oracle Operation Rules

1. **Monitor buffer continuously** (every minute)
2. **If buffer > $10,000:**
   - Calculate current yield
   - Update vault index
   - Lock in yield
   - Stake excess buffer
   - Update principal tracking
3. **Every Monday at 00:00 UTC:**
   - Update vault index (even if no staking)
   - Ensures regular updates during quiet periods

### Benefits of This Approach

✅ **Capital efficient:** Funds staked ASAP, not waiting for schedule
✅ **Accurate:** Index updated more frequently when active
✅ **Fair:** Reduces gaming window (unpredictable updates)
✅ **Gas efficient:** Only transacts when meaningful
✅ **Responsive:** Adapts to user activity patterns
✅ **Reliable:** Weekly fallback ensures regular updates

### Configuration Summary

```typescript
const CONFIG = {
    // Thresholds
    BUFFER_THRESHOLD: 10_000e6,        // $10k triggers stake
    MIN_BUFFER_RATIO: 0.20,            // Keep 20% liquid
    MIN_YIELD_TO_UPDATE: 0.00001,      // Only update if >0.001% yield

    // Scheduling
    WEEKLY_UPDATE_CRON: '0 0 * * 1',   // Monday 00:00 UTC
    BUFFER_CHECK_INTERVAL: 60_000,     // Check every 60 seconds

    // Allocation targets
    TARGET_ALLOCATION: {
        aave: 0.40,      // 40%
        compound: 0.30,  // 30%
        curve: 0.30      // 30%
    }
};
```
