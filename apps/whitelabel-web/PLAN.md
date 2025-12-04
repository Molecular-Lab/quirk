# Unified Yield Dashboard Implementation Plan

## Overview
Enhance the existing **StrategiesPage** (at `/dashboard/explore`) to become a unified yield dashboard by integrating real-time DeFi protocol data, AI-powered recommendations, and transparent data freshness indicators.

---

## Architecture Analysis

### Current State

#### Routes & Pages
- **`/dashboard/explore`** → `StrategiesPage.tsx` ✅ (our base - already has great UI)
- **`/dashboard/market`** → `MarketPage.tsx` ✅ (has real protocol data)
- **`ExplorePage.tsx`** → ❌ NOT USED (can be deleted)

#### Existing StrategiesPage Features
- 3 revenue packages (Mercury, Molecular, Neutron) with risk levels
- Strategy allocation sliders (Arbitrage, DeFi Staking, Placing LP)
- Mock AI advisor chat
- Clean, minimal visual style with large numbers and smooth interactions
- Responsive 2-column layout (chat/packages left, allocation sliders right)

#### What We Have Available
- **yield-engine package**: Aggregator + Optimizer with risk profile support
- **agent package**: FastAPI server on port 8000 with LangChain/MCP
- **B2B API**: Port 8888 serving protocol data
- **useDeFiProtocols hook**: Fetches live AAVE, Compound, Morpho data

### Target State
Transform `/dashboard/explore` into a unified dashboard with:
1. **Real Risk-Based Packages** (replace mock with yield-engine optimizer)
2. **Live Protocol Data Section** (integrate MarketPage data)
3. **AI Concierge** (upgrade mock chat to real agent API)
4. **Data Freshness Visualization** (countdown to next cache refresh)

---

## Phase 1: Integrate Real Protocol Data
**Goal**: Replace mock data with real DeFi protocol data and optimization

### Tasks

#### 1.1 Add Protocol Data Display to StrategiesPage
**File**: `src/feature/dashboard/StrategiesPage.tsx`

**Changes**:
1. Import `useAllDeFiProtocols` hook
2. Add protocol data section below the package selection
3. Show live APY, TVL, Utilization for AAVE, Compound, Morpho

**Implementation**:
```tsx
// Add to imports
import { useAllDeFiProtocols } from '../../hooks/useDeFiProtocols'

// Add inside component
const { protocols, isLoading, errors } = useAllDeFiProtocols('USDC', 8453)
```

**Visual Design** (keep existing style):
- Simple white cards with border-gray-200
- Protocol icon/avatar (reuse from MarketPage `ProtocolCard`)
- Display: Protocol name, APY (large green text), TVL, Utilization
- Grid layout below package selection

#### 1.2 Create Backend Optimization Endpoint
**File**: `apps/b2b-api/src/router/defi.router.ts` (or create new)

**New Endpoint**: `POST /api/v1/defi/optimize`

**Request**:
```typescript
{
  riskProfile: { level: 'conservative' | 'moderate' | 'aggressive' },
  token: 'USDC',
  chainId: 8453
}
```

**Response**:
```typescript
{
  riskLevel: 'moderate',
  allocation: [
    { protocol: 'morpho', percentage: 45, expectedAPY: '6.80' },
    { protocol: 'aave', percentage: 35, expectedAPY: '5.25' },
    { protocol: 'compound', percentage: 20, expectedAPY: '4.90' }
  ],
  expectedBlendedAPY: '5.92',
  confidence: 85,
  strategy: 'risk-adjusted'
}
```

**Implementation**:
```typescript
import { YieldOptimizer } from '@proxify/yield-engine'

router.post('/optimize', async (req, res) => {
  const { riskProfile, token, chainId } = req.body

  const optimizer = new YieldOptimizer()
  const result = await optimizer.optimizePosition(
    'dummy-wallet',
    token,
    chainId,
    riskProfile
  )

  // Transform rankedOpportunities into allocation percentages
  const allocation = calculateAllocation(result.rankedOpportunities, riskProfile)

  res.json({ ...result, allocation })
})
```

#### 1.3 Replace Mock Packages with Real Risk Profiles
**File**: `src/feature/dashboard/StrategiesPage.tsx`

**Changes**:
1. Rename packages to match risk levels:
   - Mercury → Conservative (Low Risk, ~3-5% APY)
   - Molecular → Moderate (Medium Risk, ~5-7% APY)
   - Neutron → Aggressive (High Risk, ~7-10% APY)

2. On package selection, call `/api/v1/defi/optimize`
3. Update strategy allocation to show protocol-based allocation (AAVE, Compound, Morpho)
4. Replace "Arbitrage, DeFi Staking, Placing LP" with "AAVE, Compound, Morpho"

