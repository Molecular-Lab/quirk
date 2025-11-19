/**
 * B2B Withdrawal UseCase
 * Manages withdrawal requests and processing (FLOW 8)
 * 
 * ARCHITECTURE:
 * - withdrawal_transactions: FIAT withdrawal (to bank/card) - tracked by payment gateway
 * - withdrawal_queue: CRYPTO unstaking (from DeFi protocols) - executed by DeFi layer
 * - end_user_vaults: Shares burned when withdrawal requested
 * 
 * FLOW:
 * 1. Validate user balance (shares × index / 1e18)
 * 2. Calculate shares to burn
 * 3. Create withdrawal_transaction (FIAT)
 * 4. Create withdrawal_queue (CRYPTO unstaking plan)
 * 5. Burn shares from end_user_vault
 */

import type { WithdrawalRepository } from '../../repository/postgres/withdrawal.repository';
import type { VaultRepository } from '../../repository/postgres/vault.repository';
import type { UserRepository } from '../../repository/postgres/end_user.repository';
import type { AuditRepository } from '../../repository/postgres/audit.repository';
import type {
  CreateWithdrawalRow,
  GetWithdrawalByOrderIDRow,
  ListWithdrawalsRow,
  ListWithdrawalsByUserRow,
  GetWithdrawalStatsRow,
} from '@proxify/sqlcgen';
import type {
  CreateWithdrawalRequest,
  WithdrawalResponse,
  CompleteWithdrawalRequest,
  FailWithdrawalRequest,
  GetWithdrawalStatsRequest,
} from '../../dto/b2b';

export class B2BWithdrawalUseCase {
  constructor(
    private readonly withdrawalRepository: WithdrawalRepository,
    private readonly vaultRepository: VaultRepository,
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository
  ) {}

  /**
   * Request withdrawal (FLOW 8)
   */
  async requestWithdrawal(request: CreateWithdrawalRequest): Promise<WithdrawalResponse> {
    const { clientId, userId, chain, tokenAddress, amount, orderId, destinationType, destinationDetails } = request;

    // Get end_user
    const endUser = await this.userRepository.getByClientAndUserId(clientId, userId);
    if (!endUser) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get end_user_vault
    const userVault = await this.vaultRepository.getEndUserVaultForUpdate(endUser.id, chain, tokenAddress);
    if (!userVault) {
      throw new Error(`User has no vault for ${tokenAddress}`);
    }

    // Get client vault for current index
    const clientVault = await this.vaultRepository.getClientVault(clientId, chain, tokenAddress);
    if (!clientVault) {
      throw new Error(`Client vault not found`);
    }

    // Calculate effective balance
    const shares = BigInt(userVault.shares);
    const currentIndex = BigInt(clientVault.currentIndex);
    const effectiveBalance = (shares * currentIndex) / BigInt(1e18);
    const withdrawalAmount = BigInt(amount);

    // Validate balance
    if (withdrawalAmount > effectiveBalance) {
      throw new Error(`Insufficient balance. Requested: ${amount}, Available: ${effectiveBalance.toString()}`);
    }

    // Calculate shares to burn
    const sharesToBurn = (withdrawalAmount * shares) / effectiveBalance;

    // Create FIAT withdrawal transaction
    const withdrawal = await this.withdrawalRepository.create({
      orderId,
      clientId,
      userId,
      requestedAmount: amount,
      currency: 'USD',
      destinationType,
      destinationDetails: destinationDetails || null,
      status: 'pending',
    });

    if (!withdrawal) {
      throw new Error('Failed to create withdrawal');
    }

    // Create CRYPTO withdrawal queue (DeFi unstaking)
    await this.createWithdrawalQueue(
      clientId,
      withdrawal.id,
      userVault.id,
      sharesToBurn.toString(),
      amount
    );

    // Burn shares
    const newTotalWithdrawn = BigInt(userVault.totalWithdrawn) + withdrawalAmount;
    await this.vaultRepository.burnShares(
      userVault.id,
      sharesToBurn.toString(),
      newTotalWithdrawn.toString()
    );

    // Update user timestamp
    await this.userRepository.updateWithdrawalTimestamp(endUser.id);

    // Audit
    await this.auditRepository.create({
      clientId,
      userId,
      actorType: 'user',
      action: 'withdrawal_request',
      resourceType: 'withdrawal_transaction',
      resourceId: withdrawal.id,
      description: `Withdrawal: ${amount} USD`,
      metadata: {
        amount,
        sharesBurned: sharesToBurn.toString(),
        chain,
        tokenAddress,
      },
      ipAddress: null,
      userAgent: null,
    });

    return this.mapToResponse(withdrawal);
  }

