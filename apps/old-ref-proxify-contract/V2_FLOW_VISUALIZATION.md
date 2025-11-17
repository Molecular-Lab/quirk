# LAAC V2 Complete Flow Visualization

## 📊 System Architecture Overview

```
┌─────────────────────┐
│  ClientRegistryV2   │  ← Admin configures client risk tiers
└──────────┬──────────┘
           │
           │ getClientRiskTiers()
           │ getClientInfo()
           ↓
┌─────────────────────┐       ┌──────────────────────┐
│     LAACv2          │◄──────┤  LAACControllerV2    │ ← Oracle manages operations
│  (Core Vault)       │       │  (Orchestrator)      │
└──────────┬──────────┘       └──────────────────────┘
           │
           │ IERC20 transfers
           ↓
┌─────────────────────┐
│  DeFi Protocols     │  Aave, Compound, Yearn, etc.
│  (Yield Generation) │
└─────────────────────┘
```

---

## 🔄 Step-by-Step Flow

### **PHASE 1: Client Registry Setup**

```solidity
// Step 1.1: Admin registers B2B client
ClientRegistryV2.registerClient(
    clientId: keccak256("ACME_CORP"),
    clientAddress: 0x123...,
    name: "ACME Corporation",
    feeBps: 500,        // 5% client revenue share
    serviceFeeBps: 200  // 2% service fee on yield
)
```

**Contract State After Step 1.1:**
```
clients[keccak256("ACME_CORP")] = {
    name: "ACME Corporation",
    clientAddress: 0x123...,
    isActive: true,
    registeredAt: 1730246400,
    feeBps: 500,
    serviceFeeBps: 200
}
```

---

```solidity
// Step 1.2: Admin configures client's risk tiers
ClientRegistryV2.setClientRiskTiers(
    clientId: keccak256("ACME_CORP"),
    riskTiers: [
        {
            tierId: keccak256("AAVE_LOW_RISK"),
            name: "Aave Low Risk - 5% APY",
            allocationBps: 7000,  // 70%
            isActive: true
        },
        {
            tierId: keccak256("COMPOUND_MEDIUM_RISK"),
            name: "Compound Medium Risk - 8% APY",
            allocationBps: 2000,  // 20%
            isActive: true
        },
        {
            tierId: keccak256("YEARN_HIGH_RISK"),
            name: "Yearn High Risk - 12% APY",
            allocationBps: 1000,  // 10%
            isActive: true
        }
    ]
)
```

**Contract State After Step 1.2:**
```
clientRiskTiers[keccak256("ACME_CORP")] = [
    {
        tierId: keccak256("AAVE_LOW_RISK"),
        name: "Aave Low Risk - 5% APY",
        allocationBps: 7000,
        isActive: true
    },
    {
        tierId: keccak256("COMPOUND_MEDIUM_RISK"),
        name: "Compound Medium Risk - 8% APY",
        allocationBps: 2000,
        isActive: true
    },
    {
        tierId: keccak256("YEARN_HIGH_RISK"),
        name: "Yearn High Risk - 12% APY",
        allocationBps: 1000,
        isActive: true
    }
]

tierIndexMap[keccak256("ACME_CORP")][keccak256("AAVE_LOW_RISK")] = 0
tierIndexMap[keccak256("ACME_CORP")][keccak256("COMPOUND_MEDIUM_RISK")] = 1
tierIndexMap[keccak256("ACME_CORP")][keccak256("YEARN_HIGH_RISK")] = 2
```

**Validation Checks:**
- ✅ Total allocation = 7000 + 2000 + 1000 = 10000 (100%)
- ✅ No duplicate tier IDs
- ✅ All tier names provided

---

### **PHASE 2: LAAC Initialization**

```solidity
// Step 2.1: Admin adds supported token
LAACControllerV2.addSupportedToken(
    token: 0xUSDT_ADDRESS
)
```

**Internal Call Chain:**
```
LAACControllerV2.addSupportedToken()
    ├─ supportedTokens[USDT] = true
    └─ LAACv2.addSupportedToken(USDT)
           └─ supportedTokens[USDT] = true
```

---

```solidity
// Step 2.2: Admin initializes risk tiers for token
LAACControllerV2.batchInitializeTiers(
    token: 0xUSDT_ADDRESS,
    tierIds: [
        keccak256("AAVE_LOW_RISK"),
        keccak256("COMPOUND_MEDIUM_RISK"),
        keccak256("YEARN_HIGH_RISK")
    ]
)
```

