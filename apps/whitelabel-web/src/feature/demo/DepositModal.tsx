import { useEffect, useRef, useState } from "react"

import { CheckCircle, ChevronDown, X } from "lucide-react"

import usdcLogo from "@/assets/usd-coin-usdc-logo.png"

interface DepositModalProps {
	isOpen: boolean
	onClose: () => void
	onDeposit: (amount: number) => Promise<void>
	merchantBalance: number // Maximum available balance from merchant account
}

export function DepositModal({ isOpen, onClose, onDeposit, merchantBalance }: DepositModalProps) {
	const [amount, setAmount] = useState("")
	const [isProcessing, setIsProcessing] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Auto-focus input when modal opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	if (!isOpen) return null

	const numericAmount = parseFloat(amount) || 0
	const isValidAmount = numericAmount > 0 && numericAmount <= merchantBalance

	// Percentage-based quick amounts
	const quickAmountPercentages = [
		{ label: "25%", value: merchantBalance * 0.25 },
		{ label: "50%", value: merchantBalance * 0.5 },
		{ label: "75%", value: merchantBalance * 0.75 },
		{ label: "100%", value: merchantBalance },
	]

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		// Only allow numbers and decimal point
		if (value && !/^\d*\.?\d*$/.test(value)) return

		const numeric = parseFloat(value) || 0

		// Check if exceeds merchant balance
		if (numeric > merchantBalance) {
			setError(`Maximum deposit is $${merchantBalance.toLocaleString()}`)
		} else {
			setError(null)
		}

		setAmount(value)
	}

	const handleQuickAmount = (quickAmount: number) => {
		if (quickAmount > merchantBalance) {
			setError(`Maximum deposit is $${merchantBalance.toLocaleString()}`)
			return
		}
		setError(null)
		// Round to 2 decimal places for clean display
		setAmount(quickAmount.toFixed(2))
	}

	const handleContinue = async () => {
		if (!isValidAmount) return

		setIsProcessing(true)
		setError(null)

		try {
			await onDeposit(numericAmount)
			// Show success state
			setShowSuccess(true)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create deposit order")
			setIsProcessing(false)
		}
	}

	const handleClose = () => {
		// Reset states
		setAmount("")
		setIsProcessing(false)
		setShowSuccess(false)
		setError(null)
		onClose()
	}

	const formatUSDC = (value: string) => {
		if (!value) return "0 USDC"
		const num = parseFloat(value)
		return `${num.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden">
				{showSuccess ? (
					// Success State
					<div className="p-8">
						<div className="text-center">
							<div className="mb-6 flex justify-center">
								<div className="p-4 bg-green-100 rounded-full">
									<CheckCircle className="w-16 h-16 text-green-600" />
								</div>
							</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful!</h2>
							<p className="text-gray-600 mb-2">
								${numericAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })} deposited to your Earn account
							</p>
							<p className="text-sm text-gray-500 mb-8">
								Your order is pending. Go to the Onboarding Dashboard to complete the process.
							</p>
							<button
								onClick={handleClose}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-lg transition-colors"
							>
								Done
							</button>
						</div>
					</div>
				) : (
					<>
						{/* Header */}
						<div className="relative py-4 border-b border-gray-200">
							<button
								onClick={handleClose}
								className="absolute left-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
							>
								<X className="w-5 h-5 text-gray-600" />
							</button>
							<h2 className="text-center text-gray-500 text-sm font-medium">Deposit to Earn</h2>
						</div>

						{/* Content */}
						<div className="p-6">
							{/* From/To Indicator */}
							<div className="flex items-center justify-center gap-3 mb-8">
								<button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
									<img src={usdcLogo} alt="USD" className="w-5 h-5 rounded-full" />
									<span className="font-semibold text-gray-900">USD</span>
									<ChevronDown className="w-4 h-4 text-gray-600" />
								</button>
								<span className="text-gray-400">→</span>
								<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
									<img src={usdcLogo} alt="USDC" className="w-5 h-5 rounded-full" />
									<span className="font-semibold text-gray-900">USDC</span>
								</div>
							</div>

							{/* Amount Input */}
							<div className="text-center mb-6">
								<div className="flex items-center justify-center">
									<span className="text-6xl font-bold text-gray-900 mr-1">$</span>
									<input
										ref={inputRef}
										type="text"
										inputMode="decimal"
										value={amount}
										onChange={handleAmountChange}
										placeholder="1,000"
										className="text-6xl font-bold text-gray-900 bg-transparent border-none outline-none"
										style={{ width: `${Math.max(amount.length || 5, 5)}ch` }}
									/>
								</div>
								<div className="text-gray-500 text-lg mt-2">{formatUSDC(amount)}</div>
							</div>

							{/* Merchant Balance */}
							<div className="text-center mb-6">
								<p className="text-sm text-gray-600">
									Merchant Balance:{" "}
									<span className="font-semibold text-gray-900">
										${merchantBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
									</span>
								</p>
							</div>

							{/* Error Message */}
							{error && (
								<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
									<p className="text-sm text-red-600">{error}</p>
								</div>
							)}

							{/* Continue Button */}
							<button
								onClick={handleContinue}
								disabled={!isValidAmount || isProcessing}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
							>
								{isProcessing ? "Processing..." : "Continue"}
							</button>

							{/* Quick Amount Buttons - Percentage Based */}
							<div className="grid grid-cols-4 gap-2">
								{quickAmountPercentages.map((quick) => (
									<button
										key={quick.label}
										onClick={() => {
											handleQuickAmount(quick.value)
										}}
										className="py-3 px-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium text-sm transition-colors"
									>
										{quick.label}
									</button>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
