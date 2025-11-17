# Oracle Staking Strategy - Handling Dynamic Deposits

## Problem Statement

When users deposit continuously over time, the oracle must correctly calculate tier index growth without being affected by unstaked funds.

### Example Scenario:

```
Day 1:  User 1 deposits $1,000
        Oracle stakes:
          LOW_RISK: $700 → Aave
          MODERATE: $200 → Compound
          HIGH: $100 → Curve

Day 15: User 2 deposits $10,000,000
        Funds sitting in Proxify contract (NOT YET STAKED)

Day 30: Oracle needs to update indices
        Problem: How to calculate growth without mixing staked + unstaked funds?
```

---

## ✅ Solution: Oracle Maintains Staking Records

### **Oracle's Off-Chain Database Schema**

```typescript
interface ProtocolStake {
  protocol: address;           // AAVE_POOL, COMPOUND_CUSDC, etc.
  tierId: bytes32;            // LOW_RISK, MODERATE_RISK, HIGH_RISK
  token: address;             // USDC
  stakedAmount: bigint;       // Amount oracle sent to protocol
  stakedAt: number;           // Timestamp when staked
  lastIndexUpdate: number;    // Last time index was updated
  lastBalance: bigint;        // Last recorded protocol balance
}

interface TierState {
  tierId: bytes32;
  token: address;
  totalStaked: bigint;        // Sum of all protocols in this tier
  protocols: ProtocolStake[]; // All protocols for this tier
  currentIndex: bigint;       // Current on-chain index
  pendingDeposits: bigint;    // Funds not yet staked
}
```

---

## 📊 Oracle Workflow: Index Update with Pending Deposits

### **Step 1: Read Contract State**

```typescript
// Read from Proxify contract
const totalDeposits = await proxify.getTotalDeposits(USDC);
// → $10,001,000 (User 1: $1,000 + User 2: $10,000,000)

const totalStaked = await proxify.getTotalStaked(USDC);
// → $1,000 (only User 1's funds were staked)

const stakeableBalance = await proxify.getStakeableBalance(USDC);
// → $10,000,000 (User 2's deposit waiting to be staked)
```

### **Step 2: Calculate Tier Breakdown**

```typescript
// Get client's tier allocations
const tiers = await clientRegistry.getClientRiskTiers(BITKUB);
// → LOW_RISK: 70%, MODERATE: 20%, HIGH: 10%

// Calculate what SHOULD BE staked per tier
const targetLowRisk = totalDeposits * 0.70;      // $7,000,700
const targetModerate = totalDeposits * 0.20;     // $2,000,200
const targetHigh = totalDeposits * 0.10;         // $1,000,100

// What IS CURRENTLY staked (from oracle's records)
const currentLowRisk = 700;   // From Day 1
const currentModerate = 200;  // From Day 1
const currentHigh = 100;      // From Day 1

// Calculate pending amounts
const pendingLowRisk = targetLowRisk - currentLowRisk;      // $7,000,000
const pendingModerate = targetModerate - currentModerate;   // $2,000,000
const pendingHigh = targetHigh - currentHigh;               // $1,000,000
```

### **Step 3: Update Indices (Use ONLY Currently Staked Amounts)**

```typescript
// FOR LOW_RISK TIER (Aave)
// ─────────────────────────────────────────────

// Read oracle's record of what was staked
const previouslyStaked = oracleDB.getTierStake(LOW_RISK, AAVE_POOL);
// → { stakedAmount: 700, stakedAt: day1, lastBalance: 700 }

// Read current protocol balance
const currentAaveBalance = await aUSDC.balanceOf(proxifyAddress);
// → 728 USDC (grew 4% in 30 days)

// Calculate growth rate (IGNORING unstaked funds)
const growthRate = currentAaveBalance / previouslyStaked.stakedAmount;
// = 728 / 700 = 1.04

// Read old index
const oldIndex = await proxify.getTierIndex(USDC, LOW_RISK);
// → 1e18

// Calculate new index
const newIndex = oldIndex * growthRate;
// = 1e18 * 1.04 = 1.04e18

// Validate growth
const maxAllowed = oldIndex * maxIndexGrowth; // 1e18 * 5 = 5e18
require(newIndex <= maxAllowed); // 1.04e18 <= 5e18 ✅
```

