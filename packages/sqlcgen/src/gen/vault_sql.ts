import { Sql } from "postgres";

export const getClientVaultQuery = `-- name: GetClientVault :one


SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, is_active, created_at, updated_at FROM client_vaults
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
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
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
        pendingDepositBalance: row[8],
        totalStakedBalance: row[9],
        cumulativeYield: row[10],
        apy_7d: row[11],
        apy_30d: row[12],
        isActive: row[13],
        createdAt: row[14],
        updatedAt: row[15]
    };
}

export const getClientVaultByTokenQuery = `-- name: GetClientVaultByToken :one
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, is_active, created_at, updated_at FROM client_vaults
WHERE client_id = $1
  AND chain = $2
  AND token_address = $3
LIMIT 1`;

export interface GetClientVaultByTokenArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
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
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getClientVaultByToken(sql: Sql, args: GetClientVaultByTokenArgs): Promise<GetClientVaultByTokenRow | null> {
    const rows = await sql.unsafe(getClientVaultByTokenQuery, [args.clientId, args.chain, args.tokenAddress]).values();
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
        pendingDepositBalance: row[8],
        totalStakedBalance: row[9],
        cumulativeYield: row[10],
        apy_7d: row[11],
        apy_30d: row[12],
        isActive: row[13],
        createdAt: row[14],
        updatedAt: row[15]
    };
}

export const getClientVaultByTokenForUpdateQuery = `-- name: GetClientVaultByTokenForUpdate :one
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, is_active, created_at, updated_at FROM client_vaults
WHERE client_id = $1
  AND chain = $2
  AND token_address = $3
FOR UPDATE
LIMIT 1`;

export interface GetClientVaultByTokenForUpdateArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
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
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getClientVaultByTokenForUpdate(sql: Sql, args: GetClientVaultByTokenForUpdateArgs): Promise<GetClientVaultByTokenForUpdateRow | null> {
    const rows = await sql.unsafe(getClientVaultByTokenForUpdateQuery, [args.clientId, args.chain, args.tokenAddress]).values();
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
        pendingDepositBalance: row[8],
        totalStakedBalance: row[9],
        cumulativeYield: row[10],
        apy_7d: row[11],
        apy_30d: row[12],
        isActive: row[13],
        createdAt: row[14],
        updatedAt: row[15]
    };
}

export const listClientVaultsQuery = `-- name: ListClientVaults :many
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, is_active, created_at, updated_at FROM client_vaults
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
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
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
        pendingDepositBalance: row[8],
        totalStakedBalance: row[9],
        cumulativeYield: row[10],
        apy_7d: row[11],
        apy_30d: row[12],
        isActive: row[13],
        createdAt: row[14],
        updatedAt: row[15]
    }));
}

export const listClientVaultsPendingStakeQuery = `-- name: ListClientVaultsPendingStake :many
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, is_active, created_at, updated_at FROM client_vaults
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
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
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
        pendingDepositBalance: row[8],
        totalStakedBalance: row[9],
        cumulativeYield: row[10],
        apy_7d: row[11],
        apy_30d: row[12],
        isActive: row[13],
        createdAt: row[14],
        updatedAt: row[15]
    }));
}

export const createClientVaultQuery = `-- name: CreateClientVault :one
INSERT INTO client_vaults (
  client_id,
  chain,
  token_address,
  token_symbol,
  current_index,
  total_shares,
  pending_deposit_balance,
  total_staked_balance,
  cumulative_yield
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, is_active, created_at, updated_at`;

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
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function createClientVault(sql: Sql, args: CreateClientVaultArgs): Promise<CreateClientVaultRow | null> {
    const rows = await sql.unsafe(createClientVaultQuery, [args.clientId, args.chain, args.tokenAddress, args.tokenSymbol, args.currentIndex, args.totalShares, args.pendingDepositBalance, args.totalStakedBalance, args.cumulativeYield]).values();
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
        pendingDepositBalance: row[8],
        totalStakedBalance: row[9],
        cumulativeYield: row[10],
        apy_7d: row[11],
        apy_30d: row[12],
        isActive: row[13],
        createdAt: row[14],
        updatedAt: row[15]
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

SELECT id, end_user_id, client_id, chain, token_address, token_symbol, shares, weighted_entry_index, total_deposited, total_withdrawn, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
WHERE id = $1 LIMIT 1`;

export interface GetEndUserVaultArgs {
    id: string;
}

export interface GetEndUserVaultRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
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
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14]
    };
}

