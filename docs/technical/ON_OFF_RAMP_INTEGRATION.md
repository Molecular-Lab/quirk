# On/Off Ramp Integration - Technical Research & Architecture

**Last Updated:** 2025-11-13
**Status:** Research Phase

---

## 🎯 OVERVIEW

This document covers:
1. **On/Off Ramp Provider Research** (Transak, alternatives)
2. **API Architecture Design** (Proxify → Provider integration)
3. **Implementation Gap Analysis** (What we have vs. what we need)
4. **Integration Roadmap** (Step-by-step implementation plan)

---

## 📊 PART 1: ON/OFF RAMP PROVIDER RESEARCH

### Provider Comparison Matrix

| Provider | Coverage | Supported Assets | B2B API | White-Label | Compliance | Pricing | Best For |
|----------|----------|------------------|---------|-------------|------------|---------|----------|
| **Transak** | 160+ countries | 136+ cryptos, USDC | ✅ Yes | ✅ Yes | EU VASP, US MSB, UK FCA | 1.5-4% (volume-based) | **General B2B** |
| **Ramp Network** | 150+ countries | 60+ cryptos, USDC | ✅ Yes | ✅ Yes | EU MiCA, US MTL (some states) | 0.5-2.9% | **Low fees** |
| **MoonPay** | 160+ countries | 120+ cryptos | ✅ Yes | ✅ Yes | EU VASP, US MTL (40+ states) | 3.5-4.5% | **Enterprise KYC** |
| **Zero Hash** | US + select | 60+ assets | ✅ Yes | ✅ Yes | **Full US MTL (all 50 states)** | Custom (enterprise) | **US compliance** |
| **Banxa** | 100+ countries | 100+ cryptos | ✅ Yes | ✅ Yes | EU, AU, US partial | 2-4% | **Asia-Pacific** |
| **Stripe Crypto Onramp** | 70+ countries | Limited (ETH, SOL) | ✅ Yes | ❌ Branded | Stripe compliance | 1.5-2.5% | **Fast integration** |
| **Coinbase Onramp** | 100+ countries | Coinbase assets | ✅ Yes | ⚠️ Partial | Coinbase licenses | 2-3% | **Brand recognition** |

---

### RECOMMENDED: Transak (Primary) + Ramp Network (Backup)

**Why Transak:**
```
✅ Best Coverage: 160+ countries
✅ USDC Support: Near 1:1 pricing for stablecoins
✅ White-Label API: Fully customizable
✅ B2B Focused: Enterprise support, custom pricing
✅ Compliance: EU VASP, US MSB, UK FCA
✅ Documentation: Comprehensive docs at docs.transak.com
✅ Fast Integration: 5 minutes to MVP (widget), 1-2 weeks (API)
✅ On + Off Ramp: Both directions supported
```

**Why Ramp Network as Backup:**
```
✅ Lower Fees: 0.5-2.9% (vs Transak's 1.5-4%)
✅ Good for EU: MiCA compliant
✅ Failover: If Transak has issues, switch to Ramp
✅ Cost Optimization: Use Ramp for large transactions (save fees)
```

---

## 📋 PART 2: TRANSAK DETAILED RESEARCH

### Integration Options

**Option A: Widget Integration (Easiest)**
```javascript
// Embed Transak widget in your frontend
import { transakSDK } from '@transak/transak-sdk';

const transak = new transakSDK({
  apiKey: 'YOUR_API_KEY',
  environment: 'PRODUCTION',
  defaultCryptoCurrency: 'USDC',
  walletAddress: userWalletAddress,
  fiatCurrency: 'USD',
  email: userEmail,
  redirectURL: 'https://your-app.com/success',
  hostURL: window.location.origin,
  widgetHeight: '600px',
  widgetWidth: '500px',
  hideMenu: true, // White-label
  themeColor: '000000' // Your brand color
});

transak.init();
```

**Pros:**
- 5-minute integration
- User handles payment directly
- Transak handles KYC/AML
- No backend work needed

**Cons:**
- User sees Transak branding (unless hidden)
- Less control over flow
- Not true API-to-API (user-facing widget)

