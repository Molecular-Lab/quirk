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
	})
}
