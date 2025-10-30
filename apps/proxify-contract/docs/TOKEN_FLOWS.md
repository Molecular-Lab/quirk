# Token Flows in LAAC System

## Overview

This document explains how tokens move through the LAAC system and why `receiveFromProtocol()` exists.

## The Three Token Movements

### 1. User Deposits → LAAC
```
User approves LAAC
   ↓
LAAC.deposit() called
   ↓
IERC20.safeTransferFrom(user, address(laac), amount)
   ↓
Tokens now in LAAC contract
```

### 2. LAAC → Protocol (Staking)
```
Oracle calls:
Controller.executeTransfer(USDC, AavePool, 800e6)
   ↓
IERC20.safeTransferFrom(address(laac), AavePool, 800e6)
   ↓
Tokens sent to Aave

Oracle (off-chain) calls:
AavePool.supply(USDC, 800e6)
   ↓
Aave mints aUSDC to address(laac)
   ↓
LAAC now holds aUSDC (earning yield)
```

### 3. Protocol → LAAC (Unstaking)
```
Oracle (off-chain) calls:
AavePool.withdraw(USDC, 300e6, address(laac))
   ↓
Aave sends 300 USDC directly to address(laac)
   ↓
Tokens automatically received by LAAC

Oracle calls:
Controller.receiveFromProtocol(USDC, AavePool, 300e6)
   ↓
Event emitted for tracking
   ✓ ReceivedFromProtocol(USDC, AavePool, 300e6, timestamp)
```

## Why `receiveFromProtocol()` Exists

### Purpose
**Event logging for off-chain tracking** - NOT for actually receiving tokens!

### What It Does
```solidity
function receiveFromProtocol(address token, address protocol, uint256 amount) {
    require(supportedTokens[token], "Token not supported");
    require(whitelistedProtocols[protocol], "Protocol not whitelisted");

    emit ReceivedFromProtocol(token, protocol, amount, block.timestamp);
    // That's it! No token transfer happens here.
}
```

