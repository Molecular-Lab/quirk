/**
 * @proxify/yield-engine
 *
 * A comprehensive yield optimization engine that aggregates and compares
 * yields across multiple DeFi protocols (AAVE, Compound, Morpho).
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

export type {
	Protocol,
	ChainId,
	YieldOpportunity,
	ProtocolPosition,
	ProtocolMetrics,
	TokenInfo,
	OptimizationResult,
	RebalanceConfig,
	RiskProfile,
	CacheEntry,
	IProtocolAdapter,
} from './types/common.types'

export {
	YieldOpportunitySchema,
	ProtocolPositionSchema,
	ProtocolMetricsSchema,
	TokenInfoSchema,
	OptimizationResultSchema,
	RebalanceConfigSchema,
	RiskProfileSchema,
	ProtocolError,
	RpcError,
	CacheError,
} from './types/common.types'

// ============================================================================
// Utilities
// ============================================================================

export {
	formatAmount,
	parseAmount,
	formatAPY,
	formatUSD,
	calculatePercentageDiff,
	calculateEstimatedGain,
	isValidNumber,
	compareNumbers,
	getMaxValue,
	getMinValue,
} from './utils/formatting'

export {
	getPublicClient,
	retryWithBackoff,
	batchRpcCalls,
	getBlockNumber,
	getGasPrice,
	estimateGasCostUSD,
	clearClientCache,
	checkRpcHealth,
	SUPPORTED_CHAINS,
} from './utils/rpc'

export {
	MemoryCache,
	globalCache,
	generateCacheKey,
} from './utils/cache'

// ============================================================================
// Protocol Adapters
// ============================================================================

// AAVE V3
export { AaveAdapter } from './protocols/aave/aave.adapter'
export type { AaveReserveData, AaveUserReserveData, AaveConfig } from './protocols/aave/aave.types'
export {
	AAVE_POOL_ADDRESSES,
	AAVE_DATA_PROVIDER_ADDRESSES,
	AAVE_SUPPORTED_TOKENS,
	getPoolAddress,
	getDataProviderAddress,
	getTokenAddress,
	getTokenInfo,
	isTokenSupported,
	getSupportedTokens,
} from './protocols/aave/aave.constants'

// Compound V3
export { CompoundAdapter } from './protocols/compound/compound.adapter'
export type {
	CometUserBasic,
	CometAssetInfo,
	CometMarketConfig,
} from './protocols/compound/compound.types'
export {
	COMPOUND_MARKETS,
	getMarketConfig,
	getCometAddress,
	getBaseTokenAddress,
	getTokenInfo as getCompoundTokenInfo,
	isTokenSupported as isCompoundTokenSupported,
	getSupportedTokens as getCompoundSupportedTokens,
} from './protocols/compound/compound.constants'

// Morpho
export { MorphoAdapter } from './protocols/morpho/morpho.adapter'
export type {
	MorphoMarketConfig,
	MorphoMarketParams,
	MorphoMarketState,
	MorphoPosition,
	MetaMorphoVaultData,
} from './protocols/morpho/morpho.types'
export {
	MORPHO_VAULTS,
	MORPHO_BLUE_ADDRESS,
	getVaultConfig,
	getVaultAddress,
	getBaseTokenAddress as getMorphoBaseTokenAddress,
	getTokenInfo as getMorphoTokenInfo,
	isTokenSupported as isMorphoTokenSupported,
	getSupportedTokens as getMorphoSupportedTokens,
} from './protocols/morpho/morpho.constants'

// ============================================================================
// Aggregator & Optimizer (Phase 5)
// ============================================================================

// Aggregator
export { YieldAggregator } from './aggregator/yield-aggregator'
export type {
	AggregatorConfig,
	AggregatedMetrics,
	AggregatedOpportunities,
	AggregatedPositions,
	OpportunityFilter,
} from './aggregator/aggregator.types'
export { AggregatorConfigSchema, AggregatedMetricsSchema } from './aggregator/aggregator.types'

// Optimizer
export { YieldOptimizer } from './optimizer/yield-optimizer'
export type {
	OptimizerConfig,
	OptimizationInput,
	ExtendedOptimizationResult,
	IOptimizationStrategy,
	OptimizationStrategy,
	GasEstimate,
	PositionComparison,
	ProtocolRiskAssessment,
	OptimizationHistoryEntry,
} from './optimizer/optimizer.types'
export { OptimizerConfigSchema } from './optimizer/optimizer.types'

// Strategies
export {
	HighestYieldStrategy,
	RiskAdjustedStrategy,
	GasAwareStrategy,
} from './optimizer/strategies'

// Multi-Chain Optimizer
export { MultiChainOptimizer } from './optimizer/multi-chain-optimizer'
export type {
	SupportedChainId,
	RiskLevel,
	ChainOpportunity,
	ChainResult,
	ProtocolAllocation,
	MultiChainOptimizationResult,
	MultiChainOptimizerConfig,
} from './optimizer/multi-chain-optimizer.types'
export {
	SUPPORTED_CHAINS as MULTI_CHAIN_SUPPORTED_CHAINS,
	CHAIN_INFO,
	RISK_TARGET_APY,
	PROTOCOL_GAS_UNITS,
	MultiChainOptimizerConfigSchema,
} from './optimizer/multi-chain-optimizer.types'
