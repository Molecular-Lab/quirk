import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from the contract-executor root directory (two levels up from config/)
config({ path: resolve(__dirname, '../../.env') })

const envSchema = z.object({
	// Server
	PORT: z.string().default('3001'),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	// Blockchain
	DEFAULT_CHAIN_ID: z.string().optional(),

	// RPC URLs
	RPC_URL_SEPOLIA: z.string().optional(),
	RPC_URL_MAINNET: z.string().optional(),
	RPC_URL_OPTIMISM: z.string().optional(),
	RPC_URL_ARBITRUM: z.string().optional(),
	RPC_URL_BASE: z.string().optional(),
	RPC_URL_POLYGON: z.string().optional(),

	// Safe
	SAFE_SIGNER_PRIVATE_KEY_1: z.string(),
	SAFE_SIGNER_PRIVATE_KEY_2: z.string(),
	SAFE_ADDRESS_SEPOLIA: z.string().optional(),
	SAFE_ADDRESS_MAINNET: z.string().optional(),
	SAFE_ADDRESS_OPTIMISM: z.string().optional(),
	SAFE_ADDRESS_ARBITRUM: z.string().optional(),
	SAFE_ADDRESS_BASE: z.string().optional(),
	SAFE_ADDRESS_POLYGON: z.string().optional(),

	// proxify Contracts
	PROXIFY_ADDRESS_SEPOLIA: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_SEPOLIA: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_SEPOLIA: z.string().optional(),

	PROXIFY_ADDRESS_MAINNET: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_MAINNET: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_MAINNET: z.string().optional(),

	PROXIFY_ADDRESS_OPTIMISM: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_OPTIMISM: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_OPTIMISM: z.string().optional(),

	PROXIFY_ADDRESS_ARBITRUM: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_ARBITRUM: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_ARBITRUM: z.string().optional(),

	PROXIFY_ADDRESS_BASE: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_BASE: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_BASE: z.string().optional(),

	PROXIFY_ADDRESS_POLYGON: z.string().optional(),
	PROXIFY_CONTROLLER_ADDRESS_POLYGON: z.string().optional(),
	PROXIFY_CLIENT_REGISTRY_ADDRESS_POLYGON: z.string().optional(),

	// Integration
	GO_API_URL: z.string().optional(),
	API_SECRET_KEY: z.string().optional(),
})

export type ENV_TYPE = z.infer<typeof envSchema>

export const ENV = envSchema.parse(process.env)
