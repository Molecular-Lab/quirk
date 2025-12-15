# Quirk - System Architecture

**Last Updated:** 2025-12-11
**Version:** V4 - Earn-as-a-Service Platform

---

## 🎯 Overview

Quirk is a B2B2C Earn-as-a-Service platform enabling businesses to embed DeFi yield into their applications through custodial wallet infrastructure, AI-powered yield strategies, and ledger-based accounting.

**Core Model:**
```
Business → Embeds SDK → End-Users Deposit → Custodial Wallet → DeFi Protocols → Yield Distribution
```

---

## 🏗️ Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1: QUIRK PLATFORM (Infrastructure Provider)           │
├─────────────────────────────────────────────────────────────┤
│  • Dashboard (Client registration & analytics)              │
│  • B2B API (Authentication, wallet ops, DeFi execution)     │
│  • DeFi Protocol Layer (AAVE, Compound, Morpho)            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  TIER 2: BUSINESS/CLIENT (Product Owner)                    │
├─────────────────────────────────────────────────────────────┤
│  • Embeds @quirk/sdk in their app                           │
│  • Custom branding                                           │
│  • User management                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  TIER 3: END-USER (Customer)                                │
├─────────────────────────────────────────────────────────────┤
│  • White-label wallet UI                                    │
│  • Portfolio dashboard                                       │
│  • Transaction history                                       │
│  • Fiat on-ramp (Apple Pay/Card)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Clean Architecture Layers

### Layer 1: Repository (Data Access)
**Location:** `packages/core/repository/postgres/`

**Purpose:** Database operations with type-safe SQLC-generated queries

**Pattern:**
```typescript
class ClientRepository {
  constructor(private readonly sql: Sql) {}

  async getById(id: string): Promise<Client | null>
  async create(params: CreateClientParams): Promise<Client>
  async update(id: string, params: Partial<Client>): Promise<Client>
}
```

**Key Repositories:**
- `client.repository.ts` - Client organizations
- `vault.repository.ts` - Client vaults
- `user.repository.ts` - End-users
- `deposit.repository.ts` - Deposit transactions
- `withdrawal.repository.ts` - Withdrawal transactions

---

### Layer 2: UseCase (Business Logic)
**Location:** `packages/core/usecase/b2b/`

**Purpose:** Business rules, validation, orchestration

**Pattern:**
```typescript
class ClientUsecase {
  constructor(
    private clientRepo: ClientRepository,
    private auditRepo: AuditRepository
  ) {}

  async createClient(params: CreateClientParams): Promise<Client> {
    // Validation
    if (!params.companyName?.trim()) {
      throw new Error('Company name required')
    }

    // Business logic
    const client = await this.clientRepo.create(params)

    // Audit logging
    await this.auditRepo.create({
      action: 'CLIENT_CREATED',
      entityId: client.id
    })

    return client
  }
}
```

**Key UseCases:**
- `client.usecase.ts` - Client management & metrics
- `vault.usecase.ts` - Vault operations & growth index
- `user.usecase.ts` - End-user management
- `deposit.usecase.ts` - Deposit processing
- `withdrawal.usecase.ts` - Withdrawal processing

---

### Layer 3: Service (Orchestration)
**Location:** `apps/b2b-api/src/service/`

**Purpose:** Maps between API DTOs and UseCase layer

**Pattern:**
```typescript
class ClientService {
  constructor(private clientUseCase: B2BClientUseCase) {}

  async createClient(request: CreateClientRequest) {
    return await this.clientUseCase.createClient(request)
  }

  async getRevenueMetrics(productId: string) {
    return await this.clientUseCase.getRevenueMetrics(productId)
  }
}
```

---

### Layer 4: Router (HTTP Interface)
**Location:** `apps/b2b-api/src/router/`

**Purpose:** ts-rest API contracts with Zod validation

**Pattern:**
```typescript
export const createClientRouter = (s: TsRestServer, clientService: ClientService) => {
  return s.router(clientContract, {
    create: async ({ body }) => {
      const client = await clientService.createClient(body)
      return { status: 201, body: client }
    }
  })
}
```

---

## 🗄️ Database Architecture

### Core Tables

