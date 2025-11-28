/**
 * B2B API Server - NEW Proxify Architecture Implementation
 * 
 * Architecture:
 * 1. DTO Layer (@proxify/b2b-api-core) - API contracts with Zod validation
 * 2. Router Layer (this file) - ts-rest HTTP handlers
 * 3. Service Layer (service/) - Business logic orchestration
 * 4. UseCase Layer (@proxify/core) - Domain business rules
 * 5. Repository Layer (@proxify/sqlcgen) - Data access
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
	DepositOrderRepository,
	WithdrawalRepository,
	AuditRepository,
	B2BClientUseCase,
	B2BVaultUseCase,
	B2BUserUseCase,
	B2BDepositUseCase,
	B2BWithdrawalUseCase,
	B2BUserVaultUseCase,
	ClientGrowthIndexService, // ✅ NEW: Client growth index calculation
	DepositOrderUseCase, // ✅ NEW: Deposit orders for Operations Dashboard
} from "@proxify/core";
import { b2bContract } from "@proxify/b2b-api-core";
import { createExpressEndpoints } from "@ts-rest/express";

import { ENV } from "./env";
import { logger } from "./logger";
import { ClientService } from "./service/client.service";
import { VaultService } from "./service/vault.service";
import { UserService } from "./service/user.service";
import { DepositService } from "./service/deposit.service";
import { DepositOrderService } from "./service/deposit-order.service";
import { WithdrawalService } from "./service/withdrawal.service";
import { UserVaultService } from "./service/user-vault.service";
import { PrivyAccountService } from "./service/privy-account.service";
import { createMainRouter } from "./router";
import { apiKeyAuth } from "./middleware/apiKeyAuth";

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

	// 2. Initialize Repositories
	const clientRepository = new ClientRepository(sql);
	const privyAccountRepository = new PrivyAccountRepository(sql);
	const vaultRepository = new VaultRepository(sql);
	const userRepository = new UserRepository(sql);
	const depositRepository = new DepositRepository(sql);
	const depositOrderRepository = new DepositOrderRepository(sql); // ✅ NEW: For Operations Dashboard
	const withdrawalRepository = new WithdrawalRepository(sql);
	const auditRepository = new AuditRepository(sql);

	logger.info("✅ Repositories initialized");

	// 3. Initialize UseCases
	const clientUseCase = new B2BClientUseCase(
		clientRepository,
		privyAccountRepository,
		auditRepository,
		vaultRepository // ✅ Added for strategy configuration
	);
	const vaultUseCase = new B2BVaultUseCase(vaultRepository, auditRepository);
	const userUseCase = new B2BUserUseCase(
		userRepository,
		vaultRepository,
		clientRepository, // ✅ Added for productId → clientId resolution
		auditRepository
	);

	// ✅ Initialize ClientGrowthIndexService for simplified vault architecture
	const clientGrowthIndexService = new ClientGrowthIndexService(vaultRepository);

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
		clientGrowthIndexService // ✅ NEW: Client growth index calculation
	);
	const userVaultUseCase = new B2BUserVaultUseCase(
		vaultRepository,
		userRepository,
		auditRepository,
		clientGrowthIndexService
	);
	const depositOrderUseCase = new DepositOrderUseCase(
		depositOrderRepository,
		userRepository,
		clientRepository
	); // ✅ NEW: Deposit orders for Operations Dashboard

	logger.info("✅ UseCases initialized");

	// 4. Initialize Services
	const clientService = new ClientService(clientUseCase);
	const vaultService = new VaultService(vaultUseCase);
	const userService = new UserService(userUseCase);
	const depositService = new DepositService(depositUseCase);
	const depositOrderService = new DepositOrderService(depositOrderUseCase); // ✅ NEW: For Operations Dashboard
	const withdrawalService = new WithdrawalService(withdrawalUseCase);
	const userVaultService = new UserVaultService(userVaultUseCase);
	const privyAccountService = new PrivyAccountService(privyAccountRepository);

	logger.info("✅ Services initialized");

	// 5. Initialize ts-rest server
	const s = initServer();

	// 6. Create routers
	const router = createMainRouter(s, {
		clientService,
		vaultService,
		userService,
		depositService,
		depositOrderService, // ✅ NEW: For Operations Dashboard
		withdrawalService,
		userVaultService,
		privyAccountService,
	});

	logger.info("✅ Routers created");
	logger.info("Router type:", typeof router);
	logger.info("Router keys:", Object.keys(router || {}));

	// 7. Setup Express middleware
	// CORS middleware - Allow requests from frontend
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*"); // In production, set specific origin
		res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS"); // ✅ Added PATCH
		res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key"); // ✅ Added x-api-key
		res.header("Access-Control-Max-Age", "86400"); // 24 hours
		
		// Handle preflight requests
		if (req.method === "OPTIONS") {
			logger.info("Handling OPTIONS preflight request", { path: req.path });
			res.sendStatus(200);
			return;
		}
		
		next();
	});

	app.use(express.json());

	// Request logging middleware
	app.use((req, _res, next) => {
		logger.info(`${req.method} ${req.path}`, {
			method: req.method,
			path: req.path,
			query: req.query,
			body: req.body,
			headers: req.headers,
		});
		next();
	});

	// API Key Authentication for protected routes (FLOW 3-9)
	// Apply to all /api/v1/* routes EXCEPT client registration
	app.use("/api/v1/users*", apiKeyAuth(clientUseCase));
	app.use("/api/v1/deposits*", apiKeyAuth(clientUseCase));
	app.use("/api/v1/withdrawals*", apiKeyAuth(clientUseCase));
	app.use("/api/v1/vaults*", apiKeyAuth(clientUseCase));
	
	logger.info("✅ API Key authentication middleware applied to protected routes");

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
	app.listen(ENV.PORT, () => {
		logger.info("\n✅ Server started successfully!");
		logger.info(`🌐 Server running on http://localhost:${ENV.PORT}`);
		logger.info(`📡 Health check: http://localhost:${ENV.PORT}/health`);
		logger.info(`📚 API Base: http://localhost:${ENV.PORT}/api/v1`);
		logger.info("\n🏗️ Architecture:");
		logger.info(`  ✅ DTO Layer: @proxify/b2b-api-core (Zod + ts-rest)`);
		logger.info(`  ✅ Router Layer: ts-rest/express`);
		logger.info(`  ✅ Service Layer: service/`);
		logger.info(`  ✅ UseCase Layer: @proxify/core`);
		logger.info(`  ✅ Repository Layer: @proxify/sqlcgen`);
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
