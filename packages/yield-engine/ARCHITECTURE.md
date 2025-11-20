# Yield-Engine Architecture Guide

## 🤔 FAQ: Common Questions

### Q: Why don't I see `supply()` and `borrow()` functions in the yield-engine?

**A:** The yield-engine is **READ-ONLY** by design. It's responsible for:
- ✅ Fetching APY data from protocols
- ✅ Tracking user positions
- ✅ Calculating best yields
- ✅ Providing optimization recommendations

**Transaction execution** (supply, borrow, withdraw) belongs in a **separate layer** (`packages/core`).

### Q: How exactly does yield get generated?

**A:** The yield generation flow happens in multiple steps across different system layers:

```
1. User deposits money (via MoonPay/Apple Pay → USDC)
2. Custodial wallet receives USDC (managed by Privy)
3. Backend API queries yield-engine for best APY
4. Protocol repository encodes deposit transaction
5. Transaction layer signs and executes the deposit
6. Yield accrues automatically on-chain (AAVE compounds interest)
7. Yield-engine monitors positions and suggests rebalancing
```

The **yield-engine provides intelligence** (steps 3, 7), but **doesn't execute transactions** (step 5).

---

## 🏗️ System Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────────┐
│   LAYER 1: YIELD-ENGINE (Read-Only)             │
│   Package: @proxify/yield-engine                │
│   Purpose: Yield Intelligence & Monitoring      │
│                                                 │
│   ✅ What it does:                              │
│   • getSupplyAPY('USDC', chainId) → "5.25"     │
│   • getUserPosition(wallet, token) → Position  │
│   • getMetrics(token) → YieldOpportunity       │
│   • calculateBestYield() → Recommendation      │
│                                                 │
│   ❌ What it does NOT do:                       │
│   • Execute transactions                        │
│   • Sign transactions                           │
│   • Transfer funds                              │
│   • Modify blockchain state                     │
└─────────────────────────────────────────────────┘
                    ↓
         (Provides data to Backend API)
                    ↓
┌─────────────────────────────────────────────────┐
│   LAYER 2: PROTOCOL REPOSITORIES                │
│   Package: @proxify/core/repository/old/        │
│   Purpose: Transaction Encoding (Phase 5.3)     │
│                                                 │
│   🚧 What it will do:                           │
│   • deposit() → returns {to, data, value}      │
│   • withdraw() → returns {to, data, value}     │
│   • Encodes contract calls using viem           │
│                                                 │
│   Status: PLACEHOLDER (TODO)                    │
└─────────────────────────────────────────────────┘
                    ↓
         (Encoded tx passed to Transaction Layer)
                    ↓
┌─────────────────────────────────────────────────┐
│   LAYER 3: TRANSACTION EXECUTION                │
│   Package: @proxify/core/repository/old/        │
│   File: wallet-transaction.repository.ts        │
│   Purpose: Sign & Send Transactions             │
│                                                 │
│   ⚠️  What it should do:                        │
│   • Signs transactions via Privy SDK            │
│   • Sends to blockchain                         │
│   • Tracks transaction history                  │
│   • Handles confirmations & errors              │
│                                                 │
│   Status: BLOCKED (needs Privy Controls API)    │
└─────────────────────────────────────────────────┘
```

---

## 💰 How Yield Generation Actually Works

### Step-by-Step Flow

#### 1. User Deposits Money

```
User → Client App → Deposit Button
    ↓
MoonPay/Apple Pay widget ($100 USD)
    ↓
USDC minted and sent to client's custodial wallet
```

**Yield-Engine Role**: NONE (not involved yet)

---

#### 2. Backend Finds Best Yield

```typescript
// Backend API (packages/core)
import { AaveAdapter, CompoundAdapter } from '@proxify/yield-engine'

const aave = new AaveAdapter(1)
const compound = new CompoundAdapter(1)

// Query yields from all protocols
const aaveAPY = await aave.getSupplyAPY('USDC', 1) // "5.25"
const compoundAPY = await compound.getSupplyAPY('USDC', 1) // "4.80"

