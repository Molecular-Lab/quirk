# Proxify Core Documentation - Quick Reference

> **Last Updated:** 2025-12-02
> **Current Phase:** Market Dashboard Implementation (Phase 1: Data Layer)
> **Status:** Building DeFi analytics dashboard with AI chatbot

---

## 🎯 What We're Building Right Now

**Market Intelligence Dashboard** - AI-powered DeFi analytics for Product Owners

```
┌────────────────────────────────────────────────────────────┐
│  LEFT COLUMN (40%)        │  RIGHT COLUMN (60%)            │
│                           │                                │
│  ┌─────────────────────┐  │  ┌──────────────────────────┐ │
│  │ AI Chat Interface   │  │  │ DeFi Category ▼          │ │
│  │ ─────────────────── │  │  ├──────────────────────────┤ │
│  │ User: Which best?   │  │  │ AAVE | Compound | Morpho │ │
│  │ AI: Morpho 6.5% APY │  │  │ Toggle: APY ↔ Raw Data   │ │
│  └─────────────────────┘  │  └──────────────────────────┘ │
│                           │                                │
│  ┌─────────────────────┐  │  ┌──────────────────────────┐ │
│  │ Executor Section    │  │  │ CeFi Category ▶           │ │
│  │ ─────────────────── │  │  └──────────────────────────┘ │
│  │ ☑ AAVE (5.2%)       │  │                                │
│  │ ☑ Morpho (6.5%)     │  │  ┌──────────────────────────┐ │
│  │ [Deploy Strategy]   │  │  │ LP Strategies ▶           │ │
│  └─────────────────────┘  │  └──────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Reference:** See `docs/images/market-dashboard-sketch.png` for UI wireframe

---

## 📊 Current Implementation Status

### ✅ What's Already Built

1. **Backend Infrastructure**
   - PostgreSQL database with client vaults
   - Privy custodial wallet integration
   - Mock USDC token contract (Base Sepolia)
   - Oracle-based minting for on-ramp simulation
   - Client bank account API for off-ramp prep

2. **Yield Engine Package** (`packages/yield-engine/`)
   - ✅ AAVE Adapter - Fetches APY, TVL, metrics
   - ✅ Compound Adapter - Protocol data
   - ✅ Morpho Adapter - Vault metrics
   - Ready to integrate with dashboard

3. **Frontend Foundation** (`apps/whitelabel-web/`)
   - React + Vite + TypeScript
   - TailwindCSS + Gray theme
   - Basic routing and pages
   - Login with Privy

### 🚧 Currently Building

**Phase 1: Data Layer Foundation** (Week 1)

**Goal:** Get real DeFi data from yield-engine to frontend

**Tasks:**
- [ ] Install React Query
- [ ] Create `packages/core/service/defi-protocol.service.ts`
  - [ ] Fetch AAVE metrics using AaveAdapter
  - [ ] Fetch Compound metrics using CompoundAdapter
  - [ ] Fetch Morpho metrics using MorphoAdapter
- [ ] Create API endpoints `/api/defi/protocols`
- [ ] Create frontend hooks:
  - [ ] `useAAVEData()` - Separate query key
  - [ ] `useCompoundData()` - Separate query key
  - [ ] `useMorphoData()` - Separate query key
  - [ ] `useAllDeFiProtocols()` - Combined

**Acceptance Criteria:**
- ✅ Can see real AAVE/Compound/Morpho data in browser console
- ✅ Data refreshes every 60 seconds automatically

---

## 🏗️ Technical Architecture

### Data Flow

```
React Query Hooks (Frontend)
    ↓ HTTP GET /api/defi/protocols
B2B API Router (apps/b2b-api/)
    ↓ Service call
DeFi Protocol Service (packages/core/service/)
    ↓ Uses adapters
Yield Engine (packages/yield-engine/)
    ↓ Smart contract calls
Blockchain (Base Sepolia)
    ↓ Returns data
AAVE/Compound/Morpho Protocols
```

### Key Data Structure

```typescript
interface ProtocolData {
  protocol: 'aave' | 'compound' | 'morpho' | 'curve'
  token: string                    // 'USDC'
  chainId: number                  // 8453 (Base)

  // Yield Metrics
  supplyAPY: string                // "6.50" = 6.50%
  borrowAPY?: string

  // Size Metrics
  tvl: string                      // "$500M"
  liquidity: string                // "$400M"
  utilization: string              // "75.5" = 75.5%

