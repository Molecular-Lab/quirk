# Embedded Wallet Creation Examples

This document provides comprehensive examples of creating embedded wallets with various linked account types.

## Supported Chain Types

- `ethereum` - Ethereum and EVM-compatible chains
- `solana` - Solana blockchain
- `stellar` - Stellar blockchain
- `cosmos` - Cosmos blockchain
- `sui` - Sui blockchain
- `tron` - Tron blockchain
- `bitcoin-segwit` - Bitcoin with SegWit
- `near` - NEAR Protocol
- `ton` - The Open Network
- `starknet` - StarkNet
- `movement` - Movement blockchain
- `aptos` - Aptos blockchain

## Supported Linked Account Types

### 1. Custom Auth (Default)
Use this for custom authentication systems or when no other account type applies.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "custom_auth",
      customUserId: "my-system-user-id-123"
    }
  ]
}
```

**Note:** If no `linkedAccounts` are provided, the system automatically creates a custom_auth account with `customUserId` = `${productId}:${userId}`.

### 2. Email
Link user by email address.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "email",
      address: "user@example.com"
    }
  ]
}
```

### 3. Phone
Link user by phone number.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "solana",
  linkedAccounts: [
    {
      type: "phone",
      phoneNumber: "+1234567890"
    }
  ]
}
```

### 4. External Wallet
Link user's existing non-custodial wallet.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "wallet",
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      chainType: "ethereum"
    }
  ]
}
```

### 5. OAuth Providers

#### Google OAuth
```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "google_oauth",
      subject: "google-user-id-123"
    }
  ]
}
```

#### Twitter OAuth
```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "twitter_oauth",
      subject: "twitter-user-id-123"
    }
  ]
}
```

#### Discord OAuth
```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "discord_oauth",
      subject: "discord-user-id-123"
    }
  ]
}
```

#### GitHub OAuth
```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "github_oauth",
      subject: "github-user-id-123"
    }
  ]
}
```

#### Other OAuth Providers
- `tiktok_oauth`
- `linkedin_oauth`
- `spotify_oauth`
- `instagram_oauth`
- `apple_oauth`

All follow the same pattern with `type` and `subject` fields.

### 6. Farcaster
Link user by Farcaster ID (FID).

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "farcaster",
      fid: 12345
    }
  ]
}
```

### 7. Telegram
Link user by Telegram user ID.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "telegram",
      telegramUserId: "telegram-123456789"
    }
  ]
}
```

### 8. Passkey
Link user by passkey (WebAuthn).

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "passkey"
    }
  ]
}
```

### 9. Smart Wallet
Link user by smart contract wallet address.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "smart_wallet",
      address: "0x...",
      chainType: "ethereum"
    }
  ]
}
```

### 10. Cross App
Link user across different Privy apps.

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "cross_app",
      subject: "cross-app-user-id"
    }
  ]
}
```

## Multiple Linked Accounts

Users can have multiple linked accounts. For example, a user with both email and external wallet:

```typescript
{
  productId: "my-product",
  userId: "user-123",
  chainType: "ethereum",
  linkedAccounts: [
    {
      type: "email",
      address: "user@example.com"
    },
    {
      type: "wallet",
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      chainType: "ethereum"
    },
    {
      type: "google_oauth",
      subject: "google-user-id-123"
    }
  ]
}
```

## Complete API Request Example

### cURL
```bash
curl --request POST \
  --url http://localhost:3002/api/v1/wallets/create \
  --header 'Content-Type: application/json' \
  --data '{
    "productId": "youtube-credential",
    "userId": "uuid_1",
    "chainType": "ethereum",
    "linkedAccounts": [
      {
        "type": "email",
        "address": "user@youtube.com"
      }
    ],
    "metadata": {
      "source": "youtube",
      "premium": true
    }
  }'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('http://localhost:3002/api/v1/wallets/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 'youtube-credential',
    userId: 'uuid_1',
    chainType: 'ethereum',
    linkedAccounts: [
      {
        type: 'email',
        address: 'user@youtube.com'
      }
    ],
    metadata: {
      source: 'youtube',
      premium: true
    }
  })
});

const result = await response.json();
console.log(result);
```

## Response Format

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "userId": "uuid_1",
    "walletAddress": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
    "linkedWalletAddress": null,
    "privyUserId": "did:privy:cmhwbp1za00eok40dmji8nggn",
    "chainType": "ethereum",
    "createdAt": "2025-11-13T01:26:38.414Z"
  }
}
```

### Error Response - User Already Exists (500)
```json
{
  "success": false,
  "message": "Failed to create embedded wallet",
  "error": "[EmbeddedWallet] User already has an embedded wallet. Use getEmbeddedWalletByUserId to retrieve it."
}
```

### Error Response - Missing Fields (400)
```json
{
  "success": false,
  "message": "Missing required fields: productId, userId, chainType"
}
```

## Best Practices

1. **Use appropriate linked account types**: Choose the linked account type that matches your authentication method.
2. **Validate inputs**: Ensure email addresses, phone numbers, and wallet addresses are properly formatted.
3. **Handle idempotency**: The API will fail if you try to create a wallet for an existing `productId:userId` combination. Use `GET /api/v1/wallets/user/:productId/:userId` to check first.
4. **Store metadata**: Use the `metadata` field to store additional context about the user.
5. **Choose the right chain**: Select the appropriate `chainType` based on your application's blockchain requirements.

## Error Handling

```typescript
try {
  const result = await createEmbeddedWallet({
    productId: 'my-product',
    userId: 'user-123',
    chainType: 'ethereum',
    linkedAccounts: [
      { type: 'email', address: 'user@example.com' }
    ]
  });
  
  console.log('Wallet created:', result.data.walletAddress);
} catch (error) {
  if (error.message.includes('already has an embedded wallet')) {
    // Wallet already exists, fetch it instead
    const existing = await getWalletByUserId({
      productId: 'my-product',
      userId: 'user-123'
    });
    console.log('Using existing wallet:', existing.data.walletAddress);
  } else {
    console.error('Failed to create wallet:', error);
  }
}
```
