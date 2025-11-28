import { Sql } from "postgres";

export const getDepositOrderQuery = `-- name: GetDepositOrder :one

SELECT id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at FROM deposit_orders
WHERE id = $1 LIMIT 1`;

export interface GetDepositOrderArgs {
    id: string;
}

export interface GetDepositOrderRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function getDepositOrder(sql: Sql, args: GetDepositOrderArgs): Promise<GetDepositOrderRow | null> {
    const rows = await sql.unsafe(getDepositOrderQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    };
}

export const getDepositOrderByOrderIdQuery = `-- name: GetDepositOrderByOrderId :one
SELECT id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at FROM deposit_orders
WHERE order_id = $1 LIMIT 1`;

export interface GetDepositOrderByOrderIdArgs {
    orderId: string;
}

export interface GetDepositOrderByOrderIdRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function getDepositOrderByOrderId(sql: Sql, args: GetDepositOrderByOrderIdArgs): Promise<GetDepositOrderByOrderIdRow | null> {
    const rows = await sql.unsafe(getDepositOrderByOrderIdQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    };
}

export const listDepositOrdersByClientQuery = `-- name: ListDepositOrdersByClient :many
SELECT id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at FROM deposit_orders
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListDepositOrdersByClientArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListDepositOrdersByClientRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function listDepositOrdersByClient(sql: Sql, args: ListDepositOrdersByClientArgs): Promise<ListDepositOrdersByClientRow[]> {
    return (await sql.unsafe(listDepositOrdersByClientQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    }));
}

export const listDepositOrdersByUserQuery = `-- name: ListDepositOrdersByUser :many
SELECT id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at FROM deposit_orders
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListDepositOrdersByUserArgs {
    userId: string;
    limit: string;
    offset: string;
}

export interface ListDepositOrdersByUserRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function listDepositOrdersByUser(sql: Sql, args: ListDepositOrdersByUserArgs): Promise<ListDepositOrdersByUserRow[]> {
    return (await sql.unsafe(listDepositOrdersByUserQuery, [args.userId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    }));
}

export const listPendingDepositOrdersQuery = `-- name: ListPendingDepositOrders :many
SELECT id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at FROM deposit_orders
WHERE status = 'pending'
ORDER BY created_at ASC`;

export interface ListPendingDepositOrdersRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function listPendingDepositOrders(sql: Sql): Promise<ListPendingDepositOrdersRow[]> {
    return (await sql.unsafe(listPendingDepositOrdersQuery, []).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    }));
}

export const listPendingDepositOrdersByClientQuery = `-- name: ListPendingDepositOrdersByClient :many
SELECT id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at FROM deposit_orders
WHERE client_id = $1
  AND status = 'pending'
ORDER BY created_at ASC`;

export interface ListPendingDepositOrdersByClientArgs {
    clientId: string;
}

export interface ListPendingDepositOrdersByClientRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function listPendingDepositOrdersByClient(sql: Sql, args: ListPendingDepositOrdersByClientArgs): Promise<ListPendingDepositOrdersByClientRow[]> {
    return (await sql.unsafe(listPendingDepositOrdersByClientQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    }));
}

export const createDepositOrderQuery = `-- name: CreateDepositOrder :one
INSERT INTO deposit_orders (
  order_id,
  client_id,
  user_id,
  fiat_amount,
  fiat_currency,
  crypto_amount,
  chain,
  token_symbol,
  token_address,
  on_ramp_provider,
  payment_url,
  qr_code,
  status,
  transaction_hash,
  gateway_fee,
  proxify_fee,
  network_fee,
  total_fees,
  expires_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19
)
RETURNING id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at`;

export interface CreateDepositOrderArgs {
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    expiresAt: Date | null;
}

export interface CreateDepositOrderRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function createDepositOrder(sql: Sql, args: CreateDepositOrderArgs): Promise<CreateDepositOrderRow | null> {
    const rows = await sql.unsafe(createDepositOrderQuery, [args.orderId, args.clientId, args.userId, args.fiatAmount, args.fiatCurrency, args.cryptoAmount, args.chain, args.tokenSymbol, args.tokenAddress, args.onRampProvider, args.paymentUrl, args.qrCode, args.status, args.transactionHash, args.gatewayFee, args.proxifyFee, args.networkFee, args.totalFees, args.expiresAt]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    };
}

