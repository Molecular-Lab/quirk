# B2B API Client Migration Guide

## Type-Safe Client Implementation ✅

The b2bClient has been refactored to use `@ts-rest/core` for **full TypeScript type safety**, matching the pattern from `prod-ref-web` (Arken client).

---

## What Changed?

### Before (No Type Safety ❌)

```typescript
import { b2bApiClient } from "@/api/b2bClient"

// ❌ data is typed as 'unknown'
const data = await b2bApiClient.registerClient({ ... })

// ❌ No autocomplete, no type checking
console.log(data.id) // TypeScript doesn't know if 'id' exists
```

### After (Full Type Safety ✅)

```typescript
import { b2bApiClient } from "@/api/b2bClient"

// ✅ status and body are fully typed
const { status, body } = await b2bApiClient.client.register({ body: { ... } })

if (status === 200) {
  // ✅ TypeScript knows body.id, body.productId, body.apiKey, etc.
  console.log(body.id)       // ✅ Autocomplete works!
  console.log(body.productId) // ✅ Type-safe!
}
```

---

## Migration Patterns

### Pattern 1: Client Endpoints

#### OLD:
```typescript
const data = await b2bApiClient.registerClient({
  companyName: "Grab",
  businessType: "ride-hailing",
  walletType: "MANAGED",
  privyOrganizationId: "did:privy:xxx",
})
```

#### NEW:
```typescript
const { status, body } = await b2bApiClient.client.create({
  body: {
    companyName: "Grab",
    businessType: "ride-hailing",
    walletType: "MANAGED",
    privyOrganizationId: "did:privy:xxx",
  }
})

if (status === 201) {
  // ✅ body is typed as ClientDto
  console.log(body.productId)
  console.log(body.apiKey)
}
```

### Pattern 2: List Endpoints

#### OLD:
```typescript
const data = await b2bApiClient.listOrganizationsByPrivyId(privyOrgId)
```

#### NEW:
```typescript
const { status, body } = await b2bApiClient.client.listByPrivyOrgId({
  params: { privyOrganizationId: privyOrgId }
})

if (status === 200) {
  // ✅ body is typed as array of clients
  body.forEach(client => {
    console.log(client.id)       // ✅ Autocomplete!
    console.log(client.productId)
  })
}
```

### Pattern 3: Update Endpoints

#### OLD:
```typescript
const data = await b2bApiClient.updateOrganizationInfo(productId, {
  companyName: "New Name",
  description: "Updated description"
})
```

#### NEW:
```typescript
const { status, body } = await b2bApiClient.client.updateOrganizationInfo({
  params: { productId },
  body: {
    companyName: "New Name",
    description: "Updated description"
  }
})

if (status === 200) {
  // ✅ body is fully typed
  console.log(body.success)
}
```

### Pattern 4: Deposits

#### OLD:
```typescript
const data = await b2bApiClient.mockConfirmFiatDeposit(orderId, {
  bankTransactionId: "TXN123",
  paidAmount: "100",
  paidCurrency: "USD"
})
```

#### NEW:
```typescript
const { status, body } = await b2bApiClient.deposit.mockConfirmFiatDeposit({
  params: { orderId },
  body: {
    bankTransactionId: "TXN123",
    paidAmount: "100",
    paidCurrency: "USD"
  }
})

if (status === 200) {
  // ✅ body.orderId, body.cryptoAmount, etc. are all typed!
  console.log(body.cryptoAmount)
}
```

### Pattern 5: Dashboard Metrics

#### OLD:
```typescript
const data = await b2bApiClient.getDashboardMetrics(clientId)
```

#### NEW:
```typescript
const { status, body } = await b2bApiClient.dashboard.getMetrics({
  query: { clientId }
})

if (status === 200) {
  // ✅ Full type safety for dashboard metrics
  console.log(body.fundStages.available)
  console.log(body.revenue.clientShare)
  console.log(body.stats.activeUsers)
}
```

---

## API Structure

The new client follows the ts-rest contract structure:

```typescript
b2bApiClient.{route}.{method}({
  params: { ... },  // URL parameters (e.g., /clients/:id)
  query: { ... },   // Query parameters (e.g., ?clientId=xxx)
  body: { ... },    // Request body
})
```

### Available Routes:

- `b2bApiClient.client.*` - Client/organization management
- `b2bApiClient.privyAccount.*` - Privy account endpoints
- `b2bApiClient.deposit.*` - Deposit operations
- `b2bApiClient.withdrawal.*` - Withdrawal operations
- `b2bApiClient.user.*` - User management
- `b2bApiClient.vault.*` - Vault operations
- `b2bApiClient.dashboard.*` - Dashboard metrics
- `b2bApiClient.userVault.*` - User vault operations
- `b2bApiClient.defiProtocol.*` - DeFi protocol metrics

---

## Helper Functions (Recommended)

For convenience, use the helper functions in `b2bClientHelpers.ts`:

```typescript
import {
  registerClient,
  listOrganizationsByPrivyId,
  getDashboardMetrics,
  createFiatDeposit,
  batchCompleteDeposits
} from "@/api/b2bClientHelpers"

// ✅ Clean API with full type safety
const client = await registerClient({
  companyName: "Grab",
  businessType: "ride-hailing",
  walletType: "MANAGED",
  privyOrganizationId: "did:privy:xxx",
})

const orgs = await listOrganizationsByPrivyId(privyOrgId)

const metrics = await getDashboardMetrics(clientId)
```

---

## React Hook Migration

### OLD:
```typescript
// Custom hook with manual typing
const { mutateAsync: registerClient } = useMutation({
  mutationFn: async (data: RegisterClientData) => {
    const result = await b2bApiClient.registerClient(data)
    return result as RegisterClientResponse // ❌ Manual typing
  }
})
```

### NEW:
```typescript
// Automatic type inference from contract
const { mutateAsync: registerClient } = useMutation({
  mutationFn: async (data: RegisterClientData) => {
    const { status, body } = await b2bApiClient.client.create({ body: data })

    if (status === 201) {
      return body // ✅ Already typed correctly!
    }

    throw new Error("Registration failed")
  }
})
```

---

## Benefits of New Approach

1. **Full Type Safety**: Every response is typed based on the ts-rest contract
2. **Autocomplete**: IDE autocomplete for all response properties
3. **Compile-Time Checks**: TypeScript catches errors before runtime
4. **Status Code Handling**: Explicit status checking encourages proper error handling
5. **Consistent Pattern**: Matches prod-ref-web (Arken) implementation
6. **Contract-First**: API contract lives in `@proxify/b2b-api-core` (single source of truth)

---

## Example: Complete Flow with Type Safety

```typescript
import { b2bApiClient } from "@/api/b2bClient"

// 1. Register client
const { status: regStatus, body: client } = await b2bApiClient.client.create({
  body: {
    companyName: "Grab",
    businessType: "ride-hailing",
    walletType: "MANAGED",
    privyOrganizationId: "did:privy:xxx",
    privyWalletAddress: "0x123...",
  }
})

if (regStatus !== 201) {
  throw new Error("Registration failed")
}

// ✅ client.productId is typed as string
const productId = client.productId

// 2. Create deposit
const { status: depStatus, body: deposit } = await b2bApiClient.deposit.createFiatDeposit({
  body: {
    userId: "user123",
    amount: "100",
    currency: "USD",
    tokenSymbol: "USDC"
  }
})

if (depStatus !== 201) {
  throw new Error("Deposit failed")
}

// ✅ deposit.orderId, deposit.paymentInstructions, etc. are all typed!
console.log(deposit.orderId)
console.log(deposit.paymentInstructions.bankName)

// 3. Get dashboard metrics
const { status: dashStatus, body: metrics } = await b2bApiClient.dashboard.getMetrics({
  query: { clientId: productId }
})

if (dashStatus === 200) {
  // ✅ Full autocomplete for metrics
  console.log(metrics.fundStages.available)
  console.log(metrics.revenue.clientShare)
  console.log(metrics.stats.activeUsers)
}
```

---

## Testing Your Migration

Run TypeScript compilation to catch any issues:

```bash
pnpm --filter whitelabel-web build
```

TypeScript will show errors for any incorrect usage, making migration safe and predictable.

---

## Need Help?

Check the reference implementation:
- **Pattern**: `apps/prod-ref-web/src/api/core.ts` (Arken client)
- **Helpers**: `apps/whitelabel-web/src/api/b2bClientHelpers.ts`
- **Contract**: `packages/b2b-api-core/` (ts-rest contract definition)

All responses are now **fully typed** based on the contract! 🎉