### **Step 4: Update Index On-Chain**

```typescript
// Submit ONLY the index update (not the staking yet)
await proxifyController.batchUpdateTierIndices(
  USDC,
  [LOW_RISK, MODERATE_RISK, HIGH_RISK],
  [1.04e18, 1.05e18, 1.08e18]
);

// This updates all existing users' values:
// User 1: 700 * 1.04 = 728 ✅
// User 2: Will use entryIndex = 1.04 when their funds get staked
```

### **Step 5: Stake Pending Deposits**

```typescript
// NOW stake User 2's funds at the UPDATED index
await proxifyController.executeTransfer(
  USDC,
  AAVE_POOL,
  7000000e6,  // $7M for LOW_RISK
  LOW_RISK,
  "Low Risk - Aave"
);

// Update oracle's records
oracleDB.updateTierStake(LOW_RISK, AAVE_POOL, {
  stakedAmount: 700 + 7000000,  // Now tracking $7,000,700
  lastBalance: 728 + 7000000,   // Current balance
  lastIndexUpdate: block.timestamp
});
```

---

## 🔍 Why This Works

### **User 1 (Deposited Day 1)**

```
Deposit: $1,000 at index 1.0
  LOW_RISK account:
    balance: 700 units
    entryIndex: 1.0

After 30 days (index grows to 1.04):
  Value = (700 * 1.04) / 1.0 = 728 ✅ Correct 4% growth
```

### **User 2 (Deposited Day 15, Staked Day 30)**

```
Deposit: $10,000,000 at index 1.0 (contract index when they deposited)
  LOW_RISK account:
    balance: 7,000,000 units
    entryIndex: 1.0

Oracle stakes on Day 30 at index 1.04:
  Their funds enter Aave at current value
  They start earning from index 1.04 going forward

After 60 days (index grows to 1.08):
  User 1: (700 * 1.08) / 1.0 = 756 (8% total from Day 1)
  User 2: (7M * 1.08) / 1.0 = 7.56M (8% total from Day 15)
  
  Both earn proportionally! ✅
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ **WRONG: Using totalDeposits for Growth Calculation**

```typescript
// DON'T DO THIS!
const totalDeposits = 10,001,000;  // Includes unstaked funds
const aaveBalance = 728;
const growth = 728 / 10,001,000 = 0.0000728 ❌
// Index would drop to near-zero!
```

### ✅ **CORRECT: Using Only Staked Amount**

```typescript
// DO THIS!
const previouslyStaked = 700;  // What was actually in Aave
const aaveBalance = 728;
const growth = 728 / 700 = 1.04 ✅
// Index correctly grows 4%
```

---

## 📝 Oracle State Management

### **Required Oracle Database Tables**

```sql
-- Track what's staked in each protocol
CREATE TABLE tier_stakes (
  tier_id BYTES32 NOT NULL,
  token_address ADDRESS NOT NULL,
  protocol_address ADDRESS NOT NULL,
  staked_amount NUMERIC(78, 0) NOT NULL,
  staked_at TIMESTAMP NOT NULL,
  last_balance NUMERIC(78, 0),
  last_checked TIMESTAMP,
  PRIMARY KEY (tier_id, token_address, protocol_address)
);

-- Track index updates
CREATE TABLE index_updates (
  tier_id BYTES32 NOT NULL,
  token_address ADDRESS NOT NULL,
  old_index NUMERIC(78, 0) NOT NULL,
  new_index NUMERIC(78, 0) NOT NULL,
  growth_rate NUMERIC(18, 6) NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  tx_hash BYTES32 NOT NULL
);

-- Track pending stakes
CREATE TABLE pending_stakes (
  tier_id BYTES32 NOT NULL,
  token_address ADDRESS NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  calculated_at TIMESTAMP NOT NULL,
  staked BOOLEAN DEFAULT FALSE,
  staked_at TIMESTAMP
);
```

---

## 🎯 Complete Oracle Cycle Example

### **Timeline with Continuous Deposits**

```
Day 1:
  User 1 deposits $1,000
  Oracle stakes: LOW_RISK $700 → Aave
  Oracle records: aaveStaked = $700
  Index: 1.0

