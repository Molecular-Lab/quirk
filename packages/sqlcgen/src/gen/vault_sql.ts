import { Sql } from "postgres";

export const getClientVaultQuery = `-- name: GetClientVault :one


SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, last_successful_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, environment, custodial_wallet_address, is_active, created_at, updated_at FROM client_vaults
WHERE id = $1 LIMIT 1`;

export interface GetClientVaultArgs {
    id: string;
}

export interface GetClientVaultRow {
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

export async function getClientVault(sql: Sql, args: GetClientVaultArgs): Promise<GetClientVaultRow | null> {
    const rows = await sql.unsafe(getClientVaultQuery, [args.id]).values();
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

export const getClientVaultByTokenQuery = `-- name: GetClientVaultByToken :one
SELECT
  cv.id, cv.client_id, cv.chain, cv.token_address, cv.token_symbol, cv.total_shares, cv.current_index, cv.last_index_update, cv.last_successful_index_update, cv.pending_deposit_balance, cv.total_staked_balance, cv.cumulative_yield, cv.apy_7d, cv.apy_30d, cv.strategies, cv.environment, cv.custodial_wallet_address, cv.is_active, cv.created_at, cv.updated_at,
  COALESCE(cv.custodial_wallet_address, pa.privy_wallet_address) as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
  AND cv.environment = $4
LIMIT 1`;

export interface GetClientVaultByTokenArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
    environment: string;
}

export interface GetClientVaultByTokenRow {
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
    custodialWalletAddress_2: string;
}

export async function getClientVaultByToken(sql: Sql, args: GetClientVaultByTokenArgs): Promise<GetClientVaultByTokenRow | null> {
    const rows = await sql.unsafe(getClientVaultByTokenQuery, [args.clientId, args.chain, args.tokenAddress, args.environment]).values();
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
        updatedAt: row[19],
        custodialWalletAddress_2: row[20]
    };
}

export const getClientVaultByTokenForUpdateQuery = `-- name: GetClientVaultByTokenForUpdate :one
SELECT
  cv.id, cv.client_id, cv.chain, cv.token_address, cv.token_symbol, cv.total_shares, cv.current_index, cv.last_index_update, cv.last_successful_index_update, cv.pending_deposit_balance, cv.total_staked_balance, cv.cumulative_yield, cv.apy_7d, cv.apy_30d, cv.strategies, cv.environment, cv.custodial_wallet_address, cv.is_active, cv.created_at, cv.updated_at,
  COALESCE(cv.custodial_wallet_address, pa.privy_wallet_address) as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
  AND cv.environment = $4
FOR UPDATE
LIMIT 1`;

export interface GetClientVaultByTokenForUpdateArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
    environment: string;
}

export interface GetClientVaultByTokenForUpdateRow {
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
    custodialWalletAddress_2: string;
}

export async function getClientVaultByTokenForUpdate(sql: Sql, args: GetClientVaultByTokenForUpdateArgs): Promise<GetClientVaultByTokenForUpdateRow | null> {
    const rows = await sql.unsafe(getClientVaultByTokenForUpdateQuery, [args.clientId, args.chain, args.tokenAddress, args.environment]).values();
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
        updatedAt: row[19],
        custodialWalletAddress_2: row[20]
    };
}

export const listClientVaultsQuery = `-- name: ListClientVaults :many
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, last_successful_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, environment, custodial_wallet_address, is_active, created_at, updated_at FROM client_vaults
WHERE client_id = $1
ORDER BY created_at DESC`;

export interface ListClientVaultsArgs {
    clientId: string;
}

