import { useCallback, useMemo } from "react"

import { useQuirkContext } from "../QuirkContext"

import { useAsyncAction } from "./useAsyncAction"

import type { CreateUserRequest, User, UserPortfolio } from "../../types"

export interface UseQuirkReturn {
	/**
	 * Create or get existing user
	 * Automatically injects productId from QuirkProvider context
	 */
	createUser: (params: Omit<CreateUserRequest, "clientId">) => Promise<User>

	/**
	 * Get user by internal user ID
	 */
	getUser: (userId: string) => Promise<User>

	/**
	 * Get user portfolio with balance and vault information
	 */
	getUserPortfolio: (userId: string) => Promise<UserPortfolio>

	/**
	 * Loading state (true when any action is in progress)
	 */
	loading: boolean

	/**
	 * Error from last action (null if no error)
	 */
	error: Error | null
}

/**
 * Hook for managing users
 *
 * @example
 * ```tsx
 * import { useQuirk } from '@quirk/sdk'
 *
 * function UserComponent() {
 *   const { createUser, getUser, loading, error } = useQuirk()
 *
 *   const handleCreateUser = async () => {
 *     try {
 *       const user = await createUser({
 *         clientUserId: 'user_123',
 *         email: 'user@example.com'
 *       })
 *       console.log('User created:', user)
 *     } catch (err) {
 *       console.error('Failed to create user:', err)
 *     }
 *   }
 *
 *   return (
 *     <button onClick={handleCreateUser} disabled={loading}>
 *       {loading ? 'Creating...' : 'Create User'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useQuirk(): UseQuirkReturn {
	const { sdk, productId } = useQuirkContext()

	// Create user action
	const createUserAction = useCallback(
		async (params: Omit<CreateUserRequest, "clientId">) => {
			return sdk.users.createOrGet({
				...params,
				clientId: productId,
			})
		},
		[sdk, productId],
	)

	const { execute: createUser, loading: createLoading, error: createError } = useAsyncAction(createUserAction)

	// Get user action
	const getUserAction = useCallback(
		async (userId: string) => {
			return sdk.users.getById(userId)
		},
		[sdk],
	)

	const { execute: getUser, loading: getLoading, error: getError } = useAsyncAction(getUserAction)

	// Get user portfolio action
	const getUserPortfolioAction = useCallback(
		async (userId: string) => {
			return sdk.users.getPortfolio(userId)
		},
		[sdk],
	)

	const {
		execute: getUserPortfolio,
		loading: portfolioLoading,
		error: portfolioError,
	} = useAsyncAction(getUserPortfolioAction)

	// Combine loading and error states
	const loading = useMemo(
		() => createLoading || getLoading || portfolioLoading,
		[createLoading, getLoading, portfolioLoading],
	)
	const error = useMemo(() => createError || getError || portfolioError, [createError, getError, portfolioError])

	return {
		createUser,
		getUser,
		getUserPortfolio,
		loading,
		error,
	}
}
