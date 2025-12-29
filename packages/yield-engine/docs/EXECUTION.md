# Deposit/Withdrawal Execution Guide

> Comprehensive guide for executing DeFi deposits and withdrawals using the Proxify Yield Engine

**Status**: 🚧 In Development
**Target Release**: Q1 2025

---

## Table of Contents

- [Quick Start](#quick-start)
- [Execution Modes](#execution-modes)
- [Single Protocol Execution](#single-protocol-execution)
- [Multi-Protocol Batching](#multi-protocol-batching)
- [Gas Estimation](#gas-estimation)
- [Error Handling](#error-handling)
- [Transaction Monitoring](#transaction-monitoring)
- [Best Practices](#best-practices)

---

## Quick Start

### Installation

```bash
npm install @proxify/yield-engine viem
```

### Basic Deposit (Transaction Data Only)

```typescript
import { AaveAdapter } from '@proxify/yield-engine'
import { parseUnits } from 'viem'

// Initialize adapter for Base chain
const adapter = new AaveAdapter(8453)

// Prepare deposit transaction (does NOT execute)
const depositTx = await adapter.prepareDeposit(
  'USDC',                              // Token
  8453,                                // Chain ID (Base)
  parseUnits('1000', 6).toString(),    // 1000 USDC (6 decimals)
  '0xYourWalletAddress'                // From address
)

console.log('Transaction to sign:', depositTx)
// {
//   to: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',  // AAVE Pool
//   data: '0x617ba037...',                              // Encoded supply() call
//   value: '0',
//   chainId: 8453
// }

// Send to Privy, MetaMask, or any wallet for signing
await wallet.sendTransaction(depositTx)
```

### Basic Deposit (Direct Execution)

```typescript
import { AaveAdapter } from '@proxify/yield-engine'
import { createWalletClient, http } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Create wallet client
const account = privateKeyToAccount('0xYourPrivateKey')
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Initialize adapter
const adapter = new AaveAdapter(8453)

// Execute deposit (handles approval + deposit + verification)
const receipt = await adapter.executeDeposit(
  'USDC',
  8453,
  parseUnits('1000', 6).toString(),
  walletClient
)

console.log('Deposit successful!')
console.log('Transaction hash:', receipt.hash)
console.log('Gas used:', receipt.gasUsed)
console.log('Block number:', receipt.blockNumber)
```

---

## Execution Modes

The yield engine supports **two execution modes** to accommodate different wallet integration patterns:

### Mode 1: Transaction Preparation (Recommended for Privy)

**Use when**: You have a wallet SDK (Privy, MetaMask) that handles signing

```typescript
// ✅ Best for: Privy MPC wallets, MetaMask, WalletConnect

const adapter = new AaveAdapter(chainId)

// 1. Prepare transaction data
const tx = await adapter.prepareDeposit(token, chainId, amount, fromAddress)

// 2. Send to wallet SDK for signing
const hash = await privyWallet.sendTransaction(tx)

// 3. Wait for confirmation
const receipt = await publicClient.waitForTransactionReceipt({ hash })
```

**Advantages**:
- Never exposes private keys to your application
- Works with Privy's MPC wallet architecture
- Compatible with any wallet provider
- Maximum security

### Mode 2: Direct Execution (Simplified Flow)

**Use when**: You have direct access to a wallet signer

```typescript
// ✅ Best for: Backend services with managed keys, testing

const walletClient = createWalletClient({ account, transport })

// One-step execution (handles everything)
const receipt = await adapter.executeDeposit(token, chainId, amount, walletClient)
```

**Advantages**:
- Automatic approval handling
- Automatic balance verification
- Simpler code
- Built-in error handling

**Disadvantages**:
- Requires private key in application
- Less suitable for frontend use

---

## Single Protocol Execution

### AAVE V3 Deposit

```typescript
import { AaveAdapter } from '@proxify/yield-engine'

const adapter = new AaveAdapter(8453) // Base chain

// Option A: Prepare transaction
const depositTx = await adapter.prepareDeposit(
  'USDC',
  8453,
  '1000000000', // 1000 USDC (6 decimals)
  userAddress
)

// Option B: Direct execution
const receipt = await adapter.executeDeposit(
  'USDC',
  8453,
  '1000000000',
  walletClient
)
```

**AAVE deposit calls**:
1. `ERC20.approve(pool, amount)` - If needed
2. `Pool.supply(asset, amount, onBehalfOf, 0)` - Deposit

**Result**: User receives aUSDC tokens that auto-appreciate

### Compound V3 Deposit

```typescript
import { CompoundAdapter } from '@proxify/yield-engine'

const adapter = new CompoundAdapter(8453)

const receipt = await adapter.executeDeposit(
  'USDC',
  8453,
  '1000000000',
  walletClient
)
```

**Compound deposit calls**:
1. `ERC20.approve(comet, amount)` - If needed
2. `Comet.supply(asset, amount)` - Deposit

**Result**: User's Comet balance increases (rebasing token)

### Morpho Vault Deposit

```typescript
import { MorphoAdapter } from '@proxify/yield-engine'

const adapter = new MorphoAdapter(8453)

const receipt = await adapter.executeDeposit(
  'USDC',
  8453,
  '1000000000',
  walletClient
)
```

**Morpho deposit calls**:
1. `ERC20.approve(vault, amount)` - If needed
2. `MetaMorphoVault.deposit(assets, receiver)` - Deposit

**Result**: User receives vault shares (ERC-4626)

### Withdrawal Examples

```typescript
// AAVE withdrawal
const withdrawTx = await aaveAdapter.prepareWithdrawal(
  'USDC',
  8453,
  '500000000', // 500 USDC
  userAddress  // Recipient
)

// Compound withdrawal
const receipt = await compoundAdapter.executeWithdrawal(
  'USDC',
  8453,
  '500000000',
  walletClient
)

// Morpho withdrawal
const receipt = await morphoAdapter.executeWithdrawal(
  'USDC',
  8453,
  '500000000',
  walletClient
)
```

---

## Multi-Protocol Batching

### Execute Across Multiple Protocols

```typescript
import { BatchExecutor } from '@proxify/yield-engine'
import { parseUnits } from 'viem'

// Initialize executor for Base chain
const executor = new BatchExecutor(8453)

// Define allocations (must sum to 100%)
const allocations = [
  {
    protocol: 'aave' as const,
    percentage: 60,
    amount: parseUnits('600', 6).toString(), // 600 USDC
  },
  {
    protocol: 'compound' as const,
    percentage: 30,
    amount: parseUnits('300', 6).toString(), // 300 USDC
  },
  {
    protocol: 'morpho' as const,
    percentage: 10,
    amount: parseUnits('100', 6).toString(), // 100 USDC
  },
]

// Execute batch deposit
const result = await executor.executeBatchDeposit({
  token: 'USDC',
  chainId: 8453,
  totalAmount: parseUnits('1000', 6).toString(),
  allocations,
  walletClient,
  executionMode: 'sequential', // or 'parallel'
})

// Check results
console.log('Success:', result.success)
console.log('Total deployed:', result.totalDeployed)
console.log('Total gas used:', result.totalGasUsed)

// Per-protocol results
result.results.forEach(r => {
  console.log(`${r.protocol}:`, {
    success: r.success,
    txHash: r.txHash,
    gasUsed: r.gasUsed,
    error: r.error,
  })
})
```

### Sequential vs Parallel Execution

**Sequential (Recommended)**:
```typescript
executionMode: 'sequential'
```
- Executes protocols one by one
- Easier to debug if something fails
- Slower (but more reliable)
- **Use for production**

**Parallel**:
```typescript
executionMode: 'parallel'
```
- Executes all protocols simultaneously
- Faster execution
- Harder to debug failures
- **Use for testing/development**

### Handling Partial Failures

```typescript
const result = await executor.executeBatchDeposit(request)

if (result.partialFailure) {
  console.log('⚠️ Partial failure detected')
  console.log('Successfully deployed:', result.totalDeployed)

  // Find failed protocols
  const failed = result.results.filter(r => !r.success)
  console.log('Failed protocols:', failed.map(f => f.protocol))

  // Option 1: Accept partial deployment
  await updateVault({ totalStaked: result.totalDeployed })

  // Option 2: Retry failed protocols
  for (const failure of failed) {
    try {
      await retryProtocolDeposit(failure.protocol, failure.amount)
    } catch (error) {
      console.error(`Retry failed for ${failure.protocol}:`, error)
    }
  }
}
```

---

## Gas Estimation

### Estimate Before Execution

```typescript
import { AaveAdapter } from '@proxify/yield-engine'
import { estimateGasCostUSD } from '@proxify/yield-engine'

const adapter = new AaveAdapter(8453)

// Estimate gas units
const gasEstimate = await adapter.estimateDepositGas(
  'USDC',
  8453,
  parseUnits('1000', 6).toString(),
  userAddress
)

console.log('Estimated gas:', gasEstimate) // e.g., 250000n

// Convert to USD
const gasCostUSD = await estimateGasCostUSD(
  8453,
  gasEstimate,
  2000 // ETH price in USD
)

console.log('Gas cost:', gasCostUSD, 'USD') // e.g., "2.50"
```

### Batch Gas Estimation

```typescript
const executor = new BatchExecutor(8453)

const estimate = await executor.estimateBatchGas({
  token: 'USDC',
  chainId: 8453,
  totalAmount: parseUnits('1000', 6).toString(),
  allocations: [
    { protocol: 'aave', percentage: 60, amount: '600000000' },
    { protocol: 'compound', percentage: 40, amount: '400000000' },
  ],
  executionMode: 'sequential',
})

console.log('Total gas:', estimate.totalGas)
console.log('Per protocol:')
estimate.perProtocol.forEach((gas, protocol) => {
  console.log(`  ${protocol}: ${gas}`)
})
```

### Gas Limit Safety

```typescript
// Add 20% buffer to estimate
const gasEstimate = await adapter.estimateDepositGas(...)
const gasLimit = (gasEstimate * 120n) / 100n

// Use in transaction
const tx = {
  ...preparedTx,
  gas: gasLimit,
}
```

### Gas Price Limits

```typescript
import { getGasPrice } from '@proxify/yield-engine'

const MAX_GAS_PRICE_GWEI = 100

const gasPrice = await getGasPrice(8453)
const gasPriceGwei = Number(gasPrice) / 1e9

if (gasPriceGwei > MAX_GAS_PRICE_GWEI) {
  throw new Error(`Gas price too high: ${gasPriceGwei} gwei. Try again later.`)
}
```

---

## Error Handling

### Common Errors

#### 1. Insufficient Balance

```typescript
try {
  await adapter.executeDeposit(token, chainId, amount, walletClient)
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('User does not have enough tokens')
    // Show friendly error to user
  }
}
```

#### 2. Insufficient Allowance

```typescript
// Check approval before deposit
const poolAddress = getPoolAddress(chainId)
const approvalStatus = await adapter.checkApproval(
  token,
  chainId,
  userAddress,
  poolAddress,
  amount
)

if (approvalStatus.needsApproval) {
  // Request approval from user
  const approvalTx = await adapter.prepareApproval(
    token,
    chainId,
    poolAddress,
    amount,
    userAddress
  )

  await wallet.sendTransaction(approvalTx)
}
```

#### 3. Transaction Reverted

```typescript
const receipt = await adapter.executeDeposit(...)

if (receipt.status === 'reverted') {
  throw new Error('Transaction reverted on-chain. Possible reasons: slippage, pool paused, etc.')
}
```

#### 4. Gas Price Too High

```typescript
const gasPrice = await getGasPrice(chainId)

if (gasPrice > MAX_ACCEPTABLE_GAS_PRICE) {
  throw new Error('Gas price too high. Wait for network congestion to clear.')
}
```

### Retry Logic

```typescript
import { retryWithBackoff } from '@proxify/yield-engine'

const receipt = await retryWithBackoff(
  async () => adapter.executeDeposit(token, chainId, amount, walletClient),
  3,      // Max retries
  1000    // Base delay (1 second)
)

// Exponential backoff: 1s, 2s, 4s
```

### Error Recovery Patterns

```typescript
async function safeDeposit(
  adapter: IProtocolAdapter,
  token: string,
  chainId: number,
  amount: string,
  walletClient: WalletClient
) {
  try {
    // 1. Check balance
    const balance = await getBalance(token, walletClient.account.address)
    if (BigInt(balance) < BigInt(amount)) {
      throw new Error('Insufficient balance')
    }

    // 2. Estimate gas
    const gasEstimate = await adapter.estimateDepositGas(
      token,
      chainId,
      amount,
      walletClient.account.address
    )

    // 3. Check gas price
    const gasPrice = await getGasPrice(chainId)
    const gasCost = gasEstimate * gasPrice

    if (gasCost > MAX_GAS_COST) {
      throw new Error('Gas cost too high')
    }

    // 4. Execute deposit
    const receipt = await adapter.executeDeposit(
      token,
      chainId,
      amount,
      walletClient
    )

    // 5. Verify success
    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted')
    }

    return receipt

  } catch (error) {
    // Log error for monitoring
    console.error('Deposit failed:', error)

    // Record failed transaction in database
    await recordFailedTransaction({
      protocol: adapter.getProtocolName(),
      token,
      chainId,
      amount,
      error: error.message,
    })

    // Rethrow for caller to handle
    throw error
  }
}
```

---

## Transaction Monitoring

### Wait for Confirmation

```typescript
import { getPublicClient } from '@proxify/yield-engine'

// Prepare and send transaction
const tx = await adapter.prepareDeposit(...)
const hash = await wallet.sendTransaction(tx)

// Wait for confirmation
const client = getPublicClient(chainId)
const receipt = await client.waitForTransactionReceipt({
  hash,
  confirmations: 1, // Wait for 1 confirmation
})

console.log('Transaction confirmed in block:', receipt.blockNumber)
```

### Wait for Multiple Confirmations

```typescript
async function waitForConfirmations(
  hash: string,
  chainId: number,
  confirmations: number = 3
) {
  const client = getPublicClient(chainId)

  const receipt = await client.waitForTransactionReceipt({
    hash: hash as `0x${string}`,
    confirmations,
  })

  console.log(`Transaction confirmed with ${confirmations} confirmations`)
  return receipt
}

// Wait for 3 confirmations (safer for large amounts)
const receipt = await waitForConfirmations(hash, 8453, 3)
```

### Track Transaction Status

```typescript
interface TransactionStatus {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  confirmations: number
  gasUsed?: bigint
  blockNumber?: bigint
}

async function trackTransaction(
  hash: string,
  chainId: number
): Promise<TransactionStatus> {
  const client = getPublicClient(chainId)

  try {
    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: hash as `0x${string}`,
    })

    if (!receipt) {
      return {
        hash,
        status: 'pending',
        confirmations: 0,
      }
    }

    // Get current block to calculate confirmations
    const currentBlock = await client.getBlockNumber()
    const confirmations = Number(currentBlock - receipt.blockNumber)

    return {
      hash,
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      confirmations,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber,
    }
  } catch (error) {
    return {
      hash,
      status: 'pending',
      confirmations: 0,
    }
  }
}
```

### Real-Time Updates (Frontend)

```typescript
// React example with polling
import { useQuery } from '@tanstack/react-query'

function useTransactionStatus(hash: string | null, chainId: number) {
  return useQuery({
    queryKey: ['transaction-status', hash, chainId],
    queryFn: () => trackTransaction(hash!, chainId),
    enabled: !!hash,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true,
  })
}

// Usage in component
function DepositStatus({ txHash }: { txHash: string }) {
  const { data: status } = useTransactionStatus(txHash, 8453)

  if (status?.status === 'pending') {
    return <div>⏳ Waiting for confirmation...</div>
  }

  if (status?.status === 'confirmed') {
    return (
      <div>
        ✅ Confirmed with {status.confirmations} confirmations
        <br />
        Gas used: {status.gasUsed?.toString()}
      </div>
    )
  }

  if (status?.status === 'failed') {
    return <div>❌ Transaction failed</div>
  }

  return null
}
```

---

## Best Practices

### 1. Always Estimate Gas First

```typescript
// ✅ Good: Show user the cost before execution
const gasEstimate = await adapter.estimateDepositGas(...)
const gasCostUSD = await estimateGasCostUSD(chainId, gasEstimate, ethPrice)

// Show to user: "This will cost approximately $2.50 in gas"
if (await userConfirms(gasCostUSD)) {
  await adapter.executeDeposit(...)
}
```

### 2. Handle Approvals Gracefully

```typescript
// ✅ Good: Check approval and request if needed
const approvalStatus = await checkApproval(...)

if (approvalStatus.needsApproval) {
  // Show user: "Step 1/2: Approve USDC"
  const approvalTx = await prepareApproval(...)
  await wallet.sendTransaction(approvalTx)

  // Show user: "Step 2/2: Deposit USDC"
  const depositTx = await prepareDeposit(...)
  await wallet.sendTransaction(depositTx)
} else {
  // Show user: "Deposit USDC"
  const depositTx = await prepareDeposit(...)
  await wallet.sendTransaction(depositTx)
}
```

### 3. Validate Inputs

```typescript
// ✅ Good: Validate before execution
function validateDeposit(amount: string, balance: string) {
  if (BigInt(amount) <= 0n) {
    throw new Error('Amount must be greater than zero')
  }

  if (BigInt(amount) > BigInt(balance)) {
    throw new Error('Insufficient balance')
  }

  // Add minimum deposit check
  const MIN_DEPOSIT = parseUnits('1', 6) // 1 USDC minimum
  if (BigInt(amount) < MIN_DEPOSIT) {
    throw new Error('Minimum deposit is 1 USDC')
  }
}
```

### 4. Use Sequential for Production

```typescript
// ✅ Good: Sequential execution for production
const result = await executor.executeBatchDeposit({
  ...params,
  executionMode: 'sequential', // Safer, easier to debug
})

// ❌ Avoid: Parallel execution in production (unless well-tested)
executionMode: 'parallel' // Use only in development
```

### 5. Monitor Gas Prices

```typescript
// ✅ Good: Check gas before execution
const gasPrice = await getGasPrice(chainId)
const gasPriceGwei = Number(gasPrice) / 1e9

if (gasPriceGwei > 100) {
  // Warn user or delay execution
  throw new Error('Gas prices are very high right now. Try again later.')
}
```

### 6. Verify Balances After Execution

```typescript
// ✅ Good: Verify the deposit worked
const balanceBefore = await getProtocolBalance(user)

const receipt = await adapter.executeDeposit(...)

const balanceAfter = await getProtocolBalance(user)

if (balanceAfter <= balanceBefore) {
  throw new Error('Balance verification failed')
}
```

### 7. Log Everything

```typescript
// ✅ Good: Comprehensive logging
console.log('Deposit initiated', {
  protocol: adapter.getProtocolName(),
  token,
  chainId,
  amount,
  user: walletClient.account.address,
})

const receipt = await adapter.executeDeposit(...)

console.log('Deposit successful', {
  txHash: receipt.hash,
  blockNumber: receipt.blockNumber,
  gasUsed: receipt.gasUsed,
  gasCost: (receipt.gasUsed * receipt.effectiveGasPrice).toString(),
})
```

---

## Complete Example: Production-Ready Deposit

```typescript
import {
  AaveAdapter,
  estimateGasCostUSD,
  getGasPrice,
  retryWithBackoff,
} from '@proxify/yield-engine'
import { parseUnits } from 'viem'

async function executeProductionDeposit(
  token: string,
  chainId: number,
  amountFormatted: string,
  walletClient: WalletClient
) {
  const adapter = new AaveAdapter(chainId)
  const amount = parseUnits(amountFormatted, 6).toString()

  // 1. Validate inputs
  const balance = await getBalance(token, walletClient.account.address)
  if (BigInt(amount) > BigInt(balance)) {
    throw new Error('Insufficient balance')
  }

  // 2. Estimate gas
  const gasEstimate = await adapter.estimateDepositGas(
    token,
    chainId,
    amount,
    walletClient.account.address
  )

  const gasPrice = await getGasPrice(chainId)
  const gasPriceGwei = Number(gasPrice) / 1e9

  // 3. Check gas price
  if (gasPriceGwei > 100) {
    throw new Error('Gas price too high. Wait for lower gas prices.')
  }

  // 4. Calculate cost
  const gasCostUSD = await estimateGasCostUSD(chainId, gasEstimate, 2000)

  console.log(`Deposit will cost ~$${gasCostUSD} in gas`)

  // 5. Execute with retry
  const receipt = await retryWithBackoff(
    async () => adapter.executeDeposit(token, chainId, amount, walletClient),
    3,
    1000
  )

  // 6. Verify success
  if (receipt.status === 'reverted') {
    throw new Error('Transaction reverted')
  }

  // 7. Log result
  console.log('Deposit successful:', {
    txHash: receipt.hash,
    block: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    actualGasCost: (receipt.gasUsed * receipt.effectiveGasPrice).toString(),
  })

  return receipt
}
```

---

## Summary

### Key Takeaways

1. **Two execution modes**: Transaction preparation (for Privy) or direct execution (for backend)
2. **Always estimate gas** before execution and show cost to user
3. **Handle approvals** separately from deposits (two-step UX)
4. **Use sequential mode** for production batch execution
5. **Validate inputs** before sending transactions
6. **Monitor gas prices** and delay execution if too high
7. **Verify balances** after execution to confirm success
8. **Log everything** for monitoring and debugging

### Production Checklist

- [ ] Gas estimation before execution
- [ ] Gas price checks (reject if > 100 gwei)
- [ ] Balance validation
- [ ] Approval handling
- [ ] Transaction monitoring
- [ ] Error handling with retry
- [ ] Balance verification after execution
- [ ] Comprehensive logging
- [ ] User-friendly error messages

---

**Next Steps**:
- Read [MULTI_PROTOCOL_BATCHING.md](./MULTI_PROTOCOL_BATCHING.md) for advanced batching patterns
- Read [SHARE_ACCOUNTING.md](./SHARE_ACCOUNTING.md) to understand yield tracking
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
