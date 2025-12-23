/**
 * Client Usecase - Business Logic Layer
 * 
 * Manages B2B client organizations with business rules
 * Architecture: Repository → Usecase → Service → Controller
 */

import type { Sql } from 'postgres';
import type { ClientRepository, AuditRepository } from '../repository/postgres';
import type {
  GetClientRow,
  CreateClientArgs,
  CreateClientRow,
  UpdateClientArgs,
  UpdateClientRow,
  GetClientBalanceRow,
  CreateClientBalanceArgs,
  GetClientStatsRow,
} from '@quirk/sqlcgen';

export interface ClientUsecaseDeps {
  clientRepository: ClientRepository;
  auditRepository: AuditRepository;
  sql: Sql;
}

export interface CreateClientParams extends CreateClientArgs {
  actorId: string;
}

export interface UpdateClientParams {
  id: string;
  updates: Omit<UpdateClientArgs, 'id'>;
  actorId: string;
}

export interface BalanceOperationParams {
  clientId: string;
  amount: string;
  description?: string;
  actorId: string;
  actorType: 'system' | 'admin' | 'client';
}

/**
 * Client Usecase
 */
export class ClientUsecase {
  constructor(private readonly deps: ClientUsecaseDeps) {}

  /**
   * Get client by ID with active validation
   */
  async getClientById(id: string): Promise<GetClientRow | null> {
    const client = await this.deps.clientRepository.getById(id);
    
    if (!client) {
      return null;
    }

    // Business rule: Only return active clients
    if (!client.isActive) {
      throw new Error('Client account is inactive');
    }

    return client;
  }

  /**
   * Get client by product ID (for API auth)
   */
  async getClientByProductId(productId: string): Promise<GetClientRow | null> {
    return await this.deps.clientRepository.getByProductId(productId);
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<GetClientRow | null> {
    const client = await this.deps.clientRepository.validateApiKey(apiKey);
    
    if (!client || !client.isActive) {
      return null;
    }

    return client;
  }

  /**
   * Create new client with validation
   */
  async createClient(params: CreateClientParams): Promise<CreateClientRow> {
    // Validation
    if (!params.companyName?.trim()) {
      throw new Error('Company name is required');
    }

    if (!params.productId?.trim()) {
      throw new Error('Product ID is required');
    }

    // Check if product ID exists
    const existing = await this.deps.clientRepository.getByProductId(params.productId);
    if (existing) {
      throw new Error(`Product ID '${params.productId}' is already in use`);
    }

    // Create client
    const client = await this.deps.clientRepository.create({
      companyName: params.companyName,
      productId: params.productId,
      contactEmail: params.contactEmail,
      walletAddress: params.walletAddress,
      privyOrganizationId: params.privyOrganizationId,
      riskTier: params.riskTier,
      businessType: params.businessType,
    });

    if (!client) {
      throw new Error('Failed to create client');
    }

    // Initialize balance
    await this.deps.clientRepository.createBalance({
      clientId: client.id,
      currency: 'USDC',
    });

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: 'system',
      action: 'client_created',
      resourceType: 'client',
      resourceId: client.id,
      metadata: { productId: params.productId },
      ipAddress: null,
    });

