# Privy Implementation Guide

This document contains comprehensive knowledge about Privy integration, wallet management, and funding capabilities. **Use this as the primary reference for Privy implementation.**

## 📚 Official Documentation References

### Core Wallet Management
- **Get Connected Wallet**: https://docs.privy.io/wallets/wallets/get-a-wallet/get-connected-wallet
- **Get Wallet by ID**: https://docs.privy.io/wallets/wallets/get-a-wallet/get-wallet-by-id
- **Get All Wallets**: https://docs.privy.io/wallets/wallets/get-a-wallet/get-all-wallets
- **Server-Side Wallet Access**: https://docs.privy.io/wallets/wallets/server-side-access

### Wallet Operations (Ethereum)
- **Send Transaction**: https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction
- **Sign Transaction**: https://docs.privy.io/wallets/using-wallets/ethereum/sign-a-transaction
- **Switch Chain**: https://docs.privy.io/wallets/using-wallets/ethereum/switch-chain

### Funding & On/Off Ramp
- **Card-Based Funding**: https://docs.privy.io/wallets/funding/methods/card
- **Apple Pay & Google Pay**: https://docs.privy.io/recipes/card-based-funding
- **Funding Example (Next.js)**: https://github.com/privy-io/examples/tree/main/examples/privy-next-funding

---

## 🏗️ Current Implementation Status

### ✅ Implemented

#### 1. User & Wallet Creation
- **File**: `packages/core/usecase/embedded-wallet.usecase.ts`
- **Features**:
  - Create Privy user with embedded wallet
  - Support for 18 linked account types (email, phone, OAuth, etc.)
  - Support for 12 blockchain types (ethereum, solana, etc.)
  - Auto-generate userId from linked accounts
  - Store mapping in database

#### 2. Wallet Retrieval
- **File**: `packages/core/datagateway/user-embedded-wallet.datagateway.ts`
- **Features**:
  - Get wallet by userId
  - Get wallet by embedded wallet address
  - Get wallet by linked wallet address
  - Get wallet by any wallet address (embedded OR linked)

#### 3. User Management
- **File**: `packages/core/repository/user.repository.ts`
- **Features**:
  - Create user via Privy SDK
  - Get user by Privy user ID
  - List users with pagination

---

## 🚧 TODO: Server-Side Wallet Access

### Overview
Privy provides server-side APIs to access and manage user wallets without requiring the user to be online.

### Implementation Needed

#### 1. Get Wallet by Address
**Privy SDK Method**: `privyClient.wallets().getByAddress(address)`

```typescript
// Add to packages/core/repository/user.repository.ts

/**
 * Get user by wallet address
 * Searches Privy's database for a user with the given wallet address
 */
public async getUserByWalletAddress(walletAddress: string): Promise<PrivyUser | null> {
	try {
		const user = await this.privyClient.wallets().getByAddress(walletAddress)
		
		if (!user) {
			return null
		}

		const parsedUser = safeParse(privyUserSchema, user)
		if (!parsedUser.success) {
			throw new VError(
				{
					cause: parsedUser.error,
					info: {
						event: "parse_user_error",
						walletAddress,
					},
				},
				"[Privy] Failed to parse user from wallet address",
			)
		}

		return parsedUser.result
	} catch (error) {
		if ((error as any)?.status === 404) {
			return null
		}
		throw error
	}
}
```

#### 2. Get All Wallets for a User
**Privy SDK Method**: `privyClient.wallets().getByUserId(userId)`

```typescript
/**
 * Get all wallets for a Privy user
 */
public async getWalletsByUserId(privyUserId: string): Promise<PrivyWallet[]> {
	const wallets = await this.privyClient.wallets().getByUserId(privyUserId)
	
	return wallets.map(wallet => ({
		id: wallet.id,
		address: wallet.address,
		chainType: wallet.chain_type,
		walletType: wallet.wallet_type,
		delegated: wallet.delegated,
		imported: wallet.imported,
	}))
}
```

#### 3. Update Data Gateway Interface
**File**: `packages/core/datagateway/privy-user.datagateway.ts`

Add these methods to the interface:

```typescript
export interface IPrivyUserDataGateway {
	// ... existing methods ...
	
	/**
	 * Get user by wallet address
	 * Searches Privy's database for a user with the given wallet
	 */
	getUserByWalletAddress(walletAddress: string): Promise<PrivyUser | null>
	
	/**
	 * Get all wallets for a Privy user
	 */
	getWalletsByUserId(privyUserId: string): Promise<PrivyWallet[]>
}
```

---

