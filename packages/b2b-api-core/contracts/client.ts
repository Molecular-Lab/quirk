/**
 * B2B Client Contract
 * Type-safe API definitions for client operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
	AddFundsDto,
	ClientBalanceDto,
	ClientBankAccountDto,
	ClientDto,
	CreateClientDto,
	DeductReservedDto,
	ErrorResponseDto,
	ReleaseFundsDto,
	ReserveFundsDto,
	SuccessResponseDto,
	UpdateOrganizationInfoDto,
	UpdateSupportedCurrenciesDto,
} from "../dto";

const c = initContract();

export const clientContract = c.router({
	// Create client
	create: {
		method: "POST",
		path: "/clients",
		responses: {
			201: ClientDto,
			400: ErrorResponseDto,
		},
		body: CreateClientDto,
		summary: "Create a new B2B client organization",
	},

	// Get client by ID
	getById: {
		method: "GET",
		path: "/clients/:id",
		responses: {
			200: ClientDto,
			404: ErrorResponseDto,
		},
		summary: "Get client by ID",
	},

	// Get client by product ID
	getByProductId: {
		method: "GET",
		path: "/clients/product/:productId",
		responses: {
			200: ClientDto,
			404: ErrorResponseDto,
		},
		summary: "Get client by product ID",
	},

	// List all clients by Privy Organization ID
	listByPrivyOrgId: {
		method: "GET",
		path: "/clients/privy/:privyOrganizationId",
		responses: {
			200: z.array(ClientDto),
			404: ErrorResponseDto,
		},
		summary: "List all client organizations for a Privy user",
	},

	// Regenerate API key for existing client
	regenerateApiKey: {
		method: "POST",
		path: "/clients/product/:productId/regenerate-api-key",
		responses: {
			200: z.object({
				success: z.boolean(),
				api_key: z.string(),
				productId: z.string(),
				message: z.string(),
			}),
			400: ErrorResponseDto,
		},
		body: z.object({}), // No body required, productId in path
		summary: "Regenerate API key for client (invalidates old key immediately)",
	},

	// Get client balance
	getBalance: {
		method: "GET",
		path: "/clients/:id/balance",
		responses: {
			200: ClientBalanceDto,
			404: ErrorResponseDto,
		},
		summary: "Get client balance",
	},

	// Add funds
	addFunds: {
		method: "POST",
		path: "/clients/:id/balance/add",
		responses: {
			200: SuccessResponseDto,
			400: ErrorResponseDto,
		},
		body: AddFundsDto,
		summary: "Add funds to client balance",
	},

	// Reserve funds
	reserveFunds: {
		method: "POST",
		path: "/clients/:id/balance/reserve",
		responses: {
			200: SuccessResponseDto,
			400: ErrorResponseDto,
		},
		body: ReserveFundsDto,
		summary: "Reserve funds from available balance",
	},

	// Release reserved funds
	releaseReservedFunds: {
		method: "POST",
		path: "/clients/:id/balance/release",
		responses: {
			200: SuccessResponseDto,
			400: ErrorResponseDto,
		},
		body: ReleaseFundsDto,
		summary: "Release reserved funds back to available",
	},

	// Deduct reserved funds
	deductReservedFunds: {
		method: "POST",
		path: "/clients/:id/balance/deduct",
		responses: {
			200: SuccessResponseDto,
			400: ErrorResponseDto,
		},
		body: DeductReservedDto,
		summary: "Deduct from reserved balance",
	},

	// Configure vault strategies (FLOW 2)
	configureStrategies: {
		method: "POST",
		path: "/products/:productId/strategies",
		responses: {
			200: SuccessResponseDto,
			400: ErrorResponseDto,
		},
		body: z.object({
			chain: z.string(),
			token_address: z.string(),
			token_symbol: z.string().optional(),
			strategies: z.array(
				z.object({
					category: z.enum(["lending", "lp", "staking"]),
					target: z.number().min(0).max(100),
				}),
			),
		}),
		summary: "Configure DeFi strategy allocation for client vault (by productId)",
	},

	// Bulk apply strategy to all products under authenticated Privy account
	bulkApplyStrategy: {
		method: "POST",
		path: "/clients/bulk-apply-strategy",
		responses: {
			200: z.object({
				success: z.boolean(),
				productsUpdated: z.array(z.string()),
				message: z.string(),
			}),
			400: ErrorResponseDto,
			401: ErrorResponseDto,
		},
		body: z.object({
			chain: z.string(),
			token_address: z.string(),
			token_symbol: z.string().optional(),
			strategies: z.array(
				z.object({
					category: z.enum(["lending", "lp", "staking"]),
					target: z.number().min(0).max(100),
				}),
			),
		}),
		summary: "Apply strategy to all products under authenticated Privy account (Dashboard only)",
	},

	// ============================================
	// SEPARATE CONFIG ENDPOINTS (3 cards on Settings page)
	// ============================================

	// 1. Update organization info only
	updateOrganizationInfo: {
		method: "PATCH",
		path: "/clients/product/:productId/organization",
		responses: {
			200: z.object({
				success: z.boolean(),
				productId: z.string(),
				companyName: z.string(),
				businessType: z.string(),
				description: z.string().nullable(),
				websiteUrl: z.string().nullable(),
				message: z.string(),
			}),
			400: ErrorResponseDto,
			404: ErrorResponseDto,
		},
		body: UpdateOrganizationInfoDto,
		summary: "Update organization info (company name, description, website)",
	},

	// 2. Update supported currencies only
	updateSupportedCurrencies: {
		method: "PATCH",
		path: "/clients/product/:productId/currencies",
		responses: {
			200: z.object({
				success: z.boolean(),
				productId: z.string(),
				supportedCurrencies: z.array(z.string()),
				message: z.string(),
			}),
			400: ErrorResponseDto,
			404: ErrorResponseDto,
		},
		body: UpdateSupportedCurrenciesDto,
		summary: "Update supported currencies for the client",
	},

	// 3. Configure bank accounts for withdrawals (off-ramp)
	configureBankAccounts: {
		method: "POST",
		path: "/clients/product/:productId/bank-accounts",
		responses: {
			200: z.object({
				success: z.boolean(),
				productId: z.string(),
				bankAccounts: z.array(ClientBankAccountDto),
				supportedCurrencies: z.array(z.string()),
				message: z.string(),
			}),
			400: ErrorResponseDto,
			404: ErrorResponseDto,
		},
		body: z.object({
			bankAccounts: z.array(ClientBankAccountDto),
		}),
		summary: "Configure bank accounts for fiat withdrawals (off-ramp)",
	},

	// Get bank accounts for a client
	getBankAccounts: {
		method: "GET",
		path: "/clients/product/:productId/bank-accounts",
		responses: {
			200: z.object({
				productId: z.string(),
				bankAccounts: z.array(ClientBankAccountDto),
				supportedCurrencies: z.array(z.string()),
			}),
			404: ErrorResponseDto,
		},
		summary: "Get configured bank accounts for a client",
	},

	// ============================================
	// PRODUCT-LEVEL STRATEGY ENDPOINTS
	// ============================================

	// Get product strategies (preferences and customization)
	getProductStrategies: {
		method: "GET",
		path: "/products/:productId/strategies",
		responses: {
			200: z.object({
				productId: z.string(),
				preferences: z.record(z.string(), z.record(z.string(), z.number())),
				customization: z.record(z.string(), z.record(z.string(), z.number())),
			}),
			404: ErrorResponseDto,
		},
		summary: "Get product strategy preferences and customization",
	},

	// Update product strategy customization
	updateProductStrategiesCustomization: {
		method: "PUT",
		path: "/products/:productId/strategies/customization",
		responses: {
			200: z.object({
				success: z.boolean(),
				productId: z.string(),
				strategies: z.record(z.string(), z.record(z.string(), z.number())),
				message: z.string(),
			}),
			400: ErrorResponseDto,
			404: ErrorResponseDto,
		},
		body: z.object({
			strategies: z.record(z.string(), z.record(z.string(), z.number())),
		}),
		summary: "Update product strategy customization (from Market Analysis dashboard)",
	},

	// Get effective product strategies
	getEffectiveProductStrategies: {
		method: "GET",
		path: "/products/:productId/strategies/effective",
		responses: {
			200: z.object({
				productId: z.string(),
				strategies: z.record(z.string(), z.record(z.string(), z.number())),
				source: z.enum(["preferences", "customization"]),
			}),
			404: ErrorResponseDto,
		},
		summary: "Get effective strategies (customization if set, otherwise preferences)",
	},
});
