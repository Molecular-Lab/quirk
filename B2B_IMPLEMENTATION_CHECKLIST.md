# B2B Client Implementation Checklist

## ✅ Completed

### Database Layer
- [x] Create migration `000002_create_b2b_tables.up.sql` (8 tables)
- [x] Create rollback migration `000002_create_b2b_tables.down.sql`
- [x] Write SQL queries `database/queries/b2b_client.sql` (50+ queries)

### TypeScript Core Package (@proxify/core)
- [x] Entity definitions `entity/b2b-client.entity.ts` (8 entities)
- [x] Datagateway interfaces `datagateway/b2b-client.datagateway.ts` (8 interfaces)
- [x] Repository structure `repository/b2b-client.repository.ts` (8 repos + aggregator)
- [x] Export from `entity/index.ts`
- [x] Export from `datagateway/index.ts`
- [x] Export from `repository/index.ts`
- [x] Resolve `RiskTier` naming conflict (renamed to `ClientRiskTier`)

### TypeScript Client SDK (@proxify/b2b-client)
- [x] Registration client `src/client/registration.client.ts`
- [x] Analytics client `src/client/analytics.client.ts`
- [x] Deposit client `src/client/deposit.client.ts`
- [x] Complete types `src/types/client.types.ts`
- [x] Main aggregator `src/client/proxify.client.ts`

### Documentation
- [x] Implementation guide `B2B_CLIENT_IMPLEMENTATION_GUIDE.md`
- [x] Quick summary `B2B_CLIENT_SUMMARY.md`
- [x] Architecture summary `B2B_ARCHITECTURE_SUMMARY.md`
- [x] Implementation checklist (this file)

---

## ⏳ Next Steps

### 1. Generate Database Code (Priority: HIGH)
```bash
# Run migrations
cd /Users/wtshai/Work/Protocolcamp/proxify
make db-migrate-up

# Generate sqlc code
sqlc generate

# Update repository imports
# Change: type Database = any
# To: import type { Database } from '../types/database.types'
```

**Files to Update After sqlc:**
- `packages/core/repository/b2b-client.repository.ts` (remove placeholder, add real imports)
- Implement all repository methods using generated queries

---

### 2. Implement Use Case Layer (Priority: HIGH)
Create: `packages/core/usecase/b2b-client.usecase.ts`

**Required Use Cases:**

#### ClientRegistrationUseCase
```typescript
class ClientRegistrationUseCase {
  async register(params: RegisterClientParams): Promise<ClientOrganization>
  async completeOnboarding(clientId: string, privyUserId: string): Promise<void>
  async updateRiskTier(clientId: string, tier: ClientRiskTier): Promise<void>
  async regenerateAPIKey(clientId: string): Promise<{ apiKey: string }>
}
```

**Business Logic:**
1. Validate company information
2. Check for duplicate registrations
3. Create Privy user (redirect to Privy OAuth)
4. Store Privy wallet address
5. Generate API key (hash + prefix)
6. Create initial vault index
7. Create client balance record
8. Send webhook (if configured)
9. Create audit log

#### DepositUseCase
```typescript
class DepositUseCase {
  async createExternalDeposit(params: CreateExternalDepositParams): Promise<DepositTransaction>
  async createInternalDeposit(params: CreateInternalDepositParams): Promise<DepositTransaction>
  async processDepositCallback(orderId: string, status: string): Promise<void>
  async allocateToDeFi(clientId: string): Promise<DefiAllocation[]>
}
```

**Business Logic:**
1. **External Deposit:**
   - Create deposit transaction (status: pending)
   - Generate payment URL (Privy onramp)
   - Return order details to client
   - Wait for webhook callback
   - On success: Update end_user_deposit balance, update vault allocation
   
2. **Internal Deposit:**
   - Check client balance >= amount
   - Deduct from client_balances
   - Update end_user_deposit balance
   - Create transaction record
   - Deploy to DeFi protocols per risk tier

