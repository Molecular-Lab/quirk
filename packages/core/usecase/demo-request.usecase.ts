/**
 * Demo Request Usecase - Business Logic Layer
 *
 * Manages demo request submissions with business rules
 * PUBLIC ENDPOINT - No authentication required
 * Architecture: Repository → Usecase → Service → Controller
 */

import type { Sql } from "postgres"
import type { DemoRequestRepository } from "../repository/demo-request.repository"
import type {
	CreateDemoRequestArgs,
	CreateDemoRequestRow,
	GetDemoRequestByEmailRow,
	GetDemoRequestByIdRow,
	ListDemoRequestsRow,
} from "@quirk/sqlcgen"

export interface DemoRequestUsecaseDeps {
	demoRequestRepository: DemoRequestRepository
	sql: Sql
}

export interface CreateDemoRequestParams extends CreateDemoRequestArgs {}

export interface ListDemoRequestsParams {
	page: number
	limit: number
}

/**
 * Demo Request Usecase
 */
export class DemoRequestUsecase {
	constructor(private readonly deps: DemoRequestUsecaseDeps) {}

	/**
	 * Create new demo request with validation
	 * Business Rule: Prevent duplicate submissions within 24 hours
	 */
	async createDemoRequest(params: CreateDemoRequestParams): Promise<CreateDemoRequestRow> {
		// Validation
		if (!params.firstName?.trim()) {
			throw new Error("First name is required")
		}

		if (!params.lastName?.trim()) {
			throw new Error("Last name is required")
		}

		if (!params.email?.trim()) {
			throw new Error("Email is required")
		}

		if (!params.companyName?.trim()) {
			throw new Error("Company name is required")
		}

		if (!params.country?.trim()) {
			throw new Error("Country is required")
		}

		if (!params.companySize?.trim()) {
			throw new Error("Company size is required")
		}

		if (!params.capitalVolume?.trim()) {
			throw new Error("Capital volume is required")
		}

		if (!params.industry?.trim()) {
			throw new Error("Industry is required")
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(params.email)) {
			throw new Error("Invalid email format")
		}

		// Business Rule: Check for duplicate email within 24 hours
		const existingRequest = await this.deps.demoRequestRepository.getByEmail(params.email)
		if (existingRequest) {
			const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
			if (new Date(existingRequest.createdAt) > twentyFourHoursAgo) {
				const error = new Error("Email already submitted within the last 24 hours")
				;(error as any).code = "DUPLICATE_EMAIL"
				throw error
			}
		}

		// Create demo request
		const demoRequest = await this.deps.demoRequestRepository.create({
			firstName: params.firstName.trim(),
			lastName: params.lastName.trim(),
			email: params.email.trim().toLowerCase(),
			companyName: params.companyName.trim(),
			country: params.country.trim(),
			companySize: params.companySize,
			capitalVolume: params.capitalVolume,
			industry: params.industry,
		})

		if (!demoRequest) {
			throw new Error("Failed to create demo request")
		}

		return demoRequest
	}

	/**
	 * Get demo request by ID
	 */
	async getDemoRequestById(id: string): Promise<GetDemoRequestByIdRow | null> {
		if (!id) {
			throw new Error("Demo request ID is required")
		}

		return await this.deps.demoRequestRepository.getById(id)
	}

	/**
	 * Get demo request by email (most recent)
	 */
	async getDemoRequestByEmail(email: string): Promise<GetDemoRequestByEmailRow | null> {
		if (!email) {
			throw new Error("Email is required")
		}

		return await this.deps.demoRequestRepository.getByEmail(email.toLowerCase())
	}

	/**
	 * List demo requests with pagination
	 */
	async listDemoRequests(params: ListDemoRequestsParams): Promise<{
		data: ListDemoRequestsRow[]
		total: number
		page: number
		limit: number
	}> {
		const { page = 1, limit = 20 } = params

		// Validation
		if (page < 1) {
			throw new Error("Page must be greater than 0")
		}

		if (limit < 1 || limit > 100) {
			throw new Error("Limit must be between 1 and 100")
		}

		const offset = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.deps.demoRequestRepository.list(limit, offset),
			this.deps.demoRequestRepository.count(),
		])

		return {
			data,
			total,
			page,
			limit,
		}
	}
}
