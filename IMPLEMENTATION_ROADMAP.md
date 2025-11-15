# Proxify Implementation Roadmap

**Last Updated**: November 16, 2025  
**Current Branch**: `feat/wallet-infra`  
**Business Model**: B2B2C DeFi Yield Optimization Platform

---

## 🎯 Business Model (FINALIZED v3)

### What We Are Building

**Proxify**: A **white-label DeFi yield infrastructure** that enables any app (e-commerce, streaming, freelancing) to offer embedded DeFi wallets and yield optimization to their users.

### Core Value Proposition

**Turn idle cash into yield** - Any platform holding user funds can now offer DeFi earning opportunities without building the infrastructure themselves.

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: Proxify Platform (Us)                                   │
│ - Client onboarding & whitelisting                              │
│ - Custodial wallet creation (Privy)                             │
│ - SDK & white-label components                                  │
│ - DeFi protocol integration (AAVE, Curve, Compound, Uniswap)    │
│ - AI Agent for market analysis                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ TIER 2: Client (Product Owner)                                  │
│ Examples: E-commerce, Streaming, Freelancer platforms           │
│ - Register on Proxify dashboard                                │
│ - Get custodial wallet (controlled by client)                   │
│ - Embed @proxify/sdk into their app                            │
│ - Configure risk preferences for their users                    │
│ - Access analytics dashboard                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ TIER 3: End-User (Customer)                                     │
│ - On-ramp: Deposit fiat → USDC via Apple Pay/MoonPay           │
│ - View portfolio in white-label wallet UI                       │
│ - Set risk preferences (Conservative/Moderate/Aggressive)       │
│ - Earn yield automatically via DeFi                             │
│ - Withdraw anytime                                              │
└─────────────────────────────────────────────────────────────────┘
```

### User Journey Example

**Scenario**: Freelancer platform (like Upwork)

1. **Platform Owner** registers on Proxify
   - Creates account on our dashboard
   - Gets custodial wallet address (controlled by platform)
   - Gets API key + SDK access
   - Embeds our SDK into their app

2. **Freelancer (End-User)** gets paid $1,000 USDC
   - Money sits idle in platform wallet
   - Platform offers "Earn 5% APY on idle funds"
   - Freelancer clicks "Enable Earning"

3. **Our System** automatically:
   - Analyzes market conditions (AI Agent)
   - Finds best yield opportunity (AAVE lending at 5.2% APY)
   - Executes deposit transaction
   - Monitors position + auto-compounds

4. **Freelancer** sees in white-label UI:
   - Portfolio balance: $1,000 USDC
   - Current APY: 5.2%
   - Earned today: $0.14
   - Transaction history
   - Can withdraw anytime

### Revenue Model

- **Platform fee**: 0.5% on all deposits
- **Performance fee**: 10% of yield earned
- **Subscription tiers**:
  - Free: Up to 100 end-users
  - Pro: Up to 10,000 end-users ($299/month)
  - Enterprise: Unlimited ($999/month + custom fees)

---

## 📋 Implementation Phases

### ✅ Phase 0: Cleanup (IMMEDIATE)

**Goal**: Remove research code, prepare for production architecture

**Tasks**:
- [ ] Remove test/research files
- [ ] Archive wallet creation experiments
- [ ] Clean up documentation
- [ ] Update README with correct product description

**Files to Archive**:
```
packages/core/examples/                                   → Archive
apps/privy-api-test/src/routers/embedded-wallet.router.ts → Keep but refactor
```

**Files to Keep & Refactor**:
```
packages/core/usecase/embedded-wallet.usecase.ts          ✅ Refactor for client wallets
packages/core/usecase/privy.usecase.ts                   ✅ Keep (needed for custodial)
packages/core/repository/wallet-transaction.repository.ts ✅ Core API
apps/privy-api-test/src/routers/wallet-execution.router.ts ✅ Core API
```

---

### 🏗️ Phase 1: Client Dashboard & Registration (HIGH PRIORITY)

**Goal**: Onboarding system for product owners (our clients)

**Priority**: HIGH  
**Timeline**: 2-3 weeks  
**Dependencies**: None - can start immediately

#### 1.1 Client Management System

**App**: `apps/client-dashboard` (Next.js 14)

**Features**:
- [ ] **Client Registration Flow**
  - [ ] Email/password signup
  - [ ] Company information form
  - [ ] KYC verification (future)
  - [ ] Create custodial wallet via Privy (client-owned)
  - [ ] Generate API key + secret

- [ ] **Dashboard UI**
  - [ ] Overview page (total users, volume, revenue)
  - [ ] API key management
  - [ ] Custodial wallet details
  - [ ] Usage analytics (deposits, withdrawals, active users)
  - [ ] Billing & subscription management
  - [ ] Webhook configuration

- [ ] **Database Schema**
  ```sql
  CREATE TABLE clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      custodial_wallet_address VARCHAR(255) UNIQUE NOT NULL,
      privy_wallet_id VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'active', -- active, suspended, trial
      subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE client_api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id),
      api_key VARCHAR(255) UNIQUE NOT NULL, -- pk_live_xxx or pk_test_xxx
      api_secret_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      last_used_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE
  );

  CREATE TABLE client_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id),
      date DATE NOT NULL,
      total_end_users INTEGER DEFAULT 0,
      total_deposits_usd NUMERIC DEFAULT 0,
      total_withdrawals_usd NUMERIC DEFAULT 0,
      total_yield_earned_usd NUMERIC DEFAULT 0,
      platform_fees_usd NUMERIC DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

