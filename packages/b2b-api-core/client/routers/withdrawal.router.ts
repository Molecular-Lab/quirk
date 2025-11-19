/**
 * Withdrawal Router - Type-safe withdrawal operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class WithdrawalRouter extends Router<typeof b2bContract> {
	/**
	 * Request a withdrawal
	 */
	async createWithdrawal(data: {
		clientId: string;
		userId: string;
		vaultId: string;
		amount: string;
	}) {
		const response = await this.client.withdrawal.create({ body: data });
		
		if (response.status === 201) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to create withdrawal");
	}

	/**
	 * Get withdrawal by ID
	 */
	async getWithdrawalById(id: string) {
		const response = await this.client.withdrawal.getById({ params: { id } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get withdrawal");
	}

	/**
	 * Complete a withdrawal
	 */
	async completeWithdrawal(id: string, data: { transactionHash: string; blockNumber?: number }) {
		const response = await this.client.withdrawal.complete({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to complete withdrawal");
	}

	/**
	 * Fail a withdrawal
	 */
	async failWithdrawal(id: string, data: { reason: string }) {
		const response = await this.client.withdrawal.fail({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to fail withdrawal");
	}

	/**
	 * List withdrawals by client
	 */
	async listWithdrawalsByClient(
		clientId: string,
		query?: { limit?: string; offset?: string; status?: "PENDING" | "QUEUED" | "COMPLETED" | "FAILED" }
	) {
		const response = await this.client.withdrawal.listByClient({ params: { clientId }, query });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list withdrawals");
	}

	/**
	 * List withdrawals by user
	 */
	async listWithdrawalsByUser(userId: string, query?: { limit?: string; offset?: string }) {
		const response = await this.client.withdrawal.listByUser({ params: { userId }, query });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list withdrawals");
	}

	/**
	 * Get withdrawal stats
	 */
	async getWithdrawalStats(clientId: string, vaultId?: string) {
		const response = await this.client.withdrawal.getStats({
			params: { clientId },
			query: vaultId ? { vaultId } : undefined,
		});
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to get withdrawal stats");
	}
}
