# Off-Ramp Requirements & Bank Information Collection

> **Status**: Not Urgent - Post-MVP Feature
> **Priority**: Document now, implement later
> **Last Updated**: 2025-12-01

---

## 🎯 **Current Status**

### **What We Have**
✅ **On-Ramp Flow (WORKING)**:
- User deposits fiat via MoonPay/Apple Pay
- Fiat → USDC conversion
- USDC minted to client custodial wallet
- Balance tracked in database

### **What We Need**
❌ **Off-Ramp Flow (NOT IMPLEMENTED)**:
- User withdraws from custodial wallet
- USDC → Fiat conversion
- Fiat sent to user's bank account
- **BLOCKER**: Need to collect client bank information

---

## 🏦 **Bank Information Requirements**

### **Minimum Required Data**

```typescript
interface ClientBankAccount {
  // Identity
  id: string                          // UUID
  client_id: string                   // FK to clients table

  // Account Holder
  account_holder_name: string         // Full legal name
  account_holder_type: 'individual' | 'business'

  // Bank Details
  bank_name: string                   // "Bank of America"
  country: string                     // ISO 3166-1 alpha-2 (e.g., "US")
  currency: string                    // ISO 4217 (e.g., "USD")

  // US Bank Accounts
  account_number?: string             // Last 4 digits for display, full encrypted
  routing_number?: string             // 9 digits for ACH transfers
  account_type?: 'checking' | 'savings'

  // International Bank Accounts
  iban?: string                       // For Europe (up to 34 chars)
  swift_code?: string                 // For international (8-11 chars)
  bic?: string                        // Alternative to SWIFT

  // Address (Required for Compliance)
  address_line1: string
  address_line2?: string
  city: string
  state_province?: string
  postal_code: string
  country_address: string             // Must match bank account country

  // Verification & Security
  is_verified: boolean                // Has bank been verified?
  verification_method?: 'microdeposit' | 'plaid' | 'manual'
  verified_at?: Date
  encrypted_data?: string             // Encrypted full account number

  // Compliance (KYC/AML)
  kyc_status: 'pending' | 'approved' | 'rejected' | 'expired'
  kyc_documents?: string[]            // URLs to uploaded docs
  kyc_verified_at?: Date

  // Timestamps
  created_at: Date
  updated_at: Date
}
```

---

## 📊 **Database Schema**

### **SQL Table Definition**

```sql
-- Client Bank Accounts
CREATE TABLE client_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Account Holder
  account_holder_name VARCHAR(255) NOT NULL,
  account_holder_type VARCHAR(20) NOT NULL CHECK (account_holder_type IN ('individual', 'business')),

  -- Bank Details
  bank_name VARCHAR(255) NOT NULL,
  country CHAR(2) NOT NULL,                    -- ISO 3166-1 alpha-2
  currency CHAR(3) NOT NULL,                   -- ISO 4217

  -- US Bank (ACH)
  account_number_last4 VARCHAR(4),             -- Last 4 digits for display
  routing_number VARCHAR(9),                   -- US only
  account_type VARCHAR(20) CHECK (account_type IN ('checking', 'savings')),

  -- International Bank
  iban VARCHAR(34),                            -- Europe
  swift_code VARCHAR(11),                      -- International
  bic VARCHAR(11),                             -- Alternative to SWIFT

  -- Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country_address CHAR(2) NOT NULL,

  -- Security (Encrypted)
  encrypted_account_number TEXT,               -- Full account number encrypted
  encryption_key_id VARCHAR(100),              -- Which key was used

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50),
  verified_at TIMESTAMPTZ,

  -- Compliance
  kyc_status VARCHAR(50) DEFAULT 'pending',
  kyc_documents JSONB,                         -- Array of document URLs
  kyc_verified_at TIMESTAMPTZ,
  kyc_expires_at TIMESTAMPTZ,                  -- KYC needs renewal

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (
    -- Must have either US bank info OR international bank info
    (routing_number IS NOT NULL AND account_number_last4 IS NOT NULL) OR
    (iban IS NOT NULL OR swift_code IS NOT NULL)
  ),
  CHECK (country = country_address)            -- Bank country must match address country
);

-- Indexes
CREATE INDEX idx_client_bank_accounts_client ON client_bank_accounts(client_id);
CREATE INDEX idx_client_bank_accounts_verified ON client_bank_accounts(is_verified);
CREATE INDEX idx_client_bank_accounts_kyc ON client_bank_accounts(kyc_status);

-- Comments
COMMENT ON TABLE client_bank_accounts IS 'Stores client bank account information for off-ramp withdrawals';
COMMENT ON COLUMN client_bank_accounts.encrypted_account_number IS 'Full account number encrypted with AES-256-GCM';
COMMENT ON COLUMN client_bank_accounts.account_number_last4 IS 'Last 4 digits only, safe to display in UI';
```

