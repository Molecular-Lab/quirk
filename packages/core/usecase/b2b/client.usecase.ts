/**
 * B2B Client UseCase
 * Manages client organizations and balances
 */

import type {
  GetClientRow,
  CreateClientArgs,
  CreateClientRow,
  GetClientBalanceRow,
  GetClientStatsRow,
  GetClientsByPrivyOrgIDRow,
} from '@proxify/sqlcgen';
import type {
  CreateClientRequest,
  AddFundsRequest,
  ReserveFundsRequest,
  ReleaseFundsRequest,
  DeductReservedRequest,
} from '../../dto/b2b';
import { AuditRepository, ClientRepository, PrivyAccountRepository, VaultRepository } from '../../repository';
import { generateApiKey, hashApiKey, extractPrefix } from '../../utils/apiKey';

/**
 * B2B Client UseCase
 * Manages client organizations and balances
 */
export class B2BClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly privyAccountRepository: PrivyAccountRepository,
    private readonly auditRepository: AuditRepository,
    private readonly vaultRepository: VaultRepository
  ) {}

  /**
   * Get client by ID (internal)
   */
  async getClientById(clientId: string): Promise<GetClientRow | null> {
    return await this.clientRepository.getById(clientId);
  }

  /**
   * Get client by product ID
   */
  async getClientByProductId(productId: string): Promise<GetClientRow | null> {
    const client = await this.clientRepository.getByProductId(productId);

    if (!client) {
      return null;
    }

    if (!client.isActive) {
      throw new Error('Client account is inactive');
    }

    return client;
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<GetClientRow | null> {
    return await this.clientRepository.validateApiKey(apiKey);
  }

  /**
   * Regenerate API key for an existing client
   * ⚠️ Returns new API key (shown only once!)
   * ⚠️ Invalidates old API key immediately
   */
  async regenerateApiKey(productId: string): Promise<{ client: GetClientRow; api_key: string }> {
    // Get existing client
    const client = await this.clientRepository.getByProductId(productId);
    
    if (!client) {
      throw new Error(`Client not found with productId: ${productId}`);
    }

    // Generate new API key
    const apiKey = generateApiKey(client.isSandbox ?? false);
    const apiKeyHash = await hashApiKey(apiKey);
    const apiKeyPrefix = extractPrefix(apiKey);

    console.log(`[Client UseCase] Regenerating API key for client: ${client.id}, prefix: ${apiKeyPrefix}`);

    // Update in database (old key is immediately invalidated)
    await this.clientRepository.updateApiKey(client.id, apiKeyHash, apiKeyPrefix);

    // Audit log
    await this.auditRepository.create({
      clientId: client.id,
      userId: null,
      actorType: 'system',
      action: 'api_key_regenerated',
      resourceType: 'client',
      resourceId: client.id,
      description: `API key regenerated for product ${productId}`,
      metadata: {
        productId,
        oldPrefix: client.apiKeyPrefix,
        newPrefix: apiKeyPrefix,
      },
      ipAddress: null,
      userAgent: null,
    });

    // Return updated client and new API key
    const updatedClient = await this.clientRepository.getById(client.id);
    
    if (!updatedClient) {
      throw new Error('Failed to retrieve updated client');
    }
    
    return {
      client: updatedClient,
      api_key: apiKey, // ← Shown only once!
    };
  }

  /**
   * Create new client
   * Does NOT generate API key - user must explicitly call generateApiKey() (FLOW 0)
   */
  async createClient(request: CreateClientRequest): Promise<GetClientRow & { vaults: Array<{ id: string; chain: string; tokenSymbol: string; tokenAddress: string }> }> {
    // Check if product ID already exists
    console.log("Creating client with product ID:", request);
    const existing = await this.clientRepository.getByProductId(request.productId);
    if (existing) {
      throw new Error(`Product ID '${request.productId}' already exists`);
    }

    // ✅ NO API KEY GENERATION during registration!
    // User must explicitly generate API key via FLOW 0 (regenerateApiKey)
    console.log(`[Client Creation] Creating client WITHOUT API key (must be generated manually via FLOW 0)`);

    // Step 1: Get or create Privy account (idempotent)
    const privyAccount = await this.privyAccountRepository.getOrCreate({
      privyOrganizationId: request.privyOrganizationId,
      privyWalletAddress: request.privyWalletAddress,
      privyEmail: request.privyEmail,
      walletType: request.walletType,
    });

    // Step 2: Create organization (linked via FK)
    const args: CreateClientArgs = {
      privyAccountId: privyAccount.id, // ✅ FK instead of individual fields
      productId: request.productId,
      companyName: request.companyName,
      businessType: request.businessType,
      description: request.description || null,
      websiteUrl: request.websiteUrl || null,
      apiKeyHash: null, // ✅ NULL - no API key yet!
      apiKeyPrefix: null, // ✅ NULL - no API key yet!
      webhookUrls: request.webhookUrls || null,
      webhookSecret: request.webhookSecret || null,
      customStrategy: request.customStrategy || null,
      endUserYieldPortion: request.endUserYieldPortion || null,
      platformFee: request.platformFee || null,
      performanceFee: request.performanceFee || null,
      isActive: request.isActive ?? true,
      isSandbox: request.isSandbox ?? false,
      supportedCurrencies: request.supportedCurrencies || [],
      bankAccounts: request.bankAccounts ? JSON.stringify(request.bankAccounts) : '[]',
    };

    const client = await this.clientRepository.create(args);

    if (!client) {
      throw new Error('Failed to create client');
    }

    // Initialize balance
    await this.clientRepository.createBalance({
      clientId: client.id,
      available: '0',
      reserved: '0',
      currency: 'USDC',
    });

    // Audit log
    await this.auditRepository.create({
      clientId: client.id,
      userId: null,
      actorType: 'system',
      action: 'client_created',
      resourceType: 'client',
      resourceId: client.id,
      description: `Client created: ${request.companyName}`,
      metadata: {
        productId: request.productId,
        // No API key yet - user must generate via FLOW 0
      },
      ipAddress: null,
      userAgent: null,
    });

    // Step 3: Auto-create vault(s) based on user selection (FLOW 2A)
    // IMPORTANT: Vaults are TOKEN-CENTRIC, not chain-centric
    // One "USDC vault" means USDC support across ALL chains
    // One "USDT vault" means USDT support across ALL chains
    const vaultsToCreate = request.vaultsToCreate ?? 'both'; // Default to both USDC and USDT

    // Token addresses per chain (unified token addresses)
    const TOKEN_ADDRESSES: Record<string, { USDC: string; USDT: string }> = {
      '8453': { // Base
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      },
      '1': { // Ethereum
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
      '137': { // Polygon
        USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      '10': { // Optimism
        USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      },
      '42161': { // Arbitrum
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      },
    };

    // All supported chains
    const ALL_CHAINS = ['8453', '1', '137', '10', '42161']; // Base, Ethereum, Polygon, Optimism, Arbitrum

    const createdVaults: Array<{ id: string; chain: string; tokenSymbol: string; tokenAddress: string }> = [];

    // Create USDC vaults across ALL chains if requested
    if (vaultsToCreate === 'usdc' || vaultsToCreate === 'both') {
      for (const chain of ALL_CHAINS) {
        const usdcVault = await this.getOrCreateVault({
          clientId: client.id,
          chain,
          tokenAddress: TOKEN_ADDRESSES[chain].USDC,
          tokenSymbol: 'USDC',
        });
        createdVaults.push({
          id: usdcVault.id,
          chain,
          tokenSymbol: 'USDC',
          tokenAddress: TOKEN_ADDRESSES[chain].USDC,
        });
      }
    }

    // Create USDT vaults across ALL chains if requested
    if (vaultsToCreate === 'usdt' || vaultsToCreate === 'both') {
      for (const chain of ALL_CHAINS) {
        const usdtVault = await this.getOrCreateVault({
          clientId: client.id,
          chain,
          tokenAddress: TOKEN_ADDRESSES[chain].USDT,
          tokenSymbol: 'USDT',
        });
        createdVaults.push({
          id: usdtVault.id,
          chain,
          tokenSymbol: 'USDT',
          tokenAddress: TOKEN_ADDRESSES[chain].USDT,
        });
      }
    }

    // Step 4: Return combined data (client + Privy info from JOIN + created vaults)
    const result = await this.clientRepository.getByProductId(request.productId);
    if (!result) {
      throw new Error('Failed to retrieve created client');
    }

    // Return WITHOUT API key (user must generate via FLOW 0)
    return {
      ...result,
      vaults: createdVaults,
      // ✅ NO api_key field! User must call regenerateApiKey() (FLOW 0)
    };
  }

  /**
   * Get or create vault for client (idempotent)
   */
  private async getOrCreateVault(params: {
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
  }) {
    // Check if vault already exists
    let vault = await this.vaultRepository.getClientVault(
      params.clientId,
      params.chain,
      params.tokenAddress
    );

    if (!vault) {
      // Create new vault with index = 1.0e18
      vault = await this.vaultRepository.createClientVault({
        clientId: params.clientId,
        chain: params.chain,
        tokenAddress: params.tokenAddress,
        tokenSymbol: params.tokenSymbol,
        totalShares: '0',
        currentIndex: '1000000000000000000', // 1.0e18 (starting index)
        pendingDepositBalance: '0',
        totalStakedBalance: '0',
        cumulativeYield: '0',
      });

      if (!vault) {
        throw new Error('Failed to create vault');
      }

      // Audit log for vault creation
      await this.auditRepository.create({
        clientId: params.clientId,
        userId: null,
        actorType: 'system',
        action: 'vault_created',
        resourceType: 'client_vault',
        resourceId: vault.id,
        description: `Default vault created: ${params.tokenSymbol} on ${params.chain}`,
        metadata: { chain: params.chain, tokenAddress: params.tokenAddress },
        ipAddress: null,
        userAgent: null,
      });
    }

    return vault;
  }

  /**
   * Get all client organizations for a Privy user
   */
  async getClientsByPrivyOrgId(privyOrgId: string): Promise<GetClientsByPrivyOrgIDRow[]> {
    return await this.clientRepository.getByPrivyOrgId(privyOrgId);
  }

  /**
   * Get client balance
   */
  async getBalance(clientId: string): Promise<GetClientBalanceRow | null> {
    return await this.clientRepository.getBalance(clientId);
  }

  /**
   * Add funds to client balance
   */
  async addFunds(request: AddFundsRequest): Promise<void> {
    const balance = await this.clientRepository.getBalance(request.clientId);

    if (!balance) {
      throw new Error('Client balance not found');
    }

    await this.clientRepository.addToAvailable(request.clientId, request.amount);

    // Audit log
    await this.auditRepository.create({
      clientId: request.clientId,
      userId: null,
      actorType: 'admin',
      action: 'funds_added',
      resourceType: 'client_balance',
      resourceId: request.clientId,
      description: `Added ${request.amount} from ${request.source}`,
      metadata: { amount: request.amount, source: request.source, reference: request.reference },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Reserve funds for pending withdrawal
   */
  async reserveFunds(request: ReserveFundsRequest): Promise<void> {
    const balance = await this.clientRepository.getBalance(request.clientId);

    if (!balance) {
      throw new Error('Client balance not found');
    }

    // Check sufficient funds
    const available = parseFloat(balance.available);
    const amount = parseFloat(request.amount);

    if (available < amount) {
      throw new Error(`Insufficient funds. Available: ${balance.available}, Required: ${request.amount}`);
    }

    await this.clientRepository.reserve(request.clientId, request.amount);

    // Audit log
    await this.auditRepository.create({
      clientId: request.clientId,
      userId: null,
      actorType: 'client',
      action: 'funds_reserved',
      resourceType: 'client_balance',
      resourceId: request.clientId,
      description: `Reserved ${request.amount} for ${request.purpose}`,
      metadata: { amount: request.amount, purpose: request.purpose, reference: request.reference },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Release reserved funds
   */
  async releaseFunds(request: ReleaseFundsRequest): Promise<void> {
    await this.clientRepository.releaseReserved(request.clientId, request.amount);

    // Audit log
    await this.auditRepository.create({
      clientId: request.clientId,
      userId: null,
      actorType: 'system',
      action: 'funds_released',
      resourceType: 'client_balance',
      resourceId: request.clientId,
      description: `Released ${request.amount} for ${request.purpose}`,
      metadata: { amount: request.amount, purpose: request.purpose, reference: request.reference },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Deduct reserved funds (after withdrawal completed)
   */
  async deductReserved(request: DeductReservedRequest): Promise<void> {
    await this.clientRepository.deductReserved(request.clientId, request.amount);

    // Audit log
    await this.auditRepository.create({
      clientId: request.clientId,
      userId: null,
      actorType: 'system',
      action: 'reserved_deducted',
      resourceType: 'client_balance',
      resourceId: request.clientId,
      description: `Deducted ${request.amount} from reserved for ${request.purpose}`,
      metadata: { amount: request.amount, purpose: request.purpose, reference: request.reference },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Get client statistics
   */
  async getStats(clientId: string): Promise<GetClientStatsRow | null> {
    return await this.clientRepository.getStats(clientId);
  }

  /**
   * List all active clients
   */
  async listActiveClients() {
    return await this.clientRepository.listActive();
  }

  /**
   * Configure vault strategies (FLOW 2B)
   */
  async configureStrategies(
    productId: string,
    data: {
      chain: string;
      tokenAddress: string;
      tokenSymbol?: string;
      strategies: Array<{ category: string; target: number }>;
    }
  ) {
    // 1. Get client by product ID
    const client = await this.getClientByProductId(productId);
    if (!client) {
      throw new Error(`Client not found for product ID: ${productId}`);
    }

    // 2. Get or create vault for chain + token
    const vault = await this.getOrCreateVault({
      clientId: client.id,
      chain: data.chain,
      tokenAddress: data.tokenAddress,
      tokenSymbol: data.tokenSymbol || 'UNKNOWN',
    });

    // 3. Update vault strategies as JSONB (atomic update)
    await this.vaultRepository.updateVaultStrategies(
      vault.id,
      data.strategies.map((s) => ({
        category: s.category,
        target: s.target,
        isActive: true,
      }))
    );

    // 4. Audit log
    await this.auditRepository.create({
      clientId: client.id,
      userId: null,
      actorType: 'client',
      action: 'vault_strategies_configured',
      resourceType: 'client_vault',
      resourceId: vault.id,
      description: `Configured strategies for vault: ${data.chain}-${data.tokenAddress}`,
      metadata: { strategies: data.strategies },
      ipAddress: null,
      userAgent: null,
    });

    return vault;
  }

  /**
   * Update organization info only (company name, description, website)
   */
  async updateOrganizationInfo(
    productId: string,
    data: {
      companyName?: string;
      businessType?: string;
      description?: string | null;
      websiteUrl?: string | null;
    }
  ) {
    // 1. Get client by product ID
    const client = await this.getClientByProductId(productId);
    if (!client) {
      throw new Error(`Client not found for product ID: ${productId}`);
    }

    // 2. Update client with new organization info
    // Convert undefined to null for SQLC compatibility
    const updated = await this.clientRepository.update(client.id, {
      companyName: data.companyName ?? null,
      businessType: data.businessType ?? null,
      description: data.description ?? null,
      websiteUrl: data.websiteUrl ?? null,
      // Pass null for fields we're not updating (will use COALESCE in SQL)
      webhookUrls: null,
      webhookSecret: null,
      customStrategy: null,
      endUserYieldPortion: null,
      platformFee: null,
      performanceFee: null,
    });

    // 3. Audit log
    await this.auditRepository.create({
      clientId: client.id,
      userId: null,
      actorType: 'client',
      action: 'organization_info_updated',
      resourceType: 'client',
      resourceId: client.id,
      description: `Updated organization info for product: ${productId}`,
      metadata: data,
      ipAddress: null,
      userAgent: null,
    });

    return updated;
  }

  /**
   * Update supported currencies only
   */
  async updateSupportedCurrencies(productId: string, currencies: string[]) {
    // 1. Get client by product ID
    const client = await this.getClientByProductId(productId);
    if (!client) {
      throw new Error(`Client not found for product ID: ${productId}`);
    }

    // 2. Update supported currencies
    await this.clientRepository.updateSupportedCurrencies(client.id, currencies);

    // 3. Audit log
    await this.auditRepository.create({
      clientId: client.id,
      userId: null,
      actorType: 'client',
      action: 'supported_currencies_updated',
      resourceType: 'client',
      resourceId: client.id,
      description: `Updated supported currencies: ${currencies.join(', ')}`,
      metadata: { currencies },
      ipAddress: null,
      userAgent: null,
    });

    // 4. Return updated client
    return await this.clientRepository.getById(client.id);
  }

  /**
   * Configure bank accounts for fiat withdrawals (FLOW 3)
   * Sets up client's bank accounts for off-ramp and updates supported currencies
   */
  async configureBankAccounts(
    clientId: string,
    bankAccounts: Array<{
      currency: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      bank_details?: Record<string, any>;
    }>,
    supportedCurrencies: string[]
  ): Promise<{ bankAccounts: typeof bankAccounts; supportedCurrencies: string[] }> {
    // 1. Verify client exists
    const client = await this.clientRepository.getById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    // 2. REPLACE bank accounts (clear existing, then set new ones)
    await this.clientRepository.replaceBankAccounts(clientId, bankAccounts);

    // 3. Update supported currencies
    await this.clientRepository.updateSupportedCurrencies(clientId, supportedCurrencies);

    // 4. Audit log
    await this.auditRepository.create({
      clientId,
      userId: null,
      actorType: 'client',
      action: 'bank_accounts_configured',
      resourceType: 'client',
      resourceId: clientId,
      description: `Configured ${bankAccounts.length} bank accounts with currencies: ${supportedCurrencies.join(', ')}`,
      metadata: {
        currencies: supportedCurrencies,
        bankAccountCount: bankAccounts.length,
      },
      ipAddress: null,
      userAgent: null,
    });

    // 5. Return configured data
    return {
      bankAccounts,
      supportedCurrencies,
    };
  }
}
