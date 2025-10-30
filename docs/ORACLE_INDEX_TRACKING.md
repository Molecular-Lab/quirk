# Oracle Index Tracking Guide

## How Protocol Growth Tracking Works

The oracle tracks growth by reading **wrapped token exchange rates** from external DeFi protocols. This is migration-compatible with both single-tier and multi-tier systems.

## Core Concept

```
Protocol Growth = Wrapped Token Exchange Rate

Example:
Day 0:   1 aUSDT = 1.000000 USDT  → vaultIndex = 1.000000e18
Day 1:   1 aUSDT = 1.000137 USDT  → vaultIndex = 1.000137e18
Day 365: 1 aUSDT = 1.050000 USDT  → vaultIndex = 1.050000e18 (5% APY)
```

**Key Insight:** You don't calculate manually - you read the exchange rate directly from the wrapped token contract!

## Single-Tier System (Current - Backward Compatible)

### Oracle Service Implementation

```typescript
import { ethers } from 'ethers';
import cron from 'node-cron';

// Contract addresses
const LAAC_ADDRESS = "0x...";
const AAVE_AUSDT = "0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// ABIs
const aTokenABI = [
  "function getExchangeRate() view returns (uint256)",
  // or
  "function RESERVE_TREASURY_ADDRESS() view returns (address)",
  "function totalSupply() view returns (uint256)",
];

const laacABI = [
  "function updateVaultIndex(address token, uint256 newIndex) external"
];

async function updateVaultIndex() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
  
  // 1. Connect to aUSDT contract
  const aToken = new ethers.Contract(AAVE_AUSDT, aTokenABI, provider);
  
  // 2. Read current exchange rate (already accounts for all interest)
  const exchangeRate = await aToken.getExchangeRate();
  // Returns: 1050000000000000000 = 1.05e18 (5% growth)
  
  // 3. Update LAAC vault index
  const laac = new ethers.Contract(LAAC_ADDRESS, laacABI, signer);
  const tx = await laac.updateVaultIndex(USDT_ADDRESS, exchangeRate);
  await tx.wait();
  
  console.log(`✅ Updated USDT index to ${ethers.utils.formatEther(exchangeRate)}`);
}

// Run daily at midnight UTC
cron.schedule('0 0 * * *', async () => {
  try {
    await updateVaultIndex();
  } catch (error) {
    console.error('Failed to update vault index:', error);
    // Alert monitoring system
  }
});
```

### How Users Earn Yield (No Manual Calculation Needed)

```
User Alice deposits 10,000 USDT on Day 0:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Storage:
- account.balance = 10,000
- account.entryIndex = 1.0e18 (current vaultIndex at deposit time)

Oracle stakes in AAVE, receives 10,000 aUSDT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day 365: Oracle reads aUSDT rate and updates
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1 aUSDT = 1.05 USDT (AAVE accumulated 5% interest automatically)
Oracle calls: laac.updateVaultIndex(USDT, 1.05e18)

Alice's value calculation (automatic in contract):
totalValue = (balance × currentIndex) / entryIndex
          = (10,000 × 1.05e18) / 1.0e18
          = 10,500 USDT ✅

Alice earned 500 USDT yield without any manual tracking!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Multi-Tier System (New - Migration Compatible)

### Oracle Service with Multi-Tier Tracking

```typescript
// Protocol integrations
const PROTOCOLS = {
  riskFree: {
    name: "AAVE",
    aToken: "0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a", // aUSDT
    getRate: async (provider) => {
      const aToken = new ethers.Contract(
        PROTOCOLS.riskFree.aToken,
        ["function getExchangeRate() view returns (uint256)"],
        provider
      );
      return await aToken.getExchangeRate();
    }
  },
  mediumRisk: {
    name: "Compound",
    cToken: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9", // cUSDT
    getRate: async (provider) => {
      const cToken = new ethers.Contract(
        PROTOCOLS.mediumRisk.cToken,
        ["function exchangeRateStored() view returns (uint256)"],
        provider
      );
      return await cToken.exchangeRateStored();
    }
  },
  highRisk: {
    name: "Yearn",
    vault: "0x7Da96a3891Add058AdA2E826306D812C638D87a7", // yvUSDT
    getRate: async (provider) => {
      const vault = new ethers.Contract(
        PROTOCOLS.highRisk.vault,
        ["function pricePerShare() view returns (uint256)"],
        provider
      );
      return await vault.pricePerShare();
    }
  }
};

async function updateAllTierIndices() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
  const laac = new ethers.Contract(LAAC_ADDRESS, laacABI, signer);
  
  // Read rates from all protocols
  const riskFreeRate = await PROTOCOLS.riskFree.getRate(provider);
  const mediumRiskRate = await PROTOCOLS.mediumRisk.getRate(provider);
  const highRiskRate = await PROTOCOLS.highRisk.getRate(provider);
  
  console.log('Current Rates:');
  console.log(`  Risk-Free (AAVE):    ${ethers.utils.formatEther(riskFreeRate)}`);
  console.log(`  Medium-Risk (Compound): ${ethers.utils.formatEther(mediumRiskRate)}`);
  console.log(`  High-Risk (Yearn):   ${ethers.utils.formatEther(highRiskRate)}`);
  
  // Batch update all tiers in single transaction (gas efficient!)
  const tx = await laac.batchUpdateTierIndices(
    USDT_ADDRESS,
    riskFreeRate,
    mediumRiskRate,
    highRiskRate
  );
  await tx.wait();
  
  console.log('✅ All tier indices updated!');
}

