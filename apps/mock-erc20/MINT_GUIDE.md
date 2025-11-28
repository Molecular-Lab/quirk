# MockUSDC - Mintable Test Token Guide

> **Updated for Hardhat v3 + Viem** 🚀

## Overview

**USDQ.sol** - Fixed supply token (cannot mint after deployment) ❌
**MockUSDC.sol** - Mintable token with Ownable (for testing) ✅

## MockUSDC Features

✅ **Ownable** - Only deployer can mint tokens
✅ **Mint function** - Owner can mint unlimited tokens for testing
✅ **6 decimals** - Matches real USDC
✅ **Initial supply** - 1,000,000 USDC to deployer
✅ **Viem-based** - Modern TypeScript contract interaction

## Technology Stack

- **Hardhat v3** - Development environment
- **Viem** - TypeScript Ethereum library (replaces ethers.js)
- **OpenZeppelin** - Secure contract templates
- **Solidity 0.8.28** - Smart contract language
- **dotenv** - Environment variable management

## Setup

### 1. Install Dependencies

```bash
cd apps/mock-erc20
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Deployer Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API Keys (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key

# MockUSDC Contract Address (after deployment)
MOCK_USDC_ADDRESS=

# Custodial Wallet Address (for minting)
CUSTODIAL_WALLET=

# Amount to mint (for mint script)
AMOUNT=1000
```

⚠️ **Security**: Never commit `.env` file to git!

### 3. Compile Contracts

```bash
pnpm compile
# or
npx hardhat compile
```

## Deployment

### 1. Deploy MockUSDC

```bash
# Deploy to Sepolia testnet
pnpm deploy:sepolia
# or
npx hardhat run scripts/deploy-mock-usdc.ts --network sepolia

# Deploy to Base Sepolia testnet
pnpm deploy:base-sepolia
# or
npx hardhat run scripts/deploy-mock-usdc.ts --network baseSepolia
```

**Output:**
```
=== Deploying MockUSDC (Viem) ===

Deploying with account: 0x1234...abcd
Account balance: 1.5 ETH

⏳ Deploying MockUSDC...
📝 Deployment transaction hash: 0xabcd...1234
⏳ Waiting for confirmation...
✅ MockUSDC deployed to: 0x5678...efgh
📦 Block number: 12345678

📝 Contract Info:
Name: Mock USD Coin
Symbol: USDC
Decimals: 6
Total Supply: 1000000.0 USDC

Deployer USDC balance: 1000000.0 USDC
Contract owner: 0x1234...abcd
Owner is deployer: true

💾 Save this address to your .env:
MOCK_USDC_ADDRESS="0x5678...efgh"
```

### 2. Mint Tokens to Custodial Wallet

This simulates the **RampToCustodial** transfer that happens after on-ramp completion.

**Option 1: Using .env file (Recommended)**

Add to your `.env`:
```bash
MOCK_USDC_ADDRESS=0x5678...efgh  # From deployment
CUSTODIAL_WALLET=0x9abc...def0   # Client's Privy wallet
AMOUNT=10343.74                   # Amount to mint
```

Then run:
```bash
pnpm mint --network sepolia
# or
npx hardhat run scripts/mint-to-custodial.ts --network sepolia
```

**Option 2: Using environment variables**

```bash
MOCK_USDC_ADDRESS="0x5678...efgh" \
CUSTODIAL_WALLET="0x9abc...def0" \
AMOUNT="10343.74" \
npx hardhat run scripts/mint-to-custodial.ts --network sepolia
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 RAMP TO CUSTODIAL - Minting MockUSDC (Viem)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 Signer: 0x1234...abcd
📍 To: 0x9abc...def0
💰 Amount: 10343.74 USDC
🔢 Base units: 10343740000
💼 Balance before: 0.0 USDC

⏳ Minting tokens...
📝 Transaction hash: 0xdef0...5678
⏳ Waiting for confirmation...
✅ Transaction confirmed in block: 12345679
💼 Balance after: 10343.74 USDC
➕ Minted: 10343.74 USDC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully minted USDC to custodial wallet!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Integration with Backend

The backend batch complete endpoint logs the transfer details:

```typescript
// In apps/b2b-api/src/router/deposit.router.ts
logger.info("🏦 RAMP TO CUSTODIAL - Mock USDC Transfer");
logger.info(`📤 Transferring ${totalUSDC} USDC`);
logger.info(`📍 To: ${custodialWallet}`);
```

**To actually execute the mint:**

```bash
# After batch completing deposits, run:
MOCK_USDC_ADDRESS="<deployed-address>" \
CUSTODIAL_WALLET="<client-wallet>" \
AMOUNT="<total-from-backend>" \
npx hardhat run scripts/mint-to-custodial.ts --network sepolia
```

## Contract Addresses

### Sepolia Testnet
- MockUSDC: `TBD` (deploy first)

### Base Sepolia Testnet
- MockUSDC: `TBD` (deploy first)

## Verify Contract

After deployment, verify on Etherscan:

```bash
npx hardhat verify --network sepolia <contract-address>
```

## Testing Locally

```bash
# Start local hardhat node
npx hardhat node

# In another terminal, deploy
npx hardhat run scripts/deploy-mock-usdc.ts --network localhost

# Mint tokens
MOCK_USDC_ADDRESS="<address>" \
CUSTODIAL_WALLET="<wallet>" \
AMOUNT="1000" \
npx hardhat run scripts/mint-to-custodial.ts --network localhost
```

## Smart Contract Code

### MockUSDC.sol
```solidity
contract MockUSDC is ERC20, Ownable {
    // Owner = deployer (msg.sender)
    // Only owner can mint()
    // Anyone can burn() their own tokens
}
```

### Key Functions

```solidity
// Only owner can call
function mint(address to, uint256 amount) external onlyOwner

// Anyone can burn their own tokens
function burn(uint256 amount) external

// View functions
function owner() public view returns (address)
function balanceOf(address account) public view returns (uint256)
```

## Comparison

| Feature | USDQ.sol | MockUSDC.sol |
|---------|----------|--------------|
| Ownable | ❌ No | ✅ Yes |
| Mintable | ❌ No | ✅ Yes (owner only) |
| Initial Supply | 1B tokens | 1M tokens |
| Decimals | 6 | 6 |
| Use Case | Fixed supply | Testing/Demo |

## Next Steps

1. Deploy MockUSDC to Sepolia testnet
2. Save contract address in `.env`
3. Fund deployer wallet with Sepolia ETH
4. Test minting flow with batch complete endpoint
5. Integrate with frontend to show balances
