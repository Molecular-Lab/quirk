# Proxify Production Structure Analysis

**Reference:** `/Users/wtshai/Work/Proxify/rabbitswap-interface/apps/web`

---

## 📊 Production Directory Structure

```
apps/web/
├── src/
│   ├── api/                      # API layer (axios, endpoints)
│   ├── components/               # Reusable UI components
│   │   ├── AccountDrawer/
│   │   ├── Navbar/
│   │   ├── TokenSelector/
│   │   └── Wallet/
│   ├── config/                   # Configuration
│   │   └── queryKey/             # TanStack Query keys
│   ├── constants/                # App constants
│   │   └── bridge/
│   ├── feature/                  # ⭐ Feature modules (domain-driven)
│   │   ├── analytics/
│   │   ├── bridge/
│   │   ├── explore/
│   │   ├── liquidity/
│   │   ├── swap/
│   │   └── sub-account/
│   ├── hooks/                    # Custom hooks (organized by domain)
│   │   ├── liquidity/
│   │   ├── swap/
│   │   ├── token/
│   │   ├── transaction/
│   │   └── wallet/
│   ├── pages/                    # ⭐ Pages (file-based routing with generouted)
│   │   ├── add/
│   │   ├── bridge/
│   │   ├── explore/
│   │   ├── pools/
│   │   └── swap/
│   ├── providers/                # Context providers
│   │   ├── ParticleProvider/
│   │   └── SolanaWalletProvider/
│   ├── store/                    # ⭐ Zustand state management
│   ├── types/                    # TypeScript types
│   │   ├── position/
│   │   └── tokens/
│   └── utils/                    # Utility functions
│       ├── hooks/
│       ├── sub-account/
│       └── token/
├── vite.config.ts                # Vite config
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔑 Key Patterns

### 1. File-Based Routing (generouted)
```typescript
// vite.config.ts
import generouted from "@generouted/react-router/plugin"

plugins: [
  react(),
  tsconfigPaths(),
  generouted(),  // ⭐ Automatic routing from /pages
]
```

**How it works:**
```
/src/pages/swap/index.tsx        → /swap
/src/pages/pools/index.tsx       → /pools
/src/pages/explore/index.tsx     → /explore
/src/pages/add/[id].tsx          → /add/:id (dynamic route)
```

✅ **Simpler than TanStack Router** - no manual route configuration!

---

### 2. Feature Modules (`/feature`)

**Domain-driven organization:**
```
/feature/swap/
  ├── components/       # Swap-specific components
  ├── hooks/            # Swap-specific hooks
  ├── utils/            # Swap-specific utils
  └── types.ts          # Swap-specific types

/feature/liquidity/
  ├── components/
  ├── hooks/
  └── utils/

/feature/analytics/
  ├── components/
  └── hooks/
```

✅ **Better than flat structure** - keeps related code together!

---

### 3. Hooks Organization

**By domain, not flat:**
```
/hooks/
  ├── swap/
  │   ├── useSwapAmount.ts
  │   ├── useSwapRoute.ts
  │   └── useSwapCallback.ts
  ├── liquidity/
  │   ├── usePoolPosition.ts
  │   └── useAddLiquidity.ts
  ├── token/
  │   ├── useTokenBalance.ts
  │   └── useTokenPrice.ts
  ├── wallet/
  │   ├── useWalletConnect.ts
  │   └── useWalletBalance.ts
  └── transaction/
      ├── useSendTransaction.ts
      └── useTransactionReceipt.ts
```

✅ **Clear domain separation**

---

### 4. TanStack Query Keys

**Centralized in `/config/queryKey/`:**
```typescript
// config/queryKey/token.ts
export const tokenKeys = {
  all: ['tokens'] as const,
  lists: () => [...tokenKeys.all, 'list'] as const,
  list: (filters: string) => [...tokenKeys.lists(), { filters }] as const,
  details: () => [...tokenKeys.all, 'detail'] as const,
  detail: (id: string) => [...tokenKeys.details(), id] as const,
  balance: (address: string) => [...tokenKeys.all, 'balance', address] as const,
}

// Usage in hook:
const { data } = useQuery({
  queryKey: tokenKeys.balance(address),
  queryFn: () => fetchTokenBalance(address)
})
```

✅ **Type-safe query key management**

---

### 5. State Management (Zustand)

```typescript
// store/swap.ts
import { create } from 'zustand'

interface SwapState {
  inputAmount: string
  outputAmount: string
  slippage: number
  setInputAmount: (amount: string) => void
  setOutputAmount: (amount: string) => void
  setSlippage: (slippage: number) => void
}

