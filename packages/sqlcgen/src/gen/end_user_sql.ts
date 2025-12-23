import { Sql } from "postgres";

export const getEndUserQuery = `-- name: GetEndUser :one

SELECT id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment FROM end_users
WHERE id = $1 LIMIT 1`;

export interface GetEndUserArgs {
    id: string;
}

export interface GetEndUserRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function getEndUser(sql: Sql, args: GetEndUserArgs): Promise<GetEndUserRow | null> {
    const rows = await sql.unsafe(getEndUserQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    };
}

export const getEndUserByClientAndUserIDQuery = `-- name: GetEndUserByClientAndUserID :one
SELECT id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment FROM end_users
WHERE client_id = $1
  AND user_id = $2
LIMIT 1`;

export interface GetEndUserByClientAndUserIDArgs {
    clientId: string;
    userId: string;
}

export interface GetEndUserByClientAndUserIDRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function getEndUserByClientAndUserID(sql: Sql, args: GetEndUserByClientAndUserIDArgs): Promise<GetEndUserByClientAndUserIDRow | null> {
    const rows = await sql.unsafe(getEndUserByClientAndUserIDQuery, [args.clientId, args.userId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    };
}

export const listEndUsersQuery = `-- name: ListEndUsers :many
SELECT id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment FROM end_users
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListEndUsersArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListEndUsersRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function listEndUsers(sql: Sql, args: ListEndUsersArgs): Promise<ListEndUsersRow[]> {
    return (await sql.unsafe(listEndUsersQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    }));
}

export const listActiveEndUsersQuery = `-- name: ListActiveEndUsers :many
SELECT id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment FROM end_users
WHERE client_id = $1
  AND is_active = true
ORDER BY created_at DESC`;

export interface ListActiveEndUsersArgs {
    clientId: string;
}

export interface ListActiveEndUsersRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function listActiveEndUsers(sql: Sql, args: ListActiveEndUsersArgs): Promise<ListActiveEndUsersRow[]> {
    return (await sql.unsafe(listActiveEndUsersQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    }));
}

export const createEndUserQuery = `-- name: CreateEndUser :one
INSERT INTO end_users (
  client_id,
  user_id,
  user_type,
  user_wallet_address,
  is_active,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment`;

export interface CreateEndUserArgs {
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    status: string;
}

export interface CreateEndUserRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function createEndUser(sql: Sql, args: CreateEndUserArgs): Promise<CreateEndUserRow | null> {
    const rows = await sql.unsafe(createEndUserQuery, [args.clientId, args.userId, args.userType, args.userWalletAddress, args.isActive, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    };
}

export const updateEndUserQuery = `-- name: UpdateEndUser :one
UPDATE end_users
SET user_wallet_address = COALESCE($2, user_wallet_address),
    is_active = COALESCE($3, is_active),
    updated_at = now()
WHERE id = $1
RETURNING id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment`;

export interface UpdateEndUserArgs {
    id: string;
    userWalletAddress: string | null;
    isActive: boolean | null;
}

export interface UpdateEndUserRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function updateEndUser(sql: Sql, args: UpdateEndUserArgs): Promise<UpdateEndUserRow | null> {
    const rows = await sql.unsafe(updateEndUserQuery, [args.id, args.userWalletAddress, args.isActive]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    };
}

export const updateEndUserDepositTimestampQuery = `-- name: UpdateEndUserDepositTimestamp :exec
UPDATE end_users
SET last_deposit_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface UpdateEndUserDepositTimestampArgs {
    id: string;
}

export async function updateEndUserDepositTimestamp(sql: Sql, args: UpdateEndUserDepositTimestampArgs): Promise<void> {
    await sql.unsafe(updateEndUserDepositTimestampQuery, [args.id]);
}

export const updateEndUserWithdrawalTimestampQuery = `-- name: UpdateEndUserWithdrawalTimestamp :exec
UPDATE end_users
SET last_withdrawal_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface UpdateEndUserWithdrawalTimestampArgs {
    id: string;
}

export async function updateEndUserWithdrawalTimestamp(sql: Sql, args: UpdateEndUserWithdrawalTimestampArgs): Promise<void> {
    await sql.unsafe(updateEndUserWithdrawalTimestampQuery, [args.id]);
}

export const setFirstDepositQuery = `-- name: SetFirstDeposit :exec
UPDATE end_users
SET first_deposit_at = COALESCE(first_deposit_at, now()),
    last_deposit_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface SetFirstDepositArgs {
    id: string;
}

export async function setFirstDeposit(sql: Sql, args: SetFirstDepositArgs): Promise<void> {
    await sql.unsafe(setFirstDepositQuery, [args.id]);
}

export const activateEndUserQuery = `-- name: ActivateEndUser :exec
UPDATE end_users
SET is_active = true,
    updated_at = now()
WHERE id = $1`;

export interface ActivateEndUserArgs {
    id: string;
}

export async function activateEndUser(sql: Sql, args: ActivateEndUserArgs): Promise<void> {
    await sql.unsafe(activateEndUserQuery, [args.id]);
}

export const deactivateEndUserQuery = `-- name: DeactivateEndUser :exec
UPDATE end_users
SET is_active = false,
    updated_at = now()
WHERE id = $1`;

export interface DeactivateEndUserArgs {
    id: string;
}

export async function deactivateEndUser(sql: Sql, args: DeactivateEndUserArgs): Promise<void> {
    await sql.unsafe(deactivateEndUserQuery, [args.id]);
}

export const updateEndUserStatusQuery = `-- name: UpdateEndUserStatus :one
UPDATE end_users
SET status = $2,
    updated_at = now()
WHERE id = $1
RETURNING id, client_id, user_id, user_type, user_wallet_address, is_active, first_deposit_at, last_deposit_at, last_withdrawal_at, created_at, updated_at, status, environment`;

export interface UpdateEndUserStatusArgs {
    id: string;
    status: string;
}

export interface UpdateEndUserStatusRow {
    id: string;
    clientId: string;
    userId: string;
    userType: string;
    userWalletAddress: string | null;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    environment: string;
}

export async function updateEndUserStatus(sql: Sql, args: UpdateEndUserStatusArgs): Promise<UpdateEndUserStatusRow | null> {
    const rows = await sql.unsafe(updateEndUserStatusQuery, [args.id, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        userId: row[2],
        userType: row[3],
        userWalletAddress: row[4],
        isActive: row[5],
        firstDepositAt: row[6],
        lastDepositAt: row[7],
        lastWithdrawalAt: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11],
        environment: row[12]
    };
}

export const deleteEndUserQuery = `-- name: DeleteEndUser :exec
DELETE FROM end_users
WHERE id = $1`;

export interface DeleteEndUserArgs {
    id: string;
}

export async function deleteEndUser(sql: Sql, args: DeleteEndUserArgs): Promise<void> {
    await sql.unsafe(deleteEndUserQuery, [args.id]);
}

export const getEndUserPortfolioQuery = `-- name: GetEndUserPortfolio :one

SELECT
  eu.id,
  eu.user_id,
  eu.client_id,
  eu.user_type,
  eu.first_deposit_at,
  eu.last_deposit_at,
  eu.last_withdrawal_at,
  COUNT(DISTINCT euv.id) AS total_vaults,
  COALESCE(SUM(euv.total_deposited), 0) AS total_deposited,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_withdrawn,
  COALESCE(SUM(euv.shares * cv.current_index / 1000000000000000000), 0) AS total_effective_balance,
  COALESCE(SUM((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited), 0) AS total_yield_earned
FROM end_users eu
LEFT JOIN end_user_vaults euv ON eu.id = euv.end_user_id AND euv.is_active = true
LEFT JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE eu.id = $1
GROUP BY eu.id`;

export interface GetEndUserPortfolioArgs {
    id: string;
}

export interface GetEndUserPortfolioRow {
    id: string;
    userId: string;
    clientId: string;
    userType: string;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    lastWithdrawalAt: Date | null;
    totalVaults: string;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
    totalEffectiveBalance: string | null;
    totalYieldEarned: string | null;
}

export async function getEndUserPortfolio(sql: Sql, args: GetEndUserPortfolioArgs): Promise<GetEndUserPortfolioRow | null> {
    const rows = await sql.unsafe(getEndUserPortfolioQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        userId: row[1],
        clientId: row[2],
        userType: row[3],
        firstDepositAt: row[4],
        lastDepositAt: row[5],
        lastWithdrawalAt: row[6],
        totalVaults: row[7],
        totalDeposited: row[8],
        totalWithdrawn: row[9],
        totalEffectiveBalance: row[10],
        totalYieldEarned: row[11]
    };
}

export const listEndUsersWithBalancesQuery = `-- name: ListEndUsersWithBalances :many
SELECT
  eu.id,
  eu.user_id,
  eu.user_type,
  eu.is_active,
  eu.first_deposit_at,
  eu.last_deposit_at,
  COALESCE(SUM(euv.shares * cv.current_index / 1000000000000000000), 0) AS total_balance,
  COALESCE(SUM(euv.total_deposited), 0) AS total_deposited,
  COALESCE(SUM((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited), 0) AS total_yield
FROM end_users eu
LEFT JOIN end_user_vaults euv ON eu.id = euv.end_user_id AND euv.is_active = true
LEFT JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE eu.client_id = $1
GROUP BY eu.id
ORDER BY total_balance DESC
LIMIT $2 OFFSET $3`;

export interface ListEndUsersWithBalancesArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListEndUsersWithBalancesRow {
    id: string;
    userId: string;
    userType: string;
    isActive: boolean;
    firstDepositAt: Date | null;
    lastDepositAt: Date | null;
    totalBalance: string | null;
    totalDeposited: string | null;
    totalYield: string | null;
}

export async function listEndUsersWithBalances(sql: Sql, args: ListEndUsersWithBalancesArgs): Promise<ListEndUsersWithBalancesRow[]> {
    return (await sql.unsafe(listEndUsersWithBalancesQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        userId: row[1],
        userType: row[2],
        isActive: row[3],
        firstDepositAt: row[4],
        lastDepositAt: row[5],
        totalBalance: row[6],
        totalDeposited: row[7],
        totalYield: row[8]
    }));
}

