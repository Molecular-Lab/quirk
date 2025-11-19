import "dotenv/config"
import express from "express"
import { ENV } from "./config/env"
import { logger } from "./config/logger"
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware"
import { createB2BClientRouter } from "./routers/b2b-client.router"
import { createB2BDepositRouter } from "./routers/b2b-deposit.router"
import { createB2BVaultRouter } from "./routers/b2b-vault.router"
import { createB2BUserRouter } from "./routers/b2b-user.router"
import { createB2BUserVaultRouter } from "./routers/b2b-user-vault.router"
import { createB2BWithdrawalRouter } from "./routers/b2b-withdrawal.router"
import { createServiceContainer as createB2BContainer } from "./di/b2b-container"

const app = express()
const PORT = ENV.PORT

/**
 * B2B Vault System API Server
 * Index-based custodial vault system with pooled DeFi deployment
 */
const main = async () => {
	logger.info("🚀 Starting B2B Vault System API Server...")
	logger.info(`📍 Environment: ${ENV.NODE_ENV}`)
	logger.info(`�️  Database: ${ENV.DATABASE_URL ? 'Connected' : 'Not configured'}`)

	// 1. Create B2B service container with PostgreSQL
	const b2bContainer = createB2BContainer(ENV.DATABASE_URL)
	logger.info("✅ B2B service container initialized with PostgreSQL")

	// Health check
	const isHealthy = await b2bContainer.healthCheck()
	if (!isHealthy) {
		logger.error("❌ Database connection failed!")
		process.exit(1)
	}
	logger.info("✅ Database connection verified")

	// Store container in app locals for access in routes
	app.locals.b2bContainer = b2bContainer

	// Middleware
	app.use(express.json())
	app.use(requestLoggerMiddleware) // Request/Response logging

	// Health check endpoint
	app.get("/", async (_req, res) => {
		const healthy = await b2bContainer.healthCheck()
		res.json({
			status: healthy ? "ok" : "error",
			service: "B2B Vault System",
			timestamp: new Date().toISOString(),
			database: {
				connected: healthy
			}
		})
	})
	
	app.get("/health", async (_req, res) => {
		const healthy = await b2bContainer.healthCheck()
		res.json({
			status: healthy ? "ok" : "error",
			service: "B2B Vault System",
			timestamp: new Date().toISOString(),
			database: {
				connected: healthy
			}
		})
	})

	// API routes - B2B Vault System
	app.use("/api/v1/clients", createB2BClientRouter(b2bContainer))
	app.use("/api/v1/vaults", createB2BVaultRouter(b2bContainer))
	app.use("/api/v1/users", createB2BUserRouter(b2bContainer))
	app.use("/api/v1/balances", createB2BUserVaultRouter(b2bContainer))
	app.use("/api/v1/deposits", createB2BDepositRouter(b2bContainer))
	app.use("/api/v1/withdrawals", createB2BWithdrawalRouter(b2bContainer))

	// Error handling middleware
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		logger.error("❌ Unhandled error caught by middleware", {
			error: err.message,
			stack: err.stack,
		})

		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: ENV.NODE_ENV === "development" ? err.message : undefined,
		})
	})

	// Start server
	app.listen(PORT, () => {
		logger.info("\n✅ Server started successfully!")
		logger.info(`🌐 Server running on http://localhost:${PORT}`)
		logger.info(`📡 Health check: http://localhost:${PORT}/health`)
		logger.info("\n📚 B2B Vault System API Endpoints:")
		logger.info("\n🏢 Client Management:")
		logger.info(`  POST   http://localhost:${PORT}/api/v1/clients - Create client organization`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/clients/:productId - Get client by product ID`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/clients/:clientId/balance - Get client balance`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/clients/:clientId/balance/add - Add funds to client`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/clients/:clientId/balance/reserve - Reserve funds`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/clients/:clientId/stats - Get client statistics`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/clients/active/list - List active clients`)
		logger.info("\n� Deposit Management:")
		logger.info(`  POST   http://localhost:${PORT}/api/v1/deposits - Create deposit transaction`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/deposits/:orderId - Get deposit by order ID`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/deposits/:orderId/complete - Complete deposit`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/deposits/:orderId/fail - Mark deposit as failed`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/deposits/client/:clientId - List deposits by client`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/deposits/client/:clientId/user/:userId - List by user`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/deposits/client/:clientId/status/:status - List by status`)
		logger.info("\n🏦 System Architecture:")
		logger.info(`  • Index-based vault system (money market fund model)`)
		logger.info(`  • Share-based accounting for fair yield distribution`)
		logger.info(`  • Supports multiple chains and tokens`)
		logger.info(`  • PostgreSQL with SQLC type-safe queries`)
		logger.info("\n📖 Documentation:")
		logger.info(`  • See INDEX_VAULT_SYSTEM.md for complete system flows`)
		logger.info(`  • See B2B_API_COMPLETE.md for API documentation`)
		logger.info("")
	})

	// Graceful shutdown
	process.on('SIGINT', async () => {
		logger.info('🛑 Shutting down gracefully...')
		await b2bContainer.close()
		process.exit(0)
	})

	process.on('SIGTERM', async () => {
		logger.info('🛑 Shutting down gracefully...')
		await b2bContainer.close()
		process.exit(0)
	})
}

// Start application
main().catch((error) => {
	logger.error("❌ Failed to start application", {
		error: error.message,
		stack: error.stack,
	})
	process.exit(1)
})