export const getEndUserVaultByTokenQuery = `-- name: GetEndUserVaultByToken :one
SELECT id, end_user_id, client_id, chain, token_address, token_symbol, shares, weighted_entry_index, total_deposited, total_withdrawn, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
  AND chain = $2
  AND token_address = $3
LIMIT 1`;

export interface GetEndUserVaultByTokenArgs {
    endUserId: string;
    chain: string;
    tokenAddress: string;
}

export interface GetEndUserVaultByTokenRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVaultByToken(sql: Sql, args: GetEndUserVaultByTokenArgs): Promise<GetEndUserVaultByTokenRow | null> {
    const rows = await sql.unsafe(getEndUserVaultByTokenQuery, [args.endUserId, args.chain, args.tokenAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14]
    };
}

export const getEndUserVaultByTokenForUpdateQuery = `-- name: GetEndUserVaultByTokenForUpdate :one
SELECT id, end_user_id, client_id, chain, token_address, token_symbol, shares, weighted_entry_index, total_deposited, total_withdrawn, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
  AND chain = $2
  AND token_address = $3
FOR UPDATE
LIMIT 1`;

export interface GetEndUserVaultByTokenForUpdateArgs {
    endUserId: string;
    chain: string;
    tokenAddress: string;
}

export interface GetEndUserVaultByTokenForUpdateRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVaultByTokenForUpdate(sql: Sql, args: GetEndUserVaultByTokenForUpdateArgs): Promise<GetEndUserVaultByTokenForUpdateRow | null> {
    const rows = await sql.unsafe(getEndUserVaultByTokenForUpdateQuery, [args.endUserId, args.chain, args.tokenAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14]
    };
}

export const listEndUserVaultsQuery = `-- name: ListEndUserVaults :many
SELECT id, end_user_id, client_id, chain, token_address, token_symbol, shares, weighted_entry_index, total_deposited, total_withdrawn, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
ORDER BY created_at DESC`;

export interface ListEndUserVaultsArgs {
    endUserId: string;
}

export interface ListEndUserVaultsRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listEndUserVaults(sql: Sql, args: ListEndUserVaultsArgs): Promise<ListEndUserVaultsRow[]> {
    return (await sql.unsafe(listEndUserVaultsQuery, [args.endUserId]).values()).map(row => ({
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14]
    }));
}

export const listEndUserVaultsWithBalanceQuery = `-- name: ListEndUserVaultsWithBalance :many
SELECT
  euv.id, euv.end_user_id, euv.client_id, euv.chain, euv.token_address, euv.token_symbol, euv.shares, euv.weighted_entry_index, euv.total_deposited, euv.total_withdrawn, euv.last_deposit_at, euv.last_withdrawal_at, euv.is_active, euv.created_at, euv.updated_at,
  cv.current_index,
  cv.token_symbol,
  -- Effective balance = shares * current_index / 1e18
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  -- Yield earned = effective_balance - total_deposited
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE euv.end_user_id = $1
  AND euv.is_active = true
ORDER BY effective_balance DESC`;

export interface ListEndUserVaultsWithBalanceArgs {
    endUserId: string;
}

export interface ListEndUserVaultsWithBalanceRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    currentIndex: string;
    tokenSymbol_2: string;
    effectiveBalance: string;
    yieldEarned: string;
}

export async function listEndUserVaultsWithBalance(sql: Sql, args: ListEndUserVaultsWithBalanceArgs): Promise<ListEndUserVaultsWithBalanceRow[]> {
    return (await sql.unsafe(listEndUserVaultsWithBalanceQuery, [args.endUserId]).values()).map(row => ({
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14],
        currentIndex: row[15],
        tokenSymbol_2: row[16],
        effectiveBalance: row[17],
        yieldEarned: row[18]
    }));
}

