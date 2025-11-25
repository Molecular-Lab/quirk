# VaultId Handling in B2B API

## Problem

The `withdrawal_transactions` and `deposit_transactions` tables don't store `chain` and `token_address` directly. They only have:
- `client_id`
- `user_id`
- `requested_amount`/`fiat_amount`
- `currency`

But the API contract requires `vaultId` in the format: `{chain}-{tokenAddress}` (e.g., `base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)

## ✅ Correct Solution: Accept vaultId in Request Body

The API contracts already require `vaultId` in the request body for both deposits and withdrawals:

### Deposit Contract
```typescript
// packages/b2b-api-core/contracts/deposit.ts
createDeposit: {
  body: z.object({
    clientId: z.string(),
    userId: z.string(),
    vaultId: z.string(), // ✅ Client specifies which vault!
    amount: z.string(),
    transactionHash: z.string().optional(),
  }),
}
```

### Withdrawal Contract
```typescript
// packages/b2b-api-core/contracts/withdrawal.ts
createWithdrawal: {
  body: z.object({
    clientId: z.string(),
    userId: z.string(),
    vaultId: z.string(), // ✅ Client specifies which vault!
    amount: z.string(),
  }),
}
```

---

## Implementation

### Router - Parse vaultId from Request Body

```typescript
// apps/b2b-api-new/src/router/withdrawal.router.ts
create: async ({ body }) => {
  // ✅ Parse vaultId from request body
  const [chain, tokenAddress] = body.vaultId.split("-");
  
  if (!chain || !tokenAddress) {
    return {
      status: 400,
      body: { error: "Invalid vaultId format. Expected: chain-tokenAddress" }
    };
  }
  
  const withdrawal = await withdrawalService.requestWithdrawal({
    clientId: body.clientId,
    userId: body.userId,
    chain,          // ✅ From vaultId
    tokenAddress,   // ✅ From vaultId
    amount: body.amount,
  });
  
  return {
    body: {
      vaultId: body.vaultId, // ✅ Echo back from request
      // ...
    }
  };
}
```

### Mapper - Accept Optional vaultId

```typescript
// apps/b2b-api-new/src/mapper/withdrawal.mapper.ts
export function mapWithdrawalToDto(
  withdrawal: GetWithdrawalByOrderIDRow | CreateWithdrawalRow,
  vaultId?: string // ✅ Optional parameter
) {
  return {
    vaultId: vaultId || "", // Use provided or empty
    // ...
  };
}
```

---

## Client Usage Example

```typescript
// Client creates withdrawal
const response = await b2bClient.withdrawal.create({
  body: {
    clientId: "client_123",
    userId: "user_456",
    vaultId: "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // ✅ Explicitly specify
    amount: "1000000000000000000000", // 1000 USDC
  }
});

// Response includes the same vaultId
console.log(response.body.vaultId); 
// "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
```

---

## Why This Approach is Correct

### ✅ Advantages

1. **Client Control**: Client explicitly chooses which vault to deposit/withdraw from
2. **Multi-Chain Ready**: Supports multiple chains from day 1
3. **No Ambiguity**: No guessing which vault the user meant
4. **Validation**: Can validate vaultId format before processing
5. **Scalable**: Works for any number of vaults per client

### ✅ Validation

```typescript
// Parse and validate vaultId format
const VAULT_ID_REGEX = /^[a-z]+-0x[a-fA-F0-9]{40}$/;

if (!VAULT_ID_REGEX.test(body.vaultId)) {
  return {
    status: 400,
    body: { error: "Invalid vaultId format" }
  };
}

const [chain, tokenAddress] = body.vaultId.split("-");
```

---

## Database Schema Relationships

```
deposit_transactions (general transaction record)
  ├─> client_organizations (who initiated)
  ├─> user_id (which user)
  └─> No direct vault reference ❌

deposit_batch_queue (DeFi staking queue)
  ├─> deposit_transactions (links to transaction)
  ├─> end_user_vaults (HAS vault info! ✅)
  └─> shares_minted, protocols_to_stake

withdrawal_transactions (general transaction record)
  ├─> client_organizations (who initiated)
  ├─> user_id (which user)
  └─> No direct vault reference ❌

withdrawal_queue (DeFi unstaking queue)
  ├─> withdrawal_transactions (links to transaction)
  ├─> end_user_vaults (HAS vault info! ✅)
  └─> shares_to_burn, protocols_to_unstake
```

**Key Insight:** The vault relationship is stored in the **queue tables** (deposit_batch_queue, withdrawal_queue), not the transaction tables. That's why we need vaultId in the request body.

---

## Future Enhancement: Vault Existence Validation

For production, add vault validation:

```typescript
create: async ({ body }) => {
  const [chain, tokenAddress] = body.vaultId.split("-");
  
  // ✅ Validate vault exists for this client
  const vault = await vaultService.getVault({
    clientId: body.clientId,
    chain,
    tokenAddress,
  });
  
  if (!vault) {
    return {
      status: 404,
      body: { error: "Vault not found" }
    };
  }
  
  // Proceed with deposit/withdrawal...
}
```

---

## Summary

| Aspect | Implementation |
|--------|----------------|
| **vaultId source** | ✅ Request body (client provides) |
| **Format** | `{chain}-{tokenAddress}` |
| **Validation** | Parse and validate format |
| **Multi-chain** | ✅ Supported from day 1 |
| **Scalability** | ✅ Works for unlimited vaults |
| **Client control** | ✅ Client explicitly chooses vault |

**Current implementation correctly receives vaultId from request body and parses it to extract chain and tokenAddress.**

---

**Last Updated:** November 19, 2025

