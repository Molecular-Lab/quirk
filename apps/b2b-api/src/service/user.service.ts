/**
 * User Service - orchestrates B2B user operations
 */

import type { B2BUserUseCase, B2BClientUseCase } from "@quirk/core";
import { logger } from "../logger";

export class UserService {
	constructor(
		private userUseCase: B2BUserUseCase,
		private clientUseCase?: B2BClientUseCase // Optional for backward compatibility
	) {}

	async getOrCreateUser(request: {
		clientId: string;
		userId: string;
		userType: "MANAGED" | "USER_OWNED";
		userWalletAddress?: string;
		status?: string; // Optional initial status (defaults to 'active')
	}) {
		return await this.userUseCase.getOrCreateUser(request);
	}

	async getUserByClientAndUserId(clientId: string, clientUserId: string) {
		return await this.userUseCase.getUserByClientAndUserId(clientId, clientUserId);
	}

	async getUserPortfolio(userId: string) {
		return await this.userUseCase.getUserPortfolio(userId);
	}

	async listUsersByClient(clientId: string, limit?: number, offset?: number) {
		return await this.userUseCase.listUsersByClient(
			clientId,
			limit || 50,
			offset || 0
		);
	}

	async activateUser(userId: string, clientId: string) {
		return await this.userUseCase.activateUser(userId, clientId);
	}

	/**
	 * Activate user by productId (public endpoint for onboarding)
	 * Looks up clientId from productId, then activates the user
	 */
	async activateUserByProductId(userId: string, productId: string) {
		if (!this.clientUseCase) {
			throw new Error("Client use case not available");
		}

		logger.info("[UserService] 🔍 Activating user by productId", { userId, productId });

		// Look up client by productId
		const client = await this.clientUseCase.getClientByProductId(productId);
		if (!client) {
			throw new Error(`Client not found for product: ${productId}`);
		}

		logger.info("[UserService] 🔍 Found client for productId", {
			productId,
			clientId: client.id,
			companyName: client.companyName,
		});

		// Activate user with the resolved clientId
		return await this.userUseCase.activateUser(userId, client.id);
	}
}
