# Yield Calculation & Vault Index System

## Overview

This document explains how the oracle correctly calculates yield and updates the vault index, accounting for new deposits, withdrawals, and multi-protocol rebalancing.

## Core Concepts

### Vault Index

The vault index represents the **cumulative growth** of the entire system over time:

```
vaultIndex starts at 1.0 (1e18)
After earning yield, it grows: 1.003, 1.006, 1.04, 1.5, 10.0, etc.

The absolute number doesn't matter - only the RATIO!
```

**Properties:**
- ✅ Starts at 1.0 (1e18 in Solidity)
- ✅ Only increases (never decreases, even during losses)
- ✅ Compounds over time
- ✅ Works at any scale (1.0, 1.5, 10, 100, 1000)

### Entry Index

Each user's entry index is a snapshot of the vault index at their deposit time:

```solidity
User A deposits when vaultIndex = 1.0
  → entryIndex = 1.0

User B deposits when vaultIndex = 1.04
  → entryIndex = 1.04

User value = balance × (currentIndex / entryIndex)
```

**This ensures fairness:**
- User A: `1000 × (1.04 / 1.0) = 1040` (4% for full period)
- User B: `1000 × (1.04 / 1.04) = 1000` (0% - just deposited)

---

## The Critical Problem: New Deposits vs Yield

### ❌ WRONG Approach (Bug!)

```typescript
// This breaks when new deposits arrive!
const weekStart = await laac.totalDeposits(USDC);  // 1,000,000
const weekEnd = await laac.totalDeposits(USDC);    // 1,500,000 (new deposits!)
const growth = weekEnd / weekStart;                 // 1.5 = 50% growth?!
// ❌ NO! That's new money, not yield!
```

### ❌ WRONG Approach #2 (Also Breaks!)

```typescript
// This breaks when oracle rebalances!
const weekStart = await aUSDC.balanceOf(laac);     // 800,000
// Oracle stakes another 200k during the week
const weekEnd = await aUSDC.balanceOf(laac);       // 1,000,500
const growth = weekEnd / weekStart;                 // 1.25 = 25% growth?!
// ❌ NO! That includes new staking!
```

### ✅ CORRECT Approach: Track Principal Off-Chain

Oracle must maintain a **ledger** of what it put into each protocol:

```typescript
// Oracle database schema
interface ProtocolPosition {
  protocol: string;         // "Aave", "Compound", "Curve"
  token: string;            // "USDC"
  principalStaked: bigint;  // Amount WE deposited (excludes yield)
  lastUpdateTime: number;   // When we last measured
}
```

---

## Oracle Yield Calculation (Correct Method)

### Step 1: Oracle Maintains Off-Chain Ledger

```typescript
// Oracle database
const positions = [
  {
    protocol: "Aave",
    token: "USDC",
    principalStaked: 400_000e6,  // What we put in
    lastUpdateTime: 1234567890
  },
  {
    protocol: "Compound",
    token: "USDC",
    principalStaked: 300_000e6,
    lastUpdateTime: 1234567890
  },
  {
    protocol: "Curve",
    token: "USDC",
    principalStaked: 300_000e6,
    lastUpdateTime: 1234567890
  }
];
```

### Step 2: Measure Current Protocol Balances

```typescript
async function measureProtocolBalances() {
  // Aave: aUSDC balance (1:1 with underlying, yield accrues to balance)
  const aaveBalance = await aUSDC.balanceOf(laac.address);

  // Compound: cUSDC balance × exchange rate
  const cUSDCBalance = await cUSDC.balanceOf(laac.address);
  const exchangeRate = await cUSDC.exchangeRateCurrent();
  const compoundBalance = cUSDCBalance * exchangeRate / 1e18;

  // Curve: LP token balance × virtual price
  const lpBalance = await curveLPToken.balanceOf(laac.address);
  const virtualPrice = await curvePool.get_virtual_price();
  const curveBalance = lpBalance * virtualPrice / 1e18;

  return {
    aave: aaveBalance,
    compound: compoundBalance,
    curve: curveBalance
  };
}
```

### Step 3: Calculate Yield (Current - Principal)

```typescript
async function calculateYield() {
  const positions = await db.getPositions("USDC");
  const current = await measureProtocolBalances();

  let totalPrincipal = 0n;
  let totalCurrent = 0n;

  for (const pos of positions) {
    const currentBalance = current[pos.protocol.toLowerCase()];

    totalPrincipal += pos.principalStaked;
    totalCurrent += currentBalance;
  }

  // This is the key calculation!
  const yieldEarned = totalCurrent - totalPrincipal;
  const growthFactor = totalCurrent / totalPrincipal;

  return { totalPrincipal, totalCurrent, yieldEarned, growthFactor };
}
```

