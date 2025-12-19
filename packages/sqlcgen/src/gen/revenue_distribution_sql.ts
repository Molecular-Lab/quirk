import { Sql } from "postgres";

export const createRevenueDistributionQuery = `-- name: CreateRevenueDistribution :one

INSERT INTO revenue_distributions (
  withdrawal_transaction_id,
  vault_id,
  raw_yield,
  enduser_revenue,
  client_revenue,
  platform_revenue,
  client_revenue_percent,
  platform_fee_percent,
  is_deducted
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING id, withdrawal_transaction_id, vault_id, raw_yield, enduser_revenue, client_revenue, platform_revenue, client_revenue_percent, platform_fee_percent, is_deducted, distributed_at`;

export interface CreateRevenueDistributionArgs {
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
}

export interface CreateRevenueDistributionRow {
    id: string;
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
    distributedAt: Date;
}

export async function createRevenueDistribution(sql: Sql, args: CreateRevenueDistributionArgs): Promise<CreateRevenueDistributionRow | null> {
    const rows = await sql.unsafe(createRevenueDistributionQuery, [args.withdrawalTransactionId, args.vaultId, args.rawYield, args.enduserRevenue, args.clientRevenue, args.platformRevenue, args.clientRevenuePercent, args.platformFeePercent, args.isDeducted]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        withdrawalTransactionId: row[1],
        vaultId: row[2],
        rawYield: row[3],
        enduserRevenue: row[4],
        clientRevenue: row[5],
        platformRevenue: row[6],
        clientRevenuePercent: row[7],
        platformFeePercent: row[8],
        isDeducted: row[9],
        distributedAt: row[10]
    };
}

export const getRevenueDistributionByIdQuery = `-- name: GetRevenueDistributionById :one
SELECT id, withdrawal_transaction_id, vault_id, raw_yield, enduser_revenue, client_revenue, platform_revenue, client_revenue_percent, platform_fee_percent, is_deducted, distributed_at FROM revenue_distributions
WHERE id = $1
LIMIT 1`;

export interface GetRevenueDistributionByIdArgs {
    id: string;
}

export interface GetRevenueDistributionByIdRow {
    id: string;
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
    distributedAt: Date;
}

export async function getRevenueDistributionById(sql: Sql, args: GetRevenueDistributionByIdArgs): Promise<GetRevenueDistributionByIdRow | null> {
    const rows = await sql.unsafe(getRevenueDistributionByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        withdrawalTransactionId: row[1],
        vaultId: row[2],
        rawYield: row[3],
        enduserRevenue: row[4],
        clientRevenue: row[5],
        platformRevenue: row[6],
        clientRevenuePercent: row[7],
        platformFeePercent: row[8],
        isDeducted: row[9],
        distributedAt: row[10]
    };
}

export const getRevenueDistributionByWithdrawalQuery = `-- name: GetRevenueDistributionByWithdrawal :one
SELECT id, withdrawal_transaction_id, vault_id, raw_yield, enduser_revenue, client_revenue, platform_revenue, client_revenue_percent, platform_fee_percent, is_deducted, distributed_at FROM revenue_distributions
WHERE withdrawal_transaction_id = $1
LIMIT 1`;

export interface GetRevenueDistributionByWithdrawalArgs {
    withdrawalTransactionId: string | null;
}

export interface GetRevenueDistributionByWithdrawalRow {
    id: string;
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
    distributedAt: Date;
}

