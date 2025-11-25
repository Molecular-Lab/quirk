import fastifyCors from "@fastify/cors"
import { initServer } from "@ts-rest/fastify"
import { BigNumber } from "bignumber.js"
import fastify from "fastify"
import postgres from "postgres"
import { type Sql } from "postgres"
import { createClient } from "redis"

import { coreContract } from "@rabbitswap/api-core"

import { ENV } from "@/env"
import { Logger } from "@/logger"
import { SubgraphRepository } from "@/repository/graphql"
import { LimitOrderLastRecordedBlockRepository } from "@/repository/limit-order-last-recorded-block.repository"
import { LimitOrderRepository } from "@/repository/limit-order.repository"
import { PoolAddressCache } from "@/repository/PoolAddressCache"
import { RedisCacheRepository } from "@/repository/redis-cache.repository"
import {
	createExploreRouter,
	createOrderRouter,
	createParticleRouter,
	createPoolRouter,
	createSwapRouter,
	createSystemRouter,
	createTokenRouter,
	createWalletRouter,
} from "@/router"
import {
	ExploreService,
	OrderService,
	PoolService,
	QuoteService,
	RouteService,
	TokenService,
	WalletService,
} from "@/service"
import { getViemClient } from "@/utils"

BigNumber.config({ EXPONENTIAL_AT: 200 })

// Initialize Postgres client
const sql: Sql = postgres({
	user: ENV.DB.USER,
	host: ENV.DB.HOST,
	database: ENV.DB.NAME,
	password: ENV.DB.PASSWORD,
	port: ENV.DB.PORT,
})

// Add SQL connection check function
const checkSqlConnection = async () => {
	try {
		Logger.info("🔄 Checking SQL connection...", {
			db: {
				user: ENV.DB.USER,
				host: ENV.DB.HOST,
				database: ENV.DB.NAME,
				port: ENV.DB.PORT,
			},
		})
		await sql`SELECT 1`
		Logger.info("✅ SQL connection successful", {
			event: "sql_connection_check_success",
			db: {
				user: ENV.DB.USER,
				host: ENV.DB.HOST,
				database: ENV.DB.NAME,
				port: ENV.DB.PORT,
			},
		})
	} catch (error) {
		Logger.error("Failed to connect to SQL database:", {
			event: "sql_connection_check_failed",
			err: error,
			db: {
				user: ENV.DB.USER,
				host: ENV.DB.HOST,
				database: ENV.DB.NAME,
				port: ENV.DB.PORT,
			},
		})
		throw error
	}
}

// Initialize Redis client
const redisClient = createClient({
	url: ENV.REDIS.URL,
	database: ENV.REDIS.DB,
})

// Initialize Fastify server
const app = fastify({
	logger:
		ENV.ENVIRONMENT === "local"
			? {
					transport: {
						target: "pino-pretty",
						options: {
							translateTime: "HH:MM:ss Z",
							ignore: "pid,hostname",
						},
					},
				}
			: true,
	disableRequestLogging: ENV.ENVIRONMENT === "local",
})

app.register(fastifyCors, {
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE"],
})

const s = initServer()