**Contract State After Step 2.2:**
```
// LAACv2 state
tierVaultIndices[keccak256("AAVE_LOW_RISK")][USDT] = 1000000000000000000 (1e18 = 1.0)
tierVaultIndices[keccak256("COMPOUND_MEDIUM_RISK")][USDT] = 1000000000000000000
tierVaultIndices[keccak256("YEARN_HIGH_RISK")][USDT] = 1000000000000000000

tierVaultIndexUpdatedAt[keccak256("AAVE_LOW_RISK")][USDT] = 1730246400
tierVaultIndexUpdatedAt[keccak256("COMPOUND_MEDIUM_RISK")][USDT] = 1730246400
tierVaultIndexUpdatedAt[keccak256("YEARN_HIGH_RISK")][USDT] = 1730246400

isTierInitializedMap[keccak256("AAVE_LOW_RISK")][USDT] = true
isTierInitializedMap[keccak256("COMPOUND_MEDIUM_RISK")][USDT] = true
isTierInitializedMap[keccak256("YEARN_HIGH_RISK")][USDT] = true
```

---

### **PHASE 3: User Deposit**

```solidity
// Step 3.1: User (Alice) deposits 1000 USDT
LAACv2.deposit(
    clientId: keccak256("ACME_CORP"),
    userId: keccak256("ALICE"),
    token: 0xUSDT_ADDRESS,
    amount: 1000e6,  // 1000 USDT (6 decimals)
    from: 0xALICE_WALLET
)
```

**Internal Execution Flow:**

```
1. Validate
   ├─ ✓ Client is active: clientRegistry.isClientActive(ACME_CORP)
   ├─ ✓ Token is supported: supportedTokens[USDT] = true
   ├─ ✓ Amount > 0
   └─ ✓ from != address(0)

2. Get Client Risk Tiers
   └─ clientRegistry.getClientRiskTiers(ACME_CORP)
      → Returns 3 tiers with 70/20/10 allocation

3. Split Deposit Across Tiers
   ├─ Tier 1 (AAVE_LOW_RISK): 1000e6 * 7000 / 10000 = 700e6 USDT
   ├─ Tier 2 (COMPOUND_MEDIUM_RISK): 1000e6 * 2000 / 10000 = 200e6 USDT
   └─ Tier 3 (YEARN_HIGH_RISK): 1000e6 * 1000 / 10000 = 100e6 USDT

4. Deposit to Each Tier (via _depositToTier())
   
   For AAVE_LOW_RISK (700 USDT):
   ├─ account = accounts[ACME_CORP][ALICE][AAVE_LOW_RISK][USDT]
   ├─ currentIndex = tierVaultIndices[AAVE_LOW_RISK][USDT] = 1e18
   ├─ account.balance = 0 (first deposit)
   │  └─ account.entryIndex = currentIndex = 1e18
   │  └─ account.depositedAt = 1730246400
   │  └─ userActiveTiers[ACME_CORP][ALICE][USDT].push(AAVE_LOW_RISK)
   └─ account.balance = 700e6

   For COMPOUND_MEDIUM_RISK (200 USDT):
   ├─ account = accounts[ACME_CORP][ALICE][COMPOUND_MEDIUM_RISK][USDT]
   ├─ account.entryIndex = 1e18
   ├─ account.depositedAt = 1730246400
   ├─ userActiveTiers[ACME_CORP][ALICE][USDT].push(COMPOUND_MEDIUM_RISK)
   └─ account.balance = 200e6

   For YEARN_HIGH_RISK (100 USDT):
   ├─ account = accounts[ACME_CORP][ALICE][YEARN_HIGH_RISK][USDT]
   ├─ account.entryIndex = 1e18
   ├─ account.depositedAt = 1730246400
   ├─ userActiveTiers[ACME_CORP][ALICE][USDT].push(YEARN_HIGH_RISK)
   └─ account.balance = 100e6

5. Update Global State
   └─ totalDeposits[USDT] += 1000e6

6. Transfer Tokens
   └─ IERC20(USDT).safeTransferFrom(0xALICE_WALLET, LAACv2_CONTRACT, 1000e6)

7. Emit Event
   └─ Deposited(ACME_CORP, ALICE, USDT, 1000e6, tierIds[], tierAmounts[], timestamp)
```

**Contract State After Step 3.1:**

```
// Alice's tier accounts
accounts[ACME_CORP][ALICE][AAVE_LOW_RISK][USDT] = {
    balance: 700e6,
    entryIndex: 1e18,
    depositedAt: 1730246400
}

accounts[ACME_CORP][ALICE][COMPOUND_MEDIUM_RISK][USDT] = {
    balance: 200e6,
    entryIndex: 1e18,
    depositedAt: 1730246400
}

accounts[ACME_CORP][ALICE][YEARN_HIGH_RISK][USDT] = {
    balance: 100e6,
    entryIndex: 1e18,
    depositedAt: 1730246400
}

// Alice's active tiers list
userActiveTiers[ACME_CORP][ALICE][USDT] = [
    keccak256("AAVE_LOW_RISK"),
    keccak256("COMPOUND_MEDIUM_RISK"),
    keccak256("YEARN_HIGH_RISK")
]

// Global state
totalDeposits[USDT] = 1000e6

// Contract balance
IERC20(USDT).balanceOf(LAACv2_CONTRACT) = 1000e6
```

---

### **PHASE 4: Oracle Stakes Funds to Protocols**

