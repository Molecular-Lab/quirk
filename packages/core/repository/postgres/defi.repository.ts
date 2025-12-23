/**
 * DeFi Protocol Repository - Quirk Pattern
 * ✅ SQLC-generated queries from database/queries/defi.sql
 */

import {
	// Protocol Queries
	getProtocol,
	getProtocolByName,
	listProtocols,
	listActiveProtocols,
	listProtocolsByChain,
	listProtocolsByCategory,
	listProtocolsByChainAndCategory,
	createProtocol,
	updateProtocol,
	activateProtocol,
	deactivateProtocol,
	deleteProtocol,
	// Vault Strategy Queries (from vault_strategies_sql.ts)
	getVaultStrategies,
	createVaultStrategy,
	upsertVaultStrategy,
	deleteAllVaultStrategies,
	// Allocation Queries
	getAllocation,
	getAllocationForUpdate,
	getAllocationByVaultAndProtocol,
	listAllocations,
	listActiveAllocations,
	listAllocationsByVault,
	listAllocationsByCategory,
	createAllocation,
	upsertAllocation,
	updateAllocationBalance,
	updateAllocationYield,
	updateAllocationAPY,
	increaseAllocationBalance,
	decreaseAllocationBalance,
	markAllocationActive,
	markAllocationRebalancing,
	deleteAllocation,
	withdrawAllocation,
	// Analytics
	getTotalAllocatedByClient,
	getAllocationSummary,
	getCategoryAllocationBreakdown,
	getProtocolPerformance,
	// Types
	type GetProtocolRow,
	type GetProtocolByNameRow,
	type ListProtocolsRow,
	type ListActiveProtocolsRow,
	type ListProtocolsByChainRow,
	type ListProtocolsByCategoryRow,
	type CreateProtocolArgs,
	type CreateProtocolRow,
	type UpdateProtocolArgs,
	type UpdateProtocolRow,
	// Vault Strategy Types
	type GetVaultStrategiesRow,
	type CreateVaultStrategyArgs,
	type CreateVaultStrategyRow,
	type UpsertVaultStrategyArgs,
	type UpsertVaultStrategyRow,
	// Allocation Types
	type GetAllocationRow,
	type GetAllocationForUpdateRow,
	type GetAllocationByVaultAndProtocolRow,
	type ListAllocationsRow,
	type ListActiveAllocationsRow,
	type ListAllocationsByVaultRow,
	type ListAllocationsByCategoryRow,
	type CreateAllocationArgs,
	type CreateAllocationRow,
	type UpsertAllocationArgs,
	type UpsertAllocationRow,
	type GetTotalAllocatedByClientRow,
	type GetAllocationSummaryRow,
	type GetCategoryAllocationBreakdownRow,
	type GetProtocolPerformanceRow,
} from "@quirk/sqlcgen"
import { Sql } from "postgres"

export class DefiRepository {
	constructor(private readonly sql: Sql) {}

	// Protocol operations
	async getProtocolById(id: string): Promise<GetProtocolRow | null> {
		return await getProtocol(this.sql, { id })
	}

	async getProtocolByName(name: string, chain: string): Promise<GetProtocolByNameRow | null> {
		return await getProtocolByName(this.sql, { name, chain })
	}

	async listProtocols(): Promise<ListProtocolsRow[]> {
		return await listProtocols(this.sql)
	}

	async listActiveProtocols(): Promise<ListActiveProtocolsRow[]> {
		return await listActiveProtocols(this.sql)
	}

	async listProtocolsByChain(chain: string): Promise<ListProtocolsByChainRow[]> {
		return await listProtocolsByChain(this.sql, { chain })
	}

	async listProtocolsByCategory(category: string): Promise<ListProtocolsByCategoryRow[]> {
		return await listProtocolsByCategory(this.sql, { category })
	}

	async listProtocolsByChainAndCategory(chain: string, category: string): Promise<ListProtocolsByChainRow[]> {
		return await listProtocolsByChainAndCategory(this.sql, { chain, category })
	}

	async createProtocol(params: CreateProtocolArgs): Promise<CreateProtocolRow | null> {
		return await createProtocol(this.sql, params)
	}

	async updateProtocol(id: string, params: Omit<UpdateProtocolArgs, "id">): Promise<UpdateProtocolRow | null> {
		return await updateProtocol(this.sql, { id, ...params })
	}

	async activateProtocol(id: string): Promise<void> {
		await activateProtocol(this.sql, { id })
	}

