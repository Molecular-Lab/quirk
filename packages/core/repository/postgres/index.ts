/**
 * Repository Layer Exports - Proxify Pattern
 * 
 * All repositories use 100% SQLC-generated type-safe queries.
 * Import repositories from this index for clean service layer integration.
 * 
 * Architecture: Database → SQLC → Repositories → Services → API → React
 * 
 * @example
 * ```typescript
 * import { 
 *   ClientRepository, 
 *   VaultRepository, 
 *   DepositRepository,
 *   AuditRepository
 * } from '@proxify/core/repository/postgres';
 * 
 * // Inject into service layer
 * class DepositService {
 *   constructor(
 *     private readonly depositRepo: DepositRepository,
 *     private readonly clientRepo: ClientRepository,
 *     private readonly vaultRepo: VaultRepository,
 *     private readonly auditRepo: AuditRepository,
 *     private readonly sql: Sql
 *   ) {}
 *   
 *   async processDeposit(params: DepositParams) {
 *     const client = await this.clientRepo.getById(params.clientId);
 *     const vault = await this.vaultRepo.getClientVault(params.clientId, params.currency);
 *     const deposit = await this.depositRepo.create({...});
 *     await this.auditRepo.logDeposit(client.id, params.userId, deposit.id, {});
 *     return deposit;
 *   }
 * }
 * ```
 */

// Repository Classes
export { ClientRepository } from './client.repository';
export { PrivyAccountRepository } from '../privy-account.repository';
export { VaultRepository } from './vault.repository';
export { DepositRepository } from './deposit.repository';
export { DepositOrderRepository } from './deposit-order.repository';
export { WithdrawalRepository } from './withdrawal.repository';
export { UserRepository } from './end_user.repository';
export { DefiRepository } from './defi.repository';
export { AuditRepository } from './audit.repository';

// Re-export commonly used SQLC types for convenience
export type {
  // Client types
  GetClientRow,
  CreateClientRow,
  UpdateClientRow,
  GetClientBalanceRow,
  CreateClientBalanceRow,
  
  // Vault types
  GetClientVaultRow,
  CreateClientVaultRow,
  ListClientVaultsRow,
  
  // Deposit types
  GetDepositRow,
  GetDepositByOrderIDRow,
  CreateDepositRow,
  ListDepositsRow,
  
  // Withdrawal types
  GetWithdrawalRow,
  GetWithdrawalByOrderIDRow,
  CreateWithdrawalRow,
  ListWithdrawalsRow,
  
  // End User types
  GetEndUserRow,
  CreateEndUserRow,
  GetEndUserPortfolioRow,
  
  // DeFi types
  GetProtocolRow,
  CreateProtocolRow,
  GetAllocationRow,
  CreateAllocationRow,
  ListAllocationsRow,
  
  // Audit types
  GetAuditLogRow,
  CreateAuditLogRow,
  ListAuditLogsRow,
} from '@proxify/sqlcgen';
