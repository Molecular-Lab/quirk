/**
 * Client Organization Repository - Proxify Pattern
 * 
 * ✅ Wraps SQLC-generated queries from database/queries/client.sql
 * ✅ Adds business logic for client management
 * ✅ Type-safe database operations
 */

import { Sql } from 'postgres';
import { verifyApiKey } from '../../utils/apiKey';
import {
  // Query functions
  getClient,
  getClientByProductID,
  getClientsByPrivyOrgID,
  getClientByAPIKeyPrefix,
  getClientByAPIKeyHash,
  listClients,
  listActiveClients,
  createClient,
  updateClient,
  activateClient,
  deactivateClient,
  deleteClient,
  updateClientAPIKey,
  getClientBalance,
  createClientBalance,
  addToAvailableBalance,
  deductFromAvailable,
  reserveBalance,
  releaseReservedBalance,
  deductReservedBalance,
  getClientStats,
  getClientBankAccounts,
  updateClientBankAccounts,
  updateClientSupportedCurrencies,
  addSupportedCurrency,
  removeSupportedCurrency,

  // Types
  type GetClientRow,
  type GetClientByProductIDRow,
  type GetClientsByPrivyOrgIDRow,
  type GetClientByAPIKeyPrefixRow,
  type GetClientByAPIKeyHashRow,
  type ListClientsRow,
  type ListActiveClientsRow,
  type CreateClientArgs,
  type CreateClientRow,
  type UpdateClientArgs,
  type UpdateClientRow,
  type GetClientBalanceRow,
  type CreateClientBalanceArgs,
  type CreateClientBalanceRow,
  type GetClientStatsRow,
  type GetClientBankAccountsRow,
} from '@proxify/sqlcgen';

