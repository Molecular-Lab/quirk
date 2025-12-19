/**
 * Client Organization Repository - Proxify Pattern
 *
 * ✅ Wraps SQLC-generated queries from database/queries/client.sql
 * ✅ Adds business logic for client management
 * ✅ Type-safe database operations
 */

import {
	// Query functions
	getClient,
	getClientByProductId, // Fixed: was getClientsByPrivyOrgID
	getClientByAPIKeyPrefix,
	getClientByAPIKeyHash,
	listClients,
	// listActiveClients,  // TODO: Add this query
	createClient,
	updateClient,
	activateClient,
	deactivateClient,
	deleteClient,
	storeAPIKey as updateClientAPIKey, // Using storeAPIKey as updateClientAPIKey
	// Environment API Keys (Sandbox + Production)
	storeEnvironmentAPIKeys,
	getClientBySandboxAPIKey,
	getClientByProductionAPIKey,
	regenerateSandboxAPIKey,
	regenerateProductionAPIKey,
	getClientBalance,
	createClientBalance,
	addToAvailableBalance,
	deductFromAvailable,
	reserveBalance,
	releaseReservedBalance,
	deductReservedBalance,
	addToClientIdleBalance,
	moveClientIdleToEarning,
	moveClientEarningToIdle,
	getClientStats,
	// getClientBankAccounts,  // TODO: Add bank account queries
	// updateClientBankAccounts,
	// updateClientSupportedCurrencies, // Now imported from client_bank_accounts_sql
	// addSupportedCurrency,
	// removeSupportedCurrency,
	getRevenueConfig,
	getRevenueConfigByProductID, // SQL name: UpdateFeeConfiguration
	updateRevenueConfigByProductID,
	updateFeeConfiguration,
	updateProductCustomizationByProductID,
	incrementEndUserCount,
	decrementEndUserCount,
	// Wallet stages (NEW) - TODO: Add these queries
	// getClientTotalBalances,
	// Revenue tracking (NEW) - TODO: Add these queries
	// getClientRevenueSummary,
	// updateClientMRR,
	// listClientsForMRRCalculation,
	// End-user activity (NEW) - TODO: Add these queries
	// listRecentEndUserTransactions,
	// getEndUserGrowthMetrics,
	// Aggregated dashboard (NEW)
	getAllClientsByPrivyOrgId,
	getAggregatedDashboardSummary,

	// Types
	type GetClientRow,
	type GetClientByProductIdRow, // Fixed: was GetClientsByPrivyOrgIDRow
	type GetClientByAPIKeyPrefixRow,
	type GetClientByAPIKeyHashRow,
	// Environment API Key types
	type StoreEnvironmentAPIKeysRow,
	type GetClientBySandboxAPIKeyRow,
	type GetClientByProductionAPIKeyRow,
	type RegenerateSandboxAPIKeyRow,
	type RegenerateProductionAPIKeyRow,
	type ListClientsRow,
	// type ListActiveClientsRow,  // TODO: Add this query
	type CreateClientArgs,
	type CreateClientRow,
	type UpdateClientArgs,
	type UpdateClientRow,
	type GetClientBalanceRow,
	type CreateClientBalanceArgs,
	type CreateClientBalanceRow,
	type GetClientStatsRow,
	// type GetClientBankAccountsRow,  // TODO: Add bank account queries
	type GetRevenueConfigRow,
	type GetRevenueConfigByProductIDRow,
	type UpdateFeeConfigurationRow as UpdateRevenueConfigRow, // SQL name: UpdateFeeConfiguration
	type UpdateRevenueConfigByProductIDRow,
	type GetAllClientsByPrivyOrgIdRow,
	type GetAggregatedDashboardSummaryRow,
	// Bank account functions
	addSupportedCurrency,
	getClientBankAccounts,
	removeSupportedCurrency,
	updateClientBankAccounts,
	updateClientSupportedCurrencies,
	// Vault/metrics functions
	getClientRevenueSummary,
	getClientTotalBalances,
	getEndUserGrowthMetrics,
	listClientsForMRRCalculation,
	listRecentEndUserTransactions,
	updateClientMRR,
	// Vault/metrics types
	type GetClientRevenueSummaryRow,
	type GetClientTotalBalancesRow,
	type GetEndUserGrowthMetricsRow,
	type ListClientsForMRRCalculationRow,
	type ListRecentEndUserTransactionsRow,
} from "@proxify/sqlcgen"
import { Sql } from "postgres"

