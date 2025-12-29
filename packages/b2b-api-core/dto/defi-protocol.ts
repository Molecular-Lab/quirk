/**
 * DeFi Protocol DTOs
 */

import { z } from 'zod'

export const ProtocolDataDto = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	token: z.string(),
	chainId: z.coerce.number(),
	supplyAPY: z.string(),
	borrowAPY: z.string().optional(),
	tvl: z.string(),
	liquidity: z.string(),
	totalSupplied: z.string(),
	totalBorrowed: z.string().optional(),
	utilization: z.string(),
	risk: z.enum(['Low', 'Medium', 'High']),
	status: z.enum(['healthy', 'warning', 'critical']),
	lastUpdate: z.coerce.date(),
	protocolHealth: z.coerce.number(),
	rawMetrics: z.any().optional(),
})

export const ProtocolsResponseDto = z.object({
	protocols: z.array(ProtocolDataDto),
	timestamp: z.coerce.date(),
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

// ============================================================================
// Execution DTOs (Phase 2 - Deposit/Withdrawal Execution)
// ============================================================================

/**
 * Transaction request ready for wallet signing
 */
export const TransactionRequestDto = z.object({
	to: z.string(),
	data: z.string(),
	value: z.string().optional(),
	gasLimit: z.string().optional(),
	chainId: z.number(),
})

/**
 * Prepared transaction with metadata
 */
export const PreparedTransactionDto = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	transaction: TransactionRequestDto,
	amount: z.string(),
	percentage: z.number().optional(),
})

/**
 * Request to prepare deposit transactions
 */
export const PrepareDepositRequestDto = z.object({
	token: z.string().default('USDC'),
	chainId: z.number().default(1),
	amount: z.string().describe('Amount in token smallest unit (e.g., "1000000000" for 1000 USDC)'),
	fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
	riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
})

/**
 * Response with prepared deposit transactions
 */
export const PrepareDepositResponseDto = z.object({
	transactions: z.array(PreparedTransactionDto),
	allocation: z.array(z.object({
		protocol: z.enum(['aave', 'compound', 'morpho']),
		percentage: z.number(),
		amount: z.string(),
		expectedAPY: z.string(),
	})),
	totalAmount: z.string(),
	expectedBlendedAPY: z.string(),
	riskLevel: z.string(),
})

/**
 * Request to prepare withdrawal transactions
 */
export const PrepareWithdrawalRequestDto = z.object({
	token: z.string().default('USDC'),
	chainId: z.number().default(1),
	withdrawals: z.array(z.object({
		protocol: z.enum(['aave', 'compound', 'morpho']),
		amount: z.string(),
	})),
	toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
})

/**
 * Response with prepared withdrawal transactions
 */
export const PrepareWithdrawalResponseDto = z.object({
	transactions: z.array(PreparedTransactionDto),
})

/**
 * Request to estimate gas for deposit
 */
export const EstimateGasRequestDto = z.object({
	token: z.string().default('USDC'),
	chainId: z.number().default(1),
	amount: z.string(),
	fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
	riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
})

/**
 * Gas estimate response
 */
export const EstimateGasResponseDto = z.object({
	totalGas: z.string(),
	perProtocol: z.array(z.object({
		protocol: z.enum(['aave', 'compound', 'morpho']),
		gasEstimate: z.string(),
	})),
	estimatedCostUSD: z.string().optional(),
})

/**
 * Check approvals request
 */
export const CheckApprovalsRequestDto = z.object({
	token: z.string().default('USDC'),
	chainId: z.number().default(1),
	owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
	allocations: z.array(z.object({
		protocol: z.enum(['aave', 'compound', 'morpho']),
		amount: z.string(),
	})),
})

/**
 * Check approvals response
 */
export const CheckApprovalsResponseDto = z.object({
	approvals: z.array(z.object({
		protocol: z.enum(['aave', 'compound', 'morpho']),
		needsApproval: z.boolean(),
		currentAllowance: z.string(),
	})),
})

// Type exports for execution
export type TransactionRequest = z.infer<typeof TransactionRequestDto>
export type PreparedTransaction = z.infer<typeof PreparedTransactionDto>
export type PrepareDepositRequest = z.infer<typeof PrepareDepositRequestDto>
export type PrepareDepositResponse = z.infer<typeof PrepareDepositResponseDto>
export type PrepareWithdrawalRequest = z.infer<typeof PrepareWithdrawalRequestDto>
export type PrepareWithdrawalResponse = z.infer<typeof PrepareWithdrawalResponseDto>
export type EstimateGasRequest = z.infer<typeof EstimateGasRequestDto>
export type EstimateGasResponse = z.infer<typeof EstimateGasResponseDto>
export type CheckApprovalsRequest = z.infer<typeof CheckApprovalsRequestDto>
export type CheckApprovalsResponse = z.infer<typeof CheckApprovalsResponseDto>
