import { Sql } from "postgres";

export const createDefiTransactionQuery = `-- name: CreateDefiTransaction :one
INSERT INTO defi_transactions (
    client_id,
    vault_id,
    end_user_id,
    tx_hash,
    block_number,
    chain,
    operation_type,
    protocol,
    token_symbol,
    token_address,
    amount,
    gas_used,
    gas_price,
    gas_cost_eth,
    gas_cost_usd,
    status,
    error_message,
    environment,
    executed_at,
    confirmed_at
) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20
) RETURNING id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at`;

export interface CreateDefiTransactionArgs {
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
}

export interface CreateDefiTransactionRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function createDefiTransaction(sql: Sql, args: CreateDefiTransactionArgs): Promise<CreateDefiTransactionRow | null> {
    const rows = await sql.unsafe(createDefiTransactionQuery, [args.clientId, args.vaultId, args.endUserId, args.txHash, args.blockNumber, args.chain, args.operationType, args.protocol, args.tokenSymbol, args.tokenAddress, args.amount, args.gasUsed, args.gasPrice, args.gasCostEth, args.gasCostUsd, args.status, args.errorMessage, args.environment, args.executedAt, args.confirmedAt]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    };
}

export const getDefiTransactionByIdQuery = `-- name: GetDefiTransactionById :one
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions WHERE id = $1`;

export interface GetDefiTransactionByIdArgs {
    id: string;
}

export interface GetDefiTransactionByIdRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getDefiTransactionById(sql: Sql, args: GetDefiTransactionByIdArgs): Promise<GetDefiTransactionByIdRow | null> {
    const rows = await sql.unsafe(getDefiTransactionByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    };
}

export const getDefiTransactionByHashQuery = `-- name: GetDefiTransactionByHash :one
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions WHERE tx_hash = $1`;

export interface GetDefiTransactionByHashArgs {
    txHash: string;
}

export interface GetDefiTransactionByHashRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getDefiTransactionByHash(sql: Sql, args: GetDefiTransactionByHashArgs): Promise<GetDefiTransactionByHashRow | null> {
    const rows = await sql.unsafe(getDefiTransactionByHashQuery, [args.txHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    };
}

export const confirmDefiTransactionQuery = `-- name: ConfirmDefiTransaction :exec
UPDATE defi_transactions
SET 
    status = 'confirmed',
    confirmed_at = now(),
    block_number = $1,
    gas_used = $2,
    gas_price = $3,
    gas_cost_eth = $4,
    gas_cost_usd = $5
WHERE id = $6`;

export interface ConfirmDefiTransactionArgs {
    blockNumber: string | null;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    id: string;
}

export async function confirmDefiTransaction(sql: Sql, args: ConfirmDefiTransactionArgs): Promise<void> {
    await sql.unsafe(confirmDefiTransactionQuery, [args.blockNumber, args.gasUsed, args.gasPrice, args.gasCostEth, args.gasCostUsd, args.id]);
}

export const failDefiTransactionQuery = `-- name: FailDefiTransaction :exec
UPDATE defi_transactions
SET 
    status = 'failed',
    error_message = $1
WHERE id = $2`;

export interface FailDefiTransactionArgs {
    errorMessage: string | null;
    id: string;
}

export async function failDefiTransaction(sql: Sql, args: FailDefiTransactionArgs): Promise<void> {
    await sql.unsafe(failDefiTransactionQuery, [args.errorMessage, args.id]);
}

export const listDefiTransactionsByClientQuery = `-- name: ListDefiTransactionsByClient :many
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions
WHERE client_id = $1
  AND environment = $2
ORDER BY executed_at DESC
LIMIT $4 OFFSET $3`;

export interface ListDefiTransactionsByClientArgs {
    clientId: string;
    environment: string;
    offsetVal: string;
    limitVal: string;
}

export interface ListDefiTransactionsByClientRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listDefiTransactionsByClient(sql: Sql, args: ListDefiTransactionsByClientArgs): Promise<ListDefiTransactionsByClientRow[]> {
    return (await sql.unsafe(listDefiTransactionsByClientQuery, [args.clientId, args.environment, args.offsetVal, args.limitVal]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    }));
}

export const listDefiTransactionsByVaultQuery = `-- name: ListDefiTransactionsByVault :many
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions
WHERE vault_id = $1
ORDER BY executed_at DESC
LIMIT $3 OFFSET $2`;

export interface ListDefiTransactionsByVaultArgs {
    vaultId: string | null;
    offsetVal: string;
    limitVal: string;
}

export interface ListDefiTransactionsByVaultRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listDefiTransactionsByVault(sql: Sql, args: ListDefiTransactionsByVaultArgs): Promise<ListDefiTransactionsByVaultRow[]> {
    return (await sql.unsafe(listDefiTransactionsByVaultQuery, [args.vaultId, args.offsetVal, args.limitVal]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    }));
}

export const listDefiTransactionsByUserQuery = `-- name: ListDefiTransactionsByUser :many
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions
WHERE end_user_id = $1
ORDER BY executed_at DESC
LIMIT $3 OFFSET $2`;

export interface ListDefiTransactionsByUserArgs {
    endUserId: string | null;
    offsetVal: string;
    limitVal: string;
}

export interface ListDefiTransactionsByUserRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listDefiTransactionsByUser(sql: Sql, args: ListDefiTransactionsByUserArgs): Promise<ListDefiTransactionsByUserRow[]> {
    return (await sql.unsafe(listDefiTransactionsByUserQuery, [args.endUserId, args.offsetVal, args.limitVal]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    }));
}

export const listDefiTransactionsByProtocolQuery = `-- name: ListDefiTransactionsByProtocol :many
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions
WHERE client_id = $1
  AND protocol = $2
  AND environment = $3
ORDER BY executed_at DESC
LIMIT $5 OFFSET $4`;

export interface ListDefiTransactionsByProtocolArgs {
    clientId: string;
    protocol: string;
    environment: string;
    offsetVal: string;
    limitVal: string;
}

export interface ListDefiTransactionsByProtocolRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listDefiTransactionsByProtocol(sql: Sql, args: ListDefiTransactionsByProtocolArgs): Promise<ListDefiTransactionsByProtocolRow[]> {
    return (await sql.unsafe(listDefiTransactionsByProtocolQuery, [args.clientId, args.protocol, args.environment, args.offsetVal, args.limitVal]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    }));
}

export const listPendingDefiTransactionsQuery = `-- name: ListPendingDefiTransactions :many
SELECT id, client_id, vault_id, end_user_id, tx_hash, block_number, chain, operation_type, protocol, token_symbol, token_address, amount, gas_used, gas_price, gas_cost_eth, gas_cost_usd, status, error_message, environment, executed_at, confirmed_at, created_at, updated_at FROM defi_transactions
WHERE status = 'pending'
ORDER BY executed_at ASC
LIMIT $1`;

export interface ListPendingDefiTransactionsArgs {
    limitVal: string;
}

export interface ListPendingDefiTransactionsRow {
    id: string;
    clientId: string;
    vaultId: string | null;
    endUserId: string | null;
    txHash: string;
    blockNumber: string | null;
    chain: string;
    operationType: string;
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    gasUsed: string | null;
    gasPrice: string | null;
    gasCostEth: string | null;
    gasCostUsd: string | null;
    status: string;
    errorMessage: string | null;
    environment: string;
    executedAt: Date;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listPendingDefiTransactions(sql: Sql, args: ListPendingDefiTransactionsArgs): Promise<ListPendingDefiTransactionsRow[]> {
    return (await sql.unsafe(listPendingDefiTransactionsQuery, [args.limitVal]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        vaultId: row[2],
        endUserId: row[3],
        txHash: row[4],
        blockNumber: row[5],
        chain: row[6],
        operationType: row[7],
        protocol: row[8],
        tokenSymbol: row[9],
        tokenAddress: row[10],
        amount: row[11],
        gasUsed: row[12],
        gasPrice: row[13],
        gasCostEth: row[14],
        gasCostUsd: row[15],
        status: row[16],
        errorMessage: row[17],
        environment: row[18],
        executedAt: row[19],
        confirmedAt: row[20],
        createdAt: row[21],
        updatedAt: row[22]
    }));
}

export const getDefiTransactionStatsQuery = `-- name: GetDefiTransactionStats :one
SELECT 
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COALESCE(SUM(gas_cost_usd) FILTER (WHERE status = 'confirmed'), 0) as total_gas_cost_usd,
    COALESCE(SUM(amount) FILTER (WHERE operation_type = 'deposit' AND status = 'confirmed'), 0) as total_deposited,
    COALESCE(SUM(amount) FILTER (WHERE operation_type = 'withdrawal' AND status = 'confirmed'), 0) as total_withdrawn
FROM defi_transactions
WHERE client_id = $1
  AND environment = $2`;

export interface GetDefiTransactionStatsArgs {
    clientId: string;
    environment: string;
}

export interface GetDefiTransactionStatsRow {
    totalTransactions: string;
    confirmedCount: string;
    pendingCount: string;
    failedCount: string;
    totalGasCostUsd: string | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
}

export async function getDefiTransactionStats(sql: Sql, args: GetDefiTransactionStatsArgs): Promise<GetDefiTransactionStatsRow | null> {
    const rows = await sql.unsafe(getDefiTransactionStatsQuery, [args.clientId, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalTransactions: row[0],
        confirmedCount: row[1],
        pendingCount: row[2],
        failedCount: row[3],
        totalGasCostUsd: row[4],
        totalDeposited: row[5],
        totalWithdrawn: row[6]
    };
}

export const countDefiTransactionsByClientQuery = `-- name: CountDefiTransactionsByClient :one
SELECT COUNT(*) FROM defi_transactions
WHERE client_id = $1
  AND environment = $2`;

export interface CountDefiTransactionsByClientArgs {
    clientId: string;
    environment: string;
}

export interface CountDefiTransactionsByClientRow {
    count: string;
}

export async function countDefiTransactionsByClient(sql: Sql, args: CountDefiTransactionsByClientArgs): Promise<CountDefiTransactionsByClientRow | null> {
    const rows = await sql.unsafe(countDefiTransactionsByClientQuery, [args.clientId, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        count: row[0]
    };
}

