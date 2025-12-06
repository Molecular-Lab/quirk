import { useState } from "react"
import toast from "react-hot-toast"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Banknote, Building2, Check, Sparkles, TrendingUp } from "lucide-react"

import { registerClient } from "@/api/b2bClientHelpers"
import { Currency } from "@/types"

const steps = [
	{ id: "company", label: "Company Info", icon: Building2 },
	{ id: "strategy", label: "Strategy Ranking", icon: TrendingUp },
	{ id: "banking", label: "Banking (Optional)", icon: Banknote },
]

const customerTiers = [
	{ value: "0-1K", label: "$0 - $1K", description: "Starting out" },
	{ value: "1K-10K", label: "$1K - $10K", description: "Growing" },
	{ value: "10K-100K", label: "$10K - $100K", description: "Scaling" },
	{ value: "100K-1M", label: "$100K - $1M", description: "Enterprise" },
	{ value: "1M+", label: "$1M+", description: "Whale" },
]

const strategies = [
	{ id: "defi", label: "DeFi Lending", color: "from-blue-400 to-indigo-500" },
	{ id: "cefi", label: "CeFi Yield", color: "from-purple-400 to-pink-500" },
	{ id: "lp", label: "Liquidity Pools", color: "from-cyan-400 to-blue-500" },
	{ id: "hedge", label: "Hedge Funds", color: "from-indigo-400 to-purple-500" },
	{ id: "arbitrage", label: "Arbitrage", color: "from-pink-400 to-rose-500" },
]

const currencies = [
	{ value: Currency.USD, label: "USD", flag: "🇺🇸" },
	{ value: Currency.EUR, label: "EUR", flag: "🇪🇺" },
	{ value: Currency.SGD, label: "SGD", flag: "🇸🇬" },
	{ value: Currency.THB, label: "THB", flag: "🇹🇭" },
	{ value: Currency.TWD, label: "TWD", flag: "🇹🇼" },
	{ value: Currency.KRW, label: "KRW", flag: "🇰🇷" },
]

