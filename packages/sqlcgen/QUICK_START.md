# 🚀 Quick Start: Using SQLC Generated Queries

## What Just Got Generated?

When you ran `make setup`, SQLC generated **type-safe TypeScript functions** from your SQL queries in `database/queries/*.sql`.

```
packages/database/src/gen/
├── client_sql.ts       ✅ Client operations
├── deposit_sql.ts      ✅ Deposit transactions  
├── withdrawal_sql.ts   ✅ Withdrawal transactions
├── vault_sql.ts        ✅ Vault & index management
├── defi_sql.ts         ✅ DeFi allocations
├── end_user_sql.ts     ✅ End user operations
└── audit_sql.ts        ✅ Audit logs
```

## 📦 Step 1: Install Database Client

```bash
cd packages/database
pnpm add postgres
```

## 💻 Step 2: Use in Your Code

### Example 1: Get Client by ID

```typescript
import postgres from 'postgres';
import { getClient } from '@proxify/database/gen/client_sql';

const sql = postgres('postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev');

// Type-safe query!
const client = await getClient(sql, { id: 'your-client-id' });

if (client) {
  console.log(client.companyName);  // ✅ TypeScript knows this field exists
  console.log(client.productId);    // ✅ Autocomplete works!
}
```

### Example 2: List User Deposits

```typescript
import { listUserDeposits } from '@proxify/database/gen/deposit_sql';

const deposits = await listUserDeposits(sql, { 
  userId: 'user_001',
  limit: 10 
});

deposits.forEach(d => {
  console.log(`${d.orderId}: $${d.fiatAmount} - ${d.status}`);
});
```

### Example 3: Get Current Vault Index

```typescript
import { getClientVaultIndex } from '@proxify/database/gen/vault_sql';

const vault = await getClientVaultIndex(sql, {
  clientId: 'client-123',
  chain: 'ethereum',
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
});

console.log('Current index:', vault?.currentIndex);
console.log('Total shares:', vault?.totalShares);
```

## 🔧 Step 3: Update Your Repository

Replace the stubbed methods in `packages/core/repository/b2b-client.repository.ts`:

### Before:
```typescript
export class ClientOrganizationRepository {
  async findById(id: string): Promise<ClientOrganization | null> {
    throw new Error('Not implemented - awaiting sqlc generation')
  }
}
```

### After:
```typescript
import postgres, { Sql } from 'postgres';
import { getClient } from '@proxify/database/gen/client_sql';

export class ClientOrganizationRepository {
  constructor(private sql: Sql) {}

  async findById(id: string): Promise<ClientOrganization | null> {
    const row = await getClient(this.sql, { id });
    if (!row) return null;

    return {
      id: row.id,
      productId: row.productId,
      companyName: row.companyName,
      businessType: row.businessType,
      walletType: row.walletType,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
```

## 📋 Available Functions Per File

### `client_sql.ts`
- `getClient(sql, { id })` - Get by UUID
- `getClientByProductID(sql, { productId })` - Get by product ID
- `getClientByAPIKeyPrefix(sql, { apiKeyPrefix })` - Get by API key
- `listClients(sql, { limit, offset })` - List all clients

### `deposit_sql.ts`
- `getDeposit(sql, { id })` - Get deposit by ID
- `getDepositByOrderID(sql, { orderId })` - Get by order ID
- `listUserDeposits(sql, { userId, limit })` - User's deposit history

### `vault_sql.ts`
- `getClientVaultIndex(sql, { clientId, chain, tokenAddress })` - Get vault index
- `listClientVaults(sql, { clientId })` - List all vaults for client

### `end_user_sql.ts`
- `getEndUser(sql, { clientId, userId })` - Get end user
- `getEndUserVault(sql, { clientId, userId, chain, tokenAddress })` - Get user vault with shares

### `defi_sql.ts`
- `listClientDefiAllocations(sql, { clientId })` - List DeFi allocations
- `getDefiAllocation(sql, { id })` - Get specific allocation

## 🔄 When to Regenerate

Regenerate code after modifying SQL queries:

```bash
# After editing database/queries/*.sql
make sqlc-generate
```

## 🧪 Test It Out

```bash
# Start database
make db-start

# Seed test data
make seed-test-client

# Connect to database
make db-connect

# In psql:
SELECT * FROM client_organizations;
```

Then use the generated functions to query that data!

## 🎯 Key Benefits

✅ **Type Safety** - Catch errors at compile time  
✅ **Autocomplete** - Your IDE knows all fields  
✅ **No SQL Injection** - Parameterized by default  
✅ **Performance** - No ORM overhead  
✅ **Refactoring** - Rename columns safely  

## 📚 Next Steps

1. Install `postgres` package
2. Replace stubbed repository methods
3. Add error handling and logging
4. Write integration tests
5. Build your API endpoints

Check `packages/database/README.md` for more detailed examples!
