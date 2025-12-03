# @proxify/b2b-sdk

Official TypeScript SDK for Proxify B2B API - White-Label DeFi Yield Platform

## Installation

```bash
npm install @proxify/b2b-sdk
# or
yarn add @proxify/b2b-sdk
# or
pnpm add @proxify/b2b-sdk
```

## Quick Start

```typescript
import { ProxifySDK } from '@proxify/b2b-sdk'

// Initialize SDK
const sdk = new ProxifySDK({
  apiKey: 'your-api-key',
  environment: 'production', // or 'sandbox'
})

// Create a user
const user = await sdk.users.createOrGet({
  clientId: 'client_123',
  clientUserId: 'user_456',
  email: 'user@example.com',
})

// Create a deposit
const deposit = await sdk.deposits.createFiat({
  userId: user.id,
  amount: '1000.00',
  currency: 'USD',
})
```

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Client Management](#client-management)
- [User Management](#user-management)
- [Deposits](#deposits)
- [Withdrawals](#withdrawals)
- [Vaults](#vaults)
- [DeFi Protocols](#defi-protocols)
- [Dashboard](#dashboard)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)

## Authentication

The SDK uses API key authentication. Your API key is automatically included in all requests.

```typescript
const sdk = new ProxifySDK({
  apiKey: 'prod_sk_xxxxxxxxxxxxx',
  environment: 'production',
})

// For sandbox/testing
const sandboxSdk = new ProxifySDK({
  apiKey: 'sand_sk_xxxxxxxxxxxxx',
  environment: 'sandbox',
})
```

## Client Management

### Create a Client

```typescript
const client = await sdk.clients.create({
  privyWalletAddress: '0x1234...',
  walletType: 'MANAGED',
  companyName: 'Acme Corp',
  businessType: 'E-commerce',
  description: 'Online marketplace',
  websiteUrl: 'https://acme.com',
  supportedCurrencies: ['USD', 'SGD', 'EUR'],
  isActive: true,
  isSandbox: false,
})

console.log(`Client created with Product ID: ${client.productId}`)
console.log(`API Key: ${client.apiKey}`)
```

### Get Client by Product ID

```typescript
const client = await sdk.clients.getByProductId('prod_xxxxx')
```

### Configure DeFi Strategies

```typescript
await sdk.clients.configureStrategies('prod_xxxxx', {
  chain: '8453', // Base
  token_address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  token_symbol: 'USDC',
  strategies: [
    { category: 'lending', target: 70 }, // 70% AAVE/Compound
    { category: 'lp', target: 20 }, // 20% Liquidity pools
    { category: 'staking', target: 10 }, // 10% Staking
  ],
})
```

### Get Client Balance

```typescript
const balance = await sdk.clients.getBalance('client_123')
console.log(`Available: ${balance.available} ${balance.currency}`)
console.log(`Reserved: ${balance.reserved} ${balance.currency}`)
```

### Configure Bank Accounts

```typescript
await sdk.clients.configureBankAccounts('prod_xxxxx', {
  bankAccounts: [
    {
      accountNumber: '1234567890',
      accountName: 'Acme Corp',
      bankName: 'DBS Bank',
      swiftCode: 'DBSSSGSG',
      currency: 'SGD',
    },
  ],
})
```

## User Management

### Create or Get User

```typescript
const user = await sdk.users.createOrGet({
  clientId: 'prod_xxxxx',
  clientUserId: 'user_123', // Your internal user ID
  email: 'john@example.com',
  walletAddress: '0x5678...', // Optional
})
```

### Get User Portfolio

```typescript
const portfolio = await sdk.users.getPortfolio('user_xxxxx')

console.log(`Total Value: ${portfolio.totalValue}`)
portfolio.vaults.forEach((vault) => {
  console.log(`${vault.tokenSymbol}: ${vault.balance} (Yield: ${vault.yieldEarned})`)
})
```

### Get User Balance

```typescript
const balance = await sdk.users.getBalance('user_xxxxx', {
  chain: '8453',
  token: 'USDC',
})

console.log(`Balance: ${balance.balance} ${balance.currency}`)
console.log(`Yield Earned: ${balance.yield_earned}`)
console.log(`APY: ${balance.apy}%`)
```

### List Users

```typescript
const users = await sdk.users.listByClient('client_123', {
  limit: 50,
  offset: 0,
})
```

## Deposits

### Fiat Deposit (Bank Transfer)

```typescript
// Step 1: Create fiat deposit order
const deposit = await sdk.deposits.createFiat({
  userId: 'user_xxxxx',
  amount: '1000.00',
  currency: 'USD',
  tokenSymbol: 'USDC',
  clientReference: 'order_123',
})

console.log(`Order ID: ${deposit.orderId}`)
console.log(`Status: ${deposit.status}`)
console.log('Payment Instructions:', deposit.paymentInstructions)

// Step 2: User pays via bank transfer
// (Your app shows payment instructions to user)

// Step 3: After payment is confirmed (webhook or manual)
const completed = await sdk.deposits.completeFiat(deposit.orderId, {
  chain: '8453',
  tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  cryptoAmount: '1000.00',
  transactionHash: '0xabcd...',
})

console.log(`Shares Minted: ${completed.sharesMinted}`)
```

### Crypto Deposit

```typescript
// Step 1: Initiate crypto deposit
const deposit = await sdk.deposits.initiateCrypto({
  userId: 'user_xxxxx',
  chain: '8453',
  tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  tokenSymbol: 'USDC',
  amount: '500.00',
})

console.log(`Send ${deposit.expectedAmount} USDC to:`)
console.log(deposit.custodialWalletAddress)

// Step 2: User sends crypto
// (Your app shows wallet address to user)

// Step 3: Complete deposit after on-chain confirmation
const completed = await sdk.deposits.completeCrypto(deposit.orderId, {
  transactionHash: '0x1234...',
})

console.log(`Status: ${completed.status}`)
console.log(`Shares Minted: ${completed.sharesMinted}`)
```

### List Deposits

```typescript
// By user
const userDeposits = await sdk.deposits.listByUser('user_xxxxx', {
  limit: 10,
  offset: 0,
})

// By client
const clientDeposits = await sdk.deposits.listByClient('client_123', {
  status: 'completed',
  limit: 50,
})

// Pending deposits
const pending = await sdk.deposits.listPending()
console.log(`Pending deposits: ${pending.deposits.length}`)
```

### Get Deposit Stats

```typescript
const stats = await sdk.deposits.getStats('client_123')
console.log(`Total Deposits: ${stats.totalDeposits}`)
console.log(`Total Amount: ${stats.totalAmount}`)
console.log(`Average: ${stats.averageAmount}`)
```

## Withdrawals

### Create Withdrawal (Crypto)

```typescript
const withdrawal = await sdk.withdrawals.create({
  userId: 'user_xxxxx',
  vaultId: 'vault_xxxxx',
  amount: '500.00',
  withdrawal_method: 'crypto',
  destination_address: '0x9876...',
  chain: '8453',
  token_address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
})

console.log(`Withdrawal ID: ${withdrawal.id}`)
console.log(`Status: ${withdrawal.status}`)
```

### Create Withdrawal (Fiat to End-User)

```typescript
const withdrawal = await sdk.withdrawals.create({
  userId: 'user_xxxxx',
  vaultId: 'vault_xxxxx',
  amount: '1000.00',
  withdrawal_method: 'fiat_to_end_user',
  destination_currency: 'USD',
  end_user_bank_account: {
    accountNumber: '9876543210',
    accountName: 'John Doe',
    bankName: 'Chase Bank',
    currency: 'USD',
  },
})
```

### Complete Withdrawal

```typescript
await sdk.withdrawals.complete('withdrawal_xxxxx', {
  transactionHash: '0xdef...',
  blockNumber: 12345678,
})
```

### Fail Withdrawal

```typescript
await sdk.withdrawals.fail('withdrawal_xxxxx', {
  reason: 'Insufficient liquidity',
})
```

### List Withdrawals

```typescript
const withdrawals = await sdk.withdrawals.listByUser('user_xxxxx', {
  limit: 10,
})

const clientWithdrawals = await sdk.withdrawals.listByClient('client_123', {
  status: 'COMPLETED',
})
```

## Vaults

### Create or Get Vault

```typescript
const vault = await sdk.vaults.createOrGet({
  clientId: 'client_123',
  chainId: 8453,
  tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  tokenSymbol: 'USDC',
})

console.log(`Vault ID: ${vault.id}`)
console.log(`Current Index: ${vault.currentIndex}`)
console.log(`Total Shares: ${vault.totalShares}`)
```

### Update Vault Index with Yield

```typescript
const result = await sdk.vaults.updateIndex('vault_xxxxx', {
  yieldAmount: '100.50', // $100.50 yield to distribute
})

console.log(`New Index: ${result.newIndex}`)
console.log(`Yield Per Share: ${result.yieldPerShare}`)
```

### List Client Vaults

```typescript
const vaults = await sdk.vaults.listByClient('client_123')
```

### Get Vaults Ready for Staking

```typescript
const readyVaults = await sdk.vaults.getReadyForStaking()
readyVaults.forEach((vault) => {
  console.log(`${vault.tokenSymbol}: ${vault.pendingBalance} ready to stake`)
})
```

## DeFi Protocols

### Get All Protocol Metrics

```typescript
const protocols = await sdk.defi.getAllProtocols({
  token: 'USDC',
  chainId: '8453',
})

protocols.protocols.forEach((protocol) => {
  console.log(`${protocol.protocol}: ${protocol.supplyAPY}% APY`)
  console.log(`  TVL: ${protocol.tvl}`)
  console.log(`  Risk: ${protocol.risk}`)
})
```

### Get Specific Protocol

```typescript
// AAVE
const aave = await sdk.defi.getAAVE({
  token: 'USDC',
  chainId: '8453',
})

// Compound
const compound = await sdk.defi.getCompound({
  token: 'USDC',
  chainId: '8453',
})

// Morpho
const morpho = await sdk.defi.getMorpho({
  token: 'USDC',
  chainId: '8453',
})
```

## Dashboard

### Get Dashboard Metrics

```typescript
const metrics = await sdk.dashboard.getMetrics({
  clientId: 'client_123',
})

console.log('Fund Stages:')
console.log(`  Available: ${metrics.fundStages.available}`)
console.log(`  Staked: ${metrics.fundStages.staked}`)
console.log(`  Total: ${metrics.fundStages.total}`)

console.log('\nRevenue:')
console.log(`  Total: ${metrics.revenue.total}`)
console.log(`  Client Share: ${metrics.revenue.clientShare}`)

console.log('\nStats:')
console.log(`  Total Users: ${metrics.stats.totalUsers}`)
console.log(`  APY: ${metrics.stats.apy}%`)

console.log('\nStrategies:')
metrics.strategies.forEach((strategy) => {
  console.log(`  ${strategy.category}: ${strategy.allocation}% (${strategy.apy}% APY)`)
})
```

## Error Handling

The SDK provides typed error classes for better error handling:

```typescript
import {
  ProxifySDK,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
} from '@proxify/b2b-sdk'

try {
  const user = await sdk.users.getById('invalid_id')
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key')
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.details)
  } else if (error instanceof NotFoundError) {
    console.error('User not found')
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded, please retry later')
  } else if (error instanceof ServerError) {
    console.error('Server error:', error.message)
  } else if (error instanceof NetworkError) {
    console.error('Network error, check connection')
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type safety:

```typescript
import type {
  Client,
  User,
  Deposit,
  Withdrawal,
  Vault,
  Currency,
  DepositStatus,
  WithdrawalMethod,
} from '@proxify/b2b-sdk'

// All types are exported and available
const currency: Currency = 'USD'
const status: DepositStatus = 'completed'
```

## Configuration Options

```typescript
const sdk = new ProxifySDK({
  // Required
  apiKey: 'your-api-key',

  // Optional
  environment: 'production', // or 'sandbox'
  baseURL: 'https://custom-api.example.com', // Override base URL
  timeout: 30000, // Request timeout in ms (default: 30000)
  maxRetries: 3, // Max retry attempts (default: 3)
})
```

## Complete Example: E-commerce Integration

```typescript
import { ProxifySDK, Currency } from '@proxify/b2b-sdk'

const sdk = new ProxifySDK({
  apiKey: process.env.PROXIFY_API_KEY!,
  environment: 'production',
})

async function handleSellerPayout(
  sellerId: string,
  amount: number,
  currency: Currency
) {
  try {
    // 1. Create or get user
    const user = await sdk.users.createOrGet({
      clientId: process.env.PROXIFY_PRODUCT_ID!,
      clientUserId: sellerId,
      email: `seller-${sellerId}@example.com`,
    })

    // 2. Create fiat deposit (seller earnings held in yield vault)
    const deposit = await sdk.deposits.createFiat({
      userId: user.id,
      amount: amount.toFixed(2),
      currency,
      tokenSymbol: 'USDC',
      clientReference: `payout-${sellerId}-${Date.now()}`,
    })

    // 3. Check user portfolio
    const portfolio = await sdk.users.getPortfolio(user.id)

    console.log(`Seller ${sellerId} portfolio:`)
    console.log(`  Total Value: ${portfolio.totalValue}`)
    console.log(`  Earning yield while funds are held!`)

    return {
      success: true,
      orderId: deposit.orderId,
      portfolio,
    }
  } catch (error) {
    console.error('Failed to process payout:', error)
    throw error
  }
}

// Usage
await handleSellerPayout('seller_123', 5000, 'USD')
```

## API Reference

For complete API documentation, visit: [https://docs.proxify.io](https://docs.proxify.io)

## Support

- GitHub: [https://github.com/proxify/b2b-sdk](https://github.com/proxify/b2b-sdk)
- Documentation: [https://docs.proxify.io](https://docs.proxify.io)
- Email: support@proxify.io

## License

MIT
