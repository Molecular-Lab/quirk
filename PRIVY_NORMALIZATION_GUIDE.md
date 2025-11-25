# PRIVY ACCOUNTS NORMALIZATION - MIGRATION GUIDE

## 📋 Executive Summary

**Objective**: Normalize Privy user data to support multiple organizations per Privy account

**Current State**: One organization per Privy user (1:1 relationship)  
**Target State**: Multiple organizations per Privy user (1:many relationship)

**Key Changes**:
- Split `client_organizations` table into `privy_accounts` (identity) + `client_organizations` (products)
- Change primary identifier from `client_id` to `product_id`
- Update all API endpoints to use `product_id` instead of `privy_organization_id`

---

## 🎯 Business Case

### User Story
> "As a Privy user (e.g., Grab), I want to create multiple product organizations (GrabPay, GrabFood, GrabRides) under one account, so I can manage different business units separately."

### Before
```
privy_org_id: "grab-user-123"
└── client_organizations
    └── ONE row only (GrabPay)
```

### After
```
privy_org_id: "grab-user-123"
└── client_organizations
    ├── prod_abc123 (GrabPay)
    ├── prod_def456 (GrabFood)
    └── prod_ghi789 (GrabRides)
```

---

## 🗂️ Database Architecture

### Tables

#### `privy_accounts` (NEW - Identity Layer)
```sql
CREATE TABLE privy_accounts (
    id UUID PRIMARY KEY,
    privy_organization_id VARCHAR(255) UNIQUE NOT NULL,  -- Privy user ID
    privy_wallet_address VARCHAR(66) UNIQUE NOT NULL,
    privy_email VARCHAR(255),
    wallet_type VARCHAR(20) NOT NULL,  -- 'custodial' | 'non-custodial'
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Purpose**: Store ONE row per Privy user (auth/identity)  
**Unique Constraints**: `privy_organization_id`, `privy_wallet_address`

#### `client_organizations` (UPDATED - Product Layer)
```sql
CREATE TABLE client_organizations (
    id UUID PRIMARY KEY,
    privy_account_id UUID NOT NULL REFERENCES privy_accounts(id),  -- NEW: FK
    product_id VARCHAR(255) UNIQUE NOT NULL,  -- PRIMARY public identifier
    company_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255),
    -- ... other fields (REMOVED: privy_organization_id, privy_wallet_address, wallet_type)
);
```

**Purpose**: Store MANY rows per Privy user (product organizations)  
**Primary Identifier**: `product_id` (e.g., `prod_abc123`)  
**Foreign Key**: `privy_account_id` → `privy_accounts.id`

### Relationships

```
privy_accounts (1) ──────< client_organizations (many)
     ↓                              ↓
