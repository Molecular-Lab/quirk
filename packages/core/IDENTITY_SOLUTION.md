# Identity Solution: Handling Both Web3 & Non-Web3 Users

## 🎯 The Problem You Identified

**Original Question:**
> "I have both crypto native business app that might credential with user non-custodial wallet Address & fully use my service custodial eg. youtube no web3 infra init"

**Translation:**
- **Type A Business (Web3 Native)**: DeFi apps where users connect with MetaMask
- **Type B Business (Non-Web3)**: Regular apps like YouTube with no crypto knowledge

---

## ✅ The Solution

### Core Principle: **userId is ALWAYS required**

Every user has a `userId` (ProductOwner's app-specific identifier), regardless of whether they're web3 native or not.

```
Non-Web3 User:
  userId: "player123"
  walletAddress: null (before) → "0xABC...123" (after we generate)

Web3 Native User:
  userId: "defi-user-789"
  existingWallet: "0xDEF...456" (they bring this)
  embeddedWallet: "0xABC...789" (we generate this)
```

---

## 📊 Database Mapping Strategy

### Why We Need Database?

**Privy SDK limitation:**
- Privy stores `customMetadata` but doesn't support querying by it
- We need fast lookups by `productId + userId` OR `productId + walletAddress`

**Our Solution:**
```sql
user_embedded_wallets table:
  product_id + user_id → UNIQUE (primary lookup)
  product_id + embedded_wallet_address → UNIQUE
  product_id + linked_wallet_address → UNIQUE (for web3 native)
```

---

## 🔄 Complete Flows

### Flow A: Non-Web3 User (YouTube-like)

**Step 1: ProductOwner creates user**
```typescript
POST /api/v1/embedded-wallets/create
{
  "productId": "youtube-gaming",
  "userId": "player123",         // ← Their app's user ID
  "chainType": "ethereum"
}

Response:
{
  "userId": "player123",
  "walletAddress": "0xABC...123" // ← NEW! They get this back
}
```

**What ProductOwner does:**
1. Store `walletAddress` in their database alongside `userId`
2. Use `userId` for user identification (as usual)
3. Use `walletAddress` when calling deposit/withdraw endpoints

**Step 2: ProductOwner gets wallet info**
```typescript
GET /api/v1/embedded-wallets/user/youtube-gaming/player123

Response:
{
  "userId": "player123",
  "walletAddress": "0xABC...123",
  "chainType": "ethereum"
}
```

**Step 3: ProductOwner uses wallet**
```typescript
POST /api/v1/deposits
{
  "userId": "player123",        // ← For user identification
  "walletAddress": "0xABC...123", // ← For blockchain operation
  "amount": 100,
  "token": "USDC"
}
```

---

### Flow B: Web3 Native User (DeFi-like)

**Step 1: User connects MetaMask**
```typescript
// Frontend: User clicks "Connect Wallet"
const walletAddress = await window.ethereum.request({
  method: 'eth_requestAccounts'
})
// walletAddress = "0xDEF...456"

// ProductOwner backend: Create embedded wallet linked to MetaMask
POST /api/v1/embedded-wallets/create
{
  "productId": "defi-protocol",
  "userId": "defi-user-789",           // ← Generated or from session
  "chainType": "ethereum",
  "linkedWalletAddress": "0xDEF...456"  // ← User's MetaMask
}

Response:
{
  "userId": "defi-user-789",
  "embeddedWalletAddress": "0xABC...789",  // ← Privy-controlled
  "linkedWalletAddress": "0xDEF...456"      // ← User's MetaMask
}
```

**Step 2: ProductOwner gets wallet by address**
```typescript
// User returns later and connects MetaMask again
// Frontend gets: walletAddress = "0xDEF...456"

// Backend: Look up user by wallet address
GET /api/v1/embedded-wallets/address/defi-protocol/0xDEF...456

Response:
{
  "userId": "defi-user-789",             // ← Now we know who they are!
  "embeddedWalletAddress": "0xABC...789",
  "linkedWalletAddress": "0xDEF...456"
}
```

---

## 📋 What to Return to ProductOwners?

### For Non-Web3 Apps (YouTube-like)

**Return:**
```json
{
  "userId": "player123",
  "walletAddress": "0xABC...123",
  "privyUserId": "did:privy:xxxxx"
}
```

**Why?**
- `userId`: They provided it, they use it for user identification
- `walletAddress`: **CRITICAL** - they need this for blockchain operations
- `privyUserId`: Optional, for advanced usage (optional)

**How they use it:**
```typescript
// Store in their database
UPDATE users SET wallet_address = '0xABC...123' WHERE user_id = 'player123'

// Use in API calls
POST /deposit {
  userId: "player123",
  walletAddress: "0xABC...123",  // ← Use this for blockchain tx
  amount: 100
}
```

### For Web3 Native Apps (DeFi-like)

**Return:**
```json
{
  "userId": "defi-user-789",
  "embeddedWalletAddress": "0xABC...789",
  "linkedWalletAddress": "0xDEF...456",
  "privyUserId": "did:privy:yyyyy"
}
```

**Why?**
- `userId`: For user identification in their system
- `embeddedWalletAddress`: Privy-controlled wallet for delegated operations
- `linkedWalletAddress`: User's original MetaMask wallet
- `privyUserId`: Optional

**How they use it:**
```typescript
// User deposits from their MetaMask
POST /deposit {
  userId: "defi-user-789",
  fromWallet: "0xDEF...456",      // User's MetaMask
  toWallet: "0xABC...789",        // Embedded wallet
  amount: 1000
}

// Protocol uses embedded wallet for auto-compounding
POST /internal/auto-compound {
  walletAddress: "0xABC...789",   // Privy signs this automatically
  strategy: "aave-eth"
}
```

---

## 🎨 API Design Summary

### Endpoints

```typescript
// Create wallet (works for both types)
POST /api/v1/embedded-wallets/create
Body: {
  productId: string
  userId: string                    // ALWAYS required
  chainType: string
  linkedWalletAddress?: string      // Optional: for web3 native
}

// Get by userId (primary - for non-web3)
GET /api/v1/embedded-wallets/user/:productId/:userId

// Get by wallet address (for web3 native)
GET /api/v1/embedded-wallets/address/:productId/:walletAddress

// Link wallet later (optional)
PUT /api/v1/embedded-wallets/link
Body: {
  productId: string
  userId: string
  walletAddress: string
}
```

---

## 🧩 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    ProductOwner API                      │
│  (Express/Elysia - HTTP handlers)                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              EmbeddedWalletUsecase                       │
│  - createEmbeddedWallet(productId, userId, chainType)   │
│  - getEmbeddedWalletByUserId(productId, userId)         │
│  - getEmbeddedWalletByAddress(productId, walletAddress) │
└────────────┬───────────────────────────┬────────────────┘
             │                           │
             ▼                           ▼
┌──────────────────────────┐  ┌─────────────────────────┐
│ PrivyUserRepository      │  │ UserWalletRepository    │
│ (Privy SDK calls)        │  │ (PostgreSQL queries)    │
│                          │  │                         │
│ - createUser()           │  │ - create()              │
│ - getUserById()          │  │ - getByUserId()         │
└──────────────────────────┘  │ - getByWalletAddress()  │
                              └─────────────────────────┘
             │                           │
             ▼                           ▼
┌──────────────────────────┐  ┌─────────────────────────┐
│     Privy API            │  │   PostgreSQL Database   │
│  (External service)      │  │  (Our database)         │
└──────────────────────────┘  └─────────────────────────┘
```

---

## ✅ Key Decisions

### 1. **userId is ALWAYS required**
   - Both web3 and non-web3 users have userId
   - ProductOwner provides this (their app-specific identifier)

### 2. **Return both userId AND walletAddress**
   - userId: For user identification
   - walletAddress: For blockchain operations

### 3. **Database mapping is required**
   - Privy SDK doesn't support efficient querying
   - We need fast lookups by userId OR walletAddress

### 4. **Support two query patterns**
   - By userId: `GET /user/:productId/:userId`
   - By walletAddress: `GET /address/:productId/:walletAddress`

### 5. **linkedWalletAddress is optional**
   - Only for web3 native users
   - Links their existing wallet to embedded wallet

---

## 🚀 Next Steps

1. **Implement PostgreSQL Repository**
   - Create `UserEmbeddedWalletRepository` class
   - Implement `IUserEmbeddedWalletDataGateway` interface
   - Use SQLC for type-safe queries

2. **Create Database Migration**
   - Create `user_embedded_wallets` table
   - Add indexes for fast lookups

3. **Create API Handlers**
   - Express/Elysia endpoints
   - Request validation with Zod
   - Error handling

4. **Write Tests**
   - Unit tests for usecase
   - Integration tests for repository
   - E2E tests for API

---

**Last Updated:** 2025-11-12
**Status:** Architecture Design Complete
**Pattern:** Clean Architecture + Database Mapping Layer
