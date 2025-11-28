# Complete Layer Implementation - Currency Support ✅

**Status:** Database & Queries Complete
**Date:** 2025-11-26

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: DATABASE SCHEMA (PostgreSQL)                           │
│ ✅ Migration: 000002_add_currency_config.sql                    │
│ ✅ Tables: client_organizations.supported_currencies (TEXT[])   │
│ ✅         client_organizations.bank_accounts (JSONB)           │
│ ✅ Indexes: GIN indexes for fast JSONB queries                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: SQLC QUERIES (Type-safe SQL)                           │
│ ✅ client.sql - Updated CreateClient with currency params       │
│ ✅ client_bank_accounts.sql - Bank account CRUD operations      │
│ 🔄 PENDING: Run `sqlc generate` to generate Go/TS types         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: ENTITIES (Domain Models)                               │
│ 🔄 PENDING: Update Client entity with currency fields           │
│ 🔄 PENDING: Add BankAccount entity                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: REPOSITORIES (Data Access)                             │
│ 🔄 PENDING: Update ClientRepository.create() method             │
│ 🔄 PENDING: Add BankAccountRepository methods                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5: USE CASES (Business Logic)                             │
│ 🔄 PENDING: Update ClientUseCase.registerClient()               │
│ 🔄 PENDING: Add currency validation logic                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 6: API CONTRACTS (ts-rest)                                │
│ ✅ packages/b2b-api-core/dto/client.ts                          │
│ ✅ ClientBankAccountDto schema defined                          │
│ ✅ CreateClientDto includes currency fields                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 7: API ROUTES (Express Handlers)                          │
│ 🔄 PENDING: Update client.router.ts create handler              │
│ 🔄 PENDING: Add bank account management endpoints               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### Client Bank Accounts Structure (JSONB)

Each client can have multiple bank accounts (one per currency):

```json
{
  "bank_accounts": [
    {
      "currency": "THB",
      "bankName": "Kasikorn Bank",
      "accountNumber": "123-4-56789-0",
      "accountName": "GrabFood (Thailand) Co., Ltd.",
      "swiftCode": "KASITHBK",
      "bankCode": "004",
      "promptPayId": "0891234567"
    },
    {
      "currency": "SGD",
      "bankName": "DBS Bank (Singapore)",
      "accountNumber": "XXX-XXXXX-X",
      "accountName": "GrabFood Pte. Ltd.",
      "swiftCode": "DBSSSGSG",
      "bankCode": "7171",
      "branchCode": "001"
    },
    {
      "currency": "USD",
      "bankName": "Citibank N.A.",
      "accountNumber": "9876543210",
      "accountName": "GrabFood International Inc.",
      "swiftCode": "CITISGSG",
      "routingNumber": "021000089"
    }
  ],
  "supported_currencies": ["THB", "SGD", "USD"]
}
```

---

## SQLC Query Examples

### 1. Add/Update Bank Account

```sql
-- name: AddClientBankAccount :exec
UPDATE client_organizations
SET bank_accounts = CASE
    -- If currency exists, update it
    WHEN bank_accounts::jsonb @> jsonb_build_array(jsonb_build_object('currency', $2)) THEN
      (
        SELECT jsonb_agg(
          CASE
            WHEN elem->>'currency' = $2 THEN $3::jsonb
            ELSE elem
          END
        )
        FROM jsonb_array_elements(bank_accounts::jsonb) elem
      )
    -- If currency doesn't exist, append it
    ELSE
      (bank_accounts::jsonb || $3::jsonb)
  END
WHERE id = $1;
```

**Usage:**
```typescript
await queries.AddClientBankAccount(ctx, {
  id: clientId,
  currency: "THB",
  bankAccount: JSON.stringify({
    currency: "THB",
    bankName: "Kasikorn Bank",
    accountNumber: "123-4-56789-0",
    accountName: "GrabFood (Thailand) Co., Ltd.",
    swiftCode: "KASITHBK",
    bankCode: "004"
  })
});
```

### 2. Get Bank Account by Currency

```sql
-- name: GetClientBankAccount :one
SELECT elem
FROM client_organizations,
     jsonb_array_elements(bank_accounts::jsonb) elem
WHERE client_organizations.id = $1
  AND elem->>'currency' = $2
LIMIT 1;
```

