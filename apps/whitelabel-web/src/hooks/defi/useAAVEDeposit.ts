import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, parseUnits } from "viem"
import { usePublicClient, useWriteContract } from "wagmi"

import { AAVE_POOL_ABI, AAVE_POOL_ADDRESS } from "@/lib/contracts/aave"
import { openBlockscout } from "@/lib/utils/blockscout"
import { useVaultStore } from "@/store/vaultStore"

/**
 * Hook to deposit USDC into AAVE protocol
 *
 * @example
 * const { mutate: deposit, isPending } = useAAVEDeposit()
 *
 * deposit({
 *   amount: "1000", // USDC amount
 *   onBehalfOf: custodialWalletAddress,
 * })
 */
export const useAAVEDeposit = () => {
	const { writeContractAsync } = useWriteContract()
	const publicClient = usePublicClient()
	const queryClient = useQueryClient()
	const addTransaction = useVaultStore((state) => state.addTransaction)

	return useMutation({
		mutationFn: async ({
			amount,
			onBehalfOf,
			tokenAddress,
		}: {
			amount: string
			onBehalfOf: Address
			tokenAddress: Address
		}) => {
			if (!publicClient) throw new Error("Public client not available")

			console.log("Depositing to AAVE:", {
				amount,
				onBehalfOf,
				tokenAddress,
			})

			// Parse amount to base units (USDC has 6 decimals)
			const amountInBaseUnits = parseUnits(amount, 6)

			// Execute AAVE supply transaction
			const hash = await writeContractAsync({
				address: AAVE_POOL_ADDRESS,
				abi: AAVE_POOL_ABI,
				functionName: "supply",
				args: [
					tokenAddress, // asset (USDC)
					amountInBaseUnits, // amount
					onBehalfOf, // onBehalfOf (custodial wallet)
					0, // referralCode
				],
			})

			console.log("AAVE deposit transaction sent:", { hash })

			// Wait for confirmation
			const receipt = await publicClient.waitForTransactionReceipt({ hash })

			console.log("AAVE deposit confirmed:", {
				hash,
				blockNumber: receipt.blockNumber,
				status: receipt.status,
			})

			// Add to local transaction store
			addTransaction({
				id: hash,
				type: "aave_deposit",
				protocol: "AAVE",
				amount,
				token: "USDC",
				status: receipt.status === "success" ? "confirmed" : "failed",
				timestamp: Date.now(),
				txHash: hash,
			})

			return { hash, receipt }
		},
		onSuccess: (result, variables) => {
			// Invalidate portfolio queries to refresh balances
			queryClient.invalidateQueries({ queryKey: ["portfolio"] })
			queryClient.invalidateQueries({ queryKey: ["aave-balance"] })
			queryClient.invalidateQueries({ queryKey: ["vault-index"] })

			toast.success("AAVE Deposit Successful! 🎉", {
				description: `Deposited ${variables.amount} USDC to AAVE`,
				duration: 5000,
				action: {
					label: "View on Explorer",
					onClick: () => {
						openBlockscout("tx", result.hash, "sepolia")
					},
				},
			})
		},
		onError: (error: Error) => {
			console.error("AAVE deposit failed:", error)

			toast.error("AAVE Deposit Failed", {
				description: error.message.includes("User rejected") ? "Transaction was cancelled by user" : error.message,
			})
		},
	})
}

/**
 * Hook to withdraw USDC from AAVE protocol
 */
export const useAAVEWithdraw = () => {
	const { writeContractAsync } = useWriteContract()
	const publicClient = usePublicClient()
	const queryClient = useQueryClient()
	const addTransaction = useVaultStore((state) => state.addTransaction)

	return useMutation({
		mutationFn: async ({ amount, to, tokenAddress }: { amount: string; to: Address; tokenAddress: Address }) => {
			if (!publicClient) throw new Error("Public client not available")

			console.log("Withdrawing from AAVE:", {
				amount,
				to,
				tokenAddress,
			})

			const amountInBaseUnits = parseUnits(amount, 6)

			const hash = await writeContractAsync({
				address: AAVE_POOL_ADDRESS,
				abi: AAVE_POOL_ABI,
				functionName: "withdraw",
				args: [
					tokenAddress, // asset (USDC)
					amountInBaseUnits, // amount
					to, // to (custodial wallet)
				],
			})

			const receipt = await publicClient.waitForTransactionReceipt({ hash })

			addTransaction({
				id: hash,
				type: "aave_withdraw",
				protocol: "AAVE",
				amount,
				token: "USDC",
				status: receipt.status === "success" ? "confirmed" : "failed",
				timestamp: Date.now(),
				txHash: hash,
			})

			return { hash, receipt }
		},
		onSuccess: (result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio"] })
			queryClient.invalidateQueries({ queryKey: ["aave-balance"] })
			queryClient.invalidateQueries({ queryKey: ["vault-index"] })

			toast.success("AAVE Withdrawal Successful! 💰", {
				description: `Withdrew ${variables.amount} USDC from AAVE`,
				duration: 5000,
				action: {
					label: "View on Explorer",
					onClick: () => {
						openBlockscout("tx", result.hash, "sepolia")
					},
				},
			})
		},
		onError: (error: Error) => {
			console.error("AAVE withdrawal failed:", error)

			toast.error("AAVE Withdrawal Failed", {
				description: error.message.includes("User rejected") ? "Transaction was cancelled by user" : error.message,
			})
		},
	})
}
