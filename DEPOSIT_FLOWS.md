# Deposit Flows - Two Separate APIs

## Overview

We support **TWO separate deposit methods** for different use cases:

1. **FLOW 4A: Fiat Deposit** - Client's escrow → Traditional banking → On-ramp → Custodial wallet
2. **FLOW 4B: Crypto Deposit** - User sends crypto directly → Custodial wallet

---

## FLOW 4A: Fiat Deposit (B2B Escrow → On-ramp → Staking)

### Use Case

**Client has end-user's money in their traditional account and wants to convert it to crypto for yield.**

**Example:** Shopify has $1000 in a seller's account balance. The seller wants to earn yield while waiting for payout.

### Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ SHOPIFY (Client App)                                │
│                                                     │
│ End-user: "I have $1000 idle, make it earn yield!" │
└─────────────────────────────────────────────────────┘
                    ↓
    POST /deposits/fiat
    {
      userId: "seller123",
      amount: "1000.00",
      currency: "USD",
      chain: "8453",
      tokenSymbol: "USDC",
      paymentMethod: "stripe" // or "wire", "ach", "sepa"
    }
                    ↓
┌────────────────────────────────────────────────────┐
│ PROXIFY API                                        |
│                                                    │
│ 1. Create deposit order (status: pending)          │
│ 2. Create payment session via gateway              │
│    - Stripe: Return checkout URL                   │
│    - Wire: Return bank account details             │
│ 3. Return payment instructions to client           │
└────────────────────────────────────────────────────┘
                    ↓
    Response:
    {
      orderId: "DEP-xxx",
      status: "pending",
      paymentInstructions: {
        method: "stripe",
        stripePaymentUrl: "https://checkout.stripe.com/...",
        amount: "1000.00",
        currency: "USD"
      },
      expectedCryptoAmount: "995.00", // After fees
      expiresAt: "2025-11-25T12:00:00Z"
    }
                    ↓
┌─────────────────────────────────────────────────────┐
│ TRADITIONAL BANKING                                 │
│                                                     │
│ Shopify sends $1000 from THEIR bank account        │
│ → Proxify receives $1000 in OUR bank account       │
│                                                     │
│ Methods:                                            │
│ • Stripe Connect (instant, 1% fee)                 │
│ • Wire Transfer (1-3 days, lower fee)              │
│ • ACH (2-5 days, lowest fee)                       │
│ • SEPA (EU, 1-2 days)                              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ ON-RAMP PROVIDER                                    │
│                                                     │
│ Proxify calls on-ramp API:                         │
│ • Circle (recommended for USDC minting)            │
│ • Coinbase Commerce                                │
│ • Bridge.xyz                                       │
│                                                     │
│ $1000 USD → ~995 USDC (after fees)                 │
│ Destination: Shopify's custodial wallet (0x...)    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ CLIENT CUSTODIAL WALLET (Privy)                    │
│                                                     │
│ 995 USDC received on-chain                         │
│ Transaction hash: 0xabc123...                      │
└─────────────────────────────────────────────────────┘
                    ↓
    Webhook: POST /deposits/fiat/{orderId}/complete
    {
      cryptoAmount: "995.00",
      chain: "8453",
      tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      transactionHash: "0xabc123...",
      gatewayFee: "10.00",
      proxifyFee: "5.00",
      networkFee: "1.00",
      totalFees: "16.00"
    }
                    ↓
┌─────────────────────────────────────────────────────┐
│ PROXIFY BACKEND                                     │
│                                                     │
│ 1. Verify on-chain transfer (TokenTransferService) │
│ 2. Calculate shares: 995 × 1e18 / current_index    │
│ 3. Mint shares for end-user                        │
│ 4. Update end_user_vault.shares                    │
│ 5. Update client_vault.pending_deposit_balance     │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ DEFI STAKING (Batch Job - every 6 hours)           │
│                                                     │
│ Move pending → staked via DeFi protocols:          │
│ • 70% AAVE (low risk)                              │
│ • 20% Curve (moderate risk)                        │
│ • 10% Uniswap (high risk)                          │
└─────────────────────────────────────────────────────┘
```

### API Endpoints

#### 1. Create Fiat Deposit

```typescript
POST /deposits/fiat

Request:
{
  userId: string;          // End-user ID from client's system
  amount: string;          // Fiat amount (e.g., "1000.00")
  currency: string;        // "USD", "EUR", etc.
  chain: string;           // "8453" (Base), "1" (Ethereum), etc.
  tokenSymbol: string;     // "USDC", "USDT", etc.
  paymentMethod?: "stripe" | "wire" | "ach" | "sepa";
  clientReference?: string; // Client's internal reference
}

Response (201):
{
  orderId: string;
  status: "pending";
  paymentInstructions: {
    method: string;
    amount: string;
    currency: string;

    // For Stripe
    stripePaymentUrl?: string;
    stripeSessionId?: string;

    // For Wire
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    reference?: string; // MUST include in wire
  };
  expectedCryptoAmount?: string; // Estimated USDC after fees
  expiresAt: string;
  createdAt: string;
}
```

#### 2. Complete Fiat Deposit (Webhook)

```typescript
POST /deposits/fiat/:orderId/complete

Request:
{
  cryptoAmount: string;      // Actual USDC received
  chain: string;
  tokenAddress: string;
  transactionHash: string;   // On-chain tx hash
  gatewayFee: string;
  proxifyFee: string;
  networkFee: string;
  totalFees: string;
}