```solidity
// Step 4.1: Oracle transfers funds to Aave (70% = 700 USDT)
LAACControllerV2.executeTransfer(
    token: 0xUSDT_ADDRESS,
    protocol: 0xAAVE_PROTOCOL,
    amount: 700e6,
    tierId: keccak256("AAVE_LOW_RISK"),
    tierName: "Aave Low Risk"
)
```

**Internal Execution:**
```
1. Validate
   ├─ ✓ supportedTokens[USDT] = true
   ├─ ✓ whitelistedProtocols[AAVE] = true
   ├─ ✓ amount > 0
   └─ ✓ laac.isTierInitialized(USDT, AAVE_LOW_RISK) = true

2. Transfer
   └─ IERC20(USDT).safeTransferFrom(LAACv2_CONTRACT, AAVE_PROTOCOL, 700e6)

3. Update Tracking
   └─ LAACv2.updateStaked(USDT, 700e6, true)
      └─ totalStaked[USDT] += 700e6

4. Emit Event
   └─ TransferExecuted(USDT, AAVE, 700e6, AAVE_LOW_RISK, "Aave Low Risk", timestamp)
```

**Repeat for other tiers:**
```solidity
// Step 4.2: Transfer to Compound (20% = 200 USDT)
LAACControllerV2.executeTransfer(...)

// Step 4.3: Transfer to Yearn (10% = 100 USDT)
LAACControllerV2.executeTransfer(...)
```

**Contract State After Step 4:**
```
totalStaked[USDT] = 1000e6

// Token balances
IERC20(USDT).balanceOf(LAACv2_CONTRACT) = 0
IERC20(USDT).balanceOf(AAVE_PROTOCOL) = 700e6
IERC20(USDT).balanceOf(COMPOUND_PROTOCOL) = 200e6
IERC20(USDT).balanceOf(YEARN_PROTOCOL) = 100e6
```

---

### **PHASE 5: APY Growth Over Time**

**Day 1 (Initial State):**
```
All indices = 1.0 (1e18)
```

**Day 30 (After 1 Month):**

Oracle reads protocol exchange rates:
```javascript
// Off-chain oracle calculation
const aaveExchangeRate = await aaveContract.getExchangeRate(USDT);
// aaveExchangeRate = 1.004166666667e18 (0.5% monthly = 6% APY)

const compoundExchangeRate = await compoundContract.exchangeRateStored();
// compoundExchangeRate = 1.006666666667e18 (0.8% monthly = 10% APY)

const yearnPricePerShare = await yearnContract.pricePerShare();
// yearnPricePerShare = 1.01e18 (1% monthly = 12.7% APY)
```

```solidity
// Step 5.1: Oracle batch updates tier indices
LAACControllerV2.batchUpdateTierIndices(
    token: 0xUSDT_ADDRESS,
    tierIds: [
        keccak256("AAVE_LOW_RISK"),
        keccak256("COMPOUND_MEDIUM_RISK"),
        keccak256("YEARN_HIGH_RISK")
    ],
    newIndices: [
        1004166666666666666,  // 1.004166... (0.5% growth)
        1006666666666666666,  // 1.006666... (0.8% growth)
        1010000000000000000   // 1.01 (1% growth)
    ]
)
```

**Internal Execution:**
```
For each tier:
1. Validate
   ├─ ✓ tier is initialized
   ├─ ✓ newIndex >= currentIndex (monotonic increase)
   └─ ✓ newIndex <= currentIndex * 2 (max 100% growth check)

2. Update
   └─ tierVaultIndices[tierId][USDT] = newIndex
   └─ tierVaultIndexUpdatedAt[tierId][USDT] = block.timestamp

3. Emit Event
   └─ TierIndexUpdated(USDT, tierId, oldIndex, newIndex, timestamp)
```

**Contract State After Step 5.1:**
```
tierVaultIndices[AAVE_LOW_RISK][USDT] = 1004166666666666666
tierVaultIndices[COMPOUND_MEDIUM_RISK][USDT] = 1006666666666666666
tierVaultIndices[YEARN_HIGH_RISK][USDT] = 1010000000000000000

tierVaultIndexUpdatedAt[AAVE_LOW_RISK][USDT] = 1732838400 (Day 30)
tierVaultIndexUpdatedAt[COMPOUND_MEDIUM_RISK][USDT] = 1732838400
tierVaultIndexUpdatedAt[YEARN_HIGH_RISK][USDT] = 1732838400
```

**Alice's Position Value (Day 30):**

```javascript
// Calculate tier values
const aaveTierValue = (700e6 * 1.004166666667e18) / 1e18
// = 702.916666 USDT

const compoundTierValue = (200e6 * 1.006666666667e18) / 1e18
// = 201.333333 USDT

const yearnTierValue = (100e6 * 1.01e18) / 1e18
// = 101.000000 USDT

// Total value
const totalValue = 702.916666 + 201.333333 + 101.000000
// = 1005.250000 USDT

// Accrued yield
const accruedYield = totalValue - 1000
// = 5.250000 USDT
```

