import { CacheEntry, CacheError } from '../types/common.types'

/**
 * Simple in-memory cache with TTL support
 */
export class MemoryCache {
	private cache: Map<string, CacheEntry<any>> = new Map()
	private defaultTTL: number

	/**
	 * @param defaultTTL - Default time-to-live in milliseconds (default 5 minutes)
	 */
	constructor(defaultTTL: number = 5 * 60 * 1000) {
		this.defaultTTL = defaultTTL
	}

	/**
	 * Get a value from cache
	 * @param key - Cache key
	 * @returns Cached value or null if not found/expired
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key)

		if (!entry) {
			return null
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key)
			return null
		}

		return entry.data as T
	}

	/**
	 * Set a value in cache
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param ttl - Time-to-live in milliseconds (optional)
	 */
	set<T>(key: string, value: T, ttl?: number): void {
		const ttlMs = ttl ?? this.defaultTTL
		const now = Date.now()

		const entry: CacheEntry<T> = {
			data: value,
			timestamp: now,
			expiresAt: now + ttlMs,
		}

		this.cache.set(key, entry)
	}

	/**
	 * Check if a key exists and is not expired
	 */
	has(key: string): boolean {
		return this.get(key) !== null
	}

	/**
	 * Delete a specific key
	 */
	delete(key: string): boolean {
		return this.cache.delete(key)
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear()
	}

	/**
	 * Get cache size
	 */
	size(): number {
		return this.cache.size
	}

	/**
	 * Clean up expired entries
	 */
	cleanup(): number {
		const now = Date.now()
		let deletedCount = 0

		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiresAt) {
				this.cache.delete(key)
				deletedCount++
			}
		}

		return deletedCount
	}

	/**
	 * Get or set pattern: fetch from cache, or compute and cache if not found
	 * @param key - Cache key
	 * @param factory - Function to compute value if not in cache
	 * @param ttl - Time-to-live in milliseconds (optional)
	 * @returns Cached or computed value
	 */
	async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
		// Try to get from cache
		const cached = this.get<T>(key)
		if (cached !== null) {
			return cached
		}

		// Not in cache, compute it
		try {
			const value = await factory()
			this.set(key, value, ttl)
			return value
		} catch (error) {
			throw new CacheError(`Failed to compute value for key: ${key}`, key)
		}
	}

	/**
	 * Get all keys in cache
	 */
	keys(): string[] {
		return Array.from(this.cache.keys())
	}

	/**
	 * Get cache statistics
	 */
	stats(): {
		size: number
		keys: string[]
		oldestEntry: number | null
		newestEntry: number | null
	} {
		const entries = Array.from(this.cache.values())

		return {
			size: this.cache.size,
			keys: this.keys(),
			oldestEntry:
				entries.length > 0 ? Math.min(...entries.map((e) => e.timestamp)) : null,
			newestEntry:
				entries.length > 0 ? Math.max(...entries.map((e) => e.timestamp)) : null,
		}
	}
}

/**
 * Global cache instance
 */
export const globalCache = new MemoryCache()

/**
 * Generate cache key for protocol data
 */
export function generateCacheKey(
	protocol: string,
	method: string,
	...params: Array<string | number>
): string {
	return `${protocol}:${method}:${params.join(':')}`
}

/**
 * Auto-cleanup: Run cleanup every 10 minutes
 */
if (typeof setInterval !== 'undefined') {
	setInterval(() => {
		const deletedCount = globalCache.cleanup()
		if (deletedCount > 0) {
			console.log(`[Cache] Cleaned up ${deletedCount} expired entries`)
		}
	}, 10 * 60 * 1000) // 10 minutes
}
