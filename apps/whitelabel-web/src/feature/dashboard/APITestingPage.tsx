import { useEffect, useState } from "react"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import axios from "axios"
import { Check, ChevronDown, ChevronUp, Copy, Play, RefreshCw } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"
import { type Organization, useUserStore } from "@/store/userStore"

// Type for client registration response
interface ClientRegistrationResponse {
	id: string
	productId: string
	companyName: string
	businessType: string
	description?: string
	websiteUrl?: string
	isActive: boolean
	isSandbox: boolean
	createdAt: string
	updatedAt: string
}

// ========================================
// Per-Organization API Key Management
// ========================================
// IMPORTANT: Each organization has its own API key!
// When switching orgs, we must load the correct key for that org.

/**
 * Save API key for specific organization
 * Stores in a map: { productId: apiKey }
 */
const saveApiKeyForOrg = (productId: string, apiKey: string) => {
	// Get all stored keys
	const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")

	// Add/update key for this org
	allKeys[productId] = apiKey
	localStorage.setItem("b2b:api_keys", JSON.stringify(allKeys))

	// Also set as current active key (for axios interceptor)
	localStorage.setItem("b2b:api_key", apiKey)

	// eslint-disable-next-line no-console
	console.log(`[API Keys] ✅ Saved for ${productId}:`, apiKey.substring(0, 12) + "...")
	// eslint-disable-next-line no-console
	console.log("[API Keys] 📦 All stored keys:", Object.keys(allKeys))
}

/**
 * Load API key for specific organization
 */
const loadApiKeyForOrg = (productId: string): string | null => {
	const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") ?? "{}")
	return allKeys[productId] ?? null
}

/**
 * Load current active API key (used by axios interceptor)
 * This is the global "active" key that axios will use
 */
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
		type: "string" | "json" | "select" | "number"
		required: boolean
		description: string
		default?: string
		options?: { value: string; label: string }[]
	}[]
	exampleResponse: string
}