---

## 🔐 **Security Requirements**

### **Encryption Strategy**

```typescript
// DO NOT store account numbers in plain text!
// Use encryption at rest + in transit

class BankAccountEncryption {
  private encryptionKey: Buffer  // Stored in AWS KMS or similar

  // Encrypt sensitive data before storing
  async encryptAccountNumber(accountNumber: string): Promise<{
    encrypted: string
    keyId: string
    iv: string
  }> {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv)

    let encrypted = cipher.update(accountNumber, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted: encrypted + authTag.toString('hex'),
      keyId: 'key-2025-01',  // Key rotation tracking
      iv: iv.toString('hex')
    }
  }

  // Decrypt only when needed (off-ramp transaction)
  async decryptAccountNumber(encrypted: string, iv: string): Promise<string> {
    const authTag = Buffer.from(encrypted.slice(-32), 'hex')
    const encryptedData = encrypted.slice(0, -32)

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(iv, 'hex'))
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
```

### **Key Management**
- ✅ Use AWS KMS, Google Cloud KMS, or HashiCorp Vault
- ✅ Rotate encryption keys every 90 days
- ✅ Never commit keys to Git (use environment variables)
- ✅ Log all decryption events for audit

### **Access Control**
```typescript
// Only specific roles can decrypt bank data
const ALLOWED_ROLES = ['system_admin', 'finance_admin', 'off_ramp_executor']

async function decryptBankAccount(userId: string, accountId: string) {
  // Check user has permission
  const user = await getUserById(userId)
  if (!ALLOWED_ROLES.includes(user.role)) {
    throw new Error('Unauthorized: Cannot decrypt bank data')
  }

  // Log access for audit
  await auditLog.create({
    action: 'DECRYPT_BANK_ACCOUNT',
    user_id: userId,
    resource_id: accountId,
    timestamp: new Date(),
  })

  // Proceed with decryption
  const account = await db.client_bank_accounts.findUnique({ where: { id: accountId } })
  const decrypted = await encryption.decryptAccountNumber(
    account.encrypted_account_number,
    account.iv
  )

  return decrypted
}
```

---

## 🖥️ **UI/UX Flow: Bank Account Collection**

### **Where to Collect Bank Info**

**Location**: Client Settings Page → Banking Tab

### **Step-by-Step Form Flow**

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Select Country                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Where is your bank account located?                     │
│                                                         │
│ [Dropdown: Select Country]                              │
│   🇺🇸 United States                                      │
│   🇬🇧 United Kingdom                                     │
│   🇪🇺 European Union                                     │
│   🇨🇦 Canada                                             │
│   ... (more countries)                                  │
│                                                         │
│ [Next →]                                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Step 2: Bank Account Details (US Example)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Account Holder Name *                                   │
│ [_______________________________________________]        │
│                                                         │
│ Bank Name *                                             │
│ [_______________________________________________]        │
│                                                         │
│ Account Type *                                          │
│ ( ) Checking  ( ) Savings                              │
│                                                         │
│ Routing Number (9 digits) *                            │
│ [_______________________________________________]        │
│ ℹ️  Found on the bottom left of your check             │
│                                                         │
│ Account Number *                                        │
│ [_______________________________________________]        │
│ 🔒 Encrypted and stored securely                       │
│                                                         │
│ Confirm Account Number *                                │
│ [_______________________________________________]        │
│                                                         │
│ [← Back]  [Next →]                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Step 3: Billing Address                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Address Line 1 *                                        │
│ [_______________________________________________]        │
│                                                         │
│ Address Line 2 (Optional)                               │
│ [_______________________________________________]        │
│                                                         │
│ City *                                                  │
│ [_______________________________________________]        │
│                                                         │
│ State / Province *                                      │
│ [_______________________________________________]        │
│                                                         │
│ Postal / ZIP Code *                                     │
│ [_______________________________________________]        │
│                                                         │
│ [← Back]  [Next →]                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Step 4: Verification Method                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ How would you like to verify your bank account?         │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ⚡ Instant Verification (Recommended)             │    │
│ │ Connect your bank via Plaid                      │    │
│ │ ✓ Instant                                        │    │
│ │ ✓ Secure                                         │    │
│ │ [Connect with Plaid]                             │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 🕐 Micro-Deposit Verification (1-2 days)         │    │
│ │ We'll send 2 small deposits to your account      │    │
│ │ ⏱️ Takes 1-2 business days                       │    │
│ │ [Use Micro-Deposits]                             │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ [← Back]  [Skip for Now]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Step 5: Review & Submit                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Please review your bank account details:                │
│                                                         │
│ Account Holder: John Doe                                │
│ Bank Name: Bank of America                              │
│ Account Type: Checking                                  │
│ Account Number: ****5678                                │
│ Routing Number: 021000021                               │
│                                                         │
│ Address:                                                │
│ 123 Main Street                                         │
│ San Francisco, CA 94102                                 │
│ United States                                           │
│                                                         │
│ ☑️ I confirm this information is accurate               │
│ ☑️ I authorize Proxify to debit this account for       │
│    withdrawal requests                                  │
│                                                         │
│ [← Back]  [Submit & Verify]                            │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ **Bank Account Verification Methods**

