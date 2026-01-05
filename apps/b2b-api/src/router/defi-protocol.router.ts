/**
 * DeFi Protocol Router
 * API endpoints for DeFi protocol metrics and execution
 */

import type { initServer } from '@ts-rest/express'
import type { DeFiProtocolService } from '../service/defi-protocol.service'
import type { DeFiExecutionService } from '../service/defi-execution.service'
import type { ClientService } from '../service/client.service'
import type { VaultService } from '../service/vault.service'
import type { DefiTransactionsRepository } from '@quirk/core'
import { defiProtocolContract } from '@quirk/b2b-api-core'

interface DeFiRouterServices {
	defiService: DeFiProtocolService
	executionService?: DeFiExecutionService // Optional for backward compatibility
	clientService?: ClientService // For wallet address lookup
	vaultService?: VaultService // For privy wallet ID lookup
	defiTransactionsRepository?: DefiTransactionsRepository // For transaction history
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
	const defiTransactionsRepository = 'defiTransactionsRepository' in services ? services.defiTransactionsRepository : undefined


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

				// Convert amount from human-readable (e.g., "10") to smallest units
				// USDC has 6 decimals, so multiply by 10^6
				const USDC_DECIMALS = 6
				const amountInSmallestUnits = (BigInt(Math.round(parseFloat(body.amount) * 10 ** USDC_DECIMALS))).toString()

				console.log('[executeDeposit] Amount conversion:', {
					humanReadable: body.amount,
					smallestUnits: amountInSmallestUnits,
					decimals: USDC_DECIMALS,
				})

				const result = await executionService.executeDeposit({
					token: 'USDC',
					chainId,
					amount: amountInSmallestUnits,
					fromAddress,
					riskLevel: body.riskLevel,
					environment: body.environment,
					privyWalletId,
				})

				// Save transaction records to database
				if (result.success && result.transactionHashes.length > 0 && defiTransactionsRepository) {
					try {
						// Get protocol allocation from the result (if available) or use default distribution
						const protocols: ('aave' | 'compound' | 'morpho')[] = ['aave', 'compound', 'morpho']
						const txCount = result.transactionHashes.length
						const amountPerTx = (BigInt(amountInSmallestUnits) / BigInt(txCount)).toString()

						for (let i = 0; i < txCount; i++) {
							const protocol = protocols[i % protocols.length]
							await defiTransactionsRepository.create({
								clientId: client.id,
								vaultId: vault?.id || null,
								endUserId: null,
								txHash: result.transactionHashes[i],
								blockNumber: null,
								chain: chainId.toString(),
								operationType: 'deposit',
								protocol,
								tokenSymbol: 'USDC',
								tokenAddress: usdcAddress,
								amount: amountPerTx,
								gasUsed: null,
								gasPrice: null,
								gasCostEth: null,
								gasCostUsd: null,
								status: 'confirmed', // Mark as confirmed since tx was broadcast
								errorMessage: null,
								environment: body.environment,
								executedAt: new Date(),
								confirmedAt: new Date(),
							})
						}
						console.log(`[executeDeposit] Saved ${txCount} transaction records to database`)
					} catch (dbError) {
						console.error('[executeDeposit] Failed to save transactions to database:', dbError)
						// Don't fail the request - the on-chain tx succeeded
					}
				}

				// Auto-sync balances after successful deposit
				if (result.success && vault && vaultService) {
					try {
						console.log('[executeDeposit] Auto-syncing balances after deposit...')
						const balances = await executionService.fetchAllProtocolBalances(
							fromAddress,
							'USDC',
							chainId
						)
						// balances are already in smallest units
						const totalOnChainBalance = balances.total
						const currentDbBalance = parseFloat(vault.totalStakedBalance || '0')
						const yieldAccrued = totalOnChainBalance - currentDbBalance
						// Store as-is (already in smallest units)
						const totalOnChainBalanceSmallest = Math.round(totalOnChainBalance).toString()
						const yieldAccruedSmallest = Math.round(Math.max(0, yieldAccrued)).toString()
						await vaultService.updateOnChainBalances(vault.id, totalOnChainBalanceSmallest, yieldAccruedSmallest)
						console.log('[executeDeposit] Balances synced successfully')
					} catch (syncError) {
						console.error('[executeDeposit] Failed to auto-sync balances:', syncError)
						// Don't fail the request - the deposit succeeded
					}
				}

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
				// Otherwise, fetch on-chain balances and withdraw proportionally from all protocols
				let withdrawals: Array<{ protocol: 'aave' | 'compound' | 'morpho'; amount: string }> = []