**New Strategy Interface**:
```typescript
interface ProtocolAllocation {
  id: 'aave' | 'compound' | 'morpho'
  name: string
  description: string
  allocation: number
  currentAPY: string
  tvl: string
}
```

---

## Phase 2: Add Data Freshness Indicator
**Goal**: Visualize when protocol data was last updated and next refresh

### Tasks

#### 2.1 Create DataFreshnessBar Component
**File**: `src/components/market/DataFreshnessBar.tsx`

**Visual Design** (match StrategiesPage style):
- Minimal, clean design
- Display: "Last Updated: 45s ago • Next refresh: 15s"
- Progress bar (0-60 seconds) with color transition:
  - 0-30s: Green (fresh)
  - 30-50s: Yellow (aging)
  - 50-60s: Red (stale) → triggers refetch

**Implementation**:
```tsx
export function DataFreshnessBar() {
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)
  const REFRESH_INTERVAL = 60 // seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate(prev => (prev >= REFRESH_INTERVAL ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const progress = (secondsSinceUpdate / REFRESH_INTERVAL) * 100
  const timeRemaining = REFRESH_INTERVAL - secondsSinceUpdate

  const barColor =
    progress < 50 ? 'bg-green-500' :
    progress < 83 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Last Updated: {secondsSinceUpdate}s ago</span>
        <span>Next refresh: {timeRemaining}s</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

#### 2.2 Integrate into StrategiesPage
**File**: `src/feature/dashboard/StrategiesPage.tsx`

**Changes**:
- Add `DataFreshnessBar` above the protocol data section
- Reset countdown when `protocols` data updates
- Show "Refreshing..." state during refetch

---

## Phase 3: Upgrade AI Chat to Real Agent
**Goal**: Connect mock AI advisor to real agent API at localhost:8000

### Tasks

#### 3.1 Create useAgentChat Hook
**File**: `src/hooks/useAgentChat.ts`

**Implementation**:
```typescript
import { useState } from 'react'
import axios from 'axios'

const AGENT_API_URL = 'http://localhost:8000/agent'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI yield advisor. Ask me about DeFi protocols, risk levels, or strategies.',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await axios.post(AGENT_API_URL, { message: content })

      const agentMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please check if the agent server is running on port 8000.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, sendMessage, isLoading }
}
```

#### 3.2 Update StrategiesPage Chat Section
**File**: `src/feature/dashboard/StrategiesPage.tsx`

**Changes**:
1. Replace `useState(chatMessages)` with `useAgentChat()` hook
2. Add input field and send button (currently hidden in mock)
3. Add typing indicator when `isLoading` is true
4. Make chat scrollable with auto-scroll to bottom

**UI Updates**:
```tsx
const { messages, sendMessage, isLoading } = useAgentChat()
const [input, setInput] = useState('')

// In chat section, add input field:
<div className="border-t border-gray-200 pt-4 mt-4">
  <div className="flex gap-2">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      placeholder="Ask about protocols, risk levels, or strategies..."
      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
    />
    <button
      onClick={handleSend}
      disabled={!input.trim() || isLoading}
      className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
    >
      Send
    </button>
  </div>
</div>

// Show typing indicator
{isLoading && (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
      <span className="text-white text-xs font-bold">AI</span>
    </div>
    <div className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-200">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
      </div>
    </div>
  </div>
)}
```

#### 3.3 Add Suggested Questions
**File**: `src/feature/dashboard/StrategiesPage.tsx`

**Changes**:
- Add quick action pills below input when messages.length === 1 (initial state)

**Suggested Questions**:
```tsx
const SUGGESTED_QUESTIONS = [
  "What is the risk of Morpho?",
  "Compare AAVE vs Compound",
  "Why is Morpho's APY higher?",
  "Explain conservative strategy"
]

