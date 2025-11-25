# Wallet Portfolio Stats API

## Overview
Get comprehensive wallet portfolio information including all token balances, DeFi positions, staking data, and total portfolio value.

**Endpoint**: `GET /stats/:walletAddress/:chainId`

## Features

✅ **Native ETH Balance** - Real-time balance query  
✅ **All Stablecoins** - USDT & USDC balances on supported chains  
✅ **DeFi Positions** - Staking, lending, liquidity pools (placeholder)  
✅ **Portfolio Summary** - Total value, asset count, yield metrics  
✅ **Single Request** - All data in one API call  

## Request

### Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `walletAddress` | string | path | Wallet address (0x...) |
| `chainId` | number | path | Chain ID (1, 137, 42161, etc.) |

### Example

```bash
GET /api/v1/wallet-execution/stats/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1
```

```bash
curl -X GET http://localhost:3000/api/v1/wallet-execution/stats/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1
```

## Response

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chainId": 1,
    "timestamp": "2025-11-14T10:30:00.000Z",
    
    "balances": {
      "native": {
        "token": "ETH",
        "balance": "0x0de0b6b3a7640000",
        "balanceWei": "0x0de0b6b3a7640000",
        "balanceFormatted": "1.000000",
        "valueUSD": "0.00"
      },
      "stablecoins": [
        {
          "token": {
            "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "symbol": "USDC",
            "name": "USD Coin",
            "decimals": 6
          },
          "balance": "0x000000000000000000000000000000000000000000000000000000000098968000",
          "balanceRaw": "2550000000",
          "balanceFormatted": "2550.000000",
          "valueUSD": "2550.000000"
        },
        {
          "token": {
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "symbol": "USDT",
            "name": "Tether USD",
            "decimals": 6
          },
          "balance": "0x0000000000000000000000000000000000000000000000000000000005f5e100",
          "balanceRaw": "100000000",
          "balanceFormatted": "100.000000",
          "valueUSD": "100.000000"
        }
      ]
    },
    
    "defi": {
      "positions": [
        {
          "protocol": "Aave",
          "type": "lending",
          "token": "USDC",
          "amount": "0.00",
          "amountFormatted": "0.00",
          "valueUSD": "0.00",
          "apy": "0.00",
          "rewards": {
            "token": "AAVE",
            "amount": "0.00",
            "valueUSD": "0.00"
          },
          "status": "placeholder"
        },
        {
          "protocol": "Uniswap V3",
          "type": "liquidity_pool",
          "token": "USDC-ETH",
          "amount": "0.00",
          "amountFormatted": "0.00",
          "valueUSD": "0.00",
          "apy": "0.00",
          "fees24h": "0.00",
          "status": "placeholder"
        },
        {
          "protocol": "Lido",
          "type": "staking",
          "token": "stETH",
          "amount": "0.00",
          "amountFormatted": "0.00",
          "valueUSD": "0.00",
          "apy": "0.00",
          "rewards": {
            "token": "LDO",
            "amount": "0.00",
            "valueUSD": "0.00"
          },
          "status": "placeholder"
        }
      ],
      "totalStakedUSD": "0.00",
      "avgAPY": "0.00",
      "totalRewardsUSD": "0.00",
      "note": "DeFi positions are placeholder data. Integration with protocols pending."
    },
    
    "summary": {
      "totalBalanceUSD": "2650.00",
      "totalStakedUSD": "0.00",
      "totalYieldAPY": "0.00",
      "assetCount": 3,
      "protocolCount": 3
    }
  }
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "Invalid wallet address format"
}
```

## Response Structure

### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `data` | object | Portfolio data object |

### Data Object

| Field | Type | Description |
|-------|------|-------------|
| `walletAddress` | string | Queried wallet address |
| `chainId` | number | Chain ID |
| `timestamp` | string | ISO 8601 timestamp |
| `balances` | object | All token balances |
| `defi` | object | DeFi protocol positions |
| `summary` | object | Portfolio summary metrics |

### Balances Object

#### Native Token

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | Token symbol ("ETH") |
| `balance` | string | Raw balance (hex, wei) |
| `balanceWei` | string | Balance in wei |
| `balanceFormatted` | string | Human-readable balance |
| `valueUSD` | string | USD value (requires oracle) |

#### Stablecoins Array

Each stablecoin object contains:

| Field | Type | Description |
|-------|------|-------------|
| `token` | object | Token metadata (address, symbol, name, decimals) |
| `balance` | string | Raw balance (hex) |
| `balanceRaw` | string | Raw balance (decimal string) |
| `balanceFormatted` | string | Human-readable with decimals |
| `valueUSD` | string | USD value (1:1 for stablecoins) |

### DeFi Object

| Field | Type | Description |
|-------|------|-------------|
| `positions` | array | Array of DeFi position objects |
| `totalStakedUSD` | string | Total value staked across all protocols |
| `avgAPY` | string | Weighted average APY |
| `totalRewardsUSD` | string | Total pending rewards value |
| `note` | string | Implementation status note |

#### Position Object

| Field | Type | Description |
|-------|------|-------------|
| `protocol` | string | Protocol name (Aave, Uniswap, Lido, etc.) |
| `type` | string | Position type: "lending", "staking", "liquidity_pool" |
| `token` | string | Token symbol or pair (e.g., "USDC-ETH") |
| `amount` | string | Raw amount staked/deposited |
| `amountFormatted` | string | Human-readable amount |
| `valueUSD` | string | USD value of position |
| `apy` | string | Annual percentage yield |
| `rewards` | object | Pending rewards (token, amount, valueUSD) |
| `fees24h` | string | (Liquidity pools only) 24h fees earned |
| `status` | string | "active" or "placeholder" |

### Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `totalBalanceUSD` | string | Total wallet + stablecoin value |
| `totalStakedUSD` | string | Total value in DeFi protocols |
| `totalYieldAPY` | string | Weighted average yield |
| `assetCount` | number | Number of tokens held |
| `protocolCount` | number | Number of DeFi protocols used |

## Supported Chains

| Network | Chain ID | Stablecoins Supported |
|---------|----------|-----------------------|
| Ethereum Mainnet | 1 | USDT, USDC |
| Sepolia Testnet | 11155111 | USDT, USDC |
| Polygon | 137 | USDT, USDC |
| BSC | 56 | USDT, USDC |
| Arbitrum | 42161 | USDT, USDC |
| Optimism | 10 | USDT, USDC |
| Base | 8453 | USDT, USDC |

## Use Cases

### 1. Portfolio Dashboard
Display complete wallet overview in a single request:
- Total balance
- Asset breakdown
- DeFi positions
- Yield summary

### 2. Asset Allocation View
```typescript
const stats = await getWalletStats(address, chainId)
const assets = [
  { name: 'ETH', value: parseFloat(stats.balances.native.balanceFormatted) },
  ...stats.balances.stablecoins.map(s => ({
    name: s.token.symbol,
    value: parseFloat(s.balanceFormatted)
  }))
]
```

### 3. DeFi Position Tracking
```typescript
const activePositions = stats.defi.positions.filter(p => p.status === 'active')
const totalYield = activePositions.reduce((sum, p) => sum + parseFloat(p.apy), 0)
```

### 4. Multi-Chain Portfolio
```typescript
const chains = [1, 137, 42161] // Ethereum, Polygon, Arbitrum
const portfolios = await Promise.all(
  chains.map(chainId => getWalletStats(address, chainId))
)
const totalValue = portfolios.reduce((sum, p) => 
  sum + parseFloat(p.summary.totalBalanceUSD), 0
)
```

## Implementation Status

### ✅ Implemented (Production Ready)

- Native ETH balance query
- All stablecoin balances (USDT, USDC)
- Multi-chain support (7 networks)
- Portfolio value calculation (stablecoins only)
- Response structure and formatting

### ⏳ Placeholder (TODO)

- **DeFi Protocol Integration**
  - Aave (lending/borrowing positions)
  - Compound (lending positions)
  - Uniswap V3 (liquidity pools)
  - Lido (staked ETH)
  - Curve (stablecoin pools)
  - Yearn (vault positions)

- **Price Oracle Integration**
  - ETH/USD price feed
  - Token price feeds
  - Real-time portfolio valuation

- **Yield Calculations**
  - APY/APR for DeFi positions
  - Pending rewards tracking
  - Historical yield data

## DeFi Integration Roadmap

### Phase 1: Aave Integration
```typescript
// Get Aave lending positions
const aavePositions = await getAavePositions(walletAddress, chainId)
// Returns: deposited amount, borrowed amount, APY, health factor
```

### Phase 2: Staking Integration
```typescript
// Get Lido staked ETH
const lidoStake = await getLidoPosition(walletAddress)
// Returns: stETH balance, rewards, APY
```

### Phase 3: Liquidity Pool Integration
```typescript
// Get Uniswap V3 positions
const uniswapPositions = await getUniswapV3Positions(walletAddress, chainId)
// Returns: pool pairs, liquidity, fees earned, APY
```

### Phase 4: Yield Aggregator Integration
```typescript
// Get Yearn vault positions
const yearnPositions = await getYearnVaults(walletAddress, chainId)
// Returns: vault shares, underlying assets, APY
```

## Example Responses by Chain

### Ethereum Mainnet (1)
```bash
GET /stats/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/1
```
Returns: ETH + USDT + USDC

### Polygon (137)
```bash
GET /stats/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/137
```
Returns: MATIC + USDT (PoS) + USDC (PoS)

### Base (8453)
```bash
GET /stats/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/8453
```
Returns: ETH + USDT + USDC

## Performance Considerations

### Current Implementation
- **Single wallet query**: ~2-5 seconds
  - Native balance: 1 RPC call
  - Each stablecoin: 1 RPC call
  - Total: 1 + (# of stablecoins) RPC calls

### Optimization Strategies

1. **Batch RPC Calls**
   ```typescript
   // Use eth_batch to reduce round trips
   const batch = [
     { method: "eth_getBalance", params: [...] },
     { method: "eth_call", params: [...] }, // USDT
     { method: "eth_call", params: [...] }  // USDC
   ]
   ```

2. **Caching**
   ```typescript
   // Cache balance data with TTL
   const cached = await redis.get(`wallet:${address}:${chainId}`)
   if (cached && Date.now() - cached.timestamp < 60000) {
     return cached.data
   }
   ```

3. **Background Updates**
   ```typescript
   // Poll wallet data in background, serve from cache
   setInterval(() => refreshWalletStats(address, chainId), 30000)
   ```

## Error Handling

### Invalid Address
```json
{
  "success": false,
  "error": "Invalid wallet address format"
}
```

### Unsupported Chain
Returns empty stablecoins array if no tokens deployed on chain.

### RPC Failures
Continues with other tokens if individual RPC call fails. Failed tokens omitted from response.

## Integration Examples

### React Hook
```typescript
const useWalletStats = (address: string, chainId: number) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/v1/wallet-execution/stats/${address}/${chainId}`)
      .then(res => res.json())
      .then(data => {
        setStats(data.data)
        setLoading(false)
      })
  }, [address, chainId])

  return { stats, loading }
}
```