export const getEndUserVaultWithBalanceQuery = `-- name: GetEndUserVaultWithBalance :one
SELECT
  euv.id, euv.end_user_id, euv.client_id, euv.chain, euv.token_address, euv.token_symbol, euv.shares, euv.weighted_entry_index, euv.total_deposited, euv.total_withdrawn, euv.last_deposit_at, euv.last_withdrawal_at, euv.is_active, euv.created_at, euv.updated_at,
  cv.current_index,
  cv.token_symbol,
  cv.apy_7d,
  cv.apy_30d,
  cv.total_staked_balance,
  cv.pending_deposit_balance,
  -- Effective balance = shares * current_index / 1e18
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  -- Yield earned = effective_balance - total_deposited
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE euv.end_user_id = $1
  AND euv.chain = $2
  AND euv.token_address = $3
LIMIT 1`;

export interface GetEndUserVaultWithBalanceArgs {
    endUserId: string;
    chain: string;
    tokenAddress: string;
}

export interface GetEndUserVaultWithBalanceRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    currentIndex: string;
    tokenSymbol_2: string;
    apy_7d: string | null;
    apy_30d: string | null;
    totalStakedBalance: string;
    pendingDepositBalance: string;
    effectiveBalance: string;
    yieldEarned: string;
}

export async function getEndUserVaultWithBalance(sql: Sql, args: GetEndUserVaultWithBalanceArgs): Promise<GetEndUserVaultWithBalanceRow | null> {
    const rows = await sql.unsafe(getEndUserVaultWithBalanceQuery, [args.endUserId, args.chain, args.tokenAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14],
        currentIndex: row[15],
        tokenSymbol_2: row[16],
        apy_7d: row[17],
        apy_30d: row[18],
        totalStakedBalance: row[19],
        pendingDepositBalance: row[20],
        effectiveBalance: row[21],
        yieldEarned: row[22]
    };
}

export const createEndUserVaultQuery = `-- name: CreateEndUserVault :one
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  chain,
  token_address,
  token_symbol,
  shares,
  weighted_entry_index,
  total_deposited
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING id, end_user_id, client_id, chain, token_address, token_symbol, shares, weighted_entry_index, total_deposited, total_withdrawn, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at`;

export interface CreateEndUserVaultArgs {
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
}