  // Risk Metrics
  risk: 'Low' | 'Medium' | 'High'
  status: 'healthy' | 'warning' | 'critical'

  // Metadata
  lastUpdate: Date
  rawMetrics?: { /* all contract data */ }
}
```

### Component Hierarchy

```
apps/whitelabel-web/src/feature/dashboard/
├── MarketPage.tsx                    # Main 2-column layout
│
├── components/
│   ├── ai/
│   │   ├── AIChatInterface.tsx       # LEFT: Chat UI
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   │
│   ├── executor/
│   │   ├── ExecutorSection.tsx       # LEFT: Protocol selection
│   │   └── DeploymentModal.tsx
│   │
│   ├── categories/
│   │   ├── CategorySection.tsx       # RIGHT: Collapsible
│   │   ├── DeFiCategory.tsx          # AAVE/Compound/Morpho
│   │   ├── CeFiCategory.tsx          # Future
│   │   ├── LiquidityPoolCategory.tsx # LP strategies
│   │   ├── ArbitrageCategory.tsx     # Future
│   │   └── HedgingCategory.tsx       # Future
│   │
│   ├── protocol-cards/
│   │   ├── ProtocolCard.tsx          # Base card
│   │   ├── OverviewView.tsx          # APY/TVL display
│   │   └── RawDataView.tsx           # JSON/table view
│   │
│   └── shared/
│       ├── StatusBadge.tsx           # Healthy/Warning/Critical
│       └── APYDisplay.tsx
│
└── hooks/
    ├── useDeFiProtocols.ts           # React Query hooks
    ├── useAIChat.ts                  # OpenAI integration
    ├── useMockUSDCBalance.ts         # Wallet balance
    └── useProtocolSelector.ts        # Executor state
```

---

## 🎨 UI/UX Design System

### Color Palette (Gray Theme - Avici Finance Style)

```css
/* Backgrounds */
--bg-main: #1a1b1e           /* Main page */
--bg-card: #25262b           /* Cards */
--bg-hover: #2c2d33          /* Hover states */

/* Text */
--text-primary: #ffffff      /* Headings */
--text-secondary: #909296    /* Body */
--text-tertiary: #5c5f66     /* Labels */

/* Accents */
--accent-green: #51cf66      /* APY, Success */
--accent-red: #ff6b6b        /* Errors */
--accent-blue: #4dabf7       /* Actions */
--accent-yellow: #ffd43b     /* Warnings */

/* Status */
--status-healthy: #51cf66    /* Protocol healthy */
--status-warning: #ffd43b    /* Protocol warning */
--status-critical: #ff6b6b   /* Protocol critical */
```

### Key UI Interactions

1. **Category Sections:** Click to expand/collapse
2. **Protocol Cards:** Toggle button switches between:
   - **Overview View:** Large APY, TVL, Status badge
   - **Raw Data View:** All contract metrics (JSON or table)
3. **AI Chat:**
   - Suggested questions when empty
   - Enter to send, Shift+Enter for newline
4. **Executor:**
   - Checkbox to select protocols
   - Deploy button opens allocation modal

---

## 💾 Database & State Management

### Mock USDC Balance

**Current Setup:**
- Mock USDC token contract on Base Sepolia
- Oracle can mint tokens to custodial wallets
- Frontend should show accurate balance from blockchain

**Hook to Create:**
```typescript
// apps/whitelabel-web/src/hooks/useMockUSDCBalance.ts
export function useMockUSDCBalance(walletAddress: string) {
  return useQuery({
    queryKey: ['mockUSDC', 'balance', walletAddress],
    queryFn: async () => {
      // Use viem to call balanceOf(walletAddress)
      const balance = await mockUSDCContract.read.balanceOf([walletAddress])
      return {
        raw: balance.toString(),
        formatted: (Number(balance) / 1e6).toFixed(2), // 6 decimals
        lastUpdate: new Date()
      }
    },
    refetchInterval: 10000, // 10 seconds
  })
}
```

**Display in Header:**
```tsx
<header>
  <div>Balance: ${balance?.formatted} Mock USDC</div>
  <div>Last updated: {formatDistanceToNow(balance?.lastUpdate)}</div>