	async deactivateProtocol(id: string): Promise<void> {
		await deactivateProtocol(this.sql, { id })
	}

	async deleteProtocol(id: string): Promise<void> {
		await deleteProtocol(this.sql, { id })
	}

	// Vault Strategy operations (used by DeFi allocation logic)
	async listStrategies(clientVaultId: string): Promise<GetVaultStrategiesRow[]> {
		return await getVaultStrategies(this.sql, { clientVaultId })
	}

	async createStrategy(params: CreateVaultStrategyArgs): Promise<CreateVaultStrategyRow | null> {
		return await createVaultStrategy(this.sql, params)
	}

	async upsertStrategy(params: UpsertVaultStrategyArgs): Promise<UpsertVaultStrategyRow | null> {
		return await upsertVaultStrategy(this.sql, params)
	}

	async deleteAllStrategies(clientVaultId: string): Promise<void> {
		await deleteAllVaultStrategies(this.sql, { clientVaultId })
	}

	// Allocation operations
	async getAllocationById(id: string): Promise<GetAllocationRow | null> {
		return await getAllocation(this.sql, { id })
	}

	async getAllocationForUpdate(id: string): Promise<GetAllocationForUpdateRow | null> {
		return await getAllocationForUpdate(this.sql, { id })
	}

	async getAllocationByVaultAndProtocol(
		clientVaultId: string,
		protocolId: string,
	): Promise<GetAllocationByVaultAndProtocolRow | null> {
		return await getAllocationByVaultAndProtocol(this.sql, { clientVaultId, protocolId })
	}

	async listAllocations(clientId: string): Promise<ListAllocationsRow[]> {
		return await listAllocations(this.sql, { clientId })
	}

	async listActiveAllocations(clientId: string): Promise<ListActiveAllocationsRow[]> {
		return await listActiveAllocations(this.sql, { clientId })
	}

	async listAllocationsByVault(clientVaultId: string): Promise<ListAllocationsByVaultRow[]> {
		return await listAllocationsByVault(this.sql, { clientVaultId })
	}

	async listAllocationsByCategory(clientVaultId: string, category: string): Promise<ListAllocationsByCategoryRow[]> {
		return await listAllocationsByCategory(this.sql, { clientVaultId, category })
	}

	async createAllocation(params: CreateAllocationArgs): Promise<CreateAllocationRow | null> {
		return await createAllocation(this.sql, params)
	}

	async upsertAllocation(params: UpsertAllocationArgs): Promise<UpsertAllocationRow | null> {
		return await upsertAllocation(this.sql, params)
	}

	async updateAllocationBalance(id: string, balance: string): Promise<void> {
		await updateAllocationBalance(this.sql, { id, balance })
	}

	async updateAllocationYield(id: string, balance: string, yieldEarned: string, apy: string | null): Promise<void> {
		await updateAllocationYield(this.sql, { id, balance, yieldEarned, apy })
	}

	async updateAllocationAPY(id: string, apy: string): Promise<void> {
		await updateAllocationAPY(this.sql, { id, apy })
	}

	async increaseAllocationBalance(id: string, balance: string): Promise<void> {
		await increaseAllocationBalance(this.sql, { id, balance })
	}

	async decreaseAllocationBalance(id: string, balance: string): Promise<void> {
		await decreaseAllocationBalance(this.sql, { id, balance })
	}

	async markAllocationActive(id: string): Promise<void> {
		await markAllocationActive(this.sql, { id })
	}

	async markAllocationRebalancing(id: string): Promise<void> {
		await markAllocationRebalancing(this.sql, { id })
	}

	async deleteAllocation(id: string): Promise<void> {
		await deleteAllocation(this.sql, { id })
	}

	async withdrawAllocation(id: string): Promise<void> {
		await withdrawAllocation(this.sql, { id })
	}

	// Analytics
	async getTotalAllocated(clientId: string): Promise<GetTotalAllocatedByClientRow | null> {
		return await getTotalAllocatedByClient(this.sql, { clientId })
	}

	async getAllocationSummary(clientVaultId: string): Promise<GetAllocationSummaryRow | null> {
		return await getAllocationSummary(this.sql, { clientVaultId })
	}

	async getCategoryBreakdown(clientVaultId: string): Promise<GetCategoryAllocationBreakdownRow[]> {
		return await getCategoryAllocationBreakdown(this.sql, { clientVaultId })
	}

	async getProtocolPerformance(clientId: string): Promise<GetProtocolPerformanceRow[]> {
		return await getProtocolPerformance(this.sql, { clientId })
	}
}