export interface ListClientVaultsRow {
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

export async function listClientVaults(sql: Sql, args: ListClientVaultsArgs): Promise<ListClientVaultsRow[]> {
    return (await sql.unsafe(listClientVaultsQuery, [args.clientId]).values()).map(row => ({
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
    }));
}

export const listClientVaultsPendingStakeQuery = `-- name: ListClientVaultsPendingStake :many
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, last_successful_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, environment, custodial_wallet_address, is_active, created_at, updated_at FROM client_vaults
WHERE pending_deposit_balance >= $1  -- minimum threshold (e.g., 10000)
  AND is_active = true
ORDER BY pending_deposit_balance DESC`;

export interface ListClientVaultsPendingStakeArgs {
    pendingDepositBalance: string;
}

export interface ListClientVaultsPendingStakeRow {
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

export async function listClientVaultsPendingStake(sql: Sql, args: ListClientVaultsPendingStakeArgs): Promise<ListClientVaultsPendingStakeRow[]> {
    return (await sql.unsafe(listClientVaultsPendingStakeQuery, [args.pendingDepositBalance]).values()).map(row => ({
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
    }));
}

export const createClientVaultQuery = `-- name: CreateClientVault :one
WITH new_vault AS (
  INSERT INTO client_vaults (
    client_id,
    chain,
    token_address,
    token_symbol,
    current_index,
    total_shares,
    pending_deposit_balance,
    total_staked_balance,
    cumulative_yield,
    environment,
    custodial_wallet_address
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
  )
  RETURNING id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, last_successful_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, environment, custodial_wallet_address, is_active, created_at, updated_at
)
SELECT
  nv.id, nv.client_id, nv.chain, nv.token_address, nv.token_symbol, nv.total_shares, nv.current_index, nv.last_index_update, nv.last_successful_index_update, nv.pending_deposit_balance, nv.total_staked_balance, nv.cumulative_yield, nv.apy_7d, nv.apy_30d, nv.strategies, nv.environment, nv.custodial_wallet_address, nv.is_active, nv.created_at, nv.updated_at,
  COALESCE(nv.custodial_wallet_address, pa.privy_wallet_address) as custodial_wallet_address
FROM new_vault nv
JOIN client_organizations co ON nv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id`;

export interface CreateClientVaultArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    currentIndex: string;
    totalShares: string;
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    environment: string;
    custodialWalletAddress: string | null;
}

export interface CreateClientVaultRow {
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
    custodialWalletAddress_2: string;
}

export async function createClientVault(sql: Sql, args: CreateClientVaultArgs): Promise<CreateClientVaultRow | null> {
    const rows = await sql.unsafe(createClientVaultQuery, [args.clientId, args.chain, args.tokenAddress, args.tokenSymbol, args.currentIndex, args.totalShares, args.pendingDepositBalance, args.totalStakedBalance, args.cumulativeYield, args.environment, args.custodialWalletAddress]).values();
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
        updatedAt: row[19],
        custodialWalletAddress_2: row[20]
    };
}

export const updateClientVaultIndexQuery = `-- name: UpdateClientVaultIndex :exec
UPDATE client_vaults
SET current_index = $2,
    cumulative_yield = cumulative_yield + $3,
    total_staked_balance = $4,
    last_index_update = now(),
    updated_at = now()
WHERE id = $1`;

export interface UpdateClientVaultIndexArgs {
    id: string;
    currentIndex: string;
    cumulativeYield: string;
    totalStakedBalance: string;
}

export async function updateClientVaultIndex(sql: Sql, args: UpdateClientVaultIndexArgs): Promise<void> {
    await sql.unsafe(updateClientVaultIndexQuery, [args.id, args.currentIndex, args.cumulativeYield, args.totalStakedBalance]);
}

export const updateClientVaultAPYQuery = `-- name: UpdateClientVaultAPY :exec
UPDATE client_vaults
SET apy_7d = $2,
    apy_30d = $3,
    updated_at = now()
WHERE id = $1`;

export interface UpdateClientVaultAPYArgs {
    id: string;
    apy_7d: string | null;
    apy_30d: string | null;
}

export async function updateClientVaultAPY(sql: Sql, args: UpdateClientVaultAPYArgs): Promise<void> {
    await sql.unsafe(updateClientVaultAPYQuery, [args.id, args.apy_7d, args.apy_30d]);
}

export const listActiveVaultsForIndexUpdateQuery = `-- name: ListActiveVaultsForIndexUpdate :many
SELECT
  id,
  client_id,
  chain,
  token_symbol,
  current_index,
  total_staked_balance,
  strategies,
  last_index_update
FROM client_vaults
WHERE is_active = true
  AND total_staked_balance > 0
ORDER BY last_index_update ASC`;

export interface ListActiveVaultsForIndexUpdateRow {
    id: string;
    clientId: string;
    chain: string;
    tokenSymbol: string;
    currentIndex: string;
    totalStakedBalance: string;
    strategies: any | null;
    lastIndexUpdate: Date;
}

