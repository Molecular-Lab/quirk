import type { WalletClient } from 'viem'
import { encodeFunctionData } from 'viem'
import type {
	IProtocolAdapter,
	Protocol,
	YieldOpportunity,
	ProtocolPosition,
	ProtocolMetrics,
	TransactionRequest,
	TransactionReceipt,
	ApprovalStatus,
} from '../../types/common.types'
import { ProtocolError } from '../../types/common.types'
import { getPublicClient, retryWithBackoff } from '../../utils/rpc'
import { formatAmount } from '../../utils/formatting'
import { globalCache, generateCacheKey } from '../../utils/cache'
import { COMET_ABI, ERC20_ABI } from './compound.abi'
import {
	getCometAddress,
	getTokenInfo,
	isTokenSupported,
	getSupportedTokens,
	SECONDS_PER_YEAR,
	COMPOUND_RATE_PRECISION,
	COMPOUND_CACHE_TTL,
} from './compound.constants'

/**
 * Compound V3 (Comet) Protocol Adapter
 * Implements yield optimization for Compound V3 lending protocol
 */
export class CompoundAdapter implements IProtocolAdapter {
	constructor(chainId: number) {
		// Validate chain is supported
		const supportedTokens = getSupportedTokens(chainId)
		if (supportedTokens.length === 0) {
			throw new Error(`Compound V3 not supported on chain ${chainId}`)
		}
	}

	/**
	 * Get protocol name
	 */
	getProtocolName(): Protocol {
		return 'compound'
	}

