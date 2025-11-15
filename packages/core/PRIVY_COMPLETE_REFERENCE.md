# Privy Complete Reference & Implementation Guide

> **Last Updated:** 2025-11-13
> **Purpose:** Comprehensive knowledge base for Privy embedded wallet integration
> **Custodial API Focus:** Server-side wallet management for each user request

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Wallet Operations](#wallet-operations)
5. [Transaction Handling](#transaction-handling)
6. [Funding & On/Off Ramp](#funding--onoff-ramp)
7. [API Reference](#api-reference)
8. [Important Links](#important-links)
9. [Implementation Notes](#implementation-notes)

---

## Overview

### What is Privy?

Privy is an embedded wallet infrastructure that allows you to create custodial wallets for your users. This implementation is a **custodial API** where we handle all wallet operations server-side on behalf of users.

### Key Philosophy

1. **All getState operations should ask Privy as default** in this phase
2. **Every user request gets its own wallet context** - handle chain, address, and transaction requests individually
3. **Maintain clean architecture** - Entity → Datagateway → Repository → Usecase pattern

---

## Core Concepts

### User Types

1. **Non-Web3 Users**: Only have userId, we generate embedded wallet for them
2. **Web3 Native Users**: Have existing non-custodial wallet, can link to embedded wallet

### Account Types

Privy supports multiple linked account types:

- `wallet` - Blockchain wallet (embedded or external)
- `email` - Email-based authentication
- `phone` - Phone number authentication
- `google` - Google OAuth
- `custom_auth` - Custom authentication with `custom_user_id`
- `cross_app` - Cross-application identity

### Embedded Wallet Characteristics

```typescript
{
  type: "wallet",
  walletClientType: "privy",
  connectorType: "embedded",
  delegated: false,  // Can be false initially
  chainType: "ethereum" | "solana" | "base" | ...,
  address: "0x...",
}
```

---

## Architecture

### Clean Architecture Layers

```
Controller (HTTP)
    ↓
Service/Usecase (Business Logic)
    ↓
Repository (Data Access)
    ↓
Datagateway (Interface)
    ↓
Entity (Domain Models)
```

### Data Flow

```
Client Request (camelCase)
    ↓
Usecase (prepares snake_case for Privy)
    ↓
Repository (sends to Privy API with snake_case)
    ↓
Privy API (returns snake_case)
    ↓
Zod Schema (transforms to camelCase)
    ↓
Usecase/Controller (returns camelCase to client)
```

### Key Files

- **Entities**: `entity/privy-user.entity.ts`, `entity/privy-wallet.entity.ts`
- **Datagateways**: `datagateway/privy-user.datagateway.ts`
- **Repositories**: `repository/user.repository.ts`, `repository/wallet.repository.ts`
- **Usecases**: `usecase/embedded-wallet.usecase.ts`, `usecase/privy.usecase.ts`

---

## Wallet Operations

### 1. Get Connected Wallet

**Docs:** https://docs.privy.io/wallets/wallets/get-a-wallet/get-connected-wallet

Get the currently connected wallet for a user (client-side).

```typescript
const wallet = useWallets().wallets[0]
```

### 2. Get Wallet by ID

**Docs:** https://docs.privy.io/wallets/wallets/get-a-wallet/get-wallet-by-id

Retrieve a specific wallet by its Privy wallet ID.

```typescript
const wallet = await privyClient.wallets().get(walletId)
```

### 3. Get All Wallets

**Docs:** https://docs.privy.io/wallets/wallets/get-a-wallet/get-all-wallets

List all wallets for a user.

```typescript
const user = await privyClient.users().get(userId)
const wallets = user.linkedAccounts.filter(
  account => account.type === 'wallet'
)
```

### 4. Server-Side Wallet Access

**Docs:** https://docs.privy.io/wallets/wallets/server-side-access

**IMPORTANT:** This is our primary mode of operation.

```typescript
// Get user with all wallets
const user = await privyClient.users().get(userId)

// Find embedded wallet
const embeddedWallet = user.linkedAccounts.find(
  account =>
    account.type === 'wallet' &&
    account.walletClientType === 'privy' &&
    account.connectorType === 'embedded'
)
```

**Note:** Use this approach for all state queries in this phase.

---

## Transaction Handling

### 1. Send a Transaction (Ethereum)

**Docs:** https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction

Send a transaction from an embedded wallet.

```typescript
import { sendTransaction } from '@privy-io/server-auth'

const txHash = await sendTransaction({
  privyAppId: process.env.PRIVY_APP_ID,
  privyAppSecret: process.env.PRIVY_APP_SECRET,
  userId: user.id,
  chainType: 'ethereum',
  transaction: {
    to: '0x...',
    value: '0x...',
    data: '0x...',
  },
})
```

**Implementation Required:**
- [ ] Create `WalletTransactionUsecase` for handling transaction requests
- [ ] Support Ethereum, Base, Polygon, Arbitrum chains
- [ ] Add transaction status tracking
- [ ] Implement gas estimation

### 2. Sign a Transaction

**Docs:** https://docs.privy.io/wallets/using-wallets/ethereum/sign-a-transaction

Sign a transaction without broadcasting.

```typescript
const signature = await signTransaction({
  privyAppId: process.env.PRIVY_APP_ID,
  privyAppSecret: process.env.PRIVY_APP_SECRET,
  userId: user.id,
  chainType: 'ethereum',
  transaction: {
    to: '0x...',
    value: '0x...',
    data: '0x...',
  },
})
```

**Implementation Required:**
- [ ] Add signing-only methods to transaction usecase
- [ ] Support EIP-712 typed data signing
- [ ] Support personal_sign for messages

### 3. Switch Chain

**Docs:** https://docs.privy.io/wallets/using-wallets/ethereum/switch-chain

Change the active chain for a wallet.

```typescript
await switchChain({
  privyAppId: process.env.PRIVY_APP_ID,
  privyAppSecret: process.env.PRIVY_APP_SECRET,
  userId: user.id,
  chainId: 8453, // Base
})
```

**Implementation Required:**
- [ ] Add chain switching to wallet management
- [ ] Support multi-chain wallets
- [ ] Handle chain-specific RPC endpoints

---

## Funding & On/Off Ramp

### Card-Based Funding

**Docs:** https://docs.privy.io/wallets/funding/methods/card

Privy supports direct card purchases of crypto.

**Focus Areas:**
- Apple Pay integration: https://docs.privy.io/recipes/card-based-funding
- Google Pay integration: https://docs.privy.io/recipes/card-based-funding

**Example Implementation:**
Repository: https://github.com/privy-io/examples/tree/main/examples/privy-next-funding

### Implementation Phases

**Phase 1: Wallet Creation** ✅
- [x] Create embedded wallets
- [x] Link accounts
- [x] Store user-wallet mappings

**Phase 2: Transaction Execution** (Current)
- [ ] Send transactions
- [ ] Sign messages
- [ ] Switch chains
- [ ] Gas estimation

**Phase 3: On/Off Ramp** (Next)
- [ ] Card-based funding
- [ ] Apple Pay integration
- [ ] Google Pay integration
- [ ] Fiat on-ramp
- [ ] Crypto off-ramp

---

## API Reference

### Privy Client Methods

#### Users

```typescript
// Create user
await privyClient.users().create({
  linked_accounts: [
    {
      type: 'custom_auth',
      custom_user_id: 'product:user123',
    },
  ],
  wallets: [{ chain_type: 'ethereum' }],
  custom_metadata: { ... },
})

// Get user
await privyClient.users().get(userId)

// List users
await privyClient.users().list({
  limit: 50,
  cursor: 'next_page_cursor',
})

// Update user
await privyClient.users().update(userId, {
  custom_metadata: { ... },
})
```

#### Wallets

```typescript
// Get wallet
await privyClient.wallets().get(walletId)

// Create wallet for existing user
await privyClient.wallets().create({
  user_id: userId,
  chain_type: 'ethereum',
})
```

### Field Name Conversions

**Request (JS → Privy API):**
- `linkedAccounts` → `linked_accounts`
- `customUserId` → `custom_user_id`
- `chainType` → `chain_type`
- `walletClientType` → `wallet_client_type`
- `connectorType` → `connector_type`
- `customMetadata` → `custom_metadata`

**Response (Privy API → JS):**
- Handled automatically by Zod schemas with `.transform()`
- See `entity/privy-user.entity.ts` for transformation logic

---

## Important Links

### Official Documentation

1. **Wallet Access:**
   - Get Connected Wallet: https://docs.privy.io/wallets/wallets/get-a-wallet/get-connected-wallet
   - Get Wallet by ID: https://docs.privy.io/wallets/wallets/get-a-wallet/get-wallet-by-id
   - Get All Wallets: https://docs.privy.io/wallets/wallets/get-a-wallet/get-all-wallets
   - Server-Side Access: https://docs.privy.io/wallets/wallets/server-side-access

2. **Transaction Operations:**
   - Send Transaction: https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction
   - Sign Transaction: https://docs.privy.io/wallets/using-wallets/ethereum/sign-a-transaction
   - Switch Chain: https://docs.privy.io/wallets/using-wallets/ethereum/switch-chain

3. **Funding:**
   - Card-Based Funding: https://docs.privy.io/wallets/funding/methods/card
   - Apple Pay & Google Pay: https://docs.privy.io/recipes/card-based-funding

### Example Repositories

- Privy Next.js Funding Example: https://github.com/privy-io/examples/tree/main/examples/privy-next-funding

### Internal Documentation

- Quick Reference: `PRIVY_QUICK_REFERENCE.md`
- Implementation Guide: `PRIVY_IMPLEMENTATION_GUIDE.md`
- Architecture: `PRIVY_ARCHITECTURE.md`
- Wallet Creation Examples: `WALLET_CREATION_EXAMPLES.md`

---

## Implementation Notes

### Current State (Phase 1 Complete)

✅ **Completed:**
1. User creation with embedded wallets
2. Custom auth linking (`custom_user_id`)
3. Wallet retrieval by userId and address
4. Snake_case ↔ camelCase transformations
5. Clean architecture implementation

### Next Steps (Phase 2)

🔨 **Transaction Execution Layer:**

1. **Create Transaction Entities:**
   ```typescript
   // entity/wallet-transaction.entity.ts
   export const walletTransactionSchema = z.object({
     id: z.string(),
     userId: z.string(),
     walletAddress: z.string(),
     chainType: z.string(),
     to: z.string(),
     value: z.string(),
     data: z.string().optional(),
     gasLimit: z.string().optional(),
     gasPrice: z.string().optional(),
     nonce: z.number().optional(),
     status: z.enum(['pending', 'confirmed', 'failed']),
     txHash: z.string().optional(),
     createdAt: z.string(),
   })
   ```

2. **Create Transaction Repository:**
   ```typescript
   // repository/wallet-transaction.repository.ts
   export class WalletTransactionRepository {
     async sendTransaction(params: SendTransactionParams): Promise<string>
     async signTransaction(params: SignTransactionParams): Promise<string>
     async getTransactionStatus(txHash: string): Promise<TransactionStatus>
   }
   ```

3. **Create Transaction Usecase:**
   ```typescript
   // usecase/wallet-transaction.usecase.ts
   export class WalletTransactionUsecase {
     async executeSendTransaction(params: {
       productId: string
       userId: string
       chainType: string
       to: string
       value: string
       data?: string
     }): Promise<TransactionResult>

     async signMessage(params: {
       productId: string
       userId: string
       message: string
     }): Promise<string>

     async switchChain(params: {
       productId: string
       userId: string
       chainId: number
     }): Promise<void>
   }
   ```

4. **Add to API Controllers:**
   ```typescript
   // apps/privy-api-test/src/controllers/wallet-transaction.controller.ts
   POST /api/v1/transactions/send
   POST /api/v1/transactions/sign
   POST /api/v1/transactions/switch-chain
   GET  /api/v1/transactions/status/:txHash
   ```

### Important Reminders

⚠️ **Remember:**

1. **Always query Privy for state** - Don't cache wallet state, always get fresh data
2. **Handle each user request individually** - Each request needs its own chain/address context
3. **Maintain clean architecture** - Don't skip layers, follow the pattern
4. **Transform field names** - snake_case for Privy, camelCase for TypeScript
5. **Check this document** - If you forget implementation details, refer back here

### Future Phases

**Phase 3: On/Off Ramp**
- Card-based funding UI
- Apple Pay integration
- Google Pay integration
- Withdrawal to bank account
- Compliance and KYC integration

**Phase 4: Advanced Features**
- Multi-sig wallets
- Smart contract wallets (Account Abstraction)
- Batch transactions
- Transaction scheduling
- Webhooks for transaction events

---

## Quick Command Reference

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build package
pnpm build

# Check types
pnpm typecheck

# Lint code
pnpm lint
```

---

## Support & Resources

- **Privy Documentation:** https://docs.privy.io
- **Privy GitHub:** https://github.com/privy-io
- **Privy Discord:** https://discord.gg/privy
- **Privy Status:** https://status.privy.io

---

**📝 Note:** This document is a living reference. Update it as you implement new features or learn new patterns.
