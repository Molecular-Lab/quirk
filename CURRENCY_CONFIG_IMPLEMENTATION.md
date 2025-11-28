# Currency Configuration Implementation ✅

**Status:** Schema Updated, UI Pending
**Date:** 2025-11-26

## Overview

Added currency configuration support to client registration, allowing clients to specify:
1. **Supported currencies** for deposits
2. **Bank accounts** for off-ramp withdrawals (each currency needs its own bank account)

---

## What Was Implemented

### 1. Client Schema Updates

**File:** `packages/b2b-api-core/dto/client.ts`

#### New DTOs

```typescript
// Bank account configuration for client's off-ramp
export const ClientBankAccountDto = z.object({
  currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]),
  bankName: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  swiftCode: z.string(),
  bankCode: z.string().optional(),
  branchCode: z.string().optional(),
  routingNumber: z.string().optional(),
  iban: z.string().optional(),
});
```

#### Updated CreateClientDto

```typescript
export const CreateClientDto = z.object({
  companyName: z.string().min(1),
  businessType: z.string(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  walletType: z.enum(["MANAGED", "USER_OWNED"]),
  chain: z.string().optional(),
  vaultsToCreate: z.enum(["usdc", "usdt", "both"]).optional(),
  privyOrganizationId: z.string(),
  privyWalletAddress: z.string().min(1),
  privyEmail: z.string().email().optional().nullable(),

  // ✅ NEW: Currency & banking configuration (for off-ramp withdrawals)
  supportedCurrencies: z.array(z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"])).optional(),
  bankAccounts: z.array(ClientBankAccountDto).optional(),
});
```

#### Updated ClientDto (Response)

```typescript
export const ClientDto = z.object({
  id: z.string(),
  productId: z.string(),
  companyName: z.string(),
  businessType: z.string(),
  description: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  walletType: z.string(),
  privyOrganizationId: z.string(),
  isActive: z.boolean(),
  isSandbox: z.boolean().optional(),

  // ✅ NEW: Currency configuration
  supportedCurrencies: z.array(z.string()).nullable().optional(),
  bankAccounts: z.array(ClientBankAccountDto).nullable().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});
```

---

## Use Cases

### Example 1: Single Currency Support (Thai Startup)

```json
{
  "companyName": "GrabFood Thailand",
  "businessType": "Food Delivery",
  "walletType": "MANAGED",
  "privyOrganizationId": "...",
  "privyWalletAddress": "0x...",

  "supportedCurrencies": ["THB"],
  "bankAccounts": [
    {
      "currency": "THB",
      "bankName": "Kasikorn Bank",
      "accountNumber": "123-4-56789-0",
      "accountName": "GrabFood (Thailand) Co., Ltd.",
      "swiftCode": "KASITHBK",
      "bankCode": "004"
    }
  ]
}
```

**Flow:**
1. End-user deposits 1,000 THB → Proxify's Kasikorn Bank account
2. Proxify converts to 28.6 USDC (35 THB/USD rate)
3. Deploys to DeFi protocols
4. Yield accrues in USDC
5. End-user withdraws → Proxify converts back to THB → Sends to GrabFood's Kasikorn account

### Example 2: Multi-Currency Support (Regional Platform)

```json
{
  "companyName": "Shopify SEA",
  "businessType": "E-Commerce",
  "walletType": "MANAGED",
  "privyOrganizationId": "...",
  "privyWalletAddress": "0x...",

  "supportedCurrencies": ["SGD", "THB", "USD"],
  "bankAccounts": [
    {
      "currency": "SGD",
      "bankName": "DBS Bank (Singapore)",
      "accountNumber": "XXX-XXXXX-X",
      "accountName": "Shopify Singapore Pte. Ltd.",
      "swiftCode": "DBSSSGSG"
    },
    {
      "currency": "THB",
      "bankName": "Kasikorn Bank",
      "accountNumber": "XXX-X-XXXXX-X",
      "accountName": "Shopify (Thailand) Co., Ltd.",
      "swiftCode": "KASITHBK"
    },
    {
      "currency": "USD",
      "bankName": "Citibank N.A.",
      "accountNumber": "XXXXXXXXXX",
      "accountName": "Shopify International Inc.",
      "swiftCode": "CITISGSG"
    }
  ]
}
```

**Flow:**
- Singapore seller withdraws → Converts USDC → SGD → DBS Bank account
- Thai seller withdraws → Converts USDC → THB → Kasikorn Bank account
- International seller withdraws → USDC → USD → Citibank account

### Example 3: Crypto-Only Platform (No Fiat Off-Ramp)

```json
{
  "companyName": "DeFi Yield Aggregator",
  "businessType": "DeFi Protocol",
  "walletType": "USER_OWNED",
  "privyOrganizationId": "...",
  "privyWalletAddress": "0x...",

  "supportedCurrencies": [],
  "bankAccounts": []
}
```

**Flow:**
- Users deposit USDC directly (crypto deposit flow)
- Yield accrues in USDC
- Users withdraw directly to their wallets (no fiat conversion)

---

## Implementation Status

### ✅ Completed
- [x] Schema definition (`ClientBankAccountDto`)
- [x] Updated `CreateClientDto` with currency fields
- [x] Updated `ClientDto` response with currency fields
- [x] Type exports

