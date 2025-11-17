/**
 * Vault Repository - Cleverse Pattern
 * 
 * ✅ Wraps SQLC-generated queries
 * ✅ BigNumber for precision
 * ✅ Index-based accounting
 */

import { Sql } from 'postgres';
import BigNumber from 'bignumber.js';
import {
  // Client Vault Queries
  getClientVault,
  getClientVaultByToken,
  getClientVaultByTokenForUpdate,
  listClientVaults,
  listClientVaultsPendingStake,
  createClientVault,
  updateClientVaultIndex,
  updateClientVaultAPY,
  addPendingDepositToVault,
  movePendingToStaked,
  reduceStakedBalance,
  // End User Vault Queries
  getEndUserVault,
  getEndUserVaultByToken,
  getEndUserVaultByTokenForUpdate,
  getEndUserVaultWithBalance,
  listEndUserVaults,
  listEndUserVaultsWithBalance,
  createEndUserVault,
  addSharesToUserVault,
  burnSharesFromUserVault,
  // Analytics
  getTotalSharesForVault,
  getVaultSummary,
  listTopUsersByBalance,
  // Types
  type GetClientVaultRow,
  type GetClientVaultByTokenRow,
  type GetClientVaultByTokenForUpdateRow,
  type ListClientVaultsRow,
  type ListClientVaultsPendingStakeRow,
  type CreateClientVaultArgs,
  type CreateClientVaultRow,
  type GetEndUserVaultRow,
  type GetEndUserVaultByTokenRow,
  type GetEndUserVaultByTokenForUpdateRow,
  type GetEndUserVaultWithBalanceRow,
  type ListEndUserVaultsRow,
  type ListEndUserVaultsWithBalanceRow,
  type CreateEndUserVaultArgs,
  type CreateEndUserVaultRow,
  type GetTotalSharesForVaultRow,
  type GetVaultSummaryRow,
  type ListTopUsersByBalanceRow,
} from '@proxify/sqlcgen';

export class VaultRepository {
  constructor(private readonly sql: Sql) {}

  // Client Vaults
  async getClientVaultById(id: string): Promise<GetClientVaultRow | null> {
    return await getClientVault(this.sql, { id });
  }

  async getClientVault(
    clientId: string,
    chain: string,
    tokenAddress: string
  ): Promise<GetClientVaultByTokenRow | null> {
    return await getClientVaultByToken(this.sql, { clientId, chain, tokenAddress });
  }

  async getClientVaultForUpdate(
    clientId: string,
    chain: string,
    tokenAddress: string
  ): Promise<GetClientVaultByTokenForUpdateRow | null> {
    return await getClientVaultByTokenForUpdate(this.sql, { clientId, chain, tokenAddress });
  }

  async listClientVaults(clientId: string): Promise<ListClientVaultsRow[]> {
    return await listClientVaults(this.sql, { clientId });
  }

  async listVaultsPendingStake(pendingDepositBalance: string = '0'): Promise<ListClientVaultsPendingStakeRow[]> {
    return await listClientVaultsPendingStake(this.sql, { pendingDepositBalance });
  }

  async createClientVault(params: CreateClientVaultArgs): Promise<CreateClientVaultRow | null> {
    return await createClientVault(this.sql, params);
  }

  async updateVaultIndex(
    id: string,
    currentIndex: string,
    cumulativeYield: string,
    totalStakedBalance: string
  ): Promise<void> {
    await updateClientVaultIndex(this.sql, {
      id,
      currentIndex,
      cumulativeYield,
      totalStakedBalance,
    });
  }

  async updateVaultAPY(id: string, apy7d: string | null, apy30d: string | null): Promise<void> {
    await updateClientVaultAPY(this.sql, { id, apy_7d: apy7d, apy_30d: apy30d });
  }

  async addPendingDeposit(id: string, pendingDepositBalance: string, totalShares: string): Promise<void> {
    await addPendingDepositToVault(this.sql, { id, pendingDepositBalance, totalShares });
  }

  async movePendingToStakedBalance(id: string, pendingDepositBalance: string): Promise<void> {
    await movePendingToStaked(this.sql, { id, pendingDepositBalance });
  }

  async reduceStaked(id: string, totalStakedBalance: string, totalShares: string): Promise<void> {
    await reduceStakedBalance(this.sql, { id, totalStakedBalance, totalShares });
  }

