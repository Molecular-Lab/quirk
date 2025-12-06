import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { Link } from "@tanstack/react-router"
import {
	Building2,
	Check,
	Copy,
	ExternalLink,
	Eye,
	EyeOff,
	Key,
	Loader2,
	RefreshCw,
	Save,
	Settings2,
	TrendingUp,
} from "lucide-react"

import {
	configureBankAccounts,
	getBankAccounts,
	getOrganizationByProductId,
	regenerateApiKey,
	updateOrganizationInfo,
	updateSupportedCurrencies,
} from "@/api/b2bClientHelpers"
import { ProductSwitcher } from "@/components/ProductSwitcher"
import { useUserStore } from "@/store/userStore"
import { Currency } from "@/types"

// Placeholder data for strategy preview (actual config is in Market Analysis page)
const strategyPreviewData = [
	{ label: "DeFi Lending", apy: "8.5%", tvl: "$2.1B", status: "Active" },
	{ label: "CeFi Yield", apy: "5.0%", tvl: "N/A", status: "Active" },
	{ label: "Place LP", apy: "12.4%", tvl: "$450M", status: "Active" },
]

const currencies = [
	{ value: Currency.USD, label: "USD", flag: "🇺🇸" },
	{ value: Currency.EUR, label: "EUR", flag: "🇪🇺" },
	{ value: Currency.SGD, label: "SGD", flag: "🇸🇬" },
	{ value: Currency.THB, label: "THB", flag: "🇹🇭" },
	{ value: Currency.TWD, label: "TWD", flag: "🇹🇼" },
	{ value: Currency.KRW, label: "KRW", flag: "🇰🇷" },
]