	/**
	 * Get current supply APY for a token
	 * @param token - Token symbol (e.g., "USDC")
	 * @param chainId - Chain ID
	 * @returns APY as percentage string (e.g., "5.25")
	 */
	async getSupplyAPY(token: string, chainId: number): Promise<string> {
		// Check cache first
		const cacheKey = generateCacheKey('compound', 'supplyAPY', token, chainId)
		const cached = globalCache.get<string>(cacheKey)
		if (cached) {
			return cached
		}

		try {
			// Get Comet address
			const cometAddress = getCometAddress(token, chainId)
			if (!cometAddress) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)

			// Get current utilization
			const utilization = await retryWithBackoff(async () => {
				return await client.readContract({
					address: cometAddress as `0x${string}`,
					abi: COMET_ABI,
					functionName: 'getUtilization',
					args: [],
				})
			})

			// Get supply rate per second (in 1e18 precision)
			const supplyRatePerSecond = await retryWithBackoff(async () => {
				return await client.readContract({
					address: cometAddress as `0x${string}`,
					abi: COMET_ABI,
					functionName: 'getSupplyRate',
					args: [utilization],
				})
			})

			// Calculate APY using compound interest formula
			const apy = this.calculateAPY(supplyRatePerSecond)

			// Cache the result
			globalCache.set(cacheKey, apy, COMPOUND_CACHE_TTL)

			return apy
		} catch (error) {
			throw new ProtocolError(
				'compound',
				`Failed to get supply APY for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get user's position in Compound for a specific token
	 * @param walletAddress - User's wallet address
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns User's position or null if no position
	 */
	async getUserPosition(
		walletAddress: string,
		token: string,
		chainId: number,
	): Promise<ProtocolPosition | null> {
		try {
			// Get market config
			const marketConfig = getTokenInfo(token, chainId)
			if (!marketConfig) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)
			const cometAddress = marketConfig.cometAddress

			// Get user's balance from Comet (includes principal + accrued interest)
			const balance = await retryWithBackoff(async () => {
				return await client.readContract({
					address: cometAddress as `0x${string}`,
					abi: COMET_ABI,
					functionName: 'balanceOf',
					args: [walletAddress as `0x${string}`],
				})
			})

			// If balance is zero, return null
			if (balance === 0n) {
				return null
			}

			// Get current APY
			const apy = await this.getSupplyAPY(token, chainId)

			// Format amounts
			const amountFormatted = formatAmount(
				balance.toString(),
				marketConfig.baseTokenDecimals,
				6,
			)

			// For stablecoins, assume 1:1 USD
			// In production, you'd fetch actual price from oracle
			const valueUSD = amountFormatted

			return {
				protocol: 'compound',
				token: marketConfig.baseToken,
				tokenAddress: marketConfig.baseTokenAddress,
				chainId,
				amount: balance.toString(),
				amountFormatted,
				valueUSD,
				apy,
			}
		} catch (error) {
			throw new ProtocolError(
				'compound',
				`Failed to get user position for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get detailed metrics for a specific token market
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns Yield opportunity data
	 */
	async getMetrics(token: string, chainId: number): Promise<YieldOpportunity> {
		try {
			// Get market config
			const marketConfig = getTokenInfo(token, chainId)
			if (!marketConfig) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)
			const cometAddress = marketConfig.cometAddress

			// Get market data in parallel
			const [totalSupply, totalBorrow, utilization] = await Promise.all([
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'totalSupply',
						args: [],
					})
				}),
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'totalBorrow',
						args: [],
					})
				}),
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'getUtilization',
						args: [],
					})
				}),
			])

			// Get supply and borrow rates
			const [supplyRatePerSecond, borrowRatePerSecond] = await Promise.all([
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'getSupplyRate',
						args: [utilization],
					})
				}),
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'getBorrowRate',
						args: [utilization],
					})
				}),
			])

			// Calculate APY
			const supplyAPY = this.calculateAPY(supplyRatePerSecond)
			const borrowAPY = this.calculateAPY(borrowRatePerSecond)

			// Format TVL (total value locked)
			const tvl = formatAmount(
				totalSupply.toString(),
				marketConfig.baseTokenDecimals,
				2,
			)

			// Calculate available liquidity (TVL - total borrows)
			const availableLiquidity = totalSupply - totalBorrow
			const liquidity = formatAmount(
				availableLiquidity.toString(),
				marketConfig.baseTokenDecimals,
				2,
			)

			// Calculate utilization percentage
			const utilizationPercent = totalSupply > 0n
				? ((Number(totalBorrow) * 100) / Number(totalSupply)).toFixed(2)
				: '0.00'

			return {
				protocol: 'compound',
				token: marketConfig.baseToken,
				tokenAddress: marketConfig.baseTokenAddress,
				chainId,
				supplyAPY,
				borrowAPY,
				tvl,
				liquidity,
				utilization: utilizationPercent,
				timestamp: Date.now(),
				metadata: {
					cometAddress: marketConfig.cometAddress,
					totalSupply: totalSupply.toString(),
					totalBorrow: totalBorrow.toString(),
				},
			}
		} catch (error) {
			throw new ProtocolError(
				'compound',
				`Failed to get metrics for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get overall protocol health and metrics
	 * @param chainId - Chain ID
	 * @returns Protocol-wide metrics
	 */
	async getProtocolMetrics(chainId: number): Promise<ProtocolMetrics> {
		try {
			// Get metrics for all supported tokens
			const supportedTokens = getSupportedTokens(chainId)
			const metricsPromises = supportedTokens.map((token) =>
				this.getMetrics(token, chainId).catch(() => null),
			)
			const allMetrics = await Promise.all(metricsPromises)

			// Filter out failed requests
			const validMetrics = allMetrics.filter(
				(m) => m !== null,
			) as YieldOpportunity[]

			// Calculate total TVL
			const tvlUSD = validMetrics
				.reduce((sum, m) => sum + parseFloat(m.tvl), 0)
				.toFixed(2)

			// Calculate total borrows
			const totalBorrowsUSD = validMetrics
				.reduce((sum, m) => {
					const totalBorrow = m.metadata?.totalBorrow
					if (totalBorrow && typeof totalBorrow === 'string') {
						// Need decimals to format - use 6 for stablecoins
						return sum + parseFloat(formatAmount(totalBorrow, 6, 2))
					}
					return sum
				}, 0)
				.toFixed(2)

			// Calculate available liquidity
			const availableLiquidityUSD = validMetrics
				.reduce((sum, m) => sum + parseFloat(m.liquidity), 0)
				.toFixed(2)

			// Calculate average supply APY
			const avgSupplyAPY =
				validMetrics.length > 0
					? (
						validMetrics.reduce((sum, m) => sum + parseFloat(m.supplyAPY), 0) /
						validMetrics.length
					).toFixed(2)
					: '0'

			return {
				protocol: 'compound',
				chainId,
				tvlUSD,
				totalBorrowsUSD,
				availableLiquidityUSD,
				avgSupplyAPY,
				isHealthy: validMetrics.length > 0, // Healthy if at least one market is active
				lastUpdated: Date.now(),
			}
		} catch (error) {
			throw new ProtocolError(
				'compound',
				`Failed to get protocol metrics on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Check if protocol supports a given token on a chain
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns True if supported
	 */
	async supportsToken(token: string, chainId: number): Promise<boolean> {
		return isTokenSupported(token, chainId)
	}

	// ==========================================
	// WRITE METHODS (Phase 1 - Execute Deposits/Withdrawals)
	// ==========================================

	/**
	 * Prepare deposit transaction (returns unsigned transaction data)
	 */
	async prepareDeposit(
		token: string,
		chainId: number,
		amount: string,
		_fromAddress: string,
	): Promise<TransactionRequest> {
		const marketConfig = getTokenInfo(token, chainId)
		if (!marketConfig) {
			throw new ProtocolError('compound', `Token ${token} not supported on chain ${chainId}`)
		}

		// Encode Comet.supply() call
		const data = encodeFunctionData({
			abi: COMET_ABI,
			functionName: 'supply',
			args: [
				marketConfig.baseTokenAddress as `0x${string}`,
				BigInt(amount),
			],
		})

		return {
			to: marketConfig.cometAddress,
			data,
			value: '0',
			chainId,
		}
	}

	/**
	 * Prepare withdrawal transaction
	 */
	async prepareWithdrawal(
		token: string,
		chainId: number,
		amount: string,
		_toAddress: string,
	): Promise<TransactionRequest> {
		const marketConfig = getTokenInfo(token, chainId)
		if (!marketConfig) {
			throw new ProtocolError('compound', `Token ${token} not supported on chain ${chainId}`)
		}

		// Encode Comet.withdraw() call
		const data = encodeFunctionData({
			abi: COMET_ABI,
			functionName: 'withdraw',
			args: [
				marketConfig.baseTokenAddress as `0x${string}`,
				BigInt(amount),
			],
		})

		return {
			to: marketConfig.cometAddress,
			data,
			value: '0',
			chainId,
		}
	}

	/**
	 * Prepare ERC-20 approval transaction
	 */
	async prepareApproval(
		token: string,
		chainId: number,
		spender: string,
		amount: string,
		_fromAddress: string,
	): Promise<TransactionRequest> {
		const marketConfig = getTokenInfo(token, chainId)
		if (!marketConfig) {
			throw new ProtocolError('compound', `Token ${token} not supported on chain ${chainId}`)
		}

		// Encode ERC20.approve() call
		const data = encodeFunctionData({
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [spender as `0x${string}`, BigInt(amount)],
		})

		return {
			to: marketConfig.baseTokenAddress,
			data,
			value: '0',
			chainId,
		}
	}

	/**
	 * Execute deposit transaction (handles approval + deposit)
	 */
	async executeDeposit(
		token: string,
		chainId: number,
		amount: string,
		walletClient: WalletClient,
	): Promise<TransactionReceipt> {
		if (!walletClient.account) {
			throw new ProtocolError('compound', 'WalletClient must have an account')
		}

		const marketConfig = getTokenInfo(token, chainId)
		if (!marketConfig) {
			throw new ProtocolError('compound', `Token ${token} not supported on chain ${chainId}`)
		}

		const userAddress = walletClient.account.address

		// 1. Check if approval is needed
		const approvalStatus = await this.checkApproval(
			token,
			chainId,
			userAddress,
			marketConfig.cometAddress,
			amount,
		)

		// 2. Execute approval if needed
		if (approvalStatus.needsApproval) {
			const approvalTx = await this.prepareApproval(
				token,
				chainId,
				marketConfig.cometAddress,
				amount,
				userAddress,
			)

			const approvalHash = await walletClient.sendTransaction({
				to: approvalTx.to as `0x${string}`,
				data: approvalTx.data as `0x${string}`,
				chain: null,
				account: walletClient.account,
			})

			const client = getPublicClient(chainId)
			await client.waitForTransactionReceipt({ hash: approvalHash })
		}

		// 3. Execute deposit
		const depositTx = await this.prepareDeposit(token, chainId, amount, userAddress)

		const hash = await walletClient.sendTransaction({
			to: depositTx.to as `0x${string}`,
			data: depositTx.data as `0x${string}`,
			chain: null,
			account: walletClient.account,
		})

		// 4. Wait for confirmation
		const client = getPublicClient(chainId)
		const receipt = await client.waitForTransactionReceipt({ hash })

		return {
			hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 'success' ? 'success' : 'reverted',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.effectiveGasPrice,
			from: receipt.from,
			to: receipt.to ?? undefined,
			timestamp: Date.now(),
		}
	}

	/**
	 * Execute withdrawal transaction
	 */
	async executeWithdrawal(
		token: string,
		chainId: number,
		amount: string,
		walletClient: WalletClient,
	): Promise<TransactionReceipt> {
		if (!walletClient.account) {
			throw new ProtocolError('compound', 'WalletClient must have an account')
		}

		const userAddress = walletClient.account.address

		// Execute withdrawal
		const withdrawTx = await this.prepareWithdrawal(token, chainId, amount, userAddress)

		const hash = await walletClient.sendTransaction({
			to: withdrawTx.to as `0x${string}`,
			data: withdrawTx.data as `0x${string}`,
			chain: null,
			account: walletClient.account,
		})

		// Wait for confirmation
		const client = getPublicClient(chainId)
		const receipt = await client.waitForTransactionReceipt({ hash })

		return {
			hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 'success' ? 'success' : 'reverted',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.effectiveGasPrice,
			from: receipt.from,
			to: receipt.to ?? undefined,
			timestamp: Date.now(),
		}
	}

	/**
	 * Estimate gas for deposit operation
	 */
	async estimateDepositGas(
		token: string,
		chainId: number,
		amount: string,
		fromAddress: string,
	): Promise<bigint> {
		const tx = await this.prepareDeposit(token, chainId, amount, fromAddress)
		const client = getPublicClient(chainId)

		try {
			return await client.estimateGas({
				to: tx.to as `0x${string}`,
				data: tx.data as `0x${string}`,
				account: fromAddress as `0x${string}`,
			})
		} catch {
			return 200000n
		}
	}

	/**
	 * Estimate gas for withdrawal operation
	 */
	async estimateWithdrawalGas(
		token: string,
		chainId: number,
		amount: string,
		fromAddress: string,
	): Promise<bigint> {
		const tx = await this.prepareWithdrawal(token, chainId, amount, fromAddress)
		const client = getPublicClient(chainId)

		try {
			return await client.estimateGas({
				to: tx.to as `0x${string}`,
				data: tx.data as `0x${string}`,
				account: fromAddress as `0x${string}`,
			})
		} catch {
			return 180000n
		}
	}

	/**
	 * Check current ERC-20 approval status
	 */
	async checkApproval(
		token: string,
		chainId: number,
		owner: string,
		spender: string,
		requiredAmount: string,
	): Promise<ApprovalStatus> {
		const marketConfig = getTokenInfo(token, chainId)
		if (!marketConfig) {
			throw new ProtocolError('compound', `Token ${token} not supported on chain ${chainId}`)
		}

		const client = getPublicClient(chainId)

		const allowance = await retryWithBackoff(async () => {
			return await client.readContract({
				address: marketConfig.baseTokenAddress as `0x${string}`,
				abi: ERC20_ABI,
				functionName: 'allowance',
				args: [owner as `0x${string}`, spender as `0x${string}`],
			})
		})

		const required = BigInt(requiredAmount)
		const needsApproval = allowance < required

		return {
			isApproved: !needsApproval,
			currentAllowance: allowance.toString(),
			requiredAmount,
			needsApproval,
			spenderAddress: spender,
		}
	}

	// ==========================================
	// PRIVATE HELPER METHODS
	// ==========================================

	/**
	 * Calculate APY from per-second rate (1e18 precision)
	 * Uses compound interest formula: APY = ((1 + ratePerSecond) ^ SECONDS_PER_YEAR) - 1
	 * @private
	 */
	private calculateAPY(ratePerSecond: bigint): string {
		try {
			// Convert 1e18 precision to decimal
			const rateDecimal = Number(ratePerSecond) / COMPOUND_RATE_PRECISION

			// Calculate APY using compound interest formula
			// Compounds every second for accurate calculation
			const apyDecimal =
				Math.pow(1 + rateDecimal, SECONDS_PER_YEAR) - 1

			// Convert to percentage and return with 2 decimal places
			return (apyDecimal * 100).toFixed(2)
		} catch (error) {
			console.error('APY calculation failed:', {
				ratePerSecond: ratePerSecond.toString(),
				error,
			})
			return '0.00'
		}
	}
}
