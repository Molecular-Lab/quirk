/**
 * Vault Router - Type-safe vault operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class VaultRouter extends Router<typeof b2bContract> {
	/**
	 * Create or get existing vault
	 */
	async getOrCreateVault(data: {
		clientId: string;
		tokenSymbol: string;
		tokenAddress: string;
		chainId: number;
		vaultName?: string;
	}) {
		const response = await this.client.vault.getOrCreate({ body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to get or create vault");
	}

	/**
	 * Get vault by ID
	 */
	async getVaultById(id: string) {
		const response = await this.client.vault.getById({ params: { id } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get vault");
	}

	/**
	 * List client vaults
	 */
	async listClientVaults(clientId: string) {
		const response = await this.client.vault.listByClient({ params: { clientId } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list vaults");
	}

	/**
	 * Get vault by token
	 */
	async getVaultByToken(clientId: string, tokenSymbol: string, chainId: string) {
		const response = await this.client.vault.getByToken({
			params: { clientId, tokenSymbol, chainId },
		});
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get vault by token");
	}

	/**
	 * Update vault index with yield
	 */
	async updateIndexWithYield(id: string, data: { yieldAmount: string }) {
		const response = await this.client.vault.updateIndexWithYield({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to update index");
	}

	/**
	 * Get vaults ready for staking
	 */
	async getVaultsReadyForStaking() {
		const response = await this.client.vault.getReadyForStaking();
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to get vaults ready for staking");
	}

	/**
	 * Mark funds as staked
	 */
	async markFundsAsStaked(id: string, data: { amount: string }) {
		const response = await this.client.vault.markFundsAsStaked({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to mark funds as staked");
	}
}