    return client;
  }

  /**
   * Update client
   */
  async updateClient(params: UpdateClientParams): Promise<UpdateClientRow> {
    const client = await this.deps.clientRepository.getById(params.id);
    if (!client) {
      throw new Error('Client not found');
    }

    const updated = await this.deps.clientRepository.update(params.id, params.updates);
    
    if (!updated) {
      throw new Error('Failed to update client');
    }

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: 'admin',
      action: 'client_updated',
      resourceType: 'client',
      resourceId: params.id,
      metadata: params.updates,
      ipAddress: null,
    });

    return updated;
  }

  /**
   * Get client balance
   */
  async getClientBalance(clientId: string): Promise<GetClientBalanceRow | null> {
    return await this.deps.clientRepository.getBalance(clientId);
  }

  /**
   * Add funds to available balance
   */
  async addFunds(params: BalanceOperationParams): Promise<void> {
    const balance = await this.deps.clientRepository.getBalance(params.clientId);

    if (!balance) {
      throw new Error('Client balance not found');
    }

    await this.deps.clientRepository.addToAvailable(params.clientId, params.amount);

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: params.actorType,
      action: 'funds_added',
      resourceType: 'client_balance',
      resourceId: params.clientId,
      metadata: { amount: params.amount, description: params.description },
      ipAddress: null,
    });
  }

  /**
   * Deduct funds from available balance
   */
  async deductFunds(params: BalanceOperationParams): Promise<void> {
    const balance = await this.deps.clientRepository.getBalance(params.clientId);

    if (!balance) {
      throw new Error('Balance not found');
    }

    // Check sufficient funds
    const available = parseFloat(balance.available);
    const amount = parseFloat(params.amount);

    if (available < amount) {
      throw new Error(`Insufficient funds. Available: ${balance.available}, Required: ${params.amount}`);
    }

    await this.deps.clientRepository.deductFromAvailable(params.clientId, params.amount);

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: params.actorType,
      action: 'funds_deducted',
      resourceType: 'client_balance',
      resourceId: params.clientId,
      metadata: { amount: params.amount, description: params.description },
      ipAddress: null,
    });
  }

  /**
   * Reserve funds for pending transaction
   */
  async reserveFunds(params: BalanceOperationParams): Promise<void> {
    const balance = await this.deps.clientRepository.getBalance(params.clientId);

    if (!balance) {
      throw new Error('Balance not found');
    }

    // Check sufficient available funds
    const available = parseFloat(balance.available);
    const amount = parseFloat(params.amount);

    if (available < amount) {
      throw new Error(`Insufficient funds. Available: ${balance.available}, Required: ${params.amount}`);
    }

    await this.deps.clientRepository.reserve(params.clientId, params.amount);

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: params.actorType,
      action: 'funds_reserved',
      resourceType: 'client_balance',
      resourceId: params.clientId,
      metadata: { amount: params.amount, description: params.description },
      ipAddress: null,
    });
  }

  /**
   * Release reserved funds
   */
  async releaseFunds(params: BalanceOperationParams): Promise<void> {
    await this.deps.clientRepository.releaseReserved(params.clientId, params.amount);

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: params.actorType,
      action: 'funds_released',
      resourceType: 'client_balance',
      resourceId: params.clientId,
      metadata: { amount: params.amount, description: params.description },
      ipAddress: null,
    });
  }

  /**
   * Deduct reserved funds
   */
  async deductReserved(params: BalanceOperationParams): Promise<void> {
    await this.deps.clientRepository.deductReserved(params.clientId, params.amount);

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: params.actorType,
      action: 'reserved_deducted',
      resourceType: 'client_balance',
      resourceId: params.clientId,
      metadata: { amount: params.amount, description: params.description },
      ipAddress: null,
    });
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<GetClientStatsRow | null> {
    return await this.deps.clientRepository.getStats(clientId);
  }

  /**
   * List all active clients
   */
  async listActiveClients() {
    return await this.deps.clientRepository.listActive();
  }

  /**
   * Activate client
   */
  async activateClient(clientId: string, actorId: string): Promise<void> {
    await this.deps.clientRepository.activate(clientId);

    await this.deps.auditRepository.create({
      actorId,
      actorType: 'admin',
      action: 'client_activated',
      resourceType: 'client',
      resourceId: clientId,
      metadata: {},
      ipAddress: null,
    });
  }

  /**
   * Deactivate client
   */
  async deactivateClient(clientId: string, actorId: string): Promise<void> {
    await this.deps.clientRepository.deactivate(clientId);

    await this.deps.auditRepository.create({
      actorId,
      actorType: 'admin',
      action: 'client_deactivated',
      resourceType: 'client',
      resourceId: clientId,
      metadata: {},
      ipAddress: null,
    });
  }
}
