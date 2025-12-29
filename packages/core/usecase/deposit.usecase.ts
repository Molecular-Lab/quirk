/**
 * Deposit Usecase - Business Logic Layer
 * 
 * Orchestrates deposit flow:
 * 1. Validate client/user
 * 2. Create deposit transaction
 * 3. Update vault on completion
 * 4. Audit trail
 */

import type { Sql } from 'postgres';
import type {
  ClientRepository,
  DepositRepository,
  VaultRepository,
  UserRepository,
  AuditRepository,
} from '../repository/postgres';
import type {
  CreateDepositArgs,
  CreateDepositRow,
  GetDepositRow,
  ListDepositsRow,
} from '@quirk/sqlcgen';

export interface DepositUsecaseDeps {
  depositRepository: DepositRepository;
  clientRepository: ClientRepository;
  vaultRepository: VaultRepository;
  userRepository: UserRepository;
  auditRepository: AuditRepository;
  sql: Sql;
}

export interface CreateDepositParams {
  clientId: string;
  endUserId: string;
  currency: string;
  amount: string;
  depositType: 'internal' | 'external';
  gatewayProvider?: string;
  gatewayTransactionId?: string;
  sourceAddress?: string;
  actorId: string;
}

export interface CompleteDepositParams {
  orderId: string;
  txHash?: string;
  completedAt?: Date;
  actorId: string;
}

/**
 * Deposit Usecase
 */
export class DepositUsecase {
  constructor(private readonly deps: DepositUsecaseDeps) {}

  /**
   * Create deposit transaction
   */
  async createDeposit(params: CreateDepositParams): Promise<CreateDepositRow> {
    // Validate client
    const client = await this.deps.clientRepository.getById(params.clientId);
    if (!client || !client.isActive) {
      throw new Error('Invalid or inactive client');
    }

    // Get or create end user
    const user = await this.deps.userRepository.getOrCreate({
      clientId: params.clientId,
      userId: params.endUserId,
      walletAddress: params.sourceAddress,
    });

    // Get or create vault
    const vault = await this.deps.vaultRepository.getClientVault(params.clientId, params.currency);
    if (!vault) {
      // Create vault if doesn't exist
      await this.deps.vaultRepository.createClientVault({
        clientId: params.clientId,
        currency: params.currency,
        currentIndex: '1000000000000000000', // 1.0 in 18 decimals
        lastIndexUpdate: new Date(),
      });
    }

    // Create deposit
    const deposit = await this.deps.depositRepository.create({
      clientId: params.clientId,
      endUserId: user.id,
      currency: params.currency,
      amount: params.amount,
      depositType: params.depositType,
      gatewayProvider: params.gatewayProvider,
      gatewayTransactionId: params.gatewayTransactionId,
      sourceAddress: params.sourceAddress,
    });

    if (!deposit) {
      throw new Error('Failed to create deposit');
    }

    // Add to vault pending
    await this.deps.vaultRepository.addPendingDeposit(
      params.clientId,
      params.currency,
      params.amount
    );

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: 'client',
      action: 'deposit_created',
      resourceType: 'deposit',
      resourceId: deposit.id,
      metadata: {
        amount: params.amount,
        currency: params.currency,
        depositType: params.depositType,
      },
      ipAddress: null,
    });

    return deposit;
  }

  /**
   * Complete deposit and calculate shares
   */
  async completeDeposit(params: CompleteDepositParams): Promise<void> {
    // Get deposit
    const deposit = await this.deps.depositRepository.getByOrderId(params.orderId);
    if (!deposit) {
      throw new Error('Deposit not found');
    }

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit is ${deposit.status}, cannot complete`);
    }

    // Get vault for share calculation
    const vault = await this.deps.vaultRepository.getClientVault(
      deposit.clientId,
      deposit.currency
    );

    if (!vault) {
      throw new Error('Vault not found');
    }

    // Calculate shares using current index
    const shares = this.deps.vaultRepository.calculateSharesForDeposit(
      deposit.amount,
      vault.currentIndex
    );

    // Complete deposit
    await this.deps.depositRepository.complete(
      params.orderId,
      params.txHash,
      params.completedAt
    );

    // Move from pending to staked
    await this.deps.vaultRepository.movePendingToStaked(
      deposit.clientId,
      deposit.currency,
      deposit.amount
    );

    // Add shares to user vault
    await this.deps.vaultRepository.addShares(
      deposit.clientId,
      deposit.endUserId,
      deposit.currency,
      shares
    );

    // Update user last deposit time
    await this.deps.userRepository.updateLastDepositAt(deposit.endUserId, new Date());

    // Audit log
    await this.deps.auditRepository.create({
      actorId: params.actorId,
      actorType: 'system',
      action: 'deposit_completed',
      resourceType: 'deposit',
      resourceId: deposit.id,
      metadata: {
        amount: deposit.amount,
        shares: shares,
        txHash: params.txHash,
      },
      ipAddress: null,
    });
  }

  /**
   * Update transaction hash (after blockchain mint)
   */
  async updateTransactionHash(orderId: string, transactionHash: string): Promise<void> {
    await this.deps.depositRepository.updateTransactionHash(orderId, transactionHash);
  }

  /**
   * Fail deposit
   */
  async failDeposit(orderId: string, reason: string, actorId: string): Promise<void> {
    const deposit = await this.deps.depositRepository.getByOrderId(orderId);
    if (!deposit) {
      throw new Error('Deposit not found');
    }

    await this.deps.depositRepository.fail(orderId, reason);

    // Remove from pending
    await this.deps.vaultRepository.reducePendingDeposit(
      deposit.clientId,
      deposit.currency,
      deposit.amount
    );

    // Audit log
    await this.deps.auditRepository.create({
      actorId,
      actorType: 'system',
      action: 'deposit_failed',
      resourceType: 'deposit',
      resourceId: deposit.id,
      metadata: { reason },
      ipAddress: null,
    });
  }

  /**
   * Get deposit by order ID
   */
  async getDepositByOrderId(orderId: string): Promise<GetDepositRow | null> {
    return await this.deps.depositRepository.getByOrderId(orderId);
  }

  /**
   * List deposits by client
   */
  async listDepositsByClient(
    clientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ListDepositsRow[]> {
    return await this.deps.depositRepository.list(limit, offset);
  }

  /**
   * List deposits by user
   */
  async listDepositsByUser(userId: string, limit: number = 50, offset: number = 0) {
    return await this.deps.depositRepository.listByUser(userId, limit, offset);
  }

  /**
   * List deposits by status
   */
  async listDepositsByStatus(
    status: 'pending' | 'completed' | 'failed' | 'expired',
    limit: number = 50,
    offset: number = 0
  ) {
    return await this.deps.depositRepository.listByStatus(status, limit, offset);
  }
}