Response (200):
{
  success: true;
  orderId: string;
  sharesMinted: string;      // Vault shares minted
}
```

---

## FLOW 4B: Crypto Deposit (Direct Transfer)

### Use Case

**End-user already has USDC in their wallet and wants to deposit directly.**

**Example:** Power user with existing crypto wants to deposit without going through fiat conversion.

### Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ CLIENT APP                                          │
│                                                     │
│ End-user: "I want to deposit 500 USDC I already    │
│            have in my wallet"                       │
└─────────────────────────────────────────────────────┘
                    ↓
    POST /deposits/crypto/initiate
    {
      userId: "user123",
      chain: "8453",
      tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      tokenSymbol: "USDC",
      amount: "500000000" // 500 USDC (6 decimals)
    }
                    ↓
┌─────────────────────────────────────────────────────┐
│ PROXIFY API                                         │
│                                                     │
│ 1. Create deposit order (status: pending)          │
│ 2. Get client's custodial wallet address           │
│ 3. Return deposit instructions                     │
└─────────────────────────────────────────────────────┘
                    ↓
    Response:
    {
      orderId: "DEP-xxx",
      status: "pending",
      custodialWalletAddress: "0x1234...", // Send here!
      chain: "8453",
      tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      tokenSymbol: "USDC",
      expectedAmount: "500000000",
      expiresAt: "2025-11-25T12:00:00Z"
    }
                    ↓
┌─────────────────────────────────────────────────────┐
│ END-USER'S WALLET (MetaMask, etc.)                 │
│                                                     │
│ User sends 500 USDC to custodial wallet            │
│ Transaction hash: 0xdef456...                      │
└─────────────────────────────────────────────────────┘
                    ↓
    POST /deposits/crypto/:orderId/complete
    {
      transactionHash: "0xdef456..."
    }
                    ↓
┌─────────────────────────────────────────────────────┐
│ PROXIFY BACKEND                                     │
│                                                     │
│ 1. Verify on-chain transfer (TokenTransferService) │
│    - Check tx exists on blockchain                 │
│    - Verify recipient = custodial wallet           │
│    - Verify amount >= expected amount              │
│ 2. Calculate shares: 500 × 1e18 / current_index    │
│ 3. Mint shares for end-user                        │
│ 4. Update end_user_vault.shares                    │
│ 5. Update client_vault.pending_deposit_balance     │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ DEFI STAKING (Batch Job - every 6 hours)           │
└─────────────────────────────────────────────────────┘
```

### API Endpoints

#### 1. Initiate Crypto Deposit

```typescript
POST /deposits/crypto/initiate

Request:
{
  userId: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string; // In token decimals (e.g., "500000000" for 500 USDC)
}

Response (201):
{
  orderId: string;
  status: "pending";
  custodialWalletAddress: string; // Send tokens here!
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  expectedAmount: string;
  expiresAt: string;
  createdAt: string;
}
```

#### 2. Complete Crypto Deposit

```typescript
POST /deposits/crypto/:orderId/complete

Request:
{
  transactionHash: string; // On-chain tx hash
}

Response (200):
{
  orderId: string;
  status: "completed" | "failed";
  cryptoAmount: string;    // Actual amount received
  sharesMinted: string;    // Vault shares minted
  transactionHash: string;
  verifiedAt: string;
}
```

---

## Comparison

| Feature | Fiat Deposit | Crypto Deposit |
|---------|--------------|----------------|
| **User has** | Money in client app | USDC in wallet |
| **Money source** | Client's bank account | User's wallet |
| **Gateway** | Stripe/Wire/ACH/SEPA | None (direct) |
| **On-ramp** | Circle/Coinbase/Bridge | None (already crypto) |
| **Fees** | 1-2% + network fee | Only network fee (~$1) |
| **Time** | 1-3 days (banking) | 1-5 minutes (blockchain) |
| **Complexity** | High (3 layers) | Low (1 layer) |
| **Best for** | B2B escrow (Shopify, etc.) | Crypto-native users |

---

## Implementation Status

### ✅ Completed

- [x] Contract definitions (deposit.ts)
- [x] FiatOnRampService (placeholder with mock mode)
- [x] TokenTransferService (verification)
- [x] Database schema (deposit_transactions)
- [x] Documentation (this file)

### 📋 TODO

- [ ] Update deposit.dto.ts with new interfaces
- [ ] Create FiatDepositUseCase
- [ ] Create CryptoDepositUseCase
- [ ] Update deposit routers
- [ ] Add webhook handlers
- [ ] Implement real payment gateway (Stripe Connect)
- [ ] Implement real on-ramp (Circle API)
- [ ] Frontend integration in whitelabel-web

---

## Security Considerations

### Fiat Deposits

1. **Payment Verification**: Always verify payment received before initiating on-ramp
2. **Webhook Signatures**: Verify all webhook signatures from Stripe/Circle
3. **Amount Matching**: Verify on-chain amount matches expected conversion
4. **Rate Limiting**: Limit deposit creation per client (prevent spam)

### Crypto Deposits

1. **On-Chain Verification**: ALWAYS verify transaction on blockchain
2. **Amount Validation**: Check actual amount >= expected amount
3. **Expiration**: Orders expire after 24 hours to prevent stale deposits
4. **Double-Spend**: Check transaction is confirmed (not pending)

---

## Next Steps

1. **Focus on FLOW 4A (Fiat Deposit)** - This is the main use case for B2B clients
2. **Start with Stripe Connect** - Easiest to integrate, instant transfers
3. **Use Circle for on-ramp** - Best for USDC minting, reliable API
4. **Mock mode first** - Get end-to-end flow working with mocks
5. **Production later** - Add real integrations after flow is proven