**`client_organizations`** - Business clients
- Product ID, company name, Privy wallet address
- Revenue shares, fee configuration
- Idle balance, earning balance (wallet stages)
- Growth index tracking

**`client_vaults`** - Product vaults (one per chain/token)
- Current growth index, last updated
- Total deposits, cumulative yield
- Strategy type and configuration

**`end_user_vaults`** - Individual user positions
- Amount deposited, entry index (DCA tracking)
- Current value calculated via index

**`deposit_transactions`** - Deposit tracking
- Order ID, user ID, client ID
- Amount, status (pending → completed)
- On-ramp provider data

**`withdrawal_transactions`** - Withdrawal tracking
- User ID, client ID, amount
- Status, destination chain/address

---

## 🔢 Index-Based Accounting System

**Problem:** Track individual user balances in pooled custodial wallet

**Solution:** Growth index (like Compound's cToken exchange rate)

### How It Works

```typescript
// Vault has a growing index
const vaultIndex = 1.05 // 5% growth since inception

// User deposits $100 at index 1.02
const userPosition = {
  amount: 100,
  entryIndex: 1.02
}

// Calculate current user value
const currentValue = (userPosition.amount * vaultIndex) / userPosition.entryIndex
// = (100 * 1.05) / 1.02 = $102.94 ✅
```

### Index Update Flow

```
1. Vault earns $50 yield from DeFi protocols
2. Total AUM before yield: $10,000
3. New index = old_index × (1 + yield / total_AUM)
   = 1.0 × (1 + 50 / 10,000)
   = 1.005
4. All user balances automatically increase proportionally
```

### DCA (Dollar Cost Averaging) Support

When user deposits multiple times:
```typescript
// First deposit: $100 at index 1.0
// Second deposit: $50 at index 1.05
// Weighted entry index = ((100 × 1.0) + (50 × 1.05)) / (100 + 50)
//                      = (100 + 52.5) / 150
//                      = 1.0167
```

**Benefits:**
- Gas-efficient (no per-user blockchain transactions)
- Fair yield distribution
- Scalable to millions of users
- Easy audit trail

---

## 🔗 Chain & Network Configuration

**Supported Chains:**
- Ethereum Mainnet (Chain ID: 1)
- Base (Chain ID: 8453)
- Sepolia Testnet (Chain ID: 11155111)

**Token Standards:**
- ERC-20 (USDC, USDT, MockUSDC)

**Configuration:**
```typescript
// packages/core/constants/chain.ts
export const CHAIN_CONFIG = {
  1: { name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/...' },
  8453: { name: 'Base', rpc: 'https://base-mainnet.g.alchemy.com/...' },
  11155111: { name: 'Sepolia', rpc: 'https://eth-sepolia.g.alchemy.com/...' }
}

// packages/core/constants/addresses.ts
export const TOKEN_ADDRESSES = {
  USDC: {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  MockUSDC: {
    11155111: '0x1d02848c34ed2155613dd5cd26ce20a601b9a489'
  }
}
```

---

## 🤖 AI Yield Strategy Agent

### Strategy Types

1. **Conservative** (60% AAVE, 25% Compound, 15% Morpho)
2. **Moderate** (balanced allocation)
3. **Morpho** (Morpho-focused)
4. **Custom** (client-defined weights)

### Implementation

**Storage:** JSONB columns in `client_organizations`
- `strategies_preferences` - Selected strategy type
- `strategies_customization` - Custom allocation weights

**Execution:** Backend service calculates weighted distribution
```typescript
const strategies = {
  Conservative: {
    AAVE: { target: 60 },
    Compound: { target: 25 },
    Morpho: { target: 15 }
  }
}
```

---

## 🏦 DeFi Protocol Integration

**Location:** `packages/yield-engine/`

### Supported Protocols

1. **AAVE V3** - Lending protocol (low risk)
2. **Compound V3** - Lending protocol (low risk)
3. **Morpho** - Yield optimizer (medium risk)

### Adapter Pattern

```typescript
interface IProtocolAdapter {
  getSupplyAPY(token: string, chainId: number): Promise<string>
  getBorrowAPY(token: string, chainId: number): Promise<string>
  getMetrics(token: string, chainId: number): Promise<ProtocolMetrics>
  getTVL(chainId: number): Promise<string>
}

// Implementation example
class AaveAdapter implements IProtocolAdapter {
  async getSupplyAPY(token: string, chainId: number): Promise<string> {
    // Fetch from AAVE API or on-chain data
  }
}
```

**Key Features:**
- Unified interface across protocols
- Built-in caching with TTL
- Graceful failure handling
- Retry with exponential backoff

---

## 🔐 Security Architecture

### API Authentication

**API Key Flow:**
```
1. Client registers → Receives pk_live_xxxxx
2. API request with header: X-API-Key: pk_live_xxxxx
3. Middleware validates key (bcrypt hash comparison)
4. If valid → Proceed; If invalid → 401
```

**Privy Session Flow:**
```
1. User logs in via Privy
2. Privy session token in header: X-Privy-Org-ID
3. Middleware validates Privy account
4. Check organization has access to product
5. If valid → Proceed; If invalid → 401
```

### Custodial Wallet Security

- **Privy MPC:** Multi-party computation wallet (non-custodial for Quirk)
- **Server-Side:** One wallet per client (corporate wallet)
- **Rate Limiting:** 100 requests/minute per API key
- **Withdrawal Limits:** Configurable per client

### DeFi Risk Management

- **Protocol Whitelisting:** Only vetted protocols (AAVE, Compound, Morpho)
- **Index Safety:** Max 2× growth per update (prevents manipulation)
- **Audit Logging:** All transactions logged for compliance
- **Emergency Pause:** Admin can pause all DeFi operations

---

## 📊 Data Flow Diagrams

### Client Onboarding Flow

```
Product Owner → Quirk Dashboard
    ↓
Register account (email, company)
    ↓
Privy creates Server-Side MPC Wallet
    ↓
Generate API key (pk_live_xxxxx)
    ↓
Receive SDK integration docs
    ↓
Embed SDK in their app
```

### End-User Deposit Flow

```
End-User → Client App → Clicks "Deposit $100"
    ↓
Client App deducts from Fiat Balance
    ↓
Credits "Earn Balance" in internal ledger
    ↓
Client sends webhook: User_Deposit: $100
    ↓
Client on-ramps via SDK (batch requests)
    ↓
Privy signs & executes DeFi transactions
    ↓
Update vault index with yield
    ↓
User sees "Earning X% APY" in app
```

### Withdrawal Flow

```
User requests "Withdraw $100"
    ↓
Client calls Quirk API
    ↓
Backend unstakes from DeFi protocol
    ↓
Off-ramp: USDC → Fiat → Bank Account
    ↓
Update balances in database
```

---

## 🚀 Technology Stack

### Backend
- **Runtime:** Node.js 22+ (TypeScript)
- **Framework:** Express 5 + ts-rest
- **Database:** PostgreSQL 15+
- **Type Safety:** SQLC (generates TypeScript from SQL)
- **Blockchain:** Viem (Ethereum interactions)
- **Wallets:** Privy SDK (MPC custodial)

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Router:** TanStack Router
- **State:** React Query + Zustand
- **UI:** Radix UI + Tailwind CSS 4 + shadcn/ui

### Infrastructure
- **Monorepo:** TurboRepo + PNPM workspaces
- **Docker:** Development environment
- **Migrations:** golang-migrate

---

## 📈 Scaling Considerations

### Current Architecture (MVP)
- Single API server
- PostgreSQL on Railway/Supabase
- Manual DeFi execution via dashboard

### Phase 2 (Growth)
- Horizontal scaling (multiple API servers)
- Read replicas for database
- Automated DeFi rebalancing
- Redis caching layer

### Phase 3 (Enterprise)
- Microservices architecture
- Event-driven (message queue for DeFi ops)
- Sharded database
- Multi-region deployment
- Real-time WebSocket updates

---

## 📚 References

- **Product Vision:** See `docs/core/BUSINESS.md`
- **Implementation Guide:** See `docs/core/IMPLEMENTATION.md`
- **Quick Commands:** See `docs/core/QUICK_REFERENCE.md`
- **DeFi Protocols:** `packages/yield-engine/docs/`
