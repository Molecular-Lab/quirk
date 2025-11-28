import { z } from 'zod';

export const YieldOpportunitySchema = z.object({
	protocol: z.string().describe('Protocol name (e.g., Aave, Compound)'),
	asset: z.string().describe('Asset symbol (e.g., USDC, ETH)'),
	apy: z.number().describe('Annual Percentage Yield'),
	tvl: z.number().optional().describe('Total Value Locked'),
	chain: z.string().describe('Blockchain network'),
});

export const ImpermanentLossSchema = z.object({
	asset1: z.string().describe('First asset in LP pair'),
	asset2: z.string().describe('Second asset in LP pair'),
	priceChange1: z.number().describe('Price change percentage for asset1'),
	priceChange2: z.number().describe('Price change percentage for asset2'),
});

export type YieldOpportunity = z.infer<typeof YieldOpportunitySchema>;
export type ImpermanentLoss = z.infer<typeof ImpermanentLossSchema>;

// Export types from defillama utility
export type {
	Protocol,
	ProtocolDetail,
	ChainTVL,
	FeeProtocol,
	FeeOverview,
	ProtocolFeeDetail,
} from '../utils/defillama.js';

// Export types from yield-engine
export type {
	Protocol as YieldProtocol,
	YieldOpportunity as EngineYieldOpportunity,
	ProtocolPosition,
	ProtocolMetrics,
	OptimizationResult,
	RiskProfile,
	RebalanceConfig,
	AggregatedMetrics,
	AggregatedOpportunities,
	AggregatedPositions,
} from '@proxify/yield-engine';
