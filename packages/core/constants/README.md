# @proxify/core/constants

Centralized blockchain constants for the Quirk platform.

## 📚 Contents

- **addresses.ts** - Contract addresses for all supported chains
- **chain.ts** - Chain configurations and utilities
- **access_control.ts** - Access control constants

## 🎯 Usage

### Import Contract Addresses

```typescript
import { getMockUSDCAddress, MOCK_USDC_ADDRESS } from '@proxify/core/constants'

// Get address for specific chain
const sepoliaAddress = getMockUSDCAddress(11155111) // Sepolia
// Returns: '0x1d02848c34ed2155613dd5cd26ce20a601b9a489'

// Or use the default address (Sepolia)
const defaultAddress = MOCK_USDC_ADDRESS
```

### Import Chain Constants

```typescript
import { createChainConstants } from '@proxify/core/constants'

const chainConstants = createChainConstants({
  chains: {
    11155111: {
      rpcUrl: process.env.SEPOLIA_RPC_URL!,
    },
  },
  defaultChainId: 11155111,
})

const config = chainConstants.getChainConfig(11155111)
```

## 📋 Contract Addresses

### MOCK_USDC_ADDRESSES

Mock USDC token addresses for testing purposes.

| Chain | Chain ID | Address |
|-------|----------|---------|
| Sepolia | 11155111 | `0x1d02848c34ed2155613dd5cd26ce20a601b9a489` |

**Add more chains:**

```typescript
// In addresses.ts
export const MOCK_USDC_ADDRESSES: Partial<Record<SupportedChainId, `0x${string}`>> = {
  11155111: '0x1d02848c34ed2155613dd5cd26ce20a601b9a489', // Sepolia
  84532: '0x...', // Base Sepolia (add when deployed)
}
```

## 🔄 Updating Addresses

When you deploy a new contract:

1. **Deploy the contract** (e.g., using Hardhat)
2. **Update `addresses.ts`** with the new address
3. **No need to update .env files** - the constant is imported directly

Example:

```typescript
// packages/core/constants/addresses.ts
export const MOCK_USDC_ADDRESSES: Partial<Record<SupportedChainId, `0x${string}`>> = {
  11155111: '0xNEW_ADDRESS_HERE', // ← Update this
}
```

## ✅ Benefits

- **Single source of truth** - All contract addresses in one place
- **Type safety** - TypeScript ensures addresses are valid
- **Multi-chain support** - Easy to add new chains
- **No environment variables** - Addresses are code constants
- **Import anywhere** - Use in any package or app

## 📦 Exports

```typescript
// Addresses
export {
  MOCK_USDC_ADDRESSES,
  getMockUSDCAddress,
  DEFAULT_MOCK_USDC_ADDRESS,
  MOCK_USDC_ADDRESS
} from './addresses'

// Chains
export {
  createChainConstants,
  type SupportedChainId,
  type ChainConfig,
  type ChainConstants
} from './chain'

// Access Control
export { ... } from './access_control'
```

## 🔍 Examples

### B2B API Router

```typescript
import { getMockUSDCAddress } from '@proxify/core/constants'

const chainId = Number(process.env.CHAIN_ID || "11155111")
const mockUSDCAddress = getMockUSDCAddress(chainId as 11155111)

await depositService.mintTokensToCustodial(
  chainId.toString(),
  mockUSDCAddress,
  custodialWallet,
  amount
)
```

### Hardhat Script

```typescript
import { getMockUSDCAddress } from '@proxify/core/constants'

async function main() {
  const MOCK_USDC_ADDRESS = getMockUSDCAddress(11155111)
  console.log('Using MockUSDC at:', MOCK_USDC_ADDRESS)
}
```

## 📄 License

MIT
