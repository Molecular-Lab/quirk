/**
 * Query Key Factory for B2B API
 * 
 * Provides type-safe query keys for React Query / TanStack Query
 * Following best practices from:
 * https://tkdodo.eu/blog/effective-react-query-keys
 */

export const b2bQueryKeys = {
	// Client keys
	client: {
		all: ["client"] as const,
		lists: () => [...b2bQueryKeys.client.all, "list"] as const,
		list: (filters?: Record<string, unknown>) => [...b2bQueryKeys.client.lists(), filters] as const,
		details: () => [...b2bQueryKeys.client.all, "detail"] as const,
		detail: (id: string) => [...b2bQueryKeys.client.details(), id] as const,
		byProductId: (productId: string) => [...b2bQueryKeys.client.details(), "product", productId] as const,
		balance: (id: string) => [...b2bQueryKeys.client.detail(id), "balance"] as const,
	},

	// Vault keys
	vault: {
		all: ["vault"] as const,
		lists: () => [...b2bQueryKeys.vault.all, "list"] as const,
		list: (filters?: Record<string, unknown>) => [...b2bQueryKeys.vault.lists(), filters] as const,
		details: () => [...b2bQueryKeys.vault.all, "detail"] as const,
		detail: (id: string) => [...b2bQueryKeys.vault.details(), id] as const,
		byClient: (clientId: string) => [...b2bQueryKeys.vault.lists(), "client", clientId] as const,
		byToken: (clientId: string, tokenSymbol: string, chainId: number) =>
			[...b2bQueryKeys.vault.details(), "token", clientId, tokenSymbol, chainId] as const,
		readyForStaking: () => [...b2bQueryKeys.vault.lists(), "ready-for-staking"] as const,
	},

	// User keys
	user: {
		all: ["user"] as const,
		lists: () => [...b2bQueryKeys.user.all, "list"] as const,
		list: (filters?: Record<string, unknown>) => [...b2bQueryKeys.user.lists(), filters] as const,
		details: () => [...b2bQueryKeys.user.all, "detail"] as const,
		detail: (id: string) => [...b2bQueryKeys.user.details(), id] as const,
		byClient: (clientId: string, filters?: { limit?: string; offset?: string }) =>
			[...b2bQueryKeys.user.lists(), "client", clientId, filters] as const,
		byClientUserId: (clientId: string, clientUserId: string) =>
			[...b2bQueryKeys.user.details(), "client", clientId, "user", clientUserId] as const,
		portfolio: (userId: string) => [...b2bQueryKeys.user.detail(userId), "portfolio"] as const,
	},

	// User-Vault Balance keys
	userVault: {
		all: ["user-vault"] as const,
		balances: () => [...b2bQueryKeys.userVault.all, "balance"] as const,
		balance: (userId: string, vaultId: string) =>
			[...b2bQueryKeys.userVault.balances(), userId, vaultId] as const,
		vaultUsers: (vaultId: string, filters?: { limit?: string; offset?: string }) =>
			[...b2bQueryKeys.userVault.all, "vault", vaultId, "users", filters] as const,
	},

	// Deposit keys
	deposit: {
		all: ["deposit"] as const,
		lists: () => [...b2bQueryKeys.deposit.all, "list"] as const,
		list: (filters?: Record<string, unknown>) => [...b2bQueryKeys.deposit.lists(), filters] as const,
		details: () => [...b2bQueryKeys.deposit.all, "detail"] as const,
		detail: (id: string) => [...b2bQueryKeys.deposit.details(), id] as const,
		byClient: (
			clientId: string,
			filters?: { limit?: string; offset?: string; status?: "PENDING" | "COMPLETED" | "FAILED" }
		) => [...b2bQueryKeys.deposit.lists(), "client", clientId, filters] as const,
		byUser: (userId: string, filters?: { limit?: string; offset?: string }) =>
			[...b2bQueryKeys.deposit.lists(), "user", userId, filters] as const,
		stats: (clientId: string, vaultId?: string) =>
			[...b2bQueryKeys.deposit.all, "stats", clientId, vaultId] as const,
	},

	// Withdrawal keys
	withdrawal: {
		all: ["withdrawal"] as const,
		lists: () => [...b2bQueryKeys.withdrawal.all, "list"] as const,
		list: (filters?: Record<string, unknown>) => [...b2bQueryKeys.withdrawal.lists(), filters] as const,
		details: () => [...b2bQueryKeys.withdrawal.all, "detail"] as const,
		detail: (id: string) => [...b2bQueryKeys.withdrawal.details(), id] as const,
		byClient: (
			clientId: string,
			filters?: { limit?: string; offset?: string; status?: "PENDING" | "QUEUED" | "COMPLETED" | "FAILED" }
		) => [...b2bQueryKeys.withdrawal.lists(), "client", clientId, filters] as const,
		byUser: (userId: string, filters?: { limit?: string; offset?: string }) =>
			[...b2bQueryKeys.withdrawal.lists(), "user", userId, filters] as const,
		stats: (clientId: string, vaultId?: string) =>
			[...b2bQueryKeys.withdrawal.all, "stats", clientId, vaultId] as const,
	},
} as const;

/**
 * Type-safe query keys export
 */
export type B2BQueryKeys = typeof b2bQueryKeys;
