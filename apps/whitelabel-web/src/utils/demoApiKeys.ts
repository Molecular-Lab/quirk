/**
 * Generate demo API keys dynamically from prefix
 * Uses the product's existing API key prefix and extends it to valid format
 */

/**
 * Convert an API key prefix to a full demo API key
 * Prefix format: pk_test_7a9f3e2b (16 chars)
 * Full key format: pk_test_7a9f3e2b1c4d8f6e5a0b9c8d7e6f5a4b (40 chars)
 *
 * @param prefix - The API key prefix from database (16 chars)
 * @returns Full demo API key (40 chars) for demo use
 */
export function generateDemoKeyFromPrefix(prefix: string | null): string | null {
	console.log("[generateDemoKeyFromPrefix] Input prefix:", prefix)

	if (!prefix) {
		console.log("[generateDemoKeyFromPrefix] Prefix is null/undefined, returning null")
		return null
	}

	// Validate prefix format (pk_test_xxxxxxxx or pk_live_xxxxxxxx)
	const isValid = prefix.match(/^pk_(test|live)_[a-f0-9]{8}$/)
	if (!isValid) {
		console.warn("[generateDemoKeyFromPrefix] Invalid prefix format:", {
			prefix,
			length: prefix.length,
			format: prefix.substring(0, 8),
		})
		return null
	}

	console.log("[generateDemoKeyFromPrefix] Valid prefix, generating full key...")

	// Prefix is 16 chars: "pk_test_7a9f3e2b"
	// We need 40 chars total: "pk_test_" (8) + 32 hex chars
	// Prefix provides: "pk_test_" (8) + first 8 hex chars
	// We need to add: 24 more hex chars

	// Use a deterministic extension based on the prefix
	// This ensures the same prefix always generates the same full key
	const hexPart = prefix.substring(8) // Extract "7a9f3e2b"

	// Create a deterministic extension by repeating and hashing the hex part
	// Simple approach: repeat the 8 chars three times to get 24 chars
	const extension = (hexPart + hexPart + hexPart).substring(0, 24)

	// Combine: prefix (16) + extension (24) = 40 chars
	const fullKey = prefix + extension

	console.log("[generateDemoKeyFromPrefix] ✅ Generated full key:", {
		prefix,
		fullKeyLength: fullKey.length,
		fullKeyPreview: fullKey.substring(0, 20) + "...",
	})

	return fullKey
}

/**
 * Generate demo API keys for a product based on its prefixes
 */
export function generateDemoKeysForProduct(
	sandboxPrefix: string | null,
	productionPrefix: string | null,
): {
	sandboxKey: string | null
	productionKey: string | null
} {
	return {
		sandboxKey: generateDemoKeyFromPrefix(sandboxPrefix),
		productionKey: generateDemoKeyFromPrefix(productionPrefix),
	}
}

/**
 * Check if an API key looks like a demo key (generated from prefix)
 */
export function isDemoApiKey(apiKey: string): boolean {
	// Demo keys are 40 chars: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	// They have repeated patterns in the last 24 chars
	if (!apiKey.match(/^pk_(test|live)_[a-f0-9]{32}$/)) {
		return false
	}

	// Extract the hex part (32 chars after "pk_test_" or "pk_live_")
	const hexPart = apiKey.substring(8)

	// Check if last 24 chars are repeated pattern of first 8 chars
	const firstSegment = hexPart.substring(0, 8)
	const extension = (firstSegment + firstSegment + firstSegment).substring(0, 24)

	return hexPart.substring(8) === extension
}
