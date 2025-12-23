# @proxify/database

Type-safe database layer using SQLC (Quirk Pattern).

## 🎨 Architecture Pattern

This package follows the **Quirk TypeScript pattern** with clean separation:

```
SQLC Generated (Don't Edit)  →  Repository Layer (Your Code)  →  Service Layer
     ↓                              ↓                              ↓
Type-safe queries            Business logic + BigNumber      Orchestration
Auto-generated types         Transaction handling            Multi-repo coordination
```

## 📂 Structure

```
packages/database/
├── src/
│   ├── gen/                    # ✅ SQLC-generated (DON'T EDIT)
│   │   ├── index.ts           # Main exports
│   │   ├── models.ts          # Table types
│   │   ├── client_sql.ts      # Client queries
│   │   ├── deposit_sql.ts     # Deposit queries
│   │   ├── withdrawal_sql.ts  # Withdrawal queries
│   │   ├── vault_sql.ts       # Vault queries
│   │   ├── defi_sql.ts        # DeFi queries
│   │   ├── end_user_sql.ts    # User queries
│   │   └── audit_sql.ts       # Audit queries
│   │
│   └── repositories/           # ✅ Your code (wraps SQLC)
│       ├── vault.repository.ts
│       ├── client.repository.ts
│       ├── deposit.repository.ts
│       └── user.repository.ts
│
└── package.json
```

## 🚀 How It Works

### 1️⃣ SQLC Generates TypeScript Types & Functions

After running `make sqlc-generate`, SQLC creates type-safe query functions:

```typescript
// packages/database/src/gen/models.ts (AUTO-GENERATED)
export interface ClientVault {
  id: string;                    // uuid
  clientId: string;              // client_id (camelCase!)
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  totalShares: string;           // NUMERIC(78,0) as string
  currentIndex: string;          // NUMERIC(78,0) as string
  pendingDepositBalance: string;
  totalStakedBalance: string;
  cumulativeYield: string;
  apy7d: string | null;
  apy30d: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EndUserVault {
  id: string;
  endUserId: string;
  clientId: string;
  chain: string;
  tokenAddress: string;
  shares: string;                    // NUMERIC(78,0)
  weightedEntryIndex: string;        // NUMERIC(78,0)
  totalDeposited: string;
  totalWithdrawn: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2️⃣ SQLC Generates Query Functions

```typescript
// packages/database/src/gen/vault_sql.ts (AUTO-GENERATED)
import { Sql } from 'postgres';
import { ClientVault } from './models';

export interface GetClientVaultByTokenArgs {
  clientId: string;
  chain: string;
  tokenAddress: string;
}

export async function getClientVaultByToken(
  sql: Sql,
  args: GetClientVaultByTokenArgs
): Promise<ClientVault | null> {
  const query = `
    SELECT * FROM client_vaults
    WHERE client_id = $1 AND chain = $2 AND token_address = $3
    LIMIT 1
  `;
  const rows = await sql.unsafe(query, [args.clientId, args.chain, args.tokenAddress]).values();
  return rows.length > 0 ? rows[0] as ClientVault : null;
}
```

### 3️⃣ Repository Layer (Wraps SQLC with Business Logic)

**This is where you add your code** - business logic, BigNumber calculations, transactions:

```typescript
// packages/database/src/repositories/vault.repository.ts
import { Sql } from 'postgres';
import BigNumber from 'bignumber.js';

// Import SQLC-generated functions
import {
  getClientVaultByToken,
  type GetClientVaultByTokenArgs,
  type ClientVault,
} from '../gen/vault_sql';

export class VaultRepository {
  constructor(private readonly sql: Sql) {}

  /**
   * Get or create client vault
   * ✅ Uses SQLC-generated queries
   */
  async getOrCreateClientVault(
    clientId: string,
    chain: string,
    tokenAddress: string,
    tokenSymbol: string
  ): Promise<ClientVault> {
    // Try to get existing vault (SQLC-generated function)
    const existing = await getClientVaultByToken(this.sql, {
      clientId,
      chain,
      tokenAddress,
    });

    if (existing) {
      return existing;
    }

    // Create new vault with initial index = 1e18
    const result = await this.sql`
      INSERT INTO client_vaults (
        client_id, chain, token_address, token_symbol,
        current_index, total_shares
      ) VALUES (
        ${clientId}, ${chain}, ${tokenAddress}, ${tokenSymbol},
        ${'1000000000000000000'}, ${'0'}
      )
      RETURNING *
    `;

    return result[0] as ClientVault;
  }

