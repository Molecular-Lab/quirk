# Mock Payment Implementation (Demo)

## Overview

For demo purposes, we'll implement **mock payment confirmation** without real banking webhooks. This allows testing the full flow without bank partnerships.

---

## Method 1: Fiat Deposit (Mock Bank Transfer)

### Flow:
```
1. POST /deposits/fiat → Create deposit order
   Response: Bank instructions + orderId

2. POST /deposits/fiat/:orderId/mock-confirm → Mock payment confirmation
   (In production: Bank webhook does this automatically)

3. Backend auto-converts (mock) fiat → USDC

4. Backend updates user balance

5. User sees balance updated ✅
```

### Implementation:

#### 1. Create Deposit (Already Done)
```
POST /api/v1/deposits/fiat
{
  "userId": "user_123",
  "amount": "10000",
  "currency": "THB",
  "chain": "ethereum",
  "tokenSymbol": "USDC"
}

Response:
{
  "orderId": "DEP-xxx",
  "status": "pending_payment",
  "paymentInstructions": { ... },
  "expectedCryptoAmount": "285.71"
}
```

#### 2. Mock Payment Confirmation (NEW)
```
POST /api/v1/deposits/fiat/:orderId/mock-confirm
Authorization: x-api-key (client key)

Request:
{
  "bankTransactionId": "MOCK-TXN-123456",
  "paidAmount": "10000",
  "paidCurrency": "THB"
}

Backend:
1. ✅ Verify deposit exists and is pending
2. ✅ Verify amount matches
3. ✅ Mock convert THB → USDC (use fixed rate or API)
4. ✅ Call completeDeposit internally
5. ✅ Update balances

Response:
{
  "success": true,
  "orderId": "DEP-xxx",
  "status": "completed",
  "cryptoAmount": "285.71",
  "mockNote": "Payment confirmed (mock for demo)"
}
```

---

## Method 2: Crypto Direct Deposit (Web3 Native)

### Flow:
```
1. POST /deposits/crypto/initiate → Get custodial wallet address
   Response: Wallet address to send USDC

2. Client transfers USDC on-chain → Real blockchain transaction

3. POST /deposits/crypto/:orderId/complete → Submit tx hash

4. Backend validates tx hash on-chain

5. Backend updates user balance ✅
```

### Implementation:

#### 1. Initiate Crypto Deposit (Already Exists)
```
POST /api/v1/deposits/crypto/initiate
{
  "userId": "user_123",
  "amount": "285.71",
  "chain": "ethereum",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "tokenSymbol": "USDC"
}

Response:
{
  "orderId": "DEP-xxx",
  "status": "pending",
  "custodialWalletAddress": "0x3F450bC83942c44d38C0Be82CAe8194ce8FE5FE5",
  "chain": "ethereum",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "expectedAmount": "285.71",
  "expiresAt": "2025-11-25T16:00:00Z"
}
```

#### 2. Complete Crypto Deposit (Validate TX)
```
POST /api/v1/deposits/crypto/:orderId/complete
{
  "transactionHash": "0xabc123def456..."
}

Backend:
1. ✅ Fetch deposit order
2. ✅ Verify tx hash on blockchain (viem/ethers)
3. ✅ Check: to_address = custodial wallet
4. ✅ Check: token = expected token
5. ✅ Check: amount >= expected amount
6. ✅ Call completeDeposit internally
7. ✅ Update balances

Response:
{
  "success": true,
  "orderId": "DEP-xxx",
  "status": "completed",
  "verifiedAmount": "285.71",
  "blockNumber": 12345678
}
```

---

## Code Implementation

### 1. Add Mock Confirm Endpoint

**Contract:**
```typescript
// packages/b2b-api-core/contracts/deposit.ts

const MockConfirmFiatDepositSchema = z.object({
  bankTransactionId: z.string().describe("Mock bank transaction ID"),
  paidAmount: z.string().describe("Amount paid"),
  paidCurrency: z.string().describe("Currency paid"),
});

export const depositContract = c.router({
  // ... existing endpoints

  // Mock payment confirmation (demo only)
  mockConfirmFiatDeposit: {
    method: "POST",
    path: "/deposits/fiat/:orderId/mock-confirm",
    responses: {
      200: z.object({
        success: z.boolean(),
        orderId: z.string(),
        status: z.string(),
        cryptoAmount: z.string(),
        mockNote: z.string(),
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
    },
    body: MockConfirmFiatDepositSchema,
    summary: "Mock payment confirmation (demo only - replaces bank webhook)",
  },
});
```

