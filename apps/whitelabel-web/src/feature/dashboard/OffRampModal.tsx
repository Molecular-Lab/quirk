import { useState } from "react"

import { useMutation } from "@tanstack/react-query"
import { ArrowDown, Check } from "lucide-react"

import { batchCompleteWithdrawals } from "@/api/b2bClientHelpers"
import usdcLogo from "@/assets/usd-coin-usdc-logo.png"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEnvironmentStore } from "@/store/environmentStore"

interface OffRampModalProps {
	isOpen: boolean
	onClose: () => void
	selectedWithdrawalIds: string[]
	withdrawals: {
		id: string
		userId: string
		requestedAmount: string
		destination_currency?: string
	}[]
	onComplete: () => void
}

const FIAT_CURRENCIES = [
	{ code: "USD", name: "US Dollar", symbol: "$", fromUsdRate: 1.0 },
	{ code: "SGD", name: "Singapore Dollar", symbol: "S$", fromUsdRate: 1.35 }, // 1 USD = 1.35 SGD
	{ code: "EUR", name: "Euro", symbol: "€", fromUsdRate: 0.92 }, // 1 USD = 0.92 EUR
	{ code: "THB", name: "Thai Baht", symbol: "฿", fromUsdRate: 34.5 }, // 1 USD = 34.5 THB
	{ code: "TWD", name: "Taiwan Dollar", symbol: "NT$", fromUsdRate: 32.2 }, // 1 USD = 32.2 TWD
	{ code: "KRW", name: "Korean Won", symbol: "₩", fromUsdRate: 1410 }, // 1 USD = 1410 KRW
]