  /**
   * Process deposit with share minting
   * ✅ Complex business logic + SQLC queries + Transaction
   */
  async depositWithShareMinting(
    endUserId: string,
    clientId: string,
    chain: string,
    tokenAddress: string,
    depositAmount: string // as string to preserve precision
  ): Promise<{ shares: string; entryIndex: string }> {
    return await this.sql.begin(async (tx) => {
      // 1. Lock and get client vault
      const vaults = await tx`
        SELECT * FROM client_vaults
        WHERE client_id = ${clientId}
          AND chain = ${chain}
          AND token_address = ${tokenAddress}
        FOR UPDATE
      `;

      if (vaults.length === 0) {
        throw new Error('Vault not found');
      }

      const vault = vaults[0];

      // 2. Calculate shares to mint (business logic)
      const currentIndex = new BigNumber(vault.current_index);
      const depositAmountBN = new BigNumber(depositAmount);
      const ONE_E18 = new BigNumber('1000000000000000000');

      // shares = depositAmount * 1e18 / currentIndex
      const sharesToMint = depositAmountBN
        .multipliedBy(ONE_E18)
        .dividedBy(currentIndex)
        .integerValue(BigNumber.ROUND_DOWN);

      // 3. Get or create user vault
      const userVaults = await tx`
        SELECT * FROM end_user_vaults
        WHERE end_user_id = ${endUserId}
          AND chain = ${chain}
          AND token_address = ${tokenAddress}
        FOR UPDATE
      `;

      let newWeightedIndex: BigNumber;
      let totalShares: BigNumber;

      if (userVaults.length === 0) {
        // First deposit - entry index = current index
        newWeightedIndex = currentIndex;
        totalShares = sharesToMint;

        await tx`
          INSERT INTO end_user_vaults (
            end_user_id, client_id, chain, token_address,
            shares, weighted_entry_index, total_deposited
          ) VALUES (
            ${endUserId}, ${clientId}, ${chain}, ${tokenAddress},
            ${sharesToMint.toString()}, ${newWeightedIndex.toString()}, ${depositAmount}
          )
        `;
      } else {
        // Calculate weighted entry index (DCA support)
        const userVault = userVaults[0];
        const oldShares = new BigNumber(userVault.shares);
        const oldWeightedIndex = new BigNumber(userVault.weighted_entry_index);

        totalShares = oldShares.plus(sharesToMint);

        // new_weighted = (old_shares * old_index + new_shares * current_index) / total_shares
        const numerator = oldShares
          .multipliedBy(oldWeightedIndex)
          .plus(sharesToMint.multipliedBy(currentIndex));

        newWeightedIndex = numerator
          .dividedBy(totalShares)
          .integerValue(BigNumber.ROUND_DOWN);

        await tx`
          UPDATE end_user_vaults
          SET shares = ${totalShares.toString()},
              weighted_entry_index = ${newWeightedIndex.toString()},
              total_deposited = total_deposited + ${depositAmount}
          WHERE id = ${userVault.id}
        `;
      }

      // 4. Update client vault
      await tx`
        UPDATE client_vaults
        SET total_shares = total_shares + ${sharesToMint.toString()},
            pending_deposit_balance = pending_deposit_balance + ${depositAmount}
        WHERE id = ${vault.id}
      `;

      return {
        shares: sharesToMint.toString(),
        entryIndex: newWeightedIndex.toString(),
      };
    });
  }

