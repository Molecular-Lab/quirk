/**
 * Vault Balance Verifier Service
 *
 * Queries on-chain balances for DeFi protocol positions
 * Used in production to verify vault balances match actual staked amounts
 *
 * Supported Protocols:
 * - Aave V3 (aTokens)
 * - Compound V3 (cTokens)
 * - Morpho Blue
 *
 * Formula for Client Growth Index (Production):
 * CurrentStakedAsset = On-chain balance from DeFi protocols
 * ClientGrowthIndex = CurrentStakedAsset / InitialStakedBalance
 */

import BigNumber from "bignumber.js"
import { type Address, type PublicClient, createPublicClient, http } from "viem"
import { getMainnetChainConfig, type MainnetChainId } from "../blockchain/chain.config"

// ERC20 ABI (minimal - just balanceOf)
const ERC20_ABI = [
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
] as const

// Aave V3 aToken ABI (same as ERC20)
const AAVE_ATOKEN_ABI = ERC20_ABI

// Compound V3 Comet ABI
const COMPOUND_COMET_ABI = [
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
] as const

export type SupportedChain = MainnetChainId // "1" | "8453"
export type ProtocolType = "aave" | "compound" | "morpho"

export interface OnChainBalanceResult {
	protocol: ProtocolType
	balance: string // Raw balance (e.g., 1000000 for 1 USDC with 6 decimals)
	balanceDecimal: string // Human-readable (6 decimals for USDC)
	tokenAddress: Address
	protocolAddress: Address
}

export class VaultBalanceVerifierService {
	private publicClients: Map<SupportedChain, PublicClient>

	constructor() {
		this.publicClients = new Map()
	}

	/**
	 * Get or create public client for a chain
	 */
	private getPublicClient(chainId: SupportedChain): PublicClient {
		if (!this.publicClients.has(chainId)) {
			const chainConfig = getMainnetChainConfig(chainId)

			if (!chainConfig.rpcUrl) {
				throw new Error(`RPC URL not configured for chain ${chainId}. Set ETHEREUM_RPC_URL or BASE_RPC_URL in env.`)
			}

			const client = createPublicClient({
				chain: chainConfig.chain,
				transport: http(chainConfig.rpcUrl),
			})

			this.publicClients.set(chainId, client)
		}

		return this.publicClients.get(chainId)!
	}

	/**
	 * Get idle wallet balance (not staked in any protocol)
	 */
	async getWalletBalance(
		chainId: SupportedChain,
		custodialWallet: Address,
		tokenAddress: Address,
	): Promise<string> {
		const client = this.getPublicClient(chainId)

		try {
			const balance = await client.readContract({
				address: tokenAddress,
				abi: ERC20_ABI,
				functionName: "balanceOf",
				args: [custodialWallet],
			})

			return balance.toString()
		} catch (error) {
			console.error(`[VaultBalanceVerifier] Failed to get wallet balance:`, {
				chainId,
				custodialWallet,
				tokenAddress,
				error,
			})
			throw error
		}
	}

	/**
	 * Get Aave V3 aToken balance
	 * aTokens are 1:1 with underlying token and auto-compound
	 *
	 * Example Aave V3 aToken addresses on Ethereum:
	 * - aUSDC: 0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c
	 * - aDAI: 0x018008bfb33d285247A21d44E50697654f754e63
	 */
	async getAaveBalance(
		chainId: SupportedChain,
		custodialWallet: Address,
		aTokenAddress: Address,
	): Promise<OnChainBalanceResult> {
		const client = this.getPublicClient(chainId)

		try {
			const balance = await client.readContract({
				address: aTokenAddress,
				abi: AAVE_ATOKEN_ABI,
				functionName: "balanceOf",
				args: [custodialWallet],
			})

			const balanceStr = balance.toString()
			const balanceDecimal = new BigNumber(balanceStr).dividedBy(1e6).toFixed(6) // Assuming USDC (6 decimals)

			return {
				protocol: "aave",
				balance: balanceStr,
				balanceDecimal,
				tokenAddress: aTokenAddress,
				protocolAddress: aTokenAddress,
			}
		} catch (error) {
			console.error(`[VaultBalanceVerifier] Failed to get Aave balance:`, {
				chainId,
				custodialWallet,
				aTokenAddress,
				error,
			})
			throw error
		}
	}

