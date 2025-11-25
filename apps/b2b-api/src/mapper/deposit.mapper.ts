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
		orderId: deposit.orderId,
		depositType: "external" as const, // All B2B deposits are external
		clientId: deposit.clientId,
		userId: deposit.userId,
		amount: deposit.fiatAmount || "0",
		status: mapDepositStatus(deposit.status),
		createdAt: deposit.createdAt.toISOString(),
		completedAt: deposit.completedAt?.toISOString(),
	};
}

export function mapDepositsToDto(
	deposits: GetDepositByOrderIDRow[]
) {
	return deposits.map((d) => mapDepositToDto(d));
}

function mapDepositStatus(status: string): "pending" | "completed" | "failed" {
	if (status === "completed") return "completed";
	if (status === "failed") return "failed";
	return "pending";
}
