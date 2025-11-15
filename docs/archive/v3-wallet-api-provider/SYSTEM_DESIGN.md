# System Architecture

## 🏗️ ARCHITECTURE DECISION: CENTRALIZED VS DECENTRALIZED

### Decision: Start with Simple Centralized Approach

**Why:**
- 10 months faster to market (2 months vs 12 months)
- 7x cheaper ($35k vs $236k)
- 10x easier for B2B clients to integrate (REST API vs smart contracts)
- Better for demo/sales
- Can add decentralization later

## Architecture Overview

```
USER FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client's Customer deposits 1000 USDC
    ↓
Client's App calls: POST /api/deposit
    ↓
Your Vault Contract (on-chain)
    ├─ Tracks user balance (mapping)
    ├─ Tracks entryIndex (for APY calculation)
    └─ Holds pooled funds
    ↓
Oracle Service (off-chain)
    ├─ Monitors buffered funds
    ├─ Fetches protocol APYs
    ├─ Calculates optimal allocation
    └─ Executes staking directly
    ↓
DeFi Protocols
    ├─ Aave (40% allocation)
    ├─ Compound (30% allocation)
    └─ Curve (30% allocation)
    ↓
Protocols return wrapped tokens to vault
    ├─ aUSDC (from Aave)
    ├─ cUSDC (from Compound)
    └─ LP tokens (from Curve)
```

## Smart Contract Responsibilities (MINIMAL)

**Vault Contract does ONLY:**
1. Accept deposits (track user positions)
2. Process withdrawals (from buffer or trigger unstake)
3. Track user entryIndex (for yield calculation)
4. Execute oracle commands (approve, transfer)
5. Emergency pause/limits

**Vault Contract does NOT:**
- ❌ Complex protocol interactions (oracle does this)
- ❌ Adapter pattern (too complex)
- ❌ On-chain rebalancing logic (oracle decides)

## Oracle Responsibilities (EVERYTHING ELSE)

**Oracle Service does:**
1. Monitor buffer for new deposits
2. Fetch real-time APYs from protocols
3. Calculate optimal allocation
4. Sign and execute staking transactions
5. Sign and execute rebalancing transactions
6. Update vaultIndex after yield accrual
7. Handle slippage protection
8. Monitor for risks

## Key Design Principle

**"Oracle has authority, contract has limits"**

```solidity
// Contract provides generic execution functions
function executeTransfer(address token, address to, uint256 amount)
    external
    onlyOracle
{
    // With limits
    require(amount <= MAX_SINGLE_TRANSFER);
    require(dailyTransferred[today] + amount <= DAILY_LIMIT);
    require(whitelistedProtocols[to]);

    IERC20(token).transfer(to, amount);
}
```

## What NOT to Implement

These patterns are **NOT needed** for the B2B infrastructure model:

| Pattern | Why Not? |
|---------|----------|
| **ERC-4626 (Tokenized Vault)** | ❌ B2B API model, not retail DeFi<br>❌ Non-transferrable positions<br>❌ Multi-tenant accounting (clientId → userId) |
| **ERC-2612 (Permit)** | ❌ USDC/USDT don't support it<br>❌ Oracle-controlled deposits, not user-initiated |
| **On-chain Rebalancing** | ❌ Oracle does this off-chain<br>❌ Too complex, gas-intensive |
| **Protocol Adapters** | ❌ Generic `executeTransfer()` sufficient<br>❌ Oracle handles protocol-specific logic |
| **Yield Distribution Token** | ❌ Centralized accounting via mappings<br>❌ No need for composability |
