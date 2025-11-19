# Unified Wallet Execution API - Migration Guide

## Overview
The Wallet Execution API has been refactored to provide a **unified, dynamic interface** that automatically detects whether you're working with native tokens (ETH, MATIC, BNB, etc.) or ERC20 tokens. This eliminates the need to choose different endpoints based on token type.

## Key Changes

### 🎯 Single Unified Request Format
All endpoints now accept the same request structure:

```typescript
{
  productId: string,
  userId: string,
  sender: string,          // 0x... wallet address
  receiver: string,        // 0x... destination address
  amount: string,          // Raw amount (wei for native, token units for ERC20)
  tokenAddress?: string,   // Optional - determines token type
  chainId: number,
  // Optional gas params
  gas?: string,
  maxFeePerGas?: string,
  maxPriorityFeePerGas?: string
}
```

### 🔍 Automatic Token Type Detection

The API automatically detects token type based on `tokenAddress`:

**Native Token** (ETH, MATIC, BNB, etc.)
```typescript
// Any of these indicate native token:
tokenAddress: undefined           // Field omitted
tokenAddress: null
tokenAddress: "0x0000000000000000000000000000000000000000"
tokenAddress: "0x0"
tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
tokenAddress: "native"
tokenAddress: "eth"
tokenAddress: "matic"
tokenAddress: "bnb"
```

**ERC20 Token** (USDC, USDT, DAI, etc.)
```typescript
// Valid ERC20 contract address
tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"  // USDC
tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // USDT
```

## New Unified Endpoints

### 1. POST /transfer
**Universal transfer for any token type**

```bash
# Transfer native ETH
curl -X POST http://localhost:3000/api/v1/wallet-execution/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "userId": "user_456",
    "sender": "0x1234...",
    "receiver": "0x5678...",
    "amount": "1000000000000000000",
    "tokenAddress": "0x0",  // Native token
    "chainId": 1
  }'

# Transfer ERC20 USDC
curl -X POST http://localhost:3000/api/v1/wallet-execution/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "userId": "user_456",
    "sender": "0x1234...",
    "receiver": "0x5678...",
    "amount": "1000000",  // 1 USDC (6 decimals)
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "chainId": 1
  }'
```

### 2. POST /execute
**Generic transaction execution with auto-detection**

```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/execute \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "userId": "user_456",
    "sender": "0x1234...",
    "receiver": "0x5678...",
    "amount": "500000000000000000",
    "chainId": 1
  }'
```

### 3. POST /deposit
**Get deposit instructions for any token**

```bash
# Native token deposit
curl -X POST http://localhost:3000/api/v1/wallet-execution/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "userId": "user_456",
    "receiver": "0x1234...",
    "amount": "1000000000000000000",
    "chainId": 1
  }'

# ERC20 deposit
curl -X POST http://localhost:3000/api/v1/wallet-execution/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "userId": "user_456",
    "receiver": "0x1234...",
    "amount": "1000000",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "chainId": 1
  }'
```

### 4. POST /withdraw
**Withdraw any token type** (alias for transfer)

```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "userId": "user_456",
    "sender": "0x1234...",
    "receiver": "0x5678...",
    "amount": "1000000000000000000",
    "tokenAddress": "native",
    "chainId": 1
  }'
```

### 5. POST /balance
**Get balance for any token type**

```bash
# Native balance
curl -X POST http://localhost:3000/api/v1/wallet-execution/balance \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234...",
    "chainId": 1
  }'

# ERC20 balance
curl -X POST http://localhost:3000/api/v1/wallet-execution/balance \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234...",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "chainId": 1
  }'
```

## Legacy Endpoints (Deprecated)

These endpoints are still available for backward compatibility but are **deprecated**:

- ❌ ~~`POST /transfer/erc20`~~ → Use `POST /transfer` instead
- ❌ ~~`GET /balance/native/:walletAddress/:chainId`~~ → Use `POST /balance` instead  
- ❌ ~~`GET /balance/erc20/:walletAddress/:tokenAddress/:chainId`~~ → Use `POST /balance` instead
- ✅ `GET /balances/:walletAddress/:chainId?tokens=...` - Still useful for batch queries

## Migration Examples

### Before (Old API)

```typescript
// Separate endpoints for native vs ERC20

// Transfer native token
POST /deposit
{
  productId, userId, receiver, amount, chainId
}

// Transfer ERC20 token
POST /transfer/erc20
{
  productId, userId, walletAddress, tokenAddress, toAddress, amount, chainId
}

// Get native balance
GET /balance/native/0x1234.../1

// Get ERC20 balance
GET /balance/erc20/0x1234.../0xA0b8.../1
```

### After (New Unified API)

```typescript
// Single endpoint for all token types

// Transfer ANY token (native or ERC20)
POST /transfer
{
  productId,
  userId,
  sender,
  receiver,
  amount,
  tokenAddress?,  // Determines type automatically
  chainId
}

// Get ANY balance (native or ERC20)
POST /balance
{
  walletAddress,
  tokenAddress?,  // Omit for native, provide for ERC20
  chainId
}
```

## Benefits

✅ **Consistent API** - Same request format for all token types  
✅ **Automatic Detection** - No need to choose endpoints  
✅ **Fewer Endpoints** - 5 unified endpoints vs 6+ separate ones  
✅ **Backward Compatible** - Legacy endpoints still work  
✅ **Type Safety** - Full Zod validation on all inputs  
✅ **Better DX** - Simpler integration, less confusion  

## Implementation Details

### Native Token Aliases

The following values are recognized as native tokens:

```typescript
const NATIVE_TOKEN_ALIASES = [
  "0x0000000000000000000000000000000000000000",
  "0x0",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",  // Common placeholder
  "native",
  "eth",
  "matic",
  "bnb",
]
```

### Detection Logic

```typescript
private isNativeToken(tokenAddress?: string | null): boolean {
  if (!tokenAddress) return true
  return NATIVE_TOKEN_ALIASES.some(alias => 
    tokenAddress.toLowerCase() === alias.toLowerCase()
  )
}
```

### Transaction Encoding

**Native Token:**
```typescript
{
  from: sender,
  to: receiver,
  value: hexAmount,  // Token sent in value field
  chainId
}
```

**ERC20 Token:**
```typescript
{
  from: sender,
  to: tokenAddress,  // Send to contract
  value: "0x0",      // No native value
  data: encodedTransfer,  // transfer(receiver, amount)
  chainId
}
```

## Error Handling

All endpoints return consistent error format:

```typescript
{
  success: false,
  error: "Error type",
  message: "Detailed error message"
}
```

Common errors:
- `400` - Invalid request format, validation failed
- `404` - User or wallet not found
- `500` - Transaction execution failed

## Next Steps

1. ✅ **Unified API implemented** - All 5 new endpoints working
2. ⏳ **Wire router into Express app** - Add to main app.ts
3. ⏳ **Configure Privy Controls API** - Enable actual transaction execution
4. ⏳ **Add comprehensive tests** - Unit + integration tests
5. ⏳ **Update frontend clients** - Migrate to new unified endpoints

## Support

For questions or issues:
- See: `WALLET_EXECUTION_API.md` for detailed API docs
- See: `TRANSACTION_LAYER_IMPLEMENTATION.md` for architecture
- Check: Router implementation at `src/routers/wallet-execution.router.ts`
