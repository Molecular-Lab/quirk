/**
 * UserVault Router - B2B user-vault endpoints
 * 
 * SIMPLIFIED ARCHITECTURE: ONE vault per user per client
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { UserVaultService } from "../service/user-vault.service";
import { logger } from "../logger";

export function createUserVaultRouter(
	s: ReturnType<typeof initServer>,
	userVaultService: UserVaultService
) {
	return s.router(b2bContract.userVault, {
		// GET /user-vaults/:userId/:vaultId/balance
		getBalance: async ({ params }) => {
			try {
				// In simplified architecture, vaultId is just an identifier
				// We use the vaultId as clientId for now
				const clientId = params.vaultId;

				const balance = await userVaultService.getUserBalance(
					params.userId,
					clientId
				);

				if (!balance) {
					return {
						status: 404 as const,
						body: { error: "Balance not found" },
					};
				}

				return {
					status: 200 as const,
					body: {
						userId: balance.userId,
						vaultId: params.vaultId,
						shares: "0", // Simplified architecture doesn't use shares
						entryIndex: balance.weightedEntryIndex,
						effectiveBalance: balance.effectiveBalance,
						yieldEarned: balance.yieldEarned,
					},
				};
			} catch (error) {
				logger.error("Failed to get balance", { error, params });
				return {
					status: 404 as const,
					body: { error: "Balance not found" },
				};
			}
		},

		// GET /user-vaults/:vaultId/users
		listVaultUsers: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;
				const offset = query?.offset ? parseInt(query.offset) : 0;

				// In simplified architecture, vaultId is clientId
				const clientId = params.vaultId;

				const users = await userVaultService.listVaultUsers(clientId, limit, offset);

				return {
					status: 200 as const,
					body: users.map(user => ({
						userId: user.userId,
						clientUserId: user.userId,
						shares: "0", // Simplified architecture doesn't use shares
						balance: user.effectiveBalance,
						yieldEarned: user.yieldEarned,
					})),
				};
			} catch (error) {
				logger.error("Failed to list vault users", { error, vaultId: params.vaultId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},
	});
};
