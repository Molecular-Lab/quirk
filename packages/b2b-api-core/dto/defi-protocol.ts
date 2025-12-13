/**
 * DeFi Protocol DTOs
 */

import { z } from 'zod'

export const ProtocolDataDto = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	token: z.string(),
	chainId: z.number(),
	supplyAPY: z.string(),
	borrowAPY: z.string().optional(),
	tvl: z.string(),
	liquidity: z.string(),
	totalSupplied: z.string(),
	totalBorrowed: z.string().optional(),
	utilization: z.string(),
	risk: z.enum(['Low', 'Medium', 'High']),
	status: z.enum(['healthy', 'warning', 'critical']),
	lastUpdate: z.date(),
	protocolHealth: z.number(),
	rawMetrics: z.any().optional(),
})

export const ProtocolsResponseDto = z.object({
	protocols: z.array(ProtocolDataDto),
	timestamp: z.date(),
})

export const OptimizedAllocationDto = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	percentage: z.number(),
	expectedAPY: z.string(),
	tvl: z.string(),
	rationale: z.string(),
})

export const OptimizationRequestDto = z.object({
	token: z.string(),
	chainId: z.number(),
	riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
})

export const OptimizationResponseDto = z.object({
	riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
	allocation: z.array(OptimizedAllocationDto),
	expectedBlendedAPY: z.string(),
	confidence: z.number(),
	strategy: z.string(),
	timestamp: z.number(),
})

export type ProtocolData = z.infer<typeof ProtocolDataDto>
export type ProtocolsResponse = z.infer<typeof ProtocolsResponseDto>
export type OptimizedAllocation = z.infer<typeof OptimizedAllocationDto>
export type OptimizationRequest = z.infer<typeof OptimizationRequestDto>
export type OptimizationResponse = z.infer<typeof OptimizationResponseDto>

// Multi-Chain Optimization DTOs
export const ChainInfoDto = z.object({
	chainId: z.number(),
	chainName: z.string(),
})

export const ChainOpportunityDto = z.object({
	chainId: z.number(),
	chainName: z.string(),
	protocol: z.enum(['aave', 'compound', 'morpho']),
	supplyAPY: z.string(),
	tvl: z.string(),
	liquidity: z.string(),
	gasPriceGwei: z.number(),
	depositGasCostUSD: z.string(),
	withdrawGasCostUSD: z.string(),
	totalGasCostUSD: z.string(),
})

export const ProtocolAllocationDto = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	percentage: z.number(),
	expectedAPY: z.string(),
	tvl: z.string(),
	rationale: z.string(),
})

export const ChainResultDto = z.object({
	chainId: z.number(),
	chainName: z.string(),
	opportunities: z.array(ChainOpportunityDto),
	allocation: z.array(ProtocolAllocationDto),
	blendedAPY: z.string(),
	totalGasCostUSD: z.string(),
	netAPY: z.string(),
	isRecommended: z.boolean(),
})

export const MultiChainOptimizationRequestDto = z.object({
	token: z.string().default('USDC'),
	riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
	positionSizeUSD: z.number().default(10000),
	holdPeriodDays: z.number().default(30),
})

export const MultiChainOptimizationResponseDto = z.object({
	token: z.string(),
	riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
	positionSizeUSD: z.number(),
	holdPeriodDays: z.number(),
	bestChain: ChainInfoDto,
	allocation: z.array(ProtocolAllocationDto),
	expectedBlendedAPY: z.string(),
	targetAPYRange: z.object({
		min: z.number(),
		max: z.number(),
	}),
	gasEstimate: z.object({
		gasPriceGwei: z.number(),
		depositUSD: z.string(),
		withdrawUSD: z.string(),
		totalUSD: z.string(),
	}),
	netAPY: z.string(),
	allChainResults: z.array(ChainResultDto),
	timestamp: z.number(),
	confidence: z.number(),
})

export type ChainInfo = z.infer<typeof ChainInfoDto>
export type ChainOpportunity = z.infer<typeof ChainOpportunityDto>
export type ProtocolAllocation = z.infer<typeof ProtocolAllocationDto>
export type ChainResult = z.infer<typeof ChainResultDto>
export type MultiChainOptimizationRequest = z.infer<typeof MultiChainOptimizationRequestDto>
export type MultiChainOptimizationResponse = z.infer<typeof MultiChainOptimizationResponseDto>

