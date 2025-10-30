# proxify Contract Architecture

## Overview

The proxify (Liquidity Aggregator Account Contract) is a B2B DeFi yield infrastructure ("Stripe for DeFi Yield") that enables clients to offer yield-bearing accounts to their end users.

## Core Components

### 1. proxify.sol - Core Vault Contract

The immutable accounting layer that handles:
- User deposits and balances
- Yield tracking via vault index system
- Fee calculation and distribution
- Separated vault system for funds management

### 2. proxifyController.sol - Oracle Operations

The upgradeable layer that manages:
- Oracle-driven fund transfers to DeFi protocols
- Batch withdrawal execution
- Admin functions (add/remove tokens, protocols)
- Emergency pause functionality

### 3. ClientRegistry.sol - B2B Client Management

Manages B2B clients and their configurations:
- Client registration and activation
- Fee structure per client (`feeBps`, `serviceFeeBps`)
- Client address management

## Separated Vault System

The contract uses a **tri-vault architecture** to separate different types of funds:

```
Contract Balance
├── User Deposits (totalDeposits)
├── Staked Funds (totalStaked)
└── Reserved Funds
    ├── Operation Fee Vault (operationFeeVault)
    ├── Protocol Revenue Vault (protocolRevenueVault)
    └── Client Revenue Vaults (clientRevenueVault[clientId])
```

### Vault Purposes

1. **Operation Fee Vault** (`operationFeeVault`)
   - Contains: Gas fees from withdrawals
   - Purpose: Cover oracle's operational costs
   - Claims: Frequent (oracle can claim anytime)

2. **Protocol Revenue Vault** (`protocolRevenueVault`)
   - Contains: Protocol's share of service fees (e.g., 15% of yield)
   - Purpose: Protocol revenue
   - Claims: Periodic (admin claims to treasury)

3. **Client Revenue Vault** (`clientRevenueVault[clientId]`)
   - Contains: Each client's share of service fees (e.g., 5% of yield)
   - Purpose: B2B client revenue share
   - Claims: Per-client (clients claim their earnings)

4. **Aggregate Tracking** (`totalClientRevenues`)
   - Auto-updated on every withdrawal
   - Enables O(1) stakeable balance calculation
   - No need to loop through all clients

## Withdraw Flow Architecture

### High-Level Flow

```
User Request → API → Oracle → proxifyController.batchWithdraw() → proxify.withdraw()
                                                                      ↓
                                    [Fee Calculation & Distribution] ←
                                                                      ↓
                                            [Transfer to User] → User Receives Funds
```

### Detailed Withdraw Process

#### Step 1: User Creates Withdraw Request (Off-Chain)

```typescript
POST /api/v1/withdraw/request
{
  "clientId": "client_abc",
  "userId": "user_123",
  "token": "0x...USDC",
  "amount": 1000 // Requested amount
}
```

**API Response:**
```json
{
  "orderId": "order_xyz",
  "status": "pending",
  "currentBalance": 1050,
  "accruedYield": 50,
  "serviceFee": 10,  // 20% of 50
  "gasFee": 5,        // or 0 if deposit age >= waiver period
  "maxWithdrawable": 1035,
  "estimatedCompletion": "2024-01-15T10:00:00Z"
}
```

#### Step 2: Oracle Updates Vault Index (Daily)

```solidity
// Oracle calculates new index off-chain based on protocol yields
// Old index: 1.00 (1e18)
// New index: 1.05 (1.05e18) - 5% yield accrued

proxifyController.updateVaultIndex(
    USDC_ADDRESS,
    1050000000000000000 // 1.05e18
);
```

#### Step 3: Oracle Executes Batch Withdrawal (Daily)

```solidity
IproxifyController.WithdrawalRequest[] memory requests = [
    {
        to: 0x...user1,
        clientId: client_abc,
        userId: user_123,
        token: USDC,
        amount: 1000,  // Net amount user receives
        estimatedGasFee: 5
    },
    // ... more requests (max 100 per batch)
];

uint256 batchId = proxifyController.batchWithdraw(requests);
```

#### Step 4: Fee Calculation in proxify.withdraw()

```solidity
// User Account
balance: 1000 USDC (principal)
entryIndex: 1.0e18
depositTimestamp: 6 months ago

// Current State
vaultIndex: 1.05e18
totalBalance = (1000 * 1.05) / 1.0 = 1050 USDC
accruedYield = 1050 - 1000 = 50 USDC

// Fee Calculation
serviceFee = 50 * 20% = 10 USDC (from yield only!)
  ├─ protocolRevenue = 10 * (100% - 5%) = 9.5 USDC
  └─ clientRevenue = 10 * 5% = 0.5 USDC

withdrawFee = (6 months >= 6 months waiver) ? 0 : 5 USDC
withdrawFee = 0 USDC (FREE!)

// Net Amount
netAmount = 1050 - 10 - 0 = 1040 USDC (max withdrawable)

// User requested 1000 USDC
✅ 1000 <= 1040 (valid)

// Balance Deduction
totalFeesToDeduct = 10 + 0 = 10 USDC
Since 10 <= 50 (fees covered by yield):
  amountToDeduct = 1000 USDC (requested amount only)

account.balance -= 1000
  // New balance: 0 (all withdrawn)
```