// Render as clickable pills
{messages.length === 1 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {SUGGESTED_QUESTIONS.map(question => (
      <button
        key={question}
        onClick={() => sendMessage(question)}
        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
      >
        {question}
      </button>
    ))}
  </div>
)}
```

---

## Phase 4: Add Floating AI Concierge (Optional Enhancement)
**Goal**: Create a floating widget version for persistent access

### Tasks

#### 4.1 Create FloatingConcierge Component
**File**: `src/components/chat/FloatingConcierge.tsx`

**Visual Design**:
- Fixed position: bottom-right (24px from bottom, 24px from right)
- Collapsed: Circular FAB (56px diameter) with AI icon
- Expanded: 400x600px chat window with backdrop-blur
- Smooth slide-in animation

**States**:
1. Collapsed (default)
2. Expanded (user clicks FAB)

**Implementation**:
```tsx
export function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, sendMessage, isLoading } = useAgentChat()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        // FAB Button
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 flex items-center justify-center"
        >
          <span className="text-sm font-bold">AI</span>
        </button>
      ) : (
        // Chat Window
        <div className="w-[400px] h-[600px] bg-white/95 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="font-semibold text-gray-900">Yield Advisor</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Chat messages - reuse same UI from StrategiesPage */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Same message rendering logic */}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            {/* Same input UI */}
          </div>
        </div>
      )}
    </div>
  )
}
```

#### 4.2 Add to Root Layout
**File**: `src/routes/__root.tsx` or `src/routes/dashboard.tsx`

**Changes**:
- Import and render `<FloatingConcierge />` at the bottom of the layout
- Ensure it appears on all dashboard pages

---

## Phase 5: Testing & Refinement
**Goal**: Ensure all integrations work correctly

### Tasks

#### 5.1 Backend Testing
- [ ] Test `/api/v1/defi/optimize` endpoint with all risk levels
- [ ] Verify yield-engine optimizer returns valid allocations
- [ ] Test error handling (protocol down, invalid params)
- [ ] Verify allocation percentages sum to 100%

#### 5.2 Frontend Testing
- [ ] Test protocol data loading and refresh cycle
- [ ] Verify data freshness bar countdown works correctly
- [ ] Test package selection and allocation update
- [ ] Test AI chat with various questions
- [ ] Verify error handling (agent down, network error)

#### 5.3 Integration Testing
**User Flow**:
1. User visits `/dashboard/explore`
2. Sees 3 risk packages (Conservative, Moderate, Aggressive)
3. Clicks "Moderate" package
4. Backend calls optimizer, returns allocation
5. Strategy sliders update to show AAVE 35%, Compound 20%, Morpho 45%
6. User sees live protocol data below
7. User asks AI: "Why is Morpho's allocation highest?"
8. Agent responds with explanation

#### 5.4 Mobile Responsiveness
- [ ] Test on mobile (320px-768px)
- [ ] Verify 2-column layout stacks vertically
- [ ] Test floating concierge on small screens
- [ ] Ensure input fields and buttons are accessible

---

## Phase 6: Polish & Deployment
**Goal**: Final touches and production readiness

### Tasks

#### 6.1 Code Cleanup
- [ ] Remove unused `ExplorePage.tsx` file
- [ ] Update type definitions for protocol allocations
- [ ] Add JSDoc comments to new hooks and components
- [ ] Remove console.logs and debug code

#### 6.2 Error Handling
- [ ] Add retry logic for failed protocol fetches
- [ ] Show user-friendly error messages
- [ ] Add fallback UI if optimizer fails
- [ ] Handle agent API timeout (15s limit)

#### 6.3 Performance Optimization
- [ ] Memoize expensive calculations
- [ ] Optimize re-renders with React.memo
- [ ] Lazy load FloatingConcierge if not using initially
- [ ] Ensure 60s refetch doesn't cause jank

#### 6.4 Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add focus indicators

---

## Implementation Order

### Week 1: Core Integration
- **Day 1-2**: Phase 1.1-1.2 (Protocol data + Backend endpoint)
- **Day 3**: Phase 1.3 (Replace mock packages with real risk profiles)
- **Day 4**: Phase 2 (Data freshness indicator)
- **Day 5**: Phase 3.1-3.2 (Real AI chat integration)

### Week 2: Enhancement & Testing
- **Day 1**: Phase 3.3 (Suggested questions)
- **Day 2**: Phase 4 (Floating concierge - optional)
- **Day 3-4**: Phase 5 (Testing)
- **Day 5**: Phase 6 (Polish & deployment)

---

## File Structure

```
apps/whitelabel-web/
├── src/
│   ├── feature/
│   │   └── dashboard/
│   │       ├── StrategiesPage.tsx              [MODIFY - main work]
│   │       ├── MarketPage.tsx                  [KEEP - reference for protocol data]
│   │       ├── ExplorePage.tsx                 [DELETE - not used]
│   │       └── AnalyticsPage.tsx               [KEEP]
│   ├── components/
│   │   ├── market/
│   │   │   ├── ProtocolCard.tsx                [REUSE]
│   │   │   └── DataFreshnessBar.tsx            [NEW]
│   │   └── chat/
│   │       └── FloatingConcierge.tsx           [NEW - optional]
│   ├── hooks/
│   │   ├── useDeFiProtocols.ts                 [EXISTING]
│   │   └── useAgentChat.ts                     [NEW]
│   └── routes/
│       └── dashboard/
│           ├── explore.tsx                     [KEEP - uses StrategiesPage]
│           └── market.tsx                      [KEEP]
│
├── PLAN.md                                      [THIS FILE]
└── README.md

packages/b2b-api/
└── src/
    └── router/
        └── defi.router.ts                       [MODIFY - add /optimize endpoint]

packages/yield-engine/
└── src/
    ├── optimizer/                               [EXISTING - already implemented]
    └── aggregator/                              [EXISTING - already implemented]

