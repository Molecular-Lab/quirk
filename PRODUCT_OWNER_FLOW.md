# Proxify - White-Label DeFi Yield Platform for Product Owners

**Version:** 4.0 - B2B2C Custodial Aggregation with Index Tracking
**Date:** 2025-11-16
**Status:** New Product Direction

---

## 🎯 Core Business Model

```
Product Owner (Client) → Embeds SDK → End-Users Deposit Fiat →
Custodial Pool (Privy) → DeFi Protocols → Yield Distribution
```

**We ARE:** White-label DeFi infrastructure for apps with idle user cash
**We're NOT:** Direct-to-consumer wallet app
**Revenue:** SaaS fees + % of yield generated

---

## 📊 Complete Flow Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                    PROXIFY ECOSYSTEM FLOW                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STEP 1: CLIENT REGISTRATION                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ Product Owner (E-commerce, Streaming, Gaming, etc.)     │     │
│  │    ↓                                                    │     │
│  │ Register on Proxify Dashboard                           │     │
│  │    • KYB verification                                   │     │
│  │    • Privy custodial wallet created (for client)        │     │
│  │    • API keys & SDK credentials provisioned             │     │
│  │    • Risk tier preferences configured                   │     │
│  │                                                         │     │
│  │ Client Receives:                                         │     │
│  │    ✅ SDK package (@proxify/sdk)                         │     │
│  │    ✅ API credentials                                    │     │
│  │    ✅ White-label dashboard access                       │     │
│  │    ✅ Documentation                                      │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  STEP 2: SDK INTEGRATION                                          │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ Client embeds Proxify SDK in their app:                 │     │
│  │                                                         │     │
│  │ // Example: E-commerce platform                         │     │
│  │ import { ProxifySDK } from '@proxify/sdk'               │     │
│  │                                                         │     │
│  │ const proxify = new ProxifySDK({                        │     │
│  │   apiKey: 'client_api_key',                             │     │
│  │   productId: 'my-ecommerce-app'                         │     │
│  │ })                                                      │     │
│  │                                                         │     │
│  │ // Enable on-ramp for end-user                          │     │
│  │ await proxify.onramp.deposit({                          │     │
│  │   userId: 'end-user-123',                               │     │
│  │   amount: 100,                                          │     │
│  │   currency: 'USD'                                       │     │
│  │ })                                                      │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  STEP 3: END-USER DEPOSITS (Fiat → USDC)                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ End-User on Client's App:                               │     │
│  │    "Deposit $100 to earn yield"                         │     │
│  │         ↓                                               │     │
│  │ Two On-Ramp Options:                                    │     │
│  │                                                         │     │
│  │ V1 (Future): Proxify Gateway                            │     │
│  │   ┌─────────────────────────────────────┐              │     │
│  │   │ • Direct fiat processing            │              │     │
│  │   │ • Requires payment license          │              │     │
│  │   │ • Lower fees (we keep margins)      │              │     │
│  │   │ • Full control                      │              │     │
│  │   └─────────────────────────────────────┘              │     │
│  │                                                         │     │
│  │ V2 (MVP): Third-Party Integration                       │     │
│  │   ┌─────────────────────────────────────┐              │     │
│  │   │ • MoonPay / Transak / Stripe        │              │     │
│  │   │ • Apple Pay support                 │              │     │
│  │   │ • Quick to implement                │              │     │
│  │   │ • Licensed & compliant              │              │     │
│  │   └─────────────────────────────────────┘              │     │
│  │         ↓                                               │     │
│  │ Result: $100 → 100 USDC in Client's Custodial Pool     │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  STEP 4: CUSTODIAL POOL & INDEX TRACKING                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ All End-User funds → ONE Privy Custodial Wallet         │     │
│  │                                                         │     │
│  │ Client: "my-ecommerce-app"                              │     │
│  │ Custodial Wallet: 0xCLIENT_WALLET_ADDRESS               │     │
│  │ Total Pool: $10,000 USDC                                │     │
│  │                                                         │     │
│  │ Individual User Tracking (PostgreSQL):                  │     │
│  │ ┌───────────────────────────────────────────────┐       │     │
│  │ │ user_deposits table:                          │       │     │
│  │ │ ─────────────────────────────────────────────  │       │     │
│  │ │ user_id    | amount | entry_index | balance   │       │     │
│  │ │ ───────────────────────────────────────────── │       │     │
│  │ │ user-001   | 100    | 1.0         | 100       │       │     │
│  │ │ user-002   | 500    | 1.0         | 500       │       │     │
│  │ │ user-003   | 200    | 1.005       | 200       │       │     │
│  │ └───────────────────────────────────────────────┘       │     │
│  │                                                         │     │
│  │ Index Tracking (Like Vault Shares):                     │     │
│  │ ┌───────────────────────────────────────────────┐       │     │
│  │ │ Current Index: 1.01 (1% growth)               │       │     │
│  │ │                                               │       │     │
│  │ │ User Value Calculation:                       │       │     │
│  │ │ value = (balance × currentIndex) / entryIndex │       │     │
│  │ │                                               │       │     │
│  │ │ user-001: (100 × 1.01) / 1.0 = $101 ✅        │       │     │
│  │ │ user-002: (500 × 1.01) / 1.0 = $505 ✅        │       │     │
│  │ │ user-003: (200 × 1.01) / 1.005 = $200.99 ✅   │       │     │
│  │ └───────────────────────────────────────────────┘       │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  STEP 5: DEFI EXECUTION (Off-Chain Oracle)                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ Proxify Backend Service:                                │     │
│  │    • Monitors custodial pool balance                    │     │
│  │    • Executes DeFi strategies based on risk tier        │     │
│  │    • Updates index based on yield earned                │     │
│  │                                                         │     │
│  │ Supported Protocols:                                    │     │
│  │    ✅ AAVE (Lending)                                     │     │
│  │    ✅ Compound (Lending)                                 │     │
│  │    ✅ Curve (Stable swaps)                               │     │
│  │    ✅ Uniswap (Liquidity pools)                          │     │
│  │                                                         │     │
│  │ Example Flow:                                            │     │
│  │    1. Pool has $10,000 USDC                             │     │
│  │    2. Deploy 70% → AAVE (Low Risk)                      │     │
│  │    3. Deploy 20% → Curve (Moderate Risk)                │     │
│  │    4. Deploy 10% → Uniswap (High Risk)                  │     │
│  │    5. Track APY: AAVE 5% + Curve 8% + Uni 15% = 7% avg │     │
│  │    6. Update index daily: 1.0 → 1.00019 (7% APY)        │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  STEP 6: WHITE-LABEL DASHBOARD (Glider.Fi Style)                 │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ Client Admin Dashboard:                                 │     │
│  │                                                         │     │
│  │ ┌─────────────────────────────────────────────────┐     │     │
│  │ │ 📊 Portfolio Overview                           │     │     │
│  │ │ ─────────────────────────────────────────────── │     │     │
│  │ │ Total Deposits:    $10,000                      │     │     │
│  │ │ Current Value:     $10,070                      │     │     │
│  │ │ All-Time Return:   +0.7% ↗                      │     │     │
│  │ │ Active Users:      3                            │     │     │
│  │ └─────────────────────────────────────────────────┘     │     │
│  │                                                         │     │
│  │ ┌─────────────────────────────────────────────────┐     │     │
│  │ │ 🎯 Risk Allocation                              │     │     │
│  │ │ ─────────────────────────────────────────────── │     │     │
│  │ │ Low Risk (AAVE):       70% ($7,000)             │     │     │
│  │ │ Moderate (Curve):      20% ($2,000)             │     │     │
│  │ │ High Risk (Uniswap):   10% ($1,000)             │     │     │
│  │ └─────────────────────────────────────────────────┘     │     │
│  │                                                         │     │
│  │ ┌─────────────────────────────────────────────────┐     │     │
│  │ │ 📈 Performance Chart                            │     │     │
│  │ │ ─────────────────────────────────────────────── │     │     │
│  │ │ [Line graph showing index growth over time]    │     │     │
│  │ └─────────────────────────────────────────────────┘     │     │
│  │                                                         │     │
│  │ ┌─────────────────────────────────────────────────┐     │     │
│  │ │ 🤖 AI Agent Insights                            │     │     │
│  │ │ ─────────────────────────────────────────────── │     │     │
│  │ │ "Market conditions favor AAVE lending.          │     │     │
│  │ │  Recommend increasing allocation from 70% → 80%"│     │     │
│  │ └─────────────────────────────────────────────────┘     │     │
│  │                                                         │     │
│  │ End-User Dashboard (Embeddable Widget):                 │     │
│  │ ┌─────────────────────────────────────────────────┐     │     │
│  │ │ Your Balance:    $101.00                        │     │     │
│  │ │ Yield Earned:    +$1.00 (+1%)                   │     │     │
│  │ │ APY:             7.3%                           │     │     │
│  │ │                                                 │     │     │
│  │ │ [Deposit More]  [Withdraw]  [View Details]     │     │     │
│  │ └─────────────────────────────────────────────────┘     │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Target Clients & Use Cases

