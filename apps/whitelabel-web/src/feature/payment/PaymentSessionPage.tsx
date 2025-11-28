import { useEffect, useState } from "react"

import { useNavigate, useParams } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Building2, Check, Clock, Copy, CreditCard, Loader2 } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"

interface PaymentInstructions {
	paymentMethod: "bank_transfer"
	currency: string
	amount: string
	reference: string
	bankName: string
	accountNumber: string
	accountName: string
	swiftCode: string
	bankCode?: string
	branchCode?: string
	routingNumber?: string
	iban?: string
	promptPayId?: string
	instructions: string
	paymentSessionUrl: string
}

interface DepositDetails {
	orderId: string
	status: "pending" | "completed" | "failed"
	paymentInstructions: PaymentInstructions
	expectedCryptoAmount?: string
	expiresAt: string
	createdAt: string
}

export function PaymentSessionPage() {
	const { orderId } = useParams({ from: "/payment-session/$orderId" })
	const navigate = useNavigate()

	const [deposit, setDeposit] = useState<DepositDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [copiedField, setCopiedField] = useState<string | null>(null)
	const [processingPayment, setProcessingPayment] = useState(false)
	const [paymentSuccess, setPaymentSuccess] = useState(false)

	// Fetch deposit details
	useEffect(() => {
		const fetchDeposit = async () => {
			try {
				setLoading(true)
				const response = await b2bApiClient.getDepositByOrderId(orderId)
				setDeposit(response as DepositDetails)
			} catch (err) {
				console.error("Failed to fetch deposit:", err)
				setError("Failed to load payment session. Please check the order ID.")
			} finally {
				setLoading(false)
			}
		}

		fetchDeposit()
	}, [orderId])

	// Copy to clipboard handler
	const handleCopy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopiedField(field)
			setTimeout(() => {
				setCopiedField(null)
			}, 2000)
		} catch (err) {
			console.error("Failed to copy:", err)
		}
	}

	// Simulate bank transfer (DEMO MODE)
	const handleSimulateTransfer = async () => {
		if (!deposit) return

		setProcessingPayment(true)

		try {
			// Simulate bank processing delay (3 seconds)
			await new Promise((resolve) => setTimeout(resolve, 3000))

			// Call mock confirm endpoint
			await b2bApiClient.mockConfirmFiatDeposit(orderId, {
				bankTransactionId: `BANK-${Date.now()}`,
				paidAmount: deposit.paymentInstructions.amount,
				paidCurrency: deposit.paymentInstructions.currency,
			})

			setPaymentSuccess(true)

			// Redirect to success page after 2 seconds
			setTimeout(() => {
				navigate({ to: "/dashboard" })
			}, 2000)
		} catch (err) {
			console.error("Payment simulation failed:", err)
			setError("Failed to simulate payment. Please try again.")
			setProcessingPayment(false)
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
					<p className="text-gray-300 text-lg">Loading payment session...</p>
				</div>
			</div>
		)
	}

	// Error state
	if (error || !deposit) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
				<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
					<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-white text-center mb-2">Payment Session Error</h2>
					<p className="text-gray-300 text-center mb-6">{error || "Order not found"}</p>
					<button
						onClick={() => navigate({ to: "/dashboard" })}
						className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Dashboard
					</button>
				</div>
			</div>
		)
	}

	// Use `any` for runtime-safety because backend may return partial shapes in some environments
	const _depositAny = deposit as any
	const paymentInstructions: PaymentInstructions = _depositAny.paymentInstructions ?? {
		paymentMethod: "bank_transfer",
		currency: _depositAny.paymentInstructions?.currency ?? "",
		amount: _depositAny.paymentInstructions?.amount ?? "",
		reference: _depositAny.paymentInstructions?.reference ?? deposit.orderId,
		bankName: _depositAny.paymentInstructions?.bankName ?? "",
		accountNumber: _depositAny.paymentInstructions?.accountNumber ?? "",
		accountName: _depositAny.paymentInstructions?.accountName ?? "",
		swiftCode: _depositAny.paymentInstructions?.swiftCode ?? "",
		bankCode: _depositAny.paymentInstructions?.bankCode,
		branchCode: _depositAny.paymentInstructions?.branchCode,
		routingNumber: _depositAny.paymentInstructions?.routingNumber,
		iban: _depositAny.paymentInstructions?.iban,
		promptPayId: _depositAny.paymentInstructions?.promptPayId,
		instructions: _depositAny.paymentInstructions?.instructions ?? "",
		paymentSessionUrl: _depositAny.paymentInstructions?.paymentSessionUrl ?? "",
	}

	// Payment success state
	if (paymentSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
				<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 text-center">
					<div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<Check className="w-12 h-12 text-green-400" />
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h2>
					<p className="text-gray-300 mb-6">
						Your deposit has been processed successfully. You'll receive{" "}
						<span className="font-semibold text-purple-400">{deposit.expectedCryptoAmount} USDC</span> in your vault.
					</p>
					<p className="text-sm text-gray-400">Redirecting to dashboard...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<button
						onClick={() => navigate({ to: "/dashboard" })}
						className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Dashboard
					</button>
					<h1 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h1>
					<p className="text-gray-400">Transfer funds to the bank account below to complete your deposit</p>
				</div>

				{/* Demo Notice */}
				<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
					<div className="flex gap-3">
						<AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-yellow-200 font-semibold mb-1">Demo Mode</p>
							<p className="text-yellow-100/80 text-sm">
								This is a demonstration. Click "Simulate Bank Transfer" below to simulate a successful payment without
								actual bank transfer.
							</p>
						</div>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{/* Left Column - Payment Details */}
					<div className="md:col-span-2 space-y-6">
						{/* Order Summary */}
						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
								<CreditCard className="w-5 h-5 text-purple-400" />
								Order Summary
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-400">Order ID</span>
									<span className="text-white font-mono">{deposit.orderId}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-400">Amount</span>
									<span className="text-white font-semibold text-lg">
										{paymentInstructions.amount} {paymentInstructions.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-400">Expected USDC</span>
									<span className="text-purple-400 font-semibold">{deposit.expectedCryptoAmount} USDC</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-400">Status</span>
									<span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
										Pending Payment
									</span>
								</div>
							</div>
						</div>

						{/* Bank Account Details */}
						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
								<Building2 className="w-5 h-5 text-purple-400" />
								Bank Transfer Instructions
							</h2>

							<div className="space-y-4">
								{/* Bank Name */}
								<div>
									<label className="text-sm text-gray-400 block mb-1">Bank Name</label>
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={paymentInstructions.bankName}
											readOnly
											className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-medium"
										/>
										<button
											onClick={() => handleCopy(paymentInstructions.bankName, "bankName")}
											className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
										>
											{copiedField === "bankName" ? (
												<Check className="w-5 h-5 text-green-400" />
											) : (
												<Copy className="w-5 h-5 text-gray-400" />
											)}
										</button>
									</div>
								</div>

								{/* Account Number */}
								<div>
									<label className="text-sm text-gray-400 block mb-1">Account Number</label>
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={paymentInstructions.accountNumber}
											readOnly
											className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
										/>
										<button
											onClick={() => handleCopy(paymentInstructions.accountNumber, "accountNumber")}
											className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
										>
											{copiedField === "accountNumber" ? (
												<Check className="w-5 h-5 text-green-400" />
											) : (
												<Copy className="w-5 h-5 text-gray-400" />
											)}
										</button>
									</div>
								</div>

								{/* Account Name */}
								<div>
									<label className="text-sm text-gray-400 block mb-1">Account Name</label>
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={paymentInstructions.accountName}
											readOnly
											className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-medium"
										/>
										<button
											onClick={() => handleCopy(paymentInstructions.accountName, "accountName")}
											className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
										>
											{copiedField === "accountName" ? (
												<Check className="w-5 h-5 text-green-400" />
											) : (
												<Copy className="w-5 h-5 text-gray-400" />
											)}
										</button>
									</div>
								</div>

								{/* SWIFT Code */}
								<div>
									<label className="text-sm text-gray-400 block mb-1">SWIFT Code</label>
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={paymentInstructions.swiftCode}
											readOnly
											className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
										/>
										<button
											onClick={() => handleCopy(paymentInstructions.swiftCode, "swiftCode")}
											className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
										>
											{copiedField === "swiftCode" ? (
												<Check className="w-5 h-5 text-green-400" />
											) : (
												<Copy className="w-5 h-5 text-gray-400" />
											)}
										</button>
									</div>
								</div>

								{/* Reference Number (CRITICAL) */}
								<div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
									<label className="text-sm text-purple-300 font-semibold block mb-2 flex items-center gap-2">
										<AlertCircle className="w-4 h-4" />
										Reference Number (REQUIRED)
									</label>
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={paymentInstructions.reference}
											readOnly
											className="flex-1 bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 text-white font-mono font-semibold"
										/>
										<button
											onClick={() => handleCopy(paymentInstructions.reference, "reference")}
											className="p-2 bg-purple-600 hover:bg-purple-700 border border-purple-500/30 rounded-lg transition-colors"
										>
											{copiedField === "reference" ? (
												<Check className="w-5 h-5 text-white" />
											) : (
												<Copy className="w-5 h-5 text-white" />
											)}
										</button>
									</div>
									<p className="text-xs text-purple-200/80 mt-2">
										⚠️ You MUST include this reference in your bank transfer for automatic processing
									</p>
								</div>

								{/* Additional Fields */}
								{paymentInstructions.bankCode && (
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm text-gray-400 block mb-1">Bank Code</label>
											<input
												type="text"
												value={paymentInstructions.bankCode}
												readOnly
												className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
											/>
										</div>
										{paymentInstructions.branchCode && (
											<div>
												<label className="text-sm text-gray-400 block mb-1">Branch Code</label>
												<input
													type="text"
													value={paymentInstructions.branchCode}
													readOnly
													className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
												/>
											</div>
										)}
									</div>
								)}

								{paymentInstructions.iban && (
									<div>
										<label className="text-sm text-gray-400 block mb-1">IBAN</label>
										<div className="flex items-center gap-2">
											<input
												type="text"
												value={paymentInstructions.iban}
												readOnly
												className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
											/>
											<button
												onClick={() => handleCopy(paymentInstructions.iban!, "iban")}
												className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
											>
												{copiedField === "iban" ? (
													<Check className="w-5 h-5 text-green-400" />
												) : (
													<Copy className="w-5 h-5 text-gray-400" />
												)}
											</button>
										</div>
									</div>
								)}

								{paymentInstructions.promptPayId && (
									<div>
										<label className="text-sm text-gray-400 block mb-1">PromptPay ID (THB only)</label>
										<div className="flex items-center gap-2">
											<input
												type="text"
												value={paymentInstructions.promptPayId}
												readOnly
												className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
											/>
											<button
												onClick={() => handleCopy(paymentInstructions.promptPayId!, "promptPayId")}
												className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
											>
												{copiedField === "promptPayId" ? (
													<Check className="w-5 h-5 text-green-400" />
												) : (
													<Copy className="w-5 h-5 text-gray-400" />
												)}
											</button>
										</div>
									</div>
								)}
							</div>

							{/* Instructions */}
							<div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
								<p className="text-sm text-gray-300 leading-relaxed">{paymentInstructions.instructions}</p>
							</div>
						</div>

						{/* Simulate Transfer Button (Demo Only) */}
						<button
							onClick={handleSimulateTransfer}
							disabled={processingPayment}
							className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
						>
							{processingPayment ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Processing Transfer...
								</>
							) : (
								<>
									<Building2 className="w-5 h-5" />
									Simulate Bank Transfer (Demo)
								</>
							)}
						</button>
					</div>

					{/* Right Column - Info */}
					<div className="space-y-6">
						{/* Expiry Timer */}
						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
								<Clock className="w-5 h-5 text-purple-400" />
								Order Expires
							</h3>
							<p className="text-2xl font-bold text-purple-400 mb-2">24 hours</p>
							<p className="text-sm text-gray-400">
								Complete payment before {new Date(deposit.expiresAt).toLocaleString()}
							</p>
						</div>

						{/* How it Works */}
						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<h3 className="text-lg font-semibold text-white mb-4">How it Works</h3>
							<ol className="space-y-3 text-sm text-gray-300">
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
										1
									</span>
									<span>Transfer funds from your business bank account to the account above</span>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
										2
									</span>
									<span>Include the reference number in your transfer notes</span>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
										3
									</span>
									<span>We receive notification from bank</span>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
										4
									</span>
									<span>USDC is deposited to your custodial vault</span>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
										5
									</span>
									<span>Funds start earning DeFi yield automatically</span>
								</li>
							</ol>
						</div>

						{/* Support */}
						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
							<p className="text-sm text-gray-400 mb-4">
								If you encounter any issues with your payment, please contact our support team.
							</p>
							<a href="mailto:support@proxify.fi" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
								support@proxify.fi
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
