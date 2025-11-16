# Simplified Routing Plan (Glider.Fi Pattern)

## ✅ What Glider.Fi Actually Has

Looking at Glider.Fi's navigation, they keep it **super simple**:

```
Left Sidebar:
├── Dashboard      (main overview)
├── Explore        (browse strategies)
├── Create         (modal/action, not a route)
├── Refer and Earn (simple page)
└── Portfolios     (expandable submenu)
    └── [Your portfolios listed here]

Bottom Sidebar:
├── Settings
├── Help
├── Feedback
└── Theme
```

**Total Routes: ~5 pages** (not 10+)

---

## 🎯 Proxify Simplified Routes

For our white-label dashboard (Client/Product Owner view):

```
/dashboard/
├── index.tsx              # Overview (portfolio summary, stats, charts)
├── explore.tsx            # Browse DeFi strategies (AAVE, Curve, Compound, Uniswap)
├── portfolios/
│   ├── index.tsx          # List all portfolios
│   └── [id].tsx           # Individual portfolio detail
└── settings/
    ├── index.tsx          # General settings
    ├── api-keys.tsx       # API credentials (moved from top level)
    ├── billing.tsx        # Billing & subscription (moved from top level)
    └── risk-config.tsx    # Risk tier allocation
```

---

## ❌ Remove These Routes

```diff
- /dashboard/api-keys      → Move to /dashboard/settings/api-keys
- /dashboard/analytics     → Merge into /dashboard (overview)
- /dashboard/billing       → Move to /dashboard/settings/billing
- /dashboard/docs          → External link, not a route
```

---

## 📊 What Each Page Shows

### 1. `/dashboard` (Overview)
**Purpose:** Main dashboard for Product Owner
**Content:**
- Total Value chart (1D, 1W, 1M, 1Y, All)
- Stats cards (Total Deposits, Current Value, All-Time Return)
- End-Users summary (total users, total AUM)
- Current Index (index growth chart)
- Recent Transactions
- AI Insights panel

**Example:**
```
┌────────────────────────────────────────────────────┐
│ Total Value: $10,070                               │
│ [Chart showing growth over time]                   │
│                                                    │
│ Stats:                                             │
│ • Total Deposits: $10,000                          │
│ • End-Users: 15                                    │
│ • Current Index: 1.007                             │
│ • APY: 7.3%                                        │
│                                                    │
│ AI Insights:                                       │
│ "Market conditions favor AAVE. Recommend           │
│  increasing allocation from 70% → 75%"             │
└────────────────────────────────────────────────────┘
```

---