export interface CreateEndUserVaultRow {
    id: string;
    endUserId: string;
    clientId: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function createEndUserVault(sql: Sql, args: CreateEndUserVaultArgs): Promise<CreateEndUserVaultRow | null> {
    const rows = await sql.unsafe(createEndUserVaultQuery, [args.endUserId, args.clientId, args.chain, args.tokenAddress, args.tokenSymbol, args.shares, args.weightedEntryIndex, args.totalDeposited]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        endUserId: row[1],
        clientId: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        shares: row[6],
        weightedEntryIndex: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        lastDepositAt: row[10],
        lastWithdrawalAt: row[11],
        isActive: row[12],
        createdAt: row[13],
        updatedAt: row[14]
    };
}

export const addSharesToUserVaultQuery = `-- name: AddSharesToUserVault :exec
UPDATE end_user_vaults
SET shares = $2,  -- new total shares
    weighted_entry_index = $3,  -- recalculated weighted entry index
    total_deposited = total_deposited + $4,  -- increment deposited amount
    last_deposit_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface AddSharesToUserVaultArgs {
    id: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
}

export async function addSharesToUserVault(sql: Sql, args: AddSharesToUserVaultArgs): Promise<void> {
    await sql.unsafe(addSharesToUserVaultQuery, [args.id, args.shares, args.weightedEntryIndex, args.totalDeposited]);
}

export const burnSharesFromUserVaultQuery = `-- name: BurnSharesFromUserVault :exec
UPDATE end_user_vaults
SET shares = shares - $2,  -- shares to burn
    total_withdrawn = total_withdrawn + $3,  -- withdrawal amount
    last_withdrawal_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface BurnSharesFromUserVaultArgs {
    id: string;
    shares: string;
    totalWithdrawn: string;
}

export async function burnSharesFromUserVault(sql: Sql, args: BurnSharesFromUserVaultArgs): Promise<void> {
    await sql.unsafe(burnSharesFromUserVaultQuery, [args.id, args.shares, args.totalWithdrawn]);
}

export const getTotalSharesForVaultQuery = `-- name: GetTotalSharesForVault :one
SELECT COALESCE(SUM(shares), 0) AS total_user_shares
FROM end_user_vaults
WHERE client_id = $1
  AND chain = $2
  AND token_address = $3
  AND is_active = true`;

export interface GetTotalSharesForVaultArgs {
    clientId: string;
    chain: string;
    tokenAddress: string;
}

export interface GetTotalSharesForVaultRow {
    totalUserShares: string | null;
}

export async function getTotalSharesForVault(sql: Sql, args: GetTotalSharesForVaultArgs): Promise<GetTotalSharesForVaultRow | null> {
    const rows = await sql.unsafe(getTotalSharesForVaultQuery, [args.clientId, args.chain, args.tokenAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalUserShares: row[0]
    };
}

export const getVaultSummaryQuery = `-- name: GetVaultSummary :one

SELECT
  cv.id,
  cv.chain,
  cv.token_symbol,
  cv.current_index,
  cv.pending_deposit_balance,
  cv.total_staked_balance,
  cv.cumulative_yield,
  cv.apy_7d,
  cv.apy_30d,
  cv.total_shares,
  cv.last_index_update,
  COUNT(DISTINCT euv.end_user_id) AS total_users,
  COALESCE(SUM(euv.total_deposited), 0) AS total_user_deposits,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_user_withdrawals
FROM client_vaults cv
LEFT JOIN end_user_vaults euv
  ON cv.client_id = euv.client_id
  AND cv.chain = euv.chain
  AND cv.token_address = euv.token_address
  AND euv.is_active = true
WHERE cv.id = $1
GROUP BY cv.id`;

export interface GetVaultSummaryArgs {
    id: string;
}

export interface GetVaultSummaryRow {
    id: string;
    chain: string;
    tokenSymbol: string;
    currentIndex: string;
    pendingDepositBalance: string;
    totalStakedBalance: string;
    cumulativeYield: string;
    apy_7d: string | null;
    apy_30d: string | null;
    totalShares: string;
    lastIndexUpdate: Date;
    totalUsers: string;
    totalUserDeposits: string | null;
    totalUserWithdrawals: string | null;
}

export async function getVaultSummary(sql: Sql, args: GetVaultSummaryArgs): Promise<GetVaultSummaryRow | null> {
    const rows = await sql.unsafe(getVaultSummaryQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        chain: row[1],
        tokenSymbol: row[2],
        currentIndex: row[3],
        pendingDepositBalance: row[4],
        totalStakedBalance: row[5],
        cumulativeYield: row[6],
        apy_7d: row[7],
        apy_30d: row[8],
        totalShares: row[9],
        lastIndexUpdate: row[10],
        totalUsers: row[11],
        totalUserDeposits: row[12],
        totalUserWithdrawals: row[13]
    };
}

export const listTopUsersByBalanceQuery = `-- name: ListTopUsersByBalance :many
SELECT
  euv.end_user_id,
  eu.user_id,
  euv.shares,
  euv.weighted_entry_index,
  euv.total_deposited,
  euv.total_withdrawn,
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE cv.id = $1
  AND euv.is_active = true
  AND euv.shares > 0
ORDER BY effective_balance DESC
LIMIT $2`;

export interface ListTopUsersByBalanceArgs {
    id: string;
    limit: string;
}

export interface ListTopUsersByBalanceRow {
    endUserId: string;
    userId: string;
    shares: string;
    weightedEntryIndex: string;
    totalDeposited: string;
    totalWithdrawn: string;
    effectiveBalance: string;
    yieldEarned: string;
}

export async function listTopUsersByBalance(sql: Sql, args: ListTopUsersByBalanceArgs): Promise<ListTopUsersByBalanceRow[]> {
    return (await sql.unsafe(listTopUsersByBalanceQuery, [args.id, args.limit]).values()).map(row => ({
        endUserId: row[0],
        userId: row[1],
        shares: row[2],
        weightedEntryIndex: row[3],
        totalDeposited: row[4],
        totalWithdrawn: row[5],
        effectiveBalance: row[6],
        yieldEarned: row[7]
    }));
}