interface BankAccount {
  currency: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_details?: Record<string, any>;
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
    return await getClient(this.sql, { id });
  }

  /**
   * Get client by product ID
   * Used for client lookup in APIs
   */
  async getByProductId(productId: string): Promise<GetClientByProductIDRow | null> {
    return await getClientByProductID(this.sql, { productId });
  }

  /**
   * Get client by Privy organization ID
   * Used for Privy webhook integration
   */
  async getByPrivyOrgId(privyOrgId: string): Promise<GetClientsByPrivyOrgIDRow[]> {
    return await getClientsByPrivyOrgID(this.sql, { privyOrganizationId: privyOrgId });
  }

  /**
   * Get client by API key prefix
   * First step in API key validation
   */
  async getByApiKeyPrefix(prefix: string): Promise<GetClientByAPIKeyPrefixRow | null> {
    return await getClientByAPIKeyPrefix(this.sql, { apiKeyPrefix: prefix });
  }

  /**
   * Get client by API key hash
   * Direct lookup for validated API keys
   */
  async getByApiKeyHash(hash: string): Promise<GetClientByAPIKeyHashRow | null> {
    return await getClientByAPIKeyHash(this.sql, { apiKeyHash: hash });
  }

  /**
   * List all clients with pagination
   */
  async list(limit: number = 20, offset: number = 0): Promise<ListClientsRow[]> {
    return await listClients(this.sql, { limit: limit.toString(), offset: offset.toString() });
  }

  /**
   * List active clients only
   */
  async listActive(): Promise<ListActiveClientsRow[]> {
    return await listActiveClients(this.sql);
  }

  // ==========================================
  // CLIENT MUTATIONS
  // ==========================================

  /**
   * Create new client organization
   * ✅ Returns created client with ID
   */
  async create(params: CreateClientArgs): Promise<CreateClientRow | null> {
    return await createClient(this.sql, params);
  }

  /**
   * Update client organization
   * ✅ Returns updated client
   */
  async update(id: string, params: Omit<UpdateClientArgs, 'id'>): Promise<UpdateClientRow | null> {
    return await updateClient(this.sql, { id, ...params });
  }

  /**
   * Activate client
   */
  async activate(id: string): Promise<void> {
    await activateClient(this.sql, { id });
  }

  /**
   * Deactivate client
   */
  async deactivate(id: string): Promise<void> {
    await deactivateClient(this.sql, { id });
  }

  /**
   * Delete client (hard delete)
   * ⚠️ Use with caution - prefer deactivate
   */
  async delete(id: string): Promise<void> {
    await deleteClient(this.sql, { id });
  }

  /**
   * Update client API key
   */
  async updateApiKey(id: string, apiKeyHash: string, apiKeyPrefix: string): Promise<void> {
    await updateClientAPIKey(this.sql, { id, apiKeyHash, apiKeyPrefix });
  }

  // ==========================================
  // CLIENT BALANCE OPERATIONS
  // ==========================================

  /**
   * Get client balance
   */
  async getBalance(clientId: string): Promise<GetClientBalanceRow | null> {
    return await getClientBalance(this.sql, { clientId });
  }

  /**
   * Create client balance record
   */
  async createBalance(params: CreateClientBalanceArgs): Promise<CreateClientBalanceRow | null> {
    return await createClientBalance(this.sql, params);
  }

  /**
   * Add to available balance
   * ✅ Called when: Yield distributed, Funds received
   */
  async addToAvailable(clientId: string, amount: string): Promise<void> {
    await addToAvailableBalance(this.sql, { clientId, available: amount });
  }

  /**
   * Deduct from available balance
   * ✅ Called when: Client withdraws funds
   */
  async deductFromAvailable(clientId: string, amount: string): Promise<void> {
    await deductFromAvailable(this.sql, { clientId, available: amount });
  }

  /**
   * Reserve balance for pending withdrawal
   * ✅ Moves available → reserved
   */
  async reserve(clientId: string, amount: string): Promise<void> {
    await reserveBalance(this.sql, { clientId, available: amount });
  }

  /**
   * Release reserved balance back to available
   * ✅ Called when: Withdrawal cancelled
   */
  async releaseReserved(clientId: string, amount: string): Promise<void> {
    await releaseReservedBalance(this.sql, { clientId, reserved: amount });
  }

  /**
   * Deduct reserved balance
   * ✅ Called when: Withdrawal completed
   */
  async deductReserved(clientId: string, amount: string): Promise<void> {
    await deductReservedBalance(this.sql, { clientId, reserved: amount });
  }

  // ==========================================
  // CLIENT STATISTICS
  // ==========================================

  /**
   * Get comprehensive client statistics
   * Includes: balance, users, vaults, deposits, withdrawals, AUM
   */
  async getStats(id: string): Promise<GetClientStatsRow | null> {
    return await getClientStats(this.sql, { id });
  }

  // ==========================================
  // BUSINESS LOGIC HELPERS
  // ==========================================

  /**
   * Validate API key and return client
   * ✅ Two-step validation: prefix lookup → hash compare
   */
  async validateApiKey(apiKey: string): Promise<GetClientByAPIKeyHashRow | null> {
    // Step 1: Extract prefix (first 8 chars)
    const prefix = apiKey.substring(0, 8);
    
    // Step 2: Get client by prefix (fast lookup)
    const client = await this.getByApiKeyPrefix(prefix);
    if (!client || !client.apiKeyHash) {
      return null;
    }

    // Step 3: Verify API key against stored hash (constant-time via bcrypt)
    const isValid = await verifyApiKey(apiKey, client.apiKeyHash);
    if (!isValid) {
      return null;
    }

    // Step 4: Return client if valid
    return client;
  }

  /**
   * Get or create client balance
   * ✅ Idempotent operation
   */
  async getOrCreateBalance(clientId: string, currency: string = 'USD'): Promise<GetClientBalanceRow> {
    let balance = await this.getBalance(clientId);

    if (!balance) {
      const created = await this.createBalance({
        clientId,
        available: '0',
        reserved: '0',
        currency,
      });

      if (!created) {
        throw new Error('Failed to create client balance');
      }

      balance = created;
    }

    return balance;
  }

  // ==========================================
  // BANK ACCOUNT OPERATIONS (Multi-Currency)
  // ==========================================

  /**
   * Get all bank accounts for a client
   */
  async getBankAccounts(clientId: string): Promise<BankAccount[]> {
    const result = await getClientBankAccounts(this.sql, { id: clientId });

    if (!result || !result.bankAccounts) {
      return [];
    }

    try {
      // Parse JSONB array
      const bankAccounts = typeof result.bankAccounts === 'string'
        ? JSON.parse(result.bankAccounts)
        : result.bankAccounts;

      return Array.isArray(bankAccounts) ? bankAccounts : [];
    } catch (error) {
      console.error('Failed to parse bank accounts:', error);
      return [];
    }
  }

  /**
   * Get bank account by currency
   */
  async getBankAccountByCurrency(clientId: string, currency: string): Promise<BankAccount | null> {
    const bankAccounts = await this.getBankAccounts(clientId);
    return bankAccounts.find(account => account.currency === currency) || null;
  }

  /**
   * Add or update bank account for a specific currency
   */
  async addOrUpdateBankAccount(clientId: string, bankAccount: BankAccount): Promise<void> {
    // Get existing bank accounts
    const existingAccounts = await this.getBankAccounts(clientId);

    // Normalize currency to avoid duplicates due to whitespace/case differences
    const normalizedCurrency = (bankAccount.currency || "").toString().trim().toUpperCase();
    bankAccount.currency = normalizedCurrency;

    // Find if currency already exists (compare normalized)
    const existingIndex = existingAccounts.findIndex(acc => (acc.currency || "").toString().trim().toUpperCase() === normalizedCurrency);

    if (existingIndex >= 0) {
      // Update existing
      existingAccounts[existingIndex] = bankAccount;
    } else {
      // Add new
      existingAccounts.push(bankAccount);
    }

    // Save back to database
    // ✅ Pass array directly - PostgreSQL JSONB (::jsonb cast) handles serialization automatically
    await updateClientBankAccounts(this.sql, {
      id: clientId,
      bankAccounts: existingAccounts as any,
    });
  }

  /**
   * Remove bank account by currency
   */
  async removeBankAccount(clientId: string, currency: string): Promise<void> {
    const existingAccounts = await this.getBankAccounts(clientId);
    const filteredAccounts = existingAccounts.filter(acc => acc.currency !== currency);

    await updateClientBankAccounts(this.sql, {
      id: clientId,
      bankAccounts: filteredAccounts as any,
    });
  }

  /**
   * Replace all bank accounts (REPLACE strategy: clear existing, set new)
   * Used when user configures bank accounts via UI - replaces entire array
   */
  async replaceBankAccounts(
    clientId: string,
    bankAccounts: Array<{
      currency: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      bank_details?: Record<string, any>;
    }>
  ): Promise<void> {
    // Replace entire bank_accounts array with new set
    // PostgreSQL JSONB (::jsonb cast) handles serialization automatically
    await updateClientBankAccounts(this.sql, {
      id: clientId,
      bankAccounts: bankAccounts as any,
    });
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(clientId: string): Promise<string[]> {
    const client = await this.getById(clientId);
    return client?.supportedCurrencies || [];
  }

  /**
   * Update supported currencies
   */
  async updateSupportedCurrencies(clientId: string, currencies: string[]): Promise<void> {
    await updateClientSupportedCurrencies(this.sql, {
      id: clientId,
      supportedCurrencies: currencies,
    });
  }

  /**
   * Add a single supported currency
   */
  async addCurrency(clientId: string, currency: string): Promise<void> {
    await addSupportedCurrency(this.sql, {
      id: clientId,
      arrayAppend: currency,
    });
  }

  /**
   * Remove a supported currency
   */
  async removeCurrency(clientId: string, currency: string): Promise<void> {
    await removeSupportedCurrency(this.sql, {
      id: clientId,
      arrayRemove: currency,
    });
  }
}