### 2. `/dashboard/explore` (Browse Strategies)
**Purpose:** Discover pre-built DeFi strategies
**Content:**
- Strategy cards (like Glider's "The Big Five", "50/50 BTC and ETH")
- For us: "Conservative AAVE", "Balanced Multi-Protocol", "Aggressive Uniswap"
- Each shows: APY, Risk Level, Allocation breakdown

**Example:**
```
┌─────────────────────────────────────────────┐
│ Conservative AAVE                           │
│ 100% AAVE lending                           │
│                                             │
│ APY: 5.2%                                   │
│ Risk: Low                                   │
│ [Use This Strategy]                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Balanced Multi-Protocol                     │
│ 70% AAVE, 20% Curve, 10% Compound           │
│                                             │
│ APY: 7.3%                                   │
│ Risk: Low-Moderate                          │
│ [Use This Strategy]                         │
└─────────────────────────────────────────────┘
```

---

### 3. `/dashboard/portfolios` (List)
**Purpose:** Manage all client portfolios
**Content:**
- Table of all portfolios
- Columns: Name, Total Deposits, Current Value, Return, Actions

**Example:**
```
┌────────────────────────────────────────────────────────┐
│ My Portfolios                    [Create New Portfolio]│
├────────────────────────────────────────────────────────┤
│ Active (1) | Drafts (0) | Archived (0)                 │
├────────────────────────────────────────────────────────┤
│ Portfolio             Deposits    Value      Return    │
│ ────────────────────────────────────────────────────── │
│ Main Portfolio        $10,000     $10,070    +0.7%     │
│ Test Environment      $500        $503       +0.6%     │
└────────────────────────────────────────────────────────┘
```

---

### 4. `/dashboard/portfolios/[id]` (Detail)
**Purpose:** Deep dive into single portfolio
**Content:**
- Portfolio balance chart
- DeFi protocol breakdown (AAVE 70%, Curve 20%, Uniswap 10%)
- End-Users table (all users in this portfolio)
- Transaction history
- Rebalance controls

**Example:**
```
┌────────────────────────────────────────────────────────┐
│ Main Portfolio                   [Edit] [Share]        │
├────────────────────────────────────────────────────────┤
│ $10,070                                                │
│ +$70 (0.7%) • 1 month return                           │
│ [Chart]                                                │
│                                                        │
│ DeFi Allocations:                                      │
│ • AAVE:     $7,049 (70%) - 5.2% APY                    │
│ • Curve:    $2,014 (20%) - 8.1% APY                    │
│ • Uniswap:  $1,007 (10%) - 15.0% APY                   │
│                                                        │
│ End-Users (15):                                        │
│ user-001  $500  → $503.50  (+0.7%)                     │
│ user-002  $1,000 → $1,007  (+0.7%)                     │
│ [View All]                                             │
│                                                        │
│ [Deposit] [Withdraw] [Rebalance]                       │
└────────────────────────────────────────────────────────┘
```

---

### 5. `/dashboard/settings` (General)
**Purpose:** Account & preferences
**Content:**
- Profile settings
- Company info
- Notification preferences
- Theme toggle

---

### 6. `/dashboard/settings/api-keys` (API Credentials)
**Purpose:** Manage SDK credentials
**Content:**
- API key list
- Generate new key
- Revoke keys
- Usage stats

---

### 7. `/dashboard/settings/billing` (Subscription)
**Purpose:** Payment & plans
**Content:**
- Current plan (Starter, Growth, Enterprise)
- Usage vs limits
- Billing history
- Upgrade/downgrade

---

### 8. `/dashboard/settings/risk-config` (Risk Tiers)
**Purpose:** Configure DeFi allocation
**Content:**
- Risk tier slider (Conservative → Aggressive)
- Protocol allocation controls
- Auto-rebalancing settings

**Example:**
```
┌────────────────────────────────────────────┐
│ Risk Configuration                         │
│                                            │
│ [Conservative] ← ● → [Aggressive]          │
│                                            │
│ Protocol Allocation:                       │
│ • AAVE:     [====70%====] 70%              │
│ • Curve:    [==20%==]     20%              │
│ • Compound: [=5%=]        5%               │
│ • Uniswap:  [=5%=]        5%               │
│                                            │
│ Auto-Rebalance: [✓] Daily                  │
│                                            │
│ [Save Changes]                             │
└────────────────────────────────────────────┘
```

---

## 🎨 Sidebar Navigation (Simplified)

```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Explore', href: '/dashboard/explore', icon: Compass },
  { name: 'Portfolios', href: '/dashboard/portfolios', icon: Briefcase },
]

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare },
]
```

---

## 📁 File Structure

```
src/routes/
├── __root.tsx
├── index.tsx                    # Landing page
├── login.tsx
└── dashboard/
    ├── index.tsx                # Overview
    ├── explore.tsx              # Strategies
    ├── portfolios/
    │   ├── index.tsx            # List
    │   └── $id.tsx              # Detail (dynamic route)
    └── settings/
        ├── index.tsx            # General
        ├── api-keys.tsx
        ├── billing.tsx
        └── risk-config.tsx
```

---

## 🚀 Next Steps

1. **Delete old routes:**
   ```bash
   rm src/routes/dashboard/analytics.tsx
   rm src/routes/dashboard/docs.tsx
   # Move api-keys.tsx and billing.tsx to settings/
   ```

2. **Create new routes:**
   ```bash
   mkdir -p src/routes/dashboard/portfolios
   mkdir -p src/routes/dashboard/settings

   # Create files
   touch src/routes/dashboard/portfolios/index.tsx
   touch src/routes/dashboard/portfolios/\$id.tsx
   touch src/routes/dashboard/settings/index.tsx
   touch src/routes/dashboard/settings/api-keys.tsx
   touch src/routes/dashboard/settings/billing.tsx
   touch src/routes/dashboard/settings/risk-config.tsx
   ```

3. **Update DashboardLayout sidebar:**
   - Remove: API Keys, Analytics, Billing, Documentation
   - Keep: Dashboard, Explore, Portfolios, Settings

4. **Merge analytics into dashboard overview** (combine charts + stats)

---

**Result:** Clean, focused routing like Glider.Fi (4-5 main pages instead of 10+)
