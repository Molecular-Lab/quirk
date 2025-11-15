# Privy Clean Architecture Implementation

**Location:** `@proxify/core`
**Pattern:** Clean Architecture (Cleverse-style)
**Status:** ✅ Complete

---

## 📁 Directory Structure

```
@proxify/core/
├── entity/                              # Data schemas (Zod)
│   ├── privy-user.entity.ts            ✅ User & linked accounts
│   └── privy-wallet.entity.ts          ✅ Wallets (embedded & general)
├── datagateway/                         # Interfaces (contracts)
│   ├── privy-user.datagateway.ts       ✅ User operations interface
│   └── privy-wallet.datagateway.ts     ✅ Wallet operations interface
├── repository/                          # Data access implementations
│   ├── user.repository.ts              ✅ Privy user repository
│   ├── wallet.repository.ts            ✅ Privy wallet repository
│   └── privy.repository.ts             ✅ Aggregator repository
├── usecase/                             # Business logic
│   └── privy.usecase.ts                ✅ Privy business logic
└── utils/                               # Shared utilities
    └── safe-parse.ts                   ✅ Zod validation helper
```

---

## 🏗️ Architecture Layers

### 1. Entity Layer (Data Schemas)

**Using:** Zod (consistent with existing core entities)

#### `entity/privy-user.entity.ts`
```typescript
import { z } from "zod"

export const privyLinkedAccountSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.string().optional(),
  address: z.string().optional(),
  chainType: z.string().optional(),
  // ... more fields
})

export const privyUserSchema = z.object({
  id: z.string(),
  createdAt: z.union([z.string(), z.number()]).optional(),
  linkedAccounts: z.array(privyLinkedAccountSchema),
  customMetadata: z.record(z.string(), z.any()).optional(),
})

export type PrivyUser = z.infer<typeof privyUserSchema>
```

#### `entity/privy-wallet.entity.ts`
```typescript
export const privyEmbeddedWalletSchema = z.object({
  id: z.string().nullable(),
  type: z.string(),
  address: z.string(),
  chainType: z.string(),
  walletClientType: z.string(),
  connectorType: z.string(),
  delegated: z.boolean(),
  // ... more fields
})

export const privyWalletSchema = z.object({
  id: z.string(),
  address: z.string(),
  chainType: z.string(),
  createdAt: z.union([z.string(), z.number()]).optional(),
  // ... more fields
})
```

---

### 2. Datagateway Layer (Interfaces)

**Purpose:** Define contracts for data operations

#### `datagateway/privy-user.datagateway.ts`
```typescript
export interface IPrivyUserDataGateway {
  createUser(params: {...}): Promise<PrivyUser>
  getUserById(userId: string): Promise<PrivyUser | null>
  listUsers(options?: {...}): Promise<{...}>
}
```

#### `datagateway/privy-wallet.datagateway.ts`
```typescript
export interface IPrivyWalletDataGateway {
  getUserByWalletProviderUserId(userId: string): Promise<PrivyUser>
  getUserByAddress(address: string): Promise<PrivyUser>
  createWallet(userId: string, chainType: string): Promise<PrivyWallet>
  getWalletById(walletId: string): Promise<PrivyWallet | null>
  getWalletsByUserId(userId: string): Promise<PrivyWallet[]>
}
```

---

### 3. Repository Layer (Implementation)

**Purpose:** Implement datagateway interfaces using Privy SDK

#### `repository/user.repository.ts`
```typescript
import { PrivyClient } from "@privy-io/node"

export class PrivyUserRepository implements IPrivyUserDataGateway {
  constructor(private readonly privyClient: PrivyClient) {}

  public async createUser(params): Promise<PrivyUser> {
    // Convert params to Privy SDK format
    const user = await this.privyClient.users().create({
      linked_accounts: [...],
      wallets: [...],
      custom_metadata: {...}
    })

    // Validate response with Zod
    const parsedUser = safeParse(privyUserSchema, user)
    if (!parsedUser.success) {
      throw new VError(...)
    }

    return parsedUser.result
  }

  // ... more methods
}
```

#### `repository/wallet.repository.ts`
```typescript
export class PrivyWalletRepository implements IPrivyWalletDataGateway {
  constructor(private readonly privyClient: PrivyClient) {}

  public async createWallet(userId, chainType): Promise<PrivyWallet> {
    const { id, address, chain_type } = await this.privyClient
      .wallets()
      .create({
        chain_type: chainType as any,
        owner: { user_id: userId }
      })

    const wallet = { id, address, chainType: chain_type }

    // Validate with Zod
    const parsedWallet = safeParse(privyWalletSchema, wallet)
    if (!parsedWallet.success) {
      throw new VError(...)
    }

    return parsedWallet.result
  }

  // ... more methods
}
```

#### `repository/privy.repository.ts` (Aggregator)
```typescript
export class PrivyRepository {
  readonly wallet: PrivyWalletRepository
  readonly user: PrivyUserRepository

  constructor(private readonly privyClient: PrivyClient) {
    this.wallet = new PrivyWalletRepository(this.privyClient)
    this.user = new PrivyUserRepository(this.privyClient)
  }
}
```

---

### 4. Usecase Layer (Business Logic)

**Purpose:** Contain business logic and orchestrate repositories

