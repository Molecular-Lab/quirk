import { Router } from "express"
import { ProxifyController } from "../controllers/proxify.controller"
import type { DIContainer } from "../di/container"

export function createProxifyRouter(container: DIContainer): Router {
	const router = Router()
	const proxifyController = new ProxifyController(container)

	// Contract addresses
	router.get("/controller", (req, res) => proxifyController.getController(req, res))
	router.get("/client-registry", (req, res) => proxifyController.getClientRegistry(req, res))

	// Token support
	router.get("/tokens/:token/supported", (req, res) => proxifyController.isSupportedToken(req, res))
	router.get("/tokens/:token/supported-alt", (req, res) => proxifyController.supportedTokens(req, res))

	// Account operations
	router.get("/accounts/:clientId/:userId/:token/balance", (req, res) => proxifyController.getAccountBalance(req, res))
	router.get("/accounts/:clientId/:userId/:token/summary", (req, res) => proxifyController.getUserAccountSummary(req, res))
	router.get("/accounts/:clientId/:userId/:token/total-value", (req, res) => proxifyController.getTotalValue(req, res))
	router.get("/accounts/:clientId/:userId/:token/accrued-yield", (req, res) => proxifyController.getAccruedYield(req, res))

	// Tier-specific account operations
	router.get("/accounts/:clientId/:userId/:token/tiers", (req, res) => proxifyController.getUserActiveTiers(req, res))
	router.get("/accounts/:clientId/:userId/tiers/:tierId/:token", (req, res) => proxifyController.getTierAccount(req, res))
	router.get("/accounts/:clientId/:userId/tiers/:tierId/:token/value", (req, res) =>
		proxifyController.getTierValue(req, res),
	)

	// Vault information
	router.get("/vaults/:token/info", (req, res) => proxifyController.getVaultInfo(req, res))
	router.get("/vaults/:token/totals", (req, res) => proxifyController.getVaultTotals(req, res))
	router.get("/vaults/:token/index", (req, res) => proxifyController.getVaultIndex(req, res))
	router.get("/vaults/:token/index-with-timestamp", (req, res) => proxifyController.getVaultIndexWithTimestamp(req, res))
	router.get("/vaults/:token/contract-balance", (req, res) => proxifyController.getContractBalance(req, res))

	// Tier index operations
	router.get("/tiers/:token/:tierId/index", (req, res) => proxifyController.getTierIndex(req, res))
	router.get("/tiers/:token/:tierId/index-with-timestamp", (req, res) =>
		proxifyController.getTierIndexWithTimestamp(req, res),
	)
	router.get("/tiers/:token/:tierId/initialized", (req, res) => proxifyController.isTierInitialized(req, res))

	// Fee vault balances
	router.get("/vaults/:token/stakeable-balance", (req, res) => proxifyController.getStakeableBalance(req, res))
	router.get("/vaults/:token/operation-fee-balance", (req, res) =>
		proxifyController.getOperationFeeBalance(req, res),
	)
	router.get("/vaults/:token/protocol-revenue-balance", (req, res) =>
		proxifyController.getProtocolRevenueBalance(req, res),
	)
	router.get("/vaults/:token/client-revenues", (req, res) => proxifyController.getTotalClientRevenues(req, res))
	router.get("/vaults/:clientId/:token/client-revenue-balance", (req, res) =>
		proxifyController.getClientRevenueBalance(req, res),
	)

	// Safe operations
	router.get("/safe/:safeAddress/info", (req, res) => proxifyController.getSafeInfo(req, res))

	return router
}
