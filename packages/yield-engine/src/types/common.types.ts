import { z } from 'zod'
import type { WalletClient } from 'viem'

/**
 * Supported DeFi protocols
 */
export type Protocol = 'aave' | 'compound' | 'morpho'

/**
 * Supported blockchain networks
 */
export type ChainId = 1 | 137 | 8453 | 42161 // Ethereum, Polygon, Base, Arbitrum

/**
 * Yield opportunity from a single protocol
 */
export const YieldOpportunitySchema = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	token: z.string(), // Token symbol (e.g., "USDC")
	tokenAddress: z.string(), // Contract address
	chainId: z.number(),
	supplyAPY: z.string(), // "5.25" = 5.25% annual yield
	borrowAPY: z.string().optional(), // For lending protocols
	tvl: z.string(), // Total value locked in USD
	liquidity: z.string(), // Available liquidity in USD
	utilization: z.string().optional(), // "75.5" = 75.5% utilization
	timestamp: z.number(), // Unix timestamp when data was fetched
	metadata: z.record(z.any()).optional(), // Protocol-specific data
})

export type YieldOpportunity = z.infer<typeof YieldOpportunitySchema>

/**
 * User's position in a protocol
 */
export const ProtocolPositionSchema = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	token: z.string(),
	tokenAddress: z.string(),
	chainId: z.number(),
	amount: z.string(), // Amount in wei/smallest unit (as string to avoid precision loss)
	amountFormatted: z.string(), // Human-readable amount (e.g., "1000.50")
	valueUSD: z.string(), // USD value
	apy: z.string(), // Current APY for this position
	earnedYield: z.string().optional(), // Total yield earned so far
	depositedAt: z.number().optional(), // Unix timestamp of deposit
})

export type ProtocolPosition = z.infer<typeof ProtocolPositionSchema>

/**
 * Protocol metrics and health data
 */
export const ProtocolMetricsSchema = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	chainId: z.number(),
	tvlUSD: z.string(), // Total value locked across all markets
	totalBorrowsUSD: z.string().optional(),
	availableLiquidityUSD: z.string(),
	avgSupplyAPY: z.string(), // Average supply APY across all markets
	isHealthy: z.boolean(), // Overall protocol health status
	lastUpdated: z.number(),
})

export type ProtocolMetrics = z.infer<typeof ProtocolMetricsSchema>

/**
 * Token information
 */
export const TokenInfoSchema = z.object({
	symbol: z.string(), // "USDC"
	name: z.string(), // "USD Coin"
	address: z.string(), // Contract address
	decimals: z.number(), // Usually 6 for USDC, 18 for most tokens
	chainId: z.number(),
	isStablecoin: z.boolean().default(false),
	priceUSD: z.string().optional(), // Current price in USD
})

export type TokenInfo = z.infer<typeof TokenInfoSchema>

/**
 * Optimization recommendation
 */
export const OptimizationResultSchema = z.object({
	action: z.enum(['hold', 'rebalance']),
	currentProtocol: z.string().optional(),
	currentAPY: z.string().optional(),
	recommendedProtocol: z.string().optional(),
	recommendedAPY: z.string().optional(),
	apyDelta: z.string().optional(), // "1.6" = 1.6% improvement
	estimatedMonthlyGain: z.string().optional(), // USD value of expected gain
	estimatedAnnualGain: z.string().optional(),
	estimatedGasCost: z.string().optional(), // Estimated gas cost in USD
	netGainAfterGas: z.string().optional(),
	reason: z.string().optional(), // Human-readable explanation
	timestamp: z.number(),
})

export type OptimizationResult = z.infer<typeof OptimizationResultSchema>

/**
 * Rebalance configuration
 */
export const RebalanceConfigSchema = z.object({
	minApyDelta: z.number().default(1.0), // Minimum APY improvement required (in percentage points)
	minGainThreshold: z.string().default('10'), // Minimum expected gain in USD to justify rebalance
	maxGasCostUSD: z.string().default('50'), // Max willing to pay in gas
	cooldownHours: z.number().default(24), // Minimum hours between rebalances
	enabled: z.boolean().default(true),
})

export type RebalanceConfig = z.infer<typeof RebalanceConfigSchema>

/**
 * Risk profile for yield optimization
 */
export const RiskProfileSchema = z.object({
	level: z.enum(['conservative', 'moderate', 'aggressive']),
	maxSlippage: z.number().default(0.5), // 0.5%
	preferredProtocols: z.array(z.enum(['aave', 'compound', 'morpho'])).optional(),
	excludedProtocols: z.array(z.enum(['aave', 'compound', 'morpho'])).optional(),
	minProtocolTVL: z.string().default('100000000'), // $100M minimum TVL
	rebalanceConfig: RebalanceConfigSchema.optional(),
})

export type RiskProfile = z.infer<typeof RiskProfileSchema>

// ============================================================================
// Transaction Execution Types (Phase 1 - Write Capabilities)
// ============================================================================

/**
 * Transaction request ready for signing
 * Can be sent to Privy wallet, MetaMask, or any wallet provider
 */
export interface TransactionRequest {
	/** Contract address to call */
	to: string
	/** Encoded function call data */
	data: string
	/** ETH value to send (usually "0" for ERC-20 operations) */
	value?: string
	/** Optional gas limit */
	gasLimit?: string
	/** Target chain ID */
	chainId: number
}

/**
 * Transaction execution result
 * Returned after successful on-chain execution
 */
