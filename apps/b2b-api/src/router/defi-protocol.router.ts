/**
 * DeFi Protocol Router
 * API endpoints for DeFi protocol metrics
 */

import type { initServer } from '@ts-rest/express'
import type { DeFiProtocolService } from '../service/defi-protocol.service'
import { defiProtocolContract } from '@proxify/b2b-api-core'

export const createDeFiProtocolRouter = (s: ReturnType<typeof initServer>, defiService: DeFiProtocolService) => {
	return s.router(defiProtocolContract, {
		// Get all protocols
		getAll: async ({ query }) => {
			try {
				const token = query.token
				const chainId = parseInt(query.chainId, 10)

				const protocols = await defiService.fetchAllProtocols(token, chainId)

				return {
					status: 200,
					body: {
						protocols,
						timestamp: new Date(),
					},
				}
			} catch (error) {
				console.error('Error fetching all protocols:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to fetch protocols',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Get AAVE only
		getAAVE: async ({ query }) => {
			try {
				const token = query.token
				const chainId = parseInt(query.chainId, 10)

				const data = await defiService.fetchAAVEMetrics(token, chainId)

				return {
					status: 200,
					body: data,
				}
			} catch (error) {
				console.error('Error fetching AAVE metrics:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to fetch AAVE metrics',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Get Compound only
		getCompound: async ({ query }) => {
			try {
				const token = query.token
				const chainId = parseInt(query.chainId, 10)

				const data = await defiService.fetchCompoundMetrics(token, chainId)

				return {
					status: 200,
					body: data,
				}
			} catch (error) {
				console.error('Error fetching Compound metrics:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to fetch Compound metrics',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Get Morpho only
		getMorpho: async ({ query }) => {
			try {
				const token = query.token
				const chainId = parseInt(query.chainId, 10)

				const data = await defiService.fetchMorphoMetrics(token, chainId)

				return {
					status: 200,
					body: data,
				}
			} catch (error) {
				console.error('Error fetching Morpho metrics:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to fetch Morpho metrics',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Optimize allocation
		optimize: async ({ body }) => {
			try {
				const { token, chainId, riskLevel } = body

				// Validate inputs
				if (!token || !chainId) {
					return {
						status: 400,
						body: {
							error: 'Invalid request',
							message: 'token and chainId are required',
						},
					}
				}

				if (!['conservative', 'moderate', 'aggressive'].includes(riskLevel)) {
					return {
						status: 400,
						body: {
							error: 'Invalid risk level',
							message: 'riskLevel must be one of: conservative, moderate, aggressive',
						},
					}
				}

				const result = await defiService.optimizeAllocation(token, chainId, riskLevel)

				return {
					status: 200,
					body: result,
				}
			} catch (error) {
				console.error('Error optimizing allocation:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to optimize allocation',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Multi-chain optimization
		optimizeMultiChain: async ({ body }) => {
			try {
				const { token, riskLevel, positionSizeUSD, holdPeriodDays } = body

				// Validate risk level
				if (!['conservative', 'moderate', 'aggressive'].includes(riskLevel)) {
					return {
						status: 400,
						body: {
							error: 'Invalid risk level',
							message: 'riskLevel must be one of: conservative, moderate, aggressive',
						},
					}
				}

				const result = await defiService.optimizeMultiChain(
					token || 'USDC',
					riskLevel,
					positionSizeUSD || 10000,
					holdPeriodDays || 30
				)

				return {
					status: 200,
					body: result,
				}
			} catch (error) {
				console.error('Error in multi-chain optimization:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to optimize across chains',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},
	})
}
