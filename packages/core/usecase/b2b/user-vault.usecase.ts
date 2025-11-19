/**
 * B2B User Vault Service
 * Manages end-user balance queries with index-based calculation (FLOW 5)
 * 
 * FORMULA: effective_balance = shares × current_index / 1e18
 * FORMULA: yield_earned = effective_balance - total_deposited
 */

import type { VaultRepository, UserRepository, AuditRepository } from '../../repository';
import type {
  GetEndUserVaultWithBalanceRow,
  ListEndUserVaultsWithBalanceRow,
} from '@proxify/sqlcgen';
import type {
  UserBalanceRequest,
  UserBalanceResponse,
  UserPortfolioResponse,
  ListVaultUsersRequest,
} from '../../dto/b2b';

export class B2BUserVaultUseCase {
  constructor(
    private readonly vaultRepository: VaultRepository,
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository
  ) {}

  /**
   * Get user's balance for specific vault (FLOW 5)
   * Returns balance with index-based yield calculation
   */
  async getUserBalance(
    userId: string,
    clientId: string,
    chain: string,
    tokenAddress: string
  ): Promise<UserBalanceResponse | null> {
    // Get end_user record
    const endUser = await this.userRepository.getByClientAndUserId(clientId, userId);
    if (!endUser) {
      return null;
    }

    // Get vault with calculated balance
    const vault = await this.vaultRepository.getEndUserVaultWithBalance(
      endUser.id,
      chain,
      tokenAddress
    );

    if (!vault) {
      return null;
    }

    // Audit the balance query
    await this.auditRepository.create({
      clientId,
      userId,
      actorType: 'user',
      action: 'balance_query',
      resourceType: 'end_user_vault',
      resourceId: vault.id,
      description: 'User balance query',
      metadata: {
        effectiveBalance: vault.effectiveBalance,
        yieldEarned: vault.yieldEarned,
      },
      ipAddress: null,
      userAgent: null,
    });

    return this.mapToBalanceResponse(vault, userId, clientId);
  }

  /**
   * Get user's portfolio across all vaults
   */
  async getUserPortfolio(userId: string, clientId: string): Promise<UserPortfolioResponse | null> {
    // Get end_user record
    const endUser = await this.userRepository.getByClientAndUserId(clientId, userId);
    if (!endUser) {
      return null;
    }

    // Get all vaults with balances
    const vaults = await this.vaultRepository.listEndUserVaultsWithBalance(endUser.id);

    if (vaults.length === 0) {
      return {
        userId,
        clientId,
        totalVaults: 0,
        totalDeposited: '0',
        totalEffectiveBalance: '0',
        totalYieldEarned: '0',
        vaults: [],
      };
    }

    // Calculate totals
    const totalDeposited = vaults.reduce(
      (sum, v) => sum + BigInt(v.totalDeposited),
      BigInt(0)
    );
    const totalEffectiveBalance = vaults.reduce(
      (sum, v) => sum + BigInt(v.effectiveBalance),
      BigInt(0)
    );
    const totalYieldEarned = vaults.reduce(
      (sum, v) => sum + BigInt(v.yieldEarned),
      BigInt(0)
    );

    return {
      userId,
      clientId,
      totalVaults: vaults.length,
      totalDeposited: totalDeposited.toString(),
      totalEffectiveBalance: totalEffectiveBalance.toString(),
      totalYieldEarned: totalYieldEarned.toString(),
      vaults: vaults.map(v => this.mapToBalanceResponse(v, userId, clientId)),
    };
  }

  /**
   * List all users with balances for a specific vault (admin view)
   */
  async listVaultUsers(
    clientId: string,
    chain: string,
    tokenAddress: string,
    limit: number = 100
  ): Promise<UserBalanceResponse[]> {
    // This would require a new SQLC query
    // For now, return empty array - implement when needed
    return [];
  }

  /**
   * Calculate effective balance manually (for verification)
   * This is already done by SQLC, but useful for testing
   */
  calculateEffectiveBalance(shares: string, currentIndex: string): string {
    const sharesBigInt = BigInt(shares);
    const indexBigInt = BigInt(currentIndex);
    const scale = BigInt(1e18);

    // effective_balance = shares × current_index / 1e18
    const effectiveBalance = (sharesBigInt * indexBigInt) / scale;
    return effectiveBalance.toString();
  }

  /**
   * Calculate yield earned manually (for verification)
   */
  calculateYieldEarned(effectiveBalance: string, totalDeposited: string): string {
    const effectiveBigInt = BigInt(effectiveBalance);
    const depositedBigInt = BigInt(totalDeposited);

    // yield_earned = effective_balance - total_deposited
    const yieldEarned = effectiveBigInt - depositedBigInt;
    return yieldEarned > 0 ? yieldEarned.toString() : '0';
  }

  /**
   * Map database row to response
   */
  private mapToBalanceResponse(
    vault: GetEndUserVaultWithBalanceRow | ListEndUserVaultsWithBalanceRow,
    userId: string,
    clientId: string
  ): UserBalanceResponse {
    return {
      userId,
      clientId,
      chain: vault.chain,
      tokenAddress: vault.tokenAddress,
      tokenSymbol: vault.tokenSymbol,
      totalDeposited: vault.totalDeposited,
      totalWithdrawn: vault.totalWithdrawn,
      effectiveBalance: vault.effectiveBalance,
      yieldEarned: vault.yieldEarned,
      shares: vault.shares,
      weightedEntryIndex: vault.weightedEntryIndex,
      currentIndex: vault.currentIndex,
      apy7d: 'apy_7d' in vault ? vault.apy_7d : null,
      apy30d: 'apy_30d' in vault ? vault.apy_30d : null,
      isActive: vault.isActive,
      lastDepositAt: vault.lastDepositAt,
      lastWithdrawalAt: vault.lastWithdrawalAt,
    };
  }
}
