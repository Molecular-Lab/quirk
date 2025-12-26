/**
 * End User Repository - Quirk Pattern
 * ✅ SQLC-generated queries from database/queries/end_user.sql
 */

import {
	type CreateEndUserArgs,
	type CreateEndUserRow,
	type GetEndUserByClientAndUserIDRow,
	type GetEndUserPortfolioRow,
	type GetEndUserRow,
	type ListActiveEndUsersRow,
	type ListEndUsersRow,
	type ListEndUsersWithBalancesRow,
	type UpdateEndUserArgs,
	type UpdateEndUserRow,
	type UpdateEndUserStatusArgs,
	type UpdateEndUserStatusRow,
	activateEndUser,
	createEndUser,
	deactivateEndUser,
	deleteEndUser,
	getEndUser,
	getEndUserByClientAndUserID,
	getEndUserPortfolio,
	listActiveEndUsers,
	listEndUsers,
	listEndUsersWithBalances,
	setFirstDeposit,
	updateEndUser,
	updateEndUserDepositTimestamp,
	updateEndUserStatus,
	updateEndUserWithdrawalTimestamp,
} from "@quirk/sqlcgen"
import { Sql } from "postgres"

export class UserRepository {
	constructor(private readonly sql: Sql) {}

	async getById(id: string): Promise<GetEndUserRow | null> {
		return await getEndUser(this.sql, { id })
	}

	async getByClientAndUserId(clientId: string, userId: string): Promise<GetEndUserByClientAndUserIDRow | null> {
		return await getEndUserByClientAndUserID(this.sql, { clientId, userId })
	}

	async listByClient(clientId: string, limit = 100, offset = 0): Promise<ListEndUsersRow[]> {
		return await listEndUsers(this.sql, { clientId, limit: limit.toString(), offset: offset.toString() })
	}

	async listActive(clientId: string): Promise<ListActiveEndUsersRow[]> {
		return await listActiveEndUsers(this.sql, { clientId })
	}

	async listWithBalances(clientId: string, limit = 100): Promise<ListEndUsersWithBalancesRow[]> {
		return await listEndUsersWithBalances(this.sql, { clientId, limit: limit.toString(), offset: "0" })
	}

	async create(params: CreateEndUserArgs): Promise<CreateEndUserRow | null> {
		return await createEndUser(this.sql, params)
	}

	async update(id: string, params: Omit<UpdateEndUserArgs, "id">): Promise<UpdateEndUserRow | null> {
		return await updateEndUser(this.sql, { id, ...params })
	}

	async updateDepositTimestamp(id: string): Promise<void> {
		await updateEndUserDepositTimestamp(this.sql, { id })
	}

	async updateWithdrawalTimestamp(id: string): Promise<void> {
		await updateEndUserWithdrawalTimestamp(this.sql, { id })
	}

	async markFirstDeposit(id: string): Promise<void> {
		await setFirstDeposit(this.sql, { id })
	}

	async activate(id: string): Promise<void> {
		await activateEndUser(this.sql, { id })
	}

	async deactivate(id: string): Promise<void> {
		await deactivateEndUser(this.sql, { id })
	}

	async updateStatus(id: string, status: string): Promise<UpdateEndUserStatusRow | null> {
		return await updateEndUserStatus(this.sql, { id, status })
	}

	async delete(id: string): Promise<void> {
		await deleteEndUser(this.sql, { id })
	}

	async getPortfolio(id: string): Promise<GetEndUserPortfolioRow | null> {
		return await getEndUserPortfolio(this.sql, { id })
	}

	/**
	 * Get or create end user - idempotent operation
	 */
	async getOrCreate(
		clientId: string,
		userId: string,
		userType: string,
		userWalletAddress?: string,
		status?: string,
		environment?: "sandbox" | "production",
	): Promise<CreateEndUserRow> {
		const existing = await this.getByClientAndUserId(clientId, userId)
		if (existing) {
			return existing as unknown as CreateEndUserRow
		}

		const created = await this.create({
			clientId,
			userId,
			userType,
			userWalletAddress: userWalletAddress || null,
			isActive: true,
			status: status || "active", // Default to 'active' for backward compatibility
			environment: environment || "sandbox",
		})

		if (!created) {
			throw new Error("Failed to create end user")
		}

		return created
	}
}
