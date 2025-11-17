# PostgreSQL Repository Layer

**Location:** `packages/core/repository/postgres/`

This folder contains PostgreSQL repositories following the **Cleverse Pattern** for the B2B platform.

## 📂 Structure

```
packages/core/repository/postgres/
├── client.repository.ts       # Client organization management
├── vault.repository.ts        # Index-based vault accounting
├── deposit.repository.ts      # Deposit transactions
├── withdrawal.repository.ts   # Withdrawal transactions
├── end_user.repository.ts     # End users & their vaults
├── defi.repository.ts         # DeFi protocol allocations
├── audit.repository.ts        # Audit trail logging
└── index.ts                   # Exports all repositories
```

## 🎯 Pattern

Each repository:
1. **Wraps SQLC-generated queries** from `packages/sqlcgen/src/gen/`
2. **Adds business logic** (BigNumber calculations, index updates)
3. **Manages transactions** (BEGIN/COMMIT/ROLLBACK)
4. **Enforces precision** (NUMERIC(78,0) handling)

## 📦 Usage

```typescript
import postgres from 'postgres';
import { 
  ClientRepository,
  VaultRepository,
  DepositRepository,
  UserRepository 
} from '@proxify/core/repository/postgres';

// Create database connection
const sql = postgres(process.env.DATABASE_URL!);

// Initialize repositories
const clientRepo = new ClientRepository(sql);
const vaultRepo = new VaultRepository(sql);
const depositRepo = new DepositRepository(sql);
const userRepo = new UserRepository(sql);

// Use repositories
const client = await clientRepo.getByProductId('grab_sg_001');
const vault = await vaultRepo.getClientVault(client.id, 'ethereum', '0x...');
```

## 🔄 SQLC Integration

These repositories use **SQLC-generated TypeScript** from:
- **Queries:** `database/queries/*.sql`
- **Generated code:** `packages/sqlcgen/src/gen/`
- **Config:** `sqlc.yaml`

### Regenerate SQLC code:
```bash
make sqlc-generate
```

## 🏗️ Repository Methods

### ClientRepository
- `getById(id)` - Get client by UUID
- `getByProductId(productId)` - Get by product ID
- `getByApiKeyPrefix(prefix)` - For API key validation
- `create(params)` - Create new client
- `update(id, params)` - Update client
- `listActive()` - List active clients

### VaultRepository
- `getClientVault(clientId, chain, token)` - Get vault
- `depositWithShareMinting(...)` - Process deposit with share minting
- `updateVaultIndexWithYield(...)` - Update index after yield
- `getUserBalanceWithYield(...)` - Calculate user balance
- `movePendingToStaked(...)` - Move funds to staked

### DepositRepository
- `getByOrderId(orderId)` - Get deposit
- `listByUser(clientId, userId)` - User's deposit history
- `create(params)` - Create deposit transaction
- `markCompleted(orderId, ...)` - Mark deposit complete
- `markFailed(orderId, ...)` - Mark deposit failed

### WithdrawalRepository
- `getByOrderId(orderId)` - Get withdrawal
- `listQueuedForProcessing()` - Get queue
- `create(params)` - Create withdrawal
- `moveToQueue(orderId, ...)` - Add to queue
- `assignToBatch(orderId, batchId)` - Batch processing
- `markCompleted(orderId, txHash)` - Mark complete

### UserRepository (End Users)
- `getByClientAndUserId(clientId, userId)` - Get user
- `getOrCreate(params)` - Idempotent user creation
- `getUserVault(userId, chain, token)` - Get user vault
- `getUserBalanceWithYield(...)` - Calculate balance with yield
- `updateUserVaultShares(...)` - Update shares

### DefiRepository
- `listProtocols()` - List supported DeFi protocols
- `listAllocationsByClient(clientId)` - Client's allocations
- `createAllocation(params)` - Create DeFi allocation
- `updateAllocationBalances(...)` - After rebalancing
- `listAllocationsNeedingRebalance()` - Check rebalancing

### AuditRepository
- `create(params)` - Create audit log
- `listByClient(clientId)` - Client's audit trail
- `listByAction(clientId, action)` - Filter by action
- `logDeposit(...)` - Log deposit action
- `logWithdrawal(...)` - Log withdrawal action

## 🔑 Key Features

### ✅ Index-Based Accounting
```typescript
// VaultRepository handles index calculations
const result = await vaultRepo.depositWithShareMinting(
  userId,
  clientId,
  'ethereum',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '1000000000' // $1000 (6 decimals)
);

console.log('Shares minted:', result.shares);
console.log('Entry index:', result.entryIndex);
```

### ✅ Transaction Safety
```typescript
// Repositories use transactions internally
await vaultRepo.depositWithShareMinting(...); // Wrapped in BEGIN/COMMIT
```

### ✅ BigNumber Precision
```typescript
// All NUMERIC(78,0) calculations use BigNumber
const shares = new BigNumber(amount)
  .multipliedBy('1000000000000000000')
  .dividedBy(currentIndex)
  .integerValue(BigNumber.ROUND_DOWN);
```

### ✅ Type Safety
```typescript
// SQLC generates TypeScript types
interface ClientVault {
  id: string;
  clientId: string;
  currentIndex: string;  // NUMERIC(78,0) as string
  totalShares: string;
  // ... more fields
}
```

## 📚 Related Documentation

- **SQLC Configuration:** `sqlc.yaml`
- **Database Schema:** `database/migrations/`
- **SQL Queries:** `database/queries/`
- **Cleverse Pattern:** `packages/database/CLEVERSE_PATTERN.md`
- **Architecture:** `packages/database/README.md`

## 🚀 Next Steps

1. **Install dependencies:**
   ```bash
   cd packages/core
   pnpm add postgres bignumber.js
   ```

2. **Generate SQLC code:**
   ```bash
   make sqlc-generate
   ```

3. **Use repositories in services:**
   ```typescript
   // packages/core/src/services/deposit.service.ts
   export class DepositService {
     constructor(
       private vaultRepo: VaultRepository,
       private depositRepo: DepositRepository
     ) {}
   }
   ```

4. **Create API endpoints:**
   ```typescript
   // apps/web/app/api/deposits/route.ts
   const depositService = new DepositService(vaultRepo, depositRepo);
   ```

---

**This follows the production-proven Cleverse pattern!** 🎉
