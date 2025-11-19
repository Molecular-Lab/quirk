/**
 * UserVault Router - Type-safe user vault balance operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class UserVaultRouter extends Router<typeof b2bContract> {
	/**
	 * Get user balance in vault
	 */
	async getUserBalance(userId: string, vaultId: string) {
		const response = await this.client.userVault.getBalance({ params: { userId, vaultId } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get user balance");
	}

	/**
	 * List vault users with balances
	 */
	async listVaultUsers(vaultId: string, query?: { limit?: string; offset?: string }) {
		const response = await this.client.userVault.listVaultUsers({ params: { vaultId }, query });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list vault users");
	}
}
