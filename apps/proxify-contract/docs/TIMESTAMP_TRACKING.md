# Vault Index Timestamp Tracking

## Why Track `updatedAt` On-Chain?

### Problem Without Timestamps

```solidity
// Old approach - just the index value
mapping(address => uint256) public vaultIndex;

// Issues:
// ❌ Can't tell when index was last updated
// ❌ Can't detect if oracle is stale
// ❌ Can't calculate time-weighted yield on-chain (if needed later)
// ❌ Off-chain monitoring needs to track events
```

### Solution: Store Index + Timestamp

```solidity
struct VaultIndexData {
    uint256 index;       // Current vault index (1e18 = 1.0)
    uint256 updatedAt;   // Timestamp of last update
}

mapping(address => VaultIndexData) public vaultIndexData;
```

---

## Benefits

### 1. **Staleness Detection (On-Chain)**

Anyone can check if oracle is updating regularly:

```solidity
// Check if index is stale (not updated in 8 days)
function isIndexStale(address token) external view returns (bool) {
    VaultIndexData memory data = vaultIndexData[token];
    return block.timestamp - data.updatedAt > 8 days;
}
```

**Use Case:** Circuit breaker if oracle fails

```solidity
// In withdraw function - could add safety check
require(!isIndexStale(token), "Index too stale, withdrawals paused");
```

### 2. **Monitoring & Alerts**

Off-chain monitoring becomes simpler:

```typescript
// Check oracle health
const { index, updatedAt } = await laac.getVaultIndexWithTimestamp(USDC);
const hoursSinceUpdate = (Date.now() / 1000 - updatedAt) / 3600;

if (hoursSinceUpdate > 168) {  // 7 days
    alert("CRITICAL: Vault index not updated in 7 days!");
}
```

### 3. **Audit Trail**

Timestamps provide clear audit trail:

```typescript
// Query historical index updates
const updateEvents = await laac.queryFilter(
    laac.filters.VaultIndexUpdated()
);

updateEvents.forEach(event => {
    console.log(`${event.args.timestamp}: ${event.args.oldIndex} → ${event.args.newIndex}`);
});

// Verify updatedAt matches event timestamps
const { updatedAt } = await laac.getVaultIndexWithTimestamp(USDC);
const lastEvent = updateEvents[updateEvents.length - 1];
assert(updatedAt === lastEvent.args.timestamp);
```

### 4. **Time-Weighted Yield (Future)**

If you want to implement time-weighted yield on-chain later:

```solidity
function getTotalValueWithTimeWeighting(
    bytes32 clientId,
    bytes32 userId,
    address token
) external view returns (uint256) {
    Account memory account = accounts[clientId][userId][token];

    uint256 timeSinceDeposit = block.timestamp - account.depositTimestamp;
    uint256 timeSinceIndexUpdate = block.timestamp - vaultIndexData[token].updatedAt;

    // Could implement time-prorated yield here
    // ...
}
```

### 5. **Verify Oracle Consistency**

Check if oracle is updating as promised:

```typescript
// Oracle claims to update weekly
const EXPECTED_UPDATE_INTERVAL = 7 * 24 * 60 * 60;  // 7 days

const { updatedAt: lastUpdate } = await laac.getVaultIndexWithTimestamp(USDC);
const timeSinceUpdate = Date.now() / 1000 - lastUpdate;

if (timeSinceUpdate > EXPECTED_UPDATE_INTERVAL * 1.5) {
    console.warn("Oracle is behind schedule!");
}
```

---

## API Examples

### Get Index with Timestamp

```typescript
// New function - returns both
const { index, updatedAt } = await laac.getVaultIndexWithTimestamp(USDC);

console.log(`Index: ${index / 1e18}`);  // e.g., 1.003
console.log(`Last updated: ${new Date(updatedAt * 1000)}`);  // e.g., 2025-10-15
```

### Backward Compatible

```typescript
// Old function still works - just returns index
const index = await laac.getVaultIndex(USDC);
console.log(`Index: ${index / 1e18}`);
```

### Direct Struct Access

```solidity
// Can also access struct directly (public mapping)
VaultIndexData memory data = laac.vaultIndexData(USDC);
uint256 index = data.index;
uint256 updatedAt = data.updatedAt;
```

---

## Gas Cost

### Additional Storage

```
Before: uint256 (32 bytes)
After: struct { uint256, uint256 } (64 bytes)

Extra cost per update: ~20,000 gas (one additional SSTORE)
```

### Cost Analysis

