/**
 * B2B Vault Service
 * Business logic layer for vault operations
 */

import type { B2BVaultUseCase } from "@proxify/core";
import type {
	CreateVaultRequest,
	UpdateIndexRequest,
	MarkFundsAsStakedRequest,
} from "@proxify/core/dto/b2b";

export class VaultService {
	constructor(private readonly vaultUseCase: B2BVaultUseCase) {}

	/**
	 * Get or create vault for a client/token/chain
	 */
	async getOrCreateVault(request: CreateVaultRequest) {
		return await this.vaultUseCase.getOrCreateVault(request);
	}

	/**
	 * Get vault by ID
	 */
	async getVaultById(vaultId: string) {
		return await this.vaultUseCase.getVaultById(vaultId);
	}

	/**
	 * Get vault by token details
	 */
	async getVaultByToken(clientId: string, chain: string, tokenAddress: string) {
		return await this.vaultUseCase.getVaultByToken(clientId, chain, tokenAddress);
	}

	/**
	 * List all vaults for a client
	 */
	async listClientVaults(clientId: string) {
		return await this.vaultUseCase.listClientVaults(clientId);
	}

	/**
	 * Update vault index with yield
	 */
	async updateIndexWithYield(vaultId: string, yieldAmount: string) {
		return await this.vaultUseCase.updateIndexWithYield(vaultId, yieldAmount);
	}

	/**
	 * Get vaults ready for staking
	 */
	async getVaultsReadyForStaking() {
		return await this.vaultUseCase.getVaultsReadyForStaking();
	}

	/**
	 * Mark pending funds as staked
	 */
	async markFundsAsStaked(vaultId: string, amount: string) {
		return await this.vaultUseCase.markFundsAsStaked(vaultId, amount);
	}
}
