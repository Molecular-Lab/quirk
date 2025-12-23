# Quirk - Implementation Guide

**Last Updated:** 2025-12-11
**Status:** Current Implementation

---

## 🎯 Product Flow Overview

```
1. Client Setup (One-Time)
   → Register on Quirk Dashboard
   → Privy creates Server-Side MPC Wallet
   → Receive API keys & SDK

2. Yield Strategy Configuration
   → Choose strategy (Conservative/Moderate/Morpho/Custom)
   → AI Agent calculates allocation
   → Stored in database

3. User Deposit + Staking (Inflow)
   → User clicks "Deposit $100"
   → Client deducts from Fiat Balance → Credits "Earn Balance"
   → Client calls Quirk API
   → On-ramp: Fiat → USDC (batch for efficiency)
   → DeFi Deployment: Privy signs & executes
   → Update idle_balance in database
   → Update vault growth index

4. User Withdrawal (Outflow)
   → User requests "Withdraw $100"
   → Client calls Quirk API
   → Backend unstakes from DeFi
   → Off-ramp: USDC → Fiat → Bank
   → Update balances
```

---

## 🗄️ Database Setup

### Prerequisites
- PostgreSQL 15+
- Privy Account (Server-Side MPC Wallet)

### Setup Steps

**1. Start Database**
```bash
# Using Docker Compose
docker-compose up -d postgres

# Or local PostgreSQL
psql -U postgres -c "CREATE DATABASE quirk_dev"
```

**2. Run Migrations**
```bash
make db-migrate
# Or manually:
cd database/migrations
migrate -path . -database "postgresql://localhost/quirk_dev" up
```

**3. Verify Schema**
```bash
psql quirk_dev -c "\dt"
# Should see:
# - client_organizations
# - client_vaults
# - end_users
# - end_user_vaults
# - deposit_transactions
# - withdrawal_transactions
# - privy_accounts
# - audit_logs
```

---

## 🔑 Environment Configuration

### Required Environment Variables

**`.env` example:**
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/quirk_dev"

# Privy (MPC Wallet Provider)
PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-app-secret"

# Blockchain RPC
ALCHEMY_API_KEY="your-alchemy-key"
CHAIN_ID="11155111" # Sepolia testnet for dev

# On/Off Ramp (Future)
TRANSFI_API_KEY="your-transfi-key" # Optional for MVP

# API Configuration
PORT="3002"
NODE_ENV="development"
CORS_ORIGINS="http://localhost:5173"
```

---

## 💳 Currency & Bank Account Mapping

### Supported Fiat Currencies

**Current Implementation:**
```typescript
// Exchange Rates (mock for demo)
const EXCHANGE_RATES = {
  THB: 35,    // Thai Baht
  SGD: 1.35,  // Singapore Dollar
  USD: 1,     // US Dollar
  EUR: 0.92,  // Euro
  TWD: 31,    // Taiwan Dollar
  KRW: 1400   // Korean Won
}
```

### Bank Account Configuration

**Quirk's Bank Accounts (for demo):**
```typescript
const PROXIFY_BANK_ACCOUNTS = {
  USD: {
    bankName: "Citibank N.A. (Singapore Branch)",
    accountNumber: "1234567890",
    accountName: "Quirk Pte Ltd",
    swiftCode: "CITISGSX"
  },
  THB: {
    bankName: "Kasikornbank Public Company Limited",
    accountNumber: "9876543210",
    accountName: "Quirk Pte Ltd",
    branchCode: "001"
  },
  SGD: {
    bankName: "DBS Bank Ltd",
    accountNumber: "1122334455",
    accountName: "Quirk Pte Ltd",
    branchCode: "7171"
  }
}
```

**Client Bank Accounts:**
Stored in `client_organizations.bank_accounts` (JSONB column)

---

## 🔢 SQLC Type Generation

### What is SQLC?

SQLC generates type-safe TypeScript code from SQL queries, eliminating manual ORM configuration and ensuring type safety.

### Setup

**1. Install SQLC:**
```bash
# macOS
brew install sqlc

# Or download from https://sqlc.dev/
```

**2. Configuration (`sqlc.yaml`):**
```yaml
version: "2"
plugins:
  - name: ts
    wasm:
      url: https://downloads.sqlc.dev/plugin/sqlc-gen-typescript_0.1.3.wasm
      sha256: 287df8f6cc06377d67ad5ba02c9e0f00c585509881434d15ea8bd9fc751a9368

sql:
  - engine: "postgresql"
    queries: "./database/queries"
    schema: "./database/migrations"
    codegen:
      - plugin: ts
        out: "packages/sqlcgen/src/gen"
        options:
          runtime: node
          driver: postgres
