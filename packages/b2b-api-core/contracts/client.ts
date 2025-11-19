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
});