				if (body.protocol) {
					// Single protocol withdrawal
					withdrawals = [{ protocol: body.protocol, amount: body.amount }]
				} else {
					// Multi-protocol proportional withdrawal - fetch on-chain balances
					console.log('[executeWithdrawal] Fetching on-chain balances for proportional withdrawal')

					try {
						const balances = await executionService.fetchAllProtocolBalances(
							toAddress,
							'USDC',
							chainId
						)

						if (balances.total === 0) {
							return {
								status: 400,
								body: {
									success: false,
									transactionHashes: [],
									environment: body.environment,
									error: 'No funds found in any DeFi protocol',
								},
							}
						}

						const withdrawalAmount = parseFloat(body.amount)
						const USDC_DECIMALS = 6

						// Calculate proportional amounts in decimal
						const aaveAmount = (withdrawalAmount * balances.aave) / balances.total
						const compoundAmount = (withdrawalAmount * balances.compound) / balances.total
						const morphoAmount = (withdrawalAmount * balances.morpho) / balances.total

						// Convert to smallest units (micro-USDC) for adapter execution
						const aaveAmountSmallest = Math.round(aaveAmount * 10 ** USDC_DECIMALS).toString()
						const compoundAmountSmallest = Math.round(compoundAmount * 10 ** USDC_DECIMALS).toString()
						const morphoAmountSmallest = Math.round(morphoAmount * 10 ** USDC_DECIMALS).toString()

						// Build withdrawals array (filter out zero amounts)
						withdrawals = ([
							{ protocol: 'aave' as const, amount: aaveAmountSmallest },
							{ protocol: 'compound' as const, amount: compoundAmountSmallest },
							{ protocol: 'morpho' as const, amount: morphoAmountSmallest },
						] as Array<{ protocol: 'aave' | 'compound' | 'morpho'; amount: string }>).filter(w => parseFloat(w.amount) > 0)

						console.log('[executeWithdrawal] Proportional withdrawal calculated', {
							totalBalance: balances.total,
							withdrawalAmount,
							breakdown: withdrawals,
						})
					} catch (balanceError) {
						console.error('[executeWithdrawal] Failed to fetch balances:', balanceError)
						return {
							status: 500,
							body: {
								success: false,
								transactionHashes: [],
								environment: body.environment,
								error: 'Failed to query on-chain balances',
							},
						}
					}
				}

				const result = await executionService.executeWithdrawal({
					token: 'USDC',
					chainId,
					withdrawals,
					toAddress,
					environment: body.environment,
					privyWalletId,
				})

				// Save transaction records to database
				if (result.success && result.transactionHashes.length > 0 && defiTransactionsRepository) {
					try {
						const USDC_DECIMALS = 6

						// For multi-protocol withdrawals, each hash corresponds to a withdrawal in order
						// For single protocol, use the protocol from body or default to aave
						for (let i = 0; i < result.transactionHashes.length; i++) {
							const txHash = result.transactionHashes[i]
							// Get the protocol from the withdrawals array (matches transaction order)
							const withdrawal = withdrawals[i]
							const protocol = withdrawal?.protocol || body.protocol || 'aave'
							const txAmount = withdrawal?.amount || body.amount
							// Convert to smallest units if not already
							const amountNum = parseFloat(txAmount)
							const amountInSmallestUnits = amountNum > 1000
								? txAmount // Already in smallest units
								: (BigInt(Math.round(amountNum * 10 ** USDC_DECIMALS))).toString()

							await defiTransactionsRepository.create({
								clientId: client.id,
								vaultId: vault?.id || null,
								endUserId: null,
								txHash,
								blockNumber: null,
								chain: chainId.toString(),
								operationType: 'withdrawal',
								protocol,
								tokenSymbol: 'USDC',
								tokenAddress: usdcAddress,
								amount: amountInSmallestUnits,
								gasUsed: null,
								gasPrice: null,
								gasCostEth: null,
								gasCostUsd: null,
								status: 'confirmed', // Mark as confirmed since tx was broadcast
								errorMessage: null,
								environment: body.environment,
								executedAt: new Date(),
								confirmedAt: new Date(),
							})
							console.log(`[executeWithdrawal] Saved transaction: ${txHash} for protocol: ${protocol}`)
						}
						console.log(`[executeWithdrawal] Saved ${result.transactionHashes.length} transaction records to database`)
					} catch (dbError) {
						console.error('[executeWithdrawal] Failed to save transactions to database:', dbError)
						// Don't fail the request - the on-chain tx succeeded
					}
				}

