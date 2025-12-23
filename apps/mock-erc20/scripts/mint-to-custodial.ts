import { network, artifacts } from 'hardhat'
import { Address, formatUnits, parseUnits, getContract } from 'viem'
import { getMockUSDCAddress } from '@quirk/core/constants'

/**
 * @title Mint MockUSDC to Custodial Wallet (Hardhat v3 + Viem)
 * @notice Simulates the RampToCustodial transfer
 *
 * Usage:
 *   CUSTODIAL_WALLET="0x..." AMOUNT="1000" \
 *   npx hardhat run scripts/mint-to-custodial.ts --network sepolia
 *
 * Environment Variables (.env):
 *   CUSTODIAL_WALLET  - Client's Privy custodial wallet address
 *   AMOUNT            - Amount of USDC to mint (e.g., "1000.50")
 *
 * Note: MOCK_USDC_ADDRESS is now imported from @quirk/core/constants
 */

async function main() {
  // Configuration
  const MOCK_USDC_ADDRESS = getMockUSDCAddress(11155111) // Sepolia chain ID
  const CUSTODIAL_WALLET = process.env.CUSTODIAL_WALLET as Address | undefined
  const AMOUNT_USDC = process.env.AMOUNT || '1000' // Default 1000 USDC

  if (!CUSTODIAL_WALLET) {
    throw new Error('CUSTODIAL_WALLET environment variable is required')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏦 RAMP TO CUSTODIAL - Minting MockUSDC (Viem)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Load MockUSDC artifact
  const mockUSDCArtifact = await artifacts.readArtifact('MockUSDC')

  // Connect to network and get clients (Hardhat v3 pattern)
  // Network is determined by --network flag, no need to pass it explicitly
  const { viem } = await network.connect()

  const [deployer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  console.log('🔑 Signer:', deployer.account.address)

  // Get MockUSDC contract instance
  const mockUSDC = getContract({
    address: MOCK_USDC_ADDRESS,
    abi: mockUSDCArtifact.abi,
    client: { public: publicClient, wallet: deployer },
  })

  // Verify signer is owner
  const owner = await mockUSDC.read.owner()
  if (owner !== deployer.account.address) {
    throw new Error(
      `Signer ${deployer.account.address} is not the contract owner ${owner}`
    )
  }

  // Parse amount (USDC has 6 decimals)
  const amountInBaseUnits = parseUnits(AMOUNT_USDC, 6)

  console.log('📍 To:', CUSTODIAL_WALLET)
  console.log('💰 Amount:', AMOUNT_USDC, 'USDC')
  console.log('🔢 Base units:', amountInBaseUnits.toString())

  // Check balance before
  const balanceBefore = await mockUSDC.read.balanceOf([CUSTODIAL_WALLET])
  console.log('💼 Balance before:', formatUnits(balanceBefore, 6), 'USDC')

  // Mint tokens
  console.log('\n⏳ Minting tokens...')
  const hash = await mockUSDC.write.mint([CUSTODIAL_WALLET, amountInBaseUnits])
  console.log('📝 Transaction hash:', hash)

  console.log('⏳ Waiting for confirmation...')
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

  // Check balance after
  const balanceAfter = await mockUSDC.read.balanceOf([CUSTODIAL_WALLET])
  console.log('💼 Balance after:', formatUnits(balanceAfter, 6), 'USDC')
  console.log('➕ Minted:', formatUnits(balanceAfter - balanceBefore, 6), 'USDC')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Successfully minted USDC to custodial wallet!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch((error) => {
  console.error('\n=== MINT FAILED ===')
  console.error(error)
  process.exitCode = 1
})