#### WithdrawalUseCase
```typescript
class WithdrawalUseCase {
  async requestWithdrawal(params: RequestWithdrawalParams): Promise<WithdrawalTransaction>
  async processWithdrawal(orderId: string): Promise<void>
  async cancelWithdrawal(orderId: string): Promise<void>
}
```

**Business Logic:**
1. Calculate current balance: `(balance × currentIndex) / entryIndex`
2. Check balance >= requested amount
3. Check if funds need to be withdrawn from DeFi
4. If yes, initiate DeFi withdrawal first
5. Process withdrawal to destination (client balance, bank, card)
6. Update end_user_deposit balance
7. Create audit log

#### VaultIndexUseCase
```typescript
class VaultIndexUseCase {
  async updateIndex(clientId: string, riskTier: ClientRiskTier): Promise<VaultIndex>
  async calculateUserBalance(depositId: string): Promise<number>
  async getYieldEarned(depositId: string): Promise<number>
}
```

**Business Logic:**
1. Fetch all active allocations for client + risk tier
2. Sum yield earned from all protocols
3. Calculate new index: `currentIndex = previousIndex × (1 + yieldRate)`
4. Update vault_indices table
5. Return updated index

#### DashboardUseCase
```typescript
class DashboardUseCase {
  async getClientDashboard(clientId: string): Promise<ClientDashboard>
  async getEndUserBalance(clientId: string, userId: string): Promise<UserBalance>
  async getPerformanceMetrics(clientId: string, period: string): Promise<PerformanceMetrics>
}
```

**Business Logic:**
1. Aggregate data from multiple tables
2. Calculate current values using index
3. Compute APY metrics
4. Return dashboard data

---

### 3. Backend API Implementation (Priority: HIGH)
Create: `server/apps/api-core/handlers/b2b_client_handler.go`

**Required Endpoints:**

```go
// Registration
POST   /api/v1/b2b/register
POST   /api/v1/b2b/complete-onboarding
GET    /api/v1/b2b/client/:id
PUT    /api/v1/b2b/client/:id/risk-tier
POST   /api/v1/b2b/client/:id/regenerate-key

// Deposits
POST   /api/v1/b2b/deposits
GET    /api/v1/b2b/deposits/:orderId
GET    /api/v1/b2b/clients/:clientId/deposits

// Withdrawals
POST   /api/v1/b2b/withdrawals
GET    /api/v1/b2b/withdrawals/:orderId

// Dashboard
GET    /api/v1/b2b/clients/:clientId/dashboard
GET    /api/v1/b2b/clients/:clientId/users/:userId/balance
GET    /api/v1/b2b/clients/:clientId/performance

// Webhooks (Privy callbacks)
POST   /webhooks/privy/deposit-success
POST   /webhooks/privy/deposit-failed
```

**Authentication Middleware:**
```go
func B2BClientAuth() fiber.Handler {
  // 1. Extract API key from header: X-API-Key
  // 2. Get prefix (first 8 chars)
  // 3. Query client by prefix
  // 4. Hash full key and compare with stored hash
  // 5. Set client ID in context
}
```

---

### 4. DeFi Integration Service (Priority: MEDIUM)
Create: `server/apps/defi-deployer/`

**Responsibilities:**
- Deploy funds to protocols (AAVE, Curve, Compound, Uniswap)
- Monitor positions
- Harvest yield
- Rebalance based on risk tier changes
- Handle emergency withdrawals

**Configuration:**
```typescript
const RISK_TIER_ALLOCATIONS = {
  low: {
    aave: 70,      // 70% to AAVE (safest)
    curve: 20,     // 20% to Curve
    compound: 0,
    uniswap: 0,
    reserves: 10,  // 10% liquid reserves
  },
  moderate: {
    aave: 50,
    curve: 25,
    compound: 15,
    uniswap: 0,
    reserves: 10,
  },
  high: {
    aave: 30,
    curve: 20,
    compound: 20,
    uniswap: 20,   // Include high-risk liquidity mining
    reserves: 10,
  },
  custom: {
    // Per client configuration
  },
}
```

---

### 5. Index Calculation Cron Job (Priority: MEDIUM)
Create: `server/apps/index-calculator/`

**Schedule:** Every 15 minutes