				// Auto-sync balances after successful withdrawal
				if (result.success && vault && vaultService) {
					try {
						console.log('[executeWithdrawal] Auto-syncing balances after withdrawal...')
						const balances = await executionService.fetchAllProtocolBalances(
							toAddress,
							'USDC',
							chainId
						)
						// balances are already in smallest units
						const totalOnChainBalance = balances.total
						const currentDbBalance = parseFloat(vault.totalStakedBalance || '0')
						const yieldAccrued = totalOnChainBalance - currentDbBalance
						// Store as-is (already in smallest units)
						const totalOnChainBalanceSmallest = Math.round(totalOnChainBalance).toString()
						const yieldAccruedSmallest = Math.round(Math.max(0, yieldAccrued)).toString()
						await vaultService.updateOnChainBalances(vault.id, totalOnChainBalanceSmallest, yieldAccruedSmallest)
						console.log('[executeWithdrawal] Balances synced successfully')
					} catch (syncError) {
						console.error('[executeWithdrawal] Failed to auto-sync balances:', syncError)
						// Don't fail the request - the withdrawal succeeded
					}
				}

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

		// ========================================================================
		// Transaction History
		// ========================================================================

		getTransactions: async ({ query, headers }) => {
			try {
				if (!defiTransactionsRepository || !clientService) {
					return {
						status: 500,
						body: { error: 'Transaction history not configured', message: 'Missing dependencies' },
					}
				}

				const productId = headers['x-privy-org-id'] as string
				if (!productId) {
					return {
						status: 400,
						body: { error: 'Missing x-privy-org-id header', message: 'Product ID is required' },
					}
				}

				const environment = (headers['x-environment'] as 'sandbox' | 'production') || 'sandbox'

				// Get client
				const client = await clientService.getClientByProductId(productId)
				if (!client) {
					return {
						status: 400,
						body: { error: 'Client not found', message: 'Invalid product ID' },
					}
				}

				const limit = query.limit ?? 20
				const offset = query.offset ?? 0

				// Fetch transactions
				const transactions = await defiTransactionsRepository.listByClient(
					client.id,
					environment,
					limit,
					offset
				)

				// Get total count
				const total = await defiTransactionsRepository.count(client.id, environment)

				return {
					status: 200,
					body: {
						transactions: transactions.map(tx => {
							// Convert amount from smallest units to human-readable
							// USDC has 6 decimals
							const USDC_DECIMALS = 6
							const rawAmount = parseFloat(tx.amount)
							// If amount is > 1000, it's likely in smallest units
							const humanReadableAmount = rawAmount > 1000
								? (rawAmount / 10 ** USDC_DECIMALS).toString()
								: tx.amount

							return {
								id: tx.id,
								txHash: tx.txHash,
								protocol: tx.protocol as 'aave' | 'compound' | 'morpho',
								operationType: tx.operationType as 'deposit' | 'withdrawal' | 'approval',
								tokenSymbol: tx.tokenSymbol,
								amount: humanReadableAmount,
								gasCostUsd: tx.gasCostUsd,
								status: tx.status as 'pending' | 'confirmed' | 'failed',
								chain: tx.chain,
								environment: tx.environment as 'sandbox' | 'production',
								executedAt: tx.executedAt,
								confirmedAt: tx.confirmedAt,
							}
						}),
						total,
						limit,
						offset,
					},
				}
			} catch (error) {
				console.error('Error fetching transactions:', error)
				return {
					status: 500,
					body: {
						error: 'Failed to fetch transactions',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},

		// ========================================================================
		// Balance Sync
		// ========================================================================

		syncBalances: async ({ headers }) => {
			try {
				if (!executionService || !clientService || !vaultService) {
					return {
						status: 500,
						body: { success: false, error: 'Required services not configured' },
					}
				}

				const productId = headers['x-privy-org-id'] as string
				if (!productId) {
					return {
						status: 400,
						body: { success: false, error: 'Missing x-privy-org-id header' },
					}
				}

				const environment = (headers['x-environment'] as 'sandbox' | 'production') || 'sandbox'

				// Get client
				const client = await clientService.getClientByProductId(productId)
				if (!client) {
					return {
						status: 400,
						body: { success: false, error: 'Client not found' },
					}
				}

				// Get chain configuration
				const { chainId, usdcAddress } = getChainConfig(environment)

				// Get vault
				const vault = await vaultService.getVaultByToken(client.id, chainId.toString(), usdcAddress, environment)
				if (!vault || !vault.custodialWalletAddress) {
					return {
						status: 400,
						body: { success: false, error: 'Vault not found or custodial wallet not configured' },
					}
				}

				console.log(`[syncBalances] Syncing balances for vault ${vault.id}, wallet: ${vault.custodialWalletAddress}`)

				// Fetch current on-chain balances from all protocols
				const balances = await executionService.fetchAllProtocolBalances(
					vault.custodialWalletAddress,
					'USDC',
					chainId
				)

				// balances are already in smallest units (micro-USDC)
				const totalOnChainBalance = balances.total

				// Get current DB balance (also in smallest units)
				const currentDbBalance = parseFloat(vault.totalStakedBalance || '0')

				// Calculate yield accrued since last sync (in smallest units)
				const yieldAccrued = totalOnChainBalance - currentDbBalance

				const USDC_DECIMALS = 6
				console.log(`[syncBalances] Balance comparison:`, {
					dbBalance: (currentDbBalance / 10 ** USDC_DECIMALS).toFixed(6) + ' USDC',
					onChainBalance: (totalOnChainBalance / 10 ** USDC_DECIMALS).toFixed(6) + ' USDC',
					yieldAccrued: (yieldAccrued / 10 ** USDC_DECIMALS).toFixed(6) + ' USDC',
					breakdown: {
						aave: (balances.aave / 10 ** USDC_DECIMALS).toFixed(6),
						compound: (balances.compound / 10 ** USDC_DECIMALS).toFixed(6),
						morpho: (balances.morpho / 10 ** USDC_DECIMALS).toFixed(6),
					},
				})

				// Store in DB as-is (already in smallest units)
				const totalOnChainBalanceSmallest = Math.round(totalOnChainBalance).toString()
				const yieldAccruedSmallest = Math.round(Math.max(0, yieldAccrued)).toString()

				// Update vault with new on-chain balances
				await vaultService.updateOnChainBalances(
					vault.id,
					totalOnChainBalanceSmallest,
					yieldAccruedSmallest
				)

				console.log(`[syncBalances] Vault ${vault.id} synced successfully`)

				return {
					status: 200,
					body: {
						success: true,
						vaultId: vault.id,
						previousBalance: (currentDbBalance / 10 ** USDC_DECIMALS).toFixed(6),
						currentBalance: (totalOnChainBalance / 10 ** USDC_DECIMALS).toFixed(6),
						yieldAccrued: (yieldAccrued / 10 ** USDC_DECIMALS).toFixed(6),
						breakdown: {
							aave: (balances.aave / 10 ** USDC_DECIMALS).toFixed(6),
							compound: (balances.compound / 10 ** USDC_DECIMALS).toFixed(6),
							morpho: (balances.morpho / 10 ** USDC_DECIMALS).toFixed(6),
						},
						syncedAt: new Date().toISOString(),
					},
				}
			} catch (error) {
				console.error('[syncBalances] Error:', error)
				return {
					status: 500,
					body: {
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
					},
				}
			}
		},
	})
}

