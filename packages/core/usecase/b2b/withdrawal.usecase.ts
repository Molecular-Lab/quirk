/**
 * B2B Withdrawal UseCase
 * Manages withdrawal requests and processing (FLOW 8)
 *
 * ✅ SIMPLIFIED ARCHITECTURE:
 * - withdrawal_transactions: FIAT withdrawal (to bank/card) - tracked by payment gateway
 * - withdrawal_queue: CRYPTO unstaking (from DeFi protocols) - executed by DeFi layer
 * - end_user_vaults: Track total_withdrawn (NO SHARES - fiat-based tracking)
 *
 * ✅ SIMPLIFIED FLOW:
 * 1. Calculate client growth index (weighted average across all vaults)
 * 2. Calculate user current value (total_deposited × client_growth_index / entry_index)
 * 3. Validate withdrawal amount against current value
 * 4. Create withdrawal_transaction (FIAT)
 * 5. Create withdrawal_queue (CRYPTO unstaking plan)
 * 6. Update end_user_vault.total_withdrawn
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
import { ClientGrowthIndexService } from '../../service/client-growth-index.service';
import BigNumber from 'bignumber.js';

export class B2BWithdrawalUseCase {
  constructor(
    private readonly withdrawalRepository: WithdrawalRepository,
    private readonly vaultRepository: VaultRepository,
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository,
    private readonly clientGrowthIndexService: ClientGrowthIndexService
  ) {}

  /**
   * Request withdrawal (FLOW 8 - SIMPLIFIED)
   *
   * ✅ NEW FLOW:
   * 1. Calculate client growth index (weighted average across all vaults)
   * 2. Calculate user current value (total_deposited × client_growth_index / entry_index)
   * 3. Validate withdrawal amount against current value
   * 4. Create withdrawal_transaction (FIAT)
   * 5. Create withdrawal_queue (CRYPTO unstaking plan)
   * 6. Update end_user_vault.total_withdrawn
   */
  async requestWithdrawal(request: CreateWithdrawalRequest): Promise<WithdrawalResponse> {
    const { clientId, userId, amount, orderId, destinationType, destinationDetails } = request;

    // Get end_user
    const endUser = await this.userRepository.getByClientAndUserId(clientId, userId);
    if (!endUser) {
      throw new Error(`User not found: ${userId}`);
    }

    // ✅ STEP 1: Calculate client growth index (weighted average across all client vaults)
    const clientGrowthIndex = await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId);

    console.log('[Withdrawal] Client Growth Index:', {
      clientId,
      growthIndex: clientGrowthIndex,
      growthIndexDecimal: new BigNumber(clientGrowthIndex).dividedBy('1e18').toString(),
    });

    // ✅ STEP 2: Get end_user_vault (simplified - no chain/token, just clientId)
    const userVault = await this.vaultRepository.getEndUserVaultByClientForUpdate(endUser.id, clientId);
    if (!userVault) {
      throw new Error(`User has no vault for client ${clientId}`);
    }

    // ✅ STEP 3: Calculate user current value
    const currentValue = new BigNumber(
      this.vaultRepository.calculateUserCurrentValue(
        userVault.totalDeposited,
        userVault.weightedEntryIndex,
        clientGrowthIndex
      )
    );

    const withdrawalAmount = new BigNumber(amount);

    console.log('[Withdrawal] Balance Check:', {
      userId: endUser.id,
      totalDeposited: userVault.totalDeposited,
      entryIndex: userVault.weightedEntryIndex,
      entryIndexDecimal: new BigNumber(userVault.weightedEntryIndex).dividedBy('1e18').toString(),
      currentValue: currentValue.toString(),
      requestedAmount: withdrawalAmount.toString(),
    });

    // ✅ STEP 4: Validate balance
    if (withdrawalAmount.isGreaterThan(currentValue)) {
      throw new Error(
        `Insufficient balance. Requested: ${amount}, Available: ${currentValue.toString()}`
      );
    }

    // ✅ STEP 5: Create FIAT withdrawal transaction
    const withdrawal = await this.withdrawalRepository.create({
      orderId,
      clientId,
      userId: endUser.id,
      requestedAmount: amount,
      currency: 'USD',
      destinationType,
      destinationDetails: destinationDetails || null,
      status: 'pending',
    });

    if (!withdrawal) {
      throw new Error('Failed to create withdrawal');
    }

    // ✅ STEP 6: Create CRYPTO withdrawal queue (DeFi unstaking)
    await this.createWithdrawalQueue(
      clientId,
      withdrawal.id,
      userVault.id,
      amount // Withdrawal amount (fiat-based, no shares)
    );

    // ✅ STEP 7: Update end_user_vault.total_withdrawn
    await this.vaultRepository.updateVaultWithdrawal(userVault.id, withdrawalAmount.toString());

    // ✅ STEP 8: Update user timestamp
    await this.userRepository.updateWithdrawalTimestamp(endUser.id);

    // Audit
    await this.auditRepository.create({
      clientId,
      userId: endUser.id,
      actorType: 'user',
      action: 'withdrawal_request',
      resourceType: 'withdrawal_transaction',
      resourceId: withdrawal.id,
      description: `Withdrawal: ${amount} USD`,
      metadata: {
        amount,
        currentValue: currentValue.toString(),
        clientGrowthIndex,
        clientGrowthIndexDecimal: new BigNumber(clientGrowthIndex).dividedBy('1e18').toString(),
      },
      ipAddress: null,
      userAgent: null,
    });

    console.log('[Withdrawal] ✅ Withdrawal request created:', {
      orderId,
      userId: endUser.id,
      clientId,
      amount,
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
   * ✅ SIMPLIFIED: No shares tracking, just fiat amounts
   */
  private async createWithdrawalQueue(
    clientId: string,
    withdrawalTransactionId: string,
    endUserVaultId: string,
    estimatedAmount: string
  ): Promise<void> {
    // TODO: Query vault_protocol_balances to determine optimal unstaking
    await this.withdrawalRepository.createQueueItem({
      clientId,
      withdrawalTransactionId,
      endUserVaultId,
      sharesToBurn: '0', // ✅ No shares in simplified architecture
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
