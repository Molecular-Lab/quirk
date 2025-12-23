/**
 * UserVault Service - Business logic for user vault operations
 *
 * ENVIRONMENT-AWARE: One vault per user per client PER ENVIRONMENT
 */

import type { B2BUserVaultUseCase } from "@quirk/core/usecase/b2b/user-vault.usecase";
import type { ClientGrowthIndexService } from "@quirk/core/service/client-growth-index.service";
import { logger } from "../logger";

export class UserVaultService {
	constructor(
		private readonly userVaultUseCase: B2BUserVaultUseCase,
		private readonly clientGrowthIndexService: ClientGrowthIndexService
	) {}

	/**
	 * Get user balance (with environment support)
	 */
	async getUserBalance(userId: string, clientId: string, environment: "sandbox" | "production" = "sandbox") {
		try {
			const balance = await this.userVaultUseCase.getUserBalance(userId, clientId, environment);
			return balance;
		} catch (error) {
			logger.error("Failed to get user balance", { error, userId, clientId, environment });
			throw error;
		}
	}

	/**
	 * Get user's portfolio (with environment support)
	 */
	async getUserPortfolio(userId: string, clientId: string, environment: "sandbox" | "production" = "sandbox") {
		try {
			const portfolio = await this.userVaultUseCase.getUserPortfolio(userId, clientId, environment);
			return portfolio;
		} catch (error) {
			logger.error("Failed to get user portfolio", { error, userId, clientId, environment });
			throw error;
		}
	}

	/**
	 * List all users in client's vault (for specific environment)
	 */
	async listVaultUsers(clientId: string, environment: "sandbox" | "production" = "sandbox", limit: number = 100, offset: number = 0) {
		try {
			const users = await this.userVaultUseCase.listVaultUsers(clientId, environment, limit, offset);
			return users;
		} catch (error) {
			logger.error("Failed to list vault users", { error, clientId, environment });
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