export const updateDepositOrderStatusQuery = `-- name: UpdateDepositOrderStatus :one
UPDATE deposit_orders
SET status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at`;

export interface UpdateDepositOrderStatusArgs {
    id: string;
    status: string;
}

export interface UpdateDepositOrderStatusRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function updateDepositOrderStatus(sql: Sql, args: UpdateDepositOrderStatusArgs): Promise<UpdateDepositOrderStatusRow | null> {
    const rows = await sql.unsafe(updateDepositOrderStatusQuery, [args.id, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    };
}

export const completeDepositOrderQuery = `-- name: CompleteDepositOrder :one
UPDATE deposit_orders
SET status = 'completed',
    crypto_amount = $2,
    transaction_hash = $3,
    completed_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING id, order_id, client_id, user_id, fiat_amount, fiat_currency, crypto_amount, chain, token_symbol, token_address, on_ramp_provider, payment_url, qr_code, status, transaction_hash, gateway_fee, proxify_fee, network_fee, total_fees, created_at, updated_at, completed_at, expires_at`;

export interface CompleteDepositOrderArgs {
    id: string;
    cryptoAmount: string | null;
    transactionHash: string | null;
}

export interface CompleteDepositOrderRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    fiatAmount: string;
    fiatCurrency: string;
    cryptoAmount: string | null;
    chain: string;
    tokenSymbol: string;
    tokenAddress: string | null;
    onRampProvider: string;
    paymentUrl: string | null;
    qrCode: string | null;
    status: string;
    transactionHash: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
}

export async function completeDepositOrder(sql: Sql, args: CompleteDepositOrderArgs): Promise<CompleteDepositOrderRow | null> {
    const rows = await sql.unsafe(completeDepositOrderQuery, [args.id, args.cryptoAmount, args.transactionHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        fiatAmount: row[4],
        fiatCurrency: row[5],
        cryptoAmount: row[6],
        chain: row[7],
        tokenSymbol: row[8],
        tokenAddress: row[9],
        onRampProvider: row[10],
        paymentUrl: row[11],
        qrCode: row[12],
        status: row[13],
        transactionHash: row[14],
        gatewayFee: row[15],
        proxifyFee: row[16],
        networkFee: row[17],
        totalFees: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        completedAt: row[21],
        expiresAt: row[22]
    };
}

export const failDepositOrderQuery = `-- name: FailDepositOrder :exec
UPDATE deposit_orders
SET status = 'failed',
    updated_at = NOW()
WHERE id = $1`;

export interface FailDepositOrderArgs {
    id: string;
}

export async function failDepositOrder(sql: Sql, args: FailDepositOrderArgs): Promise<void> {
    await sql.unsafe(failDepositOrderQuery, [args.id]);
}

export const getDepositOrderStatsQuery = `-- name: GetDepositOrderStats :one
SELECT
  COUNT(*) AS total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_orders,
  COALESCE(SUM(fiat_amount) FILTER (WHERE status = 'pending'), 0) AS total_pending_amount,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_completed_amount
FROM deposit_orders
WHERE created_at >= $1
  AND created_at <= $2`;

export interface GetDepositOrderStatsArgs {
    startDate: Date | null;
    endDate: Date | null;
}

export interface GetDepositOrderStatsRow {
    totalOrders: string;
    pendingOrders: string;
    completedOrders: string;
    failedOrders: string;
    totalPendingAmount: string | null;
    totalCompletedAmount: string | null;
}

export async function getDepositOrderStats(sql: Sql, args: GetDepositOrderStatsArgs): Promise<GetDepositOrderStatsRow | null> {
    const rows = await sql.unsafe(getDepositOrderStatsQuery, [args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalOrders: row[0],
        pendingOrders: row[1],
        completedOrders: row[2],
        failedOrders: row[3],
        totalPendingAmount: row[4],
        totalCompletedAmount: row[5]
    };
}

