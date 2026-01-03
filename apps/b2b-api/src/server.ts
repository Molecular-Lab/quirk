/**
 * B2B API Server - NEW Quirk Architecture Implementation
 * 
 * Architecture:
 * 1. DTO Layer (@quirk/b2b-api-core) - API contracts with Zod validation
 * 2. Router Layer (this file) - ts-rest HTTP handlers
 * 3. Service Layer (service/) - Business logic orchestration
 * 4. UseCase Layer (@quirk/core) - Domain business rules
 * 5. Repository Layer (@quirk/sqlcgen) - Data access
 */

import "dotenv/config";
import express, { type Request, type Response } from "express";
import postgres from "postgres";
import { initServer } from "@ts-rest/express";
import {
	ClientRepository,
	PrivyAccountRepository,
	VaultRepository,
	UserRepository,
	DepositRepository,
	WithdrawalRepository,
	AuditRepository,
	RevenueRepository, // ✅ Revenue distribution tracking
	B2BClientUseCase,
	B2BVaultUseCase,
	B2BUserUseCase,
	B2BDepositUseCase,
	B2BWithdrawalUseCase,
	B2BUserVaultUseCase,
	ClientGrowthIndexService, // ✅ Client growth index calculation
	ViemClientManager, // ✅ Blockchain client for minting tokens (sandbox)
	PrivyWalletService, // ✅ Privy server wallets (production)
	RevenueService, // ✅ Revenue tracking service
} from "@quirk/core";
import { b2bContract } from "@quirk/b2b-api-core";
import { createExpressEndpoints } from "@ts-rest/express";

import { ENV } from "./env.js";
import { logger } from "./logger.js";
import { ClientService } from "./service/client.service.js";
import { DeFiProtocolService } from "./service/defi-protocol.service.js";
import { VaultService } from "./service/vault.service.js";
import { UserService } from "./service/user.service.js";
import { DepositService } from "./service/deposit.service.js";
import { DeFiExecutionService } from "./service/defi-execution.service.js";
import { WithdrawalService } from "./service/withdrawal.service.js";
import { UserVaultService } from "./service/user-vault.service.js";
import { PrivyAccountService } from "./service/privy-account.service.js";
import { ExplorerService } from "./service/explorer.service.js";
import { createMainRouter } from "./router/index.js";
import { apiKeyAuth } from "./middleware/apiKeyAuth.js";
import { privyAuth } from "./middleware/privyAuth.js";

const app = express();

