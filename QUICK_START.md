# 🚀 Proxify Quick Start Guide

Complete setup guide for the Proxify wallet custodial API with hybrid database architecture.

---

## 📋 Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- **Docker** & Docker Compose
- **Privy Account** (get from https://dashboard.privy.io)

---

## ⚡ Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
make install
```

### 2. Start Database
```bash
make db-start
```

This will:
- Start PostgreSQL in Docker
- Wait for database to be ready
- Display connection info

### 3. Run Migrations
```bash
make db-migrate
```

Done! Database is ready with the `user_wallets` table.

---

## 🔐 Configure Privy Credentials

Edit `apps/privy-api-test/.env`:

```env
PRIVY_APP_ID=your-privy-app-id          # Get from dashboard.privy.io
PRIVY_APP_SECRET=your-privy-app-secret  # Get from dashboard.privy.io
```

---

## 🎯 Start Development Server

```bash
make dev
```

Server will start at **http://localhost:3002**

---

## 🧪 Test the API

### Create a Wallet
```bash
make test-wallet-create
```

Or manually:
```bash
curl -X POST http://localhost:3002/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "test-app",
    "userId": "test-user-001",
    "chainType": "ethereum"
  }'
```

### Get Wallet by User ID
```bash
make test-wallet-get PRODUCT_ID=test-app USER_ID=test-user-001
```

### Get Portfolio (All Chains)
```bash
make test-portfolio WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## 📚 All Available Commands

Run `make help` or `make` to see all commands:

```
Proxify - Wallet Custodial API

Usage:
  make <target>

General
  help                  Display this help message

Database
  db-start              Start PostgreSQL database with Docker
  db-stop               Stop PostgreSQL database
  db-restart            Restart PostgreSQL database
  db-logs               View PostgreSQL logs
  db-connect            Connect to PostgreSQL with psql
  db-migrate            Run database migrations
  db-reset              Reset database (drop and recreate)
  db-pgadmin            Start pgAdmin web interface

Development
  install               Install dependencies
  dev                   Start development server
  dev-core              Build core package in watch mode
  test                  Run tests
  lint                  Run linter
  format                Format code

Docker
  docker-up             Start all services (database + pgAdmin)
  docker-down           Stop all services
  docker-ps             List running containers
  docker-clean          Remove all containers and volumes

Setup
  setup                 Complete setup (install + database + migrate)

Cleanup
  clean                 Clean build artifacts and node_modules

Wallet Testing
  test-wallet-create    Test wallet creation (requires server running)
  test-wallet-get       Test wallet retrieval (PRODUCT_ID= USER_ID=)
  test-portfolio        Test portfolio endpoint (WALLET=)

Information
  info                  Show system information
```

---

## 🐘 Database Info

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `proxify_dev`
- User: `proxify_user`
- Password: `proxify_password`

**Connection String:**
```
postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev
```

**Connect via psql:**
```bash
make db-connect
```

**pgAdmin Web UI:**
```bash
make db-pgadmin
```
Then open http://localhost:5050
- Email: `admin@admin.com`
- Password: `admin`

---

## 📊 API Endpoints

### Wallet Management
- `POST /api/v1/wallets/create` - Create wallet
- `GET /api/v1/wallets/user/:productId/:userId` - Get by user ID
- `GET /api/v1/wallets/address/:productId/:walletAddress` - Get by address
- `PUT /api/v1/wallets/link` - Link external wallet
- `GET /api/v1/wallets/details/:productId/:userId` - Get detailed info

### Portfolio & Balance
- `GET /api/v1/wallet-execution/portfolio/:walletAddress` - All chains + tokens
- `POST /api/v1/wallet-execution/balance` - Single chain balance
- `GET /api/v1/wallet-execution/stats/:walletAddress/:chainId` - Chain stats

### Transactions
- `POST /api/v1/wallet-execution/transfer` - Send ETH or tokens
- `POST /api/v1/wallet-execution/withdraw` - Withdraw from wallet
- `POST /api/v1/wallet-execution/deposit` - Deposit to wallet

---

## 🏗️ Architecture

**Hybrid Approach:**
- **Database:** Stores lightweight mapping (productId:userId → UUID → privyUserId)
- **Privy:** Stores full wallet state (source of truth)

**UUID Format:** `productId:userId:uuid`
- Example: `game-app:player-123:550e8400-e29b-41d4-a957-146614174000`

**Wallet Retrieval Flow:**
1. Query DB for UUID (fast, indexed)
2. Construct full custom_user_id: `productId:userId:uuid`
3. Query Privy for FRESH wallet state
4. Return latest data

See `packages/core/HYBRID_WALLET_ARCHITECTURE.md` for details.

---

## 🔧 Troubleshooting

### Database won't start
```bash
# Check Docker is running
docker info

# Check containers
make docker-ps

# View logs
make db-logs

# Restart database
make db-restart
```

### Migration errors
```bash
# Reset database (WARNING: deletes all data)
make db-reset
```

### Port conflicts
If port 5432 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - '5433:5432'  # Use 5433 instead
```

Then update `.env`:
```env
DATABASE_URL=postgresql://proxify_user:proxify_password@localhost:5433/proxify_dev
```

---

## 🌐 Supported Chains (7 total)

1. **Ethereum Mainnet** (chainId: 1)
2. **Sepolia Testnet** (chainId: 11155111)
3. **Polygon** (chainId: 137)
4. **BSC** (chainId: 56)
5. **Arbitrum One** (chainId: 42161)
6. **Optimism** (chainId: 10)
7. **Base** (chainId: 8453)

---

## 💰 Supported Tokens

- **Native:** ETH, MATIC, BNB
- **Stablecoins:** USDT, USDC (on all chains)

---

## 📖 Documentation

- **Architecture:** `packages/core/HYBRID_WALLET_ARCHITECTURE.md`
- **Privy Guide:** `packages/core/PRIVY_IMPLEMENTATION_GUIDE.md`
- **API Examples:** `packages/core/WALLET_CREATION_EXAMPLES.md`
- **Business Docs:** `/docs` directory

---

## 🎓 Example Workflow

```bash
# 1. Complete setup
make setup

# 2. Start server (in new terminal)
make dev

# 3. Create wallet
make test-wallet-create

# 4. Get wallet info
make test-wallet-get PRODUCT_ID=test-app USER_ID=test-user-001

# 5. Check portfolio across all chains
# (use wallet address from step 3 response)
make test-portfolio WALLET=0x...

# 6. View database
make db-connect
# Then run: SELECT * FROM user_wallets;
```

---

## 🚨 Important Notes

1. **Mock Repository:** Currently using in-memory storage. For production, implement PostgreSQL repository (see `apps/privy-api-test/src/repository/user-embedded-wallet.repository.ts`)

2. **Privy API Keys:** Don't commit `.env` file with real credentials

3. **Rate Limits:** Privy has rate limits. For production, implement caching.

4. **UUID Generation:** Uses `crypto.randomUUID()` - requires Node >= 15

---

## 🔐 Security Checklist

- [ ] Configure Privy API keys in `.env`
- [ ] Never commit `.env` to Git
- [ ] Use strong database password in production
- [ ] Enable HTTPS for production API
- [ ] Implement rate limiting
- [ ] Add API key authentication
- [ ] Enable audit logging

---

## 📞 Need Help?

- **Documentation:** Check `/docs` and `packages/core/*.md` files
- **Makefile:** Run `make help` for all commands
- **Database:** Run `make info` for system status
- **Privy Docs:** https://docs.privy.io

---

**Last Updated:** 2025-11-14
**Version:** 1.0 - Hybrid Architecture with productId:userId:uuid