export interface TransactionReceipt {
	/** Transaction hash */
	hash: string
	/** Block number where transaction was included */
	blockNumber: bigint
	/** Transaction status */
	status: 'success' | 'reverted'
	/** Actual gas consumed */
	gasUsed: bigint
	/** Price paid per gas unit */
	effectiveGasPrice: bigint
	/** Sender address */
	from: string
	/** Recipient address */
	to?: string
	/** Execution timestamp */
	timestamp: number
}

/**
 * Approval check result
 * Determines if ERC-20 approval is needed before deposit
 */
export interface ApprovalStatus {
	/** Whether current allowance is sufficient */
	isApproved: boolean
	/** Current approved amount */
	currentAllowance: string
	/** Required amount for operation */
	requiredAmount: string
	/** Convenience flag (inverse of isApproved) */
	needsApproval: boolean
	/** Protocol contract address that needs approval */
	spenderAddress: string
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
	data: T
	timestamp: number
	expiresAt: number
}

/**
 * Interface that all protocol adapters must implement
 */
export interface IProtocolAdapter {
	// ==========================================
	// READ METHODS (Production Ready)
	// ==========================================

	/**
	 * Get the protocol name
	 */
	getProtocolName(): Protocol

	/**
	 * Get current supply APY for a token
	 */
	getSupplyAPY(token: string, chainId: number): Promise<string>

	/**
	 * Get user's position in this protocol
	 */
	getUserPosition(
		walletAddress: string,
		token: string,
		chainId: number,
	): Promise<ProtocolPosition | null>

	/**
	 * Get detailed metrics for a specific token market
	 */
	getMetrics(token: string, chainId: number): Promise<YieldOpportunity>

	/**
	 * Get overall protocol health and metrics
	 */
	getProtocolMetrics(chainId: number): Promise<ProtocolMetrics>

	/**
	 * Check if protocol supports a given token on a chain
	 */
	supportsToken(token: string, chainId: number): Promise<boolean>

	// ==========================================
	// WRITE METHODS (Phase 1 - In Development)
	// ==========================================

	/**
	 * Prepare deposit transaction (returns unsigned transaction data)
	 * This method does NOT execute - it prepares data for external execution
	 *
	 * @param token - Token symbol (e.g., "USDC")
	 * @param chainId - Chain ID
	 * @param amount - Amount in token's smallest unit (e.g., "1000000" for 1 USDC)
	 * @param fromAddress - User wallet address
	 * @returns Transaction data ready for signing
	 */
	prepareDeposit(
		token: string,
		chainId: number,
		amount: string,
		fromAddress: string,
	): Promise<TransactionRequest>

	/**
	 * Prepare withdrawal transaction
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param amount - Amount to withdraw in token's smallest unit
	 * @param toAddress - Recipient address
	 * @returns Transaction data ready for signing
	 */
	prepareWithdrawal(
		token: string,
		chainId: number,
		amount: string,
		toAddress: string,
	): Promise<TransactionRequest>

	/**
	 * Prepare ERC-20 approval transaction
	 * Required before deposits for most protocols
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param spender - Address to approve (protocol contract)
	 * @param amount - Amount to approve
	 * @param fromAddress - Token owner address
	 * @returns Transaction data ready for signing
	 */
	prepareApproval(
		token: string,
		chainId: number,
		spender: string,
		amount: string,
		fromAddress: string,
	): Promise<TransactionRequest>

	/**
	 * Execute deposit transaction (direct execution with wallet client)
	 * This method DOES execute - use when you have a wallet signer
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param amount - Amount to deposit
	 * @param walletClient - Viem WalletClient with account
	 * @returns Transaction receipt with gas tracking
	 */
	executeDeposit(
		token: string,
		chainId: number,
		amount: string,
		walletClient: WalletClient,
	): Promise<TransactionReceipt>

	/**
	 * Execute withdrawal transaction
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param amount - Amount to withdraw
	 * @param walletClient - Viem WalletClient with account
	 * @returns Transaction receipt with gas tracking
	 */
	executeWithdrawal(
		token: string,
		chainId: number,
		amount: string,
		walletClient: WalletClient,
	): Promise<TransactionReceipt>

	/**
	 * Estimate gas for deposit operation
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param amount - Amount to deposit
	 * @param fromAddress - User wallet address
	 * @returns Gas estimate in units (not wei)
	 */
	estimateDepositGas(
		token: string,
		chainId: number,
		amount: string,
		fromAddress: string,
	): Promise<bigint>

	/**
	 * Estimate gas for withdrawal operation
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param amount - Amount to withdraw
	 * @param fromAddress - User wallet address
	 * @returns Gas estimate in units (not wei)
	 */
	estimateWithdrawalGas(
		token: string,
		chainId: number,
		amount: string,
		fromAddress: string,
	): Promise<bigint>

	/**
	 * Check current ERC-20 approval status
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param owner - Token owner address
	 * @param spender - Address to check approval for
	 * @param requiredAmount - Required amount
	 * @returns Approval status
	 */
	checkApproval(
		token: string,
		chainId: number,
		owner: string,
		spender: string,
		requiredAmount: string,
	): Promise<ApprovalStatus>
}

/**
 * Error types
 */
export class ProtocolError extends Error {
	constructor(
		public protocol: Protocol,
		message: string,
		public originalError?: unknown,
	) {
		super(`[${protocol}] ${message}`)
		this.name = 'ProtocolError'
	}
}

export class RpcError extends Error {
	constructor(
		message: string,
		public chainId: number,
		public originalError?: unknown,
	) {
		super(`[Chain ${chainId}] ${message}`)
		this.name = 'RpcError'
	}
}

export class CacheError extends Error {
	constructor(
		message: string,
		public key: string,
	) {
		super(`[Cache: ${key}] ${message}`)
		this.name = 'CacheError'
	}
}
