/**
 * Oracle Address Utilities
 * Helper functions for getting oracle custodial addresses based on environment
 */

/**
 * Get oracle address based on environment
 * @param environment - "sandbox" or "production"
 * @param sandboxAddress - Oracle address for sandbox/testnet (from env: ORACLE_SANDBOX)
 * @param productionAddress - Oracle address for production/mainnet (from env: ORACLE_PROD)
 * @returns Oracle custodial wallet address
 */
export function getOracleAddress(
	environment: "sandbox" | "production",
	sandboxAddress?: string,
	productionAddress?: string,
): string | null {
	if (environment === "sandbox") {
		return sandboxAddress || null
	}

	return productionAddress || null
}

/**
 * Get network name based on environment
 * @param environment - "sandbox" or "production"
 * @param chain - Chain ID (e.g., "1", "8453", "11155111")
 * @returns Network name (e.g., "mainnet", "sepolia", "base", "base-sepolia")
 */
export function getNetworkName(environment: "sandbox" | "production", chain: string): string {
	const isSandbox = environment === "sandbox"

	switch (chain) {
		case "1": // Ethereum
			return isSandbox ? "sepolia" : "mainnet"
		case "11155111": // Ethereum Sepolia
			return "sepolia"
		case "8453": // Base
			return isSandbox ? "base-sepolia" : "base"
		case "84532": // Base Sepolia
			return "base-sepolia"
		case "137": // Polygon
			return isSandbox ? "polygon-amoy" : "polygon"
		case "80002": // Polygon Amoy (testnet)
			return "polygon-amoy"
		case "10": // Optimism
			return isSandbox ? "optimism-sepolia" : "optimism"
		case "42161": // Arbitrum
			return isSandbox ? "arbitrum-sepolia" : "arbitrum"
		default:
			return isSandbox ? "sepolia" : "mainnet"
	}
}

/**
 * Validate oracle address format (Ethereum address)
 * @param address - Oracle address to validate
 * @returns True if valid Ethereum address
 */
export function isValidOracleAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address)
}