import { verifyApiKey } from "../../utils/apiKey"

interface BankAccount {
	currency: string
	bank_name: string
	account_number: string
	account_name: string
	bank_details?: Record<string, any>
}

/**
 * Client Organization Repository
 * Manages B2B client organizations
 */
export class ClientRepository {
	constructor(private readonly sql: Sql) {}

	// ==========================================
	// CLIENT QUERIES
	// ==========================================

	/**
	 * Get client by ID
	 */
	async getById(id: string): Promise<GetClientRow | null> {
		return await getClient(this.sql, { id })
	}

	/**
	 * Get client by product ID
	 * Used for client lookup in APIs
	 */
	async getByProductId(productId: string): Promise<GetClientByProductIdRow | null> {
		const result = await getClientByProductId(this.sql, { productId })

		// DEBUG: Log raw SQLC query result to trace data flow
		console.log('[ClientRepository] getByProductId RAW SQLC RESULT:', {
			productId,
			found: !!result,
			id: result?.id,
			companyName: result?.companyName,
			businessType: result?.businessType,
			description: result?.description,
			clientRevenueSharePercent: result?.clientRevenueSharePercent,
			platformFeePercent: result?.platformFeePercent,
			performanceFee: result?.performanceFee,
			supportedCurrencies: result?.supportedCurrencies,
			bankAccounts: result?.bankAccounts,
			strategiesPreferences: result?.strategiesPreferences,
			strategiesCustomization: result?.strategiesCustomization,
			customStrategy: result?.customStrategy,
		})

		return result
	}

	/**
	 * Get clients by Privy organization ID (returns array of all clients for this Privy org)
	 * Used for Privy webhook integration and multi-product dashboard
	 */
	async getByPrivyOrgId(privyOrgId: string): Promise<GetAllClientsByPrivyOrgIdRow[]> {
		return await getAllClientsByPrivyOrgId(this.sql, { privyOrganizationId: privyOrgId })
	}

	/**
	 * Get client by API key prefix
	 * First step in API key validation
	 */
	async getByApiKeyPrefix(prefix: string): Promise<GetClientByAPIKeyPrefixRow | null> {
		return await getClientByAPIKeyPrefix(this.sql, { apiKeyPrefix: prefix })
	}

	/**
	 * Get client by API key hash
	 * Direct lookup for validated API keys
	 */
	async getByApiKeyHash(hash: string): Promise<GetClientByAPIKeyHashRow | null> {
		return await getClientByAPIKeyHash(this.sql, { apiKeyHash: hash })
	}

	/**
	 * List all clients with pagination
	 */
	async list(limit = 20, offset = 0): Promise<ListClientsRow[]> {
		return await listClients(this.sql, { limit: limit.toString(), offset: offset.toString() })
	}

	/**
	 * List active clients only
	 * Note: listActiveClients doesn't exist in SQLC, using listClients which already filters by is_active = true
	 */
	async listActive(): Promise<ListClientsRow[]> {
		// listActiveClients doesn't exist, using listClients which already filters by is_active
		return await listClients(this.sql, { limit: "100", offset: "0" })
	}

	// ==========================================
	// CLIENT MUTATIONS
	// ==========================================

	/**
	 * Create new client organization
	 * ✅ Returns created client with ID
	 */
	async create(params: CreateClientArgs): Promise<CreateClientRow | null> {
		return await createClient(this.sql, params)
	}

	/**
	 * Update client organization
	 * ✅ Returns updated client
	 */
	async update(id: string, params: Omit<UpdateClientArgs, "id">): Promise<UpdateClientRow | null> {
		return await updateClient(this.sql, { id, ...params })
	}

	/**
	 * Activate client
	 */
	async activate(id: string): Promise<void> {
		await activateClient(this.sql, { id })
	}

	/**
	 * Deactivate client
	 */
	async deactivate(id: string): Promise<void> {
		await deactivateClient(this.sql, { id })
	}

	/**
	 * Delete client (hard delete)
	 * ⚠️ Use with caution - prefer deactivate
	 */
	async delete(id: string): Promise<void> {
		await deleteClient(this.sql, { id })
	}

