# @proxify/b2b-client Implementation Guide

**Package:** `@proxify/b2b-client`  
**Version:** 1.0.0  
**Created:** 2025-11-16

---

## 🎯 Package Purpose

This package provides a **type-safe, configured API client** for Proxify B2B deposit operations. It follows the same architecture pattern as:
- `@proxify/privy-client` - For Privy wallet operations
- `@proxify/contract-executor-client` - For smart contract interactions

**Key Design Principles:**
1. **Thin wrapper** - All business logic lives in `@proxify/core`
2. **Environment-driven** - Configuration via `.env` files
3. **Singleton pattern** - Single axios instance shared across app
4. **Type safety** - Full TypeScript support from `@proxify/core`

---

## 📦 Package Structure

```
@proxify/b2b-client/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment validation with Zod
│   │   ├── client.config.ts    # Axios instance factory
│   │   └── index.ts            # Config exports
│   ├── client/
│   │   ├── deposit.client.ts   # DepositClient class
│   │   ├── proxify.client.ts   # Main ProxifyB2BClient class
│   │   └── index.ts            # Client exports
│   └── index.ts                # Main package entry (re-exports from @proxify/core)
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔧 Implementation Details

### 1. Environment Configuration (`config/env.ts`)

**Purpose:** Validate environment variables using Zod schema

**Features:**
- ✅ Validates required env vars (`PROXIFY_API_KEY`, `PROXIFY_PRODUCT_ID`)
- ✅ Provides defaults (`PROXIFY_ENVIRONMENT` = 'development')
- ✅ Throws clear errors if missing required vars
- ✅ Auto-selects base URL based on environment

**Usage:**
```typescript
import { ENV, getBaseURL } from '@proxify/b2b-client'

console.log(ENV.PROXIFY_API_KEY)
console.log(getBaseURL()) // https://api.proxify.finance/v1
```

---

### 2. Client Configuration (`config/client.config.ts`)

**Purpose:** Create and configure axios instance with proper headers

**Features:**
- ✅ Singleton axios instance (shared across app)
- ✅ Auto-injects API key + Product ID in headers
- ✅ Request/response interceptors for logging (dev mode)
- ✅ Error handling for common HTTP statuses

**Usage:**
```typescript
import { getAxiosInstance } from '@proxify/b2b-client'

const axios = getAxiosInstance()
// axios is pre-configured with:
// - baseURL: https://api.proxify.finance/v1
// - headers: { 'X-API-Key': '...', 'X-Product-ID': '...' }
```

---

### 3. Deposit Client (`client/deposit.client.ts`)

**Purpose:** Type-safe wrapper for deposit API endpoints

**Methods:**
- `create(params)` - Create external or internal deposit
- `getStatus(orderId)` - Get deposit status
- `list(userId, page, limit)` - List user deposits (paginated)
- `getClientBalance()` - Get client's prepaid balance

**All types imported from `@proxify/core`:**
- `DepositRequest` (union: External | Internal)
- `DepositResponse` (union: External | Internal)
- `Deposit` (union: External | Internal)
- `PaginatedDeposits`
- `ClientBalance`

---

### 4. Main Client (`client/proxify.client.ts`)

**Purpose:** Main client class that aggregates all API clients

**Current Features:**
- `deposits` - DepositClient instance

**Future Expansion:**
- `withdrawals` - WithdrawalClient
- `webhooks` - WebhookClient
- `analytics` - AnalyticsClient

**Usage:**
```typescript
import { ProxifyB2BClient } from '@proxify/b2b-client'

const client = new ProxifyB2BClient()

// All deposit operations
await client.deposits.create({ ... })
await client.deposits.getStatus('order_123')
await client.deposits.list('user_123')
await client.deposits.getClientBalance()
```

---

### 5. Main Entry Point (`index.ts`)

**Purpose:** Re-export types from `@proxify/core` + export client classes

**Strategy:**
- ✅ All **types** come from `@proxify/core` (single source of truth)
- ✅ All **client classes** are in this package
- ✅ Environment config is in this package
- ❌ No business logic in this package

**What gets re-exported:**
```typescript
// From @proxify/core
export type {
  DepositRequest,
  DepositResponse,
  Deposit,
  ClientBalance,
  // ... etc
}

// From @proxify/core/sdk
export { ProxifyClient, ProxifyError }

// From this package
export { ProxifyB2BClient, DepositClient }
export { ENV, getBaseURL, getAxiosInstance }
```

---

## 🔗 Integration with @proxify/core

This package depends on `@proxify/core` for:

1. **Type Definitions** (`@proxify/core/sdk/types.ts`)
   - `DepositRequest`, `DepositResponse`, `Deposit`, etc.
   - All deposit-related types

2. **SDK Client** (`@proxify/core/sdk/client.ts`)
   - `ProxifyClient` class (standalone SDK)
   - `ProxifyError` class

3. **Business Logic** (when needed)
   - Future: Deposit validation use cases
   - Future: Webhook signature verification
   - Future: Balance calculation logic

---

## 🚀 Usage Examples

### Basic Usage

```typescript
import { ProxifyB2BClient } from '@proxify/b2b-client'

