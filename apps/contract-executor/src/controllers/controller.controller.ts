import type { Request, Response } from "express"
import type { Address } from "viem"
import type { DIContainer } from "../di/container"

export class ControllerController {
	constructor(private readonly container: DIContainer) {}

	// Read operations
	async getRoles(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const roles = await this.container.controllerService.getRoles(chainId)
			res.json({ success: true, data: roles })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get roles",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async isProtocolWhitelisted(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, protocol } = req.params
			const status = await this.container.controllerService.isProtocolWhitelisted(chainId, protocol as Address)
			res.json({ success: true, data: status })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check protocol whitelist status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async isTokenSupported(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, token } = req.params
			const status = await this.container.controllerService.isTokenSupported(chainId, token as Address)
			res.json({ success: true, data: status })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check token support status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getPauseStatus(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const status = await this.container.controllerService.getPauseStatus(chainId)
			res.json({ success: true, data: status })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get pause status",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getProxifyAddress(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const address = await this.container.controllerService.getProxifyAddress(chainId)
			res.json({ success: true, data: { address } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get proxify address",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getRoleAdmin(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, role } = req.params
			const admin = await this.container.controllerService.getRoleAdmin(chainId, role)
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
			const hasRole = await this.container.controllerService.hasRole(chainId, role, account as Address)
			res.json({ success: true, data: { hasRole } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check role",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async supportedTokens(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, token } = req.params
			const supported = await this.container.controllerService.supportedTokens(chainId, token as Address)
			res.json({ success: true, data: { supported } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check supported tokens",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async whitelistedProtocols(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, protocol } = req.params
			const whitelisted = await this.container.controllerService.whitelistedProtocols(chainId, protocol as Address)
			res.json({ success: true, data: { whitelisted } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check whitelisted protocols",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async supportsInterface(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, interfaceId } = req.params
			const supports = await this.container.controllerService.supportsInterface(chainId, interfaceId)
			res.json({ success: true, data: { supports } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check interface support",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Tier protocol management - read
	async getTierProtocols(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, tierId } = req.params
			const protocols = await this.container.controllerService.getTierProtocols(chainId, tierId)
			res.json({ success: true, data: { protocols } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get tier protocols",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async isTierProtocol(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, tierId, protocol } = req.params
			const isTierProtocol = await this.container.controllerService.isTierProtocol(chainId, tierId, protocol as Address)
			res.json({ success: true, data: { isTierProtocol } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check tier protocol",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Balance methods
	async getOperationFeeBalance(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, token } = req.params
			const balance = await this.container.controllerService.getOperationFeeBalance(chainId, token as Address)
			res.json({ success: true, data: { balance: balance.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get operation fee balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getProtocolRevenueBalance(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, token } = req.params
			const balance = await this.container.controllerService.getProtocolRevenueBalance(chainId, token as Address)
			res.json({ success: true, data: { balance: balance.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get protocol revenue balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getClientRevenueBalance(req: Request, res: Response): Promise<void> {
		try {
			const { chainId, clientId, token } = req.params
			const balance = await this.container.controllerService.getClientRevenueBalance(chainId, clientId, token as Address)
			res.json({ success: true, data: { balance: balance.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client revenue balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Write operations
	async addSupportedToken(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, senderAddress } = req.body
			const result = await this.container.controllerService.addSupportedToken(chainId, token, senderAddress)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to add supported token",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async removeSupportedToken(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, senderAddress } = req.body
			const result = await this.container.controllerService.removeSupportedToken(chainId, token, senderAddress)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to remove supported token",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async addWhitelistedProtocol(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { protocol, senderAddress } = req.body
			const result = await this.container.controllerService.addWhitelistedProtocol(chainId, protocol, senderAddress)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to add whitelisted protocol",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async removeWhitelistedProtocol(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { protocol, senderAddress } = req.body
			const result = await this.container.controllerService.removeWhitelistedProtocol(chainId, protocol, senderAddress)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to remove whitelisted protocol",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async executeTransfer(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, protocol, amount, tierId, tierName } = req.body
			const result = await this.container.controllerService.executeTransfer(chainId, { token, protocol, amount, tierId, tierName })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to execute transfer",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async confirmUnstake(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, amount } = req.body
			const result = await this.container.controllerService.confirmUnstake(chainId, token, amount)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to confirm unstake",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Tier index management
	async updateTierIndex(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, tierId, newIndex } = req.body
			const result = await this.container.controllerService.updateTierIndex(chainId, { token, tierId, newIndex })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to update tier index",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async batchUpdateTierIndices(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, tierIds, newIndices } = req.body
			const result = await this.container.controllerService.batchUpdateTierIndices(chainId, { token, tierIds, newIndices })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to batch update tier indices",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async initializeTier(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, tierId } = req.body
			const result = await this.container.controllerService.initializeTier(chainId, { token, tierId })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to initialize tier",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async batchInitializeTiers(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, tierIds } = req.body
			const result = await this.container.controllerService.batchInitializeTiers(chainId, { token, tierIds })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to batch initialize tiers",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Tier protocol assignment
	async assignProtocolToTier(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { tierId, protocol, senderAddress } = req.body
			const result = await this.container.controllerService.assignProtocolToTier(chainId, { tierId, protocol, senderAddress })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to assign protocol to tier",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async removeProtocolFromTier(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { tierId, protocol, senderAddress } = req.body
			const result = await this.container.controllerService.removeProtocolFromTier(chainId, { tierId, protocol, senderAddress })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to remove protocol from tier",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Revenue claiming
	async claimOperationFee(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, to, amount } = req.body
			const result = await this.container.controllerService.claimOperationFee(chainId, { token, to, amount })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to claim operation fee",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async claimProtocolRevenue(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { token, to, amount } = req.body
			const result = await this.container.controllerService.claimProtocolRevenue(chainId, { token, to, amount })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to claim protocol revenue",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async claimClientRevenue(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, token, to, amount } = req.body
			const result = await this.container.controllerService.claimClientRevenue(chainId, { clientId, token, to, amount })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to claim client revenue",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Batch withdrawal
	async batchWithdraw(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { executions } = req.body
			const result = await this.container.controllerService.batchWithdraw(chainId, { executions })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to execute batch withdrawal",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async withdraw(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { clientId, userId, token, amount, to } = req.body
			const result = await this.container.controllerService.withdraw(chainId, { clientId, userId, token, amount, to })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to withdraw",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async emergencyPause(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const result = await this.container.controllerService.emergencyPause(chainId)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to emergency pause",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async unpause(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { senderAddress } = req.body
			const result = await this.container.controllerService.unpause(chainId, senderAddress)
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to unpause",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async grantRole(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { role, account, senderAddress } = req.body
			const result = await this.container.controllerService.grantRole(chainId, { role, account, senderAddress })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to grant role",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async revokeRole(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { role, account, senderAddress } = req.body
			const result = await this.container.controllerService.revokeRole(chainId, { role, account, senderAddress })
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to revoke role",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async renounceRole(req: Request, res: Response): Promise<void> {
		try {
			const { chainId } = req.params
			const { role, callerConfirmation, senderAddress } = req.body
			const result = await this.container.controllerService.renounceRole(chainId, {
				role,
				callerConfirmation,
				senderAddress,
			})
			res.json(result)
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to renounce role",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}
}
