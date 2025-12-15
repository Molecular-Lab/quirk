/**
 * Privy Account Contract
 * Type-safe API definitions for Privy account operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// DTOs
export const CreatePrivyAccountDto = z.object({
	privyOrganizationId: z.string(),
	privyWalletAddress: z.string(),
	privyEmail: z.string().optional().nullable(),
	walletType: z.enum(["MANAGED", "USER_OWNED"]),
});

export const PrivyAccountDto = z.object({
	id: z.string(),
	privyOrganizationId: z.string(),
	privyWalletAddress: z.string(),
	privyEmail: z.string().nullable(),
	walletType: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const ErrorResponseDto = z.object({
	success: z.boolean(),
	error: z.string(),
});

export const privyAccountContract = c.router({
	// Create or update Privy account (idempotent)
	createOrUpdate: {
		method: "POST",
		path: "/privy-accounts",
		responses: {
			201: PrivyAccountDto,
			400: ErrorResponseDto,
		},
		body: CreatePrivyAccountDto,
		summary: "Create or update Privy account after wallet creation",
	},

	// Get Privy account by organization ID
	getByOrgId: {
		method: "GET",
		path: "/privy-accounts/:privyOrganizationId",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: PrivyAccountDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get Privy account by organization ID",
	},
});