### 🔄 Pending
- [ ] Database migration (add `supported_currencies` and `bank_accounts` columns)
- [ ] Backend service layer (save/retrieve bank accounts)
- [ ] Frontend UI component (currency selector + bank account form)
- [ ] Validation logic (ensure at least 1 bank account per supported currency)
- [ ] Off-ramp withdrawal flow (use client's bank account)

---

## UI Mockup (To Be Built)

### Client Registration Page - Step 3: Currency Configuration

```
┌──────────────────────────────────────────────────────────────┐
│ Currency & Banking Configuration                             │
│                                                              │
│ Select the currencies you want to support for deposits      │
│ and provide your bank account for each currency             │
│                                                              │
│ ☑ SGD - Singapore Dollar                                    │
│   Bank Name: DBS Bank (Singapore)                           │
│   Account Number: XXX-XXXXX-X                               │
│   Account Name: Your Company Pte. Ltd.                      │
│   SWIFT Code: DBSSSGSG                                      │
│                                                              │
│ ☑ THB - Thai Baht                                           │
│   Bank Name: Kasikorn Bank                                  │
│   Account Number: XXX-X-XXXXX-X                             │
│   Account Name: Your Company (Thailand) Co., Ltd.           │
│   SWIFT Code: KASITHBK                                      │
│   Bank Code: 004                                            │
│   PromptPay ID (optional): XXXXXXXXXX                       │
│                                                              │
│ ☐ USD - US Dollar                                           │
│ ☐ EUR - Euro                                                │
│ ☐ TWD - Taiwan Dollar                                       │
│ ☐ KRW - Korean Won                                          │
│                                                              │
│ [+ Add Currency]                                            │
│                                                              │
│ ⚠️ Note: You need at least one bank account to enable       │
│    fiat withdrawals. If you only want crypto deposits/      │
│    withdrawals, you can skip this step.                     │
│                                                              │
│ [Back]                                    [Save & Continue] │
└──────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

1. **Currency uniqueness**: Each currency can only appear once in `bankAccounts`
2. **Supported currencies match**: Every currency in `supportedCurrencies` must have a corresponding bank account
3. **Required fields per currency**:
   - All currencies: `bankName`, `accountNumber`, `accountName`, `swiftCode`
   - EUR: `iban` required
   - THB: `bankCode` required, `promptPayId` optional
   - SGD: `bankCode` and `branchCode` required
   - TWD: `bankCode` and `branchCode` required
   - KRW: `bankCode` required
4. **Optional configuration**: Both `supportedCurrencies` and `bankAccounts` can be empty (crypto-only platforms)

---

## Database Schema (To Be Migrated)

### Option 1: JSONB Column (Recommended)

```sql
ALTER TABLE clients
ADD COLUMN supported_currencies TEXT[] DEFAULT '{}',
ADD COLUMN bank_accounts JSONB DEFAULT '[]';

-- Index for querying by supported currency
CREATE INDEX idx_clients_supported_currencies ON clients USING GIN(supported_currencies);
```

**Example data:**

```json
{
  "supported_currencies": ["SGD", "THB"],
  "bank_accounts": [
    {
      "currency": "SGD",
      "bankName": "DBS Bank (Singapore)",
      "accountNumber": "XXX-XXXXX-X",
      "accountName": "GrabFood Pte. Ltd.",
      "swiftCode": "DBSSSGSG",
      "bankCode": "7171"
    },
    {
      "currency": "THB",
      "bankName": "Kasikorn Bank",
      "accountNumber": "XXX-X-XXXXX-X",
      "accountName": "GrabFood (Thailand) Co., Ltd.",
      "swiftCode": "KASITHBK",
      "bankCode": "004"
    }
  ]
}
```

### Option 2: Separate Table (More Normalized)

```sql
CREATE TABLE client_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('SGD', 'USD', 'EUR', 'THB', 'TWD', 'KRW')),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  swift_code TEXT NOT NULL,
  bank_code TEXT,
  branch_code TEXT,
  routing_number TEXT,
  iban TEXT,
  prompt_pay_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, currency)
);

CREATE INDEX idx_client_bank_accounts_client_id ON client_bank_accounts(client_id);
```

**Recommendation:** Use **Option 1 (JSONB)** for MVP, migrate to Option 2 if we need complex queries on bank accounts.

---

## Off-Ramp Withdrawal Flow (Future)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Initiates Withdrawal                                │
│    POST /withdrawals { amount: "100", currency: "THB" }    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Checks Client's Bank Accounts                    │
│    - Query client.bankAccounts                             │
│    - Find entry where currency === "THB"                   │
│    - If not found, return error "Currency not supported"   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Calculate Fiat Amount                                    │
│    - 100 USDC → Exchange rate 35 THB/USD → 3,500 THB      │
│    - Deduct fees (e.g., 1% = 35 THB)                      │
│    - Final amount: 3,465 THB                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Create Withdrawal Order                                  │
│    - Status: pending                                        │
│    - Destination: Client's Kasikorn Bank account           │
│    - Amount: 3,465 THB                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Off-Ramp Provider (TransFi/Bitkub)                      │
│    - Sell 100 USDC → Get 3,465 THB                        │
│    - Transfer to client's bank account                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Mark Withdrawal Complete                                 │
│    - Update status: completed                              │
│    - Notify client via webhook                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ **Schema definition** - DONE
2. 🔄 **Database migration** - Create migration file
3. 🔄 **Backend service** - Update client service to handle bank accounts
4. 🔄 **Frontend UI** - Build currency configuration component
5. 🔄 **Validation** - Add backend validation for currency/bank account matching
6. 🔄 **Testing** - Test full flow with multiple currencies

---

## Summary

We've laid the foundation for multi-currency support by:
- Defining `ClientBankAccountDto` schema
- Adding `supportedCurrencies` and `bankAccounts` to client registration
- Supporting 6 currencies: SGD, USD, EUR, THB, TWD, KRW

This enables clients to:
- Specify which currencies they accept for deposits
- Provide their bank accounts for off-ramp withdrawals
- Support regional operations (e.g., GrabFood Thailand uses THB, GrabFood Singapore uses SGD)

**Status:** ✅ Schema Ready, Pending Database & UI Implementation
