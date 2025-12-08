# Complete Demo Flow Implementation

**Status:** ✅ Complete
**Created:** 2025-12-08

---

## 🎯 Complete Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Registration & Product Creation (Dashboard)      │
│    → Register Organization                                  │
│    → Create Product (get productId)                         │
│    → Get API Key (stored in localStorage: b2b:api_keys)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Product Configuration (Dashboard → Onboarding)          │
│    → Set business type, currencies, strategies             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Navigate to /demo                                        │
│    → DemoSelectorPage loads                                 │
│    → Fetch products by PrivyID                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Step 1: Choose Visualization Type                       │
│    → E-commerce / Creators / Gig Workers                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Step 2: Select Product                                  │
│    → Select from dropdown (Select UI)                       │
│    → OR use ProductSelector Sheet (new feature)             │
│    → Load API key from localStorage: b2b:api_keys           │
│    → Sync to demoProductStore                               │
│    → Sync to clientContextStore                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Click "Start Demo" → Navigate to demo page              │
│    → /demo/ecommerce OR /demo/creators OR /demo/gig-workers│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. DemoWrapper Validates Context                           │
│    → Check if selectedProduct exists in demoProductStore    │
│    → Verify clientContextStore has correct productId        │
│    → Verify clientContextStore has API key                  │
│    → If invalid → redirect back to /demo                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Demo App Interactions (as End-User)                     │
│    → Create Account (uses productId + API key)             │
│    → Deposit (creates fiat deposit via API)                 │
│    → View Balance                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Go to Dashboard → Ramp Operations                       │
│    → View deposit requests                                  │
│    → Process on-ramp (batch or single)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 State Management Flow

### 1. demoProductStore (Product Selection State)

**Location:** `apps/whitelabel-web/src/store/demoProductStore.ts`

**Purpose:** Manage product selection for demo mode

**State:**
```typescript
{
  availableProducts: Organization[]     // All products for user
  selectedProductId: string | null       // Selected product ID
  selectedProduct: Organization | null   // Selected product object
  visualizationType: VisualizationType   // E-commerce/Creators/Gig Workers
  isLoadingProducts: boolean
  loadError: string | null
}
```

**Key Methods:**
- `loadProductsByPrivyId(privyOrgId)` - Fetch products from API
- `selectProduct(productId, apiKey)` - Select product + sync to clientContextStore
- `selectVisualization(type)` - Set visualization type

---

### 2. clientContextStore (Global API Context)

**Location:** `apps/whitelabel-web/src/store/clientContextStore.ts`

**Purpose:** THE SINGLE SOURCE OF TRUTH for API calls

**State:**
```typescript
{
  clientId: string | null      // UUID from database
  productId: string | null     // e.g., "test_product_001"
  apiKey: string | null        // e.g., "test_pk_abc123..."
  companyName: string | null
  businessType: string | null
}
```

**Synced by:**
- `demoProductStore.selectProduct()` → calls `clientContextStore.setClientContext()`

**Used by:**
- All demo apps (EcommerceDemoApp, CreatorsDemoApp, GigWorkersDemoApp)
- All API calls (via b2bApiClient)

---

### 3. demoStore (End-User Demo State)

**Location:** `apps/whitelabel-web/src/store/demoStore.ts`

**Purpose:** Track end-user account creation and demo interactions

**State:**
```typescript
{
  endUserId: string | null         // Created user ID
  endUserClientUserId: string | null // demo_user_xxx
  hasEarnAccount: boolean
  isCreatingAccount: boolean
  isDepositing: boolean
  deposits: Deposit[]
}
```

---

## 🔧 API Key Storage

### localStorage Structure

```javascript
// Multi-organization API key storage
localStorage.setItem("b2b:api_keys", JSON.stringify({
  "test_product_001": "test_pk_abc123...",
  "prod_product_002": "prod_pk_xyz789...",
  // ... more products
}))

// Current active API key (synced from clientContextStore)
localStorage.setItem("b2b:api_key", "test_pk_abc123...")
localStorage.setItem("b2b:product_id", "test_product_001")
localStorage.setItem("b2b:client_id", "uuid-abc-123")
```

### How API Keys are Saved

**Location:** `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`

