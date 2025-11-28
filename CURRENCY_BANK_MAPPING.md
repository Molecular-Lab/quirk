# Currency-Specific Bank Account Mapping

## Overview

Each currency has a dedicated Proxify bank account. When client creates deposit order with a specific currency, we return the corresponding bank transfer instructions.

---

## Supported Currencies & Bank Accounts

### 1. Singapore Dollar (SGD)

**Currency Code:** `SGD`

**Proxify Bank Account:**
```json
{
  "currency": "SGD",
  "bankName": "DBS Bank (Singapore)",
  "accountNumber": "123-456789-0",
  "accountName": "Proxify Pte. Ltd.",
  "swiftCode": "DBSSSGSG",
  "bankCode": "7171",
  "branchCode": "001",
  "instructions": "Transfer from your business bank account. Include reference ID in transfer notes."
}
```

**Payment Methods Available:**
- Local bank transfer (FAST)
- GIRO
- International SWIFT

**Processing Time:** Same-day (if transferred before 3 PM SGT)

---

### 2. US Dollar (USD)

**Currency Code:** `USD`

**Proxify Bank Account:**
```json
{
  "currency": "USD",
  "bankName": "Citibank N.A. (Singapore Branch)",
  "accountNumber": "9876543210",
  "accountName": "Proxify Pte. Ltd.",
  "swiftCode": "CITISGSG",
  "routingNumber": "021000089",
  "instructions": "Wire transfer from your USD business account. Include reference ID."
}
```

**Payment Methods Available:**
- SWIFT wire transfer
- ACH (if US-based sender)

**Processing Time:** 1-2 business days (international wire)

---

### 3. Euro (EUR)

**Currency Code:** `EUR`

**Proxify Bank Account:**
```json
{
  "currency": "EUR",
  "bankName": "Wise (TransferWise Europe SA)",
  "accountNumber": "BE12 3456 7890 1234",
  "accountName": "Proxify Pte. Ltd.",
  "swiftCode": "TRWIBEB1XXX",
  "iban": "BE12 3456 7890 1234",
  "instructions": "SEPA transfer from your EUR business account. Include reference ID."
}
```

**Payment Methods Available:**
- SEPA transfer
- SWIFT

**Processing Time:** Same-day (SEPA), 1-2 days (SWIFT)

---

### 4. Thai Baht (THB)

**Currency Code:** `THB`

**Proxify Bank Account:**
```json
{
  "currency": "THB",
  "bankName": "Kasikorn Bank (K-Bank)",
  "accountNumber": "123-4-56789-0",
  "accountName": "Proxify (Thailand) Co., Ltd.",
  "swiftCode": "KASITHBK",
  "bankCode": "004",
  "branchCode": "0001",
  "promptPayId": "0891234567",
  "instructions": "Transfer from your THB business account. Include reference ID. PromptPay available for amounts < 2M THB."
}
```

**Payment Methods Available:**
- Local bank transfer
- PromptPay (for amounts < 2M THB)

**Processing Time:** Instant (PromptPay), same-day (bank transfer)

---

### 5. Taiwan Dollar (TWD)

**Currency Code:** `TWD`

**Proxify Bank Account:**
```json
{
  "currency": "TWD",
  "bankName": "Cathay United Bank",
  "accountNumber": "123-45-678901-2",
  "accountName": "Proxify Taiwan Ltd.",
  "swiftCode": "UBOBTWTPXXX",
  "bankCode": "013",
  "branchCode": "0001",
  "instructions": "Transfer from your TWD business account. Include reference ID."
}
```

**Payment Methods Available:**
- Local bank transfer
- ATM transfer

**Processing Time:** Same-day

---

### 6. Korean Won (KRW)

**Currency Code:** `KRW`

**Proxify Bank Account:**
```json
{
  "currency": "KRW",
  "bankName": "Shinhan Bank",
  "accountNumber": "110-123-456789",
  "accountName": "Proxify Korea Inc.",
  "swiftCode": "SHBKKRSE",
  "bankCode": "088",
  "branchCode": "001",
  "instructions": "Transfer from your KRW business account. Include reference ID."
}
```

**Payment Methods Available:**
- Local bank transfer
- Internet banking

**Processing Time:** Same-day

---

## Implementation: Currency-Based Bank Selection

### Backend Logic

