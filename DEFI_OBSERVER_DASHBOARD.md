# DeFi Observer Dashboard - Design & Architecture

> **Vision:** AI-powered DeFi analytics dashboard with chatbot assistance and multi-protocol data aggregation

## 🎯 Dashboard Overview

### Page Structure

```
/dashboard/defi-observer
├── AI Chatbot Section (Top or Sidebar)
│   ├── Chat Interface
│   ├── AI-powered DeFi analysis
│   └── Ask questions about protocols, yields, risks
│
└── Protocol Data Sections (Scrollable Cards)
    ├── 💰 DeFi Lending (AAVE, Compound, Morpho, Circle)
    ├── 🏦 CeFi (Centralized Finance integrations)
    ├── 💧 Liquidity Pools (Uniswap, Curve, Balancer)
    ├── 🛡️ Hedging (Options, Perpetuals)
    └── 🔄 Arbitrage (Cross-protocol opportunities)
```

## 📊 UI/UX Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: DeFi Observer | Real-time Protocol Analytics        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Assistant                                    [Minimize]│
│ ─────────────────────────────────────────────────────────   │
│ Ask me anything about DeFi yields, risks, or strategies...  │
│                                                             │
│ 💬 [Chat Input Box]                               [Send →] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💰 DeFi Lending Protocols                     [Expand All ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │   AAVE   │  │ Compound │  │  Morpho  │  │  Circle  │    │
│ │  ──────  │  │  ──────  │  │  ──────  │  │  ──────  │    │
│ │ APY: 5.2%│  │ APY: 4.1%│  │ APY: 6.5%│  │ APY: N/A │    │
│ │ TVL: $5B │  │ TVL: $3B │  │ TVL: $500M│ │ TVL: N/A │    │
│ │          │  │          │  │          │  │          │    │
│ │ [Details]│  │ [Details]│  │ [Details]│  │ [Details]│    │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏦 CeFi Integrations                           [Expand All ▼]│
├─────────────────────────────────────────────────────────────┤
│ (Coming soon: Centralized finance integrations)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💧 Liquidity Pools                             [Expand All ▼]│
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│ │ Uniswap  │  │  Curve   │  │ Balancer │                   │
│ │  V3 USDC │  │ 3pool    │  │ Stable   │                   │
│ │ APY: 3.8%│  │ APY: 2.5%│  │ APY: 4.2%│                   │
│ │ [Details]│  │ [Details]│  │ [Details]│                   │
│ └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Data Sources

### Primary Sources

```typescript
// 1. DeFi Protocol Data (Smart Contracts + SDKs)
├── AAVE
│   ├── Source: @proxify/yield-engine AaveAdapter
│   ├── Data: APY, TVL, user positions, aToken balances
│   └── Methods: getSupplyAPY(), getUserPosition(), getMetrics()
│
├── Compound
│   ├── Source: @proxify/yield-engine CompoundAdapter
│   ├── Data: APY, TVL, user positions, cToken balances
│   └── Methods: getSupplyAPY(), getUserPosition(), getMetrics()
│
├── Morpho
│   ├── Source: @proxify/yield-engine MorphoAdapter
│   ├── Data: APY, TVL, vault shares, vault metadata
│   └── Methods: getSupplyAPY(), getUserPosition(), getMetrics()
│
└── Circle
    ├── Source: Circle SDK / API (if available)
    ├── Data: USDC supply info, institutional yields
    └── Methods: TBD based on Circle's API

// 2. News & Market Data
├── CoinGecko API
│   ├── Token prices
│   └── Market cap data
│
├── DeFiLlama API
│   ├── Protocol TVL
│   ├── Historical APY
│   └── Chain analytics
│
└── RSS Feeds / News APIs
    ├── CoinDesk
    ├── The Block
    └── DeFi-specific news
```

## 🏗️ Architecture

### Component Structure

```
apps/whitelabel-web/src/feature/defi-observer/
├── DeFiObserverPage.tsx                 # Main page
├── components/
│   ├── ai/
│   │   ├── AIChatbot.tsx               # AI assistant interface
│   │   ├── ChatMessage.tsx             # Individual messages
│   │   └── ChatInput.tsx               # User input
│   │
│   ├── protocol-sections/
│   │   ├── DeFiLendingSection.tsx      # DeFi lending protocols
│   │   ├── CeFiSection.tsx             # CeFi integrations
│   │   ├── LiquidityPoolsSection.tsx   # LP protocols
│   │   ├── HedgingSection.tsx          # Hedging strategies
│   │   └── ArbitrageSection.tsx        # Arbitrage opportunities
│   │
│   ├── protocol-cards/
│   │   ├── AAVECard.tsx                # AAVE protocol card
│   │   ├── CompoundCard.tsx            # Compound protocol card
│   │   ├── MorphoCard.tsx              # Morpho protocol card
│   │   ├── CircleCard.tsx              # Circle USDC card
│   │   └── ProtocolCardBase.tsx        # Base card component
│   │
│   ├── modals/
│   │   ├── ProtocolDetailsModal.tsx    # Detailed protocol view
│   │   └── NewsModal.tsx               # News article viewer
│   │
│   └── shared/
│       ├── StatCard.tsx                # Reusable stat display
│       ├── APYDisplay.tsx              # APY formatting
│       └── TVLDisplay.tsx              # TVL formatting
│
├── hooks/
│   ├── useProtocolData.ts              # Fetch protocol data
│   ├── useAIChatbot.ts                 # AI chatbot logic
│   ├── useNewsFeeds.ts                 # News aggregation
│   └── useRealTimeUpdates.ts           # WebSocket/polling
│
└── store/
    ├── deFiObserverStore.ts            # Zustand store
    └── aiChatStore.ts                  # Chat history store
```

### Backend Services

```
packages/core/service/
├── defi-observer.service.ts            # NEW - Observer service
│   ├── fetchAllProtocolData()          # Aggregate all protocols
│   ├── fetchProtocolNews()             # Fetch news
│   └── generateAIInsights()            # AI analysis
│
└── ai-chatbot.service.ts               # NEW - AI chatbot
    ├── handleUserQuery()               # Process questions
    ├── analyzeProtocolRisks()          # Risk analysis
    └── suggestStrategies()             # Strategy suggestions

apps/b2b-api/src/router/
└── defi-observer.router.ts             # NEW - API endpoints
    ├── GET /api/defi-observer/protocols
    ├── GET /api/defi-observer/news
    └── POST /api/defi-observer/ai-chat
```

## 📡 API Integration

### Using Yield Engine Package

```typescript
// packages/core/service/defi-observer.service.ts

import { AaveAdapter, CompoundAdapter, MorphoAdapter } from '@proxify/yield-engine';

export class DeFiObserverService {
  private aave: AaveAdapter;
  private compound: CompoundAdapter;
  private morpho: MorphoAdapter;

  constructor() {
    this.aave = new AaveAdapter(8453); // Base chain
    this.compound = new CompoundAdapter(8453);
    this.morpho = new MorphoAdapter(8453);
  }

  /**
   * Fetch all DeFi lending protocol data
   */
  async fetchDeFiLendingData(token: string = 'USDC') {
    const [aaveData, compoundData, morphoData] = await Promise.all([
      this.fetchAAVEData(token),
      this.fetchCompoundData(token),
      this.fetchMorphoData(token),
    ]);

    return {
      protocols: [
        { name: 'AAVE', ...aaveData },
        { name: 'Compound', ...compoundData },
        { name: 'Morpho', ...morphoData },
      ],
      bestAPY: Math.max(
        parseFloat(aaveData.apy),
        parseFloat(compoundData.apy),
        parseFloat(morphoData.apy)
      ),
      timestamp: new Date(),
    };
  }

  /**
   * Fetch AAVE protocol data
   */
  private async fetchAAVEData(token: string) {
    const apy = await this.aave.getSupplyAPY(token, 8453);
    const metrics = await this.aave.getMetrics(token, 8453);

    return {
      protocol: 'AAVE',
      apy,
      tvl: metrics.tvl,
      liquidity: metrics.liquidity,
      status: 'healthy',
      lastUpdate: new Date(),
    };
  }

  /**
   * Fetch Compound protocol data
   */
  private async fetchCompoundData(token: string) {
    const apy = await this.compound.getSupplyAPY(token, 8453);
    const metrics = await this.compound.getMetrics(token, 8453);

    return {
      protocol: 'Compound',
      apy,
      tvl: metrics.tvl,
      liquidity: metrics.liquidity,
      status: 'healthy',
      lastUpdate: new Date(),
    };
  }

  /**
   * Fetch Morpho protocol data
   */
  private async fetchMorphoData(token: string) {
    const apy = await this.morpho.getSupplyAPY(token, 8453);
    const metrics = await this.morpho.getMetrics(token, 8453);

    return {
      protocol: 'Morpho',
      apy,
      tvl: metrics.tvl,
      metadata: metrics.metadata,
      status: 'healthy',
      lastUpdate: new Date(),
    };
  }

  /**
   * Fetch news from multiple sources
   */
  async fetchProtocolNews(protocol?: string) {
    // Integrate with news APIs (CoinDesk, The Block, etc.)
    // Filter by protocol if specified

    return [
      {
        title: 'AAVE V3 Launches New Feature',
        source: 'CoinDesk',
        url: 'https://...',
        publishedAt: new Date(),
        summary: '...',
      },
      // ... more news
    ];
  }
}
```

## 🤖 AI Chatbot Integration

### AI Service

```typescript
// packages/core/service/ai-chatbot.service.ts

import Anthropic from '@anthropic-ai/sdk';
import { DeFiObserverService } from './defi-observer.service';

export class AIChatbotService {
  private anthropic: Anthropic;
  private observerService: DeFiObserverService;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.observerService = new DeFiObserverService();
  }

  /**
   * Handle user query about DeFi protocols
   */
  async handleQuery(userMessage: string, conversationHistory: any[]) {
    // Fetch latest protocol data
    const protocolData = await this.observerService.fetchDeFiLendingData('USDC');

    // Build system prompt with real-time data
    const systemPrompt = `
You are a DeFi analytics assistant helping users understand yield opportunities.

Current Protocol Data (Base chain, USDC):
- AAVE: ${protocolData.protocols[0].apy}% APY, $${protocolData.protocols[0].tvl} TVL
- Compound: ${protocolData.protocols[1].apy}% APY, $${protocolData.protocols[1].tvl} TVL
- Morpho: ${protocolData.protocols[2].apy}% APY, $${protocolData.protocols[2].tvl} TVL

Best APY: ${protocolData.bestAPY}%

Answer user questions about:
- Current yields and APY comparisons
- Protocol risks and safety
- Where to deploy funds
- Historical performance trends
- Gas costs and fees
- Liquidity and TVL

Be concise, accurate, and helpful. Use the data above to provide specific recommendations.
    `;

    // Call Claude API
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    });

    return {
      message: response.content[0].text,
      timestamp: new Date(),
      protocolDataUsed: protocolData,
    };
  }
}
```

## 🎨 Frontend Implementation

### Main Page Component

```tsx
// apps/whitelabel-web/src/feature/defi-observer/DeFiObserverPage.tsx

import { useState } from 'react';
import { AIChatbot } from './components/ai/AIChatbot';
import { DeFiLendingSection } from './components/protocol-sections/DeFiLendingSection';
import { useProtocolData } from './hooks/useProtocolData';

export function DeFiObserverPage() {
  const [chatMinimized, setChatMinimized] = useState(false);
  const { protocols, isLoading, error } = useProtocolData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-black">DeFi Observer</h1>
          <p className="text-gray-600">Real-time protocol analytics & AI insights</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Chatbot */}
        {!chatMinimized && (
          <div className="mb-8">
            <AIChatbot onMinimize={() => setChatMinimized(true)} />
          </div>
        )}

        {chatMinimized && (
          <button
            onClick={() => setChatMinimized(false)}
            className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all z-50"
          >
            🤖 Open AI Assistant
          </button>
        )}

        {/* Protocol Sections */}
        <div className="space-y-6">
          <DeFiLendingSection protocols={protocols} loading={isLoading} />

          {/* Future sections */}
          {/* <CeFiSection /> */}
          {/* <LiquidityPoolsSection /> */}
          {/* <HedgingSection /> */}
          {/* <ArbitrageSection /> */}
        </div>
      </div>
    </div>
  );
}
```

### Protocol Card Component

```tsx
// apps/whitelabel-web/src/feature/defi-observer/components/protocol-cards/AAVECard.tsx

import { useState } from 'react';
import { ProtocolDetailsModal } from '../modals/ProtocolDetailsModal';

interface AAVECardProps {
  apy: string;
  tvl: string;
  liquidity: string;
  status: 'healthy' | 'warning' | 'error';
}

export function AAVECard({ apy, tvl, liquidity, status }: AAVECardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
        {/* Protocol Logo & Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h3 className="font-bold text-black">AAVE</h3>
            <p className="text-sm text-gray-600">v3 Protocol</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">APY</span>
            <span className="text-2xl font-bold text-green-600">{apy}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">TVL</span>
            <span className="font-semibold text-black">${tvl}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Liquidity</span>
            <span className="font-semibold text-black">${liquidity}</span>
          </div>

          {/* Status Badge */}
          <div className="pt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'healthy' ? 'bg-green-100 text-green-700' :
              status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {status === 'healthy' ? '✓ Healthy' :
               status === 'warning' ? '⚠ Warning' :
               '✗ Error'}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => setShowDetails(true)}
          className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-black py-2 rounded-lg font-medium transition-colors"
        >
          View Details →
        </button>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <ProtocolDetailsModal
          protocol="AAVE"
          data={{ apy, tvl, liquidity, status }}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
```

## 🔄 Real-Time Updates

### WebSocket / Polling Strategy

```typescript
// apps/whitelabel-web/src/feature/defi-observer/hooks/useRealTimeUpdates.ts

import { useEffect, useState } from 'react';

export function useRealTimeUpdates(updateInterval = 60000) { // 1 minute
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Trigger refetch of protocol data
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return { lastUpdate };
}
```

## 🗺️ Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create DeFiObserverService using yield-engine
- [ ] Create API endpoints for protocol data
- [ ] Set up basic page structure
- [ ] Implement protocol cards (AAVE, Compound, Morpho)

### Phase 2: AI Integration (Week 2)
- [ ] Create AIChatbotService with Claude
- [ ] Build chat UI component
- [ ] Integrate real-time protocol data into AI context
- [ ] Add conversation history

### Phase 3: Advanced Features (Week 3-4)
- [ ] Add news feed integration
- [ ] Implement protocol details modal
- [ ] Add liquidity pools section
- [ ] Add Circle USDC integration
- [ ] Real-time updates (WebSocket/polling)

### Phase 4: Polish & Testing (Week 5)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Error handling
- [ ] Integration testing

---

**Status:** Design Complete - Ready for Implementation
**Priority:** High - Key differentiator feature
**Dependencies:** yield-engine package (✅ ready), Claude API, DeFiLlama API