```

**3. Generate Types:**
```bash
make sqlc-generate
# Or directly:
sqlc generate
```

**4. Generated Files:**
```
packages/sqlcgen/src/gen/
├── client_sql.ts       # Client queries
├── vault_sql.ts        # Vault queries
├── user_sql.ts         # User queries
├── deposit_sql.ts      # Deposit queries
└── withdrawal_sql.ts   # Withdrawal queries
```

**5. Usage Example:**
```typescript
import { getClient, createClient } from '@proxify/sqlcgen'

// Type-safe query
const client = await getClient(sql, { id: 'client-123' })
// Returns: GetClientRow | null

// Type-safe insert
const newClient = await createClient(sql, {
  privyAccountId: 'account-id',
  productId: 'prod_xxx',
  companyName: 'Acme Corp',
  businessType: 'B2B'
})
// Returns: CreateClientRow
```

---

## 🪙 Mock Token Setup (Testing)

### MockUSDC Contract

**For Sepolia Testnet:**
```
Contract Address: 0x1d02848c34ed2155613dd5cd26ce20a601b9a489
Symbol: USDQ (MockUSDC)
Decimals: 6
```

### Minting Test Tokens

**Using Hardhat:**
```bash
cd apps/mock-erc20

# Mint to address
npx hardhat run scripts/mint.ts --network sepolia

# Or use the Makefile
make mint ADDRESS=0x... AMOUNT=1000
```

**Programmatic Minting:**
```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const MOCK_USDC_ADDRESS = '0x1d02848c34ed2155613dd5cd26ce20a601b9a489'

async function mintMockUSDC(toAddress: string, amount: string) {
  const account = privateKeyToAccount('0x...')

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http()
  })

  const hash = await client.writeContract({
    address: MOCK_USDC_ADDRESS,
    abi: MockUSDC_ABI,
    functionName: 'mint',
    args: [toAddress, BigInt(amount) * BigInt(10 ** 6)] // 6 decimals
  })

  return hash
}
```

---

## 🔄 Core Flows Implementation

### 1. Client Registration

**Endpoint:** `POST /api/v1/clients`

**Flow:**
```typescript
// 1. Create Privy account (MPC wallet)
const privyAccount = await privy.createAccount({
  organizationId: 'did:privy:...',
  walletType: 'MANAGED' // Server-Side MPC
})

// 2. Create client in database
const client = await clientUsecase.createClient({
  privyAccountId: privyAccount.id,
  product Id: 'prod_...',
  companyName: 'Acme Corp',
  businessType: 'B2B'
})

// 3. Generate API key
const apiKey = await clientUsecase.regenerateApiKey(client.productId)

// 4. Return to client
return { client, apiKey }
```

### 2. Deposit Flow

**Endpoint:** `POST /api/v1/deposits/batch-complete`

**Flow:**
```typescript
// 1. Get completed deposit orders
const orders = body.orderIds // ['DEP-xxx', 'DEP-yyy']

// 2. Complete each deposit in database
for (const orderId of orders) {
  await depositService.completeDeposit({
    orderId,
    chain: '1',
    tokenAddress: USDC_ADDRESS,
    tokenSymbol: 'USDC',
    cryptoAmount: '100.00'
  })
}

// 3. Update product idle_balance (BEFORE mint)
await clientService.addToIdleBalance(clientId, totalAmount)

// 4. Execute blockchain mint (MockUSDC for demo)
const mintResult = await depositService.mintTokensToCustodial(
  chainId,
  mockUSDCAddress,
  custodialWallet,
  totalAmount
)

// 5. Return result
return { success: true, txHash: mintResult.txHash }
```

**Key Pattern:** Update idle_balance BEFORE blockchain operation to ensure database consistency even if mint fails.

### 3. Index Growth Update

**When:** After yield is earned from DeFi protocols

**Flow:**
```typescript
// 1. Calculate new index
const vault = await vaultRepo.getById(vaultId)
const currentIndex = BigInt(vault.currentIndex) // e.g., 1000000000000000000 (1.0)
const yieldEarned = parseFloat('50.00') // $50 yield
const totalAUM = parseFloat(vault.totalStakedBalance) // $10,000

// 2. New index = current × (1 + yield / AUM)
const growthFactor = 1 + (yieldEarned / totalAUM)
const newIndex = currentIndex * BigInt(Math.floor(growthFactor * 1e18)) / BigInt(1e18)

