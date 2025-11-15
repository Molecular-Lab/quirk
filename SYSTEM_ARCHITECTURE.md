# Proxify System Architecture

**Last Updated**: November 16, 2025  
**Version**: 3.0 (B2B2C White-Label DeFi Infrastructure)

---

## 🏗️ Three-Tier Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         TIER 1: PROXIFY PLATFORM                      │
│                              (Our Infrastructure)                     │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   Client Dashboard (Admin)    │
                    │  - Client registration        │
                    │  - Custodial wallet creation  │
                    │  - API key management         │
                    │  - Analytics & billing        │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │         Backend API           │
                    │  - Authentication (API keys)  │
                    │  - Wallet operations          │
                    │  - DeFi execution             │
                    │  - Yield optimization         │
                    │  - AI agent                   │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │     DeFi Protocol Layer       │
                    │  - AAVE (lending)             │
                    │  - Curve (stable swaps)       │
                    │  - Compound (lending)         │
                    │  - Uniswap (liquidity)        │
                    └───────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    TIER 2: CLIENT (PRODUCT OWNER)                     │
│                   (E-commerce, Streaming, Freelancer)                 │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      Client's App/Website     │
                    │  - Embed @proxify/sdk         │
                    │  - Custom branding            │
                    │  - User management            │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      Proxify SDK Components   │
                    │  <DepositButton />            │
                    │  <WithdrawButton />           │
                    │  <PortfolioWidget />          │
                    │  <YieldOptimizerPanel />      │
                    └───────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      TIER 3: END-USER (CUSTOMER)                      │