export function OffRampModal({ isOpen, onClose, selectedWithdrawalIds, withdrawals, onComplete }: OffRampModalProps) {
	const [fiatCurrency, setFiatCurrency] = useState("USD")
	const [step, setStep] = useState<"select" | "summary" | "processing" | "success" | "error">("select")
	const [errorMessage, setErrorMessage] = useState("")

	// Get environment from store
	const { apiEnvironment, getConfig } = useEnvironmentStore()
	const networkConfig = getConfig()
	const isSandbox = apiEnvironment === "sandbox"

	console.log("[OffRampModal] Environment context:", {
		apiEnvironment,
		network: networkConfig.name,
		isTestnet: networkConfig.isTestnet,
	})

	// Mutation hook for batch completing withdrawals
	const batchCompleteMutation = useMutation({
		mutationFn: async (data: { withdrawalIds: string[]; destinationCurrency: string }) => {
			console.log("[OffRampModal] Starting batch off-ramp for withdrawals:", selectedWithdrawals)
			const response = await batchCompleteWithdrawals(data.withdrawalIds, data.destinationCurrency)

			console.log("[OffRampModal] Batch complete response:", response)
			console.log(`✅ ${response.totalProcessed} withdrawals completed`)
			console.log(`💰 Total fiat to send: ${response.totalAmount} ${data.destinationCurrency}`)

			return response
		},
		onSuccess: (data) => {
			console.log("[OffRampModal] Mutation success:", data)
			console.log("[OffRampModal] ✅ Off-ramp completed - Fiat transfer initiated")

			// Show success after brief delay
			setTimeout(() => {
				setStep("success")
			}, 1000)
		},
		onError: (error) => {
			console.error("[OffRampModal] Mutation error:", error)
			setErrorMessage(error instanceof Error ? error.message : "Failed to process off-ramp. Please try again.")
			setTimeout(() => {
				setStep("error")
			}, 500)
		},
	})

	// Reset state when modal closes
	const handleClose = () => {
		setStep("select")
		setFiatCurrency("USD")
		setErrorMessage("")
		batchCompleteMutation.reset()
		onClose()
	}

	// Calculate amounts
	const selectedWithdrawals = withdrawals.filter((w) => selectedWithdrawalIds.includes(w.id))
	const usdcAmount = selectedWithdrawals.reduce((sum, w) => sum + parseFloat(w.requestedAmount), 0)

	// Currency selection
	const selectedFiatCurrency = FIAT_CURRENCIES.find((c) => c.code === fiatCurrency) || FIAT_CURRENCIES[0]
	const fiatSymbol = selectedFiatCurrency.symbol

	// Fees (simplified for demo)
	const networkFee = 0.5 // USD
	const platformFee = usdcAmount * 0.001 // 0.1%
	const totalFees = networkFee + platformFee
	const netFiatAmount = (usdcAmount - totalFees) * selectedFiatCurrency.fromUsdRate

	const handleContinue = () => {
		setStep("summary")
	}

	const handleProcess = () => {
		setStep("processing")

		// Execute batch complete mutation
		batchCompleteMutation.mutate({
			withdrawalIds: selectedWithdrawalIds,
			destinationCurrency: fiatCurrency,
		})
	}

	const handleComplete = () => {
		onComplete()
		handleClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-[520px] w-full">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-900">
						{step === "select" && "Send Fiat"}
						{step === "summary" && "Off-Ramp Summary"}
						{step === "processing" && "Processing Off-Ramp..."}
						{step === "success" && "Off-Ramp Successful!"}
						{step === "error" && "Off-Ramp Failed"}
					</DialogTitle>
				</DialogHeader>

				{/* Content */}
				<div className="p-4">
					{step === "select" && (
						<div className="space-y-4">
							{/* From (Crypto) */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<label className="block text-xs font-medium text-gray-500 mb-3">Converting from</label>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={usdcAmount.toFixed(2)}
										readOnly
										className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900"
									/>
									<div className="flex items-center gap-2 bg-white border-2 border-blue-500 rounded-xl px-3 py-2">
										<img src={usdcLogo} alt="USDC" className="w-6 h-6 rounded-full" />
										<span className="font-bold text-gray-900">USDC</span>
									</div>
								</div>
								<p className="text-sm text-gray-500 mt-3">≈ ${usdcAmount.toFixed(2)} USD</p>
							</div>

							{/* Arrow */}
							<div className="flex justify-center">
								<div className="bg-gray-100 rounded-full p-2">
									<ArrowDown className="w-5 h-5 text-gray-600" />
								</div>
							</div>

							{/* To (Fiat) */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<label className="block text-xs font-medium text-gray-500 mb-3">Users receive (approx.)</label>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={netFiatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										readOnly
										className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900"
									/>
									<Select value={fiatCurrency} onValueChange={setFiatCurrency}>
										<SelectTrigger className="w-[120px] bg-white border-2 border-gray-300 rounded-xl h-auto py-3 text-base font-bold text-gray-900 hover:border-gray-400 transition-colors shadow-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FIAT_CURRENCIES.map((currency) => (
												<SelectItem key={currency.code} value={currency.code} className="text-base font-bold">
													{currency.code}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<p className="text-sm text-gray-500 mt-3">To registered bank accounts</p>
							</div>

							{/* Continue Button */}
							<Button onClick={handleContinue} variant="default" className="w-full py-4 rounded-2xl font-bold text-lg">
								Continue
							</Button>
						</div>
					)}

					{step === "summary" && (
						<div className="space-y-4">
							{/* Environment Indicator */}
							<div
								className={`rounded-xl p-3 border-2 ${
									isSandbox ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"
								}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-xs font-semibold uppercase tracking-wide">
											{isSandbox ? "🧪 Sandbox Mode" : "⚠️ Production Mode"}
										</span>
									</div>
									<span className="text-xs font-medium">{networkConfig.name}</span>
								</div>
								<p className="text-xs mt-1" style={{ color: isSandbox ? "#92400e" : "#7f1d1d" }}>
									{isSandbox
										? "Using sandbox - Mock fiat transfer simulation"
										: "Using production - Real bank transfers will be initiated"}
								</p>
							</div>

							{/* Order Summary */}
							<div className="border border-gray-200 rounded-xl p-4">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Off-Ramp Details</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600">Withdrawals to process:</span>
										<span className="font-semibold text-gray-900">{selectedWithdrawalIds.length}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">USDC to convert:</span>
										<span className="font-semibold text-gray-900">{usdcAmount.toFixed(2)} USDC</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Exchange rate:</span>
										<span className="font-semibold text-gray-900">
											1 USD = {selectedFiatCurrency.fromUsdRate.toFixed(2)} {fiatCurrency}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Network fee:</span>
										<span className="font-semibold text-gray-900">~${networkFee.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Platform fee (0.1%):</span>
										<span className="font-semibold text-gray-900">~${platformFee.toFixed(2)}</span>
									</div>
									<div className="pt-2 border-t border-gray-200 flex justify-between">
										<span className="font-semibold text-gray-900">Users will receive:</span>
										<span className="font-bold text-gray-900">
											{fiatSymbol}
											{netFiatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
											{fiatCurrency}
										</span>
									</div>
								</div>
							</div>

							{/* Bank Transfer Info */}
							<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
								<p className="text-sm text-blue-700">
									<strong>💳 Bank Transfer:</strong> Fiat will be sent to each user's registered bank account. Ensure bank
									details are configured in Product Config.
								</p>
							</div>

							{/* Process Button */}
							<Button onClick={handleProcess} variant="default" className="w-full py-4 rounded-2xl font-bold text-lg">
								Process Off-Ramp
							</Button>
						</div>
					)}

					{step === "processing" && (
						<div className="py-12 text-center">
							<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-orange-600 mb-4"></div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Processing off-ramp...</h3>
							<p className="text-sm text-gray-600">Converting USDC to {fiatCurrency} and initiating transfers</p>
						</div>
					)}

					{step === "success" && (
						<div className="py-8 text-center">
							<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
								<Check className="w-10 h-10 text-green-600" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Off-Ramp Successful!</h3>
							<p className="text-gray-600 mb-6">
								{selectedWithdrawalIds.length} withdrawal{selectedWithdrawalIds.length > 1 ? "s have" : " has"} been
								processed successfully.
							</p>
							<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Withdrawals processed:</span>
									<span className="font-semibold text-green-900">{selectedWithdrawalIds.length}</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">USDC converted:</span>
									<span className="font-semibold text-green-900">{usdcAmount.toFixed(2)} USDC</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Fiat transferred:</span>
									<span className="font-semibold text-green-900">
										{fiatSymbol}
										{netFiatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
										{fiatCurrency}
									</span>
								</div>
								{batchCompleteMutation.data?.completedWithdrawals?.[0] && (
									<div className="mt-3 pt-3 border-t border-green-200">
										<span className="text-xs text-green-600 block mb-2">Settlement Reference:</span>
										<span className="text-xs font-mono text-green-800">
											OFFRAMP-{Date.now().toString(36).toUpperCase()}
										</span>
									</div>
								)}
							</div>
							<Button onClick={handleComplete} variant="default" className="w-full py-4 rounded-2xl font-bold text-lg">
								Done
							</Button>
						</div>
					)}

					{step === "error" && (
						<div className="py-8 text-center">
							<div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
								<svg
									className="w-10 h-10 text-red-600"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path d="M6 18L18 6M6 6l12 12"></path>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Off-Ramp Failed</h3>
							<p className="text-gray-600 mb-6">{errorMessage || "Something went wrong. Please try again."}</p>
							<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
								<p className="text-sm text-red-700">
									The off-ramp could not be processed. User funds have been preserved. Please try again or contact
									support if the issue persists.
								</p>
							</div>
							<div className="flex gap-3">
								<Button
									onClick={handleClose}
									className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-2xl font-bold text-lg"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										setStep("select")
										setErrorMessage("")
										batchCompleteMutation.reset()
									}}
									variant="default"
									className="flex-1 py-4 rounded-2xl font-bold text-lg"
								>
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
