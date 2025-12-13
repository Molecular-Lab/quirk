import { useEffect, useState } from "react"

import { Copy, Eye, EyeOff, Loader2, RefreshCw, Save, Settings2 } from "lucide-react"
import { toast } from "sonner"

import {
	configureBankAccounts,
	getBankAccounts,
	getEffectiveProductStrategies,
	getFeeConfig,
	getOrganizationByProductId,
	regenerateApiKey,
	updateFeeConfig,
	updateOrganizationInfo,
	updateProductStrategiesCustomization,
	updateSupportedCurrencies,
} from "@/api/b2bClientHelpers"
import { ProductSwitcher } from "@/components/ProductSwitcher"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProductStrategyConfig, type StrategyConfig } from "@/feature/dashboard/ProductStrategyConfig"
import { useUserStore } from "@/store/userStore"
import { Currency } from "@/types"

const currencies = [
	{ value: Currency.USD, label: "USD", flag: "🇺🇸" },
	{ value: Currency.EUR, label: "EUR", flag: "🇪🇺" },
	{ value: Currency.SGD, label: "SGD", flag: "🇸🇬" },
	{ value: Currency.THB, label: "THB", flag: "🇹🇭" },
	{ value: Currency.TWD, label: "TWD", flag: "🇹🇼" },
	{ value: Currency.KRW, label: "KRW", flag: "🇰🇷" },
]