  /**
   * Update vault index after yield accrual
   * ✅ Business logic + SQLC queries
   */
  async updateVaultIndexWithYield(
    clientId: string,
    chain: string,
    tokenAddress: string,
    yieldEarned: string
  ): Promise<void> {
    await this.sql.begin(async (tx) => {
      // 1. Lock vault
      const vaults = await tx`
        SELECT * FROM client_vaults
        WHERE client_id = ${clientId}
          AND chain = ${chain}
          AND token_address = ${tokenAddress}
        FOR UPDATE
      `;

      if (vaults.length === 0) {
        throw new Error('Vault not found');
      }

      const vault = vaults[0];

      // 2. Calculate new index
      const oldIndex = new BigNumber(vault.current_index);
      const totalStaked = new BigNumber(vault.total_staked_balance);
      const yieldBN = new BigNumber(yieldEarned);
      const ONE_E18 = new BigNumber('1000000000000000000');

      if (totalStaked.isZero()) {
        return;
      }

      // growth_rate = yieldEarned / totalStaked
      const growthRate = yieldBN.multipliedBy(ONE_E18).dividedBy(totalStaked);

      // new_index = old_index * (1 + growth_rate)
      const newIndex = oldIndex.plus(
        oldIndex.multipliedBy(growthRate).dividedBy(ONE_E18)
      );

      // 3. Update index
      await tx`
        UPDATE client_vaults
        SET current_index = ${newIndex.toString()},
            cumulative_yield = cumulative_yield + ${yieldBN.toString()},
            total_staked_balance = total_staked_balance + ${yieldBN.toString()},
            last_yield_update = NOW()
        WHERE id = ${vault.id}
      `;
    });
  }
}
```

### 4️⃣ Service Layer (Orchestrates Multiple Repositories)

```typescript
// packages/core/src/services/deposit.service.ts
import { VaultRepository } from '@proxify/database/repositories/vault.repository';
import { UserRepository } from '@proxify/database/repositories/user.repository';
import { DepositRepository } from '@proxify/database/repositories/deposit.repository';

export class DepositService {
  constructor(
    private readonly vaultRepo: VaultRepository,
    private readonly userRepo: UserRepository,
    private readonly depositRepo: DepositRepository
  ) {}

  /**
   * Process external deposit from payment gateway
   */
  async processExternalDeposit(params: {
    clientId: string;
    userId: string;
    cryptoAmount: string;
    chain: string;
    tokenAddress: string;
    gatewayOrderId: string;
  }): Promise<void> {
    // 1. Get or create user
    const user = await this.userRepo.getOrCreateUser(
      params.clientId,
      params.userId
    );

    // 2. Mint shares and update vaults
    await this.vaultRepo.depositWithShareMinting(
      user.id,
      params.clientId,
      params.chain,
      params.tokenAddress,
      params.cryptoAmount
    );

    // 3. Create deposit transaction record
    await this.depositRepo.createDeposit({
      clientId: params.clientId,
      userId: params.userId,
      cryptoAmount: params.cryptoAmount,
      gatewayOrderId: params.gatewayOrderId,
      status: 'completed',
    });
  }
}
```

### 5️⃣ API Handler (Next.js Example)

```typescript
// apps/web/app/api/deposits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { VaultRepository } from '@proxify/database/repositories/vault.repository';
import { DepositService } from '@proxify/core/services/deposit.service';

// Database connection pool (singleton)
const sql = postgres(process.env.DATABASE_URL!, { max: 20 });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Initialize repositories
    const vaultRepo = new VaultRepository(sql);
    const userRepo = new UserRepository(sql);
    const depositRepo = new DepositRepository(sql);

    // Initialize service
    const depositService = new DepositService(vaultRepo, userRepo, depositRepo);

    // Process deposit
    await depositService.processExternalDeposit({
      clientId: body.client_id,
      userId: body.user_id,
      cryptoAmount: body.amount,
      chain: body.chain,
      tokenAddress: body.token_address,
      gatewayOrderId: body.gateway_order_id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    );
  }
}
```

### 6️⃣ React Hook for Frontend

```typescript
// apps/web/hooks/useUserBalance.ts
import useSWR from 'swr';
import BigNumber from 'bignumber.js';

interface UserBalance {
  balance: string;
  yieldEarned: string;
  apy: string;
  shares: string;
  loading: boolean;
  error: any;
}