// Find best
const bestProtocol = aaveAPY > compoundAPY ? 'aave' : 'compound'
console.log(`Best protocol: ${bestProtocol} at ${aaveAPY}%`)
```

**Yield-Engine Role**: ✅ **Provides APY data for decision-making**

---

#### 3. Backend Encodes Transaction

```typescript
// Protocol Repository (packages/core/repository/old/aave.repository.ts)
class AaveRepository {
  async deposit(params: DepositParams): Promise<TransactionData> {
    const { token, amount, walletAddress, chainId } = params

    // Encode AAVE Pool.supply() call
    const calldata = encodeFunctionData({
      abi: AAVE_POOL_ABI,
      functionName: 'supply',
      args: [
        token,        // Asset to supply (USDC address)
        amount,       // Amount to supply (100 USDC)
        walletAddress, // On behalf of user
        0            // Referral code
      ]
    })

    return {
      to: AAVE_POOL_ADDRESS,    // Where to send tx
      data: calldata,            // What to execute
      value: '0'                 // ETH value (0 for ERC20)
    }
  }
}
```

**Yield-Engine Role**: NONE (doesn't encode transactions)

---

#### 4. Transaction Layer Executes

```typescript
// Transaction Repository (packages/core/repository/old/wallet-transaction.repository.ts)
class WalletTransactionRepository {
  async sendTransaction(params: SendTransactionParams) {
    const { walletAddress, transaction } = params

    // Sign transaction via Privy custodial wallet
    const signedTx = await privyClient.signTransaction({
      address: walletAddress,
      transaction: {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value
      }
    })

    // Send to blockchain
    const txHash = await publicClient.sendRawTransaction({
      serializedTransaction: signedTx
    })

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash
    })

    return receipt
  }
}
```

**Status**: ⚠️ **BLOCKED - Privy Controls API not configured**

**Yield-Engine Role**: NONE (doesn't execute transactions)

---

#### 5. Yield Accrues On-Chain

Once the deposit transaction is confirmed:

```
User's USDC is now in AAVE Pool
    ↓
AAVE mints aUSDC (yield-bearing token) to user's wallet
    ↓
aUSDC balance increases every second automatically
    ↓
Interest compounds continuously (no action needed)
```

**How AAVE Generates Yield**:
- User supplies USDC to AAVE Pool
- Borrowers borrow USDC and pay interest
- Interest is distributed to suppliers (your user)
- aUSDC balance grows automatically

**Yield-Engine Role**: NONE (yield happens on-chain)

---

#### 6. Yield-Engine Monitors Position

```typescript
// Backend runs this periodically (every hour)
const position = await aave.getUserPosition(
  userWallet,
  'USDC',
  1
)

console.log(position)
// {
//   protocol: 'aave',
//   amount: '100500000', // Original 100 USDC + 0.50 USDC earned
//   amountFormatted: '100.50',
//   valueUSD: '100.50',
//   apy: '5.25'
// }
```

**Yield-Engine Role**: ✅ **Tracks how much yield has been earned**

---

#### 7. Yield-Engine Suggests Rebalancing

```typescript
// Check if better opportunity exists
const opportunities = await aggregator.fetchAllOpportunities('USDC', 1)
// [
//   { protocol: 'morpho', supplyAPY: '6.8' },  ← Better!
//   { protocol: 'aave', supplyAPY: '5.2' },    ← Current
//   { protocol: 'compound', supplyAPY: '4.9' }
// ]

const optimizer = new YieldOptimizer()
const recommendation = await optimizer.shouldRebalance(
  currentPosition,
  'USDC',
  1
)

