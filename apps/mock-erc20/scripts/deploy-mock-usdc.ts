import { network, artifacts } from 'hardhat'
import { formatEther, formatUnits, getContract, type Hex } from 'viem'

/**
 * @title Deploy USDQ (Hardhat v3 + Viem)
 *
 * Usage:
 *   npx hardhat run scripts/deploy-mock-usdc.ts --network sepolia
 *   npx hardhat run scripts/deploy-mock-usdc.ts --network baseSepolia
 */

// Static deployment parameters for USDQ
const USDQ_CONFIG = {
  name: 'USDQ',
  symbol: 'USDQ',
  decimals: 6, // Note: decimals is not a constructor param, just for reference
}

async function main() {
  console.log('=== Deploying USDQ (Viem) ===\n')

  // Load USDQ artifact
  const usdqArtifact = await artifacts.readArtifact('USDQ')

  // Connect to network and get clients (Hardhat v3 pattern)
  // Network is determined by --network flag, no need to pass it explicitly
  const { viem } = await network.connect()

  const [deployer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  console.log('Deploying with account:', deployer.account.address)

  const balance = await publicClient.getBalance({ address: deployer.account.address })
  console.log('Account balance:', formatEther(balance), 'ETH')

  // Deploy USDQ using Viem
  console.log('\n⏳ Deploying USDQ...')
  console.log('Parameters:')
  console.log('  Hardcoded in contract:')
  console.log('    - Name: "Mock USD Quirk Coin"')
  console.log('    - Symbol: "USDC"')
  console.log('    - Decimals: 6')
  console.log('    - Initial supply: 1,000,000 USDC (minted to deployer)')

  const hash = await deployer.deployContract({
    abi: usdqArtifact.abi,
    bytecode: usdqArtifact.bytecode as Hex,
    args: [], // USDQ constructor only takes name and symbol
  })

  console.log('\n📝 Deployment transaction hash:', hash)
  console.log('⏳ Waiting for confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  const contractAddress = receipt.contractAddress!

  console.log('✅ USDQ deployed to:', contractAddress)
  console.log('📦 Block number:', receipt.blockNumber)

  // Get contract instance
  const usdq = getContract({
    address: contractAddress,
    abi: usdqArtifact.abi,
    client: { public: publicClient, wallet: deployer },
  })

  // Get contract info (USDQ has owner() from Ownable)
  const [name, symbol, decimals, totalSupply, deployerBalance, owner] = await Promise.all([
    usdq.read.name(),
    usdq.read.symbol(),
    usdq.read.decimals(),
    usdq.read.totalSupply(),
    usdq.read.balanceOf([deployer.account.address]),
    usdq.read.owner(),
  ])

  console.log('\n📝 Contract Info:')
  console.log('Name:', name)
  console.log('Symbol:', symbol)
  console.log('Decimals:', decimals)
  console.log('Total Supply:', formatUnits(totalSupply, 6), 'USDQ')
  console.log('')
  console.log('Deployer USDQ balance:', formatUnits(deployerBalance, 6), 'USDQ')

  console.log('\n🎯 To verify on Etherscan:')
  console.log(`npx hardhat verify --network <NETWORK_NAME> ${contractAddress}`)
  console.log('Replace <NETWORK_NAME> with: sepolia, baseSepolia, etc.')
  console.log('\nNote: USDQ has no constructor arguments (name/symbol/decimals are hardcoded)')

  console.log('\n💾 Save this address to your .env:')
  console.log(`USDQ_ADDRESS="${contractAddress}"`)
}

main().catch((error) => {
  console.error('\n=== DEPLOYMENT FAILED ===')
  console.error(error)
  process.exitCode = 1
})
