/**
 * Client Router - Type-safe client operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class ClientRouter extends Router<typeof b2bContract> {
	/**
	 * Create a new client organization
	 */
	async createClient(data: {
		companyName: string;
		businessType: string;
		description?: string;
		websiteUrl?: string;
		walletType: "MANAGED" | "USER_OWNED";
		privyOrganizationId: string;
		privyWalletAddress: string;
		privyEmail?: string | null;
	}) {
		const response = await this.client.client.create({ body: data });
		
		if (response.status === 201) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to create client");
	}

	/**
	 * Get client by ID
	 */
	async getClientById(id: string) {
		const response = await this.client.client.getById({ params: { id } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get client");
	}

	/**
	 * Get client by product ID
	 */
	async getClientByProductId(productId: string) {
		const response = await this.client.client.getByProductId({ params: { productId } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get client");
	}

	/**
	 * List all clients by Privy Organization ID
	 * Returns empty array [] if user has no products yet
	 */
	async listClientsByPrivyOrgId(privyOrganizationId: string) {
		const response = await this.client.client.listByPrivyOrgId({ params: { privyOrganizationId } });

		if (response.status === 200) {
			return response.body; // Array of clients (or empty array [])
		}

		throw new APIError(response.status, "Failed to list clients");
	}

	/**
	 * Get client balance
	 */
	async getClientBalance(id: string) {
		const response = await this.client.client.getBalance({ params: { id } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to get balance");
	}

	/**
	 * Add funds to client balance
	 */
	async addFunds(id: string, data: { amount: string; source: string; reference?: string }) {
		const response = await this.client.client.addFunds({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to add funds");
	}

	/**
	 * Reserve funds from available balance
	 */
	async reserveFunds(id: string, data: { amount: string; purpose: string; reference?: string }) {
		const response = await this.client.client.reserveFunds({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to reserve funds");
	}

	/**
	 * Release reserved funds
	 */
	async releaseReservedFunds(id: string, data: { amount: string; reference?: string }) {
		const response = await this.client.client.releaseReservedFunds({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to release funds");
	}

	/**
	 * Deduct reserved funds
	 */
	async deductReservedFunds(id: string, data: { amount: string; reference?: string }) {
		const response = await this.client.client.deductReservedFunds({ params: { id }, body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to deduct funds");
	}
}