// Alternative: Update individually
async function updateTierIndicesIndividually() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
  const laac = new ethers.Contract(LAAC_ADDRESS, laacABI, signer);
  
  // Update risk-free tier
  const riskFreeRate = await PROTOCOLS.riskFree.getRate(provider);
  await laac.updateTierIndex(USDT_ADDRESS, "riskFree", riskFreeRate);
  
  // Update medium-risk tier
  const mediumRiskRate = await PROTOCOLS.mediumRisk.getRate(provider);
  await laac.updateTierIndex(USDT_ADDRESS, "mediumRisk", mediumRiskRate);
  
  // Update high-risk tier
  const highRiskRate = await PROTOCOLS.highRisk.getRate(provider);
  await laac.updateTierIndex(USDT_ADDRESS, "highRisk", highRiskRate);
  
  console.log('✅ Individual tier indices updated!');
}

// Run every 6 hours for more frequent updates
cron.schedule('0 */6 * * *', updateAllTierIndices);
```

## Migration Compatibility

### Phase 1: Both Systems Running (Transition Period)

```typescript
async function updateBothSystems() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
  const laac = new ethers.Contract(LAAC_ADDRESS, laacABI, signer);
  
  // Get AAVE rate (risk-free tier)
  const aaveRate = await PROTOCOLS.riskFree.getRate(provider);
  
  // Update old system (for legacy users)
  await laac.updateVaultIndex(USDT_ADDRESS, aaveRate);
  
  // Update new multi-tier system
  const compoundRate = await PROTOCOLS.mediumRisk.getRate(provider);
  const yearnRate = await PROTOCOLS.highRisk.getRate(provider);
  
  await laac.batchUpdateTierIndices(
    USDT_ADDRESS,
    aaveRate,      // Risk-free tier
    compoundRate,  // Medium-risk tier
    yearnRate      // High-risk tier
  );
  
  console.log('✅ Both legacy and multi-tier systems updated!');
}
```

### Phase 2: Full Migration (After All Users Migrated)

```typescript
async function updateMultiTierOnly() {
  // Only update tier indices, deprecated updateVaultIndex
  await updateAllTierIndices();
}
```

## How Client Allocation Works with Growth Tracking

### Example: Company B with 70% Safe, 20% Medium, 10% Aggressive

```
Day 0: User deposits 10,000 USDT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contract auto-allocates based on Company B's config:
- 7,000 USDT → Risk-Free (AAVE)   @ index 1.0e18
- 2,000 USDT → Medium-Risk (Comp) @ index 1.0e18
- 1,000 USDT → High-Risk (Yearn)  @ index 1.0e18

Oracle stakes:
- 7,000 USDT → AAVE → 7,000 aUSDT
- 2,000 USDT → Comp → 2,000 cUSDT
- 1,000 USDT → Yearn → 1,000 yvUSDT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day 365: Oracle reads all three rates
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AAVE:    1 aUSDT = 1.05 USDT   (5% APY)
Compound: 1 cUSDT = 1.08 USDT   (8% APY)
Yearn:   1 yvUSDT = 1.12 USDT  (12% APY)

Oracle updates all tiers:
await laac.batchUpdateTierIndices(USDT, 1.05e18, 1.08e18, 1.12e18);
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User's value calculation (automatic in contract):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk-Free:   (7,000 × 1.05) / 1.0 = 7,350 USDT  (+350)
Medium-Risk: (2,000 × 1.08) / 1.0 = 2,160 USDT  (+160)
High-Risk:   (1,000 × 1.12) / 1.0 = 1,120 USDT  (+120)

Total: 10,630 USDT (+630 yield = 6.3% blended APY) ✅

User earned blended APY automatically based on client's allocation!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Key Advantages

### 1. No Manual Calculation
- Oracle just reads wrapped token rates
- DeFi protocols (AAVE, Compound, Yearn) handle all interest accumulation
- Contract calculates user yield automatically

### 2. Accurate Real-Time Growth
- Wrapped token rates update every block
- Oracle reads latest rate whenever it updates
- Users get exact protocol yield

### 3. Gas Efficient
- Single `batchUpdateTierIndices()` call updates all tiers
- No per-user tracking needed
- Scales to millions of users

### 4. Migration Compatible
- Old `updateVaultIndex()` still works
- New `updateTierIndex()` adds multi-tier support
- Can run both during transition

### 5. Protocol-Agnostic
- Works with any wrapped token: aTokens, cTokens, yvTokens, etc.
- Easy to add new protocols/tiers
- Just read exchange rate and update index

## Monitoring & Alerting

```typescript
async function monitorIndexHealth() {
  const laac = new ethers.Contract(LAAC_ADDRESS, laacABI, provider);
  
  // Check when indices were last updated
  const indices = await laac.tierIndices(USDT_ADDRESS);
  const timeSinceUpdate = Date.now() / 1000 - indices.updatedAt.toNumber();
  
  if (timeSinceUpdate > 86400) { // 24 hours
    console.warn('⚠️  Indices not updated in 24h!');
    // Alert ops team
  }
  
  // Verify indices are increasing (sanity check)
  const riskFreeIndex = indices.riskFreeIndex;
  if (riskFreeIndex.lt(ethers.utils.parseEther("1.0"))) {
    console.error('❌ Risk-free index below 1.0!');
    // Critical alert
  }
  
  console.log('✅ Index health check passed');
}

// Run health check every hour
cron.schedule('0 * * * *', monitorIndexHealth);
```

## Summary

**Oracle's Job:**
1. Read wrapped token exchange rates (aUSDT, cUSDT, yvUSDT)
2. Update tier indices in LAAC contract
3. That's it! Users automatically earn yield based on growth

**User's Experience:**
- Deposit → Auto-allocated to tiers (based on client config)
- Wait → Yield accrues automatically
- Withdraw → Get principal + yield (proportional across tiers)

**No manual tracking needed** - wrapped tokens do all the work! 🚀
