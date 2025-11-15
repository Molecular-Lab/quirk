# ProductOwner → Embedded Wallet Creation Flow

**Pattern:** Clean Architecture (Cleverse-style)
**Reference:** `/Users/wtshai/Work/Cleverse/debut/packages/core/`

---

## 🔄 Request Flow

```
ProductOwner API Request
{
  productId: "ProductA",  // Client/Product identifier
  userId: "user123",      // Generated or provided by caller
  chainType: "ethereum",  // "ethereum" | "solana" | etc.
  email: "user@example.com" (optional),
  phone: "+1234567890" (optional)
}
    ↓
API Layer (Express/Elysia)
    ↓
Usecase.createEmbeddedWalletForProduct(params)
    ↓
Repository.createUser()
    ↓
Datagateway Interface
    ↓
Privy SDK (users().create())
    ↓
Response
{
  user: {
    id: "privy:did:xxxxx",
    linkedAccounts: [...],
    customMetadata: { productId, userId, ... }
  },
  wallet: {
    id: "wallet-xxx",
    address: "0x...",
    chainType: "ethereum",
    delegated: true
  }
}
```

---

## 📁 Architecture Layers

### 1. **Entity Layer** (`entity/privy-*.entity.ts`)

**Using Zod** (consistent with Proxify core)

```typescript
import { z } from "zod"

// Privy User Entity
export const privyUserSchema = z.object({
  id: z.string(),
  createdAt: z.union([z.string(), z.number()]).optional(),
  linkedAccounts: z.array(privyLinkedAccountSchema),
  customMetadata: z.record(z.string(), z.any()).optional(),
})
export type PrivyUser = z.infer<typeof privyUserSchema>

// Privy Embedded Wallet Entity
export const privyEmbeddedWalletSchema = z.object({
  id: z.string().nullable(),
  type: z.string(),
  address: z.string(),
  chainType: z.string(),
  walletClientType: z.string(),
  connectorType: z.string(),
  delegated: z.boolean(),
})
export type PrivyEmbeddedWallet = z.infer<typeof privyEmbeddedWalletSchema>
```

---

### 2. **Datagateway Layer** (`datagateway/privy-*.datagateway.ts`)

**Interface contracts** (following Cleverse pattern)

```typescript
// datagateway/privy-user.datagateway.ts
export interface IPrivyUserDataGateway {
  createUser(params: {
    linkedAccounts: Array<{...}>
    wallets: Array<{ chainType: string }>
    customMetadata?: Record<string, any>
  }): Promise<PrivyUser>

  getUserById(userId: string): Promise<PrivyUser | null>
}

// datagateway/privy-wallet.datagateway.ts
export interface IPrivyWalletDataGateway {
  getUserByWalletProviderUserId(userId: string): Promise<PrivyUser>
  getUserByAddress(address: string): Promise<PrivyUser>
  createWallet(userId: string, chainType: string): Promise<PrivyWallet>
  getWalletsByUserId(userId: string): Promise<PrivyWallet[]>
}
```

---

### 3. **Repository Layer** (`repository/privy/`)

**Privy SDK implementations** (following Cleverse pattern)

#### `repository/privy/user.repository.ts`

```typescript
import { PrivyClient } from "@privy-io/node"
import { VError } from "verror"
import { IPrivyUserDataGateway, PrivyUser, privyUserSchema, safeParse } from "@proxify/core"

export class PrivyUserRepository implements IPrivyUserDataGateway {
  constructor(private readonly privyClient: PrivyClient) {}

  public async createUser(params: {
    linkedAccounts: Array<{...}>
    wallets: Array<{ chainType: string }>
    customMetadata?: Record<string, any>
  }): Promise<PrivyUser> {
    // Convert to Privy SDK format
    const linked_accounts: any[] = params.linkedAccounts.map((account) => {
      if (account.type === "email") {
        return { type: "email", address: account.email }
      }
      if (account.type === "phone") {
        return { type: "phone", address: account.phoneNumber }
      }
      return account
    })

    // Call Privy SDK
    const user = await this.privyClient.users().create({
      linked_accounts,
      wallets: params.wallets.map(w => ({ chain_type: w.chainType as any })),
      custom_metadata: params.customMetadata,
    })

    // Validate with Zod
    const parsedUser = safeParse(privyUserSchema, user)
    if (!parsedUser.success) {
      throw new VError({ cause: parsedUser.error }, "[Privy] Failed to parse user")
    }

    return parsedUser.result
  }

  public async getUserById(userId: string): Promise<PrivyUser | null> {
    const user = await this.privyClient.users().get(userId as any)
    if (!user) return null

    const parsedUser = safeParse(privyUserSchema, user)
    if (!parsedUser.success) {
      throw new VError({ cause: parsedUser.error }, "[Privy] Failed to parse user")
    }

    return parsedUser.result
  }
}
```

