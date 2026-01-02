# 🏢 Multi-Product Architecture - How It Works

## Question
**"Will this setup still work if user has multiple products?"**

## Answer: ✅ YES - With Minor Updates

---

## 🎯 Current Multi-Product Support

### Global State (Already Implemented)
```typescript
// userStore.ts
{
  organizations: Organization[]        // Array of all products
  activeProductId: string | null       // Currently selected product
  setActiveOrganization(productId)     // Switch between products
  getActiveOrganization()              // Get current active product
}
```

### Example: User with 3 Products
```typescript
organizations = [
  { productId: "prod_grabpay_123", companyName: "GrabPay" },
  { productId: "prod_grabfood_456", companyName: "GrabFood" },
  { productId: "prod_grabmart_789", companyName: "GrabMart" }
]

activeProductId = "prod_grabpay_123"  // Currently viewing GrabPay
```

---

## 🔄 How Multi-Product Flow Works

### Scenario: User Switches from GrabPay → GrabFood

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Configure Each Product (Setup Phase)          │
└─────────────────────────────────────────────────────────┘

/dashboard/products/prod_grabpay_123
├─ Select "Conservative" risk profile
├─ Aave 60%, Compound 30%, Morpho 10%
└─ Save to DB ✅

/dashboard/products/prod_grabfood_456
├─ Select "Aggressive" risk profile
├─ Aave 20%, Compound 25%, Morpho 55%
└─ Save to DB ✅

/dashboard/products/prod_grabmart_789
├─ Select "Moderate" risk profile
├─ Aave 40%, Compound 35%, Morpho 25%
└─ Save to DB ✅


┌─────────────────────────────────────────────────────────┐
│  Step 2: Use Earn Page (Operations Phase)              │
└─────────────────────────────────────────────────────────┘

User goes to /dashboard/earn

┌───────────────────────────────────────┐
│ [ProductSwitcher: GrabPay ▼]         │  ← Switch products
├───────────────────────────────────────┤
│ Tab: Explore | My Strategy | History │
├───────────────────────────────────────┤
│                                       │
│ Active Strategy: Conservative         │
│ • Aave 60% | Compound 30% | ...      │  ← Loaded from DB
│ • Expected APY: 3.63%                 │     for GrabPay
│                                       │
│ [Deposit $1000]                       │  ← Deposits to GrabPay
│                                       │
└───────────────────────────────────────┘

User clicks ProductSwitcher → Selects "GrabFood"

┌───────────────────────────────────────┐
│ [ProductSwitcher: GrabFood ▼]        │  ← Now showing GrabFood
├───────────────────────────────────────┤
│ Tab: Explore | My Strategy | History │
├───────────────────────────────────────┤
│                                       │
│ Active Strategy: Aggressive           │
│ • Aave 20% | Compound 25% | ...      │  ← Loaded from DB
│ • Expected APY: 5.82%                 │     for GrabFood
│                                       │
│ [Deposit $500]                        │  ← Deposits to GrabFood
│                                       │
└───────────────────────────────────────┘
```

---

## ✅ ProductConfigPage (Already Multi-Product Ready)

```typescript
// File: ProductConfigPage.tsx

export function ProductConfigPage() {
  // ✅ Uses activeProductId from global state
  const { activeProductId, organizations } = useUserStore()
  
  // ✅ Has ProductSwitcher component
  return (
    <div>
      <ProductSwitcher />  {/* Switch between products */}
      
      {/* Risk profile configuration for CURRENT product */}
      <RiskProfileSelector />
      
      {/* Save button saves to activeProductId */}
      <Button onClick={() => saveConfig(activeProductId)}>
        Save Configuration
      </Button>
    </div>
  )
}
```

**Result:** Each product gets its own configuration in the database!

---

## ⚠️ YieldDashboard (Needs Update)

### Current Implementation (Missing Product Context)
```typescript
// File: YieldDashboard.tsx (CURRENT)

export function YieldDashboard() {
  // ❌ Only uses privyWalletAddress, ignores activeProductId
  const privyWalletAddress = useUserStore((state) => state.privyWalletAddress)
  
  // ❌ No ProductSwitcher component
  // ❌ Doesn't load strategy from database
  // ❌ Deposit/withdraw don't know which product to use
  
  return (
    <div>
      {/* Missing product context! */}
      <DepositButton />
    </div>
  )
}
```

### Required Updates (Make It Multi-Product Ready)
```typescript
// File: YieldDashboard.tsx (UPDATED)