	/**
	 * Update client API key
	 */
	async updateApiKey(id: string, apiKeyHash: string, apiKeyPrefix: string): Promise<void> {
		await updateClientAPIKey(this.sql, { id, apiKeyHash, apiKeyPrefix })
	}

	/**
	 * Store both sandbox and production API keys
	 */
	async storeEnvironmentAPIKeys(
		clientId: string,
		sandboxApiKey: string,
		sandboxApiSecret: string,
		productionApiKey: string,
		productionApiSecret: string,
	): Promise<StoreEnvironmentAPIKeysRow | null> {
		return await storeEnvironmentAPIKeys(this.sql, {
			id: clientId,
			sandboxApiKey,
			sandboxApiSecret,
			productionApiKey,
			productionApiSecret,
		})
	}

	/**
	 * Get client by sandbox API key hash
	 */
	async getClientBySandboxKey(apiKeyHash: string): Promise<GetClientBySandboxAPIKeyRow | null> {
		return await getClientBySandboxAPIKey(this.sql, { sandboxApiKey: apiKeyHash })
	}

	/**
	 * Get client by production API key hash
	 */
	async getClientByProductionKey(apiKeyHash: string): Promise<GetClientByProductionAPIKeyRow | null> {
		return await getClientByProductionAPIKey(this.sql, { productionApiKey: apiKeyHash })
	}

	/**
	 * Regenerate sandbox API key
	 */
	async regenerateSandboxKey(clientId: string, apiKeyHash: string, apiKeyPrefix: string): Promise<RegenerateSandboxAPIKeyRow | null> {
		return await regenerateSandboxAPIKey(this.sql, {
			id: clientId,
			sandboxApiKey: apiKeyHash,
			sandboxApiSecret: apiKeyPrefix,
		})
	}

	/**
	 * Regenerate production API key
	 */
	async regenerateProductionKey(
		clientId: string,
		apiKeyHash: string,
		apiKeyPrefix: string,
	): Promise<RegenerateProductionAPIKeyRow | null> {
		return await regenerateProductionAPIKey(this.sql, {
			id: clientId,
			productionApiKey: apiKeyHash,
			productionApiSecret: apiKeyPrefix,
		})
	}

	// ==========================================
	// CLIENT BALANCE OPERATIONS
	// ==========================================

	/**
	 * Get client balance
	 */
	async getBalance(clientId: string): Promise<GetClientBalanceRow | null> {
		return await getClientBalance(this.sql, { clientId })
	}

	/**
	 * Create client balance record
	 */
	async createBalance(params: CreateClientBalanceArgs): Promise<CreateClientBalanceRow | null> {
		return await createClientBalance(this.sql, params)
	}

	/**
	 * Add to available balance
	 * ✅ Called when: Yield distributed, Funds received
	 */
	async addToAvailable(clientId: string, amount: string): Promise<void> {
		await addToAvailableBalance(this.sql, { clientId, available: amount })
	}

	/**
	 * Deduct from available balance
	 * ✅ Called when: Client withdraws funds
	 */
	async deductFromAvailable(clientId: string, amount: string): Promise<void> {
		await deductFromAvailable(this.sql, { clientId, available: amount })
	}

	/**
	 * Reserve balance for pending withdrawal
	 * ✅ Moves available → reserved
	 */
	async reserve(clientId: string, amount: string): Promise<void> {
		await reserveBalance(this.sql, { clientId, available: amount })
	}

	/**
	 * Release reserved balance back to available
	 * ✅ Called when: Withdrawal cancelled
	 */
	async releaseReserved(clientId: string, amount: string): Promise<void> {
		await releaseReservedBalance(this.sql, { clientId, reserved: amount })
	}

	/**
	 * Deduct reserved balance
	 * ✅ Called when: Withdrawal completed
	 */
	async deductReserved(clientId: string, amount: string): Promise<void> {
		await deductReservedBalance(this.sql, { clientId, reserved: amount })
	}

	// ==========================================
	// WALLET STAGE BALANCES (idle → earning)
	// ==========================================

