# Proxify Implementation Plan - Payment Flow

## Overview

This document outlines the complete payment flow implementation for Proxify, focusing on **business-to-business bank transfers** (NOT PromptPay/consumer payments).

**Key Concept:** Clients (product owners) transfer funds from their **business bank account** to Proxify's **business bank account** on behalf of their end-users.

---

## Complete Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT BUSINESS (Shopify Seller, Gig Platform, etc.)       │
│                                                             │
│ Business Bank Account: DBS/OCBC/UOB (Singapore)            │
│ Holds: Escrow funds from end-users                         │
│ Balance: $100,000 SGD (idle, earning 0%)                   │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ STEP 1: Client API Call
                      │ POST /api/v1/deposits/create
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ PROXIFY API                                                 │
│                                                             │
│ Returns: Bank transfer instructions                        │
│ - Proxify business bank account details                    │
│ - Amount to transfer                                        │
│ - Reference ID for tracking                                │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ STEP 2: Business Bank Transfer
                      │ Client → Proxify Bank Account
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ PROXIFY BUSINESS BANK ACCOUNT                               │
│                                                             │
│ Bank: DBS Bank (Singapore)                                 │
│ Account: Multi-currency (SGD, USD, EUR)                    │
│ Receives: $10,000 SGD from client                          │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ STEP 3: Bank Notification/Webhook
                      │ (or manual check in beta)
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ PROXIFY BACKEND PROCESSING                                  │
│                                                             │
│ 1. Match bank transfer to deposit order (via reference)    │
│ 2. Convert SGD → USDC (via Binance/Kraken)                │
│ 3. Transfer USDC to client custodial wallet                │
│ 4. Allocate shares to end-user                             │
│ 5. Deploy USDC to DeFi protocols                           │
│ 6. Send webhook to client (deposit completed)              │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ STEP 4: DeFi Deployment
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ DEFI PROTOCOLS                                              │
│                                                             │
│ - 70% AAVE (4.2% APY)                                       │
│ - 20% Curve (5.1% APY)                                      │
│ - 10% Uniswap (8.3% APY)                                    │
│ → Blended: 4.8% APY                                         │
│ → Yield accumulates daily                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Phase 1: API Endpoints (MOCK for Demo)

#### 1.1 Create Deposit Order

**Endpoint:** `POST /api/v1/deposits/create`

**Request:**
```typescript
{
  "clientId": "CLI-123",          // Client's ID (from API key)
  "userId": "end_user_456",       // End-user in client's system
  "amount": "10000",              // Amount in fiat currency
  "currency": "SGD",              // Fiat currency
  "reference": "ORDER-789"        // Client's internal reference (optional)
}
```

**Response:**
```typescript
{
  "orderId": "DEP-20251126-ABC123",
  "status": "pending_payment",

  // ✅ IMPORTANT: Bank transfer instructions (NOT PromptPay!)
  "paymentInstructions": {
    "paymentMethod": "bank_transfer",     // ← Business bank transfer
    "bankName": "DBS Bank (Singapore)",
    "accountNumber": "123-456789-0",      // ← YOUR Proxify account
    "accountName": "Proxify Pte. Ltd.",
    "swiftCode": "DBSSSGSG",
    "currency": "SGD",
    "amount": "10000.00",

    // ✅ CRITICAL: Reference ID for matching deposits
    "reference": "DEP-20251126-ABC123",

    "instructions": "Transfer from your business bank account. Include reference ID in transfer notes for automatic processing.",
    "estimatedProcessingTime": "Same-day (if transferred before 3 PM SGT)"
  },

  // Expected crypto amount after conversion
  "expectedCryptoAmount": "7,407.41 USDC",
  "exchangeRate": "1 SGD = 0.7407 USD",
  "fees": {
    "conversionFee": "150.00 SGD",    // 1.5%
    "networkFee": "0",                 // No network fee for bank transfer
    "totalFee": "150.00 SGD"
  },

  "expiresAt": "2025-11-28T15:00:00Z",  // 48 hours to complete transfer
  "createdAt": "2025-11-26T10:00:00Z"
}
```