### Step 4: Update Vault Index On-Chain

```typescript
async function updateVaultIndex() {
  const { growthFactor } = await calculateYield();

  // Get current index
  const oldIndex = await laac.vaultIndex(USDC);

  // Apply growth
  const newIndex = (oldIndex * growthFactor) / 1e18;

  // Update on-chain
  await controller.updateVaultIndex(USDC, newIndex);

  console.log(`Index updated: ${oldIndex} → ${newIndex}`);
}
```

### Step 5: Lock In Yield (Update Principal)

**CRITICAL STEP:** After updating index, update principal to avoid counting yield twice!

```typescript
async function lockInYield() {
  const current = await measureProtocolBalances();

  // Update each protocol's principal to current value
  await db.updatePrincipal("Aave", "USDC", current.aave);
  await db.updatePrincipal("Compound", "USDC", current.compound);
  await db.updatePrincipal("Curve", "USDC", current.curve);

  // Now next week's calculation will start from this new baseline
}
```

---

## Handling Oracle Operations

### When Oracle Stakes New Funds

```typescript
async function stakeNewDeposits(protocol: string, amount: bigint) {
  // 1. Transfer on-chain
  await controller.executeTransfer(USDC, protocols[protocol], amount);

  // 2. Update off-chain principal (add to principal, not yield!)
  const pos = await db.getPosition(protocol, "USDC");
  pos.principalStaked += amount;
  await db.savePosition(pos);

  // DO NOT update vault index - this is not yield!
}
```

**Why:** New staking increases principal, not yield.

### When Oracle Unstakes Funds

```typescript
async function unstakeForWithdrawal(protocol: string, amount: bigint) {
  // 1. Unstake off-chain (direct protocol call)
  if (protocol === "Aave") {
    await aavePool.withdraw(USDC, amount, laac.address);
  } else if (protocol === "Compound") {
    await cUSDC.redeemUnderlying(amount);
  }

  // 2. Update off-chain principal (subtract from principal)
  const pos = await db.getPosition(protocol, "USDC");
  pos.principalStaked -= amount;
  await db.savePosition(pos);

  // DO NOT update vault index - this is not yield!
}
```

**Why:** Unstaking reduces principal, doesn't affect yield calculation.

### When Oracle Rebalances Between Protocols

```typescript
async function rebalanceProtocols() {
  // Example: Move 100k from Aave (4% APY) to Compound (5% APY)

  // 1. Unstake from Aave
  await aavePool.withdraw(USDC, 100_000e6, laac.address);
  const aavePos = await db.getPosition("Aave", "USDC");
  aavePos.principalStaked -= 100_000e6;
  await db.savePosition(aavePos);

  // 2. Approve and stake to Compound
  await controller.executeTransfer(USDC, compoundAddress, 100_000e6);
  const compoundPos = await db.getPosition("Compound", "USDC");
  compoundPos.principalStaked += 100_000e6;
  await db.savePosition(compoundPos);

  // Total principal unchanged: 1M → 1M
  // Just moved between protocols
}
```

**Why:** Rebalancing doesn't change total principal, just allocation.

---

## Complete Timeline Example

### Day 0: Initial Stake

```
Users have deposited: 1,000,000 USDC
Buffer (20%): 200,000 USDC
Available to stake: 800,000 USDC

Oracle stakes to Aave:
- On-chain: controller.executeTransfer(USDC, Aave, 800_000e6)
- Off-chain DB: Aave.principalStaked = 800_000

State:
- vaultIndex = 1.0
- Aave balance: 800,000
- Aave principal: 800,000
- Buffer: 200,000
```

### Day 3: New Deposits Arrive

```
New users deposit: 500,000 USDC

State:
- vaultIndex = 1.0 (unchanged - no index update yet)
- Aave balance: 800,250 (earned 250 USDC yield)
- Aave principal: 800,000 (unchanged in DB)
- Buffer: 700,000 (200k old + 500k new)

Oracle stakes new buffer:
- Measures Aave: 800,250 current vs 800,000 principal = 250 yield
- Stakes 400k to Aave: controller.executeTransfer(USDC, Aave, 400_000e6)
- Updates DB: Aave.principalStaked = 1,200,000 (800k + 400k)
- NO INDEX UPDATE (new staking ≠ yield)

State after staking:
- Aave balance: 1,200,250 (800k old + 250 yield + 400k new)
- Aave principal: 1,200,000 (in DB)
- Buffer: 300,000
```

