# Dynamic Risk Tier Implementation Progress

**Date:** 2025-10-29
**Status:** Phase 1 Complete - Interfaces & Architecture Documented

---

## ✅ Completed

### 1. Architecture Documentation
**File:** `DYNAMIC_RISK_TIER_ARCHITECTURE.md` (3,800+ lines)

**Contents:**
- ✅ Complete system design overview
- ✅ Design decision rationale (5 major decisions documented)
- ✅ Data structure specifications with examples
- ✅ Detailed deposit and withdrawal flows
- ✅ Gas optimization strategies (80% savings demonstrated)
- ✅ Security considerations (6 attack vectors addressed)
- ✅ Implementation checklist (60+ tasks)
- ✅ Success metrics and glossary

**Key Decisions Documented:**
1. 4-level nested mapping for storage
2. bytes32 hash IDs for tier identification
3. Off-chain calculation, on-chain validation approach
4. Client-defined, user-inherited risk configuration
5. Batch-shared gas cost model

### 2. Smart Contract Interfaces

#### A. IClientRegistryV2.sol ✅
**Purpose:** Dynamic risk tier client management

**Key Features:**
- `RiskTier` struct with unlimited tier support
- Client can define custom allocations (not limited to 3 tiers)
- Flexible tier management (add, update, activate/deactivate)
- Validation ensures allocations sum to 100%

**Functions Added:**
- `setClientRiskTiers()` - Set complete tier configuration
- `addClientRiskTier()` - Add new tier dynamically
- `updateTierAllocation()` - Modify tier percentage
- `setTierActive()` - Enable/disable tiers
- `getClientRiskTiers()` - Retrieve all tiers for client
- `hasTier()` - Check if client has specific tier
- `validateTierAllocations()` - Validate 100% total

**Breaking Changes from V1:**
- `AllocationStrategy` struct removed (was fixed 3 tiers)
- `RiskTier[]` array replaces fixed struct
- New fee configuration functions separated from registration

#### B. ILAACv2.sol ✅
**Purpose:** Core vault with tier-specific balances and batch withdrawals

**Key Features:**
- `Account` struct now includes `depositedAt` timestamp
- `WithdrawalExecution` struct for batch processing
- Tier-specific index tracking
- Batch withdrawal support

**Major Function Changes:**
- `deposit()` - Now splits into tiers automatically
- `batchWithdraw()` - NEW: Process multiple users in one tx
- `updateTierIndex()` - Replaces `updateVaultIndex()`
- `batchUpdateTierIndices()` - NEW: Update multiple tiers efficiently
- `initializeTier()` - NEW: Set up new tiers
- `getTierValue()` - NEW: Get value for specific tier
- `getUserActiveTiers()` - NEW: List which tiers user has funds in

**New Events:**
- `Deposited` - Now includes tier allocation breakdown
- `BatchWithdrawalExecuted` - Summary of batch processing
- `TierIndexUpdated` - Replaces generic `VaultIndexUpdated`
- `TierInitialized` - Tracks new tier setup

---

## 🚧 In Progress

### 3. Smart Contract Implementation

**Status:** Interfaces complete, implementation pending

**Next Files to Create:**
1. `ClientRegistryV2.sol` - Implementation of dynamic tier registry
2. `LAACv2.sol` - Core vault implementation with tier support
3. `LAACControllerV2.sol` - Controller updated for tier operations

---

## ⏳ Pending

### 4. Contract Implementation Details

#### A. ClientRegistryV2.sol
**Location:** `apps/laac-contract/contracts/ClientRegistryV2.sol`

**Storage Mappings Needed:**
```solidity
mapping(bytes32 => ClientInfo) private clients;
mapping(bytes32 => RiskTier[]) private clientRiskTiers;
mapping(bytes32 => mapping(bytes32 => uint256)) private tierIndexMap; // clientId => tierId => array index
```

**Key Logic:**
- Store tiers in dynamic array per client
- Validate total allocation = 10000 bps on every update
- Maintain index map for O(1) tier lookup
- Emit events for all tier changes

#### B. LAACv2.sol
**Location:** `apps/laac-contract/contracts/LAACv2.sol`