### 1. **E-Commerce Platforms**
**Problem:** Sellers have idle funds waiting for payouts
**Solution:** Earn yield on pending balances
```
Example: Shopify-like platform
- Seller has $5,000 pending payout (7-day hold)
- Automatically earns 7% APY during hold period
- Seller gets $5,002.67 on payout day (extra $2.67)
```

### 2. **Streaming Platforms (YouTube, Twitch)**
**Problem:** Creators' revenue sits idle monthly
**Solution:** Earn yield until withdrawal
```
Example: Creator platform
- Creator earns $1,000/month
- Withdraws quarterly ($3,000)
- Earns yield during 3-month period
- Gets $3,052 instead of $3,000
```

### 3. **Freelancer Platforms**
**Problem:** Escrow funds earn nothing
**Solution:** Yield on escrow balances
```
Example: Upwork/Fiverr clone
- Project escrow: $10,000 (30-day project)
- Earns 7% APY during escrow
- Client pays $10,000, freelancer gets $10,057
- Platform keeps $57 or shares with parties
```

### 4. **Gaming Platforms**
**Problem:** In-game currency has no real yield
**Solution:** Earn on idle game balance
```
Example: Web3 game
- Player has 1,000 tokens ($100 value)
- Not actively playing for 1 month
- Tokens earn yield automatically
- Player returns to 1,005 tokens
```

