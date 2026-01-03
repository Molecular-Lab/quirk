/**
 * EarnDepositModal - Deposit USDC into DeFi protocols
 *
 * Uses custodial backend execution (production environment for real DeFi staking).
 * Flow: input → allocations → confirm → processing → success/error
 */

import { useEffect, useMemo, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Check, ExternalLink, Info, Loader2, TrendingUp } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDepositExecution, useGasEstimate, usePrepareDeposit } from "@/hooks/defi/useDefiExecution"
import { useClientWalletBalance } from "@/hooks/useClientWalletBalance"
import { useProducts } from "@/hooks/useProducts"
import { useEnvironmentStore } from "@/store/environmentStore"

// ============================================================================
// Types
// ============================================================================

interface EarnDepositModalProps {
	isOpen: boolean
	onClose: () => void
	onComplete?: () => void
	defaultAmount?: string
	configuredRiskProfile?: RiskLevel
	configuredBlendedAPY?: string
	hasConfiguredStrategy?: boolean
}

type Step = "input" | "allocations" | "confirm" | "processing" | "success" | "error"
type RiskLevel = "conservative" | "moderate" | "aggressive"

interface ProtocolAllocation {
	protocol: "aave" | "compound" | "morpho"
	percentage: number
	amount: number
	expectedAPY: string
}

// ============================================================================
// Constants
// ============================================================================

const PROTOCOL_INFO = {
	aave: { name: "AAVE", color: "#B6509E", description: "Battle-tested lending protocol" },
	compound: { name: "Compound", color: "#00D395", description: "Algorithmic money market" },
	morpho: { name: "Morpho", color: "#4B5563", description: "Optimized P2P lending" },
}

// const RISK_LEVELS: { value: RiskLevel; label: string; description: string }[] = [
//     { value: "conservative", label: "Conservative", description: "Lower risk, stable returns (AAVE-heavy)" },
//     { value: "moderate", label: "Moderate", description: "Balanced risk-return profile" },
//     { value: "aggressive", label: "Aggressive", description: "Higher risk, higher potential returns" },
// ]

const MIN_DEPOSIT = 10 // Minimum $10 deposit

// ============================================================================
// Component
// ============================================================================

