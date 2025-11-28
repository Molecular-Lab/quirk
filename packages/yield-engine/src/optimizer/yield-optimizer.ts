import type {
	Protocol,
	YieldOpportunity,
	ProtocolPosition,
	OptimizationResult,
	RiskProfile,
	RebalanceConfig,
} from '../types/common.types'
import { RebalanceConfigSchema, RiskProfileSchema } from '../types/common.types'
import type {
	OptimizerConfig,
	OptimizationInput,
	ExtendedOptimizationResult,
	IOptimizationStrategy,
	OptimizationStrategy,
	GasEstimate,
	PositionComparison,
} from './optimizer.types'
import { OptimizerConfigSchema } from './optimizer.types'
import { YieldAggregator } from '../aggregator/yield-aggregator'
import { HighestYieldStrategy, RiskAdjustedStrategy, GasAwareStrategy } from './strategies'
import { globalCache, generateCacheKey } from '../utils/cache'
import { calculateEstimatedGain } from '../utils/formatting'

const OPTIMIZER_CACHE_TTL = 2 * 60 * 1000 // 2 minutes

/**
 * YieldOptimizer - Analyzes positions and recommends optimal yield strategies
 *
 * Uses multiple strategies to analyze user positions and provide
 * actionable recommendations for yield optimization, considering
 * factors like APY, risk, and gas costs.
 *
 * @example
 * ```typescript
 * const optimizer = new YieldOptimizer()
 *
 * // Optimize a user's position
 * const result = await optimizer.optimizePosition(
 *   '0x...', // wallet address
 *   'USDC',
 *   1, // Ethereum
 *   { level: 'moderate' }
 * )
 *
 * if (result.action === 'rebalance') {
 *   console.log(`Recommend moving to ${result.recommendedProtocol}`)
 *   console.log(`Expected annual gain: $${result.estimatedAnnualGain}`)
 * }
 * ```
 */
export class YieldOptimizer {
	private aggregator: YieldAggregator
	private strategies: Map<OptimizationStrategy, IOptimizationStrategy>
	private config: OptimizerConfig

	constructor(config?: Partial<OptimizerConfig>) {
		this.config = OptimizerConfigSchema.parse(config ?? {})
		this.aggregator = new YieldAggregator()

		// Initialize strategies
		this.strategies = new Map<OptimizationStrategy, IOptimizationStrategy>([
			['highest-yield', new HighestYieldStrategy()],
			['risk-adjusted', new RiskAdjustedStrategy()],
			['gas-aware', new GasAwareStrategy()],
		])
	}

	/**
	 * Get a strategy by name
	 */
	private getStrategy(name: OptimizationStrategy): IOptimizationStrategy {
		const strategy = this.strategies.get(name)
		if (!strategy) {
			throw new Error(`Unknown strategy: ${name}`)
		}
		return strategy
	}

	/**
	 * Get default risk profile
	 */
	private getDefaultRiskProfile(): RiskProfile {
		return RiskProfileSchema.parse(this.config.defaultRiskProfile ?? { level: 'moderate' })
	}

	/**
	 * Get default rebalance config
	 */
	private getDefaultRebalanceConfig(): RebalanceConfig {
		return RebalanceConfigSchema.parse(this.config.defaultRebalanceConfig ?? {})
	}

