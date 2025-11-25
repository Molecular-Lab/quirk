/**
 * User Service - orchestrates B2B user operations
 */

import type { B2BUserUseCase } from "@proxify/core";

export class UserService {
	constructor(private userUseCase: B2BUserUseCase) {}

	async getOrCreateUser(request: {
		clientId: string;
		userId: string;
		userType: "custodial" | "non-custodial";
		userWalletAddress?: string;
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
}
