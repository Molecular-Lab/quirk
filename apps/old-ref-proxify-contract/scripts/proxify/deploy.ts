import { network } from "hardhat"
import { AUTHORITY_ADDRESSES } from "../../constant/access_control.js"

/**
 * Main deployment script for Proxify system
 *
 * Deployment order:
 * 1. ProxifyClientRegistry
 * 2. Proxify
 * 3. ProxifyController
 * 4. Configure connections
 *
 * Usage:
 *   npx hardhat run scripts/proxify/deploy.ts --network sepolia
 *   npx hardhat run scripts/proxify/deploy.ts --network hardhatMainnet
 */

const { ethers } = await network.connect({
	network: "sepolia",
})

async function main() {
	console.log("🚀 Starting Proxify System Deployment...\n")

	// Get network info
	const networkInfo = await ethers.provider.getNetwork()
	console.log("🌐 Network:", networkInfo.name)
	console.log("🔗 Chain ID:", networkInfo.chainId)
	console.log("")

	const [deployer] = await ethers.getSigners()
	console.log("Deploying contracts with account:", deployer.address)
	console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n")

	// ============================================
	// CONFIGURATION - EDIT THESE VALUES
	// ============================================
	const CONFIG = {
		// Admin multisig (Gnosis Safe 3-of-5)
		adminMultisig: AUTHORITY_ADDRESSES.ADMIN_MULTISIG,
		// Guardian cold wallet
		guardian: AUTHORITY_ADDRESSES.GUARDIAN,
		// Oracle hot wallet
		oracle: AUTHORITY_ADDRESSES.ORACLE,
	}

	console.log("📋 Configuration:")
	console.log("  Admin (Multisig):", CONFIG.adminMultisig)
	console.log("  Guardian:", CONFIG.guardian)
	console.log("  Oracle:", CONFIG.oracle)
	console.log("")

	// Validate addresses
	if (
		CONFIG.adminMultisig === AUTHORITY_ADDRESSES.ADMIN_MULTISIG ||
		CONFIG.guardian === AUTHORITY_ADDRESSES.GUARDIAN ||
		CONFIG.oracle === AUTHORITY_ADDRESSES.ORACLE
	) {
		console.log("⚠️  WARNING: Using placeholder addresses!")
		console.log("⚠️  Set ADMIN_MULTISIG, GUARDIAN_ADDRESS, ORACLE_ADDRESS in .env before mainnet deployment\n")
	}
	// ============================================
	// STEP 1: Deploy ProxifyClientRegistry
	// ============================================

	console.log("1️⃣  Deploying ProxifyClientRegistry...")
	const ProxifyClientRegistry = await ethers.getContractFactory("ProxifyClientRegistry")
	const clientRegistry = await ProxifyClientRegistry.deploy(CONFIG.adminMultisig, CONFIG.oracle)
	await clientRegistry.waitForDeployment()
	const clientRegistryAddress = await clientRegistry.getAddress()
	console.log("✅ ProxifyClientRegistry deployed to:", clientRegistryAddress)
	console.log("")

	// ============================================
	// STEP 2: Deploy Proxify (temporary controller address)
	// ============================================
	console.log("2️⃣  Deploying Proxify...")
	const ProxifyFactory = await ethers.getContractFactory("Proxify")
	// Deploy with deployer as temporary controller (will be updated to ProxifyController)
	const proxify = await ProxifyFactory.deploy(
		deployer.address, // Temporary controller
		clientRegistryAddress,
	)
	await proxify.waitForDeployment()
	const proxifyAddress = await proxify.getAddress()
	console.log("✅ Proxify deployed to:", proxifyAddress)
	console.log("   (Temporary controller: deployer)")
	console.log("")

	// ============================================
	// STEP 3: Deploy ProxifyController
	// ============================================
	console.log("3️⃣  Deploying ProxifyController...")
	const ProxifyController = await ethers.getContractFactory("ProxifyController")
	const controller = await ProxifyController.deploy(
		proxifyAddress,
		clientRegistryAddress,
		CONFIG.adminMultisig,
		CONFIG.guardian,
		CONFIG.oracle
	)
	await controller.waitForDeployment()
	const controllerAddress = await controller.getAddress()
	console.log("✅ ProxifyController deployed to:", controllerAddress)
	console.log("")

	// ============================================
	// STEP 4: Configure Proxify to use ProxifyController
	// ============================================
	console.log("4️⃣  Configuring Proxify to use ProxifyController...")
	const setControllerTx = await proxify.setController(controllerAddress)
	await setControllerTx.wait()
	console.log("✅ Proxify controller updated to:", controllerAddress)
	console.log("")

	// ============================================
	// DEPLOYMENT SUMMARY
	// ============================================
	console.log("═══════════════════════════════════════════════════════")
	console.log("🎉 DEPLOYMENT COMPLETE!")
	console.log("═══════════════════════════════════════════════════════")
	console.log("")
	console.log("📝 Contract Addresses:")
	console.log("──────────────────────────────────────────────────────")
	console.log("ProxifyClientRegistry:", clientRegistryAddress)
	console.log("Proxify:              ", proxifyAddress)
	console.log("ProxifyController:    ", controllerAddress)
	console.log("")
	console.log("🔑 Access Control:")
	console.log("──────────────────────────────────────────────────────")
	console.log("Admin (Multisig):", CONFIG.adminMultisig)
	console.log("Guardian:       ", CONFIG.guardian)
	console.log("Oracle:         ", CONFIG.oracle)
	console.log("")
	console.log("📋 Next Steps:")
	console.log("──────────────────────────────────────────────────────")
	console.log("1. Verify contracts on block explorer")
	console.log("2. Add supported tokens (USDC, USDT, DAI)")
	console.log("3. Whitelist protocols (Aave, Compound, etc.)")
	console.log("4. Register first client with risk tiers")
	console.log("5. Initialize tiers for supported tokens")
	console.log("")
	console.log("💾 Save these addresses to your .env file:")
	console.log("──────────────────────────────────────────────────────")
	console.log(`PROXIFY_CLIENT_REGISTRY_ADDRESS=${clientRegistryAddress}`)
	console.log(`PROXIFY_ADDRESS=${proxifyAddress}`)
	console.log(`PROXIFY_CONTROLLER_ADDRESS=${controllerAddress}`)
	console.log("")

	// Save deployment info to file
	const deploymentInfo = {
		network: networkInfo.name,
		chainId: Number(networkInfo.chainId),
		deployer: deployer.address,
		timestamp: new Date().toISOString(),
		contracts: {
			ProxifyClientRegistry: clientRegistryAddress,
			Proxify: proxifyAddress,
			ProxifyController: controllerAddress,
		},
		config: CONFIG,
	}

	const fs = await import("fs")
	const deploymentPath = `./deployments/${networkInfo.name}-${Date.now()}.json`
	fs.mkdirSync("./deployments", { recursive: true })
	fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))
	console.log("💾 Deployment info saved to:", deploymentPath)
	console.log("")
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Deployment failed:", error)
		process.exit(1)
	})