	/**
	 * Get Compound V3 balance
	 * Query the Comet contract for user's supplied balance
	 *
	 * Example Compound V3 Comet addresses on Ethereum:
	 * - cUSDCv3: 0xc3d688B66703497DAA19211EEdff47f25384cdc3
	 */
	async getCompoundBalance(
		chainId: SupportedChain,
		custodialWallet: Address,
		cometAddress: Address,
	): Promise<OnChainBalanceResult> {
		const client = this.getPublicClient(chainId)

		try {
			const balance = await client.readContract({
				address: cometAddress,
				abi: COMPOUND_COMET_ABI,
				functionName: "balanceOf",
				args: [custodialWallet],
			})

			const balanceStr = balance.toString()
			const balanceDecimal = new BigNumber(balanceStr).dividedBy(1e6).toFixed(6) // Assuming USDC (6 decimals)

			return {
				protocol: "compound",
				balance: balanceStr,
				balanceDecimal,
				tokenAddress: cometAddress,
				protocolAddress: cometAddress,
			}
		} catch (error) {
			console.error(`[VaultBalanceVerifier] Failed to get Compound balance:`, {
				chainId,
				custodialWallet,
				cometAddress,
				error,
			})
			throw error
		}
	}

	/**
	 * Get Morpho Blue balance
	 * TODO: Implement Morpho-specific balance query
	 */
	async getMorphoBalance(
		chainId: SupportedChain,
		custodialWallet: Address,
		morphoMarketId: string,
	): Promise<OnChainBalanceResult> {
		// TODO: Implement Morpho Blue position query
		// Morpho uses a different architecture - need to query position by market ID
		throw new Error("Morpho balance verification not yet implemented")
	}

	/**
	 * Get total staked balance across all DeFi protocols for a vault
	 *
	 * @param chainId - Chain to query
	 * @param custodialWallet - Vault's custodial wallet address
	 * @param protocolAllocations - Map of protocol → token address
	 * @returns Total staked balance in base units (e.g., 1000000 for 1 USDC)
	 */
	async getTotalStakedBalance(
		chainId: SupportedChain,
		custodialWallet: Address,
		protocolAllocations: {
			aave?: Address // aToken address
			compound?: Address // Comet address
			morpho?: string // Market ID
		},
	): Promise<{
		totalBalance: string
		totalBalanceDecimal: string
		breakdown: OnChainBalanceResult[]
	}> {
		const breakdown: OnChainBalanceResult[] = []
		let totalBalance = new BigNumber(0)

		// Query Aave if allocated
		if (protocolAllocations.aave) {
			try {
				const aaveBalance = await this.getAaveBalance(chainId, custodialWallet, protocolAllocations.aave)
				breakdown.push(aaveBalance)
				totalBalance = totalBalance.plus(aaveBalance.balance)
			} catch (error) {
				console.error("[VaultBalanceVerifier] Failed to get Aave balance:", error)
			}
		}

		// Query Compound if allocated
		if (protocolAllocations.compound) {
			try {
				const compoundBalance = await this.getCompoundBalance(
					chainId,
					custodialWallet,
					protocolAllocations.compound,
				)
				breakdown.push(compoundBalance)
				totalBalance = totalBalance.plus(compoundBalance.balance)
			} catch (error) {
				console.error("[VaultBalanceVerifier] Failed to get Compound balance:", error)
			}
		}

		// Query Morpho if allocated
		if (protocolAllocations.morpho) {
			try {
				const morphoBalance = await this.getMorphoBalance(chainId, custodialWallet, protocolAllocations.morpho)
				breakdown.push(morphoBalance)
				totalBalance = totalBalance.plus(morphoBalance.balance)
			} catch (error) {
				console.error("[VaultBalanceVerifier] Failed to get Morpho balance:", error)
			}
		}

		return {
			totalBalance: totalBalance.toString(),
			totalBalanceDecimal: totalBalance.dividedBy(1e6).toFixed(6),
			breakdown,
		}
	}

	/**
	 * Calculate vault index growth based on on-chain balance
	 *
	 * Formula:
	 * newIndex = oldIndex × (currentStakedBalance / previousStakedBalance)
	 *
	 * @param currentBalance - Current on-chain balance
	 * @param previousBalance - Previous recorded balance
	 * @param currentIndex - Current vault index
	 * @returns New vault index
	 */
	calculateIndexGrowth(currentBalance: string, previousBalance: string, currentIndex: string): string {
		const current = new BigNumber(currentBalance)
		const previous = new BigNumber(previousBalance)
		const index = new BigNumber(currentIndex)

		if (previous.isZero()) {
			return currentIndex // No growth if no previous balance
		}

		// newIndex = currentIndex × (currentBalance / previousBalance)
		const growthFactor = current.dividedBy(previous)
		const newIndex = index.multipliedBy(growthFactor).integerValue(BigNumber.ROUND_DOWN)

		return newIndex.toString()
	}
}
