/**
 * B2B Client Contract
 * Type-safe API definitions for client operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
	AddFundsDto,
	ClientBalanceDto,
	ClientDto,
	CreateClientDto,
	DeductReservedDto,
	ErrorResponseDto,
	ReleaseFundsDto,
	ReserveFundsDto,
	SuccessResponseDto,
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
});