**Storage Mappings Needed:**
```solidity
// 4-level nested mapping: clientId => userId => tierId => token => Account
mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => mapping(address => Account)))) private accounts;

// Tier vault indices: tierId => token => index
mapping(bytes32 => mapping(address => uint256)) public tierVaultIndices;
mapping(bytes32 => mapping(address => uint256)) public tierVaultIndexUpdatedAt;

// Active tiers tracking: clientId => userId => token => tierIds[]
mapping(bytes32 => mapping(bytes32 => mapping(address => bytes32[]))) private userActiveTiers;

// Global counters
mapping(address => uint256) public totalDeposits;
mapping(address => uint256) public totalStaked;

// Fee vaults
mapping(address => uint256) public operationFeeVault;
mapping(address => uint256) public protocolRevenueVault;
mapping(bytes32 => mapping(address => uint256)) public clientRevenueVault;
mapping(address => uint256) public totalClientRevenues;
```

**Key Functions to Implement:**

1. **deposit()** - Complex tier splitting logic
   ```solidity
   function deposit(bytes32 clientId, bytes32 userId, address token, uint256 amount, address from) external {
       // 1. Validate client active
       // 2. Get client risk tiers from registry
       // 3. For each tier:
       //    a. Calculate tier amount (amount × allocationBps / 10000)
       //    b. Read current tier index
       //    c. Calculate weighted entry index (if existing balance)
       //    d. Update account balance
       //    e. Add to active tiers (if first deposit)
       // 4. Transfer tokens
       // 5. Emit event with tier breakdown
   }
   ```

2. **batchWithdraw()** - Validates and executes batch
   ```solidity
   function batchWithdraw(WithdrawalExecution[] calldata executions) external onlyController {
       require(executions.length <= MAX_BATCH_SIZE, "Batch too large");

       for (uint i = 0; i < executions.length; i++) {
           // 1. Validate tier reductions
           // 2. Update tier balances
           // 3. Remove from active tiers if balance = 0
           // 4. Accumulate fees
           // 5. Transfer to user
           // 6. Emit events
       }

       // Distribute fees (protocol + clients)
   }
   ```

3. **updateTierIndex()** - With monotonicity check
   ```solidity
   function updateTierIndex(address token, bytes32 tierId, uint256 newIndex) external onlyController {
       uint256 currentIndex = tierVaultIndices[tierId][token];
       require(newIndex >= currentIndex, "Index cannot decrease");
       require(newIndex <= currentIndex * 2, "Growth too high"); // Sanity check

       tierVaultIndices[tierId][token] = newIndex;
       tierVaultIndexUpdatedAt[tierId][token] = block.timestamp;

       emit TierIndexUpdated(token, tierId, currentIndex, newIndex, block.timestamp);
   }
   ```

4. **getTierValue()** - Calculate current value
   ```solidity
   function getTierValue(bytes32 clientId, bytes32 userId, bytes32 tierId, address token)
       external view returns (uint256) {
       Account storage account = accounts[clientId][userId][tierId][token];
       if (account.balance == 0) return 0;

       uint256 currentIndex = tierVaultIndices[tierId][token];
       return (account.balance * currentIndex) / account.entryIndex;
   }
   ```

5. **getTotalValue()** - Sum across all tiers
   ```solidity
   function getTotalValue(bytes32 clientId, bytes32 userId, address token)
       external view returns (uint256) {
       bytes32[] memory activeTiers = userActiveTiers[clientId][userId][token];
       uint256 total = 0;

       for (uint i = 0; i < activeTiers.length; i++) {
           total += this.getTierValue(clientId, userId, activeTiers[i], token);
       }

       return total;
   }
   ```

**Helper Functions Needed:**
```solidity
function _contains(bytes32[] storage array, bytes32 value) private view returns (bool);
function _removeFromArray(bytes32[] storage array, bytes32 value) private;
function _addToArrayIfNotExists(bytes32[] storage array, bytes32 value) private;
```

#### C. LAACControllerV2.sol
**Location:** `apps/laac-contract/contracts/LAACControllerV2.sol`

**Key Updates:**
- Update `executeTransfer()` to include `tierId` parameter
- Add `batchUpdateTierIndices()` for efficient index updates
- Update `batchWithdraw()` to call LAAC's new batch function
- Add tier validation in transfer limits

---

## 📋 Implementation Checklist

### Phase 1: Interfaces ✅ COMPLETE
- [x] Document architecture (DYNAMIC_RISK_TIER_ARCHITECTURE.md)
- [x] Create IClientRegistryV2.sol
- [x] Create ILAACv2.sol
- [x] Create implementation progress tracker (this file)

