/**
 * B2B User UseCase
 * Manages end-user accounts (FLOW 3)
 */

import type { CreateUserRequest } from "../../dto/b2b"
import type { AuditRepository } from "../../repository/postgres/audit.repository"
import type { ClientRepository } from "../../repository/postgres/client.repository"
import type { UserRepository } from "../../repository/postgres/end_user.repository"
import type { VaultRepository } from "../../repository/postgres/vault.repository"
import type { GetEndUserPortfolioRow, GetEndUserRow } from "@quirk/sqlcgen"

/**
 * B2B User Service
 * Handles end-user account creation and management
 */
export class B2BUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly vaultRepository: VaultRepository,
		private readonly clientRepository: ClientRepository,
		private readonly auditRepository: AuditRepository,
	) {}

	/**
	 * Get or create end-user (idempotent)
	 * Used when processing deposits/withdrawals
	 * Auto-creates end_user_vaults for all client_vaults on first creation
	 */
	async getOrCreateUser(request: CreateUserRequest): Promise<GetEndUserRow> {
		// Resolve productId to client UUID if needed
		// The request.clientId might be a productId (e.g., "prod_abc123") or a UUID
		let clientId = request.clientId

		// Check if it's a productId (starts with "prod_")
		if (request.clientId.startsWith("prod_")) {
			const client = await this.clientRepository.getByProductId(request.clientId)
			if (!client) {
				throw new Error(`Client not found with productId: ${request.clientId}`)
			}
			clientId = client.id // Use the actual UUID
			console.log(`[User Creation] Resolved productId ${request.clientId} to clientId ${clientId}`)
		}

		// Check if user exists
		const existing = await this.userRepository.getByClientAndUserId(clientId, request.userId)

		if (existing) {
			return existing
		}

		// Create new user
		const user = await this.userRepository.getOrCreate(
			clientId,
			request.userId,
			request.userType,
			request.userWalletAddress,
			request.status, // Pass status through (defaults to 'active' in repository)
		)

		// ✅ Vault creation deferred to first deposit (environment-aware)
		// With environment separation, users can have TWO vaults per client:
		// - One for sandbox (mock tokens)
		// - One for production (real USDC)
		// Vaults are created lazily on first deposit in deposit.usecase.ts
		console.log(`[User Creation] Vault will be created on first deposit for ${request.userId}`)

		// ✅ Increment total_end_users count in client_organizations
		try {
			await this.clientRepository.incrementEndUserCount(clientId)
			console.log(`[User Creation] Incremented end-user count for client ${clientId}`)
		} catch (countError) {
			console.error(`[User Creation] Failed to increment end-user count:`, countError)
			// Don't fail user creation if count increment fails
		}

		// Audit log
		await this.auditRepository.create({
			clientId: clientId,
			userId: user.id,
			actorType: "client",
			action: "user_created",
			resourceType: "end_user",
			resourceId: user.id,
			description: `End-user created: ${request.userId}`,
			metadata: {
				userId: request.userId,
				userType: request.userType,
			},
			ipAddress: null,
			userAgent: null,
		})

		return user
	}

	/**
	 * Get user by client and user ID
	 */
	async getUserByClientAndUserId(clientId: string, userId: string): Promise<GetEndUserRow | null> {
		return await this.userRepository.getByClientAndUserId(clientId, userId)
	}

	/**
	 * Get user portfolio (all vaults across chains)
	 */
	async getUserPortfolio(userId: string): Promise<GetEndUserPortfolioRow | null> {
		return await this.userRepository.getPortfolio(userId)
	}

	/**
	 * List all users for a client
	 */
	async listUsersByClient(clientId: string, limit = 50, offset = 0) {
		return await this.userRepository.listByClient(clientId, limit, offset)
	}

	/**
	 * Get active user count for client
	 */
	async getActiveUserCount(clientId: string): Promise<number> {
		const users = await this.userRepository.listByClient(clientId, 1000, 0)
		return users.filter((u: any) => u.isActive).length
	}

	/**
	 * Activate user account after completing onboarding
	 * Updates status from 'pending_onboarding' to 'active'
	 */
	async activateUser(userId: string, clientId: string) {
		// Verify user exists and belongs to the specified client
		const user = await this.userRepository.getById(userId)

		if (!user) {
			throw new Error("User not found")
		}

		if (user.clientId !== clientId) {
			throw new Error("User does not belong to this client")
		}

		// Check current status
		if (user.status === "active") {
			// Already active, return success
			return user
		}

		if (user.status === "suspended") {
			throw new Error("Cannot activate a suspended user")
		}

		// Update status to active
		const updated = await this.userRepository.updateStatus(userId, "active")

		if (!updated) {
			throw new Error("Failed to activate user")
		}

		// Audit log
		await this.auditRepository.create({
			clientId: clientId,
			userId: userId,
			actorType: "end_user",
			action: "user_activated",
			resourceType: "end_user",
			resourceId: userId,
			description: `End-user account activated: ${user.userId}`,
			metadata: {
				previousStatus: user.status,
				newStatus: "active",
			},
			ipAddress: null,
			userAgent: null,
		})

		return updated
	}
}
