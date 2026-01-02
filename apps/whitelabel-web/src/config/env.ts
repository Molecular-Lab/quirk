/**
 * Environment Configuration
 *
 * Loads and validates environment variables using Zod.
 * All environment variables are prefixed with VITE_ for Vite to expose them to the client.
 */

import { z } from "zod"

/**
 * Environment Schema
 * Defines the structure and validation rules for all environment variables
 */
const envSchema = z.object({
	// Privy Authentication
	PRIVY_APP_ID: z.string().min(1, "VITE_PRIVY_APP_ID is required"),

	// API Endpoints (Optional - defaults to localhost for development)
	API_URL: z.string().url().optional().default("http://localhost:8080"),
	API_FEED_URL: z.string().url().optional(),
	USER_API_URL: z.string().url().optional(),
	WS_URL: z.string().url().optional(),
	CDN_URL: z.string().url().optional(),

	// Feature Flags
	ENABLE_MIXPANEL: z
		.string()
		.optional()
		.transform((val) => val === "true")
		.default("false"),
	MIXPANEL_TOKEN: z.string().optional(),
	MIXPANEL_DEBUG: z
		.string()
		.optional()
		.transform((val) => val === "true")
		.default("false"),

	// Blockchain Configuration
	SOLANA_RPC_ENDPOINT: z.string().url().optional(),

	// Proxy Endpoints
	OKX_PROXY_ENDPOINT: z.string().url().optional(),
})

/**
 * Parse and validate environment variables
 */
const parseEnv = () => {
	const rawEnv = {
		PRIVY_APP_ID: import.meta.env.PRIVY_APP_ID,
		API_URL: import.meta.env.VITE_API_URL,
		API_FEED_URL: import.meta.env.VITE_API_FEED_URL,
		USER_API_URL: import.meta.env.VITE_USER_API_URL,
		WS_URL: import.meta.env.VITE_WS_URL,
		CDN_URL: import.meta.env.VITE_CDN_URL,
		ENABLE_MIXPANEL: import.meta.env.VITE_ENABLE_MIXPANEL,
		MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN,
		MIXPANEL_DEBUG: import.meta.env.VITE_MIXPANEL_DEBUG,
		SOLANA_RPC_ENDPOINT: import.meta.env.VITE_SOLANA_RPC_ENDPOINT,
		OKX_PROXY_ENDPOINT: import.meta.env.VITE_OKX_PROXY_ENDPOINT,
	}

	try {
		return envSchema.parse(rawEnv)
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("❌ Environment validation failed:")
			console.error(error.errors)
			throw new Error(`Invalid environment variables: ${error.errors.map((e) => e.message).join(", ")}`)
		}
		throw error
	}
}

/**
 * Validated and typed environment variables
 *
 * @example
 * import { ENV } from './environment'
 *
 * const appId = ENV.PRIVY_APP_ID
 * const apiUrl = ENV.API_URL
 */
export const ENV = parseEnv()

/**
 * Helper to check if we're in development mode
 */
export const isDev = import.meta.env.DEV

/**
 * Helper to check if we're in production mode
 */
export const isProd = import.meta.env.PROD

/**
 * Type-safe environment variables
 */
export type Environment = z.infer<typeof envSchema>