**Verdict:** ❌ NOT suitable for your B2B API model (users don't interact directly)

---

**Option B: API Integration (Your Use Case)**
```javascript
// Backend API-to-API integration
const axios = require('axios');

// Step 1: Create order via Transak API
const response = await axios.post('https://api.transak.com/api/v2/order/create', {
  partnerApiKey: 'YOUR_API_KEY',
  fiatCurrency: 'USD',
  cryptoCurrency: 'USDC',
  isBuyOrSell: 'BUY', // or 'SELL' for off-ramp
  network: 'ethereum',
  walletAddress: userWalletAddress,
  fiatAmount: 100,
  email: userEmail,
  // ... other params
}, {
  headers: {
    'Content-Type': 'application/json',
    'access-token': 'YOUR_ACCESS_TOKEN'
  }
});

// Step 2: Get order status
const order = await axios.get(`https://api.transak.com/api/v2/order/${orderId}`, {
  headers: {
    'access-token': 'YOUR_ACCESS_TOKEN'
  }
});

console.log(order.data.status); // PENDING, COMPLETED, FAILED, etc.
```

**Pros:**
- Full API control (no user-facing widget)
- You orchestrate the flow
- Backend-to-backend (B2B API model)
- Can customize UX completely

**Cons:**
- More complex integration (1-2 weeks)
- You handle some user communication
- Need to poll for order status or use webhooks

**Verdict:** ✅ THIS is what you need for B2B API model

---

### Transak API Features

**On-Ramp (Fiat → Crypto):**
```
POST /api/v2/order/create
{
  "isBuyOrSell": "BUY",
  "fiatCurrency": "USD",
  "cryptoCurrency": "USDC",
  "network": "ethereum",
  "fiatAmount": 100,
  "walletAddress": "0x...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "countryCode": "US",
  "...": "..."
}

Response:
{
  "order": {
    "id": "ord_12345",
    "status": "AWAITING_PAYMENT_FROM_USER",
    "cryptoAmount": 99.5, // USDC
    "fiatAmount": 100,
    "totalFee": 2.5,
    "conversionPrice": 1.0025,
    "paymentUrl": "https://global.transak.com/payment/..."
  }
}
```

**Off-Ramp (Crypto → Fiat):**
```
POST /api/v2/order/create
{
  "isBuyOrSell": "SELL",
  "fiatCurrency": "USD",
  "cryptoCurrency": "USDC",
  "network": "ethereum",
  "cryptoAmount": 100,
  "bankDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "021000021",
    "accountHolderName": "John Doe"
  },
  "email": "user@example.com",
  "...": "..."
}

Response:
{
  "order": {
    "id": "ord_67890",
    "status": "AWAITING_CRYPTO_FROM_USER",
    "depositAddress": "0xTransakAddress...", // User sends USDC here
    "fiatAmount": 97.5, // User receives in bank
    "cryptoAmount": 100,
    "totalFee": 2.5
  }
}
```

**Webhooks (Order Status Updates):**
```
POST https://your-api.com/webhooks/transak
{
  "eventName": "ORDER_COMPLETED",
  "order": {
    "id": "ord_12345",
    "status": "COMPLETED",
    "cryptoAmount": 99.5,
    "fiatAmount": 100,
    "userId": "user_123", // Your custom ID
    "createdAt": "2025-11-13T10:00:00Z",
    "completedAt": "2025-11-13T10:15:00Z"
  }
}
```

**Get Price Quote:**
```
GET /api/v2/currencies/price
?fiat=USD
&crypto=USDC
&network=ethereum
&isBuyOrSell=BUY
&fiatAmount=100

Response:
{
  "cryptoAmount": 99.5,
  "fiatAmount": 100,
  "conversionPrice": 1.0025,
  "totalFee": 2.5,
  "transakFee": 1.5,
  "partnerFee": 1.0, // Your configurable fee
  "networkFee": 0.5
}
```

---

### Transak Pricing Structure

**Fee Components:**
```
Total Fee = Transak Fee + Partner Fee + Network Fee

Transak Fee:
├─ Card payments: 2.99% - 3.99%
├─ Bank transfer (ACH): 1.5% - 2.5%
├─ Bank transfer (SEPA): 1.0% - 1.5%
└─ Varies by payment method + country

Partner Fee:
├─ You configure: 0% - 5%
├─ Recommended: 0.5% - 1.0%
└─ This is YOUR revenue share

Network Fee:
├─ Ethereum gas: $2-10
├─ Solana gas: $0.01
└─ Varies by network + congestion
```

**Your Cost (as Partner):**
- **Integration:** FREE (no upfront cost)
- **Per Transaction:** Transak takes their fee (1.5-4%), you can add yours (0.5-1%)
- **Volume Discounts:** Available for enterprise (need to contact sales)
- **API Calls:** FREE (no charge for API calls)

**Example Transaction:**
```
User wants to buy $1,000 USDC:
├─ Transak fee (2.5%): $25
├─ Your fee (0.5%): $5
├─ Network fee: $5
└─ Total fees: $35 (3.5%)

