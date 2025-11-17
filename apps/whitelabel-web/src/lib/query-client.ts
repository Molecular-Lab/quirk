import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query Client Configuration
 * Centralized configuration for all React Query operations
 */

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Stale time: Data is fresh for 30 seconds
			staleTime: 30 * 1000,

			// Cache time: Keep unused data in cache for 5 minutes
			gcTime: 5 * 60 * 1000,

			// Retry failed requests (useful for network issues)
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

			// Refetch on window focus (good UX for financial data)
			refetchOnWindowFocus: true,

			// Don't refetch on mount if data is fresh
			refetchOnMount: false,

			// Network mode: online only (don't cache failed requests offline)
			networkMode: 'online',
		},
		mutations: {
			// Retry mutations once
			retry: 1,
			networkMode: 'online',
		},
	},
})

/**
 * Query Keys
 * Centralized query keys for type safety and cache management
 */
export const queryKeys = {
	// Client keys
	client: {
		all: ['client'] as const,
		profile: () => [...queryKeys.client.all, 'profile'] as const,
	},

	// End-users keys
	endUsers: {
		all: ['endUsers'] as const,
		list: () => [...queryKeys.endUsers.all, 'list'] as const,
		detail: (userId: string) => [...queryKeys.endUsers.all, 'detail', userId] as const,
		value: (userId: string) => [...queryKeys.endUsers.all, 'value', userId] as const,
	},

	// Vault index keys
	vaultIndex: {
		all: ['vaultIndex'] as const,
		current: () => [...queryKeys.vaultIndex.all, 'current'] as const,
		history: (days?: number) => [...queryKeys.vaultIndex.all, 'history', days] as const,
		metrics: () => [...queryKeys.vaultIndex.all, 'metrics'] as const,
	},

	// DeFi protocols keys
	defiProtocols: {
		all: ['defiProtocols'] as const,
		list: () => [...queryKeys.defiProtocols.all, 'list'] as const,
		status: () => [...queryKeys.defiProtocols.all, 'status'] as const,
		allocations: () => [...queryKeys.defiProtocols.all, 'allocations'] as const,
	},

	// Transactions keys
	transactions: {
		all: ['transactions'] as const,
		list: (filters?: { type?: string; userId?: string }) =>
			[...queryKeys.transactions.all, 'list', filters] as const,
		summary: () => [...queryKeys.transactions.all, 'summary'] as const,
		detail: (txId: string) => [...queryKeys.transactions.all, 'detail', txId] as const,
	},

	// AI insights keys
	aiInsights: {
		all: ['aiInsights'] as const,
		list: (priority?: string) => [...queryKeys.aiInsights.all, 'list', priority] as const,
		summary: () => [...queryKeys.aiInsights.all, 'summary'] as const,
	},

	// Dashboard keys
	dashboard: {
		all: ['dashboard'] as const,
		metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
	},

	// Deposit keys (B2B On-Ramp)
	deposits: {
		all: ['deposits'] as const,
		lists: () => [...queryKeys.deposits.all, 'list'] as const,
		list: (userId: string, page?: number) =>
			[...queryKeys.deposits.lists(), userId, page] as const,
		details: () => [...queryKeys.deposits.all, 'detail'] as const,
		detail: (orderId: string) => [...queryKeys.deposits.details(), orderId] as const,
		clientBalance: ['deposits', 'client-balance'] as const,
	},
}

export default queryClient
