/**
 * DeFi Protocol Router
 * API endpoints for DeFi protocol metrics and execution
 */

import type { initServer } from '@ts-rest/express'
import type { DeFiProtocolService } from '../service/defi-protocol.service'
import type { DeFiExecutionService } from '../service/defi-execution.service'
import type { ClientService } from '../service/client.service'
import type { VaultService } from '../service/vault.service'
import { defiProtocolContract } from '@quirk/b2b-api-core'

interface DeFiRouterServices {
	defiService: DeFiProtocolService
	executionService?: DeFiExecutionService // Optional for backward compatibility
	clientService?: ClientService // For wallet address lookup
	vaultService?: VaultService // For privy wallet ID lookup
}

/**
 * Get chain configuration based on environment
 * @param environment - 'sandbox' or 'production'
 * @returns { chainId, usdcAddress }
 * NOTE: Must match deposit.router.ts chain configuration!
 */
function getChainConfig(environment: 'sandbox' | 'production'): { chainId: number; usdcAddress: string } {
	if (environment === 'production') {
		return {
			chainId: 8453, // Base Mainnet
			usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Real USDC on Base
		}
	} else {
		return {
			chainId: 11155111, // Ethereum Sepolia (matches deposit.router.ts)
			usdcAddress: '0x2DA55f4c1eCEB0cEeB93ee598e852Bf24Abb8FcE', // MockUSDC on Ethereum Sepolia (matches deposit.router.ts)
		}
	}
}