## 🔐 TODO: Wallet Transaction Operations

### Overview
Privy allows server-side signing and sending of transactions for embedded wallets.

### Implementation Needed

#### 1. Send Transaction (Ethereum)
**Documentation**: https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction

```typescript
// Add to packages/core/repository/wallet-transaction.repository.ts (NEW FILE)

import { PrivyClient } from "@privy-io/node"

export class WalletTransactionRepository {
	constructor(private readonly privyClient: PrivyClient) {}
	
	/**
	 * Send Ethereum transaction from embedded wallet
	 * @param walletAddress - Embedded wallet address
	 * @param transaction - Transaction parameters
	 */
	async sendTransaction(params: {
		walletAddress: string
		to: string
		value: string // in wei
		data?: string
		chainId?: number
	}): Promise<{ txHash: string }> {
		const { walletAddress, to, value, data, chainId } = params
		
		const result = await this.privyClient.wallets().rpc({
			address: walletAddress,
			chainId: chainId || 1, // Default to Ethereum mainnet
			request: {
				method: 'eth_sendTransaction',
				params: [{
					to,
					value,
					data: data || '0x',
				}],
			},
		})
		
		return { txHash: result }
	}
}
```

#### 2. Sign Transaction (Ethereum)
**Documentation**: https://docs.privy.io/wallets/using-wallets/ethereum/sign-a-transaction

```typescript
/**
 * Sign transaction without sending
 */
async signTransaction(params: {
	walletAddress: string
	to: string
	value: string
	data?: string
	nonce?: number
	gasLimit?: string
	gasPrice?: string
	chainId?: number
}): Promise<{ signedTx: string }> {
	const result = await this.privyClient.wallets().rpc({
		address: params.walletAddress,
		chainId: params.chainId || 1,
		request: {
			method: 'eth_signTransaction',
			params: [{
				to: params.to,
				value: params.value,
				data: params.data || '0x',
				nonce: params.nonce,
				gasLimit: params.gasLimit,
				gasPrice: params.gasPrice,
			}],
		},
	})
	
	return { signedTx: result }
}
```

#### 3. Switch Chain
**Documentation**: https://docs.privy.io/wallets/using-wallets/ethereum/switch-chain

```typescript
/**
 * Switch chain for user's wallet
 * Note: This is client-side operation, included for reference
 */
async switchChain(params: {
	walletAddress: string
	chainId: number
}): Promise<void> {
	await this.privyClient.wallets().rpc({
		address: params.walletAddress,
		chainId: params.chainId,
		request: {
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: `0x${params.chainId.toString(16)}` }],
		},
	})
}
```

---

## 💳 TODO: Funding & On/Off Ramp

### Overview
Privy provides built-in funding methods via credit card, Apple Pay, and Google Pay.

**Primary Focus**: Apple Pay & Google Pay integration

### Implementation Needed

#### 1. Card-Based Funding Setup
**Documentation**: 
- General: https://docs.privy.io/wallets/funding/methods/card
- Apple/Google Pay: https://docs.privy.io/recipes/card-based-funding

#### 2. Frontend Integration (Next.js Example)
**Reference**: https://github.com/privy-io/examples/tree/main/examples/privy-next-funding

Key steps:
1. Enable funding in Privy Dashboard
2. Configure payment providers (Stripe, MoonPay, etc.)
3. Add funding UI component
4. Handle funding callbacks

#### 3. Funding Flow

```typescript
// Client-side (React/Next.js)
import { useFundWallet } from '@privy-io/react-auth'

function FundingComponent() {
	const { fundWallet } = useFundWallet({
		onSuccess: (txHash) => {
			console.log('Funding successful:', txHash)
		},
		onError: (error) => {
			console.error('Funding failed:', error)
		},
	})
	
	return (
		<button onClick={() => fundWallet({ 
			walletAddress: '0x...',
			amount: '100', // USD
			currency: 'USD',
			paymentMethod: 'apple_pay', // or 'google_pay', 'card'
		})}>
			Fund Wallet
		</button>
	)
}
```

#### 4. Server-Side Verification

```typescript
// Add to packages/core/usecase/funding.usecase.ts (NEW FILE)

export class FundingUsecase {
	/**
	 * Verify funding transaction
	 * Called from webhook or polling
	 */
	async verifyFundingTransaction(params: {
		transactionId: string
		walletAddress: string
		expectedAmount: string
	}): Promise<{
		verified: boolean
		actualAmount: string
		txHash?: string
	}> {
		// Query blockchain to verify funds arrived
		// Update user balance in database
		// Send confirmation
	}
}
```

