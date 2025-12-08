import { useCallback, useMemo } from "react"

import { useQuirkContext } from "../QuirkContext"

import { useAsyncAction } from "./useAsyncAction"

import type { CreateUserRequest, User } from "../../types"

export interface UseEndUserReturn {
	/**
	 * Create or get existing end-user
	 * Automatically injects productId from context
	 */
	create: (params: Omit<CreateUserRequest, "clientId">) => Promise<User>

	/**
	 * Get end-user by internal user ID
	 */
	get: (userId: string) => Promise<User>

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
 * Hook for managing end-users
 *
 * @example
 * ```tsx
 * import { useEndUser } from '@quirk/b2b-sdk'
 *
 * function CreateUserButton() {
 *   const { create, loading, error } = useEndUser()
 *
 *   const handleCreate = async () => {
 *     try {
 *       const user = await create({
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
 *     <button onClick={handleCreate} disabled={loading}>
 *       {loading ? 'Creating...' : 'Create User'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useEndUser(): UseEndUserReturn {
	const { sdk, productId } = useQuirkContext()

	// Create action
	const createAction = useCallback(
		async (params: Omit<CreateUserRequest, "clientId">) => {
			return sdk.users.createOrGet({
				...params,
				clientId: productId,
			})
		},
		[sdk, productId],
	)

	const { execute: create, loading: createLoading, error: createError } = useAsyncAction(createAction)

	// Get action
	const getAction = useCallback(
		async (userId: string) => {
			return sdk.users.getById(userId)
		},
		[sdk],
	)

	const { execute: get, loading: getLoading, error: getError } = useAsyncAction(getAction)

	// Combine loading and error states
	const loading = useMemo(() => createLoading || getLoading, [createLoading, getLoading])
	const error = useMemo(() => createError || getError, [createError, getError])

	return {
		create,
		get,
		loading,
		error,
	}
}
