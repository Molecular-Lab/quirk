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

		// ✅ Vault creation happens during user activation (after onboarding)
		// Sandbox vault is created when activateUser() is called
		// Production vault is created lazily on first production deposit
		// With environment separation, users can have TWO vaults per client:
		// - One for sandbox (created on activation)
		// - One for production (created on first production deposit)

		// ✅ Increment total_end_users count in client_organizations
		try {
			await this.clientRepository.incrementEndUserCount(clientId)

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
		let user = null

		// Check if userId looks like a UUID (simple check)
		const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

		if (isUuid) {
			try {
				user = await this.userRepository.getById(userId)

			} catch {
				// UUID lookup failed, will try clientUserId lookup

			}
		}

		// Fallback: try looking up by client + user_id
		if (!user) {
			user = await this.userRepository.getByClientAndUserId(clientId, userId)

		}

		if (!user) {
			console.error("[UserUseCase] ❌ User not found:", { userId, clientId });
			throw new Error("User not found")
		}

		if (user.clientId !== clientId) {
			console.error("[UserUseCase] ❌ User does not belong to client:", {
				userId: user.id,
				userClientId: user.clientId,
				requestedClientId: clientId,
				mismatch: true,
			});
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

		// Update status to active (use user.id which is the actual UUID)
		const updated = await this.userRepository.updateStatus(user.id, "active")

		if (!updated) {
			throw new Error("Failed to activate user")
		}

		// ✅ Create vault for sandbox environment on activation
		// This ensures users have a vault ready when they return from onboarding
		// Default to sandbox environment for demo purposes
		const existingVault = await this.vaultRepository.getEndUserVaultByClient(user.id, clientId, "sandbox")

		if (!existingVault) {

			// Get client growth index for initial entry index
			const clientVaults = await this.vaultRepository.listClientVaults(clientId)
			const defaultEntryIndex = "1000000000000000000" // 1e18 - default if no client vaults exist

			await this.vaultRepository.createEndUserVault({
				endUserId: user.id,
				clientId: clientId,
				totalDeposited: "0",
				weightedEntryIndex: defaultEntryIndex,
				environment: "sandbox",
			})

		} else {

		}

		// Audit log (use user.id for resourceId, user.userId for readable user identifier)
		await this.auditRepository.create({
			clientId: clientId,
			userId: user.userId, // Use the client-provided user ID
			actorType: "end_user",
			action: "user_activated",
			resourceType: "end_user",
			resourceId: user.id, // Use actual UUID for resource tracking
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
