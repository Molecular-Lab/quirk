# Demo: Query Privy Directly (Skip Database Layer)

**Last Updated:** 2025-11-13
**Goal:** Simplify demo by querying Privy API directly without mock database

---

## 🎯 CURRENT ARCHITECTURE (You Have This)

```
┌──────────────────────────────────────────────────────────┐
│         EmbeddedWalletUsecase (Business Logic)           │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │
                ↓                      ↓
┌───────────────────────────┐  ┌────────────────────────────┐
│  PrivyUserRepository      │  │ MockUserEmbeddedWallet     │
│  (Queries Privy SDK)      │  │ Repository                 │
│                           │  │ (In-memory Map)            │
│  ✅ getUserById()         │  │ ⚠️ Mock DB                 │
│  ✅ getUserByWallet()     │  │ Maps: productId+userId     │
│  ✅ createUser()          │  │    → privyUserId+wallet    │
└───────────────────────────┘  └────────────────────────────┘
```

**The Problem:**
- Mock database is just `Map<string, UserEmbeddedWallet>` (in-memory)
- Not persistent (resets on server restart)
- Not needed for demo if we query Privy directly

---

## ✅ SIMPLIFIED DEMO ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│         SimplifiedWalletUsecase (Demo Only)              │
│         - Create wallet → return address immediately      │
│         - Get by address → query Privy directly          │
│         - Get by userId → NOT SUPPORTED (use address)    │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│         PrivyUserRepository (Queries Privy SDK)          │
│         ✅ Already implemented, works perfectly           │
│                                                           │
│  Available methods:                                      │
│  - getUserById(privyUserId)                              │
│  - getUserByWalletAddress(address) ← USE THIS            │
│  - createUser(params)                                    │
│  - listUsers()                                           │
└──────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. ❌ Remove dependency on `MockUserEmbeddedWalletRepository`
2. ✅ Query Privy directly using `getUserByWalletAddress()`
3. ✅ Store `productId + userId` in Privy's `custom_metadata`
4. ✅ Return wallet address after creation (user saves it)

---

## 📋 WHAT WORKS & WHAT DOESN'T

### ✅ What Works (Query Privy Directly)

**1. Create Wallet**
```typescript
// Create user in Privy with metadata
const privyUser = await privyUserRepository.createUser({
  linkedAccounts: [{ type: 'email', address: 'user@example.com' }],
  wallets: [{ chainType: 'ethereum' }],
  customMetadata: {
    productId: 'demo_app',
    userId: 'user_123'
  }
});

// Extract wallet address
const wallet = privyUser.linkedAccounts.find(acc => acc.type === 'wallet');
console.log('Wallet created:', wallet.address);

// ✅ WORKS: Privy SDK supports this
```

**2. Get by Wallet Address**
```typescript
// Query Privy by wallet address
const privyUser = await privyUserRepository.getUserByWalletAddress('0x...');

// Check custom metadata
console.log(privyUser.customMetadata.productId); // 'demo_app'
console.log(privyUser.customMetadata.userId);    // 'user_123'

// ✅ WORKS: Privy SDK supports this
```

**3. Get by Privy User ID**
```typescript
// If you have privyUserId (from previous creation)
const privyUser = await privyUserRepository.getUserById('did:privy:...');

// ✅ WORKS: Privy SDK supports this
```

---

### ❌ What DOESN'T Work (Without Database)

**Get by ProductId + UserId**
```typescript
// ❌ DOESN'T WORK: Privy SDK does NOT support querying by custom metadata
const privyUser = await privyUserRepository.getUserByMetadata({
  productId: 'demo_app',
  userId: 'user_123'
});
// Error: Privy SDK doesn't have this method
```

**Why?**
- Privy only indexes by:
  - `privyUserId` (did:privy:...)
  - `walletAddress` (0x...)
  - `email` (for linked accounts)
