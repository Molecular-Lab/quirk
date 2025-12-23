# @proxify/core

> Core business logic and domain models for Quirk embedded wallet infrastructure

## 📦 What's Inside

This package contains the core implementation of Privy-based embedded wallet management following Clean Architecture principles.

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│           External Layers                    │
│  (API Controllers, CLI, WebSocket, etc.)    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Usecase Layer                       │
│  (Business Logic & Orchestration)           │
│  - embedded-wallet.usecase.ts               │
│  - privy.usecase.ts                         │
│  - wallet-transaction.usecase.ts (TODO)     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Repository Layer                     │
│  (Data Access & External APIs)              │
│  - user.repository.ts                       │
│  - wallet.repository.ts                     │
│  - wallet-transaction.repository.ts         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Datagateway Layer                     │
│  (Interfaces & Contracts)                   │
│  - privy-user.datagateway.ts                │
│  - user-embedded-wallet.datagateway.ts      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Entity Layer                        │
│  (Domain Models & Validation)               │
│  - privy-user.entity.ts                     │
│  - privy-wallet.entity.ts                   │
│  - user-embedded-wallet.entity.ts           │
└─────────────────────────────────────────────┘
```

## 📚 Documentation

### Quick Start
- **[PRIVY_QUICK_REFERENCE.md](./PRIVY_QUICK_REFERENCE.md)** - Fast lookup for common operations
- **[WALLET_CREATION_EXAMPLES.md](./WALLET_CREATION_EXAMPLES.md)** - Practical code examples

### Comprehensive Guides
- **[PRIVY_COMPLETE_REFERENCE.md](./PRIVY_COMPLETE_REFERENCE.md)** - ⭐ **START HERE** - Complete knowledge base
- **[PRIVY_IMPLEMENTATION_GUIDE.md](./PRIVY_IMPLEMENTATION_GUIDE.md)** - Detailed implementation patterns
- **[PRIVY_ARCHITECTURE.md](./PRIVY_ARCHITECTURE.md)** - Architecture decisions and patterns

### Important Reminders

> 🔴 **READ THIS BEFORE CODING:**
>
> 1. **All getState operations should query Privy directly** - Don't cache, always get fresh data
> 2. **This is a custodial API** - Handle each user request with its own wallet context (chain, address, transactions)
> 3. **Maintain clean architecture** - Follow the layer pattern strictly
> 4. **Check PRIVY_COMPLETE_REFERENCE.md** - All knowledge and important links are documented there

## 🚀 Features

### ✅ Phase 1: Wallet Creation (Complete)
- [x] Create embedded wallets for users
- [x] Support multiple account types (custom_auth, email, phone, wallet)
- [x] Link existing wallets to embedded wallets
- [x] Retrieve wallets by userId or address
- [x] Store user-wallet mappings
- [x] Snake_case ↔ camelCase transformations

### 🔨 Phase 2: Transaction Execution (In Progress)
- [ ] Send transactions (Ethereum, Base, Polygon, Arbitrum)
- [ ] Sign transactions and messages
- [ ] Switch chains dynamically
- [ ] Gas estimation
- [ ] Transaction status tracking

### 🎯 Phase 3: On/Off Ramp (Planned)
- [ ] Card-based funding
- [ ] Apple Pay integration
- [ ] Google Pay integration
- [ ] Fiat on-ramp
- [ ] Crypto off-ramp

## 🎓 Usage Examples

### Creating an Embedded Wallet

```typescript
import { EmbeddedWalletUsecase, PrivyUserRepository, MockUserEmbeddedWalletRepository } from '@proxify/core'
import { PrivyClient } from '@privy-io/node'

// Initialize dependencies
const privyClient = new PrivyClient(appId, appSecret)
const privyUserRepo = new PrivyUserRepository(privyClient)
const userWalletRepo = new MockUserEmbeddedWalletRepository()
const embeddedWalletUsecase = new EmbeddedWalletUsecase(privyUserRepo, userWalletRepo)

// Create wallet for a user
const result = await embeddedWalletUsecase.createEmbeddedWallet({
  productId: 'my-app',
  userId: 'user-123',
  chainType: 'ethereum',
  linkedAccounts: [
    {
      type: 'custom_auth',
      custom_user_id: 'my-app:user-123',
    },
  ],
})

console.log('Wallet Address:', result.wallet.address)
console.log('Privy User ID:', result.userWallet.privyUserId)
```

### Getting a User's Wallet

```typescript
const wallet = await embeddedWalletUsecase.getEmbeddedWalletByUserId({
  productId: 'my-app',
  userId: 'user-123',
})

console.log('Embedded Wallet:', wallet.embeddedWalletAddress)
console.log('Linked Wallet:', wallet.linkedWalletAddress)
console.log('Chain:', wallet.chainType)
```

### Getting Detailed Wallet Info

```typescript
const details = await embeddedWalletUsecase.getDetailedWalletInfo(
  'my-app',
  'user-123'
)