async function main() {
	logger.info("🚀 Starting B2B API Server (NEW Architecture)...");
	logger.info(`📍 Environment: ${ENV.NODE_ENV}`);

	// 1. Initialize Database Connection
	const sql = postgres(ENV.DATABASE_URL);

	logger.info("✅ Database connection initialized");

	// Health check
	try {
		await sql`SELECT 1`;
		logger.info("✅ Database connection verified");
	} catch (error: any) {
		logger.error("❌ Database connection failed!", { error: error.message });
		process.exit(1);
	}

	// Initialize ViemClientManager for blockchain interactions (sandbox minting)
	const sandboxOracleKey = ENV.SANDBOX_ORACLE_PRIVATE_KEY || ENV.DEPLOYER_PRIVATE_KEY || ENV.PRIVATE_KEY;
	if (!sandboxOracleKey) {
		logger.error("❌ SANDBOX_ORACLE_PRIVATE_KEY not set in environment");
		logger.error("   Please set SANDBOX_ORACLE_PRIVATE_KEY in .env file (contract owner key for minting)");
		process.exit(1);
	}

	if (!sandboxOracleKey.startsWith("0x")) {
		logger.error("❌ SANDBOX_ORACLE_PRIVATE_KEY must start with 0x");
		process.exit(1);
	}

	try {
		ViemClientManager.init(sandboxOracleKey as `0x${string}`);
		logger.info("✅ ViemClientManager initialized for sandbox blockchain operations");
	} catch (error: any) {
		logger.error("❌ Failed to initialize ViemClientManager", { error: error.message });
		process.exit(1);
	}

	// 2. Initialize Repositories
	const clientRepository = new ClientRepository(sql);
	const privyAccountRepository = new PrivyAccountRepository(sql);
	const vaultRepository = new VaultRepository(sql);
	const userRepository = new UserRepository(sql);
	const depositRepository = new DepositRepository(sql);
	const withdrawalRepository = new WithdrawalRepository(sql);
	const auditRepository = new AuditRepository(sql);
	const revenueRepository = new RevenueRepository(sql);

	logger.info("✅ Repositories initialized");

	// 2.5 Initialize Services needed by UseCases
	const revenueService = new RevenueService({
		clientRepository,
		vaultRepository
	});

	// 3. Initialize UseCases
	const clientUseCase = new B2BClientUseCase(
		clientRepository,
		privyAccountRepository,
		auditRepository,
		vaultRepository,
		revenueService // ✅ Added for revenue tracking
	);
	const vaultUseCase = new B2BVaultUseCase(vaultRepository, auditRepository);
	const userUseCase = new B2BUserUseCase(
		userRepository,
		vaultRepository,
		clientRepository, // ✅ Added for productId → clientId resolution
		auditRepository
	);

	// ✅ Initialize ClientGrowthIndexService for simplified vault architecture
	const clientGrowthIndexService = new ClientGrowthIndexService(vaultRepository, revenueRepository);

	const depositUseCase = new B2BDepositUseCase(
		depositRepository,
		clientRepository,
		vaultRepository,
		userRepository,
		auditRepository,
		clientGrowthIndexService // ✅ NEW: Client growth index calculation
	);
	const withdrawalUseCase = new B2BWithdrawalUseCase(
		withdrawalRepository,
		vaultRepository,
		userRepository,
		auditRepository,
		revenueRepository, // ✅ NEW: Revenue distribution tracking
		clientGrowthIndexService, // ✅ NEW: Client growth index calculation
		revenueService // ✅ NEW: Revenue split calculation
	);
	const userVaultUseCase = new B2BUserVaultUseCase(
		vaultRepository,
		userRepository,
		auditRepository,
		clientGrowthIndexService
	);

	logger.info("✅ UseCases initialized");

	// 4. Initialize Services
	const clientService = new ClientService(clientUseCase);
	const defiProtocolService = new DeFiProtocolService(); // Adapters created per-request with correct chainId

	// Initialize PrivyWalletService if production credentials are available
	let privyWalletService: PrivyWalletService | undefined;
	const privyAppId = process.env.PRIVY_APP_ID;
	const privyAppSecret = process.env.PRIVY_APP_SECRET;
	const privyAuthKeyId = process.env.PRIVY_AUTHORIZATION_KEY_ID;

	if (privyAppId && privyAppSecret) {
		privyWalletService = new PrivyWalletService(
			{
				appId: privyAppId,
				appSecret: privyAppSecret,
				authorizationKeyId: privyAuthKeyId,
			},
			logger
		);
		logger.info("✅ PrivyWalletService initialized for production DeFi execution");
	} else {
		logger.info("ℹ️ PrivyWalletService not configured (production execution disabled)");
		logger.info("   Set PRIVY_APP_ID and PRIVY_APP_SECRET in .env to enable");
	}

	const defiExecutionService = new DeFiExecutionService(defiProtocolService, privyWalletService, logger);
	const vaultService = new VaultService(vaultUseCase);
	const userService = new UserService(userUseCase, clientUseCase); // ✅ Added clientUseCase for productId lookup
	const depositService = new DepositService(depositUseCase);
	const withdrawalService = new WithdrawalService(withdrawalUseCase);
	const userVaultService = new UserVaultService(userVaultUseCase, clientGrowthIndexService);
	const privyAccountService = new PrivyAccountService(privyAccountRepository);
	const explorerService = new ExplorerService(clientUseCase, userUseCase, userVaultService);

	logger.info("✅ Services initialized");

	// 5. Initialize ts-rest server
	const s = initServer();

	// 6. Create routers
	const router = createMainRouter(s, {
		clientService,
		defiProtocolService,
		vaultService,
		userService,
		depositService,
		withdrawalService,
		userVaultService,
		privyAccountService,
		explorerService,
	});

	logger.info("✅ Routers created");
	logger.info("Router type:", typeof router);
	logger.info("Router keys:", Object.keys(router || {}));

	// 7. Setup Express middleware
	// CORS middleware - Allow requests from frontend
	app.use((req, res, next) => {
		// Set CORS headers for ALL responses (including errors)
		res.header("Access-Control-Allow-Origin", "*"); // In production, set specific origin
		res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
		res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, x-privy-org-id");
		res.header("Access-Control-Allow-Credentials", "true");
		res.header("Access-Control-Max-Age", "86400"); // 24 hours

		// Handle preflight requests (no logging for performance)
		if (req.method === "OPTIONS") {
			return res.status(200).end();
		}

		next();
	});

	app.use(express.json());

	// Minimal request logging (endpoint name only)
	app.use((req, _res, next) => {
		logger.info(`${req.method} ${req.path}`);
		next();
	});

	// Authentication Strategy:
	// - SDK Endpoints: Use x-api-key header (external integrations)
	//   * POST /api/v1/users - Create user
	//   * GET /api/v1/users/client/:clientId/user/:clientUserId - Get user
	//   * POST /api/v1/deposits/fiat - Deposit
	//   * POST /api/v1/withdrawals - Withdrawal
	//
	// - Dashboard Endpoints: Use x-privy-org-id header (internal dashboard)
	//   * Client configuration, operations dashboard, metrics, etc.
	//
	// Dual auth middleware: Check for API key first, then Privy
	app.use(
		"/api/v1/*",
		(req, res, next) => {
			// Skip auth for public endpoints
			// Note: Express uses req.originalUrl for the complete path before middleware processing
			if (
				(req.originalUrl === "/api/v1/clients" && req.method === "POST") || // Client registration
				(req.originalUrl === "/api/v1/privy-accounts" && req.method === "POST") || // Privy account creation (first-time onboarding)
				req.originalUrl.startsWith("/api/v1/defi/") || // Public DeFi metrics
				req.originalUrl === "/api/v1/health" || // Health check
				(/^\/api\/v1\/users\/[^/]+\/activate$/.test(req.originalUrl) && req.method === "POST") // User activation (onboarding completion)
			) {
				return next();
			}

			// Check if request has API key (SDK integration)
			const hasApiKey = req.headers["x-api-key"];
			if (hasApiKey) {
				// SDK endpoint - validate API key
				return apiKeyAuth(clientUseCase)(req, res, next);
			}

			// Dashboard endpoint - validate Privy session (with DB validation)
			return privyAuth(clientUseCase, privyAccountRepository)(req, res, next);
		}
	);

	logger.info("✅ Dual authentication middleware applied (API key for SDK, Privy for dashboard)");

	// 8. Mount ts-rest endpoints
	createExpressEndpoints(b2bContract, router, app, {
		logInitialization: true,
		jsonQuery: true,
		responseValidation: true,
	});

	logger.info("✅ Endpoints mounted");

	// Test endpoint to verify Express is working
	app.post("/api/v1/test", (req, res) => {
		logger.info("Test endpoint hit!", { body: req.body });
		res.json({ message: "Test endpoint works!", body: req.body });
	});

	// Optimize endpoint for yield strategy recommendations
	app.post("/api/v1/defi/optimize", async (req, res) => {
		try {
			const { riskProfile, token = "USDC", chainId = 8453 } = req.body;

			if (!riskProfile || !riskProfile.level) {
				return res.status(400).json({
					error: "Missing required field: riskProfile.level",
					message: "Please provide riskProfile with level: 'conservative' | 'moderate' | 'aggressive'"
				});
			}

			const level = riskProfile.level;

			if (!['conservative', 'moderate', 'aggressive'].includes(level)) {
				return res.status(400).json({
					error: "Invalid risk level",
					message: "Risk level must be one of: conservative, moderate, aggressive"
				});
			}

			logger.info("Optimizing allocation", { riskProfile: level, token, chainId });

			const result = await defiProtocolService.optimizeAllocation(token, chainId, level);

			res.json(result);
		} catch (error: any) {
			logger.error("Failed to optimize allocation", { error: error.message });
			res.status(500).json({
				error: "Optimization failed",
				message: error.message
			});
		}
	});

	// 9. Health check endpoint
	app.get("/health", async (_req, res) => {
		try {
			await sql`SELECT 1`;
			res.json({
				status: "ok",
				service: "B2B API (NEW Architecture)",
				timestamp: new Date().toISOString(),
				database: { connected: true },
			});
		} catch (error) {
			res.status(500).json({
				status: "error",
				service: "B2B API (NEW Architecture)",
				timestamp: new Date().toISOString(),
				database: { connected: false },
			});
		}
	});

	// 10. Error handling middleware
	app.use(
		(
			err: any,
			_req: express.Request,
			res: express.Response,
			_next: express.NextFunction
		) => {
			logger.error("❌ Unhandled error", {
				error: err.message,
				stack: err.stack,
			});

			res.status(500).json({
				success: false,
				error: ENV.NODE_ENV === "development" ? err.message : "Internal server error",
			});
		}
	);

	// 11. Start server
	app.listen(ENV.PORT, '0.0.0.0', () => {
		logger.info("\n✅ Server started successfully!");
		logger.info(`🌐 Server running on http://0.0.0.0:${ENV.PORT}`);
		logger.info(`📡 Health check: http://0.0.0.0:${ENV.PORT}/health`);
		logger.info(`📚 API Base: http://0.0.0.0:${ENV.PORT}/api/v1`);
		logger.info("\n🏗️ Architecture:");
		logger.info(`  ✅ DTO Layer: @quirk/b2b-api-core (Zod + ts-rest)`);
		logger.info(`  ✅ Router Layer: ts-rest/express`);
		logger.info(`  ✅ Service Layer: service/`);
		logger.info(`  ✅ UseCase Layer: @quirk/core`);
		logger.info(`  ✅ Repository Layer: @quirk/sqlcgen`);
		logger.info("");
	});

	// 12. Graceful shutdown
	const shutdown = async () => {
		logger.info("🛑 Shutting down gracefully...");
		await sql.end();
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

// Start application
main().catch((error) => {
	logger.error("❌ Failed to start application", {
		error: error.message,
		stack: error.stack,
	});
	process.exit(1);
});