export async function listActiveVaultsForIndexUpdate(sql: Sql): Promise<ListActiveVaultsForIndexUpdateRow[]> {
    return (await sql.unsafe(listActiveVaultsForIndexUpdateQuery, []).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        chain: row[2],
        tokenSymbol: row[3],
        currentIndex: row[4],
        totalStakedBalance: row[5],
        strategies: row[6],
        lastIndexUpdate: row[7]
    }));
}

export const getVaultHistoricalIndexQuery = `-- name: GetVaultHistoricalIndex :one
SELECT current_index, last_index_update
FROM client_vaults
WHERE id = $1
  AND last_index_update >= NOW() - INTERVAL '1 day' * $2
ORDER BY last_index_update ASC
LIMIT 1`;

export interface GetVaultHistoricalIndexArgs {
    id: string;
    daysBack: string | null;
}

export interface GetVaultHistoricalIndexRow {
    currentIndex: string;
    lastIndexUpdate: Date;
}

export async function getVaultHistoricalIndex(sql: Sql, args: GetVaultHistoricalIndexArgs): Promise<GetVaultHistoricalIndexRow | null> {
    const rows = await sql.unsafe(getVaultHistoricalIndexQuery, [args.id, args.daysBack]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        currentIndex: row[0],
        lastIndexUpdate: row[1]
    };
}

export const updateTotalStakedBalanceQuery = `-- name: UpdateTotalStakedBalance :exec
UPDATE client_vaults
SET total_staked_balance = $2,
    updated_at = now()
WHERE id = $1`;

export interface UpdateTotalStakedBalanceArgs {
    id: string;
    totalStakedBalance: string;
}

export async function updateTotalStakedBalance(sql: Sql, args: UpdateTotalStakedBalanceArgs): Promise<void> {
    await sql.unsafe(updateTotalStakedBalanceQuery, [args.id, args.totalStakedBalance]);
}

export const addPendingDepositToVaultQuery = `-- name: AddPendingDepositToVault :exec
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance + $2,
    total_shares = total_shares + $3,
    updated_at = now()
WHERE id = $1`;

export interface AddPendingDepositToVaultArgs {
    id: string;
    pendingDepositBalance: string;
    totalShares: string;
}

export async function addPendingDepositToVault(sql: Sql, args: AddPendingDepositToVaultArgs): Promise<void> {
    await sql.unsafe(addPendingDepositToVaultQuery, [args.id, args.pendingDepositBalance, args.totalShares]);
}

export const movePendingToStakedQuery = `-- name: MovePendingToStaked :exec
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance - $2,
    total_staked_balance = total_staked_balance + $2,
    updated_at = now()
WHERE id = $1`;

export interface MovePendingToStakedArgs {
    id: string;
    pendingDepositBalance: string;
}

export async function movePendingToStaked(sql: Sql, args: MovePendingToStakedArgs): Promise<void> {
    await sql.unsafe(movePendingToStakedQuery, [args.id, args.pendingDepositBalance]);
}

export const reduceStakedBalanceQuery = `-- name: ReduceStakedBalance :exec
UPDATE client_vaults
SET total_staked_balance = total_staked_balance - $2,
    total_shares = total_shares - $3,
    updated_at = now()
WHERE id = $1`;

export interface ReduceStakedBalanceArgs {
    id: string;
    totalStakedBalance: string;
    totalShares: string;
}

export async function reduceStakedBalance(sql: Sql, args: ReduceStakedBalanceArgs): Promise<void> {
    await sql.unsafe(reduceStakedBalanceQuery, [args.id, args.totalStakedBalance, args.totalShares]);
}

export const getEndUserVaultQuery = `-- name: GetEndUserVault :one

SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, environment, is_active, created_at, updated_at FROM end_user_vaults
WHERE id = $1 LIMIT 1`;

export interface GetEndUserVaultArgs {
    id: string;
}

