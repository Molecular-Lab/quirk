/**
 * Client DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

export const CreateClientDto = z.object({
	companyName: z.string().min(1),
	businessType: z.string(),
	description: z.string().optional(),
	websiteUrl: z.string().url().optional(),
	walletType: z.enum(["MANAGED", "USER_OWNED"]),
	privyOrganizationId: z.string(),
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
	walletType: z.string(),
	privyOrganizationId: z.string(),
	isActive: z.boolean(),
	isSandbox: z.boolean().optional(),
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

export type CreateClientDto = z.infer<typeof CreateClientDto>;
export type AddFundsDto = z.infer<typeof AddFundsDto>;
export type ReserveFundsDto = z.infer<typeof ReserveFundsDto>;
export type ReleaseFundsDto = z.infer<typeof ReleaseFundsDto>;
export type DeductReservedDto = z.infer<typeof DeductReservedDto>;
export type ClientBalanceDto = z.infer<typeof ClientBalanceDto>;
export type ClientDto = z.infer<typeof ClientDto>;
export type ApiKeyDto = z.infer<typeof ApiKeyDto>;
export type ClientStatsDto = z.infer<typeof ClientStatsDto>;
