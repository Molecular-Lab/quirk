import { useState } from "react"

import { useMutation } from "@tanstack/react-query"
import { ArrowDown, Check, ExternalLink } from "lucide-react"

import { batchCompleteDeposits } from "@/api/b2bClientHelpers"
import usdcLogo from "@/assets/usd-coin-usdc-logo.png"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEnvironmentStore } from "@/store/environmentStore"

interface OnRampModalProps {
	isOpen: boolean
	onClose: () => void
	selectedOrderIds: string[]
	orders: {
		orderId: string
		amount: string
		currency: string
	}[]
	onComplete: () => void
}

const FIAT_CURRENCIES = [
	{ code: "USD", name: "US Dollar", symbol: "$", toUsdRate: 1.0 },
	{ code: "SGD", name: "Singapore Dollar", symbol: "S$", toUsdRate: 0.74 }, // 1 SGD = 0.74 USD
	{ code: "EUR", name: "Euro", symbol: "€", toUsdRate: 1.09 }, // 1 EUR = 1.09 USD
	{ code: "THB", name: "Thai Baht", symbol: "฿", toUsdRate: 0.029 }, // 1 THB = 0.029 USD
	{ code: "TWD", name: "Taiwan Dollar", symbol: "NT$", toUsdRate: 0.031 }, // 1 TWD = 0.031 USD
	{ code: "KRW", name: "Korean Won", symbol: "₩", toUsdRate: 0.00071 }, // 1 KRW = 0.00071 USD
]

const CRYPTO_TOKENS = [
	{ symbol: "USDC", name: "USD Coin", enabled: true },
	{ symbol: "USDT", name: "Tether", enabled: false },
	{ symbol: "PYUSD", name: "PayPal USD", enabled: false },
	{ symbol: "BTC", name: "Bitcoin", enabled: false },
	{ symbol: "ETH", name: "Ethereum", enabled: false },
	{ symbol: "SOL", name: "Solana", enabled: false },
]

