# B2B Client Registration & Management Flow

**Created:** 2025-11-17
**Status:** Implementation Ready

---

## 📋 Complete Flow Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    B2B CLIENT ONBOARDING FLOW                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  STEP 1: ORGANIZATION REGISTRATION                                 │
│  ──────────────────────────────────────────────────────────────   │
│  Client fills registration form:                                   │
│  • Product ID (unique identifier)                                  │
│  • Company name, business type                                     │
│  • Registration number, tax ID                                     │
│  • Contact email, name, phone                                      │
│  • Risk tier preference                                            │
│  • Subscription tier                                               │
│                                                                    │
│  Frontend → POST /api/v1/clients/register                          │
│  ↓                                                                 │
│  Response: {                                                       │
│    tempRegistrationId: "temp_abc123",                              │
│    privyRedirectUrl: "https://privy.io/register?token=..."        │
│  }                                                                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  STEP 2: PRIVY ACCOUNT CREATION                                    │
│  ──────────────────────────────────────────────────────────────   │
│  Client is redirected to Privy:                                    │
│  • Privy creates custodial wallet                                  │
│  • Client sets up authentication (email/social)                    │
│  • Privy generates user ID and wallet address                      │
│                                                                    │
│  After completion:                                                 │
│  Redirect back → https://proxify.com/register/complete?           │
│                  tempId=temp_abc123&                               │
│                  privyUserId=privy_user_xyz&                       │
│                  walletAddress=0x123...                            │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  STEP 3: COMPLETE REGISTRATION                                     │
│  ──────────────────────────────────────────────────────────────   │
│  Frontend → POST /api/v1/clients/register/complete {              │
│    tempRegistrationId,                                             │
│    privyUserId,                                                    │
│    privyWalletAddress                                              │
│  }                                                                 │
│  ↓                                                                 │
│  Backend:                                                          │
│  1. Validate temp registration                                     │
│  2. Generate API key (hashed + prefix)                             │
│  3. Create client_organizations record                             │
│  4. Create client_balances record (0 balance)                      │
│  5. Create vault_indices records (for risk tier)                   │
│  6. Create audit log                                               │
│                                                                    │
│  Response: {                                                       │
│    success: true,                                                  │
│    data: {                                                         │
│      productId: "my-ecommerce",                                    │
│      apiKey: "pk_live_abc123...",                                  │
│      privyWalletAddress: "0x123...",                               │
│      status: "active"                                              │
│    }                                                               │
│  }                                                                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  STEP 4: RISK TIER CONFIGURATION                                   │
│  ──────────────────────────────────────────────────────────────   │
│  Client configures risk preferences on dashboard:                  │
│                                                                    │
│  Option A: Predefined Tier                                         │
│  PUT /api/v1/clients/{productId}/risk-tier {                       │
│    riskTier: "moderate"                                            │
│  }                                                                 │
│                                                                    │
│  Option B: Custom Allocation                                       │
│  PUT /api/v1/clients/{productId}/risk-tier {                       │
│    riskTier: "custom",                                             │
│    customAllocations: [                                            │
│      { protocol: "aave", percentage: 50 },                         │
│      { protocol: "curve", percentage: 30 },                        │
│      { protocol: "compound", percentage: 20 }                      │
│    ]                                                               │
│  }                                                                 │
│                                                                    │
│  Backend updates:                                                  │
│  • client_organizations.risk_tier                                  │
│  • client_organizations.custom_allocations                         │
│  • vault_indices records                                           │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  STEP 5: SDK INTEGRATION                                           │
│  ──────────────────────────────────────────────────────────────   │
│  Client integrates SDK in their app:                               │
│                                                                    │
│  ```typescript                                                     │
│  import { ProxifyClient } from '@proxify/core'                     │
│                                                                    │
│  const proxify = new ProxifyClient({                               │
│    apiKey: 'pk_live_abc123...',                                    │
│    productId: 'my-ecommerce'                                       │
│  })                                                                │
│                                                                    │
│  // Enable yield for end-user                                      │
│  await proxify.deposits.create({                                   │
│    type: 'internal',                                               │
│    userId: 'customer_123',                                         │
│    amount: 500,                                                    │
│    currency: 'USD',                                                │
│    clientBalanceId: 'balance_abc'                                  │
│  })                                                                │
│  ```                                                               │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  STEP 6: DASHBOARD & MONITORING                                    │
│  ──────────────────────────────────────────────────────────────   │
│  Client views dashboard:                                           │
│                                                                    │
│  GET /api/v1/analytics/{productId}/dashboard                       │
│  ↓                                                                 │
│  {                                                                 │
│    totalDeposits: 50000,                                           │
│    totalValue: 50350,                                              │
│    totalYieldEarned: 350,                                          │
│    totalUsers: 100,                                                │
│    apyCurrent: 7.3,                                                │
│    allocations: [                                                  │
│      { protocol: "aave", amount: 35000, apy: 5.2 },               │
│      { protocol: "curve", amount: 10000, apy: 8.1 },              │
│      { protocol: "compound", amount: 5000, apy: 6.5 }             │
│    ]                                                               │
│  }                                                                 │
│                                                                    │
│  Real-time updates via WebSocket or polling                        │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  STEP 7: END-USER DEPOSITS & INDEX TRACKING                        │
│  ──────────────────────────────────────────────────────────────   │
│  When end-user deposits via client's app:                          │
│                                                                    │
│  1. Client SDK calls: proxify.deposits.create()                    │
│  2. Backend creates deposit_transactions record                    │
│  3. Backend creates/updates end_user_deposits:                     │
│     • user_id: "customer_123"                                      │
│     • balance: 500 (units)                                         │
│     • entry_index: 1.005 (current index)                           │
│  4. Backend updates vault_indices.total_deposits                   │
│  5. Background service deploys to DeFi protocols                   │
│  6. Hourly cron updates vault_indices.current_index               │
│                                                                    │
│  User value calculation:                                           │
│  value = (balance × current_index) / entry_index                   │
│  value = (500 × 1.010) / 1.005 = $502.49                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Summary

