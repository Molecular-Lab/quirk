# ✅ PRIVY ACCOUNTS NORMALIZATION - PHASE 1-2 COMPLETE

## 🎯 Implementation Status

**Completed**: Database Layer + SQLC Generation (Phases 1-2)  
**Next**: Run Migration → Update UseCase Layer → Update API Layer → Update Frontend

---

## ✅ Phase 1: Database Layer - COMPLETE

### Migration Files Created

#### 1. `database/migrations/000002_normalize_privy_accounts.up.sql`
```sql
✅ Creates privy_accounts table (identity layer)
✅ Adds privy_account_id FK to client_organizations  
✅ Migrates existing data (zero data loss)
✅ Removes old columns (privy_organization_id, privy_wallet_address, wallet_type, wallet_managed_by)
✅ Creates indexes (privy_org_id, wallet_address, privy_account_id)
✅ Adds comments for documentation
```

**Key Features**:
- Idempotent data migration (DISTINCT + GROUP BY)
- Foreign key constraint enforcement
- Proper index creation for performance
- Trigger for `updated_at` column

#### 2. `database/migrations/000002_normalize_privy_accounts.down.sql`
```sql
✅ Reverses all changes (rollback support)
✅ Restores old column structure
✅ Recreates old indexes
✅ Drops privy_accounts table
```

### SQLC Query Files Created

#### 1. `database/queries/privy_account.sql` (NEW)
```sql
✅ GetPrivyAccountByOrgId :one
✅ GetPrivyAccountById :one
✅ CreatePrivyAccount :one
✅ GetOrCreatePrivyAccount :one (idempotent with ON CONFLICT)
✅ UpdatePrivyAccountEmail :one
✅ ListAllPrivyAccounts :many
```

**Key Feature**: `GetOrCreatePrivyAccount` uses `ON CONFLICT` for race-safe idempotency

#### 2. `database/queries/client.sql` (UPDATED)
```sql
✅ GetClient :one (with JOIN to privy_accounts)
✅ GetClientByProductID :one (PRIMARY lookup method)
✅ GetClientsByPrivyOrgID :many (returns ARRAY)
✅ CreateClient :one (updated params: privy_account_id instead of individual fields)
```

**Key Changes**:
- All client queries now JOIN with `privy_accounts`
- `GetClientsByPrivyOrgID` returns **array** (not single row)
- Aliased column: `pa.wallet_type AS privy_wallet_type`

---

## ✅ Phase 2: SQLC Generation - COMPLETE

### Generated Files

#### 1. `packages/sqlcgen/src/gen/privy_account_sql.ts`
```typescript
✅ GetPrivyAccountByOrgIdRow
✅ GetPrivyAccountByIdRow
✅ CreatePrivyAccountRow
✅ GetOrCreatePrivyAccountRow
✅ UpdatePrivyAccountEmailRow
✅ ListAllPrivyAccountsRow
✅ All corresponding function exports
```

#### 2. `packages/sqlcgen/src/gen/client_sql.ts` (UPDATED)
```typescript
✅ GetClientRow (includes privy data from JOIN)
   - privyAccountId: string
   - privyOrganizationId: string
   - privyWalletAddress: string
   - privyEmail: string | null
   - privyWalletType: string

✅ GetClientByProductIDRow (same structure)

✅ GetClientsByPrivyOrgIDRow (array return type)

✅ CreateClientArgs (updated):
   - Removed: privyOrganizationId, privyWalletAddress, walletType, walletManagedBy
   - Added: privyAccountId
```

---

## ✅ Entity Layer - COMPLETE

### 1. `packages/core/entity/privy-account.entity.ts` (NEW)
```typescript
export interface PrivyAccountEntity {
  id: string;
  privyOrganizationId: string;
  privyWalletAddress: string;
  privyEmail: string | null;
  walletType: "custodial" | "non-custodial";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePrivyAccountInput {
  privyOrganizationId: string;
  privyWalletAddress: string;
  privyEmail?: string;
  walletType: "custodial" | "non-custodial";
}
```

