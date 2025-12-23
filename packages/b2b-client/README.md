# @proxify/b2b-client

**Official B2B API Client for Quirk Deposit Operations**

This package provides a type-safe client for integrating Quirk's B2B deposit functionality into your platform (YouTube, E-commerce, Gaming, etc.). It supports **two on-ramp types**:

1. **External Payment** (Apple Pay/Transak) - Users pay NEW money
2. **Internal Transfer** - Users transfer EXISTING balance in your system

---

## 📦 Installation

```bash
# From workspace root
pnpm add @proxify/b2b-client

# Or if using npm
npm install @proxify/b2b-client
```

---

## 🚀 Quick Start

### 1. Configure Environment

Create a `.env` file:

```bash
PROXIFY_API_KEY=pk_test_your_api_key_here
PROXIFY_PRODUCT_ID=your_product_id
PROXIFY_ENVIRONMENT=development # production | staging | development
```

### 2. Initialize Client

```typescript
import { QuirkB2BClient } from '@proxify/b2b-client'

const client = new QuirkB2BClient()
```

### 3. Create Deposit (External Payment)

```typescript
// User pays with Apple Pay
const deposit = await client.deposits.create({
  type: 'external',
  userId: 'user_123',
  amount: 100,
  currency: 'USD',
  method: 'apple_pay',
  userEmail: 'user@example.com',
  returnUrl: 'https://myapp.com/success'
})

// Open payment URL
console.log('Payment URL:', deposit.data.paymentUrl)
// window.open(deposit.data.paymentUrl, '_blank')
```

### 4. Create Deposit (Internal Transfer)

```typescript
// User transfers from their balance in your system
const deposit = await client.deposits.create({
  type: 'internal',
  userId: 'user_123',
  amount: 5000,
  currency: 'USD',
  clientBalanceId: 'user_balance_abc123'
})

// Instant completion!
console.log('Transfer complete:', deposit.data.orderId)
```

---

## 📖 API Reference

### `QuirkB2BClient`

Main client class.

#### Constructor

```typescript
const client = new QuirkB2BClient(axiosInstance?: AxiosInstance)
```

Uses singleton axios instance from environment config by default.

---

### `client.deposits`

Deposit management client.

#### `create(params: DepositRequest)`

Create a new deposit (external or internal).

**Parameters:**

```typescript
type DepositRequest = ExternalDepositRequest | InternalDepositRequest

// External Payment
interface ExternalDepositRequest {
  type: 'external'
  userId: string
  amount: number
  currency: 'USD' | 'EUR' | 'GBP'
  method: 'apple_pay' | 'card' | 'bank_transfer'
  userEmail?: string
  userPhone?: string
  returnUrl?: string
}

// Internal Transfer
interface InternalDepositRequest {
  type: 'internal'
  userId: string
  amount: number
  currency: 'USD' | 'EUR' | 'GBP'
  clientBalanceId: string
  sourceAccountId?: string
}
```

**Returns:** `Promise<DepositResponse>`

---

#### `getStatus(orderId: string)`

Get deposit status by order ID.

**Returns:** `Promise<Deposit>`

**Example:**

```typescript
const status = await client.deposits.getStatus('order_abc123')

if (status.status === 'COMPLETED') {
  console.log('Deposit completed!')
}
```

---

#### `list(userId: string, page?: number, limit?: number)`

List all deposits for a user (with pagination).

**Returns:** `Promise<PaginatedDeposits>`

**Example:**

```typescript
const deposits = await client.deposits.list('user_123', 1, 20)

console.log(`Total: ${deposits.pagination.total}`)
deposits.data.forEach(deposit => {
  console.log(`${deposit.orderId}: ${deposit.status}`)
})
```

---

#### `getClientBalance()`

Get client's prepaid balance with Quirk (for internal transfers).

**Returns:** `Promise<ClientBalance>`

**Example:**

```typescript
const balance = await client.deposits.getClientBalance()

console.log(`Available: $${balance.available}`)
console.log(`Reserved: $${balance.reserved}`)
console.log(`Total: $${balance.total}`)
```

---

## 🎯 Use Cases

### YouTube Creator Dashboard

```typescript
import { QuirkB2BClient } from '@proxify/b2b-client'

const client = new QuirkB2BClient()

// Creator transfers $5k from YouTube balance to earn 7.3% APY
const deposit = await client.deposits.create({
  type: 'internal',
  userId: 'creator_123',
  amount: 5000,
  currency: 'USD',
  clientBalanceId: 'youtube_balance_abc'
})

console.log('Now earning yield on', deposit.data.cryptoAmount, 'USDC')
```

### E-commerce Checkout

```typescript
// Customer pays $150 with Apple Pay
const deposit = await client.deposits.create({
  type: 'external',
  userId: 'customer_456',
  amount: 150,
  currency: 'USD',
  method: 'apple_pay',
  returnUrl: 'https://mystore.com/success'
})

// Open Apple Pay popup
window.open(deposit.data.paymentUrl, '_blank')

// Poll for completion
const checkStatus = async () => {
  const status = await client.deposits.getStatus(deposit.data.orderId)
  
  if (status.status === 'COMPLETED') {
    console.log('Payment successful!')
  } else if (status.status === 'FAILED') {
    console.log('Payment failed:', status.errorMessage)
  }
}
```

---

## 🏗️ Architecture

This package follows **Clean Architecture** principles:

- **@proxify/core** - Contains all business logic, entities, use cases, and types
- **@proxify/b2b-client** - Thin wrapper that provides configured clients and environment setup

```
@proxify/b2b-client
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment validation
│   │   └── client.config.ts    # Axios instance configuration
│   ├── client/
│   │   ├── deposit.client.ts   # Deposit operations
│   │   └── proxify.client.ts   # Main client
│   └── index.ts                # Re-exports from @proxify/core
```

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PROXIFY_API_KEY` | ✅ | Your Quirk API key |
| `PROXIFY_PRODUCT_ID` | ✅ | Your product ID |
| `PROXIFY_ENVIRONMENT` | ❌ | `production` \| `staging` \| `development` (default: `development`) |
| `PROXIFY_BASE_URL` | ❌ | Custom API URL (overrides environment) |
| `PROXIFY_WEBHOOK_SECRET` | ❌ | Webhook signature verification secret |

---

## 🧪 Testing

```bash
# Run type check
pnpm type-check

# Run tests (when implemented)
pnpm test
```

---

## 📚 Related Packages

- **@proxify/core** - Core business logic and types
- **@proxify/privy-client** - Privy wallet operations
- **@proxify/contract-executor-client** - Smart contract interactions

---

## 📝 License

MIT © Quirk Finance
