# Stripe vs Direct Bank Integration Decision

## TL;DR Recommendation

**✅ START WITH STRIPE for MVP (Year 1)**
- Fast to implement (2 weeks)
- Proven product-market fit first
- Accept 2.9% fees as customer acquisition cost

**🔄 MIGRATE to Direct Bank when:**
- Monthly volume > $1M ($12M+ annual)
- Stripe fees > $350K/year
- Have VASP license
- Have 2-3 engineers to maintain

---

## Option A: Stripe (Recommended for MVP)

### Pros
✅ **Fast implementation** - 2 weeks vs 6 months
✅ **Global coverage** - 135+ currencies, all payment methods
✅ **Single integration** - One API for everything
✅ **Automatic payment methods** - Stripe auto-shows best option:
   - Thailand: PromptPay QR
   - Singapore: PayNow
   - Europe: SEPA, iDEAL
   - USA: ACH, cards
✅ **Built-in fraud detection** - Stripe Radar
✅ **Standardized webhooks** - One format for all
✅ **PCI compliance included** - No security audits needed
✅ **No banking license initially** - Stripe has all licenses
✅ **Hosted payment UI** - Don't build payment forms

### Cons
❌ **High fees:** 2.9% + $0.30 per transaction
❌ **Vendor lock-in:** Hard to migrate later
❌ **Less control:** Can't customize deeply
❌ **Payout delays:** 2-7 days hold
❌ **Account risk:** Stripe can freeze account

### Cost Analysis
```
Transaction: $10,000 THB (285 USDC)
Stripe fee: 2.9% = $290 THB (~8.3 USDC)
Net received: $9,710 THB (276.7 USDC)

Annual Volume: $10M
Stripe fees: $290,000/year 😱

But your yield margin: 7%
Revenue: $700K
Stripe fees: -$290K
Net profit: $410K ✅ Still profitable!
```

### Break-Even Analysis
| Monthly Volume | Annual Stripe Fees | Worth Replacing? |
|----------------|-------------------|------------------|
| $100K | $34,800 | ❌ No |
| $500K | $174,000 | ⚠️ Getting close |
| $1M | $348,000 | ✅ Yes, time to build |
| $5M | $1,740,000 | ✅ Definitely! |

---

## Option B: Direct Bank Integration

### Pros
✅ **Lower fees:** 0.5-1% vs Stripe's 2.9%
✅ **Direct control:** Full customization
✅ **Instant payouts:** No holding periods
✅ **Better margins:** Keep more revenue
✅ **Brand experience:** White-label everything
✅ **No vendor risk:** Can't be shut down by Stripe

### Cons
❌ **Complex setup:** 3-6 months per bank
❌ **Multiple integrations:** Different API per bank/country
❌ **Banking licenses required:** VASP license ($1M+ capital)
❌ **Build fraud detection:** Your own system
❌ **Compliance burden:** Full AML/KYC infrastructure
❌ **Engineering cost:** 2-3 engineers full-time
❌ **Build payment UI:** Form validation, security, etc.

### Cost Analysis
```
Transaction: $10,000 THB (285 USDC)
Bank fee: 0.5% = $50 THB (~1.4 USDC)
Net received: $9,950 THB (283.6 USDC)

Annual Volume: $10M
Bank fees: $50,000/year ✅

BUT:
Engineering (2 engineers): $300K/year
Compliance officer: $150K/year
Legal: $100K/year
Infrastructure: $50K/year
Total fixed costs: $600K/year

Break-even: Need $20M+ annual volume
```

### Timeline
| Phase | Duration | What |
|-------|----------|------|
| 1. Get VASP license | 9-12 months | Singapore MAS application |
| 2. Bank partnership (SCBX) | 3-6 months | Legal + technical setup |
| 3. Build integration | 2-3 months | API integration + testing |
| 4. Build fraud system | 2-3 months | AML/KYC rules |
| 5. Security audit | 1-2 months | SOC 2 certification |
| **Total** | **17-26 months** | **Before first transaction** |

---

## Option C: Hybrid Approach (Best Strategy)