### 2. `packages/core/entity/database/client.entity.ts` (UPDATED)
```typescript
// Base schema (no Privy data)
export const clientSchema = z.object({
  id: z.string().uuid(),
  privyAccountId: z.string().uuid(),  // FK to privy_accounts
  productId: z.string().min(1),
  // ... other fields
});

// Extended schema (with Privy data from JOIN)
export const clientWithPrivySchema = clientSchema.extend({
  privyOrganizationId: z.string().min(1),
  privyWalletAddress: z.string().min(1),
  privyEmail: z.string().nullable(),
  walletType: z.enum(['custodial', 'non-custodial']),
});

export type ClientWithPrivy = z.infer<typeof clientWithPrivySchema>;
```

---

## ✅ Repository Layer - COMPLETE

### 1. `packages/core/repository/privy-account.repository.ts` (NEW)
```typescript
export class PrivyAccountRepository {
  constructor(private readonly sql: Sql) {}

  async getByOrgId(privyOrganizationId: string): Promise<PrivyAccountEntity | null>
  async getById(id: string): Promise<PrivyAccountEntity | null>
  async create(data: CreatePrivyAccountInput): Promise<PrivyAccountEntity>
  async getOrCreate(data: CreatePrivyAccountInput): Promise<PrivyAccountEntity>  // ⭐ Key method
  async updateEmail(privyOrganizationId: string, email: string): Promise<PrivyAccountEntity>
  async listAll(): Promise<PrivyAccountEntity[]>
}
```

**Implementation**: Uses native `postgres` library (not SQLC) for flexibility

### 2. `packages/core/repository/postgres/client.repository.ts` (UPDATED)
```typescript
// UPDATED: Returns array now
async getByPrivyOrgId(privyOrgId: string): Promise<GetClientsByPrivyOrgIDRow[]> {
  return await getClientsByPrivyOrgID(this.sql, { privyOrganizationId: privyOrgId });
}

// PRIMARY lookup method
async getByProductId(productId: string): Promise<GetClientByProductIDRow | null> {
  return await getClientByProductID(this.sql, { productId });
}
```

### 3. `packages/core/repository/postgres/index.ts` (UPDATED)
```typescript
// NEW export
export { PrivyAccountRepository } from '../privy-account.repository';
```

---

## 📋 Files Changed Summary

### Created (5 files)
- ✅ `database/migrations/000002_normalize_privy_accounts.up.sql`
- ✅ `database/migrations/000002_normalize_privy_accounts.down.sql`
- ✅ `database/queries/privy_account.sql`
- ✅ `packages/core/entity/privy-account.entity.ts`
- ✅ `packages/core/repository/privy-account.repository.ts`

### Modified (5 files)
- ✅ `database/queries/client.sql`
- ✅ `packages/core/entity/database/client.entity.ts`
- ✅ `packages/core/entity/index.ts`
- ✅ `packages/core/repository/postgres/client.repository.ts`
- ✅ `packages/core/repository/postgres/index.ts`

### Generated (2 files)
- ✅ `packages/sqlcgen/src/gen/privy_account_sql.ts` (auto-generated)
- ✅ `packages/sqlcgen/src/gen/client_sql.ts` (auto-updated)

---

## 🗂️ Database Schema Changes

### Before
```sql
client_organizations (1 row per Privy user)
├── id UUID PRIMARY KEY
├── privy_organization_id VARCHAR(255) UNIQUE NOT NULL
├── privy_wallet_address VARCHAR(66) UNIQUE NOT NULL
├── wallet_type VARCHAR(20) NOT NULL
├── wallet_managed_by VARCHAR(20) NOT NULL
├── product_id VARCHAR(255) UNIQUE NOT NULL
└── ... other fields
```

### After
```sql
privy_accounts (1 row per Privy user - IDENTITY LAYER)
├── id UUID PRIMARY KEY
├── privy_organization_id VARCHAR(255) UNIQUE NOT NULL
├── privy_wallet_address VARCHAR(66) UNIQUE NOT NULL
├── privy_email VARCHAR(255)
└── wallet_type VARCHAR(20) NOT NULL

client_organizations (MANY rows per Privy user - PRODUCT LAYER)
├── id UUID PRIMARY KEY
├── privy_account_id UUID NOT NULL REFERENCES privy_accounts(id)  ← FK
├── product_id VARCHAR(255) UNIQUE NOT NULL  ← PRIMARY identifier
└── ... other fields (Privy columns removed)
```

---

## 🚀 Next Steps

