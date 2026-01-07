/**
 * Demo Request Router - ts-rest implementation
 * Maps HTTP requests to usecase layer
 * PUBLIC ROUTES - No authentication required
 */

import type { initServer } from "@ts-rest/express"
import { b2bContract } from "@quirk/b2b-api-core"
import type { DemoRequestUsecase } from "@quirk/core/usecase/demo-request.usecase"
import { logger } from "../logger"

export const createDemoRequestRouter = (
	s: ReturnType<typeof initServer>,
	demoRequestUsecase: DemoRequestUsecase,
): any => {
	return s.router(b2bContract.demoRequest, {
		// POST /demo-requests - Create new demo request (PUBLIC)
		create: async ({ body }: { body: any }) => {
			try {
				logger.info("[DemoRequestRouter] Creating demo request", {
					email: body.email,
					companyName: body.companyName,
					industry: body.industry,
				})

				const demoRequest = await demoRequestUsecase.createDemoRequest({
					firstName: body.firstName,
					lastName: body.lastName,
					email: body.email,
					companyName: body.companyName,
					country: body.country,
					companySize: body.companySize,
					capitalVolume: body.capitalVolume,
					industry: body.industry,
				})

				logger.info("[DemoRequestRouter] Demo request created successfully", {
					id: demoRequest.id,
					email: demoRequest.email,
				})

				return {
					status: 201 as const,
					body: {
						id: demoRequest.id,
						firstName: demoRequest.firstName,
						lastName: demoRequest.lastName,
						email: demoRequest.email,
						companyName: demoRequest.companyName,
						country: demoRequest.country,
						companySize: demoRequest.companySize,
						capitalVolume: demoRequest.capitalVolume,
						industry: demoRequest.industry,
						status: demoRequest.status,
						notes: demoRequest.notes,
						createdAt: demoRequest.createdAt.toISOString(),
						updatedAt: demoRequest.updatedAt.toISOString(),
					},
				}
			} catch (error: any) {
				logger.error("[DemoRequestRouter] Failed to create demo request", {
					error: error.message,
					code: error.code,
					email: body.email,
				})

				// Handle duplicate email error
				if (error.code === "DUPLICATE_EMAIL") {
					return {
						status: 409 as const,
						body: {
							error: "Duplicate submission",
							message:
								"This email has already been submitted within the last 24 hours. Please check your inbox or try again later.",
						},
					}
				}

				// Handle validation errors
				return {
					status: 400 as const,
					body: {
						error: error.message || "Failed to create demo request",
					},
				}
			}
		},

		// GET /demo-requests/:id - Get demo request by ID
		getById: async ({ params }: { params: any }) => {
			try {
				const demoRequest = await demoRequestUsecase.getDemoRequestById(params.id)

				if (!demoRequest) {
					return {
						status: 404 as const,
						body: {
							error: "Demo request not found",
						},
					}
				}

				return {
					status: 200 as const,
					body: {
						found: true,
						data: {
							id: demoRequest.id,
							firstName: demoRequest.firstName,
							lastName: demoRequest.lastName,
							email: demoRequest.email,
							companyName: demoRequest.companyName,
							country: demoRequest.country,
							companySize: demoRequest.companySize,
							capitalVolume: demoRequest.capitalVolume,
							industry: demoRequest.industry,
							status: demoRequest.status,
							notes: demoRequest.notes,
							createdAt: demoRequest.createdAt.toISOString(),
							updatedAt: demoRequest.updatedAt.toISOString(),
						},
						message: undefined,
					},
				}
			} catch (error: any) {
				logger.error("[DemoRequestRouter] Failed to get demo request by ID", {
					error: error.message,
					id: params.id,
				})

				return {
					status: 404 as const,
					body: {
						error: error.message || "Demo request not found",
					},
				}
			}
		},

		// GET /demo-requests/email/:email - Get demo request by email
		getByEmail: async ({ params }: { params: any }) => {
			try {
				const demoRequest = await demoRequestUsecase.getDemoRequestByEmail(params.email)

				if (!demoRequest) {
					return {
						status: 200 as const,
						body: {
							found: false,
							data: null,
							message: "No demo request found for this email",
						},
					}
				}

				return {
					status: 200 as const,
					body: {
						found: true,
						data: {
							id: demoRequest.id,
							firstName: demoRequest.firstName,
							lastName: demoRequest.lastName,
							email: demoRequest.email,
							companyName: demoRequest.companyName,
							country: demoRequest.country,
							companySize: demoRequest.companySize,
							capitalVolume: demoRequest.capitalVolume,
							industry: demoRequest.industry,
							status: demoRequest.status,
							notes: demoRequest.notes,
							createdAt: demoRequest.createdAt.toISOString(),
							updatedAt: demoRequest.updatedAt.toISOString(),
						},
						message: undefined,
					},
				}
			} catch (error: any) {
				logger.error("[DemoRequestRouter] Failed to get demo request by email", {
					error: error.message,
					email: params.email,
				})

				return {
					status: 500 as const,
					body: {
						error: error.message || "Failed to get demo request",
					},
				}
			}
		},

		// GET /demo-requests - List demo requests with pagination
		list: async ({ query }: { query: any }) => {
			try {
				const result = await demoRequestUsecase.listDemoRequests({
					page: query.page || 1,
					limit: query.limit || 20,
				})

				return {
					status: 200 as const,
					body: {
						data: result.data.map((dr) => ({
							id: dr.id,
							firstName: dr.firstName,
							lastName: dr.lastName,
							email: dr.email,
							companyName: dr.companyName,
							country: dr.country,
							companySize: dr.companySize,
							capitalVolume: dr.capitalVolume,
							industry: dr.industry,
							status: dr.status,
							notes: dr.notes,
							createdAt: dr.createdAt.toISOString(),
							updatedAt: dr.updatedAt.toISOString(),
						})),
						pagination: {
							page: result.page,
							limit: result.limit,
							total: result.total,
						},
					},
				}
			} catch (error: any) {
				logger.error("[DemoRequestRouter] Failed to list demo requests", {
					error: error.message,
				})

				return {
					status: 500 as const,
					body: {
						error: error.message || "Failed to list demo requests",
					},
				}
			}
		},
	})
}