	/**
	 * Add to client's idle balance
	 * ✅ Called when: On-ramp completes (funds arrive in custodial wallet)
	 */
	async addToIdleBalance(clientId: string, amount: string): Promise<void> {
		await addToClientIdleBalance(this.sql, { id: clientId, idleBalance: amount })
	}

	/**
	 * Move from idle to earning balance
	 * ✅ Called when: Staking funds to DeFi protocols
	 */
	async moveIdleToEarning(clientId: string, amount: string): Promise<void> {
		await moveClientIdleToEarning(this.sql, { id: clientId, idleBalance: amount })
	}

	/**
	 * Move from earning back to idle balance
	 * ✅ Called when: Unstaking from DeFi protocols
	 */
	async moveEarningToIdle(clientId: string, amount: string): Promise<void> {
		await moveClientEarningToIdle(this.sql, { id: clientId, earningBalance: amount })
	}

	// ==========================================
	// CLIENT STATISTICS
	// ==========================================

	/**
	 * Get comprehensive client statistics
	 * Includes: balance, users, vaults, deposits, withdrawals, AUM
	 */
	async getStats(id: string): Promise<GetClientStatsRow | null> {
		return await getClientStats(this.sql, { id })
	}

	// ==========================================
	// BUSINESS LOGIC HELPERS
	// ==========================================

	/**
	 * Validate API key and return client
	 * ✅ Two-step validation: prefix lookup → hash compare
	 */
	async validateApiKey(apiKey: string): Promise<GetClientByAPIKeyHashRow | null> {
		// Step 1: Extract prefix (first 12 chars for uniqueness)
		const prefix = apiKey.substring(0, 12)
		console.log(`[validateApiKey] Step 1: Extracted prefix: "${prefix}"`)

		// Step 2: Get client by prefix (fast lookup)
		const client = await this.getByApiKeyPrefix(prefix)
		console.log(`[validateApiKey] Step 2: Client lookup by prefix:`, {
			found: !!client,
			hasHash: client ? !!client.apiKeyHash : false,
			productId: client?.productId,
			companyName: client?.companyName,
		})

		if (!client?.apiKeyHash) {
			console.log(
				`[validateApiKey] ❌ FAILED at Step 2: ${!client ? "No client found with prefix" : "Client found but no hash stored"}`,
			)
			return null
		}

		// Step 3: Verify API key against stored hash (constant-time via bcrypt)
		console.log(`[validateApiKey] Step 3: Verifying bcrypt hash...`)
		const isValid = await verifyApiKey(apiKey, client.apiKeyHash)
		console.log(`[validateApiKey] Step 3 result: Hash ${isValid ? "✅ matches" : "❌ does NOT match"}`)

		if (!isValid) {
			console.log(`[validateApiKey] ❌ FAILED at Step 3: Hash mismatch`)
			return null
		}

		// Step 4: Return client if valid
		console.log(`[validateApiKey] ✅ SUCCESS: API key validated for ${client.companyName} (${client.productId})`)
		return client
	}

	/**
	 * Get or create client balance
	 * ✅ Idempotent operation
	 */
	async getOrCreateBalance(clientId: string, currency = "USD"): Promise<GetClientBalanceRow> {
		let balance = await this.getBalance(clientId)

		if (!balance) {
			const created = await this.createBalance({
				clientId,
				available: "0",
				reserved: "0",
				currency,
			})

			if (!created) {
				throw new Error("Failed to create client balance")
			}

			balance = created
		}

		return balance
	}

	// ==========================================
	// BANK ACCOUNT OPERATIONS (Multi-Currency)
	// ==========================================

	/**
	 * Get all bank accounts for a client
	 */
	async getBankAccounts(clientId: string): Promise<BankAccount[]> {
		const result = await getClientBankAccounts(this.sql, { id: clientId })

		if (!result?.bankAccounts) {
			return []
		}

		try {
			// Parse JSONB array
			const bankAccounts =
				typeof result.bankAccounts === "string" ? JSON.parse(result.bankAccounts) : result.bankAccounts

			return Array.isArray(bankAccounts) ? bankAccounts : []
		} catch (error) {
			console.error("Failed to parse bank accounts:", error)
			return []
		}
	}

	/**
	 * Get bank account by currency
	 */
	async getBankAccountByCurrency(clientId: string, currency: string): Promise<BankAccount | null> {
		const bankAccounts = await this.getBankAccounts(clientId)
		return bankAccounts.find((account) => account.currency === currency) || null
	}

