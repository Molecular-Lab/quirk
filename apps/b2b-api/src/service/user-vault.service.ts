/**
 * UserVault Service - Business logic for user vault operations
 *
 * SIMPLIFIED ARCHITECTURE: ONE vault per user per client
 */

import type { B2BUserVaultUseCase } from "@proxify/core/usecase/b2b/user-vault.usecase";
import type { ClientGrowthIndexService } from "@proxify/core/service/client-growth-index.service";
import { logger } from "../logger";

export class UserVaultService {
	constructor(
		private readonly userVaultUseCase: B2BUserVaultUseCase,
		private readonly clientGrowthIndexService: ClientGrowthIndexService
	) {}

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

	/**
	 * Get client growth index (current)
	 */
	async getClientGrowthIndex(clientId: string): Promise<string> {
		try {
			return await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId);
		} catch (error) {
			logger.error("Failed to get client growth index", { error, clientId });
			throw error;
		}
	}

	/**
	 * Calculate historical APY for client
	 */
	async calculateAPY(clientId: string, lookbackDays: number = 30): Promise<string> {
		try {
			return await this.clientGrowthIndexService.calculateHistoricalAPY(clientId, lookbackDays);
		} catch (error) {
			logger.error("Failed to calculate APY", { error, clientId, lookbackDays });
			throw error;
		}
	}
}
