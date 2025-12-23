/**
 * Database Entities - Zod Validated Schemas
 *
 * These entities map SQLC-generated database types to validated domain models.
 * Each entity includes:
 * - Schema validation with Zod
 * - Type inference
 * - Input/output transformation
 * - Business rule validation
 *
 * @example
 * ```typescript
 * import { clientSchema, createClientSchema } from '@quirk/core/entity/database';
 *
 * // Validate database row
 * const client = clientSchema.parse(dbRow);
 *
 * // Validate input before repository call
 * const input = createClientSchema.parse(userInput);
 * ```
 */

// Client entities
export * from "./client.entity"

// Vault entities
export * from "./vault.entity"

// Transaction entities (Deposits & Withdrawals)
export * from "./transaction.entity"

// End User entities
export * from "./end-user.entity"

// DeFi entities (Protocols & Allocations)
export * from "./defi.entity"

// Audit entities
export * from "./audit.entity"
