import { network } from "hardhat"

/**
 * Test Setup Script for Local Development
 *
 * This script sets up the LAAC system for local testing by:
 * 1. Using deployer as admin (instead of multisig)
 * 2. Adding test tokens (USDC, USDT)
 * 3. Whitelisting test protocols
 *
 * Usage:
 *   npx hardhat run scripts/laac/test-setup.ts --network sepolia
 */

const { ethers } = await network.connect({
  network: "sepolia",
})

async function main() {
  console.log("🧪 Starting Test Setup...\n")

  const [deployer] = await ethers.getSigners()
  console.log("Deployer:", deployer.address)
  console.log("")

  // ============================================
  // STEP 1: Deploy with Deployer as Admin
  // ============================================

  console.log("1️⃣  Deploying ClientRegistry...")
  const ClientRegistry = await ethers.getContractFactory("ClientRegistry")
  const clientRegistry = await ClientRegistry.deploy(
    deployer.address, // Admin = deployer for testing
    deployer.address  // Oracle = deployer for testing
  )
  await clientRegistry.waitForDeployment()
  const clientRegistryAddress = await clientRegistry.getAddress()
  console.log("✅ ClientRegistry deployed:", clientRegistryAddress)
  console.log("")

  console.log("2️⃣  Deploying LAAC...")
  const LAAC = await ethers.getContractFactory("LAAC")
  const laac = await LAAC.deploy(
    deployer.address, // Temporary controller
    clientRegistryAddress,
  )
  await laac.waitForDeployment()
  const laacAddress = await laac.getAddress()
  console.log("✅ LAAC deployed:", laacAddress)
  console.log("")

  console.log("3️⃣  Deploying LAACController...")
  const LAACController = await ethers.getContractFactory("LAACController")
  const controller = await LAACController.deploy(
    laacAddress,
    deployer.address, // Admin = deployer for testing
    deployer.address, // Guardian = deployer for testing
    deployer.address  // Oracle = deployer for testing
  )
  await controller.waitForDeployment()
  const controllerAddress = await controller.getAddress()
  console.log("✅ LAACController deployed:", controllerAddress)
  console.log("")

  console.log("4️⃣  Setting controller...")
  const setControllerTx = await laac.setController(controllerAddress)
  await setControllerTx.wait()
  console.log("✅ Controller set")
  console.log("")

  // ============================================
  // STEP 2: Add Test Tokens
  // ============================================

  console.log("5️⃣  Adding supported tokens...")

  // Mock USDC address (you need to deploy mock tokens or use real testnet addresses)
  const MOCK_USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia USDC
  const MOCK_USDT = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0" // Sepolia USDT

  console.log("  Adding USDC:", MOCK_USDC)
  const addUsdcTx = await controller.addSupportedToken(MOCK_USDC)
  await addUsdcTx.wait()
  console.log("  ✅ USDC added")

  console.log("  Adding USDT:", MOCK_USDT)
  const addUsdtTx = await controller.addSupportedToken(MOCK_USDT)
  await addUsdtTx.wait()
  console.log("  ✅ USDT added")
  console.log("")

  // ============================================
  // STEP 3: Whitelist Test Protocols
  // ============================================

  console.log("6️⃣  Whitelisting protocols...")

  // Sepolia Aave V3 Pool (example)
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" // Sepolia Aave V3

  console.log("  Adding Aave:", AAVE_POOL)
  const whitelistTx = await controller.addWhitelistedProtocol(AAVE_POOL)
  await whitelistTx.wait()
  console.log("  ✅ Aave whitelisted")
  console.log("")

  // ============================================
  // STEP 4: Register Test Client
  // ============================================

  console.log("7️⃣  Registering test client...")

  const TEST_CLIENT_ID = ethers.keccak256(ethers.toUtf8Bytes("test-client"))
  const TEST_CLIENT_ADDRESS = deployer.address

  const registerTx = await clientRegistry.registerClient(
    TEST_CLIENT_ID,
    TEST_CLIENT_ADDRESS,
    "Test Client"
  )
  await registerTx.wait()
  console.log("  ✅ Test client registered")
  console.log("     Client ID:", TEST_CLIENT_ID)
  console.log("")

  // ============================================
  // SUMMARY
  // ============================================

  console.log("═══════════════════════════════════════════════════════")
  console.log("🎉 TEST SETUP COMPLETE!")
  console.log("═══════════════════════════════════════════════════════")
  console.log("")
  console.log("📝 Contract Addresses:")
  console.log("──────────────────────────────────────────────────────")
  console.log("ClientRegistry: ", clientRegistryAddress)
  console.log("LAAC:          ", laacAddress)
  console.log("LAACController:", controllerAddress)
  console.log("")
  console.log("🪙 Supported Tokens:")
  console.log("──────────────────────────────────────────────────────")
  console.log("USDC:", MOCK_USDC)
  console.log("USDT:", MOCK_USDT)
  console.log("")
  console.log("🏦 Whitelisted Protocols:")
  console.log("──────────────────────────────────────────────────────")
  console.log("Aave V3:", AAVE_POOL)
  console.log("")
  console.log("👥 Test Client:")
  console.log("──────────────────────────────────────────────────────")
  console.log("Client ID:", TEST_CLIENT_ID)
  console.log("Client Address:", TEST_CLIENT_ADDRESS)
  console.log("")
  console.log("🔑 All Roles (Admin/Guardian/Oracle):", deployer.address)
  console.log("")
  console.log("✅ You can now test deposits/withdrawals!")
  console.log("")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test setup failed:", error)
    process.exit(1)
  })
