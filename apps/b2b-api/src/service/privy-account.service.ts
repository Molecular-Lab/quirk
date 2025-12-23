/**
 * Privy Account Service
 * Business logic layer - maps between API DTOs and Repository layer
 */

import type { PrivyAccountRepository } from "@quirk/core/repository/privy-account.repository";
import type { CreatePrivyAccountInput } from "@quirk/core/entity/privy-account.entity";

export class PrivyAccountService {
	constructor(private readonly privyAccountRepository: PrivyAccountRepository) {}

	/**
	 * Create or update Privy account
	 * Uses getOrCreate with ON CONFLICT handling for idempotency
	 */
	async createOrUpdate(input: CreatePrivyAccountInput) {
		return await this.privyAccountRepository.getOrCreate(input);
	}

	/**
	 * Get Privy account by organization ID
	 */
	async getByOrgId(privyOrganizationId: string) {
		return await this.privyAccountRepository.getByOrgId(privyOrganizationId);
	}
}