#### `usecase/privy.usecase.ts`
```typescript
export class PrivyUsecase {
  constructor(
    private readonly privyWalletRepository: IPrivyWalletDataGateway,
    private readonly privyUserRepository: IPrivyUserDataGateway,
  ) {}

  /**
   * Get embedded wallet by user ID
   */
  public async getEmbeddedWalletByWalletProviderUserId(
    userId: string
  ): Promise<PrivyEmbeddedWallet> {
    const user = await this.privyWalletRepository
      .getUserByWalletProviderUserId(userId)

    const wallet = this.filterEmbeddedWallet(user)
    return wallet
  }

  /**
   * Create user with embedded wallet
   */
  public async createUserWithEmbeddedWallet(params: {
    chainType: string
    email?: string
    phone?: string
    customMetadata?: Record<string, any>
  }): Promise<{ user: PrivyUser; wallet: PrivyEmbeddedWallet }> {
    const { chainType, email, phone, customMetadata } = params

    // Prepare linked accounts
    const linkedAccounts = []
    if (email) linkedAccounts.push({ type: "email", address: email })
    if (phone) linkedAccounts.push({ type: "phone", address: phone })

    // Create user with wallet
    const user = await this.privyUserRepository.createUser({
      linkedAccounts,
      wallets: [{ chainType }],
      customMetadata,
    })

    // Extract embedded wallet
    const wallet = this.filterEmbeddedWallet(user)

    return { user, wallet }
  }

  /**
   * Filter embedded wallet from user's linked accounts
   */
  private filterEmbeddedWallet(user: PrivyUser): PrivyEmbeddedWallet {
    const wallet = user.linkedAccounts.find((account) => {
      return (
        account.type === "wallet" &&
        account.walletClientType === "privy" &&
        account.connectorType === "embedded" &&
        account.delegated === true
      )
    })

    if (!wallet) {
      throw new VError("[Privy] Embedded wallet not found")
    }

    // Validate with Zod
    const parsed = safeParse(privyEmbeddedWalletSchema, wallet)
    if (!parsed.success) {
      throw parsed.error
    }

    return parsed.result
  }
}
```

---

## 🔧 Utilities

### `utils/safe-parse.ts`
```typescript
import { z } from "zod"
import { VError } from "verror"

export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown
): SafeParseResult<z.infer<T>> {
  try {
    const result = schema.safeParse(data)

    if (!result.success) {
      const errorMessage = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ")

      return {
        success: false,
        error: new VError(
          { info: { errors: result.error.errors, data } },
          `Validation failed: ${errorMessage}`
        ),
      }
    }

    return {
      success: true,
      result: result.data,
    }
  } catch (error) {
    return {
      success: false,
      error: new VError({ cause: error as Error }, "Unexpected error"),
    }
  }
}
```

---

## 📦 Usage Example

### In Go API Service (via Node.js bridge)

```typescript
import { PrivyClient } from "@privy-io/node"
import { PrivyRepository, PrivyUsecase } from "@proxify/core"

// Initialize Privy client
const privyClient = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
})

// Initialize repository
const privyRepository = new PrivyRepository(privyClient)

// Initialize usecase
const privyUsecase = new PrivyUsecase(
  privyRepository.wallet,
  privyRepository.user
)

// Create user with embedded wallet
const { user, wallet } = await privyUsecase.createUserWithEmbeddedWallet({
  chainType: "ethereum",
  email: "user@example.com",
  customMetadata: { source: "api" },
})

console.log(user.id)        // privy:did:xxxxx
console.log(wallet.address) // 0x...
```

---

## 🎯 Design Principles

### 1. **Dependency Inversion**
- Usecases depend on interfaces (datagateways), not concrete implementations
- Repository implementations can be swapped without changing usecases

### 2. **Single Responsibility**
- **Entity:** Data structure only
- **Datagateway:** Interface definition only
- **Repository:** Data access only
- **Usecase:** Business logic only

### 3. **Type Safety**
- Zod schemas validate all external data (from Privy API)
- TypeScript types derived from Zod schemas
- `safeParse` utility provides consistent validation

### 4. **Error Handling**
- VError for structured error information
- Validation errors include full context
- Event-based error logging support

---

## ✅ Benefits

1. **Testability:** Mock datagateway interfaces for unit testing
2. **Maintainability:** Clear separation of concerns
3. **Consistency:** Same pattern as existing core code
4. **Type Safety:** Zod validation catches runtime errors
5. **Flexibility:** Easy to add new providers (e.g., Magic Link, Web3Auth)

---

## 🚀 Next Steps

### For `@proxify/privy-client`

Now that everything is in `@proxify/core`, the `privy-client` package should:

1. **Remove** `src/client/`, `src/types/`, `src/repository/`, `src/usecase/` directories
2. **Keep** only `src/config/` (Privy client singleton, environment config)
3. **Export** convenience wrappers from `@proxify/core`

```typescript
// packages/privy-client/src/index.ts
export { PrivyRepository, PrivyUsecase } from "@proxify/core"
export { PrivyConfig } from "./config/privy.config"
export { ENV } from "./config/env"
```

### For Go API Integration

Use the usecase layer directly:
```typescript
// server/apps/api-core (Node.js service)
import { PrivyUsecase, PrivyRepository } from "@proxify/core"
import { PrivyClient } from "@privy-io/node"

const privyClient = new PrivyClient({...})
const repository = new PrivyRepository(privyClient)
const usecase = new PrivyUsecase(repository.wallet, repository.user)

// Expose via gRPC/REST for Go services
app.post("/api/v1/users", async (req, res) => {
  const { user, wallet } = await usecase.createUserWithEmbeddedWallet(req.body)
  res.json({ user, wallet })
})
```

---

**Last Updated:** 2025-11-12
**Status:** Production-Ready
**Pattern:** Clean Architecture (Cleverse-inspired)