**File:** `apps/b2b-api/src/services/bank-account.service.ts`

```typescript
export interface BankAccount {
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode: string;
  bankCode?: string;
  branchCode?: string;
  routingNumber?: string;
  iban?: string;
  promptPayId?: string;
  instructions: string;
}

export class BankAccountService {
  // Mock bank accounts (in production, fetch from database or config)
  private static BANK_ACCOUNTS: Record<string, BankAccount> = {
    SGD: {
      currency: "SGD",
      bankName: "DBS Bank (Singapore)",
      accountNumber: "123-456789-0",
      accountName: "Proxify Pte. Ltd.",
      swiftCode: "DBSSSGSG",
      bankCode: "7171",
      branchCode: "001",
      instructions: "Transfer from your business bank account. Include reference ID in transfer notes for automatic processing.",
    },

    USD: {
      currency: "USD",
      bankName: "Citibank N.A. (Singapore Branch)",
      accountNumber: "9876543210",
      accountName: "Proxify Pte. Ltd.",
      swiftCode: "CITISGSG",
      routingNumber: "021000089",
      instructions: "Wire transfer from your USD business account. Include reference ID in wire instructions.",
    },

    EUR: {
      currency: "EUR",
      bankName: "Wise (TransferWise Europe SA)",
      accountNumber: "BE12 3456 7890 1234",
      accountName: "Proxify Pte. Ltd.",
      swiftCode: "TRWIBEB1XXX",
      iban: "BE12 3456 7890 1234",
      instructions: "SEPA transfer from your EUR business account. Include reference ID in transfer notes.",
    },

    THB: {
      currency: "THB",
      bankName: "Kasikorn Bank (K-Bank)",
      accountNumber: "123-4-56789-0",
      accountName: "Proxify (Thailand) Co., Ltd.",
      swiftCode: "KASITHBK",
      bankCode: "004",
      branchCode: "0001",
      promptPayId: "0891234567",
      instructions: "Transfer from your THB business account. Include reference ID. PromptPay available for amounts < 2M THB.",
    },

    TWD: {
      currency: "TWD",
      bankName: "Cathay United Bank",
      accountNumber: "123-45-678901-2",
      accountName: "Proxify Taiwan Ltd.",
      swiftCode: "UBOBTWTPXXX",
      bankCode: "013",
      branchCode: "0001",
      instructions: "Transfer from your TWD business account. Include reference ID in transfer notes.",
    },

    KRW: {
      currency: "KRW",
      bankName: "Shinhan Bank",
      accountNumber: "110-123-456789",
      accountName: "Proxify Korea Inc.",
      swiftCode: "SHBKKRSE",
      bankCode: "088",
      branchCode: "001",
      instructions: "Transfer from your KRW business account. Include reference ID in transfer notes.",
    },
  };

  static getBankAccount(currency: string): BankAccount {
    const account = this.BANK_ACCOUNTS[currency.toUpperCase()];
    if (!account) {
      throw new Error(`Currency ${currency} not supported`);
    }
    return account;
  }

  static getSupportedCurrencies(): string[] {
    return Object.keys(this.BANK_ACCOUNTS);
  }

  static isCurrencySupported(currency: string): boolean {
    return currency.toUpperCase() in this.BANK_ACCOUNTS;
  }
}
```

---

### Updated Deposit Router

**File:** `apps/b2b-api/src/router/deposit.router.ts`

