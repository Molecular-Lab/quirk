/**
 * Environment Configuration for B2B API
 *
 * Network Configuration:
 * - Ethereum Sepolia (11155111): Deposits & Mock USDC minting (testnet)
 * - Base Mainnet (8453): DeFi protocols (AAVE, Compound, Morpho)
 * - RPC URLs have sensible defaults, can be overridden via environment variables
 */

import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().default("8888"),
	DATABASE_URL: z.string(),
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
	DEPLOYER_PRIVATE_KEY: z.string().optional(),
	PRIVATE_KEY: z.string().optional(),

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// DEPOSIT NETWORK (for Mock USDC minting & deposits)
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Ethereum Sepolia Testnet (Chain ID: 11155111)
	CHAIN_ID: z.string().default("11155111"),
	RPC_URL: z.string().optional(), // Use SEPOLIA_RPC_URL or Alchemy/Infura

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// DEFI NETWORK (for AAVE, Compound, Morpho protocols)
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Base Mainnet (Chain ID: 8453)
	DEFI_CHAIN_ID: z.string().default("8453"),
	DEFI_RPC_URL: z.string().default("https://mainnet.base.org"),

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// ADDITIONAL RPC URLs
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	MAINNET_RPC_URL: z.string().optional(),
	SEPOLIA_RPC_URL: z.string().optional(),

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// ORACLE ADDRESSES (for deposits & withdrawals)
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	ORACLE_SANDBOX: z.string().optional(), // Sandbox/testnet oracle custodial address
	ORACLE_PROD: z.string().optional(),    // Production/mainnet oracle custodial address
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	process.exit(1);
}

// Validate that required RPC URLs are set based on NODE_ENV
const nodeEnv = parsedEnv.data.NODE_ENV;

if (nodeEnv === "production" && !parsedEnv.data.MAINNET_RPC_URL) {
	console.error("❌ MAINNET_RPC_URL is required in production");
	console.error("💡 Tip: Set this environment variable in your .env file");
	process.exit(1);
}

export const ENV = {
	...parsedEnv.data,
	PORT: parseInt(parsedEnv.data.PORT, 10),

	// Ethereum Sepolia (11155111) for deposits & Mock USDC minting
	CHAIN_ID: parseInt(parsedEnv.data.CHAIN_ID, 10),

	// Base Mainnet (8453) for DeFi protocols (AAVE, Compound, Morpho)
	DEFI_CHAIN_ID: parseInt(parsedEnv.data.DEFI_CHAIN_ID, 10),
};
