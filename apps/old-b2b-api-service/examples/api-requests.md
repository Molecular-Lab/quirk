# API Request Examples

## Creating Embedded Wallets - Correct vs Incorrect

### ❌ INCORRECT - chainType is "email"
```json
{
  "productId": "youtube_credential",
  "userId": "uuid_2",
  "chainType": "email",  // ❌ WRONG! chainType must be a blockchain type
  "linkedAccounts": [{
    "type": "email",
    "address": "user@example.com"
  }]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid chainType: email. Must be one of: ethereum, solana, stellar, cosmos, sui, tron, bitcoin-segwit, near, ton, starknet, movement, aptos"
}
```

---

### ✅ CORRECT - chainType is "ethereum"
```json
{
  "productId": "youtube_credential",
  "userId": "uuid_2",
  "chainType": "ethereum",  // ✅ Correct blockchain type
  "linkedAccounts": [{
    "type": "email",
    "address": "user@example.com"
  }]
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid_2",
    "walletAddress": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
    "linkedWalletAddress": null,
    "privyUserId": "did:privy:cmhwbp1za00eok40dmji8nggn",
    "chainType": "ethereum",
    "createdAt": "2025-11-13T01:26:38.414Z"
  }
}
```

---

## Complete API Examples

### 1. Email Authentication (Most Common)

**cURL:**
```bash
curl -X POST http://localhost:3002/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "youtube_credential",
    "userId": "user_001",
    "chainType": "ethereum",
    "linkedAccounts": [{
      "type": "email",
      "address": "user@youtube.com"
    }],
    "metadata": {
      "source": "youtube",
      "subscriptionTier": "premium"
    }
  }'
```

**JavaScript/TypeScript:**
```typescript
const response = await fetch('http://localhost:3002/api/v1/wallets/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'youtube_credential',
    userId: 'user_001',
    chainType: 'ethereum',
    linkedAccounts: [{
      type: 'email',
      address: 'user@youtube.com'
    }],
    metadata: {
      source: 'youtube',
      subscriptionTier: 'premium'
    }
  })
});

const result = await response.json();
console.log('Wallet created:', result);
```

---

### 2. Phone Authentication

```json
{
  "productId": "my_app",
  "userId": "user_002",
  "chainType": "solana",
  "linkedAccounts": [{
    "type": "phone",
    "phoneNumber": "+1234567890"
  }]
}
```

---

### 3. Custom Auth (Default if no linkedAccounts)

```json
{
  "productId": "youtube_credential",
  "userId": "uuid_3",
  "chainType": "ethereum"
  // No linkedAccounts - will auto-create custom_auth with "youtube_credential:uuid_3"
}
```

**Or explicitly:**
```json
{
  "productId": "youtube_credential",
  "userId": "uuid_3",
  "chainType": "ethereum",
  "linkedAccounts": [{
    "type": "custom_auth",
    "customUserId": "youtube_credential:uuid_3"
  }]
}
```

---

### 4. External Wallet (Web3 Native Users)

```json
{
  "productId": "my_dapp",
  "userId": "web3_user_001",
  "chainType": "ethereum",
  "linkedAccounts": [{
    "type": "wallet",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chainType": "ethereum"
  }]
}
```

---

### 5. Google OAuth

```json
{
  "productId": "my_app",
  "userId": "google_user_001",
  "chainType": "ethereum",
  "linkedAccounts": [{
    "type": "google_oauth",
    "subject": "google-user-id-123456789"
  }]
}
```

---

### 6. Farcaster

```json
{
  "productId": "farcaster_app",
  "userId": "fc_user_001",
  "chainType": "ethereum",
  "linkedAccounts": [{
    "type": "farcaster",
    "fid": 12345
  }]
}
```

---

### 7. Telegram Bot

```json
{
  "productId": "telegram_bot",
  "userId": "tg_user_001",
  "chainType": "ethereum",
  "linkedAccounts": [{
    "type": "telegram",
    "telegramUserId": "telegram-123456789"
  }]
}
```

---

### 8. Multiple Linked Accounts

```json
{
  "productId": "multi_auth_app",
  "userId": "user_004",
  "chainType": "ethereum",
  "linkedAccounts": [
    {
      "type": "email",
      "address": "user@example.com"
    },
    {
      "type": "wallet",
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "chainType": "ethereum"
    },
    {
      "type": "google_oauth",
      "subject": "google-user-id-123"
    }
  ],
  "metadata": {
    "isPremium": true,
    "registrationDate": "2025-11-13"
  }
}
```

---

## Different Blockchain Types

### Ethereum
```json
{ "chainType": "ethereum" }
```

### Solana
```json
{ "chainType": "solana" }
```

### Polygon (use ethereum)
```json
{ "chainType": "ethereum" }  // Polygon is EVM-compatible
```

### Other Supported Chains
```json
{ "chainType": "stellar" }
{ "chainType": "cosmos" }
{ "chainType": "sui" }
{ "chainType": "tron" }
{ "chainType": "bitcoin-segwit" }
{ "chainType": "near" }
{ "chainType": "ton" }
{ "chainType": "starknet" }
{ "chainType": "movement" }
{ "chainType": "aptos" }
```

---

## Error Cases

### Missing Required Fields
```json
{
  "productId": "my_app",
  "userId": "user_001"
  // ❌ Missing chainType
}
```

**Error:**
```json
{
  "success": false,
  "message": "Missing required fields: productId, userId, chainType"
}
```

---

### Invalid Chain Type
```json
{
  "productId": "my_app",
  "userId": "user_001",
  "chainType": "bitcoin"  // ❌ Must be "bitcoin-segwit"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Invalid chainType: bitcoin. Must be one of: ethereum, solana, ..."
}
```

---

### Invalid Linked Account Structure
```json
{
  "productId": "my_app",
  "userId": "user_001",
  "chainType": "ethereum",
  "linkedAccounts": [{
    "type": "email"
    // ❌ Missing 'address' field
  }]
}
```

**Error:**
```json
{
  "success": false,
  "message": "Email linked account requires 'address' field"
}
```

---

### Wallet Already Exists
```json
// Trying to create wallet for same productId + userId again
{
  "productId": "my_app",
  "userId": "user_001",
  "chainType": "ethereum"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Failed to create embedded wallet",
  "error": "[EmbeddedWallet] User already has an embedded wallet. Use getEmbeddedWalletByUserId to retrieve it."
}
```

---

## Retrieving Existing Wallets

### Get by User ID
```bash
curl http://localhost:3002/api/v1/wallets/user/youtube_credential/uuid_2
```

### Get by Wallet Address
```bash
curl http://localhost:3002/api/v1/wallets/address/youtube_credential/0x525b00f0Bf052b9320406100FA660108d94ec46c
```

### Get Detailed Info
```bash
curl http://localhost:3002/api/v1/wallets/details/youtube_credential/uuid_2
```

---

## Summary

**Key Points:**
1. ✅ `chainType` must be a **blockchain type** (ethereum, solana, etc.)
2. ✅ `linkedAccounts` is for **authentication methods** (email, phone, OAuth, etc.)
3. ✅ Each linked account type has **required fields**
4. ✅ If no `linkedAccounts` provided, **custom_auth** is auto-created
5. ✅ You can have **multiple linked accounts** for one user
6. ✅ Wallet creation is **idempotent** - fails if user already exists

**Remember:**
- `chainType` = Where the wallet lives (blockchain)
- `linkedAccounts` = How the user authenticates