#### 1.2 Client Onboarding API

**Location**: `apps/client-dashboard/src/app/api/`

- [ ] `POST /api/auth/register` - Create client account + custodial wallet
- [ ] `POST /api/auth/login` - Client login (NextAuth)
- [ ] `POST /api/keys/generate` - Generate new API key
- [ ] `DELETE /api/keys/:keyId` - Revoke API key
- [ ] `GET /api/analytics/overview` - Dashboard metrics
- [ ] `GET /api/analytics/usage` - Historical usage data

**Tech Stack**:
- Next.js 14 (App Router)
- NextAuth.js (authentication)
- Prisma (ORM)
- PostgreSQL (same database)
- shadcn/ui (UI components)
- Recharts (analytics charts)

---

### 📦 Phase 2: SDK Development (HIGH PRIORITY)

**Goal**: Easy integration for clients to embed Proxify into their apps

**Priority**: HIGH  
**Timeline**: 3-4 weeks  
**Dependencies**: Phase 1 complete

#### 2.1 Core SDK Package

**Package**: `packages/sdk` (@proxify/sdk)

**Features**:
- [ ] **React Provider**
  ```tsx
  import { ProxifyProvider } from '@proxify/sdk'
  
  function App() {
    return (
      <ProxifyProvider apiKey="pk_live_xxx">
        <YourApp />
      </ProxifyProvider>
    )
  }
  ```

- [ ] **React Components**
  ```tsx
  import { 
    DepositButton, 
    WithdrawButton, 
    PortfolioWidget,
    YieldOptimizerPanel 
  } from '@proxify/sdk/components'

  // In client's app
  function UserDashboard({ userId }) {
    return (
      <div>
        <PortfolioWidget userId={userId} />
        <DepositButton token="USDC" onSuccess={(tx) => ...} />
        <WithdrawButton onSuccess={(tx) => ...} />
      </div>
    )
  }
  ```

- [ ] **Headless SDK (for custom UI)**
  ```typescript
  import { useProxify } from '@proxify/sdk'

  function CustomUI({ userId }) {
    const { 
      balance, 
      deposit, 
      withdraw, 
      yieldOpportunities 
    } = useProxify(userId)

    return (
      <div>
        <p>Balance: ${balance.usd}</p>
        <button onClick={() => deposit({ amount: '100', token: 'USDC' })}>
          Deposit
        </button>
      </div>
    )
  }
  ```

