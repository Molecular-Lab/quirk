# Wallet Execution API - Usage Guide

Complete API reference for wallet operations: deposit, withdraw, ERC20 transfers, and balance queries.

---

## 🚀 Quick Start

### Base URL
```
http://localhost:3000/api/v1/wallet-execution
```

### Common Chain IDs
- Ethereum Mainnet: `1`
- Ethereum Sepolia: `11155111`
- Polygon: `137`
- Arbitrum: `42161`
- Optimism: `10`
- Base: `8453`
- BSC: `56`

---

## 📥 Deposit Native Token

**Endpoint**: `POST /deposit`

**Purpose**: Get deposit address and instructions for receiving native tokens (ETH, MATIC, etc.)

### Request
```json
POST /api/v1/wallet-execution/deposit
Content-Type: application/json

{
  "productId": "my-dapp",
  "userId": "email:user@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0x0de0b6b3a7640000",
  "chainId": 1,
  "fromAddress": "0xSenderAddress..."
}
```

### Fields
- `productId` (string): Your application ID
- `userId` (string): User identifier
- `walletAddress` (string): Custodial wallet address (0x...)
- `amount` (string): Amount in wei (hex format)
- `chainId` (number): Network chain ID
- `fromAddress` (string): External sender address

### Response
```json
{
  "success": true,
  "message": "Deposit address confirmed",
  "data": {
    "depositAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "0x0de0b6b3a7640000",
    "chainId": 1,
    "instruction": "Send 0x0de0b6b3a7640000 native tokens to 0x742d35Cc... on chain 1",
    "note": "This is a custodial wallet. Funds sent to this address are managed by Privy."
  }
}
```

### Example (1 ETH deposit)
```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "my-dapp",
    "userId": "email:alice@example.com",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "0x0de0b6b3a7640000",
    "chainId": 1,
    "fromAddress": "0x1234567890123456789012345678901234567890"
  }'
```

---

## 📤 Withdraw Native Token

**Endpoint**: `POST /withdraw`

**Purpose**: Send native tokens (ETH, MATIC, etc.) from custodial wallet to external address

### Request
```json
POST /api/v1/wallet-execution/withdraw
Content-Type: application/json

{
  "productId": "my-dapp",
  "userId": "email:user@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "toAddress": "0xRecipientAddress...",
  "amount": "0x2386f26fc10000",
  "chainId": 1,
  "gas": "0x5208",
  "maxFeePerGas": "0x3b9aca00",
  "maxPriorityFeePerGas": "0x3b9aca00"
}
```

### Fields
- `productId` (string, required): Application ID
- `userId` (string, required): User identifier
- `walletAddress` (string, required): Source wallet (custodial)
- `toAddress` (string, required): Recipient address
- `amount` (string, required): Amount in wei (hex)
- `chainId` (number, required): Network chain ID
- `gas` (string, optional): Gas limit (hex)
- `maxFeePerGas` (string, optional): Max fee per gas (hex)
- `maxPriorityFeePerGas` (string, optional): Priority fee (hex)

### Response
```json
{
  "success": true,
  "message": "Withdrawal transaction sent",
  "data": {
    "transaction": {
      "txHash": "0x123abc...",
      "chainId": 1,
      "from": "0x742d35Cc...",
      "to": "0xRecipient...",
      "value": "0x2386f26fc10000",
      "status": "pending",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "historyEntry": {
      "id": "uuid-here",
      "productId": "my-dapp",
      "userId": "email:user@example.com",
      ...
    }
  }
}
```

### Example (0.01 ETH withdrawal)
```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "my-dapp",
    "userId": "email:alice@example.com",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "toAddress": "0x9876543210987654321098765432109876543210",
    "amount": "0x2386f26fc10000",
    "chainId": 1,
    "maxFeePerGas": "0x3b9aca00",
    "maxPriorityFeePerGas": "0x3b9aca00"
  }'
```

---

## 🪙 Transfer ERC20 Token

**Endpoint**: `POST /transfer/erc20`

**Purpose**: Transfer ERC20 tokens (USDC, USDT, DAI, etc.) from custodial wallet

### Request
```json
POST /api/v1/wallet-execution/transfer/erc20
Content-Type: application/json

{
  "productId": "my-dapp",
  "userId": "email:user@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "toAddress": "0xRecipientAddress...",
  "amount": "1000000",
  "chainId": 1,
  "gas": "0xf618",
  "maxFeePerGas": "0x3b9aca00",
  "maxPriorityFeePerGas": "0x3b9aca00"
}
```

