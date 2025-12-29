/**
 * Deposit Repository - Quirk Pattern
 * ✅ SQLC-generated queries from database/queries/deposit.sql
 */

import {
	// Deposit Transaction Queries
	getDeposit,
	getDepositByOrderID,
	getDepositByGatewayOrderID,
	getDepositByOrderIDForUpdate,
	listDeposits,
	listDepositsByUser,
	listDepositsByStatus,
	listPendingDeposits,
	listExpiredDeposits,
	createDeposit,
	completeDeposit,
	completeDepositByOrderID,
	failDeposit,
	expireDeposit,
	updateTransactionHash,
	updateDepositGatewayInfo,
	markDepositAsBatched,
	markDepositAsStaked,
	markDepositBatchAsStaked,
	// Operations Dashboard Queries
	listAllPendingDeposits,
	listPendingDepositsByClient,
	// Environment-filtered Queries
	listAllPendingDepositsByEnvironment,
	listPendingDepositsByClientAndEnvironment,
	// Deposit Queue Queries
	getDepositQueueItem,
	listPendingDepositQueue,
	listPendingDepositQueueByVault,
	createDepositQueueItem,
	// Analytics
	getDepositStats,
	// Types
	type GetDepositRow,
	type GetDepositByOrderIDRow,
	type GetDepositByGatewayOrderIDRow,
	type GetDepositByOrderIDForUpdateRow,
	type ListDepositsRow,
	type ListDepositsByUserRow,
	type ListDepositsByStatusRow,
	type ListPendingDepositsRow,
	type ListExpiredDepositsRow,
	type ListAllPendingDepositsRow,
	type ListPendingDepositsByClientRow,
	type ListAllPendingDepositsByEnvironmentRow,
	type ListPendingDepositsByClientAndEnvironmentRow,
	type CreateDepositArgs,
	type CreateDepositRow,
	type CompleteDepositByOrderIDRow,
	type GetDepositQueueItemRow,
	type ListPendingDepositQueueRow,
	type ListPendingDepositQueueByVaultRow,
	type CreateDepositQueueItemArgs,
	type CreateDepositQueueItemRow,
	type GetDepositStatsRow,
} from "@quirk/sqlcgen"
import { Sql } from "postgres"

export class DepositRepository {
	constructor(private readonly sql: Sql) {}

	async getById(id: string): Promise<GetDepositRow | null> {
		return await getDeposit(this.sql, { id })
	}

	async getByOrderId(orderId: string): Promise<GetDepositByOrderIDRow | null> {
		return await getDepositByOrderID(this.sql, { orderId })
	}

	async getByGatewayOrderId(gatewayOrderId: string): Promise<GetDepositByGatewayOrderIDRow | null> {
		return await getDepositByGatewayOrderID(this.sql, { gatewayOrderId })
	}

	async getByOrderIdForUpdate(orderId: string): Promise<GetDepositByOrderIDForUpdateRow | null> {
		return await getDepositByOrderIDForUpdate(this.sql, { orderId })
	}

	async listByClient(clientId: string, limit = 100, offset = 0): Promise<ListDepositsRow[]> {
		return await listDeposits(this.sql, { clientId, limit: limit.toString(), offset: offset.toString() })
	}

	async listByUser(clientId: string, userId: string, limit = 100): Promise<ListDepositsByUserRow[]> {
		return await listDepositsByUser(this.sql, { clientId, userId, limit: limit.toString(), offset: "0" })
	}

	async listByStatus(clientId: string, status: string, limit = 100): Promise<ListDepositsByStatusRow[]> {
		return await listDepositsByStatus(this.sql, { clientId, status, limit: limit.toString(), offset: "0" })
	}

	async listPending(clientId: string): Promise<ListPendingDepositsRow[]> {
		return await listPendingDeposits(this.sql, { clientId })
	}

	async listExpired(limit = 100): Promise<ListExpiredDepositsRow[]> {
		return await listExpiredDeposits(this.sql, { limit: limit.toString() })
	}

	async create(params: CreateDepositArgs): Promise<CreateDepositRow | null> {
		return await createDeposit(this.sql, params)
	}

	async markCompleted(
		id: string,
		cryptoAmount: string,
		gatewayFee: string,
		proxifyFee: string,
		networkFee: string,
		totalFees: string,
		transactionHash?: string,
	): Promise<void> {
		await completeDeposit(this.sql, {
			id,
			cryptoAmount,
			gatewayFee,
			proxifyFee,
			networkFee,
			totalFees,
			transactionHash: transactionHash || null,
		})
	}

	async markFailed(id: string, errorMessage: string, errorCode?: string): Promise<void> {
		await failDeposit(this.sql, { id, errorMessage, errorCode: errorCode || null })
	}

	async markExpired(id: string): Promise<void> {
		await expireDeposit(this.sql, { id })
	}

	async updateTransactionHash(orderId: string, transactionHash: string): Promise<void> {
		await updateTransactionHash(this.sql, { orderId, transactionHash })
	}

	async updateGatewayInfo(id: string, paymentUrl: string | null, gatewayOrderId: string | null): Promise<void> {
		await updateDepositGatewayInfo(this.sql, { id, paymentUrl, gatewayOrderId })
	}

	// Operations Dashboard Methods
	async listAllPending(): Promise<ListAllPendingDepositsRow[]> {
		return await listAllPendingDeposits(this.sql)
	}

	async listPendingByClient(clientId: string): Promise<ListPendingDepositsByClientRow[]> {
		return await listPendingDepositsByClient(this.sql, { clientId })
	}

	// Environment-filtered Methods
	async listAllPendingByEnvironment(environment: string): Promise<ListAllPendingDepositsByEnvironmentRow[]> {
		return await listAllPendingDepositsByEnvironment(this.sql, { environment })
	}

	async listPendingByClientAndEnvironment(
		clientId: string,
		environment: string,
	): Promise<ListPendingDepositsByClientAndEnvironmentRow[]> {
		return await listPendingDepositsByClientAndEnvironment(this.sql, { clientId, environment })
	}

	async completeByOrderId(
		orderId: string,
		cryptoAmount: string,
		transactionHash: string,
	): Promise<CompleteDepositByOrderIDRow | null> {
		return await completeDepositByOrderID(this.sql, { orderId, cryptoAmount, transactionHash })
	}

	async markAsBatched(id: string): Promise<void> {
		await markDepositAsBatched(this.sql, { id })
	}

	async markAsStaked(id: string): Promise<void> {
		await markDepositAsStaked(this.sql, { id })
	}

	async markBatchAsStaked(clientVaultId: string): Promise<void> {
		await markDepositBatchAsStaked(this.sql, { clientVaultId })
	}

	// Deposit Queue Methods
	async getQueueItem(id: string): Promise<GetDepositQueueItemRow | null> {
		return await getDepositQueueItem(this.sql, { id })
	}

	async listPendingQueue(limit = 100): Promise<ListPendingDepositQueueRow[]> {
		return await listPendingDepositQueue(this.sql, { limit: limit.toString() })
	}

	async listPendingQueueByVault(clientVaultId: string): Promise<ListPendingDepositQueueByVaultRow[]> {
		return await listPendingDepositQueueByVault(this.sql, { clientVaultId })
	}

	async createQueueItem(params: CreateDepositQueueItemArgs): Promise<CreateDepositQueueItemRow | null> {
		return await createDepositQueueItem(this.sql, params)
	}

	// Analytics
	async getStats(clientId: string, startDate: Date, endDate: Date): Promise<GetDepositStatsRow | null> {
		return await getDepositStats(this.sql, { clientId, startDate, endDate })
	}
}