**Implementation:**
```typescript
// apps/b2b-api/src/router/deposit.router.ts

createDeposit: async ({ body, req }) => {
  const clientId = (req as any).client?.id;

  // 1. Create deposit order in database
  const deposit = await depositService.createDeposit({
    clientId,
    userId: body.userId,
    depositType: "external",
    fiatAmount: body.amount,
    fiatCurrency: body.currency,
    cryptoCurrency: "USDC",
    gatewayProvider: "bank_transfer",
    status: "pending_payment",
  });

  // 2. Generate bank transfer instructions
  const bankInstructions = {
    paymentMethod: "bank_transfer",
    bankName: process.env.PROXIFY_BANK_NAME || "DBS Bank (Singapore)",
    accountNumber: process.env.PROXIFY_BANK_ACCOUNT || "123-456789-0",
    accountName: process.env.PROXIFY_BANK_ACCOUNT_NAME || "Proxify Pte. Ltd.",
    swiftCode: process.env.PROXIFY_BANK_SWIFT || "DBSSSGSG",
    currency: body.currency,
    amount: body.amount,
    reference: deposit.orderId, // ← CRITICAL for matching
    instructions: `Transfer from your business bank account to the account above. IMPORTANT: Include reference '${deposit.orderId}' in transfer notes.`,
    estimatedProcessingTime: "Same-day (if transferred before 3 PM SGT)",
  };

  // 3. Calculate expected crypto amount (mock exchange rate)
  const exchangeRate = await getExchangeRate(body.currency, "USD");
  const expectedCryptoAmount = (parseFloat(body.amount) * exchangeRate * 0.985).toFixed(2); // 1.5% fee

  return {
    status: 201,
    body: {
      orderId: deposit.orderId,
      status: "pending_payment",
      paymentInstructions: bankInstructions,
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
},
```

---

#### 1.2 Simulate Payment Completion (Demo Only)

**Endpoint:** `POST /api/v1/deposits/:orderId/simulate-payment`

**Purpose:** For demo, simulate that client completed bank transfer

**Request:**
```typescript
{
  "bankTransactionId": "DBS-TXN-123456",  // Mock bank transaction ID
  "paidAmount": "10000.00",
  "paidCurrency": "SGD"
}
```

**Response:**
```typescript
{
  "success": true,
  "orderId": "DEP-20251126-ABC123",
  "status": "processing",
  "message": "Bank transfer confirmed. Converting SGD to USDC...",
  "estimatedCompletion": "2025-11-26T10:15:00Z"  // ~15 minutes
}
```

**Implementation:**
```typescript
// apps/b2b-api/src/router/deposit.router.ts

simulatePayment: async ({ params, body, req }) => {
  const clientId = (req as any).client?.id;

  // 1. Get deposit
  const deposit = await depositService.getDepositByOrderId(params.orderId);
  if (!deposit || deposit.clientId !== clientId) {
    return { status: 404, body: { error: "Deposit not found" } };
  }

  // 2. Verify status
  if (deposit.status !== "pending_payment") {
    return {
      status: 400,
      body: { error: `Deposit is already ${deposit.status}` }
    };
  }

  // 3. Verify amount
  if (deposit.fiatAmount !== body.paidAmount) {
    return {
      status: 400,
      body: {
        error: `Amount mismatch. Expected: ${deposit.fiatAmount}, Paid: ${body.paidAmount}`
      },
    };
  }

  // 4. Update status to processing
  await depositService.updateStatus(params.orderId, "processing");

  // 5. Simulate async processing (2-second delay)
  setTimeout(async () => {
    // Convert fiat → USDC (mock)
    const exchangeRate = await getExchangeRate(body.paidCurrency, "USD");
    const cryptoAmount = (parseFloat(body.paidAmount) * exchangeRate * 0.985).toFixed(2);

    // Complete deposit
    await depositService.completeDeposit({
      orderId: params.orderId,
      chain: "ethereum",
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      tokenSymbol: "USDC",
      cryptoAmount,
      gatewayFee: (parseFloat(body.paidAmount) * 0.015).toString(),
      proxifyFee: "0",
      networkFee: "0",
      totalFees: (parseFloat(body.paidAmount) * 0.015).toString(),
    });

    logger.info("Deposit completed", { orderId: params.orderId, cryptoAmount });
  }, 2000);

  return {
    status: 200,
    body: {
      success: true,
      orderId: params.orderId,
      status: "processing",
      message: "Bank transfer confirmed. Converting SGD to USDC...",
      estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    },
  };
},
```

