# LAAC Smart Contract Architecture

## Overview

The Liquidity Aggregator Account Contract (LAAC) system is a B2B DeFi yield infrastructure built with a **centralized oracle-driven architecture**. This design prioritizes speed-to-market, security, and maintainability over full decentralization.

## Design Philosophy

### Core Principle: Separation of Concerns

```
┌─────────────────────┐
│  ClientRegistry     │  Identity Layer (Who can use the system?)
└──────────┬──────────┘
           │ validates
           ▼
┌─────────────────────┐
│       LAAC          │  Accounting Layer (What do users own?)
└──────────┬──────────┘
           ▲ controlled by
           │
┌─────────────────────┐
│  LAACController     │  Operations Layer (How do we manage funds?)
└──────────┬──────────┘
           │ indexes to
           ▼
┌─────────────────────┐
│   Off-Chain DB      │  Analytics Layer (Business intelligence)
│  (The Graph, etc)   │
└─────────────────────┘
```

### Why This Architecture?

**Speed to Market:**
- Non-upgradeable core (LAAC) = faster audit, simpler security review
- Upgradeable controller = can add protocols without redeploying accounting
- 8-10 weeks to production vs 6+ months for fully decentralized

**Security:**
- Immutable accounting = user balances never at risk from upgrades
- Multisig admin + guardian = prevents single point of failure
- Rate limiting at controller layer = caps potential exploit damage

**Maintainability:**
- Clear separation = easy to understand, audit, and extend
- Controller handles all complex logic = accounting layer stays simple
- Off-chain analytics = no expensive on-chain aggregations

---

## Layer 1: ClientRegistry (Identity Management)

### Purpose
Manages B2B client registration and access control. Clients must be registered and active before their users can deposit funds.

### Key Concepts

**Client Registration:**
- Oracle registers new clients on-chain
- Each client gets unique `clientId` (e.g., `keccak256("bitkub")`)
- API key validation happens **off-chain** in your backend service

**Active Status:**
- Admin can activate/deactivate clients
- Deactivated clients cannot perform new deposits
- Existing user balances remain safe and withdrawable

### Data Structure

```solidity
struct ClientInfo {
    string name;              // "Bitkub Exchange"
    bool isActive;            // Can they use the system?
    uint256 registeredAt;     // Timestamp of registration
}
```

### Access Control

| Role | Can Do |
|------|--------|
| `ORACLE_ROLE` | Register new clients |
| `DEFAULT_ADMIN_ROLE` | Activate/deactivate clients |

### Example Flow

```
1. Bitkub wants to integrate
2. You register them:
   - Off-chain: Store API key in your database
   - On-chain: Call registerClient(keccak256("bitkub"), "Bitkub")
3. Bitkub's users can now deposit (validated by clientId)
```

---

## Layer 2: LAAC (Core Accounting)

### Purpose
**Immutable accounting layer** that tracks user balances and yield accrual. This is the heart of the system - it must never lose user funds.

### Key Concepts

#### 1. Entry Index System (Yield Tracking)

**Problem:** How do you track yield for thousands of users depositing at different times?

**Solution:** Entry index + vault index

```
Vault Index (global):
- Starts at 1.0 (1e18)
- Increases as yield accrues
- Example: 4% yield → index becomes 1.04

Entry Index (per user):
- Recorded when user deposits
- Used to calculate their share of yield
- Weighted average for multiple deposits

User's Total Value = balance × (currentVaultIndex / entryIndex)
```

**Example:**
```
Time 0: Alice deposits 1000 USDC
- Vault index = 1.0
- Alice's entry index = 1.0
- Alice's balance = 1000

Time 1: Yield accrues, vault index → 1.04
- Alice's total value = 1000 × (1.04 / 1.0) = 1040 USDC
- Alice's yield = 40 USDC

Time 2: Alice deposits another 1000 USDC
- Vault index = 1.04
- Old value: 1000 × 1.0 = 1000
- New value: 1000 × 1.04 = 1040
- New entry index = (1000 + 1040) / 2000 = 1.02
- Alice's balance = 2000
```

