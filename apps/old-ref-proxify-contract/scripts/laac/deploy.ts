import { network } from "hardhat"
import { AUTHORITY_ADDRESSES } from "../../constant/access_control.js"

/**
 * Main deployment script for proxify system
 *
 * Deployment order:
 * 1. ClientRegistry
 * 2. proxify
 * 3. proxifyController
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
	console.log("🚀 Starting proxify System Deployment...\n")

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
	// STEP 1: Deploy ClientRegistry
	// ============================================

	console.log("1️⃣  Deploying ClientRegistry...")
	const ClientRegistry = await ethers.getContractFactory("ClientRegistry")
	const clientRegistry = await ClientRegistry.deploy(CONFIG.adminMultisig, CONFIG.oracle)
	await clientRegistry.waitForDeployment()
	const clientRegistryAddress = await clientRegistry.getAddress()
	console.log("✅ ClientRegistry deployed to:", clientRegistryAddress)
	console.log("")

	// ============================================
	// STEP 2: Deploy proxify (temporary controller address)
	// ============================================

	console.log("2️⃣  Deploying proxify...")
	const proxify = await ethers.getContractFactory("proxify")

	// Deploy with deployer as temporary controller (will be updated to proxifyController)
	const proxify = await proxify.deploy(
		deployer.address, // Temporary controller
		clientRegistryAddress,
	)
	await proxify.waitForDeployment()
	const proxifyAddress = await proxify.getAddress()
	console.log("✅ proxify deployed to:", proxifyAddress)
	console.log("   (Temporary controller: deployer)")
	console.log("")

	// ============================================
	// STEP 3: Deploy proxifyController
	// ============================================

	console.log("3️⃣  Deploying proxifyController...")
	const proxifyController = await ethers.getContractFactory("proxifyController")
	const controller = await proxifyController.deploy(proxifyAddress, CONFIG.adminMultisig, CONFIG.guardian, CONFIG.oracle)
	await controller.waitForDeployment()
	const controllerAddress = await controller.getAddress()
	console.log("✅ proxifyController deployed to:", controllerAddress)
	console.log("")

	// ============================================
	// STEP 4: Configure proxify to use proxifyController
	// ============================================

	console.log("4️⃣  Configuring proxify to use proxifyController...")
	const setControllerTx = await proxify.setController(controllerAddress)
	await setControllerTx.wait()
	console.log("✅ proxify controller updated to:", controllerAddress)
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
	console.log("ClientRegistry: ", clientRegistryAddress)
	console.log("proxify:          ", proxifyAddress)
	console.log("proxifyController:", controllerAddress)
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
	console.log("4. Register first client")
	console.log("")
	console.log("💾 Save these addresses to your .env file:")
	console.log("──────────────────────────────────────────────────────")
	console.log(`CLIENT_REGISTRY_ADDRESS=${clientRegistryAddress}`)
	console.log(`proxify_ADDRESS=${proxifyAddress}`)
	console.log(`proxify_CONTROLLER_ADDRESS=${controllerAddress}`)
	console.log("")

	// Save deployment info to file
	const deploymentInfo = {
		network: networkInfo.name,
		chainId: Number(networkInfo.chainId),
		deployer: deployer.address,
		timestamp: new Date().toISOString(),
		contracts: {
			ClientRegistry: clientRegistryAddress,
			proxify: proxifyAddress,
			proxifyController: controllerAddress,
		},
		config: CONFIG,
	}

	const fs = await import("fs")
	const deploymentPath = `./deployments/${deploymentInfo.network}-${Date.now()}.json`
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
