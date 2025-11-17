# Contract Updates Summary

## Date: October 29, 2025

## 1. Oracle Index Update Workflow (PROXIFY_WORKFLOW_VISUALIZATION.md)

### Problem Identified:
When new deposits arrive while funds are already staked, the oracle must update tier indices **BEFORE** staking new funds. Otherwise, growth calculations become incorrect.

### Example of the Problem:
```
Day 1:  Stake $1,000 → Aave
Day 15: Aave grows to $1,030 (3% growth)
Day 15: New user deposits $10M

❌ If oracle stakes $10M WITHOUT updating index:
   Next update: currentBalance = $10,001,030
               previousBalance = $10,001,000
               growth = 1.00003 (0.003% instead of 3%!)

✅ Correct approach:
   1. Read currentBalance = $1,030
   2. Calculate: 1,030 / 1,000 = 1.03
   3. Update index: 1.0 → 1.03
   4. THEN stake the $10M (enters at 1.03)
```

### Solution Implemented:
Added **Step 4B** to PROXIFY_WORKFLOW_VISUALIZATION.md showing:
- Oracle checks if tier has existing stakes
- If yes, reads protocol balance and calculates growth
- Updates index on-chain FIRST
- THEN stakes new deposits
- Updates off-chain records

### Oracle Golden Rule:
**ALWAYS update index before staking new funds!**

---

## 2. Configurable Client Fee Split

### Problem Identified:
Fee split was hardcoded as 95% protocol, 5% client:
```solidity
// OLD CODE (hardcoded)
uint256 protocolShare = (exec.serviceFee * 95) / 100;
uint256 clientShare = exec.serviceFee - protocolShare;
```

This doesn't allow flexibility for different client agreements.

### Solution Implemented:

#### A. Updated ClientInfo Struct
Added `clientFeeBps` field to store client's share of service fee:

```solidity
struct ClientInfo {
    string name;
    address clientAddress;
    bool isActive;
    uint256 registeredAt;
    uint16 feeBps;           // Existing
    uint16 serviceFeeBps;    // Existing
    uint16 clientFeeBps;     // NEW - Client's share of service fee (e.g., 500 = 5%)
}
```

#### B. Updated ProxifyClientRegistry.sol

**registerClient():**
```solidity
function registerClient(
    bytes32 clientId,
    address clientAddress,
    string calldata name,
    uint16 feeBps,
    uint16 serviceFeeBps,
    uint16 clientFeeBps  // NEW parameter
) external onlyRole(ORACLE_ROLE) {
    // Validation
    require(clientFeeBps <= MAX_FEE_BPS, "Invalid clientFeeBps");
    require(clientFeeBps <= 5000, "Client fee cannot exceed 50%");
    
    clients[clientId] = ClientInfo({
        name: name,
        clientAddress: clientAddress,
        isActive: true,
        registeredAt: block.timestamp,
        feeBps: feeBps,
        serviceFeeBps: serviceFeeBps,
        clientFeeBps: clientFeeBps  // NEW field
    });
}
```

**updateClientFees():**
```solidity
function updateClientFees(
    bytes32 clientId,
    uint16 feeBps,
    uint16 serviceFeeBps,
    uint16 clientFeeBps  // NEW parameter
) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(clientFeeBps <= MAX_FEE_BPS, "Invalid clientFeeBps");
    require(clientFeeBps <= 5000, "Client fee cannot exceed 50%");
    
    clients[clientId].feeBps = feeBps;
    clients[clientId].serviceFeeBps = serviceFeeBps;
    clients[clientId].clientFeeBps = clientFeeBps;  // NEW field update
}
```

#### C. Updated Proxify.sol

