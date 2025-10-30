import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
	// Server
	PORT: z.string().default('3001'),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	// Blockchain
	DEFAULT_CHAIN_ID: z.string().default('11155111'),

	// RPC URLs
	RPC_URL_SEPOLIA: z.string(),
	RPC_URL_MAINNET: z.string().optional(),
	RPC_URL_OPTIMISM: z.string().optional(),
	RPC_URL_ARBITRUM: z.string().optional(),
	RPC_URL_BASE: z.string().optional(),
	RPC_URL_POLYGON: z.string().optional(),

	// Safe
	SAFE_SIGNER_PRIVATE_KEY_1: z.string().optional(), // These might not be needed in client, but keeping for consistency for now
	SAFE_SIGNER_PRIVATE_KEY_2: z.string().optional(),
	SAFE_ADDRESS_SEPOLIA: z.string().optional(),
	SAFE_ADDRESS_MAINNET: z.string().optional(),

	// Proxify Contracts
	PROXIFY_ADDRESS_SEPOLIA: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_SEPOLIA: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_SEPOLIA: z.string().optional(),

	PROXIFY_ADDRESS_MAINNET: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_MAINNET: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_MAINNET: z.string().optional(),

	// Integration
	GO_API_URL: z.string().optional(),
	API_SECRET_KEY: z.string().optional(),
})

export type ENV_TYPE = z.infer<typeof envSchema>

export const ENV = envSchema.parse(process.env)
