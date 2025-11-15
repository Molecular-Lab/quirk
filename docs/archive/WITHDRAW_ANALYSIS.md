# LAAC Withdraw Logic - Comprehensive Analysis

## 🔍 Current Implementation Status

### ✅ What's Been Fixed
1. **Proportional fee calculation** - Fees now based on withdrawal amount (not full yield)
2. **Separated fee vaults** - Clear separation: operation/protocol/client revenue
3. **Stakeable balance calculation** - Oracle knows what can be staked

### ⚠️ Critical Issues Still Present

## 🚨 ISSUE #1: Accounting Unit Mismatch (CRITICAL)

### The Problem
```solidity
// Line 189: amountToDeduct calculated in TOKEN UNITS
uint256 amountToDeduct;
if (totalFeesToDeduct <= proportionalYield) {
    amountToDeduct = amount;  // ← TOKEN UNITS
} else {
    amountToDeduct = amount + (totalFeesToDeduct - proportionalYield);  // ← TOKEN UNITS
}

// Line 198: But subtracted from BALANCE UNITS
account.balance -= amountToDeduct;  // ❌ WRONG! balance is in balance units (scaled by entryIndex)
totalDeposits[token] -= amountToDeduct;  // ❌ WRONG! totalDeposits is also in balance units
```

### Why This is Critical
- `account.balance` stores **balance units** (original deposit amount at `entryIndex`)
- `amountToDeduct` is calculated in **token units** (current value at `currentIndex`)
- Subtracting token units from balance units causes **accounting corruption**

### Example of Corruption
```
User deposits 1000 USDC at entryIndex = 1.0e18
→ account.balance = 1000e6 (balance units)

Vault earns yield, currentIndex = 1.2e18
→ totalValue = (1000e6 * 1.2e18) / 1.0e18 = 1200e6 (token units)
→ accruedYield = 200e6 (token units)

User withdraws 600 USDC (token units)
→ amountToDeduct = 600e6 (token units)
→ account.balance -= 600e6  // ❌ Subtracting token units from balance units!

Result:
→ account.balance = 400e6 (balance units)
→ But actual token value = (400e6 * 1.2e18) / 1.0e18 = 480e6 tokens
→ User should have 600e6 tokens remaining, but accounting shows 480e6!
→ 120e6 tokens LOST due to unit mismatch!
```

## 📊 Withdraw Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WITHDRAW REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

INPUT: amount = 600 USDC (token units)

STEP 1: Calculate Current State
┌────────────────────────────────────────────────────────┐
│ account.balance = 1000e6 (balance units)               │
│ account.entryIndex = 1.0e18                            │
│ vaultIndex = 1.2e18 (20% yield earned)                │
│                                                        │
│ totalBalance = (1000e6 × 1.2e18) / 1.0e18 = 1200e6   │
│ accruedYield = 1200e6 - 1000e6 = 200e6               │
└────────────────────────────────────────────────────────┘

STEP 2: Calculate Proportional Yield
┌────────────────────────────────────────────────────────┐
│ User withdraws 50% of total value (600 / 1200)        │
│                                                        │
│ proportionalYield = (200e6 × 600e6) / 1200e6 = 100e6 │
│                                                        │
│ This is the yield portion that belongs to this        │
│ withdrawal (50% of total yield)                       │
└────────────────────────────────────────────────────────┘

STEP 3: Calculate Fees
┌────────────────────────────────────────────────────────┐
│ SERVICE FEE (from proportional yield)                  │
│ ├─ serviceFeeBps = 200 (2%)                           │
│ ├─ serviceFee = (100e6 × 200) / 10000 = 2e6          │
│ │                                                      │
│ ├─ CLIENT REVENUE SPLIT                               │
│ │  ├─ feeBps = 5000 (50%)                            │
│ │  ├─ clientRevenue = (2e6 × 5000) / 10000 = 1e6    │
│ │  └─ protocolRevenue = 2e6 - 1e6 = 1e6             │
│ │                                                      │
│ GAS FEE (operational cost)                             │
│ ├─ depositAge = block.timestamp - depositTimestamp    │
│ ├─ IF depositAge >= 365 days: withdrawFee = 0        │
│ └─ ELSE: withdrawFee = gasFee (e.g., 0.5e6)          │
└────────────────────────────────────────────────────────┘

STEP 4: Calculate Net Amount
┌────────────────────────────────────────────────────────┐
│ netAmount = totalBalance - accruedYield               │
│           + proportionalYield - serviceFee - withdrawFee│
│                                                        │
│ netAmount = 1200e6 - 200e6 + 100e6 - 2e6 - 0.5e6     │
│           = 1097.5e6                                   │
│                                                        │
│ Check: amount <= netAmount                             │
│        600e6 <= 1097.5e6 ✓                            │
└────────────────────────────────────────────────────────┘