#### `repository/privy/wallet.repository.ts`

```typescript
export class PrivyWalletRepository implements IPrivyWalletDataGateway {
  constructor(private readonly privyClient: PrivyClient) {}

  public async getUserByWalletProviderUserId(userId: string): Promise<PrivyUser> {
    const user = await this.privyClient.users().get(userId as any)

    const parsedUser = safeParse(privyUserSchema, user)
    if (!parsedUser.success) {
      throw parsedUser.error
    }

    return parsedUser.result
  }

  public async createWallet(userId: string, chainType: string): Promise<PrivyWallet> {
    const { id, address, chain_type } = await this.privyClient.wallets().create({
      chain_type: chainType as any,
      owner: { user_id: userId },
    })

    return { id, address, chainType: chain_type }
  }
}
```

#### `repository/privy/privy.repository.ts` (Aggregator)

```typescript
import { PrivyClient } from "@privy-io/node"
import { PrivyWalletRepository } from "./wallet.repository"
import { PrivyUserRepository } from "./user.repository"

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

### 4. **Usecase Layer** (`usecase/privy.usecase.ts`)

**Business logic** (following Cleverse pattern)

```typescript
import { VError } from "verror"
import {
  IPrivyWalletDataGateway,
  IPrivyUserDataGateway,
  PrivyUser,
  PrivyEmbeddedWallet,
  privyEmbeddedWalletSchema,
  safeParse
} from "@proxify/core"

export class PrivyUsecase {
  constructor(
    private readonly privyWalletRepository: IPrivyWalletDataGateway,
    private readonly privyUserRepository: IPrivyUserDataGateway,
  ) {}

  /**
   * Create embedded wallet for product/client
   * Main entry point for ProductOwner requests
   */
  public async createEmbeddedWalletForProduct(params: {
    productId: string      // Client/Product identifier (e.g., "ProductA")
    userId: string          // User identifier (generated or provided)
    chainType: string       // "ethereum" | "solana" | "polygon" | etc.
    email?: string
    phone?: string
    metadata?: Record<string, any>
  }): Promise<{ user: PrivyUser; wallet: PrivyEmbeddedWallet }> {
    const { productId, userId, chainType, email, phone, metadata = {} } = params

    // Prepare linked accounts (email/phone if provided)
    const linkedAccounts: Array<any> = []
    if (email) {
      linkedAccounts.push({ type: "email", email })
    }
    if (phone) {
      linkedAccounts.push({ type: "phone", phoneNumber: phone })
    }

    // Add productId and userId to custom metadata
    const customMetadata = {
      ...metadata,
      productId,         // Track which product this wallet belongs to
      userId,            // Track app-specific user ID
      createdAt: new Date().toISOString(),
    }

    // Create user with embedded wallet via Privy SDK
    const user = await this.privyUserRepository.createUser({
      linkedAccounts,
      wallets: [{ chainType }],
      customMetadata,
    })

    // Extract and validate embedded wallet
    const wallet = this.filterEmbeddedWallet(user)

    return { user, wallet }
  }

  /**
   * Get embedded wallet by user ID
   */
  public async getEmbeddedWalletByWalletProviderUserId(
    walletProviderUserId: string
  ): Promise<PrivyEmbeddedWallet> {
    const user = await this.privyWalletRepository.getUserByWalletProviderUserId(walletProviderUserId)
    const wallet = this.filterEmbeddedWallet(user)
    return wallet
  }

