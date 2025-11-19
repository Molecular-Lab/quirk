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
} from '@proxify/sqlcgen';
import type {
  CreateClientRequest,
  AddFundsRequest,
  ReserveFundsRequest,
  ReleaseFundsRequest,
  DeductReservedRequest,
} from '../../dto/b2b';
import { AuditRepository, ClientRepository } from '../../repository';

/**
 * B2B Client UseCase
 * Manages client organizations and balances
 */
export class B2BClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly auditRepository: AuditRepository
  ) {}

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
   * Create new client
   */
  async createClient(request: CreateClientRequest): Promise<CreateClientRow> {
    // Check if product ID already exists
    
    console.log("Creating client with product ID:", request);
    const existing = await this.clientRepository.getByProductId(request.productId);
    if (existing) {
      throw new Error(`Product ID '${request.productId}' already exists`);
    }

    // Create client args
    const args: CreateClientArgs = {
      productId: request.productId,
      companyName: request.companyName,
      businessType: request.businessType,
      description: request.description || null,
      websiteUrl: request.websiteUrl || null,
      walletType: request.walletType,
      walletManagedBy: request.walletManagedBy,
      privyOrganizationId: request.privyOrganizationId,
      privyWalletAddress: request.privyWalletAddress,
      apiKeyHash: request.apiKeyHash,
      apiKeyPrefix: request.apiKeyPrefix,
      webhookUrls: request.webhookUrls || null,
      webhookSecret: request.webhookSecret || null,
      customStrategy: request.customStrategy || null,
      endUserYieldPortion: request.endUserYieldPortion || null,
      platformFee: request.platformFee || null,
      performanceFee: request.performanceFee || null,
      isActive: request.isActive ?? true,
      isSandbox: request.isSandbox ?? false,
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
      metadata: { productId: request.productId },
      ipAddress: null,
      userAgent: null,
    });

    return client;
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
}