- [ ] **TypeScript Types**
  ```typescript
  export interface ProxifyConfig {
    apiKey: string
    environment: 'production' | 'sandbox'
    onRampProvider?: 'moonpay' | 'applepay' | 'internal'
  }

  export interface DepositOptions {
    userId: string
    amount: string
    token: 'USDC' | 'USDT'
    onSuccess?: (tx: Transaction) => void
    onError?: (error: Error) => void
  }
  ```

#### 2.2 On-Ramp Integration

**Version 1: Third-Party (MVP)**
- [ ] MoonPay integration
- [ ] Apple Pay integration
- [ ] Widget component `<OnRampWidget />`

**Version 2: Internal Gateway (Future)**
- [ ] Stripe integration for fiat
- [ ] Auto-convert fiat → USDC
- [ ] Compliance & licensing requirements

---

### 🎨 Phase 3: White-Label End-User Wallet (HIGH PRIORITY)

**Goal**: Beautiful wallet UI that clients can embed or customize

**Priority**: HIGH  
**Timeline**: 4-5 weeks  
**Dependencies**: Phase 2 complete

#### 3.1 White-Label Wallet App

**App**: `apps/end-user-wallet` (Next.js 14)

**Reference**: Glider.Fi UI/UX

**Features**:
- [ ] **Portfolio Dashboard**
  - [ ] Total balance (USD + crypto)
  - [ ] Asset breakdown (pie chart)
  - [ ] Performance chart (7d, 30d, 1y)
  - [ ] Current APY
  - [ ] Yield earned (today, this week, all-time)

- [ ] **Transaction History**
  - [ ] Deposits (fiat → USDC)
  - [ ] Withdrawals
  - [ ] DeFi operations (deposit to AAVE, etc.)
  - [ ] Yield harvests
  - [ ] Filters & search
  - [ ] Export to CSV

- [ ] **Risk Preferences**
  - [ ] Conservative (3-5% APY, low risk)
  - [ ] Moderate (5-8% APY, medium risk)
  - [ ] Aggressive (8-15% APY, high risk)
  - [ ] Auto-rebalance toggle
  - [ ] Preferred protocols selection

- [ ] **On-Ramp Flow**
  - [ ] "Deposit" button → MoonPay/Apple Pay widget
  - [ ] Amount input + fees preview
  - [ ] Confirmation screen
  - [ ] Success/error handling

**Customization Options**:
- [ ] Brand colors
- [ ] Logo
- [ ] Custom domain
- [ ] Hide/show features

**Tech Stack**:
- Next.js 14
- Tailwind CSS
- Framer Motion (animations)
- Recharts (charts)
- shadcn/ui components

---

### 🏪 Phase 4: Demo Client Apps (IMPORTANT)

**Goal**: Show how different industries can use Proxify

**Priority**: MEDIUM  
**Timeline**: 2-3 weeks per demo  
**Dependencies**: Phase 2, 3 complete

#### 4.1 Demo Apps to Build

**App 1: E-commerce Platform** (`apps/demo-ecommerce`)
- [ ] Product listing
- [ ] Shopping cart
- [ ] **Proxify Integration**: "Earn on store credit"
  - User has $500 store credit
  - Enable yield → Earns 5% APY while waiting to shop
  - Withdraw anytime to make purchases

**App 2: Streaming Platform** (`apps/demo-streaming`)
- [ ] Video content library
- [ ] Subscription management
- [ ] **Proxify Integration**: "Earn on subscription balance"
  - Yearly subscription: $120 prepaid
  - Unused months earn yield
  - Auto-deduct monthly fee from balance