export function ProductConfigPage() {
	const { activeProductId, organizations, isOrganizationsLoaded } = useUserStore()

	// Get active organization from store directly (don't cache it)
	const organization = organizations.find((org) => org.productId === activeProductId)

	// Loading State
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)

	// Product Info State
	const [productInfo, setProductInfo] = useState({
		companyName: "",
		businessType: "",
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
	const [generatedApiKey, setGeneratedApiKey] = useState("")

	// Fee Configuration State
	const [feeConfig, setFeeConfig] = useState({
		clientRevenueSharePercent: "15.00", // Default 15%
		platformFeePercent: "7.50", // Platform fee (read-only)
		enduserFeePercent: "77.50", // Calculated: 100 - client - platform
	})

	// Investment Strategy State (from ProductStrategyConfig)
	const [investmentStrategy, setInvestmentStrategy] = useState<StrategyConfig | null>(null)
	const [applyStrategyToAll, setApplyStrategyToAll] = useState(false)

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
			const currentOrg = organizations.find((org) => org.productId === activeProductId)
			if (!currentOrg) {
				console.warn(`[ProductConfigPage] Product ${activeProductId} not found in organizations, skipping fetch`)
				setIsLoading(false)
				return
			}

			console.log(`[ProductConfigPage] Loading config for product: ${activeProductId}`)
			setIsLoading(true)

			try {
				// Fetch product details, bank accounts, fee configuration, and strategies
				const [productData, bankAccountsData, feeConfigData, strategiesData] = await Promise.all([
					getOrganizationByProductId(activeProductId),
					getBankAccounts(activeProductId).catch((err) => {
						console.error("[ProductConfigPage] ❌ getBankAccounts failed:", err)
						return null
					}),
					getFeeConfig(activeProductId).catch((err) => {
						console.error("[ProductConfigPage] ❌ getFeeConfig failed:", err)
						return null
					}),
					getEffectiveProductStrategies(activeProductId).catch((err) => {
						console.error("[ProductConfigPage] ❌ getEffectiveProductStrategies failed:", err)
						return null
					}),
				])

				// ============================================
				// DEBUG: Log ALL API responses to see actual structure
				// ============================================
				console.group("[ProductConfigPage] 📦 API Responses")

				console.log("1️⃣ Product Data (getOrganizationByProductId):")
				console.log("   Raw response:", productData)
				console.log("   Response type:", typeof productData)
				console.log("   .found:", (productData as any)?.found)
				console.log("   .data:", (productData as any)?.data)
				console.log("   .message:", (productData as any)?.message)

				console.log("\n2️⃣ Bank Accounts Data (getBankAccounts):")
				console.log("   Raw response:", bankAccountsData)
				console.log("   Response type:", typeof bankAccountsData)
				console.log("   .found:", (bankAccountsData as any)?.found)
				console.log("   .data:", (bankAccountsData as any)?.data)

				console.log("\n3️⃣ Fee Config Data (getFeeConfig):")
				console.log("   Raw response:", feeConfigData)
				console.log("   Response type:", typeof feeConfigData)
				console.log("   .found:", (feeConfigData as any)?.found)
				console.log("   .data:", (feeConfigData as any)?.data)

				console.log("\n4️⃣ Strategies Data (getEffectiveProductStrategies):")
				console.log("   Raw response:", strategiesData)
				console.log("   Response type:", typeof strategiesData)
				console.log("   .found:", (strategiesData as any)?.found)
				console.log("   .data:", (strategiesData as any)?.data)

				console.groupEnd()

				// Update product info - FIX: Extract .data from wrapped response
				if (productData) {
					const product = (productData as any)?.data // ✅ Extract .data property
					console.log("[ProductConfigPage] 🔍 Extracted product from .data:", product)

					if (product) {
						const extractedInfo = {
							companyName: product.companyName ?? currentOrg.companyName ?? "",
							businessType: product.businessType ?? currentOrg.businessType ?? "",
							description: product.description ?? "",
							webhookUrl: product.webhookUrl ?? "",
						}
						console.log("[ProductConfigPage] ✅ Setting productInfo:", extractedInfo)
						setProductInfo(extractedInfo)

						// Update supported currencies if available
						if (product.supportedCurrencies && Array.isArray(product.supportedCurrencies)) {
							console.log("[ProductConfigPage] ✅ Setting supportedCurrencies:", product.supportedCurrencies)
							setSelectedCurrencies(product.supportedCurrencies as Currency[])
						} else {
							console.log("[ProductConfigPage] ⚠️ No supportedCurrencies in product data")
						}
					} else {
						console.log("[ProductConfigPage] ⚠️ product.data is missing, using fallback")
						// Fallback to organization data if .data is missing
						setProductInfo({
							companyName: currentOrg.companyName ?? "",
							businessType: currentOrg.businessType ?? "",
							description: "",
							webhookUrl: "",
						})
					}
				} else {
					console.log("[ProductConfigPage] ⚠️ productData is null, using fallback")
					// Fallback to organization data if API fails
					setProductInfo({
						companyName: currentOrg.companyName ?? "",
						businessType: currentOrg.businessType ?? "",
						description: "",
						webhookUrl: "",
					})
				}

				// Update bank accounts - FIX: Extract .data from wrapped response
				const bankData = (bankAccountsData as any)?.data
				console.log("[ProductConfigPage] 🔍 Extracted bankData from .data:", bankData)

				if (bankData?.bankAccounts && Array.isArray(bankData.bankAccounts)) {
					console.log("[ProductConfigPage] ✅ Found bankAccounts array:", bankData.bankAccounts)
					const bankAccountsMap: Record<Currency, any> = {} as any
					for (const account of bankData.bankAccounts) {
						if (account.currency) {
							bankAccountsMap[account.currency as Currency] = {
								accountNumber: (account.account_number || account.accountNumber) ?? "",
								accountName: (account.account_name || account.accountName) ?? "",
								bankName: (account.bank_name || account.bankName) ?? "",
								swiftCode: account.bank_details?.swift_code ?? "",
							}
						}
					}
					console.log("[ProductConfigPage] ✅ Setting bankAccounts:", bankAccountsMap)
					setBankAccounts(bankAccountsMap)
				} else {
					console.log("[ProductConfigPage] ⚠️ No bankAccounts found in response")
				}

				// Update fee configuration - FIX: Extract .data from wrapped response
				const feeData = (feeConfigData as any)?.data
				console.log("[ProductConfigPage] 🔍 Extracted feeData from .data:", feeData)

				if (feeData) {
					const clientPercent = parseFloat(feeData.clientRevenueSharePercent || "15.00")
					const platformPercent = parseFloat(feeData.platformFeePercent || "7.50")
					const enduserPercent = 100 - clientPercent - platformPercent

					const calculatedFeeConfig = {
						clientRevenueSharePercent: clientPercent.toFixed(2),
						platformFeePercent: platformPercent.toFixed(2),
						enduserFeePercent: enduserPercent.toFixed(2),
					}
					console.log("[ProductConfigPage] ✅ Setting feeConfig:", calculatedFeeConfig)
					setFeeConfig(calculatedFeeConfig)
				} else {
					console.log("[ProductConfigPage] ⚠️ No feeData found, using defaults")
				}

				// Update investment strategies - FIX: Load from API
				const strategies = (strategiesData as any)?.data?.strategies
				console.log("[ProductConfigPage] 🔍 Extracted strategies from .data.strategies:", strategies)

				if (strategies) {
					console.log("[ProductConfigPage] ✅ Setting investmentStrategy:", strategies)
					setInvestmentStrategy(strategies)
				} else {
					console.log("[ProductConfigPage] ⚠️ No strategies found in response")
				}

				// Update API key from API response (apiKeyPrefix from database)
				// productData structure: { found: boolean, data: {...}, message: string }
				const apiKeyPrefix = (productData as any)?.data?.apiKeyPrefix || null
				setGeneratedApiKey(apiKeyPrefix ?? "")

				console.log("[ProductConfigPage] Loaded API key prefix from database:", apiKeyPrefix ? "✓ Generated" : "✗ Not generated")
			} catch (error) {
				console.error("[ProductConfigPage] Error loading product config:", error)
				toast.error("Failed to load product configuration")
			} finally {
				setIsLoading(false)
			}
		}

		void loadProductConfig()
	}, [activeProductId, organizations, isOrganizationsLoaded])

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
				// Update local state with full key (shown temporarily - user must copy)
				setGeneratedApiKey(newKey)

				// ✅ Save to demoProductStore for demos
				const { setApiKey } = await import("@/store/demoProductStore").then(m => m.useDemoProductStore.getState())
				setApiKey(activeProductId, newKey)

				console.log("[ProductConfigPage] ✅ New API Key generated:", newKey.substring(0, 12) + "...")
				console.log("[ProductConfigPage] ✅ API Key saved to demoProductStore")
				toast.success("New API key generated! Please copy it now - you won't be able to see the full key again.")
			} else {
				toast.error("Failed to regenerate API key")
			}
		} catch (error) {
			console.error("[ProductConfigPage] Error regenerating API key:", error)
			toast.error("Failed to regenerate API key")
		}
	}

	const handleClientRevenueShareChange = (value: string) => {
		// Allow empty string or partial input during typing
		if (value === "" || value === ".") {
			setFeeConfig({
				...feeConfig,
				clientRevenueSharePercent: value,
			})
			return
		}

		const numValue = parseFloat(value)

		// Allow typing but don't update enduser fee if invalid
		if (isNaN(numValue)) {
			return
		}

		const platformPercent = parseFloat(feeConfig.platformFeePercent)
		const enduserPercent = 100 - numValue - platformPercent

		setFeeConfig({
			...feeConfig,
			clientRevenueSharePercent: value, // Keep the typed value as-is
			enduserFeePercent: numValue >= 10 && numValue <= 20 ? enduserPercent.toFixed(2) : feeConfig.enduserFeePercent,
		})
	}

	// ✅ Consolidated: Fee config is now saved together with all other configs in handleSaveConfig below

	// Handle strategy changes from ProductStrategyConfig
	const handleStrategyChange = (strategies: StrategyConfig, applyToAll: boolean) => {
		setInvestmentStrategy(strategies)
		setApplyStrategyToAll(applyToAll)
	}

	// Helper: Calculate total allocation percentage
	const getTotalAllocation = (strategies: StrategyConfig): number => {
		let total = 0
		Object.values(strategies).forEach((category) => {
			Object.values(category).forEach((percentage) => {
				total += percentage
			})
		})
		return total
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

			// ✅ ADD: Save fee configuration
			// Validate before saving
			const numValue = parseFloat(feeConfig.clientRevenueSharePercent)
			if (!isNaN(numValue) && numValue >= 10 && numValue <= 20) {
				const formattedValue = numValue.toFixed(2)
				promises.push(updateFeeConfig(activeProductId, formattedValue))

				// Update local state with formatted value
				setFeeConfig((prev) => ({
					...prev,
					clientRevenueSharePercent: formattedValue,
				}))
			}

			// ✅ ADD: Save investment strategy
			if (investmentStrategy) {
				// Validate sum to 100%
				const total = getTotalAllocation(investmentStrategy)
				if (total !== 100) {
					toast.error(`Strategy allocation must sum to 100%, got ${total}%`)
					setIsSaving(false)
					return
				}

				if (applyStrategyToAll && organizations.length > 1) {
					// Apply to all products
					let successCount = 0
					for (const org of organizations) {
						try {
							await updateProductStrategiesCustomization(org.productId, investmentStrategy)
							successCount++
						} catch (error) {
							console.error(`Failed to update product ${org.productId}:`, error)
						}
					}
					console.log(`Strategy applied to ${successCount} of ${organizations.length} products`)
				} else {
					// Apply to single product only
					promises.push(updateProductStrategiesCustomization(activeProductId, investmentStrategy))
				}
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
					<Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
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
						<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-150 p-8">
							<div className="border-b border-gray-150 pb-4 mb-6">
								<h2 className="text-xl font-semibold text-gray-950 mb-1">Product Information</h2>
								<p className="text-sm text-gray-500">Basic details about your product</p>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
									<Input
										type="text"
										value={productInfo.companyName}
										onChange={(e) => {
											setProductInfo({ ...productInfo, companyName: e.target.value })
										}}
										placeholder="Your Company Name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
									<Input
										type="text"
										value={productInfo.businessType}
										onChange={(e) => {
											setProductInfo({ ...productInfo, businessType: e.target.value })
										}}
										placeholder="e.g., E-commerce, Gaming, Fintech"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
									<Textarea
										value={productInfo.description}
										onChange={(e) => {
											setProductInfo({ ...productInfo, description: e.target.value })
										}}
										rows={3}
										placeholder="Describe your product and use case"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
									<Input
										type="url"
										value={productInfo.webhookUrl}
										onChange={(e) => {
											setProductInfo({ ...productInfo, webhookUrl: e.target.value })
										}}
										placeholder="https://your-api.com/webhooks/proxify"
									/>
									<p className="text-xs text-gray-500 mt-1">Receive notifications for deposit/withdrawal events</p>
								</div>
							</div>
						</div>

						{/* Investment Strategy Configuration */}
						<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-150 p-8">
							<div className="border-b border-gray-150 pb-4 mb-6">
								<h2 className="text-xl font-semibold text-gray-950 mb-1">Investment Strategy</h2>
								<p className="text-sm text-gray-500">Configure how your funds are allocated across DeFi protocols</p>
							</div>
							{activeProductId && (
								<ProductStrategyConfig productId={activeProductId} onStrategyChange={handleStrategyChange} />
							)}
						</div>
					</div>

					{/* Right Column - API Key & Banking */}
					<div className="space-y-6">
						{/* API Key Section */}
						<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-150 p-6">
							<div className="border-b border-gray-150 pb-4 mb-6">
								<h2 className="text-lg font-semibold text-gray-950 mb-1">API Credentials</h2>
								<p className="text-xs text-gray-500">Use these to authenticate your requests</p>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-2">API Key</label>
									<div className="relative">
										<Input
											type={showApiKey ? "text" : "password"}
											value={generatedApiKey}
											readOnly
											className="pr-20 bg-gray-50 font-mono"
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

								<div className="bg-warning-light border border-warning/20 rounded-lg p-3">
									<div className="flex items-start gap-2">
										<span className="text-warning text-sm">⚠️</span>
										<p className="text-xs text-gray-950">
											<strong>Warning:</strong> Regenerating will invalidate the current key. Update all integrations
											immediately.
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Supported Currencies */}
						<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-150 p-6">
							<h3 className="text-sm font-semibold text-gray-950 mb-4">Supported Currencies</h3>
							<div className="grid grid-cols-2 gap-3">
								{currencies.map((currency) => (
									<label
										key={currency.value}
										className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
									>
										<Checkbox
											checked={selectedCurrencies.includes(currency.value)}
											onCheckedChange={() => {
												handleCurrencyToggle(currency.value)
											}}
										/>
										<span className="text-lg">{currency.flag}</span>
										<span className="text-sm font-medium text-gray-950">{currency.label}</span>
									</label>
								))}
							</div>
						</div>

						{/* Fee Configuration */}
						<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-150 p-6">
							<div className="border-b border-gray-150 pb-4 mb-6">
								<h2 className="text-lg font-semibold text-gray-950 mb-1">Fee Configuration</h2>
								<p className="text-xs text-gray-500">Manage revenue share percentages</p>
							</div>

							<div className="space-y-4">
								{/* Client Revenue Share (Editable) */}
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-2">
										Your Revenue Share
										<span className="text-accent ml-1">*</span>
									</label>
									<div className="relative">
										<Input
											type="number"
											min="10"
											max="20"
											step="0.01"
											value={feeConfig.clientRevenueSharePercent}
											onChange={(e) => {
												handleClientRevenueShareChange(e.target.value)
											}}
											className="pr-12"
										/>
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
									</div>
									<p className="text-xs text-gray-500 mt-1">Range: 10% - 20%</p>
								</div>

								{/* Platform Fee (Read-only) */}
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-2">Platform Fee (Fixed)</label>
									<div className="relative">
										<Input
											type="text"
											value={feeConfig.platformFeePercent}
											readOnly
											disabled
											className="bg-gray-50 pr-12"
										/>
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
									</div>
									<p className="text-xs text-gray-500 mt-1">Set by Quirk (not editable)</p>
								</div>

								{/* End-User Fee (Calculated, Read-only) */}
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-2">End-User Revenue Share</label>
									<div className="relative">
										<Input
											type="text"
											value={feeConfig.enduserFeePercent}
											readOnly
											disabled
											className="bg-gray-50 pr-12"
										/>
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
									</div>
									<p className="text-xs text-gray-500 mt-1">Auto-calculated: 100% - Your Share - Platform Fee</p>
								</div>

								{/* Fee Split Visualization */}
								<div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
									<p className="text-xs font-medium text-gray-700 mb-3">Fee Distribution</p>
									<div className="space-y-2">
										<div className="flex items-center justify-between text-xs">
											<span className="text-gray-600">Your Share:</span>
											<span className="font-semibold text-accent">{feeConfig.clientRevenueSharePercent}%</span>
										</div>
										<div className="flex items-center justify-between text-xs">
											<span className="text-gray-600">Platform Fee:</span>
											<span className="font-semibold text-gray-700">{feeConfig.platformFeePercent}%</span>
										</div>
										<div className="flex items-center justify-between text-xs">
											<span className="text-gray-600">End-User Share:</span>
											<span className="font-semibold text-green-600">{feeConfig.enduserFeePercent}%</span>
										</div>
										<div className="pt-2 border-t border-gray-300">
											<div className="flex items-center justify-between text-xs font-bold">
												<span className="text-gray-950">Total:</span>
												<span className="text-gray-950">100.00%</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Apply Strategy to All Option */}
						{organizations.length > 1 && investmentStrategy && (
							<label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
								<Checkbox
									checked={applyStrategyToAll}
									onCheckedChange={setApplyStrategyToAll}
									disabled={isSaving}
									className="mt-0.5"
								/>
								<div className="flex-1">
									<div className="text-sm font-medium text-gray-950">
										Apply investment strategy to all {organizations.length} products
									</div>
									<div className="text-xs text-gray-600 mt-0.5">
										This will update the investment strategy across all your products
									</div>
								</div>
							</label>
						)}

						{/* Save Button */}
						<button
							onClick={handleSaveConfig}
							disabled={isSaving}
							className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-4 rounded-lg font-medium hover:bg-blue-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									{applyStrategyToAll
										? `Saving & Applying to All ${organizations.length} Products...`
										: "Saving Configuration..."}
								</>
							) : (
								<>
									<Save className="w-5 h-5" />
									{applyStrategyToAll
										? `Save & Apply to All ${organizations.length} Products`
										: "Save Product Configuration"}
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
								<div key={currency} className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50">
									<div className="flex items-center gap-2 mb-4">
										<span className="text-2xl">{currencyInfo?.flag}</span>
										<h3 className="text-base font-semibold text-gray-900">{currencyInfo?.label} Bank Account</h3>
										<span className="ml-auto text-xs text-gray-400">(Optional)</span>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
											<Input
												type="text"
												value={bankData.accountName}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, accountName: e.target.value },
													})
												}}
												placeholder="Account holder name"
												className="text-sm"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
											<Input
												type="text"
												value={bankData.accountNumber}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, accountNumber: e.target.value },
													})
												}}
												placeholder="Account number"
												className="text-sm"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
											<Input
												type="text"
												value={bankData.bankName}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, bankName: e.target.value },
													})
												}}
												placeholder="Bank name"
												className="text-sm"
											/>
										</div>

										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">SWIFT Code</label>
											<Input
												type="text"
												value={bankData.swiftCode}
												onChange={(e) => {
													setBankAccounts({
														...bankAccounts,
														[currency]: { ...bankData, swiftCode: e.target.value },
													})
												}}
												placeholder="SWIFT/BIC code"
												className="text-sm"
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>

					<div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
						<p className="text-sm text-gray-700">
							<strong className="text-gray-950">💡 Note:</strong> Bank accounts are required for processing off-ramp
							withdrawals. You can add them later if needed.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
