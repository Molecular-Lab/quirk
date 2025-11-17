import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { safeParse, ethereumTransactionParamsSchema } from "@proxify/core"
import { WalletTransactionService } from "../services/wallet-transaction.service"

/**
 * Wallet Transaction Controller
 * Handles HTTP requests for wallet transaction operations
 *
 * Endpoints:
 * - POST /send - Send a transaction
 * - POST /sign - Sign a transaction
 * - POST /rpc - Execute custom RPC call
 * - GET /status/:txHash/:chainId - Get transaction status
 * - POST /estimate-gas - Estimate gas for transaction
 * - GET /gas-price/:chainId - Get current gas price
 * - GET /history/:productId/:userId - Get transaction history
 * - GET /tx/:txHash - Get transaction by hash
 */
export class WalletTransactionController {
	constructor(private readonly walletTransactionService: WalletTransactionService) {}

	/**
	 * POST /send
	 * Send a transaction from embedded wallet
	 */
	public async sendTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			// Validate request body
			const bodySchema = z.object({
				productId: z.string().min(1, "productId is required"),
				userId: z.string().min(1, "userId is required"),
				walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
				transaction: ethereumTransactionParamsSchema,
			})

			const parsedBody = safeParse(bodySchema, req.body)
			if (!parsedBody.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request body",
					message: parsedBody.error.message,
				})
				return
			}

			const { productId, userId, walletAddress, transaction } = parsedBody.result

			// Send transaction
			const result = await this.walletTransactionService.sendTransaction({
				productId,
				userId,
				walletAddress,
				transaction,
			})

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] Send transaction failed:", error)
			next(error)
		}
	}

	/**
	 * POST /sign
	 * Sign a transaction without sending
	 */
	public async signTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			// Validate request body
			const bodySchema = z.object({
				walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
				transaction: ethereumTransactionParamsSchema,
			})

			const parsedBody = safeParse(bodySchema, req.body)
			if (!parsedBody.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request body",
					message: parsedBody.error.message,
				})
				return
			}

			const { walletAddress, transaction } = parsedBody.result

			// Sign transaction
			const result = await this.walletTransactionService.signTransaction({
				walletAddress,
				transaction,
			})

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] Sign transaction failed:", error)
			next(error)
		}
	}

	/**
	 * POST /rpc
	 * Execute custom RPC call
	 */
	public async executeRpc(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			// Validate request body
			const bodySchema = z.object({
				walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
				chainId: z.number().positive(),
				method: z.string().min(1, "RPC method is required"),
				params: z.array(z.any()),
			})

			const parsedBody = safeParse(bodySchema, req.body)
			if (!parsedBody.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request body",
					message: parsedBody.error.message,
				})
				return
			}

			const { walletAddress, chainId, method, params } = parsedBody.result

			// Execute RPC
			const result = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId,
				method,
				params,
			})

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] RPC execution failed:", error)
			next(error)
		}
	}

	/**
	 * GET /status/:txHash/:chainId
	 * Get transaction status
	 */
	public async getTransactionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { txHash, chainId } = req.params

			if (!txHash || !chainId) {
				res.status(400).json({
					success: false,
					error: "txHash and chainId are required",
				})
				return
			}

			const result = await this.walletTransactionService.getTransactionStatus({
				txHash,
				chainId: parseInt(chainId),
			})

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] Get transaction status failed:", error)
			next(error)
		}
	}

	/**
	 * POST /estimate-gas
	 * Estimate gas for transaction
	 */
	public async estimateGas(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			// Validate request body
			const parsedBody = safeParse(ethereumTransactionParamsSchema, req.body)
			if (!parsedBody.success) {
				res.status(400).json({
					success: false,
					error: "Invalid transaction parameters",
					message: parsedBody.error.message,
				})
				return
			}

			const result = await this.walletTransactionService.estimateGas(parsedBody.result)

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] Gas estimation failed:", error)
			next(error)
		}
	}

	/**
	 * GET /gas-price/:chainId
	 * Get current gas price
	 */
	public async getGasPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { chainId } = req.params

			if (!chainId) {
				res.status(400).json({
					success: false,
					error: "chainId is required",
				})
				return
			}

			const result = await this.walletTransactionService.getGasPrice(parseInt(chainId))

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] Get gas price failed:", error)
			next(error)
		}
	}

	/**
	 * GET /history/:productId/:userId
	 * Get transaction history for user
	 */
	public async getTransactionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { productId, userId } = req.params
			const { limit, offset } = req.query

			if (!productId || !userId) {
				res.status(400).json({
					success: false,
					error: "productId and userId are required",
				})
				return
			}

			const result = await this.walletTransactionService.getTransactionHistory({
				productId,
				userId,
				limit: limit ? parseInt(limit as string) : undefined,
				offset: offset ? parseInt(offset as string) : undefined,
			})

			res.status(200).json({
				success: true,
				data: {
					transactions: result,
					count: result.length,
				},
			})
		} catch (error) {
			console.error("[WalletTxController] Get transaction history failed:", error)
			next(error)
		}
	}

	/**
	 * GET /tx/:txHash
	 * Get transaction by hash
	 */
	public async getTransactionByHash(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { txHash } = req.params

			if (!txHash) {
				res.status(400).json({
					success: false,
					error: "txHash is required",
				})
				return
			}

			const result = await this.walletTransactionService.getTransactionByHash(txHash)

			if (!result) {
				res.status(404).json({
					success: false,
					error: "Transaction not found",
				})
				return
			}

			res.status(200).json({
				success: true,
				data: result,
			})
		} catch (error) {
			console.error("[WalletTxController] Get transaction by hash failed:", error)
			next(error)
		}
	}
}
