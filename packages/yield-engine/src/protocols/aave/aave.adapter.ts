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
import { AAVE_POOL_ABI, ERC20_ABI } from './aave.abi'
import {
	getPoolAddress,
	getTokenAddress,
	getTokenInfo,
	isTokenSupported,
	getSupportedTokens,
	RAY,
	SECONDS_PER_YEAR,
	AAVE_CACHE_TTL,
} from './aave.constants'
import type { AaveReserveData } from './aave.types'

/**
 * AAVE V3 Protocol Adapter
 * Implements yield optimization for AAVE V3 lending protocol
 */
export class AaveAdapter implements IProtocolAdapter {
	constructor(chainId: number) {
		// Validate chain is supported
		getPoolAddress(chainId)
	}

	/**
	 * Get protocol name
	 */
	getProtocolName(): Protocol {
		return 'aave'
	}

	/**
	 * Get current supply APY for a token
	 * @param token - Token symbol (e.g., "USDC")
	 * @param chainId - Chain ID
	 * @returns APY as percentage string (e.g., "5.25")
	 */
	async getSupplyAPY(token: string, chainId: number): Promise<string> {
		// Check cache first
		const cacheKey = generateCacheKey('aave', 'supplyAPY', token, chainId)
		const cached = globalCache.get<string>(cacheKey)
		if (cached) {
			return cached
		}

		try {
			// Get reserve data
			const reserveData = await this.getReserveData(token, chainId)

			// Convert liquidityRate (Ray format) to APY
			const apy = this.calculateSupplyAPY(reserveData.currentLiquidityRate)

			// Cache the result
			globalCache.set(cacheKey, apy, AAVE_CACHE_TTL)

			return apy
		} catch (error) {
			throw new ProtocolError(
				'aave',
				`Failed to get supply APY for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get user's position in AAVE for a specific token
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
			// Get token info
			const tokenInfo = getTokenInfo(token, chainId)
			if (!tokenInfo) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			// Get reserve data to find aToken address
			const reserveData = await this.getReserveData(token, chainId)
			const aTokenAddress = reserveData.aTokenAddress

			// Get aToken balance (includes principal + accrued interest)
			const client = getPublicClient(chainId)
			const balance = await retryWithBackoff(async () => {
				return await client.readContract({
					address: aTokenAddress as `0x${string}`,
					abi: ERC20_ABI,
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
				tokenInfo.decimals,
				6,
			)

			// For simplicity, assume 1 USDC/USDT = 1 USD
			// In production, you'd fetch actual price from oracle
			const valueUSD = amountFormatted

			return {
				protocol: 'aave',
				token: tokenInfo.symbol,
				tokenAddress: tokenInfo.address,
				chainId,
				amount: balance.toString(),
				amountFormatted,
				valueUSD,
				apy,
			}
		} catch (error) {
			throw new ProtocolError(
				'aave',
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
			// Get token info
			const tokenInfo = getTokenInfo(token, chainId)
			if (!tokenInfo) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			// Get reserve data
			const reserveData = await this.getReserveData(token, chainId)

			// Calculate APY
			const supplyAPY = this.calculateSupplyAPY(reserveData.currentLiquidityRate)
			const borrowAPY = this.calculateBorrowAPY(
				reserveData.currentVariableBorrowRate,
			)

			// Get aToken to calculate TVL
			const aTokenAddress = reserveData.aTokenAddress
			const client = getPublicClient(chainId)

			const totalSupply = await retryWithBackoff(async () => {
				return await client.readContract({
					address: aTokenAddress as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'totalSupply',
					args: [],
				})
			})

			// Format TVL (total value locked)
			const tvl = formatAmount(totalSupply.toString(), tokenInfo.decimals, 2)

			// Calculate available liquidity (TVL * utilization gap)
			// For simplicity, assume 80% of TVL is available
			// In production, calculate: TVL - totalBorrows
			const liquidity = (parseFloat(tvl) * 0.8).toFixed(2)

			return {
				protocol: 'aave',
				token: tokenInfo.symbol,
				tokenAddress: tokenInfo.address,
				chainId,
				supplyAPY,
				borrowAPY,
				tvl,
				liquidity,
				timestamp: Date.now(),
				metadata: {
					aTokenAddress: reserveData.aTokenAddress,
					liquidityIndex: reserveData.liquidityIndex.toString(),
					lastUpdate: reserveData.lastUpdateTimestamp,
				},
			}
		} catch (error) {
			throw new ProtocolError(
				'aave',
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
			const validMetrics = allMetrics.filter((m) => m !== null) as YieldOpportunity[]

			// Calculate total TVL
			const tvlUSD = validMetrics
				.reduce((sum, m) => sum + parseFloat(m.tvl), 0)
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
				protocol: 'aave',
				chainId,
				tvlUSD,
				availableLiquidityUSD,
				avgSupplyAPY,
				isHealthy: validMetrics.length > 0, // Healthy if at least one market is active
				lastUpdated: Date.now(),
			}
		} catch (error) {
			throw new ProtocolError(
				'aave',
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
		fromAddress: string,
	): Promise<TransactionRequest> {
		const tokenAddress = getTokenAddress(token, chainId)
		if (!tokenAddress) {
			throw new ProtocolError('aave', `Token ${token} not supported on chain ${chainId}`)
		}

		const poolAddress = getPoolAddress(chainId)

		// Encode Pool.supply() call
		const data = encodeFunctionData({
			abi: AAVE_POOL_ABI,
			functionName: 'supply',
			args: [
				tokenAddress as `0x${string}`,
				BigInt(amount),
				fromAddress as `0x${string}`,
				0, // referralCode
			],
		})

		return {
			to: poolAddress,
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
		toAddress: string,
	): Promise<TransactionRequest> {
		const tokenAddress = getTokenAddress(token, chainId)
		if (!tokenAddress) {
			throw new ProtocolError('aave', `Token ${token} not supported on chain ${chainId}`)
		}

		const poolAddress = getPoolAddress(chainId)

		// Encode Pool.withdraw() call
		const data = encodeFunctionData({
			abi: AAVE_POOL_ABI,
			functionName: 'withdraw',
			args: [
				tokenAddress as `0x${string}`,
				BigInt(amount),
				toAddress as `0x${string}`,
			],
		})

		return {
			to: poolAddress,
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
		const tokenAddress = getTokenAddress(token, chainId)
		if (!tokenAddress) {
			throw new ProtocolError('aave', `Token ${token} not supported on chain ${chainId}`)
		}

		// Encode ERC20.approve() call
		const data = encodeFunctionData({
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [spender as `0x${string}`, BigInt(amount)],
		})

		return {
			to: tokenAddress,
			data,
			value: '0',
			chainId,
		}
	}

	/**
	 * Execute deposit transaction (handles approval + deposit + verification)
	 */
	async executeDeposit(
		token: string,
		chainId: number,
		amount: string,
		walletClient: WalletClient,
	): Promise<TransactionReceipt> {
		if (!walletClient.account) {
			throw new ProtocolError('aave', 'WalletClient must have an account')
		}

		const poolAddress = getPoolAddress(chainId)
		const userAddress = walletClient.account.address

		// 1. Check if approval is needed
		const approvalStatus = await this.checkApproval(
			token,
			chainId,
			userAddress,
			poolAddress,
			amount,
		)

		// 2. Execute approval if needed
		if (approvalStatus.needsApproval) {
			const approvalTx = await this.prepareApproval(
				token,
				chainId,
				poolAddress,
				amount,
				userAddress,
			)

			const approvalHash = await walletClient.sendTransaction({
				to: approvalTx.to as `0x${string}`,
				data: approvalTx.data as `0x${string}`,
				chain: null,
				account: walletClient.account,
			})

			// Wait for approval confirmation
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
			throw new ProtocolError('aave', 'WalletClient must have an account')
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
			// Return a default estimate if estimation fails (common for deposits without approval)
			return 250000n
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
			// Return a default estimate if estimation fails
			return 200000n
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
		const tokenAddress = getTokenAddress(token, chainId)
		if (!tokenAddress) {
			throw new ProtocolError('aave', `Token ${token} not supported on chain ${chainId}`)
		}

		const client = getPublicClient(chainId)

		const allowance = await retryWithBackoff(async () => {
			return await client.readContract({
				address: tokenAddress as `0x${string}`,
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
	 * Get reserve data from AAVE Pool contract
	 * @private
	 */
	private async getReserveData(
		token: string,
		chainId: number,
	): Promise<AaveReserveData> {
		// Get token address
		const tokenAddress = getTokenAddress(token, chainId)
		if (!tokenAddress) {
			throw new Error(`Token ${token} not supported on chain ${chainId}`)
		}

		// Get Pool address
		const poolAddress = getPoolAddress(chainId)

		// Call getReserveData
		const client = getPublicClient(chainId)
		const reserveData = await retryWithBackoff(async () => {
			return await client.readContract({
				address: poolAddress as `0x${string}`,
				abi: AAVE_POOL_ABI,
				functionName: 'getReserveData',
				args: [tokenAddress as `0x${string}`],
			})
		})

		// Viem returns the tuple as an object with named properties
		return {
			configuration: reserveData.configuration,
			liquidityIndex: reserveData.liquidityIndex,
			currentLiquidityRate: reserveData.currentLiquidityRate,
			variableBorrowIndex: reserveData.variableBorrowIndex,
			currentVariableBorrowRate: reserveData.currentVariableBorrowRate,
			currentStableBorrowRate: reserveData.currentStableBorrowRate,
			lastUpdateTimestamp: Number(reserveData.lastUpdateTimestamp),
			id: Number(reserveData.id),
			aTokenAddress: reserveData.aTokenAddress,
			stableDebtTokenAddress: reserveData.stableDebtTokenAddress,
			variableDebtTokenAddress: reserveData.variableDebtTokenAddress,
			interestRateStrategyAddress: reserveData.interestRateStrategyAddress,
			accruedToTreasury: reserveData.accruedToTreasury,
			unbacked: reserveData.unbacked,
			isolationModeTotalDebt: reserveData.isolationModeTotalDebt,
		}
	}

	/**
	 * Calculate supply APY from liquidityRate (Ray format)
	 * Uses compound interest formula: APY = ((1 + rate/RAY/SECONDS_PER_YEAR) ^ SECONDS_PER_YEAR) - 1
	 * @private
	 */
	private calculateSupplyAPY(liquidityRate: bigint): string {
		try {
			// Convert Ray format to decimal
			// liquidityRate is in Ray units (1e27), representing annual rate
			const aprDecimal = Number(liquidityRate) / RAY

			// Calculate APY using compound interest formula
			// Compounds every second for more accurate calculation
			const apyDecimal =
				Math.pow(1 + aprDecimal / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1

			// Convert to percentage and return with 2 decimal places
			return (apyDecimal * 100).toFixed(2)
		} catch (error) {
			console.error('APY calculation failed:', {
				liquidityRate: liquidityRate.toString(),
				error,
			})
			return '0.00'
		}
	}

	/**
	 * Calculate borrow APY from variableBorrowRate (Ray format)
	 * @private
	 */
	private calculateBorrowAPY(borrowRate: bigint): string {
		// Same formula as supply APY
		return this.calculateSupplyAPY(borrowRate)
	}
}
