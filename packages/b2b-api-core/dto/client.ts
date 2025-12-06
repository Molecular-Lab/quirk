/**
 * Client DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

// Client's bank account for receiving withdrawal funds (off-ramp)
export const ClientBankAccountDto = z.object({
	currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]),
	bank_name: z.string(),
	account_number: z.string(),
	account_name: z.string(),
	bank_details: z.record(z.any()).optional(), // Dynamic JSONB: {swift_code, bank_code, branch_code, promptpay_id, etc.}
});

export const CreateClientDto = z.object({
	companyName: z.string().min(1),
	businessType: z.string(),
	description: z.string().optional(),
	websiteUrl: z.string().url().optional(),
	customerTier: z.enum(["0-1K", "1K-10K", "10K-100K", "100K-1M", "1M+"]).optional(),
	strategyRanking: z.array(z.string()).optional(), // Array of strategy IDs in order of preference
	walletType: z.enum(["MANAGED", "USER_OWNED"]),
	chain: z.string().optional(), // Optional chain for initial vault(s), defaults to "8453" (Base)
	vaultsToCreate: z.enum(["usdc", "usdt", "both"]).optional(), // Which vaults to create, defaults to "both"
	privyOrganizationId: z.string(),
	privyWalletAddress: z.string().min(1), // ✅ Required - Wallet address from Privy
	privyEmail: z.string().email().optional().nullable(), // ✅ Optional - Email from Privy

	// Currency & banking configuration (for off-ramp withdrawals)
	supportedCurrencies: z.array(z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"])).optional(),
	bankAccounts: z.array(ClientBankAccountDto).optional(),
});

export const AddFundsDto = z.object({
	amount: z.string(),
	source: z.string(),
	reference: z.string().optional(),
});

export const ReserveFundsDto = z.object({
	amount: z.string(),
	purpose: z.string(),
	reference: z.string().optional(),
});

export const ReleaseFundsDto = z.object({
	amount: z.string(),
	reference: z.string().optional(),
});

export const DeductReservedDto = z.object({
	amount: z.string(),
	reference: z.string().optional(),
});

// ============================================
// UPDATE DTOs (Separate cards/forms)
// ============================================

// Update organization info only (company name, description, etc.)
export const UpdateOrganizationInfoDto = z.object({
	companyName: z.string().min(1).optional(),
	businessType: z.string().optional(),
	description: z.string().optional().nullable(),
	websiteUrl: z
		.string()
		.optional()
		.nullable()
		.refine(
			(val) => {
				// Allow null, undefined, or empty string
				if (!val || val === '') return true
				// If provided, validate URL format
				try {
					new URL(val)
					return true
				} catch {
					return false
				}
			},
			{ message: 'Invalid URL format' }
		),
});

// Update supported currencies only
export const UpdateSupportedCurrenciesDto = z.object({
	supportedCurrencies: z.array(z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"])),
});

// Configure bank accounts (already exists but explicit DTO)
export const ConfigureBankAccountsDto = z.object({
	bankAccounts: z.array(ClientBankAccountDto),
});

// ============================================
// RESPONSE DTOs
// ============================================

export const ClientBalanceDto = z.object({
	available: z.string(),
	reserved: z.string(),
	currency: z.string(),
});

export const ClientDto = z.object({
	id: z.string(),
	productId: z.string(),
	companyName: z.string(),
	businessType: z.string(),
	description: z.string().nullable(),
	websiteUrl: z.string().nullable(),
	customerTier: z.string().nullable().optional(),
	walletType: z.string(),
	privyOrganizationId: z.string(),
	isActive: z.boolean(),
	isSandbox: z.boolean().optional(),
	supportedCurrencies: z.array(z.string()).nullable().optional(),
	bankAccounts: z.array(ClientBankAccountDto).nullable().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

// Separate DTO for API key generation response
export const ApiKeyDto = z.object({
	api_key: z.string(),
	webhook_secret: z.string(),
	productId: z.string(),
	createdAt: z.string(),
	expiresAt: z.string().optional(),
});

export const ClientStatsDto = z.object({
	id: z.string(),
	productId: z.string(),
	companyName: z.string(),
	isActive: z.boolean(),
	balanceAvailable: z.string().nullable(),
	balanceReserved: z.string().nullable(),
	totalEndUsers: z.string(),
	totalVaults: z.string(),
	totalAum: z.string().nullable(),
	totalYieldEarned: z.string().nullable(),
	totalDeposits: z.string(),
	totalWithdrawals: z.string(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type ClientBankAccountDto = z.infer<typeof ClientBankAccountDto>;
export type CreateClientDto = z.infer<typeof CreateClientDto>;
export type AddFundsDto = z.infer<typeof AddFundsDto>;
export type ReserveFundsDto = z.infer<typeof ReserveFundsDto>;
export type ReleaseFundsDto = z.infer<typeof ReleaseFundsDto>;
export type DeductReservedDto = z.infer<typeof DeductReservedDto>;
export type ClientBalanceDto = z.infer<typeof ClientBalanceDto>;
export type ClientDto = z.infer<typeof ClientDto>;
export type ApiKeyDto = z.infer<typeof ApiKeyDto>;
export type ClientStatsDto = z.infer<typeof ClientStatsDto>;
export type UpdateOrganizationInfoDto = z.infer<typeof UpdateOrganizationInfoDto>;
export type UpdateSupportedCurrenciesDto = z.infer<typeof UpdateSupportedCurrenciesDto>;
export type ConfigureBankAccountsDto = z.infer<typeof ConfigureBankAccountsDto>;
