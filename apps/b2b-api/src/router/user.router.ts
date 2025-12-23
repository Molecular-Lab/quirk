/**
 * User Router - B2B end-user endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@quirk/b2b-api-core";
import type { UserService } from "../service/user.service";
import type { UserVaultService } from "../service/user-vault.service";
import { mapUserToDto, mapUsersToDto, mapUserPortfolioToDto } from "../mapper/user.mapper";
import { logger } from "../logger";

export const createUserRouter = (
	s: ReturnType<typeof initServer>,
	userService: UserService,
	userVaultService: UserVaultService // ✅ Added to fetch vaults
) => {
	return s.router(b2bContract.user, {
		// POST /users - Get or create user (SDK only)
		getOrCreate: async ({ body, req }) => {
			try {
				// ✅ SDK ONLY: Extract clientId from authenticated request (API key middleware)
				const apiKeyClient = (req as any).client;
				if (!apiKeyClient) {
					logger.error("[User Router] Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: { error: "Authentication failed - client ID not found" },
					};
				}

				const user = await userService.getOrCreateUser({
					clientId: apiKeyClient.id, // ✅ Use authenticated client ID (not from body)
					userId: body.clientUserId,
					userType: "custodial", // ✅ B2B escrow - we manage custodial wallets
					userWalletAddress: body.walletAddress,
					status: body.status, // ✅ Optional initial status (defaults to 'active')
				});

				// ✅ Fetch user's vault to return in response (simplified: single vault)
				let vault: any = null;
				try {
					const portfolio = await userVaultService.getUserPortfolio(user.userId, user.clientId);
					if (portfolio && portfolio.vault) {
						vault = {
							vaultId: user.clientId, // Simplified: vaultId = clientId
							totalDeposited: portfolio.vault.totalDeposited,
							effectiveBalance: portfolio.vault.effectiveBalance,
							yieldEarned: portfolio.vault.yieldEarned,
							weightedEntryIndex: portfolio.vault.weightedEntryIndex,
						};
					}
				} catch (vaultError) {
					logger.warn("Failed to fetch user vault, returning user without vault", { 
						userId: user.id, 
						error: vaultError 
					});
					// Continue without vault - non-critical
				}

				return {
					status: 200 as const,
					body: {
						...mapUserToDto(user),
						vaults: vault ? [vault] : [], // ✅ Return as array for backward compatibility
					},
				};
			} catch (error) {
				logger.error("Failed to get or create user", { error, body });
				return {
					status: 400 as const,
					body: { error: "Failed to create user" },
				};
			}
		},

		// GET /users/:id - Get user by ID
		getById: async ({ params }) => {
			try {
				const user = await userService.getUserByClientAndUserId(
					params.id,
					params.id
				);

				return {
					status: 200 as const,
					body: {
						found: !!user,
						data: user ? mapUserToDto(user) : null,
						message: user ? "User found" : "User not found",
					},
				};
			} catch (error) {
				logger.error("Failed to get user by ID", { error, userId: params.id });
				return {
					status: 500 as const,
					body: { error: "Failed to get user", success: false },
				};
			}
		},

		// GET /users/client/:clientId/user/:clientUserId (SDK primary, Dashboard secondary)
		getByClientUserId: async ({ params, req }) => {
			try {
				// ✅ Dual Auth: Check for both API key (SDK) and Privy (Dashboard)
				const apiKeyClient = (req as any).client;
				const privySession = (req as any).privy;

				// Validate access
				if (apiKeyClient) {
					// SDK: Only allow access to own client's users
					if (params.clientId !== apiKeyClient.id) {
						logger.warn("[User Router] SDK client attempting to access other client's user", {
							requestedClientId: params.clientId,
							authenticatedClientId: apiKeyClient.id,
						});
						return {
							status: 403 as const,
							body: { error: "Access denied - cannot view other clients' users" },
						};
					}
				} else if (privySession) {
					// Dashboard: Check if clientId belongs to any product under this organization
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(params.clientId)) {
						logger.warn("[User Router] Dashboard user attempting to access unauthorized client's user", {
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

				const user = await userService.getUserByClientAndUserId(
					params.clientId,
					params.clientUserId
				);

				return {
					status: 200 as const,
					body: {
						found: !!user,
						data: user ? mapUserToDto(user) : null,
						message: user ? "User found" : "User not found",
					},
				};
			} catch (error) {
				logger.error("Failed to get user", { error, params });
				return {
					status: 500 as const,
					body: { error: "Failed to get user", success: false },
				};
			}
		},

		// GET /users/client/:clientId - List users
		listByClient: async ({ params, query, req }) => {
			try {
				// ✅ Dual Auth: Check for both API key (SDK) and Privy (Dashboard)
				const apiKeyClient = (req as any).client;
				const privySession = (req as any).privy;

				// Validate access
				if (apiKeyClient) {
					// SDK: Only allow access to own client's users
					if (params.clientId !== apiKeyClient.id) {
						logger.warn("[User Router] SDK client attempting to list other client's users", {
							requestedClientId: params.clientId,
							authenticatedClientId: apiKeyClient.id,
						});
						return {
							status: 403 as const,
							body: { error: "Access denied - cannot list other clients' users" },
						};
					}
				} else if (privySession) {
					// Dashboard: Check if clientId belongs to any product under this organization
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(params.clientId)) {
						logger.warn("[User Router] Dashboard user attempting to list unauthorized client's users", {
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

				const users = await userService.listUsersByClient(
					params.clientId,
					limit,
					offset
				);

				return {
					status: 200 as const,
					body: mapUsersToDto(users),
				};
			} catch (error) {
				logger.error("Failed to list users", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /users/:userId/portfolio
		getPortfolio: async ({ params }) => {
			try {
				const portfolio = await userService.getUserPortfolio(params.userId);

				return {
					status: 200 as const,
					body: {
						found: !!portfolio,
						data: portfolio ? mapUserPortfolioToDto(portfolio) : null,
						message: portfolio ? "Portfolio found" : "Portfolio not found",
					},
				};
			} catch (error) {
				logger.error("Failed to get portfolio", { error, userId: params.userId });
				return {
					status: 500 as const,
					body: { error: "Failed to get portfolio", success: false },
				};
			}
		},

		// GET /users/:userId/balance - Simplified balance (with chain/token filter)
		getBalance: async ({ params, query, req }) => {
			try {
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).client;
				const privySession = (req as any).privy;

				logger.info("Getting user balance", {
					userId: params.userId,
					query,
					authType: apiKeyClient ? "api_key" : privySession ? "privy" : "none",
				});

				// Determine clientId from auth
				let clientId: string | undefined;
				if (apiKeyClient) {
					clientId = apiKeyClient.id;
				} else if (privySession && privySession.products.length > 0) {
					// For Privy, try first product (or could require clientId param)
					clientId = privySession.products[0].id;
				}

				if (!clientId) {
					logger.error("Cannot determine clientId from auth");
					return {
						status: 401 as const,
						body: { error: "Authentication failed - client ID not found" },
					};
				}

				// ✅ FIX: Use getUserBalance instead of getUserPortfolio for correct calculation
				// ✅ FIX: Pass environment from query params (defaults to sandbox)
				const environment = (query?.environment as "sandbox" | "production") || "sandbox";
				const userBalance = await userVaultService.getUserBalance(params.userId, clientId, environment);

				if (!userBalance) {
					return {
						status: 200 as const,
						body: {
							found: false,
							data: null,
							message: "User not found",
						},
					};
				}

				// Verify authorization
				// For API key: user must belong to this client
				if (apiKeyClient) {
					if (userBalance.clientId !== apiKeyClient.id) {
						logger.warn("API key client attempting to access another client's user balance", {
							apiKeyClientId: apiKeyClient.id,
							userClientId: userBalance.clientId,
						});
						return {
							status: 403 as const,
							body: { error: "Not authorized to view this user's balance" },
						};
					}
				}
				// For Privy: user must belong to one of the organization's products
				else if (privySession) {
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(userBalance.clientId)) {
						logger.warn("Privy user attempting to access user from outside organization", {
							privyOrgId: privySession.organizationId,
							userClientId: userBalance.clientId,
						});
						return {
							status: 403 as const,
							body: { error: "Not authorized to view this user's balance" },
						};
					}
				}
				// No auth found
				else {
					logger.error("Authentication missing for get user balance");
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
					};
				}

				// ✅ FIX: Get actual client growth index and APY
				const clientGrowthIndex = await userVaultService.getClientGrowthIndex(userBalance.clientId);
				const apy = await userVaultService.calculateAPY(userBalance.clientId, 30); // 30-day APY

				// ✅ FIX: Return correct values from calculation
				const balance = {
					balance: userBalance.effectiveBalance, // ✅ Calculated from Client Growth Index
					currency: "USD",
					yield_earned: userBalance.yieldEarned, // ✅ Calculated: effectiveBalance - totalDeposited
					apy: apy, // ✅ Calculated from historical index growth
					status: userBalance.isActive ? "active" : "inactive",
					shares: "0", // Removed in simplified architecture
					entry_index: userBalance.weightedEntryIndex, // ✅ Actual entry index from database
					current_index: clientGrowthIndex, // ✅ Calculated client growth index
				};

				return {
					status: 200 as const,
					body: {
						found: true,
						data: balance,
						message: "Balance found",
					},
				};
			} catch (error) {
				logger.error("Failed to get user balance", { error, userId: params.userId });
				return {
					status: 500 as const,
					body: { error: "Failed to get balance", success: false },
				};
			}
		},

		// GET /users/:userId/vaults - List all user vaults
		listVaults: async ({ params, req }) => {
			try {
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).client;
				const privySession = (req as any).privy;

				logger.info("Listing user vaults", {
					userId: params.userId,
					authType: apiKeyClient ? "api_key" : privySession ? "privy" : "none",
				});

				// Get portfolio (simplified - aggregated totals)
				const portfolio = await userService.getUserPortfolio(params.userId);

				if (!portfolio) {
					return {
						status: 200 as const,
						body: {
							found: false,
							data: null,
							message: "User not found",
						},
					};
				}

				// Verify authorization
				// For API key: user must belong to this client
				if (apiKeyClient) {
					if (portfolio.clientId !== apiKeyClient.id) {
						logger.warn("API key client attempting to access another client's user vaults", {
							apiKeyClientId: apiKeyClient.id,
							userClientId: portfolio.clientId,
						});
						return {
							status: 403 as const,
							body: { error: "Not authorized to view this user's vaults" },
						};
					}
				}
				// For Privy: user must belong to one of the organization's products
				else if (privySession) {
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(portfolio.clientId)) {
						logger.warn("Privy user attempting to access user from outside organization", {
							privyOrgId: privySession.organizationId,
							userClientId: portfolio.clientId,
						});
						return {
							status: 403 as const,
							body: { error: "Not authorized to view this user's vaults" },
						};
					}
				}
				// No auth found
				else {
					logger.error("Authentication missing for list user vaults");
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
					};
				}

				// ✅ SIMPLIFIED: ONE vault per user per client
				// Return aggregated totals as a single "virtual" vault
				const vaults = [{
					chain: "aggregated", // All chains aggregated
					token: "USD", // Fiat-equivalent
					balance: portfolio.totalEffectiveBalance || "0",
					yield_earned: portfolio.totalYieldEarned || "0",
					apy: "0", // TODO: Calculate from client growth index
					shares: "0", // Removed in simplified architecture
					status: "active",
				}];

				return {
					status: 200 as const,
					body: {
						found: true,
						data: { vaults },
						message: "Vaults found",
					},
				};
			} catch (error) {
				logger.error("Failed to list user vaults", { error, userId: params.userId });
				return {
					status: 500 as const,
					body: { error: "Failed to list vaults", success: false },
				};
			}
		},

		// POST /users/:userId/activate - Activate user account (PUBLIC endpoint for onboarding)
		activate: async ({ params, body }) => {
			try {
				logger.info("[User Router] Activating user (public endpoint)", {
					userId: params.userId,
					productId: body.productId,
				});

				// ✅ PUBLIC ENDPOINT: No auth required
				// Look up client by productId to get clientId
				const activated = await userService.activateUserByProductId(params.userId, body.productId);

				return {
					status: 200 as const,
					body: {
						success: true,
						message: "User account activated successfully",
						user: {
							...mapUserToDto(activated),
							status: activated.status as "pending_onboarding" | "active" | "suspended",
						},
					},
				};
			} catch (error: any) {
				logger.error("Failed to activate user", { error, userId: params.userId, productId: body.productId });

				const errorStatus = error.message.includes("not found") ? 404 as const :
							   error.message.includes("suspended") || error.message.includes("not belong") ? 400 as const : 500 as const;

				return {
					status: errorStatus,
					body: { error: error.message || "Failed to activate user" },
				};
			}
		},
	});
};