// Initialize (uses env vars automatically)
const client = new ProxifyB2BClient()

// External payment
const deposit = await client.deposits.create({
  type: 'external',
  userId: 'user_123',
  amount: 100,
  currency: 'USD',
  method: 'apple_pay'
})

// Internal transfer
const deposit = await client.deposits.create({
  type: 'internal',
  userId: 'user_123',
  amount: 5000,
  currency: 'USD',
  clientBalanceId: 'balance_abc'
})
```

### Custom Configuration

```typescript
import { 
  ProxifyB2BClient, 
  createClientConfig, 
  createAxiosInstance 
} from '@proxify/b2b-client'

// Custom config
const config = createClientConfig({
  apiKey: 'pk_custom_key',
  productId: 'custom_product',
  baseURL: 'https://custom-api.example.com',
  timeout: 60000
})

// Custom axios instance
const axios = createAxiosInstance(config)

// Client with custom instance
const client = new ProxifyB2BClient(axios)
```

### Error Handling

```typescript
import { ProxifyB2BClient } from '@proxify/b2b-client'

const client = new ProxifyB2BClient()

try {
  const deposit = await client.deposits.create({ ... })
} catch (error) {
  if (error.response) {
    // API error (4xx, 5xx)
    console.error('API Error:', error.response.status)
    console.error('Message:', error.response.data?.error?.message)
  } else if (error.request) {
    // Network error
    console.error('Network error - no response')
  } else {
    // Other error
    console.error('Error:', error.message)
  }
}
```

---

## 📋 Checklist for Future Features

### Near-term:
- [ ] Add webhook signature verification
- [ ] Add withdrawal client (`client.withdrawals`)
- [ ] Add retry logic for failed requests
- [ ] Add request rate limiting

### Mid-term:
- [ ] Add comprehensive unit tests
- [ ] Add integration tests with mock API
- [ ] Add TypeScript strict mode
- [ ] Add JSDoc documentation

### Long-term:
- [ ] Add analytics client
- [ ] Add webhook event streaming
- [ ] Add GraphQL support
- [ ] Add WebSocket real-time updates

---

## 🧪 Testing Strategy

### Unit Tests (to implement):
```typescript
// Test environment validation
describe('ENV', () => {
  it('should validate required env vars')
  it('should throw error if API key missing')
  it('should use defaults for optional vars')
})

// Test client configuration
describe('createAxiosInstance', () => {
  it('should create axios with correct base URL')
  it('should inject API key header')
  it('should inject product ID header')
})

// Test deposit client
describe('DepositClient', () => {
  it('should create external deposit')
  it('should create internal deposit')
  it('should get deposit status')
  it('should list deposits with pagination')
  it('should get client balance')
})
```

---

## 📚 Comparison with Other Packages

### vs `@proxify/privy-client`

| Feature | `@proxify/privy-client` | `@proxify/b2b-client` |
|---------|------------------------|----------------------|
| **Purpose** | Privy wallet operations | B2B deposit operations |
| **Main Dependency** | `@privy-io/node` | `axios` |
| **Auth** | Privy App ID + Secret | API Key + Product ID |
| **Singleton** | Privy client instance | Axios instance |
| **API** | Privy SDK methods | REST API calls |

### vs `@proxify/contract-executor-client`

| Feature | `@proxify/contract-executor-client` | `@proxify/b2b-client` |
|---------|-------------------------------------|----------------------|
| **Purpose** | Smart contract interactions | B2B deposit operations |
| **Main Dependency** | `viem`, `@safe-global/api-kit` | `axios` |
| **Chain** | Blockchain operations | Off-chain API |
| **Auth** | Wallet private keys | API Key |

---

## 🔄 Migration Path

If moving from direct `@proxify/core` SDK usage to `@proxify/b2b-client`:

**Before:**
```typescript
import { ProxifyClient } from '@proxify/core'

const proxify = new ProxifyClient({
  apiKey: process.env.PROXIFY_API_KEY,
  productId: process.env.PROXIFY_PRODUCT_ID,
  environment: 'production'
})

await proxify.deposits.create({ ... })
```

**After:**
```typescript
import { ProxifyB2BClient } from '@proxify/b2b-client'

// Automatically uses env vars
const client = new ProxifyB2BClient()

await client.deposits.create({ ... })
```

**Benefits:**
- ✅ Environment validation with clear errors
- ✅ Singleton instance (no duplicate configs)
- ✅ Consistent with other Proxify client packages
- ✅ Built-in logging in development mode

---

## 📝 Summary

**What was created:**
1. ✅ Full package structure (`src/`, `config/`, `client/`)
2. ✅ Environment validation with Zod
3. ✅ Axios instance factory with interceptors
4. ✅ Deposit client with type-safe methods
5. ✅ Main B2B client class
6. ✅ Comprehensive README
7. ✅ Implementation guide (this document)

**What's needed next:**
1. Install dependencies: `pnpm install` in package directory
2. Update workspace `pnpm-workspace.yaml` if needed
3. Add to root `package.json` workspace references
4. Implement tests
5. Use in backend server or demo app

**Total files created:** 11 files (~1,000 lines)