	/**
	 * Add or update bank account for a specific currency
	 */
	async addOrUpdateBankAccount(clientId: string, bankAccount: BankAccount): Promise<void> {
		// Get existing bank accounts
		const existingAccounts = await this.getBankAccounts(clientId)

		// Normalize currency to avoid duplicates due to whitespace/case differences
		const normalizedCurrency = (bankAccount.currency || "").toString().trim().toUpperCase()
		bankAccount.currency = normalizedCurrency

		// Find if currency already exists (compare normalized)
		const existingIndex = existingAccounts.findIndex(
			(acc) => (acc.currency || "").toString().trim().toUpperCase() === normalizedCurrency,
		)

		if (existingIndex >= 0) {
			// Update existing
			existingAccounts[existingIndex] = bankAccount
		} else {
			// Add new
			existingAccounts.push(bankAccount)
		}

		// Save back to database
		// ✅ Pass array directly - PostgreSQL JSONB (::jsonb cast) handles serialization automatically
		await updateClientBankAccounts(this.sql, {
			id: clientId,
			bankAccounts: existingAccounts as any,
		})
	}

	/**
	 * Remove bank account by currency
	 */
	async removeBankAccount(clientId: string, currency: string): Promise<void> {
		const existingAccounts = await this.getBankAccounts(clientId)
		const filteredAccounts = existingAccounts.filter((acc) => acc.currency !== currency)

		await updateClientBankAccounts(this.sql, {
			id: clientId,
			bankAccounts: filteredAccounts as any,
		})
	}

	/**
	 * Replace all bank accounts (REPLACE strategy: clear existing, set new)
	 * Used when user configures bank accounts via UI - replaces entire array
	 */
	async replaceBankAccounts(
		clientId: string,
		bankAccounts: {
			currency: string
			bank_name: string
			account_number: string
			account_name: string
			bank_details?: Record<string, any>
		}[],
	): Promise<void> {
		// Replace entire bank_accounts array with new set
		// PostgreSQL JSONB (::jsonb cast) handles serialization automatically
		await updateClientBankAccounts(this.sql, {
			id: clientId,
			bankAccounts: bankAccounts as any,
		})
	}

	/**
	 * Get supported currencies
	 */
	async getSupportedCurrencies(clientId: string): Promise<string[]> {
		const client = await this.getById(clientId)
		return client?.supportedCurrencies || []
	}

	/**
	 * Update supported currencies
	 */
	async updateSupportedCurrencies(clientId: string, currencies: string[]): Promise<void> {
		await updateClientSupportedCurrencies(this.sql, {
			id: clientId,
			supportedCurrencies: currencies,
		})
	}

	/**
	 * Add a single supported currency
	 */
	async addCurrency(clientId: string, currency: string): Promise<void> {
		await addSupportedCurrency(this.sql, {
			id: clientId,
			arrayAppend: currency,
		})
	}

	/**
	 * Remove a supported currency
	 */
	async removeCurrency(clientId: string, currency: string): Promise<void> {
		await removeSupportedCurrency(this.sql, {
			id: clientId,
			arrayRemove: currency,
		})
	}

	// ==========================================
	// REVENUE CONFIGURATION (NEW)
	// ==========================================

	/**
	 * Get revenue configuration for client
	 * Returns client revenue share (10-20%) and platform fee (fixed 5%)
	 */
	async getRevenueConfig(clientId: string): Promise<GetRevenueConfigRow | null> {
		return await getRevenueConfig(this.sql, { id: clientId })
	}

	/**
	 * Get revenue configuration by product ID
	 */
	async getRevenueConfigByProductId(productId: string): Promise<GetRevenueConfigByProductIDRow | null> {
		return await getRevenueConfigByProductID(this.sql, { productId })
	}

