/**
 * B2B User UseCase
 * Manages end-user accounts (FLOW 3)
 */

import type { CreateUserRequest } from "../../dto/b2b"
import type { AuditRepository } from "../../repository/postgres/audit.repository"
import type { ClientRepository } from "../../repository/postgres/client.repository"
import type { UserRepository } from "../../repository/postgres/end_user.repository"
import type { VaultRepository } from "../../repository/postgres/vault.repository"
import type { GetEndUserPortfolioRow, GetEndUserRow } from "@proxify/sqlcgen"

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
		)

		// ✅ Create end_user_vault on registration (simplified - one vault per client)
		// This creates a single vault entry for this user under this client
		// The vault will be populated with deposits later (FLOW 4)
		try {
			// Check if vault already exists (in case of race condition)
			const existingVault = await this.vaultRepository.getEndUserVaultByClient(user.id, clientId)

			if (!existingVault) {
				await this.vaultRepository.createEndUserVault({
					endUserId: user.id,
					clientId: clientId,
					totalDeposited: "0",
					weightedEntryIndex: "1000000000000000000", // Default: 1.0
				})
				console.log(`[User Creation] Created end-user vault for ${request.userId}`)
			} else {
				console.log(`[User Creation] End-user vault already exists for ${request.userId}`)
			}
		} catch (vaultError) {
			console.error(`[User Creation] Failed to create vault for ${request.userId}:`, vaultError)
			// Don't fail user creation if vault creation fails - they can deposit later
		}

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
}
