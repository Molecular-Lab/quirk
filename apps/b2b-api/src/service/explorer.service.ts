/**
 * Explorer Service - transparency/explorer pages
 * Provides public and private explorer data
 */

import type { B2BClientUseCase, B2BUserUseCase } from "@quirk/core";
import type { UserVaultService } from "./user-vault.service";

export class ExplorerService {
	constructor(
		private readonly clientUseCase: B2BClientUseCase,
		private readonly userUseCase: B2BUserUseCase,
		private readonly userVaultService: UserVaultService,
	) {}

	/**
	 * Get public transparency data for a client
	 * Anyone can access this to see overall allocations and stats
	 */
	async getPublicExplorer(clientId: string) {
		// Get client information
		const client = await this.clientUseCase.getClientById(clientId);
		if (!client) {
			return null;
		}

		// Get all users for this client
		const users = await this.userUseCase.listUsersByClient(clientId, 1000, 0);

		// Calculate total TVL and user count
		const activeUsers = users.filter((u) => u.isActive);
		let totalTvl = "0";

		// Get aggregated balances across all users
		// For now, return mock data - in production this would aggregate from user vaults
		const totalUsers = activeUsers.length;

		// Mock protocol allocations - in production, fetch from client's strategy config
		const allocations = [
			{
				protocol: "Aave",
				allocation: 50,
				apy: "4.2%",
				tvl: "500000",
			},
			{
				protocol: "Morpho",
				allocation: 30,
				apy: "5.1%",
				tvl: "300000",
			},
			{
				protocol: "Compound",
				allocation: 20,
				apy: "3.8%",
				tvl: "200000",
			},
		];

		return {
			clientId: client.id,
			companyName: client.companyName || "Unknown",
			totalTvl: "1000000", // Mock - calculate from actual user vaults
			totalUsers,
			overallApy: "4.5%", // Mock - weighted average
			allocations,
			strategyType: "Moderate",
			lastUpdated: new Date().toISOString(),
		};
	}

	/**
	 * Get private report for a specific end-user
	 * Shows personal balance, yield, and history
	 */
	async getPrivateExplorer(clientId: string, clientUserId: string) {
		// Get user by client and clientUserId
		const user = await this.userUseCase.getUserByClientAndUserId(clientId, clientUserId);
		if (!user) {
			return null;
		}

		// Get user's portfolio
		const portfolio = await this.userUseCase.getUserPortfolio(user.id);

		// Get user balance details
		const balance = await this.userVaultService.getUserBalance(user.id, clientId);

		// Calculate stats
		const totalBalance = balance?.effectiveBalance || "0";
		const totalDeposited = balance?.totalDeposited || "0";
		const totalYieldEarned = balance?.yieldEarned || "0";
		const currentApy = "4.5%"; // Mock - calculate from growth index

		// Mock protocol allocations (same as client's strategy)
		const allocations = [
			{
				protocol: "Aave",
				allocation: 50,
				apy: "4.2%",
				tvl: "500",
			},
			{
				protocol: "Morpho",
				allocation: 30,
				apy: "5.1%",
				tvl: "300",
			},
			{
				protocol: "Compound",
				allocation: 20,
				apy: "3.8%",
				tvl: "200",
			},
		];

		// Calculate account age
		const accountAge = this.calculateAccountAge(user.createdAt);

		return {
			userId: user.id,
			clientUserId: user.userId,
			totalBalance,
			totalDeposited,
			totalYieldEarned,
			currentApy,
			allocations,
			performanceHistory: [], // TODO: Fetch historical data
			depositCount: 0, // TODO: Count from transactions
			withdrawalCount: 0, // TODO: Count from transactions
			firstDepositAt: user.firstDepositAt?.toISOString() || null,
			lastActivityAt: user.lastDepositAt?.toISOString() || null,
			status: user.status as "pending_onboarding" | "active" | "suspended",
			accountAge,
			lastUpdated: new Date().toISOString(),
		};
	}

	/**
	 * Calculate account age from creation date
	 */
	private calculateAccountAge(createdAt: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - createdAt.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return "Today";
		} else if (diffDays === 1) {
			return "1 day";
		} else if (diffDays < 30) {
			return `${diffDays} days`;
		} else if (diffDays < 365) {
			const months = Math.floor(diffDays / 30);
			return months === 1 ? "1 month" : `${months} months`;
		} else {
			const years = Math.floor(diffDays / 365);
			return years === 1 ? "1 year" : `${years} years`;
		}
	}
}