**App 3: Freelancer Platform** (`apps/demo-freelancer`)
- [ ] Job listings
- [ ] Escrow system
- [ ] **Proxify Integration**: "Earn on escrow funds"
  - Client deposits $1,000 for project
  - Funds locked in escrow
  - Both parties earn yield while project is in progress
  - Release to freelancer on completion

**App 4: Gaming Platform** (`apps/demo-gaming`)
- [ ] In-game currency
- [ ] Marketplace
- [ ] **Proxify Integration**: "Earn on game balance"
  - User buys $100 worth of gems
  - Unspent gems earn yield
  - Spend anytime on in-game items

**Common Features** (all demos):
- [ ] Embedded `@proxify/sdk`
- [ ] White-label wallet UI
- [ ] On-ramp integration
- [ ] Transaction history
- [ ] Yield dashboard

---

### 🤖 Phase 5: DeFi Protocol Integration (TECHNICAL CORE)

**Goal**: Build repository layer for each DeFi protocol

**Priority**: HIGH  
**Timeline**: 4-5 weeks  
**Dependencies**: None - can start in parallel with Phase 1

#### 5.1 Entity Layer (Define Data Models)

**Location**: `packages/core/entity/`

- [ ] **`defi-position.entity.ts`**
  ```typescript
  interface DeFiPosition {
    id: string
    walletAddress: string
    protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
    chainId: number
    tokenAddress: string
    amount: string
    apy: string
    valueUSD: string
    depositedAt: Date
    lastHarvestedAt?: Date
    status: 'active' | 'withdrawn' | 'pending'
  }
  ```

- [ ] **`risk-profile.entity.ts`**
  ```typescript
  interface RiskProfile {
    walletAddress: string
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    maxSlippage: number
    minAPY: number
    preferredProtocols: string[]
    autoRebalance: boolean
    rebalanceThreshold: number
  }
  ```

- [ ] **`yield-strategy.entity.ts`**
  ```typescript
  interface YieldStrategy {
    id: string
    name: string
    description: string
    protocols: string[]
    minDeposit: string
    expectedAPY: string
    riskLevel: 'low' | 'medium' | 'high'
    isActive: boolean
  }
  ```

#### 5.2 Repository Layer (Protocol Integration)

**Location**: `packages/core/repository/`

- [ ] **`aave.repository.ts`** (TODO)
  - [ ] `deposit(walletAddress, token, amount, chainId)`
  - [ ] `withdraw(walletAddress, token, amount, chainId)`
  - [ ] `getPosition(walletAddress, chainId)`
  - [ ] `getAPY(token, chainId)`
  - [ ] `claimRewards(walletAddress, chainId)`

- [ ] **`curve.repository.ts`** (TODO)
  - [ ] `depositToPool(walletAddress, poolAddress, tokens, amounts, chainId)`
  - [ ] `withdrawFromPool(walletAddress, poolAddress, amount, chainId)`
  - [ ] `getPoolAPY(poolAddress, chainId)`
  - [ ] `getPosition(walletAddress, poolAddress, chainId)`

- [ ] **`compound.repository.ts`** (TODO)
  - [ ] `supply(walletAddress, token, amount, chainId)`
  - [ ] `redeem(walletAddress, token, amount, chainId)`
  - [ ] `getSupplyAPY(token, chainId)`
  - [ ] `getPosition(walletAddress, chainId)`

- [ ] **`uniswap.repository.ts`** (TODO)
  - [ ] `addLiquidity(walletAddress, tokenA, tokenB, amounts, chainId)`
  - [ ] `removeLiquidity(walletAddress, positionId, chainId)`
  - [ ] `collectFees(walletAddress, positionId, chainId)`
  - [ ] `getPosition(walletAddress, positionId, chainId)`
  - [ ] `getPoolAPY(tokenA, tokenB, fee, chainId)`

**Implementation Notes**:
- Use `viem` for contract interactions (already installed)
- All methods return encoded transaction data
- Actual execution via `wallet-transaction.repository.ts`
- Store ABIs in `packages/core/abis/defi/`