---

### **PHASE 6: User Withdrawal Request**

**Day 35: Alice wants to withdraw 500 USDT**

```javascript
// Step 6.1: Oracle calculates withdrawal (OFF-CHAIN)

// Read current state
const aaveAccount = await laac.getAccount(ACME_CORP, ALICE, AAVE_LOW_RISK, USDT);
// { balance: 700e6, entryIndex: 1e18, depositedAt: 1730246400 }

const compoundAccount = await laac.getAccount(ACME_CORP, ALICE, COMPOUND_MEDIUM_RISK, USDT);
// { balance: 200e6, entryIndex: 1e18, depositedAt: 1730246400 }

const yearnAccount = await laac.getAccount(ACME_CORP, ALICE, YEARN_HIGH_RISK, USDT);
// { balance: 100e6, entryIndex: 1e18, depositedAt: 1730246400 }

// Read current indices (assume some more growth)
const aaveIndex = await laac.getTierIndex(USDT, AAVE_LOW_RISK);
// 1.005e18 (0.5% more growth)

const compoundIndex = await laac.getTierIndex(USDT, COMPOUND_MEDIUM_RISK);
// 1.008e18

const yearnIndex = await laac.getTierIndex(USDT, YEARN_HIGH_RISK);
// 1.012e18

// Calculate tier values
const aaveTierValue = (700e6 * 1.005e18) / 1e18 = 703.5e6 USDT;
const compoundTierValue = (200e6 * 1.008e18) / 1e18 = 201.6e6 USDT;
const yearnTierValue = (100e6 * 1.012e18) / 1e18 = 101.2e6 USDT;

const totalValue = 703.5 + 201.6 + 101.2 = 1006.3 USDT;
const totalBalance = 700 + 200 + 100 = 1000 USDT;
const accruedYield = 1006.3 - 1000 = 6.3 USDT;

// User wants to withdraw 500 USDT
const withdrawAmount = 500e6;

// Calculate proportional withdrawal from each tier
const withdrawPercentage = 500 / 1006.3 = 0.4969 (49.69%);

// Calculate how much to reduce from each tier (in balance units)
const aaveReduction = 700e6 * 0.4969 = 347.83e6 balance units;
const compoundReduction = 200e6 * 0.4969 = 99.38e6 balance units;
const yearnReduction = 100e6 * 0.4969 = 49.69e6 balance units;

// Calculate gross amount (token value)
const grossAmount = 500e6;

// Calculate yield portion of this withdrawal
const principalPortion = (1000 * 500) / 1006.3 = 496.87 USDT;
const yieldPortion = 500 - 496.87 = 3.13 USDT;

// Calculate service fee (2% of yield)
const serviceFee = 3.13 * 0.02 = 0.0626 USDT = 62600 (6 decimals);

// Gas fee share (assume batch of 10 users, total gas = $5)
const gasFeeShare = 5 / 10 = 0.5 USDT = 500000 (6 decimals);

// Net amount to user
const netAmount = 500e6 - 62600 - 500000 = 499437400 (499.4374 USDT);
```

```solidity
// Step 6.2: Oracle submits batch withdrawal (ON-CHAIN)
LAACControllerV2.batchWithdraw([
    {
        clientId: keccak256("ACME_CORP"),
        userId: keccak256("ALICE"),
        token: 0xUSDT_ADDRESS,
        to: 0xALICE_WALLET,
        tierIds: [
            keccak256("AAVE_LOW_RISK"),
            keccak256("COMPOUND_MEDIUM_RISK"),
            keccak256("YEARN_HIGH_RISK")
        ],
        tierReductions: [
            347830000,  // 347.83 USDT balance units
            99380000,   // 99.38 USDT balance units
            49690000    // 49.69 USDT balance units
        ],
        grossAmount: 500000000,      // 500 USDT
        serviceFee: 62600,           // 0.0626 USDT
        gasFeeShare: 500000,         // 0.5 USDT
        netAmount: 499437400         // 499.4374 USDT
    }
    // ... potentially 99 more withdrawals in same batch
])
```

**Internal Execution:**