  /**
   * Get withdrawal by order ID
   */
  async getWithdrawalByOrderId(orderId: string): Promise<WithdrawalResponse | null> {
    const withdrawal = await this.withdrawalRepository.getByOrderId(orderId);
    return withdrawal ? this.mapToResponse(withdrawal) : null;
  }

  /**
   * List withdrawals by client
   */
  async listWithdrawalsByClient(
    clientId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<WithdrawalResponse[]> {
    const withdrawals = await this.withdrawalRepository.listByClient(clientId, limit, offset);
    return withdrawals.map((w: any) => this.mapToResponse(w));
  }

  /**
   * List withdrawals by user
   */
  async listWithdrawalsByUser(
    clientId: string,
    userId: string,
    limit: number = 100
  ): Promise<WithdrawalResponse[]> {
    const withdrawals = await this.withdrawalRepository.listByUser(clientId, userId, limit);
    return withdrawals.map((w: any) => this.mapToResponse(w));
  }

  /**
   * Complete withdrawal (payment gateway callback)
   */
  async completeWithdrawal(orderId: string, actualAmount?: string): Promise<void> {
    const withdrawal = await this.withdrawalRepository.getByOrderId(orderId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found: ${orderId}`);
    }

    await this.withdrawalRepository.markCompleted(
      withdrawal.id,
      actualAmount || withdrawal.requestedAmount
    );

    await this.auditRepository.create({
      clientId: withdrawal.clientId,
      userId: withdrawal.userId,
      actorType: 'system',
      action: 'withdrawal_complete',
      resourceType: 'withdrawal_transaction',
      resourceId: withdrawal.id,
      description: 'Withdrawal completed',
      metadata: { actualAmount: actualAmount || withdrawal.requestedAmount },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Fail withdrawal
   */
  async failWithdrawal(orderId: string, errorMessage: string, errorCode?: string): Promise<void> {
    const withdrawal = await this.withdrawalRepository.getByOrderId(orderId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found: ${orderId}`);
    }

    await this.withdrawalRepository.markFailed(withdrawal.id, errorMessage, errorCode);

    await this.auditRepository.create({
      clientId: withdrawal.clientId,
      userId: withdrawal.userId,
      actorType: 'system',
      action: 'withdrawal_failed',
      resourceType: 'withdrawal_transaction',
      resourceId: withdrawal.id,
      description: `Withdrawal failed: ${errorMessage}`,
      metadata: { errorMessage, errorCode },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Get statistics
   */
  async getWithdrawalStats(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<GetWithdrawalStatsRow | null> {
    return await this.withdrawalRepository.getStats(clientId, startDate, endDate);
  }

  /**
   * Create withdrawal queue (crypto unstaking plan)
   */
  private async createWithdrawalQueue(
    clientId: string,
    withdrawalTransactionId: string,
    endUserVaultId: string,
    sharesToBurn: string,
    estimatedAmount: string
  ): Promise<void> {
    // TODO: Query vault_protocol_balances to determine optimal unstaking
    await this.withdrawalRepository.createQueueItem({
      clientId,
      withdrawalTransactionId,
      endUserVaultId,
      sharesToBurn,
      estimatedAmount,
      protocolsToUnstake: null,
      priority: 1,
      status: 'pending',
    });
  }

  /**
   * Map to response
   */
  private mapToResponse(
    withdrawal: CreateWithdrawalRow | GetWithdrawalByOrderIDRow | ListWithdrawalsRow | ListWithdrawalsByUserRow
  ): WithdrawalResponse {
    return {
      id: withdrawal.id,
      orderId: withdrawal.orderId,
      clientId: withdrawal.clientId,
      userId: withdrawal.userId,
      requestedAmount: withdrawal.requestedAmount,
      actualAmount: withdrawal.actualAmount,
      currency: withdrawal.currency,
      status: withdrawal.status,
      destinationType: withdrawal.destinationType,
      createdAt: withdrawal.createdAt,
      completedAt: withdrawal.completedAt,
    };
  }
}
