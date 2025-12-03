# Market Dashboard - Implementation TODO Tracker

> **Source of Truth for Task Tracking**
> **Companion to**: `MARKET_DASHBOARD_CORE_SPEC.md`
> **Last Updated**: 2025-12-01

---

## 🎯 **Quick Status Overview**

```
Phase 1: Data Layer          [ ▱▱▱▱▱▱▱▱▱▱ ]   0% Complete
Phase 2: UI Components       [ ▱▱▱▱▱▱▱▱▱▱ ]   0% Complete
Phase 3: AI Integration      [ ▱▱▱▱▱▱▱▱▱▱ ]   0% Complete
Phase 4: Executor            [ ▱▱▱▱▱▱▱▱▱▱ ]   0% Complete
Phase 5: Balance Display     [ ▱▱▱▱▱▱▱▱▱▱ ]   0% Complete
Phase 6: Polish & Advanced   [ ▱▱▱▱▱▱▱▱▱▱ ]   0% Complete

Overall Progress: 0/86 tasks completed (0%)
```

---

## 📋 **PHASE 1: Data Layer Foundation**

**Goal**: Get real DeFi data from yield-engine to frontend via API

**Estimated Time**: 3-5 days
**Priority**: 🔴 CRITICAL - Blocks all other phases

### **Backend Service (Day 1-2)**

- [ ] **Create DeFi Protocol Service**
  - File: `packages/core/service/defi-protocol.service.ts`
  - [ ] Import AaveAdapter, CompoundAdapter, MorphoAdapter from yield-engine
  - [ ] Implement `fetchAAVEMetrics(token: string, chainId: number)`
    - [ ] Call `aaveAdapter.getSupplyAPY()`
    - [ ] Call `aaveAdapter.getMetrics()`
    - [ ] Calculate utilization: `(TVL - Liquidity) / TVL * 100`
    - [ ] Determine status: healthy/warning/critical based on utilization
    - [ ] Return `ProtocolData` object
  - [ ] Implement `fetchCompoundMetrics(token: string, chainId: number)`
    - [ ] Similar structure to AAVE
  - [ ] Implement `fetchMorphoMetrics(token: string, chainId: number)`
    - [ ] Similar structure to AAVE
  - [ ] Implement `aggregateAllProtocols(token: string, chainId: number)`
    - [ ] Call all three fetch methods in parallel using `Promise.all()`
    - [ ] Handle individual protocol failures gracefully
    - [ ] Return array of successful results
  - [ ] Add error handling and logging
  - [ ] Add TypeScript interfaces for all return types

**Test Checklist**:
- [ ] Can import yield-engine adapters successfully
- [ ] `fetchAAVEMetrics()` returns valid data
- [ ] Handles network errors gracefully
- [ ] Logs errors to console

---

### **API Endpoints (Day 2-3)**

- [ ] **Create DeFi Protocols Router**
  - File: `apps/b2b-api/src/router/defi-protocols.router.ts`
  - [ ] Import DeFiProtocolService
  - [ ] Implement `GET /api/defi/protocols`
    - [ ] Query params: `?token=USDC&chainId=8453`
    - [ ] Call `defiProtocolService.aggregateAllProtocols()`
    - [ ] Return JSON: `{ protocols: ProtocolData[], timestamp: Date }`
    - [ ] Add error handling (500 on failure)
  - [ ] Implement `GET /api/defi/protocols/:protocol`
    - [ ] Params: `protocol` = 'aave' | 'compound' | 'morpho'
    - [ ] Call specific fetch method based on protocol
    - [ ] Return single protocol data
  - [ ] Add CORS headers
  - [ ] Add rate limiting (60 requests/minute per IP)
  - [ ] Register router in main app

**Test Checklist**:
- [ ] Can call `GET /api/defi/protocols` and get 200 response
- [ ] Response has correct JSON structure
- [ ] Can call `GET /api/defi/protocols/aave` successfully
- [ ] Returns 404 for invalid protocol name
- [ ] Test with Postman or curl

---

### **Frontend Data Hooks (Day 3-4)**

- [ ] **Install React Query**
  ```bash
  cd apps/whitelabel-web
  pnpm add @tanstack/react-query
  ```

