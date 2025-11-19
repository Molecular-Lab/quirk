/**
 * Deposit DTO Mapper
 * Transforms database rows to API DTOs
 */

import type { GetDepositByOrderIDRow, CreateDepositRow } from "@proxify/sqlcgen";

export function mapDepositToDto(
	deposit: GetDepositByOrderIDRow | CreateDepositRow,
	vaultId?: string
) {
	return {
		id: deposit.id,
		clientId: deposit.clientId,
		userId: deposit.userId,
		vaultId: vaultId || "", // Pass from router or leave empty if not available
		amount: deposit.fiatAmount || "0",
		sharesMinted: undefined, // Not stored in deposit_transactions table
		status: mapDepositStatus(deposit.status),
		transactionHash: undefined,
		createdAt: deposit.createdAt.toISOString(),
	};
}

export function mapDepositsToDto(
	deposits: GetDepositByOrderIDRow[],
	vaultIdMap?: Map<string, string> // Map of userId -> vaultId
) {
	return deposits.map((d) => 
		mapDepositToDto(d, vaultIdMap?.get(d.userId))
	);
}

function mapDepositStatus(status: string): "PENDING" | "COMPLETED" | "FAILED" {
	if (status === "completed") return "COMPLETED";
	if (status === "failed") return "FAILED";
	return "PENDING";
}