export function CreateProduct() {
	const navigate = useNavigate()
	const { user } = usePrivy()
	const [currentStep, setCurrentStep] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Form state
	const [formData, setFormData] = useState({
		companyName: "",
		businessType: "",
		customerTier: "",
		strategyRanking: [] as string[],
		currencies: [Currency.USD] as Currency[],
		bankAccounts: {} as Record<
			Currency,
			{
				accountNumber: string
				accountName: string
				bankName: string
				swiftCode: string
			}
		>,
	})

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleSkip = () => {
		// Skip banking step and submit
		handleSubmit()
	}

	const handleStrategyToggle = (strategyId: string) => {
		setFormData((prev) => {
			const ranking = [...prev.strategyRanking]
			const index = ranking.indexOf(strategyId)

			if (index > -1) {
				ranking.splice(index, 1)
			} else {
				ranking.push(strategyId)
			}

			return { ...prev, strategyRanking: ranking }
		})
	}

	const handleCurrencyToggle = (currency: Currency) => {
		setFormData((prev) => {
			const currencies = [...prev.currencies]
			const index = currencies.indexOf(currency)

			if (index > -1 && currencies.length > 1) {
				currencies.splice(index, 1)
			} else if (index === -1) {
				currencies.push(currency)
			}

			return { ...prev, currencies }
		})
	}

	const handleSubmit = async () => {
		if (!user?.wallet?.address) {
			toast.error("Please connect your wallet")
			return
		}

		setIsSubmitting(true)

		try {
			// Build bank accounts array (one per currency, optional)
			const bankAccountsArray = formData.currencies
				.map((currency) => {
					const bankData = formData.bankAccounts[currency]
					if (!bankData?.accountNumber) return null // Skip if no account number

					return {
						currency: currency.toString(),
						bank_name: bankData.bankName,
						account_number: bankData.accountNumber,
						account_name: bankData.accountName,
						bank_details: bankData.swiftCode ? { swift_code: bankData.swiftCode } : undefined,
					}
				})
				.filter(Boolean) // Remove null entries

			const payload = {
				companyName: formData.companyName,
				businessType: formData.businessType,
				walletType: "MANAGED" as const,
				privyOrganizationId: user.id || "",
				privyWalletAddress: user.wallet.address,
				vaultsToCreate: "both" as const,
				privyEmail: user.email?.address,
				customerTier: formData.customerTier as "0-1K" | "1K-10K" | "10K-100K" | "100K-1M" | "1M+",
				strategyRanking: formData.strategyRanking,
				supportedCurrencies: formData.currencies.map((c) => c.toString()) as (
					| "SGD"
					| "USD"
					| "EUR"
					| "THB"
					| "TWD"
					| "KRW"
				)[],
				bankAccounts: bankAccountsArray.length > 0 ? bankAccountsArray : undefined,
			}

			const client = await registerClient(payload)

			toast.success(
				<div>
					<p className="font-semibold">Product created successfully!</p>
					<p className="text-sm opacity-90">Product ID: {client.productId}</p>
				</div>,
				{ duration: 5000 },
			)

			navigate({ to: "/dashboard" })
		} catch (error: any) {
			toast.error(error.message || "Failed to create product")
		} finally {
			setIsSubmitting(false)
		}
	}

	const isStepValid = () => {
		switch (currentStep) {
			case 0:
				return formData.companyName && formData.businessType && formData.customerTier
			case 1:
				return formData.strategyRanking.length > 0
			case 2:
				return true // Banking is optional
			default:
				return false
		}
	}

	return (
		<div className="fixed inset-0 bg-gradient-to-br from-blue-50/80 via-white to-pink-50/80 overflow-hidden">
			{/* Animated background gradients - Luma style */}
			<div className="absolute inset-0">
				<div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300/20 via-purple-300/15 to-pink-300/20 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-300/20 via-blue-300/15 to-indigo-300/20 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
				<div
					className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-purple-300/15 via-pink-300/15 to-rose-300/15 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "4s" }}
				/>
			</div>

			<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="w-full max-w-2xl"
				>
					{/* Glass card container */}
					<div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-500/5 border border-gray-100/50">
						{/* Header */}
						<div className="px-8 pt-8 pb-6 border-b border-gray-100">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
										<Sparkles className="w-6 h-6 text-blue-500" />
										Create Your Product
									</h1>
									<p className="text-gray-500 mt-1 text-sm">Set up your yield generation platform</p>
								</div>
								<button
									onClick={() => navigate({ to: "/dashboard" })}
									className="text-gray-400 hover:text-gray-600 transition-colors"
								>
									Cancel
								</button>
							</div>

							{/* Step indicators */}
							<div className="flex items-center gap-3">
								{steps.map((step, index) => (
									<div key={step.id} className="flex items-center">
										<div
											className={clsx(
												"flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
												index === currentStep
													? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
													: index < currentStep
														? "bg-blue-100 text-blue-600"
														: "bg-gray-100 text-gray-400",
											)}
										>
											{index < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
											<span className="text-sm font-medium hidden sm:inline">{step.label}</span>
										</div>
										{index < steps.length - 1 && (
											<div className={clsx("w-12 h-0.5 mx-2", index < currentStep ? "bg-blue-500" : "bg-gray-200")} />
										)}
									</div>
								))}
							</div>
						</div>

						{/* Content */}
						<div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
							<AnimatePresence mode="wait">
								{currentStep === 0 && (
									<motion.div
										key="company"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										className="space-y-6"
									>
										<div>
											<label className="block text-gray-700 text-sm font-medium mb-2">Company Name</label>
											<input
												type="text"
												value={formData.companyName}
												onChange={(e) => {
													setFormData({ ...formData, companyName: e.target.value })
												}}
												className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
												placeholder="Enter your company name"
											/>
										</div>

										<div>
											<label className="block text-gray-700 text-sm font-medium mb-2">Business Type</label>
											<input
												type="text"
												value={formData.businessType}
												onChange={(e) => {
													setFormData({ ...formData, businessType: e.target.value })
												}}
												className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
												placeholder="e.g., E-commerce, Gaming, Streaming"
											/>
										</div>

										<div>
											<label className="block text-gray-700 text-sm font-medium mb-2">
												Customer Tier (Monthly Volume)
											</label>
											<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
												{customerTiers.map((tier) => (
													<button
														key={tier.value}
														onClick={() => {
															setFormData({ ...formData, customerTier: tier.value })
														}}
														className={clsx(
															"p-3 rounded-xl border transition-all",
															formData.customerTier === tier.value
																? "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white"
																: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
														)}
													>
														<div className="text-sm font-semibold">{tier.label}</div>
														<div className="text-xs opacity-75">{tier.description}</div>
													</button>
												))}
											</div>
										</div>
									</motion.div>
								)}

								{currentStep === 1 && (
									<motion.div
										key="strategy"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										className="space-y-6"
									>
										<div>
											<label className="block text-gray-700 text-sm font-medium mb-2">
												Select Your Preferred Strategies
											</label>
											<p className="text-gray-500 text-sm mb-4">
												Choose strategies that align with your risk tolerance. Order doesn't matter.
											</p>
											<div className="space-y-3">
												{strategies.map((strategy) => (
													<button
														key={strategy.id}
														onClick={() => {
															handleStrategyToggle(strategy.id)
														}}
														className={clsx(
															"w-full p-4 rounded-xl border transition-all flex items-center justify-between group",
															formData.strategyRanking.includes(strategy.id)
																? "bg-gradient-to-r " + strategy.color + " border-transparent text-white"
																: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
														)}
													>
														<span className="font-medium">{strategy.label}</span>
														{formData.strategyRanking.includes(strategy.id) && <Check className="w-5 h-5" />}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-gray-700 text-sm font-medium mb-2">Supported Currencies</label>
											<div className="grid grid-cols-3 gap-3">
												{currencies.map((currency) => (
													<button
														key={currency.value}
														onClick={() => {
															handleCurrencyToggle(currency.value)
														}}
														className={clsx(
															"p-3 rounded-xl border transition-all flex items-center justify-center gap-2",
															formData.currencies.includes(currency.value)
																? "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white"
																: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
														)}
													>
														<span className="text-xl">{currency.flag}</span>
														<span className="font-medium">{currency.label}</span>
													</button>
												))}
											</div>
										</div>
									</motion.div>
								)}

								{currentStep === 2 && (
									<motion.div
										key="banking"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										className="space-y-6"
									>
										<div>
											<label className="block text-gray-700 text-sm font-medium mb-2">Bank Accounts (Optional)</label>
											<p className="text-gray-500 text-sm mb-4">
												Add bank account for each currency you'll use for withdrawals. All accounts are optional.
											</p>
										</div>

										{/* Show one bank form per selected currency */}
										<div className="space-y-6">
											{formData.currencies.map((currency) => {
												const currencyInfo = currencies.find((c) => c.value === currency)
												const bankData = formData.bankAccounts[currency] || {
													accountNumber: "",
													accountName: "",
													bankName: "",
													swiftCode: "",
												}

												return (
													<div
														key={currency}
														className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50"
													>
														<div className="flex items-center gap-2 mb-4">
															<span className="text-2xl">{currencyInfo?.flag}</span>
															<h3 className="text-base font-semibold text-gray-900">
																{currencyInfo?.label} Bank Account
															</h3>
															<span className="ml-auto text-xs text-gray-400">(Optional)</span>
														</div>

														<div className="grid grid-cols-2 gap-4">
															<div>
																<label className="block text-gray-600 text-xs font-medium mb-1">Account Name</label>
																<input
																	type="text"
																	value={bankData.accountName}
																	onChange={(e) => {
																		setFormData({
																			...formData,
																			bankAccounts: {
																				...formData.bankAccounts,
																				[currency]: { ...bankData, accountName: e.target.value },
																			},
																		})
																	}}
																	className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
																	placeholder="Account holder name"
																/>
															</div>

															<div>
																<label className="block text-gray-600 text-xs font-medium mb-1">Account Number</label>
																<input
																	type="text"
																	value={bankData.accountNumber}
																	onChange={(e) => {
																		setFormData({
																			...formData,
																			bankAccounts: {
																				...formData.bankAccounts,
																				[currency]: { ...bankData, accountNumber: e.target.value },
																			},
																		})
																	}}
																	className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
																	placeholder="Account number"
																/>
															</div>

															<div>
																<label className="block text-gray-600 text-xs font-medium mb-1">Bank Name</label>
																<input
																	type="text"
																	value={bankData.bankName}
																	onChange={(e) => {
																		setFormData({
																			...formData,
																			bankAccounts: {
																				...formData.bankAccounts,
																				[currency]: { ...bankData, bankName: e.target.value },
																			},
																		})
																	}}
																	className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
																	placeholder="Bank name"
																/>
															</div>

															<div>
																<label className="block text-gray-600 text-xs font-medium mb-1">SWIFT Code</label>
																<input
																	type="text"
																	value={bankData.swiftCode}
																	onChange={(e) => {
																		setFormData({
																			...formData,
																			bankAccounts: {
																				...formData.bankAccounts,
																				[currency]: { ...bankData, swiftCode: e.target.value },
																			},
																		})
																	}}
																	className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
																	placeholder="SWIFT/BIC code"
																/>
															</div>
														</div>
													</div>
												)
											})}
										</div>

										<div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
											<p className="text-blue-700 text-sm">
												💡 You can skip all bank accounts and add them later from your dashboard settings.
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Footer */}
						<div className="px-8 pb-8 pt-4 border-t border-gray-100">
							<div className="flex items-center justify-between">
								<button
									onClick={handleBack}
									disabled={currentStep === 0}
									className={clsx(
										"flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
										currentStep === 0 ? "opacity-0 pointer-events-none" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
									)}
								>
									<ArrowLeft className="w-4 h-4" />
									Back
								</button>

								<div className="flex items-center gap-3">
									{currentStep === 2 && (
										<button
											onClick={handleSkip}
											disabled={isSubmitting}
											className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
										>
											Skip & Finish
										</button>
									)}

									{currentStep < 2 ? (
										<button
											onClick={handleNext}
											disabled={!isStepValid()}
											className={clsx(
												"flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all",
												isStepValid()
													? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
													: "bg-gray-100 text-gray-400 cursor-not-allowed",
											)}
										>
											Next
											<ArrowRight className="w-4 h-4" />
										</button>
									) : (
										<button
											onClick={handleSubmit}
											disabled={isSubmitting}
											className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isSubmitting ? "Creating..." : "Create Product"}
											{!isSubmitting && <Check className="w-4 h-4" />}
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