### 5. **Subscription Platforms**
**Problem:** Prepaid subscriptions sit idle
**Solution:** Yield on subscription float
```
Example: SaaS with annual billing
- User pays $1,200 annually
- Platform earns yield over 12 months
- Platform profit increases without raising prices
```

---

## 🏗️ Technical Architecture

### Database Schema (PostgreSQL)

```sql
-- Client Management
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    privy_user_id VARCHAR(255) NOT NULL UNIQUE,
    custodial_wallet_address VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    risk_tier VARCHAR(50) NOT NULL, -- 'low', 'moderate', 'high'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- End-User Deposits (Index-Based Accounting)
CREATE TABLE user_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    user_id VARCHAR(255) NOT NULL, -- Client's end-user ID
    amount_deposited DECIMAL(20, 6) NOT NULL,
    balance DECIMAL(20, 6) NOT NULL, -- Balance units (fixed)
    entry_index DECIMAL(20, 18) NOT NULL, -- Index at deposit time
    deposited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, user_id)
);

-- Index Tracking (Per Client, Per Risk Tier)
CREATE TABLE vault_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    risk_tier VARCHAR(50) NOT NULL,
    current_index DECIMAL(20, 18) NOT NULL DEFAULT 1.0,
    apy DECIMAL(10, 4), -- e.g., 7.3000 = 7.3%
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, risk_tier)
);

-- DeFi Allocations
CREATE TABLE defi_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    protocol VARCHAR(50) NOT NULL, -- 'aave', 'compound', 'curve', 'uniswap'
    allocation_percent DECIMAL(5, 2) NOT NULL,
    amount_deployed DECIMAL(20, 6),
    current_value DECIMAL(20, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction History
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'deposit', 'withdraw', 'yield'
    amount DECIMAL(20, 6) NOT NULL,
    index_at_time DECIMAL(20, 18),
    tx_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Index Calculation Logic

```typescript
// Off-chain service (runs every hour)
class IndexUpdater {
  async updateClientIndex(clientId: string) {
    // 1. Get current vault state
    const vault = await db.getVaultIndex(clientId)
    const allocations = await db.getDeFiAllocations(clientId)

    // 2. Query each DeFi protocol for current value
    const aaveValue = await aave.getBalance(vault.custodialWallet)
    const curveValue = await curve.getBalance(vault.custodialWallet)
    const uniswapValue = await uniswap.getBalance(vault.custodialWallet)

    const totalValue = aaveValue + curveValue + uniswapValue
    const totalDeposited = await db.getTotalDeposits(clientId)

    // 3. Calculate new index
    // Formula: newIndex = oldIndex × (currentValue / totalDeposited)
    const growthMultiplier = totalValue / totalDeposited
    const newIndex = vault.currentIndex * growthMultiplier

    // 4. Safety check (max 2x growth per update)
    if (newIndex > vault.currentIndex * 2) {
      throw new Error('Index growth too high - possible oracle error')
    }

    // 5. Update index
    await db.updateVaultIndex(clientId, {
      currentIndex: newIndex,
      apy: this.calculateAPY(vault.currentIndex, newIndex),
      lastUpdated: new Date()
    })

    // 6. Log event
    await db.logIndexUpdate(clientId, vault.currentIndex, newIndex)
  }