// Token address mapping by chain and token
const TOKEN_ADDRESSES: Record<string, Record<string, { address: string; symbol: string }>> = {
	"8453": {
		// Base
		USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC" },
		USDT: { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", symbol: "USDT" },
	},
	"1": {
		// Ethereum
		USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" },
		USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT" },
	},
	"137": {
		// Polygon
		USDC: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC" },
		USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT" },
	},
	"10": {
		// Optimism
		USDC: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC" },
		USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT" },
	},
	"42161": {
		// Arbitrum
		USDC: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC" },
		USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT" },
	},
}

const API_FLOWS: APIEndpoint[] = [
	// FLOW 0: Generate API Key (for testing external integrations)
	{
		id: "api-key-generate",
		flow: "FLOW 0",
		title: "Generate API Key",
		method: "POST",
		endpoint: "/api/v1/clients/product/{productId}/regenerate-api-key",
		description:
			"🔑 Generate API key for existing organization. This is what external developers use to authenticate their apps. The key is stored per-organization and auto-loaded when switching orgs. ⚠️ WARNING: Regenerating invalidates the old key!",
		params: [
			{
				name: "productId",
				type: "string",
				required: true,
				description: "Product ID of the organization (auto-filled from active organization)",
				default: "",
			},
		],
		exampleResponse: JSON.stringify(
			{
				success: true,
				api_key: "prod_pk_7a9f3e2b1c4d8f6e5a0b9c8d7e6f5a4b",
				productId: "prod_123abc...",
				message: "API key generated successfully. Embed this in your app.",
				note: "This key is shown ONLY ONCE. Save it securely! Example: VITE_PROXIFY_API_KEY=prod_pk_...",
			},
			null,
			2,
		),
	},

	// FLOW 1: Client Registration
	{
		id: "client-register",
		flow: "FLOW 1",
		title: "Client Registration (Product Owner)",
		method: "POST",
		endpoint: "/api/v1/clients",
		description:
			"📝 Register a new client organization (Product Owner). Uses Privy authentication to link organization ID. ⚠️ Does NOT generate API key! After creating org, use FLOW 0 to generate API key.",
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
				name: "vaultsToCreate",
				type: "select",
				required: true,
				description:
					"Which token vaults to create (each vault supports ALL chains: Base, Ethereum, Polygon, Optimism, Arbitrum)",
				default: "both",
				options: [
					{
						value: "usdc",
						label: "USDC only (5 vaults: Base + Ethereum + Polygon + Optimism + Arbitrum)",
					},
					{
						value: "usdt",
						label: "USDT only (5 vaults: Base + Ethereum + Polygon + Optimism + Arbitrum)",
					},
					{
						value: "both",
						label: "Both USDC and USDT (10 vaults total: 5 chains × 2 tokens)",
					},
				],
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
				vaults: [
					{
						id: "vault_uuid_1",
						chain: "8453",
						tokenSymbol: "USDC",
						tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
					},
					{
						id: "vault_uuid_2",
						chain: "8453",
						tokenSymbol: "USDT",
						tokenAddress: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
					},
				],
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
		endpoint: "/api/v1/products/{productId}/strategies",
		description:
			"Define DeFi strategy allocation for a client vault. Use productId (prod_xxx) from registration response.",
		params: [
			{ name: "productId", type: "string", required: true, description: "Product ID from registration (prod_xxx)" },
			{
				name: "chain",
				type: "select",
				required: true,
				description: "Blockchain network",
				default: "8453",
				options: [
					{ value: "8453", label: "Base (8453) - Low fees, USDC native" },
					{ value: "1", label: "Ethereum (1) - High security" },
					{ value: "137", label: "Polygon (137) - Very low fees" },
					{ value: "10", label: "Optimism (10) - L2 scaling" },
					{ value: "42161", label: "Arbitrum (42161) - L2 scaling" },
				],
			},
			{
				name: "token",
				type: "select",
				required: true,
				description: "Stablecoin token (auto-fills address based on chain)",
				default: "USDC",
				options: [
					{ value: "USDC", label: "USDC - USD Coin" },
					{ value: "USDT", label: "USDT - Tether USD" },
				],
			},
			{
				name: "token_address",
				type: "string",
				required: true,
				description: "Token contract address (auto-filled based on chain + token selection)",
				default: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
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
		description:
			"Create a new end user account (e.g., Grab driver). Requires selecting an active organization first. Creates end_user and end_user_vaults for all vaults belonging to the selected organization.",
		params: [
			{
				name: "clientUserId",
				type: "string",
				required: true,
				description: "Client's internal user ID (e.g., driver ID, employee ID, customer ID)",
				default: "grab_driver_12345",
			},
			{
				name: "email",
				type: "string",
				required: false,
				description: "User's email address (optional)",
				default: "driver@example.com",
			},
			{
				name: "walletAddress",
				type: "string",
				required: false,
				description: "User's wallet address if using non-custodial (optional)",
				default: "",
			},
		],
		exampleResponse: JSON.stringify(
			{
				id: "uuid...",
				clientId: "uuid...",
				userId: "grab_driver_12345",
				userType: "individual",
				walletAddress: null,
				isActive: true,
				createdAt: "2025-11-24T10:00:00Z",
				vaults: [
					{
						vaultId: "uuid...",
						chain: "8453",
						tokenSymbol: "USDC",
						shares: "0",
						effectiveBalance: "0",
					},
					// ... more vaults (one per client vault)
				],
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
		endpoint: "/api/v1/deposits/fiat",
		description: "Start a fiat deposit via Proxify's on-ramp gateway or banking partnerships (Circle, MoonPay, etc.)",
		params: [
			{ name: "api_key", type: "string", required: true, description: "Client API key" },
			{ name: "user_id", type: "string", required: true, description: "End user ID", default: "grab_driver_12345" },
			{ name: "amount", type: "number", required: true, description: "Fiat amount", default: "10000" },
			{ name: "currency", type: "string", required: true, description: "Fiat currency", default: "THB" },
			{ name: "chain", type: "string", required: true, description: "Blockchain network", default: "ethereum" },
			{ name: "token", type: "string", required: true, description: "Crypto token", default: "USDC" },
			{
				name: "payment_method",
				type: "select",
				required: false,
				description: "On-ramp provider (defaults to Proxify gateway)",
				default: "proxify_gateway",
				options: [
					{ value: "proxify_gateway", label: "Proxify Gateway (Internal on-ramp)" },
					{ value: "circle", label: "Circle USDC (Banking partnership)" },
					{ value: "coinbase", label: "Coinbase (Banking partnership)" },
					{ value: "bridge", label: "Bridge Protocol" },
					{ value: "moonpay", label: "MoonPay" },
				],
			},
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
		endpoint: "/api/v1/deposits/fiat/:orderId/complete",
		description: "Complete fiat deposit after on-ramp provider confirms payment (webhook callback or manual completion)",
		params: [
			{
				name: "orderId",
				type: "string",
				required: true,
				description: "Proxify order ID from deposit initiation (DEP-xxx)",
				default: "DEP-1764017059747-cfsvljs65",
			},
			{
				name: "cryptoAmount",
				type: "string",
				required: true,
				description: "Crypto amount received (USDC)",
				default: "285.71",
			},
			{
				name: "chain",
				type: "string",
				required: true,
				description: "Blockchain network",
				default: "ethereum",
			},
			{
				name: "tokenAddress",
				type: "string",
				required: true,
				description: "Token contract address",
				default: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			},
			{
				name: "transactionHash",
				type: "string",
				required: true,
				description: "On-chain transaction hash",
				default: "0xabc123def456",
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
		endpoint: "/api/v1/vaults/{vault_id}/index/update",
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
	const [loadingOrgs, setLoadingOrgs] = useState(false)

	// Privy integration
	const { user, authenticated } = usePrivy()
	const { wallets } = useWallets()

	// Get the embedded wallet (Privy-managed) - has walletClientType === "privy"
	const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
	const walletAddress = embeddedWallet?.address ?? user?.wallet?.address ?? null

	// UserStore integration - READ ONLY (LoginPage handles writing)
	const {
		organizations,
		activeProductId,
		setActiveOrganization,
		getActiveOrganization,
		loadOrganizations,
		addOrganization,
		// Privy account data (set by LoginPage after authentication)
		privyOrganizationId,
		privyEmail,
		privyWalletAddress,
		walletType,
	} = useUserStore()

	// Load saved API key on mount
	useEffect(() => {
		const apiKey = loadApiKey()
		if (apiKey) {
			setSavedApiKey(apiKey)
			// eslint-disable-next-line no-console
			console.log("[API Test] Loaded API key from localStorage")
		}
	}, [])

	// Auto-load correct API key when switching organizations
	useEffect(() => {
		if (activeProductId) {
			const orgApiKey = loadApiKeyForOrg(activeProductId)
			if (orgApiKey) {
				// Set as current active key for axios interceptor
				localStorage.setItem("b2b:api_key", orgApiKey)
				setSavedApiKey(orgApiKey)
				// eslint-disable-next-line no-console
				console.log(`[API Test] ✅ Loaded API key for active org: ${activeProductId}`)
				// eslint-disable-next-line no-console
				console.log(`[API Test] 🔑 Key: ${orgApiKey.substring(0, 12)}...`)
			} else {
				// eslint-disable-next-line no-console
				console.warn(`[API Test] ⚠️ No API key found for ${activeProductId}`)
				// eslint-disable-next-line no-console
				console.warn("[API Test] → Please generate API key using FLOW 0")
				localStorage.removeItem("b2b:api_key")
				setSavedApiKey(null)
			}
		}
	}, [activeProductId])

	// Load organizations when user is authenticated (READ ONLY - don't modify UserStore)
	useEffect(() => {
		if (authenticated && user && privyOrganizationId) {
			// eslint-disable-next-line no-console
			console.log("[API Test] User authenticated, loading organizations...", {
				privyOrganizationId,
				privyEmail,
				privyWalletAddress,
				walletType,
			})

			// Load organizations from database
			void loadOrganizations()
		}
	}, [authenticated, user, privyOrganizationId, loadOrganizations])

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
		setFormData((prev) => {
			const updated = {
				...prev,
				[endpointId]: {
					...prev[endpointId],
					[paramName]: value,
				},
			}

			// Auto-fill token_address when chain or token changes (for strategy-config)
			if (endpointId === "strategy-config" && (paramName === "chain" || paramName === "token")) {
				const currentChain = paramName === "chain" ? value : updated[endpointId].chain || "8453"
				const currentToken = paramName === "token" ? value : updated[endpointId].token || "USDC"

				const tokenInfo = TOKEN_ADDRESSES[currentChain]?.[currentToken]
				if (tokenInfo) {
					updated[endpointId].token_address = tokenInfo.address
					// Note: token_symbol is derived from token selection, not a separate field
				}
			}

			return updated
		})
	}

	const executeRequest = async (endpoint: APIEndpoint) => {
		setLoading(endpoint.id)

		// eslint-disable-next-line no-console
		console.log("[API Test] Executing request:", endpoint.id)
		// eslint-disable-next-line no-console
		console.log("[API Test] Current UserStore state:", {
			privyOrganizationId,
			privyEmail,
			privyWalletAddress,
			walletType,
			organizationsCount: organizations.length,
		})

		try {
			// Get current form data
			const params = getInitialFormData(endpoint)

			let data: unknown

			// Route to appropriate b2bApiClient method based on endpoint ID
			switch (endpoint.id) {
				// FLOW 0: Generate API Key (Manual - for testing)
				case "api-key-generate": {
					// Validate active organization is selected
					if (!activeProductId) {
						throw new Error("Please select an active organization first from the dropdown above")
					}

					// eslint-disable-next-line no-console
					console.log("[API Test] Regenerating API key for organization:", activeProductId)

					// Call backend API to regenerate API key
					data = await b2bApiClient.regenerateApiKey(activeProductId)

					// eslint-disable-next-line no-console
					console.log("[API Test] ✅ API Key regenerated from backend:", data)
					break
				}

				// FLOW 1: Client Registration
				case "client-register": {
					// Get Privy account data from UserStore (loaded from privy_accounts table)
					// eslint-disable-next-line no-console
					console.log("[API Test] Client Registration - UserStore Data:", {
						privyOrganizationId,
						privyWalletAddress,
						privyEmail,
						walletType,
					})

					// Validate required fields from privy_accounts table
					if (!privyOrganizationId) {
						throw new Error("Privy Organization ID not found. Please login first.")
					}

					if (!privyWalletAddress) {
						throw new Error(
							"Wallet address not found in UserStore. Please logout and login again to create your wallet, then try registering an organization.",
						)
					}

					data = await b2bApiClient.registerClient({
						companyName: params.companyName,
						businessType: params.businessType,
						walletType: walletType ?? "MANAGED",
						vaultsToCreate: (params.vaultsToCreate as "usdc" | "usdt" | "both") || "both", // Default to both
						privyOrganizationId: privyOrganizationId,
						privyWalletAddress: privyWalletAddress, // ✅ From privy_accounts table via UserStore
						privyEmail: privyEmail ?? undefined, // ✅ From privy_accounts table via UserStore
						description: params.description || undefined,
						websiteUrl: params.websiteUrl || undefined,
					})

					// Add to UserStore after successful registration
					if (data && typeof data === "object" && "productId" in data) {
						const orgData = data as ClientRegistrationResponse
						addOrganization({
							id: orgData.id,
							productId: orgData.productId,
							companyName: orgData.companyName,
							businessType: orgData.businessType,
							description: orgData.description,
							websiteUrl: orgData.websiteUrl,
							isActive: orgData.isActive,
							isSandbox: orgData.isSandbox,
							createdAt: orgData.createdAt,
							updatedAt: orgData.updatedAt,
						})
						// eslint-disable-next-line no-console
						console.log("[API Test] Organization added to UserStore")
					}
					break
				}

				// FLOW 2: Configure Vault Strategies
				case "strategy-config":
					data = await b2bApiClient.configureStrategies(params.productId, {
						chain: params.chain,
						token: params.token, // Token symbol (USDC, USDT)
						token_address: params.token_address,
						strategies: JSON.parse(params.strategies) as { category: string; target: number }[],
					})
					break

				// FLOW 3: Create End User
				case "user-create": {
					// Validate active organization is selected
					if (!activeProductId) {
						throw new Error("Please select an active organization first from the dropdown above")
					}

					// eslint-disable-next-line no-console
					console.log("[API Test] Creating end user for organization:", {
						activeProductId,
						clientUserId: params.clientUserId,
						email: params.email,
						walletAddress: params.walletAddress,
					})

					data = await b2bApiClient.createUser({
						clientId: activeProductId, // Use active organization's productId
						clientUserId: params.clientUserId, // Client's internal user ID (e.g., driver ID)
						email: params.email || undefined,
						walletAddress: params.walletAddress || undefined,
					})

					// eslint-disable-next-line no-console
					console.log("[API Test] End user created successfully:", data)
					break
				}

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

				// FLOW 4b: Complete Deposit (webhook/manual)
				case "deposit-complete":
					data = await b2bApiClient.completeDeposit({
						orderId: params.orderId,
						transactionHash: params.transactionHash,
						cryptoAmount: params.cryptoAmount,
						chain: params.chain,
						tokenAddress: params.tokenAddress,
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

			// ✅ Auto-save API key ONLY from FLOW 0 (api-key-generate)
			// FLOW 1 (client-register) NO LONGER returns api_key!
			// Backend returns api_key field (shown ONLY ONCE for security)
			if (
				endpoint.id === "api-key-generate" && // ✅ Only FLOW 0!
				data &&
				typeof data === "object" &&
				"api_key" in data &&
				typeof data.api_key === "string"
			) {
				const apiKey = data.api_key

				// Get productId from response or use active org
				let productId: string | null = null
				if ("productId" in data && typeof data.productId === "string") {
					productId = data.productId
				} else if (activeProductId) {
					productId = activeProductId
				}

				if (productId) {
					saveApiKeyForOrg(productId, apiKey) // ✅ Save per-org!
					setSavedApiKey(apiKey)
					// eslint-disable-next-line no-console
					console.log(`[API Test] ✅ API Key saved for ${productId}:`, apiKey.substring(0, 12) + "...")
					// eslint-disable-next-line no-console
					console.log("[API Test] 📋 Embed this key in your app's environment:")
					// eslint-disable-next-line no-console
					console.log(`VITE_PROXIFY_API_KEY=${apiKey}`)
				} else {
					// eslint-disable-next-line no-console
					console.error("[API Test] ❌ Cannot save API key: No productId found")
				}
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
			}
			// Auto-populate productId from activeProductId (for strategy config, etc.)
			else if (param.name === "productId" && !existingValue && activeProductId) {
				data[param.name] = activeProductId
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
						{/* API Key Status Indicator */}
						<div className="flex items-center gap-2">
							<div className={`w-3 h-3 rounded-full ${savedApiKey ? "bg-green-500" : "bg-red-500"}`}></div>
							<span className={`text-xs font-semibold ${savedApiKey ? "text-green-700" : "text-red-700"}`}>
								API Key: {savedApiKey ? `${savedApiKey.substring(0, 12)}...` : "Not Set"}
							</span>
							{savedApiKey && (
								<button
									onClick={() => {
										void navigator.clipboard.writeText(savedApiKey)
										// eslint-disable-next-line no-console
										console.log("[API Test] API Key copied to clipboard")
									}}
									className="text-xs text-blue-600 hover:text-blue-800 underline"
								>
									Copy
								</button>
							)}
						</div>
					</div>
					{!savedApiKey && (
						<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ No API Key Found</p>
							<p className="text-sm text-yellow-700 mb-2">
								API keys are required for protected endpoints (FLOW 3-9). Choose one of the following:
							</p>
							<ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
								<li>
									<strong>FLOW 0:</strong> Generate a manual API key for testing (simulates external developer)
								</li>
								<li>
									<strong>FLOW 1:</strong> Register a new organization (auto-generates real API key)
								</li>
							</ul>
						</div>
					)}
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
								<div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
									<div>
										<p className="text-xs text-gray-500 mb-1">Privy User ID</p>
										<code className="text-sm font-mono text-gray-900">{user.id}</code>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Email</p>
										<code className="text-sm font-mono text-gray-900">{user.email?.address ?? "N/A"}</code>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Wallet Address</p>
										{walletAddress ? (
											<code className="text-sm font-mono text-green-700">{walletAddress}</code>
										) : (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
												<span className="text-xs text-orange-600">Creating wallet...</span>
											</div>
										)}
									</div>
									<div className="col-span-3">
										<p className="text-xs text-gray-500 mb-1">Embedded Wallet Status</p>
										<div className="flex items-center gap-2">
											{embeddedWallet ? (
												<>
													<span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
														✓ Ready
													</span>
													<code className="text-xs font-mono text-gray-700 break-all">{embeddedWallet.address}</code>
												</>
											) : (
												<>
													<span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
														⏳ Creating...
													</span>
													<span className="text-xs text-gray-600">
														Please wait for wallet creation to complete before registering an organization.
													</span>
												</>
											)}
										</div>
									</div>
									<div className="col-span-3">
										<p className="text-xs text-gray-500 mb-1">UserStore Data (from privy_accounts table)</p>
										<div className="bg-white border border-gray-200 rounded p-2 mt-1">
											<div className="grid grid-cols-2 gap-2 text-xs">
												<div>
													<span className="text-gray-500">Privy Org ID:</span>
													<code className={`ml-2 font-mono ${privyOrganizationId ? "text-green-700" : "text-red-700"}`}>
														{privyOrganizationId || "❌ NOT SET"}
													</code>
												</div>
												<div>
													<span className="text-gray-500">Privy Wallet:</span>
													<code className={`ml-2 font-mono ${privyWalletAddress ? "text-green-700" : "text-red-700"}`}>
														{privyWalletAddress ? `${privyWalletAddress.slice(0, 10)}...` : "❌ NOT SET"}
													</code>
												</div>
												<div>
													<span className="text-gray-500">Privy Email:</span>
													<code className={`ml-2 font-mono ${privyEmail ? "text-green-700" : "text-gray-500"}`}>
														{privyEmail || "N/A"}
													</code>
												</div>
												<div>
													<span className="text-gray-500">Wallet Type:</span>
													<code className={`ml-2 font-mono ${walletType ? "text-green-700" : "text-red-700"}`}>
														{walletType || "❌ NOT SET"}
													</code>
												</div>
											</div>
											{(!privyOrganizationId || !privyWalletAddress || !walletType) && (
												<div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
													<p className="text-xs text-red-700 font-semibold">
														⚠️ UserStore missing data! Please logout and login again.
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Organizations from Database (UserStore) */}
				<div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<h3 className="text-lg font-semibold text-gray-900">🏢 Your Organizations (from Database)</h3>
								<span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
									{organizations.length} {organizations.length === 1 ? "Organization" : "Organizations"}
								</span>
							</div>
							<p className="text-sm text-gray-600 mb-3">
								Organizations created and stored in the database for your Privy account. These are loaded via{" "}
								<code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
									GET /api/v1/clients/privy/:privyOrganizationId
								</code>
							</p>
						</div>
						<button
							onClick={async () => {
								setLoadingOrgs(true)
								try {
									await loadOrganizations()
									// eslint-disable-next-line no-console
									console.log("[API Test] Organizations reloaded from database")
								} catch (error) {
									// eslint-disable-next-line no-console
									console.error("[API Test] Failed to reload organizations:", error)
								} finally {
									setLoadingOrgs(false)
								}
							}}
							disabled={!authenticated || loadingOrgs}
							className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<RefreshCw size={14} className={loadingOrgs ? "animate-spin" : ""} />
							{loadingOrgs ? "Loading..." : "Reload"}
						</button>
					</div>

					{organizations.length === 0 ? (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
							<p className="text-sm text-gray-600 mb-2">No organizations found</p>
							<p className="text-xs text-gray-500">
								Create one using <strong>FLOW 1: Client Registration</strong> below
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{organizations.map((org: Organization) => (
								<div
									key={org.productId}
									className={`border rounded-lg p-4 transition-all ${
										org.productId === activeProductId
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 bg-white hover:border-gray-300"
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="text-base font-semibold text-gray-900">{org.companyName}</h4>
												{org.productId === activeProductId && (
													<span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white">
														Active
													</span>
												)}
												<span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
													{org.businessType}
												</span>
												<span
													className={`text-xs font-medium px-2 py-0.5 rounded ${
														org.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
													}`}
												>
													{org.isActive ? "Active" : "Inactive"}
												</span>
											</div>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-gray-500">Product ID:</span>
													<code className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
														{org.productId}
													</code>
												</div>
												<div>
													<span className="text-gray-500">API Key:</span>
													{(() => {
														const orgApiKey = loadApiKeyForOrg(org.productId)
														return orgApiKey ? (
															<span className="ml-2 text-xs text-green-600 font-semibold flex items-center gap-1">
																<span className="w-2 h-2 bg-green-500 rounded-full"></span>
																Generated ({orgApiKey.substring(0, 12)}...)
															</span>
														) : (
															<span className="ml-2 text-xs text-orange-600 font-semibold flex items-center gap-1">
																<span className="w-2 h-2 bg-orange-500 rounded-full"></span>
																Not Generated (use FLOW 0)
															</span>
														)
													})()}
												</div>
												<div>
													<span className="text-gray-500">Created:</span>
													<span className="ml-2 text-gray-700">{new Date(org.createdAt).toLocaleDateString()}</span>
												</div>
												{org.description && (
													<div className="col-span-2">
														<span className="text-gray-500">Description:</span>
														<span className="ml-2 text-gray-700">{org.description}</span>
													</div>
												)}
												{org.websiteUrl && (
													<div className="col-span-2">
														<span className="text-gray-500">Website:</span>
														<a
															href={org.websiteUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="ml-2 text-blue-600 hover:underline"
														>
															{org.websiteUrl}
														</a>
													</div>
												)}
											</div>
										</div>
										{org.productId !== activeProductId && (
											<button
												onClick={() => {
													setActiveOrganization(org.productId)

													// Load API key for this organization
													const orgApiKey = loadApiKeyForOrg(org.productId)
													if (orgApiKey) {
														localStorage.setItem("b2b:api_key", orgApiKey)
														setSavedApiKey(orgApiKey)
														// eslint-disable-next-line no-console
														console.log("[API Test] ✓ Switched to:", org.companyName)
														// eslint-disable-next-line no-console
														console.log("[API Test] ✓ Loaded API key:", orgApiKey.substring(0, 12) + "...")
													} else {
														// eslint-disable-next-line no-console
														console.warn("[API Test] ⚠ No API key found for:", org.productId)
														// eslint-disable-next-line no-console
														console.warn("[API Test] → Please generate API key (FLOW 0)")
														localStorage.removeItem("b2b:api_key")
														setSavedApiKey(null)
													}
												}}
												className="ml-4 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
											>
												Set Active
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Active Organization Summary */}
					{activeProductId && (
						<div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<h4 className="text-sm font-semibold text-blue-900">✓ Active Organization</h4>
							</div>
							<div className="text-sm text-blue-800">
								<p>
									<strong>{getActiveOrganization()?.companyName}</strong> ({activeProductId})
								</p>
								<p className="text-xs text-blue-700 mt-1">
									All API calls below will use this <code className="bg-blue-100 px-1 py-0.5 rounded">productId</code>{" "}
									when required
								</p>
							</div>
						</div>
					)}
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
																) : param.type === "select" && param.options ? (
																	<select
																		value={currentFormData[param.name]}
																		onChange={(e) => {
																			handleParamChange(endpoint.id, param.name, e.target.value)
																		}}
																		className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
																	>
																		{param.options.map((option) => (
																			<option key={option.value} value={option.value}>
																				{option.label}
																			</option>
																		))}
																	</select>
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
