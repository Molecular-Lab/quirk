# MockToken Setup Guide

Guide for setting up MockUSDC/USDQ minting in the deposit flow.

## 🎯 Overview

The deposit completion flow now mints MockUSDC tokens to client custodial wallets using the `MockTokenClient`.

**Flow:** Deposit Created → Deposit Completed → **Mint MockUSDC to Custodial Wallet** → Update Vaults

## 📝 Environment Variables Setup

### Where to Set `.env`

Environment variables should be set in **`/apps/b2b-api/.env`** (the backend API server).

```bash
# Create .env file (if not exists)
cd /Users/wtshai/Work/Protocolcamp/proxify/apps/b2b-api
cp .env.example .env
```

### Required Variables

Edit `/apps/b2b-api/.env`:

```bash
# Blockchain Configuration
CHAIN_ID=11155111  # Sepolia testnet (or 84532 for Base Sepolia)

# NOTE: MOCK_USDC_ADDRESS is now imported from @proxify/core/constants
# The address is defined in: packages/core/constants/addresses.ts
# Current Sepolia address: 0x1d02848c34ed2155613dd5cd26ce20a601b9a489

# MockToken Private Key (REQUIRED for minting)
# This is the owner/deployer of the MockUSDC contract
MOCK_TOKEN_PRIVATE_KEY=0x1234...your_private_key_here

# Fallback (if MOCK_TOKEN_PRIVATE_KEY not set)
DEPLOYER_PRIVATE_KEY=0x1234...your_private_key_here
```

## 🔑 Getting Your Private Key

### Option 1: From Hardhat Deployment

If you deployed MockUSDC using Hardhat:

```bash
# In mock-erc20 app
cd /Users/wtshai/Work/Protocolcamp/proxify/apps/mock-erc20

# Check hardhat.config.ts for the account used
# The first account in the accounts array is usually the deployer
cat hardhat.config.ts
```

Look for:
```typescript
accounts: [process.env.PRIVATE_KEY || 'your_hardhat_default_key']
```

### Option 2: From MetaMask/Wallet

1. Open MetaMask
2. Click account menu → Account Details → Export Private Key
3. Copy the private key (starts with `0x`)

⚠️ **Security Warning:** Never share or commit this key!

### Option 3: Use Hardhat Default Account

If you deployed with Hardhat's default test accounts:

```bash
# Hardhat's first default test account
MOCK_TOKEN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

⚠️ **Only for local testing!** This key is public knowledge.

## 🚀 How It Works

### 1. Architecture

```
packages/core/
├── constants/
│   ├── addresses.ts            ← MOCK_USDC_ADDRESS constants
│   ├── chain.ts
│   └── index.ts
├── client/
│   ├── mock-token.client.ts    ← MockToken client
│   ├── index.ts
│   └── README.md
└── usecase/
    └── b2b/
        └── deposit.usecase.ts   ← Uses MockTokenClient
```

### 2. Deposit Flow (Step 1.5)

In `deposit.router.ts:batchCompleteDeposits()`:

```typescript
import { getMockUSDCAddress } from '@proxify/core/constants';

// Get chain ID and MOCK_USDC address from constants
const chainId = Number(process.env.CHAIN_ID || "11155111"); // Default: Sepolia
const mockUSDCAddress = getMockUSDCAddress(chainId as 11155111);

// Mint tokens to custodial wallet
const mintResult = await depositService.mintTokensToCustodial(
  chainId.toString(),
  mockUSDCAddress,
  custodialWallet,
  totalUSDC.toString()
);

if (!mintResult.success) {
  throw new Error('Mint failed');
}
```

### 3. What Happens

1. User deposits fiat (e.g., $1000 USD)
2. Gateway converts to USDC (1000 USDC)
3. **Deposit completion triggers:**
   - Initialize `MockTokenClient` with private key from env
   - Call `client.mintToCustodial(custodialWallet, "1000")`
   - Blockchain transaction executes: `MockUSDC.mint(custodialWallet, 1000e6)`
   - Wait for confirmation
   - Return transaction hash and block number
4. If mint succeeds → Continue with vault updates
5. If mint fails → Mark deposit as `failed` in database

## 🧪 Testing

### Manual Test

```bash
# 1. Set environment variables
cd apps/b2b-api
nano .env  # Add MOCK_TOKEN_PRIVATE_KEY

# 2. Restart b2b-api server
pnpm dev

# 3. Create a deposit
curl -X POST http://localhost:3001/deposits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "amount": "1000",
    "currency": "USD"
  }'

