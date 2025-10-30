import { network } from "hardhat"

/**
 * Impersonate Admin for Testing
 *
 * This script allows you to impersonate the admin multisig address
 * to execute admin functions in local/fork testing.
 *
 * Usage:
 *   npx hardhat run scripts/laac/impersonate-admin.ts --network sepolia
 *
 * Note: Only works on local networks or hardhat fork mode
 */

const { ethers } = await network.connect({
  network: "sepolia",
})

async function main() {
  console.log("🎭 Impersonating Admin...\n")

  // Contract addresses (update these with your deployed addresses)
  const LAAC_CONTROLLER_ADDRESS = process.env.LAAC_CONTROLLER_ADDRESS || ""
  const ADMIN_MULTISIG = "0x2aD3c10a33D671c2d15104aFCE18D9AFb6b4950C"

  if (!LAAC_CONTROLLER_ADDRESS) {
    throw new Error("Set LAAC_CONTROLLER_ADDRESS in .env")
  }

  console.log("LAACController:", LAAC_CONTROLLER_ADDRESS)
  console.log("Admin Multisig:", ADMIN_MULTISIG)
  console.log("")

  // Impersonate the multisig
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [ADMIN_MULTISIG],
  })

  // Fund the multisig with ETH for gas
  const [deployer] = await ethers.getSigners()
  await deployer.sendTransaction({
    to: ADMIN_MULTISIG,
    value: ethers.parseEther("1.0"), // Send 1 ETH for gas
  })

  // Get signer for the multisig
  const adminSigner = await ethers.getSigner(ADMIN_MULTISIG)
  console.log("✅ Impersonated:", adminSigner.address)
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(ADMIN_MULTISIG)), "ETH")
  console.log("")

  // Get controller contract
  const controller = await ethers.getContractAt("LAACController", LAAC_CONTROLLER_ADDRESS, adminSigner)

  // ============================================
  // Example: Add USDC as supported token
  // ============================================

  console.log("📝 Adding USDC as supported token...")

  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia USDC

  const tx = await controller.addSupportedToken(USDC_ADDRESS)
  console.log("  Transaction sent:", tx.hash)

  const receipt = await tx.wait()
  console.log("  ✅ Confirmed in block:", receipt?.blockNumber)
  console.log("")

  // Verify
  const isSupported = await controller.isTokenSupported(USDC_ADDRESS)
  console.log("USDC supported:", isSupported)
  console.log("")

  // Stop impersonating
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [ADMIN_MULTISIG],
  })

  console.log("✅ Done!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error)
    process.exit(1)
  })