	/**
	 * Optimize a user's position for a specific token
	 *
	 * @param walletAddress - User's wallet address
	 * @param token - Token symbol (e.g., 'USDC')
	 * @param chainId - Chain ID
	 * @param riskProfile - Optional risk profile (uses default if not provided)
	 * @param strategyName - Optional strategy to use (uses config default if not provided)
	 * @returns Extended optimization result with recommendations
	 */
	async optimizePosition(
		walletAddress: string,
		token: string,
		chainId: number,
		riskProfile?: Partial<RiskProfile>,
		strategyName?: OptimizationStrategy,
	): Promise<ExtendedOptimizationResult> {
		const cacheKey = generateCacheKey(
			'optimizer',
			'optimize',
			walletAddress,
			token,
			chainId.toString(),
		)
		const cached = globalCache.get<ExtendedOptimizationResult>(cacheKey)
		if (cached) {
			return cached
		}

		// Parse and merge with defaults
		const profile = RiskProfileSchema.parse({
			...this.getDefaultRiskProfile(),
			...riskProfile,
		})
		const rebalanceConfig = profile.rebalanceConfig ?? this.getDefaultRebalanceConfig()
		const strategy = this.getStrategy(strategyName ?? this.config.defaultStrategy)

		// Fetch current positions and opportunities
		const [positions, opportunitiesResult] = await Promise.all([
			this.aggregator.getAllPositions(walletAddress, chainId, [token]),
			this.aggregator.fetchAllOpportunities(token, chainId),
		])

		const currentPosition = positions.positions.find((p) => p.token === token) ?? null
		const opportunities = opportunitiesResult.opportunities

		// Build optimization input
		const input: OptimizationInput = {
			currentPosition,
			opportunities,
			riskProfile: profile,
			rebalanceConfig,
		}

		// Get ranked opportunities
		const rankedOpportunities = strategy.rankOpportunities(opportunities, profile)

		// Determine action
		const shouldRebalance = strategy.shouldRebalance(input)
		const action = shouldRebalance ? 'rebalance' : 'hold'

		// Build result
		const recommendedOpportunity = rankedOpportunities[0] ?? null
		const result = this.buildOptimizationResult(
			strategy,
			action,
			currentPosition,
			recommendedOpportunity,
			rankedOpportunities,
			input,
		)

		globalCache.set(cacheKey, result, this.config.cacheTTL ?? OPTIMIZER_CACHE_TTL)
		return result
	}

	/**
	 * Build the optimization result object
	 */
	private buildOptimizationResult(
		strategy: IOptimizationStrategy,
		action: 'hold' | 'rebalance',
		currentPosition: ProtocolPosition | null,
		recommendedOpportunity: YieldOpportunity | null,
		rankedOpportunities: YieldOpportunity[],
		input: OptimizationInput,
	): ExtendedOptimizationResult {
		const warnings: string[] = []
		let reason = ''

		// Calculate comparison metrics
		let apyDelta = '0.00'
		let estimatedAnnualGain = '0.00'
		let estimatedMonthlyGain = '0.00'

		if (currentPosition && recommendedOpportunity) {
			const currentAPY = parseFloat(currentPosition.apy)
			const newAPY = parseFloat(recommendedOpportunity.supplyAPY)
			apyDelta = (newAPY - currentAPY).toFixed(2)

			const positionValue = parseFloat(currentPosition.valueUSD)
			estimatedAnnualGain = calculateEstimatedGain(positionValue, parseFloat(apyDelta))
			estimatedMonthlyGain = (parseFloat(estimatedAnnualGain) / 12).toFixed(2)
		}

		// Build reason
		if (action === 'hold') {
			if (!currentPosition) {
				reason = 'No current position found'
			} else if (!recommendedOpportunity) {
				reason = 'No better opportunities available'
			} else if (currentPosition.protocol === recommendedOpportunity.protocol) {
				reason = 'Already in the best protocol'
			} else if (parseFloat(apyDelta) < (input.rebalanceConfig.minApyDelta ?? 1.0)) {
				reason = `APY improvement (${apyDelta}%) below threshold (${input.rebalanceConfig.minApyDelta ?? 1.0}%)`
			} else {
				reason = 'Rebalancing not recommended at this time'
			}
		} else {
			reason = `Better yield available: ${recommendedOpportunity?.protocol} offers ${recommendedOpportunity?.supplyAPY}% APY`
		}

		// Calculate confidence
		const confidence = recommendedOpportunity
			? strategy.calculateConfidence(input, recommendedOpportunity)
			: 0

		// Add warnings
		if (recommendedOpportunity) {
			const apy = parseFloat(recommendedOpportunity.supplyAPY)
			if (apy > 15) {
				warnings.push('High APY may indicate elevated risk')
			}

			const tvl = parseFloat(recommendedOpportunity.tvl)
			if (tvl < 50_000_000) {
				warnings.push('Protocol has relatively low TVL')
			}
		}

		if (input.riskProfile.level === 'aggressive') {
			warnings.push('Aggressive risk profile selected')
		}

		// Estimate gas if we have GasAwareStrategy
		let estimatedGasCost: string | undefined
		let netGainAfterGas: string | undefined

		if (currentPosition && recommendedOpportunity && strategy.name === 'gas-aware') {
			const gasStrategy = strategy as GasAwareStrategy
			const gasEstimate = gasStrategy.estimateGasCost(
				currentPosition.protocol as Protocol,
				recommendedOpportunity.protocol,
				input.gasPriceGwei,
				input.ethPriceUSD,
			)
			estimatedGasCost = gasEstimate.gasCostUSD
			netGainAfterGas = (parseFloat(estimatedAnnualGain) - parseFloat(gasEstimate.gasCostUSD)).toFixed(2)
		}

		return {
			action,
			currentProtocol: currentPosition?.protocol,
			currentAPY: currentPosition?.apy,
			recommendedProtocol: recommendedOpportunity?.protocol,
			recommendedAPY: recommendedOpportunity?.supplyAPY,
			apyDelta,
			estimatedMonthlyGain,
			estimatedAnnualGain,
			estimatedGasCost,
			netGainAfterGas,
			reason,
			timestamp: Date.now(),
			strategy: strategy.name,
			rankedOpportunities,
			confidence,
			warnings,
		}
	}