- [ ] **Set Up QueryClient Provider**
  - File: `apps/whitelabel-web/src/main.tsx` or `_app.tsx`
  - [ ] Import `QueryClient` and `QueryClientProvider`
  - [ ] Create `queryClient` with config:
    - `staleTime: 30000` (30 seconds)
    - `cacheTime: 300000` (5 minutes)
    - `refetchInterval: 60000` (1 minute)
  - [ ] Wrap `<App />` with `<QueryClientProvider>`

- [ ] **Create Data Fetching Hooks**
  - File: `apps/whitelabel-web/src/hooks/useDeFiProtocols.ts`

  - [ ] Define `ProtocolData` interface (copy from spec)

  - [ ] Implement `useAAVEData()`
    - [ ] Use `useQuery` with key: `['defi', 'aave', 'usdc', 8453]`
    - [ ] Fetch from: `/api/defi/protocols/aave?token=USDC&chainId=8453`
    - [ ] Parse JSON response
    - [ ] Return `{ data, isLoading, error, refetch }`

  - [ ] Implement `useCompoundData()`
    - [ ] Query key: `['defi', 'compound', 'usdc', 8453]`
    - [ ] Similar fetch logic

  - [ ] Implement `useMorphoData()`
    - [ ] Query key: `['defi', 'morpho', 'usdc', 8453]`
    - [ ] Similar fetch logic

  - [ ] Implement `useAllDeFiProtocols()`
    - [ ] Call all three hooks
    - [ ] Combine results: `protocols: [aave.data, compound.data, morpho.data].filter(Boolean)`
    - [ ] Combined loading: `isLoading: aave.isLoading || compound.isLoading || morpho.isLoading`
    - [ ] Return aggregated state

**Test Checklist**:
- [ ] Open browser console, see React Query dev tools
- [ ] Add `console.log()` in hook, see data printed
- [ ] Verify data refreshes every 60 seconds
- [ ] Check Network tab - see API calls
- [ ] Verify cache works (no duplicate requests on re-render)

---

### **Phase 1 Complete When**:
✅ All backend services implemented
✅ All API endpoints working and tested
✅ All frontend hooks created
✅ Can see protocol data in browser console
✅ Data updates automatically every minute

**Deliverable**: Screenshot of browser console showing real AAVE/Compound/Morpho data

---

## 🎨 **PHASE 2: UI Components**

**Goal**: Build visual interface matching the sketch design

**Estimated Time**: 5-7 days
**Priority**: 🟡 HIGH - Core user experience

### **Layout Structure (Day 1)**

- [ ] **Update MarketPage.tsx**
  - File: `apps/whitelabel-web/src/feature/dashboard/MarketPage.tsx`
  - [ ] Import `useAllDeFiProtocols()` hook
  - [ ] Replace mock data with real data
  - [ ] Create 2-column grid layout:
    ```tsx
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-5">
        {/* Left column: Chat + Executor */}
      </div>
      <div className="col-span-7">
        {/* Right column: Categories */}
      </div>
    </div>
    ```
  - [ ] Add loading state (skeleton screens)
  - [ ] Add error state (retry button)
  - [ ] Add header with balance display (placeholder for now)

---

### **Category Section Component (Day 2)**