```
1. Controller Validation
   ├─ ✓ executions.length > 0
   ├─ ✓ executions.length <= 100
   └─ ✓ all use same token (USDT)

2. Generate Batch ID
   └─ batchId = keccak256(timestamp + blockNumber + executionCount)

3. Call LAACv2.batchWithdraw()
   
   For each execution:
   
   3.1. Validate
      ├─ ✓ supportedTokens[USDT] = true
      ├─ ✓ to != address(0)
      ├─ ✓ tierIds.length == tierReductions.length = 3
      └─ ✓ gasFeeShare <= 100e6 (max $100)

   3.2. Reduce Tier Balances
      
      For AAVE_LOW_RISK:
      ├─ account = accounts[ACME_CORP][ALICE][AAVE_LOW_RISK][USDT]
      ├─ require(account.balance >= 347.83e6) ✓
      ├─ account.balance -= 347.83e6
      │  └─ New balance = 700e6 - 347.83e6 = 352.17e6
      └─ (balance > 0, so keep in active tiers)

      For COMPOUND_MEDIUM_RISK:
      ├─ account.balance -= 99.38e6
      │  └─ New balance = 200e6 - 99.38e6 = 100.62e6
      └─ (balance > 0, keep in active tiers)

      For YEARN_HIGH_RISK:
      ├─ account.balance -= 49.69e6
      │  └─ New balance = 100e6 - 49.69e6 = 50.31e6
      └─ (balance > 0, keep in active tiers)

   3.3. Update Global Counter
      └─ totalDeposits[USDT] -= (347.83e6 + 99.38e6 + 49.69e6)
         = 1000e6 - 496.9e6 = 503.1e6

   3.4. Calculate Fee Distribution
      
      Get client info:
      └─ clientInfo = clientRegistry.getClientInfo(ACME_CORP)
         └─ { feeBps: 500, serviceFeeBps: 200, ... }

      Split service fee (hardcoded 95/5 split):
      ├─ protocolShare = 62600 * 95 / 100 = 59470
      └─ clientShare = 62600 - 59470 = 3130

   3.5. Allocate Fees to Vaults
      ├─ protocolRevenueVault[USDT] += 59470
      ├─ clientRevenueVault[ACME_CORP][USDT] += 3130
      ├─ totalClientRevenues[USDT] += 3130
      └─ operationFeeVault[USDT] += 500000

   3.6. Transfer to User
      └─ IERC20(USDT).safeTransfer(0xALICE_WALLET, 499437400)

   3.7. Emit Events
      ├─ WithdrawnWithFee(ACME_CORP, ALICE, USDT, 500e6, 62600, 500000, 499437400, timestamp)
      └─ Withdrawn(ACME_CORP, ALICE, USDT, 499437400, 0xALICE_WALLET, timestamp)

4. Controller Emits Batch Event
   └─ BatchWithdrawalExecuted(batchId, USDT, 1, 499437400, 62600, 500000, timestamp)
```

**Contract State After Step 6.2:**

```
// Alice's updated tier accounts
accounts[ACME_CORP][ALICE][AAVE_LOW_RISK][USDT] = {
    balance: 352170000,  // 352.17 USDT balance units
    entryIndex: 1e18,
    depositedAt: 1730246400
}

accounts[ACME_CORP][ALICE][COMPOUND_MEDIUM_RISK][USDT] = {
    balance: 100620000,  // 100.62 USDT balance units
    entryIndex: 1e18,
    depositedAt: 1730246400
}

accounts[ACME_CORP][ALICE][YEARN_HIGH_RISK][USDT] = {
    balance: 50310000,   // 50.31 USDT balance units
    entryIndex: 1e18,
    depositedAt: 1730246400
}

// Alice still has all 3 active tiers (all balances > 0)
userActiveTiers[ACME_CORP][ALICE][USDT] = [
    keccak256("AAVE_LOW_RISK"),
    keccak256("COMPOUND_MEDIUM_RISK"),
    keccak256("YEARN_HIGH_RISK")
]

// Global state
totalDeposits[USDT] = 503100000  // 503.1 USDT

// Fee vaults
protocolRevenueVault[USDT] = 59470       // 0.05947 USDT
clientRevenueVault[ACME_CORP][USDT] = 3130  // 0.00313 USDT
totalClientRevenues[USDT] = 3130
operationFeeVault[USDT] = 500000         // 0.5 USDT

// Token balances
IERC20(USDT).balanceOf(0xALICE_WALLET) = 499437400  // 499.4374 USDT
IERC20(USDT).balanceOf(LAACv2_CONTRACT) = 562600    // 0.5626 USDT (fees)
```

---

### **PHASE 7: View Functions - Read Current State**

**All Getter Methods with Examples:**