### 1. **client_organizations**
Primary table for B2B clients (product owners)

**Key Fields:**
- `product_id` (unique) - Client's product identifier
- `privy_user_id`, `privy_wallet_address` - Privy integration
- `api_key_hash`, `api_key_prefix` - API authentication
- `risk_tier`, `custom_allocations` - Investment strategy
- `kyb_status` - KYB verification state

### 2. **end_user_deposits**
Index-based accounting for end-users

**Key Fields:**
- `client_id`, `user_id` - Relationships
- `balance` - Fixed units (doesn't change on yield)
- `entry_index` - Index at deposit time

### 3. **vault_indices**
Per-client, per-risk-tier yield tracking

**Key Fields:**
- `client_id`, `risk_tier` - Composite key
- `current_index` - Updated hourly with yield
- `apy_current`, `apy_7d`, `apy_30d` - Performance metrics

### 4. **client_balances**
Prepaid balance for internal transfers

**Key Fields:**
- `available`, `reserved`, `total` (computed)
- Used for type='internal' deposits

### 5. **defi_allocations**
Protocol deployment tracking

**Key Fields:**
- `protocol` - aave, curve, compound, uniswap
- `amount_deployed`, `percentage`
- `yield_earned`, `apy`

### 6. **deposit_transactions**
Complete deposit order history

**Key Fields:**
- `order_id` - Unique order identifier
- `deposit_type` - external or internal
- `status` - pending → completed
- Gateway details for external payments

### 7. **withdrawal_transactions**
Withdrawal tracking

### 8. **audit_logs**
Complete activity audit trail

---

## 📦 Package Structure: `@proxify/b2b-client`

```
packages/b2b-client/
├── src/
│   ├── client/
│   │   ├── registration.client.ts    ✅ Client registration & management
│   │   ├── deposit.client.ts         ✅ Deposit operations
│   │   ├── analytics.client.ts       ✅ Dashboard & metrics
│   │   └── proxify.client.ts         ✅ Main client (aggregates all)
│   │
│   ├── types/
│   │   └── client.types.ts           ✅ All TypeScript types
│   │
│   ├── config/
│   │   ├── env.ts                    ✅ Environment config
│   │   └── client.config.ts          ✅ Axios config
│   │
│   └── index.ts                      ✅ Main exports
│
├── package.json
└── README.md
```

---

## 🔑 API Client Methods

### **ClientRegistrationClient**
```typescript
// Register new client
registration.register(CreateClientRequest)

// Complete after Privy
registration.completeRegistration({ tempId, privyUserId, walletAddress })

// Get client details
registration.getClient(productId)
registration.getCurrentClient()

// Update configuration
registration.updateRiskTier(productId, { riskTier, customAllocations })
registration.updateWebhook(productId, { webhookUrl })

// Dashboard stats
registration.getDashboardStats(productId)

// API key management
registration.regenerateAPIKey(productId)

// Deactivation
registration.deactivate(productId)
```

### **DepositClient**
```typescript
// Create deposit (external or internal)
deposits.create(DepositRequest)

// Get status
deposits.getStatus(orderId)

// List deposits
deposits.list(userId, page, limit)
```

### **AnalyticsClient**
```typescript
// Dashboard stats
analytics.getDashboardStats(productId)

// Performance over time
analytics.getPerformanceMetrics(productId, 'daily' | 'weekly' | 'monthly')

// Vault indices
analytics.getVaultIndices(productId)

// Allocation breakdown
analytics.getAllocations(productId)

// Top earners
analytics.getTopEarners(productId, limit)

// User balance
analytics.getUserBalance(productId, userId)

// Audit logs
analytics.getAuditLogs(productId, page, limit, filters)

// Export data
analytics.exportData(productId, 'deposits' | 'withdrawals', timeRange)
```

---

## 🚀 Usage Examples

### Example 1: Client Registration Flow

```typescript
import { ProxifyB2BClient } from '@proxify/b2b-client'

const client = new ProxifyB2BClient()

// Step 1: Register
const registration = await client.registration.register({
	productId: 'my-ecommerce',
	companyName: 'My E-Commerce Inc.',
	businessType: 'ecommerce',
	contactEmail: 'admin@myecommerce.com',
	contactName: 'John Doe',
	countryCode: 'USA',
	riskTier: 'moderate',
	subscriptionTier: 'growth',
})

// Redirect user to Privy
window.location.href = registration.data.privyRedirectUrl

// Step 2: After Privy redirect back
const complete = await client.registration.completeRegistration({
	tempRegistrationId: registration.data.tempRegistrationId,
	privyUserId: 'privy_user_xyz',
	privyWalletAddress: '0x123...',
})

console.log('API Key:', complete.data.apiKeyPrefix)
```

### Example 2: Configure Risk Tier

```typescript
// Option A: Use predefined tier
await client.registration.updateRiskTier('my-ecommerce', {
	riskTier: 'low', // 70% AAVE, 20% Curve, 10% reserves
})

// Option B: Custom allocation
await client.registration.updateRiskTier('my-ecommerce', {
	riskTier: 'custom',
	customAllocations: [
		{ protocol: 'aave', percentage: 50 },
		{ protocol: 'curve', percentage: 30 },
		{ protocol: 'compound', percentage: 20 },
	],
})
```

### Example 3: Dashboard Integration

```typescript
// Get comprehensive stats
const stats = await client.analytics.getDashboardStats('my-ecommerce')

console.log(`TVL: $${stats.data.totalValue}`)
console.log(`APY: ${stats.data.apyCurrent}%`)
console.log(`Users: ${stats.data.totalUsers}`)

// Get performance chart data
const performance = await client.analytics.getPerformanceMetrics('my-ecommerce', 'weekly')

// Render chart with performance.data
renderChart(performance.data.data) // Array of { timestamp, value }

// Get allocations for pie chart
const allocations = await client.analytics.getAllocations('my-ecommerce')

renderPieChart(allocations.data) // Array of { protocol, percentage, apy }
```

### Example 4: End-User Deposit (Client SDK Integration)

```typescript
import { ProxifyClient } from '@proxify/core'

// Client integrates this in their app
const proxify = new ProxifyClient({
	apiKey: 'pk_live_abc123...',
	productId: 'my-ecommerce',
})

// Internal transfer (from client's system balance)
const deposit = await proxify.deposits.create({
	type: 'internal',
	userId: 'customer_123',
	amount: 500,
	currency: 'USD',
	clientBalanceId: 'balance_abc',
})

// Instant completion
console.log('Deposit completed:', deposit.data.orderId)
```

---

## 🔧 Backend Implementation Checklist

### API Endpoints to Create

#### Client Management
- [ ] `POST /api/v1/clients/register`
- [ ] `POST /api/v1/clients/register/complete`
- [ ] `GET /api/v1/clients/me`
- [ ] `GET /api/v1/clients/:productId`
- [ ] `PUT /api/v1/clients/:productId/risk-tier`
- [ ] `PUT /api/v1/clients/:productId/webhook`
- [ ] `POST /api/v1/clients/:productId/api-key/regenerate`
- [ ] `DELETE /api/v1/clients/:productId`

#### Deposits (from @proxify/core SDK)
- [ ] `POST /api/v1/deposits`
- [ ] `GET /api/v1/deposits/:orderId`
- [ ] `GET /api/v1/deposits?userId=xxx`
- [ ] `GET /api/v1/deposits/client-balance`

#### Analytics
- [ ] `GET /api/v1/analytics/:productId/dashboard`
- [ ] `GET /api/v1/analytics/:productId/performance`
- [ ] `GET /api/v1/analytics/:productId/vault-indices`
- [ ] `GET /api/v1/analytics/:productId/allocations`
- [ ] `GET /api/v1/analytics/:productId/top-earners`
- [ ] `GET /api/v1/analytics/:productId/users/:userId/balance`
- [ ] `GET /api/v1/analytics/:productId/audit-logs`
- [ ] `GET /api/v1/analytics/:productId/export/:type`

### Background Services

- [ ] **Index Updater** - Runs hourly, updates vault_indices.current_index
- [ ] **DeFi Executor** - Deploys funds to protocols based on allocations
- [ ] **Rebalancer** - Adjusts allocations when index drifts
- [ ] **Webhook Dispatcher** - Sends events to client webhook URLs
- [ ] **Cleanup Service** - Expires old deposits, archives logs

---

## ✅ What's Ready Now

1. ✅ **Database Schema** - Complete migrations ready to run
2. ✅ **SQL Queries** - All CRUD operations defined
3. ✅ **TypeScript Types** - Full type safety
4. ✅ **API Client** - `@proxify/b2b-client` package complete
5. ✅ **Documentation** - This file + inline docs

## 🚧 What Needs Implementation

1. ❌ **Go Backend** - API endpoints, business logic
2. ❌ **Privy Integration** - Wallet creation flow
3. ❌ **DeFi Integration** - AAVE, Curve, Compound deployment
4. ❌ **Index Calculation** - Hourly yield tracking service
5. ❌ **Frontend Dashboard** - Client dashboard UI (whitelabel-web)

---

**Next Steps:** Implement Go backend handlers following the existing `apps/api-core` pattern
