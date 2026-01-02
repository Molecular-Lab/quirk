/**
 * DeFi Protocol Router
 * API endpoints for DeFi protocol metrics and execution
 */

import type { initServer } from '@ts-rest/express'
import type { DeFiProtocolService } from '../service/defi-protocol.service'
import type { DeFiExecutionService } from '../service/defi-execution.service'
import { defiProtocolContract } from '@quirk/b2b-api-core'

interface DeFiRouterServices {
	defiService: DeFiProtocolService
	executionService?: DeFiExecutionService // Optional for backward compatibility
}

export const createDeFiProtocolRouter = (
	s: ReturnType<typeof initServer>,
	services: DeFiRouterServices | DeFiProtocolService
) => {
	// Handle both old and new API
	const defiService = 'defiService' in services ? services.defiService : services
	const executionService = 'executionService' in services ? services.executionService : undefined

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

		// Get APYs summary (lightweight endpoint for client-side caching)
		getAPYs: async ({ query }) => {
			try {
				const token = query.token
				const chainId = parseInt(query.chainId, 10)

				console.log('[DeFi Router] Fetching APYs summary:', { token, chainId })

				const data = await defiService.getAPYsSummary(token, chainId)

				console.log('[DeFi Router] APYs summary fetched:', data)

				return {
					status: 200,
					body: data,
				}
			} catch (error) {
				console.error('Error fetching APYs summary:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to fetch APYs summary',
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

		// ========================================================================
		// Execution Endpoints (Phase 2)
		// ========================================================================

		// Prepare deposit transactions
		prepareDeposit: async ({ body }) => {
			try {
				if (!executionService) {
					return {
						status: 500,
						body: {
							error: 'Execution service not configured',
							message: 'DeFiExecutionService is not available',
						},
					}
				}

				const result = await executionService.prepareDeposit({
					token: body.token,
					chainId: body.chainId,
					amount: body.amount,
					fromAddress: body.fromAddress,
					riskLevel: body.riskLevel,
				})

				return {
					status: 200,
					body: result,
				}
			} catch (error) {
				console.error('Error preparing deposit:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to prepare deposit',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Prepare withdrawal transactions
		prepareWithdrawal: async ({ body }) => {
			try {
				if (!executionService) {
					return {
						status: 500,
						body: {
							error: 'Execution service not configured',
							message: 'DeFiExecutionService is not available',
						},
					}
				}

				const transactions = await executionService.prepareWithdrawal({
					token: body.token,
					chainId: body.chainId,
					withdrawals: body.withdrawals,
					toAddress: body.toAddress,
				})

				return {
					status: 200,
					body: { transactions },
				}
			} catch (error) {
				console.error('Error preparing withdrawal:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to prepare withdrawal',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Estimate gas for deposit
		estimateGas: async ({ body }) => {
			try {
				if (!executionService) {
					return {
						status: 500,
						body: {
							error: 'Execution service not configured',
							message: 'DeFiExecutionService is not available',
						},
					}
				}

				const result = await executionService.estimateDepositGas(
					body.token,
					body.chainId,
					body.amount,
					body.fromAddress,
					body.riskLevel
				)

				return {
					status: 200,
					body: result,
				}
			} catch (error) {
				console.error('Error estimating gas:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to estimate gas',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Check approvals
		checkApprovals: async ({ body }) => {
			try {
				if (!executionService) {
					return {
						status: 500,
						body: {
							error: 'Execution service not configured',
							message: 'DeFiExecutionService is not available',
						},
					}
				}

				const approvals = await executionService.checkApprovals(
					body.token,
					body.chainId,
					body.owner,
					body.allocations
				)

				return {
					status: 200,
					body: { approvals },
				}
			} catch (error) {
				console.error('Error checking approvals:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to check approvals',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},
	})
}

