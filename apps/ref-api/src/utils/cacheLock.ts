import { Logger } from "@/logger"

const locks = new Map<string, Promise<unknown>>()

/**
 * A cache for in-flight requests to prevent duplicate network calls (singleflight pattern)
 * When multiple identical requests are made concurrently, only the first one will be executed
 * and all others will receive the result from the first request.
 */
export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
	// If there's already a request in flight with this key, return its promise
	if (locks.has(key)) {
		Logger.debug(`Returning cached promise for key: ${key}`, {
			event: "cache_lock_hit",
			key: key,
		})
		return locks.get(key) as Promise<T>
	}

	try {
		Logger.debug(`Creating new promise for key: ${key}`, {
			event: "cache_lock_created",
			key: key,
		})
		// Store the promise in the locks object
		const promise = fn()
		locks.set(key, promise)
		return await promise
	} finally {
		Logger.debug(`Removing lock for key: ${key}`, {
			event: "cache_lock_removed",
			key: key,
		})
		locks.delete(key)
	}
}

/**
 * Removes all locks - useful for testing or forced resets
 */
export function clearAllLocks(): void {
	locks.clear()
}

/**
 * Checks if a lock exists for the given key
 *
 * @param key - Unique identifier for the request
 * @returns boolean indicating if a lock exists
 */
export function hasLock(key: string): boolean {
	return locks.has(key)
}
