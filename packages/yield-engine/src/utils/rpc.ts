import { createPublicClient, http, type PublicClient, type Chain } from 'viem'
import { mainnet, polygon, base, arbitrum } from 'viem/chains'
import { RpcError } from '../types/common.types'

/**
 * Map of supported chains
 */
export const SUPPORTED_CHAINS: Record<number, Chain> = {
	1: mainnet,
	137: polygon,
	8453: base,
	42161: arbitrum,
}

/**
 * Default RPC endpoints (can be overridden with env vars)
 */
const RPC_ENDPOINTS: Record<number, string> = {
	1: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
	137: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
	8453: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
	42161: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
}

/**
 * Cache for RPC clients
 */
const clientCache: Map<number, PublicClient> = new Map()

/**
 * Get or create a viem PublicClient for a specific chain
 * @param chainId - The chain ID
 * @returns PublicClient instance
 */
export function getPublicClient(chainId: number): PublicClient {
	// Check cache first
	const cached = clientCache.get(chainId)
	if (cached) {
		return cached
	}

	// Validate chain is supported
	const chain = SUPPORTED_CHAINS[chainId]
	if (!chain) {
		throw new RpcError(`Unsupported chain ID: ${chainId}`, chainId)
	}

	// Get RPC endpoint
	const rpcUrl = RPC_ENDPOINTS[chainId]
	if (!rpcUrl) {
		throw new RpcError(`No RPC endpoint configured for chain ${chainId}`, chainId)
	}

	// Create client
	const client = createPublicClient({
		chain,
		transport: http(rpcUrl, {
			timeout: 30_000, // 30 second timeout
			retryCount: 3,
			retryDelay: 1000, // 1 second between retries
		}),
	})

	// Cache it
	clientCache.set(chainId, client)

	return client
}

/**
 * Retry helper for RPC calls
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default 3)
 * @param delayMs - Delay between retries in milliseconds (default 1000)
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	delayMs: number = 1000,
): Promise<T> {
	let lastError: Error | undefined

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error as Error

			// Don't retry if it's the last attempt
			if (attempt === maxRetries) {
				break
			}

			// Exponential backoff: delay * 2^attempt
			const backoffDelay = delayMs * Math.pow(2, attempt)
			await sleep(backoffDelay)
		}
	}

	// If we get here, all retries failed
	throw new RpcError(
		`Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
		0,
		lastError,
	)
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Batch multiple RPC calls and handle failures gracefully
 * @param calls - Array of async functions to execute
 * @returns Array of results with success/error status
 */
export async function batchRpcCalls<T>(
	calls: (() => Promise<T>)[],
): Promise<Array<{ success: true; data: T } | { success: false; error: Error }>> {
	const results = await Promise.allSettled(calls.map((call) => call()))

	return results.map((result) => {
		if (result.status === 'fulfilled') {
			return { success: true as const, data: result.value }
		} else {
			return { success: false as const, error: result.reason as Error }
		}
	})
}

/**
 * Get block number with retry logic
 */
export async function getBlockNumber(chainId: number): Promise<bigint> {
	const client = getPublicClient(chainId)

	return retryWithBackoff(async () => {
		const blockNumber = await client.getBlockNumber()
		return blockNumber
	})
}

/**
 * Get current gas price with retry logic
 */
export async function getGasPrice(chainId: number): Promise<bigint> {
	const client = getPublicClient(chainId)

	return retryWithBackoff(async () => {
		const gasPrice = await client.getGasPrice()
		return gasPrice
	})
}

/**
 * Estimate gas cost in USD for a transaction
 * @param chainId - Chain ID
 * @param gasUnits - Estimated gas units
 * @param ethPriceUSD - Current ETH price in USD (optional, defaults to 2000)
 * @returns Estimated gas cost in USD
 */
export async function estimateGasCostUSD(
	chainId: number,
	gasUnits: bigint,
	ethPriceUSD: number = 2000,
): Promise<string> {
	const gasPrice = await getGasPrice(chainId)

	// Calculate total cost in wei
	const totalWei = gasPrice * gasUnits

	// Convert to ETH (divide by 1e18)
	const totalEth = Number(totalWei) / 1e18

	// Convert to USD
	const totalUsd = totalEth * ethPriceUSD

	return totalUsd.toFixed(2)
}

/**
 * Clear the client cache (useful for testing or reinitializing)
 */
export function clearClientCache(): void {
	clientCache.clear()
}

/**
 * Check if RPC endpoint is healthy
 */
export async function checkRpcHealth(chainId: number): Promise<boolean> {
	try {
		const client = getPublicClient(chainId)
		await client.getBlockNumber()
		return true
	} catch (error) {
		console.error(`RPC health check failed for chain ${chainId}:`, error)
		return false
	}
}