#### 2. Three-Level Mapping (Accounting Structure)

```solidity
mapping(bytes32 => mapping(bytes32 => mapping(address => Account))) accounts;
//      clientId        userId           token         Account data

Account {
    uint256 balance;            // Available balance (not staked)
    uint256 entryIndex;         // Index when deposited
    uint256 depositTimestamp;   // First deposit time
}
```

**Why three levels?**
- `clientId`: Isolate different B2B clients (Bitkub users vs Rise users)
- `userId`: Each client has their own user identifier system
- `token`: Support multiple tokens (USDC, USDT, DAI)

#### 3. Deposit Flow (Client-Direct)

```
User → Client App → LAAC.deposit()
                    ↓
              1. Validate clientId is active (via ClientRegistry)
              2. Calculate entry index (weighted avg if existing deposit)
              3. Update balance mapping
              4. Transfer tokens from user to LAAC
              5. Emit Deposited event
```

**Key Point:** Clients deposit **directly**, not through oracle. Oracle only manages fund allocation to protocols.

#### 4. Withdrawal Flow (Controller-Managed)

```
User → Client App → REST API → Oracle → Controller.withdraw() → LAAC.withdraw()
                                                                  ↓
                                                        1. Validate sufficient balance
                                                        2. Update balance mapping
                                                        3. Transfer tokens to user
                                                        4. Emit Withdrawn event
```

**Why controller-only?** Oracle needs to ensure sufficient liquid buffer exists (may need to unstake from protocols first).

### Access Control

| Function | Who Can Call | Why |
|----------|-------------|-----|
| `deposit()` | Anyone with valid clientId | Clients deposit directly |
| `withdraw()` | Controller only | Oracle manages liquidity |
| `updateVaultIndex()` | Controller only | Oracle calculates yield |
| `setController()` | Controller only | Admin operations via controller |

### Token Support

LAAC maintains a whitelist of supported tokens:
- Controller adds/removes tokens
- Each token has independent vault index
- Example: USDC index = 1.04, USDT index = 1.05

---

## Layer 3: LAACController (Operations Management)

### Purpose
**Upgradeable operations layer** that handles all protocol interactions, admin functions, and security controls.

### Key Concepts

#### 1. Oracle Operations

**Generic Transfer Pattern:**
```
Instead of:  stakeToAave(), stakeToCompound(), etc.
We use:      executeTransfer(token, protocol, amount)
```

**Why?**
- Oracle handles protocol-specific logic off-chain
- Contract just validates and transfers
- Easy to add new protocols without contract changes

**Oracle Process:**
```
1. Monitor LAAC buffer (idle funds)
   → Check: IERC20(USDC).balanceOf(address(laac))

2. Calculate optimal allocation (off-chain)
   → Fetch APYs from Aave, Compound, Curve
   → Decide: 40% Aave, 30% Compound, 30% Curve

3. Execute transfers
   → executeTransfer(USDC, AavePool, 400k)
   → executeTransfer(USDC, CompoundcUSDC, 300k)
   → executeTransfer(USDC, CurvePool, 300k)

4. Stake in protocols (off-chain signatures)
   → AavePool.supply(USDC, 400k)
   → Compound.mint(300k)
   → Curve.add_liquidity([300k, 0, 0])

5. Update vault index when yield accrues
   → See /docs/YIELD_CALCULATION.md for correct calculation method
   → See /docs/ORACLE_STRATEGY.md for trigger strategy (buffer threshold + weekly)
   → Call: updateVaultIndex(USDC, newIndex)
```

#### 2. Rate Limiting (Security)

**Two-Tier Limits:**
```solidity
MAX_SINGLE_TRANSFER = 1_000_000e6;  // $1M per transaction
DAILY_TRANSFER_LIMIT = 5_000_000e6; // $5M per day
```

**Purpose:** Cap potential damage if oracle key is compromised

**Example:**
```
Day 1, 9am:  Transfer $2M to Aave ✅
Day 1, 2pm:  Transfer $3M to Compound ✅
Day 1, 6pm:  Transfer $1M to Curve ❌ (exceeds $5M daily limit)
Day 2, 9am:  Limit resets, can transfer again ✅
```

