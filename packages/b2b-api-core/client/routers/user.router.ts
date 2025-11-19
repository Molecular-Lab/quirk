/**
 * User Router - Type-safe user operations
 */

import { b2bContract } from "../../contracts";
import { APIError } from "../error";
import { Router } from "../router";

export class UserRouter extends Router<typeof b2bContract> {
	/**
	 * Create or get existing user
	 */
	async getOrCreateUser(data: {
		clientId: string;
		clientUserId: string;
		email?: string;
		walletAddress?: string;
	}) {
		const response = await this.client.user.getOrCreate({ body: data });
		
		if (response.status === 200) {
			return response.body;
		}
		
		const errorBody = response.body as any;
		throw new APIError(response.status, errorBody?.error || "Failed to get or create user");
	}

	/**
	 * Get user by ID
	 */
	async getUserById(id: string) {
		const response = await this.client.user.getById({ params: { id } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get user");
	}

	/**
	 * Get user by client and client user ID
	 */
	async getUserByClientUserId(clientId: string, clientUserId: string) {
		const response = await this.client.user.getByClientUserId({ params: { clientId, clientUserId } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get user");
	}

	/**
	 * List users by client
	 */
	async listUsersByClient(clientId: string, query?: { limit?: string; offset?: string }) {
		const response = await this.client.user.listByClient({ params: { clientId }, query });
		
		if (response.status === 200) {
			return response.body;
		}
		
		throw new APIError(response.status, "Failed to list users");
	}

	/**
	 * Get user portfolio
	 */
	async getUserPortfolio(userId: string) {
		const response = await this.client.user.getPortfolio({ params: { userId } });
		
		if (response.status === 200) {
			return response.body;
		}
		
		if (response.status === 404) {
			return null;
		}
		
		throw new APIError(response.status, "Failed to get user portfolio");
	}
}
