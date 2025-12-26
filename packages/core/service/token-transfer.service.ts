/**
 * Token Transfer Verification Service
 *
 * Verifies that ERC20 tokens were actually received on-chain.
 * Supports both mainnet (real verification) and testnet/mock (simulated).
 */

import { type Address, type Chain, type Hex, createPublicClient, createWalletClient, formatUnits, http, parseUnits } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia, mainnet, sepolia } from "viem/chains"

export interface MintToCustodialParams {
	chainId: string // Chain ID: "11155111" (Sepolia), "84532" (Base Sepolia)
	tokenAddress: string // MockUSDC contract address
	custodialWallet: string // Client's Privy custodial wallet address
	amount: string // Amount in USDC (e.g., "1000" for 1000 USDC)
	privateKey: string // Private key for minting (must start with 0x)
	decimals?: number // Token decimals (default: 6 for USDC)
}

export interface MintResult {
	success: boolean
	txHash?: string
	blockNumber?: bigint
	amountMinted?: string
	error?: string
}

export interface VerifyTransferParams {
	chain: string // Chain ID: "8453" (Base), "1" (Ethereum), etc.
	tokenAddress: string // ERC20 token contract address
	expectedAmount: string // Expected amount in token's decimals (e.g., "1000000000" for 1000 USDC)
	transactionHash: string // Transaction hash to verify
	toAddress: string // Expected recipient (custodial wallet)
}