#### 5.3 Use Case Layer (Business Logic)

**Location**: `packages/core/usecase/`

- [ ] **`yield-optimizer.usecase.ts`** (TODO)
  - [ ] `findBestYield(walletAddress, token, amount, riskProfile)`
  - [ ] `optimizePortfolio(walletAddress, riskProfile)`
  - [ ] `rebalancePortfolio(walletAddress)`
  - [ ] `calculateExpectedAPY(strategy, amount)`

- [ ] **`risk-manager.usecase.ts`** (TODO)
  - [ ] `setRiskProfile(walletAddress, profile)`
  - [ ] `getRiskProfile(walletAddress)`
  - [ ] `calculateRiskScore(positions)`
  - [ ] `validateStrategy(strategy, riskProfile)`

- [ ] **`ai-agent.usecase.ts`** (PLACEHOLDER)
  - [ ] `analyzeMarketConditions()`
  - [ ] `generateRecommendations(walletAddress, riskProfile)`
  - [ ] `executeStrategy(walletAddress, strategy)`
  - [ ] `monitorPositions(walletAddress)`

#### 5.4 Router Layer (API Endpoints)

**Location**: `apps/privy-api-test/src/routers/`

- [ ] **`defi-execution.router.ts`** (TODO)
  ```typescript
  // AAVE
  POST /api/v1/defi/aave/deposit
  POST /api/v1/defi/aave/withdraw
  GET  /api/v1/defi/aave/positions/:walletAddress
  GET  /api/v1/defi/aave/apy/:token/:chainId
  
  // Curve
  POST /api/v1/defi/curve/deposit
  POST /api/v1/defi/curve/withdraw
  GET  /api/v1/defi/curve/positions/:walletAddress
  GET  /api/v1/defi/curve/apy/:poolAddress/:chainId
  
  // Compound
  POST /api/v1/defi/compound/supply
  POST /api/v1/defi/compound/redeem
  GET  /api/v1/defi/compound/positions/:walletAddress
  
  // Uniswap
  POST /api/v1/defi/uniswap/add-liquidity
  POST /api/v1/defi/uniswap/remove-liquidity
  GET  /api/v1/defi/uniswap/positions/:walletAddress
  ```

- [ ] **`yield-optimizer.router.ts`** (TODO)
  ```typescript
  GET  /api/v1/yield/opportunities/:walletAddress
  POST /api/v1/yield/optimize
  POST /api/v1/yield/rebalance/:walletAddress
  GET  /api/v1/yield/performance/:walletAddress
  GET  /api/v1/yield/strategies
  ```

- [ ] **`risk-manager.router.ts`** (TODO)
  ```typescript
  POST /api/v1/risk/profile/:walletAddress
  GET  /api/v1/risk/profile/:walletAddress
  GET  /api/v1/risk/score/:walletAddress
  PUT  /api/v1/risk/profile/:walletAddress
  ```

---

### 🤖 Phase 6: AI Agent (ADVANCED - FUTURE)

**Goal**: Autonomous DeFi strategy execution

**Priority**: LOW  
**Timeline**: 6-8 weeks  
**Dependencies**: Phase 5 complete

- [ ] **Market Analysis**
  - [ ] On-chain data analysis (Dune Analytics API)
  - [ ] TVL tracking
  - [ ] APY trend analysis
  - [ ] Gas price optimization

- [ ] **Sentiment Analysis**
  - [ ] Twitter sentiment (optional)
  - [ ] News aggregation
  - [ ] Protocol health monitoring

- [ ] **Auto-Execute Strategies**
  - [ ] Yield farming opportunities
  - [ ] Auto-compounding
  - [ ] Risk-adjusted rebalancing
  - [ ] Loss prevention

**Tech Stack**:
- OpenAI API / Anthropic Claude
- The Graph for on-chain data
- Dune Analytics API
- Chainlink price feeds

