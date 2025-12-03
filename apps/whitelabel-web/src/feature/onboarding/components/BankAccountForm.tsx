import { useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { AlertCircle, Plus, Trash2 } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"
import { type BankAccount, useOnboardingStore } from "@/store/onboardingStore"
import { useUserStore } from "@/store/userStore"

export function BankAccountForm() {
	const navigate = useNavigate()
	const { user } = usePrivy()
	const { bankingInfo, addBankAccount, removeBankAccount, previousStep, resetOnboarding, companyInfo, strategies } =
		useOnboardingStore()
	const { addOrganization } = useUserStore()

	const [newAccount, setNewAccount] = useState<BankAccount>({
		currency: "USD",
		bank_name: "",
		account_number: "",
		account_name: "",
		swift_code: "",
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string>("")

	const handleAddAccount = () => {
		if (!newAccount.bank_name || !newAccount.account_number || !newAccount.account_name) {
			setError("Please fill in all required fields")
			return
		}

		addBankAccount(newAccount)
		setNewAccount({
			currency: "USD",
			bank_name: "",
			account_number: "",
			account_name: "",
			swift_code: "",
		})
		setError("")
	}

	const handleSkip = async () => {
		await handleComplete(false)
	}

	const handleComplete = async (includeBanking = true) => {
		setIsSubmitting(true)
		setError("")

		try {
			// Get Privy user data
			if (!user) {
				throw new Error("Not authenticated")
			}

			const privyOrganizationId = user.id
			const privyEmail = user.email?.address
			const privyWalletAddress = user.wallet?.address || ""

			// Step 1: Register client
			const clientResponse = await b2bApiClient.registerClient({
				companyName: companyInfo.companyName,
				businessType: companyInfo.businessType,
				description: companyInfo.description || undefined,
				websiteUrl: companyInfo.websiteUrl || undefined,
				privyOrganizationId,
				privyEmail,
				privyWalletAddress,
				walletType: "MANAGED",
				vaultsToCreate: "both",
			})

			// Extract product ID from response
			const productId =
				typeof clientResponse === "object" && clientResponse && "productId" in clientResponse
					? (clientResponse.productId as string)
					: ""

			if (!productId) {
				throw new Error("Failed to create product")
			}

			// Step 2: Configure strategies (map ranking to allocations)
			// For now, we'll use a simple allocation based on rank
			const totalRanks = strategies.priorities.reduce((sum, p) => sum + (6 - p.rank), 0)
			const strategyAllocations = strategies.priorities.map((priority) => {
				const weight = (6 - priority.rank) / totalRanks
				return {
					category: priority.id,
					target: Math.round(weight * 100),
				}
			})

			// Normalize to ensure total is 100%
			const total = strategyAllocations.reduce((sum, s) => sum + s.target, 0)
			if (total !== 100) {
				const diff = 100 - total
				strategyAllocations[0].target += diff
			}

			await b2bApiClient.configureStrategies(productId, {
				chain: "8453", // Base
				token: "USDC",
				token_address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC on Base
				strategies: strategyAllocations.map((s) => ({
					category: s.category as "lending" | "lp" | "staking",
					target: s.target,
				})),
			})

			// Step 3: Configure bank accounts if provided
			if (includeBanking && bankingInfo.accounts.length > 0) {
				await b2bApiClient.configureBankAccounts(productId, {
					bankAccounts: bankingInfo.accounts.map((account) => ({
						currency: account.currency,
						bank_name: account.bank_name,
						account_number: account.account_number,
						account_name: account.account_name,
						bank_details: account.bank_details,
					})),
				})
			}

			// Step 4: Add to user store
			if (typeof clientResponse === "object" && clientResponse) {
				addOrganization({
					id: "id" in clientResponse ? (clientResponse.id as string) : "",
					productId,
					companyName: companyInfo.companyName,
					businessType: companyInfo.businessType,
					description: companyInfo.description,
					websiteUrl: companyInfo.websiteUrl,
					isActive: true,
					isSandbox: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
			}

			// Step 5: Clear onboarding state
			resetOnboarding()

			// Step 6: Redirect to dashboard
			void navigate({ to: "/dashboard" })
		} catch (err) {
			console.error("Failed to create product:", err)
			setError(err instanceof Error ? err.message : "Failed to create product. Please try again.")
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Banking Information</h2>
				<p className="text-gray-600">Configure bank accounts for fiat withdrawals (Optional)</p>
			</div>

			{/* Info Banner */}
			<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
					<div className="flex-1">
						<h3 className="text-sm font-medium text-amber-900 mb-1">Optional Setup</h3>
						<p className="text-sm text-amber-700">
							Bank accounts are used for fiat off-ramp (withdrawals). You can skip this step and configure it later in
							Settings.
						</p>
					</div>
				</div>
			</div>

			{/* Error Message */}
			{error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}

			{/* Existing Accounts */}
			{bankingInfo.accounts.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-gray-700">Added Accounts</h3>
					{bankingInfo.accounts.map((account, index) => (
						<div
							key={index}
							className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
						>
							<div className="flex-1">
								<div className="font-medium text-gray-900">{account.bank_name}</div>
								<div className="text-sm text-gray-600">
									{account.account_name} • {account.currency}
								</div>
								<div className="text-sm text-gray-500">Account: ****{account.account_number.slice(-4)}</div>
							</div>
							<button
								type="button"
								onClick={() => {
									removeBankAccount(index)
								}}
								className="text-red-600 hover:text-red-700"
							>
								<Trash2 className="h-5 w-5" />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Add New Account Form */}
			<div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
				<h3 className="text-sm font-medium text-gray-700">Add Bank Account</h3>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
							Currency
						</label>
						<select
							id="currency"
							value={newAccount.currency}
							onChange={(e) => {
								setNewAccount({ ...newAccount, currency: e.target.value })
							}}
							className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
						>
							<option value="USD">USD</option>
							<option value="EUR">EUR</option>
							<option value="GBP">GBP</option>
							<option value="THB">THB</option>
						</select>
					</div>

					<div>
						<label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
							Bank Name *
						</label>
						<input
							type="text"
							id="bank_name"
							value={newAccount.bank_name}
							onChange={(e) => {
								setNewAccount({ ...newAccount, bank_name: e.target.value })
							}}
							className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
							placeholder="Chase Bank"
						/>
					</div>

					<div>
						<label htmlFor="account_name" className="block text-sm font-medium text-gray-700 mb-1">
							Account Name *
						</label>
						<input
							type="text"
							id="account_name"
							value={newAccount.account_name}
							onChange={(e) => {
								setNewAccount({ ...newAccount, account_name: e.target.value })
							}}
							className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
							placeholder="John Doe"
						/>
					</div>

					<div>
						<label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
							Account Number *
						</label>
						<input
							type="text"
							id="account_number"
							value={newAccount.account_number}
							onChange={(e) => {
								setNewAccount({ ...newAccount, account_number: e.target.value })
							}}
							className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
							placeholder="123456789"
						/>
					</div>

					<div className="col-span-2">
						<label htmlFor="swift_code" className="block text-sm font-medium text-gray-700 mb-1">
							SWIFT/BIC Code
						</label>
						<input
							type="text"
							id="swift_code"
							value={newAccount.swift_code}
							onChange={(e) => {
								setNewAccount({ ...newAccount, swift_code: e.target.value })
							}}
							className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
							placeholder="CHASUS33"
						/>
					</div>
				</div>

				<button
					type="button"
					onClick={handleAddAccount}
					className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
				>
					<Plus className="h-5 w-5" />
					Add Account
				</button>
			</div>

			{/* Navigation */}
			<div className="flex justify-between pt-4">
				<button
					type="button"
					onClick={previousStep}
					disabled={isSubmitting}
					className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
				>
					← Back
				</button>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={handleSkip}
						disabled={isSubmitting}
						className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
					>
						{isSubmitting ? "Creating..." : "Skip for Now"}
					</button>
					<button
						type="button"
						onClick={() => {
							void handleComplete(true)
						}}
						disabled={isSubmitting || bankingInfo.accounts.length === 0}
						className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
					>
						{isSubmitting ? "Creating Product..." : "Complete Setup →"}
					</button>
				</div>
			</div>
		</div>
	)
}