Day 15:
  User 2 deposits $10,000,000
  Oracle records: pendingLowRisk = $7,000,000
  Index: 1.0 (unchanged, no growth update yet)

Day 30:
  1. Oracle reads Aave: $728 (4% growth)
  2. Oracle calculates: 728 / 700 = 1.04
  3. Oracle updates index: 1.0 → 1.04
     - User 1's value: 700 * 1.04 = 728 ✅
     - User 2's value: 7M * 1.04 = 7.28M (still pending)
  4. Oracle stakes pending: $7M → Aave
  5. Oracle records: aaveStaked = $7,000,700
  Index: 1.04

Day 45:
  User 3 deposits $5,000,000
  Oracle records: pendingLowRisk = $3,500,000
  Index: 1.04

Day 60:
  1. Oracle reads Aave: $7,280,728 (4% growth on $7,000,700)
  2. Oracle calculates: 7,280,728 / 7,000,700 = 1.04
  3. Oracle updates index: 1.04 → 1.0816 (1.04 * 1.04)
     - User 1: 700 * 1.0816 / 1.0 = 757.12 (8% total) ✅
     - User 2: 7M * 1.0816 / 1.0 = 7,571,200 (8% from deposit) ✅
     - User 3: 3.5M * 1.0816 / 1.04 = 3,640,000 (4% from Day 45) ✅
  4. Oracle stakes pending: $3.5M → Aave
  5. Oracle records: aaveStaked = $10,780,728
```

---

## 🔐 Security Considerations

### **1. Race Condition Protection**

```typescript
// Oracle should batch operations:
async function updateAndStake(token: address, tierId: bytes32) {
  // Step 1: Calculate growth using CURRENT staked amount
  const growth = await calculateGrowth(tierId, token);
  
  // Step 2: Update index
  await proxifyController.updateTierIndex(token, tierId, growth.newIndex);
  
  // Step 3: NOW stake pending funds (they enter at new index)
  const pending = await calculatePending(tierId, token);
  if (pending > 0) {
    await proxifyController.executeTransfer(
      token,
      protocol,
      pending,
      tierId,
      tierName
    );
  }
}
```

### **2. Staleness Detection**

```typescript
// Detect if index is stale
const lastUpdate = await proxify.getTierIndexWithTimestamp(USDC, LOW_RISK);
const timeSinceUpdate = Date.now() / 1000 - lastUpdate.updatedAt;

if (timeSinceUpdate > 86400) {  // More than 1 day
  console.warn("Index is stale! Users may have inaccurate values");
  // Oracle should update ASAP
}
```

### **3. Unstaked Fund Monitoring**

```typescript
// Alert if too much is sitting unstaked
const stakeableBalance = await proxify.getStakeableBalance(USDC);
const totalDeposits = await proxify.getTotalDeposits(USDC);
const unstakedPercentage = stakeableBalance / totalDeposits;

if (unstakedPercentage > 0.05) {  // More than 5% unstaked
  console.warn("Too much unstaked! Should stake pending deposits");
  // Oracle should call executeTransfer()
}
```

---

## ✅ Summary: Oracle's Golden Rules

1. **ALWAYS use staked amount for growth calculation, NEVER totalDeposits**
2. **Update indices BEFORE staking new deposits**
3. **Track staked amounts per protocol off-chain**
4. **Pending deposits enter at the CURRENT index after update**
5. **Each index update uses the balance from the PREVIOUS stake amount**

This ensures:
- ✅ Existing users earn correct yield
- ✅ New users don't dilute the index
- ✅ Growth rates stay accurate
- ✅ All users are treated fairly

---

**Next Steps:**
- Implement oracle database schema
- Create `calculateGrowth()` function
- Create `calculatePending()` function
- Add monitoring for unstaked balances
- Set up alerts for stale indices
