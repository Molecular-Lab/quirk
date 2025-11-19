/**
 * User DTO Mapper
 * Transforms database rows to API DTOs
 */

import type { GetEndUserRow, GetEndUserPortfolioRow } from "@proxify/sqlcgen";

export function mapUserToDto(user: GetEndUserRow) {
	return {
		id: user.id,
		clientId: user.clientId,
		clientUserId: user.userId,
		email: undefined, // Not stored in database
		walletAddress: user.userWalletAddress || undefined,
		isActive: user.isActive ?? true,
		createdAt: user.createdAt.toISOString(),
	};
}

export function mapUsersToDto(users: GetEndUserRow[]) {
	return users.map(mapUserToDto);
}

export function mapUserPortfolioToDto(portfolio: GetEndUserPortfolioRow) {
	return {
		userId: portfolio.userId,
		totalBalance: portfolio.totalEffectiveBalance || "0",
		totalYieldEarned: portfolio.totalYieldEarned || "0",
		vaults: [], // TODO: Fetch vault details separately
	};
}
