/**
 * Privy Account Router - Type-safe Privy account operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class PrivyAccountRouter extends Router<typeof b2bContract> {
	/**
	 * Create or update a Privy account
	 */
	async createOrUpdatePrivyAccount(data: {
		privyOrganizationId: string;
		privyWalletAddress: string;
		privyEmail?: string;
		walletType: "MANAGED" | "USER_OWNED";
	}) {
		const response = await this.client.privyAccount.createOrUpdate({ body: data });
		
		if (response.status === 201) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to create or update Privy account");
	}

	/**
	 * Get Privy account by organization ID
	 */
	async getPrivyAccountByOrgId(privyOrganizationId: string) {
		const response = await this.client.privyAccount.getByOrgId({ 
			params: { privyOrganizationId } 
		});
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to get Privy account");
	}
}