│                        (Platform's customers)                         │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   White-Label Wallet UI       │
                    │  - Portfolio dashboard        │
                    │  - Transaction history        │
                    │  - Risk preferences           │
                    │  - On-ramp (Apple Pay/MoonPay)│
                    └───────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Client Onboarding Flow

```
Product Owner → Proxify Dashboard
    ↓
Register account (email, company)
    ↓
Create custodial wallet (Privy API)
    ↓
Generate API key (pk_live_xxxxx)
    ↓
Receive SDK integration docs
    ↓
Embed SDK in their app
```

### 2. End-User Deposit Flow

```
End-User → Client's App → Clicks "Deposit"
    ↓
MoonPay/Apple Pay widget opens
    ↓
User pays $100 USD via Apple Pay
    ↓
MoonPay converts to USDC
    ↓
USDC sent to Client's custodial wallet
    ↓
Proxify API credits end-user's balance
    ↓
AI Agent analyzes risk profile
    ↓
Finds best yield opportunity (e.g., AAVE 5.2% APY)
    ↓
Executes deposit to AAVE
    ↓
Position tracked in database
    ↓
End-user sees "Earning 5.2% APY" in wallet UI
```

### 3. Yield Optimization Flow

```
AI Agent (runs every hour)
    ↓
Fetch all active positions from database
    ↓
Query current APY from protocols (AAVE, Curve, Compound, Uniswap)
    ↓
Compare against user's risk profile
    ↓
Find better opportunities (e.g., Curve now 6.5% vs AAVE 5.2%)
    ↓
If delta > rebalanceThreshold (5%)
    ↓
Withdraw from AAVE
    ↓
Deposit to Curve
    ↓
Update position in database
    ↓
Send notification to end-user
```

### 4. Withdrawal Flow

```
End-User → White-Label Wallet → Clicks "Withdraw $50"
    ↓
SDK sends request to Proxify API
    ↓
API validates: sufficient balance, no pending operations
    ↓
Withdraw from DeFi protocol (e.g., AAVE)
    ↓
Transfer USDC to off-ramp provider
    ↓
Convert USDC → USD
    ↓
Send to user's bank account (or keep as USDC)
    ↓
Update balances in database
    ↓
Transaction appears in wallet history
```

---

## 🗂️ Component Breakdown

### Tier 1: Proxify Platform

#### 1.1 Client Dashboard (`apps/client-dashboard`)

**Purpose**: Onboard and manage product owners (our direct customers)

**Tech Stack**:
- Next.js 14 (App Router)
- NextAuth.js (authentication)
- Prisma (ORM)
- PostgreSQL (database)
- shadcn/ui (components)
- Recharts (analytics charts)

**Key Pages**:
- `/register` - Client signup
- `/dashboard` - Analytics overview
- `/api-keys` - Generate/manage API keys
- `/billing` - Subscription management
- `/settings` - Company profile

**Database Tables**:
- `clients` - Product owner accounts
- `client_api_keys` - API key management
- `client_usage` - Daily usage analytics

---

#### 1.2 Backend API (`apps/privy-api-test` → Rename to `apps/api`)

**Purpose**: Core business logic and DeFi execution

**Tech Stack**:
- Express.js
- TypeScript
- Privy SDK (custodial wallets)
- Viem (blockchain interactions)
- PostgreSQL (via Prisma or raw queries)

**Key Routers**:
```
/api/v1/auth/          - API key validation
/api/v1/clients/       - Client management (CRUD)
/api/v1/wallets/       - Wallet operations (balance, transactions)
/api/v1/defi/          - DeFi protocol interactions
/api/v1/yield/         - Yield optimization
/api/v1/risk/          - Risk profile management
/api/v1/onramp/        - Fiat on-ramp webhooks
```

**Authentication**:
```typescript
// Middleware: Validate API key
async function authenticateClient(req, res, next) {
  const apiKey = req.headers['x-api-key']
  const client = await db.clientApiKeys.findUnique({ where: { apiKey } })
  
  if (!client || !client.isActive) {
    return res.status(401).json({ error: 'Invalid API key' })
  }
  
  req.client = client
  next()
}
```

---

#### 1.3 DeFi Protocol Layer (`packages/core/repository/`)

**Purpose**: Abstract DeFi protocol interactions

**Repositories**:
- `aave.repository.ts` - AAVE V3 lending
- `curve.repository.ts` - Curve stable pools
- `compound.repository.ts` - Compound V3 lending
- `uniswap.repository.ts` - Uniswap V3 liquidity

**Interface Pattern**:
```typescript
interface IDeFiRepository {
  deposit(params: DepositParams): Promise<TransactionData>
  withdraw(params: WithdrawParams): Promise<TransactionData>
  getPosition(walletAddress: string, chainId: number): Promise<Position>
  getAPY(token: string, chainId: number): Promise<number>
}
```

**Example: AAVE Repository**:
```typescript
export class AaveRepository implements IDeFiRepository {
  async deposit(params: DepositParams) {
    const { walletAddress, token, amount, chainId } = params
    
    // Encode AAVE supply transaction
    const poolAddress = getAAVEPoolAddress(chainId)
    const calldata = encodeFunctionData({
      abi: AAVE_POOL_ABI,
      functionName: 'supply',
      args: [token, amount, walletAddress, 0]
    })
    
    return {
      to: poolAddress,
      data: calldata,
      value: '0'
    }
  }
  
  async getAPY(token: string, chainId: number) {
    // Query AAVE API or on-chain
    const poolData = await fetchAAVEPoolData(token, chainId)
    return poolData.liquidityRate / 1e27 * 100 // Convert to percentage
  }
}
```

---

#### 1.4 AI Agent (`packages/core/usecase/ai-agent.usecase.ts`)

**Purpose**: Autonomous yield optimization and market analysis

**Features**:
1. **Market Analysis** (every hour)
   - Fetch APY from all protocols
   - Track TVL changes
   - Monitor gas prices
   - Analyze historical trends

2. **Yield Recommendations**
   - Compare opportunities across protocols
   - Filter by risk profile
   - Calculate expected returns
   - Suggest rebalances

3. **Auto-Execution** (if enabled)
   - Execute rebalances automatically
   - Harvest rewards
   - Compound earnings
   - Emergency withdrawals (if protocol risk detected)

**Tech Stack**:
- OpenAI API (GPT-4) or Claude
- Dune Analytics API (on-chain data)
- The Graph (protocol subgraphs)
- Chainlink (price feeds)

**Example Logic**:
```typescript
async function analyzeYieldOpportunities(walletAddress: string) {
  const riskProfile = await getRiskProfile(walletAddress)
  const currentPositions = await getCurrentPositions(walletAddress)
  
  // Fetch current APYs
  const aaveAPY = await aaveRepo.getAPY('USDC', 1)
  const curveAPY = await curveRepo.getPoolAPY('3pool', 1)
  const compoundAPY = await compoundRepo.getSupplyAPY('USDC', 1)
  
  // Find best opportunity
  const opportunities = [
    { protocol: 'aave', apy: aaveAPY, risk: 'low' },
    { protocol: 'curve', apy: curveAPY, risk: 'low' },
    { protocol: 'compound', apy: compoundAPY, risk: 'low' }
  ]
  
  // Filter by risk profile
  const suitable = opportunities.filter(o => 
    riskProfile.riskLevel === 'conservative' ? o.risk === 'low' :
    riskProfile.riskLevel === 'moderate' ? o.risk !== 'high' :
    true // aggressive accepts all
  )
  
  // Sort by APY
  const best = suitable.sort((a, b) => b.apy - a.apy)[0]
  
  // Check if rebalance is needed
  if (currentPositions[0].protocol !== best.protocol) {
    const delta = best.apy - currentPositions[0].apy
    if (delta > riskProfile.rebalanceThreshold) {
      return {
        action: 'rebalance',
        from: currentPositions[0].protocol,
        to: best.protocol,
        expectedGain: delta
      }
    }
  }
  
  return { action: 'hold' }
}
```

---

### Tier 2: Client Integration

#### 2.1 Proxify SDK (`packages/sdk`)

**Purpose**: Easy integration for product owners

**Exports**:
```typescript
// React Provider
export { ProxifyProvider } from './ProxifyProvider'

// React Components
export { DepositButton } from './components/DepositButton'
export { WithdrawButton } from './components/WithdrawButton'
export { PortfolioWidget } from './components/PortfolioWidget'
export { YieldOptimizerPanel } from './components/YieldOptimizerPanel'

// Hooks
export { useProxify } from './hooks/useProxify'
export { useBalance } from './hooks/useBalance'
export { useYieldOpportunities } from './hooks/useYieldOpportunities'

// TypeScript Client (headless)
export { ProxifyClient } from './client/ProxifyClient'
```

**Usage Example**:
```tsx
// In client's app (e.g., e-commerce platform)
import { ProxifyProvider, PortfolioWidget } from '@proxify/sdk'

function App() {
  return (
    <ProxifyProvider apiKey={process.env.PROXIFY_API_KEY}>
      <MyEcommerceApp />
    </ProxifyProvider>
  )
}

function UserDashboard({ userId }) {
  return (
    <div>
      <h1>Your Store Credit</h1>
      <PortfolioWidget 
        userId={userId}
        onDeposit={(tx) => console.log('Deposit success', tx)}
      />
    </div>
  )
}
```

---

#### 2.2 Demo Apps

**Purpose**: Showcase different use cases

**Apps to Build**:

1. **E-commerce** (`apps/demo-ecommerce`)
   - Products: T-shirts, mugs
   - Store credit: $500 balance
   - Feature: "Earn 5% on unused credit"

2. **Streaming** (`apps/demo-streaming`)
   - Videos: Movies, TV shows
   - Subscription: $120/year prepaid
   - Feature: "Earn on unused months"

3. **Freelancer** (`apps/demo-freelancer`)
   - Jobs: Web dev, design
   - Escrow: $1,000 project
   - Feature: "Both parties earn during escrow"

4. **Gaming** (`apps/demo-gaming`)
   - In-game items: Gems, skins
   - Balance: 1,000 gems ($100 value)
   - Feature: "Earn on unspent gems"

---

### Tier 3: End-User Experience

#### 3.1 White-Label Wallet (`apps/end-user-wallet`)

**Purpose**: Beautiful wallet UI for end-users

**Pages**:
- `/portfolio` - Dashboard (balance, performance chart)
- `/transactions` - History (deposits, withdrawals, yields)
- `/earn` - Yield opportunities
- `/settings` - Risk preferences
- `/onramp` - Deposit fiat

**Key Features**:
- **Real-time updates** (WebSocket)
- **Mobile responsive** (works on phone)
- **White-label** (customizable branding)
- **Embed options** (iframe or standalone)

**Tech Stack**:
- Next.js 14
- Framer Motion (animations)
- Recharts (portfolio charts)
- shadcn/ui (components)
- Tailwind CSS

**Customization**:
```typescript
// Client can customize branding
<ProxifyWallet
  brandColor="#FF6B6B"
  logo="https://client.com/logo.png"
  companyName="Acme E-commerce"
  customDomain="wallet.acme.com"
/>
```

---

## 🔐 Security Architecture

### API Key Authentication

```
Client registers → Receives pk_live_xxxxx
    ↓
Client makes API request with header: X-API-Key: pk_live_xxxxx
    ↓
Middleware validates key in database
    ↓
If valid → Proceed to route
If invalid → Return 401 Unauthorized
```

### Custodial Wallet Security

- **Privy-controlled**: Client's custodial wallet managed by Privy
- **Multi-sig**: Future enhancement (require 2/3 signatures)
- **Rate limiting**: Max 100 requests/minute per API key
- **Withdrawal limits**: Max $10,000/day per end-user (configurable)

### DeFi Risk Management

- **Protocol whitelisting**: Only vetted protocols (AAVE, Curve, Compound, Uniswap)
- **Slippage protection**: Max 0.5% slippage on swaps
- **Emergency pause**: Admin can pause all DeFi operations
- **Insurance**: Future - integrate Nexus Mutual for protocol insurance

---

## 💰 Revenue Model

### Fee Structure

1. **Platform Fee**: 0.5% on all deposits
   - Example: User deposits $1,000 → $5 fee to Proxify

2. **Performance Fee**: 10% of yield earned
   - Example: User earns $50 yield → $5 fee to Proxify

3. **Subscription Tiers**:
   - **Free**: Up to 100 end-users, 5% performance fee
   - **Pro** ($299/month): Up to 10,000 end-users, 3% performance fee
   - **Enterprise** (Custom): Unlimited users, 1% performance fee

### Revenue Sharing

- **Client**: Keeps 90% of performance fees
- **Proxify**: Takes 10% of performance fees + platform fees
- **End-User**: Gets remaining yield

**Example Calculation**:
```
End-user deposits: $1,000 USDC
Platform fee (0.5%): $5 (to Proxify)
Deposited to AAVE: $995
APY: 5.2% annually

After 1 year:
Yield earned: $51.74
Performance fee (10%): $5.17
  - Proxify: $0.52
  - Client: $4.65
End-user receives: $46.57

Total end-user balance: $1,041.57
Effective APY for user: 4.16%
Client revenue: $4.65
Proxify revenue: $5.52
```

---

## 📊 Data Models

### Core Entities

```typescript
// Client (Product Owner)
interface Client {
  id: string
  companyName: string
  email: string
  custodialWalletAddress: string // Controlled by Privy
  privyWalletId: string
  status: 'active' | 'suspended' | 'trial'
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  createdAt: Date
}

// End-User
interface EndUser {
  id: string
  clientId: string // Which product owner
  externalUserId: string // Client's user ID
  walletAddress: string // Same as client's custodial wallet (shared)
  balance: string // User's balance in USDC
  riskProfile: RiskProfile
  createdAt: Date
}

// DeFi Position
interface DeFiPosition {
  id: string
  endUserId: string
  protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
  chainId: number
  tokenAddress: string
  amount: string
  apy: string
  valueUSD: string
  status: 'active' | 'withdrawn'
}

// Risk Profile
interface RiskProfile {
  endUserId: string
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  maxSlippage: number // 0.5 = 0.5%
  minAPY: number // 5.0 = 5%
  preferredProtocols: string[] // ['aave', 'curve']
  autoRebalance: boolean
  rebalanceThreshold: number // 5.0 = rebalance if APY delta > 5%
}
```

---

## 🚀 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│         Load Balancer (Vercel)          │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   Client Dashboard    │
        │   (Next.js on Vercel) │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │    Backend API        │
        │ (Express on Railway)  │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   PostgreSQL          │
        │ (Railway/Supabase)    │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │  DeFi Protocols       │
        │  (Ethereum, Polygon)  │
        └───────────────────────┘
```

### Infrastructure

- **Frontend**: Vercel (Next.js apps)
- **Backend**: Railway or Fly.io (Express API)
- **Database**: Railway PostgreSQL or Supabase
- **Blockchain**: Alchemy/Infura RPC endpoints
- **Monitoring**: Sentry (errors) + DataDog (metrics)
- **CI/CD**: GitHub Actions

---

## 📈 Scaling Strategy

### Phase 1: MVP (0-1,000 end-users)
- Single backend server
- PostgreSQL on Railway
- Manual DeFi rebalancing

### Phase 2: Growth (1,000-100,000 end-users)
- Horizontal scaling (multiple API servers)
- Read replicas for database
- Automated rebalancing (AI agent every hour)
- Caching layer (Redis)

### Phase 3: Enterprise (100,000+ end-users)
- Microservices architecture
- Event-driven (message queue for DeFi operations)
- Sharded database
- Multi-region deployment
- Real-time WebSocket for updates

---

## 🛠️ Development Workflow

### Monorepo Structure

```
proxify/
├── apps/
│   ├── client-dashboard/       # Tier 1: Client admin panel
│   ├── api/                    # Tier 1: Backend (renamed from privy-api-test)
│   ├── end-user-wallet/        # Tier 3: White-label wallet UI
│   ├── demo-ecommerce/         # Tier 2: Demo app
│   ├── demo-streaming/         # Tier 2: Demo app
│   ├── demo-freelancer/        # Tier 2: Demo app
│   └── demo-gaming/            # Tier 2: Demo app
├── packages/
│   ├── core/                   # Business logic & entities
│   ├── sdk/                    # @proxify/sdk (React components)
│   ├── database/               # Shared Prisma schema
│   └── tsconfig/               # Shared TypeScript configs
└── database/
    └── migrations/             # SQL migrations
```

### Development Commands

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter client-dashboard dev
pnpm --filter api dev
pnpm --filter end-user-wallet dev

# Build SDK
pnpm --filter @proxify/sdk build

# Run tests
pnpm test

# Database migrations
pnpm --filter database migrate:dev

# Deploy to production
pnpm deploy
```

---

## 📚 References

- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) - Detailed task breakdown
- [Glider.Fi](https://glider.fi/) - UI/UX inspiration
- [AAVE Docs](https://docs.aave.com/developers/)
- [Privy Docs](https://docs.privy.io/)