export function ProductConfigPage() {
	const { activeProductId, getActiveOrganization, apiKey, organizations, isOrganizationsLoaded } = useUserStore()
	const organization = getActiveOrganization()

	// Loading State
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)

	// Product Info State
	const [productInfo, setProductInfo] = useState({
		companyName: organization?.companyName || "",
		businessType: organization?.businessType || "",
		description: "",
		webhookUrl: "",
	})

	// Strategies are configured in Market Analysis page (read-only here)

	// Banking State
	const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([Currency.USD])
	const [bankAccounts, setBankAccounts] = useState<
		Record<
			Currency,
			{
				accountNumber: string
				accountName: string
				bankName: string
				swiftCode: string
			}
		>
	>({} as any)

	// API Key State
	const [showApiKey, setShowApiKey] = useState(false)
	const [generatedApiKey, setGeneratedApiKey] = useState(apiKey || "")

	// Load product config when activeProductId changes
	useEffect(() => {
		const loadProductConfig = async () => {
			// Wait for organizations to be loaded from API before fetching product details
			// This prevents 404 errors from stale cached productIds
			if (!isOrganizationsLoaded) {
				console.log("[ProductConfigPage] Waiting for organizations to load from API...")
				setIsLoading(true)
				return
			}

			if (!activeProductId) {
				setIsLoading(false)
				return
			}

			// Validate: Don't fetch if activeProductId doesn't exist in organizations
			// This prevents 404 errors when loading with stale cached productId
			const productExists = organizations.some((org) => org.productId === activeProductId)
			if (!productExists) {
				console.warn(`[ProductConfigPage] Product ${activeProductId} not found in organizations, skipping fetch`)
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			try {
				// Fetch product details and bank accounts
				const [productData, bankAccountsData] = await Promise.all([
					getOrganizationByProductId(activeProductId),
					getBankAccounts(activeProductId).catch(() => null),
				])

				// Update product info
				if (productData) {
					const product = productData as any
					setProductInfo({
						companyName: product.companyName || organization?.companyName || "",
						businessType: product.businessType || organization?.businessType || "",
						description: product.description || "",
						webhookUrl: product.webhookUrl || "",
					})

					// Update supported currencies if available
					if (product.supportedCurrencies && Array.isArray(product.supportedCurrencies)) {
						setSelectedCurrencies(product.supportedCurrencies as Currency[])
					}
				}

				// Update bank accounts
				if (bankAccountsData && Array.isArray(bankAccountsData)) {
					const bankAccountsMap: Record<Currency, any> = {} as any
					for (const account of bankAccountsData as any[]) {
						if (account.currency) {
							bankAccountsMap[account.currency as Currency] = {
								accountNumber: account.account_number || account.accountNumber || "",
								accountName: account.account_name || account.accountName || "",
								bankName: account.bank_name || account.bankName || "",
								swiftCode: account.bank_details?.swift_code || "",
							}
						}
					}
					setBankAccounts(bankAccountsMap)
				}

				// Update API key from store
				setGeneratedApiKey(apiKey || "")
			} catch (error) {
				console.error("[ProductConfigPage] Error loading product config:", error)
				toast.error("Failed to load product configuration")
			} finally {
				setIsLoading(false)
			}
		}

		void loadProductConfig()
	}, [activeProductId, apiKey, organization, organizations, isOrganizationsLoaded])

	// No strategy toggle - strategies are managed in Market Analysis page

	const handleCurrencyToggle = (currency: Currency) => {
		setSelectedCurrencies((prev) => {
			if (prev.includes(currency)) {
				return prev.length > 1 ? prev.filter((c) => c !== currency) : prev
			}
			return [...prev, currency]
		})
	}

	const handleCopyApiKey = () => {
		navigator.clipboard.writeText(generatedApiKey)
		toast.success("API key copied to clipboard!")
	}

	const handleRegenerateApiKey = async () => {
		if (!activeProductId) return

		try {
			const response = await regenerateApiKey(activeProductId)
			const newKey = (response as any)?.apiKey || (response as any)?.api_key

			if (newKey) {
				// Save to local state
				setGeneratedApiKey(newKey)

				// Save to localStorage (per-organization)
				const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
				allKeys[activeProductId] = newKey
				localStorage.setItem("b2b:api_keys", JSON.stringify(allKeys))
				localStorage.setItem("b2b:api_key", newKey) // Set as current active key

				// Save to userStore
				const { setApiKey } = useUserStore.getState()
				setApiKey(newKey)

				console.log("[ProductConfigPage] ✅ API Key saved:", newKey.substring(0, 12) + "...")
				toast.success("New API key generated and saved securely!")
			} else {
				toast.error("Failed to regenerate API key")
			}
		} catch (error) {
			console.error("[ProductConfigPage] Error regenerating API key:", error)
			toast.error("Failed to regenerate API key")
		}
	}

	const handleSaveConfig = async () => {
		if (!activeProductId) return

		setIsSaving(true)
		try {
			// Prepare organization info update (only non-empty fields)
			const orgUpdateData: {
				companyName?: string
				businessType?: string
				description?: string
				websiteUrl?: string
			} = {}

			if (productInfo.companyName) orgUpdateData.companyName = productInfo.companyName
			if (productInfo.businessType) orgUpdateData.businessType = productInfo.businessType
			if (productInfo.description) orgUpdateData.description = productInfo.description
			if (productInfo.webhookUrl) orgUpdateData.websiteUrl = productInfo.webhookUrl

			// Prepare bank accounts data
			const bankAccountsArray = selectedCurrencies
				.map((currency) => {
					const bankData = bankAccounts[currency]
					if (!bankData?.accountNumber) return null
					return {
						currency: currency.toString(),
						bank_name: bankData.bankName,
						account_number: bankData.accountNumber,
						account_name: bankData.accountName,
						bank_details: bankData.swiftCode ? { swift_code: bankData.swiftCode } : undefined,
					}
				})
				.filter(Boolean) as any[]

			// Save all config sections in parallel (only if data exists)
			const promises = []

			// Only update organization info if there are fields to update
			if (Object.keys(orgUpdateData).length > 0) {
				promises.push(updateOrganizationInfo(activeProductId, orgUpdateData))
			}

			// Always update currencies (at least one is required)
			if (selectedCurrencies.length > 0) {
				promises.push(updateSupportedCurrencies(activeProductId, selectedCurrencies.map((c) => c.toString()) as any))
			}

			// Only update bank accounts if there are any configured
			if (bankAccountsArray.length > 0) {
				promises.push(configureBankAccounts(activeProductId, bankAccountsArray as any))
			}

			await Promise.all(promises)

			toast.success("Configuration saved successfully!")
		} catch (error) {
			console.error("[ProductConfigPage] Error saving configuration:", error)
			toast.error("Failed to save configuration")
		} finally {
			setIsSaving(false)
		}
	}

	if (!organization && !isLoading) {
		return (
			<div className="min-h-full bg-white flex items-center justify-center">
				<div className="text-center">
					<Settings2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">No Product Selected</h2>
					<p className="text-gray-600">Please create a product first.</p>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="min-h-full bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
					<p className="text-gray-600">Loading product configuration...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-full bg-gray-50">
			<div className="max-w-[1200px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8 flex items-start justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
						<p className="text-gray-600">Configure your product settings, strategies, and integrations</p>
					</div>
					<ProductSwitcher />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Product Info & Strategies */}
					<div className="lg:col-span-2 space-y-6">
						{/* Product Information */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
									<Building2 className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
									<p className="text-sm text-gray-500">Basic details about your product</p>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
									<input
										type="text"
										value={productInfo.companyName}
										onChange={(e) => {
											setProductInfo({ ...productInfo, companyName: e.target.value })
										}}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
										placeholder="Your Company Name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
									<input
										type="text"
										value={productInfo.businessType}
										onChange={(e) => {
											setProductInfo({ ...productInfo, businessType: e.target.value })
										}}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
										placeholder="e.g., E-commerce, Gaming, Fintech"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
									<textarea
										value={productInfo.description}
										onChange={(e) => {
											setProductInfo({ ...productInfo, description: e.target.value })
										}}
										rows={3}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
										placeholder="Describe your product and use case"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
									<input
										type="url"
										value={productInfo.webhookUrl}
										onChange={(e) => {
											setProductInfo({ ...productInfo, webhookUrl: e.target.value })
										}}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
										placeholder="https://your-api.com/webhooks/proxify"
									/>
									<p className="text-xs text-gray-500 mt-1">Receive notifications for deposit/withdrawal events</p>
								</div>
							</div>
						</div>

						{/* Yield Strategies (Read-Only Preview) */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<TrendingUp className="w-5 h-5 text-purple-600" />
									</div>
									<div>
										<h2 className="text-xl font-semibold text-gray-900">Current Yield Strategies</h2>
										<p className="text-sm text-gray-500">Configured in Market Analysis</p>
									</div>
								</div>
								<Link to="/dashboard/market">
									<button className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
										<Settings2 className="w-4 h-4" />
										Configure
										<ExternalLink className="w-3 h-3" />
									</button>
								</Link>
							</div>

							<div className="space-y-3">
								{strategyPreviewData.map((strategy, idx) => (
									<div
										key={idx}
										className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200"
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="font-semibold text-gray-900">{strategy.label}</div>
												<div className="text-sm text-gray-500 mt-1">
													APY: {strategy.apy} • TVL: {strategy.tvl}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
													{strategy.status}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="mt-4 p-4 bg-purple-50/50 border border-purple-200/50 rounded-xl">
								<p className="text-sm text-purple-700">
									<strong>💡 Tip:</strong> Visit{" "}
									<Link to="/dashboard/market" className="underline font-semibold">
										Market Analysis
									</Link>{" "}
									to configure strategies, view real-time data, and deploy funds across DeFi protocols.
								</p>
							</div>
						</div>
					</div>

					{/* Right Column - API Key & Banking */}
					<div className="space-y-6">
						{/* API Key Section */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
									<Key className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-gray-900">API Credentials</h2>
									<p className="text-xs text-gray-500">Use these to authenticate your requests</p>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-2">API Key</label>
									<div className="relative">
										<input
											type={showApiKey ? "text" : "password"}
											value={generatedApiKey}
											readOnly
											className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:outline-none"
										/>
										<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
											<button
												onClick={() => {
													setShowApiKey(!showApiKey)
												}}
												className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
												title={showApiKey ? "Hide" : "Show"}
											>
												{showApiKey ? (
													<EyeOff className="w-4 h-4 text-gray-600" />
												) : (
													<Eye className="w-4 h-4 text-gray-600" />
												)}
											</button>
											<button
												onClick={handleCopyApiKey}
												className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
												title="Copy"
											>
												<Copy className="w-4 h-4 text-gray-600" />
											</button>
										</div>
									</div>
								</div>

								<button
									onClick={handleRegenerateApiKey}
									className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors"
								>
									<RefreshCw className="w-4 h-4" />
									Regenerate Key
								</button>

								<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
									<p className="text-xs text-amber-800">
										<strong>⚠️ Warning:</strong> Regenerating will invalidate the current key. Update all integrations
										immediately.
									</p>
								</div>
							</div>
						</div>

						{/* Supported Currencies */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
							<h3 className="text-sm font-semibold text-gray-900 mb-4">Supported Currencies</h3>
							<div className="grid grid-cols-2 gap-2">
								{currencies.map((currency) => (
									<button
										key={currency.value}
										onClick={() => {
											handleCurrencyToggle(currency.value)
										}}
										className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
											selectedCurrencies.includes(currency.value)
												? "bg-blue-50 border-blue-500 text-blue-700"
												: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
										}`}
									>
										<span className="text-lg">{currency.flag}</span>
										<span className="text-sm font-medium">{currency.label}</span>
										{selectedCurrencies.includes(currency.value) && <Check className="w-4 h-4 ml-auto" />}
									</button>
								))}
							</div>
						</div>

						{/* Save Button */}
						<button
							onClick={handleSaveConfig}
							disabled={isSaving}
							className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="w-5 h-5" />
									Save Configuration
								</>
							)}
						</button>
					</div>
				</div>

				{/* Banking Configuration */}
				<div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Bank Account Configuration</h2>
						<p className="text-sm text-gray-600">
							Add bank accounts for each supported currency (for off-ramp withdrawals)
						</p>
					</div>

					<div className="space-y-6">
						{selectedCurrencies.map((currency) => {
							const currencyInfo = currencies.find((c) => c.value === currency)
							const bankData = bankAccounts[currency] || {
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
										<h3 className="text-base font-semibold text-gray-900">{currencyInfo?.label} Bank Account</h3>
										<span className="ml-auto text-xs text-gray-400">(Optional)</span>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
											<input
												type="text"
												value={bankData.accountName}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, accountName: e.target.value },
													})
												}}
												className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
												placeholder="Account holder name"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
											<input
												type="text"
												value={bankData.accountNumber}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, accountNumber: e.target.value },
													})
												}}
												className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
												placeholder="Account number"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
											<input
												type="text"
												value={bankData.bankName}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, bankName: e.target.value },
													})
												}}
												className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
												placeholder="Bank name"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">SWIFT Code</label>
											<input
												type="text"
												value={bankData.swiftCode}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, swiftCode: e.target.value },
													})
												}}
												className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
												placeholder="SWIFT/BIC code"
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>

					<div className="mt-4 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
						<p className="text-sm text-blue-700">
							💡 Bank accounts are required for processing off-ramp withdrawals. You can add them later if needed.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
