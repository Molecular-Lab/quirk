import { useCallback, useState } from "react"

export interface AsyncActionState {
	loading: boolean
	error: Error | null
}

export interface AsyncActionReturn<T extends (...args: any[]) => Promise<any>> {
	execute: T
	loading: boolean
	error: Error | null
	reset: () => void
}

/**
 * Utility hook for managing async action state (loading, error)
 *
 * @param actionFn - Async function to execute
 * @returns Object with execute function, loading state, error state, and reset function
 *
 * @example
 * ```tsx
 * const { execute, loading, error } = useAsyncAction(async (userId: string) => {
 *   return await sdk.users.getById(userId)
 * })
 *
 * const handleClick = async () => {
 *   const user = await execute('user_123')
 *   console.log(user)
 * }
 * ```
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(actionFn: T): AsyncActionReturn<T> {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const execute = useCallback(
		async (...args: Parameters<T>): Promise<ReturnType<T>> => {
			setLoading(true)
			setError(null)

			try {
				const result = await actionFn(...args)
				setLoading(false)
				return result
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err))
				setError(error)
				setLoading(false)
				throw error
			}
		},
		[actionFn],
	) as T

	const reset = useCallback(() => {
		setLoading(false)
		setError(null)
	}, [])

	return {
		execute,
		loading,
		error,
		reset,
	}
}
