import type { Address } from "viem"

/**
 * Supported networks for Blockscout explorer
 */
export type Network = "sepolia" | "base-sepolia" | "mainnet" | "base"

/**
 * Blockscout base URLs for different networks
 */
const BLOCKSCOUT_URLS: Record<Network, string> = {
	sepolia: "https://eth-sepolia.blockscout.com",
	"base-sepolia": "https://base-sepolia.blockscout.com",
	mainnet: "https://eth.blockscout.com",
	base: "https://base.blockscout.com",
}

/**
 * Get Blockscout URL for a transaction or address
 *
 * @param type - "tx" for transaction or "address" for address
 * @param hash - Transaction hash or address
 * @param network - Network name (default: "sepolia")
 * @returns Blockscout URL
 *
 * @example
 * getBlockscoutUrl("tx", "0x123...", "sepolia")
 * // => "https://eth-sepolia.blockscout.com/tx/0x123..."
 *
 * getBlockscoutUrl("address", "0xabc...", "base-sepolia")
 * // => "https://base-sepolia.blockscout.com/address/0xabc..."
 */
export function getBlockscoutUrl(
	type: "tx" | "address" | "token",
	hash: string | Address,
	network: Network = "sepolia",
): string {
	const baseUrl = BLOCKSCOUT_URLS[network]
	return `${baseUrl}/${type}/${hash}`
}

/**
 * Open Blockscout explorer in a new tab
 *
 * @param type - "tx" for transaction or "address" for address
 * @param hash - Transaction hash or address
 * @param network - Network name (default: "sepolia")
 *
 * @example
 * openBlockscout("tx", txHash, "sepolia")
 */
export function openBlockscout(
	type: "tx" | "address" | "token",
	hash: string | Address,
	network: Network = "sepolia",
): void {
	const url = getBlockscoutUrl(type, hash, network)
	window.open(url, "_blank", "noopener,noreferrer")
}

/**
 * Copy Blockscout URL to clipboard
 *
 * @param type - "tx" for transaction or "address" for address
 * @param hash - Transaction hash or address
 * @param network - Network name (default: "sepolia")
 * @returns Promise that resolves when URL is copied
 */
export async function copyBlockscoutUrl(
	type: "tx" | "address" | "token",
	hash: string | Address,
	network: Network = "sepolia",
): Promise<void> {
	const url = getBlockscoutUrl(type, hash, network)
	await navigator.clipboard.writeText(url)
}
