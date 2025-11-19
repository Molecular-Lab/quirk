/**
 * UserVault Router - B2B user-vault endpoints
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
				// Parse vaultId to extract chain and tokenAddress
				// Format: base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
				const [chain, tokenAddress] = params.vaultId.split("-");

				if (!chain || !tokenAddress) {
					return {
						status: 400 as const,
						body: { error: "Invalid vaultId format. Expected: chain-tokenAddress" },
					};
				}

				// Note: clientId should come from JWT or session in production
				const clientId = ""; // TODO: Get from authenticated context

				const balance = await userVaultService.getUserBalance(
					params.userId,
					clientId,
					chain,
					tokenAddress
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
						shares: balance.shares,
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

				// Parse vaultId to extract chain and tokenAddress
				const [chain, tokenAddress] = params.vaultId.split("-");

				if (!chain || !tokenAddress) {
					return {
						status: 400 as const,
						body: { error: "Invalid vaultId format. Expected: chain-tokenAddress" },
					};
				}

				// Note: clientId should come from JWT or session in production
				const clientId = ""; // TODO: Get from authenticated context

				const users = await userVaultService.listVaultUsers(clientId, chain, tokenAddress, limit);

				return {
					status: 200 as const,
					body: users.map(user => ({
						userId: user.userId,
						clientUserId: user.userId, // Using userId as clientUserId for now
						shares: user.shares,
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