export function useUserBalance(
  userId: string,
  chain: string = 'ethereum',
  token: string = 'USDC'
): UserBalance {
  const { data, error } = useSWR(
    `/api/users/${userId}/balance?chain=${chain}&token=${token}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch balance');
      return res.json();
    },
    { refreshInterval: 5000 } // Refresh every 5 seconds
  );

  // Format for display
  const balance = data
    ? new BigNumber(data.effectiveBalance).dividedBy('1e18').toFixed(2)
    : '0.00';

  const yieldEarned = data
    ? new BigNumber(data.yieldEarned).dividedBy('1e18').toFixed(2)
    : '0.00';

  return {
    balance,
    yieldEarned,
    apy: data?.apy7d || '0.00',
    shares: data?.shares || '0',
    loading: !data && !error,
    error,
  };
}
```

### 7️⃣ React Component

```typescript
// apps/web/components/UserBalance.tsx
import { useUserBalance } from '@/hooks/useUserBalance';

export function UserBalance({ userId }: { userId: string }) {
  const { balance, yieldEarned, apy, loading } = useUserBalance(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Your Balance</h2>
      <div className="balance">
        <span className="amount">${balance}</span>
        <span className="currency">USDC</span>
      </div>
      <div className="yield">
        <span>Yield Earned: ${yieldEarned}</span>
        <span>APY: {apy}%</span>
      </div>
    </div>
  );
}
```

## 📦 Installation

```bash
# Install dependencies
cd packages/database
pnpm add postgres bignumber.js

# Install types
pnpm add -D @types/pg
```

## 🎯 Key Quirk Patterns

### ✅ Pattern 1: SQLC Does the Heavy Lifting

```typescript
// Generated by SQLC - type-safe, no manual SQL strings!
import { getClientVaultByToken } from '@proxify/database/gen/vault_sql';

const vault = await getClientVaultByToken(sql, {
  clientId: 'client-123',
  chain: 'ethereum',
  tokenAddress: '0x...',
});
```

### ✅ Pattern 2: Repository Adds Business Logic

```typescript
class VaultRepository {
  // Wraps SQLC with complex calculations
  async depositWithShareMinting(...) {
    return await this.sql.begin(async (tx) => {
      // 1. Use SQLC queries / raw SQL
      // 2. Add BigNumber calculations
      // 3. Handle transactions
      // 4. Return domain objects
    });
  }
}
```

### ✅ Pattern 3: Service Orchestrates

```typescript
class DepositService {
  constructor(
    private vaultRepo: VaultRepository,
    private userRepo: UserRepository,
    private depositRepo: DepositRepository
  ) {}

  // Coordinates multiple repos
  async processDeposit(...) {
    await this.userRepo.getOrCreateUser(...);
    await this.vaultRepo.depositWithShareMinting(...);
    await this.depositRepo.createDeposit(...);
  }
}
```

### ✅ Pattern 4: Type Safety Everywhere

```typescript
// SQLC-generated types flow through entire stack:
ClientVault (DB) → Repository → Service → API → React Component
```

## 📂 Final Project Structure

```
packages/
├── database/
│   ├── src/
│   │   ├── gen/                    # ✅ SQLC-generated (DON'T EDIT)
│   │   │   ├── index.ts
│   │   │   ├── models.ts
│   │   │   ├── vault_sql.ts
│   │   │   ├── client_sql.ts
│   │   │   └── ...
│   │   └── repositories/           # ✅ Your code (wraps SQLC)
│   │       ├── vault.repository.ts
│   │       ├── client.repository.ts
│   │       ├── deposit.repository.ts
│   │       └── user.repository.ts
│   └── package.json
│
├── core/
│   └── src/
│       └── services/               # ✅ Business logic
│           ├── deposit.service.ts
│           ├── withdrawal.service.ts
│           └── yield.service.ts

apps/
├── web/                            # Next.js App
│   ├── app/
│   │   └── api/                   # ✅ API routes
│   │       ├── deposits/route.ts
│   │       ├── withdrawals/route.ts
│   │       └── users/[id]/balance/route.ts
│   ├── hooks/                     # ✅ React hooks
│   │   ├── useUserBalance.ts
│   │   └── useDeposit.ts
│   └── components/                # ✅ React components
│       └── UserBalance.tsx
```

## 🔄 Development Workflow

### 1. Modify SQL Queries

Edit files in `database/queries/*.sql`:

```sql
-- name: GetClientVaultByToken :one
SELECT * FROM client_vaults
WHERE client_id = $1 AND chain = $2 AND token_address = $3
LIMIT 1;

-- name: CreateDeposit :one
INSERT INTO deposit_transactions (
  client_id, user_id, crypto_amount, status
) VALUES ($1, $2, $3, $4)
RETURNING *;
```

### 2. Regenerate Code

```bash
make sqlc-generate
```

This updates `packages/database/src/gen/*` with new types and functions.

### 3. Update Repositories

Use the new generated functions in your repository layer:

```typescript
import { getClientVaultByToken } from '@proxify/database/gen/vault_sql';

class VaultRepository {
  async getVault(clientId: string, chain: string, token: string) {
    return await getClientVaultByToken(this.sql, { clientId, chain, tokenAddress: token });
  }
}
```

## 🧪 Testing

```typescript
import postgres from 'postgres';
import { VaultRepository } from '@proxify/database/repositories/vault.repository';

const sql = postgres('postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev');
const vaultRepo = new VaultRepository(sql);

// Test deposit
const result = await vaultRepo.depositWithShareMinting(
  'user-123',
  'client-123',
  'ethereum',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '1000000000' // $1000 USDC (6 decimals)
);

console.log('Shares minted:', result.shares);
console.log('Entry index:', result.entryIndex);

await sql.end();
```

## � Common Patterns

### Transaction Pattern

```typescript
async depositWithTransaction(params) {
  return await this.sql.begin(async (tx) => {
    // All queries use `tx` instead of `this.sql`
    const vault = await tx`SELECT * FROM client_vaults WHERE id = ${id} FOR UPDATE`;
    
    // Complex calculations
    const shares = calculateShares(vault, params.amount);
    
    // Update multiple tables
    await tx`UPDATE client_vaults SET total_shares = ${shares} WHERE id = ${id}`;
    await tx`INSERT INTO end_user_vaults (...) VALUES (...)`;
    
    // Both succeed or both roll back
    return { success: true };
  });
}
```

### BigNumber Pattern

```typescript
import BigNumber from 'bignumber.js';

// Always use BigNumber for NUMERIC(78,0) calculations
const currentIndex = new BigNumber(vault.current_index);
const depositAmount = new BigNumber(params.amount);
const ONE_E18 = new BigNumber('1000000000000000000');

// shares = amount * 1e18 / index
const shares = depositAmount
  .multipliedBy(ONE_E18)
  .dividedBy(currentIndex)
  .integerValue(BigNumber.ROUND_DOWN);

// Convert back to string for database
await sql`INSERT INTO end_user_vaults (shares) VALUES (${shares.toString()})`;
```

### Error Handling Pattern

```typescript
class VaultRepository {
  async getVault(id: string): Promise<ClientVault> {
    const vaults = await this.sql`SELECT * FROM client_vaults WHERE id = ${id}`;
    
    if (vaults.length === 0) {
      throw new Error(`Vault not found: ${id}`);
    }
    
    return vaults[0] as ClientVault;
  }
}
```

## 🚀 Next Steps

1. **Create Repository Classes** - Start with `VaultRepository`, `ClientRepository`
2. **Add Business Logic** - Implement share minting, index updates, yield calculations
3. **Build Service Layer** - Create `DepositService`, `WithdrawalService`, `YieldService`
4. **Create API Routes** - Next.js API routes or Express endpoints
5. **Add Integration Tests** - Test with real database

## 📖 Related Documentation

- **QUICK_START.md** - Quick reference guide
- **database/migrations/** - Database schema
- **database/queries/** - SQL query definitions
- **packages/core/entity/** - Domain entities

---

**This pattern is production-proven by Quirk and provides:**

✅ **Type Safety** - Catch errors at compile time  
✅ **Clean Architecture** - Clear separation of concerns  
✅ **Performance** - No ORM overhead, direct SQL  
✅ **Maintainability** - SQLC generates boilerplate  
✅ **Scalability** - BigNumber for precision, transactions for consistency

🚀 **Start building your repositories now!**