export const createDeFiProtocolRouter = (
	s: ReturnType<typeof initServer>,
	services: DeFiRouterServices | DeFiProtocolService
) => {
	// Handle both old and new API
	const defiService = 'defiService' in services ? services.defiService : services
	const executionService = 'executionService' in services ? services.executionService : undefined
	const clientService = 'clientService' in services ? services.clientService : undefined
	const vaultService = 'vaultService' in services ? services.vaultService : undefined

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
		prepareDeposit: async ({ body, headers }) => {
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

				if (!clientService) {
					return {
						status: 500,
						body: {
							error: 'Client service not configured',
							message: 'ClientService is not available',
						},
					}
				}

				if (!vaultService) {
					return {
						status: 500,
						body: {
							error: 'Vault service not configured',
							message: 'VaultService is not available',
						},
					}
				}

				// Extract product ID from headers
				const productId = headers['x-privy-org-id'] as string
				if (!productId) {
					return {
						status: 400,
						body: {
							error: 'Missing x-privy-org-id header',
							message: 'Product ID is required',
						},
					}
				}

				// Extract environment from headers
				const environment = (headers['x-environment'] as 'sandbox' | 'production') || 'sandbox'

				// Get client to find client_id
				const client = await clientService.getClientByProductId(productId)
				if (!client) {
					return {
						status: 400,
						body: {
							error: 'Client not found for product ID',
							message: 'Invalid product ID',
						},
					}
				}

				// Get chain configuration based on environment
				const { chainId, usdcAddress } = getChainConfig(environment)

				const vault = await vaultService.getVaultByToken(
					client.id,
					chainId.toString(),
					usdcAddress,
					environment
				)

				if (!vault || !vault.custodialWalletAddress) {
					return {
						status: 400,
						body: {
							error: 'Vault not found. Please create a vault first.',
							message: 'Vault or wallet address not found',
						},
					}
				}

				const fromAddress = vault.custodialWalletAddress

				const result = await executionService.prepareDeposit({
					token: 'USDC',
					chainId,
					amount: body.amount,
					fromAddress,
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
		estimateGas: async ({ body, headers }) => {
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

				if (!clientService) {
					return {
						status: 500,
						body: {
							error: 'Client service not configured',
							message: 'ClientService is not available',
						},
					}
				}

				if (!vaultService) {
					return {
						status: 500,
						body: {
							error: 'Vault service not configured',
							message: 'VaultService is not available',
						},
					}
				}

				// Extract product ID from headers
				const productId = headers['x-privy-org-id'] as string
				if (!productId) {
					return {
						status: 400,
						body: {
							error: 'Missing x-privy-org-id header',
							message: 'Product ID is required',
						},
					}
				}

				// Extract environment from headers
				const environment = (headers['x-environment'] as 'sandbox' | 'production') || 'sandbox'

				// Get client to find client_id
				const client = await clientService.getClientByProductId(productId)
				if (!client) {
					return {
						status: 400,
						body: {
							error: 'Client not found for product ID',
							message: 'Invalid product ID',
						},
					}
				}

				// Get chain configuration based on environment
				const { chainId, usdcAddress } = getChainConfig(environment)

				console.log('[estimateGas] Looking up vault:', {
					clientId: client.id,
					chainId: chainId.toString(),
					usdcAddress,
					environment
				})

				const vault = await vaultService.getVaultByToken(
					client.id,
					chainId.toString(),
					usdcAddress,
					environment
				)

				console.log('[estimateGas] Vault result:', vault ? { id: vault.id, custodialWalletAddress: vault.custodialWalletAddress } : 'null')

				if (!vault || !vault.custodialWalletAddress) {
					return {
						status: 400,
						body: {
							error: 'Vault not found. Please create a vault first.',
							message: `No vault found for chain ${chainId}, token ${usdcAddress}, env ${environment}`,
						},
					}
				}

				const fromAddress = vault.custodialWalletAddress

				const result = await executionService.estimateDepositGas(
					'USDC',
					chainId,
					body.amount,
					fromAddress,
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

		// Execute deposit (custodial - backend signs)
		executeDeposit: async ({ body, headers }) => {
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

				if (!clientService) {
					return {
						status: 500,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Client service not configured',
						},
					}
				}

				if (!vaultService) {
					return {
						status: 500,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Vault service not configured',
						},
					}
				}

				// Extract product ID from headers
				const productId = headers['x-privy-org-id'] as string
				if (!productId) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Missing x-privy-org-id header',
						},
					}
				}

				// Get client to find client_id
				const client = await clientService.getClientByProductId(productId)
				if (!client) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Client not found for product ID',
						},
					}
				}

				// Get chain configuration based on environment
				const { chainId, usdcAddress } = getChainConfig(body.environment)

				const vault = await vaultService.getVaultByToken(
					client.id,
					chainId.toString(),
					usdcAddress,
					body.environment
				)

				if (!vault || !vault.custodialWalletAddress) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Vault not found. Please create a vault first.',
						},
					}
				}

				// For production, privy_wallet_id is required
				if (body.environment === 'production' && !vault.privyWalletId) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Privy wallet not configured for production. Please create a server wallet first.',
						},
					}
				}

				const fromAddress = vault.custodialWalletAddress
				const privyWalletId = vault.privyWalletId || undefined

				const result = await executionService.executeDeposit({
					token: 'USDC',
					chainId,
					amount: body.amount,
					fromAddress,
					riskLevel: body.riskLevel,
					environment: body.environment,
					privyWalletId,
				})

				return {
					status: 200,
					body: result,
				}
			} catch (error) {
				console.error('Error executing deposit:', error)
				return {
					status: 500,
					body: {
						success: false,
						transactionHashes: [],
						environment: body.environment,
						error: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// Execute withdrawal (custodial - backend signs)
		executeWithdrawal: async ({ body, headers }) => {
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

				if (!clientService) {
					return {
						status: 500,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Client service not configured',
						},
					}
				}

				if (!vaultService) {
					return {
						status: 500,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Vault service not configured',
						},
					}
				}

				// Extract product ID from headers
				const productId = headers['x-privy-org-id'] as string
				if (!productId) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Missing x-privy-org-id header',
						},
					}
				}

				// Get client to find client_id
				const client = await clientService.getClientByProductId(productId)
				if (!client) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Client not found for product ID',
						},
					}
				}

				// Get chain configuration based on environment
				const { chainId, usdcAddress } = getChainConfig(body.environment)

				const vault = await vaultService.getVaultByToken(
					client.id,
					chainId.toString(),
					usdcAddress,
					body.environment
				)

				if (!vault || !vault.custodialWalletAddress) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Vault not found. Please create a vault first.',
						},
					}
				}

				// For production, privy_wallet_id is required
				if (body.environment === 'production' && !vault.privyWalletId) {
					return {
						status: 400,
						body: {
							success: false,
							transactionHashes: [],
							environment: body.environment,
							error: 'Privy wallet not configured for production. Please create a server wallet first.',
						},
					}
				}

				const toAddress = vault.custodialWalletAddress
				const privyWalletId = vault.privyWalletId || undefined

				// Build withdrawals array - if protocol is specified, withdraw from that protocol only
				// Otherwise, withdraw proportionally from all protocols
				const withdrawals = body.protocol
					? [{ protocol: body.protocol, amount: body.amount }]
					: [] // Empty array will trigger proportional withdrawal in service

				const result = await executionService.executeWithdrawal({
					token: 'USDC',
					chainId,
					withdrawals,
					toAddress,
					environment: body.environment,
					privyWalletId,
				})

				return {
					status: 200,
					body: result,
				}
			} catch (error) {
				console.error('Error executing withdrawal:', error)
				return {
					status: 500,
					body: {
						success: false,
						transactionHashes: [],
						environment: body.environment,
						error: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},
	})
}