### What It Does NOT Do
- ❌ Does NOT transfer tokens (they're already in LAAC)
- ❌ Does NOT need `receive()` or `fallback()` functions
- ❌ Does NOT validate balances
- ❌ Does NOT update accounting (oracle tracks this off-chain)

### Why It's Useful

**1. Audit Trail**
```javascript
// Off-chain indexer queries events:
const receivedEvents = await controller.queryFilter(
  controller.filters.ReceivedFromProtocol()
);

// Track all protocol unstaking activities
receivedEvents.forEach(event => {
  console.log(`Received ${event.amount} ${event.token} from ${event.protocol}`);
});
```

**2. Reconciliation**
```javascript
// Oracle reconciliation logic:
const totalSent = sum(TransferExecuted events for Aave);
const totalReceived = sum(ReceivedFromProtocol events from Aave);
const stillInAave = totalSent - totalReceived;

// Cross-check with on-chain balance:
const aaveBalance = await aUSDC.balanceOf(address(laac));
assert(stillInAave === aaveBalance);
```

**3. Monitoring/Alerts**
```javascript
// Alert if oracle unstakes without logging:
const aaveWithdrawals = await scanAaveEvents("Withdraw", address(laac));
const loggedReceipts = await controller.queryFilter(ReceivedFromProtocol);

if (aaveWithdrawals.length !== loggedReceipts.length) {
  alert("Discrepancy detected: Oracle unstaked but didn't log receipt!");
}
```

## How LAAC Receives Tokens

### ERC20 Tokens (USDC, USDT, DAI)

LAAC receives ERC20 tokens **automatically** - no special function needed!

```solidity
// This just works:
IERC20(token).transfer(address(laac), amount);

// LAAC doesn't need:
// - receive() function (that's for ETH)
// - fallback() function (that's for ETH)
// - onERC20Received() function (that's for ERC777/721)
```

### Why?

ERC20 `transfer()` updates balances in the token contract:

```solidity
// Inside USDC contract:
mapping(address => uint256) balances;

function transfer(address to, uint256 amount) {
    balances[msg.sender] -= amount;
    balances[to] += amount;  // ← LAAC's balance increased
}
```

LAAC's balance is tracked **in the token contract**, not in LAAC itself!

## Complete Flow Example

### Oracle Allocates 1000 USDC to Aave

```
Step 1: Transfer to Aave
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Oracle → Controller.executeTransfer(USDC, AavePool, 1000e6)
   ↓
IERC20(USDC).safeTransferFrom(address(laac), AavePool, 1000e6)
   ↓
USDC contract updates:
  balances[laac] -= 1000e6
  balances[AavePool] += 1000e6
   ↓
Event: TransferExecuted(USDC, AavePool, 1000e6, ...)


Step 2: Stake in Aave (Off-Chain)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Oracle signs transaction:
  AavePool.supply(USDC, 1000e6, address(laac), 0)
   ↓
Aave burns 1000 USDC, mints 1000 aUSDC to address(laac)
   ↓
aUSDC contract updates:
  balances[laac] += 1000e6
   ↓
LAAC now earning yield!


Step 3: Unstake from Aave (Off-Chain)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
30 days later, yield accrued to 1003 USDC...

Oracle signs transaction:
  AavePool.withdraw(USDC, 500e6, address(laac))
   ↓
Aave burns 500 aUSDC, sends 500 USDC to address(laac)
   ↓
USDC contract updates:
  balances[laac] += 500e6
   ↓
aUSDC contract updates:
  balances[laac] -= 500e6
   ↓
Tokens automatically received!


Step 4: Log Receipt (On-Chain)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Oracle → Controller.receiveFromProtocol(USDC, AavePool, 500e6)
   ↓
Event: ReceivedFromProtocol(USDC, AavePool, 500e6, timestamp)
   ↓
Off-chain indexer logs this for reconciliation
```

## Multi-Protocol Support

LAAC automatically receives tokens from **ANY** protocol:

```
Aave returns USDC → address(laac) → Automatically received ✅
Compound returns USDC → address(laac) → Automatically received ✅
Curve returns USDC → address(laac) → Automatically received ✅
Lido returns stETH → address(laac) → Automatically received ✅
```

No special handling needed per protocol!

## Common Questions

### Q: Why not validate the token balance in `receiveFromProtocol()`?

**A:** Gas efficiency + oracle trust model.

Oracle is trusted to:
1. Unstake the correct amount off-chain
2. Call `receiveFromProtocol()` with correct parameters
3. Update vault index to reflect yield

Validating on-chain would require:
```solidity
uint256 balanceBefore = IERC20(token).balanceOf(address(laac));
// ... wait for protocol to send tokens ...
uint256 balanceAfter = IERC20(token).balanceOf(address(laac));
require(balanceAfter - balanceBefore >= amount, "Insufficient received");
```

This doesn't work because the tokens are already received BEFORE `receiveFromProtocol()` is called!

### Q: What if oracle lies about the amount received?

**A:** Off-chain monitoring catches this:

```javascript
// Indexer checks:
const controllerEvent = ReceivedFromProtocol(500e6);  // Oracle claims 500
const aaveEvent = Withdraw(address(laac), 500e6);     // Aave confirms 500

if (controllerEvent.amount !== aaveEvent.amount) {
  alert("Oracle lied about received amount!");
}
```

### Q: Can anyone send tokens to LAAC?

**A:** Yes, but it doesn't affect accounting!

```solidity
// Someone sends 1M USDC to LAAC as a gift:
IERC20(USDC).transfer(address(laac), 1_000_000e6);

// This increases LAAC's USDC balance, but:
// - Doesn't credit any user
// - Doesn't affect vault index
// - Oracle will treat it as extra buffer
// - Increases yield for all users (free money!)
```

This is actually **beneficial** - free yield for everyone!

### Q: What about native ETH?

**A:** Not supported in MVP. Would require:

```solidity
receive() external payable {
    // Handle ETH deposits
}
```

Add in Phase 2 if needed.

## Summary

| Aspect | Implementation |
|--------|----------------|
| **User deposits** | `LAAC.deposit()` - transfers tokens to LAAC |
| **Staking** | `Controller.executeTransfer()` - transfers to protocols |
| **Unstaking** | Oracle calls protocol directly - tokens sent to LAAC |
| **Receipt logging** | `Controller.receiveFromProtocol()` - emits event |
| **Token receiving** | Automatic (ERC20 standard) - no code needed |
| **Multi-token support** | Works for any ERC20 token automatically |
| **Validation** | Off-chain (oracle monitoring + event indexing) |

**Key Takeaway:** `receiveFromProtocol()` is for **tracking**, not **receiving**. LAAC receives tokens automatically via standard ERC20 transfers!
