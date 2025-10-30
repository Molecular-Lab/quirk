# Dynamic Risk Tier Architecture

**Version:** 2.0
**Date:** 2025-10-29
**Status:** Architecture Design - Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Design Decisions](#design-decisions)
3. [Data Structures](#data-structures)
4. [Core Concepts](#core-concepts)
5. [Deposit Flow](#deposit-flow)
6. [Withdrawal Flow](#withdrawal-flow)
7. [Gas Optimization](#gas-optimization)
8. [Security Considerations](#security-considerations)
9. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Problem Statement

The original LAAC architecture used a single balance per user, requiring complex on-chain calculations during withdrawals. This resulted in:
- High gas costs (~$12-17 per withdrawal @ 50 gwei)
- Limited flexibility for multi-tier yield strategies
- Difficulty adding new risk tiers without contract upgrades

### Solution

**Dynamic Risk Tier Architecture** with:
- ✅ Client-defined risk allocations (e.g., 70% low, 20% moderate, 10% high)
- ✅ Separate balance tracking per risk tier
- ✅ Off-chain calculation by oracle, on-chain validation by contract
- ✅ Batch withdrawal gas sharing (80% savings)
- ✅ Infinite tier scalability (not limited to 3 tiers)

### Key Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Gas per withdrawal** | $12.50 | $1.50 | **88% cheaper** |
| **Tier flexibility** | Fixed 3 tiers | Unlimited | **∞** |
| **Calculation location** | On-chain | Off-chain | **Lower risk** |
| **Batch efficiency** | N/A | 100 users/batch | **80% savings** |
| **Client customization** | None | Full control | **✅** |

---

## Design Decisions

### Decision 1: Storage Structure

**Chosen: 4-Level Nested Mapping**

```solidity
mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => mapping(address => Account)))) accounts;
//     clientId    userId      tierId      token
```

**Rationale:**
- ✅ Direct access pattern (O(1) lookup)
- ✅ Gas-efficient reads (~2,100 gas per SLOAD)
- ✅ Supports infinite tiers (no array size limits)
- ✅ Clean separation per tier

**Alternatives Considered:**

```solidity
// ❌ Alternative A: Composite key
mapping(bytes32 => Account) accounts;
// compositeKey = keccak256(abi.encodePacked(clientId, userId, tierId, token))
// Rejected: Cannot iterate user's tiers easily

// ❌ Alternative B: Array-based tiers
struct TieredAccount {
    TierBalance[10] tiers;  // Limited to 10 tiers
}
// Rejected: Hard limit, expensive iteration
```

### Decision 2: Tier Identification

**Chosen: bytes32 Hash IDs**

```solidity
bytes32 constant LOW_RISK = keccak256("LOW_RISK");
bytes32 constant MODERATE_RISK = keccak256("MODERATE_RISK");
bytes32 constant HIGH_RISK = keccak256("HIGH_RISK");

// Clients can define custom tiers
bytes32 customTier = keccak256("BITKUB_ULTRA_SAFE");
```

**Rationale:**
- ✅ Infinite namespace (no collisions)
- ✅ Human-readable (can decode off-chain)
- ✅ Gas-efficient (32 bytes = 1 storage slot)
- ✅ No enum limits (can add tiers without upgrade)

**Alternatives Considered:**

```solidity
// ❌ Alternative: uint8 enum
enum RiskTier { LOW, MODERATE, HIGH }  // Max 256 tiers
// Rejected: Limited to 256, requires upgrade to add new tiers
```

### Decision 3: Withdrawal Calculation

**Chosen: Off-Chain Calculation, On-Chain Validation**

**Flow:**
```
1. Oracle reads tier balances from contract
2. Oracle calculates:
   - Current tier values (applying growth indices)
   - Yield per tier
   - Fees (service + gas / batch size)
   - Proportional tier reductions
3. Oracle submits pre-calculated data to contract
4. Contract validates:
   - Tier balances sufficient
   - Transfer limits not exceeded
5. Contract executes transfer
```

**Rationale:**
- ✅ 80% cheaper gas (simple validation vs complex calculation)
- ✅ Flexible fee logic (can change without contract upgrade)
- ✅ Batch efficiency (amortize gas across users)
- ✅ Matches existing oracle-driven architecture

**Alternatives Considered:**

```solidity
// ❌ Alternative: Full on-chain calculation
function withdraw(...) {
    for (uint i = 0; i < tierCount; i++) {
        // Calculate tier values, yield, fees in Solidity
    }
}
// Rejected: 4x more expensive, complex logic, higher bug risk
```

### Decision 4: Client Risk Configuration

**Chosen: Client-Defined, User-Inherited**

**Model:**
- Each client defines their risk allocation (e.g., 70-20-10)
- All users under that client automatically inherit the allocation
- Users CANNOT customize their own allocation

**Example:**
```
Client A (Bitkub): 70% LOW, 20% MODERATE, 10% HIGH
  → All Bitkub users get 70-20-10 split

Client B (SMBC): 80% ULTRA_SAFE, 20% AGGRESSIVE
  → All SMBC users get 80-20 split

Client C (Gaming DAO): 50% CONSERVATIVE, 30% BALANCED, 15% GROWTH, 5% SPECULATIVE
  → All DAO users get 50-30-15-5 split
```

**Rationale:**
- ✅ Simplifies UX (users don't need to understand risk tiers)
- ✅ Reduces gas (no per-user configuration storage)
- ✅ Aligns with B2B model (clients set policy for their ecosystem)
- ✅ Easier compliance (consistent allocation per client)

**Alternatives Considered:**

```solidity
// ❌ Alternative: Per-user customization
mapping(bytes32 => mapping(bytes32 => AllocationStrategy)) userAllocations;
// Rejected: Complex, high gas, not needed for B2B use case
```

### Decision 5: Gas Fee Distribution

**Chosen: Batch-Shared Gas Costs**

**Model:**
```
Batch of 100 withdrawals:
  Total gas: 3,000,000 gas @ 50 gwei = $150
  Per user: $150 / 100 = $1.50

vs Individual withdrawals:
  Per user: 120,000 gas @ 50 gwei = $6.00

Savings: 75% per user! 🚀
```

**Implementation:**
```solidity
function batchWithdraw(
    WithdrawalExecution[] calldata executions,
    uint256 estimatedTotalGas
) external onlyRole(ORACLE_ROLE) {
    uint256 totalGasCost = estimatedTotalGas * tx.gasprice;
    uint256 gasFeePerUser = totalGasCost / executions.length;

    for (uint i = 0; i < executions.length; i++) {
        // Each user pays equal share
        operationFeeVault[token] += gasFeePerUser;
        // ... execute withdrawal
    }
}
```

**Rationale:**
- ✅ Fair (everyone pays equal share)
- ✅ Efficient (amortize fixed costs)
- ✅ Scalable (more users = cheaper per user)
- ✅ Predictable (oracle calculates upfront)

---

## Data Structures

### 1. Risk Tier Definition

Stored in **ClientRegistry** contract.

```solidity
struct RiskTier {
    bytes32 tierId;           // keccak256("LOW_RISK")
    string name;              // "Low Risk"
    uint16 allocationBps;     // 7000 = 70%
    bool isActive;            // Can be disabled
}
```

**Example Client Configuration:**

```solidity
// Client A: Bitkub
RiskTier[] clientARiskTiers = [
    RiskTier({
        tierId: keccak256("LOW_RISK"),
        name: "Low Risk (Aave, Compound)",
        allocationBps: 7000,  // 70%
        isActive: true
    }),
    RiskTier({
        tierId: keccak256("MODERATE_RISK"),
        name: "Moderate Risk (Curve Stable Pools)",
        allocationBps: 2000,  // 20%
        isActive: true
    }),
    RiskTier({
        tierId: keccak256("HIGH_RISK"),
        name: "High Risk (Curve Volatile, Yearn)",
        allocationBps: 1000,  // 10%
        isActive: true
    })
];

// Validation: 7000 + 2000 + 1000 = 10000 ✅ (100%)
```

### 2. User Account (Per Tier)

Stored in **LAAC** contract.

```solidity
struct Account {
    uint256 balance;        // Balance units (at entry index)
    uint256 entryIndex;     // Vault index when user deposited
    uint256 depositedAt;    // Timestamp for fee calculation
}
```

**Storage Mapping:**

```solidity
mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => mapping(address => Account))))
    private accounts;
//     clientId    userId      tierId      token
```

**Example:**

```solidity
// User "Alice" under "Bitkub" deposited 1000 USDC
// Split: 700 LOW, 200 MODERATE, 100 HIGH

accounts[BITKUB][ALICE][LOW_RISK][USDC] = Account({
    balance: 700e6,           // 700 USDC (6 decimals)
    entryIndex: 1.0e18,       // Deposited at index 1.0
    depositedAt: 1730217600   // Timestamp
});

accounts[BITKUB][ALICE][MODERATE_RISK][USDC] = Account({
    balance: 200e6,
    entryIndex: 1.0e18,
    depositedAt: 1730217600
});

accounts[BITKUB][ALICE][HIGH_RISK][USDC] = Account({
    balance: 100e6,
    entryIndex: 1.0e18,
    depositedAt: 1730217600
});
```

### 3. Tier Vault Indices

Tracks yield growth per tier per token.

```solidity
mapping(bytes32 => mapping(address => uint256)) public tierVaultIndices;
//     tierId      token
```

**Example:**

```solidity
// After protocols earn yield for 1 year:
tierVaultIndices[LOW_RISK][USDC] = 1.04e18;       // 4% APY (Aave)
tierVaultIndices[MODERATE_RISK][USDC] = 1.05e18;  // 5% APY (Curve stable)
tierVaultIndices[HIGH_RISK][USDC] = 1.08e18;      // 8% APY (Curve volatile)

// Alice's current value:
// LOW: (700 × 1.04) / 1.0 = 728 USDC
// MODERATE: (200 × 1.05) / 1.0 = 210 USDC
// HIGH: (100 × 1.08) / 1.0 = 108 USDC
// Total: 1,046 USDC (46 USDC yield on 1,000 deposited)
```

### 4. Active Tier Tracking

For efficient iteration and frontend display.

```solidity
mapping(bytes32 => mapping(bytes32 => mapping(address => bytes32[])))
    private userActiveTiers;
//     clientId    userId      token       [list of tierIds]
```

**Example:**

```solidity
// Alice has funds in all 3 tiers
userActiveTiers[BITKUB][ALICE][USDC] = [
    LOW_RISK,
    MODERATE_RISK,
    HIGH_RISK
];

// Bob only deposited to LOW and MODERATE
userActiveTiers[BITKUB][BOB][USDC] = [
    LOW_RISK,
    MODERATE_RISK
];
```

**Usage:**
- Oracle uses this to calculate total value
- Frontend uses this to display tier breakdown
- Batch withdrawal uses this to determine which tiers to reduce

### 5. Withdrawal Execution Data

Passed from oracle to contract during batch withdrawal.

```solidity
struct WithdrawalExecution {
    bytes32 clientId;
    bytes32 userId;
    address token;
    address to;

    bytes32[] tierIds;              // [LOW_RISK, MODERATE_RISK, HIGH_RISK]
    uint256[] tierReductions;       // [350, 100, 50] balance units to reduce

    uint256 grossAmount;            // Total token value before fees
    uint256 serviceFee;             // 20% of yield
    uint256 gasFeeShare;            // totalGas / batchSize
    uint256 netAmount;              // Amount user receives
}
```

**Example:**

```solidity
WithdrawalExecution({
    clientId: BITKUB,
    userId: ALICE,
    token: USDC_ADDRESS,
    to: 0xALICE...,

    tierIds: [LOW_RISK, MODERATE_RISK, HIGH_RISK],
    tierReductions: [350e6, 100e6, 50e6],  // Reduce each tier by 50%

    grossAmount: 523e6,     // Value after applying indices
    serviceFee: 4.6e6,      // 20% of 23 USDC yield
    gasFeeShare: 1.5e6,     // $1.50 gas share
    netAmount: 517e6        // 523 - 4.6 - 1.5 = 516.9 USDC to Alice
})
```

---

## Core Concepts

### Concept 1: Separate Sub-Accounts Per Tier

Think of each tier as a **separate savings account** with different interest rates.

```
┌─────────────────────────────────────────────────────────────┐
│                   ALICE'S ACCOUNTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sub-Account 1: LOW_RISK (Safe protocols)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Deposited: 700 USDC at index 1.0                     │  │
│  │ Current Index: 1.04 (4% growth)                      │  │
│  │ Current Value: (700 × 1.04) / 1.0 = 728 USDC        │  │
│  │ Yield: 28 USDC                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Sub-Account 2: MODERATE_RISK (Balanced)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Deposited: 200 USDC at index 1.0                     │  │
│  │ Current Index: 1.05 (5% growth)                      │  │
│  │ Current Value: (200 × 1.05) / 1.0 = 210 USDC        │  │
│  │ Yield: 10 USDC                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Sub-Account 3: HIGH_RISK (Aggressive)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Deposited: 100 USDC at index 1.0                     │  │
│  │ Current Index: 1.08 (8% growth)                      │  │
│  │ Current Value: (100 × 1.08) / 1.0 = 108 USDC        │  │
│  │ Yield: 8 USDC                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  TOTAL VALUE: 728 + 210 + 108 = 1,046 USDC                │
│  TOTAL DEPOSITED: 1,000 USDC                               │
│  TOTAL YIELD: 46 USDC (4.6% blended APY)                  │
└─────────────────────────────────────────────────────────────┘
```

### Concept 2: Proportional Withdrawal

When user withdraws, reduce ALL tiers proportionally.

**Example: Alice wants to withdraw 50% (500 USDC)**

```
Current balances:
  LOW_RISK: 700 units
  MODERATE_RISK: 200 units
  HIGH_RISK: 100 units
  Total: 1,000 units

Withdrawal: 500 units (50% of total)

Proportional reductions:
  LOW_RISK: 700 × 0.5 = 350 units
  MODERATE_RISK: 200 × 0.5 = 100 units
  HIGH_RISK: 100 × 0.5 = 50 units

After withdrawal balances:
  LOW_RISK: 350 units
  MODERATE_RISK: 100 units
  HIGH_RISK: 50 units
  Total: 500 units ✅
```

**Why proportional?**
- ✅ Maintains client's risk allocation (still 70-20-10 split)
- ✅ Fair yield distribution (user doesn't cherry-pick high-yield tier)
- ✅ Simple calculation (linear math)

### Concept 3: Tier-Specific Growth Indices

Each tier tracks its own yield separately.

```
┌─────────────────────────────────────────────────────────────┐
│              TIER VAULT INDICES (USDC)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  tierVaultIndices[LOW_RISK][USDC]                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Protocols: Aave USDC (4.2%), Compound USDC (4.0%)    │  │
│  │ Blended APY: 4.1%                                     │  │
│  │ Current Index: 1.041e18                               │  │
│  │ Updated: Daily by oracle                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  tierVaultIndices[MODERATE_RISK][USDC]                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Protocols: Curve 3pool (5.5%), Curve USDC/USDT (4.8%)│  │
│  │ Blended APY: 5.2%                                     │  │
│  │ Current Index: 1.052e18                               │  │
│  │ Updated: Daily by oracle                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  tierVaultIndices[HIGH_RISK][USDC]                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Protocols: Curve Tricrypto (8.5%), Yearn USDC (7.8%) │  │
│  │ Blended APY: 8.2%                                     │  │
│  │ Current Index: 1.082e18                               │  │
│  │ Updated: Daily by oracle                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Index Update Flow:**
```
1. Oracle monitors protocol yields (off-chain)
2. Oracle calculates blended yield per tier
3. Oracle updates on-chain index:
   newIndex = oldIndex × (1 + dailyYield)
4. All users' balances automatically reflect new value
```

### Concept 4: Weighted Average Entry Index

When user deposits multiple times, calculate weighted average entry index **per tier**.

**Example:**

```
Alice's initial deposit: 1,000 USDC
  LOW_RISK: 700 units at index 1.0

Index grows to 1.04 (4% yield accrued)

Alice deposits another 1,000 USDC
  LOW_RISK: 700 units at index 1.04

Weighted average entry index for LOW_RISK tier:
  = (700 × 1.0 + 700 × 1.04) / (700 + 700)
  = (700 + 728) / 1400
  = 1.02

New balance:
  LOW_RISK: 1,400 units at entry index 1.02

Current value:
  = (1,400 × 1.04) / 1.02
  = 1,427 USDC ✅

This ensures fair yield calculation regardless of deposit timing!
```

---

## Deposit Flow

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     DEPOSIT FLOW                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User calls deposit via client app                       │
│     depositFrom(clientId, userId, token, 1000 USDC)         │
│                                                              │
│  2. Contract reads client risk configuration                │
│     clientRegistry.getClientInfo(clientId)                  │
│     → RiskTiers: [LOW 70%, MODERATE 20%, HIGH 10%]          │
│                                                              │
│  3. Contract splits deposit into tiers                      │
│     lowAmount = 1000 × 0.70 = 700 USDC                     │
│     moderateAmount = 1000 × 0.20 = 200 USDC                │
│     highAmount = 1000 × 0.10 = 100 USDC                    │
│                                                              │
│  4. For each tier:                                          │
│     a. Read current tier vault index                        │
│        currentIndex = tierVaultIndices[tierId][token]       │
│                                                              │
│     b. Calculate weighted entry index (if existing balance) │
│        if (existingBalance > 0) {                           │
│          newEntryIndex = (oldBalance × oldEntry +           │
│                          newAmount × currentIndex) /        │
│                          (oldBalance + newAmount)           │
│        } else {                                             │
│          newEntryIndex = currentIndex                       │
│        }                                                     │
│                                                              │
│     c. Update tier balance                                  │
│        account.balance += tierAmount                        │
│        account.entryIndex = newEntryIndex                   │
│        account.depositedAt = block.timestamp                │
│                                                              │
│  5. Add tier to active tiers (if first deposit)            │
│     if (!contains(userActiveTiers[clientId][userId][token], │
│                   tierId)) {                                │
│       userActiveTiers[clientId][userId][token].push(tierId) │
│     }                                                        │
│                                                              │
│  6. Update global counters                                  │
│     totalDeposits[token] += 1000                            │
│                                                              │
│  7. Transfer tokens from user                               │
│     IERC20(token).safeTransferFrom(user, LAAC, 1000)        │
│                                                              │
│  8. Emit event                                              │
│     emit Deposited(clientId, userId, token, 1000, ...)      │
│                                                              │
│  Gas cost: ~150k gas = $7.50 @ 50 gwei                     │
│  (One-time cost when user adds funds)                       │
└──────────────────────────────────────────────────────────────┘
```

### Detailed Solidity Logic

```solidity
function depositFrom(
    bytes32 clientId,
    bytes32 userId,
    address token,
    uint256 amount,
    address from
) external nonReentrant {
    require(supportedTokens[token], "Token not supported");
    require(amount > 0, "Amount must be > 0");
    require(clientRegistry.isClientActive(clientId), "Client not active");

    // Get client's risk tiers
    RiskTier[] memory riskTiers = clientRegistry.getClientRiskTiers(clientId);

    // For each tier, calculate deposit amount and update account
    for (uint i = 0; i < riskTiers.length; i++) {
        RiskTier memory tier = riskTiers[i];

        if (!tier.isActive) continue;

        // Calculate tier deposit amount
        uint256 tierAmount = (amount * tier.allocationBps) / 10000;

        if (tierAmount == 0) continue;

        // Get or create account for this tier
        Account storage account = accounts[clientId][userId][tier.tierId][token];

        // Read current tier vault index
        uint256 currentIndex = tierVaultIndices[tier.tierId][token];
        require(currentIndex > 0, "Tier index not initialized");

        // Calculate weighted entry index
        if (account.balance > 0) {
            // Weighted average
            account.entryIndex = (
                (account.balance * account.entryIndex) +
                (tierAmount * currentIndex)
            ) / (account.balance + tierAmount);
        } else {
            // First deposit to this tier
            account.entryIndex = currentIndex;

            // Add to active tiers
            bytes32[] storage activeTiers = userActiveTiers[clientId][userId][token];
            if (!_contains(activeTiers, tier.tierId)) {
                activeTiers.push(tier.tierId);
            }
        }

        // Update balance
        account.balance += tierAmount;

        // Set deposit timestamp (for fee calculation)
        if (account.depositedAt == 0) {
            account.depositedAt = block.timestamp;
        }
    }

    // Update global counter
    totalDeposits[token] += amount;

    // Transfer tokens from user
    IERC20(token).safeTransferFrom(from, address(this), amount);

    emit Deposited(clientId, userId, token, amount, from, block.timestamp);
}
```

---

## Withdrawal Flow

### High-Level Flow (Off-Chain Calculation)

```
┌──────────────────────────────────────────────────────────────┐
│              BATCH WITHDRAWAL FLOW (100 USERS)               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  OFF-CHAIN: Oracle calculates for each user                 │
│  ────────────────────────────────────────────────────────── │
│                                                              │
│  For User 1 (Alice): Withdraw 500 USDC                      │
│                                                              │
│  Step 1: Read on-chain data                                 │
│    - Tier balances: [LOW: 700, MODERATE: 200, HIGH: 100]   │
│    - Entry indices: [1.0, 1.0, 1.0]                         │
│    - Current indices: [1.04, 1.05, 1.08]                    │
│                                                              │
│  Step 2: Calculate tier values                              │
│    lowValue = (700 × 1.04) / 1.0 = 728 USDC                │
│    moderateValue = (200 × 1.05) / 1.0 = 210 USDC           │
│    highValue = (100 × 1.08) / 1.0 = 108 USDC               │
│    totalValue = 1,046 USDC                                  │
│                                                              │
│  Step 3: Calculate proportional withdrawal                  │
│    withdrawalRatio = 500 / 1000 = 0.5 (50% of balance)     │
│    tierReductions:                                          │
│      LOW: 700 × 0.5 = 350 units                            │
│      MODERATE: 200 × 0.5 = 100 units                       │
│      HIGH: 100 × 0.5 = 50 units                            │
│                                                              │
│  Step 4: Calculate gross amount (token value)               │
│    grossAmount = (350 × 1.04/1.0) + (100 × 1.05/1.0) +     │
│                  (50 × 1.08/1.0)                            │
│               = 364 + 105 + 54 = 523 USDC                  │
│                                                              │
│  Step 5: Calculate yield                                    │
│    principal = 500 USDC (balance units withdrawn)          │
│    yield = 523 - 500 = 23 USDC                             │
│                                                              │
│  Step 6: Calculate service fee (20% of yield)               │
│    serviceFee = 23 × 0.20 = 4.6 USDC                       │
│                                                              │
│  Step 7: Calculate gas fee share                            │
│    estimatedGas = 3,000,000 gas                             │
│    gasPrice = 50 gwei                                       │
│    totalGasCost = 3M × 50 gwei = $150                      │
│    gasFeePerUser = $150 / 100 users = $1.50               │
│                                                              │
│  Step 8: Calculate net amount                               │
│    netAmount = 523 - 4.6 - 1.5 = 516.9 USDC               │
│                                                              │
│  Step 9: Create execution data                              │
│    WithdrawalExecution({                                    │
│      clientId: BITKUB,                                      │
│      userId: ALICE,                                         │
│      token: USDC,                                           │
│      to: 0xALICE...,                                        │
│      tierIds: [LOW_RISK, MODERATE_RISK, HIGH_RISK],        │
│      tierReductions: [350, 100, 50],                       │
│      grossAmount: 523,                                      │
│      serviceFee: 4.6,                                       │
│      gasFeeShare: 1.5,                                      │
│      netAmount: 516.9                                       │
│    })                                                        │
│                                                              │
│  Repeat for Users 2-100...                                  │
│                                                              │
│  ──────────────────────────────────────────────────────────│
│                                                              │
│  ON-CHAIN: Contract validates & executes                    │
│  ────────────────────────────────────────────────────────── │
│                                                              │
│  function batchWithdraw(                                    │
│      WithdrawalExecution[] calldata executions              │
│  ) external onlyRole(ORACLE_ROLE) {                         │
│                                                              │
│    for (uint i = 0; i < executions.length; i++) {          │
│      WithdrawalExecution memory exec = executions[i];      │
│                                                              │
│      // Validate & reduce tier balances                     │
│      for (uint j = 0; j < exec.tierIds.length; j++) {      │
│        bytes32 tierId = exec.tierIds[j];                    │
│        uint256 reduction = exec.tierReductions[j];          │
│                                                              │
│        Account storage account =                            │
│          accounts[exec.clientId][exec.userId][tierId]       │
│                  [exec.token];                              │
│                                                              │
│        require(account.balance >= reduction,                │
│                "Insufficient balance");                     │
│                                                              │
│        account.balance -= reduction;  // ✅ SIMPLE!         │
│      }                                                       │
│                                                              │
│      // Allocate fees                                       │
│      protocolRevenueVault[exec.token] +=                    │
│        exec.serviceFee * 95 / 100;                          │
│      clientRevenueVault[exec.clientId][exec.token] +=       │
│        exec.serviceFee * 5 / 100;                           │
│      operationFeeVault[exec.token] += exec.gasFeeShare;     │
│                                                              │
│      // Transfer to user                                    │
│      IERC20(exec.token).safeTransfer(                       │
│        exec.to,                                             │
│        exec.netAmount                                       │
│      );                                                      │
│                                                              │
│      emit Withdrawn(...);                                   │
│    }                                                         │
│  }                                                           │
│                                                              │
│  Gas cost per user: ~30k gas = $1.50 @ 50 gwei             │
│  (80% cheaper than individual withdrawals!)                 │
└──────────────────────────────────────────────────────────────┘
```

### Detailed Solidity Logic

```solidity
struct WithdrawalExecution {
    bytes32 clientId;
    bytes32 userId;
    address token;
    address to;

    bytes32[] tierIds;
    uint256[] tierReductions;

    uint256 grossAmount;
    uint256 serviceFee;
    uint256 gasFeeShare;
    uint256 netAmount;
}

function batchWithdraw(
    WithdrawalExecution[] calldata executions
) external onlyRole(ORACLE_ROLE) nonReentrant {
    require(executions.length > 0, "Empty batch");
    require(executions.length <= MAX_BATCH_SIZE, "Batch too large");

    uint256 totalServiceFees = 0;
    uint256 totalGasFees = 0;

    for (uint i = 0; i < executions.length; i++) {
        WithdrawalExecution memory exec = executions[i];

        require(supportedTokens[exec.token], "Token not supported");
        require(exec.to != address(0), "Invalid recipient");
        require(
            exec.tierIds.length == exec.tierReductions.length,
            "Array length mismatch"
        );

        uint256 totalReduction = 0;

        // Reduce tier balances
        for (uint j = 0; j < exec.tierIds.length; j++) {
            bytes32 tierId = exec.tierIds[j];
            uint256 reduction = exec.tierReductions[j];

            Account storage account = accounts[exec.clientId][exec.userId][tierId][exec.token];

            require(account.balance >= reduction, "Insufficient tier balance");

            // Update balance (SIMPLE SUBTRACTION!)
            account.balance -= reduction;
            totalReduction += reduction;

            // Remove from active tiers if balance is now zero
            if (account.balance == 0) {
                _removeFromActiveTiers(exec.clientId, exec.userId, exec.token, tierId);
            }
        }

        // Update global counter
        totalDeposits[exec.token] -= totalReduction;

        // Accumulate fees
        totalServiceFees += exec.serviceFee;
        totalGasFees += exec.gasFeeShare;

        // Transfer to user
        IERC20(exec.token).safeTransfer(exec.to, exec.netAmount);

        emit Withdrawn(
            exec.clientId,
            exec.userId,
            exec.token,
            exec.netAmount,
            exec.to,
            block.timestamp
        );
    }

    // Distribute fees (single operation for entire batch)
    address token = executions[0].token;  // Assume all same token

    protocolRevenueVault[token] += (totalServiceFees * 95) / 100;

    // Client revenue split proportionally (simplified here)
    // In production, track per client within loop
    clientRevenueVault[executions[0].clientId][token] += (totalServiceFees * 5) / 100;

    operationFeeVault[token] += totalGasFees;

    emit BatchWithdrawalExecuted(executions.length, totalServiceFees, totalGasFees);
}
```

---

## Gas Optimization

### Optimization 1: Batch Processing

**Savings: 80% per user**

```
Individual withdrawals:
  100 users × 120k gas = 12M gas total
  Cost per user: $6.00 @ 50 gwei

Batch withdrawal:
  Fixed overhead: 50k gas
  Per user: 30k gas
  Total: 50k + (100 × 30k) = 3.05M gas
  Cost per user: $1.50 @ 50 gwei

Savings: 75% per user! 🚀
```

### Optimization 2: Off-Chain Calculation

**Savings: 60% on withdrawal logic**

```
On-chain calculation:
  - Read 3 tier balances: 6,300 gas
  - Read 3 tier indices: 6,300 gas
  - Calculate values: ~50k gas
  - Calculate fees: ~20k gas
  - Update balances: 15k gas
  Total: ~98k gas per user

Off-chain calculation:
  - Validate reductions: 6,300 gas
  - Update balances: 15k gas
  - Transfer: 9k gas
  Total: ~30k gas per user

Savings: 69% cheaper! ✅
```

### Optimization 3: Storage Access Patterns

**Use calldata for large arrays:**

```solidity
// ✅ GOOD: Uses calldata (no copy to memory)
function batchWithdraw(
    WithdrawalExecution[] calldata executions
) external {
    // executions read directly from calldata
    // Saves ~1,000 gas per execution
}

// ❌ BAD: Copies to memory
function batchWithdraw(
    WithdrawalExecution[] memory executions
) external {
    // Expensive copy operation
}
```

### Optimization 4: Single SSTORE Per Tier

**Avoid multiple writes to same slot:**

```solidity
// ✅ GOOD: Single write per tier
account.balance -= tierReduction;  // 5,000 gas (SSTORE)

// ❌ BAD: Multiple writes
uint256 newBalance = account.balance - tierReduction;
account.balance = newBalance;  // Still 5,000 gas, but more ops
```

### Optimization 5: Event Emission

**Batch events when possible:**

```solidity
// ✅ GOOD: Single batch event
emit BatchWithdrawalExecuted(100, totalFees, totalGas);  // 375 gas

// ❌ BAD: Individual events
for (uint i = 0; i < 100; i++) {
    emit Withdrawn(...);  // 375 gas × 100 = 37,500 gas
}
```

**Still emit individual events for auditability, but batch summary too.**

### Gas Cost Summary

| Operation | Gas Cost | USD @ 50 gwei |
|-----------|----------|---------------|
| **Deposit** | 150k | $7.50 |
| **Individual Withdrawal** | 120k | $6.00 |
| **Batch Withdrawal (per user)** | 30k | $1.50 |
| **Update Tier Index** | 25k | $1.25 |
| **Read Tier Balance** | 2.1k | $0.11 |
| **Read Tier Index** | 2.1k | $0.11 |

---

## Security Considerations

### Security 1: Tier Balance Validation

**Attack Vector:** Oracle submits invalid tier reductions.

**Mitigation:**
```solidity
// Validate each tier reduction
for (uint j = 0; j < tierReductions.length; j++) {
    require(
        account.balance >= tierReductions[j],
        "Insufficient tier balance"
    );
}

// Sanity check: total reduction should match expected
uint256 totalReduction = sum(tierReductions);
require(
    totalReduction <= account.totalBalance,
    "Reduction exceeds total"
);
```

### Security 2: Index Monotonicity

**Attack Vector:** Oracle decreases vault index (stealing yield).

**Mitigation:**
```solidity
function updateTierIndex(
    bytes32 tierId,
    address token,
    uint256 newIndex
) external onlyRole(ORACLE_ROLE) {
    uint256 currentIndex = tierVaultIndices[tierId][token];

    // Index can only increase (yield always grows)
    require(newIndex >= currentIndex, "Index cannot decrease");

    // Sanity check: max 100% growth per update
    require(newIndex <= currentIndex * 2, "Index growth too high");

    tierVaultIndices[tierId][token] = newIndex;
}
```

### Security 3: Gas Fee Manipulation

**Attack Vector:** Oracle inflates estimated gas to overcharge users.

**Mitigation:**
```solidity
function batchWithdraw(
    WithdrawalExecution[] calldata executions,
    uint256 estimatedGas
) external onlyRole(ORACLE_ROLE) {
    // Cap maximum gas fee
    uint256 maxGasPerUser = MAX_GAS_FEE_PER_USER;  // e.g., $10
    uint256 gasFeePerUser = (estimatedGas * tx.gasprice) / executions.length;

    require(gasFeePerUser <= maxGasPerUser, "Gas fee too high");

    // ... rest of logic
}
```

### Security 4: Batch Size Limits

**Attack Vector:** Oracle submits massive batch, runs out of gas.

**Mitigation:**
```solidity
uint256 public constant MAX_BATCH_SIZE = 100;

function batchWithdraw(
    WithdrawalExecution[] calldata executions
) external onlyRole(ORACLE_ROLE) {
    require(executions.length > 0, "Empty batch");
    require(executions.length <= MAX_BATCH_SIZE, "Batch too large");

    // ... rest of logic
}
```

### Security 5: Reentrancy Protection

**Attack Vector:** Malicious token triggers reentrancy during transfer.

**Mitigation:**
```solidity
// ✅ Already applied: nonReentrant modifier
function batchWithdraw(
    WithdrawalExecution[] calldata executions
) external onlyRole(ORACLE_ROLE) nonReentrant {
    // All state updates happen BEFORE external calls
    // ...

    // External call at the end
    IERC20(token).safeTransfer(user, amount);
}
```

### Security 6: Client Revenue Distribution

**Attack Vector:** Protocol keeps client's revenue share.

**Mitigation:**
```solidity
// MUST distribute client revenue
if (serviceFee > 0) {
    uint256 protocolShare = (serviceFee * 95) / 100;
    uint256 clientShare = serviceFee - protocolShare;  // Exactly 5%

    protocolRevenueVault[token] += protocolShare;
    clientRevenueVault[clientId][token] += clientShare;  // ✅ Client gets paid
    totalClientRevenues[token] += clientShare;  // Track for auditing
}
```

---

## Implementation Checklist

### Phase 1: Contract Updates

- [ ] Update `Account` struct to support single balance + entryIndex
- [ ] Update storage mappings to 4-level nested structure
- [ ] Add `tierVaultIndices` mapping
- [ ] Add `userActiveTiers` mapping for iteration
- [ ] Create `WithdrawalExecution` struct
- [ ] Update `ClientRegistry` to store `RiskTier[]` per client
- [ ] Add validation for risk tier allocation (must sum to 100%)

### Phase 2: Core Functions

- [ ] Implement `depositFrom` with tier splitting logic
- [ ] Implement weighted average entry index calculation per tier
- [ ] Implement `batchWithdraw` with tier reduction validation
- [ ] Implement helper: `_getTierValue(clientId, userId, tierId, token)`
- [ ] Implement helper: `_contains(bytes32[] memory array, bytes32 value)`
- [ ] Implement helper: `_removeFromActiveTiers(...)`
- [ ] Update `getTotalValue` to sum across all tiers

### Phase 3: Tier Index Management

- [ ] Implement `updateTierIndex(tierId, token, newIndex)`
- [ ] Add monotonicity validation (index can only increase)
- [ ] Add sanity check (max 100% growth per update)
- [ ] Implement `initializeTierIndex(tierId, token)` for new tiers
- [ ] Add events: `TierIndexUpdated(tierId, token, oldIndex, newIndex)`

### Phase 4: Client Configuration

- [ ] Update `registerClient` to accept `RiskTier[]`
- [ ] Implement `updateClientRiskTiers(clientId, RiskTier[])`
- [ ] Validate tier allocations sum to 10000 bps
- [ ] Add getter: `getClientRiskTiers(clientId) → RiskTier[]`
- [ ] Add event: `ClientRiskTiersUpdated(clientId, RiskTier[])`

### Phase 5: Oracle Service (Go)

- [ ] Create `TierAllocator` service
- [ ] Implement `ReadTierBalances(clientId, userId, token)` → map[tierId]balance
- [ ] Implement `CalculateTierValues(balances, entryIndices, currentIndices)` → values
- [ ] Implement `CalculateProportionalReduction(withdrawAmount, tierBalances)` → reductions
- [ ] Implement `CalculateFees(tierValues, clientConfig)` → serviceFee
- [ ] Implement `EstimateBatchGas(executionCount)` → gasEstimate
- [ ] Implement `BuildWithdrawalExecution(...)` → WithdrawalExecution struct
- [ ] Implement `ExecuteBatchWithdraw(executions[])`

### Phase 6: Testing

- [ ] Unit test: Deposit with tier splitting
- [ ] Unit test: Multiple deposits with weighted entry index
- [ ] Unit test: Proportional withdrawal across tiers
- [ ] Unit test: Tier index updates
- [ ] Unit test: Client risk tier configuration
- [ ] Integration test: Full deposit → stake → yield → withdraw cycle
- [ ] Integration test: Batch withdrawal with 100 users
- [ ] Integration test: Gas cost comparison (individual vs batch)
- [ ] Edge case: Withdrawal when one tier has zero balance
- [ ] Edge case: Adding new tier to existing client
- [ ] Security test: Oracle submits invalid tier reductions
- [ ] Security test: Oracle tries to decrease index
- [ ] Security test: Gas fee manipulation attempt

### Phase 7: Documentation

- [ ] Update contract natspec comments
- [ ] Create oracle service API documentation
- [ ] Document tier configuration best practices
- [ ] Create deployment guide
- [ ] Update frontend integration guide
- [ ] Create monitoring/alerting guide

### Phase 8: Deployment

- [ ] Deploy updated `ClientRegistry` contract
- [ ] Deploy updated `LAAC` contract
- [ ] Deploy updated `LAACController` contract
- [ ] Initialize tier indices for existing tokens
- [ ] Migrate existing client configurations to use `RiskTier[]`
- [ ] Deploy oracle service
- [ ] Set up monitoring dashboards
- [ ] Test on testnet for 1 week
- [ ] External audit
- [ ] Mainnet deployment

---

## Success Metrics

### Gas Efficiency

- ✅ Deposit: 150k gas ($7.50 @ 50 gwei)
- ✅ Batch withdrawal: 30k gas per user ($1.50)
- ✅ 80% savings vs individual withdrawals
- ✅ Break-even at 100 users per batch

### Scalability

- ✅ Support unlimited risk tiers (not limited to 3)
- ✅ Clients can define custom allocations
- ✅ Can add new tiers without contract upgrade
- ✅ Batch size: 100 users per transaction

### Security

- ✅ Tier balance validation on every withdrawal
- ✅ Index monotonicity enforced
- ✅ Gas fee caps to prevent overcharging
- ✅ Reentrancy protection
- ✅ Client revenue distribution guaranteed

### User Experience

- ✅ Users don't choose tiers (inherit from client)
- ✅ Transparent tier breakdown on frontend
- ✅ Fair yield distribution
- ✅ Low gas costs encourage usage

---

## Glossary

| Term | Definition |
|------|------------|
| **Tier** | Risk category with specific protocols and APY (e.g., LOW_RISK) |
| **Balance Units** | Internal accounting unit (amount deposited at entry index) |
| **Token Units** | Actual token amount (balance units × growth) |
| **Entry Index** | Vault index when user deposited (for yield calculation) |
| **Vault Index** | Current growth multiplier for a tier (e.g., 1.04 = 4% growth) |
| **Weighted Entry Index** | Average entry index across multiple deposits |
| **Tier Reduction** | Balance units to subtract from a tier during withdrawal |
| **Gross Amount** | Token value before fees |
| **Service Fee** | 20% of yield (split 95% protocol, 5% client) |
| **Gas Fee Share** | Total gas cost divided by batch size |
| **Net Amount** | Tokens user receives (gross - service fee - gas fee) |

---

## References

- **Original Architecture**: `apps/laac-contract/ARCHITECTURE.md`
- **Security Verification**: `apps/laac-contract/SECURITY_VERIFICATION.md`
- **Withdrawal Audit**: `apps/laac-contract/SECURITY_AUDIT_WITHDRAWAL.md`
- **Business Rationale**: `apps/laac-contract/BUSINESS_RATIONALE.md`
- **Gas Analysis**: `apps/laac-contract/GAS_COST_ANALYSIS.md`

---

**END OF ARCHITECTURE DOCUMENT**

Next steps: Implement contracts based on this architecture.