**Logic:**
```typescript
async function updateIndices() {
  // 1. Get all active clients
  const clients = await db.listActiveClients()
  
  for (const client of clients) {
    // 2. For each risk tier
    for (const tier of ['low', 'moderate', 'high', 'custom']) {
      // 3. Get current vault index
      const vaultIndex = await db.getVaultIndex(client.id, tier)
      
      // 4. Get all active allocations
      const allocations = await db.listActiveAllocations(client.id, tier)
      
      // 5. Sum yield from all protocols
      let totalYield = 0
      for (const allocation of allocations) {
        const yield = await fetchProtocolYield(allocation.protocol, allocation.contractAddress)
        totalYield += yield
        await db.updateAllocationYield(allocation.id, yield)
      }
      
      // 6. Calculate new index
      const yieldRate = totalYield / vaultIndex.totalDeployed
      const newIndex = vaultIndex.currentIndex * (1 + yieldRate)
      
      // 7. Update vault index
      await db.updateVaultIndex({
        clientId: client.id,
        riskTier: tier,
        currentIndex: newIndex,
        totalYieldEarned: vaultIndex.totalYieldEarned + totalYield,
        lastUpdatedAt: new Date(),
      })
      
      // 8. Create audit log
      await db.createAuditLog({
        clientId: client.id,
        actorType: 'system',
        action: 'vault_index_updated',
        metadata: { tier, oldIndex: vaultIndex.currentIndex, newIndex, yieldRate },
      })
    }
  }
}
```

---

### 6. Webhook Dispatcher Service (Priority: LOW)
Create: `server/apps/webhook-dispatcher/`

**Events to Send:**
- `client.onboarding.completed`
- `deposit.created`
- `deposit.completed`
- `deposit.failed`
- `withdrawal.created`
- `withdrawal.completed`
- `vault.index.updated`
- `risk_tier.changed`

**Implementation:**
```typescript
async function dispatchWebhook(clientId: string, event: string, payload: any) {
  const client = await db.getClientById(clientId)
  if (!client.webhookUrl) return
  
  const signature = createHmac('sha256', client.webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  await fetch(client.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Proxify-Signature': signature,
      'X-Proxify-Event': event,
    },
    body: JSON.stringify(payload),
  })
}
```

---

### 7. Frontend Dashboard (Priority: LOW)
Create: `apps/whitelabel-web/src/pages/B2BDashboard/`

**Pages:**
- `/dashboard` - Overview metrics
- `/deposits` - Deposit history
- `/users` - End-user list with balances
- `/settings` - Risk tier, webhooks, API keys
- `/analytics` - Performance charts

---

## 📋 Testing Checklist

### Unit Tests
- [ ] Entity validation
- [ ] Repository methods (mock database)
- [ ] Use case business logic
- [ ] API handlers

### Integration Tests
- [ ] Database migrations
- [ ] End-to-end registration flow
- [ ] External deposit flow
- [ ] Internal deposit flow
- [ ] Withdrawal flow
- [ ] Index calculation accuracy

### Load Tests
- [ ] 1000 concurrent deposits
- [ ] Index calculation with 100 clients
- [ ] Webhook delivery with retries

---

## 🚀 Deployment Checklist

### Database
- [ ] Run migrations on production
- [ ] Create database indexes
- [ ] Set up read replicas
- [ ] Configure backup schedule

### Backend
- [ ] Deploy API handlers
- [ ] Configure Privy credentials
- [ ] Set up DeFi protocol connections
- [ ] Deploy cron jobs
- [ ] Configure monitoring/alerting

### Frontend
- [ ] Build whitelabel dashboard
- [ ] Deploy to production
- [ ] Configure API endpoints

---

## Status Summary

**Architecture:** ✅ Complete  
**Database:** ✅ Complete (migrations ready)  
**SDK Client:** ✅ Complete  
**Core Interfaces:** ✅ Complete  
**Repository Structure:** ✅ Complete  

**Next Priority:**
1. Run `sqlc generate`
2. Implement repository methods
3. Build use case layer
4. Create API handlers
