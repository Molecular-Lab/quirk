import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
	// Privy Credentials
	PRIVY_APP_ID: z.string().min(1, 'PRIVY_APP_ID is required'),
	PRIVY_APP_SECRET: z.string().min(1, 'PRIVY_APP_SECRET is required'),
	PRIVY_API_URL: z.string().default('https://api.privy.io'),

	// Environment
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	// Supported Chains (comma-separated)
	SUPPORTED_CHAINS: z.string().default('ethereum,solana,polygon,base'),
	DEFAULT_CHAIN: z.string().default('ethereum'),

	// Integration (optional)
	GO_API_URL: z.string().optional(),
	API_SECRET_KEY: z.string().optional(),
})

export type ENV_TYPE = z.infer<typeof envSchema>

export const ENV = envSchema.parse(process.env)