  // End User Vaults
  async getEndUserVaultById(id: string): Promise<GetEndUserVaultRow | null> {
    return await getEndUserVault(this.sql, { id });
  }

  async getEndUserVault(
    endUserId: string,
    chain: string,
    tokenAddress: string
  ): Promise<GetEndUserVaultByTokenRow | null> {
    return await getEndUserVaultByToken(this.sql, { endUserId, chain, tokenAddress });
  }

  async getEndUserVaultForUpdate(
    endUserId: string,
    chain: string,
    tokenAddress: string
  ): Promise<GetEndUserVaultByTokenForUpdateRow | null> {
    return await getEndUserVaultByTokenForUpdate(this.sql, { endUserId, chain, tokenAddress });
  }

  async getEndUserVaultWithBalance(
    endUserId: string,
    chain: string,
    tokenAddress: string
  ): Promise<GetEndUserVaultWithBalanceRow | null> {
    return await getEndUserVaultWithBalance(this.sql, { endUserId, chain, tokenAddress });
  }

  async listEndUserVaults(endUserId: string): Promise<ListEndUserVaultsRow[]> {
    return await listEndUserVaults(this.sql, { endUserId });
  }

  async listEndUserVaultsWithBalance(endUserId: string): Promise<ListEndUserVaultsWithBalanceRow[]> {
    return await listEndUserVaultsWithBalance(this.sql, { endUserId });
  }

  async createEndUserVault(params: CreateEndUserVaultArgs): Promise<CreateEndUserVaultRow | null> {
    return await createEndUserVault(this.sql, params);
  }

  async addShares(id: string, shares: string, weightedEntryIndex: string, totalDeposited: string): Promise<void> {
    await addSharesToUserVault(this.sql, { id, shares, weightedEntryIndex, totalDeposited });
  }

  async burnShares(id: string, shares: string, totalWithdrawn: string): Promise<void> {
    await burnSharesFromUserVault(this.sql, { id, shares, totalWithdrawn });
  }

  // Analytics
  async getTotalShares(clientId: string, chain: string, tokenAddress: string): Promise<GetTotalSharesForVaultRow | null> {
    return await getTotalSharesForVault(this.sql, { clientId, chain, tokenAddress });
  }

  async getVaultSummary(id: string): Promise<GetVaultSummaryRow | null> {
    return await getVaultSummary(this.sql, { id });
  }

  async listTopUsers(id: string, limit: string): Promise<ListTopUsersByBalanceRow[]> {
    return await listTopUsersByBalance(this.sql, { id, limit });
  }

  // BigNumber calculations
  calculateSharesForDeposit(depositAmount: string, currentIndex: string): string {
    const amount = new BigNumber(depositAmount);
    const index = new BigNumber(currentIndex);
    return amount.multipliedBy('1000000000000000000').dividedBy(index).integerValue(BigNumber.ROUND_DOWN).toString();
  }

  calculateAmountForShares(shares: string, currentIndex: string): string {
    const sharesNum = new BigNumber(shares);
    const index = new BigNumber(currentIndex);
    return sharesNum.multipliedBy(index).dividedBy('1000000000000000000').integerValue(BigNumber.ROUND_DOWN).toString();
  }

  calculateNewIndex(oldIndex: string, totalStaked: string, yieldAmount: string): string {
    const index = new BigNumber(oldIndex);
    const staked = new BigNumber(totalStaked);
    const yield_ = new BigNumber(yieldAmount);
    if (staked.isZero()) return oldIndex;
    return index.multipliedBy(staked.plus(yield_)).dividedBy(staked).integerValue(BigNumber.ROUND_DOWN).toString();
  }

  calculateUserYield(shares: string, entryIndex: string, currentIndex: string): string {
    const sharesNum = new BigNumber(shares);
    const entry = new BigNumber(entryIndex);
    const current = new BigNumber(currentIndex);
    const originalDeposit = sharesNum.multipliedBy(entry).dividedBy('1000000000000000000');
    const currentBalance = sharesNum.multipliedBy(current).dividedBy('1000000000000000000');
    const yield_ = currentBalance.minus(originalDeposit).integerValue(BigNumber.ROUND_DOWN);
    return yield_.isNegative() ? '0' : yield_.toString();
  }
}