export async function getRevenueDistributionByWithdrawal(sql: Sql, args: GetRevenueDistributionByWithdrawalArgs): Promise<GetRevenueDistributionByWithdrawalRow | null> {
    const rows = await sql.unsafe(getRevenueDistributionByWithdrawalQuery, [args.withdrawalTransactionId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        withdrawalTransactionId: row[1],
        vaultId: row[2],
        rawYield: row[3],
        enduserRevenue: row[4],
        clientRevenue: row[5],
        platformRevenue: row[6],
        clientRevenuePercent: row[7],
        platformFeePercent: row[8],
        isDeducted: row[9],
        distributedAt: row[10]
    };
}

export const listRevenueDistributionsByVaultQuery = `-- name: ListRevenueDistributionsByVault :many
SELECT id, withdrawal_transaction_id, vault_id, raw_yield, enduser_revenue, client_revenue, platform_revenue, client_revenue_percent, platform_fee_percent, is_deducted, distributed_at FROM revenue_distributions
WHERE vault_id = $1
ORDER BY distributed_at DESC
LIMIT $2 OFFSET $3`;

export interface ListRevenueDistributionsByVaultArgs {
    vaultId: string;
    limit: string;
    offset: string;
}

export interface ListRevenueDistributionsByVaultRow {
    id: string;
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
    distributedAt: Date;
}

export async function listRevenueDistributionsByVault(sql: Sql, args: ListRevenueDistributionsByVaultArgs): Promise<ListRevenueDistributionsByVaultRow[]> {
    return (await sql.unsafe(listRevenueDistributionsByVaultQuery, [args.vaultId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        withdrawalTransactionId: row[1],
        vaultId: row[2],
        rawYield: row[3],
        enduserRevenue: row[4],
        clientRevenue: row[5],
        platformRevenue: row[6],
        clientRevenuePercent: row[7],
        platformFeePercent: row[8],
        isDeducted: row[9],
        distributedAt: row[10]
    }));
}

export const listDeferredFeesQuery = `-- name: ListDeferredFees :many
SELECT id, withdrawal_transaction_id, vault_id, raw_yield, enduser_revenue, client_revenue, platform_revenue, client_revenue_percent, platform_fee_percent, is_deducted, distributed_at FROM revenue_distributions
WHERE is_deducted = false
ORDER BY distributed_at ASC
LIMIT $1 OFFSET $2`;

export interface ListDeferredFeesArgs {
    limit: string;
    offset: string;
}

export interface ListDeferredFeesRow {
    id: string;
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
    distributedAt: Date;
}

export async function listDeferredFees(sql: Sql, args: ListDeferredFeesArgs): Promise<ListDeferredFeesRow[]> {
    return (await sql.unsafe(listDeferredFeesQuery, [args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        withdrawalTransactionId: row[1],
        vaultId: row[2],
        rawYield: row[3],
        enduserRevenue: row[4],
        clientRevenue: row[5],
        platformRevenue: row[6],
        clientRevenuePercent: row[7],
        platformFeePercent: row[8],
        isDeducted: row[9],
        distributedAt: row[10]
    }));
}

export const listDeferredFeesByClientQuery = `-- name: ListDeferredFeesByClient :many
SELECT rd.id, rd.withdrawal_transaction_id, rd.vault_id, rd.raw_yield, rd.enduser_revenue, rd.client_revenue, rd.platform_revenue, rd.client_revenue_percent, rd.platform_fee_percent, rd.is_deducted, rd.distributed_at
FROM revenue_distributions rd
JOIN client_vaults cv ON rd.vault_id = cv.id
WHERE cv.client_id = $1
  AND rd.is_deducted = false
ORDER BY rd.distributed_at ASC`;

export interface ListDeferredFeesByClientArgs {
    clientId: string;
}

export interface ListDeferredFeesByClientRow {
    id: string;
    withdrawalTransactionId: string | null;
    vaultId: string;
    rawYield: string;
    enduserRevenue: string;
    clientRevenue: string;
    platformRevenue: string;
    clientRevenuePercent: string;
    platformFeePercent: string;
    isDeducted: boolean;
    distributedAt: Date;
}

export async function listDeferredFeesByClient(sql: Sql, args: ListDeferredFeesByClientArgs): Promise<ListDeferredFeesByClientRow[]> {
    return (await sql.unsafe(listDeferredFeesByClientQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        withdrawalTransactionId: row[1],
        vaultId: row[2],
        rawYield: row[3],
        enduserRevenue: row[4],
        clientRevenue: row[5],
        platformRevenue: row[6],
        clientRevenuePercent: row[7],
        platformFeePercent: row[8],
        isDeducted: row[9],
        distributedAt: row[10]
    }));
}

export const markFeesAsDeductedQuery = `-- name: MarkFeesAsDeducted :exec
UPDATE revenue_distributions
SET is_deducted = true
WHERE id = $1`;

export interface MarkFeesAsDeductedArgs {
    id: string;
}

export async function markFeesAsDeducted(sql: Sql, args: MarkFeesAsDeductedArgs): Promise<void> {
    await sql.unsafe(markFeesAsDeductedQuery, [args.id]);
}

export const getClientRevenueStatsQuery = `-- name: GetClientRevenueStats :one
SELECT
  COUNT(*) as total_distributions,
  COALESCE(SUM(client_revenue), 0) as total_client_revenue,
  COALESCE(SUM(platform_revenue), 0) as total_platform_revenue,
  COALESCE(SUM(enduser_revenue), 0) as total_enduser_revenue,
  COALESCE(SUM(raw_yield), 0) as total_raw_yield
FROM revenue_distributions rd
JOIN client_vaults cv ON rd.vault_id = cv.id
WHERE cv.client_id = $1
  AND rd.distributed_at >= $2
  AND rd.distributed_at <= $3`;