packages/agent/
└── src/
    └── api/
        ├── app.py                               [EXISTING]
        └── routes.py                            [EXISTING]
```

---

## API Contracts

### 1. POST /api/v1/defi/optimize
**Request**:
```json
{
  "riskProfile": {
    "level": "moderate"
  },
  "token": "USDC",
  "chainId": 8453
}
```

**Response**:
```json
{
  "riskLevel": "moderate",
  "allocation": [
    {
      "protocol": "morpho",
      "percentage": 45,
      "expectedAPY": "6.80",
      "tvl": "500000000",
      "rationale": "Highest APY with acceptable risk"
    },
    {
      "protocol": "aave",
      "percentage": 35,
      "expectedAPY": "5.25",
      "tvl": "1500000000",
      "rationale": "Established protocol with high TVL"
    },
    {
      "protocol": "compound",
      "percentage": 20,
      "expectedAPY": "4.90",
      "tvl": "800000000",
      "rationale": "Conservative hedge"
    }
  ],
  "expectedBlendedAPY": "5.92",
  "confidence": 85,
  "strategy": "risk-adjusted",
  "timestamp": 1234567890
}
```

### 2. POST http://localhost:8000/agent
**Request**:
```json
{
  "message": "Why is Morpho's allocation highest?"
}
```

**Response**:
```json
{
  "response": "Morpho has the highest allocation (45%) in the moderate risk strategy because it currently offers the best risk-adjusted yield at 6.80% APY. While Morpho is newer than Aave or Compound, it has proven security through its use of Morpho Blue protocol and maintains a healthy TVL of $500M. The moderate strategy balances this higher yield with safety by also allocating to more established protocols like Aave (35%) and Compound (20%).",
  "timestamp": 1234567890
}
```

---

## Success Metrics

### User Engagement
- [ ] 80%+ users interact with package selection
- [ ] 50%+ users adjust allocations
- [ ] 30%+ users ask at least one AI question
- [ ] Average session time > 3 minutes

### Technical Performance
- [ ] Time to first data render < 2 seconds
- [ ] Data refresh latency < 1 second
- [ ] Agent response time < 5 seconds
- [ ] Zero optimization errors (99.9% success rate)

### User Experience
- [ ] Task completion rate (select package → view allocation) > 90%
- [ ] AI satisfaction (implicit: follow-up questions) > 40%
- [ ] Mobile usage rate > 30%

---

## Risk Mitigation

### Risk 1: Agent API Downtime
**Mitigation**:
- Show "Agent unavailable" message in chat
- Add health check before sending message
- Fallback to FAQ or disable chat temporarily

### Risk 2: Protocol Data Fetch Failures
**Mitigation**:
- Show cached data with warning indicator
- Individual protocol error handling (don't fail entire page)
- Retry logic with exponential backoff

### Risk 3: Optimizer Returns Invalid Allocation
**Mitigation**:
- Validate allocation percentages sum to 100%
- Fallback to equal-weight allocation (33-33-33)
- Log errors for debugging

### Risk 4: Mobile UX Issues
**Mitigation**:
- Test on real devices (iOS Safari, Android Chrome)
- Reduce floating concierge size on mobile
- Stack layout vertically on small screens

---

## Future Enhancements (Post-MVP)

### Phase 7: Advanced Features
1. **Historical Performance**
   - 7-day, 30-day APY charts per protocol
   - Performance comparison view

2. **Wallet Integration**
   - Connect via Privy
   - Show user's actual positions
   - One-click rebalancing

3. **Custom Strategies**
   - Allow users to create custom allocations
   - Save and name strategies
   - Share strategies with others

4. **Notifications**
   - Alert when allocation drifts >10%
   - New high-yield opportunity alerts
   - Risk level changes

### Phase 8: Multi-Chain Support
- Expand beyond Base (8453)
- Support Ethereum, Polygon, Arbitrum
- Cross-chain yield comparison

### Phase 9: More Protocols
- Add Yearn, Convex, Aura
- DEX LP positions (Uniswap, Curve)
- Liquid staking tokens (stETH, rETH)

---

## Conclusion

This revised plan leverages the existing StrategiesPage as the foundation, preserving its excellent UI/UX while upgrading it with:
1. Real DeFi protocol data from yield-engine
2. AI-powered chat via agent API
3. Data freshness transparency
4. Risk-based optimization

**Key Advantages**:
- Minimal UI changes (users already familiar with the interface)
- Faster implementation (reuse existing components)
- Lower risk (incremental enhancements vs. complete rewrite)
- Consistent design language throughout the app

**Estimated Total Time**: 2 weeks (10 working days) for MVP (Phases 1-5)

**Next Steps**:
1. Review and approve this revised plan
2. Start with Phase 1.1 (add protocol data to StrategiesPage)
3. Test incrementally after each phase
4. Deploy to staging for user feedback
