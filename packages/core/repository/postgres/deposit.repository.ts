/**
 * Deposit Repository - Proxify Pattern
 * ✅ SQLC-generated queries from database/queries/deposit.sql
 */

import { Sql } from 'postgres';
import {
  // Deposit Transaction Queries
  getDeposit,
  getDepositByOrderID,
  getDepositByGatewayOrderID,
  getDepositByOrderIDForUpdate,
  listDeposits,
  listDepositsByUser,
  listDepositsByStatus,
  listPendingDeposits,
  listExpiredDeposits,
  createDeposit,
  completeDeposit,
  failDeposit,
  expireDeposit,
  updateDepositGatewayInfo,
  markDepositAsBatched,
  markDepositAsStaked,
  markDepositBatchAsStaked,
  // Deposit Queue Queries
  getDepositQueueItem,
  listPendingDepositQueue,
  listPendingDepositQueueByVault,
  createDepositQueueItem,
  // Analytics
  getDepositStats,
  // Types
  type GetDepositRow,
  type GetDepositByOrderIDRow,
  type GetDepositByGatewayOrderIDRow,
  type GetDepositByOrderIDForUpdateRow,
  type ListDepositsRow,
  type ListDepositsByUserRow,
  type ListDepositsByStatusRow,
  type ListPendingDepositsRow,
  type ListExpiredDepositsRow,
  type CreateDepositArgs,
  type CreateDepositRow,
  type GetDepositQueueItemRow,
  type ListPendingDepositQueueRow,
  type ListPendingDepositQueueByVaultRow,
  type CreateDepositQueueItemArgs,
  type CreateDepositQueueItemRow,
  type GetDepositStatsRow,
} from '@proxify/sqlcgen';

export class DepositRepository {
  constructor(private readonly sql: Sql) {}

  async getById(id: string): Promise<GetDepositRow | null> {
    return await getDeposit(this.sql, { id });
  }

  async getByOrderId(orderId: string): Promise<GetDepositByOrderIDRow | null> {
    return await getDepositByOrderID(this.sql, { orderId });
  }

  async getByGatewayOrderId(gatewayOrderId: string): Promise<GetDepositByGatewayOrderIDRow | null> {
    return await getDepositByGatewayOrderID(this.sql, { gatewayOrderId });
  }

  async getByOrderIdForUpdate(orderId: string): Promise<GetDepositByOrderIDForUpdateRow | null> {
    return await getDepositByOrderIDForUpdate(this.sql, { orderId });
  }

  async listByClient(clientId: string, limit: number = 100, offset: number = 0): Promise<ListDepositsRow[]> {
    return await listDeposits(this.sql, { clientId, limit: limit.toString(), offset: offset.toString() });
  }

  async listByUser(clientId: string, userId: string, limit: number = 100): Promise<ListDepositsByUserRow[]> {
    return await listDepositsByUser(this.sql, { clientId, userId, limit: limit.toString(), offset: "0" });
  }

  async listByStatus(clientId: string, status: string, limit: number = 100): Promise<ListDepositsByStatusRow[]> {
    return await listDepositsByStatus(this.sql, { clientId, status, limit: limit.toString(), offset: "0" });
  }

  async listPending(): Promise<ListPendingDepositsRow[]> {
    return await listPendingDeposits(this.sql);
  }

  async listExpired(limit: number = 100): Promise<ListExpiredDepositsRow[]> {
    return await listExpiredDeposits(this.sql, { limit: limit.toString() });
  }

  async create(params: CreateDepositArgs): Promise<CreateDepositRow | null> {
    return await createDeposit(this.sql, params);
  }

  async markCompleted(
    id: string,
    cryptoAmount: string,
    gatewayFee: string,
    proxifyFee: string,
    networkFee: string,
    totalFees: string
  ): Promise<void> {
    await completeDeposit(this.sql, { id, cryptoAmount, gatewayFee, proxifyFee, networkFee, totalFees });
  }

  async markFailed(id: string, errorMessage: string, errorCode?: string): Promise<void> {
    await failDeposit(this.sql, { id, errorMessage, errorCode: errorCode || null });
  }

  async markExpired(id: string): Promise<void> {
    await expireDeposit(this.sql, { id });
  }

  async updateGatewayInfo(id: string, paymentUrl: string | null, gatewayOrderId: string | null): Promise<void> {
    await updateDepositGatewayInfo(this.sql, { id, paymentUrl, gatewayOrderId });
  }

  async markAsBatched(id: string): Promise<void> {
    await markDepositAsBatched(this.sql, { id });
  }

  async markAsStaked(id: string): Promise<void> {
    await markDepositAsStaked(this.sql, { id });
  }

  async markBatchAsStaked(clientVaultId: string): Promise<void> {
    await markDepositBatchAsStaked(this.sql, { clientVaultId });
  }

  // Deposit Queue Methods
  async getQueueItem(id: string): Promise<GetDepositQueueItemRow | null> {
    return await getDepositQueueItem(this.sql, { id });
  }

  async listPendingQueue(limit: number = 100): Promise<ListPendingDepositQueueRow[]> {
    return await listPendingDepositQueue(this.sql, { limit: limit.toString() });
  }

  async listPendingQueueByVault(clientVaultId: string): Promise<ListPendingDepositQueueByVaultRow[]> {
    return await listPendingDepositQueueByVault(this.sql, { clientVaultId });
  }

  async createQueueItem(params: CreateDepositQueueItemArgs): Promise<CreateDepositQueueItemRow | null> {
    return await createDepositQueueItem(this.sql, params);
  }

  // Analytics
  async getStats(clientId: string, startDate: Date, endDate: Date): Promise<GetDepositStatsRow | null> {
    return await getDepositStats(this.sql, { clientId, startDate, endDate });
  }
}