  calculateAPY(oldIndex: number, newIndex: number): number {
    const dailyGrowth = newIndex / oldIndex
    const annualizedAPY = (Math.pow(dailyGrowth, 365) - 1) * 100
    return annualizedAPY
  }
}

// User value calculation
async function getUserValue(clientId: string, userId: string) {
  const deposit = await db.getUserDeposit(clientId, userId)
  const vault = await db.getVaultIndex(clientId)

  // Formula: value = (balance × currentIndex) / entryIndex
  const currentValue = (deposit.balance * vault.currentIndex) / deposit.entryIndex
  const yieldEarned = currentValue - deposit.amountDeposited

  return {
    deposited: deposit.amountDeposited,
    currentValue,
    yieldEarned,
    yieldPercent: (yieldEarned / deposit.amountDeposited) * 100,
    apy: vault.apy
  }
}
```

---

## 💰 Revenue Model

### Pricing Tiers

```
┌────────────────────────────────────────────────────────┐
│              PROXIFY PRICING PLANS                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  STARTER ($99/month)                                   │
│  • Up to $100K AUM (Assets Under Management)          │
│  • 10% yield share                                     │
│  • Basic dashboard                                     │
│  • Standard support                                    │
│                                                        │
│  GROWTH ($499/month)                                   │
│  • Up to $1M AUM                                       │
│  • 7% yield share                                      │
│  • Custom branding                                     │
│  • AI insights                                         │
│  • Priority support                                    │
│                                                        │
│  ENTERPRISE (Custom)                                   │
│  • Unlimited AUM                                       │
│  • 5% yield share (negotiable)                         │
│  • Full white-label                                    │
│  • Dedicated account manager                           │
│  • Custom risk strategies                              │
│  • SLA guarantees                                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Revenue Calculation Example

```
Client: E-commerce Platform
AUM: $500,000
Average APY: 7%
Yield Share: 7%

Monthly Calculations:
─────────────────────────────────────────
Total Yield Generated: $500,000 × 7% / 12 = $2,916/month
Proxify Share (7%): $2,916 × 0.07 = $204/month
Client Keeps: $2,916 - $204 = $2,712/month
SaaS Fee: $499/month

Total Proxify Revenue: $204 + $499 = $703/month
Client Profit: $2,712/month (passive income!)

Annual:
Proxify: $703 × 12 = $8,436/year per client
Client: $2,712 × 12 = $32,544/year passive income
```

---

## 🚀 Demo Applications (To Build)