# 4. Complete the deposit (this triggers minting)
curl -X POST http://localhost:3001/deposits/batch-complete \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": ["DEP-123..."],
    "paidCurrency": "USD"
  }'

# 5. Check logs for mint confirmation
# You should see:
# [Deposit] 🏦 Minting tokens to custodial wallet...
# Transaction hash: 0x...
# ✅ Tokens minted successfully
```

### Verify On-Chain

Check the custodial wallet balance on Etherscan (Sepolia):

```
https://sepolia.etherscan.io/token/0x1d02848c34ed2155613dd5cd26ce20a601b9a489?a=<CUSTODIAL_WALLET_ADDRESS>
```

## 📦 MockTokenClient API

### Initialize

```typescript
import { MockTokenClient } from '@proxify/core';

const client = new MockTokenClient({
  chainId: '11155111',
  tokenAddress: '0x1d02848c34ed2155613dd5cd26ce20a601b9a489',
  privateKey: process.env.MOCK_TOKEN_PRIVATE_KEY!,
  decimals: 6,  // Optional: USDC has 6 decimals
});
```

### Mint Tokens

```typescript
const result = await client.mintToCustodial(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '1000'
);

// Result:
{
  success: true,
  txHash: '0x123...',
  blockNumber: 123456n,
  amountMinted: '1000.0'
}
```

### Check Balance

```typescript
const balance = await client.getBalance('0x742d35Cc...');
// { balance: '1000.0', balanceRaw: 1000000000n, decimals: 6 }
```

### Get Token Info

```typescript
const owner = await client.getOwner();
const symbol = await client.getSymbol();
```

## 🔒 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] `MOCK_TOKEN_PRIVATE_KEY` is set in `/apps/b2b-api/.env`
- [ ] Private key has mint permission on MockUSDC contract
- [ ] Private key is NOT committed to git
- [ ] Using testnet chains only (Sepolia, Base Sepolia)
- [ ] Production will use real USDC transfers (not minting)

## 🐛 Troubleshooting

### Error: "MOCK_TOKEN_PRIVATE_KEY not set"

**Solution:** Add to `/apps/b2b-api/.env`:
```bash
MOCK_TOKEN_PRIVATE_KEY=0x...
```

### Error: "Signer is not the contract owner"

**Solution:** The private key you're using is not the owner of the MockUSDC contract. Use the deployer's private key.

### Error: "Unsupported chain ID"

**Solution:** Only Sepolia (11155111) and Base Sepolia (84532) are supported. Update `CHAIN_ID` in `.env`.

### Error: "Transaction failed"

**Possible causes:**
- Insufficient gas
- RPC endpoint down
- Contract address wrong
- Network congestion

**Solution:** Check Sepolia Etherscan for transaction details.

## 🔄 Updating Contract Address

When you deploy a new MockUSDC contract, update the address in the constants file:

### Steps:

1. **Deploy new contract:**
   ```bash
   cd apps/mock-erc20
   pnpm run deploy:sepolia
   ```

2. **Copy the deployed address** from console output

3. **Update constants file:** Edit `/packages/core/constants/addresses.ts`
   ```typescript
   export const MOCK_USDC_ADDRESSES: Partial<Record<SupportedChainId, `0x${string}`>> = {
     // Sepolia Testnet
     11155111: '0xYOUR_NEW_ADDRESS_HERE',
     // Add other chains as needed
   }
   ```

4. **No need to restart or update .env** - The constant is imported directly

5. **Update documentation** (optional): Update `LATEST_DEPLOYMENT.md` for reference

## 📚 References

- **Contract Addresses:** `/packages/core/constants/addresses.ts` ⭐ **Main source of truth**
- **Deposit Router:** `/apps/b2b-api/src/router/deposit.router.ts`
- **Mint Script:** `/apps/mock-erc20/scripts/mint-to-custodial.ts`
- **Env Example:** `/apps/b2b-api/.env.example`

## ✅ Summary

1. **Contract Addresses** → Defined in `/packages/core/constants/addresses.ts` ⭐
2. **Environment Variables** → Set in `/apps/b2b-api/.env` (only MOCK_TOKEN_PRIVATE_KEY needed)
3. **Import Pattern** → `import { getMockUSDCAddress } from '@proxify/core/constants'`
4. **Integration** → Used in `deposit.router.ts` (batch complete deposits)
5. **Flow** → Deposit completion → Mint to custodial wallet → Update vaults

**Key Benefits:**
- ✅ Single source of truth for contract addresses
- ✅ No need to update multiple .env files
- ✅ Type-safe address imports
- ✅ Easy to add support for multiple chains

You're all set! 🎉