	/**
	 * Update client revenue share percentage (10-20%)
	 * Platform fee remains fixed and cannot be changed by client
	 *
	 * @param clientId - Client organization ID
	 * @param revenueSharePercent - Client's share of raw APY (10-20%)
	 * @returns Updated revenue config
	 */
	async updateRevenueConfig(clientId: string, revenueSharePercent: string): Promise<UpdateRevenueConfigRow | null> {
		// Validate range (10-20%)
		const percent = parseFloat(revenueSharePercent)
		if (percent < 10 || percent > 20) {
			throw new Error("Client revenue share must be between 10% and 20%")
		}

		return await updateFeeConfiguration(this.sql, {
			id: clientId,
			clientRevenueSharePercent: revenueSharePercent,
			platformFeePercent: "5", // Default platform fee
			performanceFee: null, // Optional performance fee
		})
	}

	/**
	 * Update client revenue share by product ID
	 */
	async updateRevenueConfigByProductId(
		productId: string,
		revenueSharePercent: string,
	): Promise<UpdateRevenueConfigByProductIDRow | null> {
		// Validate range (10-20%)
		const percent = parseFloat(revenueSharePercent)
		if (percent < 10 || percent > 20) {
			throw new Error("Client revenue share must be between 10% and 20%")
		}

		return await updateRevenueConfigByProductID(this.sql, {
			productId,
			clientRevenueSharePercent: revenueSharePercent,
		})
	}

	/**
	 * Update product strategy customization by product ID
	 */
	async updateProductCustomizationByProductId(productId: string, strategiesCustomization: string): Promise<void> {
		await updateProductCustomizationByProductID(this.sql, {
			productId,
			strategiesCustomization,
		})
	}

	/**
	 * Increment total end-user count
	 * Called when a new end-user is created
	 */
	async incrementEndUserCount(clientId: string): Promise<void> {
		await incrementEndUserCount(this.sql, { id: clientId })
	}

	/**
	 * Decrement total end-user count
	 * Called when an end-user is deactivated
	 */
	async decrementEndUserCount(clientId: string): Promise<void> {
		await decrementEndUserCount(this.sql, { id: clientId })
	}

	/**
	 * Calculate revenue split from raw yield
	 * Returns 3-way split: platform fee, client revenue, end-user revenue
	 *
	 * @param clientId - Client organization ID
	 * @param rawYield - Total yield earned from DeFi (before fees)
	 * @returns Revenue split breakdown
	 */
	async calculateRevenueSplit(
		clientId: string,
		rawYield: number,
	): Promise<{
		rawYield: number
		platformFee: number
		clientRevenue: number
		endUserRevenue: number
		platformFeePercent: number
		clientRevenuePercent: number
		endUserNetPercent: number
	}> {
		const config = await this.getRevenueConfig(clientId)

		if (!config) {
			throw new Error("Client revenue config not found")
		}

		const platformFeePercent = parseFloat(config.platformFeePercent || "5.0")
		const clientRevenuePercent = parseFloat(config.clientRevenueSharePercent || "15.0")

		const platformFee = rawYield * (platformFeePercent / 100)
		const clientRevenue = rawYield * (clientRevenuePercent / 100)
		const endUserRevenue = rawYield - platformFee - clientRevenue
		const endUserNetPercent = 100 - platformFeePercent - clientRevenuePercent

		return {
			rawYield,
			platformFee,
			clientRevenue,
			endUserRevenue,
			platformFeePercent,
			clientRevenuePercent,
			endUserNetPercent,
		}
	}

	// ==========================================
	// WALLET STAGES OPERATIONS (NEW)
	// ==========================================

	/**
	 * Get aggregated balances across all vaults for a client
	 * Returns: total idle balance, earning balance, and revenue earned
	 */
	async getTotalBalances(clientId: string): Promise<GetClientTotalBalancesRow | null> {
		return await getClientTotalBalances(this.sql, { clientId })
	}

	// ==========================================
	// REVENUE METRICS (NEW)
	// ==========================================

	/**
	 * Get comprehensive revenue summary for a client
	 * Includes: MRR, ARR, total revenue earned, fee splits
	 */
	async getRevenueSummary(clientId: string): Promise<GetClientRevenueSummaryRow | null> {
		return await getClientRevenueSummary(this.sql, { id: clientId })
	}

	/**
	 * Calculate and update Monthly Recurring Revenue (MRR)
	 * Formula: MRR = Earning Balance × Average APY × Client Revenue Share %
	 * ARR is automatically calculated as MRR × 12
	 *
	 * @param clientId - Client organization ID
	 * @param mrr - Monthly recurring revenue amount
	 */
	async updateMRR(clientId: string, mrr: string): Promise<void> {
		await updateClientMRR(this.sql, {
			id: clientId,
			monthlyRecurringRevenue: mrr,
		})
	}

