import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import axios from "axios"
import { Check, ChevronDown, ChevronUp, Copy, Play } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"

// Helper functions for API key management
const saveApiKey = (apiKey: string) => {
	localStorage.setItem("b2b:api_key", apiKey)
}

const loadApiKey = (): string | null => {
	return localStorage.getItem("b2b:api_key")
}

interface APIEndpoint {
	id: string
	flow: string
	title: string
	method: "GET" | "POST" | "PUT" | "DELETE"
	endpoint: string
	description: string
	params: {
		name: string
		type: string
		required: boolean
		description: string
		default?: string
	}[]
	exampleResponse: string
}

const API_FLOWS: APIEndpoint[] = [
	// FLOW 1: Client Registration
	{
		id: "client-register",
		flow: "FLOW 1",
		title: "Client Registration (Product Owner)",
		method: "POST",
		endpoint: "/api/v1/clients",
		description:
			"Register a new client organization (Product Owner). Uses Privy authentication to link organization ID.",
		params: [
			{
				name: "companyName",
				type: "string",
				required: true,
				description: 'Company name (e.g., "GrabPay")',
				default: "GrabPay",
			},
			{
				name: "businessType",
				type: "string",
				required: true,
				description: 'Business type (e.g., "fintech")',
				default: "fintech",
			},
			{
				name: "walletType",
				type: "string",
				required: true,
				description: 'Wallet type: "MANAGED" (custodial) or "USER_OWNED" (non-custodial)',
				default: "MANAGED",
			},
			{
				name: "privyOrganizationId",
				type: "string",
				required: true,
				description: "Privy organization ID (auto-populated from your Privy account)",
				default: "privy_org_123",
			},
			{
				name: "description",
				type: "string",
				required: false,
				description: "Optional company description",
			},
			{
				name: "websiteUrl",
				type: "string",
				required: false,
				description: "Optional website URL",
			},
		],
		exampleResponse: JSON.stringify(
			{
				id: "uuid...",
				productId: "prod_1234567890",
				companyName: "GrabPay",
				businessType: "fintech",
				walletType: "custodial",
				privyOrganizationId: "privy:user:abc123",
				isActive: true,
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
			},
			null,
			2,
		),
	},

	// FLOW 2: Strategy Configuration
	{
		id: "strategy-config",
		flow: "FLOW 2",
		title: "Configure Vault Strategies",
		method: "POST",
		endpoint: "/api/v1/clients/{id}/strategies",
		description: "Define DeFi strategy allocation for a client vault",
		params: [
			{ name: "client_id", type: "string", required: true, description: "Client ID from registration" },
			{ name: "chain", type: "string", required: true, description: "Blockchain network", default: "ethereum" },
			{
				name: "token_address",
				type: "string",
				required: true,
				description: "Token contract address",
				default: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			},
			{
				name: "strategies",
				type: "json",
				required: true,
				description: "Strategy allocation array",
				default:
					'[{"category":"lending","target":50},{"category":"lp","target":30},{"category":"staking","target":20}]',
			},
		],
		exampleResponse: JSON.stringify(
			{
				vault_id: "uuid...",
				strategies: [
					{ category: "lending", target: 50 },
					{ category: "lp", target: 30 },
					{ category: "staking", target: 20 },
				],
			},
			null,
			2,
		),
	},

	// FLOW 3: End-User Creation
	{
		id: "user-create",
		flow: "FLOW 3",
		title: "Create End User",
		method: "POST",
		endpoint: "/api/v1/users",
		description: "Create a new end user account (e.g., Grab driver)",
		params: [
			{ name: "api_key", type: "string", required: true, description: "Client API key (from registration)" },
			{
				name: "user_id",
				type: "string",
				required: true,
				description: "Client's internal user ID",
				default: "grab_driver_12345",
			},
			{ name: "user_type", type: "string", required: true, description: "User type", default: "custodial" },
		],
		exampleResponse: JSON.stringify(
			{
				user_id: "uuid...",
				status: "active",
			},
			null,
			2,
		),
	},

	// FLOW 4: Initiate Deposit
	{
		id: "deposit-initiate",
		flow: "FLOW 4",
		title: "Initiate Deposit (On-Ramp)",
		method: "POST",
		endpoint: "/api/v1/deposits",
		description: "Start a deposit via external on-ramp (Bitkub/Transak)",
		params: [
			{ name: "api_key", type: "string", required: true, description: "Client API key" },
			{ name: "user_id", type: "string", required: true, description: "End user ID", default: "grab_driver_12345" },
			{ name: "amount", type: "number", required: true, description: "Fiat amount", default: "10000" },
			{ name: "currency", type: "string", required: true, description: "Fiat currency", default: "THB" },
			{ name: "chain", type: "string", required: true, description: "Blockchain network", default: "ethereum" },
			{ name: "token", type: "string", required: true, description: "Crypto token", default: "USDC" },
			{ name: "payment_method", type: "string", required: true, description: "Payment method", default: "promptpay" },
		],
		exampleResponse: JSON.stringify(
			{
				order_id: "dep_1234567890_abc",
				payment_url: "https://pay.bitkub.com/...",
				qr_code: "data:image/png;base64,...",
				expires_at: "2024-01-15T10:00:00Z",
			},
			null,
			2,
		),
	},

	// FLOW 4b: Complete Deposit
	{
		id: "deposit-complete",
		flow: "FLOW 4",
		title: "Complete Deposit (Webhook)",
		method: "POST",
		endpoint: "/webhooks/bitkub",
		description: "Webhook callback from on-ramp provider after payment",
		params: [
			{
				name: "gateway_order_id",
				type: "string",
				required: true,
				description: "On-ramp provider order ID",
				default: "btkb_xyz123",
			},
			{ name: "status", type: "string", required: true, description: "Payment status", default: "completed" },
			{ name: "fiat_amount", type: "number", required: true, description: "Fiat amount paid", default: "10000" },
			{
				name: "crypto_amount",
				type: "number",
				required: true,
				description: "Crypto amount received",
				default: "285.71",
			},
			{
				name: "tx_hash",
				type: "string",
				required: true,
				description: "Blockchain transaction hash",
				default: "0xabc...def",
			},
		],
		exampleResponse: JSON.stringify(
			{
				success: true,
				shares_minted: "285710000000000000000",
				effective_balance: "285.71",
				current_index: "1000000000000000000",
			},
			null,
			2,
		),
	},

	// FLOW 5: Get User Balance
	{
		id: "balance-get",
		flow: "FLOW 5",
		title: "Get User Balance",
		method: "GET",
		endpoint: "/api/v1/users/{user_id}/balance",
		description: "Retrieve user's current vault balance with yield",
		params: [
			{ name: "api_key", type: "string", required: true, description: "Client API key" },
			{ name: "user_id", type: "string", required: true, description: "End user ID", default: "grab_driver_12345" },
			{ name: "chain", type: "string", required: false, description: "Filter by chain", default: "ethereum" },
			{ name: "token", type: "string", required: false, description: "Filter by token", default: "USDC" },
		],
		exampleResponse: JSON.stringify(
			{
				balance: 285.71,
				currency: "USDC",
				yield_earned: 0,
				apy: 0,
				status: "pending_stake",
				shares: "285710000000000000000",
				entry_index: "1000000000000000000",
				current_index: "1000000000000000000",
			},
			null,
			2,
		),
	},

	// FLOW 7: Yield Update
	{
		id: "yield-update",
		flow: "FLOW 7",
		title: "Update Index with Yield",
		method: "POST",
		endpoint: "/api/v1/vaults/{vault_id}/yield",
		description: "Update vault index with earned yield (internal/cron)",
		params: [
			{ name: "vault_id", type: "string", required: true, description: "Client vault ID" },
			{ name: "yield_earned", type: "number", required: true, description: "Yield earned from DeFi", default: "500" },
			{ name: "total_staked", type: "number", required: true, description: "Current staked balance", default: "10000" },
		],
		exampleResponse: JSON.stringify(
			{
				old_index: "1000000000000000000",
				new_index: "1050000000000000000",
				yield_earned: "500",
				apy: "5.0",
			},
			null,
			2,
		),
	},

	// FLOW 8: Initiate Withdrawal
	{
		id: "withdrawal-initiate",
		flow: "FLOW 8",
		title: "Request Withdrawal",
		method: "POST",
		endpoint: "/api/v1/withdrawals",
		description: "User requests to withdraw funds",
		params: [
			{ name: "api_key", type: "string", required: true, description: "Client API key" },
			{ name: "user_id", type: "string", required: true, description: "End user ID", default: "grab_driver_12345" },
			{
				name: "vaultId",
				type: "string",
				required: true,
				description: "Vault ID (chain-tokenAddress)",
				default: "ethereum-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			},
			{ name: "amount", type: "number", required: true, description: "Amount to withdraw", default: "100" },
			{
				name: "destination_address",
				type: "string",
				required: false,
				description: "Withdrawal address (if non-custodial)",
			},
		],
		exampleResponse: JSON.stringify(
			{
				withdrawal_id: "uuid...",
				status: "queued",
				shares_burned: "95238095238095238095",
				estimated_completion: "2024-01-15T12:00:00Z",
			},
			null,
			2,
		),
	},

	// FLOW 9: Get User Vault List
	{
		id: "vaults-list",
		flow: "FLOW 9",
		title: "List User Vaults",
		method: "GET",
		endpoint: "/api/v1/users/{user_id}/vaults",
		description: "Get all vaults for a user across chains/tokens",
		params: [
			{ name: "api_key", type: "string", required: true, description: "Client API key" },
			{ name: "user_id", type: "string", required: true, description: "End user ID", default: "grab_driver_12345" },
		],
		exampleResponse: JSON.stringify(
			{
				vaults: [
					{
						chain: "ethereum",
						token: "USDC",
						balance: 285.71,
						yield_earned: 14.28,
						apy: 5.0,
						shares: "285710000000000000000",
						status: "active",
					},
					{
						chain: "base",
						token: "USDC",
						balance: 500.0,
						yield_earned: 25.0,
						apy: 5.0,
						shares: "476190476190476190476",
						status: "active",
					},
				],
			},
			null,
			2,
		),
	},
]

export function APITestingPage() {
	const [expandedCard, setExpandedCard] = useState<string | null>(null)
	const [loading, setLoading] = useState<string | null>(null)
	const [responses, setResponses] = useState<Record<string, { status: number; data: unknown; timestamp: string }>>({})
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [formData, setFormData] = useState<Record<string, Record<string, string>>>({})
	const [savedApiKey, setSavedApiKey] = useState<string | null>(null)

	// Privy integration
	const { user, authenticated } = usePrivy()

	// Load saved API key on mount
	useEffect(() => {
		const apiKey = loadApiKey()
		if (apiKey) {
			setSavedApiKey(apiKey)
			// eslint-disable-next-line no-console
			console.log("[API Test] Loaded API key from localStorage")
		}
	}, [])

	// Auto-populate Privy data when user is authenticated
	useEffect(() => {
		if (authenticated && user) {
			// eslint-disable-next-line no-console
			console.log("[API Test] Privy user authenticated:", {
				userId: user.id,
				email: user.email?.address,
				wallet: user.wallet,
				linkedAccounts: user.linkedAccounts,
			})

			// Determine wallet type based on Privy login method
			// Check if user has any external wallet (MetaMask, WalletConnect, Coinbase Wallet, etc.)
			// Privy embedded wallet has walletClientType = "privy"
			// External wallets have walletClientType = "metamask" | "walletconnect" | "coinbase_wallet" | etc.
			const hasExternalWallet = user.wallet?.walletClientType !== undefined && user.wallet.walletClientType !== "privy"

			// Also check linked accounts for external wallets
			const hasLinkedExternalWallet = user.linkedAccounts.some(
				(account) => account.type === "wallet" && "walletClientType" in account && account.walletClientType !== "privy",
			)

			const isNonCustodial = hasExternalWallet || hasLinkedExternalWallet
			const autoDetectedWalletType = isNonCustodial ? "USER_OWNED" : "MANAGED"

			// Get the external wallet address (prioritize active wallet, then first linked wallet)
			let externalWalletAddress: string | undefined
			if (hasExternalWallet && user.wallet?.address) {
				externalWalletAddress = user.wallet.address
			} else if (hasLinkedExternalWallet) {
				const linkedWallet = user.linkedAccounts.find(
					(account) =>
						account.type === "wallet" && "walletClientType" in account && account.walletClientType !== "privy",
				)
				if (linkedWallet && "address" in linkedWallet) {
					externalWalletAddress = linkedWallet.address
				}
			}

			// eslint-disable-next-line no-console
			console.log("[API Test] Auto-detected wallet type:", {
				walletType: autoDetectedWalletType,
				hasExternalWallet: hasExternalWallet,
				hasLinkedExternalWallet: hasLinkedExternalWallet,
				isNonCustodial: isNonCustodial,
				walletClientType: user.wallet?.walletClientType,
				externalWalletAddress: externalWalletAddress,
			})

			// Auto-populate client registration form with Privy data
			setFormData((prev) => ({
				...prev,
				"client-register": {
					...prev["client-register"],
					// Use Privy user ID as organization ID
					privyOrganizationId: user.id,
					// Auto-detect wallet type based on login method
					walletType: autoDetectedWalletType,
					// If user has external wallet, include the address
					...(externalWalletAddress
						? {
								privyWalletAddress: externalWalletAddress,
							}
						: {}),
				},
			}))
		}
	}, [authenticated, user])

	const toggleCard = (id: string) => {
		setExpandedCard(expandedCard === id ? null : id)
	}

	const handleParamChange = (endpointId: string, paramName: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[endpointId]: {
				...prev[endpointId],
				[paramName]: value,
			},
		}))
	}

	const executeRequest = async (endpoint: APIEndpoint) => {
		setLoading(endpoint.id)

		try {
			// Get current form data
			const params = getInitialFormData(endpoint)

			let data: unknown

			// Route to appropriate b2bApiClient method based on endpoint ID
			switch (endpoint.id) {
				// FLOW 1: Client Registration
				case "client-register":
					data = await b2bApiClient.registerClient({
						companyName: params.companyName,
						businessType: params.businessType,
						walletType: params.walletType as "MANAGED" | "USER_OWNED",
						privyOrganizationId: params.privyOrganizationId,
						description: params.description || undefined,
						websiteUrl: params.websiteUrl || undefined,
					})
					break

				// FLOW 2: Configure Vault Strategies
				case "strategy-config":
					data = await b2bApiClient.configureStrategies(params.client_id, {
						chain: params.chain,
						token_address: params.token_address,
						strategies: JSON.parse(params.strategies) as { category: string; target: number }[],
					})
					break

				// FLOW 3: Create End User
				case "user-create":
					data = await b2bApiClient.createUser({
						user_id: params.user_id,
						user_type: params.user_type,
					})
					break

				// FLOW 4a: Initiate Deposit
				case "deposit-initiate":
					data = await b2bApiClient.createDeposit({
						user_id: params.user_id,
						amount: params.amount,
						currency: params.currency,
						chain: params.chain,
						token: params.token,
						payment_method: params.payment_method,
					})
					break

				// FLOW 4b: Complete Deposit (Bitkub webhook)
				case "deposit-complete":
					data = await b2bApiClient.completeDeposit({
						vaultId: params.vaultId,
						transactionHash: params.tx_hash,
					})
					break

				// FLOW 5: Get User Balance
				case "balance-get":
					data = await b2bApiClient.getUserBalance(params.user_id, {
						chain: params.chain || undefined,
						token: params.token || undefined,
					})
					break

				// FLOW 7: Update Vault Yield
				case "yield-update":
					data = await b2bApiClient.updateVaultYield(params.vault_id, {
						yield_earned: params.yield_earned,
						total_staked: params.total_staked,
					})
					break

				// FLOW 8: Initiate Withdrawal
				case "withdrawal-initiate":
					data = await b2bApiClient.createWithdrawal({
						user_id: params.user_id,
						vaultId: params.vaultId,
						amount: params.amount,
						destination_address: params.destination_address || undefined,
					})
					break

				// FLOW 9: List User Vaults
				case "vaults-list":
					data = await b2bApiClient.getUserVaults(params.user_id)
					break

				default:
					throw new Error(`Unknown endpoint: ${endpoint.id}`)
			}

			// Auto-save API key if this is a client registration response
			// TODO: Backend needs to return api_key in the response
			// Currently ClientDto doesn't include api_key field
			if (
				endpoint.id === "client-register" &&
				data &&
				typeof data === "object" &&
				"api_key" in data &&
				typeof data.api_key === "string"
			) {
				const apiKey = data.api_key
				saveApiKey(apiKey)
				setSavedApiKey(apiKey)
				// eslint-disable-next-line no-console
				console.log("[API Test] API Key saved to localStorage")
			}

			setResponses((prev) => ({
				...prev,
				[endpoint.id]: {
					status: 200,
					data: data,
					timestamp: new Date().toISOString(),
				},
			}))

			// eslint-disable-next-line no-console
			console.log(`[API Test] Response (200):`, data)
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("[API Test] Error:", error)

			let errorMessage = "Request failed"
			let statusCode = 500
			let errorData: unknown = null

			// Handle axios errors
			if (axios.isAxiosError(error)) {
				statusCode = error.response?.status ?? 500
				const responseData = error.response?.data as { message?: string; error?: string } | undefined
				errorMessage = responseData?.message ?? responseData?.error ?? error.message
				errorData = error.response?.data
			} else if (error instanceof Error) {
				errorMessage = error.message
			}

			setResponses((prev) => ({
				...prev,
				[endpoint.id]: {
					status: statusCode,
					data: errorData ?? {
						error: errorMessage,
						message:
							statusCode === 500
								? "Failed to connect to B2B API. Make sure the server is running on port 3002."
								: errorMessage,
					},
					timestamp: new Date().toISOString(),
				},
			}))
		} finally {
			setLoading(null)
		}
	}

	const copyToClipboard = (text: string, id: string) => {
		void navigator.clipboard.writeText(text)
		setCopiedId(id)
		setTimeout(() => {
			setCopiedId(null)
		}, 2000)
	}

	const getMethodColor = (method: string) => {
		switch (method) {
			case "GET":
				return "bg-blue-100 text-blue-700"
			case "POST":
				return "bg-green-100 text-green-700"
			case "PUT":
				return "bg-yellow-100 text-yellow-700"
			case "DELETE":
				return "bg-red-100 text-red-700"
			default:
				return "bg-gray-100 text-gray-700"
		}
	}

	const getInitialFormData = (endpoint: APIEndpoint) => {
		const data: Record<string, string> = {}
		endpoint.params.forEach((param) => {
			const endpointData = formData[endpoint.id]
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const existingValue = endpointData ? endpointData[param.name] : undefined

			// Auto-populate api_key from savedApiKey if available
			if (param.name === "api_key" && !existingValue && savedApiKey) {
				data[param.name] = savedApiKey
			} else {
				data[param.name] = existingValue ?? param.default ?? ""
			}
		})
		return data
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">API Testing Dashboard</h1>
					<p className="mt-2 text-gray-600">Interactive API explorer for INDEX_VAULT_SYSTEM.md flows</p>
					<div className="mt-4 flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-green-500"></div>
							<span className="text-gray-600">
								Base URL:{" "}
								<code className="px-2 py-1 bg-gray-100 rounded">
									{(import.meta.env.VITE_B2B_API_URL as string | undefined) ?? "http://localhost:3002"}
								</code>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs text-gray-500">
								Connected to <strong>b2b-api-new</strong> server
							</span>
						</div>
					</div>
				</div>

				{/* Privy Authentication Status */}
				<div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<h3 className="text-lg font-semibold text-gray-900">🔐 Privy Authentication</h3>
								<span
									className={`text-xs font-semibold px-2 py-1 rounded ${
										authenticated ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
									}`}
								>
									{authenticated ? "Connected" : "Not Connected"}
								</span>
							</div>
							<p className="text-sm text-gray-600 mb-4">
								{authenticated
									? "Your Privy account is connected. Client registration will use your Privy organization ID."
									: "You are already authenticated with Privy. Check the navbar to see your account details."}
							</p>

							{authenticated && user && (
								<div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
									<div>
										<p className="text-xs text-gray-500 mb-1">Privy User ID</p>
										<code className="text-sm font-mono text-gray-900">{user.id}</code>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Email</p>
										<code className="text-sm font-mono text-gray-900">{user.email?.address ?? "N/A"}</code>
									</div>
									<div className="col-span-2">
										<p className="text-xs text-gray-500 mb-1">Usage</p>
										<p className="text-sm text-gray-700">
											This Privy ID will be auto-populated in the <strong>Client Registration</strong> form below as the{" "}
											<code className="bg-white px-1 py-0.5 rounded">privyOrganizationId</code>.
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* API Cards */}
				<div className="space-y-4">
					{API_FLOWS.map((endpoint) => {
						const isExpanded = expandedCard === endpoint.id
						const response = responses[endpoint.id]
						const currentFormData = getInitialFormData(endpoint)

						return (
							<div key={endpoint.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
								{/* Card Header */}
								<div
									className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
									onClick={() => {
										toggleCard(endpoint.id)
									}}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
													{endpoint.flow}
												</span>
												<span className={`text-xs font-semibold px-2 py-1 rounded ${getMethodColor(endpoint.method)}`}>
													{endpoint.method}
												</span>
												<h3 className="text-lg font-semibold text-gray-900">{endpoint.title}</h3>
												{endpoint.id === "client-register" && (
													<span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded flex items-center gap-1">
														🔐 Requires Privy
													</span>
												)}
											</div>
											<code className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">{endpoint.endpoint}</code>
											<p className="mt-2 text-sm text-gray-600">{endpoint.description}</p>
										</div>
										<button className="ml-4 text-gray-400 hover:text-gray-600">
											{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
										</button>
									</div>
								</div>

								{/* Card Body - Expanded */}
								{isExpanded && (
									<div className="border-t border-gray-200">
										<div className="p-6 space-y-6">
											{/* Parameters Section */}
											<div>
												<h4 className="text-sm font-semibold text-gray-900 mb-3">Parameters</h4>
												<div className="space-y-3">
													{endpoint.params.map((param) => (
														<div key={param.name} className="grid grid-cols-12 gap-4 items-start">
															<div className="col-span-3">
																<label className="block text-sm font-medium text-gray-700">
																	{param.name}
																	{param.required && <span className="text-red-500 ml-1">*</span>}
																</label>
																<span className="text-xs text-gray-500">{param.type}</span>
															</div>
															<div className="col-span-9">
																{param.type === "json" ? (
																	<textarea
																		value={currentFormData[param.name]}
																		onChange={(e) => {
																			handleParamChange(endpoint.id, param.name, e.target.value)
																		}}
																		placeholder={param.description}
																		rows={3}
																		className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
																	/>
																) : (
																	<input
																		type="text"
																		value={currentFormData[param.name]}
																		onChange={(e) => {
																			handleParamChange(endpoint.id, param.name, e.target.value)
																		}}
																		placeholder={param.description}
																		className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
																	/>
																)}
																<p className="mt-1 text-xs text-gray-500">{param.description}</p>
															</div>
														</div>
													))}
												</div>
											</div>

											{/* Execute Button */}
											<div className="flex items-center gap-3">
												<button
													onClick={() => executeRequest(endpoint)}
													disabled={loading === endpoint.id}
													className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													<Play size={16} />
													{loading === endpoint.id ? "Executing..." : "Execute"}
												</button>

												{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
												{response && (
													<span
														className={`text-sm font-medium ${
															response.status === 200 ? "text-green-600" : "text-red-600"
														}`}
													>
														Status: {response.status}
													</span>
												)}
											</div>

											{/* Response Section */}
											{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
											{response && (
												<div>
													<div className="flex items-center justify-between mb-2">
														<h4 className="text-sm font-semibold text-gray-900">Response</h4>
														<div className="flex items-center gap-2">
															<span className="text-xs text-gray-500">{response.timestamp}</span>
															<button
																onClick={() => {
																	copyToClipboard(JSON.stringify(response.data, null, 2), endpoint.id)
																}}
																className="p-1 hover:bg-gray-100 rounded"
															>
																{copiedId === endpoint.id ? (
																	<Check size={16} className="text-green-600" />
																) : (
																	<Copy size={16} className="text-gray-600" />
																)}
															</button>
														</div>
													</div>
													<pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
														{JSON.stringify(response.data, null, 2)}
													</pre>
												</div>
											)}

											{/* Example Response */}
											{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
											{!response && (
												<div>
													<h4 className="text-sm font-semibold text-gray-900 mb-2">Example Response</h4>
													<pre className="bg-gray-50 text-gray-800 p-4 rounded-md overflow-x-auto text-sm border border-gray-200">
														{endpoint.exampleResponse}
													</pre>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
