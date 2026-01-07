/**
 * Withdrawal Router - B2B withdrawal endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@quirk/b2b-api-core";
import type { WithdrawalService } from "../service/withdrawal.service";
import type { ClientService } from "../service/client.service";
import type { VaultService } from "../service/vault.service";
import { mapWithdrawalToDto, mapWithdrawalsToDto } from "../mapper/withdrawal.mapper";
import { logger } from "../logger";
import { ENV } from "../env";

// Constants for token addresses
const BASE_MAINNET_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Real USDC on Base Mainnet
const ETH_SEPOLIA_MOCK_USDC = '0x2DA55f4c1eCEB0cEeB93ee598e852Bf24Abb8FcE'; // MockUSDC on Ethereum Sepolia

export function createWithdrawalRouter(
	s: ReturnType<typeof initServer>,
	withdrawalService: WithdrawalService,
	clientService: ClientService,
	vaultService: VaultService
) {
	return s.router(b2bContract.withdrawal, {
		// POST /withdrawals - Request withdrawal
		create: async ({ body, req }) => {
			try {
				// ✅ Extract clientId from authenticated request (set by API key middleware)
				const clientId = (req as any).apiKeyClient?.id;
				if (!clientId) {
					logger.error("Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: { error: "Authentication failed - client ID not found" },
					};
				}

				// Determine environment (default to sandbox if not specified)
				const environment = body.environment || "sandbox";

				// Parse vaultId from request body to extract chain and tokenAddress
				// Format: "chainId-tokenAddress" (e.g., "8453-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
				// vaultId is optional - if not provided, derive from environment
				let chain: string;
				let tokenAddress: string;

				if (body.vaultId) {
					const [chainPart, tokenPart] = body.vaultId.split("-");
					if (!chainPart || !tokenPart) {
						return {
							status: 400 as const,
							body: { error: "Invalid vaultId format. Expected: chainId-tokenAddress" },
						};
					}
					chain = chainPart;
					tokenAddress = tokenPart;
				} else {
					// Derive from environment
					if (environment === "production") {
						chain = "8453"; // Base Mainnet
						tokenAddress = BASE_MAINNET_USDC;
					} else {
						chain = "11155111"; // Ethereum Sepolia for sandbox
						tokenAddress = ETH_SEPOLIA_MOCK_USDC;
					}
				}

				logger.info("Requesting withdrawal", {
					clientId,
					userId: body.userId,
					vaultId: body.vaultId,
					amount: body.amount,
					deductFees: body.deductFees,
				});

				const withdrawal = await withdrawalService.requestWithdrawal({
					clientId, // ✅ Use clientId from authenticated request
					userId: body.userId,
					chain: chain, // From vaultId
					tokenAddress: tokenAddress, // From vaultId
					amount: body.amount,
					orderId: `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					destinationType: "client_balance",
					destinationDetails: null,
					deductFees: body.deductFees, // ✅ Pass fee deduction control
					environment: body.environment || "sandbox",
					network: body.network || (body.environment === "production" ? "mainnet" : "sepolia"),
					oracleAddress: undefined,
				});

				return {
					status: 201 as const,
					body: {
						id: withdrawal.id,
						clientId: withdrawal.clientId,
						userId: withdrawal.userId,
						vaultId: body.vaultId, // Echo back from request
						requestedAmount: withdrawal.requestedAmount,
						sharesBurned: undefined, // TODO: Get from withdrawal response
						finalAmount: withdrawal.actualAmount || undefined,
						status: withdrawal.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: withdrawal.createdAt.toISOString(),
						feeBreakdown: withdrawal.feeBreakdown, // ✅ Include fee breakdown
					},
				};
			} catch (error) {
				logger.error("Failed to request withdrawal", { error, body });
				return {
					status: 400 as const,
					body: { error: "Failed to request withdrawal" },
				};
			}
		},

		// GET /withdrawals/pending - List pending withdrawals (Operations Dashboard)
		// ⚠️ IMPORTANT: Specific routes MUST come before generic /:id routes
		listPending: async ({ query, req }) => {
			try {
				// Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;

				// For dashboard (Privy auth), show all withdrawals across all products
				if (privySession) {
					logger.info("Fetching pending withdrawals (Dashboard)", {
						privyOrgId: privySession.organizationId,
						productsCount: privySession.products.length,
						environment: environment || "all",
					});

					// ✅ Pass environment to filter at DB level
					const withdrawals = await withdrawalService.listPendingWithdrawals(environment);

					// Filter to only withdrawals from this organization's products
					const productIds = privySession.products.map((p: any) => p.id);
					const filteredWithdrawals = withdrawals.filter((w) => productIds.includes(w.clientId));

					logger.info("Pending withdrawals fetched successfully (Dashboard)", {
						privyOrgId: privySession.organizationId,
						count: filteredWithdrawals.length,
					});

					return {
						status: 200 as const,
						body: {
							withdrawals: filteredWithdrawals.map((w) => ({
								id: w.id,
								clientId: w.clientId,
								userId: w.userId,
								requestedAmount: w.requestedAmount,
								status: w.status.toUpperCase() as any,
								createdAt: w.createdAt.toISOString(),
								// Map destination_type to withdrawal_method
								withdrawal_method: w.destinationType === "client_balance" ? "fiat_to_client" : "fiat_to_end_user",
								destination_currency: w.currency || "USD",
								environment: w.environment,
							})),
						},
					};
				}

				// For SDK (API key), show withdrawals for single client only
				if (apiKeyClient) {
					logger.info("Fetching pending withdrawals (SDK)", {
						clientId: apiKeyClient.id,
						environment: environment || "all",
					});

					// ✅ Pass environment to filter at DB level
					const withdrawals = await withdrawalService.listPendingWithdrawalsByClient(
						apiKeyClient.id,
						environment
					);

					logger.info("Pending withdrawals fetched successfully (SDK)", {
						clientId: apiKeyClient.id,
						count: withdrawals.length,
					});

					return {
						status: 200 as const,
						body: {
							withdrawals: withdrawals.map((w) => ({
								id: w.id,
								clientId: w.clientId,
								userId: w.userId,
								requestedAmount: w.requestedAmount,
								status: w.status.toUpperCase() as any,
								createdAt: w.createdAt.toISOString(),
								// Map destination_type to withdrawal_method
								withdrawal_method: w.destinationType === "client_balance" ? "fiat_to_client" : "fiat_to_end_user",
								destination_currency: w.currency || "USD",
								environment: w.environment,
							})),
						},
					};
				}

				// Neither auth found
				logger.error("Authentication missing for list pending withdrawals");
				return {
					status: 401 as const,
					body: {
						error: "Authentication required",
					},
				};
			} catch (error) {
				logger.error("Failed to list pending withdrawals", { error });
				return {
					status: 500 as const,
					body: {
						error: "Failed to list pending withdrawals",
						details: error instanceof Error ? error.message : String(error),
					},
				};
			}
		},

		// GET /withdrawals/client/:clientId
		listByClient: async ({ params, query, req }) => {
			try {
				// ✅ Dual Auth: Check for both API key (SDK) and Privy (Dashboard)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				// Validate access
				if (apiKeyClient) {
					// SDK: Only allow access to own client data
					if (params.clientId !== apiKeyClient.id) {
						logger.warn("[Withdrawal Router] SDK client attempting to access other client's data", {
							requestedClientId: params.clientId,
							authenticatedClientId: apiKeyClient.id,
						});
						return {
							status: 403 as const,
							body: { error: "Access denied - cannot view other clients' withdrawals" },
						};
					}
				} else if (privySession) {
					// Dashboard: Check if clientId belongs to any product under this organization
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(params.clientId)) {
						logger.warn("[Withdrawal Router] Dashboard user attempting to access unauthorized client", {
							requestedClientId: params.clientId,
							authorizedProductIds: productIds,
						});
						return {
							status: 403 as const,
							body: { error: "Access denied - client not in your organization" },
						};
					}
				} else {
					// No auth present (should not happen due to server.ts middleware)
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
					};
				}

				const limit = query?.limit ? parseInt(query.limit) : 50;
				const offset = query?.offset ? parseInt(query.offset) : 0;

				const withdrawals = await withdrawalService.listWithdrawalsByClient(params.clientId, limit, offset);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: withdrawals.map(w => ({
						id: w.id,
						clientId: w.clientId,
						userId: w.userId,
						vaultId: vaultId,
						requestedAmount: w.requestedAmount,
						sharesBurned: undefined,
						finalAmount: w.actualAmount || undefined,
						status: w.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: w.createdAt.toISOString(),
					})),
				};
			} catch (error) {
				logger.error("Failed to list withdrawals", { error, clientId: params.clientId });
				return {
					status: 500 as const,
					body: {
						error: "Failed to list client withdrawals",
						details: error instanceof Error ? error.message : String(error),
					},
				};
			}
		},

		// GET /withdrawals/user/:userId
		listByUser: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;

				// Note: API contract uses userId, but UseCase needs clientId + userId
				// This is a simplification - in production, fetch user first to get clientId
				const withdrawals = await withdrawalService.listWithdrawalsByUser("", params.userId, limit);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: withdrawals.map(w => ({
						id: w.id,
						clientId: w.clientId,
						userId: w.userId,
						vaultId: vaultId,
						requestedAmount: w.requestedAmount,
						sharesBurned: undefined,
						finalAmount: w.actualAmount || undefined,
						status: w.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: w.createdAt.toISOString(),
					})),
				};
			} catch (error) {
				logger.error("Failed to list user withdrawals", { error, userId: params.userId });
				return {
					status: 500 as const,
					body: {
						error: "Failed to list user withdrawals",
						details: error instanceof Error ? error.message : String(error),
					},
				};
			}
		},

		// GET /withdrawals/stats/:clientId
		getStats: async ({ params, req }) => {
			try {
				// ✅ Dual Auth: Check for both API key (SDK) and Privy (Dashboard)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				// Validate access
				if (apiKeyClient) {
					// SDK: Only allow access to own client data
					if (params.clientId !== apiKeyClient.id) {
						logger.warn("[Withdrawal Router] SDK client attempting to access other client's stats", {
							requestedClientId: params.clientId,
							authenticatedClientId: apiKeyClient.id,
						});
						return {
							status: 403 as const,
							body: { error: "Access denied - cannot view other clients' stats" },
						};
					}
				} else if (privySession) {
					// Dashboard: Check if clientId belongs to any product under this organization
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(params.clientId)) {
						logger.warn("[Withdrawal Router] Dashboard user attempting to access unauthorized client stats", {
							requestedClientId: params.clientId,
							authorizedProductIds: productIds,
						});
						return {
							status: 403 as const,
							body: { error: "Access denied - client not in your organization" },
						};
					}
				} else {
					// No auth present (should not happen due to server.ts middleware)
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
					};
				}

				// Default to last 30 days
				const endDate = new Date();
				const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

				const stats = await withdrawalService.getWithdrawalStats(
					params.clientId,
					startDate,
					endDate
				);

				return {
					status: 200 as const,
					body: {
						totalWithdrawals: stats?.totalWithdrawals || "0",
						completedWithdrawals: stats?.completedWithdrawals || "0",
						totalAmount: stats?.totalVolume || "0",
						averageAmount: stats?.avgWithdrawalAmount || "0",
					},
				};
			} catch (error) {
				logger.error("Failed to get withdrawal stats", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: {
						totalWithdrawals: "0",
						completedWithdrawals: "0",
						totalAmount: "0",
						averageAmount: "0",
					},
				};
			}
		},

		// POST /withdrawals/batch-complete - Batch complete withdrawals (Operations Dashboard)
		batchCompleteWithdrawals: async ({ body, req }) => {
			try {
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				// For Privy session: Use first product as default client
				const clientId = apiKeyClient?.id || privySession?.products[0]?.id;

				if (!clientId) {
					logger.error("Authentication missing for batch complete withdrawals");
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
					};
				}

				logger.info("Batch completing withdrawals", {
					withdrawalIds: body.withdrawalIds,
					count: body.withdrawalIds.length,
					destinationCurrency: body.destinationCurrency,
					clientId,
					authType: apiKeyClient?.id ? "api_key" : "privy",
				});

				const completedWithdrawals: Array<{
					withdrawalId: string;
					status: string;
					fiatAmount: string;
					transferTxHash?: string;
				}> = [];

				const failedWithdrawals: Array<{
					withdrawalId: string;
					error: string;
				}> = [];

				let totalFiat = 0;
				let batchEnvironment: "sandbox" | "production" = "sandbox"; // Track environment for batch

				// Process each withdrawal
				for (const withdrawalId of body.withdrawalIds) {
					// 1. Get withdrawal from withdrawal_transactions table
					const withdrawal = await withdrawalService.getWithdrawalByOrderId(withdrawalId);
					if (!withdrawal) {
						logger.warn(`Withdrawal not found: ${withdrawalId}`);
						failedWithdrawals.push({
							withdrawalId,
							error: "Withdrawal not found",
						});
						continue;
					}

					logger.info(`[Batch Complete] Processing withdrawal ${withdrawalId}`, {
						withdrawalClientId: withdrawal.clientId,
						withdrawalStatus: withdrawal.status,
						authType: apiKeyClient?.id ? "api_key" : "privy",
					});

					// 2. Verify authorization
					let authorized = false;

					// For API key: withdrawal must belong to this client
					if (apiKeyClient?.id) {
						authorized = withdrawal.clientId === apiKeyClient.id;
						if (!authorized) {
							logger.warn(`Withdrawal ${withdrawalId} does not belong to API key client ${apiKeyClient.id}`);
						}
					}
					// For Privy: withdrawal can belong to any of the organization's products
					else if (privySession) {
						const clientIds = privySession.products.map((p: any) => p.id);

						logger.info(`[Batch Complete] Privy authorization check`, {
							withdrawalId,
							withdrawalClientId: withdrawal.clientId,
							privyProductClientIds: clientIds,
						});

						authorized = clientIds.includes(withdrawal.clientId);
						if (!authorized) {
							logger.warn(`Withdrawal ${withdrawalId} not in Privy org's products`, {
								privyOrgId: privySession.organizationId,
								withdrawalClientId: withdrawal.clientId,
								availableClientIds: clientIds,
							});
						}
					}

					if (!authorized) {
						logger.warn(`[Batch Complete] Withdrawal ${withdrawalId} not authorized, skipping`);
						failedWithdrawals.push({
							withdrawalId,
							error: "Not authorized",
						});
						continue;
					}

					// 3. Verify withdrawal is pending
					if (withdrawal.status !== "pending") {
						logger.warn(`Withdrawal ${withdrawalId} is already ${withdrawal.status}`);
						failedWithdrawals.push({
							withdrawalId,
							error: `Already ${withdrawal.status}`,
						});
						continue;
					}

					// 4. Track environment (first withdrawal sets the batch environment)
					const withdrawalEnvironment = (withdrawal.environment as "sandbox" | "production") || "sandbox";
					if (completedWithdrawals.length === 0) {
						batchEnvironment = withdrawalEnvironment;
						logger.info(`[Batch Complete] Environment: ${batchEnvironment}`);
					} else if (withdrawalEnvironment !== batchEnvironment) {
						logger.warn(`Withdrawal ${withdrawalId} has different environment (${withdrawalEnvironment}) than batch (${batchEnvironment}), skipping`);
						failedWithdrawals.push({
							withdrawalId,
							error: `Environment mismatch: ${withdrawalEnvironment} vs ${batchEnvironment}`,
						});
						continue;
					}

					// 5. Calculate fiat amount from requested USDC amount
					const fiatAmount = parseFloat(withdrawal.requestedAmount);
					totalFiat += fiatAmount;

					// 6. Mark withdrawal as completed
					await withdrawalService.completeWithdrawal(withdrawalId);

					completedWithdrawals.push({
						withdrawalId,
						status: "completed",
						fiatAmount: fiatAmount.toFixed(2),
					});

					logger.info(`✅ Completed withdrawal: ${withdrawalId} → ${fiatAmount.toFixed(2)} ${body.destinationCurrency}`);
				}

				// Check if any withdrawals were actually completed
				if (completedWithdrawals.length === 0) {
					logger.warn("No withdrawals were completed (all were already processed or invalid)");
					return {
						status: 200 as const,
						body: {
							success: false,
							completedWithdrawals: [],
							failedWithdrawals,
							totalProcessed: 0,
							totalAmount: "0.00",
							destinationCurrency: body.destinationCurrency,
							note: "No withdrawals were completed - all orders were already processed, unauthorized, or invalid",
						},
					};
				}

				// 7. Get vault custodial wallet address
				// Production: Base Mainnet
				// Sandbox: Ethereum Sepolia (where MockUSDC is deployed)
				const chainId = batchEnvironment === "production" ? "8453" : "11155111"; // Base Mainnet : Ethereum Sepolia
				const usdcAddress = batchEnvironment === "production"
					? BASE_MAINNET_USDC // Real USDC on Base Mainnet
					: ETH_SEPOLIA_MOCK_USDC; // MockUSDC on Ethereum Sepolia

				const vault = await vaultService.getVaultByToken(clientId, chainId, usdcAddress, batchEnvironment);

				if (!vault || !vault.custodialWalletAddress) {
					logger.error("Vault or custodial wallet not found", { clientId, chainId, usdcAddress, batchEnvironment });
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "Vault custodial wallet not configured. Please ensure vault is created.",
							details: `clientId: ${clientId}, environment: ${batchEnvironment}`,
						},
					};
				}

				const custodialWallet = vault.custodialWalletAddress;
				logger.info(`✅ Using vault custodial wallet for ${batchEnvironment}: ${custodialWallet}`);

				// 8. Update Product Idle Balances (BEFORE blockchain transfer)
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				logger.info("💰 UPDATING PRODUCT IDLE BALANCES (DEDUCTING)");
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// Aggregate withdrawals by product (clientId)
				const withdrawalsByProduct = new Map<string, number>();

				for (const item of completedWithdrawals) {
					const withdrawal = await withdrawalService.getWithdrawalByOrderId(item.withdrawalId);
					if (withdrawal) {
						const current = withdrawalsByProduct.get(withdrawal.clientId) || 0;
						withdrawalsByProduct.set(
							withdrawal.clientId,
							current + parseFloat(item.fiatAmount)
						);
					}
				}

				// Deduct from each product's idle balance (funds leaving DeFi system)
				for (const [productClientId, totalAmount] of withdrawalsByProduct) {
					await clientService.deductFromIdleBalance(
						productClientId,
						totalAmount.toFixed(2)
					);
					logger.info(`✅ Deducted from idle balance`, {
						clientId: productClientId,
						amount: totalAmount.toFixed(2)
					});
				}

				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// 9. Execute token operation based on environment
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				let txHash: string | undefined;
				let amountProcessed: string | undefined;
				let custodialBalanceAfter: string | undefined;

				// IMPORTANT: For off-ramp, we need the custodial wallet private key
				// This is a simplified demo - in production, you'd use Privy's embedded wallet API
				const custodialPrivateKey = batchEnvironment === "sandbox"
					? ENV.SANDBOX_CUSTODIAL_PRIVATE_KEY // For sandbox demo
					: ENV.PROD_CUSTODIAL_PRIVATE_KEY; // For production (if available)

				if (!custodialPrivateKey) {
					logger.error(`❌ Custodial wallet private key not configured for ${batchEnvironment}`);
					return {
						status: 500 as const,
						body: {
							success: false,
							error: `Custodial wallet not configured for ${batchEnvironment}`,
							details: `Set ${batchEnvironment === "sandbox" ? "SANDBOX_CUSTODIAL_PRIVATE_KEY" : "PROD_CUSTODIAL_PRIVATE_KEY"} environment variable`,
						},
					};
				}

				if (batchEnvironment === "production") {
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					// PRODUCTION: Transfer real USDC from custodial back to oracle
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					logger.info("🏦 PRODUCTION: Transfer USDC from Custodial to Oracle");
					logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

					const baseMainnetChainId = "8453"; // Base Mainnet
					const baseMainnetUSDCAddress = BASE_MAINNET_USDC; // Real USDC on Base
					const mainnetOracleAddress = ENV.MAINNET_ORACLE_ADDRESS; // Oracle address to receive funds

					if (!mainnetOracleAddress) {
						logger.error("❌ MAINNET_ORACLE_ADDRESS not configured");
						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Production oracle address not configured",
								details: "MAINNET_ORACLE_ADDRESS environment variable is required for production withdrawals",
							},
						};
					}

					logger.info(`📤 Transferring ${totalFiat.toFixed(2)} USDC (PRODUCTION)`);
					logger.info(`📍 From: ${custodialWallet}`);
					logger.info(`📍 To: ${mainnetOracleAddress}`);
					logger.info(`🔗 Chain: Base Mainnet (Chain ID: ${baseMainnetChainId})`);
					logger.info(`💰 Token: USDC - ${baseMainnetUSDCAddress}`);
					logger.info(`📦 Withdrawals processed: ${completedWithdrawals.length}`);

					const transferResult = await withdrawalService.transferFromCustodialToOracle(
						baseMainnetChainId,
						baseMainnetUSDCAddress,
						mainnetOracleAddress,
						totalFiat.toFixed(2),
						custodialPrivateKey,
						ENV.DEFI_RPC_URL || 'https://mainnet.base.org', // Base Mainnet RPC
					);

					if (!transferResult.success) {
						logger.error("❌ Transfer from custodial failed:", transferResult.error);
						logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

						// Handle insufficient balance case
						if (transferResult.status === "insufficient_balance") {
							return {
								status: 400 as const,
								body: {
									success: false,
									error: transferResult.error || "Insufficient custodial balance",
									details: `Custodial balance: ${transferResult.oracleBalance}, Required: ${transferResult.requiredAmount}`,
								},
							};
						}

						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Failed to transfer USDC from custodial wallet",
								details: transferResult.error || "Unknown error - check server logs",
							},
						};
					}

					txHash = transferResult.txHash;
					amountProcessed = transferResult.amountTransferred;
					custodialBalanceAfter = transferResult.oracleBalanceAfter;

					logger.info("✅ Transfer successful!");
					logger.info(`   Transaction: ${txHash}`);
					logger.info(`   Amount: ${amountProcessed} USDC`);
					logger.info(`   Custodial Balance After: ${custodialBalanceAfter} USDC`);

				} else {
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					// SANDBOX: Transfer MockUSDC from custodial back to oracle/minter
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					logger.info("🏦 SANDBOX: Transfer MockUSDC from Custodial to Oracle");
					logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

					const ethSepoliaChainId = "11155111"; // Ethereum Sepolia
					const mockUSDCAddress = ETH_SEPOLIA_MOCK_USDC;
					const sandboxOracleAddress = ENV.SANDBOX_ORACLE_ADDRESS; // Oracle/minter address

					if (!sandboxOracleAddress) {
						logger.error("❌ SANDBOX_ORACLE_ADDRESS not configured");
						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Sandbox oracle address not configured",
								details: "SANDBOX_ORACLE_ADDRESS environment variable is required for sandbox withdrawals",
							},
						};
					}

					logger.info(`📤 Transferring ${totalFiat.toFixed(2)} USDC (SANDBOX)`);
					logger.info(`📍 From: ${custodialWallet}`);
					logger.info(`📍 To: ${sandboxOracleAddress}`);
					logger.info(`🔗 Chain: Ethereum Sepolia (Chain ID: ${ethSepoliaChainId})`);
					logger.info(`💰 Token: MockUSDC - ${mockUSDCAddress}`);
					logger.info(`📦 Withdrawals processed: ${completedWithdrawals.length}`);

					let transferResult;
					try {
						transferResult = await withdrawalService.transferFromCustodialToOracle(
							ethSepoliaChainId,
							mockUSDCAddress,
							sandboxOracleAddress,
							totalFiat.toFixed(2),
							custodialPrivateKey,
						);
					} catch (error) {
						logger.error("❌ Transfer from custodial failed:", {
							error: error instanceof Error ? error.message : String(error),
							chainId: ethSepoliaChainId,
							tokenAddress: mockUSDCAddress,
							custodialWallet,
							amount: totalFiat.toFixed(2),
						});
						logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Failed to transfer USDC from custodial wallet",
								details: error instanceof Error ? error.message : "Unknown error - check server logs",
							},
						};
					}

					if (!transferResult.success) {
						logger.error("❌ Transfer failed:", transferResult.error);
						if (transferResult.status === "insufficient_balance") {
							return {
								status: 400 as const,
								body: {
									success: false,
									error: transferResult.error || "Insufficient custodial balance",
									details: `Custodial balance: ${transferResult.oracleBalance}, Required: ${transferResult.requiredAmount}`,
								},
							};
						}

						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Failed to transfer MockUSDC from custodial wallet",
								details: transferResult.error || "Unknown error - check server logs",
							},
						};
					}

					txHash = transferResult.txHash;
					amountProcessed = transferResult.amountTransferred;
					custodialBalanceAfter = transferResult.oracleBalanceAfter;

					logger.info("✅ Transfer successful!");
					logger.info(`   Transaction: ${txHash}`);
					logger.info(`   Amount: ${amountProcessed} USDC`);
					logger.info(`   Custodial Balance After: ${custodialBalanceAfter} USDC`);
				}

				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// Add transfer txHash to all completed withdrawals
				const completedWithdrawalsWithTxHash = completedWithdrawals.map(item => ({
					...item,
					transferTxHash: txHash,
				}));

				// Build response
				const responseBody: any = {
					success: true,
					status: "completed",
					environment: batchEnvironment,
					completedWithdrawals: completedWithdrawalsWithTxHash,
					failedWithdrawals: failedWithdrawals.length > 0 ? failedWithdrawals : undefined,
					totalProcessed: completedWithdrawals.length,
					totalAmount: totalFiat.toFixed(2),
					destinationCurrency: body.destinationCurrency,
					transferTxHash: txHash,
					custodialBalanceAfter: custodialBalanceAfter,
				};

				// Add helpful note
				responseBody.note = batchEnvironment === "production"
					? `✅ ${completedWithdrawals.length} withdrawals completed. ${totalFiat.toFixed(2)} USDC transferred to oracle. TX: ${txHash}`
					: `✅ ${completedWithdrawals.length} withdrawals completed. ${totalFiat.toFixed(2)} USDC transferred to oracle (SANDBOX). TX: ${txHash}`;

				return {
					status: 200 as const,
					body: responseBody,
				};
			} catch (error) {
				logger.error("Failed to batch complete withdrawals", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					withdrawalIds: body.withdrawalIds,
				});
				return {
					status: 500 as const,
					body: {
						success: false,
						error: "Failed to batch complete withdrawals",
						details: error instanceof Error ? error.message : "Unknown error",
					},
				};
			}
		},

		// ⚠️ Generic routes with :id params MUST come LAST
		// GET /withdrawals/:id
		getById: async ({ params }) => {
			try {
				const withdrawal = await withdrawalService.getWithdrawalByOrderId(params.id);

				// TODO: Get actual vaultId from user's vault record
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: {
						found: !!withdrawal,
						data: withdrawal ? {
							id: withdrawal.id,
							clientId: withdrawal.clientId,
							userId: withdrawal.userId,
							vaultId: vaultId,
							requestedAmount: withdrawal.requestedAmount,
							sharesBurned: undefined,
							finalAmount: withdrawal.actualAmount || undefined,
							status: withdrawal.status.toUpperCase() as any,
							transactionHash: undefined,
							createdAt: withdrawal.createdAt.toISOString(),
						} : null,
						message: withdrawal ? "Withdrawal found" : "Withdrawal not found",
					},
				};
			} catch (error) {
				logger.error("Failed to get withdrawal", { error, withdrawalId: params.id });
				return {
					status: 500 as const,
					body: { success: false, error: "Failed to get withdrawal" },
				};
			}
		},

		// POST /withdrawals/:id/complete
		complete: async ({ params, body }) => {
			try {
				await withdrawalService.completeWithdrawal(params.id);

				const withdrawal = await withdrawalService.getWithdrawalByOrderId(params.id);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: {
						id: withdrawal!.id,
						clientId: withdrawal!.clientId,
						userId: withdrawal!.userId,
						vaultId: vaultId,
						requestedAmount: withdrawal!.requestedAmount,
						sharesBurned: undefined,
						finalAmount: withdrawal!.actualAmount || undefined,
						status: withdrawal!.status.toUpperCase() as any,
						transactionHash: body.transactionHash,
						createdAt: withdrawal!.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to complete withdrawal", { error, withdrawalId: params.id });
				return {
					status: 400 as const,
					body: { error: "Failed to complete withdrawal" },
				};
			}
		},

		// POST /withdrawals/:id/fail
		fail: async ({ params, body }) => {
			try {
				await withdrawalService.failWithdrawal(params.id, body.reason);

				const withdrawal = await withdrawalService.getWithdrawalByOrderId(params.id);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: {
						id: withdrawal!.id,
						clientId: withdrawal!.clientId,
						userId: withdrawal!.userId,
						vaultId: vaultId,
						requestedAmount: withdrawal!.requestedAmount,
						sharesBurned: undefined,
						finalAmount: withdrawal!.actualAmount || undefined,
						status: withdrawal!.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: withdrawal!.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to fail withdrawal", { error, withdrawalId: params.id });
				return {
					status: 400 as const,
					body: { error: "Failed to fail withdrawal" },
				};
			}
		},
	});
};
