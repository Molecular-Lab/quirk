# Privy API Test Server

Test API server for Privy embedded wallet operations following Clean Architecture.

## 🎯 Purpose

This app demonstrates how to:
1. Use `@proxify/privy-client` for Privy wallet operations
2. Follow Clean Architecture with DI pattern
3. Handle both Non-Web3 and Web3 Native users
4. Expose REST API endpoints for embedded wallet management

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Privy credentials from https://dashboard.privy.io

### 3. Run Development Server

```bash
pnpm dev
```

Server will start on http://localhost:3002

---

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Privy API Test is running!",
  "timestamp": "2025-11-12T..."
}
```

### Create Embedded Wallet

```bash
POST /api/v1/wallets/create
Content-Type: application/json

{
  "productId": "my-app",
  "userId": "user123",
  "chainType": "ethereum",
  "linkedWalletAddress": "0x..." // Optional: for web3 native users
}
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "walletAddress": "0xABC...123",
    "linkedWalletAddress": null,
    "privyUserId": "did:privy:xxxxx",
    "chainType": "ethereum",
    "createdAt": "2025-11-12T..."
  }
}
```

### Get Wallet by User ID

```bash
GET /api/v1/wallets/user/:productId/:userId
```

Example:
```bash
GET /api/v1/wallets/user/my-app/user123
```

### Get Wallet by Wallet Address

```bash
GET /api/v1/wallets/address/:productId/:walletAddress
```

Example:
```bash
GET /api/v1/wallets/address/my-app/0xDEF...456
```

### Link Wallet Address

```bash
PUT /api/v1/wallets/link
Content-Type: application/json

{
  "productId": "my-app",
  "userId": "user123",
  "walletAddress": "0xDEF...456"
}
```

### Get Detailed Wallet Info

```bash
GET /api/v1/wallets/details/:productId/:userId
```

Returns complete info including Privy user details.

---

## 🧪 Example Usage with cURL

### Create Wallet (Non-Web3 User)

```bash
curl -X POST http://localhost:3002/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "gaming-app",
    "userId": "player123",
    "chainType": "ethereum"
  }'
```

### Create Wallet (Web3 Native User)

```bash
curl -X POST http://localhost:3002/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "defi-app",
    "userId": "defi-user-789",
    "chainType": "ethereum",
    "linkedWalletAddress": "0xDEF1234567890ABCDEF1234567890ABCDEF12345"
  }'
```

### Get Wallet

```bash
curl http://localhost:3002/api/v1/wallets/user/gaming-app/player123
```

---

## 🏗️ Architecture

```
apps/privy-api-test/
├── src/
│   ├── app.ts                    # Main Express app entry
│   ├── config/
│   │   └── env.ts                # Environment config with Zod validation
│   ├── di/
│   │   ├── container.ts          # DI container
│   │   └── factory.ts            # Service factory
│   ├── routers/
│   │   └── embedded-wallet.router.ts
│   ├── controllers/
│   │   └── embedded-wallet.controller.ts
│   ├── services/
│   │   └── embedded-wallet.service.ts
│   └── repository/
│       └── user-embedded-wallet.repository.ts  # Mock (TODO: PostgreSQL)
├── package.json
├── tsconfig.json
└── .env.example
```

### Dependency Flow

```
Express Router
    ↓
Controller (HTTP layer)
    ↓
Service (thin wrapper)
    ↓
Usecase (business logic from @proxify/core)
    ↓
Repository (data access from @proxify/core + DB)
```

---

## ⚠️ Important Notes

### Mock Database Repository

Currently using **in-memory mock repository**. For production, you MUST:

1. Create PostgreSQL table:
```sql
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
  UNIQUE(product_id, user_id)
);
```

2. Replace `MockUserEmbeddedWalletRepository` with real PostgreSQL implementation

See `@proxify/core/EMBEDDED_WALLET_ARCHITECTURE.md` for complete guide.

---

## 📚 Documentation

- **Architecture:** `@proxify/core/EMBEDDED_WALLET_ARCHITECTURE.md`
- **Identity Solution:** `@proxify/core/IDENTITY_SOLUTION.md`
- **Privy Client:** `packages/privy-client/README.md`

---

## 🛠️ Development

```bash
# Run dev server with auto-reload
pnpm dev

# Type check
pnpm type-check

# Build
pnpm build

# Run production build
pnpm start
```

---

**Status:** Development ✅
**Port:** 3002
**Following:** Clean Architecture + DI Pattern (like contract-executor)