// 3. Safety check: Index can't grow more than 2× per update
if (newIndex > currentIndex * BigInt(2)) {
  throw new Error('Index growth exceeds safety limit')
}

// 4. Update vault
await vaultRepo.updateIndex(vaultId, newIndex.toString())
```

### 4. User Balance Calculation

**When:** User views their balance

**Flow:**
```typescript
// 1. Get user position
const position = await userVaultRepo.getPosition(userId, vaultId)
// { amount: '100', entryIndex: '1000000000000000000' }

// 2. Get current vault index
const vault = await vaultRepo.getById(vaultId)
// { currentIndex: '1050000000000000000' } // 5% growth

// 3. Calculate current value
const value = (
  BigInt(position.amount) *
  BigInt(vault.currentIndex) /
  BigInt(position.entryIndex)
) / BigInt(1e18)
// = (100 * 1.05) / 1.0 = 105.00

return value.toString() // "105.00"
```

---

## 🔒 Authentication Implementation

### API Key Authentication

**Middleware:**
```typescript
export const apiKeyAuth = (clientUsecase: ClientUsecase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey || !apiKey.startsWith('prod_pk_')) {
      return res.status(401).json({ error: 'Invalid API key format' })
    }

    const client = await clientUsecase.validateApiKey(apiKey)
    if (!client) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    req.client = client
    next()
  }
}
```

### Privy Session Authentication

**Middleware:**
```typescript
export const privyAuth = (privyAccountUsecase: PrivyAccountUsecase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const privyOrgId = req.headers['x-privy-org-id'] as string

    if (!privyOrgId) {
      return res.status(401).json({ error: 'Missing Privy org ID' })
    }

    const account = await privyAccountUsecase.getByPrivyOrgId(privyOrgId)
    if (!account) {
      return res.status(401).json({ error: 'Invalid Privy account' })
    }

    req.privySession = {
      organizationId: privyOrgId,
      products: await clientUsecase.getClientsByPrivyOrgId(privyOrgId)
    }
    next()
  }
}
```

---

## 🛠️ Development Commands

### Common Operations

```bash
# Start development
make dev                    # Start all services
make dev-api               # API only
make dev-web               # Web only

# Database
make db-start              # Start PostgreSQL + Redis
make db-stop               # Stop databases
make db-migrate            # Run migrations
make db-rollback           # Rollback last migration
make db-reset              # DROP + CREATE + migrate

# Code Generation
make sqlc-generate         # Generate TypeScript from SQL

# Testing
make test                  # Run all tests
make test-api              # API tests only

# Build
make build                 # Build for production
```

### Project Structure

```
proxify/
├── apps/
│   ├── b2b-api/                 # Main API service
│   ├── whitelabel-web/          # Dashboard & demo
│   └── mock-erc20/              # Test token contracts
├── packages/
│   ├── core/                    # Business logic
│   ├── b2b-api-core/            # API contracts (ts-rest)
│   ├── b2b-sdk/                 # Client SDK
│   ├── sqlcgen/                 # Generated types
│   └── yield-engine/            # DeFi integration
├── database/
│   ├── migrations/              # SQL migrations
│   └── queries/                 # SQLC queries
└── docs/
    └── core/                    # Documentation
```

---

## 📚 Key Implementation Patterns

### 1. Clean Architecture Layers
```
Router → Service → UseCase → Repository
```

### 2. Index-Based Accounting
```
User Value = (amount × currentIndex) / entryIndex
```

### 3. Dual Authentication
```
API Key (SDK) OR Privy Session (Dashboard)
```

### 4. Safety Checks
```
- Index growth < 2× per update
- Withdrawal < available balance
- API rate limiting (100 req/min)
```

---

## 🔍 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Error: connect ECONNREFUSED ::1:5432
Solution: Ensure PostgreSQL is running (make db-start)
```

**2. SQLC Generation Failed**
```
Error: no such file or directory: database/migrations
Solution: Ensure migrations directory exists and has .sql files
```

**3. Privy SDK Error**
```
Error: Invalid Privy credentials
Solution: Check PRIVY_APP_ID and PRIVY_APP_SECRET in .env
```

**4. MockUSDC Mint Failed**
```
Error: execution reverted
Solution: Ensure you have Sepolia ETH for gas fees
```

---

## 📚 References

- **Architecture:** See `docs/core/ARCHITECTURE.md`
- **Business Model:** See `docs/core/BUSINESS.md`
- **Quick Commands:** See `docs/core/QUICK_REFERENCE.md`
- **SQLC Docs:** https://docs.sqlc.dev/
- **Privy Docs:** https://docs.privy.io/
- **Viem Docs:** https://viem.sh/
