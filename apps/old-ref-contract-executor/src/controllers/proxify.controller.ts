import type { Request, Response } from "express"
import type { Address } from "viem"
import type { DIContainer } from "../di/container"

export class ProxifyController {
	constructor(private readonly container: DIContainer) {}

	// Contract addresses
	async getController(req: Request, res: Response): Promise<void> {
		try {
			const address = await this.container.proxifyService.getController()
			res.json({ success: true, data: { address } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get controller address",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getClientRegistry(req: Request, res: Response): Promise<void> {
		try {
			const address = await this.container.proxifyService.getClientRegistry()
			res.json({ success: true, data: { address } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client registry address",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Token support
	async isSupportedToken(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const isSupported = await this.container.proxifyService.isSupportedToken(token as Address)
			res.json({ success: true, data: { isSupported } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check token support",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async supportedTokens(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const supported = await this.container.proxifyService.supportedTokens(token as Address)
			res.json({ success: true, data: { supported } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check supported tokens",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Account operations
	async getAccountBalance(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, token } = req.params
			const balance = await this.container.proxifyService.getAccountBalance(clientId, userId, token as Address)
			res.json({ success: true, data: balance })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get account balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getUserAccountSummary(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, token } = req.params
			const summary = await this.container.proxifyService.getUserAccountSummary(clientId, userId, token as Address)
			res.json({ success: true, data: summary })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get user account summary",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getTotalValue(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, token } = req.params
			const totalValue = await this.container.proxifyService.getTotalValue(clientId, userId, token as Address)
			res.json({ success: true, data: { totalValue: totalValue.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get total value",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getAccruedYield(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, token } = req.params
			const accruedYield = await this.container.proxifyService.getAccruedYield(clientId, userId, token as Address)
			res.json({ success: true, data: { accruedYield: accruedYield.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get accrued yield",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Vault information
	async getVaultInfo(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const vaultInfo = await this.container.proxifyService.getVaultInfo(token as Address)
			res.json({ success: true, data: vaultInfo })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get vault info",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getVaultTotals(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const totals = await this.container.proxifyService.getVaultTotals(token as Address)
			res.json({ success: true, data: totals })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get vault totals",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getVaultIndex(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const index = await this.container.proxifyService.getVaultIndex(token as Address)
			res.json({ success: true, data: { index: index.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get vault index",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getVaultIndexWithTimestamp(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const indexInfo = await this.container.proxifyService.getVaultIndexWithTimestamp(token as Address)
			res.json({ success: true, data: indexInfo })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get vault index with timestamp",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getContractBalance(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const balance = await this.container.proxifyService.getContractBalance(token as Address)
			res.json({ success: true, data: { balance: balance.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get contract balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Tier-specific account operations
	async getTierAccount(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, tierId, token } = req.params
			const tierAccount = await this.container.proxifyService.getTierAccount(
				clientId,
				userId,
				tierId,
				token as Address,
			)
			res.json({ success: true, data: tierAccount })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get tier account",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getUserActiveTiers(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, token } = req.params
			const tiers = await this.container.proxifyService.getUserActiveTiers(clientId, userId, token as Address)
			res.json({ success: true, data: { tiers } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get user active tiers",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getTierValue(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, userId, tierId, token } = req.params
			const value = await this.container.proxifyService.getTierValue(
				clientId,
				userId,
				tierId,
				token as Address,
			)
			res.json({ success: true, data: { value: value.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get tier value",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Tier index operations
	async getTierIndex(req: Request, res: Response): Promise<void> {
		try {
			const { token, tierId } = req.params
			const index = await this.container.proxifyService.getTierIndex(token as Address, tierId)
			res.json({ success: true, data: { index: index.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get tier index",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getTierIndexWithTimestamp(req: Request, res: Response): Promise<void> {
		try {
			const { token, tierId } = req.params
			const indexInfo = await this.container.proxifyService.getTierIndexWithTimestamp(token as Address, tierId)
			res.json({ success: true, data: indexInfo })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get tier index with timestamp",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async isTierInitialized(req: Request, res: Response): Promise<void> {
		try {
			const { token, tierId } = req.params
			const initialized = await this.container.proxifyService.isTierInitialized(token as Address, tierId)
			res.json({ success: true, data: { initialized } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to check tier initialization",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Fee vault balances
	async getStakeableBalance(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const balance = await this.container.proxifyService.getStakeableBalance(token as Address)
			res.json({ success: true, data: { balance: balance.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get stakeable balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getOperationFeeBalance(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const balance = await this.container.proxifyService.getOperationFeeBalance(token as Address)
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
			const { token } = req.params
			const balance = await this.container.proxifyService.getProtocolRevenueBalance(token as Address)
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
			const { clientId, token } = req.params
			const balance = await this.container.proxifyService.getClientRevenueBalance(clientId, token as Address)
			res.json({ success: true, data: { balance: balance.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get client revenue balance",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	async getTotalClientRevenues(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.params
			const total = await this.container.proxifyService.getTotalClientRevenues(token as Address)
			res.json({ success: true, data: { total: total.toString() } })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get total client revenues",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	// Safe operations
	async getSafeInfo(req: Request, res: Response): Promise<void> {
		try {
			const { safeAddress } = req.params
			const safeInfo = await this.container.proxifyService.getSafeInfo(safeAddress as Address)
			res.json({ success: true, data: safeInfo })
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Failed to get Safe info",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}
}