### Phase 1: Stripe MVP (Months 0-12)
```typescript
// Simple Stripe integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createDeposit(amount, currency, userId) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: currency.toLowerCase(),
    payment_method_types: ['promptpay', 'card', 'bank_transfer'],
    metadata: {
      userId,
      orderId: `DEP-${Date.now()}`
    }
  });

  return {
    orderId: paymentIntent.metadata.orderId,
    clientSecret: paymentIntent.client_secret, // Give to frontend
  };
}

// Webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await completeDeposit(paymentIntent.metadata.orderId);
  }

  res.json({ received: true });
});
```

**Focus:**
- ✅ Build core product
- ✅ Get customers
- ✅ Prove product-market fit
- ✅ Accept 2.9% as CAC (customer acquisition cost)

**Timeline:** 2 weeks to launch

---

### Phase 2: Hybrid (Months 12-24)
```
Keep Stripe for:
✅ Long-tail currencies (EUR, GBP, etc.)
✅ Small transactions (< $1,000)
✅ New markets

Add direct banks for:
✅ THB (80% of your volume)
✅ SGD (10% of your volume)
✅ USD (5% of your volume)

Result:
- 95% volume → Direct (0.5% fee)
- 5% volume → Stripe (2.9% fee)
- Blended fee: 0.6% (vs 2.9% all-Stripe)
- Savings: $230K/year on $10M volume
```

**When to start:** When Stripe fees hit $350K/year (~$1M monthly volume)

---

### Phase 3: Full Direct (Year 3+)
Once you have:
- ✅ VASP license approved
- ✅ $10M+ monthly volume
- ✅ Engineering team (5+ engineers)
- ✅ Compliance infrastructure

Migrate everything to direct bank integrations.

**Savings at $100M annual volume:**
- Stripe fees would be: $2.9M/year
- Direct bank fees: $500K/year
- **Savings: $2.4M/year** 🎉

---

## Implementation: Stripe Integration

### 1. Install Stripe SDK
```bash
npm install stripe @stripe/stripe-js
```

### 2. Backend: Create Payment Intent
```typescript
// apps/b2b-api/src/router/deposit.router.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// FLOW 4A: Create Deposit
createFiatDeposit: async ({ body, req }) => {
  const clientId = (req as any).client?.id;

  const deposit = await depositService.createDeposit({
    clientId,
    userId: body.userId,
    depositType: "external",
    fiatAmount: body.amount,
    fiatCurrency: body.currency,
    cryptoCurrency: body.tokenSymbol,
    gatewayProvider: "stripe",
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(body.amount) * 100, // Convert to cents
    currency: body.currency.toLowerCase(),
    payment_method_types: ['promptpay', 'card', 'bank_transfer'],
    metadata: {
      orderId: deposit.orderId,
      userId: body.userId,
      clientId,
    },
  });

  return {
    status: 201,
    body: {
      orderId: deposit.orderId,
      status: "pending_payment",
      stripeClientSecret: paymentIntent.client_secret,
      stripePaymentIntentId: paymentIntent.id,
      expectedCryptoAmount: body.amount,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: deposit.createdAt.toISOString(),
    },
  };
}
```

### 3. Backend: Webhook Handler
```typescript
// apps/b2b-api/src/router/webhook.router.ts
import { buffer } from 'micro';

export const createWebhookRouter = (s: ReturnType<typeof initServer>) => {
  return s.router({
    // Stripe webhook
    stripeWebhook: async ({ req }) => {
      const sig = req.headers['stripe-signature'];
      const body = await buffer(req);

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err) {
        return { status: 400, body: { error: 'Invalid signature' } };
      }

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Call internal complete deposit
        await depositService.completeDeposit({
          orderId,
          cryptoAmount: (paymentIntent.amount / 100).toString(),
          chain: 'ethereum', // From metadata
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          transactionHash: paymentIntent.id, // Use Stripe ID as reference
          gatewayFee: '0',
          proxifyFee: '0',
          networkFee: '0',
          totalFees: '0',
        });
      }

      return { status: 200, body: { received: true } };
    },
  });
};
```