#### 3. Protocol Whitelisting

**Approved Protocols Only:**
- Admin (multisig) must whitelist protocols before oracle can use them
- Example: Aave LendingPool, Compound cUSDC, Curve 3pool

**Adding New Protocol:**
```
1. Research protocol (TVL > $500M, battle-tested)
2. Test integration on testnet
3. Multisig votes to whitelist
4. Oracle can now allocate funds to it
```

#### 4. Emergency Controls

**Emergency Pause (Guardian):**
```
Guardian detects exploit → emergencyPause()
Effect:
  ❌ No deposits
  ❌ No withdrawals
  ❌ No transfers to protocols
  ❌ No vault index updates

Recovery:
  1. Team investigates
  2. Issue resolved (patch, fund recovery, etc.)
  3. Admin (multisig) votes to unpause
```

**Unpause (Admin Only):**
```
Requires 3-of-5 multisig approval
Only after:
  - Root cause identified
  - Fix implemented
  - Post-mortem completed
```

### Access Control

| Role | Can Do |
|------|--------|
| `ORACLE_ROLE` | Execute transfers, update vault index |
| `DEFAULT_ADMIN_ROLE` | Whitelist protocols/tokens, unpause |
| `GUARDIAN_ROLE` | Emergency pause only |

---

## Layer 4: Off-Chain Analytics (Event Indexing)

### Purpose
Handle enterprise-grade reporting without expensive on-chain aggregations.

### Why Off-Chain?

**Problem:**
```solidity
// This is EXPENSIVE on-chain:
function getClientTotalAUM(bytes32 clientId) external view returns (uint256) {
    // Loop through ALL users for this client
    // Sum up all their balances
    // Gas cost: O(n) where n = number of users
}
```

**Solution:**
```
Index Deposited/Withdrawn events → Calculate aggregates off-chain
Tools: The Graph Protocol, Moralis Streams, or custom indexer
```

### Event-Driven Architecture

**Events Emitted:**
```solidity
// LAAC.sol
event Deposited(clientId, userId, token, amount, entryIndex, timestamp);
event Withdrawn(clientId, userId, token, amount, recipient, timestamp);
event VaultIndexUpdated(token, oldIndex, newIndex, timestamp);

// ClientRegistry.sol
event ClientRegistered(clientId, name);
event ClientActivated(clientId);
event ClientDeactivated(clientId);

// LAACController.sol
event TransferExecuted(token, protocol, amount, dailyTotal, timestamp);
event ProtocolWhitelisted(protocol, timestamp);
event TokenAdded(token, timestamp);
```

### Off-Chain Queries

**Example: Client Total AUM**
```graphql
# The Graph subgraph query
{
  client(id: "bitkub") {
    totalDeposits
    totalWithdrawals
    currentAUM
    userCount
    avgDepositSize
  }
}
```

**Example: Revenue Calculation**
```sql
-- Custom indexer database
SELECT
  client_id,
  SUM(balance * current_index / entry_index) as total_aum,
  total_aum * 0.005 as annual_revenue
FROM user_positions
GROUP BY client_id;
```

### Recommended Tools

| Tool | Use Case | Cost |
|------|----------|------|
| **The Graph** | Decentralized indexing, public queries | ~$100/month |
| **Moralis Streams** | Real-time event streaming | ~$50/month |
| **Custom Indexer** | Full control, private data | DIY + hosting |

---

## Data Flow Examples

### Complete User Journey: Deposit → Yield → Withdraw