### **Option 1: Plaid Integration (RECOMMENDED)**

**Pros**:
- ✅ Instant verification (no waiting)
- ✅ User-friendly OAuth flow
- ✅ High accuracy
- ✅ Supports 10,000+ banks

**Cons**:
- ❌ Costs money ($0.35-$0.75 per verification)
- ❌ Requires Plaid account

**Implementation**:
```typescript
// Frontend: Plaid Link integration
import { usePlaidLink } from 'react-plaid-link'

const { open, ready } = usePlaidLink({
  token: plaidLinkToken,
  onSuccess: async (publicToken, metadata) => {
    // Exchange public token for access token
    const response = await fetch('/api/bank-accounts/verify-plaid', {
      method: 'POST',
      body: JSON.stringify({ publicToken, metadata })
    })

    // Backend stores access token and fetches account info
    const bankAccount = await response.json()
    console.log('Bank verified:', bankAccount)
  }
})
```

---

### **Option 2: Micro-Deposit Verification (FREE)**

**Pros**:
- ✅ Free (no Plaid fees)
- ✅ Works with any bank
- ✅ Standard industry practice

**Cons**:
- ❌ Takes 1-2 business days
- ❌ User must manually check their bank
- ❌ More support requests

**Implementation**:
```typescript
// Backend: Send micro-deposits via Stripe, Dwolla, or similar
async function sendMicroDeposits(bankAccountId: string) {
  const account = await db.client_bank_accounts.findUnique({ where: { id: bankAccountId } })

  // Generate two random amounts (1-99 cents)
  const amount1 = Math.floor(Math.random() * 99) + 1  // e.g., 32 cents
  const amount2 = Math.floor(Math.random() * 99) + 1  // e.g., 67 cents

  // Send via payment processor
  await stripe.transfers.create({
    amount: amount1,
    currency: 'usd',
    destination: account.stripe_bank_account_id,
    description: 'Proxify verification deposit 1'
  })

  await stripe.transfers.create({
    amount: amount2,
    currency: 'usd',
    destination: account.stripe_bank_account_id,
    description: 'Proxify verification deposit 2'
  })

  // Store amounts in database (for verification)
  await db.micro_deposits.create({
    data: {
      bank_account_id: bankAccountId,
      amount1,
      amount2,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
    }
  })

  // Send email: "Check your bank for two small deposits"
}

// User enters amounts to verify
async function verifyMicroDeposits(bankAccountId: string, amount1: number, amount2: number) {
  const deposits = await db.micro_deposits.findUnique({ where: { bank_account_id: bankAccountId } })

  if (deposits.amount1 === amount1 && deposits.amount2 === amount2) {
    // Success!
    await db.client_bank_accounts.update({
      where: { id: bankAccountId },
      data: {
        is_verified: true,
        verified_at: new Date(),
        verification_method: 'microdeposit'
      }
    })

    return { success: true }
  } else {
    return { success: false, error: 'Amounts do not match' }
  }
}
```

