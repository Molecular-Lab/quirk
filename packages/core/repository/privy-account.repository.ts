/**
 * ============================================
 * PRIVY ACCOUNT REPOSITORY
 * ============================================
 * Description: Data access layer for privy_accounts table
 * Purpose: Manage Privy user identity records
 * Created: 2025-11-23
 */

import type { Sql } from "postgres";
import type { PrivyAccountEntity, CreatePrivyAccountInput } from "../entity/privy-account.entity";

export class PrivyAccountRepository {
  constructor(private readonly sql: Sql) {}

  /**
   * Get Privy account by organization ID
   */
  async getByOrgId(privyOrganizationId: string): Promise<PrivyAccountEntity | null> {
    const results = await this.sql`
      SELECT * FROM privy_accounts
      WHERE privy_organization_id = ${privyOrganizationId}
      LIMIT 1
    `;

    if (results.length === 0) return null;

    return this.mapToEntity(results[0]);
  }

  /**
   * Get Privy account by internal ID
   */
  async getById(id: string): Promise<PrivyAccountEntity | null> {
    const results = await this.sql`
      SELECT * FROM privy_accounts
      WHERE id = ${id}
      LIMIT 1
    `;

    if (results.length === 0) return null;

    return this.mapToEntity(results[0]);
  }

  /**
   * Create new Privy account
   */
  async create(data: CreatePrivyAccountInput): Promise<PrivyAccountEntity> {
    const results = await this.sql`
      INSERT INTO privy_accounts (
        privy_organization_id,
        privy_wallet_address,
        privy_email,
        wallet_type
      ) VALUES (
        ${data.privyOrganizationId},
        ${data.privyWalletAddress},
        ${data.privyEmail || null},
        ${data.walletType}
      )
      RETURNING *
    `;

    return this.mapToEntity(results[0]);
  }

  /**
   * Get or create Privy account (idempotent)
   * Uses ON CONFLICT to handle race conditions
   */
  async getOrCreate(data: CreatePrivyAccountInput): Promise<PrivyAccountEntity> {
    const results = await this.sql`
      INSERT INTO privy_accounts (
        privy_organization_id,
        privy_wallet_address,
        privy_email,
        wallet_type
      ) VALUES (
        ${data.privyOrganizationId},
        ${data.privyWalletAddress},
        ${data.privyEmail || null},
        ${data.walletType}
      )
      ON CONFLICT (privy_organization_id)
      DO UPDATE SET
        updated_at = now(),
        privy_wallet_address = EXCLUDED.privy_wallet_address,
        privy_email = COALESCE(EXCLUDED.privy_email, privy_accounts.privy_email),
        wallet_type = EXCLUDED.wallet_type
      RETURNING *
    `;

    return this.mapToEntity(results[0]);
  }

  /**
   * Update Privy account email
   */
  async updateEmail(privyOrganizationId: string, email: string): Promise<PrivyAccountEntity> {
    const results = await this.sql`
      UPDATE privy_accounts
      SET
        privy_email = ${email},
        updated_at = now()
      WHERE privy_organization_id = ${privyOrganizationId}
      RETURNING *
    `;

    if (results.length === 0) {
      throw new Error(`Privy account not found: ${privyOrganizationId}`);
    }

    return this.mapToEntity(results[0]);
  }

  /**
   * List all Privy accounts (admin use)
   */
  async listAll(): Promise<PrivyAccountEntity[]> {
    const results = await this.sql`
      SELECT * FROM privy_accounts
      ORDER BY created_at DESC
    `;

    return results.map((row) => this.mapToEntity(row));
  }

  /**
   * Map database row to entity
   */
  private mapToEntity(row: any): PrivyAccountEntity {
    return {
      id: row.id,
      privyOrganizationId: row.privy_organization_id,
      privyWalletAddress: row.privy_wallet_address,
      privyEmail: row.privy_email,
      walletType: row.wallet_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
