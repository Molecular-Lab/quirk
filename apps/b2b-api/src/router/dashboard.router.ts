/**
 * Dashboard Router - Client dashboard metrics
 * Provides real-time overview of client's fund stages and revenue
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { VaultService } from "../service/vault.service";
import type { UserService } from "../service/user.service";
import { logger } from "../logger";

export const createDashboardRouter = (
	s: ReturnType<typeof initServer>,
	vaultService: VaultService,
	userService: UserService
): any => {
	return s.router(b2bContract.dashboard, {
		// GET /dashboard/metrics
		getMetrics: async ({ query, req }: { query: { clientId?: string }; req?: any }) => {
			try {
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any)?.client;
				const privySession = (req as any)?.privy;

				const clientId = query.clientId;
				if (!clientId) {
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "clientId is required",
						},
					};
				}

				// Verify authorization
				// For API key: clientId must match authenticated client
				if (apiKeyClient) {
					if (clientId !== apiKeyClient.id) {
						logger.warn("API key client attempting to view another client's dashboard", {
							apiKeyClientId: apiKeyClient.id,
							requestedClientId: clientId,
						});
						return {
							status: 403 as const,
							body: {
								success: false,
								error: "Not authorized to view this client's dashboard",
							},
						};
					}
				}
				// For Privy: clientId must belong to one of the organization's products
				else if (privySession) {
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(clientId)) {
						logger.warn("Privy user attempting to view dashboard from outside organization", {
							privyOrgId: privySession.organizationId,
							requestedClientId: clientId,
						});
						return {
							status: 403 as const,
							body: {
								success: false,
								error: "Not authorized to view this client's dashboard",
							},
						};
					}
				}
				// No auth found
				else {
					logger.error("Authentication missing for dashboard metrics");
					return {
						status: 401 as const,
						body: {
							success: false,
							error: "Authentication required",
						},
					};
				}

				logger.info(`[Dashboard] Fetching metrics for client: ${clientId}`, {
					authType: apiKeyClient ? "api_key" : "privy",
				});

				// Get all client vaults (multi-chain, multi-token)
				const vaults = await vaultService.listClientVaults(clientId);

				// Calculate 3-stage fund tracking
				let totalAvailable = 0; // Stage 1: pending_deposit_balance
				let totalStaked = 0; // Stage 2: total_staked_balance
				let totalRevenue = 0; // Stage 3: cumulative_yield
				let totalAUM = 0; // Total assets under management

				// Strategy allocation (static for now, will be dynamic later)
				const strategies: any[] = [];

				for (const vault of vaults) {
					const pendingBalance = parseFloat(vault.pendingDepositBalance || "0");
					const stakedBalance = parseFloat(vault.totalStakedBalance || "0");
					const cumulativeYield = parseFloat(vault.cumulativeYield || "0");

					totalAvailable += pendingBalance;
					totalStaked += stakedBalance;
					totalRevenue += cumulativeYield;
					totalAUM += pendingBalance + stakedBalance;

					// Collect strategies from vault JSONB
					if (vault.strategies && Array.isArray(vault.strategies)) {
						vault.strategies.forEach((strat: any) => {
							strategies.push({
								category: strat.category,
								target: strat.target,
								allocated: (stakedBalance * strat.target) / 100,
								isActive: strat.isActive,
							});
						});
					}
				}

				// Get user stats
				const users = await userService.listUsersByClient(clientId);
				const activeUsers = users.filter((u: any) => u.status === "active").length;

				// Calculate APY (weighted average across vaults)
				let weightedAPY = 0;
				if (totalStaked > 0) {
					for (const vault of vaults) {
						const stakedBalance = parseFloat(vault.totalStakedBalance || "0");
						const apy = parseFloat(vault.apy_7d || "0");
						weightedAPY += (stakedBalance / totalStaked) * apy;
					}
				}

				// Default strategies if none configured
				if (strategies.length === 0) {
					strategies.push(
						{ category: "Lending (AAVE)", target: 70, allocated: totalStaked * 0.7, isActive: true },
						{ category: "LP (Curve)", target: 20, allocated: totalStaked * 0.2, isActive: true },
						{ category: "Yield (Uniswap)", target: 10, allocated: totalStaked * 0.1, isActive: true }
					);
				}

				// Revenue breakdown (client gets 10% of yield, end-users get 90%)
				const clientRevenueShare = 0.1; // 10% to client
				const clientRevenue = totalRevenue * clientRevenueShare;
				const endUserRevenue = totalRevenue * (1 - clientRevenueShare);

				return {
					status: 200 as const,
					body: {
						success: true,
						clientId,
						fundStages: {
							available: totalAvailable.toFixed(2),
							staked: totalStaked.toFixed(2),
							total: totalAUM.toFixed(2),
						},
						revenue: {
							total: totalRevenue.toFixed(2),
							clientShare: clientRevenue.toFixed(2),
							endUserShare: endUserRevenue.toFixed(2),
							clientSharePercent: (clientRevenueShare * 100).toFixed(1),
						},
						stats: {
							totalUsers: users.length,
							activeUsers,
							apy: weightedAPY.toFixed(2),
							vaults: vaults.length,
						},
						strategies,
					},
				};
			} catch (error: any) {
				logger.error("Error fetching dashboard metrics", { error: error.message, query });
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to fetch dashboard metrics",
					},
				};
			}
		},
	});
};