```solidity
// ========== Account Information ==========

// 1. Get specific tier account
LAACv2.getAccount(
    ACME_CORP,
    ALICE,
    AAVE_LOW_RISK,
    USDT
)
→ Returns: {
    balance: 352170000,
    entryIndex: 1000000000000000000,
    depositedAt: 1730246400
}

// 2. Get user's active tiers
LAACv2.getUserActiveTiers(
    ACME_CORP,
    ALICE,
    USDT
)
→ Returns: [
    keccak256("AAVE_LOW_RISK"),
    keccak256("COMPOUND_MEDIUM_RISK"),
    keccak256("YEARN_HIGH_RISK")
]

// 3. Get total value across all tiers
LAACv2.getTotalValue(
    ACME_CORP,
    ALICE,
    USDT
)
→ Calculation:
  aaveValue = (352.17e6 * 1.005e18) / 1e18 = 353.93e6
  compoundValue = (100.62e6 * 1.008e18) / 1e18 = 101.42e6
  yearnValue = (50.31e6 * 1.012e18) / 1e18 = 50.91e6
  total = 506.26e6
→ Returns: 506260000

// 4. Get value for specific tier
LAACv2.getTierValue(
    ACME_CORP,
    ALICE,
    AAVE_LOW_RISK,
    USDT
)
→ Returns: 353930000  // 353.93 USDT

// 5. Get accrued yield
LAACv2.getAccruedYield(
    ACME_CORP,
    ALICE,
    USDT
)
→ Calculation:
  totalValue = 506.26 USDT
  totalBalance = 352.17 + 100.62 + 50.31 = 503.1 USDT
  yield = 506.26 - 503.1 = 3.16 USDT
→ Returns: 3160000

// 6. Get comprehensive summary
LAACv2.getUserAccountSummary(
    ACME_CORP,
    ALICE,
    USDT
)
→ Returns: {
    totalBalance: 503100000,    // 503.1 USDT
    totalValue: 506260000,      // 506.26 USDT
    accruedYield: 3160000,      // 3.16 USDT
    activeTierCount: 3
}

// ========== Tier Index Information ==========

// 7. Get tier index
LAACv2.getTierIndex(
    USDT,
    AAVE_LOW_RISK
)
→ Returns: 1005000000000000000  // 1.005

// 8. Get tier index with timestamp
LAACv2.getTierIndexWithTimestamp(
    USDT,
    AAVE_LOW_RISK
)
→ Returns: {
    index: 1005000000000000000,
    updatedAt: 1732838400
}

// 9. Check if tier is initialized
LAACv2.isTierInitialized(
    USDT,
    AAVE_LOW_RISK
)
→ Returns: true

// ========== Global State ==========

// 10. Get total deposits for token
LAACv2.getTotalDeposits(USDT)
→ Returns: 503100000  // 503.1 USDT

// 11. Get total staked for token
LAACv2.getTotalStaked(USDT)
→ Returns: 1000000000  // 1000 USDT (unchanged until oracle confirms unstake)

// 12. Check if token is supported
LAACv2.isSupportedToken(USDT)
→ Returns: true

// 13. Get contract balance
LAACv2.getContractBalance(USDT)
→ Returns: 562600  // 0.5626 USDT (fees in vault)

// 14. Get stakeable balance
LAACv2.getStakeableBalance(USDT)
→ Calculation:
  contractBalance = 562600
  reservedFunds = 59470 + 3130 + 500000 = 562600
  stakeable = 562600 - 562600 = 0
→ Returns: 0

// ========== Fee Vaults ==========

// 15. Get operation fee balance
LAACv2.getOperationFeeBalance(USDT)
→ Returns: 500000  // 0.5 USDT

// 16. Get protocol revenue balance
LAACv2.getProtocolRevenueBalance(USDT)
→ Returns: 59470  // 0.05947 USDT

// 17. Get client revenue balance
LAACv2.getClientRevenueBalance(
    ACME_CORP,
    USDT
)
→ Returns: 3130  // 0.00313 USDT

// 18. Get total client revenues
LAACv2.getTotalClientRevenues(USDT)
→ Returns: 3130  // 0.00313 USDT (sum of all clients)

// ========== Client Registry Information ==========

// 19. Check if client is active
ClientRegistryV2.isClientActive(ACME_CORP)
→ Returns: true

// 20. Check if client is registered
ClientRegistryV2.isClientRegistered(ACME_CORP)
→ Returns: true

// 21. Get client info
ClientRegistryV2.getClientInfo(ACME_CORP)
→ Returns: {
    name: "ACME Corporation",
    clientAddress: 0x123...,
    isActive: true,
    registeredAt: 1730246400,
    feeBps: 500,
    serviceFeeBps: 200
}

// 22. Get client address
ClientRegistryV2.getClientAddress(ACME_CORP)
→ Returns: 0x123...

// 23. Get client risk tiers
ClientRegistryV2.getClientRiskTiers(ACME_CORP)
→ Returns: [
    {
        tierId: keccak256("AAVE_LOW_RISK"),
        name: "Aave Low Risk - 5% APY",
        allocationBps: 7000,
        isActive: true
    },
    {
        tierId: keccak256("COMPOUND_MEDIUM_RISK"),
        name: "Compound Medium Risk - 8% APY",
        allocationBps: 2000,
        isActive: true
    },
    {
        tierId: keccak256("YEARN_HIGH_RISK"),
        name: "Yearn High Risk - 12% APY",
        allocationBps: 1000,
        isActive: true
    }
]

// 24. Get specific risk tier
ClientRegistryV2.getClientRiskTier(
    ACME_CORP,
    AAVE_LOW_RISK
)
→ Returns: {
    tierId: keccak256("AAVE_LOW_RISK"),
    name: "Aave Low Risk - 5% APY",
    allocationBps: 7000,
    isActive: true
}

// 25. Check if client has specific tier
ClientRegistryV2.hasTier(
    ACME_CORP,
    AAVE_LOW_RISK
)
→ Returns: true

// ========== Controller Information ==========

// 26. Get tier protocols
LAACControllerV2.getTierProtocols(AAVE_LOW_RISK)
→ Returns: [0xAAVE_PROTOCOL]

// 27. Check if protocol is whitelisted
LAACControllerV2.isProtocolWhitelisted(0xAAVE_PROTOCOL)
→ Returns: true

// 28. Check if token is supported (controller)
LAACControllerV2.isTokenSupported(USDT)
→ Returns: true

// 29. Check if paused
LAACControllerV2.isPaused()
→ Returns: false

// 30. Get operation fee balance (via controller)
LAACControllerV2.getOperationFeeBalance(USDT)
→ Returns: 500000

// 31. Get protocol revenue balance (via controller)
LAACControllerV2.getProtocolRevenueBalance(USDT)
→ Returns: 59470

// 32. Get client revenue balance (via controller)
LAACControllerV2.getClientRevenueBalance(ACME_CORP, USDT)
→ Returns: 3130
```

