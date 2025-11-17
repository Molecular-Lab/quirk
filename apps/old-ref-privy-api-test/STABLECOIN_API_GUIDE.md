# Stablecoin-Focused Wallet API

## Overview
**Phase 1 Focus**: Native ETH + Stablecoins (USDT & USDC)

This API provides custodial wallet operations specifically focused on:
- ✅ **Native ETH** transfers and balance queries
- ✅ **USDT** (Tether USD) - 6 decimals
- ✅ **USDC** (USD Coin) - 6 decimals

All other ERC20 tokens are **explicitly rejected** with clear error messages.

## Supported Networks

| Network | Chain ID | USDT Address | USDC Address |
|---------|----------|--------------|--------------|
| **Ethereum Mainnet** | 1 | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| **Sepolia Testnet** | 11155111 | `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| **Polygon** | 137 | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| **BSC** | 56 | `0x55d398326f99059fF775485246999027B3197955` | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` |
| **Arbitrum** | 42161 | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| **Optimism** | 10 | `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58` | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` |
| **Base** | 8453 | `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## API Endpoints

### 1. Transfer (POST /transfer)
Universal transfer for ETH or stablecoins

**Request:**
```json
{
  "productId": "prod_abc123",
  "userId": "user_xyz789",
  "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "receiver": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "amount": "1000000",  // Raw units: 1 USDT/USDC (6 decimals) or wei for ETH
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  // USDC on Ethereum
  "chainId": 1
}
```

**Response (Stablecoin):**
```json
{
  "success": true,
  "message": "USDC transfer sent",
  "data": {
    "transactionHash": "0x...",
    "tokenType": "stablecoin",
    "token": {
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6
    },
    "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "receiver": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "amount": "1000000",
    "amountFormatted": "1.000000"
  }
}
```

**Response (Native ETH):**
```json
{
  "success": true,
  "message": "Native ETH transfer sent",
  "data": {
    "transactionHash": "0x...",
    "tokenType": "native",
    "token": "ETH",
    "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "receiver": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "amount": "0x0de0b6b3a7640000"
  }
}
```

**Error (Unsupported Token):**
```json
{
  "success": false,
  "error": "Unsupported token",
  "message": "Unsupported token. Only USDT and USDC are supported in this phase. Token: 0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

### 2. Withdraw (POST /withdraw)
Withdraw ETH or stablecoins from custodial wallet

Same request/response format as `/transfer`.

### 3. Deposit (POST /deposit)
Get deposit instructions for receiving ETH or stablecoins

**Request:**
```json
{
  "productId": "prod_abc123",
  "userId": "user_xyz789",
  "receiver": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "5000000",  // 5 USDT
  "tokenAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",  // USDT
  "chainId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit instructions",
  "data": {
    "depositAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenType": "stablecoin",
    "token": {
      "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "symbol": "USDT",
      "name": "Tether USD",
      "decimals": 6
    },
    "amount": "5000000",
    "amountFormatted": "5.000000",
    "chainId": 1,
    "instructions": "Send 5.000000 USDT to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb on Ethereum Mainnet"
  }
}
```

### 4. Get Balance (POST /balance)
Query ETH or stablecoin balance

**Request (USDC):**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  // USDC
  "chainId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenType": "stablecoin",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "chainId": 1,
    "balance": "0x000000000000000000000000000000000000000000000000000000000098968000",
    "balanceRaw": "0x98968000",
    "balanceFormatted": "2550.000000",
    "token": {
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6
    }
  }
}
```