---

## 📁 File Structure for New Implementation

```
packages/core/
├── repository/
│   ├── user.repository.ts                    # ✅ Implemented
│   ├── wallet-transaction.repository.ts      # 🚧 TODO: Add
│   └── funding.repository.ts                 # 🚧 TODO: Add
├── usecase/
│   ├── embedded-wallet.usecase.ts            # ✅ Implemented
│   ├── wallet-transaction.usecase.ts         # 🚧 TODO: Add
│   └── funding.usecase.ts                    # 🚧 TODO: Add
├── datagateway/
│   ├── privy-user.datagateway.ts             # ✅ Implemented
│   ├── wallet-transaction.datagateway.ts     # 🚧 TODO: Add
│   └── funding.datagateway.ts                # 🚧 TODO: Add
└── entity/
    ├── privy-user.entity.ts                  # ✅ Implemented
    ├── privy-wallet.entity.ts                # ✅ Implemented
    ├── wallet-transaction.entity.ts          # 🚧 TODO: Add
    └── funding.entity.ts                     # 🚧 TODO: Add
```

---

## 🎯 Implementation Priority

### Phase 1: Server-Side Wallet Access (High Priority)
1. Add `getUserByWalletAddress` to PrivyUserRepository
2. Add `getWalletsByUserId` to PrivyUserRepository
3. Update usecase to use Privy search when local DB fails
4. Test wallet retrieval from Privy

### Phase 2: Transaction Operations (Medium Priority)
1. Create `WalletTransactionRepository`
2. Implement `sendTransaction`
3. Implement `signTransaction`
4. Create transaction history tracking
5. Add transaction status polling

### Phase 3: Funding Integration (Medium Priority)
1. Study Next.js funding example
2. Set up payment provider (Stripe/MoonPay)
3. Implement frontend funding UI
4. Add server-side verification
5. Create funding history tracking

### Phase 4: Advanced Features (Low Priority)
1. Multi-chain support (Solana, Polygon, etc.)
2. Gas estimation
3. Transaction batching
4. Wallet recovery flows

---

## 🔍 Key Architectural Decisions

### 1. Hybrid Storage Model
**Why**: Privy stores wallet keys, we store mapping for fast lookups

```
User Request → Check Local DB → If not found → Query Privy → Save to Local DB
```

### 2. Auto-Generated UserIds
**Why**: Support wallet creation without pre-existing userId

```typescript
// Email-based
userId = "email:user@example.com"

// Wallet-based
userId = "wallet:0x123..."

// Custom
userId = "custom:my-user-123"
```

### 3. Linked Accounts as Primary Auth
**Why**: Users can authenticate via multiple methods (email, wallet, OAuth)

One user can have:
- Email: user@example.com
- Wallet: 0x123...
- Google OAuth: google-id-123
- Embedded Wallet: 0xabc... (created by Privy)

---

## 📝 Important Notes & Reminders

### When You Need Accurate Information
1. **Always check this document first** for known implementation patterns
2. **Refer to official Privy docs** (links at top of document)
3. **Check Privy examples repo**: https://github.com/privy-io/examples
4. **Search Privy SDK types**: `@privy-io/node` and `@privy-io/react-auth`

### Common Pitfalls
1. ❌ Don't confuse `userId` (your app's ID) with `privyUserId` (Privy's DID)
2. ❌ Don't store private keys - Privy handles all key management
3. ❌ Don't query Privy for every request - use local DB for fast lookups
4. ✅ Always validate chain compatibility before transactions
5. ✅ Always verify funding transactions on-chain

### Security Considerations
1. **Never expose Privy App Secret** - keep in environment variables
2. **Validate webhook signatures** for funding callbacks
3. **Rate limit wallet operations** to prevent abuse
4. **Log all transactions** for audit trail
5. **Implement spending limits** for automated transactions

---

## 📚 Additional Resources

### Privy SDK Documentation
- Node SDK: https://docs.privy.io/
- React SDK: https://docs.privy.io/reference/react-auth/modules

### Example Projects
- Funding Example: https://github.com/privy-io/examples/tree/main/examples/privy-next-funding
- All Examples: https://github.com/privy-io/examples

### Support
- Discord: https://privy.io/discord
- Documentation: https://docs.privy.io/

---

## 🔄 Keep This Document Updated

When implementing new features:
1. ✅ Mark items as implemented
2. 📝 Add code examples
3. 🐛 Document any issues encountered
4. 💡 Add best practices learned

**Last Updated**: 2025-11-13
**Next Review**: When implementing Phase 2 (Transactions)