---

## 🗂️ Database Schema Updates

### New Tables Needed

```sql
-- Clients (Product Owners)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    custodial_wallet_address VARCHAR(255) UNIQUE NOT NULL,
    privy_wallet_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, trial
    subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client API Keys
CREATE TABLE client_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    api_key VARCHAR(255) UNIQUE NOT NULL, -- pk_live_xxx or pk_test_xxx
    api_secret_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- End Users (mapped to clients)
CREATE TABLE end_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    external_user_id VARCHAR(255) NOT NULL, -- Client's user ID
    wallet_address VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    risk_profile VARCHAR(20) DEFAULT 'moderate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, external_user_id)
);

-- Client Usage Analytics
CREATE TABLE client_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_end_users INTEGER DEFAULT 0,
    total_deposits_usd NUMERIC DEFAULT 0,
    total_withdrawals_usd NUMERIC DEFAULT 0,
    total_yield_earned_usd NUMERIC DEFAULT 0,
    platform_fees_usd NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, date)
);

-- DeFi Positions
CREATE TABLE defi_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    end_user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    protocol VARCHAR(50) NOT NULL, -- aave, curve, compound, uniswap
    chain_id INTEGER NOT NULL,
    token_address VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    apy NUMERIC,
    value_usd NUMERIC,
    deposited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_harvested_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- active, withdrawn, pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Profiles
CREATE TABLE risk_profiles (
    end_user_id UUID PRIMARY KEY REFERENCES end_users(id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL, -- conservative, moderate, aggressive
    max_slippage NUMERIC DEFAULT 0.5,
    min_apy NUMERIC DEFAULT 5.0,
    preferred_protocols TEXT[],
    auto_rebalance BOOLEAN DEFAULT true,
    rebalance_threshold NUMERIC DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yield Strategies
CREATE TABLE yield_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    protocols TEXT[] NOT NULL,
    min_deposit NUMERIC NOT NULL,
    expected_apy NUMERIC,
    risk_level VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_client_api_keys_client_id ON client_api_keys(client_id);
CREATE INDEX idx_client_api_keys_api_key ON client_api_keys(api_key);
CREATE INDEX idx_end_users_client_id ON end_users(client_id);
CREATE INDEX idx_end_users_wallet_address ON end_users(wallet_address);
CREATE INDEX idx_defi_positions_end_user_id ON defi_positions(end_user_id);
CREATE INDEX idx_defi_positions_wallet_address ON defi_positions(wallet_address);
CREATE INDEX idx_defi_positions_protocol ON defi_positions(protocol);
CREATE INDEX idx_client_usage_client_id_date ON client_usage(client_id, date);
```

---

## 📦 Dependencies to Install

### Phase 1: Client Dashboard

```bash
# Create Next.js app
cd apps
pnpm create next-app client-dashboard --typescript --tailwind --app --use-pnpm

# Navigate to client-dashboard
cd client-dashboard

# Install dependencies
pnpm add next-auth@beta @auth/prisma-adapter
pnpm add prisma @prisma/client
pnpm add bcryptjs
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-toast
pnpm add recharts
pnpm add zod
pnpm add react-hook-form @hookform/resolvers

# Dev dependencies
pnpm add -D @types/bcryptjs
```

### Phase 2: SDK Development

```bash
# Create SDK package
mkdir -p packages/sdk
cd packages/sdk

pnpm init

# Install dependencies
pnpm add react react-dom
pnpm add viem wagmi @tanstack/react-query
pnpm add zustand
pnpm add @radix-ui/react-dialog @radix-ui/react-toast

# Dev dependencies
pnpm add -D typescript @types/react @types/react-dom
pnpm add -D tsup # For building the package
```

### Phase 3: White-Label Wallet