const setup = async () => {
	const SYSTEM_CHAIN_ID = 88
	const publicClient = getViemClient(SYSTEM_CHAIN_ID)

	// Check SQL connection first
	await checkSqlConnection()

	Logger.info("🔄 Redis client connecting...", {
		redis: {
			url: ENV.REDIS.URL,
			database: ENV.REDIS.DB,
		},
	})
	redisClient.on("error", (err) => {
		Logger.error("Redis Client Error", {
			event: "redis_client_error",
			err: err,
			redis: {
				url: ENV.REDIS.URL,
				database: ENV.REDIS.DB,
			},
		})
		throw err
	})
	await redisClient.connect()
	Logger.info("✅ Redis client connected", {
		redis: {
			url: ENV.REDIS.URL,
			database: ENV.REDIS.DB,
		},
	})

	// Initialize repositories
	const limitOrderRepository = new LimitOrderRepository(sql)
	const lastRecordedBlockRepository = new LimitOrderLastRecordedBlockRepository(sql)
	const redisCacheRepository = new RedisCacheRepository(redisClient)

	const subgraphRepo = new SubgraphRepository({
		endpoint: ENV.SUBGRAPH.ENDPOINT,
		apiKey: ENV.SUBGRAPH.API_KEY,
	})

	const poolAddressCache = new PoolAddressCache({
		publicClient: publicClient,
		cacheRepository: redisCacheRepository,
		subgraphRepo: subgraphRepo,
	})
	await poolAddressCache.initialize()

	// Initialize services
	const tokenService = new TokenService({
		cacheRepository: redisCacheRepository,
		subgraphRepo: subgraphRepo,
	})
	const poolService = new PoolService({
		publicClient: publicClient,
		poolAddressCache: poolAddressCache,
		cacheRepository: redisCacheRepository,
		subgraphRepo: subgraphRepo,
	})
	const routeService = new RouteService({
		poolService: poolService,
	})
	const quoteService = new QuoteService({
		publicClient: publicClient,
		routeService: routeService,
	})
	const exploreService = new ExploreService({
		cacheRepository: redisCacheRepository,
		subgraphRepo: subgraphRepo,
	})
	const orderService = new OrderService({
		orderRepository: limitOrderRepository,
		lastRecordedBlockRepository: lastRecordedBlockRepository,
	})
	const walletService = new WalletService({
		subgraphRepo: subgraphRepo,
	})

	// Initialize routers
	Logger.info(`🔄 Routers initializing...`)
	const router = s.router(coreContract, {
		system: createSystemRouter(s, {
			chainId: SYSTEM_CHAIN_ID,
			lastRecordedBlockRepository: lastRecordedBlockRepository,
		}),
		swap: createSwapRouter(s, {
			quoteService,
		}),
		token: createTokenRouter(s, {
			tokenService,
		}),
		explore: createExploreRouter(s, {
			exploreService,
		}),
		pool: createPoolRouter(s, {
			poolService,
		}),
		particle: createParticleRouter(s, {
			privateKey: ENV.PARTICLE.PRIVATE_KEY,
			publicKey: ENV.PARTICLE.PUBLIC_KEY,
		}),
		order: createOrderRouter(s, {
			orderService: orderService,
			chainId: SYSTEM_CHAIN_ID,
		}),
		wallet: createWalletRouter(s, {
			walletService,
		}),
	})

	s.registerRouter(coreContract, router, app, {
		logInitialization: true,
		jsonQuery: true,
	})
	Logger.info("✅ Routers initialized")
}

// Start server and handle connections
const start = async () => {
	try {
		await setup()

		// inject health check endpoint
		app.all("/", () => {
			return { status: "ok" }
		})

		const port = ENV.PORT
		const host = ENV.ENVIRONMENT === "local" ? "localhost" : "0.0.0.0"

		await app.listen({ host, port })
		Logger.info(`🚀 API is running on http://${host}:${port}`)
	} catch (error) {
		Logger.error("Failed to start API:", {
			event: "server_start_failed",
			err: error,
		})
		process.exit(1)
	}
}

start().catch((error: unknown) => {
	Logger.error("Failed to start API:", {
		event: "start_failed",
		err: error,
	})
	process.exit(1)
})

// Graceful shutdown
const gracefulShutdown = async () => {
	// stop server
	Logger.info("Received shutdown signal, shutting down gracefully...")
	await app.close()
	Logger.info("⏹️ Server closed.")

	// stop postgres
	await sql.end()
	Logger.info("⏹️ Postgres connection closed.")

	// stop redis
	await redisClient.disconnect()
	Logger.info("⏹️ Redis connection closed.")

	process.exit(0)
}

process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)
