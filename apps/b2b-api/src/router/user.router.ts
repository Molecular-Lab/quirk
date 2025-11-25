/**
 * User Router - B2B end-user endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
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
		// POST /users - Get or create user
		getOrCreate: async ({ body }) => {
			try {
				const user = await userService.getOrCreateUser({
					clientId: body.clientId, // ✅ Can be productId or UUID
					userId: body.clientUserId,
					userType: "custodial", // ✅ B2B escrow - we manage custodial wallets
					userWalletAddress: body.walletAddress,
				});

				// ✅ Fetch user's vaults to return in response
				let vaults: any[] = [];
				try {
					const portfolio = await userVaultService.getUserPortfolio(user.userId, user.clientId);
					if (portfolio) {
						vaults = portfolio.vaults.map((v: any) => ({
							vaultId: v.vaultId || "", // Use vault ID if available
							chain: v.chain,
							tokenSymbol: v.tokenSymbol,
							tokenAddress: v.tokenAddress,
							shares: v.shares,
							effectiveBalance: v.effectiveBalance,
							yieldEarned: v.yieldEarned,
						}));
					}
				} catch (vaultError) {
					logger.warn("Failed to fetch user vaults, returning user without vaults", { 
						userId: user.id, 
						error: vaultError 
					});
					// Continue without vaults - non-critical
				}

				return {
					status: 200 as const,
					body: {
						...mapUserToDto(user),
						vaults, // ✅ Include vaults in response
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

				if (!user) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapUserToDto(user),
				};
			} catch (error) {
				logger.error("Failed to get user by ID", { error, userId: params.id });
				return {
					status: 404 as const,
					body: { error: "User not found" },
				};
			}
		},

		// GET /users/client/:clientId/user/:clientUserId
		getByClientUserId: async ({ params }) => {
			try {
				const user = await userService.getUserByClientAndUserId(
					params.clientId,
					params.clientUserId
				);

				if (!user) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapUserToDto(user),
				};
			} catch (error) {
				logger.error("Failed to get user", { error, params });
				return {
					status: 404 as const,
					body: { error: "User not found" },
				};
			}
		},

		// GET /users/client/:clientId - List users
		listByClient: async ({ params, query }) => {
			try {
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

				if (!portfolio) {
					return {
						status: 404 as const,
						body: { error: "Portfolio not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapUserPortfolioToDto(portfolio),
				};
			} catch (error) {
				logger.error("Failed to get portfolio", { error, userId: params.userId });
				return {
					status: 404 as const,
					body: { error: "Portfolio not found" },
				};
			}
		},

		// GET /users/:userId/balance - Simplified balance (with chain/token filter)
		getBalance: async ({ params, query }) => {
			try {
				logger.info("Getting user balance", { userId: params.userId, query });

				// Get portfolio (simplified - aggregated totals, no multi-chain)
				const portfolio = await userService.getUserPortfolio(params.userId);

				if (!portfolio) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
					};
				}

				// ✅ SIMPLIFIED: One vault per user per client, no chain/token filtering
				// All balances are aggregated across chains internally
				// Calculate APY (simplified - would need time-based calculation in production)
				const apy = "0"; // TODO: Calculate from vault growth index

				return {
					status: 200 as const,
					body: {
						balance: portfolio.totalEffectiveBalance || "0",
						currency: "USD", // Fiat-equivalent value
						yield_earned: portfolio.totalYieldEarned || "0",
						apy: apy,
						status: "active", // TODO: Get from vault status
						shares: "0", // Removed in simplified architecture
						entry_index: "1000000000000000000", // Default 1.0
						current_index: "1000000000000000000", // TODO: Get from client growth index
					},
				};
			} catch (error) {
				logger.error("Failed to get user balance", { error, userId: params.userId });
				return {
					status: 404 as const,
					body: { error: "Balance not found" },
				};
			}
		},

		// GET /users/:userId/vaults - List all user vaults
		listVaults: async ({ params }) => {
			try {
				logger.info("Listing user vaults", { userId: params.userId });

				// Get portfolio (simplified - aggregated totals)
				const portfolio = await userService.getUserPortfolio(params.userId);

				if (!portfolio) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
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
					body: { vaults },
				};
			} catch (error) {
				logger.error("Failed to list user vaults", { error, userId: params.userId });
				return {
					status: 404 as const,
					body: { error: "Vaults not found" },
				};
			}
		},
	});
};
