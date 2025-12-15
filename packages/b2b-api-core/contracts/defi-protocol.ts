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
})

