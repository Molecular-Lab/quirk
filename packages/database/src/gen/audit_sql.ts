import { Sql } from "postgres";

export const getAuditLogQuery = `-- name: GetAuditLog :one

SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE id = $1 LIMIT 1`;

export interface GetAuditLogArgs {
    id: string;
}

export interface GetAuditLogRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function getAuditLog(sql: Sql, args: GetAuditLogArgs): Promise<GetAuditLogRow | null> {
    const rows = await sql.unsafe(getAuditLogQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    };
}

export const listAuditLogsQuery = `-- name: ListAuditLogs :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
ORDER BY created_at DESC
LIMIT $1 OFFSET $2`;

export interface ListAuditLogsArgs {
    limit: string;
    offset: string;
}

export interface ListAuditLogsRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogs(sql: Sql, args: ListAuditLogsArgs): Promise<ListAuditLogsRow[]> {
    return (await sql.unsafe(listAuditLogsQuery, [args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByClientQuery = `-- name: ListAuditLogsByClient :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListAuditLogsByClientArgs {
    clientId: string | null;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByClientRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByClient(sql: Sql, args: ListAuditLogsByClientArgs): Promise<ListAuditLogsByClientRow[]> {
    return (await sql.unsafe(listAuditLogsByClientQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByUserQuery = `-- name: ListAuditLogsByUser :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListAuditLogsByUserArgs {
    userId: string | null;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByUserRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByUser(sql: Sql, args: ListAuditLogsByUserArgs): Promise<ListAuditLogsByUserRow[]> {
    return (await sql.unsafe(listAuditLogsByUserQuery, [args.userId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByActionQuery = `-- name: ListAuditLogsByAction :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE action = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListAuditLogsByActionArgs {
    action: string;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByActionRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByAction(sql: Sql, args: ListAuditLogsByActionArgs): Promise<ListAuditLogsByActionRow[]> {
    return (await sql.unsafe(listAuditLogsByActionQuery, [args.action, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByResourceQuery = `-- name: ListAuditLogsByResource :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE resource_type = $1
  AND resource_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListAuditLogsByResourceArgs {
    resourceType: string | null;
    resourceId: string | null;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByResourceRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByResource(sql: Sql, args: ListAuditLogsByResourceArgs): Promise<ListAuditLogsByResourceRow[]> {
    return (await sql.unsafe(listAuditLogsByResourceQuery, [args.resourceType, args.resourceId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByClientAndActionQuery = `-- name: ListAuditLogsByClientAndAction :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE client_id = $1
  AND action = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListAuditLogsByClientAndActionArgs {
    clientId: string | null;
    action: string;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByClientAndActionRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByClientAndAction(sql: Sql, args: ListAuditLogsByClientAndActionArgs): Promise<ListAuditLogsByClientAndActionRow[]> {
    return (await sql.unsafe(listAuditLogsByClientAndActionQuery, [args.clientId, args.action, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByDateRangeQuery = `-- name: ListAuditLogsByDateRange :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE created_at >= $1
  AND created_at <= $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListAuditLogsByDateRangeArgs {
    createdAt: Date;
    createdAt: Date;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByDateRangeRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByDateRange(sql: Sql, args: ListAuditLogsByDateRangeArgs): Promise<ListAuditLogsByDateRangeRow[]> {
    return (await sql.unsafe(listAuditLogsByDateRangeQuery, [args.createdAt, args.createdAt, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const listAuditLogsByClientAndDateRangeQuery = `-- name: ListAuditLogsByClientAndDateRange :many
SELECT id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at FROM audit_logs
WHERE client_id = $1
  AND created_at >= $2
  AND created_at <= $3
ORDER BY created_at DESC
LIMIT $4 OFFSET $5`;

export interface ListAuditLogsByClientAndDateRangeArgs {
    clientId: string | null;
    createdAt: Date;
    createdAt: Date;
    limit: string;
    offset: string;
}

export interface ListAuditLogsByClientAndDateRangeRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function listAuditLogsByClientAndDateRange(sql: Sql, args: ListAuditLogsByClientAndDateRangeArgs): Promise<ListAuditLogsByClientAndDateRangeRow[]> {
    return (await sql.unsafe(listAuditLogsByClientAndDateRangeQuery, [args.clientId, args.createdAt, args.createdAt, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    }));
}

export const createAuditLogQuery = `-- name: CreateAuditLog :one
INSERT INTO audit_logs (
  client_id,
  user_id,
  actor_type,
  action,
  resource_type,
  resource_id,
  description,
  metadata,
  ip_address,
  user_agent
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING id, client_id, user_id, actor_type, action, resource_type, resource_id, description, metadata, ip_address, user_agent, created_at`;

export interface CreateAuditLogArgs {
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
}

export interface CreateAuditLogRow {
    id: string;
    clientId: string | null;
    userId: string | null;
    actorType: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    description: string | null;
    metadata: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export async function createAuditLog(sql: Sql, args: CreateAuditLogArgs): Promise<CreateAuditLogRow | null> {
    const rows = await sql.unsafe(createAuditLogQuery, [args.clientId, args.userId, args.actorType, args.action, args.resourceType, args.resourceId, args.description, args.metadata, args.ipAddress, args.userAgent]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        actorType: row[3],
        action: row[4],
        resourceType: row[5],
        resourceId: row[6],
        description: row[7],
        metadata: row[8],
        ipAddress: row[9],
        userAgent: row[10],
        createdAt: row[11]
    };
}

export const deleteOldAuditLogsQuery = `-- name: DeleteOldAuditLogs :exec
DELETE FROM audit_logs
WHERE created_at < $1`;

export interface DeleteOldAuditLogsArgs {
    createdAt: Date;
}

export async function deleteOldAuditLogs(sql: Sql, args: DeleteOldAuditLogsArgs): Promise<void> {
    await sql.unsafe(deleteOldAuditLogsQuery, [args.createdAt]);
}

export const getActionFrequencyQuery = `-- name: GetActionFrequency :many

SELECT
  action,
  COUNT(*) AS count,
  MIN(created_at) AS first_occurrence,
  MAX(created_at) AS last_occurrence
FROM audit_logs
WHERE client_id = $1
  AND created_at >= $2
  AND created_at <= $3
GROUP BY action
ORDER BY count DESC`;

export interface GetActionFrequencyArgs {
    clientId: string | null;
    createdAt: Date;
    createdAt: Date;
}

export interface GetActionFrequencyRow {
    action: string;
    count: string;
    firstOccurrence: string;
    lastOccurrence: string;
}

export async function getActionFrequency(sql: Sql, args: GetActionFrequencyArgs): Promise<GetActionFrequencyRow[]> {
    return (await sql.unsafe(getActionFrequencyQuery, [args.clientId, args.createdAt, args.createdAt]).values()).map(row => ({
        action: row[0],
        count: row[1],
        firstOccurrence: row[2],
        lastOccurrence: row[3]
    }));
}

export const getUserActivityQuery = `-- name: GetUserActivity :many
SELECT
  user_id,
  actor_type,
  COUNT(*) AS total_actions,
  COUNT(DISTINCT action) AS distinct_actions,
  MIN(created_at) AS first_activity,
  MAX(created_at) AS last_activity
FROM audit_logs
WHERE client_id = $1
  AND created_at >= $2
  AND created_at <= $3
  AND user_id IS NOT NULL
GROUP BY user_id, actor_type
ORDER BY total_actions DESC
LIMIT $4`;

export interface GetUserActivityArgs {
    clientId: string | null;
    createdAt: Date;
    createdAt: Date;
    limit: string;
}

export interface GetUserActivityRow {
    userId: string | null;
    actorType: string;
    totalActions: string;
    distinctActions: string;
    firstActivity: string;
    lastActivity: string;
}

export async function getUserActivity(sql: Sql, args: GetUserActivityArgs): Promise<GetUserActivityRow[]> {
    return (await sql.unsafe(getUserActivityQuery, [args.clientId, args.createdAt, args.createdAt, args.limit]).values()).map(row => ({
        userId: row[0],
        actorType: row[1],
        totalActions: row[2],
        distinctActions: row[3],
        firstActivity: row[4],
        lastActivity: row[5]
    }));
}

export const getResourceActivityQuery = `-- name: GetResourceActivity :many
SELECT
  action,
  actor_type,
  user_id,
  description,
  metadata,
  created_at
FROM audit_logs
WHERE resource_type = $1
  AND resource_id = $2
ORDER BY created_at DESC
LIMIT $3`;

export interface GetResourceActivityArgs {
    resourceType: string | null;
    resourceId: string | null;
    limit: string;
}

export interface GetResourceActivityRow {
    action: string;
    actorType: string;
    userId: string | null;
    description: string | null;
    metadata: any | null;
    createdAt: Date;
}

export async function getResourceActivity(sql: Sql, args: GetResourceActivityArgs): Promise<GetResourceActivityRow[]> {
    return (await sql.unsafe(getResourceActivityQuery, [args.resourceType, args.resourceId, args.limit]).values()).map(row => ({
        action: row[0],
        actorType: row[1],
        userId: row[2],
        description: row[3],
        metadata: row[4],
        createdAt: row[5]
    }));
}