- Custom metadata is NOT indexed (can't query by it)

**Workaround for Demo:**
1. After creating wallet, **return wallet address to customer**
2. Customer saves wallet address in their database
3. Customer queries YOUR API by wallet address (not userId)

---

## 🛠️ DEMO IMPLEMENTATION (Simplified)

### Step 1: Create Simplified Use Case (No Database)

**File:** `packages/core/usecase/wallet-direct.usecase.ts` (NEW FILE)

```typescript
import { IPrivyUserDataGateway } from '../datagateway/privy-user.datagateway';
import { PrivyUser } from '../entity/privy-user.entity';
import { PrivyEmbeddedWallet } from '../entity/privy-wallet.entity';
import VError from 'verror';

/**
 * Simplified Wallet Use Case - Demo Only
 * Queries Privy directly, no database layer
 *
 * LIMITATIONS:
 * - Cannot query by productId + userId (only by wallet address)
 * - Customer must store wallet address after creation
 */
export class WalletDirectUsecase {
  constructor(private readonly privyUserRepo: IPrivyUserDataGateway) {}

  /**
   * Create wallet - Returns wallet address immediately
   * Customer should save this address for future queries
   */
  async createWallet(params: {
    productId: string;
    userId: string;
    chainType: string;
    linkedAccounts?: Array<{
      type: string;
      address?: string;
      phoneNumber?: string;
      customUserId?: string;
    }>;
  }): Promise<{
    privyUserId: string;
    walletAddress: string;
    customMetadata: any;
  }> {
    const { productId, userId, chainType, linkedAccounts = [] } = params;

    // Prepare linked accounts (default to custom_auth if empty)
    const accounts = linkedAccounts.length > 0
      ? linkedAccounts
      : [{
          type: 'custom_auth',
          custom_user_id: `${productId}:${userId}`,
        }];

    // Create Privy user with metadata
    const privyUser = await this.privyUserRepo.createUser({
      linkedAccounts: accounts,
      wallets: [{ chainType }],
      customMetadata: {
        productId,
        userId,
        createdAt: new Date().toISOString(),
      },
    });

    // Extract wallet address
    const wallet = this.extractEmbeddedWallet(privyUser);

    return {
      privyUserId: privyUser.id,
      walletAddress: wallet.address,
      customMetadata: privyUser.customMetadata,
    };
  }

  /**
   * Get wallet by address - Query Privy directly
   */
  async getWalletByAddress(walletAddress: string): Promise<{
    privyUserId: string;
    walletAddress: string;
    productId: string;
    userId: string;
    customMetadata: any;
  }> {
    const privyUser = await this.privyUserRepo.getUserByWalletAddress(walletAddress);

    if (!privyUser) {
      throw new VError(
        { info: { event: 'wallet_not_found', walletAddress } },
        '[WalletDirect] Wallet not found'
      );
    }

    const wallet = this.extractEmbeddedWallet(privyUser);

    return {
      privyUserId: privyUser.id,
      walletAddress: wallet.address,
      productId: privyUser.customMetadata?.productId || '',
      userId: privyUser.customMetadata?.userId || '',
      customMetadata: privyUser.customMetadata,
    };
  }

  /**
   * Get detailed wallet info including all Privy data
   */
  async getDetailedWalletInfo(walletAddress: string): Promise<{
    privyUser: PrivyUser;
    wallet: PrivyEmbeddedWallet;
  }> {
    const privyUser = await this.privyUserRepo.getUserByWalletAddress(walletAddress);

    if (!privyUser) {
      throw new VError(
        { info: { event: 'wallet_not_found', walletAddress } },
        '[WalletDirect] Wallet not found'
      );
    }

    const wallet = this.extractEmbeddedWallet(privyUser);

    return { privyUser, wallet };
  }

  /**
   * Extract embedded wallet from Privy user
   * @private
   */
  private extractEmbeddedWallet(user: PrivyUser): PrivyEmbeddedWallet {
    const wallet = user.linkedAccounts.find(
      (account) =>
        account.type === 'wallet' &&
        account.walletClientType === 'privy' &&
        account.connectorType === 'embedded'
    );

    if (!wallet || wallet.type !== 'wallet') {
      throw new VError(
        { info: { userId: user.id, event: 'embedded_wallet_not_found' } },
        '[WalletDirect] Embedded wallet not found'
      );
    }

    return wallet as PrivyEmbeddedWallet;
  }
}
```

---

### Step 2: Update Demo API Endpoints

**File:** `apps/privy-api-test/src/controllers/wallet-direct.controller.ts` (NEW FILE)

```typescript
import { Request, Response } from 'express';
import { WalletDirectUsecase } from '@proxify/core';

export class WalletDirectController {
  constructor(private readonly walletUsecase: WalletDirectUsecase) {}

  /**
   * POST /api/v1/wallets-direct/create
   * Create wallet and return address immediately
   */
  async createWallet(req: Request, res: Response) {
    try {
      const { productId, userId, chainType, linkedAccounts } = req.body;

      // Validate required fields
      if (!productId || !userId || !chainType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: productId, userId, chainType',
        });
      }

      // Create wallet
      const result = await this.walletUsecase.createWallet({
        productId,
        userId,
        chainType,
        linkedAccounts,
      });

      res.json({
        success: true,
        data: {
          privyUserId: result.privyUserId,
          walletAddress: result.walletAddress,
          productId,
          userId,
          chainType,
          message: '⚠️ IMPORTANT: Save this wallet address! You need it to query later.',
        },
      });
    } catch (error: any) {
      console.error('[WalletDirectController] Create error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create wallet',
      });
    }
  }

  /**
   * GET /api/v1/wallets-direct/:address
   * Get wallet by address
   */
  async getWalletByAddress(req: Request, res: Response) {
    try {
      const { address } = req.params;

      const result = await this.walletUsecase.getWalletByAddress(address);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found',
        });
      }

      console.error('[WalletDirectController] Get error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get wallet',
      });
    }
  }

  /**
   * GET /api/v1/wallets-direct/:address/details
   * Get detailed wallet info
   */
  async getDetailedWalletInfo(req: Request, res: Response) {
    try {
      const { address } = req.params;

      const result = await this.walletUsecase.getDetailedWalletInfo(address);

      res.json({
        success: true,
        data: {
          privyUser: result.privyUser,
          wallet: result.wallet,
        },
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found',
        });
      }

      console.error('[WalletDirectController] Get details error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get wallet details',
      });
    }
  }
}
```

---

### Step 3: Register New Routes

**File:** `apps/privy-api-test/src/app.ts`

```typescript
import { WalletDirectUsecase } from '@proxify/core';
import { PrivyConfig } from '@proxify/privy-client';
import { PrivyUserRepository } from '@proxify/core';
import { WalletDirectController } from './controllers/wallet-direct.controller';

// Initialize repositories
const privyClient = PrivyConfig.getClient();
const privyUserRepo = new PrivyUserRepository(privyClient);

// Initialize use case (NO DATABASE!)
const walletDirectUsecase = new WalletDirectUsecase(privyUserRepo);

// Initialize controller
const walletDirectController = new WalletDirectController(walletDirectUsecase);

// Routes
app.post('/api/v1/wallets-direct/create', (req, res) =>
  walletDirectController.createWallet(req, res)
);
app.get('/api/v1/wallets-direct/:address', (req, res) =>
  walletDirectController.getWalletByAddress(req, res)
);
app.get('/api/v1/wallets-direct/:address/details', (req, res) =>
  walletDirectController.getDetailedWalletInfo(req, res)
);
```

---

## 📋 DEMO API USAGE

### Example 1: Create Wallet

```bash
curl -X POST http://localhost:3002/api/v1/wallets-direct/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "demo_app",
    "userId": "demo_user_001",
    "chainType": "ethereum",
    "linkedAccounts": [{
      "type": "email",
      "address": "demo@example.com"
    }]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "privyUserId": "did:privy:cmabcd123...",
    "walletAddress": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
    "productId": "demo_app",
    "userId": "demo_user_001",
    "chainType": "ethereum",
    "message": "⚠️ IMPORTANT: Save this wallet address! You need it to query later."
  }
}
```

**⚠️ IMPORTANT:** Customer must save `walletAddress` in their database!

---

### Example 2: Get Wallet by Address

```bash
curl http://localhost:3002/api/v1/wallets-direct/0x525b00f0Bf052b9320406100FA660108d94ec46c
```

**Response:**
```json
{
  "success": true,
  "data": {
    "privyUserId": "did:privy:cmabcd123...",
    "walletAddress": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
    "productId": "demo_app",
    "userId": "demo_user_001",
    "customMetadata": {
      "productId": "demo_app",
      "userId": "demo_user_001",
      "createdAt": "2025-11-13T10:00:00.000Z"
    }
  }
}
```

---

### Example 3: Get Detailed Info

```bash
curl http://localhost:3002/api/v1/wallets-direct/0x525b00f0Bf052b9320406100FA660108d94ec46c/details
```

**Response:**
```json
{
  "success": true,
  "data": {
    "privyUser": {
      "id": "did:privy:cmabcd123...",
      "createdAt": 1699900000,
      "linkedAccounts": [
        {
          "type": "email",
          "address": "demo@example.com"
        },
        {
          "type": "wallet",
          "address": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
          "chainType": "ethereum",
          "walletClientType": "privy",
          "connectorType": "embedded"
        }
      ],
      "customMetadata": {
        "productId": "demo_app",
        "userId": "demo_user_001"
      }
    },
    "wallet": {
      "type": "wallet",
      "address": "0x525b00f0Bf052b9320406100FA660108d94ec46c",
      "chainType": "ethereum"
    }
  }
}
```

---

## ✅ VALIDATION CHECKLIST (Demo Phase)

**What to Test:**

```bash
# 1. Create wallet
curl -X POST http://localhost:3002/api/v1/wallets-direct/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"demo_app","userId":"user_001","chainType":"ethereum","linkedAccounts":[{"type":"email","address":"test@example.com"}]}'

# Save the walletAddress from response!

# 2. Get by wallet address
curl http://localhost:3002/api/v1/wallets-direct/{WALLET_ADDRESS}

# 3. Get detailed info
curl http://localhost:3002/api/v1/wallets-direct/{WALLET_ADDRESS}/details
```

**Expected Results:**
- [ ] Create returns `privyUserId` and `walletAddress`
- [ ] Get by address returns user data with custom metadata
- [ ] Detailed info includes full Privy user object
- [ ] Custom metadata includes `productId` and `userId`
- [ ] Wallet address is correct Ethereum format (0x...)

---

## 🎯 DEMO FLOW (Simplified)

**Your Demo Journey:**

```
Step 1: Create Wallet
├─ Customer calls: POST /api/v1/wallets-direct/create
├─ Proxify creates Privy user with embedded wallet
├─ Returns wallet address: "0x525b00..."
└─ Customer saves address in their DB

Step 2: Fund Wallet (Your Mock USDC)
├─ Customer calls: POST /api/v1/demo/fund-wallet
├─ Pass wallet address (not userId!)
├─ Proxify mints 100 mock USDC to that address
└─ User now has 100 mUSDC

Step 3: Check Balance
├─ Customer calls: GET /api/v1/demo/balance/{address}
├─ Proxify queries on-chain balance
└─ Returns: "100 mUSDC"

Step 4: Transfer
├─ Customer calls: POST /api/v1/demo/transfer
├─ Pass wallet address + recipient + amount
├─ Proxify signs transaction via Privy
└─ mUSDC transferred on Sepolia
```

**Key Difference:** Everything uses wallet address, not `productId + userId`

---

## 📊 COMPARISON

| Approach | Database Needed? | Query by UserId? | Query by Address? | Demo Ready? |
|----------|------------------|------------------|-------------------|-------------|
| **Current (Mock DB)** | ⚠️ Yes (in-memory) | ✅ Yes | ✅ Yes | ⚠️ Not persistent |
| **Simplified (Direct)** | ❌ No | ❌ No | ✅ Yes | ✅ Ready now |
| **Production (PostgreSQL)** | ✅ Yes (real DB) | ✅ Yes | ✅ Yes | ⏰ Later |

---

## ✅ NEXT STEPS

**For Demo (This Week):**

1. **[ ] Add WalletDirectUsecase** to `packages/core/usecase/`
2. **[ ] Add WalletDirectController** to `apps/privy-api-test/src/controllers/`
3. **[ ] Register new routes** in `apps/privy-api-test/src/app.ts`
4. **[ ] Test all 3 endpoints** (create, get, details)
5. **[ ] Update demo frontend** to use wallet address (not userId)

**For Production (Later):**

1. **[ ] Implement PostgreSQL repository** (replace mock)
2. **[ ] Add SQLC code generation** (per monorepo standards)
3. **[ ] Support query by productId + userId** (fast lookups)
4. **[ ] Add migrations** (user_embedded_wallets table)

---

## 🎓 KEY LEARNINGS

**Why This Works for Demo:**
- ✅ No database setup needed
- ✅ Query Privy directly (they're the source of truth)
- ✅ Custom metadata stores productId + userId (for reference)
- ✅ Fast to implement (1-2 hours)

**Why You'll Need DB for Production:**
- ❌ Can't query by productId + userId efficiently
- ❌ Customer needs fast lookups in their system
- ❌ Privy doesn't index custom metadata
- ❌ Need to track additional state (balances, transactions)

**Verdict:** Perfect for demo, need database for production.

---

**Ready to implement? Let me know if you want me to guide you through creating these files!**
