/**
 * Demo Request Contract
 * Type-safe API definitions for demo request operations
 */

import { initContract } from "@ts-rest/core"
import { z } from "zod"
import { CreateDemoRequestDto, DemoRequestDto, DemoRequestListDto, ErrorResponseDto } from "../dto"

const c = initContract()

export const demoRequestContract = c.router({
	// Create demo request
	create: {
		method: "POST",
		path: "/demo-requests",
		responses: {
			201: DemoRequestDto,
			400: ErrorResponseDto,
			409: z.object({
				error: z.string(),
				message: z.string(),
			}),
		},
		body: CreateDemoRequestDto,
		summary: "Submit a new demo request",
	},

	// Get demo request by ID
	getById: {
		method: "GET",
		path: "/demo-requests/:id",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: DemoRequestDto.nullable(),
				message: z.string().optional(),
			}),
			404: ErrorResponseDto,
		},
		summary: "Get demo request by ID",
	},

	// Get demo request by email
	getByEmail: {
		method: "GET",
		path: "/demo-requests/email/:email",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: DemoRequestDto.nullable(),
				message: z.string().optional(),
			}),
			500: ErrorResponseDto,
		},
		summary: "Get most recent demo request by email",
	},

	// List all demo requests with pagination
	list: {
		method: "GET",
		path: "/demo-requests",
		query: z.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(20),
		}),
		responses: {
			200: DemoRequestListDto,
			500: ErrorResponseDto,
		},
		summary: "List demo requests with pagination",
	},
})