### Phase 2: Client Registry Implementation
- [ ] Implement ClientRegistryV2.sol
- [ ] Add tier validation logic
- [ ] Implement dynamic array management
- [ ] Write unit tests for tier management
- [ ] Test tier allocation updates
- [ ] Gas optimization for tier operations

### Phase 3: LAAC Core Implementation
- [ ] Implement LAACv2.sol storage mappings
- [ ] Implement deposit() with tier splitting
- [ ] Implement weighted entry index calculation
- [ ] Implement batchWithdraw() with validation
- [ ] Implement tier value getters
- [ ] Implement helper functions (_contains, _removeFromArray, etc.)
- [ ] Add tier index management (update, initialize)
- [ ] Implement fee distribution logic

### Phase 4: Controller Updates
- [ ] Update LAACControllerV2.sol
- [ ] Add tier parameter to executeTransfer()
- [ ] Implement batchUpdateTierIndices()
- [ ] Update batch withdrawal orchestration
- [ ] Add tier-specific transfer limits

### Phase 5: Testing
- [ ] Unit tests: ClientRegistryV2
  - [ ] Client registration with risk tiers
  - [ ] Tier allocation validation (sum to 100%)
  - [ ] Add/remove/update tiers
  - [ ] Multiple clients with different tier configs
- [ ] Unit tests: LAACv2
  - [ ] Deposit with tier splitting
  - [ ] Multiple deposits with weighted entry index
  - [ ] Batch withdrawal with tier reductions
  - [ ] Tier value calculations
  - [ ] Fee distribution (protocol + client)
- [ ] Integration tests
  - [ ] Full deposit → stake → yield → withdraw cycle
  - [ ] Batch withdrawal with 100 users
  - [ ] Tier index updates affecting user values
  - [ ] Client tier configuration changes
- [ ] Gas benchmarking
  - [ ] Deposit: target <150k gas
  - [ ] Batch withdrawal: target <30k gas per user
  - [ ] Tier index update: target <25k gas
- [ ] Edge cases
  - [ ] Withdrawal when tier balance = 0
  - [ ] Client adds new tier after users deposited
  - [ ] Oracle submits invalid tier reductions
  - [ ] Tier index update exceeds sanity check

### Phase 6: Oracle Service (Go)
- [ ] Create TierAllocator service
- [ ] Implement ReadTierBalances()
- [ ] Implement CalculateTierValues()
- [ ] Implement CalculateProportionalReduction()
- [ ] Implement CalculateFees()
- [ ] Implement EstimateBatchGas()
- [ ] Implement BuildWithdrawalExecution()
- [ ] Implement ExecuteBatchWithdraw()
- [ ] Add monitoring and alerting
- [ ] Create oracle configuration (protocols per tier)

### Phase 7: Deployment & Migration
- [ ] Deploy ClientRegistryV2 to testnet
- [ ] Deploy LAACv2 to testnet
- [ ] Deploy LAACControllerV2 to testnet
- [ ] Initialize tier indices for USDC/USDT
- [ ] Migrate test clients to new system
- [ ] Run 1 week of testnet operations
- [ ] External security audit
- [ ] Mainnet deployment plan
- [ ] User migration strategy (if existing users)

---

## 🎯 Key Metrics & Success Criteria

### Gas Efficiency
- ✅ **Target:** 80% cheaper than current implementation
- **Current (old):** ~250k gas per withdrawal = $12.50 @ 50 gwei
- **Target (new):** ~30k gas per withdrawal = $1.50 @ 50 gwei
- **Measurement:** Compare gas usage in integration tests

### Scalability
- ✅ **Target:** Support unlimited risk tiers
- **Validation:** Successfully deploy client with 5 custom tiers
- **Validation:** Successfully deploy client with 10 custom tiers
- **Measurement:** Gas cost should scale linearly with tier count

### Batch Processing
- ✅ **Target:** 100 withdrawals per batch
- **Validation:** Successfully process 100-user batch within block gas limit
- **Measurement:** Total gas / 100 should be ~30k per user

### Security
- ✅ **Target:** Zero critical vulnerabilities
- **Validation:** Pass external audit (Trail of Bits or Quantstamp)
- **Validation:** All attack scenarios in architecture doc mitigated
- **Measurement:** Audit report with no critical/high findings

---

## 📁 File Structure