```typescript
import { BankAccountService } from '../services/bank-account.service';

// POST /deposits/fiat - Create fiat deposit
createFiatDeposit: async ({ body, req }) => {
  try {
    const clientId = (req as any).client?.id;
    if (!clientId) {
      return {
        status: 401 as const,
        body: { success: false, error: "Authentication failed" },
      };
    }

    // Validate currency is supported
    if (!BankAccountService.isCurrencySupported(body.currency)) {
      return {
        status: 400 as const,
        body: {
          success: false,
          error: `Currency ${body.currency} not supported. Supported: ${BankAccountService.getSupportedCurrencies().join(", ")}`,
        },
      };
    }

    // Create deposit order
    const deposit = await depositService.createDeposit({
      clientId,
      userId: body.userId,
      depositType: "external",
      fiatAmount: body.amount,
      fiatCurrency: body.currency,
      cryptoCurrency: body.tokenSymbol || "USDC",
      gatewayProvider: "bank_transfer",
    });

    // Get currency-specific bank account
    const bankAccount = BankAccountService.getBankAccount(body.currency);

    // Calculate expected crypto amount
    const exchangeRate = await getExchangeRate(body.currency, "USD");
    const expectedCryptoAmount = (parseFloat(body.amount) * exchangeRate * 0.985).toFixed(2);

    // Generate payment instructions
    const paymentInstructions = {
      paymentMethod: "bank_transfer",
      currency: body.currency,
      amount: body.amount,
      reference: deposit.orderId, // ← CRITICAL for matching

      // Currency-specific bank details
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountName: bankAccount.accountName,
      swiftCode: bankAccount.swiftCode,
      ...(bankAccount.bankCode && { bankCode: bankAccount.bankCode }),
      ...(bankAccount.branchCode && { branchCode: bankAccount.branchCode }),
      ...(bankAccount.routingNumber && { routingNumber: bankAccount.routingNumber }),
      ...(bankAccount.iban && { iban: bankAccount.iban }),
      ...(bankAccount.promptPayId && { promptPayId: bankAccount.promptPayId }),

      instructions: bankAccount.instructions,

      // Payment session URL
      paymentSessionUrl: `${process.env.FRONTEND_URL}/payment-session/${deposit.orderId}`,
    };

    logger.info("Deposit order created", {
      orderId: deposit.orderId,
      currency: body.currency,
      amount: body.amount,
      bankAccount: bankAccount.bankName,
    });

    return {
      status: 201 as const,
      body: {
        orderId: deposit.orderId,
        status: "pending_payment" as const,
        paymentInstructions,
        expectedCryptoAmount: `${expectedCryptoAmount} USDC`,
        exchangeRate: `1 ${body.currency} = ${exchangeRate} USD`,
        fees: {
          conversionFee: (parseFloat(body.amount) * 0.015).toFixed(2),
          networkFee: "0",
          totalFee: (parseFloat(body.amount) * 0.015).toFixed(2),
        },
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        createdAt: deposit.createdAt.toISOString(),
      },
    };
  } catch (error) {
    logger.error("Failed to create fiat deposit", { error, body });
    return {
      status: 400 as const,
      body: { success: false, error: "Failed to create fiat deposit" },
    };
  }
},
```

---

### Updated Client Registration Schema

**File:** `packages/b2b-api-core/contracts/client.ts`

```typescript
// Add supported currencies configuration
const RegisterClientSchema = z.object({
  companyName: z.string(),
  businessType: z.string(),
  email: z.string().email(),
  country: z.string(),

  // NEW: Supported currencies for on/off-ramp
  supportedCurrencies: z.array(
    z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"])
  ).min(1).describe("Currencies this client wants to support for deposits/withdrawals"),

  // NEW: Bank accounts for off-ramp (one per currency)
  bankAccounts: z.array(z.object({
    currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]),
    bankName: z.string(),
    accountNumber: z.string(),
    accountName: z.string(),
    swiftCode: z.string().optional(),
    routingNumber: z.string().optional(),
    iban: z.string().optional(),
    branchCode: z.string().optional(),
    bankCode: z.string().optional(),
    isPrimary: z.boolean().default(false),
    isVerified: z.boolean().default(false),
  })).optional().describe("Client's bank accounts for receiving off-ramp funds"),

  // ... existing fields
  walletType: z.enum(["MANAGED", "USER_OWNED"]),
  privyOrganizationId: z.string(),
  privyWalletAddress: z.string().optional(),
  privyEmail: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
});
```

---

### Example: Client Registration Request

```json
POST /api/v1/clients/register
{
  "companyName": "Shopify Seller Inc",
  "businessType": "e-commerce",
  "email": "[email protected]",
  "country": "SG",

  // NEW: Specify which currencies they want
  "supportedCurrencies": ["SGD", "USD", "EUR"],

  // NEW: Their bank accounts for withdrawal
  "bankAccounts": [
    {
      "currency": "SGD",
      "bankName": "DBS Bank",
      "accountNumber": "987-654321-0",
      "accountName": "Shopify Seller Inc",
      "swiftCode": "DBSSSGSG",
      "isPrimary": true
    },
    {
      "currency": "USD",
      "bankName": "Citibank",
      "accountNumber": "1234567890",
      "accountName": "Shopify Seller Inc",
      "swiftCode": "CITIUS33",
      "routingNumber": "021000089",
      "isPrimary": false
    }
  ],

  "walletType": "MANAGED",
  "privyOrganizationId": "clvxxxxxx",
  "privyWalletAddress": "0xabc123...",
  "privyEmail": "[email protected]"
}
```

