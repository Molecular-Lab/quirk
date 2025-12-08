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
