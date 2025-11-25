/**
 * Deposit Router - Type-safe deposit operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class DepositRouter extends Router<typeof b2bContract> {
	/**
	 * Create a new deposit
	 */
	async createDeposit(data: {
		clientId: string;
		userId: string;
		vaultId: string;
		amount: string;
		transactionHash?: string;
	}) {
		const response = await this.client.deposit.create({ body: data });
		
		if (response.status === 201) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to create deposit");
	}

	/**
	 * Get deposit by ID
	 */
	async getDepositById(id: string) {
		const response = await this.client.deposit.getById({ params: { id } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get deposit");
	}

	/**
	 * Complete a deposit
	 */
	async completeDeposit(id: string, data: { vaultId: string; transactionHash: string; blockNumber?: number }) {
		const response = await this.client.deposit.complete({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to complete deposit");
	}

	/**
	 * Fail a deposit
	 */
	async failDeposit(id: string, data: { reason: string }) {
		const response = await this.client.deposit.fail({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to fail deposit");
	}

	/**
	 * List deposits by client
	 */
	async listDepositsByClient(
		clientId: string,
		query?: { limit?: string; offset?: string; status?: "PENDING" | "COMPLETED" | "FAILED" }
	) {
		const response = await this.client.deposit.listByClient({ params: { clientId }, query });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list deposits");
	}

	/**
	 * List deposits by user
	 */
	async listDepositsByUser(userId: string, query?: { limit?: string; offset?: string }) {
		const response = await this.client.deposit.listByUser({ params: { userId }, query });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list deposits");
	}

	/**
	 * Get deposit stats
	 */
	async getDepositStats(clientId: string, vaultId?: string) {
		const response = await this.client.deposit.getStats({
			params: { clientId },
			query: vaultId ? { vaultId } : undefined,
		});
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to get deposit stats");
	}
}