```
Step 1: User Deposit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User (Alice) has 1000 USDC
  ↓ (approves LAAC contract)
Client App calls: deposit(
  clientId: keccak256("bitkub"),
  userId: keccak256("alice@email.com"),
  token: USDC,
  amount: 1000e6,
  from: alice.address
)
  ↓
LAAC Contract:
  ✓ Validates Bitkub is active client
  ✓ Records Alice's entry index = 1.0
  ✓ Updates Alice's balance = 1000
  ✓ Transfers 1000 USDC from Alice to LAAC
  ✓ Emits Deposited event

Result: Alice has 1000 USDC in the vault


Step 2: Oracle Allocates Funds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Oracle Service (off-chain):
  1. Detects 1000 USDC idle in LAAC
  2. Fetches APYs: Aave 4.2%, Compound 3.8%
  3. Decides: Stake 80% to Aave, keep 20% buffer

Oracle calls Controller:
  executeTransfer(USDC, AavePool, 800e6)
  ↓
Controller:
  ✓ Validates Aave is whitelisted
  ✓ Checks rate limits (OK)
  ✓ Transfers 800 USDC from LAAC to Aave
  ✓ Updates daily transfer tracking

Oracle (off-chain):
  Signs transaction: AavePool.supply(USDC, 800e6)
  → Aave returns tokens to address(laac)

Oracle calls Controller:
  receiveFromProtocol(USDC, AavePool, 800e6)
  ✓ Logs event for tracking
  ✓ Tokens already in LAAC (received from Aave)

Result: 800 USDC earning yield in Aave, 200 USDC in buffer

**How Token Receiving Works:**
LAAC automatically receives any ERC20 tokens sent to it (standard behavior).
When oracle unstakes from protocols, tokens are sent directly to LAAC address.
No special receive function needed - ERC20 transfers just work!


Step 3: Yield Accrues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
30 days pass...

Oracle Service (off-chain):
  1. Queries Aave: aUSDC balance = 803 USDC (3 USDC yield)
  2. Calculates total value:
     - In Aave: 803 USDC
     - In buffer: 200 USDC
     - Total: 1003 USDC
  3. Calculates new vault index:
     - Old index: 1.0
     - New index: 1.0 × (1003 / 1000) = 1.003

Oracle calls Controller:
  updateVaultIndex(USDC, 1.003e18)
  ↓
Controller → LAAC:
  ✓ Validates index not decreasing
  ✓ Updates vaultIndex[USDC] = 1.003e18
  ✓ Emits VaultIndexUpdated event

Result: Vault index = 1.003 (0.3% yield)


Step 4: User Checks Balance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client App queries LAAC:
  getTotalValue(
    clientId: keccak256("bitkub"),
    userId: keccak256("alice@email.com"),
    token: USDC
  )

LAAC calculates:
  balance = 1000
  entryIndex = 1.0
  currentIndex = 1.003
  totalValue = 1000 × (1.003 / 1.0) = 1003

Returns: 1003 USDC

Client App shows: "You have 1003 USDC (3 USDC earned)"


Step 5: User Withdraws
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User (Alice) wants to withdraw 500 USDC
  ↓
Client App → REST API → Oracle Service:
  POST /api/withdraw {
    clientId: "bitkub",
    userId: "alice@email.com",
    token: "USDC",
    amount: 500,
    recipient: alice.address
  }
  ↓
Oracle checks buffer:
  - Buffer has 200 USDC
  - Need 500 USDC
  - Must unstake 300 USDC from Aave first

Oracle (off-chain):
  AavePool.withdraw(USDC, 300e6, address(laac))
  → 300 USDC now in buffer (total 500 USDC)

Oracle calls Controller:
  withdraw(
    clientId: keccak256("bitkub"),
    userId: keccak256("alice@email.com"),
    token: USDC,
    amount: 500e6,
    to: alice.address
  )
  ↓
Controller → LAAC:
  ✓ Validates Alice has >= 500 balance
  ✓ Updates Alice's balance = 500
  ✓ Transfers 500 USDC to Alice
  ✓ Emits Withdrawn event

Result: Alice receives 500 USDC, has 500 remaining in vault
```

---

## Security Model

### Multi-Layer Defense

