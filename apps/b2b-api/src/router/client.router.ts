/**
 * B2B Client Router - ts-rest implementation
 * Maps HTTP requests to service layer
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@quirk/b2b-api-core";
import type { ClientService } from "../service/client.service";
import { logger } from "../logger";
import { randomUUID } from "crypto";

export const createClientRouter = (
	s: ReturnType<typeof initServer>,
	clientService: ClientService
): any => {

	// Helper: normalize bankAccounts field (DB may store as JSON string)
	const normalizeBankAccounts = (raw: any): any[] => {
		if (!raw) return []
		if (typeof raw === "string") {
			try {
				const parsed = JSON.parse(raw)
				return Array.isArray(parsed) ? parsed : []
			} catch (e) {
				logger.warn("Failed to parse bankAccounts JSON", { raw })
				return []
			}
		}
		if (Array.isArray(raw)) return raw
		return []
	}

	// Helper: Validate Privy access to productId
	const validatePrivyAccess = (req: any, productId: string): boolean => {
		const privySession = (req as any).privy;
		if (!privySession) {
			logger.warn("[Client Router] No Privy session found", { productId });
			return false;
		}
		const productIds = privySession.products.map((p: any) => p.productId);
		const hasAccess = productIds.includes(productId);
		if (!hasAccess) {
			logger.warn("[Client Router] Dashboard user attempting to access unauthorized product", {
				requestedProductId: productId,
				authorizedProductIds: productIds,
			});
		}
		return hasAccess;
	}

	// Helper: Validate Privy access to clientId
	const validatePrivyAccessById = (req: any, clientId: string): boolean => {
		const privySession = (req as any).privy;
		if (!privySession) {
			logger.warn("[Client Router] No Privy session found", { clientId });
			return false;
		}
		const productIds = privySession.products.map((p: any) => p.id);
		const hasAccess = productIds.includes(clientId);
		if (!hasAccess) {
			logger.warn("[Client Router] Dashboard user attempting to access unauthorized client", {
				requestedClientId: clientId,
				authorizedProductIds: productIds,
			});
		}
		return hasAccess;
	}

	return s.router(b2bContract.client, {
		// GET /clients/:id (Dashboard only)
		getById: async ({ params, req }: { params: { id: string }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccessById(req, params.id)) {
					return {
						status: 403 as const,
						body: {
							success: false,
							error: "Access denied - client not in your organization",
						},
					};
				}

				const client = await clientService.getClientByProductId(params.id);

				return {
					status: 200 as const,
					body: {
						found: !!client,
						data: client ? {
							id: client.id,
							productId: client.productId,
							companyName: client.companyName,
							businessType: client.businessType,
							description: client.description || null,
							websiteUrl: client.websiteUrl || null,
							walletType: client.walletType, // ✅ From JOIN
							privyOrganizationId: client.privyOrganizationId,
							sandboxApiKeyPrefix: client.sandboxApiKeyPrefix || null, // ✅ Sandbox API key prefix (pk_test_xxx)
							productionApiKeyPrefix: client.productionApiKeyPrefix || null, // ✅ Production API key prefix (pk_live_xxx)
							supportedCurrencies: client.supportedCurrencies || [],
							bankAccounts: normalizeBankAccounts(client.bankAccounts),
							isActive: client.isActive,
							isSandbox: client.isSandbox || false,
							createdAt: client.createdAt.toISOString(),
							updatedAt: client.updatedAt.toISOString(),
						} : null,
						message: client ? "Client found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting client by ID", { error: error.message, params });
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to get client",
					},
				};
			}
		},

		// GET /clients/product/:productId (Dashboard only)
		getByProductId: async ({ params, req }: { params: { productId: string }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: {
							success: false,
							error: "Access denied - product not in your organization",
						},
					};
				}

				const client = await clientService.getClientByProductId(params.productId);

				// DEBUG: Log data before mapping to response
				logger.info('[Client Router] getByProductId BEFORE MAPPING:', {
					productId: params.productId,
					found: !!client,
					id: client?.id,
					companyName: client?.companyName,
					businessType: client?.businessType,
					description: client?.description,
					clientRevenueSharePercent: client?.clientRevenueSharePercent,
					platformFeePercent: client?.platformFeePercent,
					supportedCurrencies: client?.supportedCurrencies,
					bankAccounts: client?.bankAccounts,
					strategiesPreferences: client?.strategiesPreferences,
					strategiesCustomization: client?.strategiesCustomization,
				})

				return {
					status: 200 as const,
					body: {
						found: !!client,
						data: client ? {
							id: client.id,
							productId: client.productId,
							companyName: client.companyName,
							businessType: client.businessType,
							description: client.description || null,
							websiteUrl: client.websiteUrl || null,
							walletType: client.walletType, // ✅ From JOIN
							privyOrganizationId: client.privyOrganizationId,
							sandboxApiKeyPrefix: client.sandboxApiKeyPrefix || null, // ✅ Sandbox API key prefix (pk_test_xxx)
							productionApiKeyPrefix: client.productionApiKeyPrefix || null, // ✅ Production API key prefix (pk_live_xxx)
							supportedCurrencies: client.supportedCurrencies || [],
							bankAccounts: normalizeBankAccounts(client.bankAccounts),
							isActive: client.isActive,
							isSandbox: client.isSandbox || false,
							createdAt: client.createdAt.toISOString(),
							updatedAt: client.updatedAt.toISOString(),
						} : null,
						message: client ? "Client found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting client by product ID", { error: error.message, params });
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to get client",
					},
				};
			}
		},

		// GET /clients/privy/:privyOrganizationId
		listByPrivyOrgId: async ({ params }: { params: { privyOrganizationId: string } }) => {
			try {
				logger.info("Listing clients by Privy Organization ID", { privyOrganizationId: params.privyOrganizationId });

				const clients = await clientService.getClientsByPrivyOrgId(params.privyOrganizationId);

				logger.info("Found clients", { count: clients.length, privyOrganizationId: params.privyOrganizationId });

				// ✅ Return empty array instead of 404 when no clients exist yet
				// This allows new users to see the registration page
				const mappedClients = (clients || []).map(client => ({
					id: client.id,
					productId: client.productId,
					companyName: client.companyName,
					businessType: client.businessType,
					description: client.description || null,
					websiteUrl: client.websiteUrl || null,
					walletType: client.walletType, // ✅ From JOIN (SQLC generates as walletType)
					privyOrganizationId: client.privyOrganizationId, // ✅ From JOIN
					sandboxApiKeyPrefix: client.sandboxApiKeyPrefix || null, // ✅ Sandbox API key prefix (pk_test_xxx)
					productionApiKeyPrefix: client.productionApiKeyPrefix || null, // ✅ Production API key prefix (pk_live_xxx)
					supportedCurrencies: client.supportedCurrencies || [],
					// Normalize bankAccounts (may be JSON string from DB)
					bankAccounts: normalizeBankAccounts(client.bankAccounts),
					isActive: client.isActive,
					isSandbox: client.isSandbox || false,
					createdAt: client.createdAt.toISOString(),
					updatedAt: client.updatedAt.toISOString(),
				}));

				return {
					status: 200 as const,
					body: mappedClients,
				};
			} catch (error: any) {
				logger.error("Error listing clients by Privy Organization ID", {
					error: error.message,
					params,
					stack: error.stack
				});
				// ✅ Return empty array on error instead of throwing 500
				// This provides better UX for new users
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// POST /clients/product/:productId/regenerate-api-key (Dashboard only)
		regenerateApiKey: async ({ params, query, req }: { params: { productId: string }; query: { environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: {
							success: false,
							error: "Access denied - product not in your organization",
						},
					};
				}

				// ✅ Extract environment from query params (defaults to sandbox)
				const environment = query?.environment || "sandbox";

				logger.info("Regenerating API key for product", {
					productId: params.productId,
					environment
				});

				const result = await clientService.regenerateApiKey(params.productId, environment);

				logger.info("API key regenerated successfully", {
					productId: params.productId,
					clientId: result.client.id,
					environment: result.environment,
					newPrefix: result.api_key.substring(0, 8),
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						api_key: result.api_key, // ← Shown only once!
						productId: result.client.productId,
						message: "API key regenerated successfully. Save it securely - it won't be shown again!",
					},
				};
			} catch (error: any) {
				logger.error("Error regenerating API key", {
					error: error.message,
					params,
					query,
					stack: error.stack
				});
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to regenerate API key",
					},
				};
			}
		},

		// GET /clients/:id/balance
		getBalance: async ({ params }: { params: { id: string } }) => {
			try {
				const balance = await clientService.getClientBalance(params.id);

				return {
					status: 200 as const,
					body: {
						found: !!balance,
						data: balance ? {
							available: balance.available,
							reserved: balance.reserved,
							currency: "USD",
						} : null,
						message: balance ? "Balance found" : "Balance not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting client balance", { error: error.message, params });
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to get balance",
					},
				};
			}
		},

		// POST /clients - Create new client
		create: async ({ body }: { body: any }) => {
			try {
				logger.info("Creating client - Request body", { body });
				console.log("Creating client - Full body:", JSON.stringify(body, null, 2))
				
				// Validate required Privy fields
				if (!body.privyWalletAddress) {
					logger.error("Missing privyWalletAddress in request", { body });
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "privyWalletAddress is required. Please ensure wallet is created before registration.",
						},
					};
				}
				
				// Generate Product ID using UUID (standard and secure)
				const productId = `prod_${randomUUID()}`;
				
				// Map API DTO to internal DTO
				// Note: API key is auto-generated by the usecase
				const request = {
					// Privy account info (stored in privy_accounts table)
					privyOrganizationId: body.privyOrganizationId,
					privyWalletAddress: body.privyWalletAddress, // ✅ Required field
					privyEmail: body.privyEmail || null,
					walletType: body.walletType,

					// Vault creation options (token-centric: each token supports ALL chains)
					vaultsToCreate: body.vaultsToCreate || 'both', // Creates vaults on ALL chains for selected tokens

					// Organization info (stored in client_organizations table)
					productId,
					companyName: body.companyName,
					businessType: body.businessType,
					description: body.description || null,
					websiteUrl: body.websiteUrl || null,
					customerTier: body.customerTier || null, // AUM tier: 0-1K | 1K-10K | etc.
					strategyRanking: body.strategyRanking || null, // Array of strategy IDs

					// Webhook configuration (API key is auto-generated)
					webhookUrls: body.webhookUrls || null,
					webhookSecret: body.webhookSecret || null,

					// Strategy & fees
					customStrategy: body.customStrategy || null,

					// Fee Configuration (3-way revenue split)
					clientRevenueSharePercent: body.clientRevenueSharePercent || '15.00',
					platformFeePercent: body.platformFeePercent || '7.50',
					performanceFee: body.performanceFee || null,

					// Multi-currency support (for off-ramp withdrawals)
					supportedCurrencies: body.supportedCurrencies || [],
					bankAccounts: body.bankAccounts || [],

					// Status
					isActive: body.isActive ?? true,
					isSandbox: body.isSandbox ?? false,
				};

				logger.info("Mapped request", { request });

				const client = await clientService.createClient(request);

				logger.info("Client created successfully", {
					clientId: client.id,
					productId,
				});

				// Normalize bankAccounts (DB may store JSON string)
				const bankAccounts = normalizeBankAccounts(client.bankAccounts)

				// Return response WITH BOTH API keys (shown only once!)
				return {
					status: 201 as const,
					body: {
						id: client.id,
						productId: client.productId,
						companyName: client.companyName,
						businessType: client.businessType,
						description: client.description || null,
						websiteUrl: client.websiteUrl || null,
						walletType: client.walletType, // ✅ From JOIN with privy_accounts
						privyOrganizationId: client.privyOrganizationId, // ✅ From JOIN
						supportedCurrencies: client.supportedCurrencies || [],
						bankAccounts: bankAccounts,
						isActive: client.isActive,
						isSandbox: client.isSandbox || false,
						createdAt: client.createdAt.toISOString(),
						updatedAt: client.updatedAt.toISOString(),
						// API keys are generated separately via the Generate Key button
						sandboxApiKeyPrefix: client.sandboxApiKeyPrefix || null,
						productionApiKeyPrefix: client.productionApiKeyPrefix || null,
					},
				};
			} catch (error: any) {
				logger.error("Error creating client", { 
					error: error.message, 
					stack: error.stack,
					body 
				});
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to create client",
					},
				};
			}
		},

		addFunds: async ({ params, body }: { params: { id: string }; body: any }) => {
			try {
				await clientService.addFunds({
					clientId: params.id,
					amount: body.amount,
					source: body.source,
					reference: body.reference,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						message: `Successfully added ${body.amount} to client balance`,
					},
				};
			} catch (error: any) {
				logger.error("Error adding funds", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to add funds",
					},
				};
			}
		},

		reserveFunds: async ({ params, body }: { params: { id: string }; body: any }) => {
			try {
				await clientService.reserveFunds({
					clientId: params.id,
					amount: body.amount,
					purpose: body.purpose,
					reference: body.reference,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						message: `Successfully reserved ${body.amount}`,
					},
				};
			} catch (error: any) {
				logger.error("Error reserving funds", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to reserve funds",
					},
				};
			}
		},

		releaseReservedFunds: async ({ params, body }: { params: { id: string }; body: any }) => {
			try {
				await clientService.releaseReservedFunds({
					clientId: params.id,
					amount: body.amount,
					purpose: body.purpose || "release",
					reference: body.reference,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						message: `Successfully released ${body.amount}`,
					},
				};
			} catch (error: any) {
				logger.error("Error releasing funds", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to release funds",
					},
				};
			}
		},

		deductReservedFunds: async ({ params, body }: { params: { id: string }; body: any }) => {
			try {
				await clientService.deductReservedFunds({
					clientId: params.id,
					amount: body.amount,
					purpose: body.purpose || "deduct",
					reference: body.reference,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						message: `Successfully deducted ${body.amount}`,
					},
				};
			} catch (error: any) {
				logger.error("Error deducting funds", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to deduct funds",
					},
				};
			}
		},

		// FLOW 2: Configure Vault Strategies (Dashboard only)
		configureStrategies: async ({ params, body, req }: { params: { productId: string }; body: any; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				logger.info("Configuring vault strategies", { productId: params.productId, body });

				// Validate strategies sum to 100%
				const totalAllocation = body.strategies.reduce(
					(sum: number, s: any) => sum + s.target,
					0
				);

				if (totalAllocation !== 100) {
					logger.error("Invalid strategy allocation", { totalAllocation });
					return {
						status: 400 as const,
						body: {
							success: false,
							error: `Strategy allocation must sum to 100%, got ${totalAllocation}%`,
						},
					};
				}

				// Derive token_symbol from token field (USDC, USDT, etc.) or use legacy token_symbol
				const tokenSymbol = body.token || body.token_symbol || 'UNKNOWN';

				// Call service to configure strategies
				await clientService.configureStrategies(params.productId, {
					chain: body.chain,
					tokenAddress: body.token_address,
					tokenSymbol: tokenSymbol,
					strategies: body.strategies,
				});

				logger.info("Vault strategies configured successfully", { productId: params.productId });

				return {
					status: 200 as const,
					body: {
						success: true,
						message: "Vault strategies configured successfully",
					},
				};
			} catch (error: any) {
				logger.error("Error configuring strategies", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to configure strategies",
					},
				};
			}
		},

		// Bulk apply strategy to all products (Dashboard only)
		bulkApplyStrategy: async ({ body, req }: { body: any; req: any }) => {
			try {
				// ✅ Dashboard only: Requires Privy authentication
				const privySession = (req as any).privy;
				if (!privySession) {
					logger.warn("[Bulk Apply Strategy] No Privy session found");
					return {
						status: 401 as const,
						body: { success: false, error: "Authentication required" },
					};
				}

				logger.info("[Bulk Apply Strategy] Starting bulk strategy application", {
					privyOrgId: privySession.organizationId,
					productsCount: privySession.products.length,
					strategies: body.strategies,
				});

				// Validate strategies sum to 100%
				const totalAllocation = body.strategies.reduce(
					(sum: number, s: any) => sum + s.target,
					0
				);

				if (totalAllocation !== 100) {
					logger.error("[Bulk Apply Strategy] Invalid strategy allocation", { totalAllocation });
					return {
						status: 400 as const,
						body: {
							success: false,
							error: `Strategy allocation must sum to 100%, got ${totalAllocation}%`,
						},
					};
				}

				const productsUpdated: string[] = [];
				const productsFailed: Array<{ productId: string; error: string }> = [];

				// Apply strategy to each product's vault
				for (const product of privySession.products) {
					try {
						const tokenSymbol = body.token_symbol || 'UNKNOWN';

						await clientService.configureStrategies(product.productId, {
							chain: body.chain,
							tokenAddress: body.token_address,
							tokenSymbol: tokenSymbol,
							strategies: body.strategies,
						});

						productsUpdated.push(product.productId);
						logger.info("[Bulk Apply Strategy] Successfully updated product", {
							productId: product.productId,
							companyName: product.companyName,
						});
					} catch (error: any) {
						productsFailed.push({
							productId: product.productId,
							error: error.message,
						});
						logger.warn("[Bulk Apply Strategy] Failed to update product", {
							productId: product.productId,
							error: error.message,
						});
					}
				}

				logger.info("[Bulk Apply Strategy] Completed", {
					totalProducts: privySession.products.length,
					successCount: productsUpdated.length,
					failedCount: productsFailed.length,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						productsUpdated,
						message: `Strategy applied to ${productsUpdated.length} of ${privySession.products.length} product(s)`,
					},
				};
			} catch (error: any) {
				logger.error("[Bulk Apply Strategy] Error", { error: error.message, body });
				return {
					status: 400 as const,
					body: { success: false, error: error.message || "Failed to bulk apply strategy" },
				};
			}
		},

		// ============================================
		// SEPARATE CONFIG ENDPOINTS (3 cards on Settings page)
		// ============================================

		// 1. Update organization info only (Dashboard only)
		updateOrganizationInfo: async ({ params, body, req }: { params: { productId: string }; body: any; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				logger.info("Updating organization info", { productId: params.productId, body });

				const result = await clientService.updateOrganizationInfo(params.productId, body);

				if (!result) {
					return {
						status: 400 as const,
						body: { success: false, error: `Client not found: ${params.productId}` },
					};
				}

				return {
					status: 200 as const,
					body: {
						success: true,
						productId: params.productId,
						companyName: result.companyName,
						businessType: result.businessType,
						description: result.description,
						websiteUrl: result.websiteUrl,
						message: "Organization info updated successfully",
					},
				};
			} catch (error: any) {
				logger.error("Error updating organization info", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: { success: false, error: error.message || "Failed to update organization info" },
				};
			}
		},

		// 2. Update supported currencies only (Dashboard only)
		updateSupportedCurrencies: async ({ params, body, req }: { params: { productId: string }; body: { supportedCurrencies: string[] }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				logger.info("Updating supported currencies", { productId: params.productId, currencies: body.supportedCurrencies });

				await clientService.updateSupportedCurrencies(params.productId, body.supportedCurrencies);

				return {
					status: 200 as const,
					body: {
						success: true,
						productId: params.productId,
						supportedCurrencies: body.supportedCurrencies,
						message: `Supported currencies updated: ${body.supportedCurrencies.join(", ")}`,
					},
				};
			} catch (error: any) {
				logger.error("Error updating supported currencies", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: { success: false, error: error.message || "Failed to update supported currencies" },
				};
			}
		},

		// 3. Configure bank accounts for fiat withdrawals (off-ramp) (Dashboard only)
		configureBankAccounts: async ({ params, body, req }: { params: { productId: string }; body: { bankAccounts: any[] }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: {
							success: false,
							error: "Access denied - product not in your organization",
						},
					};
				}

				logger.info("Configuring bank accounts", { productId: params.productId, bankAccountsCount: body.bankAccounts.length });

				// Get client by productId
				const client = await clientService.getClientByProductId(params.productId);
				if (!client) {
					return {
						status: 404 as const,
						body: {
							success: false,
							error: "Client not found",
						},
					};
				}

				// Extract supported currencies from bank accounts
				const supportedCurrencies = Array.from(new Set(body.bankAccounts.map((ba: any) => ba.currency)));

				// Update bank accounts via service
				await clientService.configureBankAccounts(client.id, body.bankAccounts, supportedCurrencies);

				logger.info("Bank accounts configured successfully", { 
					productId: params.productId, 
					currencies: supportedCurrencies 
				});

				// Read back the client to return the canonical/stored bank accounts
				const refreshedClient = await clientService.getClientByProductId(params.productId);

				const returnedBankAccounts = normalizeBankAccounts(refreshedClient?.bankAccounts ?? client.bankAccounts ?? body.bankAccounts);
				const returnedSupportedCurrencies = refreshedClient?.supportedCurrencies ?? supportedCurrencies;

				return {
					status: 200 as const,
					body: {
						success: true,
						productId: params.productId,
						bankAccounts: returnedBankAccounts,
						supportedCurrencies: returnedSupportedCurrencies,
						message: `Bank accounts configured for ${returnedSupportedCurrencies.length} currencies`,
					},
				};
			} catch (error: any) {
				logger.error("Error configuring bank accounts", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: error.message || "Failed to configure bank accounts",
					},
				};
			}
		},

		// Get bank accounts for a client (Dashboard only)
		getBankAccounts: async ({ params, req }: { params: { productId: string }; req: any }) => {
			try {
				// ✅ Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: {
							success: false,
							error: "Access denied - product not in your organization",
						},
					};
				}

				const client = await clientService.getClientByProductId(params.productId);

				// Normalize bankAccounts (DB may store JSON string)
				const bankAccounts = client ? normalizeBankAccounts(client.bankAccounts) : [];

				return {
					status: 200 as const,
					body: {
						found: !!client,
						data: client ? {
							productId: params.productId,
							bankAccounts,
							supportedCurrencies: client.supportedCurrencies || [],
						} : null,
						message: client ? "Bank accounts found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting bank accounts", { error: error.message, params });
				return {
					status: 500 as const,
					body: {
						success: false,
						error: error.message || "Failed to get bank accounts",
					},
				};
			}
		},

		// ============================================
		// PRODUCT-LEVEL STRATEGY ENDPOINTS
		// ============================================

		getProductStrategies: async ({ params, req }: { params: { productId: string }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied" },
					};
				}

				// TODO: Implement getProductStrategies method in ClientService
				// const strategies = await clientService.getProductStrategies(params.productId);
				const strategies = null;

				return {
					status: 200 as const,
					body: {
						found: false,
						data: null,
						message: "Product strategies not implemented yet",
					},
				};
			} catch (error: any) {
				logger.error("Error getting product strategies", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get product strategies" },
				};
			}
		},

		updateProductStrategiesCustomization: async ({
			params,
			body,
			req,
		}: {
			params: { productId: string };
			body: { strategies: Record<string, Record<string, number>> };
			req: any;
		}) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied" },
					};
				}

				await clientService.updateProductStrategiesCustomization(
					params.productId,
					body.strategies
				);

				return {
					status: 200 as const,
					body: {
						success: true,
						productId: params.productId,
						strategies: body.strategies,
						message: "Product strategies updated successfully",
					},
				};
			} catch (error: any) {
				logger.error("Error updating product strategies", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: { success: false, error: error.message || "Failed to update product strategies" },
				};
			}
		},

		getEffectiveProductStrategies: async ({ params, req }: { params: { productId: string }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied" },
					};
				}

				const result = await clientService.getEffectiveProductStrategies(params.productId);

				// DEBUG: Log strategies before mapping to response
				logger.info('[Client Router] getEffectiveProductStrategies BEFORE MAPPING:', {
					productId: params.productId,
					found: !!result,
					result,
					strategies: result?.strategies,
					source: result?.source,
				})

				const responseBody = {
					found: !!result,
					data: result ? {
						productId: params.productId,
						strategies: result.strategies,
						source: result.source as "preferences" | "customization",
					} : null,
					message: result ? "Effective strategies found" : "Effective strategies not found",
				}

				logger.info('[Client Router] getEffectiveProductStrategies RESPONSE BODY:', responseBody)

				return {
					status: 200 as const,
					body: responseBody,
				};
			} catch (error: any) {
				logger.error("Error getting effective product strategies", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get effective product strategies" },
				};
			}
		},

		// ============================================
		// FEE CONFIGURATION (Revenue Share)
		// ============================================

		updateFeeConfig: async ({ params, body, req }: { params: { productId: string }; body: any; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				logger.info("Updating fee configuration", { productId: params.productId, body });

				const result = await clientService.updateFeeConfig(params.productId, body.clientRevenueSharePercent);

				if (!result) {
					return {
						status: 400 as const,
						body: { success: false, error: `Client not found: ${params.productId}` },
					};
				}

				const clientPercent = parseFloat(result.clientRevenueSharePercent);
				const platformPercent = parseFloat(result.platformFeePercent);
				const enduserPercent = 100 - clientPercent - platformPercent;

				return {
					status: 200 as const,
					body: {
						success: true,
						productId: params.productId,
						clientRevenueSharePercent: result.clientRevenueSharePercent,
						platformFeePercent: result.platformFeePercent,
						enduserFeePercent: enduserPercent.toFixed(2),
						message: "Fee configuration updated successfully",
					},
				};
			} catch (error: any) {
				logger.error("Error updating fee configuration", { error: error.message, params, body });
				return {
					status: 400 as const,
					body: { success: false, error: error.message || "Failed to update fee configuration" },
				};
			}
		},

		getFeeConfig: async ({ params, req }: { params: { productId: string }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				const client = await clientService.getClientByProductId(params.productId);

				const clientPercent = client ? parseFloat(client.clientRevenueSharePercent) : 0;
				const platformPercent = client ? parseFloat(client.platformFeePercent) : 0;
				const enduserPercent = 100 - clientPercent - platformPercent;

				return {
					status: 200 as const,
					body: {
						found: !!client,
						data: client ? {
							productId: params.productId,
							clientRevenueSharePercent: client.clientRevenueSharePercent,
							platformFeePercent: client.platformFeePercent,
							enduserFeePercent: enduserPercent.toFixed(2),
						} : null,
						message: client ? "Fee configuration found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting fee configuration", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get fee configuration" },
				};
			}
		},

		// ============================================
		// REVENUE METRICS (Dashboard)
		// ============================================

		getRevenueMetrics: async ({ params, query, req }: { params: { productId: string }; query: { environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;

				const metrics = await clientService.getRevenueMetrics(params.productId, environment);

				return {
					status: 200 as const,
					body: {
						found: !!metrics,
						data: metrics ? {
							productId: params.productId,
							monthlyRecurringRevenue: metrics.monthlyRecurringRevenue,
							annualRunRate: metrics.annualRunRate,
							totalClientRevenue: metrics.totalClientRevenue,
							totalPlatformRevenue: metrics.totalPlatformRevenue,
							totalEnduserRevenue: metrics.totalEnduserRevenue,
							totalEarningBalance: metrics.totalEarningBalance,
							clientRevenuePercent: metrics.clientRevenuePercent,
							platformFeePercent: metrics.platformFeePercent,
							enduserFeePercent: metrics.enduserFeePercent,
							lastCalculatedAt: metrics.lastCalculatedAt,
						} : null,
						message: metrics ? "Revenue metrics found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting revenue metrics", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get revenue metrics" },
				};
			}
		},

		// ============================================
		// END-USER METRICS (Dashboard)
		// ============================================

		getEndUserGrowthMetrics: async ({ params, query, req }: { params: { productId: string }; query: { environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;

				const metrics = await clientService.getEndUserGrowthMetrics(params.productId, environment);

				return {
					status: 200 as const,
					body: {
						found: !!metrics,
						data: metrics ? {
							productId: params.productId,
							totalEndUsers: metrics.totalEndUsers,
							newUsers30d: metrics.newUsers30d,
							activeUsers30d: metrics.activeUsers30d,
							totalDeposited: metrics.totalDeposited,
							totalWithdrawn: metrics.totalWithdrawn,
							totalDeposits: metrics.totalDeposits,
							totalWithdrawals: metrics.totalWithdrawals,
						} : null,
						message: metrics ? "End-user metrics found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting end-user growth metrics", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get end-user growth metrics" },
				};
			}
		},

		getEndUserTransactions: async ({ params, query, req }: { params: { productId: string }; query: { page: number; limit: number; environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				const { page = 1, limit = 20, environment } = query;
				const result = await clientService.getEndUserTransactions(params.productId, page, limit, environment);

				return {
					status: 200 as const,
					body: {
						found: !!result,
						data: result ? {
							productId: params.productId,
							transactions: result.transactions.map((tx: any) => ({
								transactionType: tx.transactionType,
								id: tx.id,
								userId: tx.userId,
								amount: tx.amount,
								currency: tx.currency,
								status: tx.status,
								timestamp: tx.timestamp.toISOString(),
							})),
							pagination: {
								page,
								limit,
								total: result.total,
							},
						} : null,
						message: result ? "Transactions found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting end-user transactions", { error: error.message, params, query });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get end-user transactions" },
				};
			}
		},

		// ============================================
		// WALLET STAGES (Dashboard)
		// ============================================

		getWalletBalances: async ({ params, query, req }: { params: { productId: string }; query: { environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;

				const balances = await clientService.getWalletBalances(params.productId, environment);

				return {
					status: 200 as const,
					body: {
						found: !!balances,
						data: balances ? {
							productId: params.productId,
							totalIdleBalance: balances.totalIdleBalance,
							totalEarningBalance: balances.totalEarningBalance,
							totalClientRevenue: balances.totalClientRevenue,
							totalPlatformRevenue: balances.totalPlatformRevenue,
							totalEnduserRevenue: balances.totalEnduserRevenue,
							totalCumulativeYield: balances.totalCumulativeYield,
						} : null,
						message: balances ? "Wallet balances found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting wallet balances", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get wallet balances" },
				};
			}
		},

		// ============================================
		// DASHBOARD SUMMARY (All Metrics Combined)
		// ============================================

		getDashboardSummary: async ({ params, query, req }: { params: { productId: string }; query: { environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// Dashboard only: Validate Privy access
				if (!validatePrivyAccess(req, params.productId)) {
					return {
						status: 403 as const,
						body: { success: false, error: "Access denied - product not in your organization" },
					};
				}

				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;
				logger.info("[Client Router] getDashboardSummary", { productId: params.productId, environment });

				const summary = await clientService.getDashboardSummary(params.productId, environment);

				return {
					status: 200 as const,
					body: {
						found: !!summary,
						data: summary ? {
							productId: params.productId,
							companyName: summary.companyName,
							balances: {
								totalIdleBalance: summary.balances.totalIdleBalance,
								totalEarningBalance: summary.balances.totalEarningBalance,
								totalClientRevenue: summary.balances.totalClientRevenue,
								totalPlatformRevenue: summary.balances.totalPlatformRevenue,
								totalEnduserRevenue: summary.balances.totalEnduserRevenue,
							},
							revenue: {
								monthlyRecurringRevenue: summary.revenue.monthlyRecurringRevenue,
								annualRunRate: summary.revenue.annualRunRate,
								clientRevenuePercent: summary.revenue.clientRevenuePercent,
								platformFeePercent: summary.revenue.platformFeePercent,
								enduserFeePercent: summary.revenue.enduserFeePercent,
								lastCalculatedAt: summary.revenue.lastCalculatedAt,
							},
							endUsers: {
								totalEndUsers: summary.endUsers.totalEndUsers,
								newUsers30d: summary.endUsers.newUsers30d,
								activeUsers30d: summary.endUsers.activeUsers30d,
								totalDeposited: summary.endUsers.totalDeposited,
								totalWithdrawn: summary.endUsers.totalWithdrawn,
							},
							recentTransactions: summary.recentTransactions.map((tx: any) => ({
								transactionType: tx.transactionType,
								id: tx.id,
								userId: tx.userId,
								amount: tx.amount,
								currency: tx.currency,
								status: tx.status,
								timestamp: tx.timestamp.toISOString(),
							})),
						} : null,
						message: summary ? "Dashboard summary found" : "Client not found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting dashboard summary", { error: error.message, params });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get dashboard summary" },
				};
			}
		},

		// Get aggregated dashboard summary across all products
		getAggregateDashboardSummary: async ({ query, req }: { query: { environment?: "sandbox" | "production" }; req: any }) => {
			try {
				// Extract Privy organization ID from authenticated session
				const privySession = (req as any).privy;
				if (!privySession || !privySession.organizationId) {
					return {
						status: 403 as const,
						body: { success: false, error: "Privy authentication required" },
					};
				}

				const privyOrganizationId = privySession.organizationId;
				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;
				logger.info("[Client Router] Getting aggregated dashboard for Privy org", { privyOrganizationId, environment });

				const summary = await clientService.getAggregateDashboardSummary(privyOrganizationId, environment);

				return {
					status: 200 as const,
					body: {
						found: !!summary,
						data: summary ? {
							productId: summary.productId,
							companyName: summary.companyName,
							balances: {
								totalIdleBalance: summary.balances.totalIdleBalance,
								totalEarningBalance: summary.balances.totalEarningBalance,
								totalClientRevenue: summary.balances.totalClientRevenue,
								totalPlatformRevenue: summary.balances.totalPlatformRevenue,
								totalEnduserRevenue: summary.balances.totalEnduserRevenue,
							},
							revenue: {
								monthlyRecurringRevenue: summary.revenue.monthlyRecurringRevenue,
								annualRunRate: summary.revenue.annualRunRate,
								clientRevenuePercent: summary.revenue.clientRevenuePercent,
								platformFeePercent: summary.revenue.platformFeePercent,
								enduserFeePercent: summary.revenue.enduserFeePercent,
								lastCalculatedAt: summary.revenue.lastCalculatedAt,
							},
							endUsers: {
								totalEndUsers: summary.endUsers.totalEndUsers,
								newUsers30d: summary.endUsers.newUsers30d,
								activeUsers30d: summary.endUsers.activeUsers30d,
								totalDeposited: summary.endUsers.totalDeposited,
								totalWithdrawn: summary.endUsers.totalWithdrawn,
							},
						} : null,
						message: summary ? "Aggregated dashboard summary found" : "No organizations found",
					},
				};
			} catch (error: any) {
				logger.error("Error getting aggregated dashboard summary", { error: error.message });
				return {
					status: 500 as const,
					body: { success: false, error: error.message || "Failed to get aggregated dashboard summary" },
				};
			}
		},
	});
}
