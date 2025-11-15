import { PrivyClient } from "@privy-io/node"
import { createPublicClient, http, type PublicClient } from "viem"
import {
	mainnet,
	sepolia,
	polygon,
	bsc,
	arbitrum,
	optimism,
	base,
} from "viem/chains"
import VError from "verror"
import dayjs from "dayjs"
import type { IWalletTransactionDataGateway } from "../datagateway/wallet-transaction.datagateway"
import type {
	EthereumTransactionParams,
	EthereumTransactionResult,
	RpcRequestParams,
} from "../entity/wallet-transaction.entity"

/**
 * Chain configurations for public RPC clients
 */
const CHAIN_CONFIGS = {
	1: mainnet,
	11155111: sepolia,
	137: polygon,
	56: bsc,
	42161: arbitrum,
	10: optimism,
	8453: base,
} as const

/**
 * Wallet Transaction Repository
 * Implements transaction operations using Privy SDK + Viem for RPC calls
 *
 * This handles all server-side wallet transaction execution:
 * - Privy manages the private keys
 * - We send transaction requests via Privy's RPC interface
 * - Privy signs and broadcasts transactions
 * - Viem provides public RPC access for read operations (balances, etc.)
 *
 * NOTE: Privy's server-side transaction execution requires:
 * 1. Wallet policies configured for offline/server-side access
 * 2. The wallet must be an embedded wallet (not external)
 * 3. Proper session signers or control policies set up
 *
 * For full server-side transaction execution, see:
 * - https://docs.privy.io/controls/overview
 * - https://docs.privy.io/wallets/wallets/offline-actions
 * - https://docs.privy.io/wallets/wallets/server-side-access
 */
export class WalletTransactionRepository implements IWalletTransactionDataGateway {
	private rpcClients: Map<number, PublicClient> = new Map()

	constructor(private readonly privyClient: PrivyClient) {
		// Initialize RPC clients for all supported chains
		this.initializeRpcClients()
	}

	/**
	 * Initialize public RPC clients for all supported chains
	 */
	private initializeRpcClients(): void {
		for (const [chainId, chain] of Object.entries(CHAIN_CONFIGS)) {
			const client = createPublicClient({
				chain,
				transport: http(), // Uses public RPC endpoints
			})
			this.rpcClients.set(Number(chainId), client as PublicClient)
		}
		console.log(`[WalletTxRepo] Initialized RPC clients for ${this.rpcClients.size} chains`)
	}

	/**
	 * Get RPC client for a specific chain
	 */
	private getRpcClient(chainId: number): PublicClient {
		const client = this.rpcClients.get(chainId)
		if (!client) {
			throw new Error(`No RPC client configured for chain ${chainId}`)
		}
		return client
	}

