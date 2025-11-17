// import { network } from "hardhat";
// import { STABLECOINS, TESTNET_STABLECOINS } from "../../constant/stablecoins.js";
// import { SUPPORTED_PROTOCOLS, TESTNET_PROTOCOLS } from "../../constant/supported_protocol.js";

// /**
//  * Setup script - Configure deployed contracts
//  *
//  * Run after deploy.ts to:
//  * 1. Add supported tokens (USDC, USDT, DAI)
//  * 2. Whitelist DeFi protocols (Aave, Compound)
//  * 3. Register initial clients
//  *
//  * Usage:
//  *   npx hardhat run scripts/laac/setup.ts --network sepolia
//  *   npx hardhat run scripts/laac/setup.ts --network hardhatMainnet
//  */

// // Network configuration - specify which network to use
// const NETWORK_NAME = process.env.NETWORK || "hardhatMainnet"; // Options: "hardhatMainnet", "hardhatOp", "sepolia"

// const { ethers } = await network.connect({
//   network: "sepolia",
// });

// async function main() {
//   console.log("⚙️  Starting LAAC System Setup...\n");

//   // Get network info
//   const networkInfo = await ethers.provider.getNetwork();
//   console.log("🌐 Network:", networkInfo.name);
//   console.log("🔗 Chain ID:", networkInfo.chainId);
//   console.log("");

//   const [signer] = await ethers.getSigners();
//   console.log("Running setup with account:", signer.address);
//   console.log("");

//   // ============================================
//   // CONFIGURATION - EDIT THESE VALUES
//   // ============================================

//   const DEFAULT_TOKENS = {
//     USDC: STABLECOINS.USDC,
//     USDT: STABLECOINS.USDT,
//     DAI: STABLECOINS.DAI,
//   } as const;

//   const DEFAULT_PROTOCOLS = {
//     AaveLendingPool: SUPPORTED_PROTOCOLS.AAVE_POOL,
//     CompoundUSDC: SUPPORTED_PROTOCOLS.COMPOUND_USDC,
//   } as const;

//   const TESTNET_TOKEN_OVERRIDES = {
//     SEPOLIA_USDC: TESTNET_STABLECOINS.SEPOLIA_USDC,
//   } as const;

//   const TESTNET_PROTOCOL_OVERRIDES = {
//     SepoliaAavePool: TESTNET_PROTOCOLS.SEPOLIA_AAVE_POOL,
//   } as const;

//   const ADDRESSES = {
//     // Deployed contract addresses (from deploy.ts output)
//     clientRegistry: process.env.CLIENT_REGISTRY_ADDRESS || "",
//     laac: process.env.LAAC_ADDRESS || "",
//     controller: process.env.LAAC_CONTROLLER_ADDRESS || "",

//     // Token addresses (defaults sourced from constants)
//     tokens: {
//       ...DEFAULT_TOKENS,
//       ...(NETWORK_NAME === "sepolia" ? TESTNET_TOKEN_OVERRIDES : {}),
//     },

//     // Protocol addresses (defaults sourced from constants)
//     protocols: {
//       ...DEFAULT_PROTOCOLS,
//       ...(NETWORK_NAME === "sepolia" ? TESTNET_PROTOCOL_OVERRIDES : {}),
//     },

//     // Initial clients to register
//     clients: [
//       {
//         name: "LAAC_CLIENT_0001",
//         id: ethers.keccak256(ethers.toUtf8Bytes("laac_client_0001")),
//         address: "0x0000000000000000000000000000000000000001",
//       },
//     ],
//   };

//   if (!ADDRESSES.clientRegistry || !ADDRESSES.laac || !ADDRESSES.controller) {
//     throw new Error("Missing contract addresses. Set CLIENT_REGISTRY_ADDRESS, LAAC_ADDRESS, LAAC_CONTROLLER_ADDRESS in .env");
//   }

//   console.log("📋 Contract Addresses:");
//   console.log("  ClientRegistry:", ADDRESSES.clientRegistry);
//   console.log("  LAAC:", ADDRESSES.laac);
//   console.log("  LAACController:", ADDRESSES.controller);
//   console.log("");

//   // Get contract instances
//   const controller = await ethers.getContractAt("LAACController", ADDRESSES.controller);
//   const clientRegistry = await ethers.getContractAt("ClientRegistry", ADDRESSES.clientRegistry);

//   // ============================================
//   // STEP 1: Add Supported Tokens
//   // ============================================

//   console.log("1️⃣  Adding supported tokens...");

//   for (const [symbol, address] of Object.entries(ADDRESSES.tokens)) {
//     try {
//       const isSupported = await controller.isTokenSupported(address);
//       if (isSupported) {
//         console.log(`   ⏭️  ${symbol} already supported`);
//         continue;
//       }

