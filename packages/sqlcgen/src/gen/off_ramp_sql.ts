import { Sql } from "postgres";

export const getOffRampQuery = `-- name: GetOffRamp :one

SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE id = $1 LIMIT 1`;

export interface GetOffRampArgs {
    id: string;
}

export interface GetOffRampRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function getOffRamp(sql: Sql, args: GetOffRampArgs): Promise<GetOffRampRow | null> {
    const rows = await sql.unsafe(getOffRampQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const getOffRampByOrderIDQuery = `-- name: GetOffRampByOrderID :one
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE order_id = $1 LIMIT 1`;

export interface GetOffRampByOrderIDArgs {
    orderId: string;
}

export interface GetOffRampByOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function getOffRampByOrderID(sql: Sql, args: GetOffRampByOrderIDArgs): Promise<GetOffRampByOrderIDRow | null> {
    const rows = await sql.unsafe(getOffRampByOrderIDQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const getOffRampByOrderIDForUpdateQuery = `-- name: GetOffRampByOrderIDForUpdate :one
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE order_id = $1
FOR UPDATE
LIMIT 1`;

export interface GetOffRampByOrderIDForUpdateArgs {
    orderId: string;
}

export interface GetOffRampByOrderIDForUpdateRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function getOffRampByOrderIDForUpdate(sql: Sql, args: GetOffRampByOrderIDForUpdateArgs): Promise<GetOffRampByOrderIDForUpdateRow | null> {
    const rows = await sql.unsafe(getOffRampByOrderIDForUpdateQuery, [args.orderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const getOffRampByProviderOrderIDQuery = `-- name: GetOffRampByProviderOrderID :one
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE provider_order_id = $1 LIMIT 1`;

export interface GetOffRampByProviderOrderIDArgs {
    providerOrderId: string | null;
}

export interface GetOffRampByProviderOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function getOffRampByProviderOrderID(sql: Sql, args: GetOffRampByProviderOrderIDArgs): Promise<GetOffRampByProviderOrderIDRow | null> {
    const rows = await sql.unsafe(getOffRampByProviderOrderIDQuery, [args.providerOrderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const listOffRampsQuery = `-- name: ListOffRamps :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListOffRampsArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListOffRampsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listOffRamps(sql: Sql, args: ListOffRampsArgs): Promise<ListOffRampsRow[]> {
    return (await sql.unsafe(listOffRampsQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listOffRampsByUserQuery = `-- name: ListOffRampsByUser :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE client_id = $1
  AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListOffRampsByUserArgs {
    clientId: string;
    userId: string;
    limit: string;
    offset: string;
}

export interface ListOffRampsByUserRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listOffRampsByUser(sql: Sql, args: ListOffRampsByUserArgs): Promise<ListOffRampsByUserRow[]> {
    return (await sql.unsafe(listOffRampsByUserQuery, [args.clientId, args.userId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listOffRampsByEndUserQuery = `-- name: ListOffRampsByEndUser :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE end_user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListOffRampsByEndUserArgs {
    endUserId: string | null;
    limit: string;
    offset: string;
}

export interface ListOffRampsByEndUserRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listOffRampsByEndUser(sql: Sql, args: ListOffRampsByEndUserArgs): Promise<ListOffRampsByEndUserRow[]> {
    return (await sql.unsafe(listOffRampsByEndUserQuery, [args.endUserId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listOffRampsByStatusQuery = `-- name: ListOffRampsByStatus :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE client_id = $1
  AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4`;

export interface ListOffRampsByStatusArgs {
    clientId: string;
    status: string;
    limit: string;
    offset: string;
}

export interface ListOffRampsByStatusRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listOffRampsByStatus(sql: Sql, args: ListOffRampsByStatusArgs): Promise<ListOffRampsByStatusRow[]> {
    return (await sql.unsafe(listOffRampsByStatusQuery, [args.clientId, args.status, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listPendingOffRampsQuery = `-- name: ListPendingOffRamps :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE status = 'pending'
  AND client_id = $1
ORDER BY created_at ASC`;

export interface ListPendingOffRampsArgs {
    clientId: string;
}

export interface ListPendingOffRampsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listPendingOffRamps(sql: Sql, args: ListPendingOffRampsArgs): Promise<ListPendingOffRampsRow[]> {
    return (await sql.unsafe(listPendingOffRampsQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listProcessingOffRampsQuery = `-- name: ListProcessingOffRamps :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE status = 'processing'
  AND client_id = $1
ORDER BY submitted_at ASC`;

export interface ListProcessingOffRampsArgs {
    clientId: string;
}

export interface ListProcessingOffRampsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listProcessingOffRamps(sql: Sql, args: ListProcessingOffRampsArgs): Promise<ListProcessingOffRampsRow[]> {
    return (await sql.unsafe(listProcessingOffRampsQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const createOffRampQuery = `-- name: CreateOffRamp :one
INSERT INTO off_ramp_transactions (
  order_id,
  client_id,
  user_id,
  end_user_id,
  off_ramp_type,
  off_ramp_provider,
  crypto_amount,
  crypto_currency,
  chain,
  token_address,
  source_wallet_address,
  fiat_amount,
  fiat_currency,
  destination_type,
  destination_details,
  exchange_rate,
  rate_locked_at,
  rate_expires_at,
  provider_fee,
  network_fee,
  platform_fee,
  total_fees,
  net_fiat_amount,
  status,
  environment,
  network,
  metadata
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
  $21, $22, $23, $24, $25, $26, $27
)
RETURNING id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata`;

export interface CreateOffRampArgs {
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    environment: string | null;
    network: string | null;
    metadata: any | null;
}

export interface CreateOffRampRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function createOffRamp(sql: Sql, args: CreateOffRampArgs): Promise<CreateOffRampRow | null> {
    const rows = await sql.unsafe(createOffRampQuery, [args.orderId, args.clientId, args.userId, args.endUserId, args.offRampType, args.offRampProvider, args.cryptoAmount, args.cryptoCurrency, args.chain, args.tokenAddress, args.sourceWalletAddress, args.fiatAmount, args.fiatCurrency, args.destinationType, args.destinationDetails, args.exchangeRate, args.rateLockedAt, args.rateExpiresAt, args.providerFee, args.networkFee, args.platformFee, args.totalFees, args.netFiatAmount, args.status, args.environment, args.network, args.metadata]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const updateOffRampProviderQuery = `-- name: UpdateOffRampProvider :exec
UPDATE off_ramp_transactions
SET provider_order_id = $2,
    provider_reference = $3,
    status = 'processing',
    submitted_at = now()
WHERE id = $1`;

export interface UpdateOffRampProviderArgs {
    id: string;
    providerOrderId: string | null;
    providerReference: string | null;
}

export async function updateOffRampProvider(sql: Sql, args: UpdateOffRampProviderArgs): Promise<void> {
    await sql.unsafe(updateOffRampProviderQuery, [args.id, args.providerOrderId, args.providerReference]);
}

export const updateOffRampBurnHashQuery = `-- name: UpdateOffRampBurnHash :exec
UPDATE off_ramp_transactions
SET burn_transaction_hash = $2,
    status = 'awaiting_confirmation'
WHERE id = $1`;

export interface UpdateOffRampBurnHashArgs {
    id: string;
    burnTransactionHash: string | null;
}

export async function updateOffRampBurnHash(sql: Sql, args: UpdateOffRampBurnHashArgs): Promise<void> {
    await sql.unsafe(updateOffRampBurnHashQuery, [args.id, args.burnTransactionHash]);
}

export const completeOffRampQuery = `-- name: CompleteOffRamp :one
UPDATE off_ramp_transactions
SET status = 'completed',
    fiat_amount = COALESCE($2, fiat_amount),
    net_fiat_amount = COALESCE($3, net_fiat_amount),
    settlement_reference = COALESCE($4, settlement_reference),
    settlement_date = COALESCE($5, settlement_date),
    completed_at = now()
WHERE id = $1
RETURNING id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata`;

export interface CompleteOffRampArgs {
    id: string;
    fiatAmount: string | null;
    netFiatAmount: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
}

export interface CompleteOffRampRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function completeOffRamp(sql: Sql, args: CompleteOffRampArgs): Promise<CompleteOffRampRow | null> {
    const rows = await sql.unsafe(completeOffRampQuery, [args.id, args.fiatAmount, args.netFiatAmount, args.settlementReference, args.settlementDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const completeOffRampByOrderIDQuery = `-- name: CompleteOffRampByOrderID :one
UPDATE off_ramp_transactions
SET status = 'completed',
    settlement_reference = $2,
    completed_at = now()
WHERE order_id = $1
RETURNING id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata`;

export interface CompleteOffRampByOrderIDArgs {
    orderId: string;
    settlementReference: string | null;
}

export interface CompleteOffRampByOrderIDRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function completeOffRampByOrderID(sql: Sql, args: CompleteOffRampByOrderIDArgs): Promise<CompleteOffRampByOrderIDRow | null> {
    const rows = await sql.unsafe(completeOffRampByOrderIDQuery, [args.orderId, args.settlementReference]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    };
}

export const failOffRampQuery = `-- name: FailOffRamp :exec
UPDATE off_ramp_transactions
SET status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = now()
WHERE id = $1`;

export interface FailOffRampArgs {
    id: string;
    errorMessage: string | null;
    errorCode: string | null;
}

export async function failOffRamp(sql: Sql, args: FailOffRampArgs): Promise<void> {
    await sql.unsafe(failOffRampQuery, [args.id, args.errorMessage, args.errorCode]);
}

export const cancelOffRampQuery = `-- name: CancelOffRamp :exec
UPDATE off_ramp_transactions
SET status = 'cancelled',
    cancelled_at = now()
WHERE id = $1`;

export interface CancelOffRampArgs {
    id: string;
}

export async function cancelOffRamp(sql: Sql, args: CancelOffRampArgs): Promise<void> {
    await sql.unsafe(cancelOffRampQuery, [args.id]);
}

export const refundOffRampQuery = `-- name: RefundOffRamp :exec
UPDATE off_ramp_transactions
SET status = 'refunded',
    refunded_at = now(),
    error_message = $2
WHERE id = $1`;

export interface RefundOffRampArgs {
    id: string;
    errorMessage: string | null;
}

export async function refundOffRamp(sql: Sql, args: RefundOffRampArgs): Promise<void> {
    await sql.unsafe(refundOffRampQuery, [args.id, args.errorMessage]);
}

export const incrementOffRampRetryQuery = `-- name: IncrementOffRampRetry :exec
UPDATE off_ramp_transactions
SET retry_count = retry_count + 1,
    error_message = NULL,
    error_code = NULL,
    status = 'pending'
WHERE id = $1`;

export interface IncrementOffRampRetryArgs {
    id: string;
}

export async function incrementOffRampRetry(sql: Sql, args: IncrementOffRampRetryArgs): Promise<void> {
    await sql.unsafe(incrementOffRampRetryQuery, [args.id]);
}

export const getOffRampStatsQuery = `-- name: GetOffRampStats :one

SELECT
  COUNT(*) AS total_offramps,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_offramps,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_offramps,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing_offramps,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_offramps,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_crypto_volume,
  COALESCE(SUM(fiat_amount) FILTER (WHERE status = 'completed'), 0) AS total_fiat_volume,
  COALESCE(SUM(total_fees) FILTER (WHERE status = 'completed'), 0) AS total_fees_collected,
  COALESCE(AVG(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS avg_offramp_amount
FROM off_ramp_transactions
WHERE client_id = $1
  AND created_at >= $2
  AND created_at <= $3`;

export interface GetOffRampStatsArgs {
    clientId: string;
    startDate: Date;
    endDate: Date;
}

export interface GetOffRampStatsRow {
    totalOfframps: string;
    completedOfframps: string;
    pendingOfframps: string;
    processingOfframps: string;
    failedOfframps: string;
    totalCryptoVolume: string | null;
    totalFiatVolume: string | null;
    totalFeesCollected: string | null;
    avgOfframpAmount: string | null;
}

export async function getOffRampStats(sql: Sql, args: GetOffRampStatsArgs): Promise<GetOffRampStatsRow | null> {
    const rows = await sql.unsafe(getOffRampStatsQuery, [args.clientId, args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalOfframps: row[0],
        completedOfframps: row[1],
        pendingOfframps: row[2],
        processingOfframps: row[3],
        failedOfframps: row[4],
        totalCryptoVolume: row[5],
        totalFiatVolume: row[6],
        totalFeesCollected: row[7],
        avgOfframpAmount: row[8]
    };
}

export const getOffRampStatsByEnvironmentQuery = `-- name: GetOffRampStatsByEnvironment :one
SELECT
  COUNT(*) AS total_offramps,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_offramps,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_crypto_volume,
  COALESCE(SUM(fiat_amount) FILTER (WHERE status = 'completed'), 0) AS total_fiat_volume
FROM off_ramp_transactions
WHERE client_id = $1
  AND environment = $2`;

export interface GetOffRampStatsByEnvironmentArgs {
    clientId: string;
    environment: string | null;
}

export interface GetOffRampStatsByEnvironmentRow {
    totalOfframps: string;
    completedOfframps: string;
    totalCryptoVolume: string | null;
    totalFiatVolume: string | null;
}

export async function getOffRampStatsByEnvironment(sql: Sql, args: GetOffRampStatsByEnvironmentArgs): Promise<GetOffRampStatsByEnvironmentRow | null> {
    const rows = await sql.unsafe(getOffRampStatsByEnvironmentQuery, [args.clientId, args.environment]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalOfframps: row[0],
        completedOfframps: row[1],
        totalCryptoVolume: row[2],
        totalFiatVolume: row[3]
    };
}

export const listAllPendingOffRampsQuery = `-- name: ListAllPendingOffRamps :many

SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE status = 'pending'
ORDER BY created_at ASC`;

export interface ListAllPendingOffRampsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listAllPendingOffRamps(sql: Sql): Promise<ListAllPendingOffRampsRow[]> {
    return (await sql.unsafe(listAllPendingOffRampsQuery, []).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listAllProcessingOffRampsQuery = `-- name: ListAllProcessingOffRamps :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE status = 'processing'
ORDER BY submitted_at ASC`;

export interface ListAllProcessingOffRampsRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listAllProcessingOffRamps(sql: Sql): Promise<ListAllProcessingOffRampsRow[]> {
    return (await sql.unsafe(listAllProcessingOffRampsQuery, []).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const listPendingOffRampsByClientQuery = `-- name: ListPendingOffRampsByClient :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE client_id = $1
  AND status = 'pending'
ORDER BY created_at ASC`;

export interface ListPendingOffRampsByClientArgs {
    clientId: string;
}

export interface ListPendingOffRampsByClientRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function listPendingOffRampsByClient(sql: Sql, args: ListPendingOffRampsByClientArgs): Promise<ListPendingOffRampsByClientRow[]> {
    return (await sql.unsafe(listPendingOffRampsByClientQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

export const getUserTotalOffRampedQuery = `-- name: GetUserTotalOffRamped :one

SELECT
  COALESCE(SUM(crypto_amount), 0) AS total_crypto,
  COALESCE(SUM(fiat_amount), 0) AS total_fiat
FROM off_ramp_transactions
WHERE end_user_id = $1
  AND status = 'completed'`;

export interface GetUserTotalOffRampedArgs {
    endUserId: string | null;
}

export interface GetUserTotalOffRampedRow {
    totalCrypto: string | null;
    totalFiat: string | null;
}

export async function getUserTotalOffRamped(sql: Sql, args: GetUserTotalOffRampedArgs): Promise<GetUserTotalOffRampedRow | null> {
    const rows = await sql.unsafe(getUserTotalOffRampedQuery, [args.endUserId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalCrypto: row[0],
        totalFiat: row[1]
    };
}

export const getUserOffRampHistoryQuery = `-- name: GetUserOffRampHistory :many
SELECT id, order_id, client_id, user_id, end_user_id, off_ramp_type, off_ramp_provider, crypto_amount, crypto_currency, chain, token_address, source_wallet_address, fiat_amount, fiat_currency, destination_type, destination_details, exchange_rate, rate_locked_at, rate_expires_at, provider_fee, network_fee, platform_fee, total_fees, net_fiat_amount, status, provider_order_id, provider_reference, burn_transaction_hash, settlement_reference, settlement_date, environment, network, created_at, submitted_at, completed_at, failed_at, cancelled_at, refunded_at, error_message, error_code, retry_count, metadata FROM off_ramp_transactions
WHERE end_user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface GetUserOffRampHistoryArgs {
    endUserId: string | null;
    limit: string;
    offset: string;
}

export interface GetUserOffRampHistoryRow {
    id: string;
    orderId: string;
    clientId: string;
    userId: string;
    endUserId: string | null;
    offRampType: string;
    offRampProvider: string | null;
    cryptoAmount: string;
    cryptoCurrency: string;
    chain: string;
    tokenAddress: string | null;
    sourceWalletAddress: string | null;
    fiatAmount: string | null;
    fiatCurrency: string;
    destinationType: string;
    destinationDetails: any | null;
    exchangeRate: string | null;
    rateLockedAt: Date | null;
    rateExpiresAt: Date | null;
    providerFee: string | null;
    networkFee: string | null;
    platformFee: string | null;
    totalFees: string | null;
    netFiatAmount: string | null;
    status: string;
    providerOrderId: string | null;
    providerReference: string | null;
    burnTransactionHash: string | null;
    settlementReference: string | null;
    settlementDate: Date | null;
    environment: string | null;
    network: string | null;
    createdAt: Date;
    submittedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
    errorMessage: string | null;
    errorCode: string | null;
    retryCount: number | null;
    metadata: any | null;
}

export async function getUserOffRampHistory(sql: Sql, args: GetUserOffRampHistoryArgs): Promise<GetUserOffRampHistoryRow[]> {
    return (await sql.unsafe(getUserOffRampHistoryQuery, [args.endUserId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        orderId: row[1],
        clientId: row[2],
        userId: row[3],
        endUserId: row[4],
        offRampType: row[5],
        offRampProvider: row[6],
        cryptoAmount: row[7],
        cryptoCurrency: row[8],
        chain: row[9],
        tokenAddress: row[10],
        sourceWalletAddress: row[11],
        fiatAmount: row[12],
        fiatCurrency: row[13],
        destinationType: row[14],
        destinationDetails: row[15],
        exchangeRate: row[16],
        rateLockedAt: row[17],
        rateExpiresAt: row[18],
        providerFee: row[19],
        networkFee: row[20],
        platformFee: row[21],
        totalFees: row[22],
        netFiatAmount: row[23],
        status: row[24],
        providerOrderId: row[25],
        providerReference: row[26],
        burnTransactionHash: row[27],
        settlementReference: row[28],
        settlementDate: row[29],
        environment: row[30],
        network: row[31],
        createdAt: row[32],
        submittedAt: row[33],
        completedAt: row[34],
        failedAt: row[35],
        cancelledAt: row[36],
        refundedAt: row[37],
        errorMessage: row[38],
        errorCode: row[39],
        retryCount: row[40],
        metadata: row[41]
    }));
}

