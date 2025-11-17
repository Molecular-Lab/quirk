/**
 * Audit Repository - Cleverse Pattern
 * ✅ SQLC-generated queries from database/queries/audit.sql
 */

import { Sql } from 'postgres';
import {
  // Audit Log Queries
  getAuditLog,
  listAuditLogs,
  listAuditLogsByClient,
  listAuditLogsByUser,
  listAuditLogsByAction,
  listAuditLogsByResource,
  listAuditLogsByClientAndAction,
  listAuditLogsByDateRange,
  listAuditLogsByClientAndDateRange,
  createAuditLog,
  deleteOldAuditLogs,
  // Analytics
  getActionFrequency,
  getUserActivity,
  getResourceActivity,
  // Types
  type GetAuditLogRow,
  type ListAuditLogsRow,
  type ListAuditLogsByClientRow,
  type ListAuditLogsByUserRow,
  type ListAuditLogsByActionRow,
  type ListAuditLogsByResourceRow,
  type ListAuditLogsByClientAndActionRow,
  type ListAuditLogsByDateRangeRow,
  type ListAuditLogsByClientAndDateRangeRow,
  type CreateAuditLogArgs,
  type CreateAuditLogRow,
  type GetActionFrequencyRow,
  type GetUserActivityRow,
  type GetResourceActivityRow,
} from '@proxify/sqlcgen';

export class AuditRepository {
  constructor(private readonly sql: Sql) {}

  async getById(id: string): Promise<GetAuditLogRow | null> {
    return await getAuditLog(this.sql, { id });
  }

  async list(limit: number = 100, offset: number = 0): Promise<ListAuditLogsRow[]> {
    return await listAuditLogs(this.sql, { limit: limit.toString(), offset: offset.toString() });
  }

  async listByClient(clientId: string, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByClientRow[]> {
    return await listAuditLogsByClient(this.sql, { clientId, limit: limit.toString(), offset: offset.toString() });
  }

  async listByUser(userId: string, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByUserRow[]> {
    return await listAuditLogsByUser(this.sql, { userId, limit: limit.toString(), offset: offset.toString() });
  }

  async listByAction(action: string, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByActionRow[]> {
    return await listAuditLogsByAction(this.sql, { action, limit: limit.toString(), offset: offset.toString() });
  }

  async listByResource(resourceType: string, resourceId: string, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByResourceRow[]> {
    return await listAuditLogsByResource(this.sql, { resourceType, resourceId, limit: limit.toString(), offset: offset.toString() });
  }

  async listByClientAndAction(clientId: string, action: string, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByClientAndActionRow[]> {
    return await listAuditLogsByClientAndAction(this.sql, { clientId, action, limit: limit.toString(), offset: offset.toString() });
  }

  async listByDateRange(startDate: Date, endDate: Date, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByDateRangeRow[]> {
    return await listAuditLogsByDateRange(this.sql, { startDate, endDate, limit: limit.toString(), offset: offset.toString() });
  }

  async listByClientAndDateRange(clientId: string, startDate: Date, endDate: Date, limit: number = 100, offset: number = 0): Promise<ListAuditLogsByClientAndDateRangeRow[]> {
    return await listAuditLogsByClientAndDateRange(this.sql, { clientId, startDate, endDate, limit: limit.toString(), offset: offset.toString() });
  }

  async create(params: CreateAuditLogArgs): Promise<CreateAuditLogRow | null> {
    return await createAuditLog(this.sql, params);
  }

  async deleteOld(beforeDate: Date): Promise<void> {
    await deleteOldAuditLogs(this.sql, { createdAt: beforeDate });
  }

  // Convenience methods - must provide all required SQLC fields
  async logDeposit(
    clientId: string,
    userId: string,
    resourceId: string,
    metadata: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CreateAuditLogRow | null> {
    return await this.create({
      clientId,
      userId,
      actorType: 'user',
      action: 'deposit',
      resourceType: 'deposit_transaction',
      resourceId,
      description: 'User deposit transaction',
      metadata,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }

  async logWithdrawal(
    clientId: string,
    userId: string,
    resourceId: string,
    metadata: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CreateAuditLogRow | null> {
    return await this.create({
      clientId,
      userId,
      actorType: 'user',
      action: 'withdrawal',
      resourceType: 'withdrawal_transaction',
      resourceId,
      description: 'User withdrawal transaction',
      metadata,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }

  async logClientAction(
    clientId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    description?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CreateAuditLogRow | null> {
    return await this.create({
      clientId,
      userId: null,
      actorType: 'system',
      action,
      resourceType,
      resourceId,
      description: description || null,
      metadata: metadata || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }

  // Analytics
  async getActionFrequencyStats(clientId: string, startDate: Date, endDate: Date): Promise<GetActionFrequencyRow[]> {
    return await getActionFrequency(this.sql, { clientId, startDate, endDate });
  }

  async getUserActivityStats(clientId: string, startDate: Date, endDate: Date, limit: number = 100): Promise<GetUserActivityRow[]> {
    return await getUserActivity(this.sql, { clientId, startDate, endDate, limit: limit.toString() });
  }

  async getResourceActivityStats(resourceType: string, resourceId: string, limit: number = 100): Promise<GetResourceActivityRow[]> {
    return await getResourceActivity(this.sql, { resourceType, resourceId, limit: limit.toString() });
  }
}
