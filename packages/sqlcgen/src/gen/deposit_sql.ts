import { Sql } from "postgres";

export const getDepositQuery = `-- name: GetDeposit :one

SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE id = $1 LIMIT 1`;

export interface GetDepositArgs {
    id: string;
}

export interface GetDepositRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function getDeposit(sql: Sql, args: GetDepositArgs): Promise<GetDepositRow | null> {
    const rows = await sql.unsafe(getDepositQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const getDepositByOrderIDQuery = `-- name: GetDepositByOrderID :one
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE order_id = $1 LIMIT 1`;

export interface GetDepositByOrderIDArgs {
    orderId: string;
}

export interface GetDepositByOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function getDepositByOrderID(sql: Sql, args: GetDepositByOrderIDArgs): Promise<GetDepositByOrderIDRow | null> {
    const rows = await sql.unsafe(getDepositByOrderIDQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const getDepositByGatewayOrderIDQuery = `-- name: GetDepositByGatewayOrderID :one
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE gateway_order_id = $1 LIMIT 1`;

export interface GetDepositByGatewayOrderIDArgs {
    gatewayOrderId: string | null;
}

export interface GetDepositByGatewayOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function getDepositByGatewayOrderID(sql: Sql, args: GetDepositByGatewayOrderIDArgs): Promise<GetDepositByGatewayOrderIDRow | null> {
    const rows = await sql.unsafe(getDepositByGatewayOrderIDQuery, [args.gatewayOrderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const getDepositByOrderIDForUpdateQuery = `-- name: GetDepositByOrderIDForUpdate :one
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE order_id = $1
FOR UPDATE
LIMIT 1`;

export interface GetDepositByOrderIDForUpdateArgs {
    orderId: string;
}

export interface GetDepositByOrderIDForUpdateRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function getDepositByOrderIDForUpdate(sql: Sql, args: GetDepositByOrderIDForUpdateArgs): Promise<GetDepositByOrderIDForUpdateRow | null> {
    const rows = await sql.unsafe(getDepositByOrderIDForUpdateQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const listDepositsQuery = `-- name: ListDeposits :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListDepositsArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListDepositsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listDeposits(sql: Sql, args: ListDepositsArgs): Promise<ListDepositsRow[]> {
    return (await sql.unsafe(listDepositsQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listDepositsByUserQuery = `-- name: ListDepositsByUser :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE client_id = $1
  AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListDepositsByUserArgs {
    clientId: string;
    userId: string;
    limit: string;
    offset: string;
}

export interface ListDepositsByUserRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listDepositsByUser(sql: Sql, args: ListDepositsByUserArgs): Promise<ListDepositsByUserRow[]> {
    return (await sql.unsafe(listDepositsByUserQuery, [args.clientId, args.userId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listDepositsByStatusQuery = `-- name: ListDepositsByStatus :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE client_id = $1
  AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListDepositsByStatusArgs {
    clientId: string;
    status: string;
    limit: string;
    offset: string;
}

export interface ListDepositsByStatusRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listDepositsByStatus(sql: Sql, args: ListDepositsByStatusArgs): Promise<ListDepositsByStatusRow[]> {
    return (await sql.unsafe(listDepositsByStatusQuery, [args.clientId, args.status, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listPendingDepositsQuery = `-- name: ListPendingDeposits :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE status = 'pending'
  AND client_id = $1
  AND (expires_at IS NULL OR expires_at > now())
ORDER BY created_at ASC`;

export interface ListPendingDepositsArgs {
    clientId: string;
}

export interface ListPendingDepositsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listPendingDeposits(sql: Sql, args: ListPendingDepositsArgs): Promise<ListPendingDepositsRow[]> {
    return (await sql.unsafe(listPendingDepositsQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listExpiredDepositsQuery = `-- name: ListExpiredDeposits :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE status = 'pending'
  AND expires_at <= now()
ORDER BY created_at ASC
LIMIT $1`;

export interface ListExpiredDepositsArgs {
    limit: string;
}

export interface ListExpiredDepositsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listExpiredDeposits(sql: Sql, args: ListExpiredDepositsArgs): Promise<ListExpiredDepositsRow[]> {
    return (await sql.unsafe(listExpiredDepositsQuery, [args.limit]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const createDepositQuery = `-- name: CreateDeposit :one
INSERT INTO deposit_transactions (
  order_id,
  client_id,
  user_id,
  deposit_type,
  payment_method,
  fiat_amount,
  crypto_amount,
  currency,
  crypto_currency,
  gateway_fee,
  proxify_fee,
  network_fee,
  total_fees,
  status,
  payment_url,
  gateway_order_id,
  client_balance_id,
  deducted_from_client,
  wallet_address,
  expires_at,
  payment_instructions,
  chain,
  token_symbol,
  token_address,
  on_ramp_provider,
  qr_code,
  environment,
  network,
  oracle_address
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
  $21, $22, $23, $24, $25, $26, $27, $28, $29
)
RETURNING id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code`;

export interface CreateDepositArgs {
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    expiresAt: Date | null;
    paymentInstructions: any | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
}

export interface CreateDepositRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function createDeposit(sql: Sql, args: CreateDepositArgs): Promise<CreateDepositRow | null> {
    const rows = await sql.unsafe(createDepositQuery, [args.orderId, args.clientId, args.userId, args.depositType, args.paymentMethod, args.fiatAmount, args.cryptoAmount, args.currency, args.cryptoCurrency, args.gatewayFee, args.proxifyFee, args.networkFee, args.totalFees, args.status, args.paymentUrl, args.gatewayOrderId, args.clientBalanceId, args.deductedFromClient, args.walletAddress, args.expiresAt, args.paymentInstructions, args.chain, args.tokenSymbol, args.tokenAddress, args.onRampProvider, args.qrCode, args.environment, args.network, args.oracleAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const updateDepositGatewayInfoQuery = `-- name: UpdateDepositGatewayInfo :exec
UPDATE deposit_transactions
SET payment_url = $2,
    gateway_order_id = $3,
    updated_at = now()
WHERE id = $1`;

export interface UpdateDepositGatewayInfoArgs {
    id: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
}

export async function updateDepositGatewayInfo(sql: Sql, args: UpdateDepositGatewayInfoArgs): Promise<void> {
    await sql.unsafe(updateDepositGatewayInfoQuery, [args.id, args.paymentUrl, args.gatewayOrderId]);
}

export const completeDepositQuery = `-- name: CompleteDeposit :one
UPDATE deposit_transactions
SET status = 'completed',
    crypto_amount = COALESCE($2, crypto_amount),
    gateway_fee = COALESCE($3, gateway_fee),
    proxify_fee = COALESCE($4, proxify_fee),
    network_fee = COALESCE($5, network_fee),
    total_fees = COALESCE($6, total_fees),
    transaction_hash = COALESCE($7, transaction_hash),
    completed_at = now()
WHERE id = $1
RETURNING id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code`;

export interface CompleteDepositArgs {
    id: string;
    cryptoAmount: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    transactionHash: string | null;
}

export interface CompleteDepositRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function completeDeposit(sql: Sql, args: CompleteDepositArgs): Promise<CompleteDepositRow | null> {
    const rows = await sql.unsafe(completeDepositQuery, [args.id, args.cryptoAmount, args.gatewayFee, args.proxifyFee, args.networkFee, args.totalFees, args.transactionHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const completeDepositByOrderIDQuery = `-- name: CompleteDepositByOrderID :one
UPDATE deposit_transactions
SET status = 'completed',
    crypto_amount = $2,
    transaction_hash = $3,
    completed_at = now()
WHERE order_id = $1
RETURNING id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code`;

export interface CompleteDepositByOrderIDArgs {
    orderId: string;
    cryptoAmount: string | null;
    transactionHash: string | null;
}

export interface CompleteDepositByOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function completeDepositByOrderID(sql: Sql, args: CompleteDepositByOrderIDArgs): Promise<CompleteDepositByOrderIDRow | null> {
    const rows = await sql.unsafe(completeDepositByOrderIDQuery, [args.orderId, args.cryptoAmount, args.transactionHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    };
}

export const failDepositQuery = `-- name: FailDeposit :exec
UPDATE deposit_transactions
SET status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = now()
WHERE id = $1`;

export interface FailDepositArgs {
    id: string;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function failDeposit(sql: Sql, args: FailDepositArgs): Promise<void> {
    await sql.unsafe(failDepositQuery, [args.id, args.errorMessage, args.errorCode]);
}

export const expireDepositQuery = `-- name: ExpireDeposit :exec
UPDATE deposit_transactions
SET status = 'expired'
WHERE id = $1`;

export interface ExpireDepositArgs {
    id: string;
}

export async function expireDeposit(sql: Sql, args: ExpireDepositArgs): Promise<void> {
    await sql.unsafe(expireDepositQuery, [args.id]);
}

export const getDepositQueueItemQuery = `-- name: GetDepositQueueItem :one

SELECT id, client_vault_id, deposit_transaction_id, amount, status, batched_at, staked_at, created_at FROM deposit_batch_queue
WHERE id = $1 LIMIT 1`;

export interface GetDepositQueueItemArgs {
    id: string;
}

export interface GetDepositQueueItemRow {
    id: string;
    clientVaultId: string;
    depositTransactionId: string;
    amount: string;
    status: string;
    batchedAt: Date | null;
    stakedAt: Date | null;
    createdAt: Date;
}

export async function getDepositQueueItem(sql: Sql, args: GetDepositQueueItemArgs): Promise<GetDepositQueueItemRow | null> {
    const rows = await sql.unsafe(getDepositQueueItemQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientVaultId: row[1],
        depositTransactionId: row[2],
        amount: row[3],
        status: row[4],
        batchedAt: row[5],
        stakedAt: row[6],
        createdAt: row[7]
    };
}

export const listPendingDepositQueueQuery = `-- name: ListPendingDepositQueue :many
SELECT id, client_vault_id, deposit_transaction_id, amount, status, batched_at, staked_at, created_at FROM deposit_batch_queue
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT $1`;

export interface ListPendingDepositQueueArgs {
    limit: string;
}

export interface ListPendingDepositQueueRow {
    id: string;
    clientVaultId: string;
    depositTransactionId: string;
    amount: string;
    status: string;
    batchedAt: Date | null;
    stakedAt: Date | null;
    createdAt: Date;
}

export async function listPendingDepositQueue(sql: Sql, args: ListPendingDepositQueueArgs): Promise<ListPendingDepositQueueRow[]> {
    return (await sql.unsafe(listPendingDepositQueueQuery, [args.limit]).values()).map(row => ({
        id: row[0],
        clientVaultId: row[1],
        depositTransactionId: row[2],
        amount: row[3],
        status: row[4],
        batchedAt: row[5],
        stakedAt: row[6],
        createdAt: row[7]
    }));
}

export const listPendingDepositQueueByVaultQuery = `-- name: ListPendingDepositQueueByVault :many
SELECT id, client_vault_id, deposit_transaction_id, amount, status, batched_at, staked_at, created_at FROM deposit_batch_queue
WHERE client_vault_id = $1
  AND status = 'pending'
ORDER BY created_at ASC`;

export interface ListPendingDepositQueueByVaultArgs {
    clientVaultId: string;
}

export interface ListPendingDepositQueueByVaultRow {
    id: string;
    clientVaultId: string;
    depositTransactionId: string;
    amount: string;
    status: string;
    batchedAt: Date | null;
    stakedAt: Date | null;
    createdAt: Date;
}

export async function listPendingDepositQueueByVault(sql: Sql, args: ListPendingDepositQueueByVaultArgs): Promise<ListPendingDepositQueueByVaultRow[]> {
    return (await sql.unsafe(listPendingDepositQueueByVaultQuery, [args.clientVaultId]).values()).map(row => ({
        id: row[0],
        clientVaultId: row[1],
        depositTransactionId: row[2],
        amount: row[3],
        status: row[4],
        batchedAt: row[5],
        stakedAt: row[6],
        createdAt: row[7]
    }));
}

export const createDepositQueueItemQuery = `-- name: CreateDepositQueueItem :one
INSERT INTO deposit_batch_queue (
  client_vault_id,
  deposit_transaction_id,
  amount,
  status
) VALUES (
  $1, $2, $3, $4
)
RETURNING id, client_vault_id, deposit_transaction_id, amount, status, batched_at, staked_at, created_at`;

export interface CreateDepositQueueItemArgs {
    clientVaultId: string;
    depositTransactionId: string;
    amount: string;
    status: string;
}

export interface CreateDepositQueueItemRow {
    id: string;
    clientVaultId: string;
    depositTransactionId: string;
    amount: string;
    status: string;
    batchedAt: Date | null;
    stakedAt: Date | null;
    createdAt: Date;
}

export async function createDepositQueueItem(sql: Sql, args: CreateDepositQueueItemArgs): Promise<CreateDepositQueueItemRow | null> {
    const rows = await sql.unsafe(createDepositQueueItemQuery, [args.clientVaultId, args.depositTransactionId, args.amount, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientVaultId: row[1],
        depositTransactionId: row[2],
        amount: row[3],
        status: row[4],
        batchedAt: row[5],
        stakedAt: row[6],
        createdAt: row[7]
    };
}

export const markDepositAsBatchedQuery = `-- name: MarkDepositAsBatched :exec
UPDATE deposit_batch_queue
SET status = 'batched',
    batched_at = now()
WHERE id = $1`;

export interface MarkDepositAsBatchedArgs {
    id: string;
}

export async function markDepositAsBatched(sql: Sql, args: MarkDepositAsBatchedArgs): Promise<void> {
    await sql.unsafe(markDepositAsBatchedQuery, [args.id]);
}

export const markDepositAsStakedQuery = `-- name: MarkDepositAsStaked :exec
UPDATE deposit_batch_queue
SET status = 'staked',
    staked_at = now()
WHERE id = $1`;

export interface MarkDepositAsStakedArgs {
    id: string;
}

export async function markDepositAsStaked(sql: Sql, args: MarkDepositAsStakedArgs): Promise<void> {
    await sql.unsafe(markDepositAsStakedQuery, [args.id]);
}

export const markDepositBatchAsStakedQuery = `-- name: MarkDepositBatchAsStaked :exec
UPDATE deposit_batch_queue
SET status = 'staked',
    staked_at = now()
WHERE client_vault_id = $1
  AND status = 'batched'`;

export interface MarkDepositBatchAsStakedArgs {
    clientVaultId: string;
}

export async function markDepositBatchAsStaked(sql: Sql, args: MarkDepositBatchAsStakedArgs): Promise<void> {
    await sql.unsafe(markDepositBatchAsStakedQuery, [args.clientVaultId]);
}

export const getDepositStatsQuery = `-- name: GetDepositStats :one

SELECT
  COUNT(*) AS total_deposits,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_deposits,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_deposits,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_deposits,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_volume,
  COALESCE(SUM(total_fees) FILTER (WHERE status = 'completed'), 0) AS total_fees_collected,
  COALESCE(AVG(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS avg_deposit_amount
FROM deposit_transactions
WHERE client_id = $1
  AND created_at >= $2  -- start date
  AND created_at <= $3`;

export interface GetDepositStatsArgs {
    clientId: string;
    startDate: Date;
    endDate: Date;
}

export interface GetDepositStatsRow {
    totalDeposits: string;
    completedDeposits: string;
    pendingDeposits: string;
    failedDeposits: string;
    totalVolume: string | null;
    totalFeesCollected: string | null;
    avgDepositAmount: string | null;
}

export async function getDepositStats(sql: Sql, args: GetDepositStatsArgs): Promise<GetDepositStatsRow | null> {
    const rows = await sql.unsafe(getDepositStatsQuery, [args.clientId, args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalDeposits: row[0],
        completedDeposits: row[1],
        pendingDeposits: row[2],
        failedDeposits: row[3],
        totalVolume: row[4],
        totalFeesCollected: row[5],
        avgDepositAmount: row[6]
    };
}

export const listAllPendingDepositsQuery = `-- name: ListAllPendingDeposits :many


SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE status = 'pending'
  AND deposit_type = 'external'
ORDER BY created_at ASC`;

export interface ListAllPendingDepositsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listAllPendingDeposits(sql: Sql): Promise<ListAllPendingDepositsRow[]> {
    return (await sql.unsafe(listAllPendingDepositsQuery, []).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listPendingDepositsByClientQuery = `-- name: ListPendingDepositsByClient :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE client_id = $1
  AND status = 'pending'
  AND deposit_type = 'external'
ORDER BY created_at ASC`;

export interface ListPendingDepositsByClientArgs {
    clientId: string;
}

export interface ListPendingDepositsByClientRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listPendingDepositsByClient(sql: Sql, args: ListPendingDepositsByClientArgs): Promise<ListPendingDepositsByClientRow[]> {
    return (await sql.unsafe(listPendingDepositsByClientQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listAllPendingDepositsByEnvironmentQuery = `-- name: ListAllPendingDepositsByEnvironment :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE status = 'pending'
  AND deposit_type = 'external'
  AND environment = $1
ORDER BY created_at ASC`;

export interface ListAllPendingDepositsByEnvironmentArgs {
    environment: string | null;
}

export interface ListAllPendingDepositsByEnvironmentRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listAllPendingDepositsByEnvironment(sql: Sql, args: ListAllPendingDepositsByEnvironmentArgs): Promise<ListAllPendingDepositsByEnvironmentRow[]> {
    return (await sql.unsafe(listAllPendingDepositsByEnvironmentQuery, [args.environment]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

export const listPendingDepositsByClientAndEnvironmentQuery = `-- name: ListPendingDepositsByClientAndEnvironment :many
SELECT id, order_id, client_id, user_id, deposit_type, payment_method, fiat_amount, crypto_amount, currency, crypto_currency, gateway_fee, proxify_fee, network_fee, total_fees, status, payment_url, gateway_order_id, client_balance_id, deducted_from_client, wallet_address, chain, token_symbol, token_address, on_ramp_provider, qr_code, transaction_hash, payment_instructions, environment, network, oracle_address, created_at, completed_at, failed_at, expires_at, error_message, error_code FROM deposit_transactions
WHERE client_id = $1
  AND status = 'pending'
  AND deposit_type = 'external'
  AND environment = $2
ORDER BY created_at ASC`;

export interface ListPendingDepositsByClientAndEnvironmentArgs {
    clientId: string;
    environment: string | null;
}

export interface ListPendingDepositsByClientAndEnvironmentRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    depositType: string;
    paymentMethod: string | null;
    fiatAmount: string;
    cryptoAmount: string | null;
    currency: string;
    cryptoCurrency: string | null;
    gatewayFee: string | null;
    proxifyFee: string | null;
    networkFee: string | null;
    totalFees: string | null;
    status: string;
    paymentUrl: string | null;
    gatewayOrderId: string | null;
    clientBalanceId: string | null;
    deductedFromClient: string | null;
    walletAddress: string | null;
    chain: string | null;
    tokenSymbol: string | null;
    tokenAddress: string | null;
    onRampProvider: string | null;
    qrCode: string | null;
    transactionHash: string | null;
    paymentInstructions: any | null;
    environment: string | null;
    network: string | null;
    oracleAddress: string | null;
    createdAt: Date;
    completedAt: Date | null;
    failedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function listPendingDepositsByClientAndEnvironment(sql: Sql, args: ListPendingDepositsByClientAndEnvironmentArgs): Promise<ListPendingDepositsByClientAndEnvironmentRow[]> {
    return (await sql.unsafe(listPendingDepositsByClientAndEnvironmentQuery, [args.clientId, args.environment]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        depositType: row[4],
        paymentMethod: row[5],
        fiatAmount: row[6],
        cryptoAmount: row[7],
        currency: row[8],
        cryptoCurrency: row[9],
        gatewayFee: row[10],
        proxifyFee: row[11],
        networkFee: row[12],
        totalFees: row[13],
        status: row[14],
        paymentUrl: row[15],
        gatewayOrderId: row[16],
        clientBalanceId: row[17],
        deductedFromClient: row[18],
        walletAddress: row[19],
        chain: row[20],
        tokenSymbol: row[21],
        tokenAddress: row[22],
        onRampProvider: row[23],
        qrCode: row[24],
        transactionHash: row[25],
        paymentInstructions: row[26],
        environment: row[27],
        network: row[28],
        oracleAddress: row[29],
        createdAt: row[30],
        completedAt: row[31],
        failedAt: row[32],
        expiresAt: row[33],
        errorMessage: row[34],
        errorCode: row[35]
    }));
}