//       console.log(`   Adding ${symbol} (${address})...`);
//       const tx = await controller.addSupportedToken(address);
//       await tx.wait();
//       console.log(`   ✅ ${symbol} added`);
//     } catch (error: any) {
//       console.log(`   ❌ Failed to add ${symbol}:`, error.message);
//     }
//   }
//   console.log("");

//   // ============================================
//   // STEP 2: Whitelist Protocols
//   // ============================================

//   console.log("2️⃣  Whitelisting DeFi protocols...");

//   for (const [name, address] of Object.entries(ADDRESSES.protocols)) {
//     try {
//       const isWhitelisted = await controller.isProtocolWhitelisted(address);
//       if (isWhitelisted) {
//         console.log(`   ⏭️  ${name} already whitelisted`);
//         continue;
//       }

//       console.log(`   Whitelisting ${name} (${address})...`);
//       const tx = await controller.addWhitelistedProtocol(address);
//       await tx.wait();
//       console.log(`   ✅ ${name} whitelisted`);
//     } catch (error: any) {
//       console.log(`   ❌ Failed to whitelist ${name}:`, error.message);
//     }
//   }
//   console.log("");

//   // ============================================
//   // STEP 3: Register Initial Clients
//   // ============================================

//   console.log("3️⃣  Registering initial clients...");

//   for (const client of ADDRESSES.clients) {
//     try {
//       const isRegistered = await clientRegistry.isClientRegistered(client.id);
//       if (isRegistered) {
//         console.log(`   ⏭️  ${client.name} already registered`);
//         continue;
//       }

//       console.log(`   Registering ${client.name}...`);
//       console.log(`     Fee address: ${client.address}`);
//       const tx = await clientRegistry.registerClient(client.id, client.address, client.name);
//       await tx.wait();
//       console.log(`   ✅ ${client.name} registered (ID: ${client.id})`);
//     } catch (error: any) {
//       console.log(`   ❌ Failed to register ${client.name}:`, error.message);
//     }
//   }
//   console.log("");

//   // ============================================
//   // STEP 4: Verify Setup
//   // ============================================

//   console.log("4️⃣  Verifying setup...");

//   // Check supported tokens
//   console.log("   Supported tokens:");
//   for (const [symbol, address] of Object.entries(ADDRESSES.tokens)) {
//     const isSupported = await controller.isTokenSupported(address);
//     console.log(`     ${symbol}: ${isSupported ? "✅" : "❌"}`);
//   }
//   console.log("");

//   // Check whitelisted protocols
//   console.log("   Whitelisted protocols:");
//   for (const [name, address] of Object.entries(ADDRESSES.protocols)) {
//     const isWhitelisted = await controller.isProtocolWhitelisted(address);
//     console.log(`     ${name}: ${isWhitelisted ? "✅" : "❌"}`);
//   }
//   console.log("");

//   // Check registered clients
//   console.log("   Registered clients:");
//   for (const client of ADDRESSES.clients) {
//     const isRegistered = await clientRegistry.isClientRegistered(client.id);
//     const isActive = isRegistered ? await clientRegistry.isClientActive(client.id) : false;
//     console.log(`     ${client.name}: ${isRegistered ? "✅ Registered" : "❌ Not registered"} ${isActive ? "(Active)" : ""}`);
//   }
//   console.log("");

//   // Check rate limits
//   console.log("   Rate limits:");
//   const maxSingle = await controller.getMaxSingleTransfer();
//   const dailyLimit = await controller.getDailyTransferLimit();
//   const remaining = await controller.getRemainingDailyLimit();
//   console.log(`     Max single transfer: $${ethers.formatUnits(maxSingle, 6)} USDC`);
//   console.log(`     Daily limit: $${ethers.formatUnits(dailyLimit, 6)} USDC`);
//   console.log(`     Remaining today: $${ethers.formatUnits(remaining, 6)} USDC`);
//   console.log("");

//   // ============================================
//   // SETUP SUMMARY
//   // ============================================

//   console.log("═══════════════════════════════════════════════════════");
//   console.log("🎉 SETUP COMPLETE!");
//   console.log("═══════════════════════════════════════════════════════");
//   console.log("");
//   console.log("📋 System is ready for:");
//   console.log("  ✅ User deposits (via registered clients)");
//   console.log("  ✅ Oracle fund allocation (to whitelisted protocols)");
//   console.log("  ✅ Yield tracking (vault index updates)");
//   console.log("");
//   console.log("⚠️  Remember:");
//   console.log("  - Admin functions require multisig approval");
//   console.log("  - Oracle must monitor buffer and execute allocations");
//   console.log("  - Run security audit before mainnet launch");
//   console.log("");
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("❌ Setup failed:", error);
//     process.exit(1);
//   });
