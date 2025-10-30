# Proxify System - Complete Workflow Visualization

**Version:** 2.0 (Proxify)
**Date:** 2025-10-29

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Step-by-Step Flow](#step-by-step-flow)
3. [State Changes Diagram](#state-changes-diagram)
4. [All Methods Reference](#all-methods-reference)
5. [Test Scenarios](#test-scenarios)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROXIFY ECOSYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ProxifyClientRegistry  →  Proxify  ←  ProxifyController              │
│   (Client & Tier Config)    (Vault)      (Orchestration)                │
│                                                                          │
│   Stores:                   Stores:       Controls:                      │
│   • Client info             • User        • Protocol transfers           │
│   • Risk tiers              • Balances    • Tier index updates           │
│   • Allocations %           • Per tier    • Batch withdrawals            │
│                             • Fee vaults  • Emergency pause              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Flow

### **STEP 1: Client Registry Setup**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: REGISTER CLIENT & CONFIGURE RISK TIERS                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 1.1 Register Client                                            │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyClientRegistry.registerClient(                        │
│     clientId: bytes32,        // keccak256("BITKUB")          │
│     clientAddress: address,   // 0xCLIENT_WALLET              │
│     name: string,             // "Bitkub"                      │
│     feeBps: uint16,          // 500 (5% client revenue)       │
│     serviceFeeBps: uint16    // 2000 (20% service fee)        │
│   )                                                            │
│                                                                │
│ State Changes:                                                 │
│   clients[clientId] = ClientInfo {                            │
│     name: "Bitkub",                                           │
│     clientAddress: 0xCLIENT_WALLET,                           │
│     isActive: true,                                           │
│     registeredAt: block.timestamp,                            │
│     feeBps: 500,                                              │
│     serviceFeeBps: 2000                                       │
│   }                                                            │
│                                                                │
│ Events Emitted:                                                │
│   ✅ ClientRegistered(clientId, clientAddress, "Bitkub")      │
│   ✅ ClientActivated(clientId)                                │
│                                                                │
│ Getters to Verify:                                             │
│   isClientRegistered(clientId) → true                         │
│   isClientActive(clientId) → true                             │
│   getClientInfo(clientId) → ClientInfo struct                 │
│   getClientAddress(clientId) → 0xCLIENT_WALLET                │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 1.2 Set Client Risk Tiers                                     │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyClientRegistry.setClientRiskTiers(                    │
│     clientId: bytes32,                                         │
│     riskTiers: RiskTier[] = [                                 │
│       {                                                        │
│         tierId: keccak256("LOW_RISK"),                        │
│         name: "Low Risk - Aave/Compound",                     │
│         allocationBps: 7000,  // 70%                          │
│         isActive: true                                         │
│       },                                                       │
│       {                                                        │
│         tierId: keccak256("MODERATE_RISK"),                   │
│         name: "Moderate Risk - Curve Stable",                 │
│         allocationBps: 2000,  // 20%                          │
│         isActive: true                                         │
│       },                                                       │
│       {                                                        │
│         tierId: keccak256("HIGH_RISK"),                       │
│         name: "High Risk - Curve Volatile",                   │
│         allocationBps: 1000,  // 10%                          │
│         isActive: true                                         │
│       }                                                        │
│     ]                                                          │
│   )                                                            │
│                                                                │
│ Validation:                                                    │
│   ✅ 7000 + 2000 + 1000 = 10000 (100%)                        │
│   ✅ No duplicate tierIds                                      │
│   ✅ All tiers have names                                      │
│   ✅ tierIds are not bytes32(0)                                │
│                                                                │
│ State Changes:                                                 │
│   clientRiskTiers[clientId] = [RiskTier, RiskTier, RiskTier] │
│   tierIndexMap[clientId][LOW_RISK] = 0                        │
│   tierIndexMap[clientId][MODERATE_RISK] = 1                   │
│   tierIndexMap[clientId][HIGH_RISK] = 2                       │
│                                                                │
│ Events Emitted:                                                │
│   ✅ ClientRiskTiersUpdated(clientId, 3)                      │
│                                                                │
│ Getters to Verify:                                             │
│   getClientRiskTiers(clientId) → RiskTier[] (3 tiers)        │
│   getClientRiskTier(clientId, LOW_RISK) → RiskTier struct    │
│   hasTier(clientId, LOW_RISK) → true                         │
│   validateTierAllocations(tiers) → true                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 2: System Initialization**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 2: INITIALIZE SYSTEM (Tokens, Tiers, Protocols)          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 2.1 Add Supported Token (USDC)                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyController.addSupportedToken(                         │
│     token: address  // USDC_ADDRESS                           │
│   )                                                            │
│                                                                │
│ State Changes:                                                 │
│   ProxifyController.supportedTokens[USDC] = true              │
│   Proxify.supportedTokens[USDC] = true                        │
│                                                                │
│ Events Emitted:                                                │
│   ✅ TokenAdded(USDC, timestamp)                              │
│                                                                │
│ Getters to Verify:                                             │
│   ProxifyController.isTokenSupported(USDC) → true             │
│   Proxify.isSupportedToken(USDC) → true                       │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 2.2 Initialize Tiers for Token                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyController.batchInitializeTiers(                      │
│     token: address,  // USDC                                   │
│     tierIds: bytes32[] = [LOW_RISK, MODERATE_RISK, HIGH_RISK] │
│   )                                                            │
│                                                                │
│ For each tier:                                                 │
│   Proxify.initializeTier(USDC, tierId)                        │
│                                                                │
│ State Changes (per tier):                                      │
│   tierVaultIndices[tierId][USDC] = 1e18  // 1.0              │
│   tierVaultIndexUpdatedAt[tierId][USDC] = block.timestamp     │
│   isTierInitializedMap[tierId][USDC] = true                   │
│                                                                │
│ Events Emitted (per tier):                                     │
│   ✅ TierInitialized(USDC, tierId, 1e18, timestamp)           │
│                                                                │
│ Getters to Verify:                                             │
│   Proxify.isTierInitialized(USDC, LOW_RISK) → true           │
│   Proxify.getTierIndex(USDC, LOW_RISK) → 1e18                │
│   Proxify.getTierIndexWithTimestamp(USDC, LOW_RISK)          │
│     → (1e18, timestamp)                                        │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 2.3 Whitelist Protocols                                       │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyController.addWhitelistedProtocol(                    │
│     protocol: address  // AAVE_POOL                           │
│   )                                                            │
│                                                                │
│ State Changes:                                                 │
│   whitelistedProtocols[AAVE_POOL] = true                      │
│   whitelistedProtocols[COMPOUND_CUSDC] = true                 │
│   whitelistedProtocols[CURVE_3POOL] = true                    │
│                                                                │
│ Events Emitted:                                                │
│   ✅ ProtocolWhitelisted(AAVE_POOL, timestamp)                │
│                                                                │
│ Getters to Verify:                                             │
│   ProxifyController.isProtocolWhitelisted(AAVE_POOL) → true   │
│                                                                │
│ Optional: Assign protocols to tiers                           │
│   ProxifyController.assignProtocolToTier(                      │
│     LOW_RISK, AAVE_POOL                                        │
│   )                                                            │
│   ProxifyController.getTierProtocols(LOW_RISK)                │
│     → [AAVE_POOL, COMPOUND_CUSDC]                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 3: User Deposit**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 3: USER DEPOSITS $1,000 USDC                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 3.1 User Approves Proxify                                     │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   USDC.approve(                                                │
│     spender: ProxifyAddress,                                   │
│     amount: 1000e6  // $1,000 USDC (6 decimals)              │
│   )                                                            │
│                                                                │
│ State Changes (USDC contract):                                 │
│   allowance[userAddress][ProxifyAddress] = 1000e6             │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 3.2 User Deposits to Proxify                                  │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   Proxify.depositFrom(                                         │
│     clientId: BITKUB,                                          │
│     userId: keccak256("USER_123"),                            │
│     token: USDC,                                               │
│     amount: 1000e6                                             │
│   )                                                            │
│                                                                │
│ Internal Flow:                                                 │
│                                                                │
│ Step 3.2.1: Read client risk tiers                            │
│   tiers = clientRegistry.getClientRiskTiers(BITKUB)           │
│   → [                                                          │
│       LOW_RISK (70%),                                          │
│       MODERATE_RISK (20%),                                     │
│       HIGH_RISK (10%)                                          │
│     ]                                                          │
│                                                                │
│ Step 3.2.2: Calculate tier amounts                            │
│   lowAmount = 1000e6 * 7000 / 10000 = 700e6  ($700)          │
│   moderateAmount = 1000e6 * 2000 / 10000 = 200e6  ($200)     │
│   highAmount = 1000e6 * 1000 / 10000 = 100e6  ($100)         │
│                                                                │
│ Step 3.2.3: Deposit to each tier (_depositToTier)             │
│                                                                │
│   For LOW_RISK tier:                                           │
│   ──────────────────                                           │
│   account = accounts[BITKUB][USER_123][LOW_RISK][USDC]        │
│   currentIndex = tierVaultIndices[LOW_RISK][USDC] = 1e18      │
│                                                                │
│   if (account.balance == 0) {  // First deposit                │
│     account.entryIndex = currentIndex = 1e18                  │
│     account.depositedAt = block.timestamp                     │
│     userActiveTiers[BITKUB][USER_123][USDC].push(LOW_RISK)   │
│   }                                                            │
│                                                                │
│   account.balance += 700e6                                     │
│                                                                │
│   Result:                                                      │
│   accounts[BITKUB][USER_123][LOW_RISK][USDC] = {             │
│     balance: 700e6,                                            │
│     entryIndex: 1e18,                                          │
│     depositedAt: timestamp                                     │
│   }                                                            │
│                                                                │
│   For MODERATE_RISK tier:                                      │
│   ────────────────────────                                     │
│   accounts[BITKUB][USER_123][MODERATE_RISK][USDC] = {        │
│     balance: 200e6,                                            │
│     entryIndex: 1e18,                                          │
│     depositedAt: timestamp                                     │
│   }                                                            │
│   userActiveTiers[BITKUB][USER_123][USDC].push(MODERATE_RISK)│
│                                                                │
│   For HIGH_RISK tier:                                          │
│   ────────────────                                             │
│   accounts[BITKUB][USER_123][HIGH_RISK][USDC] = {            │
│     balance: 100e6,                                            │
│     entryIndex: 1e18,                                          │
│     depositedAt: timestamp                                     │
│   }                                                            │
│   userActiveTiers[BITKUB][USER_123][USDC].push(HIGH_RISK)    │
│                                                                │
│ Step 3.2.4: Update global state                               │
│   totalDeposits[USDC] += 1000e6                               │
│                                                                │
│ Step 3.2.5: Transfer tokens                                   │
│   USDC.transferFrom(user, ProxifyAddress, 1000e6)             │
│                                                                │
│ Events Emitted:                                                │
│   ✅ Deposited(                                                │
│       BITKUB,                                                  │
│       USER_123,                                                │
│       USDC,                                                    │
│       1000e6,                                                  │
│       [LOW_RISK, MODERATE_RISK, HIGH_RISK],                   │
│       [700e6, 200e6, 100e6],                                  │
│       timestamp                                                │
│     )                                                          │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 3.3 Verify State After Deposit                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Getters to Verify:                                             │
│                                                                │
│ getUserActiveTiers(BITKUB, USER_123, USDC)                    │
│   → [LOW_RISK, MODERATE_RISK, HIGH_RISK]                     │
│                                                                │
│ getAccount(BITKUB, USER_123, LOW_RISK, USDC)                 │
│   → { balance: 700e6, entryIndex: 1e18, depositedAt: ... }   │
│                                                                │
│ getTierValue(BITKUB, USER_123, LOW_RISK, USDC)               │
│   → (700e6 * 1e18) / 1e18 = 700e6  ($700)                    │
│                                                                │
│ getTotalValue(BITKUB, USER_123, USDC)                         │
│   → 700e6 + 200e6 + 100e6 = 1000e6  ($1,000)                 │
│                                                                │
│ getAccruedYield(BITKUB, USER_123, USDC)                       │
│   → 1000e6 - 1000e6 = 0  (no yield yet)                      │
│                                                                │
│ getUserAccountSummary(BITKUB, USER_123, USDC)                 │
│   → {                                                          │
│       totalBalance: 1000e6,                                    │
│       totalValue: 1000e6,                                      │
│       accruedYield: 0,                                         │
│       activeTierCount: 3                                       │
│     }                                                          │
│                                                                │
│ getTotalDeposits(USDC) → 1000e6                               │
│ getContractBalance(USDC) → 1000e6                             │
│ getStakeableBalance(USDC) → 1000e6 (no fees yet)             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 4: Oracle Stakes to Protocols**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 4: ORACLE AGGREGATES & STAKES FUNDS TO PROTOCOLS         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Scenario: 10 users have deposited with different amounts      │
│                                                                │
│ Users Deposited:                                               │
│   User 1: $1,000 → LOW_RISK: $700, MODERATE: $200, HIGH: $100│
│   User 2: $5,000 → LOW_RISK: $3,500, MODERATE: $1,000, HIGH: $500│
│   User 3: $2,000 → LOW_RISK: $1,400, MODERATE: $400, HIGH: $200│
│   User 4: $800 → LOW_RISK: $560, MODERATE: $160, HIGH: $80   │
│   User 5: $10,000 → LOW_RISK: $7,000, MODERATE: $2,000, HIGH: $1,000│
│   User 6: $3,500 → LOW_RISK: $2,450, MODERATE: $700, HIGH: $350│
│   User 7: $1,500 → LOW_RISK: $1,050, MODERATE: $300, HIGH: $150│
│   User 8: $4,200 → LOW_RISK: $2,940, MODERATE: $840, HIGH: $420│
│   User 9: $6,000 → LOW_RISK: $4,200, MODERATE: $1,200, HIGH: $600│
│   User 10: $2,000 → LOW_RISK: $1,400, MODERATE: $400, HIGH: $200│
│                                                                │
│ TOTAL DEPOSITED: $36,000                                      │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 4.0 Oracle Reads On-Chain Data (OFF-CHAIN CALCULATION)        │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Step 4.0.1: Get stakeable balance                             │
│   Proxify.getStakeableBalance(USDC)                           │
│   → 36,000e6  (total available to stake)                     │
│                                                                │
│ Step 4.0.2: Get contract balance breakdown                    │
│   totalDeposits = Proxify.getTotalDeposits(USDC)              │
│     → 36,000e6                                                 │
│   totalStaked = Proxify.getTotalStaked(USDC)                  │
│     → 0  (nothing staked yet)                                 │
│   feeVaults = totalDeposits - stakeableBalance                │
│     → 0  (no fees yet)                                         │
│                                                                │
│ Step 4.0.3: Query client tier configurations                  │
│   For BITKUB client:                                           │
│   tiers = ProxifyClientRegistry.getClientRiskTiers(BITKUB)    │
│   → [                                                          │
│       { tierId: LOW_RISK, allocationBps: 7000 },  // 70%     │
│       { tierId: MODERATE_RISK, allocationBps: 2000 },  // 20%│
│       { tierId: HIGH_RISK, allocationBps: 1000 }   // 10%    │
│     ]                                                          │
│                                                                │
│ Step 4.0.4: Calculate aggregated tier amounts                 │
│   Based on allocation percentages:                            │
│                                                                │
│   LOW_RISK total:                                              │
│     700 + 3500 + 1400 + 560 + 7000 + 2450 + 1050 + 2940      │
│     + 4200 + 1400 = 25,200 USDC (70% of 36,000)              │
│                                                                │
│   MODERATE_RISK total:                                         │
│     200 + 1000 + 400 + 160 + 2000 + 700 + 300 + 840          │
│     + 1200 + 400 = 7,200 USDC (20% of 36,000)                │
│                                                                │
│   HIGH_RISK total:                                             │
│     100 + 500 + 200 + 80 + 1000 + 350 + 150 + 420            │
│     + 600 + 200 = 3,600 USDC (10% of 36,000)                 │
│                                                                │
│   Verification: 25,200 + 7,200 + 3,600 = 36,000 ✅            │
│                                                                │
│ ⚠️  IMPORTANT: Oracle does NOT need to read individual user   │
│     accounts! The contract's totalDeposits already represents │
│     the sum. Oracle just applies allocation percentages.      │
│                                                                │
│     Alternative calculation:                                   │
│     LOW_RISK = 36,000 * 0.70 = 25,200                        │
│     MODERATE = 36,000 * 0.20 = 7,200                          │
│     HIGH = 36,000 * 0.10 = 3,600                              │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 4.1 Oracle Updates Indices BEFORE Staking (CRITICAL!)         │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ ⚠️  IMPORTANT: Before staking new deposits, oracle MUST       │
│     update tier indices if there are existing stakes!         │
│                                                                │
│ Why? If we stake new funds WITHOUT updating the index first,  │
│ the growth calculation becomes wrong:                          │
│                                                                │
│ Example Problem:                                               │
│   Day 1: Stake $1,000 → Aave (index: 1.0)                    │
│   Day 15: Aave grows to $1,030 (3% growth)                   │
│   Day 15: New user deposits $10M                              │
│                                                                │
│   If oracle stakes $10M WITHOUT updating index:               │
│     Next update: currentBalance = $10,001,030                 │
│                 previousBalance = $1,000 + $10,000,000        │
│                 growth = 10,001,030 / 10,001,000 = 1.00003   │
│     ❌ Index only grows 0.003% instead of 3%!                 │
│                                                                │
│   Correct approach (update index FIRST):                      │
│     1. Read currentBalance = $1,030                           │
│     2. Calculate: 1,030 / 1,000 = 1.03 ✅                     │
│     3. Update index: 1.0 → 1.03                               │
│     4. THEN stake the $10M (enters at 1.03)                   │
│                                                                │
│ Check if index update needed:                                 │
│   IF (there are existing stakes in this tier) {               │
│     1. Read protocol balance                                  │
│     2. Calculate growth                                        │
│     3. Update index on-chain                                  │
│   }                                                            │
│   THEN stake new deposits                                     │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 4.2 Stake LOW_RISK Tier to Aave ($25,200)                    │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Since this is the FIRST stake (no existing positions),        │
│ oracle can directly execute the transfer.                     │
│                                                                │
│ Function:                                                      │
│   ProxifyController.executeTransfer(                           │
│     token: USDC,                                               │
│     protocol: AAVE_POOL,                                       │
│     amount: 25200e6,  // Aggregated from all 10 users        │
│     tierId: LOW_RISK,                                          │
│     tierName: "Low Risk - Aave"                               │
│   )                                                            │
│                                                                │
│ Internal Flow:                                                 │
│   1. Validate token supported ✅                               │
│   2. Validate protocol whitelisted ✅                          │
│   3. Validate tier initialized ✅                              │
│   4. Transfer: USDC.transferFrom(Proxify, AAVE_POOL, 25200e6)│
│   5. Update staked: Proxify.updateStaked(USDC, 25200e6, true)│
│                                                                │
│ State Changes:                                                 │
│   totalStaked[USDC] += 25200e6                                 │
│                                                                │
│ Events Emitted:                                                │
│   ✅ TransferExecuted(                                         │
│       USDC, AAVE_POOL, 25200e6,                               │
│       LOW_RISK, "Low Risk - Aave",                            │
│       timestamp                                                │
│     )                                                          │
│                                                                │
│ What This Means:                                               │
│   All 10 users' LOW_RISK allocations are now earning 4% APY  │
│   in Aave, proportional to their individual balances:         │
│   - User 1: 700 USDC earning in Aave                          │
│   - User 2: 3,500 USDC earning in Aave                        │
│   - User 5: 7,000 USDC earning in Aave                        │
│   - ... etc                                                    │
│                                                                │
│ Oracle Records (OFF-CHAIN):                                    │
│   tierStakes[LOW_RISK] = {                                     │
│     protocol: AAVE_POOL,                                       │
│     stakedAmount: 25,200,                                      │
│     stakedAt: block.timestamp,                                 │
│     lastBalance: 25,200                                        │
│   }                                                            │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 4.3 Stake MODERATE_RISK Tier to Compound ($7,200)            │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ ProxifyController.executeTransfer(                             │
│   USDC, COMPOUND_CUSDC, 7200e6,  // Aggregated amount        │
│   MODERATE_RISK, "Moderate Risk - Compound"                   │
│ )                                                              │
│                                                                │
│ State Changes:                                                 │
│   totalStaked[USDC] += 7200e6  (now 32,400e6)                 │
│                                                                │
│ What This Means:                                               │
│   All 10 users' MODERATE_RISK allocations now earning 5% APY │
│   in Compound.                                                 │
│                                                                │
│ Oracle Records:                                                │
│   tierStakes[MODERATE_RISK] = {                               │
│     protocol: COMPOUND_CUSDC,                                  │
│     stakedAmount: 7,200,                                       │
│     stakedAt: block.timestamp,                                 │
│     lastBalance: 7,200                                         │
│   }                                                            │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 4.4 Stake HIGH_RISK Tier to Curve ($3,600)                   │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ ProxifyController.executeTransfer(                             │
│   USDC, CURVE_TRICRYPTO, 3600e6,  // Aggregated amount       │
│   HIGH_RISK, "High Risk - Curve Volatile"                     │
│ )                                                              │
│                                                                │
│ State Changes:                                                 │
│   totalStaked[USDC] += 3600e6  (now 36,000e6)                 │
│                                                                │
│ What This Means:                                               │
│   All 10 users' HIGH_RISK allocations now earning 8% APY     │
│   in Curve.                                                    │
│                                                                │
│ Oracle Records:                                                │
│   tierStakes[HIGH_RISK] = {                                    │
│     protocol: CURVE_TRICRYPTO,                                 │
│     stakedAmount: 3,600,                                       │
│     stakedAt: block.timestamp,                                 │
│     lastBalance: 3,600                                         │
│   }                                                            │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 4.5 Verify State After Staking                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Getters to Verify:                                             │
│   getTotalStaked(USDC) → 36,000e6  (all funds now staked)    │
│   getContractBalance(USDC) → 0  (all funds deployed)         │
│   getStakeableBalance(USDC) → 0                               │
│   getTotalDeposits(USDC) → 36,000e6  (user balances unchanged)│
│                                                                │
│ Protocol Balances:                                             │
│   Aave Pool: 25,200 USDC (70% of total)                       │
│   Compound cUSDC: 7,200 USDC (20% of total)                   │
│   Curve Tricrypto: 3,600 USDC (10% of total)                  │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ 📊 SUMMARY: Oracle's Data Reading Strategy                    │
│                                                                │
│ For aggregated staking, Oracle needs ONLY:                    │
│                                                                │
│ 1️⃣  Proxify.getStakeableBalance(USDC) → 36,000e6             │
│    (Total available to stake)                                 │
│                                                                │
│ 2️⃣  ProxifyClientRegistry.getClientRiskTiers(clientId)        │
│    → [ { tierId, allocationBps }, ... ]                       │
│    (Get allocation percentages: 70%, 20%, 10%)                │
│                                                                │
│ 3️⃣  Calculate tier amounts (OFF-CHAIN):                       │
│    lowAmount = stakeableBalance * 0.70 = 25,200              │
│    moderateAmount = stakeableBalance * 0.20 = 7,200          │
│    highAmount = stakeableBalance * 0.10 = 3,600              │
│                                                                │
│ 4️⃣  Execute 3 transactions:                                   │
│    executeTransfer(USDC, AAVE_POOL, 25200e6, LOW_RISK)       │
│    executeTransfer(USDC, COMPOUND, 7200e6, MODERATE_RISK)    │
│    executeTransfer(USDC, CURVE, 3600e6, HIGH_RISK)           │
│                                                                │
│ ⚠️  Oracle does NOT need to:                                  │
│    ❌ Loop through all users                                  │
│    ❌ Read individual account balances                        │
│    ❌ Sum up user-by-user allocations                         │
│                                                                │
│ ✅ The contract's totalDeposits already represents the sum!   │
│    Individual user tracking happens automatically via their   │
│    locked entryIndex and tier-specific vault indices.         │
│                                                                │
│ 🎯 Result: 1 aggregated transfer per tier, not per user!      │
│    - Gas efficient: 3 transfers vs 30 transfers (10 users × 3)│
│    - Simpler oracle logic                                     │
│    - Users still earn proportionally via vault index math     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 4B: New User Deposits After Initial Staking**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 4B: HANDLING NEW DEPOSITS (15 Days Later)                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Day 15: User 11 deposits $5,000,000                           │
│                                                                │
│ User 11's allocation:                                          │
│   LOW_RISK: $3,500,000 (70%)                                  │
│   MODERATE: $1,000,000 (20%)                                   │
│   HIGH: $500,000 (10%)                                         │
│                                                                │
│ Current state:                                                 │
│   totalDeposits: $36,000 → $5,036,000                        │
│   totalStaked: $36,000 (User 11's funds NOT staked yet)      │
│   stakeableBalance: $5,000,000                                │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ ORACLE WORKFLOW: Update Indices BEFORE Staking                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ Step 4B.1: Check if tier has existing stakes                  │
│   Oracle reads its database:                                  │
│   tierStakes[LOW_RISK].stakedAmount = 25,200 ✅ (exists)     │
│                                                                │
│ Step 4B.2: Read current protocol balance                      │
│   aUSDC.balanceOf(ProxifyAddress) → 25,326                   │
│   (Grew 0.5% in 15 days)                                      │
│                                                                │
│ Step 4B.3: Calculate growth rate                              │
│   growthRate = 25,326 / 25,200 = 1.005                       │
│                                                                │
│ Step 4B.4: Update index on-chain FIRST                        │
│   ProxifyController.updateTierIndex(                           │
│     USDC, LOW_RISK, 1.005e18                                  │
│   )                                                            │
│   ✅ Index updated: 1.0 → 1.005                               │
│                                                                │
│ Why this is critical:                                          │
│   - User 1-10: Entered at 1.0, now earn 0.5% ✅               │
│   - User 11: Will enter at 1.005 (current index) ✅           │
│   - Future growth calculated from 25,200 + 3,500,000          │
│                                                                │
│ Step 4B.5: NOW stake User 11's funds                          │
│   ProxifyController.executeTransfer(                           │
│     USDC, AAVE_POOL, 3500000e6, LOW_RISK                     │
│   )                                                            │
│                                                                │
│ Step 4B.6: Update oracle records                              │
│   tierStakes[LOW_RISK] = {                                     │
│     stakedAmount: 25,200 + 3,500,000 = 3,525,200             │
│     lastBalance: 25,326 + 3,500,000 = 3,525,326              │
│     lastUpdated: Day 15                                        │
│   }                                                            │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ VERIFICATION: Why Order Matters                               │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ ❌ WRONG ORDER (stake first, update later):                   │
│   Day 15: Stake $3.5M directly                                │
│   Day 30: Read balance = $3,665,378 (total with growth)      │
│           Calculate: 3,665,378 / (25,200 + 3,500,000)        │
│                    = 3,665,378 / 3,525,200                    │
│                    = 1.0398                                    │
│   Problem: This mixes 15 days of growth on $25k with          │
│            0 days of growth on $3.5M!                         │
│   User 1-10 would get LESS yield than they earned ❌          │
│                                                                │
│ ✅ CORRECT ORDER (update first, then stake):                  │
│   Day 15: Update index: 25,326 / 25,200 = 1.005 ✅           │
│           Stake $3.5M                                          │
│           Record: staked = $3,525,200                         │
│   Day 30: Read balance = $3,665,378                           │
│           Calculate: 3,665,378 / 3,525,200 = 1.0398          │
│           New index = 1.005 * 1.0398 = 1.045 ✅               │
│   User 1-10: Earn full 4.5% over 30 days ✅                   │
│   User 11: Earns 3.98% over 15 days ✅                        │
│                                                                │
│ 🎯 Golden Rule: ALWAYS update index before staking new funds! │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 5: APY Growth (Time Passes)**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 5: PROTOCOLS EARN YIELD - INDICES GROW                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Time passes: 365 days                                          │
│ Protocols earn yield:                                          │
│   - Aave (LOW_RISK): 4% APY → $700 → $728                    │
│   - Compound (MODERATE_RISK): 5% APY → $200 → $210           │
│   - Curve (HIGH_RISK): 8% APY → $100 → $108                  │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 5.1 Oracle Reads Protocol Balances (OFF-CHAIN)                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Oracle must read actual balances from each DeFi protocol to   │
│ calculate how much the tier has grown.                        │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ LOW_RISK TIER (Aave Pool)                                     │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ Step 5.1.1: Get previous staked amount                        │
│   // This was recorded when oracle called executeTransfer()  │
│   previouslyStaked = 25,200 USDC                              │
│   (From Step 4.1 - we staked 25,200 to Aave)                 │
│                                                                │
│ Step 5.1.2: Read current protocol balance                     │
│   // Read Aave's accounting for our position                  │
│   aUSDC.balanceOf(ProxifyAddress)                             │
│   → 26,208 aUSDC  (4% APY growth after 1 year)               │
│                                                                │
│ Step 5.1.3: Calculate growth rate                             │
│   currentBalance = 26,208                                      │
│   previousBalance = 25,200                                     │
│   growthRate = currentBalance / previousBalance               │
│              = 26,208 / 25,200                                 │
│              = 1.04                                            │
│                                                                │
│ Step 5.1.4: Read old tier index                               │
│   oldIndex = Proxify.getTierIndex(USDC, LOW_RISK)            │
│            = 1e18  (1.0)                                       │
│                                                                │
│ Step 5.1.5: Calculate new tier index                          │
│   newIndex = oldIndex * growthRate                            │
│            = 1e18 * 1.04                                       │
│            = 1.04e18                                           │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ MODERATE_RISK TIER (Compound Pool)                            │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ Step 5.1.6: Get previous staked amount                        │
│   previouslyStaked = 7,200 USDC                               │
│   (From Step 4.2)                                              │
│                                                                │
│ Step 5.1.7: Read Compound balance                             │
│   // Compound uses exchange rate mechanism                    │
│   cUSDC.balanceOf(ProxifyAddress) → cTokens                   │
│   exchangeRate = cUSDC.exchangeRateStored()                   │
│   underlyingBalance = cTokens * exchangeRate / 1e18           │
│                     = 7,560 USDC  (5% APY)                    │
│                                                                │
│ Step 5.1.8: Calculate growth                                  │
│   growthRate = 7,560 / 7,200 = 1.05                          │
│   newIndex = 1e18 * 1.05 = 1.05e18                           │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ HIGH_RISK TIER (Curve Pool)                                   │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ Step 5.1.9: Get previous staked amount                        │
│   previouslyStaked = 3,600 USDC                               │
│   (From Step 4.3)                                              │
│                                                                │
│ Step 5.1.10: Read Curve LP position                           │
│   // Curve uses LP tokens                                     │
│   lpTokenBalance = CurveLP.balanceOf(ProxifyAddress)          │
│   virtualPrice = CurvePool.get_virtual_price()                │
│   underlyingBalance = lpTokenBalance * virtualPrice / 1e18    │
│                     = 3,888 USDC  (8% APY)                    │
│                                                                │
│ Step 5.1.11: Calculate growth                                 │
│   growthRate = 3,888 / 3,600 = 1.08                          │
│   newIndex = 1e18 * 1.08 = 1.08e18                           │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ MULTIPLE PROTOCOLS IN SAME TIER (Advanced Scenario)           │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ If LOW_RISK tier had BOTH Aave AND Compound:                 │
│                                                                │
│ Example:                                                       │
│   Aave: Staked 15,000 → Now 15,600 (4% growth)               │
│   Compound: Staked 10,200 → Now 10,710 (5% growth)           │
│                                                                │
│ Oracle calculates WEIGHTED AVERAGE growth:                    │
│   totalStaked = 15,000 + 10,200 = 25,200                     │
│   totalCurrent = 15,600 + 10,710 = 26,310                    │
│   growthRate = 26,310 / 25,200 = 1.044                       │
│   newIndex = 1e18 * 1.044 = 1.044e18                         │
│                                                                │
│ This ensures:                                                  │
│   ✅ Fair distribution across protocols                       │
│   ✅ Users earn proportionally regardless of which protocol   │
│   ✅ Oracle aggregates all LOW_RISK sources into 1 index     │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ VALIDATION: maxIndexGrowth Check                              │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ Before updating on-chain, oracle validates growth:            │
│                                                                │
│ For LOW_RISK:                                                  │
│   oldIndex = 1.0                                               │
│   newIndex = 1.04                                              │
│   maxAllowed = oldIndex * maxIndexGrowth                      │
│              = 1.0 * 5 = 5.0                                   │
│   Check: 1.04 <= 5.0? YES ✅                                   │
│                                                                │
│ For MODERATE_RISK:                                             │
│   Check: 1.05 <= 5.0? YES ✅                                   │
│                                                                │
│ For HIGH_RISK:                                                 │
│   Check: 1.08 <= 5.0? YES ✅                                   │
│                                                                │
│ If Oracle Bug Example:                                         │
│   newIndex = 100.0 (100× bug!)                                │
│   Check: 100.0 <= 5.0? NO ❌                                   │
│   → Transaction would REVERT, protecting users                │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ 🎯 Summary: Oracle's Index Calculation Workflow               │
│                                                                │
│ For each tier:                                                 │
│ 1️⃣  Track previousStaked amount (from executeTransfer)       │
│ 2️⃣  Read currentBalance from protocol(s)                      │
│ 3️⃣  Calculate: growthRate = current / previous               │
│ 4️⃣  Read oldIndex from Proxify contract                       │
│ 5️⃣  Calculate: newIndex = oldIndex * growthRate              │
│ 6️⃣  Validate: newIndex <= oldIndex * maxIndexGrowth          │
│ 7️⃣  Submit on-chain: batchUpdateTierIndices()                │
│                                                                │
│ This is why maxIndexGrowth = 5 is critical:                   │
│   - Normal daily updates: 1.0002× (tiny growth) ✅            │
│   - 1 month offline: 1.005× ✅                                 │
│   - 1 year offline: 1.08× ✅                                   │
│   - Oracle bug: 100× ❌ REJECTED!                              │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 5.2 Oracle Updates Tier Indices                               │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyController.batchUpdateTierIndices(                    │
│     token: USDC,                                               │
│     tierIds: [LOW_RISK, MODERATE_RISK, HIGH_RISK],           │
│     newIndices: [1.04e18, 1.05e18, 1.08e18]                  │
│   )                                                            │
│                                                                │
│ Internal Flow (for each tier):                                │
│   1. Validate token supported ✅                               │
│   2. Validate tier initialized ✅                              │
│   3. Validate newIndex >= currentIndex ✅                      │
│   4. Validate newIndex <= currentIndex * 2 ✅ (growth cap)     │
│   5. Update index                                              │
│                                                                │
│ State Changes:                                                 │
│   tierVaultIndices[LOW_RISK][USDC] = 1.04e18                 │
│   tierVaultIndexUpdatedAt[LOW_RISK][USDC] = block.timestamp  │
│                                                                │
│   tierVaultIndices[MODERATE_RISK][USDC] = 1.05e18            │
│   tierVaultIndexUpdatedAt[MODERATE_RISK][USDC] = timestamp   │
│                                                                │
│   tierVaultIndices[HIGH_RISK][USDC] = 1.08e18                │
│   tierVaultIndexUpdatedAt[HIGH_RISK][USDC] = timestamp       │
│                                                                │
│ Events Emitted:                                                │
│   ✅ TierIndexUpdated(USDC, LOW_RISK, 1e18, 1.04e18, ...)    │
│   ✅ TierIndexUpdated(USDC, MODERATE_RISK, 1e18, 1.05e18,...)│
│   ✅ TierIndexUpdated(USDC, HIGH_RISK, 1e18, 1.08e18, ...)   │
│   ✅ BatchTierIndicesUpdated(USDC, 3, timestamp)              │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 5.3 Verify User Value After Growth                            │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Getters to Verify:                                             │
│                                                                │
│ getTierIndex(USDC, LOW_RISK) → 1.04e18                       │
│ getTierIndex(USDC, MODERATE_RISK) → 1.05e18                  │
│ getTierIndex(USDC, HIGH_RISK) → 1.08e18                      │
│                                                                │
│ getTierValue(BITKUB, USER_123, LOW_RISK, USDC)               │
│   → (700e6 * 1.04e18) / 1e18 = 728e6  ($728) ✅              │
│                                                                │
│ getTierValue(BITKUB, USER_123, MODERATE_RISK, USDC)          │
│   → (200e6 * 1.05e18) / 1e18 = 210e6  ($210) ✅              │
│                                                                │
│ getTierValue(BITKUB, USER_123, HIGH_RISK, USDC)              │
│   → (100e6 * 1.08e18) / 1e18 = 108e6  ($108) ✅              │
│                                                                │
│ getTotalValue(BITKUB, USER_123, USDC)                         │
│   → 728e6 + 210e6 + 108e6 = 1046e6  ($1,046) ✅              │
│                                                                │
│ getAccruedYield(BITKUB, USER_123, USDC)                       │
│   → 1046e6 - 1000e6 = 46e6  ($46 yield) ✅                   │
│                                                                │
│ getUserAccountSummary(BITKUB, USER_123, USDC)                 │
│   → {                                                          │
│       totalBalance: 1000e6,                                    │
│       totalValue: 1046e6,                                      │
│       accruedYield: 46e6,                                      │
│       activeTierCount: 3                                       │
│     }                                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 6: User Withdrawal Request**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 6: USER WITHDRAWS $500 (+ Yield)                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ User requests: Withdraw $500                                   │
│ Current total value: $1,046                                    │
│ Withdrawal percentage: 500 / 1046 ≈ 47.8%                     │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 6.1 Oracle Calculates Withdrawal (OFF-CHAIN)                  │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Step 6.1.1: Read on-chain data                                │
│   activeTiers = getUserActiveTiers(BITKUB, USER_123, USDC)   │
│     → [LOW_RISK, MODERATE_RISK, HIGH_RISK]                   │
│                                                                │
│   For each tier, read account:                                │
│   LOW_RISK: { balance: 700e6, entryIndex: 1e18 }             │
│   MODERATE_RISK: { balance: 200e6, entryIndex: 1e18 }        │
│   HIGH_RISK: { balance: 100e6, entryIndex: 1e18 }            │
│                                                                │
│   Read current indices:                                        │
│   LOW_RISK: 1.04e18                                           │
│   MODERATE_RISK: 1.05e18                                      │
│   HIGH_RISK: 1.08e18                                          │
│                                                                │
│ Step 6.1.2: Calculate current values                          │
│   lowValue = (700e6 * 1.04e18) / 1e18 = 728e6                │
│   moderateValue = (200e6 * 1.05e18) / 1e18 = 210e6           │
│   highValue = (100e6 * 1.08e18) / 1e18 = 108e6               │
│   totalValue = 1046e6                                          │
│                                                                │
│ Step 6.1.3: Calculate proportional reductions                 │
│   User deposited: 1000e6                                       │
│   User requests withdrawal: 500e6                              │
│   Withdrawal ratio: 500 / 1000 = 50% ✅                       │
│                                                                │
│   Calculate balance reductions per tier (50% of each):        │
│   lowBalanceReduction = 700e6 * 0.50 = 350e6                 │
│   moderateBalanceReduction = 200e6 * 0.50 = 100e6            │
│   highBalanceReduction = 100e6 * 0.50 = 50e6                 │
│   Total balance reduction: 350 + 100 + 50 = 500e6 ✅         │
│                                                                │
│   Calculate actual token amounts (with current indices):      │
│   lowTokens = (350e6 * 1.04e18) / 1e18 = 364e6               │
│   moderateTokens = (100e6 * 1.05e18) / 1e18 = 105e6          │
│   highTokens = (50e6 * 1.08e18) / 1e18 = 54e6                │
│   Total tokens withdrawn: 364 + 105 + 54 = 523e6             │
│                                                                │
│ Step 6.1.4: Calculate yield and fees                          │
│   Principal withdrawn: 500e6 (50% of 1000e6 deposit)         │
│   Total value withdrawn: 523e6                                 │
│   Yield withdrawn: 523e6 - 500e6 = 23e6 ✅                   │
│                                                                │
│   (Note: Total yield was 46e6, withdrawing 50% = 23e6)       │
│                                                                │
│   Service fee calculation:                                    │
│     serviceFee = 23e6 * 0.20 = 4.6e6  (20% of yield)        │
│                                                                │
│   Fee distribution (read from ClientRegistry):               │
│     clientFeeBps = 500  (5% to client)                       │
│     clientShare = 4.6e6 * 500 / 10000 = 0.23e6              │
│     protocolShare = 4.6e6 - 0.23e6 = 4.37e6                 │
│                                                                │
│   Gas fee (operational):                                      │
│     gasFeeShare = 5e6  ($5 per user for this example)       │
│                                                                │
│   Final calculation:                                          │
│     grossAmount = 523e6  (principal + yield)                 │
│     serviceFee = 4.6e6                                        │
│     gasFeeShare = 5e6                                         │
│     netAmount = 523e6 - 4.6e6 - 5e6 = 513.4e6               │
│                                                                │
│   Verification:                                                │
│     User receives: 513.4 USDC                                 │
│     = Principal (500) + Yield (23) - Service (4.6) - Gas (5) │
│     = 513.4 ✅                                                 │
│                                                                │
│ Step 6.1.5: Build withdrawal execution                        │
│   execution = WithdrawalExecution {                            │
│     clientId: BITKUB,                                          │
│     userId: USER_123,                                          │
│     token: USDC,                                               │
│     to: userAddress,                                           │
│     tierIds: [LOW_RISK, MODERATE_RISK, HIGH_RISK],           │
│     tierReductions: [350e6, 100e6, 50e6],  ✅ 50% of each    │
│     grossAmount: 523e6,  // Principal (500) + Yield (23)     │
│     serviceFee: 4.6e6,   // 20% of 23 yield                  │
│     gasFeeShare: 5e6,    // Operational cost                  │
│     netAmount: 513.4e6   // User receives this               │
│   }                                                            │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 6.2 Oracle Executes Batch Withdrawal (ON-CHAIN)               │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Function:                                                      │
│   ProxifyController.batchWithdraw(                             │
│     executions: [execution]  // Array of 1 (or up to 100)    │
│   )                                                            │
│                                                                │
│ This calls:                                                    │
│   Proxify.batchWithdraw([execution])                          │
│                                                                │
│ Internal Flow:                                                 │
│                                                                │
│ Step 6.2.1: Validate arrays                                   │
│   ✅ tierIds.length == tierReductions.length (3 == 3)         │
│   ✅ gasFeeShare <= MAX_GAS_FEE_PER_USER ($100)               │
│   ✅ token is supported                                        │
│                                                                │
│ Step 6.2.2: Validate and reduce tier balances                 │
│                                                                │
│   For LOW_RISK tier:                                           │
│   account = accounts[BITKUB][USER_123][LOW_RISK][USDC]        │
│   require(account.balance >= 350e6)  ✅ (700e6 >= 350e6)      │
│   account.balance -= 350e6                                     │
│   account.balance is now: 350e6  (50% remaining)              │
│                                                                │
│   For MODERATE_RISK tier:                                      │
│   account.balance -= 100e6                                     │
│   account.balance is now: 100e6  (50% remaining)              │
│                                                                │
│   For HIGH_RISK tier:                                          │
│   account.balance -= 50e6                                      │
│   account.balance is now: 50e6  (50% remaining)               │
│                                                                │
│ Step 6.2.3: Update global state                               │
│   totalDeposits[USDC] -= (350e6 + 100e6 + 50e6)              │
│   totalDeposits[USDC] -= 500e6  (50% withdrawn)              │
│   totalDeposits[USDC] is now: 500e6  (50% remaining)         │
│                                                                │
│ Step 6.2.4: Distribute fees                                   │
│   Read clientFeeBps from ClientRegistry:                      │
│     clientInfo = clientRegistry.getClientInfo(BITKUB)         │
│     clientFeeBps = 500  (5% to client)                        │
│                                                                │
│   Calculate fee split:                                        │
│     serviceFee = 4.6e6  (20% of 23 yield)                    │
│     clientShare = 4.6e6 * 500 / 10000 = 0.23e6               │
│     protocolShare = 4.6e6 - 0.23e6 = 4.37e6                  │
│                                     a                           │
│   Distribute:                                                  │
│     protocolRevenueVault[USDC] += 4.37e6                      │
│     clientRevenueVault[BITKUB][USDC] += 0.23e6               │
│     totalClientRevenues[USDC] += 0.23e6                       │
│     operationFeeVault[USDC] += 5e6                            │
│                                                                │
│ Step 6.2.5: Transfer to user                                  │
│   USDC.transfer(userAddress, 513.4e6)                         │
│                                                                │
│ Events Emitted:                                                │
│   ✅ WithdrawnWithFee(                                         │
│       BITKUB, USER_123, USDC,                                 │
│       523e6, 4.6e6, 5e6, 513.4e6,                            │
│       timestamp                                                │
│     )                                                          │
│   ✅ Withdrawn(                                                │
│       BITKUB, USER_123, USDC,                                 │
│       513.4e6, userAddress, timestamp                         │
│     )                                                          │
│   ✅ BatchWithdrawalExecuted(                                  │
│       batchId, USDC, 1,                                        │
│       513.4e6, 4.6e6, 5e6,                                    │
│       timestamp                                                │
│     )                                                          │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ 6.3 Verify State After Withdrawal                             │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ Getters to Verify:                                             │
│                                                                │
│ getAccount(BITKUB, USER_123, LOW_RISK, USDC)                 │
│   → { balance: 365e6, entryIndex: 1e18, depositedAt: ... }   │
│                                                                │
│ getAccount(BITKUB, USER_123, MODERATE_RISK, USDC)            │
│   → { balance: 104e6, entryIndex: 1e18, depositedAt: ... }   │
│                                                                │
│ getAccount(BITKUB, USER_123, HIGH_RISK, USDC)                │
│   → { balance: 51e6, entryIndex: 1e18, depositedAt: ... }    │
│                                                                │
│ getTierValue(BITKUB, USER_123, LOW_RISK, USDC)               │
│   → (365e6 * 1.04e18) / 1e18 = 379.6e6                       │
│                                                                │
│ getTierValue(BITKUB, USER_123, MODERATE_RISK, USDC)          │
│   → (104e6 * 1.05e18) / 1e18 = 109.2e6                       │
│                                                                │
│ getTierValue(BITKUB, USER_123, HIGH_RISK, USDC)              │
│   → (51e6 * 1.08e18) / 1e18 = 55.08e6                        │
│                                                                │
│ getTotalValue(BITKUB, USER_123, USDC)                         │
│   → 379.6 + 109.2 + 55.08 = 543.88e6  ≈ $544                 │
│   (Started with $1,046, withdrew ~$500, remaining ~$544) ✅   │
│                                                                │
│ getAccruedYield(BITKUB, USER_123, USDC)                       │
│   → 543.88e6 - 520e6 = 23.88e6  ≈ $24 remaining yield       │
│                                                                │
│ Fee vault balances:                                            │
│   getProtocolRevenueBalance(USDC) → 4.18e6                    │
│   getClientRevenueBalance(BITKUB, USDC) → 0.22e6             │
│   getOperationFeeBalance(USDC) → 1.5e6                       │
│                                                                │
│ Global state:                                                  │
│   getTotalDeposits(USDC) → 520e6                              │
│   getTotalStaked(USDC) → 1000e6 (unchanged, still in protocols)│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **STEP 7: API Response - User-Facing Performance**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 7: API CALCULATES NET APY FOR USER DISPLAY               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Users see NET performance after service fee deduction.        │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ BACKEND API CALCULATION                                        │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ Step 7.1: Read vault indices from contract                    │
│   const indices = await proxify.getTierIndices(USDC, [        │
│     LOW_RISK, MODERATE_RISK, HIGH_RISK                        │
│   ]);                                                          │
│   → [1.04e18, 1.05e18, 1.08e18]                               │
│                                                                │
│ Step 7.2: Read user accounts                                  │
│   lowAccount = await proxify.getAccount(                      │
│     BITKUB, USER_123, LOW_RISK, USDC                          │
│   );                                                           │
│   → { balance: 700e6, entryIndex: 1e18, depositedAt: T0 }    │
│                                                                │
│   moderateAccount = await proxify.getAccount(                 │
│     BITKUB, USER_123, MODERATE_RISK, USDC                     │
│   );                                                           │
│   → { balance: 200e6, entryIndex: 1e18, depositedAt: T0 }    │
│                                                                │
│   highAccount = await proxify.getAccount(                     │
│     BITKUB, USER_123, HIGH_RISK, USDC                         │
│   );                                                           │
│   → { balance: 100e6, entryIndex: 1e18, depositedAt: T0 }    │
│                                                                │
│ Step 7.3: Calculate per-tier performance                      │
│                                                                │
│   LOW_RISK Tier:                                               │
│   ─────────────────────────────────────────────────────       │
│   currentValue = (700e6 × 1.04e18) / 1e18 = 728e6            │
│   grossYield = 728e6 - 700e6 = 28e6                          │
│   daysElapsed = (now - T0) / 86400 = 365 days                │
│   grossAPY = (28 / 700) × (365 / 365) = 4.0%                 │
│                                                                │
│   ✅ NET APY (what user sees):                                │
│   netAPY = 4.0% × 0.8 = 3.2%                                  │
│   netYield = 28e6 × 0.8 = 22.4e6                              │
│   serviceFeeDeducted = 28e6 × 0.2 = 5.6e6                    │
│                                                                │
│   MODERATE_RISK Tier:                                          │
│   ─────────────────────────────────────────────────────       │
│   currentValue = (200e6 × 1.05e18) / 1e18 = 210e6            │
│   grossYield = 210e6 - 200e6 = 10e6                          │
│   grossAPY = (10 / 200) = 5.0%                                │
│                                                                │
│   ✅ NET APY:                                                  │
│   netAPY = 5.0% × 0.8 = 4.0%                                  │
│   netYield = 10e6 × 0.8 = 8e6                                 │
│   serviceFeeDeducted = 10e6 × 0.2 = 2e6                      │
│                                                                │
│   HIGH_RISK Tier:                                              │
│   ─────────────────────────────────────────────────────       │
│   currentValue = (100e6 × 1.08e18) / 1e18 = 108e6            │
│   grossYield = 108e6 - 100e6 = 8e6                           │
│   grossAPY = (8 / 100) = 8.0%                                 │
│                                                                │
│   ✅ NET APY:                                                  │
│   netAPY = 8.0% × 0.8 = 6.4%                                  │
│   netYield = 8e6 × 0.8 = 6.4e6                                │
│   serviceFeeDeducted = 8e6 × 0.2 = 1.6e6                     │
│                                                                │
│ Step 7.4: Calculate blended performance                       │
│   totalDeposit = 700 + 200 + 100 = 1000e6                    │
│   totalCurrentValue = 728 + 210 + 108 = 1046e6               │
│   totalGrossYield = 28 + 10 + 8 = 46e6                       │
│   totalServiceFee = 46e6 × 0.2 = 9.2e6                       │
│   totalNetYield = 46e6 × 0.8 = 36.8e6                        │
│                                                                │
│   blendedGrossAPY = 46 / 1000 = 4.6%                         │
│   ✅ blendedNetAPY = 4.6% × 0.8 = 3.68%                       │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ API JSON RESPONSE                                              │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ GET /api/users/USER_123/performance?token=USDC                │
│                                                                │
│ Response:                                                      │
│ {                                                              │
│   "userId": "USER_123",                                        │
│   "clientId": "BITKUB",                                        │
│   "token": "USDC",                                             │
│   "totalDeposited": 1000.00,                                   │
│   "currentValue": 1046.00,                                     │
│   "grossYield": 46.00,                                         │
│   "netYield": 36.80,                                           │
│   "serviceFeeDeducted": 9.20,                                  │
│   "serviceFeeRate": "20%",                                     │
│   "blendedGrossAPY": "4.60%",                                  │
│   "blendedNetAPY": "3.68%",  ✅ User sees this                │
│   "daysElapsed": 365,                                          │
│   "tiers": [                                                   │
│     {                                                          │
│       "tierId": "LOW_RISK",                                    │
│       "tierName": "Low Risk - Aave",                           │
│       "allocation": "70%",                                     │
│       "deposited": 700.00,                                     │
│       "currentValue": 728.00,                                  │
│       "grossYield": 28.00,                                     │
│       "netYield": 22.40,  ✅                                   │
│       "serviceFeeDeducted": 5.60,                              │
│       "grossAPY": "4.00%",                                     │
│       "netAPY": "3.20%",  ✅ User sees this                    │
│       "protocol": "Aave V3"                                    │
│     },                                                         │
│     {                                                          │
│       "tierId": "MODERATE_RISK",                               │
│       "tierName": "Moderate Risk - Compound",                  │
│       "allocation": "20%",                                     │
│       "deposited": 200.00,                                     │
│       "currentValue": 210.00,                                  │
│       "grossYield": 10.00,                                     │
│       "netYield": 8.00,  ✅                                    │
│       "serviceFeeDeducted": 2.00,                              │
│       "grossAPY": "5.00%",                                     │
│       "netAPY": "4.00%",  ✅                                   │
│       "protocol": "Compound V3"                                │
│     },                                                         │
│     {                                                          │
│       "tierId": "HIGH_RISK",                                   │
│       "tierName": "High Risk - Curve",                         │
│       "allocation": "10%",                                     │
│       "deposited": 100.00,                                     │
│       "currentValue": 108.00,                                  │
│       "grossYield": 8.00,                                      │
│       "netYield": 6.40,  ✅                                    │
│       "serviceFeeDeducted": 1.60,                              │
│       "grossAPY": "8.00%",                                     │
│       "netAPY": "6.40%",  ✅                                   │
│       "protocol": "Curve Tricrypto"                            │
│     }                                                          │
│   ]                                                            │
│ }                                                              │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ USER DASHBOARD DISPLAY                                         │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ ┌───────────────────────────────────────────────────────┐     │
│ │ YOUR PORTFOLIO PERFORMANCE                            │     │
│ ├───────────────────────────────────────────────────────┤     │
│ │ Total Deposited:        $1,000.00                     │     │
│ │ Current Value:          $1,046.00                     │     │
│ │ Gross Yield:            $46.00                        │     │
│ │ Service Fee (20%):      -$9.20                        │     │
│ │ Net Yield:              $36.80  ✅                    │     │
│ │                                                       │     │
│ │ Your Net APY:           3.68%   ✅                    │     │
│ │ (After 20% service fee)                               │     │
│ │                                                       │     │
│ │ Time Period:            365 days                      │     │
│ └───────────────────────────────────────────────────────┘     │
│                                                                │
│ ┌───────────────────────────────────────────────────────┐     │
│ │ TIER BREAKDOWN                                        │     │
│ ├───────────────────────────────────────────────────────┤     │
│ │                                                       │     │
│ │ 🟢 LOW RISK (70% - Aave V3)                          │     │
│ │   Deposited:     $700.00                              │     │
│ │   Current Value: $728.00                              │     │
│ │   Net APY:       3.2%   ✅ (Gross: 4.0%)             │     │
│ │   Gross Yield:   $28.00                               │     │
│ │   Service Fee:   -$5.60                               │     │
│ │   Net Yield:     $22.40 ✅                            │     │
│ │                                                       │     │
│ │ 🟡 MODERATE RISK (20% - Compound V3)                 │     │
│ │   Deposited:     $200.00                              │     │
│ │   Current Value: $210.00                              │     │
│ │   Net APY:       4.0%   ✅ (Gross: 5.0%)             │     │
│ │   Gross Yield:   $10.00                               │     │
│ │   Service Fee:   -$2.00                               │     │
│ │   Net Yield:     $8.00  ✅                            │     │
│ │                                                       │     │
│ │ 🔴 HIGH RISK (10% - Curve Tricrypto)                 │     │
│ │   Deposited:     $100.00                              │     │
│ │   Current Value: $108.00                              │     │
│ │   Net APY:       6.4%   ✅ (Gross: 8.0%)             │     │
│ │   Gross Yield:   $8.00                                │     │
│ │   Service Fee:   -$1.60                               │     │
│ │   Net Yield:     $6.40  ✅                            │     │
│ │                                                       │     │
│ └───────────────────────────────────────────────────────┘     │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│ TYPESCRIPT API IMPLEMENTATION                                  │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ // backend/src/services/performanceService.ts                 │
│                                                                │
│ interface TierPerformance {                                    │
│   tierId: string;                                              │
│   tierName: string;                                            │
│   allocation: string;                                          │
│   deposited: number;                                           │
│   currentValue: number;                                        │
│   grossYield: number;                                          │
│   netYield: number;                                            │
│   serviceFeeDeducted: number;                                  │
│   grossAPY: string;                                            │
│   netAPY: string;  // ✅ Gross APY × 0.8                      │
│   protocol: string;                                            │
│ }                                                              │
│                                                                │
│ async function getUserPerformance(                             │
│   userId: string,                                              │
│   clientId: string,                                            │
│   token: string                                                │
│ ): Promise<UserPerformance> {                                  │
│                                                                │
│   // 1. Get user's active tiers                               │
│   const activeTiers = await proxify.getUserActiveTiers(       │
│     clientId, userId, token                                    │
│   );                                                           │
│                                                                │
│   // 2. Read tier indices                                     │
│   const indices = await proxify.getTierIndicesWithTimestamp(  │
│     token, activeTiers                                         │
│   );                                                           │
│                                                                │
│   // 3. Calculate per-tier performance                        │
│   const tiers: TierPerformance[] = [];                        │
│   let totalDeposited = 0;                                      │
│   let totalGrossYield = 0;                                     │
│                                                                │
│   for (const tierId of activeTiers) {                         │
│     // Read account                                            │
│     const account = await proxify.getAccount(                 │
│       clientId, userId, tierId, token                          │
│     );                                                         │
│                                                                │
│     // Get tier info                                           │
│     const tierInfo = await clientRegistry.getClientRiskTier(  │
│       clientId, tierId                                         │
│     );                                                         │
│                                                                │
│     // Calculate current value                                │
│     const balance = parseFloat(                               │
│       ethers.utils.formatUnits(account.balance, 6)            │
│     );                                                         │
│     const entryIndex = parseFloat(                            │
│       ethers.utils.formatEther(account.entryIndex)            │
│     );                                                         │
│     const currentIndex = parseFloat(                          │
│       ethers.utils.formatEther(indices[tierId].index)         │
│     );                                                         │
│                                                                │
│     const currentValue = balance * (currentIndex / entryIndex);│
│     const grossYield = currentValue - balance;                │
│                                                                │
│     // Calculate APY                                           │
│     const depositTimestamp = account.depositedAt.toNumber();  │
│     const currentTimestamp = Math.floor(Date.now() / 1000);   │
│     const daysElapsed = (currentTimestamp - depositTimestamp) │
│                         / 86400;                               │
│     const grossAPY = (grossYield / balance) *                 │
│                      (365 / daysElapsed);                      │
│                                                                │
│     // ✅ Calculate NET APY (what user sees)                  │
│     const SERVICE_FEE_RATE = 0.20;  // 20%                    │
│     const netAPY = grossAPY * (1 - SERVICE_FEE_RATE);         │
│     const netYield = grossYield * (1 - SERVICE_FEE_RATE);     │
│     const serviceFeeDeducted = grossYield * SERVICE_FEE_RATE; │
│                                                                │
│     tiers.push({                                               │
│       tierId,                                                  │
│       tierName: tierInfo.name,                                 │
│       allocation: `${tierInfo.allocationBps / 100}%`,         │
│       deposited: balance,                                      │
│       currentValue,                                            │
│       grossYield,                                              │
│       netYield,  // ✅                                         │
│       serviceFeeDeducted,                                      │
│       grossAPY: `${(grossAPY * 100).toFixed(2)}%`,            │
│       netAPY: `${(netAPY * 100).toFixed(2)}%`,  // ✅         │
│       protocol: tierInfo.protocol                              │
│     });                                                        │
│                                                                │
│     totalDeposited += balance;                                 │
│     totalGrossYield += grossYield;                             │
│   }                                                            │
│                                                                │
│   // 4. Calculate blended performance                         │
│   const totalCurrentValue = totalDeposited + totalGrossYield; │
│   const totalServiceFee = totalGrossYield * SERVICE_FEE_RATE; │
│   const totalNetYield = totalGrossYield * (1 - SERVICE_FEE_RATE);│
│   const blendedGrossAPY = totalGrossYield / totalDeposited;   │
│   const blendedNetAPY = blendedGrossAPY * (1 - SERVICE_FEE_RATE);│
│                                                                │
│   return {                                                     │
│     userId,                                                    │
│     clientId,                                                  │
│     token,                                                     │
│     totalDeposited,                                            │
│     currentValue: totalCurrentValue,                           │
│     grossYield: totalGrossYield,                               │
│     netYield: totalNetYield,  // ✅                            │
│     serviceFeeDeducted: totalServiceFee,                       │
│     serviceFeeRate: `${SERVICE_FEE_RATE * 100}%`,             │
│     blendedGrossAPY: `${(blendedGrossAPY * 100).toFixed(2)}%`,│
│     blendedNetAPY: `${(blendedNetAPY * 100).toFixed(2)}%`, // ✅│
│     daysElapsed,                                               │
│     tiers                                                      │
│   };                                                           │
│ }                                                              │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ 🎯 KEY POINTS:                                                 │
│                                                                │
│ 1️⃣  Oracle reads GROSS performance from protocols             │
│    (actual balances without fee deduction)                    │
│                                                                │
│ 2️⃣  Contract stores GROSS indices (no fee applied)            │
│    tierIndices = [1.04, 1.05, 1.08]                           │
│                                                                │
│ 3️⃣  API calculates NET performance for user display:          │
│    netAPY = grossAPY × 0.8  (after 20% service fee)           │
│                                                                │
│ 4️⃣  User sees ONLY net performance in dashboard:              │
│    "Your APY: 3.68%" (not "Your APY: 4.6% minus 20%")        │
│                                                                │
│ 5️⃣  Service fee is charged ONLY on withdrawal:                │
│    - While funds staked: User earns GROSS (4.6%)              │
│    - On withdrawal: 20% fee deducted from yield               │
│    - User receives: Principal + (Yield × 0.8)                 │
│                                                                │
│ 6️⃣  Client revenue share (5% of service fee) is internal:     │
│    - User pays: 20% of yield = $9.20                          │
│    - Protocol gets: $9.20 × 0.95 = $8.74                      │
│    - Client gets: $9.20 × 0.05 = $0.46                        │
│    - User doesn't see this split, only total 20% fee          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## All Methods Reference

### **ProxifyClientRegistry**

**Admin Functions:**
```solidity
registerClient(clientId, clientAddress, name, feeBps, serviceFeeBps)
activateClient(clientId)
deactivateClient(clientId)
updateClientAddress(clientId, newAddress)
updateClientFees(clientId, feeBps, serviceFeeBps)
setClientRiskTiers(clientId, riskTiers[])
addClientRiskTier(clientId, tier)
updateTierAllocation(clientId, tierId, newAllocationBps)
setTierActive(clientId, tierId, isActive)
```

**View Functions:**
```solidity
isClientActive(clientId) → bool
isClientRegistered(clientId) → bool
getClientInfo(clientId) → ClientInfo
getClientAddress(clientId) → address
getClientRiskTiers(clientId) → RiskTier[]
getClientRiskTier(clientId, tierId) → RiskTier
hasTier(clientId, tierId) → bool
validateTierAllocations(tiers[]) → bool
```

### **Proxify (Core Vault)**

**User Functions:**
```solidity
deposit(clientId, userId, token, amount, from)
depositFrom(clientId, userId, token, amount)
```

**Controller Functions:**
```solidity
batchWithdraw(executions[])
withdraw(clientId, userId, token, tierIds[], tierReductions[], to)
updateTierIndex(token, tierId, newIndex)
batchUpdateTierIndices(token, tierIds[], newIndices[])
initializeTier(token, tierId)
addSupportedToken(token)
removeSupportedToken(token)
updateStaked(token, amount, isStaking)
claimOperationFee(token, to, amount)
claimProtocolRevenue(token, to, amount)
claimClientRevenue(clientId, token, to, amount)
```

**View Functions:**
```solidity
getAccount(clientId, userId, tierId, token) → Account
getUserActiveTiers(clientId, userId, token) → bytes32[]
getTotalValue(clientId, userId, token) → uint256
getTierValue(clientId, userId, tierId, token) → uint256
getAccruedYield(clientId, userId, token) → uint256
getUserAccountSummary(clientId, userId, token) → (totalBalance, totalValue, yield, tierCount)
getTierIndex(token, tierId) → uint256
getTierIndexWithTimestamp(token, tierId) → (index, updatedAt)
isTierInitialized(token, tierId) → bool
getTotalDeposits(token) → uint256
getTotalStaked(token) → uint256
isSupportedToken(token) → bool
getContractBalance(token) → uint256
getStakeableBalance(token) → uint256
getOperationFeeBalance(token) → uint256
getProtocolRevenueBalance(token) → uint256
getClientRevenueBalance(clientId, token) → uint256
getTotalClientRevenues(token) → uint256
```

### **ProxifyController**

**Oracle Functions:**
```solidity
executeTransfer(token, protocol, amount, tierId, tierName)
confirmUnstake(token, amount)
updateTierIndex(token, tierId, newIndex)
batchUpdateTierIndices(token, tierIds[], newIndices[])
batchWithdraw(executions[]) → batchId
claimOperationFee(token, to, amount)
claimClientRevenue(clientId, token, to, amount)
```

**Admin Functions:**
```solidity
initializeTier(token, tierId)
batchInitializeTiers(token, tierIds[])
assignProtocolToTier(tierId, protocol)
removeProtocolFromTier(tierId, protocol)
addWhitelistedProtocol(protocol)
removeWhitelistedProtocol(protocol)
addSupportedToken(token)
removeSupportedToken(token)
claimProtocolRevenue(token, to, amount)
unpause()
```

**Guardian Functions:**
```solidity
emergencyPause()
```

**View Functions:**
```solidity
getTierProtocols(tierId) → address[]
isProtocolWhitelisted(protocol) → bool
isTokenSupported(token) → bool
isPaused() → bool
getOperationFeeBalance(token) → uint256
getProtocolRevenueBalance(token) → uint256
getClientRevenueBalance(clientId, token) → uint256
```

---

## Test Scenarios

### **Test Suite Structure**

```
test/
├── ProxifyClientRegistry.test.ts
│   ├── Deployment
│   ├── Client Registration
│   ├── Client Management (activate/deactivate/update)
│   ├── Risk Tier Management
│   ├── Tier Validation
│   └── Edge Cases
│
├── Proxify.test.ts
│   ├── Deployment & Initialization
│   ├── Deposit Flow
│   ├── Weighted Entry Index
│   ├── Tier Value Calculations
│   ├── Active Tiers Tracking
│   └── View Functions
│
├── Proxify.BatchWithdrawal.test.ts
│   ├── Single User Withdrawal
│   ├── Batch Withdrawal (10 users)
│   ├── Batch Withdrawal (100 users)
│   ├── Fee Distribution
│   ├── Gas Benchmarking
│   └── Edge Cases
│
├── ProxifyController.test.ts
│   ├── Deployment
│   ├── Protocol Management
│   ├── Token Management
│   ├── Execute Transfer with Tier Tracking
│   ├── Tier Index Updates
│   ├── Emergency Pause
│   └── Role-Based Access
│
└── Integration.test.ts
    ├── Full Deposit → Stake → Yield → Withdraw Cycle
    ├── Multi-Client Scenarios
    ├── Client Tier Reconfiguration
    ├── Multiple Deposits with Weighted Index
    └── Complete User Lifecycle
```

---

**END OF VISUALIZATION**

Next: Rename all V2 contracts to "Proxify" and create comprehensive test suite!