---

## 💸 **Off-Ramp Integration Options**

### **Option 1: MoonPay Off-Ramp**

**Best for**: MVP, quick implementation

**How it works**:
1. User requests withdrawal in dashboard
2. Backend calls MoonPay API to create off-ramp URL
3. User redirected to MoonPay widget
4. MoonPay handles: USDC → Bank transfer
5. MoonPay handles: KYC/AML compliance

**Cost**:
- MoonPay fee: 1-4.5% per transaction
- No setup fee

**Implementation**:
```typescript
// Backend: Generate MoonPay off-ramp URL
async function createOffRampUrl(userId: string, amount: number) {
  const user = await getUserById(userId)
  const bankAccount = await user.getPrimaryBankAccount()

  const moonpay = new MoonPay(process.env.MOONPAY_SECRET_KEY)

  const url = await moonpay.createOffRampUrl({
    walletAddress: user.custodial_wallet_address,
    cryptoCurrency: 'USDC_BASE',
    fiatCurrency: 'USD',
    quoteCurrencyAmount: amount,
    externalCustomerId: userId,
    redirectURL: 'https://yourapp.com/withdrawals/success',
    // Bank details
    bankAccountNumber: bankAccount.decryptedAccountNumber,
    bankRoutingNumber: bankAccount.routing_number,
  })

  return url
}
```

---

### **Option 2: Circle Payouts API**

**Best for**: High volume, lower fees

**How it works**:
1. User requests withdrawal
2. Backend calls Circle API
3. Circle converts USDC → USD
4. Circle sends ACH/Wire to user's bank
5. You handle KYC/AML

**Cost**:
- Circle fee: 0.5-1% per transaction
- Requires Circle Business Account

**Implementation**:
```typescript
// Backend: Circle payout
async function createCirclePayout(userId: string, amount: number) {
  const user = await getUserById(userId)
  const bankAccount = await user.getPrimaryBankAccount()

  const circle = new Circle(process.env.CIRCLE_API_KEY)

  const payout = await circle.payouts.create({
    source: {
      type: 'wallet',
      id: user.circle_wallet_id,
    },
    destination: {
      type: 'wire',  // or 'ach' for US
      bankAccount: {
        accountNumber: bankAccount.decryptedAccountNumber,
        routingNumber: bankAccount.routing_number,
        billingDetails: {
          name: bankAccount.account_holder_name,
          line1: bankAccount.address_line1,
          city: bankAccount.city,
          postalCode: bankAccount.postal_code,
          country: bankAccount.country,
        },
      },
    },
    amount: {
      currency: 'USD',
      amount: amount.toString(),
    },
    metadata: {
      beneficiaryEmail: user.email,
    },
  })

  return payout
}
```

---

### **Option 3: Stripe Connect**

**Best for**: Complex marketplace flows

**How it works**:
1. Clients are Stripe Connect accounts
2. You hold USDC in custody
3. Convert USDC → USD via DEX
4. Transfer USD to client's Stripe balance
5. Client withdraws to their bank via Stripe

**Cost**:
- Stripe fee: 0.25% per payout
- You handle USDC → USD conversion

---

## 🧪 **Testing Strategy**

### **Sandbox Testing**

**Plaid Sandbox**:
```typescript
// Use test credentials
const TEST_BANK_ACCOUNT = {
  routing_number: '110000000',  // Plaid test routing
  account_number: '1111222233330000',
}
```

**Stripe Test Mode**:
```typescript
// Use test API key
const STRIPE_TEST_KEY = 'sk_test_...'

// Test bank account
const TEST_ACH_ACCOUNT = {
  routing_number: '110000000',
  account_number: '000123456789',
}
```

**MoonPay Sandbox**:
```typescript
// Use sandbox environment
const MOONPAY_BASE_URL = 'https://sandbox-api.moonpay.com'
```

---

## 📝 **Compliance Requirements**

### **KYC (Know Your Customer)**