**Usage:**
```typescript
const bankAccount = await queries.GetClientBankAccount(ctx, {
  id: clientId,
  currency: "THB"
});

// Returns:
// {
//   "currency": "THB",
//   "bankName": "Kasikorn Bank",
//   "accountNumber": "123-4-56789-0",
//   ...
// }
```

### 3. List All Bank Accounts

```sql
-- name: ListClientBankAccounts :many
SELECT elem
FROM client_organizations,
     jsonb_array_elements(bank_accounts::jsonb) elem
WHERE client_organizations.id = $1;
```

### 4. Remove Bank Account

```sql
-- name: RemoveClientBankAccount :exec
UPDATE client_organizations
SET bank_accounts = (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(bank_accounts::jsonb) elem
    WHERE elem->>'currency' != $2
  )
WHERE id = $1;
```

---

## Flow Examples

### Example 1: Client Registration with Multi-Currency

```typescript
// 1. Register client
POST /api/v1/clients
{
  "companyName": "GrabFood SEA",
  "businessType": "Food Delivery",
  "walletType": "MANAGED",
  "privyOrganizationId": "...",
  "privyWalletAddress": "0x...",

  // Multi-currency support
  "supportedCurrencies": ["THB", "SGD", "USD"],
  "bankAccounts": [
    {
      "currency": "THB",
      "bankName": "Kasikorn Bank",
      "accountNumber": "123-4-56789-0",
      "accountName": "GrabFood (Thailand) Co., Ltd.",
      "swiftCode": "KASITHBK",
      "bankCode": "004"
    },
    {
      "currency": "SGD",
      "bankName": "DBS Bank (Singapore)",
      "accountNumber": "XXX-XXXXX-X",
      "accountName": "GrabFood Pte. Ltd.",
      "swiftCode": "DBSSSGSG",
      "bankCode": "7171"
    },
    {
      "currency": "USD",
      "bankName": "Citibank N.A.",
      "accountNumber": "9876543210",
      "accountName": "GrabFood International Inc.",
      "swiftCode": "CITISGSG"
    }
  ]
}
```

### Example 2: Deposit Flow with Currency

```typescript
// 1. Client creates deposit order
POST /api/v1/deposits/fiat
{
  "userId": "user_123",
  "amount": "1000",
  "currency": "THB",  // ← Client chooses currency
  "tokenSymbol": "USDC"
}

// 2. Backend validates currency is supported
const client = await clientRepo.getByAPIKey(apiKey);
if (!client.supportedCurrencies.includes("THB")) {
  throw new Error("Currency THB not supported by this client");
}

// 3. Return Proxify's bank account for THB
return {
  orderId: "ORD_ABC123",
  paymentInstructions: {
    currency: "THB",
    bankName: "Kasikorn Bank",  // ← Proxify's bank account
    accountNumber: "123-4-56789-0",
    reference: "ORD_ABC123"
  }
};

// 4. User transfers to Proxify's bank
// 5. Proxify receives payment → Converts THB → USDC
// 6. USDC deposited to client's vault
```

### Example 3: Withdrawal Flow with Currency

```typescript
// 1. Client creates withdrawal request
POST /api/v1/withdrawals
{
  "userId": "user_123",
  "amount": "100",  // 100 USDC
  "currency": "THB"  // ← Client wants THB
}

// 2. Backend looks up client's bank account
const client = await clientRepo.getByAPIKey(apiKey);
const bankAccount = client.bankAccounts.find(acc => acc.currency === "THB");

if (!bankAccount) {
  throw new Error("No THB bank account configured. Please add bank account first.");
}

// 3. Off-ramp provider converts USDC → THB
const thbAmount = await offRamp.convert({
  fromAmount: "100",
  fromCurrency: "USDC",
  toCurrency: "THB"
}); // Returns: 3,500 THB

// 4. Transfer to client's bank account
await offRamp.transfer({
  amount: thbAmount,
  currency: "THB",
  bankName: bankAccount.bankName,
  accountNumber: bankAccount.accountNumber,  // ← Client's account
  accountName: bankAccount.accountName,
  swiftCode: bankAccount.swiftCode
});
```

---

## Next Implementation Steps

### Step 1: Generate SQLC Types

```bash
cd /Users/wtshai/Work/Protocolcamp/proxify
sqlc generate
```

This will generate:
- Go types in `server/internal/gen/client.sql.go`
- TypeScript types in `packages/sqlcgen/src/gen/client_sql.ts`

