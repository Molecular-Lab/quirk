# @proxify/mock-token-client

MockUSDC/USDQ client for reading token stats and minting tokens.

Follows the `old-ref-contract-executor-client` pattern with separate read/write clients.

## Installation

```bash
pnpm add @proxify/mock-token-client
```

## Quick Start

```typescript
import { MockTokenViemClient, MockUSDCClient } from '@proxify/mock-token-client'

// 1. Initialize with minter private key (one time setup)
MockTokenViemClient.init('0x...' as `0x${string}`)

// 2. Create client
const mockUSDC = new MockUSDCClient(
  '11155111', // Sepolia
  '0x390518374c84c3abca46e9da0f9f0e6c5aee10e0' // USDQ address
)

// 3. Read token info
const info = await mockUSDC.read.getTokenInfo()
console.log(info)
// {
//   name: 'Mock USD Quirk Coin',
//   symbol: 'USDC',
//   decimals: 6,
//   totalSupply: 1000000000000n,
//   owner: '0x...',
//   contractAddress: '0x390518374c84c3abca46e9da0f9f0e6c5aee10e0',
//   chainId: '11155111'
// }

// 4. Get balance
const balance = await mockUSDC.read.balanceOf('0x742d35Cc...')
console.log(balance) // 1000000000n (1000 USDC with 6 decimals)

// 5. Mint tokens
const result = await mockUSDC.write.mintToCustodial(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '1000' // Amount in USDC
)

if (result.success) {
  console.log('✅ Minted!')
  console.log('TX:', result.txHash)
  console.log('Block:', result.blockNumber)
}
```

## API Reference

### MockTokenViemClient

Static client manager for viem instances.

#### `init(privateKey: Hex)`

Initialize with minter private key (must be contract owner).

```typescript
MockTokenViemClient.init('0x...')
```

#### `getPublicClient(chainId)`

Get public client for reading data.

#### `getWalletClient(chainId)`

Get wallet client for writing transactions.

### MockUSDCClient

Main client with read/write separation.

```typescript
const client = new MockUSDCClient(chainId, contractAddress)
```

### Read Methods (`client.read.*`)

#### `name(): Promise<string>`

Get token name.

#### `symbol(): Promise<string>`

Get token symbol.

#### `decimals(): Promise<number>`

Get token decimals (always 6 for USDC).

#### `totalSupply(): Promise<bigint>`

Get total supply.

#### `owner(): Promise<Address>`

Get contract owner address.

#### `balanceOf(account: Address): Promise<bigint>`

Get balance of an address (in base units).

#### `getTokenInfo()`

Get all token info at once.

```typescript
const info = await client.read.getTokenInfo()
// { name, symbol, decimals, totalSupply, owner, contractAddress, chainId }
```

#### `getBalanceFormatted(account: Address)`

Get balance with formatted value.

```typescript
const balance = await client.read.getBalanceFormatted('0x...')
// { raw: 1000000000n, formatted: 1000, decimals: 6 }
```

### Write Methods (`client.write.*`)

#### `mint(to: Address, amount: string): Promise<MintResult>`

Mint tokens to an address.

```typescript
const result = await client.write.mint('0x...', '1000')
```

#### `mintToCustodial(custodialWallet: Address, amount: string): Promise<MintResult>`

Alias for `mint()` with more descriptive naming.

#### `burn(amount: string): Promise<MintResult>`

Burn tokens from the caller.

### Types

```typescript
interface MintResult {
  success: boolean
  txHash?: Hex
  blockNumber?: bigint
  amountMinted?: string
  error?: string
}
```

## Supported Chains

- **Sepolia**: `11155111`
- **Base Sepolia**: `84532`

## Environment Variables

```bash
# Optional RPC URLs (uses default public RPCs if not set)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Example: Integration with B2B API

```typescript
import { MockTokenViemClient, MockUSDCClient } from '@proxify/mock-token-client'

// In server initialization
const privateKey = process.env.DEPLOYER_PRIVATE_KEY
if (!privateKey) throw new Error('DEPLOYER_PRIVATE_KEY required')

MockTokenViemClient.init(privateKey as `0x${string}`)

// In deposit completion flow
const mockUSDC = new MockUSDCClient('11155111', process.env.MOCK_USDC_ADDRESS!)

const result = await mockUSDC.write.mintToCustodial(
  custodialWallet,
  totalUSDC.toFixed(2)
)

if (!result.success) {
  throw new Error(`Mint failed: ${result.error}`)
}

console.log('Minted:', result.amountMinted, 'USDC')
console.log('TX:', result.txHash)
```

## Architecture

```
@proxify/mock-token-client/
├── src/
│   ├── config/
│   │   ├── chain.ts              # Chain configurations
│   │   └── viem-client.ts        # Viem client manager
│   └── client/
│       ├── abi.ts                # MockUSDC ABI
│       ├── mock-usdc-read.client.ts   # Read operations
│       ├── mock-usdc-write.client.ts  # Write operations
│       └── index.ts              # Combined client
```

## License

MIT