export function EarnDepositModal({
	isOpen,
	onClose,
	onComplete,
	defaultAmount = "",
	configuredRiskProfile,
	configuredBlendedAPY,
	hasConfiguredStrategy = false,
}: EarnDepositModalProps) {
	const queryClient = useQueryClient()
	const { authenticated } = usePrivy()
	// activeProductId is used by the execution hooks internally
	useProducts()

	// Get current environment (sandbox or production)
	const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)

	// Form state
	const [step, setStep] = useState<Step>("input")
	const [amount, setAmount] = useState(defaultAmount)
	// ✅ Use configured risk profile if available, otherwise default to "moderate"
	const [riskLevel, setRiskLevel] = useState<RiskLevel>(configuredRiskProfile || "moderate")
	const [errorMessage, setErrorMessage] = useState("")
	const [txHashes, setTxHashes] = useState<string[]>([])

	// API hooks - environment comes from store
	const depositMutation = useDepositExecution()
	const prepareMutation = usePrepareDeposit()
	const { data: gasEstimate, isLoading: gasLoading } = useGasEstimate(
		amount && parseFloat(amount) >= MIN_DEPOSIT ? { amount, riskLevel } : undefined,
	)

	// Client wallet balance - fetch from backend API (platform vault, not end-user)
	const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useClientWalletBalance()
	const currentBalance = balanceData?.totalBalance || 0
	const currentAPY = "0%" // Client vault doesn't have APY, it's calculated per end-user

	// Computed values
	const numericAmount = useMemo(() => {
		const parsed = parseFloat(amount)
		return isNaN(parsed) ? 0 : parsed
	}, [amount])

	// Note: Deposits have no upper limit - users can always deposit more
	// Only validate minimum deposit amount
	const isValidAmount = numericAmount >= MIN_DEPOSIT

	// Allocations from prepare mutation
	const allocations: ProtocolAllocation[] = useMemo(() => {
		if (prepareMutation.data?.allocation) {
			return prepareMutation.data.allocation.map((a) => ({
				...a,
				amount: numericAmount * (a.percentage / 100),
			}))
		}
		// Default allocations based on risk level
		const defaults: Record<RiskLevel, ProtocolAllocation[]> = {
			conservative: [
				{ protocol: "aave", percentage: 70, amount: numericAmount * 0.7, expectedAPY: "3.5%" },
				{ protocol: "compound", percentage: 20, amount: numericAmount * 0.2, expectedAPY: "3.2%" },
				{ protocol: "morpho", percentage: 10, amount: numericAmount * 0.1, expectedAPY: "4.0%" },
			],
			moderate: [
				{ protocol: "aave", percentage: 40, amount: numericAmount * 0.4, expectedAPY: "3.5%" },
				{ protocol: "compound", percentage: 30, amount: numericAmount * 0.3, expectedAPY: "3.2%" },
				{ protocol: "morpho", percentage: 30, amount: numericAmount * 0.3, expectedAPY: "4.0%" },
			],
			aggressive: [
				{ protocol: "aave", percentage: 20, amount: numericAmount * 0.2, expectedAPY: "3.5%" },
				{ protocol: "compound", percentage: 30, amount: numericAmount * 0.3, expectedAPY: "3.2%" },
				{ protocol: "morpho", percentage: 50, amount: numericAmount * 0.5, expectedAPY: "4.0%" },
			],
		}
		return defaults[riskLevel]
	}, [prepareMutation.data, riskLevel, numericAmount])

	const blendedAPY = useMemo(() => {
		// ✅ Use configured blended APY if available
		if (hasConfiguredStrategy && configuredBlendedAPY) {
			return `${configuredBlendedAPY}%`
		}
		if (prepareMutation.data?.expectedBlendedAPY) {
			return prepareMutation.data.expectedBlendedAPY
		}
		// Calculate from allocations
		const totalAPY = allocations.reduce((sum, a) => {
			const apy = parseFloat(a.expectedAPY.replace("%", ""))
			return sum + (apy * a.percentage) / 100
		}, 0)
		return `${totalAPY.toFixed(2)}%`
	}, [prepareMutation.data, allocations, hasConfiguredStrategy, configuredBlendedAPY])

	// Reset state when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setStep("input")
			setAmount(defaultAmount)
			// ✅ Reset to configured risk profile if available
			setRiskLevel(configuredRiskProfile || "moderate")
			setErrorMessage("")
			setTxHashes([])
			depositMutation.reset()
			prepareMutation.reset()
		}
	}, [isOpen, defaultAmount])

	// Show error toast when balance fetch fails
	useEffect(() => {
		if (balanceError) {
			toast.error("Failed to load balance", {
				description: "Please check your connection and try again",
			})
		}
	}, [balanceError])

	// Handle close
	const handleClose = () => {
		setStep("input")
		setAmount("")
		setErrorMessage("")
		setTxHashes([])
		depositMutation.reset()
		prepareMutation.reset()
		onClose()
	}

	// Handle amount input
	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9.]/g, "")
		if (value === "" || /^\d*\.?\d*$/.test(value)) {
			setAmount(value)
		}
	}

	// Handle max button - sets to current balance
	const handleMax = () => {
		setAmount(currentBalance.toString())
	}

	// Handle continue to allocations
	const handleContinue = async () => {
		if (!isValidAmount) return

		// Prepare deposit to get allocations
		try {
			await prepareMutation.mutateAsync({ amount, riskLevel })
		} catch (e) {
			// Use default allocations if prepare fails
			console.warn("Failed to prepare deposit, using defaults:", e)
		}

		setStep("allocations")
	}

	// Handle confirm
	const handleConfirm = () => {
		setStep("confirm")
	}

	// Handle execute deposit
	const handleDeposit = async () => {
		setStep("processing")

		try {
			const result = await depositMutation.mutateAsync({
				amount,
				riskLevel,
				environment: apiEnvironment, // Use current environment from store
			})

			if (result.success) {
				setTxHashes(result.transactionHashes)
				setStep("success")

				// Invalidate queries
				queryClient.invalidateQueries({ queryKey: ["userBalance"] })
				queryClient.invalidateQueries({ queryKey: ["vault-index"] })
				queryClient.invalidateQueries({ queryKey: ["clientWalletBalance"] })
			} else {
				setErrorMessage(result.error || "Transaction failed")
				setStep("error")
			}
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Failed to execute deposit")
			setStep("error")
		}
	}

	// Handle complete
	const handleComplete = () => {
		onComplete?.()
		handleClose()
	}

	// Handle retry
	const handleRetry = () => {
		setStep("confirm")
		setErrorMessage("")
		depositMutation.reset()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
						<TrendingUp className="w-6 h-6 text-green-600" />
						{step === "input" && "Start Earning"}
						{step === "allocations" && "Protocol Allocations"}
						{step === "confirm" && "Confirm Deposit"}
						{step === "processing" && "Processing..."}
						{step === "success" && "Deposit Successful!"}
						{step === "error" && "Deposit Failed"}
					</DialogTitle>
				</DialogHeader>

				{/* Sandbox Warning */}
				{apiEnvironment === "sandbox" && (
					<div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
						<div className="flex-1">
							<h4 className="font-semibold text-amber-900 text-sm">Earn features unavailable in Sandbox</h4>
							<p className="text-amber-700 text-xs mt-1">
								Mock USDC cannot access real DeFi protocols. Switch to Production mode to deposit funds and earn yield.
							</p>
						</div>
					</div>
				)}

				<div className="p-4">
					{/* Step 1: Input Amount */}
					{step === "input" && (
						<div className="space-y-5">
							{/* Amount Input */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<div className="flex justify-between items-center mb-2">
									<label className="text-sm font-medium text-gray-600">Deposit Amount</label>
									<span className="text-sm text-gray-500">
										{balanceLoading ? (
											<>
												Loading balance... <Loader2 className="w-3 h-3 animate-spin ml-1 inline" />
											</>
										) : balanceError ? (
											<span className="text-red-500">Error loading balance</span>
										) : (
											<>
												Current Balance: ${currentBalance.toLocaleString()} ({currentAPY} APY)
											</>
										)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-2xl font-bold text-gray-400">$</span>
									<input
										type="text"
										inputMode="decimal"
										value={amount}
										onChange={handleAmountChange}
										placeholder="0.00"
										className="text-3xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900"
									/>
									<Button variant="outline" size="sm" onClick={handleMax} className="text-xs font-semibold">
										MAX
									</Button>
								</div>
								{numericAmount > 0 && numericAmount < MIN_DEPOSIT && (
									<p className="text-red-500 text-sm mt-2">Minimum deposit: ${MIN_DEPOSIT}</p>
								)}
							</div>

							{/* Production Mode Notice */}
							<div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
								<Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
								<p className="text-xs text-blue-700">
									Your funds will be staked into real DeFi protocols (AAVE, Compound, Morpho) on mainnet. Earnings are
									accrued daily.
								</p>
							</div>

							{/* Continue Button */}
							<Button
								onClick={handleContinue}
								disabled={
									!isValidAmount || !authenticated || balanceLoading || !!balanceError || apiEnvironment === "sandbox"
								}
								className="w-full py-4 rounded-2xl font-bold text-lg"
							>
								{apiEnvironment === "sandbox"
									? "Earn unavailable in Sandbox - Switch to Production"
									: balanceLoading
										? "Loading balance..."
										: balanceError
											? "Cannot proceed - balance error"
											: "Continue"}
							</Button>
						</div>
					)}

					{/* Step 2: Allocations */}
					{step === "allocations" && (
						<div className="space-y-5">
							<div className="text-center mb-4">
								<p className="text-2xl font-bold text-gray-900">${numericAmount.toLocaleString()}</p>
								<p className="text-sm text-gray-500">will be allocated across protocols</p>
							</div>

							{/* Protocol Allocations */}
							<div className="space-y-3">
								{allocations.map((alloc) => {
									const info = PROTOCOL_INFO[alloc.protocol]
									return (
										<div key={alloc.protocol} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
											<div className="flex justify-between items-center mb-2">
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
													<span className="font-semibold text-gray-900">{info.name}</span>
												</div>
												<span className="text-sm text-gray-500">{alloc.expectedAPY} APY</span>
											</div>
											<div className="flex justify-between items-center">
												<div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
													<div
														className="h-2 rounded-full transition-all"
														style={{
															width: `${alloc.percentage}%`,
															backgroundColor: info.color,
														}}
													/>
												</div>
												<div className="text-right">
													<p className="font-bold text-gray-900">${alloc.amount.toFixed(2)}</p>
													<p className="text-xs text-gray-500">{alloc.percentage}%</p>
												</div>
											</div>
										</div>
									)
								})}
							</div>

							{/* Gas Estimate */}
							<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Estimated Gas</span>
									{gasLoading ? (
										<Loader2 className="w-4 h-4 animate-spin text-gray-400" />
									) : (
										<span className="font-semibold text-gray-900">~${gasEstimate?.estimatedCostUSD || "0.50"}</span>
									)}
								</div>
							</div>

							{/* Buttons */}
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => {
										setStep("input")
									}}
									className="flex-1 py-4 rounded-2xl font-bold"
								>
									Back
								</Button>
								<Button onClick={handleConfirm} className="flex-1 py-4 rounded-2xl font-bold">
									Confirm Allocation
								</Button>
							</div>
						</div>
					)}

					{/* Step 3: Confirm */}
					{step === "confirm" && (
						<div className="space-y-5">
							<div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
								<div className="text-center mb-4">
									<p className="text-sm text-green-600 mb-1">You're depositing</p>
									<p className="text-4xl font-bold text-gray-900">${numericAmount.toLocaleString()}</p>
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600">Risk Level</span>
										<span className="font-semibold text-gray-900 capitalize">{riskLevel}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Expected APY</span>
										<span className="font-semibold text-green-600">{blendedAPY}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Gas Cost</span>
										<span className="font-semibold text-gray-900">~${gasEstimate?.estimatedCostUSD || "0.50"}</span>
									</div>
								</div>
							</div>

							{/* Protocol Summary */}
							<div className="flex gap-2">
								{allocations.map((alloc) => {
									const info = PROTOCOL_INFO[alloc.protocol]
									return (
										<div
											key={alloc.protocol}
											className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-200"
										>
											<div
												className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
												style={{ backgroundColor: info.color }}
											>
												{alloc.percentage}%
											</div>
											<p className="text-xs font-semibold text-gray-900">{info.name}</p>
											<p className="text-xs text-gray-500">${alloc.amount.toFixed(0)}</p>
										</div>
									)
								})}
							</div>

							{/* Warning */}
							<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
								<AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
								<p className="text-xs text-amber-700">
									By proceeding, your funds will be staked into DeFi protocols. You can withdraw at any time, subject to
									protocol conditions.
								</p>
							</div>

							{/* Buttons */}
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => {
										setStep("allocations")
									}}
									className="flex-1 py-4 rounded-2xl font-bold"
								>
									Back
								</Button>
								<Button
									onClick={handleDeposit}
									className="flex-1 py-4 rounded-2xl font-bold bg-green-600 hover:bg-green-700"
								>
									Start Earning
								</Button>
							</div>
						</div>
					)}

					{/* Step 4: Processing */}
					{step === "processing" && (
						<div className="py-12 text-center">
							<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Staking your funds...</h3>
							<p className="text-sm text-gray-600">Processing deposits across {allocations.length} protocols</p>
							<div className="mt-6 space-y-2">
								{allocations.map((alloc) => (
									<div key={alloc.protocol} className="flex items-center justify-center gap-2 text-sm">
										<Loader2 className="w-4 h-4 animate-spin text-gray-400" />
										<span className="text-gray-600">
											{PROTOCOL_INFO[alloc.protocol].name}: ${alloc.amount.toFixed(2)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Step 5: Success */}
					{step === "success" && (
						<div className="py-8 text-center">
							<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
								<Check className="w-10 h-10 text-green-600" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">You're Now Earning!</h3>
							<p className="text-gray-600 mb-6">
								${numericAmount.toLocaleString()} has been staked across {allocations.length} protocols
							</p>

							<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Amount staked</span>
									<span className="font-semibold text-green-900">${numericAmount.toLocaleString()}</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Expected APY</span>
									<span className="font-semibold text-green-900">{blendedAPY}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-green-700">Daily earnings</span>
									<span className="font-semibold text-green-900">
										~${((numericAmount * parseFloat(blendedAPY)) / 100 / 365).toFixed(2)}/day
									</span>
								</div>

								{txHashes.length > 0 && (
									<div className="mt-4 pt-4 border-t border-green-200">
										<p className="text-xs text-green-600 mb-2">Transaction Hashes:</p>
										{txHashes.map((hash, i) => (
											<a
												key={i}
												href={`https://basescan.org/tx/${hash}`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-blue-800 transition-colors mb-1 block"
											>
												{hash.slice(0, 10)}...{hash.slice(-8)}
												<ExternalLink className="w-3 h-3" />
											</a>
										))}
									</div>
								)}
							</div>

							<Button
								onClick={handleComplete}
								className="w-full py-4 rounded-2xl font-bold text-lg bg-green-600 hover:bg-green-700"
							>
								Done
							</Button>
						</div>
					)}

					{/* Step 6: Error */}
					{step === "error" && (
						<div className="py-8 text-center">
							<div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
								<AlertTriangle className="w-10 h-10 text-red-600" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Failed</h3>
							<p className="text-gray-600 mb-6">{errorMessage || "Something went wrong. Please try again."}</p>

							<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
								<p className="text-sm text-red-700">
									Your funds have not been moved. Please try again or contact support if the issue persists.
								</p>
							</div>

							<div className="flex gap-3">
								<Button variant="outline" onClick={handleClose} className="flex-1 py-4 rounded-2xl font-bold">
									Cancel
								</Button>
								<Button onClick={handleRetry} className="flex-1 py-4 rounded-2xl font-bold">
									Try Again
								</Button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