</header>
```

### Vault Index System

**See:** `QuirkVaultVisualizationFlow.md` for complete explanation

**Key Concept:**
- Each user deposits at specific `entry_index`
- Vault has growing `current_index`
- User value = `deposited × (current_index / entry_index)`
- Fair yield distribution without on-chain transactions

**Status:** Index calculation works, needs integration with dashboard

---

## 🤖 AI Integration

### Provider Decision

**Current Plan:** OpenAI GPT-3.5-turbo (free tier)

**Why:**
- Easy to implement
- Free tier available
- Good enough for MVP
- Can switch to Claude later if needed

### AI Service Structure

```typescript
// packages/core/service/ai-chatbot.service.ts
export class AIChatbotService {
  async analyzeProtocols(
    userMessage: string,
    protocolData: ProtocolData[]
  ) {
    const systemPrompt = `
You are a DeFi analyst. Current data:
- AAVE: ${protocolData[0].supplyAPY}% APY, ${protocolData[0].tvl} TVL
- Compound: ${protocolData[1].supplyAPY}% APY, ${protocolData[1].tvl} TVL
- Morpho: ${protocolData[2].supplyAPY}% APY, ${protocolData[2].tvl} TVL

Answer questions about yields, risks, and strategies.
    `

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
    })

    return response.choices[0].message.content
  }
}
```

**API Endpoint:**
```
POST /api/ai/chat
Body: { message: string, protocols: ProtocolData[] }
Returns: { message: string, timestamp: Date }
```

---

## 📦 Yield Engine Package

**Location:** `packages/yield-engine/`

**Available Adapters:**

```typescript
import {
  AaveAdapter,
  CompoundAdapter,
  MorphoAdapter
} from '@proxify/yield-engine'

