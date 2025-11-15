# Hybrid Wallet Architecture: Database + Privy

## Overview

Proxify uses a **hybrid architecture** for wallet management:
- **Database:** Stores lightweight mapping (productId → userId → UUID → privyUserId)
- **Privy:** Stores full wallet state and user data (source of truth)

This approach provides:
- ✅ Fast lookups (database indexes)
- ✅ Fresh wallet state (always from Privy)
- ✅ Consistent UUIDs (stored in both places)
- ✅ Data integrity (Privy is authoritative)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Request                                  │
│  GET /wallets/user/:productId/:userId                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  1. Database Lookup                              │
│  SELECT id FROM user_wallets                                     │
│  WHERE product_id = $1 AND user_id = $2                         │
│                                                                   │
│  Result: UUID = "550e8400-e29b-41d4-a957-146614174000"          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  2. Construct Privy ID                           │
│  customUserId = "${productId}:${userId}:${uuid}"                │
│                                                                   │
│  Example: "game-app:player-123:550e8400-..."                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  3. Query Privy (Fresh State)                    │
│  privyClient.users().getUserByCustomAuthId(customUserId)        │
│                                                                   │
│  Returns: FRESH wallet data                                      │
│  - Current balance                                               │
│  - Delegated status                                              │
│  - Linked accounts                                               │
│  - Transaction history                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  4. Return Response                              │
│  {                                                                │
│    id: uuid,                // From DB                           │
│    productId: "game-app",    // From Privy metadata             │
│    userId: "player-123",     // From Privy metadata             │
│    walletAddress: "0x...",   // FRESH from Privy                │
│    chainType: "ethereum",    // FRESH from Privy                │
│    delegated: true           // FRESH from Privy                │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## UUID Format: `productId:userId:uuid`

### Why Include UUID in custom_user_id?

**Before (Deterministic UUID):**
```
custom_user_id = "game-app:player-123"
uuid = uuidv5("game-app:player-123", NAMESPACE)  // Generated each time

❌ UUID recreated every time
❌ Can't retrieve UUID from Privy
❌ Dependent on namespace constant
```

**After (UUID Embedded):**
```
// Step 1: Generate UUID ONCE
uuid = randomUUID()  // "550e8400-..."

// Step 2: Store in Privy
custom_user_id = "game-app:player-123:550e8400-..."

// Step 3: Parse UUID from Privy
const [productId, userId, uuid] = custom_user_id.split(':')

✅ UUID generated once, never changes
✅ UUID stored in Privy (single source)
✅ Can extract UUID without database
✅ Guaranteed global uniqueness
```

---

## Wallet Creation Flow

```typescript
// File: packages/core/usecase/embedded-wallet.usecase.ts

public async createEmbeddedWallet(params) {
    // 1. Generate UUID FIRST (before Privy)
    const internalUuid = randomUUID()

    // 2. Build custom_user_id with UUID
    const customUserId = `${productId}:${userId}:${internalUuid}`

    // 3. Store in Privy metadata
    const customMetadata = {
        productId,
        userId,
        internalUuid,  // ← Easy to retrieve later
    }

    // 4. Create Privy user with custom_auth
    const privyUser = await privyClient.createUser({
        linkedAccounts: [{
            type: "custom_auth",
            custom_user_id: customUserId,  // ← Includes UUID
        }],
        customMetadata,
    })

    // 5. Store mapping in database with SAME UUID
    await db.insert({
        id: internalUuid,  // ← Same UUID as in Privy
        productId,
        userId,
        privyUserId: privyUser.id,
        embeddedWalletAddress: wallet.address,
    })
}
```

---

## Wallet Retrieval Flow

### Method 1: By User ID

```typescript
// GET /wallets/user/:productId/:userId

public async getEmbeddedWalletByUserId(params) {
    const { productId, userId } = params

    // 1. Query DB for UUID (fast, indexed)
    const mapping = await db.query(
        "SELECT id FROM user_wallets WHERE product_id = $1 AND user_id = $2",
        [productId, userId]
    )

    // 2. Construct full custom_user_id
    const customUserId = `${productId}:${userId}:${mapping.id}`

    // 3. Query Privy for FRESH state
    const privyUser = await privyClient.getUserByCustomAuthId(customUserId)

    // 4. Return with UUID from DB, fresh data from Privy
    return {
        id: mapping.id,  // From DB
        walletAddress: wallet.address,  // FRESH from Privy
        delegated: wallet.delegated,  // FRESH from Privy
    }
}
```

### Method 2: By Wallet Address

```typescript
// GET /wallets/address/:productId/:walletAddress

public async getEmbeddedWalletByAddress(params) {
    const { productId, walletAddress } = params

    // 1. Query Privy by wallet address
    const privyUser = await privyClient.getUserByWalletAddress(walletAddress)

    // 2. Extract UUID from metadata
    const internalUuid = privyUser.customMetadata.internalUuid

    // 3. Return with UUID from metadata
    return {
        id: internalUuid,  // From Privy metadata
        walletAddress: wallet.address,  // FRESH from Privy
    }
}
```

---

## Database Schema

```sql
-- File: packages/core/migrations/001_create_user_wallets_table.sql

CREATE TABLE user_wallets (
    -- Internal UUID (same as in Privy's custom_user_id)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- External identifiers
    product_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,

    -- Privy link
    privy_user_id VARCHAR(255) NOT NULL UNIQUE,

    -- Wallet info (primary data only)
    embedded_wallet_address VARCHAR(255) NOT NULL,
    linked_wallet_address VARCHAR(255),
    chain_type VARCHAR(50) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(product_id, user_id),
    UNIQUE(embedded_wallet_address)
);

-- Indexes for fast lookups
CREATE INDEX idx_user_wallets_product_user ON user_wallets(product_id, user_id);
CREATE INDEX idx_user_wallets_embedded_address ON user_wallets(embedded_wallet_address);
```

---

## Benefits of Hybrid Approach

### 1. Performance
- **Fast lookups:** Database queries with indexes (< 1ms)
- **Parallel queries:** Can query DB and Privy simultaneously if needed

### 2. Data Integrity
- **Privy is authoritative:** Fresh wallet state always from Privy
- **No stale data:** Database only stores stable mappings, not volatile state

### 3. Reliability
- **Fallback:** If DB fails, can still query Privy by wallet address
- **Consistency:** UUID stored in both places ensures data alignment

### 4. Scalability
- **Efficient queries:** Database handles high-volume lookups
- **Rate limit friendly:** Fewer Privy API calls by caching UUIDs

---

## What's Stored Where

### Database (Lightweight Mapping)
- ✅ Internal UUID
- ✅ Product ID + User ID
- ✅ Privy User ID (DID)
- ✅ Wallet addresses (embedded + linked)
- ✅ Chain type
- ✅ Timestamps

### Privy (Authoritative State)
- ✅ Full user data
- ✅ Wallet state (balance, delegated, etc.)
- ✅ Linked accounts
- ✅ Transaction history
- ✅ Custom metadata (productId, userId, UUID)
- ✅ Custom auth (custom_user_id with UUID)

---

## Migrating Existing Wallets

If you have existing wallets without UUIDs:

```typescript
// Migration script
async function migrateExistingWallets() {
    // 1. Query all users from Privy
    const users = await privyClient.listUsers()

    for (const user of users) {
        // 2. Check if UUID exists in metadata
        if (!user.customMetadata?.internalUuid) {
            // 3. Generate UUID
            const uuid = randomUUID()

            // 4. Update Privy metadata
            await privyClient.updateUser(user.id, {
                customMetadata: {
                    ...user.customMetadata,
                    internalUuid: uuid,
                }
            })

            // 5. Update custom_auth linked account
            const productId = user.customMetadata.productId
            const userId = user.customMetadata.userId
            const newCustomUserId = `${productId}:${userId}:${uuid}`

            await privyClient.linkAccount(user.id, {
                type: "custom_auth",
                custom_user_id: newCustomUserId,
            })

            // 6. Store in database
            await db.insert({
                id: uuid,
                productId,
                userId,
                privyUserId: user.id,
                // ... other fields
            })
        }
    }
}
```

---

## Testing the Implementation

### 1. Create Wallet
```bash
curl -X POST http://localhost:3002/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "game-app",
    "userId": "player-123",
    "chainType": "ethereum"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "userId": "player-123",
#     "walletAddress": "0x742d35...",
#     "privyUserId": "did:privy:...",
#     "chainType": "ethereum"
#   }
# }

# Behind the scenes:
# - UUID generated: "550e8400-..."
# - Stored in Privy: custom_user_id = "game-app:player-123:550e8400-..."
# - Stored in DB: id = "550e8400-..."
```

### 2. Retrieve Wallet
```bash
curl http://localhost:3002/api/v1/wallets/user/game-app/player-123

# Flow:
# 1. DB query: SELECT id FROM user_wallets WHERE product_id='game-app' AND user_id='player-123'
#    Result: uuid = "550e8400-..."
# 2. Privy query: getUserByCustomAuthId("game-app:player-123:550e8400-...")
# 3. Return fresh wallet state with UUID
```

---

## Next Steps

1. ✅ **Run migration:** Apply `001_create_user_wallets_table.sql`
2. ✅ **Install dependencies:** `pnpm install` (for crypto.randomUUID)
3. ✅ **Test wallet creation:** Create a test wallet
4. ✅ **Test wallet retrieval:** Get wallet by userId
5. ⏳ **Replace mock repository:** Implement PostgreSQL repository
6. ⏳ **Handle wallet types:** Distinguish embedded vs linked wallets

---

**Last Updated:** 2025-11-14
**Version:** 1.0 - Hybrid Architecture Implementation