### Fields
- `productId` (string, required): Application ID
- `userId` (string, required): User identifier
- `walletAddress` (string, required): Source wallet
- `tokenAddress` (string, required): ERC20 token contract address
- `toAddress` (string, required): Recipient address
- `amount` (string, required): Raw token amount (NOT decimal adjusted)
- `chainId` (number, required): Network chain ID
- `gas` (string, optional): Gas limit
- `maxFeePerGas` (string, optional): Max fee per gas
- `maxPriorityFeePerGas` (string, optional): Priority fee

### Amount Format
**Important**: The `amount` field should be the raw token amount WITHOUT decimal places.

Examples:
- **USDC** (6 decimals): To send 1 USDC, use `"1000000"`
- **USDT** (6 decimals): To send 100 USDT, use `"100000000"`
- **DAI** (18 decimals): To send 1 DAI, use `"1000000000000000000"`
- **WETH** (18 decimals): To send 0.5 WETH, use `"500000000000000000"`

### Response
```json
{
  "success": true,
  "message": "ERC20 transfer transaction sent",
  "data": {
    "transaction": {
      "txHash": "0x456def...",
      "chainId": 1,
      "from": "0x742d35Cc...",
      "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "status": "pending",
      "timestamp": "2024-01-15T10:35:00Z"
    },
    "historyEntry": {...},
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "recipient": "0xRecipient...",
    "amount": "1000000"
  }
}
```

### Common Token Addresses (Ethereum Mainnet)
```javascript
USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
DAI:  "0x6B175474E89094C44Da98b954EedeAC495271d0F"
WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA"
UNI:  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
```

### Example (Send 10 USDC)
```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/transfer/erc20 \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "my-dapp",
    "userId": "email:alice@example.com",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "toAddress": "0x9876543210987654321098765432109876543210",
    "amount": "10000000",
    "chainId": 1
  }'
```

---

## 💰 Get Native Token Balance

**Endpoint**: `GET /balance/native/:walletAddress/:chainId`

**Purpose**: Query native token balance (ETH, MATIC, etc.)

### Request
```
GET /api/v1/wallet-execution/balance/native/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1
```

### Path Parameters
- `walletAddress`: Wallet address to query
- `chainId`: Network chain ID

### Response
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chainId": 1,
    "balance": "0x1bc16d674ec80000",
    "balanceWei": "0x1bc16d674ec80000",
    "balanceEth": "2.000000000000000000"
  }
}
```

### Example
```bash
curl http://localhost:3000/api/v1/wallet-execution/balance/native/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1
```

---

## 🎯 Get ERC20 Token Balance

**Endpoint**: `GET /balance/erc20/:walletAddress/:tokenAddress/:chainId`

**Purpose**: Query specific ERC20 token balance with metadata

### Request
```
GET /api/v1/wallet-execution/balance/erc20/0x742d35Cc.../0xA0b86991c6218.../1
```

### Path Parameters
- `walletAddress`: Wallet address to query
- `tokenAddress`: ERC20 token contract address
- `chainId`: Network chain ID

### Response
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "chainId": 1,
    "balance": "0x5f5e100",
    "balanceRaw": "0x5f5e100",
    "balanceFormatted": "100.000000",
    "token": {
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "name": "USD Coin",
      "symbol": "USDC",
      "decimals": 6
    }
  }
}
```

### Example (Check USDC balance)
```bash
curl http://localhost:3000/api/v1/wallet-execution/balance/erc20/\
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/\
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/1
```

---

## 📊 Get All Balances

**Endpoint**: `GET /balances/:walletAddress/:chainId?tokens=...`

**Purpose**: Query native balance + multiple ERC20 token balances in one call

### Request
```
GET /api/v1/wallet-execution/balances/0x742d35Cc.../1?tokens=0xA0b8...,0xdAC1...
```

### Path Parameters
- `walletAddress`: Wallet address to query
- `chainId`: Network chain ID

### Query Parameters
- `tokens` (optional): Comma-separated list of ERC20 token addresses

