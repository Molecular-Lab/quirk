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
	UpdateFeeConfigDto,
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
			200: z.object({
				found: z.boolean(),
				data: ClientDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get client by ID",
	},

	// Get client by product ID
	getByProductId: {
		method: "GET",
		path: "/clients/product/:productId",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: ClientDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get client by product ID",
	},

	// List all clients by Privy Organization ID
	listByPrivyOrgId: {
		method: "GET",
		path: "/clients/privy/:privyOrganizationId",
		responses: {
			200: z.array(ClientDto), // Returns empty array [] if user has no products
			500: ErrorResponseDto, // Server/database errors
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
			200: z.object({
				found: z.boolean(),
				data: ClientBalanceDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
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
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					bankAccounts: z.array(ClientBankAccountDto),
					supportedCurrencies: z.array(z.string()),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
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
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					preferences: z.record(z.string(), z.record(z.string(), z.number())),
					customization: z.record(z.string(), z.record(z.string(), z.number())),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
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
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					strategies: z.record(z.string(), z.record(z.string(), z.number())),
					source: z.enum(["preferences", "customization"]),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get effective strategies (customization if set, otherwise preferences)",
	},

	// ============================================
	// FEE CONFIGURATION (Revenue Share)
	// ============================================

	// Update fee configuration (client revenue share %)
	updateFeeConfig: {
		method: "PATCH",
		path: "/clients/product/:productId/fee-config",
		responses: {
			200: z.object({
				success: z.boolean(),
				productId: z.string(),
				clientRevenueSharePercent: z.string(),
				platformFeePercent: z.string(),
				enduserFeePercent: z.string(), // Calculated: 100 - client - platform
				message: z.string(),
			}),
			400: ErrorResponseDto,
		},
		body: UpdateFeeConfigDto,
		summary: "Update client revenue share percentage (10-20%). Platform fee remains fixed.",
	},

	// Get fee configuration
	getFeeConfig: {
		method: "GET",
		path: "/clients/product/:productId/fee-config",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					clientRevenueSharePercent: z.string(),
					platformFeePercent: z.string(),
					enduserFeePercent: z.string(), // Calculated: 100 - client - platform
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get current fee configuration for client",
	},

	// ============================================
	// REVENUE METRICS (Dashboard)
	// ============================================

	// Get revenue metrics for client (MRR, ARR, cumulative revenue)
	getRevenueMetrics: {
		method: "GET",
		path: "/clients/product/:productId/revenue",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional(),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					monthlyRecurringRevenue: z.string(),
					annualRunRate: z.string(),
					totalClientRevenue: z.string(),
					totalPlatformRevenue: z.string(),
					totalEnduserRevenue: z.string(),
					totalEarningBalance: z.string(),
					clientRevenuePercent: z.string(),
					platformFeePercent: z.string(),
					enduserFeePercent: z.string(), // Calculated: 100 - client - platform
					lastCalculatedAt: z.string().nullable(),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get revenue metrics for client dashboard (MRR, ARR, cumulative revenue)",
	},

	// ============================================
	// END-USER METRICS (Dashboard)
	// ============================================

	// Get end-user growth metrics (total users, new users, active users, deposits/withdrawals)
	getEndUserGrowthMetrics: {
		method: "GET",
		path: "/clients/product/:productId/end-users/metrics",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional(),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					totalEndUsers: z.number().int(),
					newUsers30d: z.number().int(),
					activeUsers30d: z.number().int(),
					totalDeposited: z.string(),
					totalWithdrawn: z.string(),
					totalDeposits: z.number().int(),
					totalWithdrawals: z.number().int(),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get end-user growth metrics for client dashboard",
	},

	// Get recent end-user transactions (deposits & withdrawals)
	getEndUserTransactions: {
		method: "GET",
		path: "/clients/product/:productId/end-users/transactions",
		query: z.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(20),
			environment: z.enum(["sandbox", "production"]).optional(),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					transactions: z.array(
						z.object({
							transactionType: z.enum(["deposit", "withdrawal"]),
							id: z.string(),
							userId: z.string(),
							amount: z.string(),
							currency: z.string(),
							status: z.string(),
							timestamp: z.string(),
						})
					),
					pagination: z.object({
						page: z.number(),
						limit: z.number(),
						total: z.number(),
					}),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get recent end-user transactions (deposits & withdrawals) with pagination",
	},

	// ============================================
	// WALLET STAGES (Dashboard)
	// ============================================

	// Get wallet balance stages (idle & earning)
	getWalletBalances: {
		method: "GET",
		path: "/clients/product/:productId/wallet/balances",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional(),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					totalIdleBalance: z.string(),
					totalEarningBalance: z.string(),
					totalClientRevenue: z.string(),
					totalPlatformRevenue: z.string(),
					totalEnduserRevenue: z.string(),
					totalCumulativeYield: z.string(),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get wallet balance stages (idle balance, earning balance, revenue breakdown)",
	},

	// ============================================
	// DASHBOARD SUMMARY (All Metrics Combined)
	// ============================================

	// Get complete dashboard summary (all metrics in one call)
	getDashboardSummary: {
		method: "GET",
		path: "/clients/product/:productId/dashboard",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional(),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(),
					companyName: z.string(),
					// Wallet Balances
					balances: z.object({
						totalIdleBalance: z.string(),
						totalEarningBalance: z.string(),
						totalClientRevenue: z.string(),
						totalPlatformRevenue: z.string(),
						totalEnduserRevenue: z.string(),
					}),
					// Revenue Metrics
					revenue: z.object({
						monthlyRecurringRevenue: z.string(),
						annualRunRate: z.string(),
						clientRevenuePercent: z.string(),
						platformFeePercent: z.string(),
						enduserFeePercent: z.string(),
						lastCalculatedAt: z.string().nullable(),
					}),
					// End-User Metrics
					endUsers: z.object({
						totalEndUsers: z.number().int(),
						newUsers30d: z.number().int(),
						activeUsers30d: z.number().int(),
						totalDeposited: z.string(),
						totalWithdrawn: z.string(),
					}),
					// Recent Transactions (last 10)
					recentTransactions: z.array(
						z.object({
							transactionType: z.enum(["deposit", "withdrawal"]),
							id: z.string(),
							userId: z.string(),
							amount: z.string(),
							currency: z.string(),
							status: z.string(),
							timestamp: z.string(),
						})
					),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get complete dashboard summary (balances, revenue, end-users, recent transactions)",
	},

	// Get aggregated dashboard summary across all products
	getAggregateDashboardSummary: {
		method: "GET",
		path: "/clients/dashboard/aggregate",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional(),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: z.object({
					productId: z.string(), // Will be "aggregate"
					companyName: z.string(),
					// Aggregated Wallet Balances
					balances: z.object({
						totalIdleBalance: z.string(),
						totalEarningBalance: z.string(),
						totalClientRevenue: z.string(),
						totalPlatformRevenue: z.string(),
						totalEnduserRevenue: z.string(),
					}),
					// Aggregated Revenue Metrics
					revenue: z.object({
						monthlyRecurringRevenue: z.string(),
						annualRunRate: z.string(),
						clientRevenuePercent: z.string(), // Weighted average
						platformFeePercent: z.string(), // Weighted average
						enduserFeePercent: z.string(), // Weighted average
						lastCalculatedAt: z.string().nullable(),
					}),
					// Aggregated End-User Metrics
					endUsers: z.object({
						totalEndUsers: z.number().int(),
						newUsers30d: z.number().int(),
						activeUsers30d: z.number().int(),
						totalDeposited: z.string(),
						totalWithdrawn: z.string(),
					}),
				}).nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get aggregated dashboard summary across ALL products for the authenticated Privy user",
	},
});