```bash
# Create Next.js app
cd apps
pnpm create next-app end-user-wallet --typescript --tailwind --app --use-pnpm

cd end-user-wallet

# Install dependencies
pnpm add @proxify/sdk # Our own SDK
pnpm add framer-motion # Animations
pnpm add recharts # Charts
pnpm add dayjs # Already using this
pnpm add @radix-ui/react-tabs @radix-ui/react-select
```

### Phase 4: Demo Apps

```bash
# Each demo app
cd apps

# E-commerce demo
pnpm create next-app demo-ecommerce --typescript --tailwind --app --use-pnpm
cd demo-ecommerce
pnpm add @proxify/sdk stripe

# Streaming demo
cd ../
pnpm create next-app demo-streaming --typescript --tailwind --app --use-pnpm
cd demo-streaming
pnpm add @proxify/sdk

# Freelancer demo
cd ../
pnpm create next-app demo-freelancer --typescript --tailwind --app --use-pnpm
cd demo-freelancer
pnpm add @proxify/sdk

# Gaming demo
cd ../
pnpm create next-app demo-gaming --typescript --tailwind --app --use-pnpm
cd demo-gaming
pnpm add @proxify/sdk phaser # Game engine
```

### Phase 5: DeFi Integration

```bash
# In packages/core
cd packages/core

# AAVE SDK
pnpm add @aave/contract-helpers @aave/math-utils

# Compound SDK
pnpm add @compound-finance/compound-js

# Uniswap SDK
pnpm add @uniswap/v3-sdk @uniswap/sdk-core

# Curve (no official SDK - use viem directly)
# We'll store ABIs in packages/core/abis/defi/curve/

# Additional utilities (already installed)
# pnpm add viem bignumber.js dayjs
```

### Phase 6: AI Agent

```bash
# In packages/core or new package
pnpm add openai # OpenAI API
pnpm add @anthropic-ai/sdk # Claude API
pnpm add axios # HTTP requests for APIs

# For on-chain data
pnpm add @dune-analytics/client
pnpm add graphql graphql-request # For The Graph
```

---

## 🎯 Current Sprint (Week 1-3)

### Week 1: Phase 0 Cleanup + Phase 1 Foundation

**Day 1-2: Cleanup**
- [ ] Archive research code and examples
- [ ] Update documentation
- [ ] Create new database migration for client tables

**Day 3-5: Client Dashboard Setup**
- [ ] Create `apps/client-dashboard` Next.js app
- [ ] Set up Prisma schema
- [ ] Implement client registration flow
- [ ] Create custodial wallet on registration (via Privy)
- [ ] Generate API key system

### Week 2: Client Dashboard + SDK Foundation

**Day 1-3: Dashboard UI**
- [ ] Build dashboard overview page
- [ ] Analytics charts (usage, volume)
- [ ] API key management UI
- [ ] Billing page (subscription tiers)

**Day 4-5: SDK Package Setup**
- [ ] Create `packages/sdk` structure
- [ ] Set up TypeScript + build system (tsup)
- [ ] Create `ProxifyProvider` component
- [ ] Build basic React hooks

### Week 3: SDK Components + First Demo

**Day 1-3: SDK Components**
- [ ] `<DepositButton />` component
- [ ] `<WithdrawButton />` component
- [ ] `<PortfolioWidget />` component
- [ ] TypeScript client for backend integration

**Day 4-5: Demo E-commerce App**
- [ ] Create `apps/demo-ecommerce`
- [ ] Integrate `@proxify/sdk`
- [ ] Show "Earn on store credit" feature
- [ ] Document integration steps

---

## 🎯 Phase Priority Order (Updated)

### Sprint 1 (Weeks 1-3): Client Onboarding
✅ **Phase 1: Client Dashboard** - Product owners can register  
✅ **Phase 2: SDK Development** - Easy integration for clients  
✅ **Phase 4: Demo Apps** - At least 1 demo (e-commerce)

