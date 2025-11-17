/**
 * Environment Configuration for Proxify B2B Client
 */

import { z } from 'zod'
import * as dotenv from 'dotenv'

// Load .env file
dotenv.config()

/**
 * Environment schema validation
 */
const envSchema = z.object({
	// API Configuration
	PROXIFY_API_KEY: z.string().min(1, 'PROXIFY_API_KEY is required'),
	PROXIFY_PRODUCT_ID: z.string().min(1, 'PROXIFY_PRODUCT_ID is required'),
	PROXIFY_ENVIRONMENT: z
		.enum(['production', 'staging', 'development'])
		.default('development'),
	PROXIFY_BASE_URL: z.string().url().optional(),

	// Webhook Configuration
	PROXIFY_WEBHOOK_SECRET: z.string().optional(),
})

/**
 * Validate and parse environment variables
 */
function parseEnv() {
	try {
		return envSchema.parse(process.env)
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('❌ Environment validation failed:')
			error.errors.forEach((err) => {
				console.error(`  - ${err.path.join('.')}: ${err.message}`)
			})
			throw new Error('Invalid environment configuration')
		}
		throw error
	}
}

/**
 * Validated environment variables
 */
export const ENV = parseEnv()

/**
 * Environment type
 */
export type ENV_TYPE = z.infer<typeof envSchema>

/**
 * Get base URL by environment
 */
export function getBaseURL(): string {
	if (ENV.PROXIFY_BASE_URL) {
		return ENV.PROXIFY_BASE_URL
	}

	switch (ENV.PROXIFY_ENVIRONMENT) {
		case 'production':
			return 'https://api.proxify.finance/v1'
		case 'staging':
			return 'https://api-staging.proxify.finance/v1'
		case 'development':
			return 'http://localhost:8080/api/v1'
		default:
			return 'http://localhost:8080/api/v1'
	}
}

/**
 * Check if environment is production
 */
export const isProduction = ENV.PROXIFY_ENVIRONMENT === 'production'

/**
 * Check if environment is staging
 */
export const isStaging = ENV.PROXIFY_ENVIRONMENT === 'staging'

/**
 * Check if environment is development
 */
export const isDevelopment = ENV.PROXIFY_ENVIRONMENT === 'development'