STEP 5: ❌ BUGGY Balance Deduction (Current Code)
┌────────────────────────────────────────────────────────┐
│ totalFeesToDeduct = serviceFee + withdrawFee           │
│                   = 2e6 + 0.5e6 = 2.5e6               │
│                                                        │
│ IF totalFeesToDeduct <= proportionalYield:             │
│    amountToDeduct = 600e6 (token units)               │
│ ELSE:                                                  │
│    amountToDeduct = 600e6 + (2.5e6 - 100e6)          │
│                   = 600e6 (fees covered by yield)     │
│                                                        │
│ ❌ account.balance -= 600e6  (WRONG UNITS!)           │
│    Before: 1000e6 (balance units)                     │
│    After:  400e6 (corrupted - mixed units!)           │
│                                                        │
│ ❌ totalDeposits[token] -= 600e6 (WRONG UNITS!)       │
└────────────────────────────────────────────────────────┘

STEP 6: Allocate Fees to Vaults
┌────────────────────────────────────────────────────────┐
│ operationFeeVault[token] += 0.5e6                     │
│ protocolRevenueVault[token] += 1e6                    │
│ clientRevenueVault[clientId][token] += 1e6           │
│ totalClientRevenues[token] += 1e6                     │
└────────────────────────────────────────────────────────┘

STEP 7: Transfer to User
┌────────────────────────────────────────────────────────┐
│ IERC20(token).safeTransfer(to, 600e6)                │
│                                                        │
│ User receives: 600 USDC ✓                             │
└────────────────────────────────────────────────────────┘
```

## 🎯 Edge Case Analysis

### Edge Case 1: Fees Exceed Proportional Yield
```
Scenario: User withdraws small amount, but gas fee is high

Given:
- totalBalance = 1200e6
- accruedYield = 200e6
- withdrawAmount = 100e6 (8.3% of total)
- proportionalYield = (200e6 × 100e6) / 1200e6 = 16.67e6
- serviceFee = (16.67e6 × 200) / 10000 = 0.33e6
- gasFee = 20e6 (high gas day!)
- totalFeesToDeduct = 0.33e6 + 20e6 = 20.33e6

Check: totalFeesToDeduct > proportionalYield
       20.33e6 > 16.67e6 ✓

amountToDeduct = 100e6 + (20.33e6 - 16.67e6) = 103.67e6

This means:
- User pays 16.67e6 from yield
- User pays 3.67e6 from principal
- Total cost: 103.67e6 to withdraw 100e6

✅ Logic is correct (fees eat into principal)
❌ Unit conversion still broken
```

### Edge Case 2: Withdrawal Immediately After Deposit (No Yield)
```
Scenario: User deposits and withdraws same block

Given:
- account.balance = 1000e6
- entryIndex = 1.0e18
- currentIndex = 1.0e18 (no yield yet)
- totalBalance = 1000e6
- accruedYield = 0
- withdrawAmount = 500e6
- proportionalYield = 0
- serviceFee = 0 (no yield to charge)
- gasFee = 5e6 (not waived)

amountToDeduct = 500e6 + (5e6 - 0) = 505e6

Result:
- User withdraws 500e6 but account deducted 505e6
- Remaining balance should represent: 1000e6 - 505e6 = 495e6

✅ Logic correct (user pays gas fee from principal)
❌ Unit conversion still broken
```

### Edge Case 3: Withdraw Full Balance
```
Scenario: User withdraws everything

Given:
- account.balance = 1000e6 (balance units)
- entryIndex = 1.0e18
- currentIndex = 1.2e18
- totalBalance = 1200e6 (token units)
- accruedYield = 200e6
- withdrawAmount = 1200e6 (100% withdrawal)
- proportionalYield = 200e6 (all yield)
- serviceFee = (200e6 × 200) / 10000 = 4e6
- clientRevenue = 2e6
- protocolRevenue = 2e6
- gasFee = 0 (waived)

amountToDeduct = 1200e6 (fees covered by yield)

❌ account.balance -= 1200e6
   1000e6 - 1200e6 = UNDERFLOW! 💥

This will REVERT because balance is in balance units (1000e6)
but amountToDeduct is in token units (1200e6)!
```

### Edge Case 4: Multiple Deposits at Different Indices
```
Scenario: User deposits twice, then withdraws

Deposit 1:
- Amount: 500e6
- entryIndex: 1.0e18
- account.balance: 500e6

Yield accrues, index → 1.2e18

Deposit 2:
- Amount: 600e6
- currentIndex: 1.2e18
- Weighted average entryIndex = (500e6 × 1.0e18 + 600e6 × 1.2e18) / 1100e6
                               = 1.109e18
- account.balance: 1100e6

Current state:
- account.balance: 1100e6 (balance units)
- entryIndex: 1.109e18
- currentIndex: 1.3e18 (more yield)
- totalBalance = (1100e6 × 1.3e18) / 1.109e18 = 1290.26e6

Withdraw 700e6:
- proportionalYield = (190.26e6 × 700e6) / 1290.26e6 = 103.23e6
- serviceFee = (103.23e6 × 200) / 10000 = 2.06e6
- amountToDeduct = 700e6 (token units)

