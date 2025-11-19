# B2B DTO Layer

This folder contains all Data Transfer Objects (DTOs) for API ↔ UseCase layer communication in the B2B system.

## Purpose

DTOs define the contract between the API layer (HTTP controllers) and the business logic layer (UseCases). They ensure:
- Type safety for API requests and responses
- Clear separation from domain entities (database models)
- Centralized type definitions (no inline interfaces in usecases)
- Easy API versioning and contract evolution

## Architecture

```
HTTP Request
    ↓
Controller (validates & transforms)
    ↓
DTO (type-safe request)
    ↓
UseCase (business logic)
    ↓
Repository (data access)
    ↓
Entity (database model)
```

## DTO Categories

### 1. Client Management (`client.dto.ts`)
**Purpose**: Client account and balance operations

**Types**:
- `CreateClientRequest` - Create new B2B client account
- `AddFundsRequest` - Add funds to client balance
- `ReserveFundsRequest` - Reserve funds for withdrawal
- `ReleaseFundsRequest` - Release reserved funds (cancel)
- `DeductReservedRequest` - Deduct reserved funds (complete withdrawal)

**Usage Example**:
```typescript
import { AddFundsRequest } from '@proxify/core';

const request: AddFundsRequest = {
  clientId: 'client_123',
  amount: '1000.00',
  source: 'bank_transfer',
  reference: 'TX-12345'
};

await b2bClientUseCase.addFunds(request);
```

---

### 2. Vault Management (`vault.dto.ts`)
**Purpose**: Vault creation and strategy configuration

**Types**:
- `CreateVaultRequest` - Create client or end-user vault
- `VaultStrategyConfig` - DeFi strategy configuration
- `ConfigureStrategiesRequest` - Update vault strategies
- `UpdateIndexRequest` - Update vault index with yield
- `MarkFundsAsStakedRequest` - Mark funds as deployed to DeFi

**Usage Example**:
```typescript
import { CreateVaultRequest } from '@proxify/core';

const request: CreateVaultRequest = {
  clientId: 'client_123',
  chain: 'polygon',
  tokenAddress: '0x...',
  tokenSymbol: 'USDC',
  tokenDecimals: 6,
  vaultType: 'client_vault'
};

const vault = await b2bVaultUseCase.getOrCreateVault(request);
```

---

### 3. User Management (`user.dto.ts`)
**Purpose**: End-user account operations

**Types**:
- `CreateUserRequest` - Create end-user account
- `GetUserPortfolioRequest` - Get user's portfolio across all vaults
- `ListUsersByClientRequest` - List all users for a client

**Usage Example**:
```typescript
import { CreateUserRequest } from '@proxify/core';

const request: CreateUserRequest = {
  clientId: 'client_123',
  userId: 'user_456',
  userType: 'individual',
  userWalletAddress: '0x...',
  metadata: { kycStatus: 'verified' }
};

const user = await b2bUserUseCase.getOrCreateUser(request);
```

---

### 4. User Vault Queries (`user-vault.dto.ts`)
**Purpose**: User balance and portfolio queries

**Types**:
- `UserBalanceRequest` - Query user balance for specific vault
- `UserBalanceResponse` - Balance with yield calculation
- `UserPortfolioResponse` - Complete user portfolio
- `ListVaultUsersRequest` - List all users in a vault

**Response Structure**:
```typescript
interface UserBalanceResponse {
  userId: string;
  clientId: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  
  // Balance calculation (index-based)
  totalDeposited: string;
  totalWithdrawn: string;
  effectiveBalance: string; // shares × current_index / 1e18
  yieldEarned: string;      // effective_balance - total_deposited
  
  // Vault metrics
  shares: string;
  weightedEntryIndex: string;
  currentIndex: string;
  apy7d: string | null;
  apy30d: string | null;
  
  // Status
  isActive: boolean;
  lastDepositAt: Date | null;
  lastWithdrawalAt: Date | null;
}
```

---

### 5. Deposit Operations (`deposit.dto.ts`)
**Purpose**: Deposit transaction lifecycle

**Types**:
- `CreateDepositRequest` - Initiate deposit
- `CompleteDepositRequest` - Mark deposit as completed
- `FailDepositRequest` - Mark deposit as failed
- `GetDepositStatsRequest` - Query deposit statistics

