import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import {
	AlertCircle,
	Bell,
	Building2,
	Check,
	ChevronRight,
	Copy,
	Database,
	Eye,
	EyeOff,
	Globe,
	Key,
	Palette,
	Plus,
	RefreshCw,
	Save,
	Shield,
	Trash2,
	Wallet,
} from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"
import { useClientContext } from "@/store/clientContextStore"
import { useUserStore } from "@/store/userStore"

// Types
interface BankAccount {
	currency: string
	bank_name: string
	account_number: string
	account_name: string
	swift_code?: string
	bank_details?: Record<string, any>
}

interface DeFiStrategy {
	category: "lending" | "lp" | "staking"
	target: number
}

// Supported currencies
const SUPPORTED_CURRENCIES = ["SGD", "USD", "EUR", "THB", "TWD", "KRW"] as const
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export function SettingsPage() {
	const {} = usePrivy()
	const { activeProductId, organizations, apiKey, setApiKey } = useUserStore()

	const {} = useClientContext()

	// Find active organization
	const activeOrg = organizations.find((org) => org.productId === activeProductId)

	// State for different sections
	const [activeSection, setActiveSection] = useState<string>("organization")
	const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [success, setSuccess] = useState<Record<string, boolean>>({})
	const [copied, setCopied] = useState(false)

	// Organization info
	const [orgInfo, setOrgInfo] = useState({
		companyName: activeOrg?.companyName || "",
		businessType: activeOrg?.businessType || "",
		description: activeOrg?.description || "",
		websiteUrl: activeOrg?.websiteUrl || "",
	})

	// API Key
	const [showApiKey, setShowApiKey] = useState(false)

	// Bank accounts
	const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
	const [, setLoadingBankAccounts] = useState(false)

	// Supported currencies
	const [selectedCurrencies, setSelectedCurrencies] = useState<SupportedCurrency[]>([])

	// DeFi strategies
	const [strategies, setStrategies] = useState<DeFiStrategy[]>([
		{ category: "lending", target: 70 },
		{ category: "lp", target: 20 },
		{ category: "staking", target: 10 },
	])

	// Load bank accounts and currencies when component mounts or org changes
	useEffect(() => {
		if (activeProductId) {
			loadBankAccounts()
			loadSupportedCurrencies()
		}
	}, [activeProductId])

	// Update org info when active org changes
	useEffect(() => {
		if (activeOrg) {
			setOrgInfo({
				companyName: activeOrg.companyName,
				businessType: activeOrg.businessType,
				description: activeOrg.description || "",
				websiteUrl: activeOrg.websiteUrl || "",
			})
		}
	}, [activeOrg])

	const loadBankAccounts = async () => {
		if (!activeProductId) return

		setLoadingBankAccounts(true)
		try {
			const response = await b2bApiClient.getBankAccounts(activeProductId)
			if (response.bankAccounts) {
				setBankAccounts(response.bankAccounts)
			}
		} catch (error) {
			console.error("Failed to load bank accounts:", error)
		} finally {
			setLoadingBankAccounts(false)
		}
	}

	const loadSupportedCurrencies = async () => {
		if (!activeProductId) return

		try {
			// This would need to be added to b2bApiClient
			// For now, we'll use a placeholder
			setSelectedCurrencies(["USD", "SGD"])
		} catch (error) {
			console.error("Failed to load supported currencies:", error)
		}
	}

	const handleUpdateOrgInfo = async () => {
		if (!activeProductId) return

		setIsLoading({ ...isLoading, orgInfo: true })
		setErrors({ ...errors, orgInfo: "" })

		try {
			await b2bApiClient.updateOrganizationInfo(activeProductId, orgInfo)
			setSuccess({ ...success, orgInfo: true })
			setTimeout(() => {
				setSuccess({ ...success, orgInfo: false })
			}, 3000)
		} catch (error: any) {
			setErrors({ ...errors, orgInfo: error.message || "Failed to update organization info" })
		} finally {
			setIsLoading({ ...isLoading, orgInfo: false })
		}
	}

	const handleRegenerateApiKey = async () => {
		if (!activeProductId) return

		setIsLoading({ ...isLoading, apiKey: true })
		setErrors({ ...errors, apiKey: "" })

		try {
			const response = await b2bApiClient.regenerateApiKey(activeProductId)
			if (response.api_key) {
				setApiKey(response.api_key)
				localStorage.setItem("b2b:api_key", response.api_key)

				// Update all stored keys
				const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
				allKeys[activeProductId] = response.api_key
				localStorage.setItem("b2b:api_keys", JSON.stringify(allKeys))

				setSuccess({ ...success, apiKey: true })
				setTimeout(() => {
					setSuccess({ ...success, apiKey: false })
				}, 3000)
			}
		} catch (error: any) {
			setErrors({ ...errors, apiKey: error.message || "Failed to regenerate API key" })
		} finally {
			setIsLoading({ ...isLoading, apiKey: false })
		}
	}

	const handleCopyApiKey = () => {
		if (apiKey) {
			navigator.clipboard.writeText(apiKey)
			setCopied(true)
			setTimeout(() => {
				setCopied(false)
			}, 2000)
		}
	}

	const handleAddBankAccount = () => {
		setBankAccounts([
			...bankAccounts,
			{
				currency: "USD",
				bank_name: "",
				account_number: "",
				account_name: "",
			},
		])
	}

	const handleRemoveBankAccount = (index: number) => {
		setBankAccounts(bankAccounts.filter((_, i) => i !== index))
	}

	const handleUpdateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
		const updated = [...bankAccounts]
		updated[index] = { ...updated[index], [field]: value }
		setBankAccounts(updated)
	}

	const handleSaveBankAccounts = async () => {
		if (!activeProductId) return

		setIsLoading({ ...isLoading, bankAccounts: true })
		setErrors({ ...errors, bankAccounts: "" })

		try {
			// Validate bank accounts
			for (const account of bankAccounts) {
				if (!account.currency || !account.bank_name || !account.account_number || !account.account_name) {
					throw new Error("All bank account fields are required")
				}
			}

			await b2bApiClient.configureBankAccounts(activeProductId, { bankAccounts })
			setSuccess({ ...success, bankAccounts: true })
			setTimeout(() => {
				setSuccess({ ...success, bankAccounts: false })
			}, 3000)
		} catch (error: any) {
			setErrors({ ...errors, bankAccounts: error.message || "Failed to save bank accounts" })
		} finally {
			setIsLoading({ ...isLoading, bankAccounts: false })
		}
	}

	const handleUpdateCurrencies = async () => {
		if (!activeProductId) return

		setIsLoading({ ...isLoading, currencies: true })
		setErrors({ ...errors, currencies: "" })

		try {
			await b2bApiClient.updateSupportedCurrencies(activeProductId, {
				supportedCurrencies: selectedCurrencies,
			})
			setSuccess({ ...success, currencies: true })
			setTimeout(() => {
				setSuccess({ ...success, currencies: false })
			}, 3000)
		} catch (error: any) {
			setErrors({ ...errors, currencies: error.message || "Failed to update currencies" })
		} finally {
			setIsLoading({ ...isLoading, currencies: false })
		}
	}

	const handleUpdateStrategy = (index: number, value: number) => {
		const updated = [...strategies]
		updated[index] = { ...updated[index], target: value }

		// Ensure total doesn't exceed 100
		const total = updated.reduce((sum, s) => sum + s.target, 0)
		if (total <= 100) {
			setStrategies(updated)
		}
	}

	const handleSaveStrategies = async () => {
		if (!activeProductId) return

		// Validate total equals 100
		const total = strategies.reduce((sum, s) => sum + s.target, 0)
		if (total !== 100) {
			setErrors({ ...errors, strategies: "Strategy allocations must total 100%" })
			return
		}

		setIsLoading({ ...isLoading, strategies: true })
		setErrors({ ...errors, strategies: "" })

		try {
			await b2bApiClient.configureVaultStrategies(activeProductId, {
				chain: "8453", // Base
				token_address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC on Base
				token_symbol: "USDC",
				strategies,
			})
			setSuccess({ ...success, strategies: true })
			setTimeout(() => {
				setSuccess({ ...success, strategies: false })
			}, 3000)
		} catch (error: any) {
			setErrors({ ...errors, strategies: error.message || "Failed to save strategies" })
		} finally {
			setIsLoading({ ...isLoading, strategies: false })
		}
	}

	const sections = [
		{ id: "organization", label: "Organization", icon: Building2 },
		{ id: "api", label: "API Configuration", icon: Key },
		{ id: "banking", label: "Bank Accounts", icon: Wallet },
		{ id: "currencies", label: "Supported Currencies", icon: Globe },
		{ id: "strategies", label: "DeFi Strategies", icon: Shield },
		{ id: "integrations", label: "Integrations", icon: Database },
		{ id: "notifications", label: "Notifications", icon: Bell },
		{ id: "customization", label: "White-Label", icon: Palette },
	]

	if (!activeProductId) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Selected</h3>
					<p className="text-gray-600">Please select an organization from the dropdown above to manage settings.</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-full">
			{/* Sidebar */}
			<div className="w-64 bg-white border-r border-gray-200">
				<div className="p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
					<nav className="space-y-1">
						{sections.map((section) => {
							const Icon = section.icon
							return (
								<button
									key={section.id}
									onClick={() => {
										setActiveSection(section.id)
									}}
									className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										activeSection === section.id
											? "bg-gray-100 text-gray-900"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<Icon className="h-4 w-4 mr-3" />
									<span className="flex-1 text-left">{section.label}</span>
									<ChevronRight className="h-4 w-4 text-gray-400" />
								</button>
							)
						})}
					</nav>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 bg-gray-50">
				<div className="max-w-4xl mx-auto p-8">
					{/* Organization Settings */}
					{activeSection === "organization" && (
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-6">Organization Information</h3>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
									<input
										type="text"
										value={orgInfo.companyName}
										onChange={(e) => {
											setOrgInfo({ ...orgInfo, companyName: e.target.value })
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
									<select
										value={orgInfo.businessType}
										onChange={(e) => {
											setOrgInfo({ ...orgInfo, businessType: e.target.value })
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="E-commerce">E-commerce</option>
										<option value="FinTech">FinTech</option>
										<option value="Gaming">Gaming</option>
										<option value="DeFi">DeFi</option>
										<option value="Other">Other</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
									<textarea
										value={orgInfo.description}
										onChange={(e) => {
											setOrgInfo({ ...orgInfo, description: e.target.value })
										}}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
									<input
										type="url"
										value={orgInfo.websiteUrl}
										onChange={(e) => {
											setOrgInfo({ ...orgInfo, websiteUrl: e.target.value })
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{errors.orgInfo && (
									<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{errors.orgInfo}</div>
								)}

								{success.orgInfo && (
									<div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center">
										<Check className="h-4 w-4 mr-2" />
										Organization information updated successfully
									</div>
								)}

								<div className="flex justify-end">
									<button
										onClick={handleUpdateOrgInfo}
										disabled={isLoading.orgInfo}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
									>
										{isLoading.orgInfo ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="h-4 w-4 mr-2" />
												Save Changes
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* API Configuration */}
					{activeSection === "api" && (
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-6">API Configuration</h3>

							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
									<div className="flex items-center space-x-2">
										<input
											type="text"
											value={activeProductId}
											readOnly
											className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
										/>
										<button
											onClick={() => {
												navigator.clipboard.writeText(activeProductId)
											}}
											className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
										>
											<Copy className="h-4 w-4" />
										</button>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
									{apiKey ? (
										<div className="space-y-3">
											<div className="flex items-center space-x-2">
												<input
													type={showApiKey ? "text" : "password"}
													value={apiKey}
													readOnly
													className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm"
												/>
												<button
													onClick={() => {
														setShowApiKey(!showApiKey)
													}}
													className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
												>
													{showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</button>
												<button
													onClick={handleCopyApiKey}
													className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
												>
													{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
												</button>
											</div>

											<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
												<p className="text-sm text-yellow-800">
													<strong>Warning:</strong> Regenerating your API key will invalidate the current key. Make sure
													to update your applications with the new key.
												</p>
											</div>
										</div>
									) : (
										<div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
											<p className="text-sm text-gray-600 mb-3">No API key generated yet</p>
										</div>
									)}
								</div>

								{errors.apiKey && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{errors.apiKey}</div>}

								{success.apiKey && (
									<div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center">
										<Check className="h-4 w-4 mr-2" />
										API key regenerated successfully
									</div>
								)}

								<div className="flex justify-end">
									<button
										onClick={handleRegenerateApiKey}
										disabled={isLoading.apiKey}
										className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
									>
										{isLoading.apiKey ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												Regenerating...
											</>
										) : (
											<>
												<RefreshCw className="h-4 w-4 mr-2" />
												Regenerate API Key
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Bank Accounts */}
					{activeSection === "banking" && (
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-6">Bank Account Configuration</h3>

							<div className="space-y-4">
								{bankAccounts.map((account, index) => (
									<div key={index} className="border border-gray-200 rounded-lg p-4">
										<div className="flex justify-between items-start mb-3">
											<h4 className="font-medium text-gray-900">Account {index + 1}</h4>
											<button
												onClick={() => {
													handleRemoveBankAccount(index)
												}}
												className="text-red-600 hover:text-red-700"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
												<select
													value={account.currency}
													onChange={(e) => {
														handleUpdateBankAccount(index, "currency", e.target.value)
													}}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												>
													{SUPPORTED_CURRENCIES.map((currency) => (
														<option key={currency} value={currency}>
															{currency}
														</option>
													))}
												</select>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
												<input
													type="text"
													value={account.bank_name}
													onChange={(e) => {
														handleUpdateBankAccount(index, "bank_name", e.target.value)
													}}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
												<input
													type="text"
													value={account.account_number}
													onChange={(e) => {
														handleUpdateBankAccount(index, "account_number", e.target.value)
													}}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
												<input
													type="text"
													value={account.account_name}
													onChange={(e) => {
														handleUpdateBankAccount(index, "account_name", e.target.value)
													}}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code (Optional)</label>
												<input
													type="text"
													value={account.swift_code || ""}
													onChange={(e) => {
														handleUpdateBankAccount(index, "swift_code", e.target.value)
													}}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
										</div>
									</div>
								))}

								<button
									onClick={handleAddBankAccount}
									className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 flex items-center justify-center"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Bank Account
								</button>

								{errors.bankAccounts && (
									<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{errors.bankAccounts}</div>
								)}

								{success.bankAccounts && (
									<div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center">
										<Check className="h-4 w-4 mr-2" />
										Bank accounts saved successfully
									</div>
								)}

								<div className="flex justify-end">
									<button
										onClick={handleSaveBankAccounts}
										disabled={isLoading.bankAccounts || bankAccounts.length === 0}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
									>
										{isLoading.bankAccounts ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="h-4 w-4 mr-2" />
												Save Bank Accounts
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Supported Currencies */}
					{activeSection === "currencies" && (
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-6">Supported Currencies</h3>

							<div className="space-y-4">
								<p className="text-sm text-gray-600">
									Select the currencies your platform will support for deposits and withdrawals.
								</p>

								<div className="grid grid-cols-3 gap-4">
									{SUPPORTED_CURRENCIES.map((currency) => (
										<label key={currency} className="flex items-center space-x-3">
											<input
												type="checkbox"
												checked={selectedCurrencies.includes(currency)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedCurrencies([...selectedCurrencies, currency])
													} else {
														setSelectedCurrencies(selectedCurrencies.filter((c) => c !== currency))
													}
												}}
												className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
											/>
											<span className="text-sm font-medium text-gray-700">{currency}</span>
										</label>
									))}
								</div>

								{errors.currencies && (
									<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{errors.currencies}</div>
								)}

								{success.currencies && (
									<div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center">
										<Check className="h-4 w-4 mr-2" />
										Supported currencies updated successfully
									</div>
								)}

								<div className="flex justify-end">
									<button
										onClick={handleUpdateCurrencies}
										disabled={isLoading.currencies || selectedCurrencies.length === 0}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
									>
										{isLoading.currencies ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="h-4 w-4 mr-2" />
												Save Currencies
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* DeFi Strategies */}
					{activeSection === "strategies" && (
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-6">DeFi Strategy Configuration</h3>

							<div className="space-y-6">
								<p className="text-sm text-gray-600">
									Configure how your vault funds will be allocated across different DeFi protocols. Allocations must
									total 100%.
								</p>

								<div className="space-y-4">
									{strategies.map((strategy, index) => (
										<div key={strategy.category} className="flex items-center space-x-4">
											<div className="w-32">
												<span className="text-sm font-medium text-gray-700 capitalize">
													{strategy.category === "lp" ? "Liquidity Pools" : strategy.category}
												</span>
											</div>
											<div className="flex-1">
												<input
													type="range"
													min="0"
													max="100"
													step="5"
													value={strategy.target}
													onChange={(e) => {
														handleUpdateStrategy(index, parseInt(e.target.value))
													}}
													className="w-full"
												/>
											</div>
											<div className="w-16 text-right">
												<span className="text-sm font-medium text-gray-900">{strategy.target}%</span>
											</div>
										</div>
									))}
								</div>

								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-700">Total Allocation</span>
										<span
											className={`text-lg font-semibold ${
												strategies.reduce((sum, s) => sum + s.target, 0) === 100 ? "text-green-600" : "text-red-600"
											}`}
										>
											{strategies.reduce((sum, s) => sum + s.target, 0)}%
										</span>
									</div>
								</div>

								<div className="bg-blue-50 border border-blue-200 rounded-md p-3">
									<p className="text-sm text-blue-800">
										<strong>Strategy Types:</strong>
									</p>
									<ul className="text-sm text-blue-700 mt-2 space-y-1">
										<li>
											• <strong>Lending:</strong> AAVE, Compound (Lower risk, steady yields)
										</li>
										<li>
											• <strong>Liquidity Pools:</strong> Uniswap, Curve (Medium risk, higher yields)
										</li>
										<li>
											• <strong>Staking:</strong> ETH staking, validator pools (Variable risk/reward)
										</li>
									</ul>
								</div>

								{errors.strategies && (
									<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{errors.strategies}</div>
								)}

								{success.strategies && (
									<div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center">
										<Check className="h-4 w-4 mr-2" />
										Strategy configuration saved successfully
									</div>
								)}

								<div className="flex justify-end">
									<button
										onClick={handleSaveStrategies}
										disabled={isLoading.strategies || strategies.reduce((sum, s) => sum + s.target, 0) !== 100}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
									>
										{isLoading.strategies ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="h-4 w-4 mr-2" />
												Save Strategy Configuration
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Other sections remain the same - integrations, notifications, customization */}
					{(activeSection === "integrations" ||
						activeSection === "notifications" ||
						activeSection === "customization") && (
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-6">
								{activeSection === "integrations" && "Integrations"}
								{activeSection === "notifications" && "Notification Preferences"}
								{activeSection === "customization" && "White-Label Customization"}
							</h3>
							<p className="text-sm text-gray-600">This section is coming soon.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