  /**
   * Extract delegated embedded wallet from user's linked accounts
   * @private
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

    if (!wallet || wallet.type !== "wallet") {
      throw new VError(
        { info: { userId: user.id } },
        "[Privy] Embedded wallet not found or invalid"
      )
    }

    const parsedWallet = safeParse(privyEmbeddedWalletSchema, wallet)
    if (!parsedWallet.success) {
      throw parsedWallet.error
    }

    return parsedWallet.result
  }
}
```

---

## 🚀 API Integration Example

### Express/Elysia API Handler

```typescript
// server/apps/api-core/src/handlers/wallet.handler.ts
import { PrivyClient } from "@privy-io/node"
import { PrivyRepository, PrivyUsecase } from "@proxify/core"
import { Elysia, t } from "elysia"

// Initialize Privy client (singleton)
const privyClient = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
})

// Initialize repository and usecase
const privyRepository = new PrivyRepository(privyClient)
const privyUsecase = new PrivyUsecase(
  privyRepository.wallet,
  privyRepository.user
)

// API endpoint
export const walletRoutes = new Elysia({ prefix: "/api/v1/wallets" })
  .post(
    "/create",
    async ({ body }) => {
      const { productId, userId, chainType, email, phone } = body

      // Call usecase
      const { user, wallet } = await privyUsecase.createEmbeddedWalletForProduct({
        productId,
        userId,
        chainType,
        email,
        phone,
      })

      return {
        success: true,
        data: {
          privyUserId: user.id,
          walletAddress: wallet.address,
          chainType: wallet.chainType,
          productId,
          userId,
        },
      }
    },
    {
      body: t.Object({
        productId: t.String(),
        userId: t.String(),
        chainType: t.String(),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
      }),
    }
  )
```

### Example Request/Response

**Request:**
```bash
POST /api/v1/wallets/create
Content-Type: application/json

{
  "productId": "ProductA",
  "userId": "user-12345",
  "chainType": "ethereum",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "privyUserId": "privy:did:xxxxx",
    "walletAddress": "0x1234567890abcdef...",
    "chainType": "ethereum",
    "productId": "ProductA",
    "userId": "user-12345"
  }
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│ ProductOwner    │
│ Request         │
└────────┬────────┘
         │
         │ POST /api/v1/wallets/create
         │ { productId, userId, chainType }
         │
         ▼
┌─────────────────┐
│ API Handler     │
│ (Express/Elysia)│
└────────┬────────┘
         │
         │ privyUsecase.createEmbeddedWalletForProduct(params)
         │
         ▼
┌─────────────────┐
│ Usecase Layer   │
│ (Business Logic)│
└────────┬────────┘
         │
         │ privyUserRepository.createUser({ linkedAccounts, wallets, customMetadata })
         │
         ▼
┌─────────────────┐
│ Repository Layer│
│ (Data Access)   │
└────────┬────────┘
         │
         │ privyClient.users().create({ linked_accounts, wallets, custom_metadata })
         │
         ▼
┌─────────────────┐
│ Privy SDK       │
│ (External API)  │
└────────┬────────┘
         │
         │ Response: { id, linkedAccounts, ... }
         │
         ▼
┌─────────────────┐
│ Zod Validation  │
│ (safeParse)     │
└────────┬────────┘
         │
         │ Validated PrivyUser
         │
         ▼
┌─────────────────┐
│ filterEmbedded  │
│ Wallet()        │
└────────┬────────┘
         │
         │ { user: PrivyUser, wallet: PrivyEmbeddedWallet }
         │
         ▼
┌─────────────────┐
│ API Response    │
└─────────────────┘
```

---

## ✅ Key Features

### 1. **Dependency Inversion**
- Usecase depends on `IPrivyUserDataGateway` interface, not concrete `PrivyUserRepository`
- Easy to mock for testing

### 2. **Type Safety**
- Zod validation at repository layer
- All external data validated before use

### 3. **Error Handling**
- VError for structured errors with context
- Parse errors include validation details

### 4. **Metadata Tracking**
- `productId` and `userId` stored in Privy's `custom_metadata`
- Easy to query wallets by product or user

### 5. **Flexible Linked Accounts**
- Support email, phone, or no linked accounts
- Easy to add more authentication methods

---

## 🎯 Next Steps

1. ✅ Clean Architecture implemented in `@proxify/core`
2. ✅ ProductOwner flow method: `createEmbeddedWalletForProduct()`
3. ⏳ Create API handler in Go service (or Node.js bridge)
4. ⏳ Add logging with structured events
5. ⏳ Add metrics/monitoring

---

**Last Updated:** 2025-11-12
**Pattern:** Clean Architecture (Cleverse-inspired)
**Reference:** `/Users/wtshai/Work/Cleverse/debut/packages/core/`
