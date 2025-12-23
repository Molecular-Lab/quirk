# B2B API Core Package

Type-safe API client and contracts for Quirk B2B services.

## Features

- 🔒 **Type-safe API client** using ts-rest
- 📝 **Zod schemas** for request/response validation
- 🎯 **Domain routers** for each service area
- 🔑 **Query key factory** for React Query integration
- 🚀 **Auto-complete** for all API methods

## Installation

```bash
pnpm add @proxify/b2b-api-core
```

## Usage

### Client Setup

```typescript
import axios from 'axios';
import { B2BAPIClient } from '@proxify/b2b-api-core';

const httpClient = axios.create();

const b2bApi = new B2BAPIClient(httpClient, {
  apiUrl: process.env.B2B_API_URL || 'http://localhost:3000'
});
```

### Using Domain Routers

```typescript
// Client operations
const client = await b2bApi.client.createClient({
  companyName: 'Acme Corp',
  businessType: 'FINTECH',
  walletType: 'MANAGED',
  privyOrganizationId: 'org_123'
});

// Vault operations
const vault = await b2bApi.vault.getOrCreateVault({
  clientId: client.id,
  tokenSymbol: 'USDC',
  tokenAddress: '0x...',
  chainId: 1
});

// Deposit operations
const deposit = await b2bApi.deposit.createDeposit({
  clientId: client.id,
  userId: user.id,
  vaultId: vault.id,
  amount: '1000000000' // 1000 USDC (6 decimals)
});

// Get user portfolio
const portfolio = await b2bApi.user.getUserPortfolio(user.id);
```

### React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { b2bQueryKeys, B2BAPIClient } from '@proxify/b2b-api-core';

// Fetch client balance
const { data: balance } = useQuery({
  queryKey: b2bQueryKeys.client.balance(clientId),
  queryFn: () => b2bApi.client.getClientBalance(clientId)
});

// List user deposits
const { data: deposits } = useQuery({
  queryKey: b2bQueryKeys.deposit.byUser(userId, { limit: '10' }),
  queryFn: () => b2bApi.deposit.listDepositsByUser(userId, { limit: '10' })
});

// Create deposit mutation
const createDeposit = useMutation({
  mutationFn: (data) => b2bApi.deposit.createDeposit(data),
  onSuccess: () => {
    // Invalidate relevant queries
    queryClient.invalidateQueries({ 
      queryKey: b2bQueryKeys.deposit.byUser(userId) 
    });
  }
});
```

## Package Structure

```
b2b-api-core/
├── client/                  # API client implementation
│   ├── index.ts            # Main B2BAPIClient class
│   ├── rawClient.ts        # ts-rest client wrapper
│   ├── router.ts           # Base router class
│   └── routers/            # Domain-specific routers
│       ├── client.router.ts
│       ├── vault.router.ts
│       ├── user.router.ts
│       ├── user-vault.router.ts
│       ├── deposit.router.ts
│       └── withdrawal.router.ts
├── contracts/              # ts-rest contracts
│   ├── index.ts
│   ├── client.ts
│   ├── vault.ts
│   ├── user.ts
│   ├── user-vault.ts
│   ├── deposit.ts
│   └── withdrawal.ts
└── query-keys.ts           # React Query key factory
```

## API Domains

### Client Operations
- Create client organization
- Manage client balance (add, reserve, release, deduct funds)
- Get client stats

### Vault Operations
- Create/get vaults for different tokens
- Update vault index with yield
- Mark funds as staked
- List vaults ready for staking

### User Operations
- Create/get end users
- List users by client
- Get user portfolio across all vaults

### Deposit Operations
- Create deposit transactions
- Complete/fail deposits
- Get deposit statistics

### Withdrawal Operations
- Request withdrawals
- Complete/fail withdrawals
- Get withdrawal statistics

### User-Vault Balance
- Get user balance in specific vault
- List all users in a vault

## Error Handling

All router methods throw `APIError` on failure:

```typescript
import { APIError } from '@proxify/b2b-api-core';

try {
  await b2bApi.client.createClient(data);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}): ${error.message}`);
  }
}
```

## TypeScript Support

Full TypeScript support with inferred types from Zod schemas:

```typescript
// Types are automatically inferred
const vault = await b2bApi.vault.getVaultById('vault_123');
// vault is typed as VaultResponse | null

const deposits = await b2bApi.deposit.listDepositsByClient('client_123');
// deposits is typed as DepositResponse[]
```