**Deposit Flow**:
```typescript
// 1. Create deposit
const deposit = await b2bDepositUseCase.createDeposit({
  clientId: 'client_123',
  userId: 'user_456',
  fiatCurrency: 'USD',
  fiatAmount: '100.00',
  cryptoCurrency: 'USDC',
  depositType: 'external',
  gatewayProvider: 'stripe',
  gatewayOrderId: 'ord_xyz'
});

// 2. Complete deposit (webhook callback)
await b2bDepositUseCase.completeDeposit({
  orderId: deposit.orderId,
  chain: 'polygon',
  tokenAddress: '0x...',
  tokenSymbol: 'USDC',
  cryptoAmount: '99.50', // after fees
  gatewayFee: '0.30',
  proxifyFee: '0.10',
  networkFee: '0.10',
  totalFees: '0.50'
});
```

---

### 6. Withdrawal Operations (`withdrawal.dto.ts`)
**Purpose**: Withdrawal transaction lifecycle

**Types**:
- `CreateWithdrawalRequest` - Request withdrawal
- `WithdrawalResponse` - Withdrawal details
- `CompleteWithdrawalRequest` - Mark withdrawal completed
- `FailWithdrawalRequest` - Mark withdrawal failed
- `GetWithdrawalStatsRequest` - Query withdrawal statistics

**Withdrawal Flow**:
```typescript
// 1. Request withdrawal
const withdrawal = await b2bWithdrawalUseCase.requestWithdrawal({
  clientId: 'client_123',
  userId: 'user_456',
  chain: 'polygon',
  tokenAddress: '0x...',
  amount: '50.00',
  orderId: 'wd_xyz',
  destinationType: 'bank_account',
  destinationDetails: { accountId: 'acc_123' }
});

// 2. Complete withdrawal (after processing)
await b2bWithdrawalUseCase.completeWithdrawal({
  orderId: 'wd_xyz',
  actualAmount: '49.50',
  txHash: '0x...',
  completedAt: new Date()
});
```

---

## Import Patterns

### In UseCases
```typescript
import type {
  CreateVaultRequest,
  UpdateIndexRequest,
  ConfigureStrategiesRequest,
} from '../../dto/b2b';
```

### In Controllers (App Layer)
```typescript
import type { CreateDepositRequest } from '@proxify/core';

// Controller validates and transforms HTTP request to DTO
app.post('/deposits', async (req, res) => {
  const request: CreateDepositRequest = {
    clientId: req.user.clientId,
    userId: req.body.userId,
    fiatCurrency: req.body.currency,
    fiatAmount: req.body.amount,
    cryptoCurrency: req.body.crypto,
    depositType: 'external',
    gatewayProvider: 'stripe',
    gatewayOrderId: req.body.orderId
  };
  
  const deposit = await b2bDepositUseCase.createDeposit(request);
  res.json(deposit);
});
```

---

## DTO vs Entity

| Aspect | DTO | Entity |
|--------|-----|--------|
| **Purpose** | API contracts | Database models |
| **Location** | `dto/b2b/` | `entity/` |
| **Used by** | Controllers ↔ UseCases | UseCases ↔ Repositories |
| **Fields** | API-friendly names | Database column names |
| **Validation** | API layer | Database layer |
| **Examples** | `CreateDepositRequest` | `DepositTransaction` |

---

## Naming Conventions

- **Request types**: `Create*Request`, `Update*Request`, `Get*Request`, `Complete*Request`, `Fail*Request`
- **Response types**: `*Response` (e.g., `UserBalanceResponse`, `WithdrawalResponse`)
- **File names**: `*.dto.ts` (e.g., `client.dto.ts`, `vault.dto.ts`)
- **No `I` prefix**: Use `CreateClientRequest`, not `ICreateClientRequest`

---

## Best Practices

1. **Keep DTOs simple**: Only fields needed for API communication
2. **No business logic**: DTOs are pure data structures
3. **Use string for numbers**: Avoid precision issues with `amount: string`
4. **Optional fields**: Use `?` for optional properties
5. **Type imports**: Use `import type` for better tree-shaking
6. **Documentation**: Add comments for complex fields or calculations

---

## Future Enhancements

- Add request validation schemas (Zod/Yup)
- Generate OpenAPI specs from DTOs
- Add DTO transformation utilities
- Create request/response builders
- Add deprecation markers for API versioning

---

## Related Documentation

- [UseCases README](../usecase/b2b/README.md)
- [Repository README](../repository/README.md)
- [Entity README](../entity/README.md)
- [System Architecture](../../../../docs/SYSTEM_ARCHITECTURE.md)
