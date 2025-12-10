/**
 * Wrapped Token Repository
 * Manages client_wrapped_tokens table for tracking DeFi protocol balances
 */

import type { ProtocolName } from "../../service/defi-protocol.interface"
import type { Database } from "@proxify/sqlcgen"

export interface WrappedTokenRecord {
	id: string
	vaultId: string
	clientId: string
	protocol: ProtocolName
	wrappedTokenAddress: string
	wrappedTokenSymbol: string
	wrappedBalance: string
	exchangeRate: string
	realValue: string
	originalDeposit: string
	lastSyncAt: Date
	createdAt: Date
	updatedAt: Date
}

export interface UpsertWrappedTokenParams {
	vaultId: string
	clientId: string
	protocol: ProtocolName
	wrappedTokenAddress: string
	wrappedTokenSymbol: string
	wrappedBalance: string
	exchangeRate: string
	realValue: string
	originalDeposit?: string
}

/**
 * Repository for managing wrapped token tracking
 * NOTE: Requires SQLC queries to be generated from vault.sql
 */
export class WrappedTokenRepository {
	constructor(private readonly db: Database) {}

	/**
	 * Upsert wrapped token tracking record
	 * Creates new record or updates existing one for vault+protocol combination
	 */
	async upsert(params: UpsertWrappedTokenParams): Promise<WrappedTokenRecord> {
		// This will use SQLC generated query: UpsertWrappedTokenTracking
		// For now, using raw SQL until SQLC is regenerated

		const query = `
      INSERT INTO client_wrapped_tokens (
        vault_id,
        client_id,
        protocol,
        wrapped_token_address,
        wrapped_token_symbol,
        wrapped_balance,
        exchange_rate,
        real_value,
        original_deposit
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 0)
      )
      ON CONFLICT (vault_id, protocol) DO UPDATE
      SET wrapped_balance = EXCLUDED.wrapped_balance,
          exchange_rate = EXCLUDED.exchange_rate,
          real_value = EXCLUDED.real_value,
          last_sync_at = now(),
          updated_at = now()
      RETURNING *
    `

		const result = await this.db.query(query, [
			params.vaultId,
			params.clientId,
			params.protocol,
			params.wrappedTokenAddress,
			params.wrappedTokenSymbol,
			params.wrappedBalance,
			params.exchangeRate,
			params.realValue,
			params.originalDeposit || "0",
		])

		return this.mapRow(result.rows[0])
	}

	/**
	 * Get all wrapped tokens for a vault
	 */
	async getByVault(vaultId: string): Promise<WrappedTokenRecord[]> {
		// This will use SQLC: GetWrappedTokensForVault
		const query = `
      SELECT * FROM client_wrapped_tokens
      WHERE vault_id = $1
      ORDER BY protocol
    `

		const result = await this.db.query(query, [vaultId])
		return result.rows.map((row) => this.mapRow(row))
	}

	/**
	 * Get wrapped token for specific vault and protocol
	 */
	async getByVaultAndProtocol(vaultId: string, protocol: ProtocolName): Promise<WrappedTokenRecord | null> {
		const query = `
      SELECT * FROM client_wrapped_tokens
      WHERE vault_id = $1 AND protocol = $2
      LIMIT 1
    `

		const result = await this.db.query(query, [vaultId, protocol])

		if (result.rows.length === 0) {
			return null
		}

		return this.mapRow(result.rows[0])
	}

	/**
	 * Get total real value for a vault (sum across all protocols)
	 */
	async getTotalRealValue(vaultId: string): Promise<string> {
		// This will use SQLC: GetTotalRealValueForVault
		const query = `
      SELECT COALESCE(SUM(real_value), 0) as total_real_value
      FROM client_wrapped_tokens
      WHERE vault_id = $1
    `

		const result = await this.db.query(query, [vaultId])
		return result.rows[0].total_real_value.toString()
	}

	/**
	 * Get all wrapped tokens that need syncing (older than threshold)
	 */
	async getStaleRecords(hoursThreshold = 1): Promise<WrappedTokenRecord[]> {
		const query = `
      SELECT * FROM client_wrapped_tokens
      WHERE last_sync_at < NOW() - INTERVAL '${hoursThreshold} hours'
      ORDER BY last_sync_at ASC
    `

		const result = await this.db.query(query)
		return result.rows.map((row) => this.mapRow(row))
	}

	/**
	 * Update original deposit (when new funds are deployed to protocol)
	 */
	async updateOriginalDeposit(vaultId: string, protocol: ProtocolName, additionalAmount: string): Promise<void> {
		const query = `
      UPDATE client_wrapped_tokens
      SET original_deposit = original_deposit + $3,
          updated_at = now()
      WHERE vault_id = $1 AND protocol = $2
    `

		await this.db.query(query, [vaultId, protocol, additionalAmount])
	}

	/**
	 * Delete wrapped token record
	 */
	async delete(vaultId: string, protocol: ProtocolName): Promise<void> {
		const query = `
      DELETE FROM client_wrapped_tokens
      WHERE vault_id = $1 AND protocol = $2
    `

		await this.db.query(query, [vaultId, protocol])
	}

	/**
	 * Map database row to WrappedTokenRecord
	 */
	private mapRow(row: any): WrappedTokenRecord {
		return {
			id: row.id,
			vaultId: row.vault_id,
			clientId: row.client_id,
			protocol: row.protocol as ProtocolName,
			wrappedTokenAddress: row.wrapped_token_address,
			wrappedTokenSymbol: row.wrapped_token_symbol,
			wrappedBalance: row.wrapped_balance.toString(),
			exchangeRate: row.exchange_rate.toString(),
			realValue: row.real_value.toString(),
			originalDeposit: row.original_deposit.toString(),
			lastSyncAt: row.last_sync_at,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}
	}
}