---

#### 1.3 Check Deposit Status

**Endpoint:** `GET /api/v1/deposits/:orderId`

**Response:**
```typescript
{
  "orderId": "DEP-20251126-ABC123",
  "status": "completed",  // pending_payment | processing | completed | failed
  "fiatAmount": "10000.00",
  "fiatCurrency": "SGD",
  "cryptoAmount": "7,407.41",
  "cryptoCurrency": "USDC",
  "fees": {
    "conversionFee": "150.00",
    "totalFee": "150.00"
  },
  "createdAt": "2025-11-26T10:00:00Z",
  "completedAt": "2025-11-26T10:15:23Z",
  "timeline": [
    {
      "status": "pending_payment",
      "timestamp": "2025-11-26T10:00:00Z",
      "note": "Awaiting bank transfer"
    },
    {
      "status": "processing",
      "timestamp": "2025-11-26T10:10:00Z",
      "note": "Bank transfer received, converting to USDC"
    },
    {
      "status": "completed",
      "timestamp": "2025-11-26T10:15:23Z",
      "note": "USDC deposited to custodial wallet"
    }
  ]
}
```

---

### Phase 2: Frontend - Payment Session Simulation

#### 2.1 Demo Payment Page

**File:** `apps/whitelabel-web/src/pages/demo/payment-session/[orderId].tsx`

**Purpose:** Simulate client making bank transfer (for demo purposes)

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { b2bApiClient } from '@/api/b2bClient';