export const useSwapStore = create<SwapState>((set) => ({
  inputAmount: '',
  outputAmount: '',
  slippage: 0.5,
  setInputAmount: (amount) => set({ inputAmount: amount }),
  setOutputAmount: (amount) => set({ outputAmount: amount }),
  setSlippage: (slippage) => set({ slippage }),
}))
```

✅ **Lightweight state management** (no Redux boilerplate)

---

### 6. Tech Stack

```json
{
  "routing": "generouted",              // File-based routing
  "stateManagement": "zustand",         // Lightweight store
  "dataFetching": "@tanstack/react-query",
  "reactPlugin": "@vitejs/plugin-react-swc",  // SWC (faster than Babel)
  "styling": "tailwindcss",
  "icons": "lucide-react",
  "charts": "recharts"
}
```

---

## 🚨 What Our whitelabel-web Is Missing

### ❌ Current Issues:

1. **No `/feature` directory** - everything in `/routes` or flat `/hooks`
2. **TanStack Router** - more complex than needed (generouted simpler)
3. **No `/store`** - no Zustand for client state
4. **No `/config/queryKey`** - query keys scattered
5. **Hooks not organized by domain** - all flat in `/hooks`
6. **No `/api` directory** - API logic mixed with components

---

## ✅ Recommended Refactor for whitelabel-web

```
apps/whitelabel-web/
├── src/
│   ├── api/                      # NEW: API client + endpoints
│   │   ├── client.ts             # Axios instance
│   │   ├── wallets.ts            # /api/v1/wallets endpoints
│   │   ├── portfolios.ts         # Portfolio endpoints
│   │   └── defi.ts               # DeFi protocol endpoints
│   │
│   ├── components/               # Reusable UI components
│   │   ├── charts/
│   │   ├── cards/
│   │   └── tables/
│   │
│   ├── config/                   # Configuration
│   │   ├── env.ts
│   │   └── queryKey/             # NEW: Query key factory
│   │       ├── index.ts
│   │       ├── wallets.ts
│   │       ├── portfolios.ts
│   │       └── defi.ts
│   │
│   ├── feature/                  # NEW: Feature modules
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.tsx
│   │   ├── portfolios/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.tsx
│   │   └── settings/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.tsx
│   │
│   ├── hooks/                    # REFACTOR: Organize by domain
│   │   ├── wallet/
│   │   │   ├── useWalletBalance.ts
│   │   │   └── useWalletTransactions.ts
│   │   ├── portfolio/
│   │   │   ├── usePortfolios.ts
│   │   │   └── usePortfolioStats.ts
│   │   └── defi/
│   │       ├── useDefiProtocols.ts
│   │       └── useYieldCalculator.ts
│   │
│   ├── pages/                    # SWITCH: Use generouted
│   │   ├── index.tsx             # /
│   │   ├── login.tsx             # /login
│   │   └── dashboard/
│   │       ├── index.tsx         # /dashboard
│   │       ├── explore.tsx       # /dashboard/explore
│   │       ├── portfolios/
│   │       │   ├── index.tsx     # /dashboard/portfolios
│   │       │   └── [id].tsx      # /dashboard/portfolios/:id
│   │       └── settings/
│   │           ├── index.tsx     # /dashboard/settings
│   │           ├── api-keys.tsx  # /dashboard/settings/api-keys
│   │           └── billing.tsx   # /dashboard/settings/billing
│   │
│   ├── providers/                # Context providers
│   │   ├── PrivyProvider.tsx
│   │   └── QueryClientProvider.tsx
│   │
│   ├── store/                    # NEW: Zustand stores
│   │   ├── index.ts
│   │   ├── dashboard.ts
│   │   └── settings.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── wallet.ts
│   │   ├── portfolio.ts
│   │   └── defi.ts
│   │
│   └── utils/                    # Utility functions
│       ├── format.ts
│       ├── calculate.ts
│       └── validation.ts
│
├── vite.config.ts
├── package.json
└── tailwind.config.js
```

---

## 📦 Dependencies to Add/Change

```bash
# Remove TanStack Router
pnpm remove @tanstack/router-plugin @tanstack/react-router

# Add generouted (simpler routing)
pnpm add @generouted/react-router

# Add Zustand (state management)
pnpm add zustand

# Switch to SWC (faster)
# Already using @vitejs/plugin-react-swc ✅
```

---

## 🚀 Migration Steps

### 1. Switch to generouted
```typescript
// vite.config.ts
import generouted from "@generouted/react-router/plugin"

plugins: [
  generouted(),  // Replace TanStack Router
  react(),
  tsconfigPaths(),
]
```

### 2. Migrate routes to pages
```bash
# Move route files to pages/
mv src/routes/dashboard.tsx src/pages/dashboard/index.tsx
mv src/routes/dashboard/explore.tsx src/pages/dashboard/explore.tsx
# etc...
```

### 3. Create feature modules
```bash
mkdir -p src/feature/dashboard/components
mkdir -p src/feature/portfolios/components
mkdir -p src/feature/settings/components
```

### 4. Add Zustand stores
```bash
mkdir -p src/store
# Create dashboard.ts, settings.ts
```

### 5. Organize hooks by domain
```bash
mkdir -p src/hooks/wallet
mkdir -p src/hooks/portfolio
mkdir -p src/hooks/defi

# Move hooks into domain folders
```

### 6. Create queryKey factory
```bash
mkdir -p src/config/queryKey
# Create index.ts, wallets.ts, portfolios.ts
```

---

## ✅ Benefits

1. **Simpler routing** - generouted is file-based, no manual config
2. **Better organization** - features grouped together
3. **Type-safe queries** - centralized query keys
4. **Lighter state** - Zustand vs Redux
5. **Faster builds** - SWC instead of Babel
6. **Production-proven** - same structure as Proxify production apps

---

**Next:** Want me to implement this refactor?