User pays: $1,035
User receives: ~995 USDC (accounting for small price slippage)
Your revenue: $5
```

**At Scale ($10M volume/month):**
```
Monthly Volume: $10,000,000
Your Fee (0.5%): $50,000/month = $600k/year
Transak Fee (2.5%): $250,000/month (their revenue)
Your Cost: $0 (volume discounts negotiable)
```

---

### Transak Compliance & KYC

**KYC Requirements:**
```
Tier 1 (Basic): $50-500/day
├─ Email verification
├─ Phone verification
└─ Basic personal info

Tier 2 (Standard): $500-5,000/day
├─ Government ID (passport, driver's license)
├─ Selfie verification
└─ Address proof (optional)

Tier 3 (Advanced): $5,000-50,000/day
├─ Enhanced due diligence
├─ Source of funds
└─ Additional documents
```

**Your Responsibility:**
- Collect user email (required)
- Pass user data to Transak API
- Transak handles KYC/AML (not your problem)
- Transak stores KYC data (GDPR compliant)

**Transak's Licenses:**
- EU: VASP registered in Poland
- US: FinCEN MSB registration
- UK: FCA registered
- State-level: Varies (not all 50 states)

**Your License Needs:**
- Short-term (with Transak): MAYBE NONE (gray area, consult lawyer)
- Long-term (high volume): YOUR OWN MTL (as discussed in LICENSE_REQUIREMENTS.md)

---

## 🏗️ PART 3: API ARCHITECTURE DESIGN

### High-Level Flow

```
┌─────────────────────┐
│   Customer App      │ (YouTube, Gaming Platform, etc.)
│   (Frontend/Backend)│
└──────────┬──────────┘
           │ HTTP/REST
           ↓
┌─────────────────────┐
│   Proxify API       │ (Your Go/Fiber Backend)
│   (Backend Service) │
└─────┬───────┬───────┘
      │       │
      │       ├────→ Privy API (Wallet Management) ✅ You have this
      │       │
      │       ├────→ Transak API (Fiat On/Off Ramp) ❌ Need to add
      │       │
      │       └────→ Aave/Compound (DeFi Yield) ❌ Need to add
      │
      ↓
┌─────────────────────┐
│   PostgreSQL DB     │ (User mappings, transactions, balances)
└─────────────────────┘
```

---

### Detailed API Flow

#### **Scenario 1: On-Ramp (Fiat → Crypto → Yield)**

**Step 1: Customer calls your API**
```
POST https://api.proxify.com/v1/deposits

Headers:
  Authorization: Bearer CUSTOMER_API_KEY
  Content-Type: application/json

Body:
{
  "productId": "youtube_credential",
  "userId": "user_123",
  "amount": 100,
  "currency": "USD",
  "paymentMethod": "card",
  "userEmail": "user@youtube.com",
  "userPhone": "+1234567890",
  "returnUrl": "https://youtube.com/wallet/success"
}
```

**Step 2: Proxify creates wallet (if not exists)**
```javascript
// Your backend (Go/Fiber)
const wallet = await getOrCreateWallet({
  productId: req.body.productId,
  userId: req.body.userId,
  chainType: 'ethereum' // Default for USDC
});

// Uses your existing Privy integration (you already have this!)
// packages/core/usecase/EmbeddedWalletUsecase.createEmbeddedWallet()
```

**Step 3: Proxify initiates Transak order**
```javascript
// Call Transak API
const transakOrder = await axios.post('https://api.transak.com/api/v2/order/create', {
  partnerApiKey: process.env.TRANSAK_API_KEY,
  isBuyOrSell: 'BUY',
  fiatCurrency: 'USD',
  cryptoCurrency: 'USDC',
  network: 'ethereum',
  fiatAmount: 100,
  walletAddress: wallet.address,
  email: req.body.userEmail,
  phoneNumber: req.body.userPhone,
  partnerCustomerId: `${req.body.productId}:${req.body.userId}`,
  redirectURL: req.body.returnUrl,
  webhookUrl: 'https://api.proxify.com/webhooks/transak'
});

// Store order in DB
await db.transactions.create({
  productId: req.body.productId,
  userId: req.body.userId,
  transakOrderId: transakOrder.data.order.id,
  type: 'DEPOSIT',
  status: 'PENDING',
  fiatAmount: 100,
  cryptoAmount: null, // Will update via webhook
  currency: 'USD',
  cryptoCurrency: 'USDC'
});
```

**Step 4: Proxify returns payment URL**
```javascript
// Response to customer
res.json({
  success: true,
  data: {
    orderId: transakOrder.data.order.id,
    status: 'AWAITING_PAYMENT',
    paymentUrl: transakOrder.data.order.paymentUrl, // User completes payment here
    walletAddress: wallet.address,
    estimatedCrypto: transakOrder.data.order.cryptoAmount,
    fees: {
      transak: transakOrder.data.order.transakFee,
      proxify: transakOrder.data.order.partnerFee,
      network: transakOrder.data.order.networkFee,
      total: transakOrder.data.order.totalFee
    }
  }
});
```

**Step 5: User completes payment (handled by Transak)**
```
User clicks paymentUrl
├─ Redirected to Transak (white-labeled with your branding)
├─ Enters card/bank details
├─ Completes KYC (if needed)
├─ Transak processes payment
└─ USDC sent to wallet.address
```

**Step 6: Webhook updates order status**
```javascript
// POST https://api.proxify.com/webhooks/transak
{
  "eventName": "ORDER_COMPLETED",
  "order": {
    "id": "ord_12345",
    "status": "COMPLETED",
    "partnerCustomerId": "youtube_credential:user_123",
    "walletAddress": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
    "cryptoAmount": 99.5,
    "fiatAmount": 100
  }
}

// Your webhook handler
app.post('/webhooks/transak', async (req, res) => {
  const { order } = req.body;

  // Update transaction status
  await db.transactions.update({
    where: { transakOrderId: order.id },
    data: {
      status: 'COMPLETED',
      cryptoAmount: order.cryptoAmount,
      completedAt: new Date()
    }
  });

  // Optional: Auto-stake to DeFi (Phase 2 feature)
  if (autoStakeEnabled) {
    await stakeToAave({
      walletAddress: order.walletAddress,
      amount: order.cryptoAmount
    });
  }

  res.json({ success: true });
});
```

**Step 7: Customer can query status**
```
GET https://api.proxify.com/v1/deposits/{orderId}

Response:
{
  "success": true,
  "data": {
    "orderId": "ord_12345",
    "status": "COMPLETED",
    "productId": "youtube_credential",
    "userId": "user_123",
    "walletAddress": "0x525b00...",
    "fiatAmount": 100,
    "cryptoAmount": 99.5,
    "currency": "USD",
    "cryptoCurrency": "USDC",
    "createdAt": "2025-11-13T10:00:00Z",
    "completedAt": "2025-11-13T10:15:00Z",
    "fees": {
      "transak": 2.5,
      "proxify": 0.5,
      "network": 0.5,
      "total": 3.5
    }
  }
}
```

---

#### **Scenario 2: Off-Ramp (Crypto → Fiat)**

**Step 1: Customer calls your API**
```
POST https://api.proxify.com/v1/withdrawals

Headers:
  Authorization: Bearer CUSTOMER_API_KEY
  Content-Type: application/json

Body:
{
  "productId": "youtube_credential",
  "userId": "user_123",
  "amount": 100, // USDC amount to withdraw
  "currency": "USD",
  "bankAccount": {
    "accountHolderName": "John Doe",
    "accountNumber": "1234567890",
    "routingNumber": "021000021",
    "bankName": "Chase Bank"
  },
  "userEmail": "user@youtube.com"
}
```

**Step 2: Proxify validates balance**
```javascript
// Check if user has enough USDC
const wallet = await getWallet({
  productId: req.body.productId,
  userId: req.body.userId
});

const balance = await getWalletBalance(wallet.address);
if (balance.usdc < req.body.amount) {
  return res.status(400).json({ error: 'Insufficient balance' });
}

// If staked in DeFi, unstake first (Phase 2)
if (balance.staked > 0) {
  await unstakeFromAave({
    walletAddress: wallet.address,
    amount: req.body.amount
  });
}
```

**Step 3: Proxify initiates Transak sell order**
```javascript
const transakOrder = await axios.post('https://api.transak.com/api/v2/order/create', {
  partnerApiKey: process.env.TRANSAK_API_KEY,
  isBuyOrSell: 'SELL',
  fiatCurrency: 'USD',
  cryptoCurrency: 'USDC',
  network: 'ethereum',
  cryptoAmount: 100,
  bankDetails: req.body.bankAccount,
  email: req.body.userEmail,
  partnerCustomerId: `${req.body.productId}:${req.body.userId}`,
  webhookUrl: 'https://api.proxify.com/webhooks/transak'
});

// Store withdrawal request
await db.transactions.create({
  productId: req.body.productId,
  userId: req.body.userId,
  transakOrderId: transakOrder.data.order.id,
  type: 'WITHDRAWAL',
  status: 'PENDING',
  cryptoAmount: 100,
  fiatAmount: null, // Will update via webhook
  currency: 'USD',
  cryptoCurrency: 'USDC',
  depositAddress: transakOrder.data.order.depositAddress // Where to send USDC
});
```

**Step 4: Proxify transfers USDC to Transak**
```javascript
// Transfer USDC from user's wallet to Transak's deposit address
await transferUSDC({
  fromAddress: wallet.address,
  toAddress: transakOrder.data.order.depositAddress,
  amount: 100,
  privateKey: wallet.privateKey // Retrieved from Privy
});
```

**Step 5: Transak receives USDC and sends fiat**
```
Transak detects USDC deposit
├─ Verifies amount
├─ Converts to fiat (USD)
├─ Transfers to user's bank account (ACH/wire)
└─ Sends webhook: ORDER_COMPLETED
```

**Step 6: Webhook confirms completion**
```javascript
// POST https://api.proxify.com/webhooks/transak
{
  "eventName": "ORDER_COMPLETED",
  "order": {
    "id": "ord_67890",
    "status": "COMPLETED",
    "partnerCustomerId": "youtube_credential:user_123",
    "cryptoAmount": 100,
    "fiatAmount": 97.5 // After fees
  }
}

// Update transaction
await db.transactions.update({
  where: { transakOrderId: order.id },
  data: {
    status: 'COMPLETED',
    fiatAmount: order.fiatAmount,
    completedAt: new Date()
  }
});
```

---

### API Endpoints Design

```
# Proxify API v1

## Wallets
POST   /v1/wallets/create         # Create embedded wallet (already implemented ✅)
GET    /v1/wallets/{walletId}     # Get wallet details (already implemented ✅)
GET    /v1/wallets/user/{userId}  # Get wallet by userId (already implemented ✅)
GET    /v1/wallets/{walletId}/balance # Get balance (need to implement ❌)

## Deposits (On-Ramp)
POST   /v1/deposits               # Initiate deposit (fiat → crypto) ❌
GET    /v1/deposits/{orderId}     # Get deposit status ❌
GET    /v1/deposits               # List deposits (pagination) ❌

## Withdrawals (Off-Ramp)
POST   /v1/withdrawals            # Initiate withdrawal (crypto → fiat) ❌
GET    /v1/withdrawals/{orderId}  # Get withdrawal status ❌
GET    /v1/withdrawals            # List withdrawals (pagination) ❌

## Yield (DeFi) - Phase 2
POST   /v1/yield/stake            # Stake to DeFi ❌
POST   /v1/yield/unstake          # Unstake from DeFi ❌
GET    /v1/yield/{walletId}       # Get yield earnings ❌

## Webhooks (Internal)
POST   /webhooks/transak          # Transak order updates ❌
POST   /webhooks/privy            # Privy wallet events (if needed) ❌

## Admin/Monitoring
GET    /v1/health                 # Health check (already implemented ✅)
GET    /v1/admin/stats            # Platform stats (AUM, volume, etc.) ❌
```

---

## 📊 PART 4: IMPLEMENTATION GAP ANALYSIS

### What You Already Have ✅

**From Previous Exploration:**

```
✅ Wallet Infrastructure (@proxify/privy-client + @proxify/core)
├─ Entity layer (privy-user, privy-wallet, user-embedded-wallet)
├─ Repository layer (PrivyUserRepository, PrivyWalletRepository)
├─ Use case layer (EmbeddedWalletUsecase, PrivyUsecase)
├─ Multi-chain support (Ethereum, Solana, Polygon, Base, etc.)
├─ Multi-auth support (email, phone, OAuth, custom auth)
├─ Type-safe (Zod validation)
└─ Clean Architecture (proper separation of concerns)

✅ Test API Server (apps/privy-api-test)
├─ Express.js with TypeScript
├─ 5 wallet endpoints (create, get, list, link)
├─ Dependency injection pattern
├─ Winston logging
└─ Working demo

✅ Database Design
├─ user_embedded_wallets table schema (defined)
├─ Mock in-memory repository (for testing)
└─ Mapping layer (productId + userId → privyUserId + walletAddress)
```

---

### What You Need to Add ❌

**High Priority (Phase 1 MVP):**

```
❌ On/Off Ramp Integration
├─ Transak SDK/API integration
├─ Deposit endpoints (POST /v1/deposits)
├─ Withdrawal endpoints (POST /v1/withdrawals)
├─ Webhook handlers (POST /webhooks/transak)
├─ Order status polling/tracking
└─ Transaction entity + repository

❌ Database Layer
├─ Replace MockUserEmbeddedWalletRepository with PostgreSQL
├─ Add transactions table (deposits, withdrawals, status)
├─ Add SQLC code generation (per your Go monorepo standards)
├─ Migrations (using golang-migrate or similar)
└─ Database repository implementations

❌ Balance Management
├─ Get wallet balance (on-chain query)
├─ Track available vs. locked balances
├─ Liquidity buffer (20% hot, 80% staked)
└─ Balance endpoints (GET /v1/wallets/{id}/balance)

❌ Customer Authentication
├─ API key generation for customers
├─ API key validation middleware
├─ Rate limiting (per customer)
└─ Usage tracking (volume, transaction count)

❌ Error Handling & Monitoring
├─ Structured error responses
├─ Sentry/Datadog integration
├─ Alerting (failed transactions, low balance, etc.)
└─ Audit logging (all financial operations)
```

**Medium Priority (Phase 2):**

```
❌ DeFi Yield Integration
├─ Aave integration (deposit, withdraw, getAPY)
├─ Compound integration (fallback)
├─ Auto-staking logic (when deposit completes)
├─ Auto-unstaking logic (when withdrawal requested)
├─ Yield calculation (per wallet, per user)
└─ Rebalancing (daily or when APY changes)

❌ Multi-Protocol Optimization
├─ APY monitoring (Aave vs Compound vs Curve)
├─ Auto-rebalancing to best yield
├─ Gas optimization (batch transactions)
└─ Risk management (max % per protocol)

❌ Reporting & Analytics
├─ Customer dashboard (AUM, volume, revenue)
├─ User-level analytics (yield earned, transactions)
├─ Platform metrics (total AUM, fees collected)
└─ Export to CSV/PDF

❌ Advanced Features
├─ Recurring deposits (subscription model)
├─ Scheduled withdrawals
├─ Multi-currency support (EUR, GBP, etc.)
└─ Multiple bank accounts per user
```

**Low Priority (Phase 3):**

```
❌ Own License Infrastructure
├─ Replace Transak with own banking integrations
├─ Direct ACH/SEPA processing
├─ FX conversion (Wise/TransferWise integration)
└─ Lower fees (eliminate middleman)

❌ Advanced DeFi Strategies
├─ Leveraged yield farming
├─ Liquid staking (Lido, Rocket Pool)
├─ Options/hedging (Opyn, Ribbon)
└─ Cross-chain yield optimization

❌ Enterprise Features
├─ Whitelabel frontend (customer-branded UI)
├─ Custom yield strategies
├─ Dedicated support
└─ SLA guarantees
```

---

### Development Effort Estimation

| Feature | Complexity | Est. Time | Priority |
|---------|------------|-----------|----------|
| **PostgreSQL Repository** | Medium | 1-2 weeks | 🔴 Critical |
| **Transak Integration (On-Ramp)** | Medium | 1 week | 🔴 Critical |
| **Transak Integration (Off-Ramp)** | Medium | 1 week | 🔴 Critical |
| **Webhook Handlers** | Low | 3-5 days | 🔴 Critical |
| **Balance Endpoints** | Low | 2-3 days | 🔴 Critical |
| **API Key Auth** | Medium | 1 week | 🔴 Critical |
| **Aave Integration** | High | 2-3 weeks | 🟡 Phase 2 |
| **Multi-Protocol Optimization** | High | 3-4 weeks | 🟡 Phase 2 |
| **Customer Dashboard** | Medium | 2-3 weeks | 🟡 Phase 2 |
| **Own Banking Rails** | Very High | 6-12 months | 🟢 Phase 3 |

**Total for Phase 1 MVP:** 6-8 weeks

---

## 🗺️ PART 5: IMPLEMENTATION ROADMAP

### Week 1-2: Database Layer

**Goal:** Replace mock repository with PostgreSQL

```
Tasks:
├─ Set up PostgreSQL (docker-compose)
├─ Design migrations (user_embedded_wallets, transactions)
├─ Set up SQLC (per Go monorepo standards)
├─ Generate Go types + TypeScript types
├─ Implement UserEmbeddedWalletRepository (Postgres)
├─ Implement TransactionRepository (Postgres)
└─ Write integration tests

Deliverables:
✅ PostgreSQL running locally
✅ Migrations applied
✅ SQLC generating types
✅ Repositories working
✅ Tests passing
```

---

### Week 3-4: Transak Integration (On-Ramp)

**Goal:** Deposit functionality (fiat → USDC)

```
Tasks:
├─ Sign up for Transak partner account
├─ Get API keys (sandbox + production)
├─ Implement Transak API client (TypeScript/Go)
├─ Create POST /v1/deposits endpoint
├─ Create GET /v1/deposits/{orderId} endpoint
├─ Implement webhook handler (POST /webhooks/transak)
├─ Store transactions in DB
├─ Test with sandbox environment
└─ Document API

Deliverables:
✅ Working deposit flow (sandbox)
✅ Webhook receiving updates
✅ Transactions stored in DB
✅ API documentation
```

---

### Week 5-6: Transak Integration (Off-Ramp)

**Goal:** Withdrawal functionality (USDC → fiat)

```
Tasks:
├─ Implement balance checking (on-chain query)
├─ Create POST /v1/withdrawals endpoint
├─ Implement USDC transfer to Transak (via Privy)
├─ Handle withdrawal webhooks
├─ Add withdrawal status tracking
├─ Test with sandbox environment
└─ Document API

Deliverables:
✅ Working withdrawal flow (sandbox)
✅ Balance checks working
✅ USDC transfers automated
✅ Withdrawal status tracking
```

---

### Week 7-8: API Key Auth + Polish

**Goal:** Customer authentication and MVP finalization

```
Tasks:
├─ Implement API key generation
├─ Add API key middleware (Fiber)
├─ Rate limiting per customer
├─ Usage tracking (volume, transaction count)
├─ Error handling improvements
├─ Add monitoring (Sentry/Datadog)
├─ Write end-to-end tests
└─ Documentation (API reference, guides)

Deliverables:
✅ API key auth working
✅ Rate limiting configured
✅ Error handling polished
✅ Monitoring set up
✅ Full API documentation
✅ Ready for pilot customers
```

---

### Post-MVP: Phase 2 (DeFi Yield)

**Week 9-12: Aave Integration**

```
Tasks:
├─ Aave smart contract integration (Solidity)
├─ Implement staking logic (deposit USDC to Aave)
├─ Implement unstaking logic (withdraw USDC from Aave)
├─ Auto-staking after deposits
├─ Liquidity buffer management (20% hot, 80% staked)
├─ Yield calculation (per wallet)
├─ Add POST /v1/yield/stake endpoint
├─ Add POST /v1/yield/unstake endpoint
└─ Add GET /v1/yield/{walletId} endpoint

Deliverables:
✅ Working Aave integration
✅ Auto-staking enabled
✅ Yield tracking implemented
✅ Yield API endpoints
```

---

## 🔧 TECHNICAL STACK RECOMMENDATIONS

### Backend (Go/Fiber)

```
Recommended Stack:
├─ Go 1.21+ (backend language)
├─ Fiber v2 (HTTP framework) - per your monorepo standards
├─ SQLC (type-safe SQL) - per your monorepo standards
├─ pgx/v5 (PostgreSQL driver)
├─ go-ethereum (Ethereum integration)
├─ Viper (config management)
├─ Zap (structured logging)
└─ Testify (testing)

Project Structure:
apps/
├─ proxify-api/ (main Go/Fiber backend)
│   ├─ main.go
│   ├─ config/
│   ├─ handlers/ (HTTP handlers)
│   ├─ middleware/ (auth, rate limiting)
│   ├─ services/ (business logic)
│   │   ├─ wallet.service.go
│   │   ├─ transak.service.go
│   │   └─ aave.service.go
│   ├─ repositories/ (data access)
│   └─ models/ (SQLC generated)
└─ privy-client/ (keep as TypeScript sidecar OR port to Go)
```

**Option A: Keep Privy Client as TypeScript**
```
Pros:
✅ Already implemented
✅ Privy SDK is JavaScript/TypeScript
✅ Easy maintenance

Cons:
⚠️ Need to call TypeScript service from Go (HTTP/gRPC)
⚠️ Another service to deploy
```

**Option B: Port Privy Client to Go**
```
Pros:
✅ All Go (monorepo consistency)
✅ No cross-language communication
✅ Better performance

Cons:
⚠️ Privy SDK is TypeScript-first (need to use HTTP API directly)
⚠️ More work upfront (2-3 weeks)
```

**Recommendation:** Keep TypeScript for now (Option A), port to Go in Phase 2 if needed.

---

### Database (PostgreSQL)

```
Schema:

-- user_embedded_wallets (mapping layer)
CREATE TABLE user_embedded_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  privy_user_id VARCHAR(255) NOT NULL UNIQUE,
  embedded_wallet_address VARCHAR(42) NOT NULL,
  linked_wallet_address VARCHAR(42),
  chain_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, user_id),
  UNIQUE(product_id, embedded_wallet_address),
  INDEX idx_product_user (product_id, user_id),
  INDEX idx_wallet_address (embedded_wallet_address)
);