export default function PaymentSessionPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'instructions' | 'simulating' | 'success'>('instructions');

  useEffect(() => {
    if (orderId) {
      // Fetch deposit details
      fetch(`/api/v1/deposits/${orderId}`)
        .then(r => r.json())
        .then(setDeposit)
        .catch(console.error);
    }
  }, [orderId]);

  const handleSimulatePayment = async () => {
    setLoading(true);
    setStep('simulating');

    try {
      // Simulate 3-second "bank transfer in progress"
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Call simulate payment endpoint
      await b2bApiClient.simulatePayment(orderId as string, {
        bankTransactionId: `DBS-${Date.now()}`,
        paidAmount: deposit.fiatAmount,
        paidCurrency: deposit.fiatCurrency,
      });

      // Show success
      setStep('success');

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push(`/demo/deposit-success?orderId=${orderId}`);
      }, 2000);
    } catch (error) {
      console.error('Payment simulation failed:', error);
      setLoading(false);
      setStep('instructions');
    }
  };

  if (!deposit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deposit details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Step 1: Bank Transfer Instructions */}
        {step === 'instructions' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Complete Bank Transfer</h1>
              <p className="text-gray-600 mt-2">Transfer funds from your business bank account</p>
            </div>

            {/* Bank Account Details */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-blue-900 mb-4">Transfer To:</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-semibold">{deposit.paymentInstructions.bankName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-mono font-semibold">{deposit.paymentInstructions.accountNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-semibold">{deposit.paymentInstructions.accountName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">SWIFT Code:</span>
                  <span className="font-mono font-semibold">{deposit.paymentInstructions.swiftCode}</span>
                </div>

                <div className="border-t-2 border-blue-200 my-4"></div>

                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-blue-900">{deposit.fiatCurrency} {deposit.fiatAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Reference ID:</span>
                  <span className="font-mono font-semibold text-red-600">{deposit.paymentInstructions.reference}</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Must include reference ID: <strong>{deposit.paymentInstructions.reference}</strong></li>
                      <li>Transfer from your registered business bank account</li>
                      <li>Processing time: Same-day if transferred before 3 PM SGT</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-3">You will receive:</h3>
              <div className="flex justify-between items-center">
                <span className="text-green-700">Crypto Amount:</span>
                <span className="text-2xl font-bold text-green-900">{deposit.expectedCryptoAmount}</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Exchange rate: {deposit.exchangeRate} • Fee: {deposit.fees.conversionFee} {deposit.fiatCurrency}
              </p>
            </div>

            {/* Demo Simulation Button */}
            <div className="border-t-2 border-gray-200 pt-6">
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold text-white ${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : '🎬 Simulate Bank Transfer (Demo)'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Demo Mode: This simulates completing the bank transfer.<br/>
                In production, you would actually transfer funds via your banking app,<br/>
                and we would receive confirmation via bank webhook.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Simulating Transfer */}
        {step === 'simulating' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="animate-pulse mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Bank Transfer</h2>
            <p className="text-gray-600 mb-8">
              Simulating transfer from your business account to Proxify account...
            </p>

            <div className="max-w-md mx-auto">
              <div className="space-y-4 text-left">
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Initiating bank transfer</span>
                </div>

                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-3 animate-spin">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Confirming with DBS Bank...</span>
                </div>

                <div className="flex items-center text-sm opacity-50">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-3"></div>
                  <span className="text-gray-500">Converting SGD to USDC</span>
                </div>

                <div className="flex items-center text-sm opacity-50">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-3"></div>
                  <span className="text-gray-500">Depositing to custodial wallet</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Bank transfer received and processing...
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-sm text-gray-600 mb-1">Deposit ID</div>
              <div className="font-mono text-lg font-semibold">{orderId}</div>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
```

---

#### 2.2 Add Simulate Payment Method to API Client

**File:** `apps/whitelabel-web/src/api/b2bClient.ts`

```typescript
// Add this method to B2BAPIClient class

async simulatePayment(orderId: string, data: {
  bankTransactionId: string;
  paidAmount: string;
  paidCurrency: string;
}) {
  console.log("[b2bApiClient] Simulating bank payment:", { orderId, data });

  const response = await this.axios.post<unknown>(
    `${this.baseURL}/api/v1/deposits/${orderId}/simulate-payment`,
    data
  );

  console.log("[b2bApiClient] Payment simulation response:", response.data);
  return response.data;
}
```

---

### Phase 3: Client Registration - Add Bank Accounts

#### 3.1 Update Client Registration Schema

**File:** `packages/b2b-api-core/contracts/client.ts`

```typescript
// Add to RegisterClientSchema
const RegisterClientSchema = z.object({
  companyName: z.string(),
  businessType: z.string(),
  email: z.string().email(),
  country: z.string(),

  // NEW: Bank accounts for off-ramp
  bankAccounts: z.array(z.object({
    currency: z.string().describe("SGD, USD, EUR, etc."),
    bankName: z.string(),
    accountNumber: z.string(),
    accountName: z.string(),
    swiftCode: z.string().optional(),
    routingNumber: z.string().optional(),
    branchCode: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),

  // ... existing fields
});
```

---

### Phase 4: Withdrawal Flow (Two Options)

#### 4.1 Withdrawal Request (Fiat Off-Ramp)

**Endpoint:** `POST /api/v1/withdrawals/create`

**Request:**
```typescript
{
  "clientId": "CLI-123",
  "userId": "end_user_456",
  "amount": "7500.00",
  "withdrawalType": "fiat",      // ← Fiat off-ramp
  "currency": "SGD",
  "bankAccountId": "BANK-789"    // Reference to registered bank account
}
```

**Response:**
```typescript
{
  "withdrawalId": "WTH-20251126-XYZ789",
  "status": "pending",
  "fiatAmount": "10,125.00",     // USDC → SGD conversion
  "fiatCurrency": "SGD",
  "cryptoAmount": "7,500.00",
  "cryptoCurrency": "USDC",
  "bankDetails": {
    "bankName": "DBS Bank",
    "accountNumber": "***-****789-0",  // Masked for security
    "accountName": "Client Company Ltd"
  },
  "estimatedCompletion": "2025-11-27T02:00:00Z",  // Next batch window
  "createdAt": "2025-11-26T14:30:00Z"
}
```

---

#### 4.2 Withdrawal Request (Direct USDC Transfer)

**Endpoint:** `POST /api/v1/withdrawals/create`

**Request:**
```typescript
{
  "clientId": "CLI-123",
  "userId": "end_user_456",
  "amount": "7500.00",
  "withdrawalType": "crypto",        // ← Direct USDC
  "destinationAddress": "0xabc123...",
  "chain": "ethereum"                // or "base", "polygon"
}
```

**Response:**
```typescript
{
  "withdrawalId": "WTH-20251126-XYZ789",
  "status": "processing",
  "cryptoAmount": "7,500.00",
  "cryptoCurrency": "USDC",
  "chain": "ethereum",
  "destinationAddress": "0xabc123...",
  "transactionHash": "0xdef456...",  // On-chain tx
  "estimatedCompletion": "2025-11-26T14:35:00Z",  // ~5 minutes
  "createdAt": "2025-11-26T14:30:00Z"
}
```

---

## Environment Variables Needed

```bash
# .env (apps/b2b-api)

# Proxify Bank Account (Singapore)
PROXIFY_BANK_NAME="DBS Bank (Singapore)"
PROXIFY_BANK_ACCOUNT="123-456789-0"
PROXIFY_BANK_ACCOUNT_NAME="Proxify Pte. Ltd."
PROXIFY_BANK_SWIFT="DBSSSGSG"

# Exchange Accounts (for SGD ↔ USDC conversion)
BINANCE_API_KEY="your_binance_api_key"
BINANCE_API_SECRET="your_binance_api_secret"

# Custodial Wallet
PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_app_secret"
CUSTODIAL_WALLET_ADDRESS="0x..."

# Demo Mode
DEMO_MODE="true"  # Set to false for production
```

---

## Database Schema Updates

### Add to `deposits` table:

```sql
ALTER TABLE deposits
  ADD COLUMN bank_transaction_id VARCHAR(255),
  ADD COLUMN bank_confirmed_at TIMESTAMP,
  ADD COLUMN exchange_rate DECIMAL(20, 10);
```

### Add `client_bank_accounts` table:

```sql
CREATE TABLE client_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  currency VARCHAR(10) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  swift_code VARCHAR(20),
  routing_number VARCHAR(20),
  branch_code VARCHAR(20),
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(client_id, currency, account_number)
);

CREATE INDEX idx_client_bank_accounts_client ON client_bank_accounts(client_id);
```

---

## Implementation Timeline

### Week 1 (Demo Prep):
- [x] Mock deposit creation endpoint
- [x] Mock payment simulation endpoint
- [ ] Frontend: Payment session page
- [ ] Frontend: Success page
- [ ] Demo script preparation

### Week 2 (Beta):
- [ ] Real DBS bank account setup
- [ ] Manual bank transfer monitoring
- [ ] Real USDC conversion (Binance/Kraken)
- [ ] Client bank account registration

### Week 3-4 (Production):
- [ ] Bank API integration (DBS/OCBC webhooks)
- [ ] Automated deposit matching
- [ ] Batch withdrawal system
- [ ] Monitoring & alerts

---

## Key Differences from PromptPay/Consumer Payments

| Aspect | PromptPay (Consumer) | Bank Transfer (B2B) |
|--------|---------------------|---------------------|
| **Sender** | End-user's personal bank | Client's business bank |
| **Payment Method** | QR code scan | Wire transfer / GIRO |
| **Speed** | Instant (real-time) | Same-day to 1-2 days |
| **Verification** | Phone number | Account number + SWIFT |
| **Amount Limits** | Low ($1K-5K) | High (unlimited) |
| **Fees** | Free or minimal | Wire fees ($10-30) |
| **Use Case** | Retail, gig workers | B2B escrow, bulk transfers |

---

## Notes for Implementation

1. **NO PromptPay QR codes** - This is business-to-business banking
2. **Bank transfer instructions** - Show Proxify's business bank account details
3. **Reference ID critical** - Used to match incoming bank transfers to deposit orders
4. **Processing time** - Same-day if before cutoff (usually 3 PM), next day otherwise
5. **Demo mode** - Simulate instant completion for demo, but show realistic timeline
6. **Two withdrawal options** - Fiat off-ramp (most clients) or direct USDC (Web3 native)

---

**Status:** Ready for implementation
**Priority:** High - Core payment flow
**Timeline:** Week 1 for demo, Week 2-4 for production
**Next Step:** Build frontend payment session page
