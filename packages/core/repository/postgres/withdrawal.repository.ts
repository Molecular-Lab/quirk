/**
 * Withdrawal Repository - Cleverse Pattern
 * ✅ SQLC-generated queries from database/queries/withdrawal.sql
 */

import { Sql } from 'postgres';
import {
  // Withdrawal Transaction Queries
  getWithdrawal,
  getWithdrawalByOrderID,
  getWithdrawalByGatewayOrderID,
  getWithdrawalByOrderIDForUpdate,
  listWithdrawals,
  listWithdrawalsByUser,
  listWithdrawalsByStatus,
  listQueuedWithdrawals,
  createWithdrawal,
  completeWithdrawal,
  failWithdrawal,
  updateWithdrawalStatus,
  updateWithdrawalGatewayInfo,
  markWithdrawalProcessing,
  markWithdrawalReady,
  // Withdrawal Queue Queries
  getWithdrawalQueueItem,
  getWithdrawalQueueByTransaction,
  createWithdrawalQueueItem,
  listWithdrawalQueueByVault,
  updateWithdrawalQueueStatus,
  startUnstaking,
  completeWithdrawalQueue,
  failWithdrawalQueue,
  // Analytics
  getAggregatedUnstakingPlan,
  getWithdrawalStats,
  // Types
  type GetWithdrawalRow,
  type GetWithdrawalByOrderIDRow,
  type GetWithdrawalByGatewayOrderIDRow,
  type GetWithdrawalByOrderIDForUpdateRow,
  type ListWithdrawalsRow,
  type ListWithdrawalsByUserRow,
  type ListWithdrawalsByStatusRow,
  type ListQueuedWithdrawalsRow,
  type CreateWithdrawalArgs,
  type CreateWithdrawalRow,
  type GetWithdrawalQueueItemRow,
  type GetWithdrawalQueueByTransactionRow,
  type CreateWithdrawalQueueItemArgs,
  type CreateWithdrawalQueueItemRow,
  type ListWithdrawalQueueByVaultRow,
  type GetAggregatedUnstakingPlanRow,
  type GetWithdrawalStatsRow,
} from '@proxify/sqlcgen';

export class WithdrawalRepository {
  constructor(private readonly sql: Sql) {}

  async getById(id: string): Promise<GetWithdrawalRow | null> {
    return await getWithdrawal(this.sql, { id });
  }

  async getByOrderId(orderId: string): Promise<GetWithdrawalByOrderIDRow | null> {
    return await getWithdrawalByOrderID(this.sql, { orderId });
  }

  async getByGatewayOrderId(gatewayOrderId: string): Promise<GetWithdrawalByGatewayOrderIDRow | null> {
    return await getWithdrawalByGatewayOrderID(this.sql, { gatewayOrderId });
  }

  async getByOrderIdForUpdate(orderId: string): Promise<GetWithdrawalByOrderIDForUpdateRow | null> {
    return await getWithdrawalByOrderIDForUpdate(this.sql, { orderId });
  }

  async listByClient(clientId: string, limit: number = 100, offset: number = 0): Promise<ListWithdrawalsRow[]> {
    return await listWithdrawals(this.sql, { clientId, limit: limit.toString(), offset: offset.toString() });
  }

  async listByUser(clientId: string, userId: string, limit: number = 100): Promise<ListWithdrawalsByUserRow[]> {
    return await listWithdrawalsByUser(this.sql, { clientId, userId, limit: limit.toString(), offset: "0" });
  }

  async listByStatus(clientId: string, status: string, limit: number = 100): Promise<ListWithdrawalsByStatusRow[]> {
    return await listWithdrawalsByStatus(this.sql, { clientId, status, limit: limit.toString(), offset: "0" });
  }

  async listQueued(limit: number = 100): Promise<ListQueuedWithdrawalsRow[]> {
    return await listQueuedWithdrawals(this.sql, { limit: limit.toString() });
  }

  async create(params: CreateWithdrawalArgs): Promise<CreateWithdrawalRow | null> {
    return await createWithdrawal(this.sql, params);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await updateWithdrawalStatus(this.sql, { id, status });
  }

  async updateGatewayInfo(id: string, gatewayOrderId: string | null, withdrawalFee: string | null, networkFee: string | null): Promise<void> {
    await updateWithdrawalGatewayInfo(this.sql, { id, gatewayOrderId, withdrawalFee, networkFee });
  }

  async markProcessing(id: string): Promise<void> {
    await markWithdrawalProcessing(this.sql, { id });
  }

  async markReady(id: string, actualAmount: string | null): Promise<void> {
    await markWithdrawalReady(this.sql, { id, actualAmount });
  }

  async markCompleted(id: string, actualAmount: string | null): Promise<void> {
    await completeWithdrawal(this.sql, { id, actualAmount });
  }

  async markFailed(id: string, errorMessage: string, errorCode?: string): Promise<void> {
    await failWithdrawal(this.sql, { id, errorMessage, errorCode: errorCode || null });
  }

  // Queue operations
  async getQueueItem(id: string): Promise<GetWithdrawalQueueItemRow | null> {
    return await getWithdrawalQueueItem(this.sql, { id });
  }

  async getQueueByTransaction(withdrawalTransactionId: string): Promise<GetWithdrawalQueueByTransactionRow | null> {
    return await getWithdrawalQueueByTransaction(this.sql, { withdrawalTransactionId });
  }

  async createQueueItem(params: CreateWithdrawalQueueItemArgs): Promise<CreateWithdrawalQueueItemRow | null> {
    return await createWithdrawalQueueItem(this.sql, params);
  }

  async listQueueByVault(endUserVaultId: string): Promise<ListWithdrawalQueueByVaultRow[]> {
    return await listWithdrawalQueueByVault(this.sql, { endUserVaultId });
  }

  async updateQueueStatus(id: string, status: string): Promise<void> {
    await updateWithdrawalQueueStatus(this.sql, { id, status });
  }

  async startUnstake(id: string): Promise<void> {
    await startUnstaking(this.sql, { id });
  }

  async completeQueueItem(id: string): Promise<void> {
    await completeWithdrawalQueue(this.sql, { id });
  }

  async failQueueItem(id: string, errorMessage: string): Promise<void> {
    await failWithdrawalQueue(this.sql, { id, errorMessage });
  }

  // Analytics
  async getUnstakingPlan(clientId: string): Promise<GetAggregatedUnstakingPlanRow[]> {
    return await getAggregatedUnstakingPlan(this.sql, { clientId });
  }

  async getStats(clientId: string, startDate: Date, endDate: Date): Promise<GetWithdrawalStatsRow | null> {
    return await getWithdrawalStats(this.sql, { clientId, startDate, endDate });
  }
}