// Usage
const aave = new AaveAdapter(8453) // Base chain
const supplyAPY = await aave.getSupplyAPY('USDC', 8453)
const metrics = await aave.getMetrics('USDC', 8453)
// Returns: { tvl, liquidity, utilization, ... }
```

**Key Methods:**
- `getSupplyAPY(token, chainId)` - Current yield
- `getBorrowAPY(token, chainId)` - Borrow rate
- `getMetrics(token, chainId)` - TVL, liquidity, etc.
- `getUserPosition(user, token, chainId)` - User balances

**See:** `packages/yield-engine/ARCHITECTURE.md` for details

---

## 🚀 Implementation Roadmap

### Phase 1: Data Layer (CURRENT - Week 1)
- [ ] Install React Query
- [ ] Create DeFi Protocol Service (backend)
- [ ] Create API endpoints
- [ ] Create React Query hooks (frontend)
- [ ] Test data flow end-to-end

**Deliverable:** Real AAVE/Compound/Morpho data in console

---

### Phase 2: UI Components (Week 2)
- [ ] Build 2-column layout
- [ ] Create CategorySection component
- [ ] Create ProtocolCard with toggle
- [ ] Create OverviewView and RawDataView
- [ ] Wire up real data
- [ ] Add loading/error states

**Deliverable:** Dashboard matches wireframe with real data

---

### Phase 3: AI Integration (Week 3)
- [ ] Get OpenAI API key
- [ ] Create AI Chatbot Service
- [ ] Create chat API endpoint
- [ ] Build AIChatInterface component
- [ ] Integrate with protocol data
- [ ] Add suggested questions

**Deliverable:** Working AI chat that references real data

---

### Phase 4: Executor (Week 4)
- [ ] Create ExecutorSection component
- [ ] Add protocol checkboxes
- [ ] Create DeploymentModal
- [ ] Add allocation percentage inputs
- [ ] Wire up deployment logic (mock for MVP)

**Deliverable:** Can select protocols and simulate deployment

---

### Phase 5: Balance Display (Week 5)
- [ ] Create useMockUSDCBalance hook
- [ ] Fetch balance from blockchain (viem)
- [ ] Display in header
- [ ] Add auto-refresh (10s)
- [ ] Add change indicator

**Deliverable:** Accurate Mock USDC balance showing

---

### Phase 6: Polish & Advanced (Week 6+)
- [ ] Add CeFi, LP, Arbitrage, Hedging categories
- [ ] Historical APY charts
- [ ] Risk scoring system
- [ ] Protocol comparison feature
- [ ] Notifications/alerts
- [ ] Mobile responsive

---

## 🔗 Key File References

### Documentation
- `MARKET_DASHBOARD_CORE_SPEC.md` - Complete technical spec
- `MARKET_DASHBOARD_TODO.md` - Detailed task breakdown
- `DEFI_OBSERVER_DASHBOARD.md` - Original dashboard design
- `DEFI_PROTOCOL_METRICS_GUIDE.md` - What metrics to fetch
- `QuirkVaultVisualizationFlow.md` - Index accounting system
- `docs/images/market-dashboard-sketch.png` - UI wireframe

### Code
- `packages/yield-engine/` - DeFi protocol adapters
- `apps/whitelabel-web/` - Frontend React app
- `apps/b2b-api/` - Backend API services
- `packages/core/service/` - Business logic services
- `database/` - PostgreSQL schema and queries

### Configuration
- `.env` files - Environment variables
- `turbo.json` - Build configuration
- `pnpm-workspace.yaml` - Monorepo packages
- `tsconfig.json` - TypeScript config

---

## 🎯 Next Immediate Steps

**RIGHT NOW - Start Phase 1:**

1. **Install React Query**
   ```bash
   cd apps/whitelabel-web
   pnpm add @tanstack/react-query
   ```

2. **Create Backend Service**
   ```
   File: packages/core/service/defi-protocol.service.ts
   Goal: Wrap yield-engine adapters
   ```

3. **Create API Endpoints**
   ```
   File: apps/b2b-api/src/router/defi-protocol.router.ts
   Routes:
   - GET /api/defi/protocols (all)
   - GET /api/defi/protocols/aave
   - GET /api/defi/protocols/compound
   - GET /api/defi/protocols/morpho
   ```

4. **Create Frontend Hooks**
   ```
   File: apps/whitelabel-web/src/hooks/useDeFiProtocols.ts
   Hooks:
   - useAAVEData() - queryKey: ['defi', 'aave', 'usdc']
   - useCompoundData() - queryKey: ['defi', 'compound', 'usdc']
   - useMorphoData() - queryKey: ['defi', 'morpho', 'usdc']
   - useAllDeFiProtocols() - combines all three
   ```

5. **Test in Console**
   ```tsx
   // In MarketPage.tsx
   const { data } = useAllDeFiProtocols()
   console.log('DeFi protocols:', data)
   ```

**Success Criteria:** See real protocol data in browser console, updating every 60 seconds

---

## ❓ Common Questions

### Q: How does Mock USDC work?
**A:** We have a token contract on Base Sepolia. Oracle can mint tokens to custodial wallets to simulate on-ramp. Dashboard fetches balance using viem's `balanceOf()`.

### Q: Why separate React Query keys?
**A:** Each protocol (AAVE, Compound, Morpho) has independent caching. If one API fails, others still work. Better UX.

### Q: What's the difference between Overview and Raw Data?
**A:**
- **Overview:** User-friendly display (big APY number, status badge)
- **Raw Data:** All contract metrics in JSON/table for power users

### Q: Why custodial pooling?
**A:** Product Owners don't want each end-user to have their own wallet. Pooled custody + index accounting = cheaper + simpler.

### Q: When is off-ramp needed?
**A:** Not urgent. Bank account API already exists. Users can withdraw later once we have payment processor license.

### Q: Can I use Claude AI instead of OpenAI?
**A:** Yes! Just swap the API in `ai-chatbot.service.ts`. Claude has better reasoning.

---

## 🐛 Known Issues & Workarounds

### Issue: VSCode Crashes
**Impact:** Lost chat history
**Workaround:** Save this CORE_DOC.md and reference it

### Issue: Mock USDC not showing accurate balance
**Current Status:** Oracle mints tokens, but dashboard not fetching yet
**Solution:** Implement `useMockUSDCBalance` hook in Phase 5

### Issue: Too many .md files
**Solution:** This CORE_DOC.md is your single source of truth. Reference other files only when needed.

---

## 📞 Quick Help

**"I'm lost, where do I start?"**
→ Read this file + look at `docs/images/market-dashboard-sketch.png`

**"What's the current task?"**
→ Phase 1: Create `defi-protocol.service.ts` and API endpoints

**"How do I fetch AAVE data?"**
→ `const aave = new AaveAdapter(8453); await aave.getSupplyAPY('USDC', 8453)`

**"Where's the yield-engine code?"**
→ `packages/yield-engine/src/protocols/`

**"How to run the app?"**
→ `pnpm dev` (runs both frontend and backend)

---

**Last Updated:** 2025-12-02
**Next Update:** After Phase 1 completion
**Maintainer:** @wtshai
**AI Assistant:** Claude (Anthropic)