import { ProductSwitcher } from "@/components/ProductSwitcher"
import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"

export function YieldDashboard() {
  // ✅ Get activeProductId from global state
  const { activeProductId, organizations } = useUserStore()
  const privyWalletAddress = useUserStore((state) => state.privyWalletAddress)
  const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
  
  // ✅ Load strategy for current product from database
  const [activeStrategy, setActiveStrategy] = useState(null)
  
  useEffect(() => {
    if (activeProductId) {
      loadProductStrategy(activeProductId)
    }
  }, [activeProductId])
  
  const loadProductStrategy = async (productId: string) => {
    const { strategies } = await getEffectiveProductStrategies(productId)
    setActiveStrategy(strategies)
  }
  
  return (
    <div>
      {/* ✅ Add ProductSwitcher */}
      <div className="flex justify-between">
        <h1>Earn</h1>
        <ProductSwitcher />
      </div>
      
      {/* Strategy Tab */}
      <Tab value="strategies">
        <div>
          <h2>Active Strategy</h2>
          
          {/* ✅ Show strategy loaded from DB */}
          {activeStrategy && (
            <div>
              <p>Aave: {activeStrategy.lending.aave}%</p>
              <p>Compound: {activeStrategy.lending.compound}%</p>
              <p>Morpho: {activeStrategy.lending.morpho}%</p>
            </div>
          )}
          
          {/* ✅ Pass activeProductId to modals */}
          <Button onClick={() => setShowDepositModal(true)}>
            Deposit
          </Button>
        </div>
      </Tab>
      
      {/* ✅ Deposit modal uses activeProductId */}
      <EarnDepositModal 
        productId={activeProductId}
        strategy={activeStrategy}
        onClose={() => setShowDepositModal(false)}
      />
    </div>
  )
}
```

---

## 📊 Database Schema (Already Multi-Product)

```sql
-- Table: client_organizations
CREATE TABLE client_organizations (
  product_id VARCHAR PRIMARY KEY,        -- prod_grabpay_123
  company_name VARCHAR,                  -- "GrabPay"
  
  -- ✅ Each product has its own strategy
  strategies_customization JSONB,        -- { "lending": { "aave": 60, ... } }
  
  -- ✅ Each product has its own API keys
  sandbox_api_key_prefix VARCHAR,        -- sk_test_xxx
  production_api_key_prefix VARCHAR,     -- sk_live_xxx
  
  -- ✅ Each product has its own fee config
  client_revenue_share_percent DECIMAL   -- 15.00
)
```

**Example Data:**
```sql
-- GrabPay (Conservative)
INSERT INTO client_organizations VALUES (
  'prod_grabpay_123',
  'GrabPay',
  '{"lending": {"aave": 60, "compound": 30, "morpho": 10}}'
)

-- GrabFood (Aggressive)
INSERT INTO client_organizations VALUES (
  'prod_grabfood_456',
  'GrabFood',
  '{"lending": {"aave": 20, "compound": 25, "morpho": 55}}'
)
```

---

## ✅ Complete Multi-Product Flow

```
┌────────────────────────────────────────────────────────┐
│                    User Login                          │
└────────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────┐
    │  userStore.loadOrganizations()           │
    │  Fetches all products from database:     │
    │  • GrabPay (prod_grabpay_123)           │
    │  • GrabFood (prod_grabfood_456)         │
    │  • GrabMart (prod_grabmart_789)         │
    │                                          │
    │  Sets activeProductId = prod_grabpay_123 │
    └──────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────┐
│              ProductSwitcher Component                  │
│  Shows: [GrabPay ▼]                                    │
│                                                        │
│  User can click to switch between:                     │
│  ✓ GrabPay (currently active)                          │
│  ○ GrabFood                                            │
│  ○ GrabMart                                            │
└────────────────────────────────────────────────────────┘
                           ↓
    ┌─────────────────────────────────────────┐
    │  All Pages Use activeProductId          │
    ├─────────────────────────────────────────┤
    │                                         │
    │  ProductConfigPage:                     │
    │  • Loads config for activeProductId     │
    │  • Saves to activeProductId             │
    │                                         │
    │  YieldDashboard (Earn):                 │
    │  • Loads strategy for activeProductId   │
    │  • Deposits to activeProductId          │
    │  • Shows history for activeProductId    │
    │                                         │
    │  RampOperationsPage:                    │
    │  • Shows operations for activeProductId │
    └─────────────────────────────────────────┘