```
Layer 1: Access Control
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Multisig Admin (3-of-5 Gnosis Safe)
✓ Separate Guardian role (cold wallet)
✓ Oracle role (hot wallet, limited permissions)
✓ ClientRegistry validation (only active clients)

Layer 2: Rate Limiting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ $1M per transaction limit
✓ $5M per day limit
✓ Daily reset at midnight UTC
→ Caps damage if oracle compromised

Layer 3: Whitelisting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Protocol whitelist (only approved DeFi protocols)
✓ Token whitelist (only approved stablecoins)
✓ Multisig required to add new entries
→ Prevents oracle from using malicious protocols

Layer 4: Emergency Controls
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Guardian can pause instantly
✓ Only multisig can unpause
✓ User balances safe during pause
→ Fast response to exploits

Layer 5: Immutable Accounting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ LAAC contract non-upgradeable
✓ User balances in mappings (not proxy)
✓ Only controller can modify (via specific functions)
→ User funds never at risk from upgrades
```

### Attack Scenarios & Mitigations

| Attack | Mitigation |
|--------|-----------|
| **Oracle key stolen** | Rate limits cap damage to $5M/day, guardian can pause |
| **Malicious protocol exploit** | Whitelist + diversification (max 25% per protocol) |
| **Smart contract bug** | Audits, bug bounty, gradual TVL increase ($500k → $10M → $100M) |
| **Admin multisig compromised** | Requires 3-of-5, time-sensitive operations have timelock |
| **Front-running oracle** | Use Flashbots Protect for private transactions |
| **Vault index manipulation** | Index can only increase (require newIndex >= oldIndex) |

---

## Deployment Strategy

### Phase 1: MVP ($500k TVL Cap)

**Contracts:**
- ✅ ClientRegistry (non-upgradeable)
- ✅ LAAC (non-upgradeable)
- ✅ LAACController (non-upgradeable for MVP)

**Supported:**
- Tokens: USDC only
- Protocols: Aave + Compound only
- Clients: 3-5 friendly customers

**Security:**
- $10k basic audit
- Multisig (3-of-5)
- Rate limits active
- Manual oracle execution (daily)

**Timeline:** 8-10 weeks

### Phase 2: Production ($10M TVL)

**Upgrades:**
- ✅ LAACController → UUPS proxy (upgradeable)
- ✅ Add USDT, DAI support
- ✅ Add Curve, Lido protocols
- ✅ Automated oracle (hourly)

**Security:**
- $50k full audit
- Bug bounty program
- Insurance (Nexus Mutual)
- Monitoring/alerting

**Timeline:** 12 weeks from Phase 1

### Phase 3: Enterprise ($100M+ TVL)

**Upgrades:**
- ✅ Multi-chain (Arbitrum, Polygon)
- ✅ Advanced strategies (leveraged yield)
- ✅ White-label tier
- ✅ Real-time rebalancing

**Security:**
- Annual audits
- SOC 2 compliance
- Larger insurance coverage

---

## Gas Optimization

### View Functions (No Gas Cost)

```solidity
// Individual user queries (cheap)
getAccount(clientId, userId, token)
getTotalValue(clientId, userId, token)
getUserAccountSummary(clientId, userId, token)

// Global queries (cheap)
getVaultIndex(token)
getTotalDeposits(token)
```

### State-Changing Functions (Gas Cost)

| Function | Est. Gas | When Called |
|----------|----------|-------------|
| `deposit()` | ~100k | Per user deposit |
| `withdraw()` | ~80k | Per user withdrawal |
| `executeTransfer()` | ~60k | Oracle rebalancing |
| `updateVaultIndex()` | ~45k | After yield accrual |
| `registerClient()` | ~120k | One-time per client |

### Gas Saving Techniques Used

```solidity
✓ Use mappings instead of arrays (O(1) lookup)
✓ Pack structs efficiently (uint256 × 3 = 1 slot would be 3 slots)
✓ Use events for historical data (not storage)
✓ Avoid loops in state-changing functions
✓ Use immutable/constant for fixed values
✓ SafeERC20 only where needed (safeTransfer/safeTransferFrom)
```

---

## Testing Strategy

### Unit Tests (Per Contract)

