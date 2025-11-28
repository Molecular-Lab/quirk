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
		vaultId?: string;
		amount: string;
		currency?: "SGD" | "USD" | "EUR" | "THB" | "TWD" | "KRW";
		tokenSymbol?: string;
		clientReference?: string;
	}) {
		// Map the higher-level SDK params to the contract expected shape
		const body = {
			userId: data.userId,
			amount: data.amount,
			currency: data.currency ?? "USD",
			tokenSymbol: data.tokenSymbol ?? "USDC",
			clientReference: data.clientReference ?? data.clientId,
		};

		const response = await this.client.deposit.createFiatDeposit({ body });

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
		const response = await this.client.deposit.getByOrderId({ params: { orderId: id } });

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
	async completeDeposit(orderId: string, data: {
		cryptoAmount: string;
		chain: string;
		tokenAddress: string;
		transactionHash: string;
		gatewayFee?: string;
		proxifyFee?: string;
		networkFee?: string;
		totalFees?: string;
	}) {
		const body = {
			cryptoAmount: data.cryptoAmount,
			chain: data.chain,
			tokenAddress: data.tokenAddress,
			transactionHash: data.transactionHash,
			gatewayFee: data.gatewayFee ?? "0",
			proxifyFee: data.proxifyFee ?? "0",
			networkFee: data.networkFee ?? "0",
			totalFees: data.totalFees ?? "0",
		};

		const response = await this.client.deposit.completeFiatDeposit({ params: { orderId }, body });

		if (response.status === 200) {
			return response.body;
		}

		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to complete deposit");
	}

	/**
	 * Fail a deposit
	 */
	async failDeposit(orderId: string, data: { reason: string }) {
		// The contract does not expose a dedicated 'fail' endpoint for fiat deposits.
		// We use the mockConfirmFiatDeposit for demo/testing where needed, or callers
		// should use internal webhook/complete endpoints. For now, call mock endpoint.
		const body = {
			bankTransactionId: `fail-${Date.now()}`,
			paidAmount: "0",
			paidCurrency: "",
		};

		const response = await this.client.deposit.mockConfirmFiatDeposit({ params: { orderId }, body });

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
		query?: { limit?: string; offset?: string; status?: "pending" | "completed" | "failed" }
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
	async getDepositStats(clientId: string, _vaultId?: string) {
		// contract.getStats accepts only clientId as path param
		const response = await this.client.deposit.getStats({ params: { clientId } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to get deposit stats");
	}
}