- [ ] **Create CategorySection Component**
  - File: `apps/whitelabel-web/src/components/market/CategorySection.tsx`

  - [ ] Props:
    ```typescript
    interface CategorySectionProps {
      title: string
      description?: string
      icon?: React.ReactNode
      protocols: ProtocolData[]
      isExpanded: boolean
      onToggle: () => void
    }
    ```

  - [ ] Layout:
    - [ ] Collapsible header button (full width, clickable)
    - [ ] Title + protocol count
    - [ ] Expand/collapse arrow icon (▶ / ▼)
    - [ ] Hover effect (bg-[#2c2d33])
    - [ ] Expanded content area (grid of protocol cards)

  - [ ] Styling:
    - [ ] `bg-[#25262b]` background
    - [ ] `border-gray-800` border
    - [ ] `rounded-2xl` corners
    - [ ] Smooth expand/collapse animation

- [ ] **Test CategorySection**
  - [ ] Create test page with mock data
  - [ ] Test expand/collapse interaction
  - [ ] Verify styling matches gray theme
  - [ ] Test responsive behavior

---

### **Protocol Card Component (Day 3-4)**

- [ ] **Create Base ProtocolCard Component**
  - File: `apps/whitelabel-web/src/components/market/ProtocolCard.tsx`

  - [ ] Props:
    ```typescript
    interface ProtocolCardProps {
      data: ProtocolData
      onSelect?: () => void  // For Executor
    }
    ```

  - [ ] State:
    - [ ] `viewMode: 'overview' | 'raw'` (useState)

  - [ ] Card Structure:
    - [ ] Header section:
      - [ ] Protocol logo (gradient circle with first letter)
      - [ ] Protocol name + version
      - [ ] Status badge (top right)
    - [ ] Toggle button ("Show Raw Data" / "Show Overview")
    - [ ] Content section (conditional render based on viewMode)

  - [ ] Styling:
    - [ ] `bg-[#1a1b1e]` background
    - [ ] `border-gray-800` border, `hover:border-gray-600`
    - [ ] `rounded-xl` corners
    - [ ] Hover lift effect (subtle shadow)

- [ ] **Create OverviewView Component**
  - File: `apps/whitelabel-web/src/components/market/OverviewView.tsx`

  - [ ] Display:
    - [ ] **APY**: Large, green text (`text-2xl font-bold text-green-400`)
    - [ ] **TVL**: Label + value
    - [ ] **Liquidity**: Label + value
    - [ ] **Utilization**: Progress bar or percentage
    - [ ] **Protocol Health**: Score or badge

  - [ ] Layout: Grid or flex column with proper spacing

- [ ] **Create RawDataView Component**
  - File: `apps/whitelabel-web/src/components/market/RawDataView.tsx`

  - [ ] Display Options:
    - **Option A**: JSON viewer (formatted, syntax highlighted)
    - **Option B**: Table with all metrics
    - **Option C**: Expandable sections

  - [ ] Show:
    - [ ] All `rawMetrics` data
    - [ ] Contract addresses
    - [ ] Timestamps
    - [ ] Copy button for JSON

- [ ] **Create StatusBadge Component**
  - File: `apps/whitelabel-web/src/components/market/StatusBadge.tsx`

  - [ ] Props: `status: 'healthy' | 'warning' | 'critical'`
  - [ ] Colors:
    - Healthy: `bg-green-900/30 text-green-400`
    - Warning: `bg-yellow-900/30 text-yellow-400`
    - Critical: `bg-red-900/30 text-red-400`
  - [ ] Icon + text (✓ Healthy, ⚠ Warning, ✗ Critical)

**Test Checklist**:
- [ ] Protocol card displays AAVE data correctly
- [ ] Toggle button switches views
- [ ] Status badge shows correct color
- [ ] Overview view is readable and clear
- [ ] Raw data view shows all metrics
- [ ] Hover effects work smoothly

---

### **Wire Up Real Data (Day 5)**

- [ ] **Integrate Data into MarketPage**
  - [ ] Remove all mock data constants
  - [ ] Use `useAllDeFiProtocols()` hook
  - [ ] Map protocol data to CategorySection:
    ```tsx
    const { protocols, isLoading } = useAllDeFiProtocols()

    <CategorySection
      title="DeFi Lending"
      protocols={protocols}
      isExpanded={defiExpanded}
      onToggle={() => setDefiExpanded(!defiExpanded)}
    />
    ```
  - [ ] Add loading spinner while fetching
  - [ ] Add empty state if no protocols available
  - [ ] Add error state with retry button

- [ ] **State Management for Expanded Categories**
  - [ ] Option A: Local state in MarketPage (simple)
    ```tsx
    const [defiExpanded, setDefiExpanded] = useState(true)
    const [cefiExpanded, setCefiExpanded] = useState(false)
    // etc.
    ```
  - [ ] Option B: Zustand store (if you prefer global state)

**Test Checklist**:
- [ ] Page loads and shows real data
- [ ] Can expand/collapse DeFi category
- [ ] Data updates after 60 seconds
- [ ] Loading state appears correctly
- [ ] Error handling works (test by blocking API)

---

### **Phase 2 Complete When**:
✅ MarketPage matches sketch layout exactly
✅ All components built and styled
✅ Real data displays in cards
✅ Expand/collapse works smoothly
✅ Toggle between Overview and Raw Data works
✅ Gray theme applied consistently

**Deliverable**: Screenshot of MarketPage with real AAVE, Compound, Morpho cards

---

## 💬 **PHASE 3: AI Chat Integration**

**Goal**: Intelligent AI analysis using OpenAI API

**Estimated Time**: 4-5 days
**Priority**: 🟡 HIGH - Key differentiator feature

### **Backend AI Service (Day 1-2)**

- [ ] **Get OpenAI API Key**
  - [ ] Sign up at https://platform.openai.com/
  - [ ] Generate API key
  - [ ] Add to `.env`: `OPENAI_API_KEY=sk-...`
  - [ ] Verify key works with test request

- [ ] **Create AI Chatbot Service**
  - File: `packages/core/service/ai-chatbot.service.ts`

  - [ ] Install OpenAI SDK:
    ```bash
    cd packages/core
    pnpm add openai
    ```

  - [ ] Import OpenAI client
  - [ ] Initialize in constructor:
    ```typescript
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    ```

  - [ ] Implement `analyzeProtocols(userMessage, protocolData)`
    - [ ] Build system prompt with current protocol data:
      ```
      You are a DeFi analyst. Current data:
      - AAVE: 5.2% APY, $500M TVL, Status: healthy
      - Compound: 4.8% APY, $300M TVL, Status: healthy
      - Morpho: 6.5% APY, $150M TVL, Status: healthy

      Answer user questions about yields, risks, and strategies.
      ```
    - [ ] Call OpenAI API:
      ```typescript
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
      ```
    - [ ] Return AI response text
    - [ ] Handle errors (rate limits, API failures)

  - [ ] Add conversation history support
    - [ ] Accept `messages: ChatMessage[]` array
    - [ ] Pass to OpenAI for context

**Test Checklist**:
- [ ] Can call OpenAI API successfully
- [ ] Receives valid response
- [ ] System prompt includes protocol data
- [ ] Error handling works (test with invalid key)

---

### **API Endpoint (Day 2)**

- [ ] **Create AI Chat Router**
  - File: `apps/b2b-api/src/router/ai-chat.router.ts`

  - [ ] Implement `POST /api/ai/chat`
    - [ ] Body:
      ```typescript
      {
        message: string
        protocols: ProtocolData[]
        conversationHistory?: ChatMessage[]
      }
      ```
    - [ ] Call `aiChatbotService.analyzeProtocols()`
    - [ ] Return:
      ```typescript
      {
        message: string
        timestamp: Date
        protocolContext: ProtocolData[]
      }
      ```
    - [ ] Add rate limiting (10 requests/minute)
    - [ ] Add input validation (max 500 chars)
    - [ ] Sanitize user input (remove HTML/scripts)

  - [ ] Register router in main app

**Test Checklist**:
- [ ] POST request works in Postman
- [ ] Returns AI response
- [ ] Rate limiting triggers after 10 requests
- [ ] Input validation rejects long messages

---

### **Frontend Chat Interface (Day 3-4)**

- [ ] **Create AIChatInterface Component**
  - File: `apps/whitelabel-web/src/components/market/AIChatInterface.tsx`

  - [ ] State:
    - [ ] `messages: ChatMessage[]` (chat history)
    - [ ] `input: string` (current input)
    - [ ] `loading: boolean` (AI thinking)

  - [ ] Layout:
    - [ ] Header: "AI Analyst" title
    - [ ] Messages area: Scrollable, auto-scroll to bottom
    - [ ] Input area: Text input + Send button

  - [ ] Implement `sendMessage()`:
    - [ ] Add user message to state
    - [ ] Clear input field
    - [ ] Set loading = true
    - [ ] Fetch protocols from `useAllDeFiProtocols()`
    - [ ] POST to `/api/ai/chat`
    - [ ] Add AI response to messages
    - [ ] Set loading = false
    - [ ] Handle errors (show error message)

  - [ ] Keyboard shortcuts:
    - [ ] Enter to send
    - [ ] Shift+Enter for new line

  - [ ] Styling:
    - [ ] User messages: Right-aligned, blue background
    - [ ] AI messages: Left-aligned, gray background
    - [ ] Loading indicator: Pulsing dots

- [ ] **Create ChatMessage Component**
  - File: `apps/whitelabel-web/src/components/market/ChatMessage.tsx`

  - [ ] Props: `{ role: 'user' | 'assistant', content: string, timestamp: Date }`
  - [ ] Conditional styling based on role
  - [ ] Timestamp display (optional, show on hover)
  - [ ] Markdown rendering for AI responses (optional)

- [ ] **Add Suggested Questions**
  - [ ] Show suggested questions when chat is empty:
    - "Which protocol has the best APY?"
    - "Is AAVE safe right now?"
    - "Recommend a strategy for $500K"
  - [ ] Click to auto-fill input

**Test Checklist**:
- [ ] Can type and send messages
- [ ] AI responds with intelligent answer
- [ ] Loading indicator shows during request
- [ ] Chat history persists during session
- [ ] Error handling works (test by blocking API)
- [ ] Suggested questions work

---

### **Integration Testing (Day 5)**

- [ ] **End-to-End Chat Flow**
  - [ ] Ask: "Which protocol should I use?"
  - [ ] Verify: AI references real APY data
  - [ ] Ask: "Is AAVE safe?"
  - [ ] Verify: AI mentions status and TVL
  - [ ] Ask: "Compare AAVE and Morpho"
  - [ ] Verify: AI compares both protocols

- [ ] **Error Scenarios**
  - [ ] Test with API down (mock 500 error)
  - [ ] Test with rate limit hit
  - [ ] Test with very long message
  - [ ] Verify graceful error messages

---

### **Phase 3 Complete When**:
✅ OpenAI API integrated successfully
✅ Chat interface working and styled
✅ AI references real protocol data
✅ Conversation history works
✅ Error handling is robust
✅ User experience is smooth

**Deliverable**: Video demo of asking AI questions and getting intelligent answers

---

## ⚡ **PHASE 4: Executor Section**

**Goal**: Allow protocol selection and strategy deployment

**Estimated Time**: 3-4 days
**Priority**: 🟢 MEDIUM - Nice to have for MVP

### **Executor UI Component (Day 1-2)**

- [ ] **Create ExecutorSection Component**
  - File: `apps/whitelabel-web/src/components/market/ExecutorSection.tsx`

  - [ ] State:
    - [ ] `selectedProtocols: string[]`

  - [ ] Layout:
    - [ ] Header: "Strategy Executor"
    - [ ] Protocol list: Checkboxes with APY
    - [ ] Deploy button: Disabled if no selection

  - [ ] Protocol Checkbox Items:
    ```tsx
    {protocols.map(protocol => (
      <label className="flex items-center gap-3 p-3 bg-[#1a1b1e] rounded-lg hover:bg-[#2c2d33] cursor-pointer">
        <input
          type="checkbox"
          checked={selectedProtocols.includes(protocol.protocol)}
          onChange={() => toggleProtocol(protocol.protocol)}
        />
        <span>{protocol.protocol}</span>
        <span className="ml-auto text-green-400">{protocol.supplyAPY}</span>
      </label>
    ))}
    ```

  - [ ] Deploy Button:
    - [ ] Disabled state styling
    - [ ] Click handler: `handleDeploy()`
    - [ ] Show spinner during deployment

- [ ] **Create useProtocolSelector Hook**
  - File: `apps/whitelabel-web/src/hooks/useProtocolSelector.ts`

  - [ ] State: `selectedProtocols: string[]`
  - [ ] Methods:
    - [ ] `toggleProtocol(protocol: string)`
    - [ ] `selectAll()`
    - [ ] `clearAll()`
    - [ ] `isSelected(protocol: string)`

**Test Checklist**:
- [ ] Can check/uncheck protocols
- [ ] Deploy button enables when protocols selected
- [ ] Deploy button disabled when none selected
- [ ] Styling matches gray theme

---

### **Deployment Modal (Day 2-3)**

- [ ] **Create DeploymentModal Component**
  - File: `apps/whitelabel-web/src/components/market/DeploymentModal.tsx`

  - [ ] Props:
    ```typescript
    interface DeploymentModalProps {
      selectedProtocols: string[]
      protocolData: ProtocolData[]
      onConfirm: (allocations: Record<string, number>) => void
      onCancel: () => void
    }
    ```

  - [ ] Layout:
    - [ ] Overlay (dark background)
    - [ ] Modal card (centered)
    - [ ] Header: "Deploy Strategy"
    - [ ] Selected protocols list
    - [ ] Allocation inputs (percentage for each)
    - [ ] Total: Should sum to 100%
    - [ ] Confirm / Cancel buttons

  - [ ] Allocation Logic:
    - [ ] Default: Equal split (if 2 protocols, 50% each)
    - [ ] Allow custom percentages
    - [ ] Validate: Sum must equal 100%
    - [ ] Show error if invalid

  - [ ] Preview:
    ```
    Deploying $500,000:
    - AAVE (60%): $300,000 at 5.2% APY
    - Morpho (40%): $200,000 at 6.5% APY
    Expected Blended APY: 5.72%
    ```

**Test Checklist**:
- [ ] Modal opens when Deploy button clicked
- [ ] Can adjust allocation percentages
- [ ] Validation works (must sum to 100%)
- [ ] Preview calculations are correct
- [ ] Can confirm or cancel

---

### **Deployment Handler (Day 3-4)**

- [ ] **Implement Deployment Logic**
  - [ ] For MVP: Mock deployment (no real transactions)
  - [ ] Show success toast: "Strategy deployed successfully!"
  - [ ] Log deployment to console
  - [ ] Clear selections after success

- [ ] **Future: Real Deployment**
  - [ ] Create backend endpoint: `POST /api/vaults/:clientId/deploy`
  - [ ] Body: `{ protocols: string[], allocations: Record<string, number> }`
  - [ ] Backend calls transaction service
  - [ ] Returns transaction hash
  - [ ] Frontend shows transaction status

**Test Checklist**:
- [ ] Can complete full deployment flow
- [ ] Success message appears
- [ ] Selections clear after deployment
- [ ] Error handling works

---

### **Phase 4 Complete When**:
✅ Executor UI component built
✅ Can select protocols with checkboxes
✅ Deployment modal works
✅ Allocation percentages validated
✅ Mock deployment completes successfully
✅ User experience is clear and intuitive

**Deliverable**: Screen recording of selecting protocols and deploying strategy

---

## 💰 **PHASE 5: Mock USDC Balance Display**

**Goal**: Show accurate custodial wallet balance in real-time

**Estimated Time**: 2-3 days
**Priority**: 🟢 MEDIUM - Important for credibility

### **Balance Fetching Hook (Day 1)**

- [ ] **Create useMockUSDCBalance Hook**
  - File: `apps/whitelabel-web/src/hooks/useMockUSDCBalance.ts`

  - [ ] Install viem (if not already):
    ```bash
    pnpm add viem
    ```

  - [ ] Implementation:
    ```typescript
    import { useQuery } from '@tanstack/react-query'
    import { createPublicClient, http } from 'viem'
    import { baseSepolia } from 'viem/chains'

    const MOCK_USDC_ADDRESS = '0x...' // Your contract address
    const ERC20_ABI = [/* balanceOf ABI */]

    export function useMockUSDCBalance(walletAddress: string) {
      return useQuery({
        queryKey: ['mockUSDC', 'balance', walletAddress],
        queryFn: async () => {
          const client = createPublicClient({
            chain: baseSepolia,
            transport: http()
          })

          const balance = await client.readContract({
            address: MOCK_USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [walletAddress]
          })

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

**Test Checklist**:
- [ ] Hook fetches balance successfully
- [ ] Balance matches on-chain amount
- [ ] Updates every 10 seconds
- [ ] Error handling works

---

### **Balance Display Component (Day 2)**

- [ ] **Update MarketPage Header**
  - [ ] Add balance display:
    ```tsx
    const { data: balance, isLoading } = useMockUSDCBalance(clientWallet)

    <header className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Market Intelligence</h1>
        <p className="text-gray-400">Real-time DeFi analytics</p>
      </div>
      <div className="text-right">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <p className="text-sm text-gray-400">Your Balance</p>
            <p className="text-2xl font-bold text-white">
              ${balance?.formatted} <span className="text-sm text-gray-500">Mock USDC</span>
            </p>
            <p className="text-xs text-gray-500">
              Last updated: {formatDistanceToNow(balance?.lastUpdate)}
            </p>
          </>
        )}
      </div>
    </header>
    ```

- [ ] **Add Balance Change Indicator**
  - [ ] Store previous balance in state or localStorage
  - [ ] Compare current vs previous
  - [ ] Show green ↑ if increased, red ↓ if decreased
  - [ ] Display change: "+$50.23 (+1.2%)" in 24h

**Test Checklist**:
- [ ] Balance displays in header
- [ ] Shows loading state on first fetch
- [ ] Updates in real-time
- [ ] "Last updated" timestamp is accurate
- [ ] Change indicator shows correctly

---

### **Phase 5 Complete When**:
✅ Balance hook fetches from blockchain
✅ Balance displays in MarketPage header
✅ Updates every 10 seconds automatically
✅ Shows change indicator
✅ Matches on-chain balance exactly

**Deliverable**: Screenshot of header showing real Mock USDC balance

---

## 🎨 **PHASE 6: Polish & Advanced Features**

**Goal**: Enhance UX and add advanced analytics

**Estimated Time**: 1-2 weeks (ongoing)
**Priority**: 🔵 LOW - Post-MVP enhancements

### **Additional Categories (Week 1)**

- [ ] **CeFi Category**
  - [ ] Define data sources (Coinbase, Binance APIs?)
  - [ ] Create CeFi protocol cards
  - [ ] Implement data fetching

- [ ] **Liquidity Pool Category**
  - [ ] Add Uniswap V3, Curve, Balancer
  - [ ] Show APY + IL (Impermanent Loss) estimates
  - [ ] Warning badges for high IL risk

- [ ] **Arbitrage Category**
  - [ ] Cross-protocol yield comparisons
  - [ ] Highlight opportunities (>1% yield difference)
  - [ ] Calculate profit after gas fees

- [ ] **Hedging Category**
  - [ ] Options protocols (Opyn, Ribbon)
  - [ ] Perpetuals (GMX, dYdX)
  - [ ] Delta-neutral strategies

---

### **Historical Charts (Week 1-2)**

- [ ] **Create APY History Table**
  ```sql
  CREATE TABLE apy_history (
    id UUID PRIMARY KEY,
    protocol VARCHAR(50),
    token VARCHAR(10),
    chain_id INT,
    supply_apy DECIMAL(10, 4),
    tvl NUMERIC(40, 2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- [ ] **Create Data Collection Cron Job**
  - [ ] Run every hour
  - [ ] Fetch all protocol APYs
  - [ ] Insert into `apy_history` table

- [ ] **Add Chart Component**
  - [ ] Install Recharts: `pnpm add recharts`
  - [ ] Create `APYChart.tsx` component
  - [ ] Show 30-day APY trend
  - [ ] Add to ProtocolCard (toggle view)

---

### **Risk Scoring System (Week 2)**

- [ ] **Implement Risk Calculator**
  - [ ] Fetch additional metrics (oracle health, bad debt)
  - [ ] Calculate score (0-100)
  - [ ] Display in RawDataView

- [ ] **Add Risk Breakdown**
  - [ ] Show factors: Utilization (30%), TVL (25%), etc.
  - [ ] Visual bar chart
  - [ ] Explanation tooltip

---

### **Compare Protocols Feature (Week 2)**

- [ ] **Create Comparison View**
  - [ ] Multi-select protocols
  - [ ] Side-by-side comparison table
  - [ ] Highlight best metrics in green

---

### **Notifications & Alerts (Week 2)**

- [ ] **Define Alert Rules**
  - [ ] Utilization >90%
  - [ ] APY change >2% in 24h
  - [ ] Protocol status changes to "critical"

- [ ] **Create AlertsPanel Component**
  - [ ] Display in MarketPage
  - [ ] Badge count indicator
  - [ ] Click to see all alerts

---

### **Performance Optimization (Ongoing)**

- [ ] **Code Splitting**
  - [ ] Lazy load category sections
  - [ ] Dynamic imports for heavy components

- [ ] **Memoization**
  - [ ] Use `React.memo` for protocol cards
  - [ ] Use `useMemo` for expensive calculations

- [ ] **Virtual Scrolling**
  - [ ] If protocol list grows large
  - [ ] Use `react-window` or `react-virtualized`

---

### **Mobile Responsive (Week 3)**

- [ ] **Responsive Layout**
  - [ ] Stack columns on mobile (<768px)
  - [ ] Collapsible chat interface
  - [ ] Touch-friendly button sizes

- [ ] **Test on Devices**
  - [ ] iPhone (Safari)
  - [ ] Android (Chrome)
  - [ ] iPad (tablet view)

---

## ✅ **Definition of Done Checklist**

### **MVP Ready** (Phases 1-5 Complete)

- [ ] All protocol data fetches successfully
- [ ] MarketPage matches sketch design
- [ ] Can toggle between Overview and Raw Data
- [ ] AI chat provides intelligent answers
- [ ] Executor allows protocol selection
- [ ] Mock USDC balance displays accurately
- [ ] Gray theme applied consistently
- [ ] No console errors or warnings
- [ ] Loading states work correctly
- [ ] Error handling is robust

### **Production Ready** (All Phases Complete)

- [ ] All categories implemented (DeFi, CeFi, LP, Arbitrage, Hedging)
- [ ] Historical APY charts working
- [ ] Risk scoring system implemented
- [ ] Compare protocols feature added
- [ ] Notifications and alerts working
- [ ] Performance optimized (<2s page load)
- [ ] Mobile responsive
- [ ] Unit tests (>80% coverage)
- [ ] E2E tests for critical flows
- [ ] Security audit passed
- [ ] Documentation complete

---

## 🎯 **Next Action Items**

### **Start Here** (Right Now):
1. [ ] Read `MARKET_DASHBOARD_CORE_SPEC.md` completely
2. [ ] Install React Query: `pnpm add @tanstack/react-query`
3. [ ] Create Phase 1 files:
   - [ ] `packages/core/service/defi-protocol.service.ts`
   - [ ] `apps/whitelabel-web/src/hooks/useDeFiProtocols.ts`
4. [ ] Implement `useAAVEData()` hook (first task)
5. [ ] Test and show Claude your implementation

### **Daily Standup Questions**:
- What did I complete yesterday?
- What will I work on today?
- Am I blocked on anything?

### **Weekly Review**:
- How many tasks completed this week?
- Which phase am I in?
- What's the biggest challenge?
- Do I need help or guidance?

---

## 📸 **Progress Tracking**

### **Screenshots to Take**:
- [ ] Phase 1 Complete: Browser console showing protocol data
- [ ] Phase 2 Complete: MarketPage with real data and cards
- [ ] Phase 3 Complete: AI chat responding intelligently
- [ ] Phase 4 Complete: Executor with protocol selection
- [ ] Phase 5 Complete: Balance display in header
- [ ] Final MVP: Full dashboard working end-to-end

### **Videos to Record**:
- [ ] AI chat conversation (ask 3-5 questions)
- [ ] Full user flow: View data → Ask AI → Select protocols → Deploy
- [ ] Error handling demonstration
- [ ] Mobile responsive view

---

## 🐛 **Bug Tracker**

### **Known Issues**:
- [ ] List any bugs you encounter during implementation
- [ ] Track workarounds or temporary fixes
- [ ] Link to GitHub issues if using issue tracking

---

## 📅 **Timeline Estimates**

```
Week 1: Phase 1 (Data Layer)
Week 2: Phase 2 (UI Components)
Week 3: Phase 3 (AI Integration)
Week 4: Phase 4 (Executor) + Phase 5 (Balance)
Week 5-6: Phase 6 (Polish & Advanced)

Target MVP Date: 6 weeks from start
Target Production Date: 8 weeks from start
```

---

**Last Updated**: 2025-12-01
**Current Phase**: Phase 1 - Data Layer Foundation
**Next Milestone**: Complete Phase 1 by [DATE]
**Blocked On**: None currently