console.log('User:', details.privyUser)
console.log('Wallet:', details.embeddedWallet)
console.log('Mapping:', details.userWallet)
```

## 🏗️ Project Structure

```
packages/core/
├── entity/                          # Domain models & Zod schemas
│   ├── privy-user.entity.ts        # Privy user with linked accounts
│   ├── privy-wallet.entity.ts      # Embedded & external wallets
│   ├── user-embedded-wallet.entity.ts  # User-wallet mapping
│   └── wallet-transaction.entity.ts    # Transaction models (TODO)
│
├── datagateway/                     # Interface definitions
│   ├── privy-user.datagateway.ts   # User operations interface
│   └── user-embedded-wallet.datagateway.ts  # Wallet mapping interface
│
├── repository/                      # Data access implementations
│   ├── user.repository.ts          # Privy user operations
│   ├── wallet.repository.ts        # Privy wallet operations
│   └── wallet-transaction.repository.ts  # Transaction operations (TODO)
│
├── usecase/                         # Business logic
│   ├── embedded-wallet.usecase.ts  # Wallet creation & management
│   ├── privy.usecase.ts            # General Privy operations
│   └── wallet-transaction.usecase.ts  # Transaction handling (TODO)
│
├── utils/                           # Shared utilities
│   └── safe-parse.ts               # Type-safe Zod parsing
│
└── docs/                            # Documentation
    ├── README.md                    # This file
    ├── PRIVY_COMPLETE_REFERENCE.md # ⭐ Complete guide
    ├── PRIVY_QUICK_REFERENCE.md    # Quick lookup
    ├── PRIVY_IMPLEMENTATION_GUIDE.md
    ├── PRIVY_ARCHITECTURE.md
    └── WALLET_CREATION_EXAMPLES.md
```

## 🔗 Dependencies

```json
{
  "@privy-io/node": "^1.x",     // Privy SDK for server-side operations
  "zod": "^3.x",                 // Schema validation & transformation
  "verror": "^1.x"               // Structured error handling
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📋 API Reference

### EmbeddedWalletUsecase

Main usecase for managing embedded wallets.

```typescript
class EmbeddedWalletUsecase {
  // Create embedded wallet for a user
  async createEmbeddedWallet(params: CreateEmbeddedWalletParams): Promise<{
    userWallet: UserEmbeddedWallet
    wallet: PrivyEmbeddedWallet
  }>

  // Get wallet by user ID
  async getEmbeddedWalletByUserId(params: GetWalletByUserIdParams): Promise<UserEmbeddedWallet>

  // Get wallet by address (embedded or linked)
  async getEmbeddedWalletByAddress(params: GetWalletByAddressParams): Promise<UserEmbeddedWallet>

  // Link external wallet to user's embedded wallet
  async linkWalletAddress(
    productId: string,
    userId: string,
    walletAddress: string
  ): Promise<UserEmbeddedWallet>

  // Get detailed wallet info including Privy user details
  async getDetailedWalletInfo(productId: string, userId: string): Promise<{
    userWallet: UserEmbeddedWallet
    privyUser: PrivyUser
    embeddedWallet: PrivyEmbeddedWallet
  }>
}
```

### PrivyUsecase

General Privy operations.

```typescript
class PrivyUsecase {
  // Get user by Privy user ID
  async getUserById(userId: string): Promise<PrivyUser | null>

  // List all users with pagination
  async listUsers(options?: {
    limit?: number
    cursor?: string
  }): Promise<{
    users: PrivyUser[]
    nextCursor?: string
  }>

  // Get all wallets for a user
  async getUserWallets(userId: string): Promise<PrivyEmbeddedWallet[]>
}
```

## 🔒 Security Considerations

1. **Never expose Privy App Secret** - Keep it in environment variables
2. **Validate all user inputs** - Use Zod schemas for validation
3. **Handle errors gracefully** - Use VError for structured error handling
4. **Log security events** - Track wallet creation, transactions, etc.
5. **Rate limiting** - Implement rate limiting on API endpoints
6. **Audit trail** - Keep logs of all wallet operations

## 🛠️ Development

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

### Format

```bash
pnpm format
```

## 📝 Contributing

When adding new features:

1. ✅ Follow clean architecture pattern
2. ✅ Create entity schemas with Zod
3. ✅ Define datagateway interfaces
4. ✅ Implement repositories
5. ✅ Write usecase business logic
6. ✅ Add tests for all layers
7. ✅ Update documentation

## 📖 Additional Resources

### Official Privy Documentation
- **Wallet Operations:** https://docs.privy.io/wallets/wallets/server-side-access
- **Transactions:** https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction
- **Funding:** https://docs.privy.io/wallets/funding/methods/card

### Examples
- **Privy Next.js Funding:** https://github.com/privy-io/examples/tree/main/examples/privy-next-funding

### Internal Docs
- See `./PRIVY_COMPLETE_REFERENCE.md` for comprehensive guide
- See `./PRIVY_QUICK_REFERENCE.md` for quick lookups
- See `./WALLET_CREATION_EXAMPLES.md` for code examples

---

## 🎯 Next Steps

### Immediate (Phase 2)

1. **Implement Transaction Layer**
   - Create `WalletTransactionUsecase`
   - Add `sendTransaction` method
   - Add `signMessage` method
   - Add `switchChain` method

2. **Add Transaction Tracking**
   - Store transaction history
   - Track transaction status
   - Handle transaction failures

3. **Enhance Error Handling**
   - Better error messages
   - Retry logic for failed transactions
   - Transaction simulation before sending

### Future (Phase 3)

1. **On/Off Ramp Integration**
   - Card-based funding UI
   - Apple Pay integration
   - Google Pay integration

2. **Advanced Features**
   - Batch transactions
   - Smart contract interactions
   - Multi-chain support

---

**Built with ❤️ using Clean Architecture and Privy**