-- transactions (deposits + withdrawals)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL
  status VARCHAR(20) NOT NULL, -- PENDING, COMPLETED, FAILED, CANCELLED

  -- Transak details
  transak_order_id VARCHAR(255) UNIQUE,
  transak_status VARCHAR(50),
  payment_url TEXT,
  deposit_address VARCHAR(42), -- For off-ramp (where to send USDC)

  -- Amounts
  fiat_amount DECIMAL(20, 2),
  crypto_amount DECIMAL(30, 18),
  fiat_currency VARCHAR(10) DEFAULT 'USD',
  crypto_currency VARCHAR(10) DEFAULT 'USDC',

  -- Fees
  transak_fee DECIMAL(20, 2),
  proxify_fee DECIMAL(20, 2),
  network_fee DECIMAL(20, 2),
  total_fee DECIMAL(20, 2),

  -- Bank details (for off-ramp)
  bank_account_number VARCHAR(255),
  bank_routing_number VARCHAR(255),
  bank_account_holder_name VARCHAR(255),

  -- Metadata
  user_email VARCHAR(255),
  user_phone VARCHAR(50),
  return_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,

  INDEX idx_product_user_tx (product_id, user_id),
  INDEX idx_wallet_tx (wallet_address),
  INDEX idx_transak_order (transak_order_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- api_keys (customer authentication)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL UNIQUE,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  api_secret_hash VARCHAR(255) NOT NULL, -- bcrypt hash

  -- Rate limiting
  rate_limit_per_minute INT DEFAULT 60,
  rate_limit_per_day INT DEFAULT 10000,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  environment VARCHAR(20) DEFAULT 'production', -- sandbox, production

  -- Metadata
  company_name VARCHAR(255),
  contact_email VARCHAR(255),
  webhook_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,

  INDEX idx_api_key (api_key),
  INDEX idx_product (product_id)
);

