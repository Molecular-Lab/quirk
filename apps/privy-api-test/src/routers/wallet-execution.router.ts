import { Router } from "express"
import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import dayjs from "dayjs"
import { safeParse } from "@proxify/core"
import { WalletTransactionService } from "../services/wallet-transaction.service"

/**
 * ERC20 Token ABI - Standard functions
 */
const ERC20_ABI = {
	TRANSFER: "0xa9059cbb", // transfer(address,uint256)
	BALANCE_OF: "0x70a08231", // balanceOf(address)
	DECIMALS: "0x313ce567", // decimals()
	SYMBOL: "0x95d89b41", // symbol()
	NAME: "0x06fdde03", // name()
}

/**
 * Supported chains configuration
 */
interface ChainConfig {
	chainId: number
	name: string
	nativeToken: {
		symbol: string
		name: string
		decimals: number
	}
}

const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
	1: {
		chainId: 1,
		name: "Ethereum Mainnet",
		nativeToken: { symbol: "ETH", name: "Ethereum", decimals: 18 },
	},
	11155111: {
		chainId: 11155111,
		name: "Sepolia Testnet",
		nativeToken: { symbol: "ETH", name: "Ethereum", decimals: 18 },
	},
	137: {
		chainId: 137,
		name: "Polygon",
		nativeToken: { symbol: "MATIC", name: "Polygon", decimals: 18 },
	},
	56: {
		chainId: 56,
		name: "BSC",
		nativeToken: { symbol: "BNB", name: "Binance Coin", decimals: 18 },
	},
	42161: {
		chainId: 42161,
		name: "Arbitrum One",
		nativeToken: { symbol: "ETH", name: "Ethereum", decimals: 18 },
	},
	10: {
		chainId: 10,
		name: "Optimism",
		nativeToken: { symbol: "ETH", name: "Ethereum", decimals: 18 },
	},
	8453: {
		chainId: 8453,
		name: "Base",
		nativeToken: { symbol: "ETH", name: "Ethereum", decimals: 18 },
	},
}

/**
 * Supported Stablecoins Configuration
 * Phase 1: Focus on USDT and USDC only
 */
interface StablecoinConfig {
	symbol: string
	name: string
	decimals: number
	addresses: {
		[chainId: number]: string
	}
}

const SUPPORTED_STABLECOINS: Record<string, StablecoinConfig> = {
	USDT: {
		symbol: "USDT",
		name: "Tether USD",
		decimals: 6,
		addresses: {
			1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
			11155111: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // Sepolia Testnet
			137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
			56: "0x55d398326f99059fF775485246999027B3197955", // BSC
			42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum
			10: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // Optimism
			8453: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", // Base
		},
	},
	USDC: {
		symbol: "USDC",
		name: "USD Coin",
		decimals: 6,
		addresses: {
			1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet
			11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia Testnet
			137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
			56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // BSC
			42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
			10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism
			8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
		},
	},
}

/**
 * Native token constants
 */
const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"
const NATIVE_TOKEN_ALIASES = ["0x0000000000000000000000000000000000000000", "0x0", "native", "eth"]

/**
 * Wallet Execution Controller
 * Phase 1: Focused on native ETH and stablecoins (USDT, USDC)
 */
class WalletExecutionController {
	constructor(private readonly walletTransactionService: WalletTransactionService) {}

	/**
	 * Check if token address represents native token (ETH)
	 */
	private isNativeToken(tokenAddress: string | undefined): boolean {
		if (!tokenAddress) return true
		const normalized = tokenAddress.toLowerCase()
		return NATIVE_TOKEN_ALIASES.some((alias) => alias.toLowerCase() === normalized)
	}

	/**
	 * Get stablecoin config by address
	 */
	private getStablecoinByAddress(tokenAddress: string, chainId: number): StablecoinConfig | null {
		const normalized = tokenAddress.toLowerCase()
		for (const config of Object.values(SUPPORTED_STABLECOINS)) {
			const addressForChain = config.addresses[chainId]
			if (addressForChain && addressForChain.toLowerCase() === normalized) {
				return config
			}
		}
		return null
	}

	/**
	 * Get stablecoin config by symbol
	 */
	private getStablecoinBySymbol(symbol: string): StablecoinConfig | null {
		const normalized = symbol.toUpperCase()
		return SUPPORTED_STABLECOINS[normalized] || null
	}

	/**
	 * Validate stablecoin support
	 */
	private validateStablecoin(tokenAddress: string, chainId: number): { valid: boolean; config?: StablecoinConfig; error?: string } {
		const config = this.getStablecoinByAddress(tokenAddress, chainId)
		if (!config) {
			return {
				valid: false,
				error: `Unsupported token. Only USDT and USDC are supported in this phase. Token: ${tokenAddress}`,
			}
		}

		if (!config.addresses[chainId]) {
			return {
				valid: false,
				error: `${config.symbol} is not deployed on chain ${chainId}`,
			}
		}

		return { valid: true, config }
	}