### Sprint 2 (Weeks 4-6): End-User Experience
✅ **Phase 3: White-Label Wallet** - Beautiful UI for end-users  
✅ **Phase 4: More Demo Apps** - Streaming, freelancer, gaming  
✅ **On-Ramp Integration** - MoonPay/Apple Pay

### Sprint 3 (Weeks 7-10): DeFi Integration
✅ **Phase 5: DeFi Protocols** - AAVE, Curve, Compound, Uniswap  
✅ **Yield Optimizer** - Find best opportunities  
✅ **Risk Manager** - Profile-based strategies

### Sprint 4 (Weeks 11-14): AI & Polish
✅ **Phase 6: AI Agent** - Market analysis & auto-execute  
✅ **Internal On-Ramp** - Gateway integration (if licensed)  
✅ **Production hardening** - Security, monitoring, testing

---

## 📊 Success Metrics

### Phase 1 Success Criteria (Client Dashboard)
- [ ] Client can register and get custodial wallet
- [ ] Client can generate API key (pk_live_xxx format)
- [ ] Dashboard shows usage analytics (users, volume, fees)
- [ ] At least 3 internal test clients onboarded
- [ ] API key authentication works on all endpoints

### Phase 2 Success Criteria (SDK)
- [ ] SDK can be installed via `pnpm add @proxify/sdk`
- [ ] React components render without errors
- [ ] Can deposit/withdraw USDC via SDK components
- [ ] TypeScript types are accurate
- [ ] Documentation includes integration guide
- [ ] At least 5 pages of examples

### Phase 3 Success Criteria (White-Label Wallet)
- [ ] Wallet UI loads under 2 seconds
- [ ] Portfolio updates in real-time
- [ ] Risk preference changes apply correctly
- [ ] Can embed via iframe or standalone
- [ ] Mobile responsive (works on phone)
- [ ] Matches Glider.Fi quality level

### Phase 4 Success Criteria (Demo Apps)
- [ ] 4 demo apps deployed (e-commerce, streaming, freelancer, gaming)
- [ ] Each demo shows different use case clearly
- [ ] Users can complete full flow (deposit → earn → withdraw)
- [ ] All demos use same SDK (proves flexibility)
- [ ] Public demo links shared in pitch deck

### Phase 5 Success Criteria (DeFi Integration)
- [ ] Can deposit USDC to AAVE programmatically
- [ ] Can withdraw from AAVE
- [ ] Can fetch current APY for all protocols
- [ ] Can get user positions across all protocols
- [ ] Yield optimizer recommends best protocol
- [ ] All endpoints documented with Postman collection

### Phase 6 Success Criteria (AI Agent)
- [ ] AI agent runs analysis every hour
- [ ] Generates yield recommendations
- [ ] Auto-rebalances based on risk profile
- [ ] Sends alerts on market changes
- [ ] Improves APY by at least 0.5% vs manual

---

## 🔗 Reference Links

**DeFi Protocols**:
- [AAVE V3 Docs](https://docs.aave.com/developers/getting-started/readme)
- [Curve Finance Docs](https://curve.readthedocs.io/)
- [Compound V3 Docs](https://docs.compound.finance/)
- [Uniswap V3 Docs](https://docs.uniswap.org/)

**Inspiration**:
- [Glider.Fi](https://glider.fi/) - UI/UX reference
- [Yearn Finance](https://yearn.finance/) - Yield optimization
- [Beefy Finance](https://beefy.finance/) - Auto-compounding

**Tools**:
- [Dune Analytics](https://dune.com/) - On-chain analytics
- [DefiLlama](https://defillama.com/) - TVL & APY tracking
- [The Graph](https://thegraph.com/) - Indexing protocol

---

## 📝 Notes

**Last Updated**: November 16, 2025

**Current Focus**: Phase 0 (Cleanup) → Phase 1 (DeFi Integration)

**Next Review**: After Phase 1 AAVE integration complete

