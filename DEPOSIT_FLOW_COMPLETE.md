# Complete Deposit Flow - Proxify Gateway

## Overview

This document describes the complete on-ramp deposit flow from client request to USDC delivery.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Client Initiates Deposit (FLOW 4A)                 │
└─────────────────────────────────────────────────────────────┘
   Client calls: POST /api/v1/deposits/fiat
   {
     userId: "user_123",
     amount: "10000",
     currency: "THB",
     chain: "ethereum",
     tokenSymbol: "USDC"
   }
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Proxify Returns Payment Instructions                │
└─────────────────────────────────────────────────────────────┘
   Response:
   {
     orderId: "DEP-1234567890-abc123",
     status: "pending_payment",
     paymentInstructions: {
       method: "bank_transfer",
       bankName: "Siam Commercial Bank (SCBX)",
       accountNumber: "XXX-X-XXXXX-X",
       accountName: "Proxify Gateway (Thailand) Co., Ltd.",
       swiftCode: "SICOTHBK",
       promptPayId: "0123456789",
       reference: "DEP-1234567890-abc123",
       instructions: "Option 1: Scan PromptPay QR..."
     },
     expectedCryptoAmount: "285.71", // Estimated USDC
     expiresAt: "2025-11-26T10:00:00Z"
   }
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Client Transfers Money to Proxify Bank Account     │
└─────────────────────────────────────────────────────────────┘
   Client's finance team OR automated system:
   - Opens banking app/portal
   - Transfers 10,000 THB to Proxify's account
   - Includes reference: DEP-1234567890-abc123

   Payment methods:
   ✅ PromptPay QR (Instant - Thailand)
   ✅ Bank Transfer (1-2 hours same bank, 1-2 days different bank)
   ✅ Wire Transfer (International)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Bank Receives Payment & Sends Webhook              │
└─────────────────────────────────────────────────────────────┘
   Bank (SCBX/Kasikorn/DBS) detects incoming transfer:

   Webhook to Proxify:
   POST https://api.proxify.com/webhooks/bank/payment-received
   {
     transactionId: "BANK-TXN-123456",
     amount: "10000",
     currency: "THB",
     fromAccount: "CLIENT-ACCOUNT-XXX",
     toAccount: "PROXIFY-ACCOUNT-YYY",
     reference: "DEP-1234567890-abc123",
     timestamp: "2025-11-25T15:30:00Z",
     status: "completed"
   }
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Proxify Webhook Handler Processes Payment          │
└─────────────────────────────────────────────────────────────┘
   Proxify webhook handler:

   1. ✅ Verify webhook signature (security)
   2. ✅ Extract reference code: DEP-1234567890-abc123
   3. ✅ Lookup deposit in database by orderId
   4. ✅ Verify amount matches (10,000 THB)
   5. ✅ Check deposit is still pending (not expired/completed)
   6. ✅ Log payment received
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Proxify Converts Fiat → USDC                       │
└─────────────────────────────────────────────────────────────┘
   Proxify calls on-ramp partner API:

   Partner options (based on onRampProvider):
   - SCBX (Thailand THB)
   - Circle (USD/SGD)
   - MoonPay (Global)
   - Internal DEX aggregator

   Conversion:
   10,000 THB → 285.71 USDC (at current rate)

   Result:
   - Transaction hash: 0xabc123def456...
   - USDC received in Proxify's hot wallet
   - Amount: 285.71 USDC
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Proxify Calls Complete Deposit (FLOW 4B)          │
└─────────────────────────────────────────────────────────────┘
   Internal API call:
   POST /api/v1/deposits/fiat/DEP-1234567890-abc123/complete
   {
     cryptoAmount: "285.71",
     chain: "ethereum",
     tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
     transactionHash: "0xabc123def456...",
     gatewayFee: "0.50",
     proxifyFee: "0.25",
     networkFee: "0.05",
     totalFees: "0.80"
   }
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Update Database & User Balances                    │
└─────────────────────────────────────────────────────────────┘
   Database operations (deposit.usecase.ts):

   1. ✅ Mark deposit.status = 'completed'
   2. ✅ Get client_vault (for custodial wallet address)
   3. ✅ Calculate client growth index (weighted average)
   4. ✅ Get/create end_user_vault
   5. ✅ Update end_user_vault.total_deposited += 285.71
   6. ✅ Calculate new weighted entry index (DCA)
   7. ✅ Update client_vault.pending_deposit_balance += 285.71
   8. ✅ Update end_user.last_deposit_at = now
   9. ✅ Mark first deposit if needed
   10. ✅ Create audit log
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Send USDC to Client's Custodial Wallet            │
└─────────────────────────────────────────────────────────────┘
   Blockchain transaction:
   - From: Proxify hot wallet
   - To: Client's custodial wallet (from client_vault)
   - Amount: 285.71 USDC
   - Chain: Ethereum
   - Gas paid by: Proxify

   Transaction confirmed on-chain
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: Notify Client via Webhook                         │
└─────────────────────────────────────────────────────────────┘
   Proxify sends webhook to client:
   POST https://client.com/webhooks/proxify/deposit-completed
   {
     orderId: "DEP-1234567890-abc123",
     userId: "user_123",
     status: "completed",
     fiatAmount: "10000",
     fiatCurrency: "THB",
     cryptoAmount: "285.71",
     cryptoCurrency: "USDC",
     chain: "ethereum",
     transactionHash: "0xabc123def456...",
     fees: {
       gateway: "0.50",
       proxify: "0.25",
       network: "0.05",
       total: "0.80"
     },
     completedAt: "2025-11-25T15:35:00Z"
   }
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 11: End-User Sees Updated Balance                     │
└─────────────────────────────────────────────────────────────┘
   In client's app (Grab/Shopify/etc):
   - User refreshes balance
   - Sees: 285.71 USDC (or equivalent in local currency)
   - Starts earning yield immediately
