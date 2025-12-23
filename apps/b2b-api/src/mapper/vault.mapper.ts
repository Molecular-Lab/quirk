/**
 * Vault DTO Mapper
 * Maps between database entities and API DTOs
 */

import type { GetClientVaultRow, GetClientVaultByTokenRow, ListClientVaultsRow } from "@quirk/sqlcgen";
import type { VaultDto } from "@quirk/b2b-api-core";

/**
 * Map database vault row to API VaultDto
 */
export function mapVaultToDto(vault: GetClientVaultRow | GetClientVaultByTokenRow | ListClientVaultsRow): VaultDto {
	return {
		id: vault.id,
		clientId: vault.clientId,
		tokenSymbol: vault.tokenSymbol,
		tokenAddress: vault.tokenAddress,
		chainId: parseInt(vault.chain),
		vaultIndex: vault.currentIndex, // DB: currentIndex → DTO: vaultIndex
		totalShares: vault.totalShares,
		totalStakedBalance: vault.totalStakedBalance,
		pendingDepositBalance: vault.pendingDepositBalance || "0",
		cumulativeYield: vault.cumulativeYield || "0",
		isActive: true, // All vaults are active by default
		createdAt: vault.createdAt.toISOString(),
		updatedAt: vault.updatedAt.toISOString(),
	};
}

/**
 * Map array of vault rows to DTOs
 */
export function mapVaultsToDto(vaults: ListClientVaultsRow[]): VaultDto[] {
	return vaults.map(mapVaultToDto);
}
