/**
 * B2B Client UseCase
 * Manages client organizations and balances
 */

import { AuditRepository, ClientRepository, PrivyAccountRepository, VaultRepository } from "../../repository"
import { RevenueService } from "../../service"
import { extractPrefix, generateApiKey, hashApiKey } from "../../utils/apiKey"

import type {
	AddFundsRequest,
	CreateClientRequest,
	DeductReservedRequest,
	ReleaseFundsRequest,
	ReserveFundsRequest,
} from "../../dto/b2b"
import type {
	CreateClientArgs,
	GetClientBalanceRow,
	GetClientRow,
	GetClientStatsRow,
	GetAllClientsByPrivyOrgIdRow,
	GetClientByProductIdRow,
	GetClientByAPIKeyHashRow
} from "@proxify/sqlcgen"

/**
 * B2B Client UseCase
 * Manages client organizations and balances
 */
export class B2BClientUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly privyAccountRepository: PrivyAccountRepository,
		private readonly auditRepository: AuditRepository,
		private readonly vaultRepository: VaultRepository,
		private readonly revenueService: RevenueService,
	) {}

	/**
	 * Get client by ID (internal)
	 */
	async getClientById(clientId: string): Promise<GetClientRow | null> {
		return await this.clientRepository.getById(clientId)
	}

	/**
	 * Get client by product ID
	 */
	async getClientByProductId(productId: string): Promise<GetClientByProductIdRow | null> {
		const client = await this.clientRepository.getByProductId(productId)

		// DEBUG: Log data after repository call to trace data flow
		console.log('[ClientUseCase] getClientByProductId AFTER REPOSITORY:', {
			productId,
			found: !!client,
			id: client?.id,
			companyName: client?.companyName,
			businessType: client?.businessType,
			description: client?.description,
			clientRevenueSharePercent: client?.clientRevenueSharePercent,
			platformFeePercent: client?.platformFeePercent,
			supportedCurrencies: client?.supportedCurrencies,
			bankAccounts: client?.bankAccounts,
			strategiesPreferences: client?.strategiesPreferences,
			strategiesCustomization: client?.strategiesCustomization,
			isActive: client?.isActive,
		})

		if (!client) {
			return null
		}

		if (!client.isActive) {
			throw new Error("Client account is inactive")
		}

		return client
	}

	/**
	 * Validate API key
	 */
	async validateApiKey(apiKey: string): Promise<GetClientByAPIKeyHashRow | null> {
		return await this.clientRepository.validateApiKey(apiKey)
	}

	/**
	 * Regenerate API key for an existing client
	 * ⚠️ Returns new API key (shown only once!)
	 * ⚠️ Invalidates old API key immediately
	 */
	async regenerateApiKey(productId: string): Promise<{ client: GetClientRow; api_key: string }> {
		// Get existing client
		const client = await this.clientRepository.getByProductId(productId)

		if (!client) {
			throw new Error(`Client not found with productId: ${productId}`)
		}

		// Generate new API key
		const apiKey = generateApiKey(client.isSandbox ?? false)
		const apiKeyHash = await hashApiKey(apiKey)
		const apiKeyPrefix = extractPrefix(apiKey)

		console.log(`[Client UseCase] Regenerating API key for client: ${client.id}, prefix: ${apiKeyPrefix}`)

		// Update in database (old key is immediately invalidated)
		await this.clientRepository.updateApiKey(client.id, apiKeyHash, apiKeyPrefix)

		// Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "system",
			action: "api_key_regenerated",
			resourceType: "client",
			resourceId: client.id,
			description: `API key regenerated for product ${productId}`,
			metadata: {
				productId,
				oldPrefix: client.apiKeyPrefix,
				newPrefix: apiKeyPrefix,
			},
			ipAddress: null,
			userAgent: null,
		})

		// Return updated client and new API key
		const updatedClient = await this.clientRepository.getById(client.id)

		if (!updatedClient) {
			throw new Error("Failed to retrieve updated client")
		}

		return {
			client: updatedClient,
			api_key: apiKey, // ← Shown only once!
		}
	}

	/**
	 * Create new client
	 * Auto-generates API key during registration
	 */
	async createClient(request: CreateClientRequest): Promise<
		GetClientByProductIdRow & {
			api_key?: string
			vaults: { id: string; chain: string; tokenSymbol: string; tokenAddress: string }[]
		}
	> {
		// Check if product ID already exists
		console.log("Creating client with product ID:", request)
		const existing = await this.clientRepository.getByProductId(request.productId)
		if (existing) {
			throw new Error(`Product ID '${request.productId}' already exists`)
		}

		// ✅ Auto-generate API key during registration
		const isSandbox = request.isSandbox ?? false
		const apiKey = generateApiKey(isSandbox)
		const apiKeyHash = await hashApiKey(apiKey)
		const apiKeyPrefix = extractPrefix(apiKey)
		console.log(`[Client Creation] Creating client WITH API key, prefix: ${apiKeyPrefix}`)

		// Step 1: Get or create Privy account (idempotent)
		const privyAccount = await this.privyAccountRepository.getOrCreate({
			privyOrganizationId: request.privyOrganizationId,
			privyWalletAddress: request.privyWalletAddress,
			privyEmail: request.privyEmail,
			walletType: request.walletType,
		})

		// Step 2: Create organization (linked via FK)
		const args: CreateClientArgs = {
			privyAccountId: privyAccount.id, // ✅ FK instead of individual fields
			productId: request.productId,
			companyName: request.companyName,
			businessType: request.businessType,
			description: request.description || null,
			websiteUrl: request.websiteUrl || null,
		}

		// These additional properties will need to be set via update after creation
		const additionalProps = {
			customerTier: request.customerTier || null,
			apiKeyHash: apiKeyHash, // ✅ Auto-generated API key hash
			apiKeyPrefix: apiKeyPrefix, // ✅ Auto-generated API key prefix
			webhookUrls: request.webhookUrls || null,
			webhookSecret: request.webhookSecret || null,
			customStrategy: request.strategyRanking
				? JSON.stringify({ ranking: request.strategyRanking })
				: request.customStrategy || null,
			strategiesPreferences: null, // Will be set later if needed
			strategiesCustomization: null, // Will be set via Market Analysis dashboard
			// Fee Configuration (3-way revenue split)
			clientRevenueSharePercent: request.clientRevenueSharePercent || "15.00",
			platformFeePercent: request.platformFeePercent || "7.50",
			performanceFee: request.performanceFee || null,
			isActive: request.isActive ?? true,
			isSandbox: request.isSandbox ?? false,
			supportedCurrencies: request.supportedCurrencies || [],
			bankAccounts: request.bankAccounts ? JSON.stringify(request.bankAccounts) : "[]",
		}

		const client = await this.clientRepository.create(args)

		if (!client) {
			throw new Error("Failed to create client")
		}

		// Initialize balance
		await this.clientRepository.createBalance({
			clientId: client.id,
			available: "0",
			reserved: "0",
			currency: "USDC",
		})

		// Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "system",
			action: "client_created",
			resourceType: "client",
			resourceId: client.id,
			description: `Client created: ${request.companyName}`,
			metadata: {
				productId: request.productId,
				apiKeyPrefix: apiKeyPrefix, // Log API key prefix for audit trail
				customerTier: request.customerTier,
			},
			ipAddress: null,
			userAgent: null,
		})

		// Step 3: Auto-create vault(s) based on user selection (FLOW 2A)
		// IMPORTANT: Vaults are TOKEN-CENTRIC, not chain-centric
		// One "USDC vault" means USDC support across ALL chains
		// One "USDT vault" means USDT support across ALL chains
		const vaultsToCreate = request.vaultsToCreate ?? "both" // Default to both USDC and USDT

		// Token addresses per chain (unified token addresses)
		const TOKEN_ADDRESSES: Record<string, { USDC: string; USDT: string }> = {
			"8453": {
				// Base
				USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
				USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
			},
			"1": {
				// Ethereum
				USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
				USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
			},
			"137": {
				// Polygon
				USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
				USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
			},
			"10": {
				// Optimism
				USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
				USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
			},
			"42161": {
				// Arbitrum
				USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
				USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
			},
		}

		// All supported chains
		const ALL_CHAINS = ["8453", "1", "137", "10", "42161"] // Base, Ethereum, Polygon, Optimism, Arbitrum

		const createdVaults: { id: string; chain: string; tokenSymbol: string; tokenAddress: string }[] = []

		// Create USDC vaults across ALL chains if requested
		if (vaultsToCreate === "usdc" || vaultsToCreate === "both") {
			for (const chain of ALL_CHAINS) {
				const usdcVault = await this.getOrCreateVault({
					clientId: client.id,
					chain,
					tokenAddress: TOKEN_ADDRESSES[chain].USDC,
					tokenSymbol: "USDC",
				})
				createdVaults.push({
					id: usdcVault.id,
					chain,
					tokenSymbol: "USDC",
					tokenAddress: TOKEN_ADDRESSES[chain].USDC,
				})
			}
		}

		// Create USDT vaults across ALL chains if requested
		if (vaultsToCreate === "usdt" || vaultsToCreate === "both") {
			for (const chain of ALL_CHAINS) {
				const usdtVault = await this.getOrCreateVault({
					clientId: client.id,
					chain,
					tokenAddress: TOKEN_ADDRESSES[chain].USDT,
					tokenSymbol: "USDT",
				})
				createdVaults.push({
					id: usdtVault.id,
					chain,
					tokenSymbol: "USDT",
					tokenAddress: TOKEN_ADDRESSES[chain].USDT,
				})
			}
		}

		// Step 4: Return combined data (client + Privy info from JOIN + created vaults + API key)
		const result = await this.clientRepository.getByProductId(request.productId)
		if (!result) {
			throw new Error("Failed to retrieve created client")
		}

		// Return WITH API key (shown only once!)
		return {
			...result,
			vaults: createdVaults,
			api_key: apiKey, // ✅ Include API key in response (shown only once during registration)
		} as typeof result & { api_key: string; vaults: typeof createdVaults }
	}

	/**
	 * Get or create vault for client (idempotent)
	 */
	private async getOrCreateVault(params: {
		clientId: string
		chain: string
		tokenAddress: string
		tokenSymbol: string
	}) {
		// Check if vault already exists
		let vault = await this.vaultRepository.getClientVault(params.clientId, params.chain, params.tokenAddress)

		if (!vault) {
			// Create new vault with index = 1.0e18
			vault = await this.vaultRepository.createClientVault({
				clientId: params.clientId,
				chain: params.chain,
				tokenAddress: params.tokenAddress,
				tokenSymbol: params.tokenSymbol,
				totalShares: "0",
				currentIndex: "1000000000000000000", // 1.0e18 (starting index)
				pendingDepositBalance: "0",
				totalStakedBalance: "0",
				cumulativeYield: "0",
			})

			if (!vault) {
				throw new Error("Failed to create vault")
			}

			// Audit log for vault creation
			await this.auditRepository.create({
				clientId: params.clientId,
				userId: null,
				actorType: "system",
				action: "vault_created",
				resourceType: "client_vault",
				resourceId: vault.id,
				description: `Default vault created: ${params.tokenSymbol} on ${params.chain}`,
				metadata: { chain: params.chain, tokenAddress: params.tokenAddress },
				ipAddress: null,
				userAgent: null,
			})
		}

		return vault
	}

	/**
	 * Get all client organizations for a Privy user
	 */
	async getClientsByPrivyOrgId(privyOrgId: string): Promise<GetAllClientsByPrivyOrgIdRow[]> {
		return await this.clientRepository.getByPrivyOrgId(privyOrgId)
	}

	/**
	 * Get client balance
	 */
	async getBalance(clientId: string): Promise<GetClientBalanceRow | null> {
		return await this.clientRepository.getBalance(clientId)
	}

	/**
	 * Add funds to client balance
	 */
	async addFunds(request: AddFundsRequest): Promise<void> {
		const balance = await this.clientRepository.getBalance(request.clientId)

		if (!balance) {
			throw new Error("Client balance not found")
		}

		await this.clientRepository.addToAvailable(request.clientId, request.amount)

		// Audit log
		await this.auditRepository.create({
			clientId: request.clientId,
			userId: null,
			actorType: "admin",
			action: "funds_added",
			resourceType: "client_balance",
			resourceId: request.clientId,
			description: `Added ${request.amount} from ${request.source}`,
			metadata: { amount: request.amount, source: request.source, reference: request.reference },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Reserve funds for pending withdrawal
	 */
	async reserveFunds(request: ReserveFundsRequest): Promise<void> {
		const balance = await this.clientRepository.getBalance(request.clientId)

		if (!balance) {
			throw new Error("Client balance not found")
		}

		// Check sufficient funds
		const available = parseFloat(balance.available)
		const amount = parseFloat(request.amount)

		if (available < amount) {
			throw new Error(`Insufficient funds. Available: ${balance.available}, Required: ${request.amount}`)
		}

		await this.clientRepository.reserve(request.clientId, request.amount)

		// Audit log
		await this.auditRepository.create({
			clientId: request.clientId,
			userId: null,
			actorType: "client",
			action: "funds_reserved",
			resourceType: "client_balance",
			resourceId: request.clientId,
			description: `Reserved ${request.amount} for ${request.purpose}`,
			metadata: { amount: request.amount, purpose: request.purpose, reference: request.reference },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Release reserved funds
	 */
	async releaseFunds(request: ReleaseFundsRequest): Promise<void> {
		await this.clientRepository.releaseReserved(request.clientId, request.amount)

		// Audit log
		await this.auditRepository.create({
			clientId: request.clientId,
			userId: null,
			actorType: "system",
			action: "funds_released",
			resourceType: "client_balance",
			resourceId: request.clientId,
			description: `Released ${request.amount} for ${request.purpose}`,
			metadata: { amount: request.amount, purpose: request.purpose, reference: request.reference },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Deduct reserved funds (after withdrawal completed)
	 */
	async deductReserved(request: DeductReservedRequest): Promise<void> {
		await this.clientRepository.deductReserved(request.clientId, request.amount)

		// Audit log
		await this.auditRepository.create({
			clientId: request.clientId,
			userId: null,
			actorType: "system",
			action: "reserved_deducted",
			resourceType: "client_balance",
			resourceId: request.clientId,
			description: `Deducted ${request.amount} from reserved for ${request.purpose}`,
			metadata: { amount: request.amount, purpose: request.purpose, reference: request.reference },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Add to idle balance (after on-ramp)
	 * Called when fiat → crypto conversion completes and funds arrive in custodial wallet
	 */
	async addToIdleBalance(clientId: string, amount: string): Promise<void> {
		await this.clientRepository.addToIdleBalance(clientId, amount)

		// Audit log
		await this.auditRepository.create({
			clientId,
			userId: null,
			actorType: "system",
			action: "idle_balance_added",
			resourceType: "client_organization",
			resourceId: clientId,
			description: `Added ${amount} to idle balance after on-ramp`,
			metadata: { amount },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Get client statistics
	 */
	async getStats(clientId: string): Promise<GetClientStatsRow | null> {
		return await this.clientRepository.getStats(clientId)
	}

	/**
	 * List all active clients
	 */
	async listActiveClients() {
		return await this.clientRepository.listActive()
	}

	/**
	 * Configure vault strategies (FLOW 2B)
	 */
	async configureStrategies(
		productId: string,
		data: {
			chain: string
			tokenAddress: string
			tokenSymbol?: string
			strategies: { category: string; target: number }[]
		},
	) {
		// 1. Get client by product ID
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// 2. Get or create vault for chain + token
		const vault = await this.getOrCreateVault({
			clientId: client.id,
			chain: data.chain,
			tokenAddress: data.tokenAddress,
			tokenSymbol: data.tokenSymbol || "UNKNOWN",
		})

		// 3. Update vault strategies as JSONB (atomic update)
		await this.vaultRepository.updateVaultStrategies(
			vault.id,
			data.strategies.map((s) => ({
				category: s.category,
				target: s.target,
				isActive: true,
			})),
		)

		// 4. Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "client",
			action: "vault_strategies_configured",
			resourceType: "client_vault",
			resourceId: vault.id,
			description: `Configured strategies for vault: ${data.chain}-${data.tokenAddress}`,
			metadata: { strategies: data.strategies },
			ipAddress: null,
			userAgent: null,
		})

		return vault
	}

	/**
	 * Update organization info only (company name, description, website)
	 */
	async updateOrganizationInfo(
		productId: string,
		data: {
			companyName?: string
			businessType?: string
			description?: string | null
			websiteUrl?: string | null
		},
	) {
		// 1. Get client by product ID
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// 2. Update client with new organization info
		// Convert undefined to null for SQLC compatibility
		const updated = await this.clientRepository.update(client.id, {
			companyName: data.companyName ?? null,
			description: data.description ?? null,
			websiteUrl: data.websiteUrl ?? null,
		})

		// 3. Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "client",
			action: "organization_info_updated",
			resourceType: "client",
			resourceId: client.id,
			description: `Updated organization info for product: ${productId}`,
			metadata: data,
			ipAddress: null,
			userAgent: null,
		})

		return updated
	}

	/**
	 * Update supported currencies only
	 */
	async updateSupportedCurrencies(productId: string, currencies: string[]) {
		// 1. Get client by product ID
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// 2. Update supported currencies
		await this.clientRepository.updateSupportedCurrencies(client.id, currencies)

		// 3. Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "client",
			action: "supported_currencies_updated",
			resourceType: "client",
			resourceId: client.id,
			description: `Updated supported currencies: ${currencies.join(", ")}`,
			metadata: { currencies },
			ipAddress: null,
			userAgent: null,
		})

		// 4. Return updated client
		return await this.clientRepository.getById(client.id)
	}

	/**
	 * Configure bank accounts for fiat withdrawals (FLOW 3)
	 * Sets up client's bank accounts for off-ramp and updates supported currencies
	 */
	async configureBankAccounts(
		clientId: string,
		bankAccounts: {
			currency: string
			bank_name: string
			account_number: string
			account_name: string
			bank_details?: Record<string, any>
		}[],
		supportedCurrencies: string[],
	): Promise<{ bankAccounts: typeof bankAccounts; supportedCurrencies: string[] }> {
		// 1. Verify client exists
		const client = await this.clientRepository.getById(clientId)
		if (!client) {
			throw new Error(`Client not found: ${clientId}`)
		}

		// 2. REPLACE bank accounts (clear existing, then set new ones)
		await this.clientRepository.replaceBankAccounts(clientId, bankAccounts)

		// 3. Update supported currencies
		await this.clientRepository.updateSupportedCurrencies(clientId, supportedCurrencies)

		// 4. Audit log
		await this.auditRepository.create({
			clientId,
			userId: null,
			actorType: "client",
			action: "bank_accounts_configured",
			resourceType: "client",
			resourceId: clientId,
			description: `Configured ${bankAccounts.length} bank accounts with currencies: ${supportedCurrencies.join(", ")}`,
			metadata: {
				currencies: supportedCurrencies,
				bankAccountCount: bankAccounts.length,
			},
			ipAddress: null,
			userAgent: null,
		})

		// 5. Return configured data
		return {
			bankAccounts,
			supportedCurrencies,
		}
	}

	/**
	 * Get product strategies (both preferences and customization)
	 */
	async getProductStrategies(productId: string) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// Helper to safely parse JSON or return object
		const safeParseJSON = (value: any) => {
			if (!value) return {}
			if (typeof value === "object") return value
			try {
				return JSON.parse(value)
			} catch {
				return {}
			}
		}

		return {
			preferences: safeParseJSON(client.strategiesPreferences),
			customization: safeParseJSON(client.strategiesCustomization),
		}
	}

	/**
	 * Update product strategy customization (from Market Analysis dashboard)
	 * This overrides the initial preferences
	 */
	async updateProductStrategiesCustomization(productId: string, strategies: Record<string, Record<string, number>>) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// Update strategies_customization using dedicated query
		await this.clientRepository.updateProductCustomizationByProductId(productId, JSON.stringify(strategies))

		// Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "client",
			action: "product_strategies_configured",
			resourceType: "client",
			resourceId: client.id,
			description: `Updated product strategies configuration`,
			metadata: { strategies },
			ipAddress: null,
			userAgent: null,
		})

		return {
			productId,
			strategies,
			message: "Product strategies updated successfully",
		}
	}

	/**
	 * Get effective product strategies
	 * Returns customization if set, otherwise preferences
	 */
	async getEffectiveProductStrategies(productId: string) {
		const { preferences, customization } = await this.getProductStrategies(productId)

		// DEBUG: Log strategies data flow
		console.log('[ClientUseCase] getEffectiveProductStrategies:', {
			productId,
			preferences,
			customization,
			preferencesKeys: preferences ? Object.keys(preferences) : [],
			customizationKeys: customization ? Object.keys(customization) : [],
		})

		// Return customization if it's not empty, otherwise return preferences
		const hasCustomization = customization && Object.keys(customization).length > 0

		const result = {
			strategies: hasCustomization ? customization : preferences,
			source: hasCustomization ? "customization" : "preferences",
		}

		console.log('[ClientUseCase] getEffectiveProductStrategies RESULT:', {
			productId,
			hasCustomization,
			source: result.source,
			strategies: result.strategies,
		})

		return result
	}

	// ============================================
	// FEE CONFIGURATION (Revenue Share)
	// ============================================

	/**
	 * Update fee configuration (client revenue share percentage)
	 */
	async updateFeeConfig(productId: string, clientRevenueSharePercent: string) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// Update fee configuration using the dedicated method
		await this.clientRepository.updateRevenueConfigByProductId(productId, clientRevenueSharePercent)

		// Audit log
		await this.auditRepository.create({
			clientId: client.id,
			userId: null,
			actorType: "client",
			action: "fee_config_updated",
			resourceType: "client",
			resourceId: client.id,
			description: `Updated fee configuration: client revenue share = ${clientRevenueSharePercent}%`,
			metadata: { clientRevenueSharePercent },
			ipAddress: null,
			userAgent: null,
		})

		// Return updated client
		return await this.getClientByProductId(productId)
	}

	// ============================================
	// DASHBOARD METRICS
	// ============================================

	/**
	 * Get revenue metrics for dashboard
	 * Returns MRR, ARR, cumulative revenue, and fee configuration
	 */
	async getRevenueMetrics(productId: string) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		return await this.revenueService.getDashboardRevenueSummary(client.id)
	}

	/**
	 * Get end-user growth metrics
	 * Returns total users, new users, active users, deposits/withdrawals
	 */
	async getEndUserGrowthMetrics(productId: string) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		const metrics = await this.clientRepository.getEndUserGrowthMetrics(client.id)
		if (!metrics) {
			// Return empty metrics if client has no data yet
			return {
				totalEndUsers: 0,
				newUsers30d: 0,
				activeUsers30d: 0,
				totalDeposited: "0",
				totalWithdrawn: "0",
				totalDeposits: 0,
				totalWithdrawals: 0,
			}
		}

		// Map database fields to expected format and convert strings to numbers
		return {
			totalEndUsers: parseInt(metrics.totalEndUsers, 10) || 0,
			newUsers30d: parseInt(metrics.newUsers_30d, 10) || 0, // Note: DB field has underscore
			activeUsers30d: parseInt(metrics.activeUsers_30d, 10) || 0, // Note: DB field has underscore
			totalDeposited: metrics.totalDeposited || "0",
			totalWithdrawn: metrics.totalWithdrawn || "0",
			totalDeposits: parseInt(metrics.totalDeposits, 10) || 0,
			totalWithdrawals: parseInt(metrics.totalWithdrawals, 10) || 0,
		}
	}

	/**
	 * Get recent end-user transactions with pagination
	 */
	async getEndUserTransactions(productId: string, page: number, limit: number) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		const offset = (page - 1) * limit
		const transactions = await this.clientRepository.getRecentEndUserTransactions(client.id, limit, offset)

		// Count total transactions for pagination
		// TODO: Add count query to repository
		const total = transactions.length

		return {
			transactions,
			total,
		}
	}

	/**
	 * Get wallet balances (idle & earning)
	 */
	async getWalletBalances(productId: string) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		const balances = await this.clientRepository.getTotalBalances(client.id)
		if (!balances) {
			// Return empty balances if client has no vaults yet
			return {
				totalIdleBalance: "0",
				totalEarningBalance: "0",
				totalClientRevenue: "0",
				totalPlatformRevenue: "0",
				totalEnduserRevenue: "0",
				totalCumulativeYield: "0",
			}
		}

		return {
			totalIdleBalance: balances.totalPendingBalance || "0", // Pending = Idle
			totalEarningBalance: balances.totalEarningBalance || "0",
			totalClientRevenue: "0", // Will need to get from revenue summary
			totalPlatformRevenue: "0", // Will need to get from revenue summary
			totalEnduserRevenue: "0", // Will need to get from revenue summary
			totalCumulativeYield: balances.totalCumulativeYield || "0",
		}
	}

	/**
	 * Get complete dashboard summary
	 * Combines balances, revenue, end-users, and recent transactions
	 */
	async getDashboardSummary(productId: string) {
		const client = await this.getClientByProductId(productId)
		if (!client) {
			throw new Error(`Client not found for product ID: ${productId}`)
		}

		// Fetch all metrics in parallel
		const [balances, revenue, endUsers, recentTransactions] = await Promise.all([
			this.getWalletBalances(productId),
			this.getRevenueMetrics(productId),
			this.getEndUserGrowthMetrics(productId),
			this.getEndUserTransactions(productId, 1, 10),
		])

		return {
			companyName: client.companyName,
			balances: {
				totalIdleBalance: balances.totalIdleBalance,
				totalEarningBalance: balances.totalEarningBalance,
				totalClientRevenue: balances.totalClientRevenue,
				totalPlatformRevenue: balances.totalPlatformRevenue,
				totalEnduserRevenue: balances.totalEnduserRevenue,
			},
			revenue: {
				monthlyRecurringRevenue: revenue.monthlyRecurringRevenue,
				annualRunRate: revenue.annualRunRate,
				clientRevenuePercent: revenue.clientRevenuePercent,
				platformFeePercent: revenue.platformFeePercent,
				enduserFeePercent: revenue.enduserFeePercent,
				lastCalculatedAt: revenue.lastCalculatedAt,
			},
			endUsers: {
				totalEndUsers: endUsers.totalEndUsers,
				newUsers30d: endUsers.newUsers30d,
				activeUsers30d: endUsers.activeUsers30d,
				totalDeposited: endUsers.totalDeposited,
				totalWithdrawn: endUsers.totalWithdrawn,
			},
			recentTransactions: recentTransactions.transactions,
		}
	}

	/**
	 * Get aggregated dashboard summary across ALL products for a Privy user
	 * Aggregates data from all client organizations (products) belonging to the user
	 */
	async getAggregateDashboardSummary(privyOrganizationId: string) {
		// Fetch aggregated data from single SQL query
		const aggregatedData = await this.clientRepository.getAggregatedDashboardSummary(privyOrganizationId)

		if (!aggregatedData) {
			throw new Error(`No organizations found for Privy ID: ${privyOrganizationId}`)
		}

		// Map database columns to response format
		return {
			productId: "aggregate", // Special identifier for aggregate mode
			companyName: aggregatedData.companyName || "All Products",
			balances: {
				totalIdleBalance: aggregatedData.totalIdleBalance?.toString() || "0",
				totalEarningBalance: aggregatedData.totalEarningBalance?.toString() || "0",
				totalClientRevenue: aggregatedData.totalClientRevenue?.toString() || "0",
				totalPlatformRevenue: aggregatedData.totalPlatformRevenue?.toString() || "0",
				totalEnduserRevenue: aggregatedData.totalEnduserRevenue?.toString() || "0",
			},
			revenue: {
				monthlyRecurringRevenue: aggregatedData.monthlyRecurringRevenue?.toString() || "0",
				annualRunRate: aggregatedData.annualRunRate?.toString() || "0",
				clientRevenuePercent: aggregatedData.clientRevenuePercent?.toString() || "0",
				platformFeePercent: aggregatedData.platformFeePercent?.toString() || "0",
				enduserFeePercent: aggregatedData.enduserFeePercent?.toString() || "0",
				lastCalculatedAt: aggregatedData.lastCalculatedAt?.toString() || null,
			},
			endUsers: {
				totalEndUsers: Number(aggregatedData.totalEndUsers) || 0,
				newUsers30d: Number(aggregatedData.newUsers_30d) || 0,
				activeUsers30d: Number(aggregatedData.activeUsers_30d) || 0,
				totalDeposited: aggregatedData.totalDeposited?.toString() || "0",
				totalWithdrawn: aggregatedData.totalWithdrawn?.toString() || "0",
			},
		}
	}
}
