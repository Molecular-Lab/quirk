import { Sql } from "postgres";

export const getClientVaultQuery = `-- name: GetClientVault :one


SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, is_active, created_at, updated_at FROM client_vaults
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
    strategies: any | null;
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
        strategies: row[13],
        isActive: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    };
}

export const getClientVaultByTokenQuery = `-- name: GetClientVaultByToken :one
SELECT 
  cv.id, cv.client_id, cv.chain, cv.token_address, cv.token_symbol, cv.total_shares, cv.current_index, cv.last_index_update, cv.pending_deposit_balance, cv.total_staked_balance, cv.cumulative_yield, cv.apy_7d, cv.apy_30d, cv.strategies, cv.is_active, cv.created_at, cv.updated_at,
  pa.privy_wallet_address as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
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
    strategies: any | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    custodialWalletAddress: string;
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
        strategies: row[13],
        isActive: row[14],
        createdAt: row[15],
        updatedAt: row[16],
        custodialWalletAddress: row[17]
    };
}

export const getClientVaultByTokenForUpdateQuery = `-- name: GetClientVaultByTokenForUpdate :one
SELECT 
  cv.id, cv.client_id, cv.chain, cv.token_address, cv.token_symbol, cv.total_shares, cv.current_index, cv.last_index_update, cv.pending_deposit_balance, cv.total_staked_balance, cv.cumulative_yield, cv.apy_7d, cv.apy_30d, cv.strategies, cv.is_active, cv.created_at, cv.updated_at,
  pa.privy_wallet_address as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
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
    strategies: any | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    custodialWalletAddress: string;
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
        strategies: row[13],
        isActive: row[14],
        createdAt: row[15],
        updatedAt: row[16],
        custodialWalletAddress: row[17]
    };
}

export const listClientVaultsQuery = `-- name: ListClientVaults :many
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, is_active, created_at, updated_at FROM client_vaults
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
    strategies: any | null;
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
        strategies: row[13],
        isActive: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    }));
}

export const listClientVaultsPendingStakeQuery = `-- name: ListClientVaultsPendingStake :many
SELECT id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, is_active, created_at, updated_at FROM client_vaults
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
    strategies: any | null;
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
        strategies: row[13],
        isActive: row[14],
        createdAt: row[15],
        updatedAt: row[16]
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
    cumulative_yield
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
  )
  RETURNING id, client_id, chain, token_address, token_symbol, total_shares, current_index, last_index_update, pending_deposit_balance, total_staked_balance, cumulative_yield, apy_7d, apy_30d, strategies, is_active, created_at, updated_at
)
SELECT 
  nv.id, nv.client_id, nv.chain, nv.token_address, nv.token_symbol, nv.total_shares, nv.current_index, nv.last_index_update, nv.pending_deposit_balance, nv.total_staked_balance, nv.cumulative_yield, nv.apy_7d, nv.apy_30d, nv.strategies, nv.is_active, nv.created_at, nv.updated_at,
  pa.privy_wallet_address as custodial_wallet_address
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
    strategies: any | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    custodialWalletAddress: string;
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
        strategies: row[13],
        isActive: row[14],
        createdAt: row[15],
        updatedAt: row[16],
        custodialWalletAddress: row[17]
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

SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
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
        isActive: row[8],
        createdAt: row[9],
        updatedAt: row[10]
    };
}

export const getEndUserVaultByClientQuery = `-- name: GetEndUserVaultByClient :one
SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
LIMIT 1`;

export interface GetEndUserVaultByClientArgs {
    endUserId: string;
    clientId: string;
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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVaultByClient(sql: Sql, args: GetEndUserVaultByClientArgs): Promise<GetEndUserVaultByClientRow | null> {
    const rows = await sql.unsafe(getEndUserVaultByClientQuery, [args.endUserId, args.clientId]).values();
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
        isActive: row[8],
        createdAt: row[9],
        updatedAt: row[10]
    };
}

export const getEndUserVaultByClientForUpdateQuery = `-- name: GetEndUserVaultByClientForUpdate :one
SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
FOR UPDATE
LIMIT 1`;

export interface GetEndUserVaultByClientForUpdateArgs {
    endUserId: string;
    clientId: string;
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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getEndUserVaultByClientForUpdate(sql: Sql, args: GetEndUserVaultByClientForUpdateArgs): Promise<GetEndUserVaultByClientForUpdateRow | null> {
    const rows = await sql.unsafe(getEndUserVaultByClientForUpdateQuery, [args.endUserId, args.clientId]).values();
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
        isActive: row[8],
        createdAt: row[9],
        updatedAt: row[10]
    };
}

export const listEndUserVaultsQuery = `-- name: ListEndUserVaults :many
SELECT id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at FROM end_user_vaults
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
        isActive: row[8],
        createdAt: row[9],
        updatedAt: row[10]
    }));
}

export const createEndUserVaultQuery = `-- name: CreateEndUserVault :one
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  total_deposited,
  weighted_entry_index
) VALUES (
  $1, $2, $3, $4
)
RETURNING id, end_user_id, client_id, total_deposited, total_withdrawn, weighted_entry_index, last_deposit_at, last_withdrawal_at, is_active, created_at, updated_at`;

export interface CreateEndUserVaultArgs {
    endUserId: string;
    clientId: string;
    totalDeposited: string;
    weightedEntryIndex: string;
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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function createEndUserVault(sql: Sql, args: CreateEndUserVaultArgs): Promise<CreateEndUserVaultRow | null> {
    const rows = await sql.unsafe(createEndUserVaultQuery, [args.endUserId, args.clientId, args.totalDeposited, args.weightedEntryIndex]).values();
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
        isActive: row[8],
        createdAt: row[9],
        updatedAt: row[10]
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

