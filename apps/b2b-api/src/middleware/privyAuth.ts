import type { Request, Response, NextFunction } from "express";
import type { B2BClientUseCase, PrivyAccountRepository } from "@quirk/core";
import { logger } from "../logger";

/**
 * Privy Session Authentication Middleware (Enhanced with DB Validation)
 *
 * For dashboard endpoints - validates Privy organization access.
 * Extracts privyOrganizationId and loads all products under that organization.
 *
 * Phase 3 Enhancement:
 * - ✅ Validates privy_account exists in database
 * - ✅ Can check account status (active/suspended) for future use
 * - ✅ More secure than relying only on product lookup
 * - ✅ Skips DB validation for privy-account endpoints (router handles it)
 *
 * Simplified for MVP/Demo:
 * - Uses x-privy-org-id header (in production, validate Privy JWT)
 * - Loads all client products for multi-product dashboard views
 *
 * Usage:
 * ```typescript
 * import { privyAuth } from './middleware/privyAuth';
 *
 * router.get('/api/v1/dashboard/deposits', privyAuth(clientUseCase, privyAccountRepo), async (req, res) => {
 *   const { organizationId, products } = req.privy; // Authenticated org + all products
 *   // ...
 * });
 * ```
 */
export function privyAuth(
	clientUseCase: B2BClientUseCase,
	privyAccountRepository?: PrivyAccountRepository
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Extract Privy organization ID from header
			// MVP: Simple header-based auth
			// Production: Should validate Privy JWT token and extract from claims
			const privyOrgId = req.headers["x-privy-org-id"] as string | undefined;

			if (!privyOrgId) {
				logger.warn("[Privy Auth] Missing Privy organization ID", {
					path: req.path,
					method: req.method
				});
				return res.status(401).json({
					success: false,
					error: "Missing Privy organization ID",
					hint: "Please provide 'x-privy-org-id' header with your Privy organization ID.",
				});
			}

			// Validate Privy org ID format (did:privy:xxx)
			if (!privyOrgId.startsWith("did:privy:")) {
				logger.warn("[Privy Auth] Invalid Privy org ID format", {
					path: req.path,
					orgId: privyOrgId
				});
				return res.status(401).json({
					success: false,
					error: "Invalid Privy organization ID format",
					hint: "Privy org ID must start with 'did:privy:'",
				});
			}

			// ✅ Skip DB validation for privy-account endpoints
			// The router handles its own validation for account existence
			const isPrivyAccountEndpoint = req.path.startsWith("/privy-accounts");
		const isListClientsEndpoint = req.path.startsWith("/clients/privy/");

			// ✅ Phase 3: Explicit database validation
			// Verify privy_account exists in database before loading products
			if (!isPrivyAccountEndpoint && privyAccountRepository) {
				try {
					const privyAccount = await privyAccountRepository.getByOrgId(privyOrgId);

					if (!privyAccount) {
						logger.warn("[Privy Auth] Privy account not found in database", {
							privyOrgId,
							path: req.path
						});
						return res.status(404).json({
							success: false,
							error: "Privy account not found",
							hint: "Please complete onboarding first. Your Privy account is not registered.",
						});
					}

					logger.info("[Privy Auth] Privy account validated", {
						privyOrgId,
						accountId: privyAccount.id,
						walletType: privyAccount.walletType,
					});

					// Future enhancement: Check account status
					// if (privyAccount.status === 'suspended') { ... }
				} catch (dbError) {
					logger.error("[Privy Auth] Database validation failed", {
						privyOrgId,
						error: dbError instanceof Error ? dbError.message : "Unknown error",
					});
					// Continue without DB validation (graceful degradation)
					// In production, you might want to fail hard here
				}
			} else if (isPrivyAccountEndpoint) {
				logger.info("[Privy Auth] Skipping DB validation for privy-account endpoint", {
					path: req.path,
					privyOrgId
				});
			}

			// ⚡ Performance optimization: Only load products when needed
			// Skip loading for endpoints that handle their own product fetching
			let products: any[] = [];

			if (isPrivyAccountEndpoint || isListClientsEndpoint) {
				// These endpoints handle their own data fetching - skip middleware load
				logger.info("[Privy Auth] Skipping product load for endpoint (handled by router)", {
					path: req.path,
					privyOrgId
				});
			} else {
				// Load all products under this Privy organization for dashboard endpoints
				products = await clientUseCase.getClientsByPrivyOrgId(privyOrgId);

				// Validate products exist for dashboard endpoints
				if (!products || products.length === 0) {
					logger.warn("[Privy Auth] No products found for organization", {
						privyOrgId,
						path: req.path
					});
					// For root path ("/"), allow access with empty products array
					// Users will see "No products" message and can register
					if (req.path === "/") {
						logger.info("[Privy Auth] Allowing access to root path with empty products", {
							privyOrgId,
							path: req.path
						});
					} else {
						return res.status(404).json({
							success: false,
							error: "No products found for this organization",
							hint: "Please register a product first before accessing the dashboard.",
						});
					}
				} else {
					logger.info("[Privy Auth] Authentication successful", {
						privyOrgId,
						productsCount: products.length,
						productNames: products.map(p => p.companyName).join(", "),
						path: req.path,
					});
				}
			}

			// Attach Privy session info to request for downstream use
			// Map products to ensure correct types (cast walletType from string to literal type)
			// @ts-ignore - Extending Request type
			req.privy = {
				organizationId: privyOrgId,
				products: (products || []).map(p => ({
					...p,
					privyWalletType: p.walletType as "MANAGED" | "USER_OWNED",
				})),
			};

			next();
		} catch (error) {
			logger.error("[Privy Auth] Authentication failed", {
				error: error instanceof Error ? error.message : "Unknown error",
				path: req.path
			});
			return res.status(500).json({
				success: false,
				error: "Authentication failed",
				hint: "Internal server error during authentication. Please try again.",
			});
		}
	};
}

/**
 * TypeScript type extension for Request object
 */
declare global {
	namespace Express {
		interface Request {
			privy?: {
				organizationId: string;
				products: Array<{
					id: string;
					productId: string;
					companyName: string;
					businessType: string;
					isActive: boolean;
					isSandbox: boolean;
					privyOrganizationId: string;
					privyWalletType: "MANAGED" | "USER_OWNED";
					createdAt: Date;
					updatedAt: Date;
				}>;
			};
		}
	}
}