```

---

## Region-Specific Payment Instructions

### **Thailand (THB)**
```json
{
  "method": "bank_transfer",
  "bankName": "Siam Commercial Bank (SCBX)",
  "accountNumber": "XXX-X-XXXXX-X",
  "accountName": "Proxify Gateway (Thailand) Co., Ltd.",
  "swiftCode": "SICOTHBK",
  "promptPayId": "0123456789",
  "instructions": "Option 1 (Instant): Scan PromptPay QR or use ID: 0123456789\nOption 2 (Bank Transfer): Transfer to account above\nIMPORTANT: Include reference: DEP-xxx"
}
```

**Provider:** SCBX partnership
**Speed:**
- PromptPay: Instant (< 1 minute)
- Bank transfer (same bank): 1-2 hours
- Bank transfer (different bank): 1-2 business days

---

### **Singapore (SGD)**
```json
{
  "method": "bank_transfer",
  "bankName": "DBS Bank (Singapore)",
  "accountNumber": "XXX-XXXXX-X",
  "accountName": "Proxify Gateway Pte. Ltd.",
  "swiftCode": "DBSSSGSG",
  "instructions": "Transfer SGD to the account above. Include reference: DEP-xxx"
}
```

**Provider:** DBS Bank
**Speed:**
- PayNow: Instant
- FAST transfer: 1-2 hours
- GIRO: 1-2 business days

---

### **Global (USD, EUR, etc.)**
```json
{
  "method": "bank_transfer",
  "bankName": "Kasikorn Bank",
  "accountNumber": "123-4-56789-0",
  "accountName": "Proxify Gateway Co., Ltd.",
  "swiftCode": "KASITHBK",
  "instructions": "Transfer USD/EUR to the account above. Include reference: DEP-xxx"
}
```

**Provider:** Kasikorn Bank (Thailand) with SWIFT
**Speed:**
- SWIFT transfer: 1-3 business days
- Wire transfer: 2-5 business days

---

## Webhook Security

### **Bank → Proxify Webhook**
```typescript
// Verify webhook signature
const signature = req.headers['x-bank-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', process.env.BANK_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

### **Proxify → Client Webhook**
```typescript
// Sign outgoing webhook
const payload = JSON.stringify(webhookData);
const signature = crypto
  .createHmac('sha256', client.webhookSecret)
  .update(payload)
  .digest('hex');

await axios.post(client.webhookUrl, webhookData, {
  headers: {
    'x-proxify-signature': signature,
    'x-proxify-timestamp': Date.now()
  }
});
```

---

## Error Handling

### **Payment Not Received (Timeout)**
```
If payment not received within 24 hours:
1. Deposit status → 'expired'
2. Send notification to client
3. Client can retry with new order
```

### **Wrong Amount Received**
```
If amount < expected:
1. Deposit status → 'partial'
2. Create new deposit for difference
3. Notify client

If amount > expected:
1. Process full amount
2. Create credit for client
3. Notify client of extra credit
```

### **On-Ramp Conversion Fails**
```
If THB → USDC conversion fails:
1. Retry with different provider
2. If all providers fail:
   - Refund THB to client
   - Mark deposit as 'failed'
   - Send refund transaction hash
```

### **Blockchain Transaction Fails**
```
If USDC transfer to custodial wallet fails:
1. Retry with higher gas
2. If still fails:
   - Hold USDC in hot wallet
   - Manual intervention required
   - Notify client of delay
```

---

## Database Schema

### **deposits table**
```sql
CREATE TABLE deposits (
  id UUID PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  client_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Fiat details
  fiat_amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,

  -- Crypto details
  crypto_amount DECIMAL(30, 18),
  crypto_currency VARCHAR(10) NOT NULL,
  chain VARCHAR(50),
  token_address VARCHAR(255),
  transaction_hash VARCHAR(255),

  -- Fees
  gateway_fee DECIMAL(20, 8),
  proxify_fee DECIMAL(20, 8),
  network_fee DECIMAL(20, 8),
  total_fees DECIMAL(20, 8),

  -- Status tracking
  status VARCHAR(50) NOT NULL, -- pending_payment, completed, failed, expired
  payment_method VARCHAR(100),
  gateway_provider VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,

  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (user_id) REFERENCES end_users(id)
);
```

---

## API Endpoints

### **1. Create Deposit (FLOW 4A)**
```
POST /api/v1/deposits/fiat
Authorization: x-api-key: <client_api_key>
Content-Type: application/json

Request:
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
  "expectedCryptoAmount": "285.71",
  "expiresAt": "2025-11-26T10:00:00Z"
}
```

### **2. Complete Deposit (FLOW 4B - Internal)**
```
POST /api/v1/deposits/fiat/:orderId/complete
Authorization: Internal only (called by webhook handler)
Content-Type: application/json

Request:
{
  "cryptoAmount": "285.71",
  "chain": "ethereum",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "transactionHash": "0xabc123...",
  "gatewayFee": "0.50",
  "proxifyFee": "0.25",
  "networkFee": "0.05",
  "totalFees": "0.80"
}

Response:
{
  "success": true,
  "orderId": "DEP-xxx",
  "sharesMinted": "285710000000000000000"
}
```

### **3. Bank Webhook (Receives Payment Notification)**
```
POST /webhooks/bank/payment-received
Authorization: Signature verification
Content-Type: application/json

Request:
{
  "transactionId": "BANK-TXN-123",
  "amount": "10000",
  "currency": "THB",
  "reference": "DEP-xxx",
  "status": "completed",
  "timestamp": "2025-11-25T15:30:00Z"
}

Response:
{
  "success": true,
  "message": "Payment received and processing"
}
```

---

## Timeline Estimates

| Step | Action | Time |
|------|--------|------|
| 1-2 | API call + response | < 1 second |
| 3 | Client transfers money | Instant - 3 days |
| 4 | Bank webhook | < 1 minute after payment |
| 5 | Webhook processing | < 5 seconds |
| 6 | Fiat → USDC conversion | 30 seconds - 5 minutes |
| 7-8 | Complete deposit + DB update | < 10 seconds |
| 9 | Blockchain transaction | 15 seconds - 5 minutes |
| 10 | Client webhook notification | < 1 second |
| 11 | User sees balance | Immediate on refresh |

**Total Time:**
- **Best case (PromptPay):** 2-3 minutes
- **Typical (bank transfer):** 1-2 hours
- **Worst case (international wire):** 2-5 business days

---

## Implementation Checklist

### **Backend (deposit.router.ts)**
- [x] FLOW 4A: Create deposit endpoint
- [x] Generate region-specific payment instructions
- [x] Return PromptPay details for Thailand
- [x] Return bank details for other regions
- [x] Set expiration (24 hours)
- [x] FLOW 4B: Complete deposit endpoint
- [ ] Bank webhook handler (`/webhooks/bank/payment-received`)
- [ ] Signature verification for webhooks
- [ ] On-ramp provider integration (SCBX/Circle/MoonPay)
- [ ] Blockchain transaction sender
- [ ] Client webhook notification sender

### **Database**
- [x] deposits table with proper schema
- [x] end_user_vault tracking
- [x] client_vault tracking
- [x] audit logging

### **Testing**
- [ ] Test PromptPay QR flow (Thailand)
- [ ] Test bank transfer flow (all regions)
- [ ] Test webhook signature verification
- [ ] Test on-ramp conversion
- [ ] Test blockchain transaction
- [ ] Test error scenarios (timeout, wrong amount, etc.)

---

## Next Steps

1. **Implement bank webhook handler**
2. **Integrate with on-ramp provider API** (SCBX/Circle/MoonPay)
3. **Add blockchain transaction sender**
4. **Implement client webhook notifications**
5. **Add PromptPay QR code generation**
6. **Set up monitoring and alerts**

---

**Last Updated:** 2025-11-25
**Status:** FLOW 4A complete, FLOW 4B complete, Webhook handler TODO
