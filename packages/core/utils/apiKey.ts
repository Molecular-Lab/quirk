/**
 * API Key Utilities
 * Following Stripe's pattern for production-grade API keys
 */

import { randomBytes } from "crypto"

import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

/**
 * Generate a new API key
 * Format: pk_{environment}_{random32chars} (Stripe-style)
 *
 * Examples:
 *   pk_live_7a9f3e2b1c4d8f6e5a0b9c8d7e6f5a4b  (Production)
 *   pk_test_1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f  (Sandbox)
 *
 * @param isSandbox - Whether this is a sandbox/test key
 * @returns Secure API key (shown only once!)
 */
export function generateApiKey(isSandbox = false): string {
	const env = isSandbox ? "test" : "live"
	const random = randomBytes(16).toString("hex") // 32 hex chars
	return `pk_${env}_${random}`
}

/**
 * Hash API key for secure storage
 * Uses bcrypt with configurable salt rounds (default: 10)
 *
 * @param apiKey - Plain text API key
 * @returns Bcrypt hash (safe to store in database)
 */
export async function hashApiKey(apiKey: string): Promise<string> {
	return await bcrypt.hash(apiKey, SALT_ROUNDS)
}

/**
 * Verify API key against stored hash
 * Constant-time comparison via bcrypt
 *
 * @param apiKey - Plain text API key from request
 * @param hash - Stored bcrypt hash
 * @returns True if key matches hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(apiKey, hash)
}

/**
 * Extract API key prefix for fast database lookup
 * Prefix is first 16 characters (pk + environment + first 8 hex chars)
 * This ensures uniqueness per product (~4 billion combinations)
 *
 * Examples:
 *   pk_live_7a9f3e2b (Production)
 *   pk_test_1c2d3e4f (Sandbox)
 *
 * @param apiKey - Full API key
 * @returns First 16 characters (e.g., "pk_live_8ad2f1c3")
 */
export function extractPrefix(apiKey: string): string {
	return apiKey.substring(0, 16)
}

/**
 * Validate API key format
 * Must match: pk_{live|test}_{32 hex chars}
 *
 * @param apiKey - API key to validate
 * @returns True if format is valid
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
	const pattern = /^pk_(live|test)_[a-f0-9]{32}$/
	return pattern.test(apiKey)
}
