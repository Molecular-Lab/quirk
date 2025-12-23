import { Sql } from "postgres";

export const updateVaultStrategiesQuery = `-- name: UpdateVaultStrategies :one
UPDATE client_vaults
SET 
  strategies = $2::jsonb,
  updated_at = now()
WHERE id = $1
RETURNING id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, last_successful_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, environment, custodial_wallet_address, is_active, created_at, updated_at`;

export interface UpdateVaultStrategiesArgs {
    id: string;
    : any;
}

export interface UpdateVaultStrategiesRow {
    id: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    totalShares: string;
    currentIndex: string;
    lastIndexUpdate: Date;
    lastSuccessfulIndexUpdate: Date | null;
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
    strategies: any | null;
    environment: string;
    custodialWalletAddress: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function updateVaultStrategies(sql: Sql, args: UpdateVaultStrategiesArgs): Promise<UpdateVaultStrategiesRow | null> {
    const rows = await sql.unsafe(updateVaultStrategiesQuery, [args.id, args.]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        chain: row[2],
        tokenAddress: row[3],
        tokenSymbol: row[4],
        totalShares: row[5],
        currentIndex: row[6],
        lastIndexUpdate: row[7],
        lastSuccessfulIndexUpdate: row[8],
        pendingDepositBalance: row[9],
        totalStakedBalance: row[10],
        cumulativeYield: row[11],
        apy_7d: row[12],
        apy_30d: row[13],
        strategies: row[14],
        environment: row[15],
        custodialWalletAddress: row[16],
        isActive: row[17],
        createdAt: row[18],
        updatedAt: row[19]
    };
}

export const getVaultWithStrategiesQuery = `-- name: GetVaultWithStrategies :one
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, last_successful_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, environment, custodial_wallet_address, is_active, created_at, updated_at FROM client_vaults
WHERE id = $1`;

export interface GetVaultWithStrategiesArgs {
    id: string;
}

export interface GetVaultWithStrategiesRow {
    id: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    totalShares: string;
    currentIndex: string;
    lastIndexUpdate: Date;
    lastSuccessfulIndexUpdate: Date | null;
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
    strategies: any | null;
    environment: string;
    custodialWalletAddress: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getVaultWithStrategies(sql: Sql, args: GetVaultWithStrategiesArgs): Promise<GetVaultWithStrategiesRow | null> {
    const rows = await sql.unsafe(getVaultWithStrategiesQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        chain: row[2],
        tokenAddress: row[3],
        tokenSymbol: row[4],
        totalShares: row[5],
        currentIndex: row[6],
        lastIndexUpdate: row[7],
        lastSuccessfulIndexUpdate: row[8],
        pendingDepositBalance: row[9],
        totalStakedBalance: row[10],
        cumulativeYield: row[11],
        apy_7d: row[12],
        apy_30d: row[13],
        strategies: row[14],
        environment: row[15],
        custodialWalletAddress: row[16],
        isActive: row[17],
        createdAt: row[18],
        updatedAt: row[19]
    };
}

export const getVaultStrategiesByClientAndChainQuery = `-- name: GetVaultStrategiesByClientAndChain :one
SELECT strategies FROM client_vaults
WHERE client_id = $1 
  AND chain = $2 
  AND token_address = $3
LIMIT 1`;

export interface GetVaultStrategiesByClientAndChainArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
}

export interface GetVaultStrategiesByClientAndChainRow {
    strategies: any | null;
}

export async function getVaultStrategiesByClientAndChain(sql: Sql, args: GetVaultStrategiesByClientAndChainArgs): Promise<GetVaultStrategiesByClientAndChainRow | null> {
    const rows = await sql.unsafe(getVaultStrategiesByClientAndChainQuery, [args.clientId, args.chain, args.tokenAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        strategies: row[0]
    };
}

