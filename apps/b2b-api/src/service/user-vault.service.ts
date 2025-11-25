/**
 * UserVault Service - Business logic for user vault operations
 */

import type { B2BUserVaultUseCase } from "@proxify/core/usecase/b2b/user-vault.usecase";
import { logger } from "../logger";

export class UserVaultService {
	constructor(private readonly userVaultUseCase: B2BUserVaultUseCase) {}

	/**
	 * Get user balance in a vault
	 */
	async getUserBalance(userId: string, clientId: string, chain: string, tokenAddress: string) {
		try {
			const balance = await this.userVaultUseCase.getUserBalance(userId, clientId, chain, tokenAddress);
			return balance;
		} catch (error) {
			logger.error("Failed to get user balance", { error, userId, clientId, chain, tokenAddress });
			throw error;
		}
	}

	/**
	 * Get user's portfolio (all vaults with balances)
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
	 * List all users in a vault
	 */
	async listVaultUsers(clientId: string, chain: string, tokenAddress: string, limit: number) {
		try {
			const users = await this.userVaultUseCase.listVaultUsers(clientId, chain, tokenAddress, limit);
			return users;
		} catch (error) {
			logger.error("Failed to list vault users", { error, clientId, chain, tokenAddress });
			throw error;
		}
	}
}