```javascript
// ClientRegistry.test.ts
✓ Register client (oracle role)
✓ Activate/deactivate client (admin role)
✓ Reject registration with invalid data
✓ Reject unauthorized role calls

// LAAC.test.ts
✓ Deposit with active client
✓ Reject deposit with inactive client
✓ Calculate weighted average entry index
✓ Withdraw via controller
✓ Reject direct withdrawal (not via controller)
✓ Calculate total value correctly
✓ Update vault index (controller only)

// LAACController.test.ts
✓ Execute transfer within limits
✓ Reject transfer exceeding daily limit
✓ Reject transfer to non-whitelisted protocol
✓ Emergency pause (guardian)
✓ Unpause (admin only)
✓ Add/remove protocols (admin only)
```

### Integration Tests

```javascript
✓ Full flow: Register client → Deposit → Transfer → Update index → Withdraw
✓ Multiple clients, multiple users
✓ Rate limiting across multiple transfers
✓ Emergency pause mid-transaction
```

### Testnet Deployment

```
1. Deploy to Sepolia testnet
2. Register 2-3 test clients
3. Simulate deposits from 10+ test users
4. Execute transfers to Aave/Compound testnet
5. Test emergency scenarios (pause, unpause)
6. Verify event indexing works
```

---

## Future Enhancements (Post-Launch)

### Phase 2 Features

**Upgradeability:**
```
Convert LAACController to UUPS proxy pattern
- Keep LAAC non-upgradeable (security)
- Allow controller upgrades (add features)
```

**Advanced Yield Strategies:**
```
- Leveraged staking (Aave borrow → Compound supply)
- Auto-compounding (reinvest yield)
- Yield optimization (rebalance based on APY changes)
```

**Multi-Chain:**
```
- Deploy on Arbitrum (lower gas)
- Deploy on Polygon (different user base)
- Cross-chain messaging (LayerZero/Wormhole)
```

### Phase 3 Features

**Institutional Grade:**
```
- Custody integration (Fireblocks, Copper)
- Compliance reporting (tax forms)
- SLA guarantees (uptime, withdrawal speed)
```

**Advanced Analytics:**
```
- Real-time APY tracking
- Risk scoring per protocol
- Performance attribution
```

---

## Glossary

| Term | Definition |
|------|------------|
| **Client** | B2B customer (e.g., Bitkub, Rise) using your infrastructure |
| **User** | End user of client's product (e.g., Bitkub customer) |
| **Entry Index** | Vault index recorded when user deposited (basis for yield calculation) |
| **Vault Index** | Global index that increases with yield (starts at 1.0) |
| **Buffer** | Idle funds in LAAC contract (not staked in protocols) |
| **Oracle** | Off-chain service that manages fund allocation and yield calculation |
| **Controller** | Smart contract layer handling operations (transfers, admin functions) |
| **Guardian** | Cold wallet role that can emergency pause (but not unpause) |

---

## Contract Addresses (Mainnet - TBD)

```
Network: Ethereum Mainnet

ClientRegistry:  0x... (deployed once, non-upgradeable)
LAAC:           0x... (deployed once, non-upgradeable)
LAACController: 0x... (upgradeable via UUPS proxy)

Admin Multisig: 0x... (Gnosis Safe 3-of-5)
Guardian:       0x... (Cold wallet)
Oracle:         0x... (Hot wallet)
```

---

## Support & Resources

**Documentation:**
- Smart Contract Docs: `/contracts/interfaces/`
- Yield Calculation: `/docs/YIELD_CALCULATION.md` (How oracle calculates yield correctly)
- Oracle Strategy: `/docs/ORACLE_STRATEGY.md` (Buffer monitoring, staking triggers)
- Token Flows: `/docs/TOKEN_FLOWS.md` (How tokens move through the system)
- API Docs: (TBD - REST API for clients)
- Integration Guide: (TBD - how to integrate LAAC)

**Security:**
- Audit Reports: `/audits/`
- Bug Bounty: (TBD - Immunefi)
- Security Contact: security@defai.protocol

**Development:**
- GitHub: https://github.com/your-org/laac
- Discord: (TBD)
- Developer Docs: (TBD)

---

*Last Updated: 2025-10-18*
*Version: 1.0.0*
*Status: Pre-Production*