console.log(recommendation)
// {
//   action: 'rebalance',
//   from: 'aave',
//   to: 'morpho',
//   apyDelta: '1.6',
//   estimatedMonthlyGain: '$13.33'
// }
```

**Yield-Engine Role**: ✅ **Recommends when to move funds for better yield**

---

## 🔄 Complete End-to-End Flow

```
┌─────────────────────────────────────────────┐
│ 1. User deposits $100 via MoonPay           │
│    → Receives 100 USDC                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. Backend API calls yield-engine           │
│    aave.getSupplyAPY('USDC', 1) → "5.25"   │
│    ✅ Yield-Engine: Provides data           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Backend decides: Deposit to AAVE         │
│    aaveRepo.deposit(...) → {to, data}      │
│    ❌ Yield-Engine: Not involved            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. Transaction Layer signs & sends          │
│    walletTxRepo.sendTransaction(...)       │
│    ⚠️  Status: BLOCKED (needs Privy)       │
│    ❌ Yield-Engine: Not involved            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 5. Transaction confirmed on-chain           │
│    User now has 100 aUSDC                   │
│    Yield starts accruing automatically      │
│    ❌ Yield-Engine: Not involved            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 6. After 1 week...                          │
│    aave.getUserPosition(...) → 100.67 USDC │
│    ✅ Yield-Engine: Tracks earnings         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 7. Morpho now offers 6.8% (better!)         │
│    optimizer.shouldRebalance(...) → YES    │
│    ✅ Yield-Engine: Recommends rebalance    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 8. Backend withdraws from AAVE              │
│    Backend deposits to Morpho               │
│    (Uses transaction layer)                 │
│    ❌ Yield-Engine: Not involved            │
└─────────────────────────────────────────────┘
```

---

## 📦 What's in Each Package

### @proxify/yield-engine

**Purpose**: Yield Intelligence (Read-Only)

**Files**:
- `src/protocols/aave/aave.adapter.ts` - AAVE APY fetching
- `src/protocols/compound/` - Compound integration (Phase 3)
- `src/protocols/morpho/` - Morpho integration (Phase 4)
- `src/aggregator/` - Multi-protocol comparison (Phase 5)
- `src/optimizer/` - Rebalancing logic (Phase 5)

**Key Methods**:
```typescript
getSupplyAPY(token, chainId): Promise<string>
getUserPosition(wallet, token, chainId): Promise<ProtocolPosition>
getMetrics(token, chainId): Promise<YieldOpportunity>
```

---

### @proxify/core

**Purpose**: Business Logic & Transaction Execution

**Files**:
- `repository/old/aave.repository.ts` - AAVE transaction encoding (TODO)
- `repository/old/wallet-transaction.repository.ts` - Tx execution (BLOCKED)
- `usecase/old/wallet-transaction.usecase.ts` - Business logic
- `routers/yield.router.ts` - API endpoints (TODO)

**Key Methods**:
```typescript
// Protocol Repository
deposit(params): Promise<{ to, data, value }>
withdraw(params): Promise<{ to, data, value }>

// Transaction Repository
sendTransaction(params): Promise<TransactionReceipt>
```

---

## 🚧 Current Status

| Component | Status | Blocker |
|-----------|--------|---------|
| Yield-Engine (AAVE) | ✅ Complete | None |
| Yield-Engine (Compound) | 📋 Phase 3 | Not started |
| Yield-Engine (Morpho) | 📋 Phase 4 | Not started |
| Protocol Repositories | 🚧 Placeholder | Phase 5.3 TODO |
| Transaction Execution | ⚠️ Blocked | Privy Controls API |
| API Endpoints | 📋 Planned | Not wired up |

---

## 🎯 Next Steps

To enable end-to-end yield generation:

1. **Configure Privy Controls API** (unblock transaction execution)
2. **Implement Protocol Repositories** (encode deposit/withdraw calls)
3. **Create DeFi UseCase Layer** (orchestrate: yield-engine → repo → tx execution)
4. **Wire up API Routes** (expose to client apps)
5. **Test end-to-end** (deposit → earn yield → withdraw)

---

## 💡 Key Takeaways

1. **Yield-Engine is READ-ONLY** - It doesn't execute transactions
2. **Yield happens on-chain** - Automatically, no code needed
3. **Three layers work together**:
   - Yield-Engine: Intelligence (APY data, recommendations)
   - Protocol Repos: Encoding (transaction data)
   - Transaction Layer: Execution (signing, sending)
4. **Transaction execution is blocked** - Waiting on Privy Controls API
5. **Architecture is correct** - Clean separation of concerns

---

**Last Updated**: November 19, 2024
**Author**: Claude + Owen
**Status**: AAVE integration complete, transaction execution pending
