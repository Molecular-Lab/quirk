/**
 * B2B API Query Keys
 * Centralized query key management for react-query
 */

export const B2BQueryKeys = {
	// Privy Account endpoints
	privyAccount: {
		get: (privyOrganizationId: string | undefined) => ["b2b", "privy-account", privyOrganizationId] as const,
		create: () => ["b2b", "privy-account", "create"] as const,
	},

	// Client endpoints
	client: {
		register: () => ["b2b", "client", "register"] as const,
		profile: (clientId: string | undefined) => ["b2b", "client", "profile", clientId] as const,
		strategies: (clientId: string | undefined) => ["b2b", "client", "strategies", clientId] as const,
		listByPrivyId: (privyOrganizationId: string | undefined) =>
			["b2b", "client", "privy", privyOrganizationId] as const,
	},

	// User endpoints
	user: {
		create: () => ["b2b", "user", "create"] as const,
		get: (userId: string | undefined) => ["b2b", "user", userId] as const,
		list: (clientId: string | undefined) => ["b2b", "user", "list", clientId] as const,
		balance: (userId: string | undefined, chain?: string, token?: string) =>
			["b2b", "user", userId, "balance", chain, token] as const,
		vaults: (userId: string | undefined) => ["b2b", "user", userId, "vaults"] as const,
	},

	// Vault endpoints
	vault: {
		get: (vaultId: string | undefined) => ["b2b", "vault", vaultId] as const,
		index: (vaultId: string | undefined) => ["b2b", "vault", vaultId, "index"] as const,
		yield: (vaultId: string | undefined) => ["b2b", "vault", vaultId, "yield"] as const,
	},

	// Deposit endpoints
	deposit: {
		create: () => ["b2b", "deposit", "create"] as const,
		get: (orderId: string | undefined) => ["b2b", "deposit", orderId] as const,
		list: (userId: string | undefined) => ["b2b", "deposit", "list", userId] as const,
		complete: (orderId: string | undefined) => ["b2b", "deposit", orderId, "complete"] as const,
	},

	// Withdrawal endpoints
	withdrawal: {
		create: () => ["b2b", "withdrawal", "create"] as const,
		get: (withdrawalId: string | undefined) => ["b2b", "withdrawal", withdrawalId] as const,
		list: (userId: string | undefined) => ["b2b", "withdrawal", "list", userId] as const,
		queue: (vaultId: string | undefined) => ["b2b", "withdrawal", "queue", vaultId] as const,
	},
} as const