**Router:**
```typescript
// apps/b2b-api/src/router/deposit.router.ts

mockConfirmFiatDeposit: async ({ params, body, req }) => {
  try {
    // ✅ Extract clientId from API key
    const clientId = (req as any).client?.id;
    if (!clientId) {
      return {
        status: 401 as const,
        body: { success: false, error: "Authentication failed" },
      };
    }

    logger.info("Mock payment confirmation", {
      orderId: params.orderId,
      bankTxId: body.bankTransactionId,
      amount: body.paidAmount,
      currency: body.paidCurrency,
    });

    // 1. Get deposit
    const deposit = await depositService.getDepositByOrderId(params.orderId);
    if (!deposit) {
      return {
        status: 404 as const,
        body: { success: false, error: "Deposit not found" },
      };
    }

    // 2. Verify deposit belongs to this client
    if (deposit.clientId !== clientId) {
      return {
        status: 403 as const,
        body: { success: false, error: "Not authorized" },
      };
    }

    // 3. Verify deposit is pending
    if (deposit.status !== "pending") {
      return {
        status: 400 as const,
        body: { success: false, error: `Deposit is already ${deposit.status}` },
      };
    }

    // 4. Verify amount matches
    if (deposit.fiatAmount !== body.paidAmount) {
      return {
        status: 400 as const,
        body: {
          success: false,
          error: `Amount mismatch. Expected: ${deposit.fiatAmount}, Paid: ${body.paidAmount}`,
        },
      };
    }

    // 5. Mock convert fiat → USDC (TODO: Use real exchange rate API)
    const exchangeRate = 35; // 1 USD = 35 THB (mock)
    const usdAmount = parseFloat(body.paidAmount) / exchangeRate;
    const cryptoAmount = usdAmount.toFixed(2); // USDC 1:1 with USD

    logger.info("Mock conversion", {
      fiat: `${body.paidAmount} ${body.paidCurrency}`,
      crypto: `${cryptoAmount} USDC`,
      rate: exchangeRate,
    });

    // 6. Complete deposit
    await depositService.completeDeposit({
      orderId: params.orderId,
      chain: deposit.chain || "ethereum",
      tokenAddress: deposit.tokenAddress || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      tokenSymbol: "USDC",
      cryptoAmount,
      gatewayFee: "0",
      proxifyFee: "0",
      networkFee: "0",
      totalFees: "0",
    });

    return {
      status: 200 as const,
      body: {
        success: true,
        orderId: params.orderId,
        status: "completed",
        cryptoAmount,
        mockNote: "✅ Payment confirmed (mock for demo - in production, bank webhook does this)",
      },
    };
  } catch (error) {
    logger.error("Failed to mock confirm payment", { error, orderId: params.orderId });
    return {
      status: 400 as const,
      body: { success: false, error: "Failed to confirm payment" },
    };
  }
},
```

### 2. Update Frontend API Client

```typescript
// apps/whitelabel-web/src/api/b2bClient.ts

async mockConfirmFiatDeposit(orderId: string, data: {
  bankTransactionId: string;
  paidAmount: string;
  paidCurrency: string;
}) {
  // eslint-disable-next-line no-console
  console.log("[b2bApiClient] Mock confirming payment:", { orderId, data });

  const response = await this.axios.post<unknown>(
    `${this.baseURL}/api/v1/deposits/fiat/${orderId}/mock-confirm`,
    data
  );

  // eslint-disable-next-line no-console
  console.log("[b2bApiClient] Mock confirm response:", response.data);

  return response.data;
}
```

### 3. Update API Testing Page

```typescript
// apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx

// Add new endpoint definition
{
  id: "deposit-mock-confirm",
  flow: "FLOW 4A-DEMO",
  title: "Mock Confirm Fiat Payment (Demo)",
  method: "POST",
  endpoint: "/api/v1/deposits/fiat/{orderId}/mock-confirm",
  description: "Demo: Simulate bank payment confirmation (replaces webhook)",
  params: [
    { name: "api_key", type: "string", required: true, description: "Client API key" },
    { name: "orderId", type: "string", required: true, description: "Deposit order ID", default: "DEP-1234567890-abc123" },
    { name: "bankTransactionId", type: "string", required: true, description: "Mock bank transaction ID", default: "MOCK-TXN-123456" },
    { name: "paidAmount", type: "string", required: true, description: "Amount paid", default: "10000" },
    { name: "paidCurrency", type: "string", required: true, description: "Currency paid", default: "THB" },
  ],
  exampleResponse: JSON.stringify({
    success: true,
    orderId: "DEP-xxx",
    status: "completed",
    cryptoAmount: "285.71",
    mockNote: "✅ Payment confirmed (mock for demo)"
  }, null, 2),
},

// Add to switch case
case "deposit-mock-confirm":
  data = await b2bApiClient.mockConfirmFiatDeposit(params.orderId, {
    bankTransactionId: params.bankTransactionId,
    paidAmount: params.paidAmount,
    paidCurrency: params.paidCurrency,
  });
  break;
```

---

## Demo User Flow

### Fiat Deposit Demo:

```
User: "I want to deposit 10,000 THB"

Step 1: Create Deposit
→ POST /deposits/fiat
→ Get orderId: "DEP-1234567890-abc123"
→ Get bank instructions (for reference only in demo)

Step 2: Mock Payment (Demo Button)
→ POST /deposits/fiat/DEP-1234567890-abc123/mock-confirm
→ Backend simulates: Bank confirmed payment
→ Backend converts: 10,000 THB → 285.71 USDC (mock rate)
→ Backend updates balance

Step 3: Check Balance
→ GET /users/user_123/balance
→ See: 285.71 USDC ✅
```