export interface GetClientRevenueStatsArgs {
    clientId: string;
    startDate: Date;
    endDate: Date;
}

export interface GetClientRevenueStatsRow {
    totalDistributions: string;
    totalClientRevenue: string | null;
    totalPlatformRevenue: string | null;
    totalEnduserRevenue: string | null;
    totalRawYield: string | null;
}

export async function getClientRevenueStats(sql: Sql, args: GetClientRevenueStatsArgs): Promise<GetClientRevenueStatsRow | null> {
    const rows = await sql.unsafe(getClientRevenueStatsQuery, [args.clientId, args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalDistributions: row[0],
        totalClientRevenue: row[1],
        totalPlatformRevenue: row[2],
        totalEnduserRevenue: row[3],
        totalRawYield: row[4]
    };
}

export const getPlatformRevenueStatsQuery = `-- name: GetPlatformRevenueStats :one
SELECT
  COUNT(*) as total_distributions,
  COALESCE(SUM(platform_revenue), 0) as total_platform_revenue,
  COALESCE(SUM(client_revenue), 0) as total_client_revenue,
  COALESCE(SUM(enduser_revenue), 0) as total_enduser_revenue,
  COALESCE(SUM(raw_yield), 0) as total_raw_yield,
  COUNT(*) FILTER (WHERE is_deducted = true) as deducted_count,
  COUNT(*) FILTER (WHERE is_deducted = false) as deferred_count
FROM revenue_distributions
WHERE distributed_at >= $1
  AND distributed_at <= $2`;

export interface GetPlatformRevenueStatsArgs {
    startDate: Date;
    endDate: Date;
}

export interface GetPlatformRevenueStatsRow {
    totalDistributions: string;
    totalPlatformRevenue: string | null;
    totalClientRevenue: string | null;
    totalEnduserRevenue: string | null;
    totalRawYield: string | null;
    deductedCount: string;
    deferredCount: string;
}

export async function getPlatformRevenueStats(sql: Sql, args: GetPlatformRevenueStatsArgs): Promise<GetPlatformRevenueStatsRow | null> {
    const rows = await sql.unsafe(getPlatformRevenueStatsQuery, [args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalDistributions: row[0],
        totalPlatformRevenue: row[1],
        totalClientRevenue: row[2],
        totalEnduserRevenue: row[3],
        totalRawYield: row[4],
        deductedCount: row[5],
        deferredCount: row[6]
    };
}

export const createVaultIndexSnapshotQuery = `-- name: CreateVaultIndexSnapshot :one

INSERT INTO vault_index_history (
  vault_id,
  index_value,
  daily_yield,
  daily_apy
) VALUES (
  $1, $2, $3, $4
)
RETURNING id, vault_id, index_value, daily_yield, daily_apy, timestamp`;

export interface CreateVaultIndexSnapshotArgs {
    vaultId: string;
    indexValue: string;
    dailyYield: string | null;
    dailyApy: string | null;
}

export interface CreateVaultIndexSnapshotRow {
    id: string;
    vaultId: string;
    indexValue: string;
    dailyYield: string | null;
    dailyApy: string | null;
    timestamp: Date;
}

export async function createVaultIndexSnapshot(sql: Sql, args: CreateVaultIndexSnapshotArgs): Promise<CreateVaultIndexSnapshotRow | null> {
    const rows = await sql.unsafe(createVaultIndexSnapshotQuery, [args.vaultId, args.indexValue, args.dailyYield, args.dailyApy]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        vaultId: row[1],
        indexValue: row[2],
        dailyYield: row[3],
        dailyApy: row[4],
        timestamp: row[5]
    };
}

export const getLatestVaultIndexQuery = `-- name: GetLatestVaultIndex :one
SELECT id, vault_id, index_value, daily_yield, daily_apy, timestamp FROM vault_index_history
WHERE vault_id = $1
ORDER BY timestamp DESC
LIMIT 1`;

export interface GetLatestVaultIndexArgs {
    vaultId: string;
}

export interface GetLatestVaultIndexRow {
    id: string;
    vaultId: string;
    indexValue: string;
    dailyYield: string | null;
    dailyApy: string | null;
    timestamp: Date;
}

export async function getLatestVaultIndex(sql: Sql, args: GetLatestVaultIndexArgs): Promise<GetLatestVaultIndexRow | null> {
    const rows = await sql.unsafe(getLatestVaultIndexQuery, [args.vaultId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        vaultId: row[1],
        indexValue: row[2],
        dailyYield: row[3],
        dailyApy: row[4],
        timestamp: row[5]
    };
}

export const getVaultIndexHistoryQuery = `-- name: GetVaultIndexHistory :many
SELECT id, vault_id, index_value, daily_yield, daily_apy, timestamp FROM vault_index_history
WHERE vault_id = $1
  AND timestamp >= $2
  AND timestamp <= $3
ORDER BY timestamp ASC`;

export interface GetVaultIndexHistoryArgs {
    vaultId: string;
    startDate: Date;
    endDate: Date;
}

export interface GetVaultIndexHistoryRow {
    id: string;
    vaultId: string;
    indexValue: string;
    dailyYield: string | null;
    dailyApy: string | null;
    timestamp: Date;
}

export async function getVaultIndexHistory(sql: Sql, args: GetVaultIndexHistoryArgs): Promise<GetVaultIndexHistoryRow[]> {
    return (await sql.unsafe(getVaultIndexHistoryQuery, [args.vaultId, args.startDate, args.endDate]).values()).map(row => ({
        id: row[0],
        vaultId: row[1],
        indexValue: row[2],
        dailyYield: row[3],
        dailyApy: row[4],
        timestamp: row[5]
    }));
}

export const getVaultIndexAtTimestampQuery = `-- name: GetVaultIndexAtTimestamp :one
SELECT id, vault_id, index_value, daily_yield, daily_apy, timestamp FROM vault_index_history
WHERE vault_id = $1
  AND timestamp <= $2
ORDER BY timestamp DESC
LIMIT 1`;

export interface GetVaultIndexAtTimestampArgs {
    vaultId: string;
    timestamp: Date;
}

export interface GetVaultIndexAtTimestampRow {
    id: string;
    vaultId: string;
    indexValue: string;
    dailyYield: string | null;
    dailyApy: string | null;
    timestamp: Date;
}

export async function getVaultIndexAtTimestamp(sql: Sql, args: GetVaultIndexAtTimestampArgs): Promise<GetVaultIndexAtTimestampRow | null> {
    const rows = await sql.unsafe(getVaultIndexAtTimestampQuery, [args.vaultId, args.timestamp]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        vaultId: row[1],
        indexValue: row[2],
        dailyYield: row[3],
        dailyApy: row[4],
        timestamp: row[5]
    };
}

export const calculateRollingAPYQuery = `-- name: CalculateRollingAPY :one
SELECT
  v1.index_value as start_index,
  v2.index_value as end_index,
  v1.timestamp as start_time,
  v2.timestamp as end_time,
  EXTRACT(EPOCH FROM (v2.timestamp - v1.timestamp)) / 86400 as days_elapsed,
  ((v2.index_value::numeric / v1.index_value::numeric - 1) * 365 * 100 /
    (EXTRACT(EPOCH FROM (v2.timestamp - v1.timestamp)) / 86400)) as annualized_apy
FROM vault_index_history v1
CROSS JOIN LATERAL (
  SELECT index_value, timestamp
  FROM vault_index_history
  WHERE vault_id = v1.vault_id
  ORDER BY timestamp DESC
  LIMIT 1
) v2
WHERE v1.vault_id = $1
  AND v1.timestamp >= NOW() - INTERVAL '1 day' * $2
ORDER BY v1.timestamp ASC
LIMIT 1`;

export interface CalculateRollingAPYArgs {
    vaultId: string;
    days: string | null;
}

export interface CalculateRollingAPYRow {
    startIndex: string;
    endIndex: string;
    startTime: Date;
    endTime: Date;
    daysElapsed: string;
    annualizedApy: string;
}

export async function calculateRollingAPY(sql: Sql, args: CalculateRollingAPYArgs): Promise<CalculateRollingAPYRow | null> {
    const rows = await sql.unsafe(calculateRollingAPYQuery, [args.vaultId, args.days]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        startIndex: row[0],
        endIndex: row[1],
        startTime: row[2],
        endTime: row[3],
        daysElapsed: row[4],
        annualizedApy: row[5]
    };
}

export const deleteOldIndexHistoryQuery = `-- name: DeleteOldIndexHistory :exec
DELETE FROM vault_index_history
WHERE timestamp < NOW() - INTERVAL '90 days'`;

export async function deleteOldIndexHistory(sql: Sql): Promise<void> {
    await sql.unsafe(deleteOldIndexHistoryQuery, []);
}

