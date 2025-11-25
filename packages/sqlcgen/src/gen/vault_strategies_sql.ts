import { Sql } from "postgres";

export const createVaultStrategyQuery = `-- name: CreateVaultStrategy :one

INSERT INTO vault_strategies (
  client_vault_id,
  category,
  target_percent
) VALUES (
  $1, $2, $3
)
RETURNING id, client_vault_id, category, target_percent, created_at, updated_at`;

export interface CreateVaultStrategyArgs {
    clientVaultId: string;
    category: string;
    targetPercent: string;
}

export interface CreateVaultStrategyRow {
    id: string;
    clientVaultId: string;
    category: string;
    targetPercent: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function createVaultStrategy(sql: Sql, args: CreateVaultStrategyArgs): Promise<CreateVaultStrategyRow | null> {
    const rows = await sql.unsafe(createVaultStrategyQuery, [args.clientVaultId, args.category, args.targetPercent]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientVaultId: row[1],
        category: row[2],
        targetPercent: row[3],
        createdAt: row[4],
        updatedAt: row[5]
    };
}

export const getVaultStrategiesQuery = `-- name: GetVaultStrategies :many
SELECT id, client_vault_id, category, target_percent, created_at, updated_at FROM vault_strategies
WHERE client_vault_id = $1
ORDER BY category`;

export interface GetVaultStrategiesArgs {
    clientVaultId: string;
}

export interface GetVaultStrategiesRow {
    id: string;
    clientVaultId: string;
    category: string;
    targetPercent: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function getVaultStrategies(sql: Sql, args: GetVaultStrategiesArgs): Promise<GetVaultStrategiesRow[]> {
    return (await sql.unsafe(getVaultStrategiesQuery, [args.clientVaultId]).values()).map(row => ({
        id: row[0],
        clientVaultId: row[1],
        category: row[2],
        targetPercent: row[3],
        createdAt: row[4],
        updatedAt: row[5]
    }));
}

export const upsertVaultStrategyQuery = `-- name: UpsertVaultStrategy :one
INSERT INTO vault_strategies (
  client_vault_id,
  category,
  target_percent
) VALUES (
  $1, $2, $3
)
ON CONFLICT (client_vault_id, category)
DO UPDATE SET
  target_percent = EXCLUDED.target_percent,
  updated_at = now()
RETURNING id, client_vault_id, category, target_percent, created_at, updated_at`;

export interface UpsertVaultStrategyArgs {
    clientVaultId: string;
    category: string;
    targetPercent: string;
}

export interface UpsertVaultStrategyRow {
    id: string;
    clientVaultId: string;
    category: string;
    targetPercent: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function upsertVaultStrategy(sql: Sql, args: UpsertVaultStrategyArgs): Promise<UpsertVaultStrategyRow | null> {
    const rows = await sql.unsafe(upsertVaultStrategyQuery, [args.clientVaultId, args.category, args.targetPercent]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientVaultId: row[1],
        category: row[2],
        targetPercent: row[3],
        createdAt: row[4],
        updatedAt: row[5]
    };
}

export const deleteAllVaultStrategiesQuery = `-- name: DeleteAllVaultStrategies :exec
DELETE FROM vault_strategies
WHERE client_vault_id = $1`;

export interface DeleteAllVaultStrategiesArgs {
    clientVaultId: string;
}

export async function deleteAllVaultStrategies(sql: Sql, args: DeleteAllVaultStrategiesArgs): Promise<void> {
    await sql.unsafe(deleteAllVaultStrategiesQuery, [args.clientVaultId]);
}

