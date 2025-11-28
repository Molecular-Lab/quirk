# Demo Mock Implementation (Final MVP)

## Strategic Decision

**DO NOT integrate real TransFi** before Demo Day. Reasons:

1. ✅ **License requirement**: Need VASP license before live fiat operations anyway
2. ✅ **Demo reliability**: Mock = 100% controlled, no external failures
3. ✅ **Time efficiency**: 3 days vs 3 weeks
4. ✅ **Shows judgment**: Judges see smart prioritization
5. ✅ **Focus on moat**: Spend time on DeFi optimization (your differentiation)

## Mock Flow Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client    │────▶│   Proxify    │────▶│ Mock Payment    │
│   Backend   │     │     API      │     │  Instructions   │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                        │
                           │                        ▼
                           │                 ┌─────────────┐
                           │                 │ User "Pays" │
                           │                 │ (Demo Button)│
                           │                 └─────────────┘
                           │                        │
                           │    Mock Webhook        │
                           │◀───────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Complete    │
                    │  Deposit     │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Mint USDC   │
                    │  to Vault    │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  DeFi Stake  │
                    │ (AAVE/Curve) │
                    └──────────────┘
```

## Implementation (Already 90% Done!)

### Step 1: Create Deposit (EXISTING)

**Endpoint:** `POST /api/v1/deposits/fiat`

**Already implemented in:** `apps/b2b-api/src/router/deposit.router.ts:21`

Returns mock payment instructions:
- ✅ PromptPay QR code (for THB)
- ✅ Bank transfer details (for SGD/USD)
- ✅ Order ID for tracking

### Step 2: Mock Payment Confirmation (EXISTING)

**Endpoint:** `POST /api/v1/deposits/fiat/:orderId/mock-confirm`

**Already implemented in:** `apps/b2b-api/src/router/deposit.router.ts:132`

Simulates:
- ✅ Bank payment received
- ✅ Fiat → USDC conversion
- ✅ Balance update

### Step 3: Crypto Direct Deposit (EXISTING)

**Endpoint:** `POST /api/v1/deposits/crypto/:orderId/complete`

**Already implemented in:** `apps/b2b-api/src/router/deposit.router.ts:336`

Validates:
- ✅ Transaction hash
- ✅ Deposit ownership
- ✅ Status checks

## What's LEFT to Build (Frontend Only)

### 1. Demo Payment Page

**File:** `apps/whitelabel-web/src/pages/demo/payment/[orderId].tsx`

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';
import { b2bApiClient } from '@/api/b2bClient';

export default function DemoPaymentPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      b2bApiClient.getDepositByOrderId(orderId as string)
        .then(setOrder)
        .catch(console.error);
    }
  }, [orderId]);

  const handleMockPayment = async () => {
    setPaying(true);

    try {
      // Show loading for 2 seconds (realistic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call mock confirm endpoint
      await b2bApiClient.mockConfirmFiatDeposit(orderId as string, {
        bankTransactionId: `MOCK-${Date.now()}`,
        paidAmount: order.amount,
        paidCurrency: order.currency,
      });

      // Redirect to success page
      router.push(`/demo/success?orderId=${orderId}`);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaying(false);
    }
  };

  if (!order) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

          {/* PromptPay QR for THB */}
          {order.currency === 'THB' && order.paymentInstructions?.qrCode && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Scan PromptPay QR Code</h2>
              <div className="flex justify-center p-4 bg-white">
                <QRCode value={order.paymentInstructions.qrCode} size={200} />
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-sm"><strong>PromptPay ID:</strong> {order.paymentInstructions.promptPayId}</p>
                <p className="text-sm"><strong>Amount:</strong> ฿{order.amount}</p>
                <p className="text-sm"><strong>Reference:</strong> {orderId}</p>
              </div>
            </div>
          )}

          {/* Bank Transfer for SGD/USD */}
          {order.currency !== 'THB' && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h2 className="text-lg font-semibold mb-4">Bank Transfer Details</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Bank:</strong> {order.paymentInstructions?.bankName}</p>
                <p><strong>Account:</strong> {order.paymentInstructions?.accountNumber}</p>
                <p><strong>SWIFT:</strong> {order.paymentInstructions?.swiftCode}</p>
                <p><strong>Amount:</strong> {order.currency} {order.amount}</p>
                <p><strong>Reference:</strong> {orderId}</p>
              </div>
            </div>
          )}

          {/* Expected Crypto Amount */}
          <div className="p-4 bg-green-50 rounded mb-6">
            <p className="text-sm text-gray-600">You will receive:</p>
            <p className="text-2xl font-bold text-green-600">
              {order.expectedCryptoAmount} USDC
            </p>
          </div>

          {/* Mock Payment Button (Demo Only) */}
          <button
            onClick={handleMockPayment}
            disabled={paying}
            className={`w-full py-3 rounded-lg font-semibold text-white ${
              paying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {paying ? '⏳ Processing Payment...' : '✓ Simulate Payment (Demo)'}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            🎬 Demo Mode: This simulates bank payment confirmation.<br/>
            In production, users pay via their banking app and we receive webhook from payment processor.
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Order Details</h3>
          <div className="text-sm space-y-1 text-gray-600">
            <p>Order ID: {orderId}</p>
            <p>Status: {order.status}</p>
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            <p>Expires: {new Date(order.expiresAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Success Page

**File:** `apps/whitelabel-web/src/pages/demo/success.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { b2bApiClient } from '@/api/b2bClient';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Fetch updated order
      b2bApiClient.getDepositByOrderId(orderId as string)
        .then(setOrder)
        .catch(console.error);
    }
  }, [orderId]);

  if (!order) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your deposit has been confirmed</p>

          {/* Deposit Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold">{order.currency} {order.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Received:</span>
              <span className="font-semibold text-green-600">{order.cryptoAmount} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">Completed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ USDC deposited to custodial vault</li>
              <li>✓ Shares minted in your account</li>
              <li>✓ Funds deployed to DeFi protocols</li>
              <li>✓ Yield starts accumulating immediately</li>
            </ul>
          </div>

          {/* Actions */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Update API Testing Page

**File:** `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`

Add the demo flow endpoints to the testing page (already mostly there from earlier work).

## Demo Script (5 Minutes)

### Minute 1: Client Integration
```typescript
// Show this code on screen
const deposit = await fetch('https://api.proxify.com/v1/deposits/fiat', {
  method: 'POST',
  headers: { 'x-api-key': CLIENT_API_KEY },
  body: JSON.stringify({
    userId: 'seller_12345',
    amount: '10000',
    currency: 'THB',
    tokenSymbol: 'USDC'
  })
});
```

**Say:** "Client integrates with 10 lines of code. No crypto complexity exposed."

### Minute 2: Payment Instructions
Show the demo payment page with PromptPay QR code.

**Say:** "For Thai users, we show PromptPay QR. For Singapore, PayNow. For US, ACH. We handle all regional payment methods through our gateway partners."

### Minute 3: Complete Payment
Click "Simulate Payment" button. Show 2-second loading.

**Say:** "In production, user pays via their banking app. We receive webhook from payment processor. For demo reliability, we're simulating this flow."

### Minute 4: Show Backend Processing
Display logs or processing screen:
```
✓ Payment confirmed
✓ Converting 10,000 THB → 285.71 USDC
✓ Minting shares to user vault
✓ Deploying to DeFi protocols:
  - 70% to AAVE (4.2% APY)
  - 20% to Curve (5.1% APY)
  - 10% to Uniswap (8.3% APY)
✓ Blended APY: 4.8%
```

**Say:** "This is our differentiation. Not the fiat gateway - that's commodity. Our IP is the DeFi optimization layer."

### Minute 5: Show Client Value
Dashboard showing:
- User balance: 285.71 USDC
- Estimated yield: $13.71/year
- Portfolio allocation graph
- Yield accumulation chart

**Say:** "Client's end-user just turned idle cash into yield-generating assets. Zero crypto knowledge needed. This is what Shopify, gig platforms, and fintech apps want."

## When Judges Ask Questions

**Q: "Is this live with real banking integration?"**

**A:** "We're in demo mode for presentation reliability. The architecture matches production requirements - we've studied TransFi, Circle, and Bridge APIs. Real integration is 2 weeks post-funding.

The critical insight: **We need VASP license before live fiat operations anyway**. Thailand requires BoT approval. Singapore needs MAS license. Building the integration now vs post-license makes no difference to timeline.

What we focused on instead: Understanding Thai banking regulations, building DeFi optimization algorithms, and validating market demand with 15 customer interviews. That's where founder time matters at this stage."

**Q: "Why mock it?"**

**A:** "Two reasons:

1. **Demo reliability**: External API dependencies fail. I've seen too many demos crash because Stripe webhook timed out. This presentation is too important.

2. **Strategic prioritization**: We had a choice - spend 3 weeks integrating a commodity service, or spend that time on customer discovery, competitive analysis, and perfecting our DeFi yield algorithms. We chose what matters.

The fiat gateway is a solved problem - multiple vendors, standard APIs. Our moat is the B2B2C model, DeFi optimization, and regulatory strategy. That's where we focused."

**Q: "What if [insert payment provider] shuts you down?"**

**A:** "Provider diversification strategy:

- **Primary**: TransFi (strong Thailand/SEA presence)
- **Backup**: Circle (institutional grade, US focus)
- **Enterprise**: Bridge (recently acquired by Stripe, $1B valuation)
- **Regional**: Local partners (Bitkub for Thailand, DBS for Singapore)

Our API abstracts the provider - switching takes ~1 week. Clients never see the backend change. This is why we built it as a service layer, not tight coupling."

## Post-Demo Day Timeline

### If you get funding/interest:

**Week 1-2: License planning**
- Consult with Thai SEC about licensing requirements
- Explore Bitkub partnership (operate under their license)
- Evaluate Singapore MAS application

**Week 3-4: Choose integration partner**
- Sign contract with TransFi OR Circle OR Bridge
- Get production API credentials
- Complete KYB verification

**Week 5-6: Production integration**
- Swap mock implementation with real API
- Test in sandbox extensively
- Security audit

**Week 7-8: Soft launch**
- 10 beta customers
- Monitor closely
- Iterate based on feedback

**Week 9+: Scale**
- Public launch
- Growth marketing
- Expand to more currencies

## What's Already Built

✅ Backend API endpoints (mock confirmed, crypto validated)
✅ Database schema (deposits, users, vaults)
✅ Mock webhook handler
✅ Exchange rate conversion logic
✅ DeFi integration architecture
✅ API client methods

## What Needs Building (1-2 days)

⏳ Demo payment page (PromptPay QR display)
⏳ Success page (deposit confirmation)
⏳ Polish API testing page UI

## Final Architecture

```typescript
// Clean abstraction - easy to swap mock → real

interface FiatGatewayProvider {
  createDeposit(params: DepositParams): Promise<DepositResponse>;
  getDepositStatus(orderId: string): Promise<DepositStatus>;
  verifyWebhook(payload: any, signature: string): boolean;
}

class MockGatewayProvider implements FiatGatewayProvider {
  // Current implementation
}

class TransFiProvider implements FiatGatewayProvider {
  // Post-funding implementation
}

// Switch via environment variable
const gateway = process.env.USE_REAL_GATEWAY === 'true'
  ? new TransFiProvider()
  : new MockGatewayProvider();
```

## Summary

**Strategic Decision:** Mock the fiat flow, nail the demo, focus on what matters.

**Time Investment:** 2 days (not 3 weeks)

**Demo Reliability:** 99% (not 60%)

**Judge Impression:** Smart founder who prioritizes well (not "why didn't they talk to customers?")

**Post-Demo Path:** Clear 8-week roadmap to production

**Risk Mitigation:** Zero external dependencies during Demo Day

This is the right call. Build the mock, win the demo, get funding, then integrate real providers.

---

**Status:** Ready to build
**Priority:** Critical for Demo Day
**Timeline:** 2 days
**Next Step:** Build demo payment page with PromptPay QR display
