/**
 * B2B Vault Contract
 * Type-safe API definitions for vault operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
	CreateVaultDto,
	ErrorResponseDto,
	MarkFundsAsStakedDto,
	SuccessResponseDto,
	UpdateIndexDto,
	UpdateIndexResponseDto,
	VaultDto,
} from "../dto";

const c = initContract();

export const vaultContract = c.router({
	// Create or get vault
	getOrCreate: {
		method: "POST",
		path: "/vaults",
		responses: {
			200: VaultDto,
			400: ErrorResponseDto,
		},
		body: CreateVaultDto,
		summary: "Create new vault or get existing",
	},

	// Get vault by ID
	getById: {
		method: "GET",
		path: "/vaults/:id",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: VaultDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get vault by ID",
	},

	// List client vaults
	listByClient: {
		method: "GET",
		path: "/vaults/client/:clientId",
		responses: {
			200: VaultDto.array(),
		},
		summary: "List all vaults for a client",
	},

	// Get vault by token
	getByToken: {
		method: "GET",
		path: "/vaults/token/:clientId/:tokenSymbol/:chainId",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: VaultDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get vault by token details",
	},

	// Update index with yield
	updateIndexWithYield: {
		method: "POST",
		path: "/vaults/:id/index/update",
		responses: {
			200: UpdateIndexResponseDto,
			400: ErrorResponseDto,
		},
		body: UpdateIndexDto,
		summary: "Update vault index with yield distribution",
	},

	// Get vaults ready for staking
	getReadyForStaking: {
		method: "GET",
		path: "/vaults/ready-for-staking",
		responses: {
			200: VaultDto.array(),
		},
		summary: "Get vaults with pending balance ready to stake",
	},

	// Mark funds as staked
	markFundsAsStaked: {
		method: "POST",
		path: "/vaults/:id/mark-staked",
		responses: {
			200: SuccessResponseDto,
			400: ErrorResponseDto,
		},
		body: MarkFundsAsStakedDto,
		summary: "Mark pending funds as staked",
	},
});
