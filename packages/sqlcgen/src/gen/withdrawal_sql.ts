import { Sql } from "postgres";

export const getWithdrawalQuery = `-- name: GetWithdrawal :one

SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE id = $1 LIMIT 1`;

export interface GetWithdrawalArgs {
    id: string;
}

export interface GetWithdrawalRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function getWithdrawal(sql: Sql, args: GetWithdrawalArgs): Promise<GetWithdrawalRow | null> {
    const rows = await sql.unsafe(getWithdrawalQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    };
}

export const getWithdrawalByOrderIDQuery = `-- name: GetWithdrawalByOrderID :one
SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE order_id = $1 LIMIT 1`;

export interface GetWithdrawalByOrderIDArgs {
    orderId: string;
}

export interface GetWithdrawalByOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function getWithdrawalByOrderID(sql: Sql, args: GetWithdrawalByOrderIDArgs): Promise<GetWithdrawalByOrderIDRow | null> {
    const rows = await sql.unsafe(getWithdrawalByOrderIDQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    };
}

export const getWithdrawalByGatewayOrderIDQuery = `-- name: GetWithdrawalByGatewayOrderID :one
SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE gateway_order_id = $1 LIMIT 1`;

export interface GetWithdrawalByGatewayOrderIDArgs {
    gatewayOrderId: string | null;
}

export interface GetWithdrawalByGatewayOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function getWithdrawalByGatewayOrderID(sql: Sql, args: GetWithdrawalByGatewayOrderIDArgs): Promise<GetWithdrawalByGatewayOrderIDRow | null> {
    const rows = await sql.unsafe(getWithdrawalByGatewayOrderIDQuery, [args.gatewayOrderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    };
}

export const getWithdrawalByOrderIDForUpdateQuery = `-- name: GetWithdrawalByOrderIDForUpdate :one
SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE order_id = $1
FOR UPDATE
LIMIT 1`;

export interface GetWithdrawalByOrderIDForUpdateArgs {
    orderId: string;
}

export interface GetWithdrawalByOrderIDForUpdateRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function getWithdrawalByOrderIDForUpdate(sql: Sql, args: GetWithdrawalByOrderIDForUpdateArgs): Promise<GetWithdrawalByOrderIDForUpdateRow | null> {
    const rows = await sql.unsafe(getWithdrawalByOrderIDForUpdateQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    };
}

export const listWithdrawalsQuery = `-- name: ListWithdrawals :many
SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListWithdrawalsArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListWithdrawalsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function listWithdrawals(sql: Sql, args: ListWithdrawalsArgs): Promise<ListWithdrawalsRow[]> {
    return (await sql.unsafe(listWithdrawalsQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    }));
}

export const listWithdrawalsByUserQuery = `-- name: ListWithdrawalsByUser :many
SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE client_id = $1
  AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListWithdrawalsByUserArgs {
    clientId: string;
    userId: string;
    limit: string;
    offset: string;
}

export interface ListWithdrawalsByUserRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function listWithdrawalsByUser(sql: Sql, args: ListWithdrawalsByUserArgs): Promise<ListWithdrawalsByUserRow[]> {
    return (await sql.unsafe(listWithdrawalsByUserQuery, [args.clientId, args.userId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    }));
}

export const listWithdrawalsByStatusQuery = `-- name: ListWithdrawalsByStatus :many
SELECT id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address FROM withdrawal_transactions
WHERE client_id = $1
  AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListWithdrawalsByStatusArgs {
    clientId: string;
    status: string;
    limit: string;
    offset: string;
}

export interface ListWithdrawalsByStatusRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function listWithdrawalsByStatus(sql: Sql, args: ListWithdrawalsByStatusArgs): Promise<ListWithdrawalsByStatusRow[]> {
    return (await sql.unsafe(listWithdrawalsByStatusQuery, [args.clientId, args.status, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    }));
}

export const createWithdrawalQuery = `-- name: CreateWithdrawal :one
INSERT INTO withdrawal_transactions (
  order_id,
  client_id,
  user_id,
  requested_amount,
  currency,
  destination_type,
  destination_details,
  status,
  environment,
  network,
  oracle_address
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address`;

export interface CreateWithdrawalArgs {
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    currency: string;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export interface CreateWithdrawalRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function createWithdrawal(sql: Sql, args: CreateWithdrawalArgs): Promise<CreateWithdrawalRow | null> {
    const rows = await sql.unsafe(createWithdrawalQuery, [args.orderId, args.clientId, args.userId, args.requestedAmount, args.currency, args.destinationType, args.destinationDetails, args.status, args.environment, args.network, args.oracleAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    };
}

export const updateWithdrawalGatewayInfoQuery = `-- name: UpdateWithdrawalGatewayInfo :exec
UPDATE withdrawal_transactions
SET gateway_order_id = $2,
    withdrawal_fee = COALESCE($3, withdrawal_fee),
    network_fee = COALESCE($4, network_fee),
    updated_at = now()
WHERE id = $1`;

export interface UpdateWithdrawalGatewayInfoArgs {
    id: string;
    gatewayOrderId: string | null;
    withdrawalFee: string | null;
    networkFee: string | null;
}

export async function updateWithdrawalGatewayInfo(sql: Sql, args: UpdateWithdrawalGatewayInfoArgs): Promise<void> {
    await sql.unsafe(updateWithdrawalGatewayInfoQuery, [args.id, args.gatewayOrderId, args.withdrawalFee, args.networkFee]);
}

export const updateWithdrawalStatusQuery = `-- name: UpdateWithdrawalStatus :exec
UPDATE withdrawal_transactions
SET status = $2,
    updated_at = now()
WHERE id = $1`;

export interface UpdateWithdrawalStatusArgs {
    id: string;
    status: string;
}

export async function updateWithdrawalStatus(sql: Sql, args: UpdateWithdrawalStatusArgs): Promise<void> {
    await sql.unsafe(updateWithdrawalStatusQuery, [args.id, args.status]);
}

export const completeWithdrawalQuery = `-- name: CompleteWithdrawal :one
UPDATE withdrawal_transactions
SET status = 'completed',
    actual_amount = COALESCE($2, actual_amount),
    completed_at = now()
WHERE id = $1
RETURNING id, order_id, client_id, user_id, requested_amount, actual_amount, currency, withdrawal_fee, network_fee, gateway_order_id, destination_type, destination_details, status, created_at, completed_at, failed_at, error_message, error_code, environment, network, oracle_address`;

export interface CompleteWithdrawalArgs {
    id: string;
    actualAmount: string | null;
}

export interface CompleteWithdrawalRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    requestedAmount: string;
    actualAmount: string | null;
    currency: string;
    withdrawalFee: string | null;
    networkFee: string | null;
    gatewayOrderId: string | null;
    destinationType: string;
    destinationDetails: any | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export async function completeWithdrawal(sql: Sql, args: CompleteWithdrawalArgs): Promise<CompleteWithdrawalRow | null> {
    const rows = await sql.unsafe(completeWithdrawalQuery, [args.id, args.actualAmount]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        requestedAmount: row[4],
        actualAmount: row[5],
        currency: row[6],
        withdrawalFee: row[7],
        networkFee: row[8],
        gatewayOrderId: row[9],
        destinationType: row[10],
        destinationDetails: row[11],
        status: row[12],
        createdAt: row[13],
        completedAt: row[14],
        failedAt: row[15],
        errorMessage: row[16],
        errorCode: row[17],
        environment: row[18],
        network: row[19],
        oracleAddress: row[20]
    };
}

export const failWithdrawalQuery = `-- name: FailWithdrawal :exec
UPDATE withdrawal_transactions
SET status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = now()
WHERE id = $1`;

export interface FailWithdrawalArgs {
    id: string;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function failWithdrawal(sql: Sql, args: FailWithdrawalArgs): Promise<void> {
    await sql.unsafe(failWithdrawalQuery, [args.id, args.errorMessage, args.errorCode]);
}

export const getWithdrawalQueueItemQuery = `-- name: GetWithdrawalQueueItem :one

SELECT id, client_id, withdrawal_transaction_id, end_user_vault_id, shares_to_burn, estimated_amount, actual_amount, protocols_to_unstake, priority, status, queued_at, unstaking_started_at, ready_at, completed_at, error_message, created_at, updated_at FROM withdrawal_queue
WHERE id = $1 LIMIT 1`;

export interface GetWithdrawalQueueItemArgs {
    id: string;
}

export interface GetWithdrawalQueueItemRow {
    id: string;
    clientId: string;
    withdrawalTransactionId: string;
    endUserVaultId: string;
    sharesToBurn: string;
    estimatedAmount: string;
    actualAmount: string | null;
    protocolsToUnstake: any | null;
    priority: number;
    status: string;
    queuedAt: Date;
    unstakingStartedAt: Date | null;
    readyAt: Date | null;
    completedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getWithdrawalQueueItem(sql: Sql, args: GetWithdrawalQueueItemArgs): Promise<GetWithdrawalQueueItemRow | null> {
    const rows = await sql.unsafe(getWithdrawalQueueItemQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        withdrawalTransactionId: row[2],
        endUserVaultId: row[3],
        sharesToBurn: row[4],
        estimatedAmount: row[5],
        actualAmount: row[6],
        protocolsToUnstake: row[7],
        priority: row[8],
        status: row[9],
        queuedAt: row[10],
        unstakingStartedAt: row[11],
        readyAt: row[12],
        completedAt: row[13],
        errorMessage: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    };
}

export const getWithdrawalQueueByTransactionQuery = `-- name: GetWithdrawalQueueByTransaction :one
SELECT id, client_id, withdrawal_transaction_id, end_user_vault_id, shares_to_burn, estimated_amount, actual_amount, protocols_to_unstake, priority, status, queued_at, unstaking_started_at, ready_at, completed_at, error_message, created_at, updated_at FROM withdrawal_queue
WHERE withdrawal_transaction_id = $1 LIMIT 1`;

export interface GetWithdrawalQueueByTransactionArgs {
    withdrawalTransactionId: string;
}

export interface GetWithdrawalQueueByTransactionRow {
    id: string;
    clientId: string;
    withdrawalTransactionId: string;
    endUserVaultId: string;
    sharesToBurn: string;
    estimatedAmount: string;
    actualAmount: string | null;
    protocolsToUnstake: any | null;
    priority: number;
    status: string;
    queuedAt: Date;
    unstakingStartedAt: Date | null;
    readyAt: Date | null;
    completedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getWithdrawalQueueByTransaction(sql: Sql, args: GetWithdrawalQueueByTransactionArgs): Promise<GetWithdrawalQueueByTransactionRow | null> {
    const rows = await sql.unsafe(getWithdrawalQueueByTransactionQuery, [args.withdrawalTransactionId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        withdrawalTransactionId: row[2],
        endUserVaultId: row[3],
        sharesToBurn: row[4],
        estimatedAmount: row[5],
        actualAmount: row[6],
        protocolsToUnstake: row[7],
        priority: row[8],
        status: row[9],
        queuedAt: row[10],
        unstakingStartedAt: row[11],
        readyAt: row[12],
        completedAt: row[13],
        errorMessage: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    };
}

export const listQueuedWithdrawalsQuery = `-- name: ListQueuedWithdrawals :many
SELECT id, client_id, withdrawal_transaction_id, end_user_vault_id, shares_to_burn, estimated_amount, actual_amount, protocols_to_unstake, priority, status, queued_at, unstaking_started_at, ready_at, completed_at, error_message, created_at, updated_at FROM withdrawal_queue
WHERE status = 'queued'
ORDER BY priority DESC, queued_at ASC
LIMIT $1`;

export interface ListQueuedWithdrawalsArgs {
    limit: string;
}

export interface ListQueuedWithdrawalsRow {
    id: string;
    clientId: string;
    withdrawalTransactionId: string;
    endUserVaultId: string;
    sharesToBurn: string;
    estimatedAmount: string;
    actualAmount: string | null;
    protocolsToUnstake: any | null;
    priority: number;
    status: string;
    queuedAt: Date;
    unstakingStartedAt: Date | null;
    readyAt: Date | null;
    completedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listQueuedWithdrawals(sql: Sql, args: ListQueuedWithdrawalsArgs): Promise<ListQueuedWithdrawalsRow[]> {
    return (await sql.unsafe(listQueuedWithdrawalsQuery, [args.limit]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        withdrawalTransactionId: row[2],
        endUserVaultId: row[3],
        sharesToBurn: row[4],
        estimatedAmount: row[5],
        actualAmount: row[6],
        protocolsToUnstake: row[7],
        priority: row[8],
        status: row[9],
        queuedAt: row[10],
        unstakingStartedAt: row[11],
        readyAt: row[12],
        completedAt: row[13],
        errorMessage: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    }));
}

export const listWithdrawalQueueByVaultQuery = `-- name: ListWithdrawalQueueByVault :many
SELECT id, client_id, withdrawal_transaction_id, end_user_vault_id, shares_to_burn, estimated_amount, actual_amount, protocols_to_unstake, priority, status, queued_at, unstaking_started_at, ready_at, completed_at, error_message, created_at, updated_at FROM withdrawal_queue
WHERE end_user_vault_id = $1
ORDER BY queued_at DESC`;

export interface ListWithdrawalQueueByVaultArgs {
    endUserVaultId: string;
}

export interface ListWithdrawalQueueByVaultRow {
    id: string;
    clientId: string;
    withdrawalTransactionId: string;
    endUserVaultId: string;
    sharesToBurn: string;
    estimatedAmount: string;
    actualAmount: string | null;
    protocolsToUnstake: any | null;
    priority: number;
    status: string;
    queuedAt: Date;
    unstakingStartedAt: Date | null;
    readyAt: Date | null;
    completedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listWithdrawalQueueByVault(sql: Sql, args: ListWithdrawalQueueByVaultArgs): Promise<ListWithdrawalQueueByVaultRow[]> {
    return (await sql.unsafe(listWithdrawalQueueByVaultQuery, [args.endUserVaultId]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        withdrawalTransactionId: row[2],
        endUserVaultId: row[3],
        sharesToBurn: row[4],
        estimatedAmount: row[5],
        actualAmount: row[6],
        protocolsToUnstake: row[7],
        priority: row[8],
        status: row[9],
        queuedAt: row[10],
        unstakingStartedAt: row[11],
        readyAt: row[12],
        completedAt: row[13],
        errorMessage: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    }));
}

export const createWithdrawalQueueItemQuery = `-- name: CreateWithdrawalQueueItem :one
INSERT INTO withdrawal_queue (
  client_id,
  withdrawal_transaction_id,
  end_user_vault_id,
  shares_to_burn,
  estimated_amount,
  protocols_to_unstake,
  priority,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING id, client_id, withdrawal_transaction_id, end_user_vault_id, shares_to_burn, estimated_amount, actual_amount, protocols_to_unstake, priority, status, queued_at, unstaking_started_at, ready_at, completed_at, error_message, created_at, updated_at`;

export interface CreateWithdrawalQueueItemArgs {
    clientId: string;
    withdrawalTransactionId: string;
    endUserVaultId: string;
    sharesToBurn: string;
    estimatedAmount: string;
    protocolsToUnstake: any | null;
    priority: number;
    status: string;
}

export interface CreateWithdrawalQueueItemRow {
    id: string;
    clientId: string;
    withdrawalTransactionId: string;
    endUserVaultId: string;
    sharesToBurn: string;
    estimatedAmount: string;
    actualAmount: string | null;
    protocolsToUnstake: any | null;
    priority: number;
    status: string;
    queuedAt: Date;
    unstakingStartedAt: Date | null;
    readyAt: Date | null;
    completedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function createWithdrawalQueueItem(sql: Sql, args: CreateWithdrawalQueueItemArgs): Promise<CreateWithdrawalQueueItemRow | null> {
    const rows = await sql.unsafe(createWithdrawalQueueItemQuery, [args.clientId, args.withdrawalTransactionId, args.endUserVaultId, args.sharesToBurn, args.estimatedAmount, args.protocolsToUnstake, args.priority, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        withdrawalTransactionId: row[2],
        endUserVaultId: row[3],
        sharesToBurn: row[4],
        estimatedAmount: row[5],
        actualAmount: row[6],
        protocolsToUnstake: row[7],
        priority: row[8],
        status: row[9],
        queuedAt: row[10],
        unstakingStartedAt: row[11],
        readyAt: row[12],
        completedAt: row[13],
        errorMessage: row[14],
        createdAt: row[15],
        updatedAt: row[16]
    };
}

export const updateWithdrawalQueueStatusQuery = `-- name: UpdateWithdrawalQueueStatus :exec
UPDATE withdrawal_queue
SET status = $2,
    updated_at = now()
WHERE id = $1`;

export interface UpdateWithdrawalQueueStatusArgs {
    id: string;
    status: string;
}

export async function updateWithdrawalQueueStatus(sql: Sql, args: UpdateWithdrawalQueueStatusArgs): Promise<void> {
    await sql.unsafe(updateWithdrawalQueueStatusQuery, [args.id, args.status]);
}

export const startUnstakingQuery = `-- name: StartUnstaking :exec
UPDATE withdrawal_queue
SET status = 'unstaking',
    unstaking_started_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface StartUnstakingArgs {
    id: string;
}

export async function startUnstaking(sql: Sql, args: StartUnstakingArgs): Promise<void> {
    await sql.unsafe(startUnstakingQuery, [args.id]);
}

export const markWithdrawalReadyQuery = `-- name: MarkWithdrawalReady :exec
UPDATE withdrawal_queue
SET status = 'ready',
    actual_amount = $2,
    ready_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface MarkWithdrawalReadyArgs {
    id: string;
    actualAmount: string | null;
}

export async function markWithdrawalReady(sql: Sql, args: MarkWithdrawalReadyArgs): Promise<void> {
    await sql.unsafe(markWithdrawalReadyQuery, [args.id, args.actualAmount]);
}

export const markWithdrawalProcessingQuery = `-- name: MarkWithdrawalProcessing :exec
UPDATE withdrawal_queue
SET status = 'processing',
    updated_at = now()
WHERE id = $1`;

export interface MarkWithdrawalProcessingArgs {
    id: string;
}

export async function markWithdrawalProcessing(sql: Sql, args: MarkWithdrawalProcessingArgs): Promise<void> {
    await sql.unsafe(markWithdrawalProcessingQuery, [args.id]);
}

export const completeWithdrawalQueueQuery = `-- name: CompleteWithdrawalQueue :exec
UPDATE withdrawal_queue
SET status = 'completed',
    completed_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface CompleteWithdrawalQueueArgs {
    id: string;
}

export async function completeWithdrawalQueue(sql: Sql, args: CompleteWithdrawalQueueArgs): Promise<void> {
    await sql.unsafe(completeWithdrawalQueueQuery, [args.id]);
}

export const failWithdrawalQueueQuery = `-- name: FailWithdrawalQueue :exec
UPDATE withdrawal_queue
SET status = 'failed',
    error_message = $2,
    updated_at = now()
WHERE id = $1`;

export interface FailWithdrawalQueueArgs {
    id: string;
    errorMessage: string | null;
}

export async function failWithdrawalQueue(sql: Sql, args: FailWithdrawalQueueArgs): Promise<void> {
    await sql.unsafe(failWithdrawalQueueQuery, [args.id, args.errorMessage]);
}

export const getAggregatedUnstakingPlanQuery = `-- name: GetAggregatedUnstakingPlan :many
SELECT
  wq.client_id,
  da.protocol_id,
  sdp.name AS protocol_name,
  da.chain,
  da.token_address,
  da.token_symbol,
  jsonb_agg(
    jsonb_build_object(
      'withdrawal_queue_id', wq.id,
      'withdrawal_transaction_id', wq.withdrawal_transaction_id,
      'amount', (wq.protocols_to_unstake->0->>'amount')::numeric
    )
  ) AS withdrawals,
  SUM((wq.protocols_to_unstake->0->>'amount')::numeric) AS total_to_unstake
FROM withdrawal_queue wq
JOIN end_user_vaults euv ON wq.end_user_vault_id = euv.id
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
JOIN defi_allocations da
  ON da.client_vault_id = cv.id
  AND da.status = 'active'
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE wq.status = 'queued'
  AND wq.client_id = $1
GROUP BY wq.client_id, da.protocol_id, sdp.name, da.chain, da.token_address, da.token_symbol
ORDER BY total_to_unstake DESC`;

export interface GetAggregatedUnstakingPlanArgs {
    clientId: string;
}

export interface GetAggregatedUnstakingPlanRow {
    clientId: string;
    protocolId: string;
    protocolName: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    withdrawals: any;
    totalToUnstake: string;
}

export async function getAggregatedUnstakingPlan(sql: Sql, args: GetAggregatedUnstakingPlanArgs): Promise<GetAggregatedUnstakingPlanRow[]> {
    return (await sql.unsafe(getAggregatedUnstakingPlanQuery, [args.clientId]).values()).map(row => ({
        clientId: row[0],
        protocolId: row[1],
        protocolName: row[2],
        chain: row[3],
        tokenAddress: row[4],
        tokenSymbol: row[5],
        withdrawals: row[6],
        totalToUnstake: row[7]
    }));
}

export const getWithdrawalStatsQuery = `-- name: GetWithdrawalStats :one

SELECT
  COUNT(*) AS total_withdrawals,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_withdrawals,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_withdrawals,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_withdrawals,
  COALESCE(SUM(actual_amount) FILTER (WHERE status = 'completed'), 0) AS total_volume,
  COALESCE(SUM(withdrawal_fee) FILTER (WHERE status = 'completed'), 0) AS total_fees_collected,
  COALESCE(AVG(actual_amount) FILTER (WHERE status = 'completed'), 0) AS avg_withdrawal_amount
FROM withdrawal_transactions
WHERE client_id = $1
  AND created_at >= $2  -- start date
  AND created_at <= $3`;

export interface GetWithdrawalStatsArgs {
    clientId: string;
    startDate: Date;
    endDate: Date;
}

export interface GetWithdrawalStatsRow {
    totalWithdrawals: string;
    completedWithdrawals: string;
    pendingWithdrawals: string;
    failedWithdrawals: string;
    totalVolume: string | null;
    totalFeesCollected: string | null;
    avgWithdrawalAmount: string | null;
}

export async function getWithdrawalStats(sql: Sql, args: GetWithdrawalStatsArgs): Promise<GetWithdrawalStatsRow | null> {
    const rows = await sql.unsafe(getWithdrawalStatsQuery, [args.clientId, args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalWithdrawals: row[0],
        completedWithdrawals: row[1],
        pendingWithdrawals: row[2],
        failedWithdrawals: row[3],
        totalVolume: row[4],
        totalFeesCollected: row[5],
        avgWithdrawalAmount: row[6]
    };
}