export interface GetEndUserVaultRow {
    id: string;
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    totalWithdrawn: string;
    weightedEntryIndex: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    environment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVault(sql: Sql, args: GetEndUserVaultArgs): Promise<GetEndUserVaultRow | null> {
    const rows = await sql.unsafe(getEndUserVaultQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        totalDeposited: row[3],
        totalWithdrawn: row[4],
        weightedEntryIndex: row[5],
        lastDepositAt: row[6],
        lastWithdrawalAt: row[7],
        environment: row[8],
        isActive: row[9],
        createdAt: row[10],
        updatedAt: row[11]
    };
}

export const getEndUserVaultByClientQuery = `-- name: GetEndUserVaultByClient :one
SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, environment, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
  AND environment = $3
LIMIT 1`;

export interface GetEndUserVaultByClientArgs {
    endUserId: string;
    clientId: string;
    environment: string;
}

export interface GetEndUserVaultByClientRow {
    id: string;
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    totalWithdrawn: string;
    weightedEntryIndex: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    environment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVaultByClient(sql: Sql, args: GetEndUserVaultByClientArgs): Promise<GetEndUserVaultByClientRow | null> {
    const rows = await sql.unsafe(getEndUserVaultByClientQuery, [args.endUserId, args.clientId, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        totalDeposited: row[3],
        totalWithdrawn: row[4],
        weightedEntryIndex: row[5],
        lastDepositAt: row[6],
        lastWithdrawalAt: row[7],
        environment: row[8],
        isActive: row[9],
        createdAt: row[10],
        updatedAt: row[11]
    };
}

export const getEndUserVaultByClientForUpdateQuery = `-- name: GetEndUserVaultByClientForUpdate :one
SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, environment, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
  AND environment = $3
FOR UPDATE
LIMIT 1`;

export interface GetEndUserVaultByClientForUpdateArgs {
    endUserId: string;
    clientId: string;
    environment: string;
}

export interface GetEndUserVaultByClientForUpdateRow {
    id: string;
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    totalWithdrawn: string;
    weightedEntryIndex: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    environment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVaultByClientForUpdate(sql: Sql, args: GetEndUserVaultByClientForUpdateArgs): Promise<GetEndUserVaultByClientForUpdateRow | null> {
    const rows = await sql.unsafe(getEndUserVaultByClientForUpdateQuery, [args.endUserId, args.clientId, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        totalDeposited: row[3],
        totalWithdrawn: row[4],
        weightedEntryIndex: row[5],
        lastDepositAt: row[6],
        lastWithdrawalAt: row[7],
        environment: row[8],
        isActive: row[9],
        createdAt: row[10],
        updatedAt: row[11]
    };
}

export const listEndUserVaultsQuery = `-- name: ListEndUserVaults :many
SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, environment, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
ORDER BY created_at DESC`;

export interface ListEndUserVaultsArgs {
    endUserId: string;
}

export interface ListEndUserVaultsRow {
    id: string;
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    totalWithdrawn: string;
    weightedEntryIndex: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    environment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listEndUserVaults(sql: Sql, args: ListEndUserVaultsArgs): Promise<ListEndUserVaultsRow[]> {
    return (await sql.unsafe(listEndUserVaultsQuery, [args.endUserId]).values()).map(row => ({
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        totalDeposited: row[3],
        totalWithdrawn: row[4],
        weightedEntryIndex: row[5],
        lastDepositAt: row[6],
        lastWithdrawalAt: row[7],
        environment: row[8],
        isActive: row[9],
        createdAt: row[10],
        updatedAt: row[11]
    }));
}

export const createEndUserVaultQuery = `-- name: CreateEndUserVault :one
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  total_deposited,
  weighted_entry_index,
  environment
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, environment, is_active, created_at, updated_at`;

export interface CreateEndUserVaultArgs {
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    weightedEntryIndex: string;
    environment: string;
}

export interface CreateEndUserVaultRow {
    id: string;
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    totalWithdrawn: string;
    weightedEntryIndex: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    environment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function createEndUserVault(sql: Sql, args: CreateEndUserVaultArgs): Promise<CreateEndUserVaultRow | null> {
    const rows = await sql.unsafe(createEndUserVaultQuery, [args.endUserId, args.clientId, args.totalDeposited, args.weightedEntryIndex, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        totalDeposited: row[3],
        totalWithdrawn: row[4],
        weightedEntryIndex: row[5],
        lastDepositAt: row[6],
        lastWithdrawalAt: row[7],
        environment: row[8],
        isActive: row[9],
        createdAt: row[10],
        updatedAt: row[11]
    };
}

export const updateEndUserVaultDepositQuery = `-- name: UpdateEndUserVaultDeposit :exec
UPDATE end_user_vaults
SET total_deposited = total_deposited + $2,  -- Add deposit amount
    weighted_entry_index = $3,  -- Recalculate weighted entry index
    last_deposit_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface UpdateEndUserVaultDepositArgs {
    id: string;
    totalDeposited: string;
    weightedEntryIndex: string;
}

export async function updateEndUserVaultDeposit(sql: Sql, args: UpdateEndUserVaultDepositArgs): Promise<void> {
    await sql.unsafe(updateEndUserVaultDepositQuery, [args.id, args.totalDeposited, args.weightedEntryIndex]);
}

export const updateEndUserVaultWithdrawalQuery = `-- name: UpdateEndUserVaultWithdrawal :exec
UPDATE end_user_vaults
SET total_withdrawn = total_withdrawn + $2,  -- Add withdrawal amount
    last_withdrawal_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface UpdateEndUserVaultWithdrawalArgs {
    id: string;
    totalWithdrawn: string;
}

export async function updateEndUserVaultWithdrawal(sql: Sql, args: UpdateEndUserVaultWithdrawalArgs): Promise<void> {
    await sql.unsafe(updateEndUserVaultWithdrawalQuery, [args.id, args.totalWithdrawn]);
}

export const getClientSummaryQuery = `-- name: GetClientSummary :one

SELECT
  co.id,
  co.product_id,
  co.company_name,
  COUNT(DISTINCT euv.end_user_id) AS total_users,
  COALESCE(SUM(euv.total_deposited), 0) AS total_user_deposits,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_user_withdrawals
FROM client_organizations co
LEFT JOIN end_user_vaults euv
  ON co.id = euv.client_id
  AND euv.is_active = true
WHERE co.id = $1
GROUP BY co.id`;

export interface GetClientSummaryArgs {
    id: string;
}

export interface GetClientSummaryRow {
    id: string;
    productId: string;
    companyName: string;
    totalUsers: string;
    totalUserDeposits: string | null;
    totalUserWithdrawals: string | null;
}

export async function getClientSummary(sql: Sql, args: GetClientSummaryArgs): Promise<GetClientSummaryRow | null> {
    const rows = await sql.unsafe(getClientSummaryQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        productId: row[1],
        companyName: row[2],
        totalUsers: row[3],
        totalUserDeposits: row[4],
        totalUserWithdrawals: row[5]
    };
}

export const listTopUsersByDepositQuery = `-- name: ListTopUsersByDeposit :many
SELECT
  euv.end_user_id,
  eu.user_id,
  euv.total_deposited,
  euv.total_withdrawn,
  euv.weighted_entry_index,
  euv.last_deposit_at
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
WHERE euv.client_id = $1
  AND euv.is_active = true
  AND euv.total_deposited > 0
ORDER BY euv.total_deposited DESC
LIMIT $2`;

export interface ListTopUsersByDepositArgs {
    clientId: string;
    limit: string;
}

export interface ListTopUsersByDepositRow {
    endUserId: string;
    userId: string;
    totalDeposited: string;
    totalWithdrawn: string;
    weightedEntryIndex: string;
    lastDepositAt: Date | null;
}

export async function listTopUsersByDeposit(sql: Sql, args: ListTopUsersByDepositArgs): Promise<ListTopUsersByDepositRow[]> {
    return (await sql.unsafe(listTopUsersByDepositQuery, [args.clientId, args.limit]).values()).map(row => ({
        endUserId: row[0],
        userId: row[1],
        totalDeposited: row[2],
        totalWithdrawn: row[3],
        weightedEntryIndex: row[4],
        lastDepositAt: row[5]
    }));
}

export const getVaultBalancesQuery = `-- name: GetVaultBalances :one

SELECT
  id,
  client_id,
  chain,
  token_symbol,
  pending_deposit_balance,
  total_staked_balance,
  cumulative_yield
FROM client_vaults
WHERE id = $1
LIMIT 1`;

export interface GetVaultBalancesArgs {
    id: string;
}

export interface GetVaultBalancesRow {
    id: string;
    clientId: string;
    chain: string;
    tokenSymbol: string;
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
}

export async function getVaultBalances(sql: Sql, args: GetVaultBalancesArgs): Promise<GetVaultBalancesRow | null> {
    const rows = await sql.unsafe(getVaultBalancesQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        chain: row[2],
        tokenSymbol: row[3],
        pendingDepositBalance: row[4],
        totalStakedBalance: row[5],
        cumulativeYield: row[6]
    };
}

export const getClientTotalBalancesQuery = `-- name: GetClientTotalBalances :one
SELECT
  COALESCE(SUM(pending_deposit_balance), 0) AS total_pending_balance,
  COALESCE(SUM(total_staked_balance), 0) AS total_earning_balance,
  COALESCE(SUM(cumulative_yield), 0) AS total_cumulative_yield
FROM client_vaults
WHERE client_id = $1
  AND is_active = true
  AND ($2::varchar IS NULL OR environment = $2::varchar)`;

export interface GetClientTotalBalancesArgs {
    clientId: string;
    environment: string | null;
}

export interface GetClientTotalBalancesRow {
    totalPendingBalance: string | null;
    totalEarningBalance: string | null;
    totalCumulativeYield: string | null;
}

export async function getClientTotalBalances(sql: Sql, args: GetClientTotalBalancesArgs): Promise<GetClientTotalBalancesRow | null> {
    const rows = await sql.unsafe(getClientTotalBalancesQuery, [args.clientId, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalPendingBalance: row[0],
        totalEarningBalance: row[1],
        totalCumulativeYield: row[2]
    };
}

export const addToIdleBalanceQuery = `-- name: AddToIdleBalance :exec
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance + $2,
    total_shares = total_shares + $3,
    updated_at = now()
WHERE id = $1`;

export interface AddToIdleBalanceArgs {
    id: string;
    pendingDepositBalance: string;
    totalShares: string;
}

export async function addToIdleBalance(sql: Sql, args: AddToIdleBalanceArgs): Promise<void> {
    await sql.unsafe(addToIdleBalanceQuery, [args.id, args.pendingDepositBalance, args.totalShares]);
}

export const moveIdleToEarningQuery = `-- name: MoveIdleToEarning :exec
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance - $2,
    total_staked_balance = total_staked_balance + $2,
    updated_at = now()
WHERE id = $1
  AND pending_deposit_balance >= $2`;

export interface MoveIdleToEarningArgs {
    id: string;
    pendingDepositBalance: string;
}

export async function moveIdleToEarning(sql: Sql, args: MoveIdleToEarningArgs): Promise<void> {
    await sql.unsafe(moveIdleToEarningQuery, [args.id, args.pendingDepositBalance]);
}

export const reduceEarningBalanceQuery = `-- name: ReduceEarningBalance :exec
UPDATE client_vaults
SET total_staked_balance = total_staked_balance - $2,
    total_shares = total_shares - $3,
    updated_at = now()
WHERE id = $1
  AND total_staked_balance >= $2`;

export interface ReduceEarningBalanceArgs {
    id: string;
    totalStakedBalance: string;
    totalShares: string;
}

export async function reduceEarningBalance(sql: Sql, args: ReduceEarningBalanceArgs): Promise<void> {
    await sql.unsafe(reduceEarningBalanceQuery, [args.id, args.totalStakedBalance, args.totalShares]);
}

export const moveEarningToIdleQuery = `-- name: MoveEarningToIdle :exec
UPDATE client_vaults
SET total_staked_balance = total_staked_balance - $2,
    pending_deposit_balance = pending_deposit_balance + $2,
    updated_at = now()
WHERE id = $1
  AND total_staked_balance >= $2`;

export interface MoveEarningToIdleArgs {
    id: string;
    totalStakedBalance: string;
}

export async function moveEarningToIdle(sql: Sql, args: MoveEarningToIdleArgs): Promise<void> {
    await sql.unsafe(moveEarningToIdleQuery, [args.id, args.totalStakedBalance]);
}

export const reduceIdleBalanceQuery = `-- name: ReduceIdleBalance :exec
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance - $2,
    updated_at = now()
WHERE id = $1
  AND pending_deposit_balance >= $2`;

export interface ReduceIdleBalanceArgs {
    id: string;
    pendingDepositBalance: string;
}

export async function reduceIdleBalance(sql: Sql, args: ReduceIdleBalanceArgs): Promise<void> {
    await sql.unsafe(reduceIdleBalanceQuery, [args.id, args.pendingDepositBalance]);
}

export const recordYieldDistributionQuery = `-- name: RecordYieldDistribution :exec

UPDATE client_vaults
SET cumulative_yield = cumulative_yield + $2,
    total_staked_balance = total_staked_balance + $3,  -- enduser revenue stays earning
    updated_at = now()
WHERE id = $1`;

export interface RecordYieldDistributionArgs {
    id: string;
    cumulativeYield: string;
    totalStakedBalance: string;
}

export async function recordYieldDistribution(sql: Sql, args: RecordYieldDistributionArgs): Promise<void> {
    await sql.unsafe(recordYieldDistributionQuery, [args.id, args.cumulativeYield, args.totalStakedBalance]);
}

export const getClientRevenueSummaryQuery = `-- name: GetClientRevenueSummary :one
SELECT
  c.id,
  c.product_id,
  c.company_name,
  c.client_revenue_share_percent,
  c.platform_fee_percent,
  c.monthly_recurring_revenue,
  c.annual_run_rate,
  c.last_mrr_calculation_at,
  COALESCE(SUM(cv.cumulative_yield), 0) AS total_raw_yield,
  COALESCE(SUM(cv.total_staked_balance), 0) AS total_earning_balance
FROM client_organizations c
LEFT JOIN client_vaults cv ON c.id = cv.client_id AND cv.is_active = true
WHERE c.id = $1
GROUP BY c.id`;

export interface GetClientRevenueSummaryArgs {
    id: string;
}

export interface GetClientRevenueSummaryRow {
    id: string;
    productId: string;
    companyName: string;
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    totalRawYield: string | null;
    totalEarningBalance: string | null;
}

export async function getClientRevenueSummary(sql: Sql, args: GetClientRevenueSummaryArgs): Promise<GetClientRevenueSummaryRow | null> {
    const rows = await sql.unsafe(getClientRevenueSummaryQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        productId: row[1],
        companyName: row[2],
        clientRevenueSharePercent: row[3],
        platformFeePercent: row[4],
        monthlyRecurringRevenue: row[5],
        annualRunRate: row[6],
        lastMrrCalculationAt: row[7],
        totalRawYield: row[8],
        totalEarningBalance: row[9]
    };
}

export const updateClientMRRQuery = `-- name: UpdateClientMRR :exec
UPDATE client_organizations
SET monthly_recurring_revenue = $2,
    annual_run_rate = $2 * 12,  -- ARR = MRR × 12
    last_mrr_calculation_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface UpdateClientMRRArgs {
    id: string;
    monthlyRecurringRevenue: string | null;
}

export async function updateClientMRR(sql: Sql, args: UpdateClientMRRArgs): Promise<void> {
    await sql.unsafe(updateClientMRRQuery, [args.id, args.monthlyRecurringRevenue]);
}

export const listClientsForMRRCalculationQuery = `-- name: ListClientsForMRRCalculation :many
SELECT
  c.id,
  c.product_id,
  c.client_revenue_share_percent,
  COALESCE(SUM(cv.total_staked_balance), 0) AS total_earning_balance,
  COALESCE(AVG(cv.apy_30d), 0) AS avg_apy_30d
FROM client_organizations c
LEFT JOIN client_vaults cv ON c.id = cv.client_id AND cv.is_active = true
WHERE c.is_active = true
GROUP BY c.id
HAVING SUM(cv.total_staked_balance) > 0`;

export interface ListClientsForMRRCalculationRow {
    id: string;
    productId: string;
    clientRevenueSharePercent: string;
    totalEarningBalance: string | null;
    avgApy_30d: string | null;
}

export async function listClientsForMRRCalculation(sql: Sql): Promise<ListClientsForMRRCalculationRow[]> {
    return (await sql.unsafe(listClientsForMRRCalculationQuery, []).values()).map(row => ({
        id: row[0],
        productId: row[1],
        clientRevenueSharePercent: row[2],
        totalEarningBalance: row[3],
        avgApy_30d: row[4]
    }));
}

export const listRecentEndUserTransactionsQuery = `-- name: ListRecentEndUserTransactions :many

SELECT
  'deposit' AS transaction_type,
  dt.id,
  dt.user_id,
  dt.fiat_amount AS amount,
  dt.currency,
  dt.status,
  dt.created_at AS timestamp
FROM deposit_transactions dt
WHERE dt.client_id = $1
  AND ($4::varchar IS NULL OR dt.environment = $4::varchar)
UNION ALL
SELECT
  'withdrawal' AS transaction_type,
  wt.id,
  wt.user_id,
  wt.requested_amount AS amount,
  wt.currency,
  wt.status,
  wt.created_at AS timestamp
FROM withdrawal_transactions wt
WHERE wt.client_id = $1
  AND ($4::varchar IS NULL OR wt.environment = $4::varchar)
ORDER BY timestamp DESC
LIMIT $2 OFFSET $3`;

export interface ListRecentEndUserTransactionsArgs {
    clientId: string;
    limit: string;
    offset: string;
    environment: string | null;
}

export interface ListRecentEndUserTransactionsRow {
    transactionType: string;
    id: string;
    userId: string;
    amount: string;
    currency: string;
    status: string;
    timestamp: Date;
}

export async function listRecentEndUserTransactions(sql: Sql, args: ListRecentEndUserTransactionsArgs): Promise<ListRecentEndUserTransactionsRow[]> {
    return (await sql.unsafe(listRecentEndUserTransactionsQuery, [args.clientId, args.limit, args.offset, args.environment]).values()).map(row => ({
        transactionType: row[0],
        id: row[1],
        userId: row[2],
        amount: row[3],
        currency: row[4],
        status: row[5],
        timestamp: row[6]
    }));
}

export const getEndUserGrowthMetricsQuery = `-- name: GetEndUserGrowthMetrics :one
SELECT
  COUNT(DISTINCT eu.id) AS total_end_users,
  COUNT(DISTINCT eu.id) FILTER (
    WHERE eu.created_at >= NOW() - INTERVAL '30 days'
  ) AS new_users_30d,
  COUNT(DISTINCT euv.end_user_id) FILTER (
    WHERE euv.last_deposit_at >= NOW() - INTERVAL '30 days'
  ) AS active_users_30d,
  COALESCE(SUM(euv.total_deposited), 0) AS total_deposited,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_withdrawn,
  COUNT(DISTINCT dt.id) FILTER (
    WHERE dt.status = 'completed'
  ) AS total_deposits,
  COUNT(DISTINCT wt.id) FILTER (
    WHERE wt.status = 'completed'
  ) AS total_withdrawals
FROM client_organizations c
LEFT JOIN end_users eu ON c.id = eu.client_id
  AND ($2::varchar IS NULL OR eu.environment = $2::varchar)
LEFT JOIN end_user_vaults euv ON eu.id = euv.end_user_id AND euv.is_active = true
  AND ($2::varchar IS NULL OR euv.environment = $2::varchar)
LEFT JOIN deposit_transactions dt ON c.id = dt.client_id
  AND ($2::varchar IS NULL OR dt.environment = $2::varchar)
LEFT JOIN withdrawal_transactions wt ON c.id = wt.client_id
  AND ($2::varchar IS NULL OR wt.environment = $2::varchar)
WHERE c.id = $1
GROUP BY c.id`;

export interface GetEndUserGrowthMetricsArgs {
    id: string;
    environment: string | null;
}

export interface GetEndUserGrowthMetricsRow {
    totalEndUsers: string;
    newUsers_30d: string;
    activeUsers_30d: string;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
    totalDeposits: string;
    totalWithdrawals: string;
}

export async function getEndUserGrowthMetrics(sql: Sql, args: GetEndUserGrowthMetricsArgs): Promise<GetEndUserGrowthMetricsRow | null> {
    const rows = await sql.unsafe(getEndUserGrowthMetricsQuery, [args.id, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalEndUsers: row[0],
        newUsers_30d: row[1],
        activeUsers_30d: row[2],
        totalDeposited: row[3],
        totalWithdrawn: row[4],
        totalDeposits: row[5],
        totalWithdrawals: row[6]
    };
}