```typescript
// When client registers or regenerates API key
const saveApiKeyForOrg = (productId: string, apiKey: string) => {
  const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
  allKeys[productId] = apiKey
  localStorage.setItem("b2b:api_keys", JSON.stringify(allKeys))
}
```

### How API Keys are Loaded

**Location:** `apps/whitelabel-web/src/store/demoProductStore.ts`

```typescript
// When selecting product for demo
selectProduct: (productId, apiKey?) => {
  // Load from localStorage if not provided
  if (!apiKey) {
    const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
    apiKey = allKeys[productId]
  }

  // Sync to clientContextStore
  setClientContext({ productId, apiKey, ... })
}
```

---

## 🐛 Debugging API Key Issues

### Issue: "No API key configured" error in demo

**Check Console Logs:**

```javascript
// 1. Check if API key exists in localStorage
JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
// Expected: { "test_product_001": "test_pk_abc123..." }

// 2. Check demoProductStore logs
// Look for: "[demoProductStore] ✅ Product selected and synced to clientContextStore"
// Should show: hasApiKey: true, apiKeyPrefix: "test_pk_abc1..."

// 3. Check clientContextStore
useClientContextStore.getState().apiKey
// Expected: "test_pk_abc123..."

// 4. Check DemoWrapper logs
// Look for: "[DemoWrapper] ✅ Client context verified"
```

**Common Issues:**

1. **API key not saved after registration**
   - Go to Dashboard → API Testing
   - Click "Regenerate API Key"
   - Copy the new key (shown only once)
   - API key is automatically saved to localStorage

2. **Wrong product selected**
   - Go back to /demo
   - Select the correct product
   - Ensure the product has an API key in localStorage

3. **localStorage cleared**
   - Regenerate API key from Dashboard → API Testing
   - Select product again in /demo

---

## 📝 Code Changes Summary

### Files Created:
- ✅ `apps/whitelabel-web/src/feature/demo/ProductSelector.tsx` - Sheet UI for product selection

### Files Modified:
1. ✅ `apps/whitelabel-web/src/store/demoProductStore.ts`
   - Added `loadProductsByPrivyId()` method
   - Enhanced `selectProduct()` with API key loading
   - Added comprehensive logging

2. ✅ `apps/whitelabel-web/src/feature/demo/DemoWrapper.tsx`
   - Removed `apiKey` from `useUserStore()`
   - Added context verification from `clientContextStore`
   - Added redirect logic if context invalid

3. ✅ `apps/whitelabel-web/src/feature/demo/selector/DemoSelectorPage.tsx`
   - Added `Select` component import
   - Enhanced `handleProductSelect()` with API key validation
   - Added alert if API key not found

---

## ✅ Testing Checklist

### Pre-Demo Setup
- [ ] Client registered via Dashboard
- [ ] Product created (has productId)
- [ ] API key generated and saved in localStorage
- [ ] Product configured (currencies, strategies)

### Demo Flow Testing
- [ ] Navigate to /demo
- [ ] See product selector (Step 1: Choose Platform)
- [ ] Select visualization type (E-commerce/Creators/Gig Workers)
- [ ] See product selection (Step 2: Select Product)
- [ ] Select product from dropdown
- [ ] Verify console logs show API key loaded
- [ ] Click "Start Demo"
- [ ] Redirected to demo page (e.g., /demo/ecommerce)
- [ ] DemoWrapper validates context
- [ ] Demo app loads without errors
- [ ] Click "Start Earning" → Create Account
- [ ] Verify API call succeeds (check Network tab)
- [ ] Create Deposit
- [ ] Verify deposit appears in Ramp Operations Dashboard

### Error Handling Testing
- [ ] Select product WITHOUT API key → See alert
- [ ] Clear localStorage → Redirected to /demo
- [ ] Navigate to demo page directly → Redirected if no product selected

---

## 🚀 Next Steps (Optional Enhancements)

1. **Add ProductSelector to demo pages**
   - Allow switching products mid-demo
   - Show current product badge

2. **Improve error messages**
   - More specific error messages for API key issues
   - Link to Dashboard API Testing page

3. **Add demo reset button**
   - Clear demo state
   - Reset to product selection

4. **Add API key management in demo**
   - Show current API key status
   - Quick link to regenerate key

---

**Last Updated:** 2025-12-08
**Status:** ✅ Complete & Ready for Testing
**Next:** Test full flow from registration → demo → on-ramp dashboard