**batchWithdraw():**
```solidity
// Read client's fee configuration
IProxifyClientRegistry.ClientInfo memory clientInfo = clientRegistry.getClientInfo(exec.clientId);

// Calculate fee split based on client's configured share
// clientFeeBps is in basis points (e.g., 500 = 5%)
uint256 clientShare = (exec.serviceFee * clientInfo.clientFeeBps) / 10000;
uint256 protocolShare = exec.serviceFee - clientShare;

// Allocate fees
protocolRevenueVault[exec.token] += protocolShare;
clientRevenueVault[exec.clientId][exec.token] += clientShare;
```

#### D. Updated IProxifyClientRegistry.sol
- Updated `ClientInfo` struct documentation
- Updated `registerClient()` function signature
- Updated `updateClientFees()` function signature

---

## 3. Validation Rules

### Client Fee Limits:
```solidity
require(clientFeeBps <= MAX_FEE_BPS, "Invalid clientFeeBps");      // Max 100%
require(clientFeeBps <= 5000, "Client fee cannot exceed 50%");     // Max 50% of service fee
```

### Examples:
- **clientFeeBps = 500** → Client gets 5% of service fee, Protocol gets 95%
- **clientFeeBps = 1000** → Client gets 10% of service fee, Protocol gets 90%
- **clientFeeBps = 5000** → Client gets 50% of service fee, Protocol gets 50% (maximum)

---

## 4. Files Modified

1. ✅ **PROXIFY_WORKFLOW_VISUALIZATION.md**
   - Added Step 4.1: Oracle must update indices before staking
   - Added Step 4B: Handling new deposits after initial staking
   - Added oracle record tracking examples

2. ✅ **contracts/ProxifyClientRegistry.sol**
   - Added `clientFeeBps` parameter to `registerClient()`
   - Added `clientFeeBps` parameter to `updateClientFees()`
   - Added validation: max 50% client fee share

3. ✅ **contracts/interfaces/IProxifyClientRegistry.sol**
   - Updated `ClientInfo` struct with `clientFeeBps` field
   - Updated function signatures

4. ✅ **contracts/Proxify.sol**
   - Replaced hardcoded 95/5 split with dynamic calculation
   - Reads `clientFeeBps` from ClientRegistry
   - Calculates split based on configured value

---

## 5. Compilation Status

```bash
✅ Compiled 4 Solidity files with solc 0.8.28 (evm target: cancun)
✅ Nothing to compile
```

All contracts compile successfully!

---

## 6. Migration Notes

### For Existing Clients:
When registering clients, you must now provide `clientFeeBps`:

```javascript
// Example: Register client with 5% fee share (500 bps)
await proxifyClientRegistry.registerClient(
  clientId,
  clientAddress,
  "Bitkub",
  500,   // feeBps
  2000,  // serviceFeeBps (20% service fee)
  500    // clientFeeBps (5% of service fee goes to client)
);
```

### Default Values:
- **Standard clients:** `clientFeeBps = 500` (5% client, 95% protocol)
- **Premium clients:** `clientFeeBps = 1000` (10% client, 90% protocol)
- **Enterprise clients:** `clientFeeBps = 2000` (20% client, 80% protocol)

---

## 7. Testing Checklist

- [ ] Test `registerClient()` with various `clientFeeBps` values
- [ ] Test `updateClientFees()` to change client fee share
- [ ] Test fee distribution in `batchWithdraw()` with different client configs
- [ ] Test validation: `clientFeeBps > 5000` should revert
- [ ] Test edge case: `clientFeeBps = 0` (100% to protocol)
- [ ] Test edge case: `clientFeeBps = 5000` (50/50 split)
- [ ] Test oracle workflow: update index before staking
- [ ] Test oracle workflow: handling continuous deposits

---

## 8. Next Steps

1. **Update deployment scripts** to include `clientFeeBps` parameter
2. **Update test suite** to test configurable fee splits
3. **Update documentation** for client onboarding process
4. **Implement oracle off-chain tracking** for stake amounts per tier
5. **Add monitoring** for index staleness detection
6. **Create admin dashboard** to adjust client fee configurations

---

**Status:** ✅ All changes implemented and compiled successfully
