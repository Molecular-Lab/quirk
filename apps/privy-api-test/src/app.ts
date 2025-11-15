import "dotenv/config"
import express from "express"
import { ENV } from "./config/env"
import { logger } from "./config/logger"
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware"
import { createServiceFactory } from "./di/factory"
import { WalletTransactionRepository, WalletTransactionUseCase } from "@proxify/core"
import { MockUserEmbeddedWalletRepository } from "./repository/user-embedded-wallet.repository"
import { MockTransactionHistoryRepository } from "./repository/transaction-history.repository"
import { createEmbeddedWalletRouter } from "./routers/embedded-wallet.router"
import { createWalletExecutionRouter } from "./routers/wallet-execution.router"
import { EmbeddedWalletController } from "./controllers/embedded-wallet.controller"
import { WalletTransactionService } from "./services/wallet-transaction.service"

const app = express()
const PORT = ENV.PORT

/**
 * Main Application Entry Point
 */
const main = async () => {
	logger.info("🚀 Starting Privy API Test Server...")
	logger.info(`📍 Environment: ${ENV.NODE_ENV}`)
	logger.info(`🔑 Privy App ID: ${ENV.PRIVY_APP_ID}`)

	// 1. Initialize database repository
	// TODO: Replace MockUserEmbeddedWalletRepository with real PostgreSQL implementation
	const userWalletRepository = new MockUserEmbeddedWalletRepository()
	logger.info("✅ Mock database repository initialized")

	// Initialize transaction history repository
	const transactionHistoryRepository = new MockTransactionHistoryRepository()
	logger.info("✅ Mock transaction history repository initialized")

	// 2. Create service factory with dependencies
	const serviceFactory = createServiceFactory(userWalletRepository)
	logger.info("✅ Service factory created")

	// 3. Create DI container
	const container = serviceFactory.createContainer()
	logger.info("✅ DI container initialized")

	// 4. Create wallet transaction repositories and use case
	// Get PrivyClient from the privy repository
	const privyClient = (container.privyRepository as any).privyClient
	const walletTransactionRepository = new WalletTransactionRepository(privyClient)
	const walletTransactionUseCase = new WalletTransactionUseCase(
		walletTransactionRepository,
		transactionHistoryRepository,
	)
	const walletTransactionService = new WalletTransactionService(walletTransactionUseCase)
	logger.info("✅ Wallet transaction service initialized")

	// Store container in app locals for access in routes
	app.locals.container = container

	// Middleware
	app.use(express.json())
	app.use(requestLoggerMiddleware) // Request/Response logging

	// Health check
	const controller = new EmbeddedWalletController(container)
	app.get("/", (req, res) => controller.healthCheck(req, res))
	app.get("/health", (req, res) => controller.healthCheck(req, res))

	// API routes
	app.use("/api/v1/wallets", createEmbeddedWalletRouter(container))
	app.use("/api/v1/wallet-execution", createWalletExecutionRouter(walletTransactionService))

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
		logger.info("\n📚 Available Endpoints:")
		logger.info("\n🔐 Wallet Management:")
		logger.info(`  POST   http://localhost:${PORT}/api/v1/wallets/create`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/wallets/user/:productId/:userId`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/wallets/address/:productId/:walletAddress`)
		logger.info(`  PUT    http://localhost:${PORT}/api/v1/wallets/link`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/wallets/details/:productId/:userId`)
		logger.info("\n💼 Portfolio & Balance (Multi-Chain):")
		logger.info(`  GET    http://localhost:${PORT}/api/v1/wallet-execution/portfolio/:walletAddress`)
		logger.info(`         ⭐ NEW: Returns ALL balances across 7 chains + tokens in one call`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/wallet-execution/balance`)
		logger.info(`  GET    http://localhost:${PORT}/api/v1/wallet-execution/stats/:walletAddress/:chainId`)
		logger.info("\n💸 Wallet Operations (Transactions):")
		logger.info(`  POST   http://localhost:${PORT}/api/v1/wallet-execution/transfer`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/wallet-execution/withdraw`)
		logger.info(`  POST   http://localhost:${PORT}/api/v1/wallet-execution/deposit`)
		logger.info("\n🌐 Supported Chains (7 total):")
		logger.info(`  • Ethereum Mainnet (1) | Sepolia Testnet (11155111)`)
		logger.info(`  • Polygon (137) | BSC (56) | Arbitrum (42161)`)
		logger.info(`  • Optimism (10) | Base (8453)`)
		logger.info("\n💰 Supported Tokens:")
		logger.info(`  • Native: ETH, MATIC, BNB`)
		logger.info(`  • Stablecoins: USDT, USDC (deployed on all chains)`)
		logger.info("")
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