### Day 7: Weekly Index Update

```
Oracle cron job runs:

1. Measure current balances:
   - Aave balance: 1,201,200 (earned 950 more)

2. Get principal from DB:
   - Aave principal: 1,200,000

3. Calculate yield:
   - yieldEarned = 1,201,200 - 1,200,000 = 1,200
   - growthFactor = 1,201,200 / 1,200,000 = 1.001

4. Update vault index:
   - oldIndex = 1.0
   - newIndex = 1.0 × 1.001 = 1.001
   - Call: controller.updateVaultIndex(USDC, 1.001e18)

5. Lock in yield (update principal):
   - DB update: Aave.principalStaked = 1,201,200
   - (So we don't count this 1,200 yield again next week)

User balances now reflect yield:
- User A (deposited 1000 at index 1.0):
  value = 1000 × (1.001 / 1.0) = 1001 USDC
```

### Day 10: User Withdrawal

```
User B wants to withdraw 100,000 USDC

Buffer has: 300,000 (enough!)

LAAC.withdraw() executes:
- Transfers 100k from buffer to user
- No oracle involvement needed
- No index update needed
- Buffer now: 200,000

Oracle monitors buffer, no action needed (still above minimum).
```

### Day 14: Second Weekly Update

```
1. Measure:
   - Aave balance: 1,202,400 (earned 1,200 more)

2. Get principal:
   - Aave principal: 1,201,200 (from Day 7 lock-in)

3. Calculate:
   - yieldEarned = 1,202,400 - 1,201,200 = 1,200
   - growthFactor = 1,202,400 / 1,201,200 = 1.001

4. Update index:
   - oldIndex = 1.001
   - newIndex = 1.001 × 1.001 = 1.002001
   - Call: controller.updateVaultIndex(USDC, 1.002001e18)

5. Lock in:
   - DB: Aave.principalStaked = 1,202,400
```

---

## Multi-Protocol Yield Calculation

### Scenario: 3 Protocols, Different APYs

```
Oracle has staked across multiple protocols:
- Aave: 40% allocation, 4% APY
- Compound: 30% allocation, 3.5% APY
- Curve: 30% allocation, 5% APY

Off-chain DB:
{
  "Aave.USDC": { principalStaked: 400_000 },
  "Compound.USDC": { principalStaked: 300_000 },
  "Curve.USDC": { principalStaked: 300_000 }
}
```

### Weekly Update Calculation

```typescript
async function updateMultiProtocolIndex() {
  // 1. Measure all protocols
  const aaveBalance = await aUSDC.balanceOf(laac);        // 400,133
  const compoundBalance = await getCompoundBalance();     // 300,087
  const curveBalance = await getCurveBalance();           // 300,125

  // 2. Get principals from DB
  const aavePrincipal = 400_000;
  const compoundPrincipal = 300_000;
  const curvePrincipal = 300_000;

  // 3. Calculate totals
  const totalPrincipal = 1_000_000;
  const totalCurrent = 400_133 + 300_087 + 300_125 = 1_000_345;

  // 4. Blended growth (automatically weighted!)
  const growthFactor = 1_000_345 / 1_000_000 = 1.000345;

  // 5. Update index
  const newIndex = oldIndex × 1.000345;
  await controller.updateVaultIndex(USDC, newIndex);

  // 6. Lock in all yields
  await db.updatePrincipal("Aave", "USDC", 400_133);
  await db.updatePrincipal("Compound", "USDC", 300_087);
  await db.updatePrincipal("Curve", "USDC", 300_125);
}
```

**Key Insight:** Oracle doesn't need to calculate weighted APY manually - the total value automatically reflects the weighted performance!

---

## Why Index Never Decreases

### Design Decision: Stability Over Accuracy

```
Scenario: Protocol gets hacked, loses 10%

Option A (Realistic):
- vaultIndex decreases 10%
- All user balances drop 10%
- ❌ Causes panic, bank run

Option B (Current Design):
- vaultIndex stays same
- Oracle records loss off-chain
- Future yields go toward recovering loss
- ✅ Maintains user confidence
```

**Implementation:**
```solidity
function updateVaultIndex(address token, uint256 newIndex) external {
    require(newIndex >= vaultIndex[token], "Index cannot decrease");
    // ...
}
```

---

## Index Update Frequency

