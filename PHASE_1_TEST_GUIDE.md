# Phase 1: Data Layer - Test Guide

> **Status:** ✅ Implementation Complete - Ready for Testing
> **Created:** 2025-12-02
> **Goal:** Verify real DeFi data flows from yield-engine → API → React Query → Dashboard

---

## 🎯 What We Just Built

### Backend (✅ Already Exists)
- ✅ `packages/core/service/defi-protocol.service.ts` - Wraps yield-engine
- ✅ `apps/b2b-api/src/service/defi-protocol.service.ts` - API service layer
- ✅ `apps/b2b-api/src/router/defi-protocol.router.ts` - API endpoints

### Frontend (✅ Already Exists)
- ✅ `apps/whitelabel-web/src/hooks/useDeFiProtocols.ts` - React Query hooks
- ✅ `apps/whitelabel-web/src/hooks/useMockUSDCBalance.ts` - Balance hook
- ✅ `apps/whitelabel-web/src/feature/dashboard/MarketPage.tsx` - UI with debugging

---

## 🚀 How to Test

### Step 1: Start Backend API

```bash
cd apps/b2b-api
pnpm dev
```

**Expected Output:**
```
Server listening on http://localhost:8888
```

### Step 2: Start Frontend

```bash
cd apps/whitelabel-web
pnpm dev
```

**Expected Output:**
```
Local: http://localhost:5173
```

### Step 3: Open Browser Console

1. Navigate to `http://localhost:5173/dashboard/market`
2. Open Chrome DevTools (F12)
3. Go to **Console** tab

**Expected Console Output:**
```
=== MARKET DASHBOARD DEBUG ===
Loading: false
Protocols: [
  {
    protocol: "aave",
    supplyAPY: "6.50",
    tvl: "$500M",
    ...
  },
  {
    protocol: "compound",
    supplyAPY: "4.80",
    tvl: "$300M",
    ...
  },
  {
    protocol: "morpho",
    supplyAPY: "7.20",
    tvl: "$150M",
    ...
  }
]
Errors: []
Balance: {
  raw: "1000000000",
  formatted: "1000.00",
  lastUpdate: Date
}
==============================
```

### Step 4: Verify UI Display

**Check the Dashboard:**

✅ **Header Section:**
- Shows "Market Intelligence" title
- Displays Mock USDC balance (updates every 10s)

✅ **Stats Overview Cards:**
- **Total TVL:** Shows sum of all protocols (e.g., "$950M")
- **Best APY:** Shows highest APY (e.g., "7.20%") and protocol name
- **Active Protocols:** Shows count (e.g., "3")

✅ **DeFi Lending Section:**
- Shows 3 protocol cards (AAVE, Compound, Morpho)
- Each card displays:
  - Protocol logo (letter in circle)
  - Supply APY (large green text)
  - TVL, Liquidity
  - Status badge (Healthy/Warning/Critical)
  - Toggle button (Overview ↔ Raw Data)

✅ **Left Column:**
- AI Chat interface
- Executor section with checkboxes

---

## 🐛 Troubleshooting

### Problem: Console shows "Loading: true" forever

**Possible Causes:**
1. Backend API not running
2. Wrong API URL in `.env`
3. CORS issues

**Fix:**
```bash
# Check backend is running
curl http://localhost:8888/api/v1/defi/protocols?token=USDC&chainId=8453

# Check .env file
cat apps/whitelabel-web/.env | grep VITE_API_URL
# Should show: VITE_API_URL=http://localhost:8888/api/v1
```

---

### Problem: Protocols array is empty

**Possible Causes:**
1. Yield-engine adapters failing to connect to blockchain
2. RPC URL issues
3. Smart contracts not deployed on Base Sepolia

**Fix:**
```bash
# Test yield-engine directly
cd packages/yield-engine
pnpm test

# Check RPC connection
curl https://sepolia.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

### Problem: Balance shows "Connect wallet"

**Possible Causes:**
1. `VITE_CUSTODIAL_WALLET_ADDRESS` not set in `.env`
2. Mock USDC contract address wrong
3. Wallet has zero balance

**Fix:**
```bash
# Check .env
cat apps/whitelabel-web/.env | grep CUSTODIAL

# Should show:
# VITE_CUSTODIAL_WALLET_ADDRESS=0x...
# VITE_MOCK_USDC_ADDRESS=0x...

# Mint some Mock USDC to the wallet (using oracle)
# TODO: Add mint script here
```

---

### Problem: CORS errors in console

**Error:**
```
Access to fetch at 'http://localhost:8888/api/v1/...' from origin 'http://localhost:5173' has been blocked by CORS
```

**Fix:**
```typescript
// apps/b2b-api/src/server.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

---

## ✅ Phase 1 Success Criteria

**Check all these before moving to Phase 2:**

- [ ] Backend API responds to `/api/v1/defi/protocols`
- [ ] Console shows 3 protocols (AAVE, Compound, Morpho)
- [ ] No errors in console
- [ ] Balance displays accurate amount from blockchain
- [ ] Stats cards show correct numbers (TVL, APY)
- [ ] Protocol cards render with real data
- [ ] Data auto-refreshes every 60 seconds
- [ ] Loading states work correctly
- [ ] Error handling works (test by killing backend)

---

## 📸 Screenshot Checklist

Take screenshots to track progress:

1. **Browser Console** - Showing protocols data
2. **Dashboard Header** - Balance display
3. **Stats Cards** - TVL, Best APY, Active Protocols
4. **DeFi Section** - Protocol cards with real data
5. **Network Tab** - API calls happening every 60s

---

## 🔜 Next Steps After Phase 1

Once all tests pass:

1. **Remove debug console.logs** from MarketPage
2. **Start Phase 2:** Build UI components
   - CategorySection with expand/collapse
   - ProtocolCard with toggle view
   - OverviewView and RawDataView components
3. **Update CORE_DOC.md** with Phase 1 completion status

---

## 🆘 Need Help?

**Quick Debugging Commands:**

```bash
# Check if API is running
curl http://localhost:8888/api/v1/defi/protocols?token=USDC&chainId=8453

# Check frontend environment
cd apps/whitelabel-web
cat .env

# Check backend environment
cd apps/b2b-api
cat .env

# Restart everything
pnpm dev  # From root directory
```

**Console Debug Commands:**

```javascript
// In browser console
localStorage.clear()  // Clear cache
window.location.reload(true)  // Hard refresh

// Check React Query cache
window.__REACT_QUERY_DEVTOOLS__
```

---

**Last Updated:** 2025-12-02
**Next Review:** After completing Phase 1 tests
**Status:** Ready for Testing