	/**
	 * Compare a position against available opportunities
	 *
	 * @param currentPosition - Current position to compare
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns Comparison details
	 */
	async comparePosition(
		currentPosition: ProtocolPosition,
		token: string,
		chainId: number,
	): Promise<PositionComparison | null> {
		const opportunitiesResult = await this.aggregator.fetchAllOpportunities(token, chainId)
		const opportunities = opportunitiesResult.opportunities

		if (opportunities.length === 0) {
			return null
		}

		// Find best opportunity
		const best = opportunities.reduce((a, b) =>
			parseFloat(a.supplyAPY) > parseFloat(b.supplyAPY) ? a : b,
		)

		const currentAPY = parseFloat(currentPosition.apy)
		const recommendedAPY = parseFloat(best.supplyAPY)
		const apyDelta = recommendedAPY - currentAPY
		const apyImprovementPercent =
			currentAPY > 0 ? ((apyDelta / currentAPY) * 100).toFixed(1) : '0.0'

		const positionValue = parseFloat(currentPosition.valueUSD)
		const estimatedAnnualGainUSD = calculateEstimatedGain(positionValue, apyDelta)
		const estimatedMonthlyGainUSD = (parseFloat(estimatedAnnualGainUSD) / 12).toFixed(2)

		return {
			currentAPY: currentPosition.apy,
			recommendedAPY: best.supplyAPY,
			apyDelta: apyDelta.toFixed(2),
			apyImprovementPercent,
			currentProtocol: currentPosition.protocol as Protocol,
			recommendedProtocol: best.protocol,
			estimatedAnnualGainUSD,
			estimatedMonthlyGainUSD,
		}
	}