### Step 2: Update Client Entity

**File:** `packages/core/entity/client.entity.ts`

```typescript
export interface BankAccount {
  currency: "SGD" | "USD" | "EUR" | "THB" | "TWD" | "KRW";
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode: string;
  bankCode?: string;
  branchCode?: string;
  routingNumber?: string;
  iban?: string;
  promptPayId?: string;
}

export interface Client {
  id: string;
  productId: string;
  companyName: string;
  businessType: string;
  // ... existing fields

  // NEW: Currency support
  supportedCurrencies: string[];
  bankAccounts: BankAccount[];
}
```

### Step 3: Update ClientRepository

**File:** `packages/core/repository/postgres/client.repository.ts`

```typescript
export class ClientRepository {
  async create(params: {
    // ... existing params
    supportedCurrencies?: string[];
    bankAccounts?: BankAccount[];
  }): Promise<Client> {
    const result = await this.queries.CreateClient({
      // ... existing params
      supported_currencies: params.supportedCurrencies || [],
      bank_accounts: JSON.stringify(params.bankAccounts || [])
    });

    return this.mapToEntity(result);
  }

  async addBankAccount(clientId: string, bankAccount: BankAccount): Promise<void> {
    await this.queries.AddClientBankAccount({
      id: clientId,
      currency: bankAccount.currency,
      bank_account: JSON.stringify(bankAccount)
    });
  }

  async getBankAccount(clientId: string, currency: string): Promise<BankAccount | null> {
    const result = await this.queries.GetClientBankAccount({
      id: clientId,
      currency
    });

    return result ? JSON.parse(result.elem) : null;
  }
}
```

### Step 4: Update ClientUseCase

**File:** `packages/core/usecase/b2b/client.usecase.ts`

```typescript
export class ClientUseCase {
  async registerClient(dto: CreateClientDto): Promise<Client> {
    // Validate bank accounts
    if (dto.bankAccounts && dto.bankAccounts.length > 0) {
      // Ensure each currency only appears once
      const currencies = dto.bankAccounts.map(acc => acc.currency);
      const uniqueCurrencies = new Set(currencies);

      if (currencies.length !== uniqueCurrencies.size) {
        throw new Error("Duplicate currency in bank accounts");
      }

      // Ensure all supported currencies have bank accounts
      if (dto.supportedCurrencies) {
        for (const currency of dto.supportedCurrencies) {
          const hasBankAccount = dto.bankAccounts.some(acc => acc.currency === currency);
          if (!hasBankAccount) {
            throw new Error(`Missing bank account for supported currency: ${currency}`);
          }
        }
      }
    }

    return await this.clientRepo.create(dto);
  }
}
```

### Step 5: Update API Router

**File:** `apps/b2b-api/src/router/client.router.ts`

```typescript
create: async ({ body }) => {
  const client = await clientService.registerClient({
    companyName: body.companyName,
    // ... existing fields
    supportedCurrencies: body.supportedCurrencies || [],
    bankAccounts: body.bankAccounts || []
  });

  return { status: 201, body: client };
}
```

---

## Testing Checklist

- [ ] Run migration: `make db-migrate-up`
- [ ] Generate SQLC types: `sqlc generate`
- [ ] Update entities with currency fields
- [ ] Update repositories with bank account methods
- [ ] Update use cases with validation logic
- [ ] Update API routes to accept currency params
- [ ] Test: Register client with multiple currencies
- [ ] Test: Add bank account for new currency
- [ ] Test: Create deposit with specific currency
- [ ] Test: Validate unsupported currency rejection
- [ ] Test: Withdrawal to client's bank account

---

## Summary

**Database Layer ✅**
- Migration created with `supported_currencies` (TEXT[]) and `bank_accounts` (JSONB)
- Indexes for fast currency lookups

**Query Layer ✅**
- Updated `CreateClient` to include currency params
- Created bank account CRUD operations
- Support for add/update/remove/list bank accounts

**Pending Layers 🔄**
- Entities: Add currency fields to Client interface
- Repositories: Implement bank account methods
- Use Cases: Add currency validation
- API Routes: Wire up currency endpoints

**Key Design:**
- One client → Multiple currencies
- One currency → One bank account (JSONB object)
- JSONB allows flexible schema per currency
- Type-safe operations via SQLC

---

**Status:** Ready for `sqlc generate` and layer implementation
**Last Updated:** 2025-11-26
