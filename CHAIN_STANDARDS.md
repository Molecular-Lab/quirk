# Chain ID Standards

## Overview
All chain references in the system use **numeric chain IDs** (as strings), not chain names.

## Supported Chains

### Mainnet Chains

| Chain Name | Chain ID | USDC Address | USDT Address | Notes |
|------------|----------|--------------|--------------|-------|
| **Base** | `8453` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | N/A | ✅ Default chain |
| **Ethereum** | `1` | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | High gas |
| **Polygon** | `137` | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` | Low gas |
| **Optimism** | `10` | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` | `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58` | L2 |
| **Arbitrum** | `42161` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | L2 |

### Testnet Chains

| Chain Name | Chain ID | USDC Address | Notes |
|------------|----------|--------------|-------|
| **Base Sepolia** | `84532` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | For testing |
| **Sepolia** | `11155111` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Ethereum testnet |

## Usage in Code

### ✅ Correct
```typescript
// Auto-create vault with chain ID
const vault = await getOrCreateVault({
  clientId: client.id,
  chain: '8453',  // Base mainnet
  tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  tokenSymbol: 'USDC',
});

// Configure strategies with chain ID
POST /api/v1/products/{productId}/strategies
{
  "chain": "8453",
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "tokenSymbol": "USDC",
  "strategies": [...]
}
```

### ❌ Incorrect
```typescript
// Don't use chain names!
chain: 'base'      // ❌ Wrong
chain: 'ethereum'  // ❌ Wrong
chain: 'polygon'   // ❌ Wrong
```

## Database Schema

```sql
CREATE TABLE client_vaults (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  chain VARCHAR(50) NOT NULL,  -- Store as numeric string: '8453', '1', '137'
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,
  ...
);
```

## Frontend Display

When showing chain information to users, you can map chain IDs to friendly names:

```typescript
const CHAIN_NAMES: Record<string, string> = {
  '8453': 'Base',
  '1': 'Ethereum',
  '137': 'Polygon',
  '10': 'Optimism',
  '42161': 'Arbitrum',
};

// Display
const chainName = CHAIN_NAMES[vault.chain] || `Chain ${vault.chain}`;
```

## Multi-Chain Support

The system supports multiple vaults per client, each on a different chain:

```typescript
// Client can have:
// - USDC on Base (chain: 8453)
// - USDC on Polygon (chain: 137)
// - USDT on Polygon (chain: 137)

// Each vault is identified by: (client_id, chain, token_address)
```

## Migration Note

If existing data has chain names instead of IDs, run this migration:

```sql
UPDATE client_vaults SET chain = '8453' WHERE chain = 'base';
UPDATE client_vaults SET chain = '1' WHERE chain = 'ethereum';
UPDATE client_vaults SET chain = '137' WHERE chain = 'polygon';
```

## References

- [Chainlist.org](https://chainlist.org/) - Complete chain ID reference
- EIP-155: Chain ID specification
