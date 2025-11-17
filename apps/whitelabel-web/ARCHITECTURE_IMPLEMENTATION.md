# Whitelabel Web - Cleverse Architecture Implementation

**Status:** 🚧 In Progress (70% Complete)
**Date:** November 16, 2025
**Branch:** `feat/proxify-b2b-services`

---

## ✅ Completed Architecture

### 1. Type System (`src/types/`)
All types based on PRODUCT_OWNER_FLOW.md V4 schema:
- `client.ts` - Client/Product Owner entities
- `end-user.ts` - End-user deposits with index-based accounting
- `vault-index.ts` - Vault index tracking
- `defi-protocol.ts` - DeFi allocations (AAVE, Compound, Curve, Uniswap)
- `transaction.ts` - Transaction history
- `ai-insights.ts` - AI agent recommendations
- `index.ts` - Common API response types, DashboardMetrics, ClientProfile

### 2. API Layer (`src/lib/`)
- **`api-client.ts`** - Axios instance with:
  - Base URL configuration
  - Auth token interceptors (Privy integration)
  - Error handling (401 → logout, 403, 404, 500)
  - Centralized endpoints
  
- **`query-client.ts`** - TanStack Query setup with:
  - Stale time: 30 seconds
  - Cache time: 5 minutes
  - Auto-retry with exponential backoff
  - Refetch on window focus (good for financial data)
  - Centralized query keys for cache management

### 3. Custom Hooks (`src/hooks/`)
All data fetching logic abstracted into reusable hooks:

**End-Users:**
- `useEndUsers()` - Fetch all end-users
- `useEndUser(userId)` - Single user details
- `useEndUserValue(userId)` - Real-time value calculation (refetch every 60s)
- `useCreateDeposit()` - Mutation for deposits

**Vault Index:**
- `useVaultIndex()` - Current index (refetch every 5 min)
- `useVaultIndexHistory(days)` - Historical data for charts
- `useVaultIndexMetrics()` - Growth metrics (daily, weekly, monthly, all-time)

**DeFi Protocols:**
- `useDefiProtocols()` - Protocol statuses (AAVE, Curve, etc.)
- `useDefiAllocations()` - Current allocations
- `useUpdateAllocation()` - Mutation for risk tier changes
- `RISK_TIER_CONFIGS` - Predefined low/moderate/high configurations

**Transactions:**
- `useTransactions(filters)` - Paginated transaction list
- `useTransactionSummary()` - Total deposits, withdrawals, yield
- `useTransaction(txId)` - Single transaction detail

**AI Insights:**
- `useAIInsights(priority?)` - AI recommendations
- `useAIInsightsSummary()` - Insight counts
- `useMarkInsightActedUpon()` - Mark insight as resolved

**Dashboard:**
- `useDashboardMetrics()` - Real-time metrics (refetch every 60s)
- `useClientProfile()` - Client info

### 4. Utility Functions (`src/utils/`)
- **`format-currency.ts`** - Currency, percent, number formatting
- **`calculate-apy.ts`** - APY calculations, daily rates, expected yield
- **`calculate-user-value.ts`** - Index-based value calculations:
  ```typescript
  value = (balance × currentIndex) / entryIndex
  ```
- **`cn.ts`** - Tailwind class merging utility

### 5. UI Components (`src/components/`)
Started:
- `cards/StatCard.tsx` - Metric cards with trend indicators
- `cards/ProtocolCard.tsx` - DeFi protocol display cards

---

## 🚧 TODO: Remaining Work

### 1. Complete UI Components
Missing components:
```
src/components/
  ├── charts/
  │   ├── PortfolioChart.tsx        ❌ (Recharts area chart)
  │   └── IndexGrowthChart.tsx      ❌ (Line chart for index history)
  ├── tables/
  │   ├── EndUsersTable.tsx         ❌ (User list with sorting)
  │   └── TransactionsTable.tsx     ❌ (TX history with pagination)
  └── cards/ (Already created ✅)
```

### 2. Create Missing Dashboard Pages
Based on PRODUCT_OWNER_FLOW.md requirements:

```
src/routes/dashboard/
  ├── end-users.tsx          ❌ List all end-users + balances
  ├── risk-config.tsx        ❌ Risk tier allocation (AAVE 70%, Curve 20%, etc.)
  ├── defi-protocols.tsx     ❌ Protocol status (current deployments, APY)
  ├── transactions.tsx       ❌ TX history (deposits, withdrawals, yield)
  └── ai-insights.tsx        ❌ AI agent recommendations
```

### 3. Update Root Route
- **`src/routes/__root.tsx`** - Wrap with `QueryClientProvider` + Privy
- Remove `react-router-dom` imports from old pages
- Migrate `LandingPage`, `LoginPage`, `DashboardLayout` to TanStack Router

### 4. Router Generation
```bash
pnpm build  # Triggers TanStack Router codegen
```

### 5. Remove Legacy Dependencies
```bash
pnpm remove react-router-dom
```

---

## 📐 Architecture Pattern (Cleverse)

### Data Flow:
```
Component → useHook → QueryClient → API Client → Backend
                ↓
         TanStack Query Cache
                ↓
          Auto-refetch on:
          - Window focus
          - Stale time expiry
          - Manual invalidation
```

### File Organization:
```
src/
├── routes/          # TanStack Router (file-based routing)
├── types/           # TypeScript types
├── lib/             # API client, query client
├── hooks/           # Data fetching hooks
├── components/      # Reusable UI components
├── utils/           # Helper functions
└── providers/       # Privy auth provider
```

---

## 🎯 Key Features vs. PRODUCT_OWNER_FLOW.md

| Feature | Status | Notes |
|---------|--------|-------|
| Client Portfolio Overview | ✅ | `useDashboardMetrics()` ready |
| End-Users Management | 🚧 | Hooks ready, page needed |
| Risk Tier Configuration | 🚧 | `useUpdateAllocation()` ready, UI needed |
| DeFi Protocol Status | 🚧 | `useDefiProtocols()` ready, page needed |
| AI Agent Insights | 🚧 | `useAIInsights()` ready, page needed |
| Index Tracking View | 🚧 | `useVaultIndexHistory()` ready, chart needed |
| Transaction Log | 🚧 | `useTransactions()` ready, table needed |
| Yield Distribution | 🚧 | Data layer ready, UI needed |

---

## 🚀 Next Steps

1. **Create UI Components** (tables, charts)
2. **Build Missing Pages** (end-users, risk-config, defi-protocols, transactions, ai-insights)
3. **Update Root Route** with QueryClientProvider
4. **Remove react-router-dom** dependency
5. **Generate Router Tree** (`pnpm build`)
6. **Test with Mock Data** (backend not ready yet)
7. **Update README.md**

---

## 📦 Dependencies Added

```json
{
  "@tanstack/react-query": "^5.x.x",
  "axios": "^1.x.x",
  "clsx": "^2.1.1"
}
```

---

## 🔧 Environment Variables

Add to `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

---

**Last Updated:** 2025-11-16
**Completion:** 70%
**Blockers:** None - full steam ahead! 🚀