**Request (ETH):**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chainId": 1
  // tokenAddress omitted = native ETH
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenType": "native",
    "token": "ETH",
    "tokenAddress": "0x0000000000000000000000000000000000000000",
    "chainId": 1,
    "balance": "0x0de0b6b3a7640000",
    "balanceWei": "0x0de0b6b3a7640000",
    "balanceEth": "1.000000"
  }
}
```

## Token Detection Rules

### Native ETH
Any of these values indicate native token:
- `tokenAddress` field **omitted**
- `tokenAddress: null`
- `tokenAddress: "0x0000000000000000000000000000000000000000"`
- `tokenAddress: "0x0"`
- `tokenAddress: "native"`
- `tokenAddress: "eth"`

### Stablecoins (USDT/USDC)
- Must match **exact contract address** for the specified chain
- Case-insensitive comparison
- Auto-detected by address lookup

## Amount Formatting

### USDT & USDC (6 decimals)
Both stablecoins use 6 decimal places:

| Amount | Raw Units | Formatted |
|--------|-----------|-----------|
| 1 USDT | `"1000000"` | `"1.000000"` |
| 10 USDC | `"10000000"` | `"10.000000"` |
| 0.5 USDT | `"500000"` | `"0.500000"` |
| 1000 USDC | `"1000000000"` | `"1000.000000"` |

### Native ETH (18 decimals)
- **Input**: Can be decimal string or hex
- **Output**: Hex format (wei)
- 1 ETH = `1000000000000000000` wei = `0x0de0b6b3a7640000`

## Example Use Cases

### 1. Transfer 100 USDC on Polygon

```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_abc",
    "userId": "user_123",
    "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "receiver": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "amount": "100000000",
    "tokenAddress": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    "chainId": 137
  }'
```

### 2. Withdraw 50 USDT to External Address

```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_abc",
    "userId": "user_123",
    "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "receiver": "0xExternalAddress...",
    "amount": "50000000",
    "tokenAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "chainId": 1
  }'
```

### 3. Check USDC Balance on Base

```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/balance \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "chainId": 8453
  }'
```

### 4. Transfer 0.1 ETH on Ethereum

```bash
curl -X POST http://localhost:3000/api/v1/wallet-execution/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_abc",
    "userId": "user_123",
    "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "receiver": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "amount": "100000000000000000",
    "chainId": 1
  }'
```

## Error Handling

### Unsupported Token
```json
{
  "success": false,
  "error": "Unsupported token",
  "message": "Unsupported token. Only USDT and USDC are supported in this phase. Token: 0x6B175..."
}
```

### Token Not Deployed on Chain
```json
{
  "success": false,
  "error": "Unsupported token",
  "message": "USDC is not deployed on chain 999"
}
```

### Invalid Request Format
```json
{
  "success": false,
  "error": "Invalid request",
  "message": "Validation error: sender must match pattern..."
}
```

## Implementation Details

### Stablecoin Configuration
```typescript
const SUPPORTED_STABLECOINS = {
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    addresses: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      // ... other chains
    }
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      // ... other chains
    }
  }
}
```

### Validation Flow
1. Check if `tokenAddress` is native (omitted/null/"0x0"/"eth")
2. If ERC20, lookup token in `SUPPORTED_STABLECOINS` by address + chainId
3. If not found → **Reject with error**
4. If found → Proceed with transaction using stablecoin config

### Transaction Encoding

**Native ETH:**
```typescript
{
  from: sender,
  to: receiver,
  value: hexAmount,  // ETH sent as value
  chainId
}
```

**Stablecoin:**
```typescript
{
  from: sender,
  to: tokenAddress,  // Stablecoin contract
  value: "0x0",      // No ETH sent
  data: encodeTransfer(receiver, amount),  // ERC20 transfer()
  chainId
}
```

## Security Considerations

1. ✅ **Whitelist-based**: Only USDT/USDC supported
2. ✅ **Address validation**: All addresses validated with regex
3. ✅ **Chain validation**: Token must be deployed on specified chain
4. ✅ **Amount validation**: Non-empty, valid numeric format
5. ✅ **User authorization**: ProductId + UserId required for all operations
6. ⏳ **Privy Controls API**: Required for production transaction signing

## Future Phases

**Phase 2**: Additional stablecoins (DAI, BUSD)  
**Phase 3**: Major tokens (WBTC, LINK, UNI)  
**Phase 4**: Dynamic token registry

## Notes

- All stablecoin operations return `balanceFormatted` with proper decimal handling
- Token metadata (name, symbol, decimals) fetched from hardcoded config (not on-chain)
- Native ETH operations use on-chain `eth_getBalance` RPC call
- Transaction history tracked automatically via transaction service layer