	/**
	 * POST /transfer
	 * Universal transfer - native ETH or stablecoins (USDT/USDC)
	 */
	public async transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const bodySchema = z.object({
				productId: z.string().min(1),
				userId: z.string().min(1),
				sender: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
				receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
				amount: z.string().min(1), // For stablecoins: raw units (e.g., "1000000" = 1 USDC/USDT)
				tokenAddress: z.string().optional(), // Omit for ETH, provide stablecoin address
				chainId: z.number().positive(),
				gas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
				maxFeePerGas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
				maxPriorityFeePerGas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
			})

			const parsed = safeParse(bodySchema, req.body)
			if (!parsed.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request",
					message: parsed.error.message,
				})
				return
			}

			const { productId, userId, sender, receiver, amount, tokenAddress, chainId, gas, maxFeePerGas, maxPriorityFeePerGas } =
				parsed.result

			const isNative = this.isNativeToken(tokenAddress)

			let result: any

			if (isNative) {
				// Native ETH transfer
				const hexAmount = amount.startsWith("0x") ? amount : `0x${BigInt(amount).toString(16)}`

				result = await this.walletTransactionService.sendTransaction({
					productId,
					userId,
					walletAddress: sender,
					transaction: {
						from: sender,
						to: receiver,
						value: hexAmount,
						chainId,
						gas,
						maxFeePerGas,
						maxPriorityFeePerGas,
					},
				})

				res.status(200).json({
					success: true,
					message: "Native ETH transfer sent",
					data: {
						...result,
						tokenType: "native",
						token: "ETH",
						sender,
						receiver,
						amount,
					},
				})
			} else {
				// Stablecoin transfer (USDT/USDC)
				const validation = this.validateStablecoin(tokenAddress!, chainId)
				if (!validation.valid) {
					res.status(400).json({
						success: false,
						error: "Unsupported token",
						message: validation.error,
					})
					return
				}

				const stablecoin = validation.config!

				// Encode ERC20 transfer: transfer(address to, uint256 amount)
				const encodedData = this.encodeERC20Transfer(receiver, amount)

				result = await this.walletTransactionService.sendTransaction({
					productId,
					userId,
					walletAddress: sender,
					transaction: {
						from: sender,
						to: tokenAddress!,
						value: "0x0",
						data: encodedData,
						chainId,
						gas,
						maxFeePerGas,
						maxPriorityFeePerGas,
					},
				})

				res.status(200).json({
					success: true,
					message: `${stablecoin.symbol} transfer sent`,
					data: {
						...result,
						tokenType: "stablecoin",
						token: {
							address: tokenAddress,
							symbol: stablecoin.symbol,
							name: stablecoin.name,
							decimals: stablecoin.decimals,
						},
						sender,
						receiver,
						amount,
						amountFormatted: this.formatStablecoinAmount(amount, stablecoin.decimals),
					},
				})
			}
		} catch (error) {
			console.error("[WalletExecution] Transfer failed:", error)
			next(error)
		}
	}

	/**
	 * Helper: Format stablecoin amount for display
	 */
	private formatStablecoinAmount(rawAmount: string, decimals: number): string {
		const amount = BigInt(rawAmount)
		const divisor = BigInt(10 ** decimals)
		const wholePart = amount / divisor
		const fractionalPart = amount % divisor
		const fractionalStr = fractionalPart.toString().padStart(decimals, "0")
		return `${wholePart}.${fractionalStr}`
	}

	/**
	 * POST /execute
	 * Generic execute endpoint for any transaction
	 * Automatically detects token type and executes appropriately
	 */
	public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const bodySchema = z.object({
				productId: z.string().min(1),
				userId: z.string().min(1),
				sender: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
				receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
				amount: z.string().min(1),
				tokenAddress: z.string().optional(),
				chainId: z.number().positive(),
				data: z.string().optional(), // Custom contract data (for advanced usage)
				gas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
				maxFeePerGas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
				maxPriorityFeePerGas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
			})

			const parsed = safeParse(bodySchema, req.body)
			if (!parsed.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request",
					message: parsed.error.message,
				})
				return
			}

			const {
				productId,
				userId,
				sender,
				receiver,
				amount,
				tokenAddress,
				chainId,
				data,
				gas,
				maxFeePerGas,
				maxPriorityFeePerGas,
			} = parsed.result

			const isNative = this.isNativeToken(tokenAddress)
			const hexAmount = amount.startsWith("0x") ? amount : `0x${BigInt(amount).toString(16)}`

			let transactionData: string | undefined = data

			// If no custom data provided and it's ERC20, encode transfer
			if (!data && !isNative && tokenAddress) {
				transactionData = this.encodeERC20Transfer(receiver, amount)
			}

			const result = await this.walletTransactionService.sendTransaction({
				productId,
				userId,
				walletAddress: sender,
				transaction: {
					from: sender,
					to: isNative ? receiver : tokenAddress!,
					value: isNative ? hexAmount : "0x0",
					data: transactionData,
					chainId,
					gas,
					maxFeePerGas,
					maxPriorityFeePerGas,
				},
			})

			res.status(200).json({
				success: true,
				message: "Transaction executed",
				data: {
					...result,
					tokenType: isNative ? "native" : "erc20",
					tokenAddress: isNative ? NATIVE_TOKEN_ADDRESS : tokenAddress,
					sender,
					receiver,
					amount,
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Execute failed:", error)
			next(error)
		}
	}

	/**
	 * POST /deposit
	 * Deposit tokens (native or ERC20) to wallet
	 */
	public async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const bodySchema = z.object({
				productId: z.string().min(1),
				userId: z.string().min(1),
				receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/), // Custodial wallet receiving deposit
				amount: z.string().min(1),
				tokenAddress: z.string().optional(),
				chainId: z.number().positive(),
				sender: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(), // External depositor (optional)
			})

			const parsed = safeParse(bodySchema, req.body)
			if (!parsed.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request",
					message: parsed.error.message,
				})
				return
			}

			const { productId, userId, receiver, amount, tokenAddress, chainId, sender } = parsed.result

			const isNative = this.isNativeToken(tokenAddress)
			const tokenType = isNative ? "native" : "erc20"

			// For deposit, we provide instructions
			res.status(200).json({
				success: true,
				message: "Deposit instructions",
				data: {
					depositAddress: receiver,
					tokenType,
					tokenAddress: isNative ? NATIVE_TOKEN_ADDRESS : tokenAddress,
					amount,
					chainId,
					instruction: isNative
						? `Send ${amount} wei (or decimal amount) of native token to ${receiver} on chain ${chainId}`
						: `Send ${amount} units of token ${tokenAddress} to ${receiver} on chain ${chainId}`,
					note: "This is a custodial wallet. Funds sent to this address are managed by Privy.",
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Deposit failed:", error)
			next(error)
		}
	}

	/**
	 * POST /withdraw
	 * Withdraw ETH or stablecoins (USDT/USDC) from wallet
	 */
	public async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const bodySchema = z.object({
				productId: z.string().min(1),
				userId: z.string().min(1),
				sender: z.string().regex(/^0x[a-fA-F0-9]{40}$/), // Wallet withdrawing from
				receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/), // External address receiving
				amount: z.string().min(1),
				tokenAddress: z.string().optional(), // Omit for ETH, provide for stablecoin
				chainId: z.number().positive(),
				gas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
				maxFeePerGas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
				maxPriorityFeePerGas: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
			})

			const parsed = safeParse(bodySchema, req.body)
			if (!parsed.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request",
					message: parsed.error.message,
				})
				return
			}

			const { productId, userId, sender, receiver, amount, tokenAddress, chainId, gas, maxFeePerGas, maxPriorityFeePerGas } =
				parsed.result

			const isNative = this.isNativeToken(tokenAddress)

			if (isNative) {
				// Native ETH withdrawal
				const hexAmount = amount.startsWith("0x") ? amount : `0x${BigInt(amount).toString(16)}`

				const result = await this.walletTransactionService.sendTransaction({
					productId,
					userId,
					walletAddress: sender,
					transaction: {
						from: sender,
						to: receiver,
						value: hexAmount,
						chainId,
						gas,
						maxFeePerGas,
						maxPriorityFeePerGas,
					},
				})

				res.status(200).json({
					success: true,
					message: "ETH withdrawal sent",
					data: {
						...result,
						tokenType: "native",
						token: "ETH",
						sender,
						receiver,
						amount: hexAmount,
					},
				})
			} else {
				// Stablecoin withdrawal (USDT/USDC)
				const validation = this.validateStablecoin(tokenAddress!, chainId)
				if (!validation.valid) {
					res.status(400).json({
						success: false,
						error: "Unsupported token",
						message: validation.error,
					})
					return
				}

				const stablecoin = validation.config!

				const encodedData = this.encodeERC20Transfer(receiver, amount)

				const result = await this.walletTransactionService.sendTransaction({
					productId,
					userId,
					walletAddress: sender,
					transaction: {
						from: sender,
						to: tokenAddress!,
						value: "0x0",
						data: encodedData,
						chainId,
						gas,
						maxFeePerGas,
						maxPriorityFeePerGas,
					},
				})

				res.status(200).json({
					success: true,
					message: `${stablecoin.symbol} withdrawal sent`,
					data: {
						...result,
						tokenType: "stablecoin",
						token: {
							address: tokenAddress,
							symbol: stablecoin.symbol,
							name: stablecoin.name,
							decimals: stablecoin.decimals,
						},
						sender,
						receiver,
						amount,
						amountFormatted: this.formatStablecoinAmount(amount, stablecoin.decimals),
					},
				})
			}
		} catch (error) {
			console.error("[WalletExecution] Withdraw failed:", error)
			next(error)
		}
	}

	/**
	 * POST /balance
	 * Get token balance (native or ERC20) dynamically
	 */
	public async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const bodySchema = z.object({
				walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
				tokenAddress: z.string().optional(),
				chainId: z.number().positive(),
			})

			const parsed = safeParse(bodySchema, req.body)
			if (!parsed.success) {
				res.status(400).json({
					success: false,
					error: "Invalid request",
					message: parsed.error.message,
				})
				return
			}

			const { walletAddress, tokenAddress, chainId } = parsed.result

			const isNative = this.isNativeToken(tokenAddress)

			if (isNative) {
				// Get native ETH balance
				const balance = await this.walletTransactionService.executeRpc({
					walletAddress,
					chainId,
					method: "eth_getBalance",
					params: [walletAddress, "latest"],
				})

				res.status(200).json({
					success: true,
					data: {
						walletAddress,
						tokenType: "native",
						token: "ETH",
						tokenAddress: NATIVE_TOKEN_ADDRESS,
						chainId,
						balance,
						balanceWei: balance,
						balanceEth: this.weiToEth(balance),
					},
				})
			} else {
				// Validate stablecoin
				const validation = this.validateStablecoin(tokenAddress!, chainId)
				if (!validation.valid) {
					res.status(400).json({
						success: false,
						error: "Unsupported token",
						message: validation.error,
					})
					return
				}

				const stablecoin = validation.config!

				// Get stablecoin balance
				const data = this.encodeBalanceOf(walletAddress)

				const balance = await this.walletTransactionService.executeRpc({
					walletAddress,
					chainId,
					method: "eth_call",
					params: [
						{
							to: tokenAddress,
							data,
						},
						"latest",
					],
				})

				res.status(200).json({
					success: true,
					data: {
						walletAddress,
						tokenType: "stablecoin",
						tokenAddress,
						chainId,
						balance,
						balanceRaw: balance,
						balanceFormatted: this.formatStablecoinAmount(balance, stablecoin.decimals),
						token: {
							address: tokenAddress,
							symbol: stablecoin.symbol,
							name: stablecoin.name,
							decimals: stablecoin.decimals,
						},
					},
				})
			}
		} catch (error) {
			console.error("[WalletExecution] Get balance failed:", error)
			next(error)
		}
	}

	/**
	 * GET /stats/:walletAddress/:chainId
	 * Get comprehensive wallet portfolio stats
	 * Returns all balances (ETH + stablecoins) + DeFi positions (staked, lending, etc.)
	 */
	public async getWalletStats(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { walletAddress, chainId } = req.params

			// Validate inputs
			if (!walletAddress || !chainId) {
				res.status(400).json({
					success: false,
					error: "walletAddress and chainId are required",
				})
				return
			}

			if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
				res.status(400).json({
					success: false,
					error: "Invalid wallet address format",
				})
				return
			}

			const chainIdNum = parseInt(chainId)

			// 1. Get native ETH balance
			const ethBalance = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId: chainIdNum,
				method: "eth_getBalance",
				params: [walletAddress, "latest"],
			})

			const ethBalanceFormatted = this.weiToEth(ethBalance)

			// 2. Get all supported stablecoin balances for this chain
			const stablecoinBalances = await this.getAllStablecoinBalances(walletAddress, chainIdNum)

			// 3. Calculate total portfolio value (placeholder - would use price oracle)
			const totalValueUSD = this.calculateTotalValueUSD(ethBalanceFormatted, stablecoinBalances)

			// 4. Get DeFi positions (PLACEHOLDER - will integrate with DeFi protocols)
			const defiPositions = await this.getDeFiPositions(walletAddress, chainIdNum)

			// 5. Aggregate response
			res.status(200).json({
				success: true,
				data: {
					walletAddress,
					chainId: chainIdNum,
					timestamp: dayjs().toISOString(),
					balances: {
						native: {
							token: "ETH",
							balance: ethBalance,
							balanceWei: ethBalance,
							balanceFormatted: ethBalanceFormatted,
							valueUSD: "0.00", // Placeholder - needs price oracle
						},
						stablecoins: stablecoinBalances,
					},
					defi: defiPositions,
					summary: {
						totalBalanceUSD: totalValueUSD,
						totalStakedUSD: defiPositions.totalStakedUSD,
						totalYieldAPY: defiPositions.avgAPY,
						assetCount: 1 + stablecoinBalances.length, // ETH + stablecoins
						protocolCount: defiPositions.positions.length,
					},
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Get wallet stats failed:", error)
			next(error)
		}
	}

	/**
	 * Helper: Get all stablecoin balances for a wallet on a specific chain
	 */
	private async getAllStablecoinBalances(walletAddress: string, chainId: number): Promise<any[]> {
		const balances: any[] = []

		for (const [symbol, config] of Object.entries(SUPPORTED_STABLECOINS)) {
			const tokenAddress = config.addresses[chainId]
			if (!tokenAddress) continue // Skip if not deployed on this chain

			try {
				// Encode balanceOf(address)
				const data = this.encodeBalanceOf(walletAddress)

				// Query balance via eth_call
				const balanceHex = await this.walletTransactionService.executeRpc({
					walletAddress,
					chainId,
					method: "eth_call",
					params: [{ to: tokenAddress, data }, "latest"],
				})

				const balanceRaw = BigInt(balanceHex).toString()
				const balanceFormatted = this.formatStablecoinAmount(balanceRaw, config.decimals)

				balances.push({
					token: {
						address: tokenAddress,
						symbol: config.symbol,
						name: config.name,
						decimals: config.decimals,
					},
					balance: balanceHex,
					balanceRaw,
					balanceFormatted,
					valueUSD: balanceFormatted, // 1:1 for stablecoins
				})
			} catch (error) {
				console.error(`[WalletStats] Failed to get ${symbol} balance:`, error)
				// Continue with other tokens
			}
		}

		return balances
	}

	/**
	 * GET /portfolio/:walletAddress
	 * Get comprehensive portfolio across ALL supported chains and tokens
	 * Returns balances for all chains and all stablecoins in a single response
	 */
	public async getPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { walletAddress } = req.params

			// Validate wallet address
			if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
				res.status(400).json({
					success: false,
					error: "Invalid wallet address format",
				})
				return
			}

			const timestamp = dayjs().toISOString()
			const chains: Record<number, any> = {}

			// Query ALL chains in parallel for performance
			const chainQueries = Object.values(SUPPORTED_CHAINS).map(async (chainConfig) => {
				try {
					const chainId = chainConfig.chainId

					// 1. Get native token balance
					let nativeBalance: string
					try {
						nativeBalance = await this.walletTransactionService.executeRpc({
							walletAddress,
							chainId,
							method: "eth_getBalance",
							params: [walletAddress, "latest"],
						})
					} catch (error) {
						console.warn(`[Portfolio] Failed to get native balance for chain ${chainId}:`, error)
						nativeBalance = "0x0"
					}

					const nativeBalanceFormatted = this.weiToEth(nativeBalance)

					// 2. Get all stablecoin balances for this chain
					const tokens: Record<string, any> = {}

					for (const [symbol, stablecoinConfig] of Object.entries(SUPPORTED_STABLECOINS)) {
						const tokenAddress = stablecoinConfig.addresses[chainId]
						if (!tokenAddress) continue // Skip if not deployed on this chain

						try {
							const data = this.encodeBalanceOf(walletAddress)
							const balanceHex = await this.walletTransactionService.executeRpc({
								walletAddress,
								chainId,
								method: "eth_call",
								params: [{ to: tokenAddress, data }, "latest"],
							})

							const balanceRaw = BigInt(balanceHex).toString()
							const balanceFormatted = this.formatStablecoinAmount(balanceRaw, stablecoinConfig.decimals)

							tokens[symbol] = {
								address: tokenAddress,
								symbol: stablecoinConfig.symbol,
								name: stablecoinConfig.name,
								decimals: stablecoinConfig.decimals,
								balance: balanceHex,
								balanceRaw,
								balanceFormatted,
								valueUSD: balanceFormatted, // 1:1 for stablecoins
							}
						} catch (error) {
							console.warn(`[Portfolio] Failed to get ${symbol} balance on chain ${chainId}:`, error)
							// Continue with other tokens
						}
					}

					return {
						chainId,
						data: {
							chainId,
							chainName: chainConfig.name,
							native: {
								token: chainConfig.nativeToken.symbol,
								tokenName: chainConfig.nativeToken.name,
								decimals: chainConfig.nativeToken.decimals,
								balance: nativeBalance,
								balanceFormatted: nativeBalanceFormatted,
								valueUSD: "0.00", // TODO: Add price oracle
							},
							tokens,
						},
					}
				} catch (error) {
					console.error(`[Portfolio] Failed to query chain ${chainConfig.chainId}:`, error)
					return {
						chainId: chainConfig.chainId,
						data: {
							chainId: chainConfig.chainId,
							chainName: chainConfig.name,
							error: "Failed to fetch",
							native: null,
							tokens: {},
						},
					}
				}
			})

			// Wait for all chain queries to complete
			const results = await Promise.all(chainQueries)

			// Build chains object
			for (const result of results) {
				chains[result.chainId] = result.data
			}

			// Calculate summary statistics
			let totalValueUSD = 0
			let chainsWithBalance = 0
			let tokensWithBalance = 0
			const chainsWithBalanceNames: string[] = []

			for (const [chainId, chainData] of Object.entries(chains)) {
				if (chainData.error) continue

				const hasNativeBalance = chainData.native && parseFloat(chainData.native.balanceFormatted) > 0
				const tokenBalances = Object.values(chainData.tokens) as any[]
				const hasTokenBalance = tokenBalances.some((token: any) => parseFloat(token.balanceFormatted) > 0)

				if (hasNativeBalance || hasTokenBalance) {
					chainsWithBalance++
					chainsWithBalanceNames.push(chainData.chainName)
				}

				// Sum stablecoin values
				for (const token of tokenBalances) {
					const value = parseFloat(token.balanceFormatted)
					if (value > 0) {
						tokensWithBalance++
						totalValueUSD += value
					}
				}

				// TODO: Add native token value (needs price oracle)
			}

			res.status(200).json({
				success: true,
				data: {
					walletAddress,
					timestamp,
					chains,
					summary: {
						totalValueUSD: totalValueUSD.toFixed(2),
						totalChains: Object.keys(SUPPORTED_CHAINS).length,
						chainsWithBalance,
						chainsWithBalanceNames,
						totalTokens: Object.keys(SUPPORTED_STABLECOINS).length,
						tokensWithBalance,
					},
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Get portfolio failed:", error)
			next(error)
		}
	}

	/**
	 * Helper: Get DeFi positions (staking, lending, liquidity pools)
	 * PLACEHOLDER - Will integrate with actual DeFi protocols
	 */
	private async getDeFiPositions(walletAddress: string, chainId: number): Promise<any> {
		// TODO: Integrate with:
		// - Aave (lending/borrowing)
		// - Compound (lending)
		// - Uniswap/Sushiswap (liquidity pools)
		// - Lido (staked ETH)
		// - Curve (stablecoin pools)
		// - Yearn (vaults)

		return {
			positions: [
				// PLACEHOLDER: Example staking position
				{
					protocol: "Aave",
					type: "lending",
					token: "USDC",
					amount: "0.00",
					amountFormatted: "0.00",
					valueUSD: "0.00",
					apy: "0.00",
					rewards: {
						token: "AAVE",
						amount: "0.00",
						valueUSD: "0.00",
					},
					status: "placeholder",
				},
				// PLACEHOLDER: Example liquidity pool
				{
					protocol: "Uniswap V3",
					type: "liquidity_pool",
					token: "USDC-ETH",
					amount: "0.00",
					amountFormatted: "0.00",
					valueUSD: "0.00",
					apy: "0.00",
					fees24h: "0.00",
					status: "placeholder",
				},
				// PLACEHOLDER: Staked ETH
				{
					protocol: "Lido",
					type: "staking",
					token: "stETH",
					amount: "0.00",
					amountFormatted: "0.00",
					valueUSD: "0.00",
					apy: "0.00",
					rewards: {
						token: "LDO",
						amount: "0.00",
						valueUSD: "0.00",
					},
					status: "placeholder",
				},
			],
			totalStakedUSD: "0.00",
			avgAPY: "0.00",
			totalRewardsUSD: "0.00",
			note: "DeFi positions are placeholder data. Integration with protocols pending.",
		}
	}

	/**
	 * Helper: Calculate total portfolio value in USD
	 * PLACEHOLDER - Needs price oracle integration
	 */
	private calculateTotalValueUSD(ethBalance: string, stablecoinBalances: any[]): string {
		try {
			// Sum stablecoin values (1:1 USD)
			let total = 0
			for (const stablecoin of stablecoinBalances) {
				total += parseFloat(stablecoin.balanceFormatted)
			}

			// TODO: Add ETH value (needs price oracle)
			// const ethPrice = await getPriceFromOracle("ETH")
			// total += parseFloat(ethBalance) * ethPrice

			return total.toFixed(2)
		} catch (error) {
			return "0.00"
		}
	}

	// ========== LEGACY METHODS (kept for backward compatibility) ==========

	/**
	 * GET /balance/native/:walletAddress/:chainId
	 * Get native token balance (ETH, MATIC, etc.)
	 * @deprecated Use POST /balance instead for unified API
	 */
	public async getNativeBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { walletAddress, chainId } = req.params

			if (!walletAddress || !chainId) {
				res.status(400).json({
					success: false,
					error: "walletAddress and chainId are required",
				})
				return
			}

			// Validate address format
			if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
				res.status(400).json({
					success: false,
					error: "Invalid wallet address format",
				})
				return
			}

			// Use RPC to get balance
			const balance = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId: parseInt(chainId),
				method: "eth_getBalance",
				params: [walletAddress, "latest"],
			})

			res.status(200).json({
				success: true,
				data: {
					walletAddress,
					chainId: parseInt(chainId),
					balance, // Hex string (wei)
					balanceWei: balance,
					balanceEth: this.weiToEth(balance),
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Get native balance failed:", error)
			next(error)
		}
	}

	/**
	 * GET /balance/erc20/:walletAddress/:tokenAddress/:chainId
	 * Get ERC20 token balance
	 * @deprecated Use POST /balance instead for unified API
	 */
	public async getERC20Balance(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { walletAddress, tokenAddress, chainId } = req.params

			if (!walletAddress || !tokenAddress || !chainId) {
				res.status(400).json({
					success: false,
					error: "walletAddress, tokenAddress, and chainId are required",
				})
				return
			}

			// Validate addresses
			if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress) || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
				res.status(400).json({
					success: false,
					error: "Invalid address format",
				})
				return
			}

			// Encode balanceOf(address) call
			const data = this.encodeBalanceOf(walletAddress)

			// Use eth_call to query balance
			const balance = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId: parseInt(chainId),
				method: "eth_call",
				params: [
					{
						to: tokenAddress,
						data,
					},
					"latest",
				],
			})

			// Get token metadata
			const [decimals, symbol, name] = await Promise.all([
				this.getTokenDecimals(walletAddress, tokenAddress, parseInt(chainId)),
				this.getTokenSymbol(walletAddress, tokenAddress, parseInt(chainId)),
				this.getTokenName(walletAddress, tokenAddress, parseInt(chainId)),
			])

			res.status(200).json({
				success: true,
				data: {
					walletAddress,
					tokenAddress,
					chainId: parseInt(chainId),
					balance, // Raw hex balance
					balanceRaw: balance,
					balanceFormatted: this.formatTokenBalance(balance, decimals),
					token: {
						address: tokenAddress,
						name,
						symbol,
						decimals,
					},
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Get ERC20 balance failed:", error)
			next(error)
		}
	}

	/**
	 * GET /balances/:walletAddress/:chainId
	 * Get all token balances (native + multiple ERC20s)
	 */
	public async getAllBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { walletAddress, chainId } = req.params
			const { tokens } = req.query // Comma-separated token addresses

			if (!walletAddress || !chainId) {
				res.status(400).json({
					success: false,
					error: "walletAddress and chainId are required",
				})
				return
			}

			// Validate address
			if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
				res.status(400).json({
					success: false,
					error: "Invalid wallet address format",
				})
				return
			}

			const chainIdNum = parseInt(chainId)

			// Get native balance
			const nativeBalance = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId: chainIdNum,
				method: "eth_getBalance",
				params: [walletAddress, "latest"],
			})

			const balances: any = {
				native: {
					balance: nativeBalance,
					balanceWei: nativeBalance,
					balanceEth: this.weiToEth(nativeBalance),
				},
				tokens: [],
			}

			// Get ERC20 balances if token addresses provided
			if (tokens && typeof tokens === "string") {
				const tokenAddresses = tokens.split(",").map((t) => t.trim())

				for (const tokenAddress of tokenAddresses) {
					if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
						continue // Skip invalid addresses
					}

					try {
						const data = this.encodeBalanceOf(walletAddress)
						const balance = await this.walletTransactionService.executeRpc({
							walletAddress,
							chainId: chainIdNum,
							method: "eth_call",
							params: [{ to: tokenAddress, data }, "latest"],
						})

						const [decimals, symbol, name] = await Promise.all([
							this.getTokenDecimals(walletAddress, tokenAddress, chainIdNum),
							this.getTokenSymbol(walletAddress, tokenAddress, chainIdNum),
							this.getTokenName(walletAddress, tokenAddress, chainIdNum),
						])

						balances.tokens.push({
							address: tokenAddress,
							name,
							symbol,
							decimals,
							balance,
							balanceRaw: balance,
							balanceFormatted: this.formatTokenBalance(balance, decimals),
						})
					} catch (error) {
						console.error(`Failed to get balance for token ${tokenAddress}:`, error)
						// Continue with other tokens
					}
				}
			}

			res.status(200).json({
				success: true,
				data: {
					walletAddress,
					chainId: chainIdNum,
					...balances,
				},
			})
		} catch (error) {
			console.error("[WalletExecution] Get all balances failed:", error)
			next(error)
		}
	}

	// ========== Helper Methods ==========

	/**
	 * Encode ERC20 transfer function call
	 */
	private encodeERC20Transfer(toAddress: string, amount: string): string {
		// transfer(address to, uint256 amount)
		// Function signature: 0xa9059cbb
		const cleanTo = toAddress.toLowerCase().replace("0x", "").padStart(64, "0")
		const cleanAmount = BigInt(amount).toString(16).padStart(64, "0")
		return `${ERC20_ABI.TRANSFER}${cleanTo}${cleanAmount}`
	}

	/**
	 * Encode balanceOf function call
	 */
	private encodeBalanceOf(address: string): string {
		// balanceOf(address)
		const cleanAddress = address.toLowerCase().replace("0x", "").padStart(64, "0")
		return `${ERC20_ABI.BALANCE_OF}${cleanAddress}`
	}

	/**
	 * Get token decimals
	 */
	private async getTokenDecimals(walletAddress: string, tokenAddress: string, chainId: number): Promise<number> {
		try {
			const result = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId,
				method: "eth_call",
				params: [{ to: tokenAddress, data: ERC20_ABI.DECIMALS }, "latest"],
			})
			return parseInt(result, 16)
		} catch (error) {
			return 18 // Default to 18 decimals
		}
	}

	/**
	 * Get token symbol
	 */
	private async getTokenSymbol(walletAddress: string, tokenAddress: string, chainId: number): Promise<string> {
		try {
			const result = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId,
				method: "eth_call",
				params: [{ to: tokenAddress, data: ERC20_ABI.SYMBOL }, "latest"],
			})
			return this.decodeString(result)
		} catch (error) {
			return "UNKNOWN"
		}
	}

	/**
	 * Get token name
	 */
	private async getTokenName(walletAddress: string, tokenAddress: string, chainId: number): Promise<string> {
		try {
			const result = await this.walletTransactionService.executeRpc({
				walletAddress,
				chainId,
				method: "eth_call",
				params: [{ to: tokenAddress, data: ERC20_ABI.NAME }, "latest"],
			})
			return this.decodeString(result)
		} catch (error) {
			return "Unknown Token"
		}
	}

	/**
	 * Decode hex string to UTF-8
	 */
	private decodeString(hex: string): string {
		try {
			// Remove 0x prefix and leading zeros
			const cleaned = hex.replace("0x", "")
			// Skip offset and length encoding (first 64 chars)
			const data = cleaned.slice(128)
			// Convert hex to string
			let result = ""
			for (let i = 0; i < data.length; i += 2) {
				const byte = parseInt(data.substr(i, 2), 16)
				if (byte !== 0) result += String.fromCharCode(byte)
			}
			return result || "UNKNOWN"
		} catch (error) {
			return "UNKNOWN"
		}
	}

	/**
	 * Convert wei to ETH
	 */
	private weiToEth(weiHex: string): string {
		try {
			const wei = BigInt(weiHex)
			const eth = Number(wei) / 1e18
			return eth.toFixed(18)
		} catch (error) {
			return "0"
		}
	}

	/**
	 * Format token balance with decimals
	 */
	private formatTokenBalance(balanceHex: string, decimals: number): string {
		try {
			const balance = BigInt(balanceHex)
			const divisor = BigInt(10 ** decimals)
			const whole = balance / divisor
			const fraction = balance % divisor
			return `${whole}.${fraction.toString().padStart(decimals, "0")}`
		} catch (error) {
			return "0"
		}
	}
}