---

## Payment Session Page Update

**File:** `apps/whitelabel-web/src/pages/payment-session/[orderId].tsx`

**Key Changes:**
1. Show currency-specific bank details
2. Different UI for different currencies (e.g., show PromptPay for THB)
3. Mock banking interface per currency

```typescript
// Example: Currency-specific UI
{deposit.currency === 'THB' && deposit.paymentInstructions.promptPayId && (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">Option 1: PromptPay (Instant)</h3>
    <div className="bg-blue-50 p-4 rounded">
      <p>PromptPay ID: {deposit.paymentInstructions.promptPayId}</p>
      <p className="text-sm text-gray-600">
        Available for amounts less than 2M THB
      </p>
    </div>
  </div>
)}

{deposit.currency === 'SGD' && (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">FAST Transfer (Same-Day)</h3>
    <p className="text-sm text-gray-600">
      Transfer before 3 PM SGT for same-day processing
    </p>
  </div>
)}

{deposit.currency === 'USD' && (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">Wire Transfer</h3>
    <p className="text-sm text-gray-600">
      International wire: 1-2 business days
    </p>
  </div>
)}
```

---

## Database Schema Updates

### Add to `clients` table:

```sql
ALTER TABLE clients
  ADD COLUMN supported_currencies TEXT[] DEFAULT ARRAY['SGD'];

-- Example: Client supports SGD and USD
UPDATE clients SET supported_currencies = ARRAY['SGD', 'USD'] WHERE id = 'cli_123';
```

### Update `client_bank_accounts` table:

```sql
-- Add unique constraint: one primary account per currency
CREATE UNIQUE INDEX idx_client_bank_primary
  ON client_bank_accounts(client_id, currency)
  WHERE is_primary = true;
```

---

## Environment Variables

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_PAYMENT_SESSION_URL=http://localhost:3000/payment-session

# Backend
FRONTEND_URL=http://localhost:3000
```

---

## Mock Exchange Rates (for demo)

```typescript
// apps/b2b-api/src/services/exchange-rate.service.ts

export async function getExchangeRate(from: string, to: string = "USD"): Promise<number> {
  // Mock rates for demo (in production: use CoinGecko, CoinMarketCap, or Binance API)
  const rates: Record<string, number> = {
    SGD: 0.74,    // 1 SGD = 0.74 USD
    USD: 1.00,    // 1 USD = 1.00 USD
    EUR: 1.09,    // 1 EUR = 1.09 USD
    THB: 0.0286,  // 1 THB = 0.0286 USD (35 THB = 1 USD)
    TWD: 0.032,   // 1 TWD = 0.032 USD (31.25 TWD = 1 USD)
    KRW: 0.00075, // 1 KRW = 0.00075 USD (1,333 KRW = 1 USD)
  };

  return rates[from.toUpperCase()] || 1;
}
```

---

## Summary: What Changed

### 1. ✅ Currency Field Required
- Client specifies currency when creating deposit
- Removed `chain` field (not needed for fiat deposits)
- Made `tokenSymbol` optional (defaults to USDC)

### 2. ✅ Currency → Bank Account Mapping
- 6 supported currencies: SGD, USD, EUR, THB, TWD, KRW
- Each currency maps to specific Proxify bank account
- Bank account details returned in deposit response

### 3. ✅ Client Registration
- Add `supportedCurrencies` array
- Add `bankAccounts` array (client's withdrawal accounts)
- One primary bank account per currency

### 4. ✅ Payment Session URL
- Format: `/payment-session/:orderId`
- Shows currency-specific banking interface
- Mock "Transfer" button for demo

---

## Next Steps

1. **Update deposit contract** - Change `currency` to enum
2. **Create BankAccountService** - Currency mapping logic
3. **Update deposit router** - Use BankAccountService
4. **Build payment session page** - Currency-specific UI
5. **Update client registration** - Add currency config

Want me to implement the payment session page with mock banking UI next?