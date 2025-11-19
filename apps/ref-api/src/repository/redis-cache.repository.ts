import { type RedisClientType, RedisFunctions, RedisModules, RedisScripts } from "redis"

import Logger from "@rabbitswap/logger"

export class RedisCacheRepository {
	constructor(private readonly client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>) {}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.client.get(key)

		if (typeof value !== "string") {
			return null
		}

		try {
			return JSON.parse(value) as T
		} catch (error) {
			Logger.error("Failed to parse Redis value", {
				event: "redis_cache_get_failed",
				err: error,
				key: key,
			})
			return null
		}
	}

	async set<T>(key: string, value: T, ttlSeconds?: number): Promise<T> {
		const stringValue = JSON.stringify(value)

		try {
			if (ttlSeconds) {
				await this.client.set(key, stringValue, { EX: ttlSeconds })
			} else {
				await this.client.set(key, stringValue)
			}
		} catch (error) {
			Logger.error("Failed to set Redis key", {
				event: "redis_cache_set_failed",
				err: error,
				key: key,
				value: value,
				ttlSeconds: ttlSeconds,
			})
			throw error
		}

		return value
	}
}
