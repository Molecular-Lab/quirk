# Quirk - Quick Reference Guide

**Last Updated:** 2025-12-11
**Purpose:** Essential concepts, commands, and architectural patterns

---

## 🎯 Core Concept: Index-Based Accounting

**The Problem:** How do you track individual user balances in a pooled custodial wallet without per-user blockchain transactions?

**The Solution:** A growing index (like Compound's cToken exchange rate)

```typescript
// User deposits $100 at index 1.0
userPosition = { amount: 100, entryIndex: 1.0 }

// Vault earns yield, index grows to 1.05
vaultIndex = 1.05

// User's current value = amount × (vaultIndex / entryIndex)
userValue = 100 × (1.05 / 1.0) = $105
```

**Why It Works:**
- ✅ Gas-efficient (no per-user transactions)
- ✅ Fair yield distribution (automatic)
- ✅ Scalable to millions of users
- ✅ Easy to audit (index history)

---

## 🏗️ Architecture: Four Layers

```
Router (HTTP) → Service (DTO mapping) → UseCase (Business Logic) → Repository (Data)
```

**Dependency Rule:** Inner layers never know about outer layers

```typescript
// Repository Layer (Data Access)
class ClientRepository {
  async getById(id: string): Promise<Client | null>
}

// UseCase Layer (Business Logic)
class ClientUsecase {
  constructor(private clientRepo: ClientRepository) {}
  async createClient(params: CreateClientParams): Promise<Client> {
    // Validation + Business rules
    // Calls repository
  }
}

// Service Layer (Orchestration)
class ClientService {
  constructor(private clientUsecase: ClientUsecase) {}
  async createClient(request: CreateClientRequest) {
    return await this.clientUsecase.createClient(request)
  }
}

// Router Layer (HTTP)
s.router(clientContract, {
  create: async ({ body }) => {
    const client = await clientService.createClient(body)
    return { status: 201, body: client }
  }
})
```

---

## 🔐 Critical Architectural Decision: Database BEFORE Blockchain

**Rule:** Update database before risky external operations

```typescript
// ✅ CORRECT (Database first)
await clientService.addToIdleBalance(clientId, amount)  // Database update
const txHash = await blockchain.mint(amount)             // Then blockchain

// ❌ WRONG (Blockchain first)
const txHash = await blockchain.mint(amount)             // Blockchain
await clientService.addToIdleBalance(clientId, amount)   // Database (might fail!)
```

**Why:** If blockchain fails, database is safe. If database succeeds but blockchain fails, we can retry or rollback blockchain operation.

---

## 💰 Wallet Stages

```
Fiat Balance (App's internal ledger)
    ↓
On-Ramp (Fiat → USDC conversion)
    ↓
Idle Balance (USDC in custodial wallet, not yet deployed)
    ↓
DeFi Deployment (USDC → AAVE/Compound/Morpho)
    ↓
Earning Balance (USDC generating yield)
    ↓
Off-Ramp (USDC → Fiat → User's bank)
```

---

## 🪙 Supported Protocols

| Protocol | Chain | APY | Risk | Min Liquidity |
|----------|-------|-----|------|---------------|
| AAVE V3 | Ethereum, Base | 3-4% | Low | High |
| Compound V3 | Ethereum, Base | 3-4% | Low | High |
| Morpho | Ethereum, Base | 4-5% | Medium | Medium |

**Integration Pattern:**
```typescript
interface IProtocolAdapter {
  getSupplyAPY(token: string, chainId: number): Promise<string>
  getMetrics(token: string, chainId: number): Promise<ProtocolMetrics>
}

// Each protocol (AAVE, Compound, Morpho) implements this interface
class AaveAdapter implements IProtocolAdapter { ... }
class CompoundAdapter implements IProtocolAdapter { ... }
class MorphoAdapter implements IProtocolAdapter { ... }

// Unified access
const adapters = [new AaveAdapter(), new CompoundAdapter(), new MorphoAdapter()]
const allMetrics = await Promise.all(adapters.map(a => a.getMetrics('USDC', 1)))
```

---

## 🎯 Yield Strategy Types

```typescript
// 1. Conservative (Low Risk)
{ AAVE: 60%, Compound: 25%, Morpho: 15% }

// 2. Moderate (Balanced)
{ AAVE: 40%, Compound: 30%, Morpho: 30% }

// 3. Morpho (Medium Risk, Higher Yield)
{ AAVE: 20%, Compound: 20%, Morpho: 60% }

// 4. Custom (Client-Defined)
{ [customProtocol]: [customPercent] }
```

**Stored in database:**
```sql
client_organizations.strategies_preferences = 'Conservative'
client_organizations.strategies_customization = '{"AAVE": {"target": 60}, ...}'
```

---

## 🔄 Core Flows

### Deposit Flow (3 Steps)

```typescript
// 1. On-Ramp: Fiat → USDC
// (Via TransFi, ZeroHash, Bridge, or Magic)

// 2. Update Database (CRITICAL - must be first!)
await clientService.addToIdleBalance(clientId, totalAmount)

// 3. DeFi Deployment: USDC → DeFi Protocol
// (Privy MPC wallet signs transaction via Viem)
await deployToAaveViaAdapter(adapter, amount)
```

**Index Update After Yield:**
```typescript
// 1. Get vault
const vault = await vaultRepo.getById(vaultId)

// 2. Calculate new index = current × (1 + yield / AUM)
const yieldEarned = 50 // $50
const totalAUM = parseFloat(vault.totalStakedBalance) // $10,000
const growthFactor = 1 + (yieldEarned / totalAUM) // 1.005
const newIndex = currentIndex × growthFactor

// 3. Safety check (prevent manipulation)
if (newIndex > currentIndex × 2) throw new Error('Index growth too high')

// 4. Update vault
await vaultRepo.updateIndex(vaultId, newIndex.toString())
```

### User Balance View
```typescript
// Get user position
const position = await userVaultRepo.getPosition(userId, vaultId)
// { amount: 100, entryIndex: 1.0 }

// Get vault index
const vault = await vaultRepo.getById(vaultId)
// { currentIndex: 1.05 }

// Calculate value
const value = (position.amount × vault.currentIndex) / position.entryIndex
// = (100 × 1.05) / 1.0 = $105
```

---

## 🛠️ Development Commands

```bash
# Database
make db-start              # Start PostgreSQL + Redis
make db-stop               # Stop databases
make db-migrate            # Run migrations
make db-rollback           # Rollback last migration
make db-reset              # Drop + recreate + migrate

# Code Generation
make sqlc-generate         # Generate TypeScript types from SQL

# Development
make dev                   # Start all services
make dev-api              # API only
make dev-web              # Web only

# Testing
make test                  # Run all tests
make test-watch           # Watch mode

# Build
make build                # Build for production
make clean                # Clean build artifacts

# Manual Commands
pnpm turbo dev --filter=api        # Dev single app
pnpm turbo test --filter=api       # Test single app
docker-compose up -d postgres redis # Start databases manually
```

---

## 🔑 Authentication Patterns

### API Key Authentication (SDK Integration)

```typescript
// Middleware
const apiKeyAuth = (clientUsecase: ClientUsecase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey || !apiKey.startsWith('pk_live_')) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    const client = await clientUsecase.validateApiKey(apiKey)
    if (!client) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    req.client = client
    next()
  }
}

// Usage
app.use('/api/v1/*', apiKeyAuth(clientUsecase))
```

### Privy Session Authentication (Dashboard)

```typescript
// Middleware
const privyAuth = (privyUsecase: PrivyUsecase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const privyOrgId = req.headers['x-privy-org-id'] as string

    if (!privyOrgId) {
      return res.status(401).json({ error: 'Missing Privy org ID' })
    }

    const account = await privyUsecase.getByPrivyOrgId(privyOrgId)
    if (!account) {
      return res.status(401).json({ error: 'Invalid Privy account' })
    }

    req.privySession = {
      organizationId: privyOrgId,
      products: await clientUsecase.getClientsByPrivyOrgId(privyOrgId)
    }
    next()
  }
}

// Usage
app.use('/api/v1/*', (req, res, next) => {
  const hasApiKey = req.headers['x-api-key']
  return hasApiKey
    ? apiKeyAuth(clientUsecase)(req, res, next)
    : privyAuth(privyUsecase)(req, res, next)
})
```

---

## 📊 Key Metrics

### For Quirk (Platform)

```
Fixed Costs: $550k/year
  ├─ Engineering (2 devs): $300k
  ├─ Compliance: $150k
  ├─ Legal: $50k
  └─ Infrastructure: $50k

Variable Costs: 18 bps per $1 AUM
  ├─ Gas costs: 3 bps
  ├─ Partner fees: 10 bps
  └─ KYC: 5 bps

Revenue: 50 bps per $1 AUM
Gross Margin: 32 bps (64%)

Breakeven: $172M AUM
```

### For Customers

```
Example: $10M AUM customer

Revenue to Quirk:
  ├─ Platform fee (50 bps): $50k/year
  ├─ Yield share (30% of APY): ~$15k/year
  └─ Total: ~$65k/year

Customer ROI:
  ├─ Integration cost: $10k (one-time)
  ├─ API costs: $12k/year
  ├─ Revenue from yield: $50k/year
  └─ Net benefit Year 1: $28k

Payback Period: 3-4 months
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables set (DATABASE_URL, PRIVY_APP_ID, ALCHEMY_API_KEY)
- [ ] Database migrations run (`make db-migrate`)
- [ ] SQLC types generated (`make sqlc-generate`)
- [ ] Privy account created and configured
- [ ] MockUSDC minted to custodial wallet (for testing)
- [ ] Rate limiting configured (100 req/min per API key)
- [ ] Health checks passing (`/` and `/health` endpoints)
- [ ] API documentation generated (ts-rest auto-docs)
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring enabled (database metrics, error rates)

---

## 🔒 Security Checklist

- [ ] API keys hashed with bcrypt (never store plaintext)
- [ ] Rate limiting per API key (100 req/min)
- [ ] Rate limiting per IP (1000 req/min)
- [ ] CORS whitelist configured (never use `*`)
- [ ] HTTPS enforced in production
- [ ] Secrets not in version control (.env in .gitignore)
- [ ] SQL injection prevented (use SQLC/parameterized queries)
- [ ] Index growth safety check (max 2× per update)
- [ ] Withdrawal limits configurable per client
- [ ] Audit logging for all transactions
- [ ] Admin pause function for emergency shutdown

---

## 📁 File Navigation

```
📂 Quirk Documentation
├── 📄 docs/core/ARCHITECTURE.md    ← System design & clean architecture
├── 📄 docs/core/BUSINESS.md        ← Product vision, market, compliance
├── 📄 docs/core/IMPLEMENTATION.md  ← Setup guides & core flows
└── 📄 docs/core/QUICK_REFERENCE.md ← This file (concepts & commands)
```

---

## 🎓 Learning Path

1. **Start Here:** `ARCHITECTURE.md` - Understand the system design
2. **Then:** `BUSINESS.md` - Understand the market and why we exist
3. **Then:** `IMPLEMENTATION.md` - Learn how to set up and run
4. **Reference:** `QUICK_REFERENCE.md` (this file) - Daily lookup guide

---

## ⚡ Common Issues & Fixes

**Issue: Database connection failed**
```bash
Error: connect ECONNREFUSED ::1:5432
Fix: make db-start
```

**Issue: SQLC generation failed**
```bash
Error: no such file or directory: database/migrations
Fix: Ensure migrations directory exists with .sql files
```

**Issue: Privy SDK error**
```bash
Error: Invalid Privy credentials
Fix: Check PRIVY_APP_ID and PRIVY_APP_SECRET in .env
```

**Issue: Idle balance not updating**
```bash
Root cause: Database update happening after blockchain operation
Fix: Move `addToIdleBalance()` call BEFORE blockchain mint
```

---

## 🔗 External References

- **Privy Docs:** https://docs.privy.io/
- **AAVE V3 Docs:** https://docs.aave.com/
- **Compound Docs:** https://compound.finance/docs/
- **Morpho Docs:** https://docs.morpho.org/
- **Viem Documentation:** https://viem.sh/
- **TypeScript Documentation:** https://www.typescriptlang.org/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **SQLC Documentation:** https://docs.sqlc.dev/

---

## 📞 Support

**For Questions About:**
- **Architecture & Design:** See `ARCHITECTURE.md`
- **Business Model & Strategy:** See `BUSINESS.md`
- **Setup & Implementation:** See `IMPLEMENTATION.md`
- **Quick Lookup:** See this file

**Last Updated:** 2025-12-11
**Status:** Production Ready
**Version:** 4.0
