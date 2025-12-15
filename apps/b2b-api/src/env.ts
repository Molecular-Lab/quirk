/**
 * Environment Configuration for B2B API
 *
 * Network Configuration:
 * - Supports Ethereum Mainnet and Sepolia Testnet
 * - RPC URLs must be provided via environment variables
 * - Active network determined by NODE_ENV (dev = Sepolia, prod = Mainnet)
 */

import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().default("3001"),
	DATABASE_URL: z.string(),
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
	DEPLOYER_PRIVATE_KEY: z.string().optional(),
	PRIVATE_KEY: z.string().optional(),
<<<<<<< HEAD
	// Blockchain configuration
	CHAIN_ID: z.string().default("8453"), // Base Mainnet
	RPC_URL: z.string().default("https://mainnet.base.org"),
	BASE_SEPOLIA_RPC_URL: z.string().default("https://sepolia.base.org"),
=======

	// Network RPC URLs (required for production, optional for development)
	MAINNET_RPC_URL: z.string().optional(),
	SEPOLIA_RPC_URL: z.string().optional(),

	// Legacy blockchain configuration (deprecated, kept for backward compatibility)
	/** @deprecated Use MAINNET_RPC_URL or SEPOLIA_RPC_URL instead */
	CHAIN_ID: z.string().optional(),
	/** @deprecated Use MAINNET_RPC_URL or SEPOLIA_RPC_URL instead */
	RPC_URL: z.string().optional(),
	/** @deprecated Network configs now in NETWORK_CONFIG */
	BASE_SEPOLIA_RPC_URL: z.string().optional(),
>>>>>>> 6dc6c487eb4c129dde42dd707d485eaad46b57ce
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	process.exit(1);
}

// Validate that required RPC URLs are set based on NODE_ENV
const nodeEnv = parsedEnv.data.NODE_ENV;
const rpcValidation: string[] = [];

if (nodeEnv === "production" && !parsedEnv.data.MAINNET_RPC_URL) {
	rpcValidation.push("MAINNET_RPC_URL is required in production");
}

if (nodeEnv === "development" && !parsedEnv.data.SEPOLIA_RPC_URL && !parsedEnv.data.RPC_URL) {
	rpcValidation.push("SEPOLIA_RPC_URL is required in development (or legacy RPC_URL)");
}

if (rpcValidation.length > 0) {
	console.error("❌ Network configuration errors:");
	rpcValidation.forEach((error) => console.error(`  - ${error}`));
	console.error("\n💡 Tip: Set these environment variables in your .env file");
	process.exit(1);
}

export const ENV = {
	...parsedEnv.data,
	PORT: parseInt(parsedEnv.data.PORT, 10),
	// Legacy support: Use old CHAIN_ID if provided, otherwise default based on NODE_ENV
	CHAIN_ID: parsedEnv.data.CHAIN_ID
		? parseInt(parsedEnv.data.CHAIN_ID, 10)
		: nodeEnv === "production"
			? 1 // Ethereum Mainnet
			: 11155111, // Sepolia Testnet
};
