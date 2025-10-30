# Deployment Scripts

Ethers.js deployment scripts for the LAAC system.

## Prerequisites

1. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

2. Required environment variables:
- `DEPLOYER_PRIVATE_KEY` - Private key for deployment
- `ADMIN_MULTISIG` - Gnosis Safe address (3-of-5 multisig)
- `GUARDIAN_ADDRESS` - Cold wallet for emergency pause
- `ORACLE_ADDRESS` - Hot wallet for automated operations
- `MAINNET_RPC_URL` or `SEPOLIA_RPC_URL` - RPC endpoint
- `ETHERSCAN_API_KEY` - For contract verification

## Deployment Flow

### 1. Deploy Contracts

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

This will:
- Deploy ClientRegistry
- Deploy LAAC
- Deploy LAACController
- Configure connections
- Save deployment info to `./deployments/`

**Output:**
```
ClientRegistry:  0x...
LAAC:           0x...
LAACController: 0x...
```

Copy these addresses to your `.env` file:
```bash
CLIENT_REGISTRY_ADDRESS=0x...
LAAC_ADDRESS=0x...
LAAC_CONTROLLER_ADDRESS=0x...
```

### 2. Setup System

```bash
npx hardhat run scripts/setup.ts --network sepolia
```

This will:
- Add supported tokens (USDC, USDT, DAI)
- Whitelist DeFi protocols (Aave, Compound)
- Register initial clients
- Verify setup

### 3. Verify Contracts

```bash
npx hardhat run scripts/verify.ts --network sepolia
```

This will verify all contracts on Etherscan.

## Network-Specific Deployment

### Sepolia Testnet

```bash
# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Setup
npx hardhat run scripts/setup.ts --network sepolia

# Verify
npx hardhat run scripts/verify.ts --network sepolia
```

### Mainnet

```bash
# Deploy
npx hardhat run scripts/deploy.ts --network mainnet

# Setup (BE CAREFUL - requires admin approval via Gnosis Safe)
npx hardhat run scripts/setup.ts --network mainnet

# Verify
npx hardhat run scripts/verify.ts --network mainnet
```

## Post-Deployment Checklist

### Immediately After Deployment

- [ ] Save contract addresses to `.env`
- [ ] Verify contracts on block explorer
- [ ] Transfer ownership to Gnosis Safe (if not already)
- [ ] Test deposit/withdraw flow with small amounts

### Before Production Launch

- [ ] Complete security audit ($50k minimum)
- [ ] Set up bug bounty program (Immunefi)
- [ ] Purchase insurance coverage (Nexus Mutual)
- [ ] Configure monitoring/alerts (Datadog, PagerDuty)
- [ ] Test emergency pause procedure
- [ ] Document incident response plan

### Client Onboarding

1. **Register Client:**
```typescript
// As oracle
await clientRegistry.registerClient(
  ethers.keccak256(ethers.toUtf8Bytes("client-name")),
  "Client Display Name"
);
```

2. **Client Integration:**
- Provide client with API documentation
- Share contract addresses and ABIs
- Help integrate deposit/withdraw flows
- Set up monitoring dashboard

3. **Go Live:**
- Start with TVL cap ($100k)
- Monitor for 1 week
- Gradually increase cap
- Add client to production

## Emergency Procedures

### Emergency Pause

If exploit detected:

```typescript
// As guardian (cold wallet)
await controller.emergencyPause();
```

### Unpause After Resolution

```typescript
// As admin (requires 3-of-5 multisig approval via Gnosis Safe)
await controller.unpause();
```

### Add New Protocol (Admin Function)

```typescript
// Via Gnosis Safe
await controller.addWhitelistedProtocol(protocolAddress);
```

## Troubleshooting

### "Insufficient funds" error
- Check deployer wallet has enough ETH for gas
- Sepolia: Get ETH from faucet (https://sepoliafaucet.com/)

### "Already verified" error
- Contract already verified on Etherscan
- Check block explorer for verified source code

### "Invalid multisig address"
- Ensure ADMIN_MULTISIG is a valid Gnosis Safe address
- Test on testnet first

### "Transaction reverted"
- Check you're using correct network
- Verify constructor arguments
- Check gas limits

## Gas Estimates

Deployment costs (approximate on mainnet):

| Contract | Gas Used | Cost @ 30 gwei |
|----------|----------|----------------|
| ClientRegistry | ~1.5M | ~$70 |
| LAAC | ~3.0M | ~$140 |
| LAACController | ~2.5M | ~$115 |
| **Total** | **~7M** | **~$325** |

Setup costs:

| Operation | Gas Used | Cost @ 30 gwei |
|-----------|----------|----------------|
| Add token | ~80k | ~$4 |
| Whitelist protocol | ~60k | ~$3 |
| Register client | ~100k | ~$5 |

## Support

- Documentation: See `/ARCHITECTURE.md`
- Issues: GitHub Issues
- Security: security@defai.protocol