	/**
	 * Get detailed rebalance recommendation with gas analysis
	 *
	 * @param currentPosition - Current position
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param rebalanceConfig - Optional rebalance configuration
	 * @param gasPriceGwei - Current gas price in gwei
	 * @param ethPriceUSD - Current ETH price in USD
	 * @returns Detailed optimization result
	 */
	async getRebalanceRecommendation(
		currentPosition: ProtocolPosition,
		token: string,
		chainId: number,
		rebalanceConfig?: Partial<RebalanceConfig>,
		gasPriceGwei?: number,
		ethPriceUSD?: number,
	): Promise<ExtendedOptimizationResult> {
		const config = RebalanceConfigSchema.parse({
			...this.getDefaultRebalanceConfig(),
			...rebalanceConfig,
		})

		const opportunitiesResult = await this.aggregator.fetchAllOpportunities(token, chainId)
		const opportunities = opportunitiesResult.opportunities

		const strategy = this.getStrategy('gas-aware') as GasAwareStrategy
		const profile = this.getDefaultRiskProfile()

		const input: OptimizationInput = {
			currentPosition,
			opportunities,
			riskProfile: profile,
			rebalanceConfig: config,
			gasPriceGwei,
			ethPriceUSD,
		}

		const rankedOpportunities = strategy.rankOpportunities(opportunities, profile)
		const shouldRebalance = strategy.shouldRebalance(input)
		const action = shouldRebalance ? 'rebalance' : 'hold'
		const recommendedOpportunity = rankedOpportunities[0] ?? null

		return this.buildOptimizationResult(
			strategy,
			action,
			currentPosition,
			recommendedOpportunity,
			rankedOpportunities,
			input,
		)
	}

	/**
	 * Check if rebalancing is worth it (simple boolean check)
	 *
	 * @param currentAPY - Current APY as string (e.g., "3.5")
	 * @param newAPY - New APY as string
	 * @param positionValueUSD - Position value in USD
	 * @param estimatedGasCostUSD - Estimated gas cost in USD
	 * @param config - Optional rebalance configuration
	 * @returns Whether rebalancing is recommended
	 */
	isRebalanceWorthIt(
		currentAPY: string,
		newAPY: string,
		positionValueUSD: string,
		estimatedGasCostUSD: string,
		config?: Partial<RebalanceConfig>,
	): boolean {
		const rebalanceConfig = RebalanceConfigSchema.parse({
			...this.getDefaultRebalanceConfig(),
			...config,
		})

		if (!rebalanceConfig.enabled) {
			return false
		}

		const current = parseFloat(currentAPY)
		const target = parseFloat(newAPY)
		const apyDelta = target - current

		// Must meet minimum APY delta
		if (apyDelta < rebalanceConfig.minApyDelta) {
			return false
		}

		const gasCost = parseFloat(estimatedGasCostUSD)
		const maxGasCost = parseFloat(rebalanceConfig.maxGasCostUSD)

		// Gas cost must be under maximum
		if (gasCost > maxGasCost) {
			return false
		}

		// Calculate expected gain over 30 days
		const positionValue = parseFloat(positionValueUSD)
		const thirtyDayGain = (apyDelta / 100) * positionValue * (30 / 365)
		const netGain = thirtyDayGain - gasCost

		// Net gain must meet threshold
		return netGain >= parseFloat(rebalanceConfig.minGainThreshold)
	}

	/**
	 * Estimate break-even days for a rebalance operation
	 *
	 * @param apyDelta - APY improvement in percentage points
	 * @param positionValueUSD - Position value in USD
	 * @param gasCostUSD - Gas cost in USD
	 * @returns Days until break-even, or Infinity if never
	 */
	estimateBreakEvenDays(apyDelta: string, positionValueUSD: string, gasCostUSD: string): number {
		const delta = parseFloat(apyDelta)
		const value = parseFloat(positionValueUSD)
		const gas = parseFloat(gasCostUSD)

		if (delta <= 0 || value <= 0) {
			return Infinity
		}

		const dailyGainPercent = delta / 365
		const dailyGainUSD = (dailyGainPercent / 100) * value

		if (dailyGainUSD <= 0) {
			return Infinity
		}

		return Math.ceil(gas / dailyGainUSD)
	}

	/**
	 * Get the best opportunity across all protocols
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns Best opportunity or null
	 */
	async getBestOpportunity(token: string, chainId: number): Promise<YieldOpportunity | null> {
		return this.aggregator.getBestOpportunity(token, chainId)
	}

	/**
	 * Clear optimizer cache
	 */
	clearCache(): void {
		this.aggregator.clearCache()
	}

	/**
	 * Get available strategy names
	 */
	getAvailableStrategies(): OptimizationStrategy[] {
		return Array.from(this.strategies.keys())
	}
}
