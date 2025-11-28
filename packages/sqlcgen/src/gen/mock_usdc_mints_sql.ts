import { Sql } from "postgres";

export const getMockUsdcMintQuery = `-- name: GetMockUsdcMint :one

SELECT id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at FROM mock_usdc_mints
WHERE id = $1 LIMIT 1`;

export interface GetMockUsdcMintArgs {
    id: string;
}

export interface GetMockUsdcMintRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function getMockUsdcMint(sql: Sql, args: GetMockUsdcMintArgs): Promise<GetMockUsdcMintRow | null> {
    const rows = await sql.unsafe(getMockUsdcMintQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    };
}

export const getMockUsdcMintByDepositOrderQuery = `-- name: GetMockUsdcMintByDepositOrder :one
SELECT id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at FROM mock_usdc_mints
WHERE deposit_order_id = $1 LIMIT 1`;

export interface GetMockUsdcMintByDepositOrderArgs {
    depositOrderId: string;
}

export interface GetMockUsdcMintByDepositOrderRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function getMockUsdcMintByDepositOrder(sql: Sql, args: GetMockUsdcMintByDepositOrderArgs): Promise<GetMockUsdcMintByDepositOrderRow | null> {
    const rows = await sql.unsafe(getMockUsdcMintByDepositOrderQuery, [args.depositOrderId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    };
}

export const getMockUsdcMintByTxHashQuery = `-- name: GetMockUsdcMintByTxHash :one
SELECT id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at FROM mock_usdc_mints
WHERE mock_transaction_hash = $1 LIMIT 1`;

export interface GetMockUsdcMintByTxHashArgs {
    mockTransactionHash: string;
}

export interface GetMockUsdcMintByTxHashRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function getMockUsdcMintByTxHash(sql: Sql, args: GetMockUsdcMintByTxHashArgs): Promise<GetMockUsdcMintByTxHashRow | null> {
    const rows = await sql.unsafe(getMockUsdcMintByTxHashQuery, [args.mockTransactionHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    };
}

export const listMockUsdcMintsByClientQuery = `-- name: ListMockUsdcMintsByClient :many
SELECT id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at FROM mock_usdc_mints
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListMockUsdcMintsByClientArgs {
    clientId: string;
    limit: string;
    offset: string;
}

export interface ListMockUsdcMintsByClientRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function listMockUsdcMintsByClient(sql: Sql, args: ListMockUsdcMintsByClientArgs): Promise<ListMockUsdcMintsByClientRow[]> {
    return (await sql.unsafe(listMockUsdcMintsByClientQuery, [args.clientId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    }));
}

export const listMockUsdcMintsByUserQuery = `-- name: ListMockUsdcMintsByUser :many
SELECT id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at FROM mock_usdc_mints
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3`;

export interface ListMockUsdcMintsByUserArgs {
    userId: string;
    limit: string;
    offset: string;
}

export interface ListMockUsdcMintsByUserRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function listMockUsdcMintsByUser(sql: Sql, args: ListMockUsdcMintsByUserArgs): Promise<ListMockUsdcMintsByUserRow[]> {
    return (await sql.unsafe(listMockUsdcMintsByUserQuery, [args.userId, args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    }));
}

export const createMockUsdcMintQuery = `-- name: CreateMockUsdcMint :one
INSERT INTO mock_usdc_mints (
  deposit_order_id,
  client_id,
  user_id,
  amount,
  chain,
  token_address,
  destination_wallet,
  mock_transaction_hash,
  block_number
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at`;

export interface CreateMockUsdcMintArgs {
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
}

export interface CreateMockUsdcMintRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function createMockUsdcMint(sql: Sql, args: CreateMockUsdcMintArgs): Promise<CreateMockUsdcMintRow | null> {
    const rows = await sql.unsafe(createMockUsdcMintQuery, [args.depositOrderId, args.clientId, args.userId, args.amount, args.chain, args.tokenAddress, args.destinationWallet, args.mockTransactionHash, args.blockNumber]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    };
}

export const listRecentMockMintsQuery = `-- name: ListRecentMockMints :many
SELECT id, deposit_order_id, client_id, user_id, amount, chain, token_address, destination_wallet, mock_transaction_hash, block_number, created_at FROM mock_usdc_mints
ORDER BY created_at DESC
LIMIT $1`;

export interface ListRecentMockMintsArgs {
    limit: string;
}

export interface ListRecentMockMintsRow {
    id: string;
    depositOrderId: string;
    clientId: string;
    userId: string;
    amount: string;
    chain: string;
    tokenAddress: string;
    destinationWallet: string;
    mockTransactionHash: string;
    blockNumber: string | null;
    createdAt: Date | null;
}

export async function listRecentMockMints(sql: Sql, args: ListRecentMockMintsArgs): Promise<ListRecentMockMintsRow[]> {
    return (await sql.unsafe(listRecentMockMintsQuery, [args.limit]).values()).map(row => ({
        id: row[0],
        depositOrderId: row[1],
        clientId: row[2],
        userId: row[3],
        amount: row[4],
        chain: row[5],
        tokenAddress: row[6],
        destinationWallet: row[7],
        mockTransactionHash: row[8],
        blockNumber: row[9],
        createdAt: row[10]
    }));
}

export const getMockMintStatsQuery = `-- name: GetMockMintStats :one
SELECT
  COUNT(*) AS total_mints,
  COALESCE(SUM(amount), 0) AS total_amount_minted,
  COALESCE(AVG(amount), 0) AS avg_mint_amount
FROM mock_usdc_mints
WHERE created_at >= $1
  AND created_at <= $2`;

export interface GetMockMintStatsArgs {
    startDate: Date | null;
    endDate: Date | null;
}

export interface GetMockMintStatsRow {
    totalMints: string;
    totalAmountMinted: string | null;
    avgMintAmount: string | null;
}

export async function getMockMintStats(sql: Sql, args: GetMockMintStatsArgs): Promise<GetMockMintStatsRow | null> {
    const rows = await sql.unsafe(getMockMintStatsQuery, [args.startDate, args.endDate]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalMints: row[0],
        totalAmountMinted: row[1],
        avgMintAmount: row[2]
    };
}