```
updateVaultIndex() gas cost:
- Before: ~45k gas
- After: ~65k gas
- Increase: ~20k gas (~44% more)

At 30 gwei: $3/update → ~$4/update
Weekly: $156/year → $208/year
Increase: ~$52/year

At $10M TVL earning $50k/year: 0.1% extra cost
```

**Verdict:** Extra $52/year is negligible for the added transparency!

---

## Security Benefits

### Circuit Breaker

```solidity
// Guardian can add emergency check
modifier requireFreshIndex(address token) {
    require(
        block.timestamp - vaultIndexData[token].updatedAt < 14 days,
        "Index too stale"
    );
    _;
}

function withdraw(...) external requireFreshIndex(token) {
    // Only allow withdrawals if index updated recently
}
```

### Rate of Change Detection

```typescript
// Monitor if index is growing too fast (possible exploit)
const events = await laac.queryFilter(laac.filters.VaultIndexUpdated());

for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];

    const timeElapsed = curr.args.timestamp - prev.args.timestamp;
    const indexGrowth = curr.args.newIndex / prev.args.oldIndex;

    // If index grew >10% in <1 day, investigate!
    if (indexGrowth > 1.10 && timeElapsed < 86400) {
        alert("SUSPICIOUS: Index grew 10%+ in 1 day!");
    }
}
```

---

## Implementation Details

### Struct Definition

```solidity
struct VaultIndexData {
    uint256 index;       // Vault index value (1e18 precision)
    uint256 updatedAt;   // Block timestamp of last update
}

mapping(address => VaultIndexData) public vaultIndexData;
```

### Update Function

```solidity
function updateVaultIndex(address token, uint256 newIndex)
    external
    onlyController
{
    require(supportedTokens[token], "Token not supported");
    require(newIndex >= vaultIndexData[token].index, "Index cannot decrease");

    uint256 oldIndex = vaultIndexData[token].index;

    // Update both index and timestamp atomically
    vaultIndexData[token] = VaultIndexData({
        index: newIndex,
        updatedAt: block.timestamp  // ← Automatically tracked!
    });

    emit VaultIndexUpdated(token, oldIndex, newIndex, block.timestamp);
}
```

### Initialization

```solidity
function _addSupportedToken(address token) external onlyController {
    require(token != address(0), "Invalid token");
    require(!supportedTokens[token], "Already supported");

    supportedTokens[token] = true;

    // Initialize with timestamp
    if (vaultIndexData[token].index == 0) {
        vaultIndexData[token] = VaultIndexData({
            index: 1e18,              // Start at 1.0
            updatedAt: block.timestamp // Set initial timestamp
        });
    }
}
```

---

## Monitoring Dashboard Example

```typescript
// Real-time monitoring dashboard
async function displayVaultStatus() {
    const tokens = [USDC, USDT, DAI];

    for (const token of tokens) {
        const { index, updatedAt } = await laac.getVaultIndexWithTimestamp(token);
        const hoursSinceUpdate = (Date.now() / 1000 - updatedAt) / 3600;

        console.log(`\n${token}:`);
        console.log(`  Index: ${(index / 1e18).toFixed(6)}`);
        console.log(`  Last updated: ${new Date(updatedAt * 1000).toISOString()}`);
        console.log(`  Hours since update: ${hoursSinceUpdate.toFixed(1)}`);

        if (hoursSinceUpdate > 168) {
            console.log(`  ⚠️  WARNING: Index stale!`);
        } else {
            console.log(`  ✅ Fresh`);
        }
    }
}

// Run every hour
setInterval(displayVaultStatus, 3600 * 1000);
```

---

## Summary

### What We Track

| Field | Type | Purpose |
|-------|------|---------|
| `index` | uint256 | Current vault index value |
| `updatedAt` | uint256 | Block timestamp of last update |

### Why It's Valuable

1. ✅ **Staleness detection** - Know if oracle stopped updating
2. ✅ **Audit trail** - Clear history of when updates occurred
3. ✅ **Monitoring** - Simpler off-chain alerting
4. ✅ **Future-proof** - Enables time-weighted features later
5. ✅ **Security** - Can add circuit breakers based on freshness

### Cost

- **Extra gas:** ~20k per index update (~$1 @ 30 gwei)
- **Annual cost:** ~$52/year (52 updates @ $1 each)
- **Percentage of revenue:** 0.1% at $10M TVL
- **Verdict:** Negligible cost for significant transparency benefit ✅

---

*Added: 2025-10-19*
*Status: Implemented and compiled successfully*