-- balances (cached on-chain balances)
CREATE TABLE balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL,

  -- Balances
  total_balance DECIMAL(30, 18) DEFAULT 0, -- Total USDC
  available_balance DECIMAL(30, 18) DEFAULT 0, -- Hot wallet (20%)
  staked_balance DECIMAL(30, 18) DEFAULT 0, -- In DeFi (80%)
  locked_balance DECIMAL(30, 18) DEFAULT 0, -- Pending withdrawals

  -- Yield
  total_yield_earned DECIMAL(30, 18) DEFAULT 0,
  current_apy DECIMAL(10, 4), -- e.g., 4.0000 for 4%

  -- Timestamps
  last_updated_at TIMESTAMP DEFAULT NOW(),
  last_staked_at TIMESTAMP,

  UNIQUE(wallet_address),
  INDEX idx_wallet_balance (wallet_address)
);
```

---

## ✅ NEXT STEPS

**Immediate Actions:**

1. **[ ] Contact Transak Sales**
   ```
   Email: sales@transak.com
   Subject: B2B API Integration for Proxify

   Questions:
   ├─ Can we use your API behind our B2B API?
   ├─ What are volume-based pricing tiers?
   ├─ Do you offer white-label without branding?
   ├─ What's the onboarding process?
   └─ Can we get sandbox access immediately?
   ```

2. **[ ] Set Up Development Environment**
   ```
   ├─ PostgreSQL via docker-compose
   ├─ Transak sandbox account
   ├─ SQLC configuration (sqlc.yaml)
   └─ Go/Fiber project structure
   ```

3. **[ ] Create Database Migrations**
   ```
   ├─ user_embedded_wallets table
   ├─ transactions table
   ├─ api_keys table
   └─ balances table
   ```

4. **[ ] Implement Phase 1 MVP (6-8 weeks)**
   ```
   Week 1-2: PostgreSQL + SQLC
   Week 3-4: Transak On-Ramp
   Week 5-6: Transak Off-Ramp
   Week 7-8: API Key Auth + Polish
   ```

---

## 📚 RESOURCES

**Transak:**
- Documentation: https://docs.transak.com/
- API Reference: https://docs.transak.com/reference/
- Partner Portal: https://dashboard.transak.com/
- Support: support@transak.com

**Alternative Providers:**
- Ramp Network: https://ramp.network/
- MoonPay: https://www.moonpay.com/
- Zero Hash: https://zerohash.com/

**Tools:**
- SQLC: https://sqlc.dev/
- Fiber: https://docs.gofiber.io/
- Privy Docs: https://docs.privy.io/

---

**Ready to start building? Which part do you want to tackle first?**
