/**
 * ============================================
 * DEMO REQUEST REPOSITORY
 * ============================================
 * Description: Data access layer for demo_requests table
 * Purpose: Manage demo request submissions (PUBLIC - no auth required)
 * Created: 2026-01-07
 */

import type { Sql } from "postgres"
import {
	createDemoRequest,
	getDemoRequestByEmail,
	getDemoRequestById,
	listDemoRequests,
	countDemoRequests,
	type CreateDemoRequestArgs,
	type CreateDemoRequestRow,
	type GetDemoRequestByEmailRow,
	type GetDemoRequestByIdRow,
	type ListDemoRequestsRow,
} from "@quirk/sqlcgen"

export class DemoRequestRepository {
	constructor(private readonly sql: Sql) {}

	/**
	 * Create a new demo request
	 */
	async create(params: CreateDemoRequestArgs): Promise<CreateDemoRequestRow> {
		try {
			const result = await createDemoRequest(this.sql, params)

			if (!result) {
				throw new Error("Failed to create demo request")
			}

			return result
		} catch (error) {
			throw new Error(`Failed to create demo request in database: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * Get demo request by email (most recent)
	 */
	async getByEmail(email: string): Promise<GetDemoRequestByEmailRow | null> {
		try {
			return await getDemoRequestByEmail(this.sql, { email })
		} catch (error) {
			throw new Error(`Failed to get demo request by email: ${email} - ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * Get demo request by ID
	 */
	async getById(id: string): Promise<GetDemoRequestByIdRow | null> {
		try {
			return await getDemoRequestById(this.sql, { id })
		} catch (error) {
			throw new Error(`Failed to get demo request by id: ${id} - ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * List demo requests with pagination
	 */
	async list(limit: number, offset: number): Promise<ListDemoRequestsRow[]> {
		try {
			return await listDemoRequests(this.sql, {
				limit: limit.toString(),
				offset: offset.toString(),
			})
		} catch (error) {
			throw new Error(`Failed to list demo requests: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * Count total demo requests
	 */
	async count(): Promise<number> {
		try {
			const result = await countDemoRequests(this.sql)
			return result ? parseInt(result.count, 10) : 0
		} catch (error) {
			throw new Error(`Failed to count demo requests: ${error instanceof Error ? error.message : String(error)}`)
		}
	}
}