/**
 * Create Wallet Execution Router
 * Dynamic routes that handle both native and ERC20 tokens automatically
 * 
 * @param walletTransactionService - The wallet transaction service instance
 */
export function createWalletExecutionRouter(walletTransactionService: WalletTransactionService): Router {
	const router = Router()
	const controller = new WalletExecutionController(walletTransactionService)

	// ========== NEW UNIFIED DYNAMIC ENDPOINTS ==========
	
	/**
	 * POST /transfer
	 * Universal transfer - automatically detects native vs ERC20
	 * Body: { productId, userId, sender, receiver, amount, tokenAddress?, chainId, ... }
	 * - tokenAddress omitted/null/"0x0" = native token
	 * - tokenAddress = contract address = ERC20 token
	 */
	router.post("/transfer", (req, res, next) => controller.transfer(req, res, next))

	/**
	 * POST /execute
	 * Generic transaction execution with auto-detection
	 * Body: { productId, userId, sender, receiver, amount, tokenAddress?, chainId, data?, ... }
	 */
	router.post("/execute", (req, res, next) => controller.execute(req, res, next))

	/**
	 * POST /deposit
	 * Get deposit instructions for any token type
	 * Body: { productId, userId, receiver, amount, tokenAddress?, chainId, ... }
	 */
	router.post("/deposit", (req, res, next) => controller.deposit(req, res, next))

	/**
	 * POST /withdraw
	 * Withdraw any token type (alias for transfer)
	 * Body: { productId, userId, sender, receiver, amount, tokenAddress?, chainId, ... }
	 */
	router.post("/withdraw", (req, res, next) => controller.withdraw(req, res, next))

	/**
	 * POST /balance
	 * Get balance for any token type
	 * Body: { walletAddress, tokenAddress?, chainId }
	 */
	router.post("/balance", (req, res, next) => controller.getBalance(req, res, next))

	/**
	 * GET /portfolio/:walletAddress
	 * Get complete portfolio across ALL chains and ALL tokens
	 * Returns balances for all supported chains (7 chains) and stablecoins (USDT, USDC)
	 */
	router.get("/portfolio/:walletAddress", (req, res, next) => controller.getPortfolio(req, res, next))

	/**
	 * GET /stats/:walletAddress/:chainId
	 * Get comprehensive wallet portfolio stats
	 * Returns all balances (ETH + stablecoins) + DeFi positions
	 */
	router.get("/stats/:walletAddress/:chainId", (req, res, next) => controller.getWalletStats(req, res, next))

	// ========== LEGACY ENDPOINTS (kept for backward compatibility) ==========

	// Get native token balance (legacy - use POST /balance instead)
	router.get("/balance/native/:walletAddress/:chainId", (req, res, next) =>
		controller.getNativeBalance(req, res, next),
	)

	// Get ERC20 token balance (legacy - use POST /balance instead)
	router.get("/balance/erc20/:walletAddress/:tokenAddress/:chainId", (req, res, next) =>
		controller.getERC20Balance(req, res, next),
	)

	// Get all balances (legacy - still useful for batch queries)
	router.get("/balances/:walletAddress/:chainId", (req, res, next) => controller.getAllBalances(req, res, next))

	return router
}