### Portfolio Component
```tsx
const Portfolio = ({ address, chainId }) => {
  const { stats, loading } = useWalletStats(address, chainId)

  if (loading) return <Spinner />

  return (
    <div>
      <h2>Total Balance: ${stats.summary.totalBalanceUSD}</h2>
      
      <h3>Assets</h3>
      <AssetList>
        <Asset token="ETH" balance={stats.balances.native.balanceFormatted} />
        {stats.balances.stablecoins.map(coin => (
          <Asset 
            key={coin.token.address}
            token={coin.token.symbol}
            balance={coin.balanceFormatted}
          />
        ))}
      </AssetList>

      <h3>DeFi Positions</h3>
      <PositionList>
        {stats.defi.positions
          .filter(p => p.status === 'active')
          .map(pos => (
            <Position
              key={pos.protocol}
              protocol={pos.protocol}
              type={pos.type}
              value={pos.valueUSD}
              apy={pos.apy}
            />
          ))}
      </PositionList>
    </div>
  )
}
```

## Next Steps

1. ✅ **Basic Stats Endpoint** - Implemented
2. ⏳ **Price Oracle Integration** - Get real ETH/USD price
3. ⏳ **Aave Integration** - Real lending/borrowing data
4. ⏳ **Lido Integration** - Real staked ETH data
5. ⏳ **Uniswap Integration** - Real liquidity pool data
6. ⏳ **Caching Layer** - Redis for performance
7. ⏳ **WebSocket Updates** - Real-time balance changes
8. ⏳ **Historical Data** - Portfolio value over time

## Related Documentation

- [Stablecoin API Guide](./STABLECOIN_API_GUIDE.md) - Transfer & balance operations
- [Unified API Migration](./UNIFIED_API_MIGRATION.md) - API design patterns
- [Transaction Layer](./TRANSACTION_LAYER_IMPLEMENTATION.md) - Core architecture
