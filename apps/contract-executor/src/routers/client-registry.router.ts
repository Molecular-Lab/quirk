import { Router } from "express"
import { ClientRegistryController } from "../controllers/client-registry.controller"
import type { DIContainer } from "../di/container"

export function createClientRegistryRouter(container: DIContainer): Router {
	const router = Router()
	const clientRegistryController = new ClientRegistryController(container)

	// Write operations
	router.post("/:chainId/clients", (req, res) => clientRegistryController.registerClient(req, res))
	router.post("/:chainId/clients/:clientId/activate", (req, res) => clientRegistryController.activateClient(req, res))
	router.post("/:chainId/clients/:clientId/deactivate", (req, res) =>
		clientRegistryController.deactivateClient(req, res),
	)
	router.put("/:chainId/clients/:clientId/address", (req, res) =>
		clientRegistryController.updateClientAddress(req, res),
	)
	router.put("/:chainId/clients/:clientId/fees", (req, res) => clientRegistryController.updateClientFees(req, res))
	router.post("/:chainId/roles/renounce", (req, res) => clientRegistryController.renounceRole(req, res))

	// Risk tier management
	router.post("/:chainId/clients/:clientId/risk-tiers", (req, res) =>
		clientRegistryController.setClientRiskTiers(req, res),
	)
	router.post("/:chainId/clients/:clientId/risk-tiers/add", (req, res) =>
		clientRegistryController.addClientRiskTier(req, res),
	)
	router.put("/:chainId/clients/:clientId/risk-tiers/:tierId/allocation", (req, res) =>
		clientRegistryController.updateTierAllocation(req, res),
	)
	router.put("/:chainId/clients/:clientId/risk-tiers/:tierId/active", (req, res) =>
		clientRegistryController.setTierActive(req, res),
	)

	// Read operations
	router.get("/:chainId/clients/:clientId/active", (req, res) => clientRegistryController.isClientActive(req, res))
	router.get("/:chainId/clients/:clientId/registered", (req, res) =>
		clientRegistryController.isClientRegistered(req, res),
	)
	router.get("/:chainId/clients/:clientId/status", (req, res) => clientRegistryController.getClientStatus(req, res))
	router.get("/:chainId/clients/:clientId/info", (req, res) => clientRegistryController.getClientInfo(req, res))
	router.get("/:chainId/clients/:clientId/address", (req, res) => clientRegistryController.getClientAddress(req, res))
	router.get("/:chainId/roles", (req, res) => clientRegistryController.getRoles(req, res))
	router.get("/:chainId/roles/:role/admin", (req, res) => clientRegistryController.getRoleAdmin(req, res))
	router.get("/:chainId/roles/:role/:account/has-role", (req, res) => clientRegistryController.hasRole(req, res))

	// Risk tier read operations
	router.get("/:chainId/clients/:clientId/risk-tiers", (req, res) =>
		clientRegistryController.getClientRiskTiers(req, res),
	)
	router.get("/:chainId/clients/:clientId/risk-tiers/:tierId", (req, res) =>
		clientRegistryController.getClientRiskTier(req, res),
	)
	router.get("/:chainId/clients/:clientId/risk-tiers/:tierId/exists", (req, res) =>
		clientRegistryController.hasTier(req, res),
	)
	router.post("/:chainId/risk-tiers/validate", (req, res) =>
		clientRegistryController.validateTierAllocations(req, res),
	)

	return router
}