	/**
	 * Send a transaction from an embedded wallet
	 *
	 * TODO: Implement using Privy's server-side transaction execution
	 * Current @privy-io/node SDK version may not support direct RPC calls
	 * Need to verify SDK version and API capabilities
	 *
	 * Alternative approaches:
	 * 1. Use Privy Controls API for offline/server-side transactions
	 * 2. Use session signers for delegated signing
	 * 3. Integrate with ethers.js/viem + Privy wallet export (less secure)
	 *
	 * References:
	 * - https://docs.privy.io/controls/overview
	 * - https://docs.privy.io/wallets/wallets/offline-actions
	 * - https://docs.privy.io/wallets/using-wallets/session-signers/overview
	 */
	public async sendTransaction(params: {
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<EthereumTransactionResult> {
		const { walletAddress, transaction } = params

		try {
			console.log("[WalletTxRepo] Sending transaction", {
				from: walletAddress,
				to: transaction.to,
				chainId: transaction.chainId,
			})

			// TODO: Implement actual Privy SDK call once proper API is documented
			// For now, throw not implemented error
			throw new Error(
				"Server-side transaction execution not yet implemented. " +
					"Please configure Privy Controls API or session signers first. " +
					"See: https://docs.privy.io/controls/overview",
			)

			// Placeholder return (unreachable)
			return {
				txHash: "0x",
				chainId: transaction.chainId,
				from: walletAddress,
				to: transaction.to,
				value: transaction.value,
				status: "pending",
				timestamp: dayjs().toISOString(),
			}
		} catch (error) {
			console.error("[WalletTxRepo] Send transaction failed", {
				error: error instanceof Error ? error.message : error,
				walletAddress,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "send_transaction_failed",
						walletAddress,
						chainId: transaction.chainId,
					},
				},
				"[WalletTransaction] Failed to send transaction",
			)
		}
	}

	/**
	 * Sign a transaction without sending
	 *
	 * TODO: Implement using Privy's server-side signing
	 * See sendTransaction for implementation notes
	 */
	public async signTransaction(params: {
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<{ signedTx: string }> {
		const { walletAddress, transaction } = params

		try {
			console.log("[WalletTxRepo] Signing transaction", {
				from: walletAddress,
				to: transaction.to,
				chainId: transaction.chainId,
			})

			// TODO: Implement actual Privy SDK call
			throw new Error(
				"Server-side transaction signing not yet implemented. " +
					"Please configure Privy Controls API or session signers first.",
			)

			// Placeholder return (unreachable)
			return { signedTx: "0x" }
		} catch (error) {
			console.error("[WalletTxRepo] Sign transaction failed", {
				error: error instanceof Error ? error.message : error,
				walletAddress,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "sign_transaction_failed",
						walletAddress,
						chainId: transaction.chainId,
					},
				},
				"[WalletTransaction] Failed to sign transaction",
			)
		}
	}

	/**
	 * Execute custom RPC call
	 *
	 * Uses Viem public clients for read operations (eth_call, eth_getBalance, etc.)
	 * For write operations (eth_sendTransaction), would need Privy Controls API
	 */
	public async executeRpc(params: RpcRequestParams): Promise<any> {
		const { walletAddress, chainId, method, params: rpcParams } = params

		try {
			console.log("[WalletTxRepo] Executing RPC", {
				method,
				walletAddress,
				chainId,
			})

			const client = this.getRpcClient(chainId)

			// Handle different RPC methods
			switch (method) {
				case "eth_getBalance": {
					const [address, blockTag] = rpcParams as [
						`0x${string}`,
						"latest" | "earliest" | "pending" | bigint | undefined,
					]
					const balance = await client.getBalance({
						address,
						blockTag: (blockTag as any) || "latest",
					})
					// Return as hex string (matching eth_getBalance format)
					return `0x${balance.toString(16)}`
				}

				case "eth_call": {
					const [txRequest, blockTag] = rpcParams as [
						{ to: `0x${string}`; data: `0x${string}`; from?: `0x${string}` },
						"latest" | "earliest" | "pending" | bigint | undefined,
					]
					const result = await client.call({
						...txRequest,
						blockTag: (blockTag as any) || "latest",
					})
					return result.data
				}

				case "eth_getTransactionCount": {
					const [address, blockTag] = rpcParams as [
						`0x${string}`,
						"latest" | "earliest" | "pending" | bigint | undefined,
					]
					const nonce = await client.getTransactionCount({
						address,
						blockTag: (blockTag as any) || "latest",
					})
					return `0x${nonce.toString(16)}`
				}

				case "eth_getTransactionByHash": {
					const [hash] = rpcParams as [`0x${string}`]
					const tx = await client.getTransaction({ hash })
					return tx
				}

				case "eth_getTransactionReceipt": {
					const [hash] = rpcParams as [`0x${string}`]
					const receipt = await client.getTransactionReceipt({ hash })
					return receipt
				}

				case "eth_estimateGas": {
					const [txRequest] = rpcParams as [
						{
							to: `0x${string}`
							from?: `0x${string}`
							data?: `0x${string}`
							value?: bigint
						},
					]
					const gas = await client.estimateGas(txRequest)
					return `0x${gas.toString(16)}`
				}

				case "eth_gasPrice": {
					const gasPrice = await client.getGasPrice()
					return `0x${gasPrice.toString(16)}`
				}

				case "eth_blockNumber": {
					const blockNumber = await client.getBlockNumber()
					return `0x${blockNumber.toString(16)}`
				}

				default:
					throw new Error(
						`RPC method '${method}' not supported. ` +
							`Supported methods: eth_getBalance, eth_call, eth_getTransactionCount, ` +
							`eth_getTransactionByHash, eth_getTransactionReceipt, eth_estimateGas, eth_gasPrice, eth_blockNumber`,
					)
			}
		} catch (error) {
			console.error("[WalletTxRepo] RPC execution failed", {
				error: error instanceof Error ? error.message : error,
				method,
				walletAddress,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "rpc_execution_failed",
						method,
						walletAddress,
						chainId,
					},
				},
				"[WalletTransaction] Failed to execute RPC call",
			)
		}
	}

	/**
	 * Get transaction status
	 */
	public async getTransactionStatus(
		txHash: string,
		chainId: number,
	): Promise<{
		status: "pending" | "confirmed" | "failed"
		blockNumber?: number
		gasUsed?: string
		effectiveGasPrice?: string
	}> {
		try {
			console.log("[WalletTxRepo] Getting transaction status", { txHash, chainId })

			// Note: This requires an RPC provider, not Privy
			// For now, return pending status
			// In production, integrate with ethers.js or viem
			return {
				status: "pending",
			}
		} catch (error) {
			console.error("[WalletTxRepo] Get transaction status failed", {
				error: error instanceof Error ? error.message : error,
				txHash,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "get_transaction_status_failed",
						txHash,
						chainId,
					},
				},
				"[WalletTransaction] Failed to get transaction status",
			)
		}
	}

	/**
	 * Estimate gas for transaction
	 */
	public async estimateGas(transaction: EthereumTransactionParams): Promise<{ gasEstimate: string }> {
		try {
			console.log("[WalletTxRepo] Estimating gas", {
				to: transaction.to,
				chainId: transaction.chainId,
			})

			// Note: This requires an RPC provider
			// For now, return a default estimate
			// In production, use eth_estimateGas via RPC provider
			return {
				gasEstimate: "0x5208", // 21000 gas (standard transfer)
			}
		} catch (error) {
			console.error("[WalletTxRepo] Gas estimation failed", {
				error: error instanceof Error ? error.message : error,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "gas_estimation_failed",
						chainId: transaction.chainId,
					},
				},
				"[WalletTransaction] Failed to estimate gas",
			)
		}
	}

	/**
	 * Get current gas price
	 */
	public async getGasPrice(chainId: number): Promise<{
		gasPrice: string
		maxFeePerGas?: string
		maxPriorityFeePerGas?: string
	}> {
		try {
			console.log("[WalletTxRepo] Getting gas price", { chainId })

			// Note: This requires an RPC provider
			// For now, return default values
			// In production, use eth_gasPrice and eth_feeHistory
			return {
				gasPrice: "0x3B9ACA00", // 1 gwei
				maxFeePerGas: "0x3B9ACA00",
				maxPriorityFeePerGas: "0x3B9ACA00",
			}
		} catch (error) {
			console.error("[WalletTxRepo] Get gas price failed", {
				error: error instanceof Error ? error.message : error,
				chainId,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "get_gas_price_failed",
						chainId,
					},
				},
				"[WalletTransaction] Failed to get gas price",
			)
		}
	}
}
