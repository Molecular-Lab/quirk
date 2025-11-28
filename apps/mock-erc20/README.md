# MockUSDC - Mintable Test Token

Mintable USDC token for testing on-ramp flows and custodial wallet transfers.

> **Built with Hardhat v3 + Viem** 🚀

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your keys

# 3. Compile contracts
pnpm compile

# 4. Deploy to testnet
pnpm deploy:sepolia

# 5. Mint tokens
pnpm mint --network sepolia
```

## Features

✅ **Ownable** - Only deployer can mint
✅ **6 decimals** - Matches real USDC
✅ **Unlimited mint** - For testing purposes
✅ **Viem + Hardhat v3** - Modern stack

## Environment Variables

Required in `.env`:
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_deployer_private_key
MOCK_USDC_ADDRESS=deployed_contract_address
CUSTODIAL_WALLET=client_privy_wallet_address
AMOUNT=1000
```

⚠️ **Never commit `.env` to git!**

## Scripts

- `pnpm compile` - Compile contracts
- `pnpm deploy:sepolia` - Deploy to Sepolia
- `pnpm deploy:base-sepolia` - Deploy to Base Sepolia
- `pnpm mint --network sepolia` - Mint tokens
- `pnpm verify:sepolia` - Verify on Etherscan

## Documentation

See [MINT_GUIDE.md](./MINT_GUIDE.md) for complete documentation.

## Smart Contracts

- **MockUSDC.sol** - Mintable USDC (ERC20 + Ownable) ✅
- **USDQ.sol** - Fixed supply token (archived) ❌

## Integration with Backend

Simulates RampToCustodial transfer flow:

1. **Backend completes deposits** via `/api/v1/deposits/batch-complete`
2. **Logs transfer details**:
   ```
   🏦 RAMP TO CUSTODIAL - Mock USDC Transfer
   📤 Transferring 10343.74 USDC
   📍 To: 0x1234...abcd (custodial wallet)
   ```
3. **Run mint script** to transfer tokens on testnet
4. **Custodial wallet receives USDC** on-chain

## Networks Supported

- **Sepolia** (Chain ID: 11155111)
- **Base Sepolia** (Chain ID: 84532)
- **Localhost** (Chain ID: 31337)

## Technology Stack

- Hardhat v3 (EDR runner)
- Viem (TypeScript Ethereum library)
- OpenZeppelin Contracts
- Solidity 0.8.28
- dotenv

## Example Usage

```bash
# Deploy MockUSDC
pnpm deploy:sepolia

# Output:
# ✅ MockUSDC deployed to: 0x5678...efgh
# 💾 Save this address to your .env:
# MOCK_USDC_ADDRESS="0x5678...efgh"

# Update .env with deployed address
echo 'MOCK_USDC_ADDRESS="0x5678...efgh"' >> .env

# Mint 1000 USDC to custodial wallet
AMOUNT=1000 pnpm mint --network sepolia

# Output:
# 🏦 RAMP TO CUSTODIAL - Minting MockUSDC (Viem)
# ✅ Successfully minted USDC to custodial wallet!
```

## License

MIT
