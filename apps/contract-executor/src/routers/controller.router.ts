import { Router } from "express"
import { ControllerController } from "../controllers/controller.controller"
import type { DIContainer } from "../di/container"

export function createControllerRouter(container: DIContainer): Router {
	const router = Router()
	const controllerController = new ControllerController(container)

	// Read operations
	router.get("/:chainId/roles", (req, res) => controllerController.getRoles(req, res))
	router.get("/:chainId/protocols/:protocol/whitelisted", (req, res) =>
		controllerController.isProtocolWhitelisted(req, res),
	)
	router.get("/:chainId/tokens/:token/supported", (req, res) => controllerController.isTokenSupported(req, res))
	router.get("/:chainId/paused", (req, res) => controllerController.getPauseStatus(req, res))
	router.get("/:chainId/proxify-address", (req, res) => controllerController.getProxifyAddress(req, res))
	router.get("/:chainId/roles/:role/admin", (req, res) => controllerController.getRoleAdmin(req, res))
	router.get("/:chainId/roles/:role/:account/has-role", (req, res) => controllerController.hasRole(req, res))
	router.get("/:chainId/tokens/:token/supported-alt", (req, res) => controllerController.supportedTokens(req, res))
	router.get("/:chainId/protocols/:protocol/whitelisted-alt", (req, res) =>
		controllerController.whitelistedProtocols(req, res),
	)
	router.get("/:chainId/interfaces/:interfaceId/supported", (req, res) =>
		controllerController.supportsInterface(req, res),
	)

	// Tier protocol management - read
	router.get("/:chainId/tiers/:tierId/protocols", (req, res) => controllerController.getTierProtocols(req, res))
	router.get("/:chainId/tiers/:tierId/protocols/:protocol/check", (req, res) =>
		controllerController.isTierProtocol(req, res),
	)

	// Balance endpoints
	router.get("/:chainId/balances/operation-fee/:token", (req, res) =>
		controllerController.getOperationFeeBalance(req, res),
	)
	router.get("/:chainId/balances/protocol-revenue/:token", (req, res) =>
		controllerController.getProtocolRevenueBalance(req, res),
	)
	router.get("/:chainId/balances/client-revenue/:clientId/:token", (req, res) =>
		controllerController.getClientRevenueBalance(req, res),
	)

	// Write operations
	router.post("/:chainId/tokens/supported", (req, res) => controllerController.addSupportedToken(req, res))
	router.delete("/:chainId/tokens/supported", (req, res) => controllerController.removeSupportedToken(req, res))
	router.post("/:chainId/protocols/whitelisted", (req, res) => controllerController.addWhitelistedProtocol(req, res))
	router.delete("/:chainId/protocols/whitelisted", (req, res) =>
		controllerController.removeWhitelistedProtocol(req, res),
	)
	router.post("/:chainId/transfers", (req, res) => controllerController.executeTransfer(req, res))
	router.post("/:chainId/unstake/confirm", (req, res) => controllerController.confirmUnstake(req, res))

	// Tier index management
	router.post("/:chainId/tiers/index", (req, res) => controllerController.updateTierIndex(req, res))
	router.post("/:chainId/tiers/indices/batch", (req, res) => controllerController.batchUpdateTierIndices(req, res))
	router.post("/:chainId/tiers/initialize", (req, res) => controllerController.initializeTier(req, res))
	router.post("/:chainId/tiers/initialize/batch", (req, res) => controllerController.batchInitializeTiers(req, res))

	// Tier protocol assignment
	router.post("/:chainId/tiers/protocols/assign", (req, res) => controllerController.assignProtocolToTier(req, res))
	router.delete("/:chainId/tiers/protocols/remove", (req, res) => controllerController.removeProtocolFromTier(req, res))

	// Revenue claiming
	router.post("/:chainId/claim/operation-fee", (req, res) => controllerController.claimOperationFee(req, res))
	router.post("/:chainId/claim/protocol-revenue", (req, res) => controllerController.claimProtocolRevenue(req, res))
	router.post("/:chainId/claim/client-revenue", (req, res) => controllerController.claimClientRevenue(req, res))

	// Batch withdrawal
	router.post("/:chainId/withdrawals/batch", (req, res) => controllerController.batchWithdraw(req, res))

	// Legacy withdrawal (deprecated)
	router.post("/:chainId/withdrawals", (req, res) => controllerController.withdraw(req, res))
	router.post("/:chainId/emergency-pause", (req, res) => controllerController.emergencyPause(req, res))
	router.post("/:chainId/unpause", (req, res) => controllerController.unpause(req, res))
	router.post("/:chainId/roles/grant", (req, res) => controllerController.grantRole(req, res))
	router.post("/:chainId/roles/revoke", (req, res) => controllerController.revokeRole(req, res))
	router.post("/:chainId/roles/renounce", (req, res) => controllerController.renounceRole(req, res))

	return router
}
