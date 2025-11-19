/**
 * B2B Vault Router - ts-rest implementation
 * Maps HTTP requests to vault service layer
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { VaultService } from "../service/vault.service";
import { logger } from "../logger";
import { mapVaultToDto, mapVaultsToDto } from "../mapper/vault.mapper";

export const createVaultRouter = (
	s: ReturnType<typeof initServer>,
	vaultService: VaultService
): any => {
	return s.router(b2bContract.vault, {
		// POST /vaults - Get or create vault
		getOrCreate: async ({ body }: { body: any }) => {
			try {
				const vault = await vaultService.getOrCreateVault({
					clientId: body.clientId,
					chain: body.chainId?.toString() || "1",
					tokenAddress: body.tokenAddress,
					tokenSymbol: body.tokenSymbol,
					tokenDecimals: 6, // Default to 6 for USDC
				});

				return {
					status: 200 as const,
					body: mapVaultToDto(vault),
				};
			} catch (error: any) {
				logger.error("Error creating/getting vault", { error: error.message, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to get/create vault",
					},
				};
			}
		},

		// GET /vaults/:id
		getById: async ({ params }: { params: { id: string } }) => {
			try {
				const vault = await vaultService.getVaultById(params.id);

				if (!vault) {
					return {
						status: 404 as const,
						body: {
							success: false,
							error: "Vault not found",
						},
					};
				}

				return {
					status: 200 as const,
					body: mapVaultToDto(vault),
				};
			} catch (error: any) {
				logger.error("Error getting vault by ID", { error: error.message, params });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to get vault",
					},
				};
			}
		},

		// GET /vaults/client/:clientId
		listByClient: async ({ params }: { params: { clientId: string } }) => {
			try {
				const vaults = await vaultService.listClientVaults(params.clientId);

				return {
					status: 200 as const,
					body: mapVaultsToDto(vaults),
				};
			} catch (error: any) {
				logger.error("Error listing client vaults", { error: error.message, params });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /vaults/token/:clientId/:tokenSymbol/:chainId
		getByToken: async ({ params }: { params: { clientId: string; tokenSymbol: string; chainId: string } }) => {
			try {
				const vault = await vaultService.getVaultByToken(
					params.clientId,
					params.chainId,
					params.tokenSymbol
				);

				if (!vault) {
					return {
						status: 404 as const,
						body: {
							success: false,
							error: "Vault not found",
						},
					};
				}

				return {
					status: 200 as const,
					body: mapVaultToDto(vault),
				};
			} catch (error: any) {
				logger.error("Error getting vault by token", { error: error.message, params });
				return {
					status: 404 as const,
					body: {
						success: false,
						error: error.message || "Failed to get vault",
					},
				};
			}
		},

		// POST /vaults/:id/index/update
		updateIndexWithYield: async ({ params, body }: { params: { id: string }; body: any }) => {
			try {
				await vaultService.updateIndexWithYield(params.id, body.yieldAmount);

				const vault = await vaultService.getVaultById(params.id);

				// Calculate yield per share: yieldAmount / totalShares
				const yieldAmount = parseFloat(body.yieldAmount);
				const totalShares = parseFloat(vault?.totalShares || "1");
				const yieldPerShare = (yieldAmount / totalShares).toFixed(18);

				return {
					status: 200 as const,
					body: {
						newIndex: vault?.currentIndex || "0",
						yieldPerShare: yieldPerShare,
					},
				};
			} catch (error: any) {
				logger.error("Error updating index", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to update index",
					},
				};
			}
		},

		// GET /vaults/ready-for-staking
		getReadyForStaking: async () => {
			try {
				const vaults = await vaultService.getVaultsReadyForStaking();

				return {
					status: 200 as const,
					body: mapVaultsToDto(vaults as any),
				};
			} catch (error: any) {
				logger.error("Error getting vaults ready for staking", { error: error.message });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// POST /vaults/:id/mark-staked
		markFundsAsStaked: async ({ params, body }: { params: { id: string }; body: any }) => {
			try {
				await vaultService.markFundsAsStaked(params.id, body.amount);

				return {
					status: 200 as const,
					body: {
						success: true,
						message: `Successfully marked ${body.amount} as staked`,
					},
				};
			} catch (error: any) {
				logger.error("Error marking funds as staked", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to mark funds as staked",
					},
				};
			}
		},
	});
};