### Response
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chainId": 1,
    "native": {
      "balance": "0x1bc16d674ec80000",
      "balanceWei": "0x1bc16d674ec80000",
      "balanceEth": "2.000000000000000000"
    },
    "tokens": [
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "name": "USD Coin",
        "symbol": "USDC",
        "decimals": 6,
        "balance": "0x5f5e100",
        "balanceRaw": "0x5f5e100",
        "balanceFormatted": "100.000000"
      },
      {
        "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "name": "Tether USD",
        "symbol": "USDT",
        "decimals": 6,
        "balance": "0xbebc200",
        "balanceRaw": "0xbebc200",
        "balanceFormatted": "200.000000"
      }
    ]
  }
}
```

### Example (Get ETH + USDC + USDT + DAI)
```bash
curl "http://localhost:3000/api/v1/wallet-execution/balances/\
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1?\
tokens=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,\
0xdAC17F958D2ee523a2206206994597C13D831ec7,\
0x6B175474E89094C44Da98b954EedeAC495271d0F"
```

---

## 🔧 Integration Example

### Complete Workflow: Deposit → Check Balance → Withdraw

```typescript
// 1. Get deposit address
const depositInfo = await fetch('http://localhost:3000/api/v1/wallet-execution/deposit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'my-dapp',
    userId: 'email:alice@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: '0x0de0b6b3a7640000', // 1 ETH
    chainId: 1,
    fromAddress: '0xExternalWallet...'
  })
}).then(r => r.json())

console.log('Deposit to:', depositInfo.data.depositAddress)

// 2. Check balance
const balance = await fetch(
  'http://localhost:3000/api/v1/wallet-execution/balance/native/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1'
).then(r => r.json())

console.log('Balance:', balance.data.balanceEth, 'ETH')

// 3. Withdraw
const withdrawal = await fetch('http://localhost:3000/api/v1/wallet-execution/withdraw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'my-dapp',
    userId: 'email:alice@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    toAddress: '0xRecipient...',
    amount: '0x2386f26fc10000', // 0.01 ETH
    chainId: 1
  })
}).then(r => r.json())

console.log('Tx Hash:', withdrawal.data.transaction.txHash)
```

### ERC20 Token Workflow

```typescript
// 1. Check USDC balance
const usdcBalance = await fetch(
  'http://localhost:3000/api/v1/wallet-execution/balance/erc20/\
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/\
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/1'
).then(r => r.json())

console.log('USDC Balance:', usdcBalance.data.balanceFormatted, 'USDC')

// 2. Transfer 10 USDC
const transfer = await fetch('http://localhost:3000/api/v1/wallet-execution/transfer/erc20', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'my-dapp',
    userId: 'email:alice@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    toAddress: '0xRecipient...',
    amount: '10000000', // 10 USDC (6 decimals)
    chainId: 1
  })
}).then(r => r.json())

console.log('Transfer Tx:', transfer.data.transaction.txHash)
```

---

## 🚨 Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": "Invalid request",
  "message": "Invalid wallet address format"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Transaction not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Server-side transaction execution not yet implemented. Please configure Privy Controls API or session signers first. See: https://docs.privy.io/controls/overview"
}
```

### Error Handling Pattern
```typescript
try {
  const response = await fetch(endpoint, options)
  const data = await response.json()
  
  if (!data.success) {
    console.error('API Error:', data.error, data.message)
    // Handle error
  }
  
  // Success
  return data.data
} catch (error) {
  console.error('Network Error:', error)
  // Handle network/parsing error
}
```

---

## 🔐 Security Notes

1. **Custodial Wallets**: All wallets are managed by Privy. Users don't have direct access to private keys.

2. **Server-Side Execution**: Transactions are signed and sent server-side (requires Privy Controls API configuration).

3. **Amount Format**: Always use hex format for native token amounts, decimal format for ERC20 amounts.

4. **Gas Management**: Optional gas parameters allow you to control transaction costs.

5. **Chain ID Validation**: Always verify you're on the correct network before executing transactions.

---

## 📝 Notes

### Current Limitations

⚠️ **Privy SDK Integration Required**

The transaction execution endpoints will return errors until Privy Controls API is configured:

```json
{
  "error": "Server-side transaction execution not yet implemented. 
           Please configure Privy Controls API or session signers first."
}
```

**To enable full functionality**:
1. Configure Privy Controls API in Privy Dashboard
2. Set up offline transaction policies
3. Update repository implementation with policy ID

See: [TRANSACTION_LAYER_IMPLEMENTATION.md](../../../packages/core/TRANSACTION_LAYER_IMPLEMENTATION.md)

### Balance Queries

Balance query endpoints (`/balance/*`) work immediately as they use read-only RPC calls.

---

## 🎯 Next Steps

1. **Configure Privy Controls**: Enable server-side transaction execution
2. **Add Monitoring**: Track transaction status and failures
3. **Implement Webhooks**: Notify on transaction confirmations
4. **Add Rate Limiting**: Prevent API abuse
5. **Implement Nonce Management**: Handle concurrent transactions

---

**API Version**: v1  
**Last Updated**: 2024-01-15