export interface TransferVerificationResult {
	verified: boolean
	actualAmount?: string
	from?: string
	blockNumber?: number
	error?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCTION: Transfer from Oracle (for mainnet USDC transfers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TransferFromOracleParams {
	chainId: string // Chain ID: "1" (Mainnet), "11155111" (Sepolia)
	tokenAddress: string // USDC contract address
	custodialWallet: string // Destination custodial wallet address
	amount: string // Amount in USDC (e.g., "1000" for 1000 USDC)
	privateKey: string // Oracle wallet private key (must start with 0x)
	decimals?: number // Token decimals (default: 6 for USDC)
	rpcUrl?: string // Optional custom RPC URL
}

export interface TransferResult {
	success: boolean
	status: "completed" | "insufficient_balance" | "failed"
	txHash?: string
	blockNumber?: bigint
	amountTransferred?: string
	oracleBalance?: string
	oracleBalanceAfter?: string
	requiredAmount?: string
	error?: string
}

export class TokenTransferService {
	private isMockMode: boolean

	constructor() {
		this.isMockMode = process.env.NODE_ENV !== "production" || process.env.MOCK_BLOCKCHAIN === "true"
	}

	/**
	 * Mint MockUSDC to custodial wallet (for testnet)
	 * Uses Viem to call the mint() function on MockUSDC contract
	 */
	async mintToCustodial(params: MintToCustodialParams): Promise<MintResult> {
		try {
			const decimals = params.decimals || 6 // USDC has 6 decimals
			const amountInBaseUnits = parseUnits(params.amount, decimals)

			// Get chain config
			const chain = this.getChainConfig(params.chainId)
			if (!chain) {
				return {
					success: false,
					error: `Unsupported chain ID: ${params.chainId}`,
				}
			}

			// Validate private key format
			if (!params.privateKey) {
				return {
					success: false,
					error: "Private key is required",
				}
			}

			if (!params.privateKey.startsWith("0x")) {
				return {
					success: false,
					error: "Private key must start with 0x",
				}
			}

			// Create account from private key
			const account = privateKeyToAccount(params.privateKey as Hex)

			// Create clients
			const publicClient = createPublicClient({
				chain,
				transport: http(),
			})

			const walletClient = createWalletClient({
				account,
				chain,
				transport: http(),
			})

			// MockUSDC ABI (only the functions we need)
			const mockUSDCAbi = [
				{
					name: "mint",
					type: "function",
					stateMutability: "nonpayable",
					inputs: [
						{ name: "to", type: "address" },
						{ name: "amount", type: "uint256" },
					],
					outputs: [],
				},
				{
					name: "balanceOf",
					type: "function",
					stateMutability: "view",
					inputs: [{ name: "account", type: "address" }],
					outputs: [{ name: "", type: "uint256" }],
				},
				{
					name: "owner",
					type: "function",
					stateMutability: "view",
					inputs: [],
					outputs: [{ name: "", type: "address" }],
				},
			] as const

			// Skip owner verification for now - let the mint transaction fail if signer is not owner
			// This allows us to get better error messages from the actual mint transaction
			console.log("🔑 Using signer:", account.address)

			// Check balance before
			const balanceBefore = await publicClient.readContract({
				address: params.tokenAddress as Address,
				abi: mockUSDCAbi,
				functionName: "balanceOf",
				args: [params.custodialWallet as Address],
			})

			console.log("🏦 Minting MockUSDC to Custodial Wallet")
			console.log("  To:", params.custodialWallet)
			console.log("  Amount:", params.amount, "USDC")
			console.log("  Balance before:", formatUnits(balanceBefore, decimals), "USDC")

			// Mint tokens
			const hash = await walletClient.writeContract({
				address: params.tokenAddress as Address,
				abi: mockUSDCAbi,
				functionName: "mint",
				args: [params.custodialWallet as Address, amountInBaseUnits],
			})

			console.log("  Transaction hash:", hash)
			console.log("  Waiting for confirmation...")

			// Wait for transaction confirmation
			const receipt = await publicClient.waitForTransactionReceipt({ hash })

			if (receipt.status !== "success") {
				return {
					success: false,
					error: "Transaction failed",
				}
			}

			// Check balance after
			const balanceAfter = await publicClient.readContract({
				address: params.tokenAddress as Address,
				abi: mockUSDCAbi,
				functionName: "balanceOf",
				args: [params.custodialWallet as Address],
			})

			const minted = balanceAfter - balanceBefore

			console.log("  ✅ Minted:", formatUnits(minted, decimals), "USDC")
			console.log("  Balance after:", formatUnits(balanceAfter, decimals), "USDC")
			console.log("  Block number:", receipt.blockNumber)

			return {
				success: true,
				txHash: hash,
				blockNumber: receipt.blockNumber,
				amountMinted: formatUnits(minted, decimals),
			}
		} catch (error) {
			console.error("[TokenTransferService] Mint error:", error)
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}
		}
	}

	/**
	 * Transfer USDC from oracle wallet to custodial wallet (for mainnet/production)
	 *
	 * Flow:
	 * 1. Check oracle wallet balance FIRST
	 * 2. If insufficient → return error with balance details
	 * 3. If sufficient → execute ERC20 transfer
	 * 4. Return result with status and balance info
	 */
	async transferFromOracle(params: TransferFromOracleParams): Promise<TransferResult> {
		try {
			const decimals = params.decimals || 6 // USDC has 6 decimals
			const requiredAmount = parseUnits(params.amount, decimals)

			// Get chain config
			const chain = this.getChainConfig(params.chainId)
			if (!chain) {
				return {
					success: false,
					status: "failed",
					error: `Unsupported chain ID: ${params.chainId}`,
				}
			}

			// Validate private key format
			if (!params.privateKey) {
				return {
					success: false,
					status: "failed",
					error: "Oracle private key is required",
				}
			}

			if (!params.privateKey.startsWith("0x")) {
				return {
					success: false,
					status: "failed",
					error: "Oracle private key must start with 0x",
				}
			}

			// Create account from private key
			const account = privateKeyToAccount(params.privateKey as Hex)
			const oracleAddress = account.address

			// Create clients with optional custom RPC
			const transport = params.rpcUrl ? http(params.rpcUrl) : http()

			const publicClient = createPublicClient({
				chain,
				transport,
			})

			const walletClient = createWalletClient({
				account,
				chain,
				transport,
			})

			// ERC20 ABI (only the functions we need)
			const erc20Abi = [
				{
					name: "transfer",
					type: "function",
					stateMutability: "nonpayable",
					inputs: [
						{ name: "to", type: "address" },
						{ name: "amount", type: "uint256" },
					],
					outputs: [{ name: "", type: "bool" }],
				},
				{
					name: "balanceOf",
					type: "function",
					stateMutability: "view",
					inputs: [{ name: "account", type: "address" }],
					outputs: [{ name: "", type: "uint256" }],
				},
			] as const

			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
			console.log("🏦 PRODUCTION: Transfer USDC from Oracle")
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
			console.log("  Oracle:", oracleAddress)
			console.log("  To:", params.custodialWallet)
			console.log("  Amount:", params.amount, "USDC")
			console.log("  Chain:", chain.name, `(${params.chainId})`)

			// Step 1: Check oracle wallet balance FIRST
			const oracleBalance = await publicClient.readContract({
				address: params.tokenAddress as Address,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [oracleAddress],
			})

			const oracleBalanceFormatted = formatUnits(oracleBalance, decimals)
			console.log("  Oracle Balance:", oracleBalanceFormatted, "USDC")

			// Step 2: If insufficient balance, return error with details
			if (oracleBalance < requiredAmount) {
				console.log("  ❌ Insufficient oracle balance!")
				console.log("  Required:", params.amount, "USDC")
				console.log("  Available:", oracleBalanceFormatted, "USDC")
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

				return {
					success: false,
					status: "insufficient_balance",
					error: `Insufficient oracle balance. Required: ${params.amount} USDC, Available: ${oracleBalanceFormatted} USDC. Please add funds to hot wallet.`,
					oracleBalance: oracleBalanceFormatted,
					requiredAmount: params.amount,
				}
			}

			// Step 3: Execute ERC20 transfer
			console.log("  ✅ Balance sufficient, executing transfer...")

			const hash = await walletClient.writeContract({
				address: params.tokenAddress as Address,
				abi: erc20Abi,
				functionName: "transfer",
				args: [params.custodialWallet as Address, requiredAmount],
			})

			console.log("  Transaction hash:", hash)
			console.log("  Waiting for confirmation...")

			// Wait for transaction confirmation
			const receipt = await publicClient.waitForTransactionReceipt({ hash })

			if (receipt.status !== "success") {
				console.log("  ❌ Transaction failed!")
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
				return {
					success: false,
					status: "failed",
					error: "Transaction failed on-chain",
					txHash: hash,
				}
			}

			// Step 4: Get balance after transfer
			const oracleBalanceAfter = await publicClient.readContract({
				address: params.tokenAddress as Address,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [oracleAddress],
			})

			const oracleBalanceAfterFormatted = formatUnits(oracleBalanceAfter, decimals)

			console.log("  ✅ Transfer successful!")
			console.log("  Amount transferred:", params.amount, "USDC")
			console.log("  Oracle balance after:", oracleBalanceAfterFormatted, "USDC")
			console.log("  Block number:", receipt.blockNumber)
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

			return {
				success: true,
				status: "completed",
				txHash: hash,
				blockNumber: receipt.blockNumber,
				amountTransferred: params.amount,
				oracleBalance: oracleBalanceFormatted,
				oracleBalanceAfter: oracleBalanceAfterFormatted,
			}
		} catch (error) {
			console.error("[TokenTransferService] Transfer error:", error)
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
			return {
				success: false,
				status: "failed",
				error: error instanceof Error ? error.message : "Unknown error",
			}
		}
	}

	/**
	 * Get chain config by chain ID
	 */
	private getChainConfig(chainId: string): Chain | undefined {
		const chains: Record<string, Chain> = {
			"1": mainnet, // Ethereum Mainnet
			"11155111": sepolia, // Sepolia testnet
			"84532": baseSepolia, // Base Sepolia testnet
		}
		return chains[chainId]
	}

	/**
	 * Verify token transfer on-chain
	 *
	 * For production: Checks real blockchain transaction
	 * For mock/testnet: Simulates verification (always returns true)
	 */
	async verifyTransfer(params: VerifyTransferParams): Promise<TransferVerificationResult> {
		if (this.isMockMode) {
			return this.mockVerifyTransfer(params)
		}

		return this.realVerifyTransfer(params)
	}

	/**
	 * Mock verification (for testing/development)
	 * Always returns successful verification
	 */
	private async mockVerifyTransfer(params: VerifyTransferParams): Promise<TransferVerificationResult> {
		console.log("[MOCK] Token Transfer Verification:", {
			chain: params.chain,
			token: params.tokenAddress,
			amount: params.expectedAmount,
			txHash: params.transactionHash,
			to: params.toAddress,
		})

		// Simulate 1 second delay (realistic blockchain query)
		await new Promise((resolve) => setTimeout(resolve, 1000))

		// Mock successful verification
		return {
			verified: true,
			actualAmount: params.expectedAmount,
			from: "0x0000000000000000000000000000000000000001", // Mock sender
			blockNumber: Math.floor(Date.now() / 1000), // Mock block number
		}
	}

	/**
	 * Real on-chain verification (for production)
	 * Uses viem to query blockchain and verify Transfer event
	 *
	 * TODO: Implement with viem when ready for mainnet
	 */
	private async realVerifyTransfer(params: VerifyTransferParams): Promise<TransferVerificationResult> {
		try {
			// TODO: Implement real verification with viem
			//
			// Steps:
			// 1. Create viem client for chain
			// 2. Get transaction receipt
			// 3. Find Transfer event in logs
			// 4. Verify:
			//    - Event signature matches ERC20 Transfer
			//    - Token address matches
			//    - Recipient matches custodial wallet
			//    - Amount >= expected amount
			//
			// Example implementation:
			/*
      const client = createPublicClient({
        chain: this.getChain(params.chain),
        transport: http(),
      });

      const receipt = await client.getTransactionReceipt({
        hash: params.transactionHash as `0x${string}`,
      });

      if (!receipt || receipt.status !== 'success') {
        return {
          verified: false,
          error: 'Transaction failed or not found',
        };
      }

      // ERC20 Transfer event signature
      const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

      const transferLog = receipt.logs.find(log =>
        log.topics[0] === transferEventSignature &&
        log.address.toLowerCase() === params.tokenAddress.toLowerCase() &&
        log.topics[2]?.toLowerCase() === params.toAddress.toLowerCase().padStart(66, '0')
      );

      if (!transferLog) {
        return {
          verified: false,
          error: 'Transfer event not found in transaction',
        };
      }

      // Verify amount
      const transferredAmount = BigInt(transferLog.data);
      const expectedAmountBigInt = BigInt(params.expectedAmount);

      if (transferredAmount < expectedAmountBigInt) {
        return {
          verified: false,
          error: `Insufficient amount: expected ${params.expectedAmount}, got ${transferredAmount}`,
        };
      }

      return {
        verified: true,
        actualAmount: transferredAmount.toString(),
        from: log.topics[1] ? '0x' + log.topics[1].slice(26) : undefined,
        blockNumber: Number(receipt.blockNumber),
      };
      */

			throw new Error("Real token verification not yet implemented. Set NODE_ENV=development to use mock mode.")
		} catch (error) {
			console.error("[TokenTransferService] Verification error:", error)
			return {
				verified: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}
		}
	}

	/**
	 * Get viem chain config by chain ID
	 * TODO: Implement when adding viem
	 */
	private getChain(chainId: string): any {
		// const chains: Record<string, Chain> = {
		//   '8453': base,
		//   '1': mainnet,
		//   '137': polygon,
		//   '10': optimism,
		//   '42161': arbitrum,
		// };
		// return chains[chainId];
		throw new Error("Not implemented")
	}
}