### Crypto Deposit Demo:

```
User: "I want to deposit 285.71 USDC directly"

Step 1: Create Crypto Deposit
→ POST /deposits/crypto/initiate
→ Get custodial wallet: 0x3F450bC83942c44d38C0Be82CAe8194ce8FE5FE5
→ Get orderId: "DEP-1234567890-xyz789"

Step 2: Transfer USDC On-Chain (Real!)
→ User connects wallet (MetaMask)
→ User sends 285.71 USDC to custodial wallet
→ Get tx hash: 0xabc123def456...

Step 3: Submit TX Hash
→ POST /deposits/crypto/DEP-1234567890-xyz789/complete
→ Backend validates tx on blockchain (viem)
→ Backend updates balance

Step 4: Check Balance
→ GET /users/user_123/balance
→ See: 285.71 USDC ✅
```

---

## Frontend UI Updates

### Deposit Page Options:

```tsx
function DepositPage() {
  const [method, setMethod] = useState<'fiat' | 'crypto'>('fiat');

  return (
    <div>
      <h2>Deposit Funds</h2>

      {/* Method Selection */}
      <div>
        <button onClick={() => setMethod('fiat')}>
          Fiat Deposit (THB/USD/SGD)
        </button>
        <button onClick={() => setMethod('crypto')}>
          Crypto Deposit (USDC Direct)
        </button>
      </div>

      {method === 'fiat' ? (
        <FiatDepositFlow />
      ) : (
        <CryptoDepositFlow />
      )}
    </div>
  );
}

function FiatDepositFlow() {
  const [orderId, setOrderId] = useState('');

  const createDeposit = async () => {
    const result = await b2bApiClient.createDeposit({
      user_id: 'user_123',
      amount: '10000',
      currency: 'THB',
      chain: 'ethereum',
      token: 'USDC',
    });
    setOrderId(result.orderId);
  };

  const mockConfirm = async () => {
    await b2bApiClient.mockConfirmFiatDeposit(orderId, {
      bankTransactionId: `MOCK-${Date.now()}`,
      paidAmount: '10000',
      paidCurrency: 'THB',
    });
    alert('✅ Payment confirmed! Check your balance.');
  };

  return (
    <div>
      <button onClick={createDeposit}>1. Create Deposit</button>
      {orderId && (
        <>
          <p>Order ID: {orderId}</p>
          <button onClick={mockConfirm}>
            2. Mock Payment Confirmation (Demo)
          </button>
        </>
      )}
    </div>
  );
}

function CryptoDepositFlow() {
  const [depositData, setDepositData] = useState(null);
  const { address, isConnected } = useAccount(); // wagmi hook

  const createDeposit = async () => {
    const result = await b2bApiClient.initiateCryptoDeposit({
      userId: 'user_123',
      amount: '285.71',
      chain: 'ethereum',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
    });
    setDepositData(result);
  };

  const transferUSDC = async () => {
    // TODO: Use wagmi/viem to send USDC
    const txHash = await sendTransaction({
      to: depositData.custodialWalletAddress,
      value: parseUnits('285.71', 6), // USDC has 6 decimals
    });

    // Submit tx hash to backend
    await b2bApiClient.completeCryptoDeposit(depositData.orderId, {
      transactionHash: txHash,
    });

    alert('✅ Deposit completed! Check your balance.');
  };

  return (
    <div>
      <button onClick={createDeposit}>1. Get Deposit Address</button>
      {depositData && (
        <>
          <p>Send USDC to: {depositData.custodialWalletAddress}</p>
          <p>Amount: {depositData.expectedAmount} USDC</p>
          <button onClick={transferUSDC} disabled={!isConnected}>
            2. Transfer USDC
          </button>
        </>
      )}
    </div>
  );
}
```

---

## Testing Checklist

### Fiat Deposit (Mock):
- [ ] Create deposit → Get order ID
- [ ] Mock confirm → Balance updated
- [ ] Check user balance → See USDC
- [ ] Try confirming twice → Should fail
- [ ] Try wrong amount → Should fail
- [ ] Try expired deposit → Should fail

### Crypto Deposit (Real blockchain):
- [ ] Create deposit → Get custodial wallet
- [ ] Transfer USDC on-chain → Get tx hash
- [ ] Submit tx hash → Validate on blockchain
- [ ] Balance updated correctly
- [ ] Try wrong tx hash → Should fail
- [ ] Try tx to wrong address → Should fail

---

## Next Steps

1. ✅ Add mock confirm endpoint to deposit contract
2. ✅ Implement mock confirm in deposit router
3. ✅ Update frontend API client
4. ✅ Add UI for both deposit methods
5. TODO: Implement blockchain tx validation (viem)
6. TODO: Add exchange rate API for fiat conversion
7. TODO: Add proper error handling

---

**Status:** Ready to implement
**Priority:** High - Demo essential
**Timeline:** 1-2 days
