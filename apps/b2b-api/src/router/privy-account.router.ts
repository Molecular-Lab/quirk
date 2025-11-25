/**
 * Privy Account Router - ts-rest implementation
 * Maps HTTP requests to service layer
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { PrivyAccountService } from "../service/privy-account.service";
import { logger } from "../logger";

export const createPrivyAccountRouter = (
	s: ReturnType<typeof initServer>,
	privyAccountService: PrivyAccountService
): any => {
	return s.router(b2bContract.privyAccount, {
		// POST /privy-accounts
		createOrUpdate: async ({ body }: { body: any }) => {
			try {
				logger.info("[PrivyAccountRouter] Creating or updating Privy account", { 
					privyOrganizationId: body.privyOrganizationId,
					hasWalletAddress: !!body.privyWalletAddress,
					hasEmail: !!body.privyEmail,
					walletType: body.walletType,
				});

				// Validate required fields
				if (!body.privyOrganizationId) {
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "privyOrganizationId is required",
						},
					};
				}

				if (!body.privyWalletAddress) {
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "privyWalletAddress is required",
						},
					};
				}

				if (!body.walletType) {
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "walletType is required (MANAGED or USER_OWNED)",
						},
					};
				}

				const account = await privyAccountService.createOrUpdate({
					privyOrganizationId: body.privyOrganizationId,
					privyWalletAddress: body.privyWalletAddress,
					privyEmail: body.privyEmail,
					walletType: body.walletType,
				});

				logger.info("[PrivyAccountRouter] Privy account created/updated successfully", {
					id: account.id,
					privyOrganizationId: account.privyOrganizationId,
				});

				return {
					status: 201 as const,
					body: {
						id: account.id,
						privyOrganizationId: account.privyOrganizationId,
						privyWalletAddress: account.privyWalletAddress,
						privyEmail: account.privyEmail,
						walletType: account.walletType,
						createdAt: account.createdAt.toISOString(),
						updatedAt: account.updatedAt.toISOString(),
					},
				};
			} catch (error: any) {
				logger.error("[PrivyAccountRouter] Error creating/updating Privy account", { 
					error: error.message,
					stack: error.stack,
					body,
				});
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to create or update Privy account",
					},
				};
			}
		},

		// GET /privy-accounts/:privyOrganizationId
		getByOrgId: async ({ params }: { params: { privyOrganizationId: string } }) => {
			try {
				logger.info("[PrivyAccountRouter] Getting Privy account by organization ID", {
					privyOrganizationId: params.privyOrganizationId,
				});

				const account = await privyAccountService.getByOrgId(params.privyOrganizationId);

				if (!account) {
					return {
						status: 404 as const,
						body: {
							success: false,
							error: "Privy account not found",
						},
					};
				}

				return {
					status: 200 as const,
					body: {
						id: account.id,
						privyOrganizationId: account.privyOrganizationId,
						privyWalletAddress: account.privyWalletAddress,
						privyEmail: account.privyEmail,
						walletType: account.walletType,
						createdAt: account.createdAt.toISOString(),
						updatedAt: account.updatedAt.toISOString(),
					},
				};
			} catch (error: any) {
				logger.error("[PrivyAccountRouter] Error getting Privy account", { 
					error: error.message,
					params,
				});
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to get Privy account",
					},
				};
			}
		},
	});
};