	/**
	 * List all clients with active earning balances (for batch MRR calculation)
	 */
	async listClientsForMRRCalculation(): Promise<ListClientsForMRRCalculationRow[]> {
		return await listClientsForMRRCalculation(this.sql)
	}

	/**
	 * Calculate MRR for a client based on current earning balance and APY
	 * Formula: MRR = (Earning Balance × APY × Client Revenue Share %) / 12
	 *
	 * @param earningBalance - Total funds actively earning yield
	 * @param avgApy30d - Average 30-day APY (as percentage, e.g., 5.5 for 5.5%)
	 * @param clientRevenuePercent - Client's revenue share (10-20%)
	 * @returns Monthly recurring revenue
	 */
	calculateMRR(earningBalance: number, avgApy30d: number, clientRevenuePercent: number): number {
		// Convert APY to decimal (5.5% → 0.055)
		const apyDecimal = avgApy30d / 100

		// Calculate annual client revenue
		const annualClientRevenue = earningBalance * apyDecimal * (clientRevenuePercent / 100)

		// Convert to monthly (ARR / 12)
		const mrr = annualClientRevenue / 12

		return mrr
	}

	// ==========================================
	// END-USER ACTIVITY (NEW)
	// ==========================================

	/**
	 * Get recent end-user transactions (deposits + withdrawals)
	 * Returns unified transaction feed for dashboard
	 */
	async getRecentEndUserTransactions(
		clientId: string,
		limit = 20,
		offset = 0,
	): Promise<ListRecentEndUserTransactionsRow[]> {
		return await listRecentEndUserTransactions(this.sql, {
			clientId,
			limit: limit.toString(),
			offset: offset.toString(),
		})
	}

	/**
	 * Get end-user growth metrics
	 * Returns: total users, new users (30d), active users (30d), deposits, withdrawals
	 */
	async getEndUserGrowthMetrics(clientId: string): Promise<GetEndUserGrowthMetricsRow | null> {
		return await getEndUserGrowthMetrics(this.sql, { id: clientId })
	}

	// ==========================================
	// DASHBOARD METRICS (NEW - Convenience Method)
	// ==========================================

	/**
	 * Get all dashboard metrics in one call
	 * Convenience method that combines multiple queries
	 */
	async getDashboardMetrics(clientId: string): Promise<{
		balances: GetClientTotalBalancesRow | null
		revenue: GetClientRevenueSummaryRow | null
		growth: GetEndUserGrowthMetricsRow | null
		recentTransactions: ListRecentEndUserTransactionsRow[]
	}> {
		const [balances, revenue, growth, recentTransactions] = await Promise.all([
			this.getTotalBalances(clientId),
			this.getRevenueSummary(clientId),
			this.getEndUserGrowthMetrics(clientId),
			this.getRecentEndUserTransactions(clientId, 10, 0),
		])

		return {
			balances,
			revenue,
			growth,
			recentTransactions,
		}
	}

	// ============================================
	// AGGREGATED DASHBOARD (Across All Products)
	// ============================================

	/**
	 * Get all client organizations for a Privy user
	 * Used to aggregate data across multiple products
	 */
	async getAllClientsByPrivyOrgId(privyOrganizationId: string): Promise<GetAllClientsByPrivyOrgIdRow[]> {
		try {
			return await getAllClientsByPrivyOrgId(this.sql, { privyOrganizationId })
		} catch (error) {
			console.error("[ClientRepository] Error getting all clients by privy org ID:", error)
			throw error
		}
	}

	/**
	 * Get aggregated dashboard summary across ALL products for a Privy user
	 * Sums: idle_balance, earning_balance, revenue metrics, end-user metrics
	 * Calculates weighted averages for revenue percentages
	 */
	async getAggregatedDashboardSummary(privyOrganizationId: string): Promise<GetAggregatedDashboardSummaryRow | null> {
		try {
			return await getAggregatedDashboardSummary(this.sql, { privyOrganizationId })
		} catch (error) {
			console.error("[ClientRepository] Error getting aggregated dashboard summary:", error)
			throw error
		}
	}
}
