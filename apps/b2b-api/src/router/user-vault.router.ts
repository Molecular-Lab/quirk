/**
 * UserVault Router - B2B user-vault endpoints
 * 
 * SIMPLIFIED ARCHITECTURE: ONE vault per user per client
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@quirk/b2b-api-core";
import type { UserVaultService } from "../service/user-vault.service";
import { logger } from "../logger";

export function createUserVaultRouter(
	s: ReturnType<typeof initServer>,
	userVaultService: UserVaultService
) {
	return s.router(b2bContract.userVault, {
		// GET /user-vaults/:userId/:vaultId/balance?environment=sandbox|production
		getBalance: async ({ params, query }) => {
			try {
				// In simplified architecture, vaultId is just an identifier
				// We use the vaultId as clientId for now
				const clientId = params.vaultId;
				const environment = query?.environment || "sandbox";

				const balance = await userVaultService.getUserBalance(
					params.userId,
					clientId,
					environment
				);

				return {
					status: 200 as const,
					body: {
						found: !!balance,
						data: balance ? {
							userId: balance.userId,
							vaultId: params.vaultId,
							shares: "0", // Simplified architecture doesn't use shares
							entryIndex: balance.weightedEntryIndex,
							effectiveBalance: balance.effectiveBalance,
							yieldEarned: balance.yieldEarned,
						} : null,
						message: balance ? "User balance found" : "User has no balance in this vault yet",
					},
				};
			} catch (error) {
				logger.error("Failed to get balance", { error, params });
				return {
					status: 500 as const,
					body: { success: false, error: "Failed to get balance" },
				};
			}
		},

		// GET /user-vaults/:vaultId/users?environment=sandbox|production
		listVaultUsers: async ({ params, query }) => {
			try {
				const environment = query?.environment || "sandbox";
				const limit = query?.limit ? parseInt(query.limit) : 50;
				const offset = query?.offset ? parseInt(query.offset) : 0;

				// In simplified architecture, vaultId is clientId
				const clientId = params.vaultId;

				const users = await userVaultService.listVaultUsers(clientId, environment, limit, offset);

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