export function OnRampModal({ isOpen, onClose, selectedOrderIds, orders, onComplete }: OnRampModalProps) {
	const [fiatCurrency, setFiatCurrency] = useState("USD")
	const [cryptoToken, setCryptoToken] = useState("USDC")
	const [step, setStep] = useState<"select" | "summary" | "processing" | "success" | "error">("select")
	const [errorMessage, setErrorMessage] = useState("")

	// Get environment from store
	const { apiEnvironment, getConfig } = useEnvironmentStore()
	const networkConfig = getConfig()
	const isSandbox = apiEnvironment === "sandbox"

	console.log("[OnRampModal] Environment context:", {
		apiEnvironment,
		network: networkConfig.name,
		isTestnet: networkConfig.isTestnet,
		oracleEnvVar: isSandbox ? "ORACLE_SANDBOX" : "ORACLE_PROD",
	})

	// Mutation hook for batch completing deposits
	const batchCompleteMutation = useMutation({
		mutationFn: async (data: { orderIds: string[]; paidCurrency: string }) => {
			console.log("[OnRampModal] Starting batch purchase for orders:", selectedOrders)
			const response = await batchCompleteDeposits(data)

			console.log("[OnRampModal] Batch complete response:", response)
			console.log(`✅ ${data.orderIds.length} orders completed`)
			console.log(`💰 Total USDC transferred: ${response.totalUSDC}`)
			console.log(`🏦 Custodial wallet: ${response.custodialWallet}`)
			console.log(`🔗 Transaction hash:`, response.completedOrders?.[0]?.transferTxHash)

			return response
		},
		onSuccess: (data) => {
			console.log("[OnRampModal] Mutation success:", data)
			console.log("[OnRampModal] ✅ Deposit completed - Balance will update automatically")

			// Show success after brief delay
			setTimeout(() => {
				setStep("success")
			}, 1000)
		},
		onError: (error) => {
			console.error("[OnRampModal] Mutation error:", error)
			setErrorMessage(error instanceof Error ? error.message : "Failed to process payment. Please try again.")
			setTimeout(() => {
				setStep("error")
			}, 500)
		},
	})

	// Reset state when modal closes
	const handleClose = () => {
		setStep("select")
		setFiatCurrency("USD")
		setCryptoToken("USDC")
		setErrorMessage("")
		batchCompleteMutation.reset()
		onClose()
	}

	// Calculate USDC amount (FIXED - based on orders in USD)
	const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.orderId))
	const usdcAmount = selectedOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0) // Assuming orders are in USD

	// Currency selection
	const selectedFiatCurrency = FIAT_CURRENCIES.find((c) => c.code === fiatCurrency) || FIAT_CURRENCIES[0]
	const fiatSymbol = selectedFiatCurrency.symbol

	// Calculate fiat amount needed to get the required USDC
	// fiatAmount = usdcAmount / toUsdRate
	// Example: Need 100 USDC, rate is 0.029 (THB), so need 100 / 0.029 = 3448.28 THB
	const fiatAmount = usdcAmount / selectedFiatCurrency.toUsdRate

	const handleContinue = () => {
		setStep("summary")
	}

	const handlePurchase = () => {
		setStep("processing")

		// Execute batch complete mutation
		batchCompleteMutation.mutate({
			orderIds: selectedOrderIds,
			paidCurrency: fiatCurrency,
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
						{step === "select" && "Buy Crypto"}
						{step === "summary" && "Order Summary"}
						{step === "processing" && "Processing Payment..."}
						{step === "success" && "Payment Successful!"}
						{step === "error" && "Payment Failed"}
					</DialogTitle>
				</DialogHeader>

				{/* Content */}
				<div className="p-4">
					{step === "select" && (
						<div className="space-y-4">
							{/* From (Fiat) */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<label className="block text-xs font-medium text-gray-500 mb-3">You pay</label>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={fiatAmount.toFixed(2)}
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
								<p className="text-sm text-gray-500 mt-3">≈ ${usdcAmount.toFixed(2)} USD</p>
							</div>

							{/* Arrow */}
							<div className="flex justify-center">
								<div className="bg-gray-100 rounded-full p-2">
									<ArrowDown className="w-5 h-5 text-gray-600" />
								</div>
							</div>

							{/* To (Crypto) */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<label className="block text-xs font-medium text-gray-500 mb-3">You receive</label>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={usdcAmount.toFixed(2)}
										readOnly
										className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900"
									/>
									<Select
										value={cryptoToken}
										onValueChange={(value) => {
											const token = CRYPTO_TOKENS.find((t) => t.symbol === value)
											if (token?.enabled) {
												setCryptoToken(value)
											}
										}}
									>
										<SelectTrigger className="w-auto bg-white border-2 border-blue-500 rounded-xl h-auto py-3 shadow-sm">
											<div className="flex items-center gap-2">
												<img src={usdcLogo} alt="USDC" className="w-6 h-6 rounded-full" />
												<SelectValue className="text-sm font-bold text-gray-900" />
											</div>
										</SelectTrigger>
										<SelectContent>
											{CRYPTO_TOKENS.map((token) => (
												<SelectItem
													key={token.symbol}
													value={token.symbol}
													disabled={!token.enabled}
													className="text-sm font-bold"
												>
													{token.symbol} {!token.enabled && "(Soon)"}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<p className="text-sm text-gray-500 mt-3">On Ethereum network</p>
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
									isSandbox
										? "bg-yellow-50 border-yellow-300"
										: "bg-red-50 border-red-300"
								}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-xs font-semibold uppercase tracking-wide">
											{isSandbox ? "🧪 Sandbox Mode" : "⚠️ Production Mode"}
										</span>
									</div>
									<span className="text-xs font-medium">
										{networkConfig.name}
									</span>
								</div>
								<p className="text-xs mt-1" style={{ color: isSandbox ? "#92400e" : "#7f1d1d" }}>
									{isSandbox
										? "Using testnet - No real funds will be transferred"
										: "Using mainnet - Real USDC will be transferred"}
								</p>
							</div>

							{/* Order Summary */}
							<div className="border border-gray-200 rounded-xl p-4">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Order Details</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600">Orders to process:</span>
										<span className="font-semibold text-gray-900">{selectedOrderIds.length}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Total amount:</span>
										<span className="font-semibold text-gray-900">
											{fiatSymbol}
											{fiatAmount.toFixed(2)} {fiatCurrency}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Exchange rate:</span>
										<span className="font-semibold text-gray-900">
											1 {fiatCurrency} = ${selectedFiatCurrency.toUsdRate.toFixed(4)} USD
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Network fee:</span>
										<span className="font-semibold text-gray-900">~$0.50</span>
									</div>
									<div className="pt-2 border-t border-gray-200 flex justify-between">
										<span className="font-semibold text-gray-900">You'll receive:</span>
										<span className="font-bold text-gray-900">{usdcAmount.toFixed(2)} USDC</span>
									</div>
								</div>
							</div>

							{/* Purchase Button */}
							<Button onClick={handlePurchase} variant="default" className="w-full py-4 rounded-2xl font-bold text-lg">
								Purchase
							</Button>
						</div>
					)}

					{step === "processing" && (
						<div className="py-12 text-center">
							<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Processing your payment...</h3>
							<p className="text-sm text-gray-600">Please wait while we confirm your transaction</p>
						</div>
					)}

					{step === "success" && (
						<div className="py-8 text-center">
							<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
								<Check className="w-10 h-10 text-green-600" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
							<p className="text-gray-600 mb-6">
								{selectedOrderIds.length} order{selectedOrderIds.length > 1 ? "s have" : " has"} been processed
								successfully.
							</p>
							<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Orders processed:</span>
									<span className="font-semibold text-green-900">{selectedOrderIds.length}</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Paid amount:</span>
									<span className="font-semibold text-green-900">
										{fiatSymbol}
										{fiatAmount.toFixed(2)} {fiatCurrency}
									</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">USDC minted:</span>
									<span className="font-semibold text-green-900">{usdcAmount.toFixed(2)} USDC</span>
								</div>
								{batchCompleteMutation.data?.completedOrders?.[0]?.transferTxHash && (
									<div className="mt-3 pt-3 border-t border-green-200">
										<span className="text-xs text-green-600 block mb-2">Transaction Hash:</span>
										<a
											href={`https://sepolia.etherscan.io/tx/${batchCompleteMutation.data.completedOrders[0].transferTxHash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-blue-800 transition-colors break-all"
										>
											{batchCompleteMutation.data.completedOrders[0].transferTxHash.slice(0, 10)}...
											{batchCompleteMutation.data.completedOrders[0].transferTxHash.slice(-8)}
											<ExternalLink className="w-3 h-3 flex-shrink-0" />
										</a>
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
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
							<p className="text-gray-600 mb-6">{errorMessage || "Something went wrong. Please try again."}</p>
							<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
								<p className="text-sm text-red-700">
									Your payment could not be processed. No charges have been made. Please try again or contact support if
									the issue persists.
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