#### Step 5: Fee Distribution to Vaults

```solidity
// Allocate fees to separated vaults
operationFeeVault[USDC] += 0 USDC        // No gas fee (waived)
protocolRevenueVault[USDC] += 9.5 USDC  // Protocol's share
clientRevenueVault[client_abc][USDC] += 0.5 USDC  // Client's share

// Update aggregate tracking (auto-maintained)
totalClientRevenues[USDC] += 0.5 USDC
```

#### Step 6: Transfer & Events

```solidity
// Transfer net amount to user
IERC20(USDC).safeTransfer(0x...user1, 1000 USDC);

// Emit events
emit WithdrawnWithFee(
    client_abc,
    user_123,
    USDC,
    1000,      // amount
    10,        // serviceFee
    0,         // gasFee (waived)
    0.5,       // clientRevenue
    block.timestamp
);

emit Withdrawn(
    client_abc,
    user_123,
    USDC,
    1000,      // amount
    0x...user1, // recipient
    block.timestamp
);
```

## Fee Model

### Service Fee (from Yield)

```
serviceFee = accruedYield * serviceFeeBps / 10000

Example: 50 USDC yield * 2000 bps = 10 USDC (20%)

Split:
├─ Protocol Revenue = serviceFee * (1 - clientFeeBps / 10000)
│  = 10 * (1 - 500/10000) = 9.5 USDC (95%)
└─ Client Revenue = serviceFee * clientFeeBps / 10000
   = 10 * 500/10000 = 0.5 USDC (5%)
```

### Gas/Withdraw Fee (Operational Cost)

```
withdrawFee = (depositAge >= gasFeeWaiverPeriod) ? 0 : estimatedGasFee

Default waiver period: 365 days (configurable)

Examples:
- Deposit 1 month ago: User pays gas fee
- Deposit 12 months ago: Gas fee FREE
```

## Stakeable Balance Calculation

Oracle uses this to determine how much can be staked to DeFi protocols:

```solidity
function getStakeableBalance(address token) external view returns (uint256) {
    uint256 contractBalance = IERC20(token).balanceOf(address(this));
    uint256 reservedFunds = operationFeeVault[token]
        + protocolRevenueVault[token]
        + totalClientRevenues[token]; // ← O(1) aggregate!

    return contractBalance - reservedFunds;
}
```

### Example Calculation

```
Contract Balance: 100,000 USDC
├─ Operation Fees: 500 USDC (pending oracle claims)
├─ Protocol Revenue: 1,500 USDC (pending treasury claim)
├─ Client Revenues: 500 USDC (aggregate across all clients)
└─ Stakeable: 97,500 USDC ✅

Oracle can execute:
proxifyController.executeTransfer(USDC, AAVE_PROTOCOL, 97500e6);
```

## Edge Cases Handled

### Case 1: User Deposits and Withdraws Immediately (No Yield)

```
Deposit: 1000 USDC
Withdraw Immediately: 995 USDC

totalBalance = 1000 USDC
accruedYield = 0 USDC

serviceFee = 0 * 20% = 0 USDC (no yield, no service fee!)
withdrawFee = 5 USDC (user pays gas, < waiver period)

netAmount = 1000 - 0 - 5 = 995 USDC
User receives: 995 USDC ✅

Vault allocation:
├─ operationFeeVault += 5 USDC
├─ protocolRevenueVault += 0
└─ clientRevenueVault += 0
```

### Case 2: Fees Exceed Yield (Deduct from Principal)

```
Deposit: 100 USDC (2 weeks ago)
totalBalance: 101 USDC (1 USDC yield)

serviceFee = 1 * 20% = 0.2 USDC
withdrawFee = 5 USDC (< waiver period)
totalFees = 5.2 USDC

Since 5.2 > 1 (fees exceed yield):
  amountToDeduct = 100 + (5.2 - 1) = 104.2 USDC
  But balance only 100!

✅ Contract validates: netAmount = 101 - 5.2 = 95.8 USDC
User can withdraw max 95.8 USDC
```

### Case 3: Partial Withdrawal (Keep Earning Yield)

```
User has: 1000 USDC + 50 yield = 1050 total
Withdraws: 500 USDC

After fees (10 USDC):
Remaining balance: 550 USDC
Still earning yield on remaining 550!
```

## Getter Functions

### Vault Balances