privy_org_id                   product_id
(for auth)                     (for API calls)
```

---

## 📁 Files Created/Modified

### ✅ Completed Files

#### 1. Database Migrations
- ✅ `database/migrations/000002_normalize_privy_accounts.up.sql`
  - Creates `privy_accounts` table
  - Adds `privy_account_id` FK to `client_organizations`
  - Migrates existing data
  - Removes old columns

- ✅ `database/migrations/000002_normalize_privy_accounts.down.sql`
  - Reverses the migration (rollback)

#### 2. SQLC Queries
- ✅ `database/queries/privy_account.sql` (NEW)
  ```sql
  -- name: GetPrivyAccountByOrgId :one
  -- name: CreatePrivyAccount :one
  -- name: GetOrCreatePrivyAccount :one
  ```

- ✅ `database/queries/client.sql` (UPDATED)
  ```sql
  -- name: GetClientByProductID :one (with JOIN)
  -- name: GetClientsByPrivyOrgID :many (returns array)
  -- name: CreateClient :one (updated params)
  ```

#### 3. Entity Layer
- ✅ `packages/core/entity/privy-account.entity.ts` (NEW)
- ✅ `packages/core/entity/database/client.entity.ts` (UPDATED)
  - Added `ClientWithPrivy` type for JOIN queries
  - Updated `CreateClient` to use `privyAccountId`

#### 4. Repository Layer
- ✅ `packages/core/repository/privy-account.repository.ts` (NEW)
  - `getByOrgId()`, `getById()`, `create()`, `getOrCreate()`

- ✅ `packages/core/repository/postgres/client.repository.ts` (UPDATED)
  - `getByPrivyOrgId()` now returns array

---

## 🚀 Next Steps (To Be Implemented)

### Step 1: Run SQLC Generation
```bash
cd /Users/wtshai/Work/Protocolcamp/proxify
sqlc generate
```

**Expected Output**:
- `packages/database/src/gen/` - TypeScript types
- Should see `GetPrivyAccountByOrgIdRow`, `GetClientsByPrivyOrgIDRow`, etc.

### Step 2: Run Database Migration
```bash
make db-migrate-up
# Or: migrate -path ./database/migrations -database "postgresql://..." up
```

**Verify Migration**:
```sql
\d privy_accounts
\d client_organizations  -- Should have privy_account_id column
```

### Step 3: Update UseCase Layer

**File**: `packages/core/usecase/b2b/client.usecase.ts`

```typescript
export class B2BClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly privyAccountRepository: PrivyAccountRepository,  // NEW
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
      privyAccountId: privyAccount.id,  // FK
      productId: request.productId,
      companyName: request.companyName,
      // ... other fields
    });

    // Step 3: Return with Privy data
    return {
      ...client,
      privyOrganizationId: privyAccount.privyOrganizationId,
      privyWalletAddress: privyAccount.privyWalletAddress,
      walletType: privyAccount.walletType,
    };
  }

  async getClientByProductId(productId: string): Promise<ClientWithPrivy | null> {
    return await this.clientRepository.getByProductId(productId);
  }

  async getClientsByPrivyOrgId(privyOrgId: string): Promise<ClientWithPrivy[]> {
    return await this.clientRepository.getByPrivyOrgId(privyOrgId);
  }
}
```

### Step 4: Update API Contract

**File**: `packages/b2b-api-core/contracts/client.ts`

```typescript
export const clientContract = c.router({
  // Create organization
  create: {
    method: "POST",
    path: "/clients",
    responses: { 201: ClientDto },
    body: CreateClientDto,
  },

  // Get client by product ID (PRIMARY lookup)
  getByProductId: {
    method: "GET",
    path: "/products/:productId",
    responses: { 200: ClientDto },
  },

  // List ALL organizations for Privy user (NEW)
  listByPrivyOrgId: {
    method: "GET",
    path: "/clients/privy/:privyOrganizationId",
    responses: { 200: z.array(ClientDto) },
  },

  // Configure strategies using product ID
  configureStrategies: {
    method: "POST",
    path: "/products/:productId/strategies",
    responses: { 200: ConfigureStrategiesResponseDto },
    body: ConfigureStrategiesDto,
  },
});
```

### Step 5: Update API Router

**File**: `apps/b2b-api/src/router/client.router.ts`

```typescript
export const createClientRouter = (
  s: ReturnType<typeof initServer>,
  clientService: ClientService
): any => {
  return s.router(b2bContract.client, {
    // POST /clients
    create: async ({ body }) => {
      const client = await clientService.createClient({
        privyOrganizationId: body.privyOrganizationId,
        privyWalletAddress: body.privyWalletAddress,
        privyEmail: body.privyEmail,
        walletType: body.walletType,
        productId: `prod_${randomUUID()}`,
        companyName: body.companyName,
        // ...
      });

      return { status: 201, body: client };
    },

    // GET /products/:productId
    getByProductId: async ({ params }) => {
      const client = await clientService.getClientByProductId(params.productId);
      if (!client) return { status: 404, body: { error: "Not found" } };
      return { status: 200, body: client };
    },

    // GET /clients/privy/:privyOrganizationId
    listByPrivyOrgId: async ({ params }) => {
      const clients = await clientService.getClientsByPrivyOrgId(params.privyOrganizationId);
      return { status: 200, body: clients };
    },
  });
};
```

### Step 6: Update Frontend Store

**File**: `apps/whitelabel-web/src/store/userStore.ts`

```typescript
interface UserCredentials {
  // Privy Authentication
  privyOrganizationId: string | null;
  privyEmail: string | null;
  privyWalletAddress: string | null;
  walletType: "MANAGED" | "USER_OWNED" | null;