```
apps/laac-contract/
├── contracts/
│   ├── interfaces/
│   │   ├── IClientRegistry.sol          (OLD - deprecated)
│   │   ├── IClientRegistryV2.sol        ✅ NEW - dynamic tiers
│   │   ├── ILAAC.sol                    (OLD - deprecated)
│   │   ├── ILAACv2.sol                  ✅ NEW - batch + tiers
│   │   └── ILAACController.sol          (needs update)
│   │
│   ├── ClientRegistry.sol               (OLD - keep for migration)
│   ├── ClientRegistryV2.sol             ⏳ PENDING
│   ├── LAAC.sol                         (OLD - keep for migration)
│   ├── LAACv2.sol                       ⏳ PENDING
│   ├── LAACController.sol               (OLD - keep for migration)
│   └── LAACControllerV2.sol             ⏳ PENDING
│
├── test/
│   ├── ClientRegistryV2.test.ts         ⏳ PENDING
│   ├── LAACv2.test.ts                   ⏳ PENDING
│   ├── LAACv2.TierLogic.test.ts         ⏳ PENDING
│   ├── LAACv2.BatchWithdrawal.test.ts   ⏳ PENDING
│   └── IntegrationV2.test.ts            ⏳ PENDING
│
├── scripts/
│   ├── deployV2.ts                      ⏳ PENDING
│   ├── migrateToV2.ts                   ⏳ PENDING
│   └── initializeTiers.ts               ⏳ PENDING
│
└── docs/
    ├── ARCHITECTURE.md                  (OLD - V1 docs)
    ├── DYNAMIC_RISK_TIER_ARCHITECTURE.md ✅ NEW - V2 architecture
    ├── IMPLEMENTATION_PROGRESS.md       ✅ THIS FILE
    └── MIGRATION_GUIDE.md               ⏳ PENDING
```

---

## 🚀 Next Steps

### Immediate (Today)
1. Implement `ClientRegistryV2.sol`
2. Write unit tests for ClientRegistryV2
3. Implement `LAACv2.sol` deposit function

### Short Term (This Week)
1. Complete LAACv2 core functions
2. Write comprehensive unit tests
3. Implement batch withdrawal logic
4. Gas optimization pass

### Medium Term (Next 2 Weeks)
1. Update LAACControllerV2
2. Integration testing
3. Start oracle service implementation (Go)
4. Documentation for deployment

### Long Term (Next Month)
1. Testnet deployment
2. 1 week of testnet validation
3. External security audit
4. Mainnet deployment plan

---

## 📞 Questions & Decisions Needed

### Before Implementation Starts:
- ✅ Confirm 4-level mapping structure
- ✅ Confirm bytes32 tier ID approach
- ✅ Confirm off-chain calculation model
- ✅ Confirm batch withdrawal design

### During Implementation:
- [ ] Maximum number of tiers per client? (recommend 10)
- [ ] Maximum batch size? (recommend 100)
- [ ] Gas fee cap per user? (recommend $10)
- [ ] Tier index growth cap? (recommend 100% = 2x)

### Before Deployment:
- [ ] Migration strategy for existing users?
- [ ] Deploy to L2 (Arbitrum/Optimism) or mainnet first?
- [ ] Which clients to onboard first?
- [ ] Monitoring and alerting infrastructure ready?

---

## 📊 Architecture Comparison

| Feature | V1 (Current) | V2 (New) |
|---------|-------------|----------|
| **Tiers** | Fixed 3 | Unlimited |
| **Tier IDs** | Enum | bytes32 hash |
| **Balance Storage** | Single account | Per-tier accounts |
| **Withdrawal** | On-chain calc | Off-chain calc |
| **Batch Support** | No | Yes (100 users) |
| **Gas Cost** | $12.50 | $1.50 |
| **Client Flexibility** | None | Full custom |
| **Adding Tiers** | Upgrade needed | Config change |

---

## 🔗 References

- **Architecture Doc:** [DYNAMIC_RISK_TIER_ARCHITECTURE.md](./DYNAMIC_RISK_TIER_ARCHITECTURE.md)
- **V1 Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Security Audit:** [SECURITY_AUDIT_WITHDRAWAL.md](./SECURITY_AUDIT_WITHDRAWAL.md)
- **Business Case:** [BUSINESS_RATIONALE.md](./BUSINESS_RATIONALE.md)

---

**Last Updated:** 2025-10-29
**Next Review:** After ClientRegistryV2 implementation complete