### 4. Frontend: Payment UI
```typescript
// apps/whitelabel-web/src/components/StripeCheckout.tsx
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://yourapp.com/deposit/success',
      },
    });

    if (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
}

// Usage
export function DepositPage() {
  const [clientSecret, setClientSecret] = useState('');

  const createDeposit = async () => {
    const response = await fetch('/api/v1/deposits/fiat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_123',
        amount: '10000',
        currency: 'THB',
      }),
    });

    const data = await response.json();
    setClientSecret(data.stripeClientSecret);
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
```

---

## Migration Path: Stripe → Direct Bank

When ready to migrate high-volume currencies:

### 1. Add Feature Flag
```typescript
const USE_STRIPE = process.env.USE_STRIPE_FOR_CURRENCY?.[currency] || false;

if (USE_STRIPE) {
  // Stripe flow
} else {
  // Direct bank flow
}
```

### 2. Migrate Gradually
```
Week 1: Move 10% of THB traffic to direct bank
Week 2: Move 25% if no issues
Week 3: Move 50%
Week 4: Move 100%
```

### 3. Keep Stripe as Fallback
```typescript
try {
  // Try direct bank first
  result = await directBankTransfer();
} catch (error) {
  logger.warn('Direct bank failed, falling back to Stripe');
  result = await stripePayment();
}
```

---

## Decision Matrix

| Criteria | Stripe | Direct Bank | Hybrid |
|----------|--------|-------------|--------|
| **Time to market** | ⭐⭐⭐⭐⭐ 2 weeks | ⭐ 18+ months | ⭐⭐⭐⭐ 2 weeks |
| **Fees** | ⭐ 2.9% | ⭐⭐⭐⭐⭐ 0.5% | ⭐⭐⭐⭐ 0.6% |
| **Control** | ⭐⭐ Limited | ⭐⭐⭐⭐⭐ Full | ⭐⭐⭐⭐ Mostly |
| **Engineering** | ⭐⭐⭐⭐⭐ Easy | ⭐ Complex | ⭐⭐⭐ Moderate |
| **Risk** | ⭐⭐⭐ Medium | ⭐ High | ⭐⭐⭐⭐ Low |
| **Scalability** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Best |

**Winner for MVP: Stripe ✅**
**Winner for Scale: Hybrid ✅**

---

## Final Recommendation

### For Proxify (RIGHT NOW):

```
✅ Use Stripe for MVP

Why:
1. Launch in 2 weeks, not 18 months
2. Validate product-market fit first
3. Margins still profitable (4.1% net)
4. No licensing needed yet
5. Global from day 1

When to migrate:
- Stripe fees > $30K/month (~$1M volume)
- You have 10+ paying clients
- Product-market fit proven
```

### Roadmap:

```
Q1 2026: Launch with Stripe ✅
Q2 2026: Get to $500K monthly volume
Q3 2026: Apply for Singapore VASP license
Q4 2026: Start SCBX bank partnership (THB)
Q1 2027: Migrate 50% of THB to direct
Q2 2027: VASP license approved
Q3 2027: Migrate 100% THB to direct
Q4 2027: Add SGD direct integration
```

**Total savings after migration:** $200K+/year on just THB

---

## Action Items

### Week 1-2: Stripe Setup
- [ ] Create Stripe account
- [ ] Get API keys (test + live)
- [ ] Install Stripe SDK
- [ ] Implement payment intent creation
- [ ] Add webhook handler
- [ ] Test with PromptPay (Thailand)
- [ ] Deploy to production

### Month 3-6: Scale on Stripe
- [ ] Monitor fees
- [ ] Track volume by currency
- [ ] Identify migration candidates
- [ ] Build financial projections

### Month 6-12: Prepare Migration
- [ ] Apply for VASP license
- [ ] Start bank partnership talks
- [ ] Hire compliance officer
- [ ] Build fraud detection
- [ ] Design migration plan

### Month 12+: Execute Migration
- [ ] Launch direct bank for top currency
- [ ] Monitor closely
- [ ] Gradually increase %
- [ ] Keep Stripe as fallback
- [ ] Repeat for other currencies

---

**Last Updated:** 2025-11-25
**Decision:** ✅ START WITH STRIPE
**Revisit:** When Stripe fees > $30K/month
