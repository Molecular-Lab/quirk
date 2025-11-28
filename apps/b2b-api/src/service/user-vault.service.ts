/**
 * UserVault Service - Business logic for user vault operations
 * 
 * SIMPLIFIED ARCHITECTURE: ONE vault per user per client
 */

import type { B2BUserVaultUseCase } from "@proxify/core/usecase/b2b/user-vault.usecase";
import { logger } from "../logger";

export class UserVaultService {
	constructor(private readonly userVaultUseCase: B2BUserVaultUseCase) {}

	/**
	 * Get user balance (simplified - single vault per client)
	 */
	async getUserBalance(userId: string, clientId: string) {
		try {
			const balance = await this.userVaultUseCase.getUserBalance(userId, clientId);
			return balance;
		} catch (error) {
			logger.error("Failed to get user balance", { error, userId, clientId });
			throw error;
		}
	}

	/**
	 * Get user's portfolio (single vault)
	 */
	async getUserPortfolio(userId: string, clientId: string) {
		try {
			const portfolio = await this.userVaultUseCase.getUserPortfolio(userId, clientId);
			return portfolio;
		} catch (error) {
			logger.error("Failed to get user portfolio", { error, userId, clientId });
			throw error;
		}
	}

	/**
	 * List all users in client's vault
	 */
	async listVaultUsers(clientId: string, limit: number = 100, offset: number = 0) {
		try {
			const users = await this.userVaultUseCase.listVaultUsers(clientId, limit, offset);
			return users;
		} catch (error) {
			logger.error("Failed to list vault users", { error, clientId });
			throw error;
		}
	}
}