**Individual Accounts**:
- [ ] Government-issued ID (passport, driver's license)
- [ ] Proof of address (utility bill, bank statement <3 months old)
- [ ] Selfie verification (liveness check)

**Business Accounts**:
- [ ] Business registration documents
- [ ] EIN (Employer Identification Number) for US businesses
- [ ] Ultimate Beneficial Owners (UBOs) documentation
- [ ] Articles of incorporation

### **AML (Anti-Money Laundering)**

**Transaction Monitoring**:
- [ ] Flag withdrawals >$10,000 USD
- [ ] Track velocity: >$50,000 in 7 days
- [ ] Check against OFAC sanctions list
- [ ] Require additional verification for high-risk countries

**Suspicious Activity Reporting**:
- [ ] Unusual patterns (many small withdrawals)
- [ ] Rapid deposits followed by withdrawals
- [ ] Mismatched customer profile vs. transaction size

---

## 📊 **Analytics & Monitoring**

### **Metrics to Track**

```typescript
// Off-ramp dashboard metrics
interface OffRampMetrics {
  // Volume
  totalWithdrawalsUSD: number
  dailyWithdrawalsUSD: number
  monthlyWithdrawalsUSD: number

  // Success Rate
  successfulWithdrawals: number
  failedWithdrawals: number
  successRate: number  // percentage

  // Timing
  avgProcessingTime: number  // minutes
  medianProcessingTime: number

  // Failures
  failureReasons: Record<string, number>
  // { 'insufficient_balance': 5, 'bank_rejected': 2 }

  // Bank Accounts
  totalBankAccounts: number
  verifiedBankAccounts: number
  pendingVerifications: number
}
```

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Database & UI (Week 1)**
- [ ] Create `client_bank_accounts` table
- [ ] Create bank account collection form
- [ ] Add validation and error handling
- [ ] Implement encryption for sensitive data

### **Phase 2: Verification (Week 2)**
- [ ] Integrate Plaid OR implement micro-deposit flow
- [ ] Create verification UI
- [ ] Add email notifications
- [ ] Test with sandbox

### **Phase 3: Off-Ramp Provider (Week 3)**
- [ ] Choose provider (MoonPay, Circle, or Stripe)
- [ ] Integrate API
- [ ] Create withdrawal request flow
- [ ] Add transaction history

### **Phase 4: Compliance (Week 4)**
- [ ] Implement KYC verification
- [ ] Add transaction monitoring
- [ ] Create admin dashboard for reviewing withdrawals
- [ ] Add suspicious activity alerts

### **Phase 5: Testing & Launch (Week 5)**
- [ ] End-to-end testing with test accounts
- [ ] Security audit
- [ ] Performance testing
- [ ] Documentation
- [ ] Gradual rollout to clients

---

## ⚠️ **Known Risks & Mitigations**

### **Risk 1: Bank Account Security**
- **Mitigation**: Encrypt at rest, decrypt only when needed, audit all access

### **Risk 2: Failed Withdrawals**
- **Mitigation**: Retry logic, clear error messages, support escalation

### **Risk 3: Compliance Violations**
- **Mitigation**: Regular audits, transaction monitoring, legal review

### **Risk 4: User Frustration (Verification Time)**
- **Mitigation**: Use Plaid for instant verification, clear expectations

---

## 📚 **Related Documentation**

- `MARKET_DASHBOARD_CORE_SPEC.md` - Dashboard where bank info is collected
- `PRODUCT_OWNER_FLOW.md` - Overall product architecture
- Plaid Docs: https://plaid.com/docs/
- Stripe Connect Docs: https://stripe.com/docs/connect
- MoonPay Docs: https://www.moonpay.com/dashboard/api_reference
- Circle Docs: https://developers.circle.com/

---

## ✅ **Checklist Before Launch**

### **Security**
- [ ] Bank data encrypted at rest
- [ ] Encryption keys stored in KMS
- [ ] Access control implemented
- [ ] Audit logging enabled
- [ ] Security audit passed

### **Compliance**
- [ ] KYC flow implemented
- [ ] AML monitoring active
- [ ] Transaction limits enforced
- [ ] Sanctions screening integrated
- [ ] Privacy policy updated

### **User Experience**
- [ ] Bank account form is clear and easy
- [ ] Verification flow is smooth
- [ ] Error messages are helpful
- [ ] Support documentation exists
- [ ] User testing completed

### **Testing**
- [ ] Sandbox testing passed
- [ ] End-to-end flow tested
- [ ] Edge cases covered
- [ ] Performance tested
- [ ] Security tested

---

**Last Updated**: 2025-12-01
**Status**: Documented - Not Yet Implemented
**Priority**: Post-MVP (After Market Dashboard)
**Owner**: wtshai