---

## 📊 Complete State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTRACT STATE SUMMARY                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│     ClientRegistryV2 State      │
├─────────────────────────────────┤
│ clients[ACME_CORP]:             │
│   name: "ACME Corporation"      │
│   clientAddress: 0x123...       │
│   isActive: true                │
│   registeredAt: 1730246400      │
│   feeBps: 500 (5%)              │
│   serviceFeeBps: 200 (2%)       │
│                                 │
│ clientRiskTiers[ACME_CORP]:     │
│   [0] AAVE_LOW_RISK: 70%        │
│   [1] COMPOUND_MEDIUM: 20%      │
│   [2] YEARN_HIGH: 10%           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         LAACv2 State            │
├─────────────────────────────────┤
│ Tier Indices (USDT):            │
│   AAVE_LOW: 1.005 (0.5% gain)  │
│   COMPOUND: 1.008 (0.8% gain)  │
│   YEARN: 1.012 (1.2% gain)     │
│                                 │
│ Alice's Tier Accounts:          │
│   AAVE: 352.17 units @ 1.0     │
│        = 353.93 USDT value     │
│   COMPOUND: 100.62 units @ 1.0 │
│        = 101.42 USDT value     │
│   YEARN: 50.31 units @ 1.0     │
│        = 50.91 USDT value      │
│   ────────────────────────     │
│   Total: 506.26 USDT           │
│   Yield: 3.16 USDT             │
│                                 │
│ Global State:                   │
│   totalDeposits: 503.1 USDT    │
│   totalStaked: 1000 USDT       │
│                                 │
│ Fee Vaults:                     │
│   operationFeeVault: 0.5 USDT  │
│   protocolRevenue: 0.05947 USDT│
│   clientRevenue: 0.00313 USDT  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    LAACControllerV2 State       │
├─────────────────────────────────┤
│ Whitelisted Protocols:          │
│   ✓ AAVE_PROTOCOL              │
│   ✓ COMPOUND_PROTOCOL          │
│   ✓ YEARN_PROTOCOL             │
│                                 │
│ Supported Tokens:               │
│   ✓ USDT                       │
│                                 │
│ Tier → Protocol Mapping:        │
│   AAVE_LOW → [AAVE]            │
│   COMPOUND_MED → [COMPOUND]    │
│   YEARN_HIGH → [YEARN]         │
│                                 │
│ Status: Active (not paused)     │
└─────────────────────────────────┘
```

---

## ✅ Validation Summary

### **All Getter Methods Working:**

| # | Function | Contract | Status |
|---|----------|----------|--------|
| 1 | getAccount | LAACv2 | ✅ Valid |
| 2 | getUserActiveTiers | LAACv2 | ✅ Valid |
| 3 | getTotalValue | LAACv2 | ✅ Valid |
| 4 | getTierValue | LAACv2 | ✅ Valid |
| 5 | getAccruedYield | LAACv2 | ✅ Valid |
| 6 | getUserAccountSummary | LAACv2 | ✅ Valid |
| 7 | getTierIndex | LAACv2 | ✅ Valid |
| 8 | getTierIndexWithTimestamp | LAACv2 | ✅ Valid |
| 9 | isTierInitialized | LAACv2 | ✅ Valid |
| 10 | getTotalDeposits | LAACv2 | ✅ Valid |
| 11 | getTotalStaked | LAACv2 | ✅ Valid |
| 12 | isSupportedToken | LAACv2 | ✅ Valid |
| 13 | getContractBalance | LAACv2 | ✅ Valid |
| 14 | getStakeableBalance | LAACv2 | ✅ Valid |
| 15 | getOperationFeeBalance | LAACv2 | ✅ Valid |
| 16 | getProtocolRevenueBalance | LAACv2 | ✅ Valid |
| 17 | getClientRevenueBalance | LAACv2 | ✅ Valid |
| 18 | getTotalClientRevenues | LAACv2 | ✅ Valid |
| 19 | isClientActive | ClientRegistryV2 | ✅ Valid |
| 20 | isClientRegistered | ClientRegistryV2 | ✅ Valid |
| 21 | getClientInfo | ClientRegistryV2 | ✅ Valid |
| 22 | getClientAddress | ClientRegistryV2 | ✅ Valid |
| 23 | getClientRiskTiers | ClientRegistryV2 | ✅ Valid |
| 24 | getClientRiskTier | ClientRegistryV2 | ✅ Valid |
| 25 | hasTier | ClientRegistryV2 | ✅ Valid |
| 26 | getTierProtocols | LAACControllerV2 | ✅ Valid |
| 27 | isProtocolWhitelisted | LAACControllerV2 | ✅ Valid |
| 28 | isTokenSupported | LAACControllerV2 | ✅ Valid |
| 29 | isPaused | LAACControllerV2 | ✅ Valid |
| 30 | getOperationFeeBalance | LAACControllerV2 | ✅ Valid (proxy) |
| 31 | getProtocolRevenueBalance | LAACControllerV2 | ✅ Valid (proxy) |
| 32 | getClientRevenueBalance | LAACControllerV2 | ✅ Valid (proxy) |

### **All Setter Methods Working:**

| # | Function | Contract | Status |
|---|----------|----------|--------|
| 1 | registerClient | ClientRegistryV2 | ✅ Valid |
| 2 | activateClient | ClientRegistryV2 | ✅ Valid |
| 3 | deactivateClient | ClientRegistryV2 | ✅ Valid |
| 4 | updateClientAddress | ClientRegistryV2 | ✅ Valid |
| 5 | updateClientFees | ClientRegistryV2 | ✅ Valid |
| 6 | setClientRiskTiers | ClientRegistryV2 | ✅ Valid |
| 7 | addClientRiskTier | ClientRegistryV2 | ✅ Valid |
| 8 | updateTierAllocation | ClientRegistryV2 | ✅ Valid |
| 9 | setTierActive | ClientRegistryV2 | ✅ Valid |
| 10 | deposit | LAACv2 | ✅ Valid |
| 11 | depositFrom | LAACv2 | ✅ Valid |
| 12 | batchWithdraw | LAACv2 | ✅ Valid |
| 13 | withdraw | LAACv2 | ✅ Valid |
| 14 | updateTierIndex | LAACv2 | ✅ Valid |
| 15 | batchUpdateTierIndices | LAACv2 | ✅ Valid |
| 16 | initializeTier | LAACv2 | ✅ Valid |
| 17 | addSupportedToken | LAACv2 | ✅ Valid |
| 18 | removeSupportedToken | LAACv2 | ✅ Valid |
| 19 | updateStaked | LAACv2 | ✅ Valid |
| 20 | claimOperationFee | LAACv2 | ✅ Valid |
| 21 | claimProtocolRevenue | LAACv2 | ✅ Valid |
| 22 | claimClientRevenue | LAACv2 | ✅ Valid |
| 23 | executeTransfer | LAACControllerV2 | ✅ Valid |
| 24 | confirmUnstake | LAACControllerV2 | ✅ Valid |
| 25 | updateTierIndex | LAACControllerV2 | ✅ Valid (proxy) |
| 26 | batchUpdateTierIndices | LAACControllerV2 | ✅ Valid (proxy) |
| 27 | initializeTier | LAACControllerV2 | ✅ Valid (proxy) |
| 28 | batchInitializeTiers | LAACControllerV2 | ✅ Valid |
| 29 | batchWithdraw | LAACControllerV2 | ✅ Valid (proxy) |
| 30 | assignProtocolToTier | LAACControllerV2 | ✅ Valid |
| 31 | removeProtocolFromTier | LAACControllerV2 | ✅ Valid |
| 32 | addWhitelistedProtocol | LAACControllerV2 | ✅ Valid |
| 33 | removeWhitelistedProtocol | LAACControllerV2 | ✅ Valid |
| 34 | addSupportedToken | LAACControllerV2 | ✅ Valid (proxy) |
| 35 | removeSupportedToken | LAACControllerV2 | ✅ Valid (proxy) |
| 36 | emergencyPause | LAACControllerV2 | ✅ Valid |
| 37 | unpause | LAACControllerV2 | ✅ Valid |

---

## 🎯 Key Takeaways

1. **Dynamic Risk Tiers**: Client can have unlimited custom tiers, not fixed to 3
2. **Off-Chain Calculation**: Oracle calculates withdrawal amounts, contract validates
3. **Batch Processing**: Up to 100 withdrawals in one transaction for gas efficiency
4. **Separate Accounting**: Each tier has independent balance tracking with own entry index
5. **Transparent Growth**: Vault indices updated separately per tier based on actual protocol yields
6. **Fee Distribution**: Automatic splitting between protocol, client, and operation fees
7. **Complete Validation**: All getter and setter methods are implemented and functional

**V2 is production-ready!** 🚀
