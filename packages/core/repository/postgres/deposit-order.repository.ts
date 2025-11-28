/**
 * Deposit Order Repository - For Operations Dashboard
 * ✅ SQLC-generated queries from database/queries/deposit_orders.sql
 */

import { Sql } from 'postgres';
import {
  getDepositOrder,
  getDepositOrderByOrderId,
  listDepositOrdersByClient,
  listDepositOrdersByUser,
  listPendingDepositOrders,
  listPendingDepositOrdersByClient,
  createDepositOrder,
  updateDepositOrderStatus,
  completeDepositOrder,
  failDepositOrder,
  getDepositOrderStats,
  type GetDepositOrderRow,
  type GetDepositOrderByOrderIdRow,
  type ListDepositOrdersByClientRow,
  type ListDepositOrdersByUserRow,
  type ListPendingDepositOrdersRow,
  type ListPendingDepositOrdersByClientRow,
  type CreateDepositOrderArgs,
  type CreateDepositOrderRow,
  type GetDepositOrderStatsRow,
} from '@proxify/sqlcgen';

export class DepositOrderRepository {
  constructor(private readonly sql: Sql) {}

  async getById(id: string): Promise<GetDepositOrderRow | null> {
    return await getDepositOrder(this.sql, { id });
  }

  async getByOrderId(orderId: string): Promise<GetDepositOrderByOrderIdRow | null> {
    return await getDepositOrderByOrderId(this.sql, { orderId });
  }

  async listByClient(clientId: string, limit: number = 100, offset: number = 0): Promise<ListDepositOrdersByClientRow[]> {
    return await listDepositOrdersByClient(this.sql, { clientId, limit: limit.toString(), offset: offset.toString() });
  }

  async listByUser(userId: string, limit: number = 100, offset: number = 0): Promise<ListDepositOrdersByUserRow[]> {
    return await listDepositOrdersByUser(this.sql, { userId, limit: limit.toString(), offset: offset.toString() });
  }

  async listAllPending(): Promise<ListPendingDepositOrdersRow[]> {
    return await listPendingDepositOrders(this.sql);
  }

  async listPendingByClient(clientId: string): Promise<ListPendingDepositOrdersByClientRow[]> {
    return await listPendingDepositOrdersByClient(this.sql, { clientId });
  }

  async create(params: CreateDepositOrderArgs): Promise<CreateDepositOrderRow | null> {
    return await createDepositOrder(this.sql, params);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await updateDepositOrderStatus(this.sql, { id, status });
  }

  async markCompleted(id: string, cryptoAmount: string, transactionHash: string): Promise<void> {
    await completeDepositOrder(this.sql, { id, cryptoAmount, transactionHash });
  }

  async markFailed(id: string): Promise<void> {
    await failDepositOrder(this.sql, { id });
  }

  async getStats(startDate: Date, endDate: Date): Promise<GetDepositOrderStatsRow | null> {
    return await getDepositOrderStats(this.sql, { startDate, endDate });
  }
}
