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

				return {
					status: 200 as const,
					body: {
						found: !!vault,
						data: vault ? mapVaultToDto(vault) : null,
						message: vault ? "Vault found" : "Vault not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting vault by ID", { error: error.message, params });
				return {
					status: 500 as const,
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

				return {
					status: 200 as const,
					body: {
						found: !!vault,
						data: vault ? mapVaultToDto(vault) : null,
						message: vault
							? "Vault found"
							: `Vault not found for ${params.tokenSymbol} on chain ${params.chainId}`,
					},
				};
			} catch (error: any) {
				logger.error("Error getting vault by token", { error: error.message, params });
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to get vault",
					},
				};
			}
		},

		// POST /vaults/:id/index/update
		updateIndexWithYield: async ({ params, body, req }: { params: { id: string }; body: any; req?: any }) => {
			try {
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any)?.client;
				const privySession = (req as any)?.privy;

				// Get vault to verify ownership
				const vault = await vaultService.getVaultById(params.id);
				if (!vault) {
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "Vault not found - invalid vault ID provided",
						},
					};
				}

				// Verify authorization
				// For API key: vault must belong to this client
				if (apiKeyClient) {
					if (vault.clientId !== apiKeyClient.id) {
						logger.warn("API key client attempting to update another client's vault", {
							apiKeyClientId: apiKeyClient.id,
							vaultClientId: vault.clientId,
						});
						return {
							status: 403 as const,
							body: {
								success: false,
								error: "Not authorized to update this vault",
							},
						};
					}
				}
				// For Privy: vault must belong to one of the organization's products
				else if (privySession) {
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(vault.clientId)) {
						logger.warn("Privy user attempting to update vault from outside organization", {
							privyOrgId: privySession.organizationId,
							vaultClientId: vault.clientId,
						});
						return {
							status: 403 as const,
							body: {
								success: false,
								error: "Not authorized to update this vault",
							},
						};
					}
				}
				// No auth found
				else {
					logger.error("Authentication missing for update vault yield");
					return {
						status: 401 as const,
						body: {
							success: false,
							error: "Authentication required",
						},
					};
				}

				await vaultService.updateIndexWithYield(params.id, body.yieldAmount);

				const updatedVault = await vaultService.getVaultById(params.id);

				// Calculate yield per share: yieldAmount / totalShares
				const yieldAmount = parseFloat(body.yieldAmount);
				const totalShares = parseFloat(updatedVault?.totalShares || "1");
				const yieldPerShare = (yieldAmount / totalShares).toFixed(18);

				return {
					status: 200 as const,
					body: {
						newIndex: updatedVault?.currentIndex || "0",
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
