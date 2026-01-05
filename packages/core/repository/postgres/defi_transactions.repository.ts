/**
 * DeFi Transactions Repository - Quirk Pattern
 * ✅ SQLC-generated queries from database/queries/defi_transactions.sql
 */

import {
    createDefiTransaction,
    getDefiTransactionById,
    getDefiTransactionByHash,
    confirmDefiTransaction,
    failDefiTransaction,
    listDefiTransactionsByClient,
    listDefiTransactionsByVault,
    listDefiTransactionsByProtocol,
    listPendingDefiTransactions,
    getDefiTransactionStats,
    countDefiTransactionsByClient,
    type CreateDefiTransactionArgs,
    type CreateDefiTransactionRow,
    type GetDefiTransactionByIdRow,
    type GetDefiTransactionByHashRow,
    type ConfirmDefiTransactionArgs,
    type FailDefiTransactionArgs,
    type ListDefiTransactionsByClientRow,
    type ListDefiTransactionsByVaultRow,
    type ListDefiTransactionsByProtocolRow,
    type ListPendingDefiTransactionsRow,
    type GetDefiTransactionStatsRow,
    type CountDefiTransactionsByClientRow,
} from "@quirk/sqlcgen"
import { Sql } from "postgres"

export class DefiTransactionsRepository {
    constructor(private readonly sql: Sql) { }

    /**
     * Create a new DeFi transaction record
     */
    async create(params: CreateDefiTransactionArgs): Promise<CreateDefiTransactionRow | null> {
        return await createDefiTransaction(this.sql, params)
    }

    /**
     * Get transaction by ID
     */
    async getById(id: string): Promise<GetDefiTransactionByIdRow | null> {
        return await getDefiTransactionById(this.sql, { id })
    }

    /**
     * Get transaction by tx hash
     */
    async getByHash(txHash: string): Promise<GetDefiTransactionByHashRow | null> {
        return await getDefiTransactionByHash(this.sql, { txHash })
    }

    /**
     * Mark transaction as confirmed with gas details
     */
    async confirm(params: ConfirmDefiTransactionArgs): Promise<void> {
        await confirmDefiTransaction(this.sql, params)
    }

    /**
     * Mark transaction as failed with error message
     */
    async fail(params: FailDefiTransactionArgs): Promise<void> {
        await failDefiTransaction(this.sql, params)
    }

    /**
     * List transactions for a client with pagination
     */
    async listByClient(
        clientId: string,
        environment: string,
        limit: number,
        offset: number
    ): Promise<ListDefiTransactionsByClientRow[]> {
        return await listDefiTransactionsByClient(this.sql, {
            clientId,
            environment,
            limitVal: limit.toString(),
            offsetVal: offset.toString(),
        })
    }

    /**
     * List transactions for a vault with pagination
     */
    async listByVault(
        vaultId: string,
        limit: number,
        offset: number
    ): Promise<ListDefiTransactionsByVaultRow[]> {
        return await listDefiTransactionsByVault(this.sql, {
            vaultId,
            limitVal: limit.toString(),
            offsetVal: offset.toString(),
        })
    }

    /**
     * List transactions for a specific protocol with pagination
     */
    async listByProtocol(
        clientId: string,
        protocol: string,
        environment: string,
        limit: number,
        offset: number
    ): Promise<ListDefiTransactionsByProtocolRow[]> {
        return await listDefiTransactionsByProtocol(this.sql, {
            clientId,
            protocol,
            environment,
            limitVal: limit.toString(),
            offsetVal: offset.toString(),
        })
    }

    /**
     * List pending transactions for status monitoring
     */
    async listPending(limit: number): Promise<ListPendingDefiTransactionsRow[]> {
        return await listPendingDefiTransactions(this.sql, {
            limitVal: limit.toString(),
        })
    }

    /**
     * Get transaction statistics for a client
     */
    async getStats(clientId: string, environment: string): Promise<GetDefiTransactionStatsRow | null> {
        return await getDefiTransactionStats(this.sql, { clientId, environment })
    }

    /**
     * Get total transaction count for a client
     */
    async count(clientId: string, environment: string): Promise<number> {
        const result = await countDefiTransactionsByClient(this.sql, { clientId, environment })
        return result ? parseInt(result.count, 10) : 0
    }
}
