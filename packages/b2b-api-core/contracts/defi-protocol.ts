/**
 * DeFi Protocol Contract
 * Type-safe API definitions for DeFi protocol metrics
 */

import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { ErrorResponseDto } from '../dto'
import {
	ProtocolDataDto,
	ProtocolsResponseDto,
	OptimizationRequestDto,
	OptimizationResponseDto,
	MultiChainOptimizationRequestDto,
	MultiChainOptimizationResponseDto,
	// Execution DTOs
	PrepareDepositRequestDto,
	PrepareDepositResponseDto,
	PrepareWithdrawalRequestDto,
	PrepareWithdrawalResponseDto,
	EstimateGasRequestDto,
	EstimateGasResponseDto,
	CheckApprovalsRequestDto,
	CheckApprovalsResponseDto,
	DepositExecutionRequestDto,
	WithdrawalExecutionRequestDto,
	ExecutionResultDto,
} from '../dto/defi-protocol'

const c = initContract()

export const defiProtocolContract = c.router({
	// Get all protocols
	getAll: {
		method: 'GET',
		path: '/defi/protocols',
		query: z.object({
			token: z.string(),
			chainId: z.coerce.string(),
		}),
		responses: {
			200: ProtocolsResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Get all DeFi protocol metrics',
	},

	// Get AAVE only
	getAAVE: {
		method: 'GET',
		path: '/defi/protocols/aave',
		query: z.object({
			token: z.string(),
			chainId: z.coerce.string(),
		}),
		responses: {
			200: ProtocolDataDto,
			500: ErrorResponseDto,
		},
		summary: 'Get AAVE protocol metrics',
	},

	// Get Compound only
	getCompound: {
		method: 'GET',
		path: '/defi/protocols/compound',
		query: z.object({
			token: z.string(),
			chainId: z.coerce.string(),
		}),
		responses: {
			200: ProtocolDataDto,
			500: ErrorResponseDto,
		},
		summary: 'Get Compound protocol metrics',
	},

	// Get Morpho only
	getMorpho: {
		method: 'GET',
		path: '/defi/protocols/morpho',
		query: z.object({
			token: z.string(),
			chainId: z.coerce.string(),
		}),
		responses: {
			200: ProtocolDataDto,
			500: ErrorResponseDto,
		},
		summary: 'Get Morpho protocol metrics',
	},

	// Get APYs summary (lightweight endpoint for client-side caching)
	getAPYs: {
		method: 'GET',
		path: '/defi/apys',
		query: z.object({
			token: z.string(),
			chainId: z.coerce.string(),
		}),
		responses: {
			200: z.object({
				aave: z.string(),
				compound: z.string(),
				morpho: z.string(),
				timestamp: z.string(),
			}),
			500: ErrorResponseDto,
		},
		summary: 'Get APYs summary for all protocols (lightweight)',
	},

	// Optimize allocation based on risk profile (single chain)
	optimize: {
		method: 'POST',
		path: '/defi/optimize',
		body: OptimizationRequestDto,
		responses: {
			200: OptimizationResponseDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Get optimized portfolio allocation based on risk profile',
	},

	// Multi-chain optimization (compares across Ethereum, Base, Arbitrum, Polygon)
	optimizeMultiChain: {
		method: 'POST',
		path: '/defi/optimize-multi',
		body: MultiChainOptimizationRequestDto,
		responses: {
			200: MultiChainOptimizationResponseDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Get optimized allocation across multiple chains with gas-aware net APY',
	},

	// ========================================================================
	// Execution Endpoints (Phase 2)
	// ========================================================================

	/**
	 * Prepare deposit transactions
	 * Returns unsigned transaction data for wallet signing
	 */
	prepareDeposit: {
		method: 'POST',
		path: '/defi/execute/prepare-deposit',
		body: PrepareDepositRequestDto,
		responses: {
			200: PrepareDepositResponseDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Prepare deposit transactions with risk-based allocation',
	},

	/**
	 * Prepare withdrawal transactions
	 * Returns unsigned transaction data for wallet signing
	 */
	prepareWithdrawal: {
		method: 'POST',
		path: '/defi/execute/prepare-withdrawal',
		body: PrepareWithdrawalRequestDto,
		responses: {
			200: PrepareWithdrawalResponseDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Prepare withdrawal transactions from specified protocols',
	},

	/**
	 * Estimate gas for deposit operation
	 */
	estimateGas: {
		method: 'POST',
		path: '/defi/execute/estimate-gas',
		body: EstimateGasRequestDto,
		responses: {
			200: EstimateGasResponseDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Estimate gas cost for deposit across protocols',
	},

	/**
	 * Check if approvals are needed before deposit
	 */
	checkApprovals: {
		method: 'POST',
		path: '/defi/execute/check-approvals',
		body: CheckApprovalsRequestDto,
		responses: {
			200: CheckApprovalsResponseDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Check ERC-20 allowances for each protocol',
	},

	/**
	 * Execute deposit (custodial - backend signs transactions)
	 */
	executeDeposit: {
		method: 'POST',
		path: '/defi/execute/deposit',
		body: DepositExecutionRequestDto,
		responses: {
			200: ExecutionResultDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Execute deposit with backend-managed wallet signing',
	},

	/**
	 * Execute withdrawal (custodial - backend signs transactions)
	 */
	executeWithdrawal: {
		method: 'POST',
		path: '/defi/execute/withdraw',
		body: WithdrawalExecutionRequestDto,
		responses: {
			200: ExecutionResultDto,
			400: ErrorResponseDto,
			500: ErrorResponseDto,
		},
		summary: 'Execute withdrawal with backend-managed wallet signing',
	},
})