### Demo 1: E-Commerce Platform
- Seller dashboard with pending balance
- Automatic yield on escrow
- Withdraw with yield included

### Demo 2: Creator Platform (YouTube Clone)
- Monthly revenue display
- Yield tracking during holding period
- Quarterly payout with bonus yield

### Demo 3: Freelancer Marketplace
- Project escrow with yield
- Client/freelancer split options
- Milestone-based releases

### Demo 4: Gaming Platform
- In-game token balance
- Idle earnings while not playing
- Compound interest visualization

### Demo 5: Subscription SaaS
- Annual billing model
- Platform earns on float
- Profit margin improvement calculator

---

## 🛠️ Technology Stack

### Backend
- **Go + Fiber**: API Gateway
- **PostgreSQL**: User deposits, index tracking
- **Privy SDK**: Custodial wallet management
- **Viem**: DeFi protocol interactions (AAVE, Curve, Compound, Uniswap)

### Frontend (White-Label Dashboard)
- **React + Vite**: Dashboard UI
- **TailwindCSS**: Styling
- **Recharts**: Portfolio visualization
- **TanStack Query**: Data fetching

### SDK (@proxify/sdk)
- **TypeScript**: Type-safe API client
- **Zod**: Runtime validation
- **Axios**: HTTP client

### Infrastructure
- **Docker**: Service containerization
- **Redis**: Rate limiting, caching
- **CloudFlare**: CDN, DDoS protection

---

## 📋 Implementation Phases

### Phase 1: MVP (6-8 weeks)
**Goal:** Validate with 3 pilot clients

**Features:**
- ✅ Client registration dashboard
- ✅ Privy custodial wallet creation
- ✅ Basic SDK (deposit/withdraw)
- ✅ MoonPay on-ramp integration
- ✅ AAVE-only deployment (low risk)
- ✅ Index-based accounting
- ✅ Basic white-label dashboard
- ✅ Demo app: E-commerce platform

**Success Metrics:**
- 3 pilot clients onboarded
- $50K+ AUM
- 5% APY sustained

### Phase 2: Growth (3-4 months)
**Goal:** Scale to 20 clients

**Features:**
- ✅ Multi-protocol support (AAVE, Curve, Compound)
- ✅ Risk tier configuration
- ✅ AI agent for market insights
- ✅ Advanced analytics dashboard
- ✅ Demo apps: Creator + Freelancer platforms
- ✅ Apple Pay on-ramp
- ✅ Automated rebalancing

**Success Metrics:**
- 20 active clients
- $2M+ AUM
- 7% average APY

### Phase 3: Enterprise (6-12 months)
**Goal:** Payment license & custom gateway

**Features:**
- ✅ Internal fiat gateway (licensed)
- ✅ Full white-label customization
- ✅ Multi-chain support (Polygon, Arbitrum, Base)
- ✅ Custom risk strategies per client
- ✅ Institutional-grade security
- ✅ Demo apps: Gaming + Subscription platforms
- ✅ Compliance & audit tools

**Success Metrics:**
- Payment license acquired
- $50M+ AUM
- 50+ enterprise clients

---

## 🎯 Key Differentiators

### vs. Stripe + Bank Account
- **Us:** 7% APY on idle balance
- **Them:** 0.01% savings account

### vs. Building In-House
- **Us:** Ready SDK + compliance + optimization
- **Them:** 6-12 months dev + licensing + DeFi expertise

### vs. Direct DeFi Integration
- **Us:** Custodial (users don't need wallets) + aggregated yield
- **Them:** Users manage keys + gas fees + complexity

---

## 📖 Next Steps

1. **Clean up old docs** - Archive contract-focused .md files
2. **Create detailed specs** for each phase
3. **Build Phase 1 MVP**:
   - Client registration flow
   - Privy integration
   - Index tracking system
   - First demo app
4. **Pilot program** - Recruit 3 early clients

---

**Last Updated:** 2025-11-16
**Version:** 4.0 - White-Label DeFi Yield Platform
**Reference:** Glider.Fi (UI/UX inspiration), AAVE/Compound (yield sources)
