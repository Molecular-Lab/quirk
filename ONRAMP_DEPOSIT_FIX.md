# On-Ramp Deposit Endpoint Fix

## Issue Summary
The on-ramp deposit endpoint was returning 404 errors due to:
1. Wrong endpoint path (`/api/v1/deposits` instead of `/api/v1/deposits/fiat`)
2. Missing client ID extraction from authenticated request
3. Unsupported payment method enum values

## Changes Made

### 1. Backend - Deposit Router (`apps/b2b-api/src/router/deposit.router.ts`)

**Fixed Client ID Extraction:**
- ✅ Extract `clientId` from `req.client.id` (set by API key middleware)
- ✅ Added authentication check for both fiat and crypto deposit endpoints
- ✅ Return 401 error if client ID is missing

**Before:**
```typescript
createFiatDeposit: async ({ body }) => {
  const deposit = await depositService.createDeposit({
    clientId: "", // TODO: Get from API key auth
    ...
  });
}
```

**After:**
```typescript
createFiatDeposit: async ({ body, req }) => {
  const clientId = (req as any).client?.id;
  if (!clientId) {
    return { status: 401, body: { error: "Authentication failed" } };
  }
  const deposit = await depositService.createDeposit({
    clientId,
    ...
  });
}
```

### 2. Backend - Deposit Contract (`packages/b2b-api-core/contracts/deposit.ts`)

**Updated Payment Method to On-Ramp Provider:**
- ✅ Replaced `paymentMethod` enum with `onRampProvider`
- ✅ Added support for: `proxify_gateway`, `circle`, `coinbase`, `bridge`, `moonpay`
- ✅ Set default to `proxify_gateway`

**Before:**
```typescript
paymentMethod: z.enum(["stripe", "wire", "ach", "sepa"]).optional()
```

**After:**
```typescript
onRampProvider: z.enum([
  "proxify_gateway",  // Proxify's internal on-ramp service
  "circle",           // Circle USDC on-ramp
  "coinbase",         // Coinbase on-ramp partnership
  "bridge",           // Bridge protocol
  "moonpay",          // MoonPay partnership
]).optional().default("proxify_gateway")
```

### 3. Frontend - API Client (`apps/whitelabel-web/src/api/b2bClient.ts`)

**Fixed Endpoint Path and Parameter Mapping:**
- ✅ Changed endpoint from `/api/v1/deposits` to `/api/v1/deposits/fiat`
- ✅ Map frontend parameters to backend contract format
- ✅ Renamed `payment_method` → `onRampProvider`

**Before:**
```typescript
async createDeposit(data: { payment_method: string }) {
  const response = await this.axios.post(`${this.baseURL}/api/v1/deposits`, data)
  return response.data
}
```

**After:**
```typescript
async createDeposit(data: { payment_method?: string }) {
  const requestBody = {
    userId: data.user_id,
    amount: data.amount,
    currency: data.currency,
    chain: data.chain,
    tokenSymbol: data.token,
    onRampProvider: data.payment_method as "proxify_gateway" | "circle" | ...
  }
  const response = await this.axios.post(`${this.baseURL}/api/v1/deposits/fiat`, requestBody)
  return response.data
}
```

### 4. Frontend - API Testing Page (`apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`)

**Updated UI to Reflect New Options:**
- ✅ Changed endpoint display to `/api/v1/deposits/fiat`
- ✅ Changed `payment_method` from text input to select dropdown
- ✅ Added on-ramp provider options with descriptions

**New Payment Method Options:**
1. Proxify Gateway (Internal on-ramp) - Default
2. Circle USDC (Banking partnership)
3. Coinbase (Banking partnership)
4. Bridge Protocol
5. MoonPay

## Testing

### ✅ Successful Test Request:
```bash
curl -X POST http://localhost:3002/api/v1/deposits/fiat \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: prod_pk_57bc7df4ba4a508ae163e8af0d9bea2a' \
  -d '{
    "userId": "grab_driver_12345",
    "amount": "10000",
    "currency": "THB",
    "chain": "ethereum",
    "tokenSymbol": "USDC",
    "onRampProvider": "proxify_gateway"
  }'
```

### ✅ Expected Response:
```json
{
  "orderId": "DEP-1764017059747-cfsvljs65",
  "status": "pending",
  "paymentInstructions": {
    "method": "stripe",
    "amount": "10000",
    "currency": "THB",
    "stripePaymentUrl": "https://checkout.stripe.com/c/pay/DEP-1764017059747-cfsvljs65",
    "reference": "DEP-1764017059747-cfsvljs65"
  },
  "expectedCryptoAmount": "10000",
  "expiresAt": "2025-11-24T20:59:19.749Z",
  "createdAt": "2025-11-24T20:44:19.746Z"
}
```

## Architecture Alignment

The changes align with your INDEX_VAULT_SYSTEM.md flow:

**FLOW 4A: FIAT DEPOSIT (B2B ESCROW → ON-RAMP → STAKING)**
- ✅ Client uses API key for authentication
- ✅ Request creates deposit record with clientId
- ✅ On-ramp provider selection (Proxify or partnerships)
- ✅ Returns order ID and payment instructions
- ✅ Supports multiple chains and tokens

## Next Steps

1. **Frontend Integration:** Test the whitelabel-web UI to ensure deposit form works
2. **Webhook Implementation:** Implement `/api/v1/deposits/fiat/:orderId/complete` for payment confirmation
3. **Crypto Direct Deposit:** Test `/api/v1/deposits/crypto/initiate` flow
4. **Payment Gateway Integration:** Connect actual payment processors (MoonPay, Circle, etc.)

## Files Modified

1. `apps/b2b-api/src/router/deposit.router.ts` - Client ID extraction
2. `packages/b2b-api-core/contracts/deposit.ts` - On-ramp provider enum
3. `apps/whitelabel-web/src/api/b2bClient.ts` - API client endpoint fix
4. `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx` - UI updates

---
**Status:** ✅ FIXED
**Date:** 2025-11-24
**Tested:** Yes - API endpoint working