```

---

## 🔧 Required Changes Summary

### 1. Update YieldDashboard.tsx
```diff
+ import { ProductSwitcher } from "@/components/ProductSwitcher"
+ import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"

export function YieldDashboard() {
-  const privyWalletAddress = useUserStore((state) => state.privyWalletAddress)
+  const { activeProductId, organizations } = useUserStore()
+  const privyWalletAddress = useUserStore((state) => state.privyWalletAddress)
  
+  // Load strategy from database for current product
+  const [activeStrategy, setActiveStrategy] = useState(null)
+  
+  useEffect(() => {
+    if (activeProductId) {
+      loadProductStrategy(activeProductId)
+    }
+  }, [activeProductId])
  
  return (
    <div>
+      <ProductSwitcher />
      
      {/* Pass activeProductId to modals */}
      <EarnDepositModal 
+        productId={activeProductId}
+        strategy={activeStrategy}
      />
    </div>
  )
}
```

### 2. Update EarnDepositModal.tsx
```diff
interface EarnDepositModalProps {
+  productId: string
+  strategy: StrategyConfig
   // ... other props
}

export function EarnDepositModal({ 
+  productId,
+  strategy,
   // ...
}: EarnDepositModalProps) {
   // Use strategy from props (loaded from DB)
+  const allocations = [
+    { protocol: "aave", percentage: strategy.lending.aave },
+    { protocol: "compound", percentage: strategy.lending.compound },
+    { protocol: "morpho", percentage: strategy.lending.morpho },
+  ]
   
   // Execute deposit using productId
+  await executeDeposit(productId, amount, allocations)
}
```

---

## ✅ Result: Fully Multi-Product System

```
User Has 3 Products:

┌─────────────────┬──────────────┬─────────────────────────┐
│ Product         │ Risk Profile │ Saved Strategy          │
├─────────────────┼──────────────┼─────────────────────────┤
│ GrabPay         │ Conservative │ A:60% C:30% M:10%       │
│ GrabFood        │ Aggressive   │ A:20% C:25% M:55%       │
│ GrabMart        │ Moderate     │ A:40% C:35% M:25%       │
└─────────────────┴──────────────┴─────────────────────────┘

User Flow:
1. Click ProductSwitcher → Select "GrabFood"
2. activeProductId changes to "prod_grabfood_456"
3. YieldDashboard loads Aggressive strategy from DB
4. User deposits $500 → Goes to GrabFood vault
5. Click ProductSwitcher → Select "GrabPay"
6. activeProductId changes to "prod_grabpay_123"
7. YieldDashboard loads Conservative strategy from DB
8. User deposits $1000 → Goes to GrabPay vault

Each product operates independently with its own:
• Strategy configuration
• Balance
• Transaction history
• API keys
• Fee settings
```

---

## 🎯 Final Answer

### ✅ Will It Work with Multiple Products?

**YES!** The architecture is already designed for multi-product:

1. ✅ **Database**: Stores separate config per `product_id`
2. ✅ **Global State**: Tracks `activeProductId` and all `organizations`
3. ✅ **ProductConfigPage**: Already multi-product ready
4. ⚠️ **YieldDashboard**: Needs minor updates (add ProductSwitcher, load strategy from DB)

### Required Changes
- [ ] Add `ProductSwitcher` to YieldDashboard header
- [ ] Load strategy from `getEffectiveProductStrategies(activeProductId)`
- [ ] Pass `activeProductId` to deposit/withdraw modals
- [ ] Pass `strategy` from DB to modals (don't hardcode)

**Estimated Time:** 30 minutes to update YieldDashboard for multi-product support

---

## 📝 Implementation Checklist

- [ ] Update YieldDashboard to use `activeProductId`
- [ ] Add `ProductSwitcher` component to header
- [ ] Load strategy from database on mount and when product changes
- [ ] Pass `productId` to `EarnDepositModal`
- [ ] Pass `productId` to `WithdrawalExecutionModal`
- [ ] Update transaction history to filter by `activeProductId`
- [ ] Test switching between products and verify correct strategy loads

