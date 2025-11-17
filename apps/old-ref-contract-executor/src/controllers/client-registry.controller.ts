import type { Request, Response } from "express"
import type { Address } from "viem"
import type { DIContainer } from "../di/container"

export class ClientRegistryController {
	constructor(private readonly container: DIContainer) {}

	// Write operations
	async registerClient(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, clientAddress, name, feeBps, serviceFeeBps, clientFeeBps } = req.body
			const result = await this.container.clientRegistryService.registerClient(chainId, {
				clientId,
				clientAddress,
				name,
				feeBps,
				serviceFeeBps,
				clientFeeBps,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to register client",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async activateClient(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, senderAddress } = req.body
			const result = await this.container.clientRegistryService.activateClient(chainId, {
				clientId,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to activate client",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async deactivateClient(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, senderAddress } = req.body
			const result = await this.container.clientRegistryService.deactivateClient(chainId, {
				clientId,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to deactivate client",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async updateClientAddress(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, newAddress, senderAddress } = req.body
			const result = await this.container.clientRegistryService.updateClientAddress(chainId, {
				clientId,
				newAddress,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to update client address",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async updateClientFees(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, feeBps, serviceFeeBps, senderAddress } = req.body
			const result = await this.container.clientRegistryService.updateClientFees(chainId, {
				clientId,
				feeBps,
				serviceFeeBps,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to update client fees",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async renounceRole(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { role, callerConfirmation, senderAddress } = req.body
			const result = await this.container.clientRegistryService.renounceRole(
				chainId,
				role,
				callerConfirmation,
				senderAddress,
			)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to renounce role",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Risk tier management
	async setClientRiskTiers(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, riskTiers, senderAddress } = req.body
			const result = await this.container.clientRegistryService.setClientRiskTiers(chainId, {
				clientId,
				riskTiers,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to set client risk tiers",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async addClientRiskTier(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, tier, senderAddress } = req.body
			const result = await this.container.clientRegistryService.addClientRiskTier(chainId, {
				clientId,
				tier,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to add client risk tier",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async updateTierAllocation(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, tierId, newAllocationBps, senderAddress } = req.body
			const result = await this.container.clientRegistryService.updateTierAllocation(chainId, {
				clientId,
				tierId,
				newAllocationBps,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to update tier allocation",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async setTierActive(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, tierId, isActive, senderAddress } = req.body
			const result = await this.container.clientRegistryService.setTierActive(chainId, {
				clientId,
				tierId,
				isActive,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to set tier active status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Read operations
	async isClientActive(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId } = req.params
			const isActive = await this.container.clientRegistryService.isClientActive(chainId, clientId)
			res.json({ success: true, data: { isActive } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check client active status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async isClientRegistered(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId } = req.params
			const isRegistered = await this.container.clientRegistryService.isClientRegistered(chainId, clientId)
			res.json({ success: true, data: { isRegistered } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check client registration status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getClientStatus(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId } = req.params
			const status = await this.container.clientRegistryService.getClientStatus(chainId, clientId)
			res.json({ success: true, data: status })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getClientInfo(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId } = req.params
			const info = await this.container.clientRegistryService.getClientInfo(chainId, clientId)
			res.json({ success: true, data: info })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client info",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getClientAddress(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId } = req.params
			const address = await this.container.clientRegistryService.getClientAddress(chainId, clientId)
			res.json({ success: true, data: { address } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client address",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getRoles(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const roles = await this.container.clientRegistryService.getRoles(chainId)
			res.json({ success: true, data: roles })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get roles",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getRoleAdmin(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, role } = req.params
			const admin = await this.container.clientRegistryService.getRoleAdmin(chainId, role)
			res.json({ success: true, data: { admin } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get role admin",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async hasRole(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, role, account } = req.params
			const hasRole = await this.container.clientRegistryService.hasRole(chainId, role, account as Address)
			res.json({ success: true, data: { hasRole } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check role",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Risk tier read operations
	async getClientRiskTiers(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId } = req.params
			const tiers = await this.container.clientRegistryService.getClientRiskTiers(chainId, clientId)
			res.json({ success: true, data: tiers })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client risk tiers",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getClientRiskTier(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId, tierId } = req.params
			const tier = await this.container.clientRegistryService.getClientRiskTier(chainId, clientId, tierId)
			res.json({ success: true, data: tier })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client risk tier",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async hasTier(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId, tierId } = req.params
			const hasTier = await this.container.clientRegistryService.hasTier(chainId, clientId, tierId)
			res.json({ success: true, data: { hasTier } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check tier existence",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async validateTierAllocations(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { tiers } = req.body
			const isValid = await this.container.clientRegistryService.validateTierAllocations(chainId, tiers)
			res.json({ success: true, data: { isValid } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to validate tier allocations",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}
}