❌ account.balance -= 700e6
   1100e6 - 700e6 = 400e6 (balance units)

But correct calculation:
- Need to remove: (700e6 × 1.109e18) / 1.3e18 = 597.69e6 balance units
- account.balance should be: 1100e6 - 597.69e6 = 502.31e6 balance units
- Which represents: (502.31e6 × 1.3e18) / 1.109e18 = 588.71e6 tokens

Actual result with bug:
- account.balance: 400e6 (balance units)
- Token value: (400e6 × 1.3e18) / 1.109e18 = 468.89e6 tokens
- User lost: 590.26e6 - 468.89e6 = 121.37e6 tokens! 💸
```

## 💰 Fee Vault Allocation - Correctness Check

### Current Fee Vaults
```solidity
mapping(address => uint256) public operationFeeVault;        // Gas fees
mapping(address => uint256) public protocolRevenueVault;     // Protocol's share
mapping(bytes32 => mapping(address => uint256)) public clientRevenueVault;  // Client's share
mapping(address => uint256) public totalClientRevenues;      // Aggregate tracking
```

### Stakeable Balance Formula
```solidity
function getStakeableBalance(address token) external view returns (uint256) {
    uint256 contractBalance = IERC20(token).balanceOf(address(this));
    uint256 reservedFunds = operationFeeVault[token]
        + protocolRevenueVault[token]
        + totalClientRevenues[token];
    
    return contractBalance - reservedFunds;
}
```

### ✅ Fee Allocation is CORRECT

**The formula correctly calculates stakeable balance:**
```
stakeableBalance = contractBalance - operationFees - protocolRevenue - totalClientRevenues
```

**Verification:**
1. ✅ `operationFeeVault` accumulates gas fees → reserved for oracle
2. ✅ `protocolRevenueVault` accumulates protocol's share → reserved for protocol treasury
3. ✅ `clientRevenueVault[clientId][token]` accumulates each client's share
4. ✅ `totalClientRevenues[token]` = sum of all client revenues → for quick calculation
5. ✅ All reserved funds are subtracted from contract balance

**Oracle can stake:**
```
Available to stake = Total USDC in contract - All reserved fees/revenues
```

This ensures:
- Gas fees are paid to oracle ✓
- Protocol revenue can be withdrawn ✓
- Client revenue can be withdrawn ✓
- Only unreserved funds are staked ✓

### Example Flow
```
Contract Balance: 10,000 USDC

Reserved Funds:
├─ operationFeeVault: 50 USDC (gas fees)
├─ protocolRevenueVault: 25 USDC (protocol share)
└─ totalClientRevenues: 25 USDC (all clients combined)
   ├─ client_A: 15 USDC
   └─ client_B: 10 USDC

Stakeable Balance = 10,000 - 50 - 25 - 25 = 9,900 USDC ✓

Oracle stakes 9,900 USDC to Aave/Compound/Curve
Reserved 100 USDC stays in contract for claims
```

## 🔧 Required Fix Summary

### 1. Fix Unit Conversion (CRITICAL - Priority 1)
```solidity
// Convert token units to balance units before deducting
uint256 balanceUnitsToRemove = (amountToDeduct * account.entryIndex + vaultIndex - 1) / vaultIndex;
account.balance -= balanceUnitsToRemove;
totalDeposits[token] -= balanceUnitsToRemove;
```

### 2. Add Gas Fee Cap (HIGH - Priority 2)
```solidity
require(gasFee <= MAX_GAS_FEE, "Gas fee too high");
// Or calculate on-chain: uint256 maxGasFee = tx.gasprice * GAS_LIMIT * GAS_PRICE_MULTIPLIER;
```

### 3. Handle Edge Cases (MEDIUM - Priority 3)
- ✅ Already handled: Proportional fees
- ✅ Already handled: Fee vault separation
- ⚠️ Need to fix: Unit conversion for full withdrawal
- ⚠️ Need to fix: Multiple deposits weighted average

## 📝 Test Cases Needed

```solidity
// Test 1: Simple withdraw with yield (unit conversion)
// Test 2: Withdraw with fees exceeding yield
// Test 3: Withdraw immediately after deposit (no yield)
// Test 4: Full balance withdrawal (should work without underflow)
// Test 5: Multiple deposits then withdraw
// Test 6: Withdraw after multiple index updates
// Test 7: Gas fee waiver (after 365 days)
// Test 8: Stakeable balance calculation
// Test 9: Fee vault claims (operation/protocol/client)
```

## ⚠️ Impact Assessment

### Current Bug Impact (Unit Mismatch)
- **Severity:** CRITICAL 🔴
- **Impact:** Users lose funds on every withdrawal after yield accrual
- **Exploitability:** Not intentional exploit, but users suffer loss
- **Example Loss:** User could lose 10-20% of their funds depending on yield

### Recommendation
**DO NOT DEPLOY** until unit conversion fix is applied and tested!

---

**Generated:** 2025-10-27
**Status:** ⚠️ CRITICAL BUG FOUND - Requires immediate fix before deployment