  // Current Active Organization (NEW)
  activeProductId: string | null;

  // All Organizations (NEW)
  organizations: Array<{
    productId: string;
    companyName: string;
    businessType: string;
  }>;
}

interface UserStore extends UserCredentials {
  // NEW: Load all organizations for user
  loadOrganizations: () => Promise<void>;

  // NEW: Switch active organization
  setActiveOrganization: (productId: string) => void;

  // NEW: Create new organization
  createOrganization: (data: { companyName: string; ... }) => Promise<void>;
}
```

---

## 🧪 Testing Checklist

### Test 1: Privy Login & Organization Creation
- [ ] Log in with Privy (email or MetaMask)
- [ ] Create first organization (GrabPay)
- [ ] Verify `privy_accounts` has 1 row
- [ ] Verify `client_organizations` has 1 row with `privy_account_id` FK

### Test 2: Multiple Organizations
- [ ] Create second organization (GrabFood)
- [ ] Verify `privy_accounts` still has 1 row (same Privy user)
- [ ] Verify `client_organizations` has 2 rows (different `product_id`)

### Test 3: API Calls with Product ID
- [ ] Call `GET /products/{productId}` for GrabPay
- [ ] Call `POST /products/{productId}/strategies`
- [ ] Verify correct organization is used

### Test 4: List Organizations
- [ ] Call `GET /clients/privy/{privyOrganizationId}`
- [ ] Verify returns array with both GrabPay and GrabFood

### Test 5: Switch Organizations
- [ ] Click organization switcher in UI
- [ ] Verify `activeProductId` changes
- [ ] Verify dashboard shows correct data

---

## 🔑 Key Decisions

| Decision | Before | After |
|----------|--------|-------|
| **Primary Identifier** | `client_id` (UUID) | `product_id` (public string) |
| **Privy Constraint** | UNIQUE (one org per user) | FK (many orgs per user) |
| **API Endpoint Pattern** | `/clients/:id` | `/products/:productId` |
| **Repository Method** | `getByPrivyOrgId() → one` | `getByPrivyOrgId() → array` |
| **Frontend Store** | Single `productId` | `activeProductId` + `organizations[]` |

---

## 📊 Migration Checklist

### Database Layer
- [x] Create `000002_normalize_privy_accounts.up.sql`
- [x] Create `000002_normalize_privy_accounts.down.sql`
- [x] Create `database/queries/privy_account.sql`
- [x] Update `database/queries/client.sql`
- [ ] Run `sqlc generate`
- [ ] Run `make db-migrate-up`

### Backend Layer
- [x] Create `PrivyAccountEntity`
- [x] Update `ClientEntity`
- [x] Create `PrivyAccountRepository`
- [x] Update `ClientRepository`
- [ ] Update `B2BClientUseCase`
- [ ] Update API contracts
- [ ] Update API routers

### Frontend Layer
- [ ] Update `userStore.ts`
- [ ] Update API client
- [ ] Update UI components

### Testing
- [ ] Test migration
- [ ] Test SQLC generation
- [ ] Test multi-organization creation
- [ ] Test organization switching
- [ ] Test API calls

---

## 🛠️ Commands Reference

```bash
# Generate TypeScript types from SQL
sqlc generate

# Run migration
make db-migrate-up

# Rollback migration
make db-migrate-down

# Check migration status
migrate -path ./database/migrations -database "postgresql://..." version

# Connect to database
psql "postgresql://postgres:postgres@localhost:5432/proxify_dev"

# Verify tables
\d privy_accounts
\d client_organizations
```

---

## 📝 Notes

- Migration preserves existing data (no data loss)
- Rollback is supported via `down.sql`
- SQLC generation required before running backend
- Frontend changes are non-breaking (backwards compatible)
- API versioning not required (clean migration)

---

**Status**: Database & Repository layers complete ✅  
**Next**: Run SQLC generation and update UseCase layer  
**Updated**: 2025-11-23
