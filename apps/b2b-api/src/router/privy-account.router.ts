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

		// GET /privy-accounts/:privyOrganizationId (Dashboard only)
		getByOrgId: async ({ params, req }: { params: { privyOrganizationId: string }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate user owns this Privy account
				const privySession = (req as any).privy;
				if (!privySession) {
					logger.warn("[Privy Account Router] No Privy session found", {
						requestedOrgId: params.privyOrganizationId,
					});
					return {
						status: 401 as const,
						body: {
							success: false,
							error: "Authentication required",
						},
					};
				}

				// Verify user is requesting their own account
				if (privySession.organizationId !== params.privyOrganizationId) {
					logger.warn("[Privy Account Router] User attempting to access another account", {
						requestedOrgId: params.privyOrganizationId,
						authenticatedOrgId: privySession.organizationId,
					});
					return {
						status: 403 as const,
						body: {
							success: false,
							error: "Access denied - can only access your own account",
						},
					};
				}

				logger.info("[PrivyAccountRouter] Getting Privy account by organization ID", {
					privyOrganizationId: params.privyOrganizationId,
				});

				const account = await privyAccountService.getByOrgId(params.privyOrganizationId);

				return {
					status: 200 as const,
					body: {
						found: !!account,
						data: account ? {
							id: account.id,
							privyOrganizationId: account.privyOrganizationId,
							privyWalletAddress: account.privyWalletAddress,
							privyEmail: account.privyEmail,
							walletType: account.walletType,
							createdAt: account.createdAt.toISOString(),
							updatedAt: account.updatedAt.toISOString(),
						} : null,
						message: account ? "Privy account found" : "Privy account not found in database",
					},
				};
			} catch (error: any) {
				logger.error("[PrivyAccountRouter] Error getting Privy account", {
					error: error.message,
					params,
				});
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to get Privy account",
					},
				};
			}
		},
	});
};