### Recommended: Weekly

```
Daily: Too expensive (gas costs)
Weekly: Good balance ✅
Monthly: Too slow (users want faster updates)
```

### Oracle Cron Job

```typescript
// Run every Monday at 00:00 UTC
cron.schedule('0 0 * * 1', async () => {
  console.log('Weekly vault index update starting...');

  await updateVaultIndex();

  console.log('Index update complete');
});
```

---

## On-Chain vs Off-Chain Tracking

### What's Stored Where

| Data | Location | Why |
|------|----------|-----|
| **vaultIndex** | On-chain | Users need this for balance calculation |
| **user.entryIndex** | On-chain | Determines user's share of yield |
| **totalDeposits** | On-chain | Needed for withdrawal validation |
| **Per-protocol principal** | Off-chain | Oracle's internal tracking |
| **Protocol APYs** | Off-chain | Just reference data |
| **Historical yields** | Off-chain | For analytics/reporting |

### Optional: On-Chain Total Staked

```solidity
// Optional transparency feature
mapping(address => uint256) public totalStaked;

// Updated when oracle stakes/unstakes
function _updateTotalStaked(address token, uint256 amount, bool isStaking)
    external
    onlyController
{
    if (isStaking) {
        totalStaked[token] += amount;
    } else {
        totalStaked[token] -= amount;
    }
}

// Allows verification:
// totalDeposits - buffer should equal totalStaked
```

**Use case:** Allows anyone to verify oracle isn't lying about how much is staked.

```typescript
// Anyone can check:
const totalDeposits = await laac.totalDeposits(USDC);
const buffer = await USDC.balanceOf(laac.address);
const totalStaked = await laac.totalStaked(USDC);

// Should be true:
assert(totalDeposits - buffer === totalStaked);
```

**Trade-off:**
- ✅ Transparency (anyone can audit)
- ❌ Extra gas cost (~20k per stake/unstake)
- ❌ More state to manage

---

## Verification & Auditing

### Off-Chain Monitoring

Even without on-chain tracking, anyone can verify:

```typescript
async function auditOracle() {
  // 1. Check LAAC's actual protocol balances
  const aaveBalance = await aUSDC.balanceOf(laac.address);
  const compoundBalance = await getCompoundBalance(laac.address);

  // 2. Compare to oracle's claimed allocations (from events)
  const transferEvents = await controller.queryFilter(
    controller.filters.TransferExecuted()
  );

  // 3. Calculate what SHOULD be staked
  let expectedStaked = 0;
  for (const event of transferEvents) {
    expectedStaked += event.args.amount;
  }

  // 4. Compare
  const actualStaked = aaveBalance + compoundBalance;
  if (actualStaked < expectedStaked * 0.99) {
    alert("Oracle might have lost funds or miscalculated!");
  }
}
```

### Oracle's Self-Check

```typescript
// Oracle should run this before each index update
async function validateOwnState() {
  const dbPrincipal = await db.getTotalPrincipal("USDC");
  const actualBalance = await measureAllProtocolBalances();

  if (actualBalance < dbPrincipal) {
    throw new Error("Protocol balance less than principal! Possible hack or DB error");
  }

  const yieldEarned = actualBalance - dbPrincipal;
  const expectedYield = calculateExpectedYield(dbPrincipal, averageAPY, timePeriod);

  if (yieldEarned < expectedYield * 0.5) {
    console.warn("Yield significantly lower than expected!");
  }
}
```

---

## Summary: The Correct Flow

1. **Oracle maintains off-chain ledger** of per-protocol principals
2. **Weekly:** Oracle measures current protocol balances
3. **Calculate:** `growth = currentTotal / principalTotal`
4. **Update on-chain:** `newIndex = oldIndex × growth`
5. **Lock in yield:** Update principals in DB to current balances
6. **Repeat next week** from new baseline

**Key Principles:**
- ✅ Only measure yield from staked portion (exclude new deposits)
- ✅ Track principal separately from current value
- ✅ Lock in yield after each update to avoid double-counting
- ✅ Multi-protocol yields blend automatically via total value
- ✅ Index never decreases (stability over accuracy)

**What's On-Chain:**
- vaultIndex (required for user calculations)
- user entryIndex (required for user calculations)
- totalDeposits (required for system operation)
- Optional: totalStaked (for transparency)

**What's Off-Chain:**
- Per-protocol principal tracking (oracle's internal state)
- Historical APY data (for analytics)
- Rebalancing logic (oracle's decision-making)