```solidity
getOperationFeeBalance(token)        // Gas fees ready to claim
getProtocolRevenueBalance(token)    // Protocol revenue
getClientRevenueBalance(clientId, token) // Specific client revenue
getTotalClientRevenues(token)       // ALL clients aggregate
getTotalRevenueBalance(token)       // Protocol + all clients
getStakeableBalance(token)          // Available to stake
```

### User Account

```solidity
getUserAccountSummary(clientId, userId, token)
// Returns:
// - balance (principal)
// - totalValue (principal + yield)
// - accruedYield (unrealized)
// - entryIndex
// - depositTimestamp
```

## Claim Functions

```solidity
// Oracle claims operational fees (frequent)
claimOperationFee(token, oracleWallet, amount)

// Protocol claims revenue (periodic)
claimProtocolRevenue(token, treasury, amount)

// Client claims their revenue share
claimClientRevenue(clientId, token, clientWallet, amount)
```

## Security Features

1. **Role-Based Access Control**
   - ADMIN: Add/remove tokens, protocols, update fees
   - ORACLE: Execute transfers, batch withdrawals, update vault index
   - GUARDIAN: Emergency pause

2. **Separated Vaults**
   - Operation fees separated from revenues
   - Per-client revenue tracking
   - Prevents fund commingling

3. **Batch-Only Withdrawals**
   - All withdrawals through `proxifyController.batchWithdraw()`
   - No individual withdraw function
   - Simplifies liquidity management

4. **Reentrancy Protection**
   - `nonReentrant` on deposit/withdraw functions

5. **Validation**
   - Client must be active
   - Token must be supported
   - Sufficient balance checks
   - Fee calculations validated

## Events

```solidity
// Deposits
event Deposited(
    bytes32 indexed clientId,
    bytes32 indexed userId,
    address indexed token,
    uint256 amount,
    uint256 entryIndex,
    uint256 timestamp
);

// Withdrawals (two events)
event WithdrawnWithFee(  // Detailed fee breakdown
    bytes32 indexed clientId,
    bytes32 indexed userId,
    address indexed token,
    uint256 amount,
    uint256 serviceFee,
    uint256 gasFee,
    uint256 clientRevenue,
    uint256 timestamp
);

event Withdrawn(  // Basic withdrawal info
    bytes32 indexed clientId,
    bytes32 indexed userId,
    address indexed token,
    uint256 amount,
    address recipient,
    uint256 timestamp
);

// Vault Management
event VaultIndexUpdated(
    address indexed token,
    uint256 oldIndex,
    uint256 newIndex,
    uint256 timestamp
);

event GasFeeWaiverPeriodUpdated(
    uint256 oldPeriod,
    uint256 newPeriod,
    uint256 timestamp
);

event GasFeeClaimed(
    address indexed token,
    address indexed to,
    uint256 amount,
    uint256 timestamp
);
```

## Oracle Operations Flow

### Daily Operations

```
1. Collect pending withdrawal requests from database
2. Check if liquidity needs rebalancing:
   - stakeableBalance = getStakeableBalance(USDC)
   - If insufficient, unstake from protocols
3. Update vault index based on protocol yields:
   - Calculate new index from Aave, Compound, etc.
   - proxifyController.updateVaultIndex(USDC, newIndex)
4. Execute batch withdrawals:
   - Group by token (max 100 per batch)
   - proxifyController.batchWithdraw(requests)
5. Stake excess liquidity:
   - Calculate stakeable amount
   - Distribute to protocols based on strategy
   - proxifyController.executeTransfer(USDC, protocol, amount)
6. Claim operation fees periodically:
   - proxify.claimOperationFee(USDC, oracleWallet, amount)
```

## Deployment Addresses (Example)

```
// Base Sepolia Testnet
ClientRegistry: 0x...
proxify: 0x...
proxifyController: 0x...

Roles:
- ADMIN: 0x... (3-of-5 multisig)
- ORACLE: 0x... (oracle bot wallet)
- GUARDIAN: 0x... (cold wallet)
```

## Configuration

```solidity
// Gas Fee Waiver Period
gasFeeWaiverPeriod: 365 days (configurable 1-730 days)

// Client Fee Structure (per client)
serviceFeeBps: 2000 (20% of yield)
feeBps: 500 (5% to client, 95% to protocol)

// Supported Tokens
- USDC: 0x...
- USDT: 0x...

// Whitelisted Protocols
- Aave Pool: 0x...
- Compound cUSDC: 0x...
```

## Testing Scenarios

1. **Deposit → Immediate Withdraw** (no yield, pay gas)
2. **Deposit → Wait 1 year → Withdraw** (yield earned, gas waived)
3. **Multiple deposits → Partial withdrawal**
4. **Batch withdrawal** (100 users, same token)
5. **Vault index update** (simulate 10% APY)
6. **Stakeable balance calculation** (with fees reserved)
7. **Emergency pause** (block all operations)

---

**Last Updated:** 2025-01-24
**Version:** 1.0
**Contract Version:** Solidity 0.8.20