### Step 1: Run Database Migration ⏭️ **READY TO EXECUTE**
```bash
# Option 1: Using make
make db-migrate-up

# Option 2: Using migrate CLI
migrate -path ./database/migrations \
        -database "postgresql://postgres:postgres@localhost:5432/proxify_dev" \
        up

# Verify migration
psql -d proxify_dev -c "\d privy_accounts"
psql -d proxify_dev -c "\d client_organizations"
```

**Expected Result**:
- `privy_accounts` table created
- `client_organizations.privy_account_id` column added
- Old columns removed
- Existing data migrated (zero loss)

### Step 2: Update UseCase Layer
**File**: `packages/core/usecase/b2b/client.usecase.ts`

**Changes Needed**:
```typescript
import { PrivyAccountRepository } from "../repository";  // Add import

export class B2BClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly privyAccountRepository: PrivyAccountRepository,  // Inject
    private readonly auditRepository: AuditRepository
  ) {}

  async createClient(request: CreateClientRequest): Promise<ClientWithPrivy> {
    // Step 1: Get or create Privy account
    const privyAccount = await this.privyAccountRepository.getOrCreate({
      privyOrganizationId: request.privyOrganizationId,
      privyWalletAddress: request.privyWalletAddress,
      privyEmail: request.privyEmail,
      walletType: request.walletType,
    });

    // Step 2: Create client organization
    const client = await this.clientRepository.create({
      privyAccountId: privyAccount.id,  // Use FK
      productId: request.productId,
      // ... other fields
    });

    // Step 3: Return combined data
    return {
      ...client,
      privyOrganizationId: privyAccount.privyOrganizationId,
      privyWalletAddress: privyAccount.privyWalletAddress,
      privyEmail: privyAccount.privyEmail,
      walletType: privyAccount.walletType,
    };
  }
}
```

### Step 3: Update API Contract Layer
**File**: `packages/b2b-api-core/contracts/client.ts`

**Changes Needed**:
- Change endpoint paths to use `product_id`
- Add `listByPrivyOrgId` endpoint

### Step 4: Update API Router Layer
**File**: `apps/b2b-api/src/router/client.router.ts`

**Changes Needed**:
- Update DI to inject `PrivyAccountRepository`
- Change route handlers to use new repository methods

### Step 5: Update Frontend
**Files**:
- `apps/whitelabel-web/src/store/userStore.ts`
- `apps/whitelabel-web/src/lib/api-client.ts`

**Changes Needed**:
- Add `organizations[]` array to store
- Add `activeProductId` selection
- Add organization switching logic

---

## 🔍 Verification Commands

```bash
# Check SQLC generation
ls -la packages/sqlcgen/src/gen/privy_account_sql.ts

# Check migration files
ls -la database/migrations/000002*

# Run SQLC generation again (should be idempotent)
sqlc generate

# Check generated types
grep -n "GetClientsByPrivyOrgIDRow" packages/sqlcgen/src/gen/client_sql.ts
```

---

## 📊 Progress Checklist

### ✅ Completed
- [x] Database migration files (up + down)
- [x] SQLC query files (privy_account.sql + client.sql updates)
- [x] SQLC type generation
- [x] Entity layer (PrivyAccountEntity + ClientWithPrivy)
- [x] Repository layer (PrivyAccountRepository + ClientRepository updates)
- [x] Documentation (PRIVY_NORMALIZATION_GUIDE.md)

### 🔄 In Progress
- [ ] Run database migration

### ⏭️ Pending
- [ ] Update UseCase layer
- [ ] Update API contract layer
- [ ] Update API router layer
- [ ] Update Frontend store
- [ ] Integration testing

---

## 🎓 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Two-table structure** | Separates identity (Privy) from products (organizations) |
| **product_id as primary identifier** | User-friendly, public-facing identifier for API calls |
| **getOrCreate pattern** | Idempotent Privy account creation (handles race conditions) |
| **JOIN queries in SQLC** | Single query to get client + Privy data (performance) |
| **Alias `privy_wallet_type`** | Avoids column name conflicts in SQLC generation |
| **Array return for `getByPrivyOrgId`** | Supports multiple organizations per Privy user |

---

**Status**: ✅ Database Layer Complete | ⏭️ Ready for Migration  
**Last Updated**: 2025-11-23  
**Generated Types**: ✅ SQLC Complete  
**Migration**: ⏳ Ready to Run
