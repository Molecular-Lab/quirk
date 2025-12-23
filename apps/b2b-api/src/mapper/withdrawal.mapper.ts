/**
 * Withdrawal DTO Mapper
 * Transforms database rows to API DTOs
 */

import type { GetWithdrawalByOrderIDRow, CreateWithdrawalRow } from "@quirk/sqlcgen";

export function mapWithdrawalToDto(
	withdrawal: GetWithdrawalByOrderIDRow | CreateWithdrawalRow,
	vaultId?: string
) {
	return {
		id: withdrawal.id,
		clientId: withdrawal.clientId,
		userId: withdrawal.userId,
		vaultId: vaultId || "", // Pass from router or leave empty if not available
		requestedAmount: withdrawal.requestedAmount,
		sharesBurned: undefined, // Not stored in withdrawal_transactions table
		finalAmount: withdrawal.actualAmount || undefined,
		status: mapWithdrawalStatus(withdrawal.status),
		transactionHash: withdrawal.gatewayOrderId || undefined,
		createdAt: withdrawal.createdAt.toISOString(),
	};
}

export function mapWithdrawalsToDto(
	withdrawals: GetWithdrawalByOrderIDRow[],
	vaultIdMap?: Map<string, string> // Map of userId -> vaultId
) {
	return withdrawals.map((w) => 
		mapWithdrawalToDto(w, vaultIdMap?.get(w.userId))
	);
}

function mapWithdrawalStatus(status: string): "PENDING" | "QUEUED" | "COMPLETED" | "FAILED" {
	if (status === "completed") return "COMPLETED";
	if (status === "failed") return "FAILED";
	if (status === "queued") return "QUEUED";
	return "PENDING";
}
